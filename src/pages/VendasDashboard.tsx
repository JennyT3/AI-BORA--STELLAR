import { useState, useEffect } from "react";
import { theme } from "../styles/theme";
import { VendasSidebar } from "../components/admin/VendasSidebar";
import { getStatsVendedor, updateVendedor, Vendedor } from "../services/vendedores";
import { listClientes, createCliente, listProposals } from "../services/firebase";
import { FileText, Users, DollarSign, Plus, TrendingUp } from "lucide-react";
import { VendasClientesTab } from "../components/dashboard/VendasClientesTab";
import { VendasPropostasTab } from "../components/dashboard/VendasPropostasTab";
import { VendasFaturacaoTab } from "../components/dashboard/VendasFaturacaoTab";
import { VendasPerfilTab } from "../components/dashboard/VendasPerfilTab";

interface VendasDashboardProps {
  vendedor: Vendedor;
  onLogout: () => void;
}

export function VendasDashboard({ vendedor, onLogout }: VendasDashboardProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "orcamento" | "clientes" | "propostas" | "faturacao" | "perfil">("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [stats, setStats] = useState({ totalClientes: 0, propostasEnviadas: 0, propostasAceitas: 0, valorTotalPropostas: 0, comissaoTotal: 0 });
  const [clientes, setClientes] = useState<any[]>([]);
  const [propostas, setPropostas] = useState<any[]>([]);
  const [allPropostas, setAllPropostas] = useState<any[]>([]);

  // Form states
  const [showNovoCliente, setShowNovoCliente] = useState(false);
  const [novoCliente, setNovoCliente] = useState({ nome: "", email: "", telemovel: "", nif: "", morada: "", empresa: "" });

  // Profile states
  const [editProfile, setEditProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    nome: vendedor.nome,
    email: vendedor.email,
    telefone: vendedor.telefone || "",
    fotoPerfil: vendedor.fotoPerfil || "",
    instagram: vendedor.redesSociais?.instagram || "",
    facebook: vendedor.redesSociais?.facebook || "",
    linkedin: vendedor.redesSociais?.linkedin || "",
    twitter: vendedor.redesSociais?.twitter || ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, clientesData, propostasData] = await Promise.all([
        getStatsVendedor(vendedor.id),
        listClientes(100),
        listProposals(100)
      ]);
      
      // Filter to only this vendor's clients
      const clientesDoVendedor = clientesData.filter(c => c.vendedorId === vendedor.id);
      
      // Filter proposals for this vendor's clients
      const clienteIds = clientesDoVendedor.map(c => c.id);
      const propostasDoVendedor = propostasData.filter(p => p.clienteId && clienteIds.includes(p.clienteId));
      
      setStats(statsData);
      setClientes(clientesDoVendedor);
      setPropostas(propostasDoVendedor);
      setAllPropostas(propostasData);
    } catch (err) {
      console.error("Error loading data:", err);
    }
    setLoading(false);
  };

  const handleNovoCliente = async () => {
    if (!novoCliente.nome) return;
    try {
      const clienteId = await createCliente({
        ...novoCliente,
        categoria: "potencial",
        origem: "Vendas",
        vendedorId: vendedor.id
      });
      await loadData();
      setShowNovoCliente(false);
      setNovoCliente({ nome: "", email: "", telemovel: "", nif: "", morada: "", empresa: "" });
    } catch (err) {
      alert("Erro ao criar cliente");
    }
  };

  const navigateTo = (tab: string) => {
    if (tab === "orcamento") {
      alert("Os orçamentos são criados pelo administrador. Contacte-o para criar um novo orçamento.");
    } else {
      setActiveTab(tab as any);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.bg.primary }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, color: theme.colors.text.secondary }}>A carregar...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: theme.colors.bg.primary, display: "flex" }}>
      <VendasSidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as any)}
        userName={vendedor.nome}
        onLogout={onLogout}
        proposalCount={propostas.length}
        clienteCount={clientes.length}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        vendedorId={vendedor.id}
      />

      <main style={{ flex: 1, padding: 40, overflow: "auto", marginLeft: sidebarCollapsed ? 80 : 260, transition: 'margin-left 0.3s ease' }}>
        
        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
              <div>
                <h1 style={{ fontFamily: theme.fontFamily.sans, fontSize: 32, fontWeight: 900, color: theme.colors.text.primary, marginBottom: 8 }}>Painel de Vendas</h1>
                <p style={{ color: theme.colors.text.secondary, fontSize: 14 }}>Bem-vindo, {vendedor.nome}</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ fontSize: 12, color: theme.colors.text.secondary }}>Comissão:</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: theme.colors.accent.primary }}>{vendedor.comissaoPercent}%</span>
              </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 32 }}>
              <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8", borderLeft: `4px solid ${theme.colors.accent.primary}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <Users size={20} color={theme.colors.accent.primary} />
                  <span style={{ fontSize: 12, color: theme.colors.text.secondary, fontWeight: 600 }}>MEUS CLIENTES</span>
                </div>
                <div style={{ fontSize: 36, fontWeight: 900, color: theme.colors.text.primary }}>{stats.totalClientes}</div>
                <div style={{ fontSize: 11, color: theme.colors.text.secondary, marginTop: 4 }}>Clientes atribuídos</div>
              </div>

              <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8", borderLeft: "4px solid #3498DB" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <FileText size={20} color="#3498DB" />
                  <span style={{ fontSize: 12, color: theme.colors.text.secondary, fontWeight: 600 }}>PROPOSTAS</span>
                </div>
                <div style={{ fontSize: 36, fontWeight: 900, color: "#3498DB" }}>{stats.propostasEnviadas}</div>
                <div style={{ fontSize: 11, color: theme.colors.text.secondary, marginTop: 4 }}>{stats.propostasAceitas} aceites</div>
              </div>

              <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8", borderLeft: "4px solid #10B981" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <DollarSign size={20} color="#10B981" />
                  <span style={{ fontSize: 12, color: theme.colors.text.secondary, fontWeight: 600 }}>VALOR VENDAS</span>
                </div>
                <div style={{ fontSize: 36, fontWeight: 900, color: "#10B981" }}>{stats.valorTotalPropostas.toFixed(2)}€</div>
                <div style={{ fontSize: 11, color: theme.colors.text.secondary, marginTop: 4 }}>Total propostas</div>
              </div>

              <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8", borderLeft: "4px solid #F22283" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <TrendingUp size={20} color="#F22283" />
                  <span style={{ fontSize: 12, color: theme.colors.text.secondary, fontWeight: 600 }}>COMISSÃO</span>
                </div>
                <div style={{ fontSize: 36, fontWeight: 900, color: "#F22283" }}>{stats.comissaoTotal.toFixed(2)}€</div>
                <div style={{ fontSize: 11, color: theme.colors.text.secondary, marginTop: 4 }}>{vendedor.comissaoPercent}% de comissão</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
              <button onClick={() => navigateTo("orcamento")} style={{ padding: 20, borderRadius: 16, background: "linear-gradient(135deg, #F25C05 0%, #F22283 100%)", color: "#fff", border: "none", cursor: "pointer", textAlign: "center", boxShadow: "0 4px 15px rgba(242,92,5,0.3)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <Plus size={24} />
                <div style={{ fontWeight: 700, fontSize: 13 }}>Novo Orçamento</div>
              </button>
              <button onClick={() => setActiveTab("clientes")} style={{ padding: 20, borderRadius: 16, backgroundColor: theme.colors.bg.secondary, color: theme.colors.text.primary, border: `2px solid ${theme.colors.border}`, cursor: "pointer", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <Users size={24} color={theme.colors.accent.primary} />
                <div style={{ fontWeight: 700, fontSize: 13 }}>Meus Clientes</div>
                <div style={{ fontSize: 11, color: theme.colors.accent.primary, fontWeight: 600 }}>{clientes.length} total</div>
              </button>
              <button onClick={() => setActiveTab("propostas")} style={{ padding: 20, borderRadius: 16, backgroundColor: theme.colors.bg.secondary, color: theme.colors.text.primary, border: `2px solid ${theme.colors.border}`, cursor: "pointer", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <FileText size={24} color={theme.colors.accent.secondary} />
                <div style={{ fontWeight: 700, fontSize: 13 }}>Propostas</div>
                <div style={{ fontSize: 11, color: theme.colors.accent.secondary, fontWeight: 600 }}>{propostas.length} total</div>
              </button>
            </div>
          </div>
        )}

        {/* CLIENTES */}
        {activeTab === "clientes" && (
          <VendasClientesTab
            clientes={clientes}
            showNovoCliente={showNovoCliente}
            novoCliente={novoCliente}
            onNovoClienteChange={(field, val) => setNovoCliente({...novoCliente, [field]: val})}
            onToggleForm={() => setShowNovoCliente(!showNovoCliente)}
            onSubmit={handleNovoCliente}
          />
        )}

        {/* PROPOSTAS */}
        {activeTab === "propostas" && (
          <VendasPropostasTab
            propostas={propostas}
            vendedor={vendedor}
            onNavigateTo={navigateTo}
          />
        )}

        {/* FATURAÇÃO */}
        {activeTab === "faturacao" && (
          <VendasFaturacaoTab
            stats={stats}
            propostas={propostas}
            vendedor={vendedor}
            clientes={clientes}
          />
        )}

        {/* PERFIL */}
        {activeTab === "perfil" && (
          <VendasPerfilTab
            vendedor={vendedor}
            profileData={profileData}
            editProfile={editProfile}
            onProfileChange={(field, val) => setProfileData({...profileData, [field]: val})}
            onToggleEdit={() => setEditProfile(!editProfile)}
            onSave={async () => {
              await updateVendedor(vendedor.id, {
                nome: profileData.nome,
                telefone: profileData.telefone,
                fotoPerfil: profileData.fotoPerfil,
                redesSociais: {
                  instagram: profileData.instagram,
                  facebook: profileData.facebook,
                  linkedin: profileData.linkedin,
                  twitter: profileData.twitter
                }
              });
              setEditProfile(false);
              alert("Perfil atualizado com sucesso!");
            }}
          />
        )}
      </main>
    </div>
  );
}