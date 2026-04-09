import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { CreditCard, Loader, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { getPaymentLink, verificarPaymentStripe, getStripeCheckoutUrl } from '../services/pagamentos';
import { getFatura } from '../services/faturas';

export default function PagamentoPage() {
  const [match, params] = useRoute('/pagamento/:id');
  const [, setLocation] = useLocation();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fatura, setFatura] = useState<any>(null);
  const [paymentLink, setPaymentLink] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (match && params?.id) {
      loadPaymentData(params.id);
    }
  }, [match, params]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('pagamento') === 'success';
    
    if (success && params?.id) {
      handlePaymentSuccess(params.id);
    }
  }, []);

  const loadPaymentData = async (id: string) => {
    setLoading(true);
    try {
      const link = await getPaymentLink(id);
      if (!link) {
        setError('Link de pagamento não encontrado');
        setLoading(false);
        return;
      }
      
      setPaymentLink(link);
      
      const faturaData = await getFatura(link.faturaId);
      setFatura(faturaData);
      
    } catch (err) {
      setError('Erro ao carregar dados do pagamento');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (linkId: string) => {
    const link = await getPaymentLink(linkId);
    if (link?.stripeSessionId) {
      const paid = await verificarPaymentStripe(link.stripeSessionId);
      if (paid) {
        setLocation(`/c/${link.clienteId}?pagamento=sucesso`);
      }
    }
  };

  const handlePagar = () => {
    if (!paymentLink?.stripeSessionId) return;
    
    const url = getStripeCheckoutUrl(paymentLink.stripeSessionId);
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f8f7f4'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader size={40} color="#F25C05" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '16px', color: '#666' }}>A carregar pagamento...</p>
        </div>
        <style>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f8f7f4',
        padding: '20px'
      }}>
        <div style={{ 
          backgroundColor: '#fff', 
          borderRadius: '16px', 
          padding: '32px', 
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <AlertCircle size={48} color="#dc2626" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1b1c1b', marginBottom: '12px' }}>
            Erro
          </h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>{error}</p>
          <button 
            onClick={() => setLocation('/')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#F25C05',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f8f7f4',
      padding: '20px'
    }}>
      <div style={{ 
        backgroundColor: '#fff', 
        borderRadius: '16px', 
        padding: '32px', 
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <CreditCard size={48} color="#F25C05" style={{ marginBottom: '12px' }} />
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#1b1c1b', marginBottom: '8px' }}>
            Pagamento de Fatura
          </h1>
          <p style={{ color: '#666' }}>
            Pague a sua fatura de forma segura
          </p>
        </div>

        {fatura && (
          <div style={{ 
            backgroundColor: '#f8f7f4', 
            borderRadius: '12px', 
            padding: '20px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#666' }}>Fatura Nº</span>
              <span style={{ fontWeight: 700, color: '#1b1c1b' }}>{fatura.numero}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#666' }}>Descrição</span>
              <span style={{ color: '#1b1c1b' }}>{fatura.descricao || 'Serviços Ai Bora'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#666' }}>Vencimento</span>
              <span style={{ color: '#1b1c1b' }}>{fatura.dataVencimento || '15 dias'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
              <span style={{ fontWeight: 700, color: '#1b1c1b' }}>Total</span>
              <span style={{ fontSize: '24px', fontWeight: 900, color: '#F25C05' }}>
                {fatura.valorTotal?.toFixed(2) || '0.00'}€
              </span>
            </div>
          </div>
        )}

        <button
          onClick={handlePagar}
          disabled={!paymentLink?.stripeSessionId || processing}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: paymentLink?.stripeSessionId ? '#F25C05' : '#d1d5db',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 700,
            cursor: paymentLink?.stripeSessionId ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
        >
          {processing ? (
            <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <CreditCard size={20} />
          )}
          {processing ? 'A processar...' : 'Pagar com Stripe'}
        </button>

        <p style={{ 
          textAlign: 'center', 
          fontSize: '12px', 
          color: '#9ca3af', 
          marginTop: '16px' 
        }}>
          Pagamento seguro via Stripe. Aceitamos cartões Visa, Mastercard e outros.
        </p>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '8px', 
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <a 
            href={`/c/${paymentLink?.clienteId}`}
            style={{ color: '#666', fontSize: '14px', textDecoration: 'none' }}
          >
            Voltar à minha área
          </a>
        </div>

        <style>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}