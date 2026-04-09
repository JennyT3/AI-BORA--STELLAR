import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Loader, CheckCircle, AlertCircle, ExternalLink, Zap } from 'lucide-react';
import { getPaymentLink, marcarComoPago } from '../services/pagamentos';
import { getFatura } from '../services/faturas';

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

  useEffect(() => {
    if (match && params?.id) loadPaymentData(params.id);
  }, [match, params]);

  const loadPaymentData = async (id: string) => {
    setLoading(true);
    try {
      const link = await getPaymentLink(id);
      if (!link) { setError('Payment link not found'); return; }
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
      const res = await fetch('/api/stellar-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          faturaId: paymentLink.faturaId,
          amountEur: fatura.valorTotal || 1,
          memo: `AIBORA invoice ${fatura.numero}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTxHash(data.txHash);
        setPaid(true);
        await marcarComoPago(paymentLink.id);
      } else {
        setError(data.error || 'Payment failed. Try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error');
    } finally {
      setProcessing(false);
    }
  };

  // ── Loading ──
  if (loading) return (
    <div style={styles.center}>
      <Loader size={40} color="#F25C05" style={{ animation: 'spin 1s linear infinite' }} />
      <p style={{ marginTop: 16, color: '#666' }}>Loading payment...</p>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  // ── Success ──
  if (paid) return (
    <div style={styles.center}>
      <div style={styles.card}>
        <CheckCircle size={56} color="#22c55e" style={{ marginBottom: 16 }} />
        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#1b1c1b', marginBottom: 8 }}>
          Payment confirmed! ✅
        </h1>
        <p style={{ color: '#666', marginBottom: 24 }}>
          Your invoice has been paid via Stellar x402 (USDC testnet).
        </p>
        {txHash && (
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.explorerBtn}
          >
            <ExternalLink size={16} />
            View on Stellar Explorer
          </a>
        )}
        <div style={{ marginTop: 24, padding: '12px 16px', backgroundColor: '#f0fdf4', borderRadius: 8, fontSize: 12, color: '#166534', wordBreak: 'break-all' }}>
          <strong>TX Hash:</strong><br />{txHash}
        </div>
        <button
          onClick={() => setLocation(`/c/${paymentLink?.clienteId}`)}
          style={{ ...styles.btn, marginTop: 24, backgroundColor: '#1b1c1b' }}
        >
          Back to my area
        </button>
      </div>
    </div>
  );

  // ── Error ──
  if (error && !fatura) return (
    <div style={styles.center}>
      <div style={styles.card}>
        <AlertCircle size={48} color="#dc2626" style={{ marginBottom: 16 }} />
        <p style={{ color: '#666' }}>{error}</p>
        <button onClick={() => setLocation('/')} style={{ ...styles.btn, marginTop: 16 }}>Back</button>
      </div>
    </div>
  );

  // ── Main ──
  return (
    <div style={styles.center}>
      <div style={styles.card}>
        {/* Header */}
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
        </div>

        {/* Invoice details */}
        {fatura && (
          <div style={{ backgroundColor: '#f8f7f4', borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <Row label="Invoice no." value={fatura.numero} />
            <Row label="Description" value={fatura.descricao || 'AI BORA services'} />
            <Row label="Due date" value={fatura.dataVencimento || '15 days'} />
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #e5e7eb', marginTop: 8 }}>
              <span style={{ fontWeight: 700, color: '#1b1c1b' }}>Total</span>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 24, fontWeight: 900, color: '#F25C05' }}>
                  {fatura.valorTotal?.toFixed(2) || '0.00'}€
                </span>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>
                  ≈ {fatura.valorTotal?.toFixed(2) || '0.00'} USDC (testnet)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stellar badge */}
        <div style={{ backgroundColor: '#eff6ff', borderRadius: 8, padding: '10px 14px', marginBottom: 20, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 18 }}>⭐</span>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8', margin: 0 }}>Powered by Stellar x402</p>
            <p style={{ fontSize: 11, color: '#3b82f6', margin: 0 }}>
              Fast settlement · Near-zero fees · Blockchain verified
            </p>
          </div>
        </div>

        {/* Error inline */}
        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#dc2626' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Pay button */}
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
            <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Processing on Stellar...</>
          ) : (
            <><Zap size={18} /> Pay {fatura?.valorTotal?.toFixed(2) || '0.00'} USDC on Stellar</>
          )}
        </button>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 12 }}>
          Stellar testnet · x402 protocol · No real funds used
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
