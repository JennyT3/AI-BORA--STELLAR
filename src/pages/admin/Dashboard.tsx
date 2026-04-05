import { FileText, Users, Check, Plus, DollarSign, ArrowRight, TrendingUp, Clock, FolderOpen } from "lucide-react";
import { theme } from "../../styles/theme";
import { getStatusColorDashboard, getStatusLabelDashboard, getProposalStatusBadge } from "../../utils/labels";

interface DashboardProps {
  stats: { total: number; enviadas: number; respondidas: number; aceitas: number; reagendadas: number };
  proposals: any[];
  solicitudes: any[];
  clientes: any[];
  onExport: () => void;
  onNovoOrcamento: () => void;
  onNovoCliente: () => void;
  onNovaFatura: () => void;
  onNavigate: (tab: string) => void;
}

export function Dashboard({ stats, proposals, solicitudes, clientes, onExport, onNovoOrcamento, onNovoCliente, onNovaFatura, onNavigate }: DashboardProps) {
  const clientesAtivos = clientes.filter(c => c.categoria === "cliente").length;
  const propostasAceitas = stats.aceitas;
  const respostaRate = stats.total > 0 ? Math.round((stats.respondidas / stats.total) * 100) : 0;
  const aceitaRate = stats.respondidas > 0 ? Math.round((stats.aceitas / stats.respondidas) * 100) : 0;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: theme.fontFamily.sans, fontSize: 32, fontWeight: 900, color: theme.colors.text.primary, marginBottom: 8 }}>Dashboard</h1>
          <p style={{ color: theme.colors.text.secondary, fontSize: 14 }}>Resumo da tua atividade</p>
        </div>
        <button onClick={onExport} style={{ padding: "12px 20px", borderRadius: 10, backgroundColor: theme.colors.accent.primary, color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
          <FileText size={18} /> Exportar
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 32 }}>
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8", borderLeft: `4px solid ${theme.colors.accent.primary}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: theme.colors.text.secondary, fontWeight: 600 }}>PROPOSTAS</span>
            <FileText size={16} color={theme.colors.accent.primary} />
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, color: theme.colors.text.primary }}>{stats.total}</div>
          <div style={{ fontSize: 11, color: theme.colors.text.secondary, marginTop: 4 }}>{stats.enviadas} enviadas</div>
        </div>
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8", borderLeft: "4px solid #3498DB" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: theme.colors.text.secondary, fontWeight: 600 }}>RESPONDIDAS</span>
            <TrendingUp size={16} color="#3498DB" />
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, color: "#3498DB" }}>{stats.respondidas}</div>
          <div style={{ fontSize: 11, color: theme.colors.text.secondary, marginTop: 4 }}>{respostaRate}% resposta</div>
        </div>
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8", borderLeft: "4px solid #10B981" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: theme.colors.text.secondary, fontWeight: 600 }}>ACEITES</span>
            <Check size={16} color="#10B981" />
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, color: "#10B981" }}>{stats.aceitas}</div>
          <div style={{ fontSize: 11, color: theme.colors.text.secondary, marginTop: 4 }}>{aceitaRate}% aceitação</div>
        </div>
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8", borderLeft: "4px solid #F22283" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: theme.colors.text.secondary, fontWeight: 600 }}>CLIENTES</span>
            <Users size={16} color="#F22283" />
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, color: "#F22283" }}>{clientesAtivos}</div>
          <div style={{ fontSize: 11, color: theme.colors.text.secondary, marginTop: 4 }}>{clientes.filter(c => c.categoria === "potencial").length} potenciais</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
        <button onClick={onNovoOrcamento} style={{ padding: 20, borderRadius: 16, background: "linear-gradient(135deg, #F25C05 0%, #F22283 100%)", color: "#fff", border: "none", cursor: "pointer", textAlign: "center", boxShadow: "0 4px 15px rgba(242,92,5,0.3)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <Plus size={24} />
          <div style={{ fontWeight: 700, fontSize: 13 }}>Novo Orçamento</div>
        </button>
        <button onClick={onNovoCliente} style={{ padding: 20, borderRadius: 16, backgroundColor: theme.colors.bg.secondary, color: theme.colors.text.primary, border: `2px solid ${theme.colors.border}`, cursor: "pointer", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <Users size={24} color={theme.colors.accent.primary} />
          <div style={{ fontWeight: 700, fontSize: 13 }}>Novo Cliente</div>
        </button>
        <button onClick={onNovaFatura} style={{ padding: 20, borderRadius: 16, backgroundColor: theme.colors.bg.secondary, color: theme.colors.text.primary, border: `2px solid ${theme.colors.border}`, cursor: "pointer", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <DollarSign size={24} color={theme.colors.status.success} />
          <div style={{ fontWeight: 700, fontSize: 13 }}>Nova Fatura</div>
        </button>
        <button onClick={() => onNavigate("faturacao")} style={{ padding: 20, borderRadius: 16, backgroundColor: theme.colors.bg.secondary, color: theme.colors.text.primary, border: `2px solid ${theme.colors.border}`, cursor: "pointer", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <FolderOpen size={24} color={theme.colors.text.tertiary} />
          <div style={{ fontWeight: 700, fontSize: 13 }}>Faturação</div>
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: theme.colors.text.primary, fontFamily: theme.fontFamily.sans }}>Solicitações Recentes</h3>
            <button onClick={() => onNavigate("solicitacoes")} style={{ fontSize: 12, color: theme.colors.accent.primary, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Ver todas →</button>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {solicitudes.slice(0, 5).map(s => (
              <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", backgroundColor: "#fafafa", borderRadius: 10, border: "1px solid #f0f0f0" }}>
                <div>
                  <div style={{ fontWeight: 700, color: theme.colors.text.primary, fontSize: 14 }}>{s.nome}</div>
                  <div style={{ fontSize: 11, color: theme.colors.text.secondary, marginTop: 2 }}>{s.telefone} · {new Date(s.createdAt).toLocaleDateString("pt-PT")}</div>
                </div>
                <span style={{ fontSize: 10, padding: "4px 10px", borderRadius: 20, backgroundColor: getStatusColorDashboard(s.status) + "15", color: getStatusColorDashboard(s.status), fontWeight: 600 }}>
                  {getStatusLabelDashboard(s.status)}
                </span>
              </div>
            ))}
            {solicitudes.length === 0 && (
              <div style={{ textAlign: "center", padding: 20, color: theme.colors.text.secondary }}>
                <Clock size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
                <div>Nenhuma solicitação ainda</div>
              </div>
            )}
          </div>
        </div>

        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: theme.colors.text.primary, fontFamily: theme.fontFamily.sans }}>Propostas Recentes</h3>
            <button onClick={() => onNavigate("propostas")} style={{ fontSize: 12, color: theme.colors.accent.primary, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Ver todas →</button>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {proposals.slice(0, 5).map(p => {
              const badge = getProposalStatusBadge(p);
              return (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", backgroundColor: "#F5F2F0", borderRadius: 12, border: "1px solid #e8e4df" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: theme.colors.accent.primary, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>
                      {p.cliente?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: theme.colors.text.primary, fontSize: 13 }}>{p.cliente}</div>
                      <div style={{ fontSize: 10, color: theme.colors.text.secondary, marginTop: 2 }}>{p.numeroOrcamento} · {new Date(p.createdAt).toLocaleDateString("pt-PT")}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 800, color: "#F22283", fontSize: 16 }}>{p.valor?.toFixed(2)} €</div>
                    </div>
                    <span style={{ fontSize: 10, padding: "4px 8px", borderRadius: 4, backgroundColor: badge.color, color: badge.textColor, fontWeight: 600 }}>
                      {badge.text}
                    </span>
                  </div>
                </div>
              );
            })}
            {proposals.length === 0 && (
              <div style={{ textAlign: "center", padding: 20, color: theme.colors.text.secondary }}>
                <FileText size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
                <div>Nenhuma proposta ainda</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}