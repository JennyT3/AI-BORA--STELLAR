import { useState, FormEvent } from "react";
import { theme } from "../styles/theme";
import { getVendedorByEmail, Vendedor } from "../services/vendedores";

interface VendasLoginProps {
  onLogin: (vendedor: Vendedor) => void;
}

export function VendasLogin({ onLogin }: VendasLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const vendedor = await getVendedorByEmail(email);
      
      if (!vendedor) {
        setError("Utilizador não encontrado");
        setLoading(false);
        return;
      }

      if (!vendedor.ativo) {
        setError("Utilizador inativo. Contacte o administrador.");
        setLoading(false);
        return;
      }

      if (vendedor.password !== password) {
        setError("Password incorreta");
        setLoading(false);
        return;
      }

      // Login successful - save to localStorage
      localStorage.setItem("vendedorUser", JSON.stringify(vendedor));
      onLogin(vendedor);
    } catch (err: any) {
      setError("Erro ao fazer login: " + err.message);
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