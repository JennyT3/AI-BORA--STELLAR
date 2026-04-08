import { useState, useEffect, FormEvent } from "react";
import { theme } from "../styles/theme";
import { loginVendedor, resetPassword, AuthResult } from "../services/authService";
import { createSessionToken, saveSession } from "../lib/auth";

interface Vendedor {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  comissaoPercent?: number;
  ativo?: boolean;
  fotoPerfil?: string;
}

interface VendasLoginProps {
  onLogin: (vendedor: Vendedor) => void;
}

export function VendasLogin({ onLogin }: VendasLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  // Auto-login quando vem ?v=vendedorId desde admin (legacy - manter compatibilidade)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vendedorId = params.get("v");
    if (vendedorId) {
      // Este método usa ID direto - legacy, mas manter para backwards compatibility
      // Novo fluxo deve usar authService
    }
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    
    setError("");
    setLoading(true);

    try {
      const result = await loginVendedor(email, password);
      
      if (!result.success) {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        
        if (newAttempts >= 5) {
          setIsLocked(true);
          setError("Demasiadas tentativas. Tente novamente em 30 segundos.");
          setTimeout(() => {
            setIsLocked(false);
            setLoginAttempts(0);
            setError("");
          }, 30000);
        } else {
          setError(result.error || "Utilizador ou password incorretos.");
        }
        setLoading(false);
        return;
      }

      // Login bem-sucedido - criar token JWT (NUNCA guardar password!)
      if (result.vendedor) {
        const token = createSessionToken({
          id: result.vendedor.id,
          nome: result.vendedor.nome,
          email: result.vendedor.email || '',
          role: 'vendedor'
        });
        
        saveSession(token);
        onLogin(result.vendedor);
      }
    } catch (err: any) {
      setError("Erro ao fazer login. Tente novamente.");
      console.error('Login error:', err);
    }
    
    setLoading(false);
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) return;
    
    setLoading(true);
    const result = await resetPassword(forgotPasswordEmail);
    
    if (result.success) {
      setResetSent(true);
    } else {
      setError(result.error || "Erro ao enviar email de recuperação");
    }
    setLoading(false);
  };

  // Renderização do formulário de recuperação de password
  if (showForgotPassword) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.bg.primary }}>
        <div style={{ width: "100%", maxWidth: 400, padding: 20 }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h1 style={{ fontFamily: theme.fontFamily.sans, fontSize: 32, fontWeight: 900, color: theme.colors.text.primary, marginBottom: 8 }}>
              Recuperar <span style={{ color: "#F22283" }}>Password</span>
            </h1>
            <p style={{ color: theme.colors.text.secondary, fontSize: 14 }}>
              {resetSent 
                ? "Enviámos um email com instruções para redefinir a sua password."
                : "Introduza o seu email para receber instruções de recuperação."}
            </p>
          </div>

          {!resetSent && (
            <div style={{ backgroundColor: "#ffffff", borderRadius: 20, padding: 32, boxShadow: "0 4px 30px rgba(0,0,0,0.1)" }}>
              <form onSubmit={handleForgotPassword}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 8 }}>Email</label>
                  <input 
                    type="email" 
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: `2px solid ${theme.colors.border}`, fontSize: 14, backgroundColor: theme.colors.bg.secondary }}
                  />
                </div>

                {error && (
                  <div style={{ padding: "12px 16px", borderRadius: 10, backgroundColor: "#fee2e2", color: "#dc2626", fontSize: 13, marginBottom: 16, fontWeight: 500 }}>
                    {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  style={{ width: "100%", padding: "16px", borderRadius: 12, background: "linear-gradient(135deg, #F25C05 0%, #F22283 100%)", color: "#ffffff", border: "none", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? "A enviar..." : "Enviar Email de Recuperação"}
                </button>
              </form>
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: 24 }}>
            <button 
              onClick={() => { setShowForgotPassword(false); setResetSent(false); setError(""); }}
              style={{ background: "none", border: "none", fontSize: 12, color: theme.colors.text.tertiary, cursor: "pointer", textDecoration: "none" }}
            >
              ← Voltar ao login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Renderização normal - formulário de login
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.bg.primary }}>
      <div style={{ width: "100%", maxWidth: 400, padding: 20 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontFamily: theme.fontFamily.sans, fontSize: 36, fontWeight: 900, color: theme.colors.text.primary, marginBottom: 8 }}>
            AI BORA <span style={{ color: "#F22283" }}>Vendas</span>
          </h1>
          <p style={{ color: theme.colors.text.secondary, fontSize: 14 }}>Área do vendedor</p>
        </div>

        <div style={{ backgroundColor: "#ffffff", borderRadius: 20, padding: 32, boxShadow: "0 4px 30px rgba(0,0,0,0.1)" }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 8 }}>Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: `2px solid ${theme.colors.border}`, fontSize: 14, backgroundColor: theme.colors.bg.secondary }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 8 }}>Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: `2px solid ${theme.colors.border}`, fontSize: 14, backgroundColor: theme.colors.bg.secondary }}
              />
            </div>

            {error && (
              <div style={{ padding: "12px 16px", borderRadius: 10, backgroundColor: "#fee2e2", color: "#dc2626", fontSize: 13, marginBottom: 16, fontWeight: 500 }}>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              style={{ width: "100%", padding: "16px", borderRadius: 12, background: "linear-gradient(135deg, #F25C05 0%, #F22283 100%)", color: "#ffffff", border: "none", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "A entrar..." : "Entrar"}
            </button>
          </form>

          <div style={{ marginTop: 16, textAlign: "center" }}>
            <button 
              onClick={() => setShowForgotPassword(true)}
              style={{ background: "none", border: "none", fontSize: 13, color: theme.colors.text.tertiary, cursor: "pointer", textDecoration: "none" }}
            >
              Esqueceu a password?
            </button>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <a href="/admin" style={{ fontSize: 12, color: theme.colors.text.tertiary, textDecoration: "none" }}>
            ← Voltar ao painel Admin
          </a>
        </div>
      </div>
    </div>
  );
}