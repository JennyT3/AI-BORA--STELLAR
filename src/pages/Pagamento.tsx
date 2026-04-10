import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Loader, CheckCircle, AlertCircle, ExternalLink, Zap } from 'lucide-react';
import { getPaymentLink, marcarComoPago } from '../services/pagamentos';
import { getFatura } from '../services/faturas';
import { executePaymentSplit, createPaymentOnChain } from '../services/paymentSplitter';
import { procesarPagoColaboradores } from '../services/paymentToTasks';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function PagamentoPage() {
  const [match, params] = useRoute('/pagamento/:id');
  const [, setLocation] = useLocation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fatura, setFatura] = useState<any>(null);
  const [paymentLink, setPaymentLink] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [splitTxHash, setSplitTxHash] = useState<string | null>(null);

  useEffect(() => {
    if (!match || !params?.id) return;
    
    const id = params.id;
    
    if (id === 'test' || id === 'demo') {
      setPaymentLink({ id: 'test', faturaId: 'test-fatura', clienteId: 'test-client' });
      setFatura({
        numero: 'TEST-2026-001',
        descricao: 'AI BORA Demo Invoice',
        dataVencimento: '15/04/2026',
        valorTotal: 1.00,
        clienteId: 'test-client',
        status: 'pending'
      });
      setLoading(false);
      return;
    }
    
    loadPaymentData(id);
  }, [params?.id]);

  const loadPaymentData = async (id: string) => {
    setLoading(true);
    try {
      const link = await getPaymentLink(id);
      
      if (!link) {
        if (id === 'test' || id === 'demo') {
          setPaymentLink({ id: 'test', faturaId: 'test-fatura', clienteId: 'test-client' });
          setFatura({
            numero: 'TEST-2026-001',
            descricao: 'Demo Invoice - No payment required',
            dataVencimento: '15/04/2026',
            valorTotal: 1.00,
            clienteId: 'test-client'
          });
          setLoading(false);
          return;
        }
        setError('Payment link not found');
        return;
      }
      
      setPaymentLink(link);
      const faturaData = await getFatura(link.faturaId);
      setFatura(faturaData);
    } catch {
      setError('Error loading payment details');
    } finally {
      setLoading(false);
    }
  };

  const handleStellarPay = async () => {
    if (!fatura || !paymentLink) return;
    
    setProcessing(true);
    setError(null);
    
    try {
      // Step 1: Send USDC payment via x402
      const res = await fetch(`${API_URL}/api/stellar-pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          faturaId: paymentLink.faturaId,
          amountEur: fatura.valorTotal || 1,
          memo: `AIBORA invoice ${fatura.numero}`,
        }),
      });
      
      const data = await res.json();
      
      if (!data.success) {
        setError(data.error || 'Payment failed. Try again.');
        setProcessing(false);
        return;
      }
      
      setTxHash(data.txHash);
      
      // Step 2: Execute 70/30 split on-chain via PaymentSplitter contract
      const adminSecret = import.meta.env.VENDOR_SECRET;
      if (adminSecret) {
        const paymentId = `payment-${paymentLink.faturaId}`;
        const amountInStroops = Math.floor((fatura.valorTotal || 1) * 10_000_000); // Convert to stroops
        
        // Create payment split on chain
        await createPaymentOnChain(paymentId, amountInStroops, adminSecret);
        
        // Execute the split
        const splitResult = await executePaymentSplit(paymentId, adminSecret);
        
        if (splitResult.success) {
          setSplitTxHash(splitResult.txHash || null);
          
          console.log('✅ Split executed on-chain:');
          console.log(`  Admin: ${splitResult.adminAmount} USDC`);
          console.log(`  Collaborator: ${splitResult.collaboratorAmount} USDC`);
          console.log(`  Explorer: ${splitResult.explorerUrl}`);
        } else {
          console.error('Split failed:', splitResult.error);
        }
      }
      
      // Mark as paid in Firestore
      await marcarComoPago(paymentLink.id);
      
      // Step 3: Mark tasks as paid and register commissions
      if (paymentLink.clienteId) {
        try {
          await procesarPagoColaboradores(
            paymentLink.clienteId,
            fatura.valorTotal || 0,
            paymentLink.id
          );
          console.log('✅ Tasks updated and commissions registered');
        } catch (taskErr) {
          console.warn('⚠️ Could not update tasks (non-critical):', taskErr);
        }
      }
      
      setPaid(true);
      
    } catch (err: any) {
      setError(err?.message || 'Network error');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <div style={styles.center}>
      <Loader size={40} color="#F25C05" style={{ animation: 'spin 1s linear infinite' }} />
      <p style={{ marginTop: 16, color: '#666' }}>Loading payment...</p>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (paid) return (
    <div style={styles.center}>
      <div style={styles.card}>
        <CheckCircle size={56} color="#22c55e" style={{ marginBottom: 16 }} />
        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#1b1c1b', marginBottom: 8 }}>
          Payment confirmed! ✅
        </h1>
        <p style={{ color: '#666', marginBottom: 16 }}>
          Your invoice has been paid via Stellar x402 (USDC testnet).
        </p>
        <p style={{ color: '#F25C05', fontWeight: 700, marginBottom: 24 }}>
          70/30 split executed on-chain via PaymentSplitter contract
        </p>
        
        {txHash && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Payment Transaction:</p>
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.explorerBtn}
            >
              <ExternalLink size={16} />
              View on Stellar Explorer
            </a>
          </div>
        )}
        
        {splitTxHash && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Split Transaction:</p>
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${splitTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...styles.explorerBtn, backgroundColor: '#F25C05' }}
            >
              <ExternalLink size={16} />
              View Split on Blockchain
            </a>
          </div>
        )}
        
        <button
          onClick={() => setLocation(`/c/${paymentLink?.clienteId}`)}
          style={{ ...styles.btn, marginTop: 24, backgroundColor: '#1b1c1b' }}
        >
          Back to my area
        </button>
      </div>
    </div>
  );

  if (error && !fatura) return (
    <div style={styles.center}>
      <div style={styles.card}>
        <AlertCircle size={48} color="#dc2626" style={{ marginBottom: 16 }} />
        <p style={{ color: '#666' }}>{error}</p>
        <button onClick={() => setLocation('/')} style={{ ...styles.btn, marginTop: 16 }}>Back</button>
      </div>
    </div>
  );

  return (
    <div style={styles.center}>
      <div style={styles.card}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Zap size={32} color="#F25C05" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#F25C05', letterSpacing: 1 }}>STELLAR x402</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#1b1c1b', marginBottom: 8 }}>
            Invoice Payment
          </h1>
          <p style={{ color: '#666', fontSize: 14 }}>
            Secure on-chain payment via Stellar testnet (USDC)
          </p>
          <p style={{ color: '#F25C05', fontSize: 12, fontWeight: 600, marginTop: 8 }}>
            Payment automatically splits 70/30 on-chain
          </p>
        </div>

        {fatura && (
          <div style={{ backgroundColor: '#f8f7f4', borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <Row label="Invoice no." value={fatura.numero} />
            <Row label="Description" value={fatura.descricao || 'AI BORA services'} />
            <Row label="Due date" value={fatura.dataVencimento || '15 days'} />
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #e5e7eb', marginTop: 8 }}>
              <span style={{ fontWeight: 700, color: '#1b1c1b' }}>Total</span>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 24, fontWeight: 900, color: '#F25C05' }}>
                  {fatura.valorTotal?.toFixed(2) || '0.00'} USDC
                </span>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>
                  ≈ {fatura.valorTotal?.toFixed(2) || '0.00'} USDC (testnet)
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ backgroundColor: '#eff6ff', borderRadius: 8, padding: '10px 14px', marginBottom: 20, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 18 }}>⭐</span>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8', margin: 0 }}>Powered by Stellar x402 + Soroban</p>
            <p style={{ fontSize: 11, color: '#3b82f6', margin: 0 }}>
              Fast settlement · On-chain split · Transparent distribution
            </p>
          </div>
        </div>

        <div style={{ backgroundColor: '#fef3c7', borderRadius: 6, padding: '8px 12px', marginBottom: 16, fontSize: 11, color: '#92400e', textAlign: 'center' }}>
          💳 Paying from: GBM4USEN... (testnet wallet)
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#dc2626' }}>
            ⚠️ {error}
          </div>
        )}

        <button
          onClick={handleStellarPay}
          disabled={processing}
          style={{
            ...styles.btn,
            backgroundColor: processing ? '#9ca3af' : '#F25C05',
            cursor: processing ? 'not-allowed' : 'pointer',
          }}
        >
          {processing ? (
            <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Processing & Splitting...</>
          ) : (
            <><Zap size={18} /> Pay {fatura?.valorTotal?.toFixed(2) || '0.00'} USDC (70/30 auto-split)</>
          )}
        </button>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 12 }}>
          Stellar testnet · x402 protocol · Soroban PaymentSplitter
        </p>

        <div style={{ textAlign: 'center', marginTop: 16, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
          <a href={`/c/${paymentLink?.clienteId}`} style={{ color: '#666', fontSize: 13 }}>
            Back to my area
          </a>
        </div>
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
      <span style={{ color: '#666', fontSize: 14 }}>{label}</span>
      <span style={{ color: '#1b1c1b', fontSize: 14 }}>{value}</span>
    </div>
  );
}

const styles = {
  center: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f7f4', padding: 20 } as React.CSSProperties,
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 32, maxWidth: 480, width: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } as React.CSSProperties,
  btn: { width: '100%', padding: 16, backgroundColor: '#F25C05', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 } as React.CSSProperties,
  explorerBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', backgroundColor: '#0ea5e9', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 14 } as React.CSSProperties,
};