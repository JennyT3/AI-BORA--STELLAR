import { useState, useEffect } from "react";
import { theme } from "../../styles/theme";
import { listVendedores, createVendedor, updateVendedor, deleteVendedor, importarClientesParaVendedor, Vendedor } from "../../services/vendedores";
import { Users, Plus, Trash2, Edit, UserPlus, Upload } from "lucide-react";

interface VendoresAdminProps {
  onNavigateVendas: (vendedorId: string) => void;
}

export function VendoresAdmin({ onNavigateVendas }: VendoresAdminProps) {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVendedor, setEditingVendedor] = useState<Vendedor | null>(null);
  const [formData, setFormData] = useState({ nome: "", email: "", telefone: "", password: "", comissaoPercent: 20, ativo: true });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    loadVendedores();
  }, []);

  const loadVendedores = async () => {
    setLoading(true);
    try {
      const data = await listVendedores();
      setVendedores(data);
    } catch (err) {
      console.error("Error:", err);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.email || !formData.password) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      if (editingVendedor) {
        await updateVendedor(editingVendedor.id, formData);
      } else {
        await createVendedor(formData);
      }
      await loadVendedores();
      setShowForm(false);
      setEditingVendedor(null);
      setFormData({ nome: "", email: "", telefone: "", password: "", comissaoPercent: 20, ativo: true });
    } catch (err) {
      alert("Erro ao guardar");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Eliminar vendedor?")) {
      await deleteVendedor(id);
      loadVendedores();
    }
  };

  const handleImportClientes = async (vendedorId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const text = event.target?.result as string;
          const lines = text.split('\n');
          const headers = lines[0].split(',').map((h: string) => h.trim().toLowerCase());
          const clientesData: any[] = [];

          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            const values = lines[i].split(',').map((v: string) => v.trim().replace(/"/g, ''));
            const obj: any = {};
            headers.forEach((h: string, idx: number) => {
              if (values[idx]) obj[h] = values[idx];
            });
            if (obj.nome) clientesData.push(obj);
          }

          const result = await importarClientesParaVendedor(vendedorId, clientesData);
          alert(`Importados ${result.sucesso} clientes. ${result.erros.length > 0 ? 'Erros: ' + result.erros.join(', ') : ''}`);
          loadVendedores();
        } catch (err) {
          alert("Erro ao importar: " + err);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: theme.fontFamily.sans, fontSize: isMobile ? 24 : 28, fontWeight: 900, color: theme.colors.text.primary, marginBottom: 8 }}>Vendedores</h1>
          <p style={{ color: theme.colors.text.secondary, fontSize: 14 }}>Gestão de vendedores e equipes de vendas</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingVendedor(null); setFormData({ nome: "", email: "", telefone: "", password: "", comissaoPercent: 20, ativo: true }); }} style={{ padding: "12px 20px", borderRadius: 10, backgroundColor: theme.colors.accent.primary, color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 8, minHeight: 44 }}>
          <Plus size={18} /> Novo Vendedor
        </button>
      </div>

      {showForm && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: isMobile ? 12 : 16, padding: isMobile ? 16 : 24, border: `1px solid ${theme.colors.border}`, marginBottom: isMobile ? 16 : 24 }}>
          <h3 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, marginBottom: 16 }}>{editingVendedor ? "Editar Vendedor" : "Novo Vendedor"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 6 }}>Nome *</label>
              <input value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} style={{ width: "100%", padding: "12px", borderRadius: 8, border: `2px solid ${theme.colors.border}`, fontSize: 13, minHeight: 44, outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 6 }}>Email *</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ width: "100%", padding: "12px", borderRadius: 8, border: `2px solid ${theme.colors.border}`, fontSize: 13, minHeight: 44, outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 6 }}>Telefone</label>
              <input value={formData.telefone} onChange={(e) => setFormData({...formData, telefone: e.target.value})} style={{ width: "100%", padding: "12px", borderRadius: 8, border: `2px solid ${theme.colors.border}`, fontSize: 13, minHeight: 44, outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 6 }}>Password *</label>
              <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} style={{ width: "100%", padding: "12px", borderRadius: 8, border: `2px solid ${theme.colors.border}`, fontSize: 13, minHeight: 44, outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 6 }}>Comissão (%)</label>
              <input type="number" value={formData.comissaoPercent} onChange={(e) => setFormData({...formData, comissaoPercent: parseInt(e.target.value)})} style={{ width: "100%", padding: "12px", borderRadius: 8, border: `2px solid ${theme.colors.border}`, fontSize: 13, minHeight: 44, outline: 'none' }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: isMobile ? 0 : 28 }}>
              <input type="checkbox" checked={formData.ativo} onChange={(e) => setFormData({...formData, ativo: e.target.checked})} style={{ width: 20, height: 20 }} />
              <span style={{ fontSize: 13 }}>Ativo</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
            <button onClick={handleSave} style={{ padding: "14px 20px", borderRadius: 8, backgroundColor: theme.colors.accent.primary, color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", minHeight: 44 }}>Guardar</button>
            <button onClick={() => { setShowForm(false); setEditingVendedor(null); }} style={{ padding: "14px 20px", borderRadius: 8, backgroundColor: theme.colors.bg.secondary, color: theme.colors.text.primary, border: `1px solid ${theme.colors.border}`, fontWeight: 600, cursor: "pointer", minHeight: 44 }}>Cancelar</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gap: isMobile ? 12 : 16 }}>
        {vendedores.map((v) => (
          <div key={v.id} style={{ backgroundColor: "#ffffff", borderRadius: isMobile ? 12 : 16, padding: isMobile ? 16 : 24, border: `1px solid ${theme.colors.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexDirection: isMobile ? "column" : "row" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
                <div style={{ width: 50, height: 50, borderRadius: "50%", backgroundColor: v.ativo ? theme.colors.accent.primary : "#ccc", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
                  {v.nome?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: theme.colors.text.primary }}>{v.nome}</div>
                  <div style={{ fontSize: 12, color: theme.colors.text.secondary }}>{v.email}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, padding: "6px 12px", borderRadius: 20, backgroundColor: v.ativo ? "#dcfce7" : "#fee2e2", color: v.ativo ? "#16a34a" : "#dc2626", fontWeight: 600 }}>
                  {v.ativo ? "Ativo" : "Inativo"}
                </span>
                <span style={{ fontSize: 12, color: theme.colors.text.secondary }}>
                  {v.comissaoPercent}% comissão
                </span>
                <span style={{ fontSize: 12, color: theme.colors.text.secondary }}>
                  {v.clientesIds?.length || 0} clientes
                </span>
                <button onClick={() => onNavigateVendas(v.id)} style={{ padding: "12px 16px", borderRadius: 8, backgroundColor: "#3498DB", color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", minHeight: 44 }}>
                  Acessar
                </button>
                <button onClick={() => { setShowForm(true); setEditingVendedor(v); setFormData({ nome: v.nome, email: v.email, telefone: v.telefone || "", password: v.password, comissaoPercent: v.comissaoPercent, ativo: v.ativo }); }} style={{ padding: "12px", borderRadius: 8, backgroundColor: "#f3f4f6", border: "none", cursor: "pointer", minHeight: 44, minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Edit size={16} color="#666" />
                </button>
                <button onClick={() => handleDelete(v.id)} style={{ padding: "12px", borderRadius: 8, backgroundColor: "#fee2e2", border: "none", cursor: "pointer", minHeight: 44, minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trash2 size={16} color="#dc2626" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {vendedores.length === 0 && !loading && (
          <div style={{ textAlign: "center", padding: 60, backgroundColor: "#ffffff", borderRadius: 16, color: theme.colors.text.secondary }}>
            <Users size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
            <div style={{ fontSize: 16, marginBottom: 8 }}>Nenhum vendedor criado</div>
            <div style={{ fontSize: 13 }}>Crie um vendedor para começar</div>
          </div>
        )}
      </div>
    </div>
  );
}
