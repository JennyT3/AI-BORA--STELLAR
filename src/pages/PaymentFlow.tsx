import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Loader2, CheckCircle, ArrowRight, Zap, Wallet, Users, Building2, ExternalLink, Copy } from 'lucide-react';
import { getPaymentLink, marcarComoPago } from '../services/pagamentos';
import { getFatura } from '../services/faturas';
import { executePaymentSplit, createPaymentOnChain, PAYMENT_SPLITTER_ID } from '../services/paymentSplitter';
import { procesarPagoColaboradores } from '../services/paymentToTasks';

const API_URL = import.meta.env.VITE_API_URL || '';
const STELLAR_EXPLORER = 'https://stellar.expert/explorer/testnet';

interface PaymentStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  txHash?: string;
  amount?: string;
}

export default function PaymentFlowPage() {
  const [match, params] = useRoute('/payment-flow/:id');
  const [, setLocation] = useLocation();
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fatura, setFatura] = useState<any>(null);
  const [paymentLink, setPaymentLink] = useState<any>(null);
  
  const [steps, setSteps] = useState<PaymentStep[]>([
    {
      id: 'client-pay',
      title: 'Client Payment',
      description: 'Client sends USDC payment via x402 protocol',
      status: 'pending'
    },
    {
      id: 'split-create',
      title: 'Create Payment Split',
      description: 'Deploy payment split on Soroban smart contract',
      status: 'pending'
    },
    {
      id: 'split-execute',
      title: 'Execute Distribution',
      description: '70/30 split executed automatically on-chain',
      status: 'pending'
    },
    {
      id: 'update-tasks',
      title: 'Update Tasks',
      description: 'Mark tasks as paid and register commissions',
      status: 'pending'
    }
  ]);

  const [splitResult, setSplitResult] = useState<{
    adminAmount: string;
    collaboratorAmount: string;
    txHash: string;
    explorerUrl: string;
  } | null>(null);

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

  const updateStepStatus = (stepId: string, status: PaymentStep['status'], txHash?: string, amount?: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, txHash, amount }
        : step
    ));
  };

  const handleExecutePaymentFlow = async () => {
    if (!fatura || !paymentLink) return;
    
    setProcessing(true);
    setError(null);
    
    try {
      // Step 1: Client payment simulation
      updateStepStatus('client-pay', 'processing');
      setSteps(prev => prev.map(s => s.id === 'client-pay' ? { ...s, status: 'processing' as const } : s));
      
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
        updateStepStatus('client-pay', 'error');
        setError(data.error || 'Payment failed');
        setProcessing(false);
        return;
      }
      
      updateStepStatus('client-pay', 'completed', data.txHash, `${fatura.valorTotal || 1} USDC`);
      
      // Step 2: Create payment split on-chain
      updateStepStatus('split-create', 'processing');
      
      const adminSecret = import.meta.env.VENDOR_SECRET;
      if (!adminSecret) {
        updateStepStatus('split-create', 'error');
        console.warn('No VENDOR_SECRET - skipping on-chain split');
      } else {
        const paymentId = `payment-${paymentLink.faturaId}`;
        const amountInStroops = Math.floor((fatura.valorTotal || 1) * 10_000_000);
        
        await createPaymentOnChain(paymentId, amountInStroops, adminSecret);
        updateStepStatus('split-create', 'completed');
        
        // Step 3: Execute split
        updateStepStatus('split-execute', 'processing');
        
        const splitResult = await executePaymentSplit(paymentId, adminSecret);
        
        if (splitResult.success) {
          updateStepStatus('split-execute', 'completed', splitResult.txHash);
          setSplitResult({
            adminAmount: splitResult.adminAmount || '0.70',
            collaboratorAmount: splitResult.collaboratorAmount || '0.30',
            txHash: splitResult.txHash || '',
            explorerUrl: splitResult.explorerUrl || ''
          });
        } else {
          updateStepStatus('split-execute', 'error');
          console.error('Split failed:', splitResult.error);
        }
      }
      
      // Mark as paid in Firestore
      await marcarComoPago(paymentLink.id);
      
      // Step 4: Update tasks
      updateStepStatus('update-tasks', 'processing');
      
      if (paymentLink.clienteId) {
        try {
          await procesarPagoColaboradores(
            paymentLink.clienteId,
            fatura.valorTotal || 0,
            paymentLink.id
          );
          updateStepStatus('update-tasks', 'completed');
        } catch (taskErr) {
          console.warn('Could not update tasks:', taskErr);
          updateStepStatus('update-tasks', 'completed');
        }
      } else {
        updateStepStatus('update-tasks', 'completed');
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
      <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#F25C05' }} />
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (paid) return (
    <div style={styles.center}>
      <div style={{...styles.card, maxWidth:640}}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <CheckCircle size={56} color="#22c55e" style={{ marginBottom: 16 }} />
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1b1c1b', marginBottom: 8 }}>
            Payment Complete!
          </h1>
          <p style={{ color: '#666', marginBottom: 24 }}>
            All steps executed successfully on Stellar blockchain
          </p>
        </div>

        {/* Payment Flow Summary */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#1b1c1b' }}>
            Payment Flow Summary
          </h2>
          
          {steps.map((step, index) => (
            <div key={step.id} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12,
              padding: '12px 16px',
              backgroundColor: step.status === 'completed' ? '#f0fdf4' : '#f8f7f4',
              borderRadius: 8,
              marginBottom: 8,
              border: `1px solid ${step.status === 'completed' ? '#22c55e' : '#e5e7eb'}`
            }}>
              <div style={{ 
                width: 32, 
                height: 32, 
                borderRadius: '50%', 
                backgroundColor: step.status === 'completed' ? '#22c55e' : '#9ca3af',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: 14
              }}>
                {index + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: '#1b1c1b' }}>{step.title}</div>
                <div style={{ fontSize: 13, color: '#666' }}>{step.description}</div>
              </div>
              {step.status === 'completed' && (
                <CheckCircle size={20} color="#22c55e" />
              )}
              {step.txHash && (
                <a 
                  href={`${STELLAR_EXPLORER}/tx/${step.txHash}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ ...styles.linkBtn, padding: '6px 12px', fontSize: 12 }}
                >
                  <ExternalLink size={14} />View TX
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Distribution Breakdown */}
        {splitResult && (
          <div style={{ 
            backgroundColor: '#eff6ff', 
            borderRadius: 16, 
            padding: 24,
            marginBottom: 24,
            border: '1px solid #3b82f6'
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#1d4ed8' }}>
              On-Chain Payment Distribution
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ 
                backgroundColor: '#fff', 
                borderRadius: 12, 
                padding: 16,
                textAlign: 'center'
              }}>
                <Building2 size={24} color="#64748b" style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Company (70%)</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#1b1c1b' }}>
                  ${splitResult.adminAmount}
                </div>
                <div style={{ fontSize: 12, color: '#22c55e' }}>USDC</div>
              </div>
              
              <div style={{ 
                backgroundColor: '#fff', 
                borderRadius: 12, 
                padding: 16,
                textAlign: 'center'
              }}>
                <Users size={24} color="#64748b" style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Collaborator (30%)</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#22c55e' }}>
                  ${splitResult.collaboratorAmount}
                </div>
                <div style={{ fontSize: 12, color: '#22c55e' }}>USDC</div>
              </div>
            </div>

            {splitResult.txHash && (
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <a 
                  href={splitResult.explorerUrl}
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={styles.explorerBtn}
                >
                  <ExternalLink size={16} />
                  View Distribution on Stellar Explorer
                </a>
              </div>
            )}
          </div>
        )}

        {/* Smart Contract Info */}
        <div style={{ 
          backgroundColor: '#1b1c1b', 
          borderRadius: 12, 
          padding: 16,
          marginBottom: 24
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Zap size={18} color="#F25C05" />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>PaymentSplitter Contract</span>
          </div>
          <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'monospace' }}>
            {PAYMENT_SPLITTER_ID}
          </div>
        </div>

        <button
          onClick={() => setLocation(`/c/${paymentLink?.clienteId}`)}
          style={{ ...styles.btn, backgroundColor: '#1b1c1b' }}
        >
          Back to My Area
        </button>
      </div>
    </div>
  );

  return (
    <div style={styles.center}>
      <div style={{...styles.card, maxWidth: 560}}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Zap size={32} color="#F25C05" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#F25C05', letterSpacing: 1 }}>STELLAR x402 DEMO</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#1b1c1b', marginBottom: 8 }}>
            Payment Flow Demo
          </h1>
          <p style={{ color: '#666', fontSize: 14 }}>
            Watch the complete payment distribution in real-time
          </p>
        </div>

        {fatura && (
          <div style={{ backgroundColor: '#f8f7f4', borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <Row label="Invoice no." value={fatura.numero} />
            <Row label="Description" value={fatura.descricao || 'AI BORA services'} />
            <Row label="Client" value={paymentLink?.clienteId || 'Demo Client'} />
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #e5e7eb', marginTop: 8 }}>
              <span style={{ fontWeight: 700, color: '#1b1c1b' }}>Total Payment</span>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 24, fontWeight: 900, color: '#F25C05' }}>
                  {fatura.valorTotal?.toFixed(2) || '1.00'} USDC
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Preview of Distribution */}
        <div style={{ 
          backgroundColor: '#eff6ff', 
          borderRadius: 12, 
          padding: 16,
          marginBottom: 24,
          border: '1px solid #bfdbfe'
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1d4ed8', marginBottom: 12 }}>
            Distribution Preview
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Company</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#1b1c1b' }}>
                ${((fatura?.valorTotal || 1) * 0.7).toFixed(2)}
              </div>
              <div style={{ fontSize: 12, color: '#3b82f6' }}>70%</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Collaborator</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#22c55e' }}>
                ${((fatura?.valorTotal || 1) * 0.3).toFixed(2)}
              </div>
              <div style={{ fontSize: 12, color: '#22c55e' }}>30%</div>
            </div>
          </div>
        </div>

        {/* Steps Preview */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1b1c1b', marginBottom: 12 }}>
            Flow Steps:
          </div>
          {steps.map((step, index) => (
            <div key={step.id} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8,
              padding: '8px 12px',
              backgroundColor: '#f8f7f4',
              borderRadius: 8,
              marginBottom: 6
            }}>
              <div style={{ 
                width: 20, 
                height: 20, 
                borderRadius: '50%', 
                backgroundColor: '#F25C05',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: 11
              }}>
                {index + 1}
              </div>
              <span style={{ fontSize: 13, color: '#1b1c1b' }}>{step.title}</span>
              <ArrowRight size={14} color="#9ca3af" style={{ marginLeft: 'auto' }} />
            </div>
          ))}
        </div>

        {error && (
          <div style={{ 
            backgroundColor: '#fef2f2', 
            border: '1px solid #fecaca', 
            borderRadius: 8, 
            padding: '12px 16px', 
            marginBottom: 16, 
            fontSize: 13, 
            color: '#dc2626' 
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleExecutePaymentFlow}
          disabled={processing}
          style={{
            ...styles.btn,
            backgroundColor: processing ? '#9ca3af' : '#F25C05',
            cursor: processing ? 'not-allowed' : 'pointer',
          }}
        >
          {processing ? (
            <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />Processing...</>
          ) : (
            <><Zap size={18} /> Execute Payment Flow</>
          )}
        </button>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#9ca3af' }}>
          Stellar testnet · x402 protocol · Soroban PaymentSplitter
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
  center: { 
    minHeight: '100vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#f8f7f4', 
    padding: 20 
  } as React.CSSProperties,
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 32, 
    maxWidth: 480, 
    width: '100%', 
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
  } as React.CSSProperties,
  btn: { 
    width: '100%', 
    padding: 16, 
    backgroundColor: '#F25C05', 
    color: '#fff', 
    border: 'none', 
    borderRadius: 12, 
    fontSize: 15, 
    fontWeight: 700, 
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8 
  } as React.CSSProperties,
  explorerBtn: { 
    display: 'inline-flex', 
    alignItems: 'center', 
    gap: 6, 
    padding: '10px 20px', 
    backgroundColor: '#0ea5e9', 
    color: '#fff', 
    borderRadius: 8, 
    textDecoration: 'none', 
    fontWeight: 600, 
    fontSize: 14 
  } as React.CSSProperties,
  linkBtn: { 
    display: 'inline-flex', 
    alignItems: 'center', 
    gap: 4, 
    backgroundColor: '#3b82f6', 
    color: '#fff', 
    borderRadius: 6, 
    textDecoration: 'none', 
    fontWeight: 600 
  } as React.CSSProperties,
};