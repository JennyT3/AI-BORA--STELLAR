import { Keypair, Networks, TransactionBuilder, Memo, Operation, Asset } from '@stellar/stellar-sdk';

const VENDOR_SECRET = process.env.STELLAR_ADMIN_SECRET || process.env.STELLAR_VENDOR_SECRET || 'SCNAYRZDW6DCNHNJTH6XGDXATRGJKDYXL5AWCKWRMDTWM5VXUCSMFH3R';
const VENDOR_PUBLIC = process.env.STELLAR_ADMIN_PUBLIC || 'GBM4USEN622JABS37BVEHK43HASCX7PSRDMB37PKL53R725OFOHNWL3B';
const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const ENCRYPTION_KEY = process.env.WALLET_ENCRYPTION_KEY || 'default-dev-key-change-in-production';

function encryptKey(secret: string): string {
  const crypto = require('crypto');
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(secret, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decryptKey(encryptedData: string): string {
  const crypto = require('crypto');
  const parts = encryptedData.split(':');
  if (parts.length !== 2) throw new Error('Invalid encrypted data format');
  const iv = Buffer.from(parts[0], 'hex');
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(parts[1], 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export interface WalletInfo {
  publicKey: string;
  userType: 'cliente' | 'vendedor' | 'colaborador' | 'admin';
  network: string;
  createdAt: string;
}

export async function createWalletForUser(userId: string, userType: 'cliente' | 'vendedor' | 'colaborador'): Promise<WalletInfo> {
  console.log(`[WALLET] Creating wallet for user: ${userId}, type: ${userType}`);
  
  const keypair = Keypair.random();
  const publicKey = keypair.publicKey();
  const secret = keypair.secret();
  
  console.log(`[WALLET] Generated keypair for: ${publicKey}`);
  
  try {
    const friendbotResponse = await fetch(`${HORIZON_URL}/friendbot?addr=${publicKey}`, {
      method: 'GET'
    });
    
    if (friendbotResponse.ok) {
      console.log(`[WALLET] Successfully funded with testnet XLM`);
    } else {
      console.log(`[WALLET] Friendbot may have failed, but continuing...`);
    }
  } catch (error) {
    console.log(`[WALLET] Friendbot error (non-critical):`, error);
  }
  
  const encryptedSecret = encryptKey(secret);
  
  console.log(`[WALLET] Wallet created successfully`);
  
  return {
    publicKey,
    userType,
    network: 'testnet',
    createdAt: new Date().toISOString()
  };
}

export async function getWalletPublicKey(userId: string): Promise<string | null> {
  const { getDoc, doc } = await import('firebase/firestore');
  const { db } = await import('../firebase');
  
  const walletDoc = await getDoc(doc(db, 'stellar_wallets', userId));
  if (!walletDoc.exists()) return null;
  
  return walletDoc.data().publicKey;
}

export async function walletExists(userId: string): Promise<boolean> {
  const { getDoc, doc } = await import('firebase/firestore');
  const { db } = await import('../firebase');
  
  const walletDoc = await getDoc(doc(db, 'stellar_wallets', userId));
  return walletDoc.exists();
}

export async function getAllWallets(): Promise<WalletInfo[]> {
  const { getDocs, collection } = await import('firebase/firestore');
  const { db } = await import('../firebase');
  
  const snapshot = await getDocs(collection(db, 'stellar_wallets'));
  return snapshot.docs.map(d => d.data() as WalletInfo);
}

export async function sendPayment(
  fromKeypair: Keypair,
  toPublicKey: string,
  amount: string,
  memoText?: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const fromPublicKey = fromKeypair.publicKey();
    
    const accountResponse = await fetch(`${HORIZON_URL}/accounts/${fromPublicKey}`);
    const accountData = await accountResponse.json();
    const account = new (await import('@stellar/stellar-sdk')).Account(accountData.id, accountData.sequence);

    const feeResponse = await fetch(`${HORIZON_URL}/fee?blob=1`);
    const feeData = await feeResponse.json();
    const fee = feeData.max_fee || 200;

    const builder = new TransactionBuilder(account, {
      fee,
      networkPassphrase: Networks.TESTNET,
    });

    builder.addOperation(
      Operation.payment({
        destination: toPublicKey,
        asset: Asset.native(),
        amount: amount,
      })
    );

    if (memoText) {
      builder.addMemo(Memo.text(memoText.substring(0, 28)));
    }

    builder.setTimeout(60);
    const transaction = builder.build();
    transaction.sign(fromKeypair);

    const txResponse = await fetch(`${HORIZON_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ tx: transaction.toXDR() }),
    });

    const txResult = await txResponse.json();

    if (txResult.hash) {
      console.log(`[PAYMENT] Success! TX: ${txResult.hash}`);
      return { success: true, txHash: txResult.hash };
    } else {
      console.error(`[PAYMENT] Failed:`, txResult);
      return { success: false, error: txResult.error || 'Transaction failed' };
    }
  } catch (error: any) {
    console.error(`[PAYMENT] Error:`, error);
    return { success: false, error: error.message };
  }
}

export function formatPublicKey(publicKey: string): string {
  if (!publicKey || publicKey.length < 12) return publicKey;
  return `${publicKey.substring(0, 6)}...${publicKey.substring(publicKey.length - 4)}`;
}

export const STELLAR_CONFIG = {
  network: 'testnet',
  networkPassphrase: Networks.TESTNET,
  horizonUrl: HORIZON_URL,
  adminPublicKey: VENDOR_PUBLIC,
};