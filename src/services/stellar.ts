import { Keypair, TransactionBuilder, Operation, Memo, Asset, Networks } from '@stellar/stellar-sdk';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const EXPLORER_URL = 'https://stellar.expert/explorer/testnet';

const ADMIN_SECRET = import.meta.env.VENDOR_SECRET || import.meta.env.STELLAR_ADMIN_SECRET;

export interface StellarResult {
  txHash: string;
  explorerUrl: string;
  success: boolean;
}

export async function storeHashOnStellar(hash: string): Promise<StellarResult> {
  if (!ADMIN_SECRET) {
    console.error('No Stellar secret key configured');
    return {
      txHash: hash.slice(0, 64),
      explorerUrl: `${EXPLORER_URL}/tx/${hash.slice(0, 64)}`,
      success: false
    };
  }

  try {
    const sender = Keypair.fromSecret(ADMIN_SECRET);
    
    const response = await fetch(`${HORIZON_URL}/accounts/${sender.publicKey()}`);
    if (!response.ok) {
      throw new Error('Failed to load account');
    }
    
    const accountData = await response.json();
    const account = new Keypair(sender.publicKey(), accountData.sequence);
    
    const truncatedHash = hash.slice(0, 56);
    const memoBuffer = Buffer.from(truncatedHash, 'hex');
    
    const transaction = new TransactionBuilder(account, {
      fee: '100',
      networkPassphrase: Networks.TESTNET
    })
      .addOperation(Operation.payment({
        destination: sender.publicKey(),
        asset: Asset.native(),
        amount: '0.0000001'
      }))
      .addMemo(Memo.hash(memoBuffer))
      .setTimeout(30)
      .build();

    const txBase64 = transaction.toEnvelope().toXDR('base64');
    
    const txResponse = await fetch(`${HORIZON_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `tx=${encodeURIComponent(txBase64)}`
    });

    const txResult = await txResponse.json();

    if (txResult.hash) {
      return {
        txHash: txResult.hash,
        explorerUrl: `${EXPLORER_URL}/tx/${txResult.hash}`,
        success: true
      };
    } else {
      console.error('Transaction failed:', txResult);
      return {
        txHash: hash.slice(0, 64),
        explorerUrl: `${EXPLORER_URL}/tx/${hash.slice(0, 64)}`,
        success: false
      };
    }
  } catch (err) {
    console.error('Stellar error:', err);
    return {
      txHash: hash.slice(0, 64),
      explorerUrl: `${EXPLORER_URL}/tx/${hash.slice(0, 64)}`,
      success: false
    };
  }
}

export async function createPaymentTransaction(
  toAddress: string,
  amount: string
): Promise<StellarResult> {
  if (!ADMIN_SECRET) {
    return { txHash: '', explorerUrl: '', success: false };
  }

  try {
    const sender = Keypair.fromSecret(ADMIN_SECRET);
    
    const response = await fetch(`${HORIZON_URL}/accounts/${sender.publicKey()}`);
    const accountData = await response.json();
    const account = new Keypair(sender.publicKey(), accountData.sequence);

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
  } catch (err) {
    console.error('Payment error:', err);
    return { txHash: '', explorerUrl: '', success: false };
  }
}