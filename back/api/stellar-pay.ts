import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as StellarSdk from '@stellar/stellar-sdk';
import { registerPollarUser, isPollarConfigured } from '../services/pollar.js';

const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const RPC_URL = 'https://soroban-testnet.stellar.org';
const USDC_ISSUER = process.env.USDC_ISSUER || 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN';
const USDC = new StellarSdk.Asset('USDC', USDC_ISSUER);

const VENDOR_SECRET = process.env.VENDOR_SECRET;
const VENDOR_PUBLIC = process.env.VENDOR_PUBLIC;
const PAYMENT_SPLITTER_CONTRACT =
  process.env.PAYMENT_SPLITTER_CONTRACT || 'CCP4JPWI33BC2XCDOLEDOIURMP7NPBY7I532H4N56ZDBCXX3A6BZNZ3P';
const USDC_CONTRACT_ID = process.env.USDC_CONTRACT_ID;

interface SplitResult {
  txHash: string;
  explorerUrl: string;
  contractId: string;
  adminAmount: string;
  collaboratorAmount: string;
  collaboratorAddress: string;
}

function isContractId(value: string | undefined): value is string {
  return !!value && StellarSdk.StrKey.isValidContract(value);
}

function isAccountId(value: unknown): value is string {
  return typeof value === 'string' && StellarSdk.StrKey.isValidEd25519PublicKey(value);
}

// Converts i128 micro-units (USDC = 7 decimals) to a Horizon decimal amount string.
function formatUnitsToDecimal(units: bigint): string {
  const negative = units < 0n;
  const abs = negative ? -units : units;
  const whole = abs / 10000000n;
  const frac = (abs % 10000000n).toString().padStart(7, '0');
  return (negative ? '-' : '') + whole.toString() + '.' + frac;
}

async function executeSplit(
  admin: StellarSdk.Keypair,
  paymentId: string,
  amount: bigint,
  companyAddress: string,
  collaboratorAddress: string
): Promise<SplitResult> {
  const server = new StellarSdk.SorobanRpc.Server(RPC_URL);
  const account = await server.getAccount(admin.publicKey());
  const contract = new StellarSdk.Contract(PAYMENT_SPLITTER_CONTRACT);

  const createPayment = contract.call(
    'create_payment',
    StellarSdk.nativeToScVal(admin.publicKey(), { type: 'address' }),
    StellarSdk.nativeToScVal(paymentId, { type: 'string' }),
    StellarSdk.nativeToScVal(amount, { type: 'i128' }),
    StellarSdk.nativeToScVal(USDC_CONTRACT_ID as string, { type: 'address' }),
    StellarSdk.nativeToScVal(companyAddress, { type: 'address' }),
    StellarSdk.nativeToScVal(collaboratorAddress, { type: 'address' })
  );

  const executeSplitOp = contract.call(
    'execute_split',
    StellarSdk.nativeToScVal(admin.publicKey(), { type: 'address' }),
    StellarSdk.nativeToScVal(paymentId, { type: 'string' })
  );

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: '1000000',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(createPayment)
    .addOperation(executeSplitOp)
    .setTimeout(60)
    .build();

  const prepared = await server.prepareTransaction(tx);
  prepared.sign(admin);

  const sendResult = await server.sendTransaction(prepared);
  if (sendResult.status === 'ERROR') {
    throw new Error('PaymentSplitter submission failed');
  }

  const txHash = sendResult.hash;
  let result = await server.getTransaction(txHash);
  let attempts = 0;
  while (result.status === 'NOT_FOUND' && attempts < 30) {
    await new Promise((r) => setTimeout(r, 2000));
    result = await server.getTransaction(txHash);
    attempts++;
  }
  if (result.status !== 'SUCCESS') {
    throw new Error(`PaymentSplitter transaction ${result.status}`);
  }

  const adminAmount = (amount * 70n) / 100n;
  const collaboratorAmount = amount - adminAmount;

  return {
    txHash,
    explorerUrl: `https://stellar.expert/explorer/testnet/tx/${txHash}`,
    contractId: PAYMENT_SPLITTER_CONTRACT,
    adminAmount: adminAmount.toString(),
    collaboratorAmount: collaboratorAmount.toString(),
    collaboratorAddress,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!VENDOR_SECRET || !VENDOR_PUBLIC) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const { invoiceId, amountEur: amountEurInput, memo, collaboratorAddress, collaboratorExternalId, collaboratorEmail } = req.body;

  if (!invoiceId || !amountEurInput) {
    return res.status(400).json({ error: 'faturaId and amountEur required' });
  }

  try {
    const amountEur = parseFloat(amountEurInput);
    if (!Number.isFinite(amountEur) || amountEur <= 0) {
      return res.status(400).json({ error: 'Invalid amountEur' });
    }

    // USDC has 7 decimals: i128 micro-units used by the contract (create_payment
    // expects total_amount in base units = amount * 10^decimals).
    const amountMicro = BigInt(Math.round(amountEur * 1e7));

    // Human-readable decimal for Horizon payment ops (e.g. "10.0000000").
    const amountHuman = amountEur.toFixed(7);

    const admin = StellarSdk.Keypair.fromSecret(VENDOR_SECRET);

    let split: SplitResult | null = null;
    let splitError: string | null = null;
    let payout: { txHash: string; explorerUrl: string; amount: string; destination: string } | null = null;
    let payoutError: string | null = null;

    if (isContractId(USDC_CONTRACT_ID) && isContractId(PAYMENT_SPLITTER_CONTRACT)) {
      try {
        const companyAddress = isAccountId(VENDOR_PUBLIC) ? VENDOR_PUBLIC : admin.publicKey();
        const collaborator = isAccountId(collaboratorAddress) ? collaboratorAddress : companyAddress;
        split = await executeSplit(admin, String(invoiceId), amountMicro, companyAddress, collaborator);
      } catch (error: any) {
        splitError = error?.message || 'PaymentSplitter execution failed';
        console.error('PaymentSplitter error:', error);
      }
    } else {
      splitError = 'PaymentSplitter skipped: PAYMENT_SPLITTER_CONTRACT or USDC_CONTRACT_ID not configured';
    }

    // Fallback: when the splitter contract isn't configured, send the
    // collaborator's 30% share directly in USDC from the admin's balance.
    if (!split && isAccountId(collaboratorAddress)) {
      try {
        const server = new StellarSdk.Horizon.Server(HORIZON_URL);
        const account = await server.loadAccount(admin.publicKey());
        const collaboratorShare = (amountMicro * 30n) / 100n;
        const tx = new StellarSdk.TransactionBuilder(account, {
          fee: '100000',
          networkPassphrase: NETWORK_PASSPHRASE,
        })
          .addOperation(
            StellarSdk.Operation.payment({
              destination: collaboratorAddress,
              asset: USDC,
              amount: formatUnitsToDecimal(collaboratorShare),
            })
          )
          .addMemo(StellarSdk.Memo.text(memo || `AIBORA invoice ${invoiceId}`))
          .setTimeout(60)
          .build();
        tx.sign(admin);
        const submit = await server.submitTransaction(tx);
        payout = {
          txHash: submit.hash,
          explorerUrl: `https://stellar.expert/explorer/testnet/tx/${submit.hash}`,
          amount: amountHuman,
          destination: collaboratorAddress,
        };
      } catch (error: any) {
        payoutError = error?.message || 'Direct payout failed';
        console.error('Direct payout error:', error);
      }
    }

    let pollarWallet: any = null;
    let pollarError: string | null = null;
    if (collaboratorAddress && isPollarConfigured() && collaboratorExternalId) {
      try {
        const registered = await registerPollarUser({
          externalId: String(collaboratorExternalId),
          email: collaboratorEmail ? String(collaboratorEmail) : undefined,
        });
        pollarWallet = registered.walletAddress || null;
      } catch (error: any) {
        pollarError = error?.code || error?.message || 'Pollar registration failed';
        console.error('Pollar registration error:', error);
      }
    }

    return res.status(200).json({
      success: true,
      amountUsdc: amountHuman,
      network: 'testnet',
      split,
      splitError,
      payout,
      payoutError,
      pollar: {
        configured: isPollarConfigured(),
        wallet: pollarWallet,
        error: pollarError,
      },
    });
  } catch (error: any) {
    console.error('Stellar payment error:', error);
    const message = error?.response?.data?.extras?.result_codes
      ? JSON.stringify(error.response.data.extras.result_codes)
      : error.message;
    return res.status(500).json({ success: false, error: message });
  }
}
