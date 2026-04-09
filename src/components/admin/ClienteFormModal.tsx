import { useState, useEffect } from "react";
import { Save, X, User, Building, MapPin, Tag, MessageSquare, FileText } from "lucide-react";
import { listVendedoresAtivos } from "../../services/vendedores";

export interface ClienteFormModalProps {
  clienteFormData: any;
  clientes: any[];
  clienteSearch: string;
  showClienteSuggestions: boolean;
  onClienteSearchChange: (val: string) => void;
  onSuggestionSelect: (cliente: any) => void;
  onFieldChange: (field: string, value: any) => void;
  onSave: () => void;
  onClose: () => void;
}

const sectionStyle = { marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #f0edeb" };
const sectionTitleStyle = { fontSize: 11, fontWeight: 900, color: "#F25C05", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 };
const labelStyle = { fontSize: 10, fontWeight: 800, color: "#8e7165", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 };
const inputStyle = { width: "100%", padding: "12px 14px", borderRadius: 10, border: "2px solid #f0edeb", fontSize: 13, fontWeight: 600, color: "#1b1c1b", outline: "none", transition: "border-color 0.2s" };
const selectStyle = { width: "100%", padding: "12px 14px", borderRadius: 10, border: "2px solid #f0edeb", fontSize: 13, fontWeight: 600, color: "#1b1c1b", outline: "none", appearance: "none", background: "#fff url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%238e7165%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E') no-repeat right 12px center/16px", backgroundSize: 16 };

export function ClienteFormModal(props: ClienteFormModalProps) {
  const {
    clienteFormData,
    clientes,
    clienteSearch,
    showClienteSuggestions,
    onClienteSearchChange,
    onSuggestionSelect,
    onFieldChange,
    onSave,
    onClose
  } = props;

  const [vendedoresLista, setVendedoresLista] = useState<any[]>([]);
  const isEditing = !!clienteFormData?.id || !!clienteFormData.createdAt;

  useEffect(() => {
    listVendedoresAtivos().then(setVendedoresLista).catch(console.error);
  }, []);

  const hasDocumentos = clienteFormData?.solicitacaoId || clienteFormData?.orcamentoIds?.length > 0 || clienteFormData?.propostaIds?.length > 0 || clienteFormData?.faturaIds?.length > 0;

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div style={{ backgroundColor: "#fff", borderRadius: 24, padding: 32, maxWidth: 640, width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ fontSize: 22, fontWeight: 900, color: "#1b1c1b", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #F25C05 0%, #F22283 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
              <User size={20} strokeWidth={2.5} />
            </div>
            {isEditing ? "Edit client" : "New client"}
          </h3>
          <button onClick={onClose} style={{ border: "none", background: "#f6f3f1", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#8e7165" }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: "grid", gap: 20 }}>
          
          {/* Identification */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}><User size={14} /> Identification</div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
              <div style={{ position: "relative" }}>
                <label style={labelStyle}>Full name *</label>
                <input type="text" value={clienteFormData.nome} onChange={(e) => { onFieldChange("nome", e.target.value); onClienteSearchChange(e.target.value); }} style={inputStyle} placeholder="Client name" />
                {showClienteSuggestions && clienteSearch.length > 0 && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "#fff", border: "1px solid #f0edeb", borderRadius: 10, boxShadow: "0 10px 25px rgba(0,0,0,0.1)", zIndex: 100, maxHeight: 150, overflow: "auto", marginTop: 4 }}>
                    {clientes.filter(c => c.nome?.toLowerCase().includes(clienteSearch.toLowerCase())).slice(0, 5).map(c => (
                      <div key={c.id} onClick={() => onSuggestionSelect(c)} style={{ padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid #fcf9f7", fontSize: 12 }}>{c.nome} <span style={{ color: "#8e7165" }}>| {c.email}</span></div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label style={labelStyle}>Source *</label>
                <select value={clienteFormData.origem || ""} onChange={(e) => onFieldChange("origem", e.target.value)} style={selectStyle}>
                  <option value="">Select...</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="TikTok">TikTok</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Recomendado">Referral</option>
                  <option value="Website">Website</option>
                  <option value="Formulario">Form</option>
                  <option value="Importado">Imported</option>
                  <option value="Outro">Other</option>
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
              <div>
                <label style={labelStyle}>Email</label>
                <input type="email" value={clienteFormData.email || ""} onChange={(e) => onFieldChange("email", e.target.value)} style={inputStyle} placeholder="you@example.com" />
              </div>
              <div>
                <label style={labelStyle}>Mobile</label>
                <input type="tel" value={clienteFormData.telemovel || ""} onChange={(e) => onFieldChange("telemovel", e.target.value)} style={inputStyle} placeholder="+351..." />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={labelStyle}>NIF</label>
              <input type="text" value={clienteFormData.nif || ""} onChange={(e) => onFieldChange("nif", e.target.value)} style={{ ...inputStyle, maxWidth: 200 }} placeholder="123456789" />
            </div>
          </div>

          {/* Company */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}><Building size={14} /> Company</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Company</label>
                <input type="text" value={clienteFormData.empresa || ""} onChange={(e) => onFieldChange("empresa", e.target.value)} style={inputStyle} placeholder="Company name" />
              </div>
              <div>
                <label style={labelStyle}>Website</label>
                <input type="text" value={clienteFormData.website || ""} onChange={(e) => onFieldChange("website", e.target.value)} style={inputStyle} placeholder="https://..." />
              </div>
            </div>
          </div>

          {/* Location */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}><MapPin size={14} /> Location</div>
            <div>
              <label style={labelStyle}>Address</label>
              <input type="text" value={clienteFormData.morada || ""} onChange={(e) => onFieldChange("morada", e.target.value)} style={inputStyle} placeholder="Street, number, floor..." />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
              <div>
                <label style={labelStyle}>Postal code</label>
                <input type="text" value={clienteFormData.codigoPostal || ""} onChange={(e) => onFieldChange("codigoPostal", e.target.value)} style={inputStyle} placeholder="0000-000" />
              </div>
              <div>
                <label style={labelStyle}>City</label>
                <input type="text" value={clienteFormData.cidade || ""} onChange={(e) => onFieldChange("cidade", e.target.value)} style={inputStyle} placeholder="Lisbon, Porto..." />
              </div>
            </div>
          </div>

          {/* Classification */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}><Tag size={14} /> Classification</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Category</label>
                <select value={clienteFormData.categoria || "curioso"} onChange={(e) => onFieldChange("categoria", e.target.value)} style={selectStyle}>
                  <option value="curioso">Browsing</option>
                  <option value="potencial">Lead</option>
                  <option value="proposta_enviada">Proposal sent</option>
                  <option value="cliente">Active client</option>
                  <option value="inativo">Inactive</option>
                  <option value="sem_interesse">Not interested</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Pipeline</label>
                <select value={clienteFormData.processo || "sem_processo"} onChange={(e) => onFieldChange("processo", e.target.value)} style={selectStyle}>
                  <option value="sem_processo">No process</option>
                  <option value="inicio">Started</option>
                  <option value="em_progresso">In progress</option>
                  <option value="em_revisao">In review</option>
                  <option value="aprovado">Approved</option>
                  <option value="feito">Done</option>
                  <option value="concluido">Closed</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={labelStyle}>Last contact</label>
              <input type="date" value={clienteFormData.dataUltimoContacto ? clienteFormData.dataUltimoContacto.split("T")[0] : ""} onChange={(e) => onFieldChange("dataUltimoContacto", e.target.value ? e.target.value + "T00:00:00.000Z" : "")} style={inputStyle} />
            </div>
          </div>

          {/* Notes */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}><MessageSquare size={14} /> Notes</div>
            <div>
              <label style={labelStyle}>Seller notes</label>
              <textarea value={clienteFormData.notasVendedor || ""} onChange={(e) => onFieldChange("notasVendedor", e.target.value)} rows={2} style={{ ...inputStyle, fontFamily: "inherit", resize: "vertical" }} placeholder="Internal notes..." />
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={labelStyle}>Client-visible notes</label>
              <textarea value={clienteFormData.observacoes || ""} onChange={(e) => onFieldChange("observacoes", e.target.value)} rows={2} style={{ ...inputStyle, fontFamily: "inherit", resize: "vertical" }} placeholder="Notes visible to the client..." />
            </div>
          </div>

          {/* Assignment */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}><User size={14} /> Assignment</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Sales rep</label>
                <select value={clienteFormData.vendedorId || ""} onChange={(e) => onFieldChange("vendedorId", e.target.value)} style={selectStyle}>
                  <option value="">Unassigned</option>
                  {vendedoresLista.map(v => <option key={v.id} value={v.id}>{v.nome}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Created by</label>
                <input type="text" value={clienteFormData.criadoPor || ""} onChange={(e) => onFieldChange("criadoPor", e.target.value)} style={inputStyle} placeholder="admin, import..." />
              </div>
            </div>
          </div>

          {/* Linked documents (read-only) */}
          {hasDocumentos && (
            <div style={{ backgroundColor: "#fcf9f7", borderRadius: 16, padding: 20 }}>
              <div style={sectionTitleStyle}><FileText size={14} /> Linked documents</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {clienteFormData.solicitacaoId && (
                  <span style={{ padding: "6px 12px", backgroundColor: "#fff", borderRadius: 8, fontSize: 11, fontWeight: 700, color: "#5a4137" }}>Request: {clienteFormData.solicitacaoId}</span>
                )}
                {clienteFormData.orcamentoIds?.map((id: string, i: number) => (
                  <span key={i} style={{ padding: "6px 12px", backgroundColor: "#fff", borderRadius: 8, fontSize: 11, fontWeight: 700, color: "#F25C05" }}>Quote: {id}</span>
                ))}
                {clienteFormData.propostaIds?.map((id: string, i: number) => (
                  <span key={i} style={{ padding: "6px 12px", backgroundColor: "#fff", borderRadius: 8, fontSize: 11, fontWeight: 700, color: "#10b981" }}>Proposal: {id}</span>
                ))}
                {clienteFormData.faturaIds?.map((id: string, i: number) => (
                  <span key={i} style={{ padding: "6px 12px", backgroundColor: "#fff", borderRadius: 8, fontSize: 11, fontWeight: 700, color: "#6366f1" }}>Invoice: {id}</span>
                ))}
              </div>
            </div>
          )}

        </div>
        
        <div style={{ display: "flex", gap: 16, marginTop: 32 }}>
          <button onClick={onSave} style={{ flex: 1, padding: "16px", borderRadius: 16, background: "linear-gradient(135deg, #F25C05 0%, #F22283 100%)", color: "#fff", border: "none", fontWeight: 800, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <Save size={18} />
            {isEditing ? "Save changes" : "Create client"}
          </button>
          <button onClick={onClose} style={{ flex: 1, padding: "16px", borderRadius: 16, backgroundColor: "#fcf9f7", color: "#5a4137", border: "1px solid rgba(0,0,0,0.05)", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}