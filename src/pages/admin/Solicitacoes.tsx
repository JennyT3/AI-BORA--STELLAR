import { theme } from "../../styles/theme";
import { useState, useEffect } from "react";

interface SolicitacoesProps {
  solicitudes: any[];
  contactos: any[];
  loading: boolean;
  onRefresh: () => void;
  onCriarProposta: (id: string) => void;
  onCriarCliente: (s: any) => void;
  onUpdateStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

export function Solicitacoes({ solicitudes, contactos, loading, onRefresh, onCriarProposta, onCriarCliente, onUpdateStatus, onDelete }: SolicitacoesProps) {
  const [isMobile, setIsMobile] = useState(false);

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
          <h1 style={{ fontFamily: "Montserrat, sans-serif", fontSize: isMobile ? 24 : 28, fontWeight: 900, color: theme.colors.text.primary, marginBottom: 8 }}>Solicitações</h1>
          <p style={{ color: theme.colors.text.secondary, fontSize: 14 }}>{solicitudes.filter(s => s.status === "pendente").length} pendentes</p>
        </div>
        <button onClick={onRefresh} style={{ padding: "12px 20px", borderRadius: 10, backgroundColor: "#ffffff", color: "#666", border: `1px solid ${theme.colors.border}`, fontWeight: 600, cursor: "pointer", fontSize: 13, minHeight: 44 }}>Atualizar</button>
      </div>

      {/* Contactos Section */}
      {contactos.length > 0 && (
        <div style={{ marginBottom: isMobile ? 24 : 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: isMobile ? 16 : 18, color: theme.colors.text.primary }}>Contactos do Website</span>
            <span style={{ fontSize: 11, padding: "6px 12px", borderRadius: 20, backgroundColor: "#EDE9FE", color: "#7C3AED", fontWeight: 600 }}>{contactos.length}</span>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {contactos.map((c) => (
              <div key={c.id} style={{ backgroundColor: "#FAF5FF", borderRadius: isMobile ? 12 : 16, padding: isMobile ? 12 : 16, border: "1px solid #E9D5FF" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 14, color: theme.colors.text.primary }}>{c.nome}</span>
                      {c.status === "pendente" && <span style={{ fontSize: 10, padding: "4px 8px", borderRadius: 12, backgroundColor: "#FEF3C7", color: "#D97706", fontWeight: 600 }}>Pendente</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>{c.telemovel} {c.email && `| ${c.email}`}</div>
                    <div style={{ fontSize: 11, color: "#999", marginBottom: 4 }}>{c.negocio}</div>
                    {c.mensagem && <div style={{ fontSize: 12, color: theme.colors.text.secondary, fontStyle: "italic", marginTop: 6 }}>"{c.mensagem}"</div>}
                    <div style={{ fontSize: 11, color: "#999", marginTop: 6 }}>{c.createdAt ? new Date(c.createdAt).toLocaleDateString("pt-PT") : ''}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Solicitações Section */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: isMobile ? 16 : 18, color: theme.colors.text.primary }}>Orçamentos do Simulador</span>
          <span style={{ fontSize: 11, padding: "6px 12px", borderRadius: 20, backgroundColor: "#E0F2FE", color: "#0284C7", fontWeight: 600 }}>{solicitudes.length}</span>
        </div>
      </div>
      
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: theme.colors.text.secondary }}>A carregar...</div>
      ) : solicitudes.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: theme.colors.text.secondary, backgroundColor: "#ffffff", borderRadius: 16, border: `1px solid ${theme.colors.border}` }}>Nenhuma solicitação ainda.</div>
      ) : (
        <div style={{ display: "grid", gap: isMobile ? 12 : 16 }}>
          {solicitudes.map((s) => (
            <div key={s.id} style={{ backgroundColor: "#ffffff", borderRadius: isMobile ? 12 : 16, padding: isMobile ? 16 : 24, border: `1px solid ${theme.colors.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: isMobile ? 12 : 24, flexDirection: isMobile ? "column" : "row" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: isMobile ? 16 : 18, color: theme.colors.text.primary }}>{s.nome}</span>
                    <span style={{ fontSize: 11, padding: "6px 12px", borderRadius: 20, backgroundColor: s.status === "pendente" ? "#FFF5F0" : "#E8F5E9", color: s.status === "pendente" ? theme.colors.accent.primary : "#10B981", fontWeight: 600 }}>{s.status === "pendente" ? "Pendente" : s.status === "em-analise" ? "Em Análise" : "Convertida"}</span>
                  </div>
                  <div style={{ fontSize: 14, color: "#666", marginBottom: 12 }}>{s.telefone} {s.empresa && `| ${s.empresa}`} {s.email && `| ${s.email}`}</div>
                  <div style={{ fontSize: 12, color: theme.colors.text.secondary, marginBottom: 12 }}>{new Date(s.createdAt).toLocaleDateString("pt-PT")}</div>
                  {s.servicos && s.servicos.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {s.servicos.slice(0, 4).map((serv: string, i: number) => (
                        <span key={i} style={{ fontSize: 11, backgroundColor: "#f5f5f5", padding: "6px 12px", borderRadius: 20, color: "#666", fontWeight: 500 }}>{serv}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: isMobile ? 12 : 0 }}>
                  <button onClick={() => onCriarProposta(s.id)} style={{ padding: "12px 16px", borderRadius: 8, background: `linear-gradient(135deg, ${theme.colors.accent.primary} 0%, #F22283 100%)`, color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 15px rgba(242,34,131,0.2)", minHeight: 44 }}>Criar Proposta</button>
                  <button onClick={() => onCriarCliente(s)} style={{ padding: "12px 16px", borderRadius: 8, backgroundColor: "#E8F4FD", color: "#3498DB", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", minHeight: 44 }}>Criar Cliente</button>
                  <button onClick={() => onUpdateStatus(s.id, "em-analise")} style={{ padding: "12px 16px", borderRadius: 8, backgroundColor: s.status === "em-analise" ? "#FFF5F0" : "#f5f5f5", color: s.status === "em-analise" ? theme.colors.accent.primary : "#666", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", minHeight: 44 }}>Análise</button>
                  <button onClick={() => onUpdateStatus(s.id, "proposta-enviada")} style={{ padding: "12px 16px", borderRadius: 8, backgroundColor: s.status === "proposta-enviada" ? "#E8F5E9" : "#f5f5f5", color: s.status === "proposta-enviada" ? "#10B981" : "#666", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", minHeight: 44 }}>Convertida</button>
                  <button onClick={() => onDelete(s.id)} style={{ padding: "12px 16px", borderRadius: 8, backgroundColor: "#FEE2E2", color: "#dc2626", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", minHeight: 44 }}>X</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
