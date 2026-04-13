import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, ExternalLink, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const VENDOR_PUBLIC = 'GDQX74MG4TVG7BBZCLDCOEOQX2PADCTRUIDAWG5KLIQ64LYURC5XC7CN';
const MPP_SERVER = 'http://localhost:3003';

const SERVICES = [
  { id: 'marketing-plan', name: 'Marketing Plan AI', price: 0.01, desc: 'AI-generated marketing strategy' },
  { id: 'sales-script', name: 'Sales Script AI', price: 0.005, desc: 'Professional sales script' },
  { id: 'contract-draft', name: 'Contract Draft AI', price: 0.02, desc: 'Legal contract template' },
];

export default function MppDemo() {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'paying' | 'success' | 'error'>('idle');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const connectWallet = async () => {
    setStatus('connecting');
    try {
      // @ts-ignore
      const freighter = window?.freighter;
      if (!freighter) {
        throw new Error('Please install Freighter wallet extension');
      }

      const publicKey = await freighter.getPublicKey();
      setWalletAddress(publicKey);
      setStatus('idle');
    } catch (e: any) {
      setError(e.message);
      setStatus('error');
    }
  };

  const payWithMpp = async (serviceId: string, price: number) => {
    setSelectedService(serviceId);
    setStatus('paying');
    setError(null);

    try {
      // @ts-ignore
      const freighter = window?.freighter;
      if (!freighter) {
        throw new Error('Please install Freighter wallet extension');
      }

      const publicKey = await freighter.getPublicKey();
      setWalletAddress(publicKey);

      // Build transaction using Stellar SDK
      const { TransactionBuilder, Operation, Asset, Networks, Memo } = await import('@stellar/stellar-sdk');
      
      // Get freighhter to sign and submit
      const txXDR = await freighter.signTransaction(
        await buildPaymentXDR(publicKey, price),
        { networkPassphrase: 'Test SDF Network ; September 2015' }
      );

      // Submit to Horizon
      const { Horizon } = await import('@stellar/stellar-sdk');
      const server = new Horizon.Server('https://horizon-testnet.stellar.org');
      
      const result = await server.submitTransaction(txXDR);
      
      setTxHash(result.hash);
      setStatus('success');

      // Notify MPP server about payment
      await fetch(`${MPP_SERVER}/mpp/payment-received`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txHash: result.hash,
          service: serviceId,
          from: publicKey,
          amount: price,
        }),
      });

    } catch (e: any) {
      console.error('MPP Payment Error:', e);
      setError(e.message || 'Payment failed');
      setStatus('error');
    }
  };

  const buildPaymentXDR = async (publicKey: string, amount: number): Promise<string> => {
    const { TransactionBuilder, Operation, Asset, Networks, Memo, Horizon } = await import('@stellar/stellar-sdk');
    
    const server = new Horizon.Server('https://horizon-testnet.stellar.org');
    const account = await server.loadAccount(publicKey);

    const tx = new TransactionBuilder(account, {
      fee: '100',
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(Operation.payment({
        destination: VENDOR_PUBLIC,
        asset: Asset.native(),
        amount: amount.toString(),
      }))
      .addMemo(Memo.text('MPP:AI-BORA'))
      .setTimeout(30)
      .build();

    return tx.toXDR();
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 100%)',
      padding: '40px 24px'
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: 40 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ 
              width: 48, height: 48, borderRadius: 12, 
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Zap size={24} color="white" />
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', fontFamily: 'Montserrat, sans-serif' }}>
              MPP Direct Payment
            </h1>
          </div>
          <p style={{ color: '#888', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
            Machine Payments Protocol: Pay directly with XLM, no intermediaries
          </p>
        </motion.div>

        {/* Wallet Connection */}
        {!walletAddress && status !== 'connecting' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              marginBottom: 32,
              padding: 24,
              background: 'rgba(139, 92, 246, 0.1)',
              borderRadius: 16,
              border: '1px solid rgba(139, 92, 246, 0.3)',
              textAlign: 'center'
            }}
          >
            <button
              onClick={connectWallet}
              style={{
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                border: 'none',
                borderRadius: 12,
                color: 'white',
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <zap size={20} />
              Connect Freighter Wallet
            </button>
            <p style={{ marginTop: 12, fontSize: 13, color: '#666' }}>
              You need Freighter wallet installed to make MPP payments
            </p>
          </motion.div>
        )}

        {/* Connecting State */}
        {status === 'connecting' && (
          <div style={{ textAlign: 'center', padding: 40, color: '#8b5cf6' }}>
            <Loader size={32} className="animate-spin" style={{ margin: '0 auto 16px' }} />
            <p>Connecting wallet...</p>
          </div>
        )}

        {/* Wallet Connected */}
        {walletAddress && status !== 'paying' && status !== 'success' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ 
              marginBottom: 24,
              padding: 16,
              background: 'rgba(34, 197, 94, 0.1)',
              borderRadius: 12,
              border: '1px solid rgba(34, 197, 94, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <CheckCircle size={20} color="#22c55e"/>
            <div>
              <div style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>Wallet Connected</div>
              <div style={{ fontSize: 11, color: '#888', fontFamily: 'monospace' }}>
                {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
              </div>
            </div>
          </motion.div>
        )}

        {/* Services */}
        {walletAddress && status !== 'success' && (
          <div style={{ display: 'grid', gap: 16 }}>
            {SERVICES.map((service, idx) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                style={{
                  background: 'linear-gradient(135deg, #1a1a2e 0%, #0f172a 100%)',
                  borderRadius: 16,
                  padding: 20,
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                    {service.name}
                  </h3>
                  <p style={{ fontSize: 13, color: '#888' }}>{service.desc}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#8b5cf6' }}>
                    {service.price} XLM
                  </div>
                  <button
                    onClick={() => payWithMpp(service.id, service.price)}
                    disabled={status === 'paying'}
                    style={{
                      marginTop: 8,
                      padding: '10px 20px',
                      background: status === 'paying' ? '#444' : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      border: 'none',
                      borderRadius: 8,
                      color: 'white',
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: status === 'paying' ? 'not-allowed' : 'pointer',
                      opacity: status === 'paying' ? 0.6 : 1
                    }}
                  >
                    {status === 'paying' && selectedService === service.id ? 'Processing...' : 'Pay Now'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Paying State */}
        {status === 'paying' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ 
              textAlign: 'center', 
              padding: 60,
              background: 'rgba(139, 92, 246, 0.1)',
              borderRadius: 16,
              border: '1px solid rgba(139, 92, 246, 0.3)'
            }}
          >
            <Loader size={48} className="animate-spin" style={{ margin: '0 auto 24px', color: '#8b5cf6' }} />
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
              Processing MPP Payment...
            </h3>
            <p style={{ color: '#888', fontSize: 14 }}>
              Confirm the transaction in your Freighter wallet
            </p>
          </motion.div>
        )}

        {/* Success State */}
        {status === 'success' && txHash && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ 
              textAlign: 'center', 
              padding: 40,
              background: 'rgba(34, 197, 94, 0.1)',
              borderRadius: 16,
              border: '1px solid rgba(34, 197, 94, 0.3)'
            }}
          >
            <CheckCircle size={64} style={{ margin: '0 auto 24px', color: '#22c55e' }} />
            <h3 style={{ fontSize: 24, fontWeight: 700, color: '#22c55e', marginBottom: 8 }}>
              Payment Successful!
            </h3>
            <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>
              Your MPP payment has been processed on Stellar blockchain
            </p>
            
            <div style={{ 
              padding: 16, 
              background: 'rgba(0,0,0,0.3)', 
              borderRadius: 8, 
              marginBottom: 24,
              fontFamily: 'monospace',
              fontSize: 12,
              color: '#888',
              wordBreak: 'break-all'
            }}>
              {txHash}
            </div>

            <a 
              href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                borderRadius: 10,
                color: 'white',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              <ExternalLink size={16} />
              View on Stellar Explorer
            </a>

            <button
              onClick={() => { setStatus('idle'); setTxHash(null); setSelectedService(null); }}
              style={{
                display: 'block',
                margin: '24px auto 0',
                padding: '12px 24px',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 10,
                color: '#888',
                cursor: 'pointer'
              }}
            >
              Make Another Payment
            </button>
          </motion.div>
        )}

        {/* Error State */}
        {status === 'error' && error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ 
              textAlign: 'center', 
              padding: 40,
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: 16,
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}
          >
            <AlertCircle size={48} style={{ margin: '0 auto 16px', color: '#ef4444' }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>
              Payment Failed
            </h3>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>{error}</p>
            <button
              onClick={() => { setStatus('idle'); setError(null); }}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                border: 'none',
                borderRadius: 10,
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* How it Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ marginTop: 48 }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 16 }}>
            How MPP Works
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { step: '1', title: 'Connect Wallet', desc: 'Link Freighter to pay' },
              { step: '2', title: 'Select Service', desc: 'Choose what you need' },
              { step: '3', title: 'Pay XLM', desc: 'Direct blockchain tx' },
              { step: '4', title: '70/30 Split', desc: 'Auto-distributed' },
            ].map((item) => (
              <div key={item.step} style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
                <div style={{ 
                  width: 28, height: 28, borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 8
                }}>
                  {item.step}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: '#666' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}