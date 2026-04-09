import { theme } from "../../styles/theme";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Users, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { listTodasSolicitacoesDelegacao, aprovarDelegacao, rejeitarDelegacao, SolicitacaoDelegacao } from "../../services/delegacao";

interface DelegacoesAdminProps {
  onNavigate?: (tab: string) => void;
}

export function DelegacoesAdmin({ onNavigate }: DelegacoesAdminProps) {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoDelegacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadSolicitacoes();
  }, []);

  const loadSolicitacoes = async () => {
    try {
      const data = await listTodasSolicitacoesDelegacao();
      setSolicitacoes(data);
    } catch (error) {
      console.error("Error loading delegation requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSolicitacoes = solicitacoes.filter(s => 
    filterStatus === "all" || s.status === filterStatus
  );

  const handleAprovar = async (solicitacao: SolicitacaoDelegacao) => {
    setProcessingId(solicitacao.id);
    try {
      await aprobarDelegacao(solicitacao.id, "admin");
      await loadSolicitacoes();
    } catch (error) {
      console.error("Error approving delegation:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejeitar = async (solicitacao: SolicitacaoDelegacao) => {
    const motivo = prompt("Rejection reason (optional):");
    setProcessingId(solicitacao.id);
    try {
      await rejeitarDelegacao(solicitacao.id, "admin", motivo || "Rejected by administrator");
      await loadSolicitacoes();
    } catch (error) {
      console.error("Error rejecting delegation:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; color: string; icon: any }> = {
      pendente: { bg: "#FEF3C7", color: "#D97706", icon: Clock },
      aprovada: { bg: "#D1FAE5", color: "#059669", icon: CheckCircle },
      rejeitada: { bg: "#FEE2E2", color: "#DC2626", icon: XCircle },
    };
    const style = styles[status] || styles.pendente;
    const Icon = style.icon;
    return (
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "4px 10px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: 700,
        backgroundColor: style.bg,
        color: style.color,
      }}>
        <Icon size={12} />
        {status === "pendente" ? "Pending" : status === "aprovada" ? "Approved" : "Rejected"}
      </span>
    );
  };

  const formatDate = (data: any) => {
    if (!data) return "—";
    if (data.toDate) return data.toDate().toLocaleDateString("en-GB");
    return new Date(data).toLocaleDateString("en-GB");
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ color: theme.colors.textSecondary }}>Loading…</div>
      </div>
    );
  }

  const pendentes = solicitacoes.filter(s => s.status === "pendente").length;

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#1b1c1b", margin: "0 0 8px 0", fontFamily: "Montserrat, sans-serif" }}>
          Delegation requests
        </h1>
        <p style={{ fontSize: "14px", color: theme.colors.textSecondary, margin: 0 }}>
          Review requests to delegate clients between sales reps
        </p>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        {["all", "pendente", "aprovada", "rejeitada"].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              backgroundColor: filterStatus === status ? theme.colors.brand : "#f3f4f6",
              color: filterStatus === status ? "#fff" : "#4b5563",
            }}
          >
            {status === "all" ? "All" : status === "pendente" ? `Pending (${pendentes})` : status === "aprovada" ? "Approved" : "Rejected"}
          </button>
        ))}
      </div>

      {filteredSolicitacoes.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: "60px 20px",
          backgroundColor: "#f9fafb",
          borderRadius: "12px"
        }}>
          <Users size={48} color="#9ca3af" style={{ marginBottom: "16px" }} />
          <p style={{ fontSize: "16px", color: "#6b7280", margin: 0 }}>
            No requests found
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredSolicitacoes.map(solicitacao => (
            <div
              key={solicitacao.id}
              style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                overflow: "hidden",
              }}
            >
              <div style={{
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#1b1c1b" }}>
                      {solicitacao.vendedorSolicitanteNome || "Sales rep"}
                    </div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                      {solicitacao.totalClientes} client{solicitacao.totalClientes !== 1 ? "s" : ""} • {formatDate(solicitacao.dataSolicitacao)}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {getStatusBadge(solicitacao.status)}
                  <button
                    onClick={() => setExpandedId(expandedId === solicitacao.id ? null : solicitacao.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "1px solid #e5e7eb",
                      backgroundColor: "#fff",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#4b5563",
                      cursor: "pointer",
                    }}
                  >
                    <Eye size={14} />
                    {expandedId === solicitacao.id ? "Hide" : "View"} {solicitacao.totalClientes}
                  </button>
                </div>
              </div>

              {solicitacao.status === "pendente" && (
                <div style={{
                  padding: "12px 20px",
                  backgroundColor: "#f9fafb",
                  borderTop: "1px solid #e5e7eb",
                  display: "flex",
                  gap: "12px",
                }}>
                  <button
                    onClick={() => handleAprovar(solicitacao)}
                    disabled={processingId === solicitacao.id}
                    style={{
                      flex: 1,
                      padding: "10px 16px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: "#10b981",
                      color: "#fff",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: processingId === solicitacao.id ? "not-allowed" : "pointer",
                      opacity: processingId === solicitacao.id ? 0.7 : 1,
                    }}
                  >
                    ✅ Approve all
                  </button>
                  <button
                    onClick={() => handleRejeitar(solicitacao)}
                    disabled={processingId === solicitacao.id}
                    style={{
                      flex: 1,
                      padding: "10px 16px",
                      borderRadius: "8px",
                      border: "1px solid #dc2626",
                      backgroundColor: "#fff",
                      color: "#dc2626",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: processingId === solicitacao.id ? "not-allowed" : "pointer",
                      opacity: processingId === solicitacao.id ? 0.7 : 1,
                    }}
                  >
                    ❌ Reject
                  </button>
                </div>
              )}

              {expandedId === solicitacao.id && (
                <div style={{
                  padding: "16px 20px",
                  backgroundColor: "#f9fafb",
                  borderTop: "1px solid #e5e7eb",
                }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <th style={{ textAlign: "left", padding: "8px", fontSize: "11px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>Name</th>
                        <th style={{ textAlign: "left", padding: "8px", fontSize: "11px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>NIF</th>
                        <th style={{ textAlign: "left", padding: "8px", fontSize: "11px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {solicitacao.clientesSolicitados.map((cliente, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid #f3f4f6" }}>
                          <td style={{ padding: "8px", fontSize: "13px", color: "#1b1c1b" }}>{cliente.clienteNome}</td>
                          <td style={{ padding: "8px", fontSize: "13px", color: "#6b7280" }}>{cliente.nif || "—"}</td>
                          <td style={{ padding: "8px", fontSize: "13px", color: "#6b7280" }}>{cliente.email || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {solicitacao.status === "rejeitada" && solicitacao.motivoRejeicao && (
                    <div style={{ marginTop: "12px", padding: "12px", backgroundColor: "#fef2f2", borderRadius: "8px", fontSize: "13px", color: "#991b1b" }}>
                      <strong>Reason:</strong> {solicitacao.motivoRejeicao}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}