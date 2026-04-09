import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Mail, ArrowRight, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { validarMagicLink, usarMagicLink, getClienteLoginByToken } from '../services/clienteAuth';
import { getCliente } from '../services/clientes';

export default function ClienteLoginPage() {
  const [match, params] = useRoute('/cliente/login/:token');
  const [, setLocation] = useLocation();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (match && params?.token) {
      handleTokenLogin(params.token);
    }
  }, [match, params]);

  const handleTokenLogin = async (token: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await validarMagicLink(token);
      
      if (!result) {
        setError('Link expirado ou inválido. Solicite um novo link.');
        setLoading(false);
        return;
      }
      
      const loginData = await getClienteLoginByToken(token);
      if (loginData) {
        await usarMagicLink(loginData.id);
      }
      
      setLocation(`/c/${result.clienteId}?logged=true`);
    } catch (err) {
      console.error('Login error:', err);
      setError('Erro ao fazer login. Tente novamente.');
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    
    setSending(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/cliente/magic-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput })
      });
      
      if (response.ok) {
        setMagicLinkSent(true);
      } else {
        setError('Email não encontrado. Contacte-nos para obter acesso.');
      }
    } catch (err) {
      setError('Erro ao enviar link. Tente novamente.');
    } finally {
      setSending(false);
    }
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
          <p style={{ marginTop: '16px', color: '#666' }}>A verificar acesso...</p>
        </div>
        <style>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (error && !match) {
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
            Erro de Acesso
          </h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>{error}</p>
          <a 
            href="/"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#F25C05',
              color: '#fff',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            Voltar à página inicial
          </a>
        </div>
      </div>
    );
  }

  if (magicLinkSent) {
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
          <CheckCircle size={48} color="#10b981" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1b1c1b', marginBottom: '12px' }}>
            Link Enviado!
          </h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            Enviámos um link de acesso ao seu email. Clique no link para aceder à sua área de cliente.
          </p>
          <p style={{ color: '#888', fontSize: '14px' }}>
            O link é válido por 24 horas.
          </p>
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
        maxWidth: '420px',
        width: '100%',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#1b1c1b', marginBottom: '8px' }}>
            Área do Cliente
          </h1>
          <p style={{ color: '#666' }}>
            Aceda à sua ficha pessoal e histórico de serviços
          </p>
        </div>

        <form onSubmit={handleEmailSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '13px', 
              fontWeight: 700, 
              color: '#374151', 
              marginBottom: '8px' 
            }}>
              Email associado à sua conta
            </label>
            <div style={{ position: 'relative' }}>
              <Mail 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '14px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#9ca3af'
                }} 
              />
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="seu@email.pt"
                required
                style={{
                  width: '100%',
                  padding: '14px 14px 14px 44px',
                  border: '1px solid #d1d5db',
                  borderRadius: '10px',
                  fontSize: '15px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={sending || !emailInput.trim()}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: emailInput.trim() && !sending ? '#F25C05' : '#d1d5db',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: emailInput.trim() && !sending ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {sending ? (
              <>
                <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                A enviar...
              </>
            ) : (
              <>
                Enviar link de acesso
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p style={{ 
          textAlign: 'center', 
          fontSize: '13px', 
          color: '#9ca3af', 
          marginTop: '20px' 
        }}>
          Ou contacte-nos para obter acesso
        </p>

        <style>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}