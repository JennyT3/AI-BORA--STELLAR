import { Keypair, TransactionBuilder, Operation, Memo, Asset, Networks, Account } from '@stellar/stellar-sdk';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const EXPLORER_URL = 'https://stellar.expert/explorer/testnet';

const ADMIN_SECRET = import.meta.env.VITE_STELLAR_ADMIN_SECRET;

export interface StellarResult {
  txHash: string;
  explorerUrl: string;
  success: boolean;
}

export async function storeHashOnStellar(hash: string): Promise<StellarResult> {
  if (!ADMIN_SECRET) {
    console.warn('No VITE_STELLAR_ADMIN_SECRET - skipping blockchain');
    return { txHash: '', explorerUrl: '', success: false };
  }

  try {
    const sender = Keypair.fromSecret(ADMIN_SECRET);

    const response = await fetch(`${HORIZON_URL}/accounts/${sender.publicKey()}`);
    if (!response.ok) throw new Error('Account not found - needs Friendbot funding');
    const accountData = await response.json();

    const account = new Account(sender.publicKey(), accountData.sequence);

    // Memo.hash acepta hex string de exactamente 64 chars (32 bytes)
    const memo32 = hash.slice(0, 64);

    const transaction = new TransactionBuilder(account, {
      fee: '100',
      networkPassphrase: Networks.TESTNET
    })
      .addOperation(Operation.payment({
        destination: sender.publicKey(),
        asset: Asset.native(),
        amount: '0.0000001'
      }))
      .addMemo(Memo.hash(memo32))
      .setTimeout(30)
      .build();

    transaction.sign(sender);

    const txBase64 = transaction.toEnvelope().toXDR('base64');

    const txResponse = await fetch(`${HORIZON_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `tx=${encodeURIComponent(txBase64)}`
    });

    const txResult = await txResponse.json();

    if (txResult.hash) {
      console.log('✅ Stellar tx:', txResult.hash);
      return {
        txHash: txResult.hash,
        explorerUrl: `${EXPLORER_URL}/tx/${txResult.hash}`,
        success: true
      };
    } else {
      console.error('Stellar tx failed:', txResult.extras?.result_codes);
      return { txHash: '', explorerUrl: '', success: false };
    }
  } catch (err: any) {
    console.error('Stellar error:', err.message);
    return { txHash: '', explorerUrl: '', success: false };
  }
}

export async function createPaymentTransaction(
  toAddress: string,
  amount: string
): Promise<StellarResult> {
  if (!ADMIN_SECRET) return { txHash: '', explorerUrl: '', success: false };

  try {
    const sender = Keypair.fromSecret(ADMIN_SECRET);
    const response = await fetch(`${HORIZON_URL}/accounts/${sender.publicKey()}`);
    const accountData = await response.json();
    const account = new Account(sender.publicKey(), accountData.sequence);

    const transaction = new TransactionBuilder(account, {
      fee: '100',
      networkPassphrase: Networks.TESTNET
    })
      .addOperation(Operation.payment({
        destination: toAddress,
        asset: Asset.native(),
        amount
      }))
      .setTimeout(30)
      .build();

    transaction.sign(sender);
    const txBase64 = transaction.toEnvelope().toXDR('base64');

    const txResponse = await fetch(`${HORIZON_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `tx=${encodeURIComponent(txBase64)}`
    });

    const txResult = await txResponse.json();
    return {
      txHash: txResult.hash || '',
      explorerUrl: txResult.hash ? `${EXPLORER_URL}/tx/${txResult.hash}` : '',
      success: !!txResult.hash
    };
  } catch (err: any) {
    console.error('Payment error:', err.message);
    return { txHash: '', explorerUrl: '', success: false };
  }
}
