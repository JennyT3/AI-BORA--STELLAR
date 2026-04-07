import { useState, useEffect, FormEvent } from "react";
import { theme } from "../styles/theme";
import { getVendedorByEmail, getVendedor, Vendedor } from "../services/vendedores";

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

  // Auto-login cuando viene ?v=vendedorId desde admin
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vendedorId = params.get("v");
    if (vendedorId) {
      autoLoginWithId(vendedorId);
    }
  }, []);

  const autoLoginWithId = async (vendedorId: string) => {
    setLoading(true);
    try {
      const vendedor = await getVendedor(vendedorId);
      if (vendedor && vendedor.ativo) {
        onLogin(vendedor);
      } else {
        setError("Vendedor não encontrado ou inativo.");
      }
    } catch {
      setError("Erro ao aceder ao painel.");
    }
    setLoading(false);
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    
    setError("");
    setLoading(true);

    try {
      const vendedor = await getVendedorByEmail(email);
      
      // Usar mensaje genérico para no revelar si el email existe
      if (!vendedor || vendedor.password !== password) {
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
          setError("Utilizador ou password incorretos.");
        }
        setLoading(false);
        return;
      }

      if (!vendedor.ativo) {
        setError("Utilizador inativo. Contacte o administrador.");
        setLoading(false);
        return;
      }

      // Login successful - save to localStorage
      localStorage.setItem("vendedorUser", JSON.stringify(vendedor));
      onLogin(vendedor);
    } catch (err: any) {
      setError("Erro ao fazer login. Tente novamente.");
    }
    
    setLoading(false);
  };

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