import { useState, useEffect } from "react";
import { DollarSign, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { theme } from "../../styles/theme";

interface FaturacaoProps {
  clientes: any[];
  onCriarFatura: (cliente: any) => void;
  onNavigateClientes: () => void;
}

export function Faturacao({ clientes, onCriarFatura, onNavigateClientes }: FaturacaoProps) {
  const [isMobile, setIsMobile] = useState(false);
  const clientesAtivos = clientes.filter(c => c.categoria === "cliente");
  const totalFaturado = clientesAtivos.reduce((sum, c) => sum + (c.propostaValor || 0), 0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: theme.fontFamily.sans, fontSize: isMobile ? 24 : 28, fontWeight: 900, color: theme.colors.text.primary, marginBottom: 8 }}>Faturação</h1>
          <p style={{ color: theme.colors.text.secondary, fontSize: 14 }}>Gestão de faturas e pagamentos</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)", gap: isMobile ? 12 : 20, marginBottom: isMobile ? 20 : 32 }}>
        <div style={{ backgroundColor: "#ffffff", borderRadius: isMobile ? 12 : 16, padding: isMobile ? 16 : 24, border: `1px solid ${theme.colors.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <DollarSign size={20} color="#10B981" />
            </div>
            <span style={{ fontSize: 12, color: theme.colors.text.secondary, fontWeight: 600 }}>Total Faturado</span>
          </div>
          <div style={{ fontSize: isMobile ? 24 : 32, fontWeight: 900, color: "#10B981" }}>{totalFaturado.toFixed(2)} €</div>
          <div style={{ fontSize: 11, color: theme.colors.text.secondary, marginTop: 4 }}>Este ano</div>
        </div>

        <div style={{ backgroundColor: "#ffffff", borderRadius: isMobile ? 12 : 16, padding: isMobile ? 16 : 24, border: `1px solid ${theme.colors.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "rgba(52, 152, 219, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle size={20} color="#3498DB" />
            </div>
            <span style={{ fontSize: 12, color: theme.colors.text.secondary, fontWeight: 600 }}>Faturas Pagas</span>
          </div>
          <div style={{ fontSize: isMobile ? 24 : 32, fontWeight: 900, color: "#3498DB" }}>0</div>
          <div style={{ fontSize: 11, color: theme.colors.text.secondary, marginTop: 4 }}>Este mês</div>
        </div>

        <div style={{ backgroundColor: "#ffffff", borderRadius: isMobile ? 12 : 16, padding: isMobile ? 16 : 24, border: `1px solid ${theme.colors.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "rgba(242, 92, 5, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Clock size={20} color={theme.colors.accent.primary} />
            </div>
            <span style={{ fontSize: 12, color: theme.colors.text.secondary, fontWeight: 600 }}>Faturas Pendentes</span>
          </div>
          <div style={{ fontSize: isMobile ? 24 : 32, fontWeight: 900, color: theme.colors.accent.primary }}>{clientesAtivos.length}</div>
          <div style={{ fontSize: 11, color: theme.colors.text.secondary, marginTop: 4 }}>Por cobrar</div>
        </div>

        <div style={{ backgroundColor: "#ffffff", borderRadius: isMobile ? 12 : 16, padding: isMobile ? 16 : 24, border: `1px solid ${theme.colors.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "rgba(242, 34, 131, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertCircle size={20} color="#F22283" />
            </div>
            <span style={{ fontSize: 12, color: theme.colors.text.secondary, fontWeight: 600 }}>IVA a Pagar</span>
          </div>
          <div style={{ fontSize: isMobile ? 24 : 32, fontWeight: 900, color: "#F22283" }}>{(totalFaturado * 0.23).toFixed(2)} €</div>
          <div style={{ fontSize: 11, color: theme.colors.text.secondary, marginTop: 4 }}>23% do total</div>
        </div>
      </div>

      <div style={{ backgroundColor: "#ffffff", borderRadius: isMobile ? 12 : 16, padding: isMobile ? 16 : 24, border: `1px solid ${theme.colors.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <h3 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: theme.colors.text.primary, fontFamily: theme.fontFamily.sans }}>Clientes para Faturar</h3>
          <button onClick={onNavigateClientes} style={{ fontSize: 12, color: theme.colors.accent.primary, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Ver todos os clientes →</button>
        </div>

        {clientesAtivos.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: theme.colors.text.secondary }}>
            <FileText size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
            <div>Nenhum cliente ativo para faturar</div>
            <button onClick={onNavigateClientes} style={{ marginTop: 12, padding: "14px 20px", borderRadius: 8, backgroundColor: theme.colors.accent.primary, color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", minHeight: 44 }}>
              Ver Clientes
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {clientesAtivos.slice(0, 10).map(c => (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: isMobile ? 12 : "16px 20px", backgroundColor: "#fafafa", borderRadius: isMobile ? 12 : 12, border: `1px solid ${theme.colors.border}`, flexDirection: isMobile ? "column" : "row", gap: isMobile ? 12 : 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: theme.colors.accent.primary, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                    {c.nome?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: theme.colors.text.primary, fontSize: 15 }}>{c.nome}</div>
                    <div style={{ fontSize: 12, color: theme.colors.text.secondary, marginTop: 2 }}>{c.email || "Sem email"}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 12 : 16, width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
                  <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                    <div style={{ fontWeight: 800, color: theme.colors.accent.primary, fontSize: isMobile ? 16 : 18 }}>{c.propostaValor?.toFixed(2) || "0.00"} €</div>
                    {c.propostaNumero && <div style={{ fontSize: 10, color: theme.colors.text.secondary }}>{c.propostaNumero}</div>}
                  </div>
                  <button onClick={() => onCriarFatura(c)} style={{ padding: "12px 16px", borderRadius: 8, backgroundColor: theme.colors.accent.primary, color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", minHeight: 44 }}>
                    Criar Fatura
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
