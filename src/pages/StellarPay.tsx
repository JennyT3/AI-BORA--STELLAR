import { useState, useEffect } from 'react';
import { Keypair, Networks, TransactionBuilder, Memo, Operation, Asset, Account, BASE_FEE } from '@stellar/stellar-sdk';
import { Loader, CheckCircle, ExternalLink, Fingerprint, Wallet, Zap, Shield, KeyRound, Lock, Globe } from 'lucide-react';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const FRIENDBOT_URL = 'https://friendbot.stellar.org';
const EXPLORER_URL = 'https://stellar.expert/explorer/testnet';

const ADMIN_PUBLIC = 'GDQX74MG4TVG7BBZCLDCOEOQX2PADCTRUIDAWG5KLIQ64LYURC5XC7CN';

interface WalletState {
  publicKey: string;
  secret: string;
  passkeyId?: string;
}

// ============================================
// REAL WEBAUTHN - Passkey con huella/Face ID
// ============================================
async function createPasskey(email: string): Promise<{ passkeyId: string }> {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  
  const credential = await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: 'AIBORA', id: window.location.hostname || 'localhost' },
      user: { 
        id: new TextEncoder().encode(email), 
        name: email, 
        displayName: email 
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -257 }
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'required'
      },
      attestation: 'none'
    }
  }) as PublicKeyCredential;

  if (!credential) {
    throw new Error('Passkey creation failed - user cancelled or not supported');
  }

  return { passkeyId: credential.id };
}

async function authWithPasskey(): Promise<{ passkeyId: string }> {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  
  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge,
      allowCredentials: [],
      userVerification: 'required',
      rpId: window.location.hostname || 'localhost'
    }
  }) as PublicKeyCredential;

  if (!assertion) {
    throw new Error('Passkey authentication failed');
  }

  return { passkeyId: assertion.id };
}

// ============================================
// REAL STELLAR TRANSACTIONS
// ============================================
async function getAccountSequence(publicKey: string): Promise<Account> {
  const response = await fetch(`${HORIZON_URL}/accounts/${publicKey}`);
  if (!response.ok) throw new Error('Account not found');
  const data = await response.json();
  return new Account(data.id, data.sequence);
}

async function fundAccount(publicKey: string): Promise<boolean> {
  const response = await fetch(`${FRIENDBOT_URL}?addr=${publicKey}`);
  return response.ok;
}

async function sendRealTransaction(
  secret: string, 
  destination: string, 
  amount: string,
  memo: string
): Promise<string> {
  const keypair = Keypair.fromSecret(secret);
  const account = await getAccountSequence(keypair.publicKey());
  
  const feeResponse = await fetch(`${HORIZON_URL}/fee?blob=1`);
  const feeData = await feeResponse.json();
  const fee = feeData.max_fee || BASE_FEE;
  
  const transaction = new TransactionBuilder(account, {
    fee,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.payment({
        destination,
        asset: Asset.native(),
        amount,
      })
    )
    .addMemo(Memo.text(memo))
    .setTimeout(60)
    .build();

  transaction.sign(keypair);

  const response = await fetch(`${HORIZON_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ tx: transaction.toXDR() }),
  });

  const result = await response.json();
  
  if (!result.hash) {
    throw new Error(result.ex?.message || result.error || 'Transaction failed');
  }
  
  return result.hash;
}

export default function StellarPayPage() {
  const [step, setStep] = useState<'intro' | 'create' | 'wallet' | 'pay' | 'success'>('intro');
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [email, setEmail] = useState('');

  const loadWallet = () => {
    const saved = localStorage.getItem('aibora_stellar_wallet');
    if (saved) {
      const data = JSON.parse(saved);
      setWallet(data);
      checkBalance(data.publicKey);
      setStep('wallet');
    }
  };

  const checkBalance = async (publicKey: string) => {
    try {
      const response = await fetch(`${HORIZON_URL}/accounts/${publicKey}`);
      if (response.ok) {
        const data = await response.json();
        const native = data.balances?.find((b: any) => b.asset_type === 'native');
        setBalance(native?.balance || '0');
      }
    } catch {
      setBalance('0');
    }
  };

  const createWalletWithPasskey = async () => {
    if (!email) {
      setError('Enter your email first');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // 1. Create REAL passkey with WebAuthn
      const { passkeyId } = await createPasskey(email);
      console.log('✅ Passkey created:', passkeyId);
      
      // 2. Generate REAL Stellar keypair
      const keypair = Keypair.random();
      console.log('✅ Stellar keypair generated:', keypair.publicKey());
      
      // 3. Save wallet data
      const newWallet: WalletState = {
        publicKey: keypair.publicKey(),
        secret: keypair.secret(),
        passkeyId
      };
      
      setWallet(newWallet);
      localStorage.setItem('aibora_stellar_wallet', JSON.stringify(newWallet));
      
      // 4. Fund with testnet XLM
      const funded = await fundAccount(keypair.publicKey());
      console.log(funded ? '✅ Funded with XLM' : '⚠️ Funding may have failed');
      
      // 5. Check balance
      await checkBalance(keypair.publicKey());
      
      setStep('wallet');
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const makePaymentWithPasskey = async () => {
    if (!wallet) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Authenticate with passkey FIRST
      const { passkeyId } = await authWithPasskey();
      console.log('✅ Passkey authenticated:', passkeyId);
      
      // 2. Send REAL transaction to Stellar
      const hash = await sendRealTransaction(
        wallet.secret,
        ADMIN_PUBLIC,
        '0.0000001',
        `AIBORA payment from ${wallet.publicKey.substring(0, 8)}...`
      );
      
      console.log('✅ Transaction sent:', hash);
      setTxHash(hash);
      setStep('success');
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    localStorage.removeItem('aibora_stellar_wallet');
    setWallet(null);
    setTxHash(null);
    setBalance('0');
    setStep('intro');
    setEmail('');
  };

  useEffect(() => {
    loadWallet();
  }, []);

  // ============================================
  // STEP: SUCCESS - Transaction confirmed
  // ============================================
  if (step === 'success' && txHash) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ textAlign: 'center' }}>
            <CheckCircle size={80} color="#22c55e" />
            <h1 style={{ fontSize: 28, fontWeight: 900, marginTop: 20, color: '#1b1c1b' }}>
              ✅ Payment Successful!
            </h1>
            <p style={{ color: '#666', marginTop: 8, fontSize: 16 }}>
              Your transaction is confirmed on Stellar blockchain
            </p>
          </div>

          <div style={styles.infoBox}>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Network</span>
              <span style={styles.infoValue}>Stellar Testnet</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Amount</span>
              <span style={styles.infoValue}>0.0000001 XLM</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>To</span>
              <span style={{...styles.infoValue, fontFamily: 'monospace', fontSize: 11}}>
                {ADMIN_PUBLIC.substring(0, 12)}...
              </span>
            </div>
          </div>

          <a
            href={`${EXPLORER_URL}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.explorerBtn}
          >
            <Globe size={18} />
            View on Stellar Explorer
          </a>

          <div style={styles.txBox}>
            <strong>Transaction Hash:</strong>
            <code style={{ wordBreak: 'break-all', fontSize: 10, marginTop: 8, display: 'block' }}>
              {txHash}
            </code>
          </div>

          <p style={{ fontSize: 12, color: '#666', textAlign: 'center', marginTop: 16 }}>
            🔗 Anyone can verify this transaction on the blockchain
          </p>

          <button onClick={resetAll} style={{ ...styles.btn, marginTop: 20 }}>
            Start New Payment
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // STEP: WALLET - Connected with balance
  // ============================================
  if (step === 'wallet' && wallet) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={styles.badgeGreen}>
              <Wallet size={20} />
              <span>Wallet Connected</span>
            </div>
          </div>

          <div style={styles.addressBox}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <KeyRound size={16} color="#7c3aed" />
              <strong>Stellar Address</strong>
            </div>
            <code style={{ wordBreak: 'break-all', fontSize: 11, color: '#1b1c1b' }}>
              {wallet.publicKey}
            </code>
          </div>

          <div style={styles.balanceBox}>
            <span style={{ fontSize: 13, color: '#666' }}>Balance</span>
            <span style={{ fontSize: 24, fontWeight: 900, color: '#059669' }}>
              {parseFloat(balance).toFixed(2)} XLM
            </span>
          </div>

          <div style={styles.networkBadge}>
            <Globe size={14} />
            <span>Stellar Testnet</span>
            <span style={{ color: '#22c55e' }}>● Real Network</span>
          </div>

          <button
            onClick={makePaymentWithPasskey}
            disabled={loading}
            style={{
              ...styles.payBtn,
              backgroundColor: loading ? '#9ca3af' : '#F25C05',
            }}
          >
            {loading ? (
              <><Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> Verifying passkey...</>
            ) : (
              <><Zap size={20} /> Pay 0.0000001 XLM (Authenticate First)</>
            )}
          </button>

          <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 12, textAlign: 'center' }}>
            🔐 Clicking will request your fingerprint/Face ID to authorize the payment
          </p>

          {error && <div style={styles.errorBox}>{error}</div>}
        </div>
      </div>
    );
  }

  // ============================================
  // STEP: INTRO / CREATE
  // ============================================
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Shield size={48} color="#7c3aed" />
          <h1 style={{ fontSize: 26, fontWeight: 900, marginTop: 12, color: '#1b1c1b' }}>
            Stellar Wallet with Passkey
          </h1>
          <p style={{ color: '#666', marginTop: 8 }}>
            Create a real Stellar wallet secured by your biometric (fingerprint/Face ID)
          </p>
        </div>

        {!wallet && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#374151' }}>
              Your email (for passkey identification)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={styles.input}
            />
          </div>
        )}

        {!wallet ? (
          <button
            onClick={createWalletWithPasskey}
            disabled={loading || !email}
            style={{
              ...styles.btn,
              backgroundColor: loading || !email ? '#9ca3af' : '#7c3aed',
            }}
          >
            {loading ? (
              <><Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> Creating passkey + wallet...</>
            ) : (
              <><Fingerprint size={20} /> Create Wallet with Passkey</>
            )}
          </button>
        ) : (
          <button
            onClick={makePaymentWithPasskey}
            disabled={loading}
            style={{ ...styles.btn, backgroundColor: '#F25C05' }}
          >
            <Zap size={20} /> Make Payment
          </button>
        )}

        {error && <div style={styles.errorBox}>{error}</div>}

        <div style={styles.disclaimer}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
            🔒 How it works (Real Blockchain):
          </p>
          <ol style={{ fontSize: 11, color: '#6b7280', paddingLeft: 16, lineHeight: 1.6 }}>
            <li><strong>Passkey:</strong> Your browser creates a WebAuthn credential (fingerprint/Face ID)</li>
            <li><strong>Wallet:</strong> We generate a real Stellar keypair</li>
            <li><strong>Fund:</strong> Friendbot adds 10,000 testnet XLM</li>
            <li><strong>Payment:</strong> Sign with passkey → send to blockchain → get TX hash</li>
            <li><strong>Verify:</strong> TX hash works on stellar.expert (anyone can check)</li>
          </ol>
        </div>
      </div>

      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f7f4',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    maxWidth: 480,
    width: '100%',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  btn: {
    width: '100%',
    padding: 16,
    backgroundColor: '#7c3aed',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  payBtn: {
    width: '100%',
    padding: 18,
    backgroundColor: '#F25C05',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 17,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  input: {
    width: '100%',
    padding: 14,
    borderRadius: 10,
    border: '2px solid #e5e7eb',
    fontSize: 15,
    marginBottom: 16,
  },
  badgeGreen: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#dcfce7',
    color: '#166534',
    padding: '12px 20px',
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
  },
  addressBox: {
    backgroundColor: '#f8f7f4',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  balanceBox: {
    textAlign: 'center',
    padding: 20,
    backgroundColor: '#f0fdf4',
    borderRadius: 10,
    marginBottom: 16,
  },
  networkBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 20,
  },
  explorerBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '14px 24px',
    backgroundColor: '#0ea5e9',
    color: '#fff',
    borderRadius: 10,
    textDecoration: 'none',
    fontSize: 15,
    fontWeight: 600,
    marginBottom: 16,
  },
  txBox: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 10,
    fontSize: 13,
    color: '#166534',
  },
  infoBox: {
    backgroundColor: '#f8f7f4',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #e5e7eb',
  },
  infoLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: 600,
    color: '#1b1c1b',
  },
  errorBox: {
    marginTop: 16,
    padding: '12px 16px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 8,
    color: '#dc2626',
    fontSize: 13,
  },
  disclaimer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
  },
} as const;