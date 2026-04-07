import { Save, X, User } from 'lucide-react';

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

  const isEditing = !!clienteFormData?.id || !!clienteFormData.createdAt;

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ backgroundColor: "#fff", borderRadius: 24, padding: 32, maxWidth: 540, width: "95%", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", border: "1px solid rgba(255,255,255,0.2)" }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontSize: 24, fontWeight: 900, color: "#1b1c1b", display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #F25C05 0%, #F22283 100%)", display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <User size={20} strokeWidth={2.5} />
            </div>
            {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
          </h3>
          <button onClick={onClose} style={{ border: 'none', background: '#f6f3f1', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#8e7165', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
            <div style={{ position: "relative" }}>
              <label style={{ fontSize: 10, fontWeight: 800, color: "#8e7165", textTransform: 'uppercase', letterSpacing: 1, display: "block", marginBottom: 6 }}>Nome Completo *</label>
              <input type="text" value={clienteFormData.nome} onChange={(e) => { onFieldChange('nome', e.target.value); onClienteSearchChange(e.target.value); }} style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "2px solid #f0edeb", fontSize: 14, fontWeight: 600, color: '#1b1c1b', outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => e.currentTarget.style.borderColor = '#F25C05'} onBlur={e => e.currentTarget.style.borderColor = '#f0edeb'} />
              {showClienteSuggestions && clienteSearch.length > 0 && clientes.filter(c => c.nome?.toLowerCase().includes(clienteSearch.toLowerCase())).length > 0 && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "#fff", border: "1px solid #f0edeb", borderRadius: 12, boxShadow: "0 10px 25px rgba(0,0,0,0.1)", zIndex: 100, maxHeight: 180, overflow: "auto", marginTop: 8 }}>
                  {clientes.filter(c => c.nome?.toLowerCase().includes(clienteSearch.toLowerCase())).slice(0, 5).map(c => (
                    <div key={c.id} onClick={() => { onSuggestionSelect(c); }} style={{ padding: "12px 16px", cursor: "pointer", borderBottom: "1px solid #fcf9f7", fontSize: 13 }} onMouseEnter={e => e.currentTarget.style.backgroundColor = "#fcf9f7"} onMouseLeave={e => e.currentTarget.style.backgroundColor = "#fff"}>
                      <div style={{ fontWeight: 700, color: '#1b1c1b' }}>{c.nome}</div>
                      <div style={{ fontSize: 11, color: "#8e7165", marginTop: 4 }}>{c.email} | {c.telemovel}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 800, color: "#8e7165", textTransform: 'uppercase', letterSpacing: 1, display: "block", marginBottom: 6 }}>Origem</label>
              <select value={clienteFormData.origem || ""} onChange={(e) => onFieldChange('origem', e.target.value)} style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "2px solid #f0edeb", fontSize: 14, fontWeight: 600, color: '#1b1c1b', outline: 'none', appearance: 'none', background: '#fff', transition: 'border-color 0.2s' }} onFocus={e => e.currentTarget.style.borderColor = '#F25C05'} onBlur={e => e.currentTarget.style.borderColor = '#f0edeb'}>
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 800, color: "#8e7165", textTransform: 'uppercase', letterSpacing: 1, display: "block", marginBottom: 6 }}>E-mail</label>
              <input type="email" value={clienteFormData.email} onChange={(e) => onFieldChange('email', e.target.value)} style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "2px solid #f0edeb", fontSize: 14, fontWeight: 600, color: '#1b1c1b', outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => e.currentTarget.style.borderColor = '#F25C05'} onBlur={e => e.currentTarget.style.borderColor = '#f0edeb'} />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 800, color: "#8e7165", textTransform: 'uppercase', letterSpacing: 1, display: "block", marginBottom: 6 }}>Telemóvel</label>
              <input type="tel" value={clienteFormData.telemovel} onChange={(e) => onFieldChange('telemovel', e.target.value)} style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "2px solid #f0edeb", fontSize: 14, fontWeight: 600, color: '#1b1c1b', outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => e.currentTarget.style.borderColor = '#F25C05'} onBlur={e => e.currentTarget.style.borderColor = '#f0edeb'} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 800, color: "#8e7165", textTransform: 'uppercase', letterSpacing: 1, display: "block", marginBottom: 6 }}>NIF</label>
              <input type="text" value={clienteFormData.nif} onChange={(e) => onFieldChange('nif', e.target.value)} style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "2px solid #f0edeb", fontSize: 14, fontWeight: 600, color: '#1b1c1b', outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => e.currentTarget.style.borderColor = '#F25C05'} onBlur={e => e.currentTarget.style.borderColor = '#f0edeb'} />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 800, color: "#8e7165", textTransform: 'uppercase', letterSpacing: 1, display: "block", marginBottom: 6 }}>Categoria do Funil</label>
              <select value={clienteFormData.categoria} onChange={(e) => onFieldChange('categoria', e.target.value)} style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "2px solid #f0edeb", fontSize: 14, fontWeight: 600, color: '#1b1c1b', outline: 'none', appearance: 'none', background: '#fff', transition: 'border-color 0.2s' }} onFocus={e => e.currentTarget.style.borderColor = '#F25C05'} onBlur={e => e.currentTarget.style.borderColor = '#f0edeb'}>
                <option value="curioso">Curioso (Lead Frio)</option>
                <option value="potencial">Potencial (Lead Quente)</option>
                <option value="proposta_enviada">Proposta Enviada</option>
                <option value="cliente">Cliente Ativo</option>
                <option value="sem_interesse">Sem Interesse</option>
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 800, color: "#8e7165", textTransform: 'uppercase', letterSpacing: 1, display: "block", marginBottom: 6 }}>Morada Faturação</label>
              <input type="text" value={clienteFormData.morada} onChange={(e) => onFieldChange('morada', e.target.value)} style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "2px solid #f0edeb", fontSize: 14, fontWeight: 600, color: '#1b1c1b', outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => e.currentTarget.style.borderColor = '#F25C05'} onBlur={e => e.currentTarget.style.borderColor = '#f0edeb'} />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 800, color: "#8e7165", textTransform: 'uppercase', letterSpacing: 1, display: "block", marginBottom: 6 }}>Website</label>
              <input type="text" value={clienteFormData.website || ""} onChange={(e) => onFieldChange('website', e.target.value)} placeholder="https://..." style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "2px solid #f0edeb", fontSize: 14, fontWeight: 600, color: '#1b1c1b', outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => e.currentTarget.style.borderColor = '#F25C05'} onBlur={e => e.currentTarget.style.borderColor = '#f0edeb'} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 800, color: "#8e7165", textTransform: 'uppercase', letterSpacing: 1, display: "block", marginBottom: 6 }}>Contexto & Observações</label>
            <textarea value={clienteFormData.observacoes} onChange={(e) => onFieldChange('observacoes', e.target.value)} placeholder="Notas sobre o projeto, expectativas ou detalhes técnicos..." rows={3} style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "2px solid #f0edeb", fontSize: 14, fontWeight: 500, color: '#1b1c1b', outline: 'none', fontFamily: 'Montserrat, sans-serif', resize: 'vertical', transition: 'border-color 0.2s' }} onFocus={e => e.currentTarget.style.borderColor = '#F25C05'} onBlur={e => e.currentTarget.style.borderColor = '#f0edeb'} />
          </div>
        </div>
        
        <div style={{ display: "flex", gap: 16, marginTop: 32 }}>
          <button onClick={onSave} style={{ flex: 1, padding: "16px", borderRadius: 16, background: "linear-gradient(135deg, #F25C05 0%, #F22283 100%)", color: "#fff", border: "none", fontWeight: 800, fontSize: 15, cursor: "pointer", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: "0 10px 25px rgba(242,92,5,0.25)", transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(242,92,5,0.3)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(242,92,5,0.25)'; }}>
            <Save size={18} />
            {isEditing ? 'Guardar Alterações' : 'Criar Cliente'}
          </button>
          <button onClick={onClose} style={{ flex: 1, padding: "16px", borderRadius: 16, backgroundColor: "#fcf9f7", color: "#5a4137", border: "1px solid rgba(0,0,0,0.05)", fontWeight: 700, fontSize: 15, cursor: "pointer", transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0edeb'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fcf9f7'}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
