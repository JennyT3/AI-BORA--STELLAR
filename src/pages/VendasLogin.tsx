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

  // Auto-login when opening with ?v=vendedorId from admin
  useEffect(() => {
    const autoLogin = async () => {
      const params = new URLSearchParams(window.location.search);
      const vendedorId = params.get("v");
      const isAdmin = params.get("admin") === "true";
      
      if (vendedorId && isAdmin) {
        setLoading(true);
        try {
          // Dynamic import to avoid circular dependencies
          const { getVendedor } = await import("../services/vendedores");
          const vendedorData = await getVendedor(vendedorId);
          
          if (vendedorData && vendedorData.ativo) {
            const token = createSessionToken({
              id: vendedorData.id,
              nome: vendedorData.nome,
              email: vendedorData.email || '',
              role: 'vendedor'
            });
            
            saveSession(token);
            onLogin(vendedorData);
          } else {
            setError("Sales rep not found or inactive.");
          }
        } catch (err) {
          console.error("Auto-login error:", err);
          setError("Could not open the sales dashboard.");
        }
        setLoading(false);
      }
    };
    
    autoLogin();
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
          setError("Too many attempts. Please try again in 30 seconds.");
          setTimeout(() => {
            setIsLocked(false);
            setLoginAttempts(0);
            setError("");
          }, 30000);
        } else {
          setError(result.error || "Incorrect email or password.");
        }
        setLoading(false);
        return;
      }

      // Successful login — create JWT (never store password)
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
      setError("Could not sign in. Please try again.");
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
      setError(result.error || "Could not send recovery email");
    }
    setLoading(false);
  };

  // Password recovery form
  if (showForgotPassword) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.bg.primary }}>
        <div style={{ width: "100%", maxWidth: 400, padding: 20 }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h1 style={{ fontFamily: theme.fontFamily.sans, fontSize: 32, fontWeight: 900, color: theme.colors.text.primary, marginBottom: 8 }}>
              Reset <span style={{ color: "#F22283" }}>password</span>
            </h1>
            <p style={{ color: theme.colors.text.secondary, fontSize: 14 }}>
              {resetSent 
                ? "We sent an email with instructions to reset your password."
                : "Enter your email to receive recovery instructions."}
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
                    placeholder="you@example.com"
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
                  {loading ? "Sending..." : "Send recovery email"}
                </button>
              </form>
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: 24 }}>
            <button 
              onClick={() => { setShowForgotPassword(false); setResetSent(false); setError(""); }}
              style={{ background: "none", border: "none", fontSize: 12, color: theme.colors.text.tertiary, cursor: "pointer", textDecoration: "none" }}
            >
              ← Back to sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Standard sign-in form
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.bg.primary }}>
      <div style={{ width: "100%", maxWidth: 400, padding: 20 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontFamily: theme.fontFamily.sans, fontSize: 36, fontWeight: 900, color: theme.colors.text.primary, marginBottom: 8 }}>
            AI BORA <span style={{ color: "#F22283" }}>Vendas</span>
          </h1>
          <p style={{ color: theme.colors.text.secondary, fontSize: 14 }}>Sales area</p>
        </div>

        <div style={{ backgroundColor: "#ffffff", borderRadius: 20, padding: 32, boxShadow: "0 4px 30px rgba(0,0,0,0.1)" }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 8 }}>Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
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
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div style={{ marginTop: 16, textAlign: "center" }}>
            <button 
              onClick={() => setShowForgotPassword(true)}
              style={{ background: "none", border: "none", fontSize: 13, color: theme.colors.text.tertiary, cursor: "pointer", textDecoration: "none" }}
            >
              Forgot your password?
            </button>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <a href="/admin" style={{ fontSize: 12, color: theme.colors.text.tertiary, textDecoration: "none" }}>
            ← Back to admin
          </a>
        </div>
      </div>
    </div>
  );
}