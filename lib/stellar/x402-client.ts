import {
  useFacilitator,
  STELLAR_NETWORKS,
  STELLAR_TOKENS,
  type PaymentRequirements,
  type PaymentPayload,
} from 'x402-stellar';
import {
  Keypair,
  Networks,
  Transaction,
  xdr,
} from '@stellar/stellar-sdk';

// ─── Config ───────────────────────────────────────────────────────────────────

const NETWORK = 'stellar-testnet';
const FACILITATOR_URL = 'https://www.x402.org/facilitator';

const networkConfig = STELLAR_NETWORKS[NETWORK];
const usdcToken = STELLAR_TOKENS[NETWORK].USDC;

const { verify, settle, supported } = useFacilitator({ url: FACILITATOR_URL });

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StellarPaymentResult {
  success: boolean;
  txHash?: string;
  error?: string;
  network: string;
  amount: string;
  token: string;
}

// ─── Core: send USDC payment via x402 ────────────────────────────────────────

export async function sendStellarPayment(
  clientSecretKey: string,
  vendorPublicKey: string,
  amountUSDC: string,
  memo: string = 'AIBORA invoice'
): Promise<StellarPaymentResult> {
  try {
    const clientKeypair = Keypair.fromSecret(clientSecretKey);

    // Build payment requirements (what the vendor expects)
    const paymentRequirements: PaymentRequirements = {
      scheme: 'exact',
      network: NETWORK,
      maxAmountRequired: amountUSDC,
      resource: `https://aibora.pt/api/stellar-pay`,
      description: memo,
      mimeType: 'application/json',
      payTo: vendorPublicKey,
      maxTimeoutSeconds: 300,
      asset: `${usdcToken.address}:${usdcToken.address}`,
      extra: null,
    };

    // Build payment payload (what the client signs)
    const paymentPayload: PaymentPayload = {
      x402Version: 1,
      scheme: 'exact',
      network: NETWORK,
      payload: {
        authorization: {
          from: clientKeypair.publicKey(),
          to: vendorPublicKey,
          token: usdcToken.address,
          amount: amountUSDC,
          fee: '0',
          validFrom: Math.floor(Date.now() / 1000).toString(),
          validTo: (Math.floor(Date.now() / 1000) + 300).toString(),
          salt: Math.random().toString(36).slice(2),
          extra: memo,
        },
        signature: '',
      },
    };

    // Sign with client keypair
    const authData = JSON.stringify(paymentPayload.payload.authorization);
    const authBytes = Buffer.from(authData);
    const signature = clientKeypair.sign(authBytes);
    paymentPayload.payload.signature = signature.toString('base64');

    // Verify with facilitator first
    const verifyResult = await verify(paymentPayload, paymentRequirements);
    if (!verifyResult.isValid) {
      return {
        success: false,
        error: `Verification failed: ${verifyResult.invalidReason}`,
        network: NETWORK,
        amount: amountUSDC,
        token: 'USDC',
      };
    }

    // Settle the payment
    const settleResult = await settle(paymentPayload, paymentRequirements);

    return {
      success: settleResult.success,
      txHash: settleResult.transaction,
      network: NETWORK,
      amount: amountUSDC,
      token: 'USDC',
      error: settleResult.success ? undefined : 'Settlement failed',
    };

  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Unknown error',
      network: NETWORK,
      amount: amountUSDC,
      token: 'USDC',
    };
  }
}

// ─── Helper: EUR → USDC (1:1 for demo, testnet) ──────────────────────────────

export function eurToUsdc(amountEur: number): string {
  // In testnet: 1 EUR ≈ 1 USDC (simplified for demo)
  return (amountEur * 1_000_000).toFixed(0); // USDC has 7 decimals on Stellar
}

// ─── Helper: check facilitator is alive ──────────────────────────────────────

export async function checkFacilitator(): Promise<boolean> {
  try {
    const kinds = await supported();
    return kinds.length > 0;
  } catch {
    return false;
  }
}

// ─── Export config for use in other files ────────────────────────────────────

export const stellarConfig = {
  network: NETWORK,
  horizonUrl: networkConfig.horizonUrl,
  usdcAddress: usdcToken.address,
  facilitatorUrl: FACILITATOR_URL,
  vendorPublicKey: (globalThis as any).process?.env?.STELLAR_VENDOR_PUBLIC || '',
  clientSecretKey: (globalThis as any).process?.env?.STELLAR_CLIENT_SECRET || '',
};
