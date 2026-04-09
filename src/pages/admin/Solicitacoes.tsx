import { theme } from "../../styles/theme";
import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

interface SolicitacoesProps {
  solicitudes: any[];
  contactos: any[];
  loading: boolean;
  onRefresh: () => void;
  onCriarProposta: (id: string) => void;
  onCriarCliente: (s: any) => void;
  onUpdateStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  vendedores?: any[];
}

const STATUS_OPTIONS = [
  { value: "pendente", label: "Pending", color: "#FEF3C7", text: "#D97706" },
  { value: "em-analise", label: "Under review", color: "#DBEAFE", text: "#1D4ED8" },
  { value: "contactado", label: "Contacted", color: "#E0E7FF", text: "#4338CA" },
  { value: "proposta-enviada", label: "Proposal sent", color: "#E8F5E9", text: "#10B981" },
  { value: "convertido", label: "Converted", color: "#DCFCE7", text: "#16A34A" },
  { value: "descartado", label: "Discarded", color: "#FEE2E2", text: "#DC2626" },
];

const ORIGEN_OPTIONS = [
  { value: "all", label: "All sources" },
  { value: "Simulador", label: "Simulator" },
  { value: "Colabora Connosco", label: "Partnership form" },
  { value: "WhatsApp", label: "WhatsApp" },
  { value: "Website", label: "Website" },
  { value: "Contacto Directo", label: "Direct contact" },
];

export function Solicitacoes({ solicitudes, contactos, loading, onRefresh, onCriarProposta, onCriarCliente, onUpdateStatus, onDelete, vendedores = [] }: SolicitacoesProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterOrigem, setFilterOrigem] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const filteredSolicitudes = solicitudes.filter(s => {
    const matchesSearch = !searchTerm || 
      s.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.telefone?.includes(searchTerm) ||
      s.empresa?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || s.status === filterStatus;
    const matchesOrigem = filterOrigem === "all" || s.origem === filterOrigem;
    return matchesSearch && matchesStatus && matchesOrigem;
  });

  const filteredContactos = contactos.filter(c => {
    const matchesSearch = !searchTerm || 
      c.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.telemovel?.includes(searchTerm);
    return matchesSearch;
  });

  const getStatusStyle = (status: string) => {
    const opt = STATUS_OPTIONS.find(o => o.value === status);
    return opt || STATUS_OPTIONS[0];
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "Montserrat, sans-serif", fontSize: isMobile ? 24 : 28, fontWeight: 900, color: theme.colors.text.primary, marginBottom: 8 }}>Enquiries</h1>
          <p style={{ color: theme.colors.text.secondary, fontSize: 14 }}>{solicitudes.filter(s => s.status === "pendente").length} pending · {filteredSolicitudes.length} total</p>
        </div>
        <button onClick={onRefresh} style={{ padding: "12px 20px", borderRadius: 10, backgroundColor: "#ffffff", color: "#666", border: `1px solid ${theme.colors.border}`, fontWeight: 600, cursor: "pointer", fontSize: 13, minHeight: 44 }}>Refresh</button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 200px", minWidth: 200 }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#999" }} />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: 8, border: `1px solid ${theme.colors.border}`, fontSize: 13, fontFamily: "Montserrat, sans-serif", backgroundColor: "#fff" }}
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: "10px 12px", borderRadius: 8, border: `1px solid ${theme.colors.border}`, fontSize: 13, fontFamily: "Montserrat, sans-serif", backgroundColor: "#fff", minWidth: 140 }}
        >
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={filterOrigem}
          onChange={e => setFilterOrigem(e.target.value)}
          style={{ padding: "10px 12px", borderRadius: 8, border: `1px solid ${theme.colors.border}`, fontSize: 13, fontFamily: "Montserrat, sans-serif", backgroundColor: "#fff", minWidth: 140 }}
        >
          {ORIGEN_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Contactos Section */}
      {contactos.length > 0 && (
        <div style={{ marginBottom: isMobile ? 24 : 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: isMobile ? 16 : 18, color: theme.colors.text.primary }}>Website contacts</span>
            <span style={{ fontSize: 11, padding: "6px 12px", borderRadius: 20, backgroundColor: "#EDE9FE", color: "#7C3AED", fontWeight: 600 }}>{filteredContactos.length}</span>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {filteredContactos.map((c) => (
              <div key={c.id} style={{ backgroundColor: "#FAF5FF", borderRadius: isMobile ? 12 : 16, padding: isMobile ? 12 : 16, border: "1px solid #E9D5FF" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 14, color: theme.colors.text.primary }}>{c.nome}</span>
                      {c.status === "pendente" && <span style={{ fontSize: 10, padding: "4px 8px", borderRadius: 12, backgroundColor: "#FEF3C7", color: "#D97706", fontWeight: 600 }}>Pending</span>}
                      <span style={{ fontSize: 10, padding: "4px 8px", borderRadius: 12, backgroundColor: "#E0E7FF", color: "#4338CA", fontWeight: 600 }}>{c.origem || "Website"}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>{c.telemovel} {c.email && `| ${c.email}`}</div>
                    <div style={{ fontSize: 11, color: "#999", marginBottom: 4 }}>{c.negocio}</div>
                    {c.mensagem && <div style={{ fontSize: 12, color: theme.colors.text.secondary, fontStyle: "italic", marginTop: 6 }}>"{c.mensagem}"</div>}
                    <div style={{ fontSize: 11, color: "#999", marginTop: 6 }}>{c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-GB") : ''}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => onCriarCliente(c)} style={{ padding: "10px 14px", borderRadius: 8, backgroundColor: "#E8F4FD", color: "#3498DB", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", minHeight: 44 }}>Create client</button>
                    <button onClick={() => onDelete(c.id)} style={{ padding: "10px 14px", borderRadius: 8, backgroundColor: "#FEE2E2", color: "#dc2626", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", minHeight: 44 }}>X</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Requests section */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: isMobile ? 16 : 18, color: theme.colors.text.primary }}>Simulator quotes</span>
          <span style={{ fontSize: 11, padding: "6px 12px", borderRadius: 20, backgroundColor: "#E0F2FE", color: "#0284C7", fontWeight: 600 }}>{filteredSolicitudes.length}</span>
        </div>
      </div>
      
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: theme.colors.text.secondary }}>Loading...</div>
      ) : filteredSolicitudes.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: theme.colors.text.secondary, backgroundColor: "#ffffff", borderRadius: 16, border: `1px solid ${theme.colors.border}` }}>No enquiries found.</div>
      ) : (
        <div style={{ display: "grid", gap: isMobile ? 12 : 16 }}>
          {filteredSolicitudes.map((s) => {
            const statusStyle = getStatusStyle(s.status || "pendente");
            const isExpanded = expandedId === s.id;
            return (
              <div key={s.id} style={{ backgroundColor: "#ffffff", borderRadius: isMobile ? 12 : 16, padding: isMobile ? 16 : 24, border: `1px solid ${theme.colors.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: isMobile ? 12 : 24, flexDirection: isMobile ? "column" : "row" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: isMobile ? 16 : 18, color: theme.colors.text.primary }}>{s.nome}</span>
                      <span style={{ fontSize: 11, padding: "6px 12px", borderRadius: 20, backgroundColor: statusStyle.color, color: statusStyle.text, fontWeight: 600 }}>{statusStyle.label}</span>
                      {s.origem && <span style={{ fontSize: 10, padding: "4px 8px", borderRadius: 12, backgroundColor: "#F3F4F6", color: "#666", fontWeight: 600 }}>{s.origem}</span>}
                      {s.vendedorId && (
                        <span style={{ fontSize: 10, padding: "4px 8px", borderRadius: 12, backgroundColor: "#ECFDF5", color: "#059669", fontWeight: 600 }}>
                          V: {vendedores.find(v => v.id === s.vendedorId)?.nome || s.vendedorId.slice(0, 8)}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>{s.telefone} {s.empresa && `| ${s.empresa}`} {s.email && `| ${s.email}`}</div>
                    <div style={{ fontSize: 12, color: theme.colors.text.secondary, marginBottom: 12 }}>{new Date(s.createdAt).toLocaleDateString("en-GB")}</div>
                    {s.servicos && s.servicos.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {s.servicos.slice(0, 4).map((serv: string, i: number) => (
                          <span key={i} style={{ fontSize: 11, backgroundColor: "#f5f5f5", padding: "6px 12px", borderRadius: 20, color: "#666", fontWeight: 500 }}>{serv}</span>
                        ))}
                        {s.servicos.length > 4 && <span style={{ fontSize: 11, color: "#999" }}>+{s.servicos.length - 4}</span>}
                      </div>
                    )}
                    {s.observacoes && (
                      <button 
                        onClick={() => setExpandedId(isExpanded ? null : s.id)}
                        style={{ fontSize: 11, color: "#666", background: "none", border: "none", cursor: "pointer", marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}
                      >
                        {isExpanded ? "Hide" : "Show"} notes {isExpanded ? "▲" : "▼"}
                      </button>
                    )}
                    {isExpanded && s.observacoes && (
                      <div style={{ marginTop: 12, padding: 12, backgroundColor: "#F9FAFB", borderRadius: 8, fontSize: 12, color: "#666", whiteSpace: "pre-wrap" }}>{s.observacoes}</div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: isMobile ? 12 : 0 }}>
                    <button onClick={() => onCriarProposta(s.id)} style={{ padding: "12px 16px", borderRadius: 8, backgroundColor: "#FFF7ED", color: "#F25C05", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", minHeight: 44 }}>Create proposal</button>
                    <button onClick={() => onCriarCliente(s)} style={{ padding: "12px 16px", borderRadius: 8, backgroundColor: "#E8F4FD", color: "#3498DB", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", minHeight: 44 }}>Create client</button>
                    <button onClick={() => onDelete(s.id)} style={{ padding: "12px 16px", borderRadius: 8, backgroundColor: "#FEE2E2", color: "#dc2626", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", minHeight: 44 }}>X</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
