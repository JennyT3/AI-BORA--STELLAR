import { useState, useEffect } from "react";
import { theme } from "../../styles/theme";
import { listVendedores, createVendedor, updateVendedor, deleteVendedor, Vendedor } from "../../services/vendedores";
import { Users, Plus, Trash2, Edit, UserPlus, Search, Filter, Calendar, Download, MoreVertical, TrendingUp, Target, Zap, X } from "lucide-react";

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
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
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
      console.error("Erro ao carregar vendedores:", err);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.email || !formData.password) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setIsSaving(true);
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
      alert("Ocorreu um erro ao guardar os dados.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem a certeza que deseja eliminar este vendedor?")) {
      await deleteVendedor(id);
      loadVendedores();
    }
  };

  const filteredVendedores = vendedores.filter(v => 
    v.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {/* Page Header Section */}
      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "flex-end", justifyContent: "space-between", gap: 24, marginBottom: 48 }}>
        <div>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#F25C05', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>
            Enterprise CRM
          </span>
          <h1 style={{ fontSize: isMobile ? 32 : 48, fontWeight: 900, color: '#1b1c1b', letterSpacing: '-1.5px', lineHeight: 1 }}>
            Gestão de Vendedores
          </h1>
          <p style={{ color: '#5a4137', marginTop: 12, maxWidth: 500, fontSize: 15, lineHeight: 1.6 }}>
            Otimize a sua força de vendas com métricas em tempo real e monitorização de performance individual.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, width: isMobile ? "100%" : "auto" }}>
          <button style={{ flex: 1, padding: "14px 24px", borderRadius: 16, backgroundColor: "#fff", color: "#1b1c1b", border: "1px solid rgba(0,0,0,0.05)", fontWeight: 700, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <Download size={18} /> Exportar
          </button>
          <button 
            onClick={() => { setShowForm(true); setEditingVendedor(null); setFormData({ nome: "", email: "", telefone: "", password: "", comissaoPercent: 20, ativo: true }); }}
            style={{ flex: 1, padding: "14px 24px", borderRadius: 16, background: "linear-gradient(135deg, #F25C05 0%, #F22283 100%)", color: "#fff", border: "none", fontWeight: 800, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: '0 10px 25px rgba(242,92,5,0.2)' }}
          >
            <UserPlus size={18} strokeWidth={3} /> Novo Vendedor
          </button>
        </div>
      </div>

      {/* Search & Filters Bento Bar */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(12, 1fr)", gap: 16, marginBottom: 32 }}>
        <div style={{ gridColumn: isMobile ? "span 1" : "span 7", backgroundColor: "#fff", borderRadius: 20, padding: "4px 16px", display: "flex", alignItems: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.02)" }}>
          <Search size={18} color="#8e7165" />
          <input 
            placeholder="Procurar por nome, e-mail ou região..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%", border: "none", padding: "14px", fontSize: 14, fontWeight: 500, outline: "none", color: "#1b1c1b" }} 
          />
        </div>
        <div style={{ gridColumn: isMobile ? "span 1" : "span 2", backgroundColor: "#fff", borderRadius: 20, padding: "4px 16px", display: "flex", alignItems: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.02)" }}>
          <Filter size={18} color="#8e7165" />
          <select style={{ width: "100%", border: "none", padding: "14px", fontSize: 13, fontWeight: 700, outline: "none", color: "#5a4137", background: "transparent" }}>
            <option>Status: Todos</option>
            <option>Ativos</option>
            <option>Inativos</option>
          </select>
        </div>
        <div style={{ gridColumn: isMobile ? "span 1" : "span 3", backgroundColor: "#fff", borderRadius: 20, padding: "4px 16px", display: "flex", alignItems: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.02)" }}>
          <Calendar size={18} color="#8e7165" />
          <select style={{ width: "100%", border: "none", padding: "14px", fontSize: 13, fontWeight: 700, outline: "none", color: "#5a4137", background: "transparent" }}>
            <option>Este Mês</option>
            <option>Último Trimestre</option>
            <option>Ano Inteiro</option>
          </select>
        </div>
      </div>

      {/* Form Modal / Section */}
      {showForm && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 32, border: "1px solid rgba(242, 92, 5, 0.1)", marginBottom: 32, boxShadow: "0 20px 40px rgba(242, 92, 5, 0.05)" }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1b1c1b' }}>{editingVendedor ? "Editar Vendedor" : "Registar Novo Vendedor"}</h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#8e7165' }}><X size={24} /></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 20 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: '#8e7165', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Nome Completo *</label>
              <input value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "2px solid #f0edeb", fontSize: 14, fontWeight: 600, outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: '#8e7165', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>E-mail Profissional *</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "2px solid #f0edeb", fontSize: 14, fontWeight: 600, outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: '#8e7165', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Telemóvel</label>
              <input value={formData.telefone} onChange={(e) => setFormData({...formData, telefone: e.target.value})} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "2px solid #f0edeb", fontSize: 14, fontWeight: 600, outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: '#8e7165', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Palavra-passe *</label>
              <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "2px solid #f0edeb", fontSize: 14, fontWeight: 600, outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: '#8e7165', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Comissão (%)</label>
              <input type="number" value={formData.comissaoPercent} onChange={(e) => setFormData({...formData, comissaoPercent: parseInt(e.target.value)})} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "2px solid #f0edeb", fontSize: 14, fontWeight: 600, outline: 'none' }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: isMobile ? 0 : 24 }}>
              <input type="checkbox" checked={formData.ativo} onChange={(e) => setFormData({...formData, ativo: e.target.checked})} style={{ width: 20, height: 20, accentColor: '#F25C05' }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1b1c1b' }}>Vendedor Ativo</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              style={{ padding: "16px 32px", borderRadius: 16, backgroundColor: isSaving ? "#ccc" : "#F25C05", color: "#fff", border: "none", fontWeight: 800, cursor: isSaving ? "not-allowed" : "pointer", boxShadow: '0 8px 20px rgba(242, 92, 5, 0.2)' }}
            >
              {isSaving ? "A guardar..." : "Guardar Vendedor"}
            </button>
            <button onClick={() => { setShowForm(false); setEditingVendedor(null); }} style={{ padding: "16px 32px", borderRadius: 16, backgroundColor: "#f6f3f1", color: "#5a4137", border: "none", fontWeight: 700, cursor: "pointer" }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Vendor List (Editorial Card Design) */}
      <div style={{ display: "grid", gap: 16 }}>
        {filteredVendedores.map((v) => (
          <div key={v.id} style={{ position: 'relative', backgroundColor: "#fff", borderRadius: 24, padding: 24, display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: "center", gap: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.02)", overflow: 'hidden', transition: 'all 0.3s ease' }}>
            {/* Status Accent Bar */}
            <div style={{ position: 'absolute', left: 0, top: 16, bottom: 16, width: 6, backgroundColor: v.ativo ? "#10B981" : "#ba1a1a", borderRadius: '0 4px 4px 0' }}></div>
            
            <div style={{ display: "flex", alignItems: "center", gap: 20, flex: 1, width: '100%' }}>
              <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
                <div style={{ width: '100%', height: '100%', borderRadius: 16, background: 'linear-gradient(135deg, #f6f3f1 0%, #f0edeb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, color: '#F25C05' }}>
                  {v.nome?.charAt(0).toUpperCase()}
                </div>
                <div style={{ position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, backgroundColor: v.ativo ? "#10B981" : "#ba1a1a", border: "3px solid #fff", borderRadius: "50%" }}></div>
              </div>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1b1c1b", marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.nome}</h3>
                <p style={{ fontSize: 13, color: "#8e7165", fontWeight: 600 }}>{v.email}</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: isMobile ? 16 : 40, width: isMobile ? "100%" : "auto", minWidth: isMobile ? "100%" : 400 }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: '#8e7165', textTransform: 'uppercase', marginBottom: 4 }}>Comissão</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#1b1c1b' }}>{v.comissaoPercent}%</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: '#8e7165', textTransform: 'uppercase', marginBottom: 4 }}>Clientes</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#1b1c1b' }}>{v.clientesIds?.length || 0}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: '#8e7165', textTransform: 'uppercase', marginBottom: 4 }}>Status</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: v.ativo ? "#10B981" : "#ba1a1a" }}>{v.ativo ? "ATIVO" : "INATIVO"}</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, width: isMobile ? "100%" : "auto" }}>
              <button onClick={() => onNavigateVendas(v.id)} style={{ flex: 1, padding: "12px 20px", borderRadius: 12, backgroundColor: "#1b1c1b", color: "#fff", border: "none", fontSize: 12, fontWeight: 800, cursor: "pointer", transition: 'all 0.2s' }}>
                Aceder Painel
              </button>
              <button onClick={() => { setShowForm(true); setEditingVendedor(v); setFormData({ nome: v.nome, email: v.email, telefone: v.telefone || "", password: v.password, comissaoPercent: v.comissaoPercent, ativo: v.ativo }); }} style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#f6f3f1", border: "none", cursor: "pointer", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Edit size={18} color="#5a4137" />
              </button>
              <button onClick={() => handleDelete(v.id)} style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(186, 26, 26, 0.05)", border: "none", cursor: "pointer", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={18} color="#ba1a1a" />
              </button>
            </div>
          </div>
        ))}
        
        {filteredVendedores.length === 0 && !loading && (
          <div style={{ textAlign: "center", padding: 80, backgroundColor: "#fff", borderRadius: 24, border: "1px solid rgba(0,0,0,0.02)" }}>
            <Users size={48} color="#f0edeb" style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1b1c1b", marginBottom: 8 }}>Nenhum vendedor encontrado</h3>
            <p style={{ color: "#8e7165", fontSize: 14 }}>Tente ajustar a sua pesquisa o crie um novo vendedor.</p>
          </div>
        )}
      </div>
    </div>
  );
}
