import React from 'react';

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

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ backgroundColor: "#fff", borderRadius: 16, padding: 24, maxWidth: 500, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "theme.colors.text.primary", marginBottom: 20 }}>Editar Cliente</h3>
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
            <div style={{ position: "relative" }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Nome</label>
              <input type="text" value={clienteFormData.nome} onChange={(e) => { onFieldChange('nome', e.target.value); onClienteSearchChange(e.target.value); }} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "2px solid #e0e0e0", fontSize: 14 }} />
              {showClienteSuggestions && clienteSearch.length > 0 && clientes.filter(c => c.nome?.toLowerCase().includes(clienteSearch.toLowerCase())).length > 0 && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 100, maxHeight: 180, overflow: "auto" }}>
                  {clientes.filter(c => c.nome?.toLowerCase().includes(clienteSearch.toLowerCase())).slice(0, 5).map(c => (
                    <div key={c.id} onClick={() => { onSuggestionSelect(c); }} style={{ padding: "10px 12px", cursor: "pointer", borderBottom: "1px solid #f0f0f0", fontSize: 13 }} onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f5f5f5"} onMouseLeave={e => e.currentTarget.style.backgroundColor = "#fff"}>
                      <div style={{ fontWeight: 600 }}>{c.nome}</div>
                      <div style={{ fontSize: 11, color: "theme.colors.text.secondary" }}>{c.email} | {c.telemovel}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Origem</label>
              <select value={clienteFormData.origem || ""} onChange={(e) => onFieldChange('origem', e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "2px solid #e0e0e0", fontSize: 14 }}>
                <option value="">Selecionar...</option>
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="TikTok">TikTok</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Google">Google</option>
                <option value="Recomendado">Recomendado</option>
                <option value="Website">Website</option>
                <option value="Formulario">Formulário</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Email</label>
              <input type="email" value={clienteFormData.email} onChange={(e) => onFieldChange('email', e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "2px solid #e0e0e0", fontSize: 14 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Telemóvel</label>
              <input type="tel" value={clienteFormData.telemovel} onChange={(e) => onFieldChange('telemovel', e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "2px solid #e0e0e0", fontSize: 14 }} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>NIF</label>
              <input type="text" value={clienteFormData.nif} onChange={(e) => onFieldChange('nif', e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "2px solid #e0e0e0", fontSize: 14 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Categoria</label>
              <select value={clienteFormData.categoria} onChange={(e) => onFieldChange('categoria', e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "2px solid #e0e0e0", fontSize: 14 }}>
                <option value="curioso">Curioso</option>
                <option value="potencial">Potencial</option>
                <option value="proposta_enviada">Proposta Enviada</option>
                <option value="cliente">Cliente</option>
                <option value="sem_interesse">Sem Interesse</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Morada</label>
            <input type="text" value={clienteFormData.morada} onChange={(e) => onFieldChange('morada', e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "2px solid #e0e0e0", fontSize: 14 }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Website</label>
            <input type="text" value={clienteFormData.website || ""} onChange={(e) => onFieldChange('website', e.target.value)} placeholder="https://..." style={{ width: "100%", padding: "10px", borderRadius: 8, border: "2px solid #e0e0e0", fontSize: 14 }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Observações</label>
            <textarea value={clienteFormData.observacoes} onChange={(e) => onFieldChange('observacoes', e.target.value)} rows={3} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "2px solid #e0e0e0", fontSize: 14 }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <button onClick={onSave} style={{ flex: 1, padding: "12px", borderRadius: 8, backgroundColor: "theme.colors.accent.primary", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}>Guardar Cliente</button>
          <button onClick={onClose} style={{ flex: 1, padding: "12px", borderRadius: 8, backgroundColor: "#f5f5f5", color: "#666", border: "none", fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
