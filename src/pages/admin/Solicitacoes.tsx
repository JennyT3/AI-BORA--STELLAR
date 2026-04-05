import { theme } from "../../styles/theme";

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
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div><h1 style={{ fontFamily: "Montserrat, sans-serif", fontSize: 28, fontWeight: 900, color: theme.colors.text.primary, marginBottom: 8 }}>Solicitações</h1><p style={{ color: theme.colors.text.secondary, fontSize: 14 }}>{solicitudes.filter(s => s.status === "pendente").length} pendentes</p></div>
        <button onClick={onRefresh} style={{ padding: "12px 20px", borderRadius: 10, backgroundColor: "#ffffff", color: "#666", border: "1px solid #e0e0e0", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Atualizar</button>
      </div>

      {/* Contactos Section */}
      {contactos.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 18, color: theme.colors.text.primary }}>Contactos do Website</span>
            <span style={{ fontSize: 11, padding: "6px 12px", borderRadius: 20, backgroundColor: "#EDE9FE", color: "#7C3AED", fontWeight: 600 }}>{contactos.length}</span>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {contactos.map((c) => (
              <div key={c.id} style={{ backgroundColor: "#FAF5FF", borderRadius: 12, padding: 16, border: "1px solid #E9D5FF" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
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
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 18, color: theme.colors.text.primary }}>Orçamentos do Simulador</span>
          <span style={{ fontSize: 11, padding: "6px 12px", borderRadius: 20, backgroundColor: "#E0F2FE", color: "#0284C7", fontWeight: 600 }}>{solicitudes.length}</span>
        </div>
      </div>
      
      {loading ? <div style={{ textAlign: "center", padding: 60, color: theme.colors.text.secondary }}>A carregar...</div> : solicitudes.length === 0 ? <div style={{ textAlign: "center", padding: 60, color: theme.colors.text.secondary, backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e8e8e8" }}>Nenhuma solicitação ainda.</div> : (
        <div style={{ display: "grid", gap: 16 }}>
          {solicitudes.map((s) => (
            <div key={s.id} style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}><span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 18, color: theme.colors.text.primary }}>{s.nome}</span><span style={{ fontSize: 11, padding: "6px 12px", borderRadius: 20, backgroundColor: s.status === "pendente" ? "#FFF5F0" : "#E8F5E9", color: s.status === "pendente" ? theme.colors.accent.primary : "#10B981", fontWeight: 600 }}>{s.status === "pendente" ? "Pendente" : s.status === "em-analise" ? "Em Análise" : "Convertida"}</span></div>
                  <div style={{ fontSize: 14, color: "#666", marginBottom: 12 }}>{s.telefone} {s.empresa && `| ${s.empresa}`} {s.email && `| ${s.email}`}</div>
                  <div style={{ fontSize: 12, color: theme.colors.text.secondary, marginBottom: 12 }}>{new Date(s.createdAt).toLocaleDateString("pt-PT")}</div>
                  {s.servicos && s.servicos.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{s.servicos.slice(0, 4).map((serv: string, i: number) => <span key={i} style={{ fontSize: 11, backgroundColor: "#f5f5f5", padding: "6px 12px", borderRadius: 20, color: "#666", fontWeight: 500 }}>{serv}</span>)}</div>}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button onClick={() => onCriarProposta(s.id)} style={{ padding: "10px 16px", borderRadius: 8, background: `linear-gradient(135deg, ${theme.colors.accent.primary} 0%, #F22283 100%)`, color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 15px rgba(242,34,131,0.2)" }}>Criar Proposta</button>
                  <button onClick={() => onCriarCliente(s)} style={{ padding: "10px 16px", borderRadius: 8, backgroundColor: "#E8F4FD", color: "#3498DB", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Criar Cliente</button>
                  <button onClick={() => onUpdateStatus(s.id, "em-analise")} style={{ padding: "10px 16px", borderRadius: 8, backgroundColor: s.status === "em-analise" ? "#FFF5F0" : "#f5f5f5", color: s.status === "em-analise" ? theme.colors.accent.primary : "#666", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Análise</button>
                  <button onClick={() => onUpdateStatus(s.id, "proposta-enviada")} style={{ padding: "10px 16px", borderRadius: 8, backgroundColor: s.status === "proposta-enviada" ? "#E8F5E9" : "#f5f5f5", color: s.status === "proposta-enviada" ? "#10B981" : "#666", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Convertida</button>
                  <button onClick={() => onDelete(s.id)} style={{ padding: "10px 16px", borderRadius: 8, backgroundColor: "#FEE2E2", color: "#dc2626", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>X</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}