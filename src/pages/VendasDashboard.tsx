import { useState, useEffect } from "react";
import { theme } from "../styles/theme";
import { VendasSidebar } from "../components/admin/VendasSidebar";
import { getStatsVendedor, updateVendedor, Vendedor } from "../services/vendedores";
import { listClientes, createCliente, listProposals } from "../services/firebase";
import { FileText, Users, DollarSign, Plus, TrendingUp, Instagram, Facebook, Linkedin, Twitter, Save, Camera } from "lucide-react";

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
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h1 style={{ fontFamily: theme.fontFamily.sans, fontSize: 28, fontWeight: 900, color: theme.colors.text.primary, marginBottom: 8 }}>Meus Clientes</h1>
                <p style={{ color: theme.colors.text.secondary, fontSize: 14 }}>{clientes.length} clientes atribuídos</p>
              </div>
              <button onClick={() => setShowNovoCliente(true)} style={{ padding: "12px 20px", borderRadius: 10, backgroundColor: theme.colors.accent.primary, color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>+ Novo Cliente</button>
            </div>

            {showNovoCliente && (
              <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8", marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Novo Cliente</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, color: theme.colors.text.secondary, display: "block", marginBottom: 4 }}>Nome *</label>
                    <input value={novoCliente.nome} onChange={(e) => setNovoCliente({...novoCliente, nome: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: `2px solid ${theme.colors.border}`, fontSize: 13 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: theme.colors.text.secondary, display: "block", marginBottom: 4 }}>Email</label>
                    <input value={novoCliente.email} onChange={(e) => setNovoCliente({...novoCliente, email: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: `2px solid ${theme.colors.border}`, fontSize: 13 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: theme.colors.text.secondary, display: "block", marginBottom: 4 }}>Telemóvel</label>
                    <input value={novoCliente.telemovel} onChange={(e) => setNovoCliente({...novoCliente, telemovel: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: `2px solid ${theme.colors.border}`, fontSize: 13 }} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                  <button onClick={handleNovoCliente} style={{ padding: "10px 20px", borderRadius: 8, backgroundColor: theme.colors.accent.primary, color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}>Guardar</button>
                  <button onClick={() => setShowNovoCliente(false)} style={{ padding: "10px 20px", borderRadius: 8, backgroundColor: theme.colors.bg.secondary, color: theme.colors.text.primary, border: `1px solid ${theme.colors.border}`, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
                </div>
              </div>
            )}

            <div style={{ backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e8e8e8", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                    <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, textAlign: "left" }}>Nome</th>
                    <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, textAlign: "left" }}>Categoria</th>
                    <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, textAlign: "left" }}>Telefone</th>
                    <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, textAlign: "left" }}>Email</th>
                    <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, textAlign: "left" }}>Orçamento</th>
                    <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, textAlign: "center" }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((c) => (
                    <tr key={c.id} style={{ borderTop: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "12px 14px" }}><div style={{ fontWeight: 700, color: theme.colors.text.primary }}>{c.nome}</div></td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: 10, backgroundColor: (c.categoria === "cliente" ? "#10B981" : "#F59E0B") + "20", padding: "4px 8px", borderRadius: 12, color: c.categoria === "cliente" ? "#10B981" : "#F59E0B", fontWeight: 600 }}>
                          {c.categoria === "cliente" ? "Cliente" : c.categoria === "potencial" ? "Potencial" : "Curioso"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: 12, color: "#666" }}>{c.telemovel || "—"}</td>
                      <td style={{ padding: "12px 14px", fontSize: 12, color: "#666" }}>{c.email || "—"}</td>
                      <td style={{ padding: "12px 14px" }}>
                        {c.propostaNumero ? (
                          <a href={`/admin/orcamento?edit=${c.propostaId}`} target="_blank" style={{ color: "#3498DB", fontWeight: 600, fontSize: 12, textDecoration: "none" }}>{c.propostaNumero}</a>
                        ) : <span style={{ fontSize: 12, color: "#d1d5db" }}>—</span>}
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "center" }}>
                        <button onClick={() => window.location.href = `/admin/orcamento?edit=${c.propostaId}`} style={{ padding: "6px 12px", borderRadius: 6, backgroundColor: theme.colors.accent.primary, color: "#fff", border: "none", fontSize: 11, cursor: "pointer" }}>
                          Ver/Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {clientes.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: 40, textAlign: "center", color: theme.colors.text.secondary }}>
                        Nenhum cliente atribuído ainda
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PROPOSTAS */}
        {activeTab === "propostas" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
              <div>
                <h1 style={{ fontFamily: theme.fontFamily.sans, fontSize: 28, fontWeight: 900, color: theme.colors.text.primary, marginBottom: 8 }}>Minhas Propostas</h1>
                <p style={{ color: theme.colors.text.secondary, fontSize: 14 }}>{propostas.length} propostas dos seus clientes</p>
              </div>
              <button onClick={() => navigateTo("orcamento")} style={{ padding: "12px 20px", borderRadius: 10, backgroundColor: theme.colors.accent.primary, color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>+ Nova Proposta</button>
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              {propostas.map((p) => (
                <div key={p.id} style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                        <span style={{ fontWeight: 700, fontSize: 18 }}>{p.cliente}</span>
                        <span style={{ fontSize: 10, padding: "4px 10px", borderRadius: 20, backgroundColor: (p.resposta === "sim" ? "#dcfce7" : p.resposta === "nao" ? "#fee2e2" : p.dataEnvio ? "#E8F4FD" : "#f3f4f6"), color: p.resposta === "sim" ? "#16a34a" : p.resposta === "nao" ? "#dc2626" : p.dataEnvio ? "#3498DB" : "#9ca3af", fontWeight: 600 }}>
                          {p.resposta === "sim" ? "✓ Aceito" : p.resposta === "nao" ? "✕ Recusado" : p.dataEnvio ? "Enviada" : "Pendente"}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: "#666" }}>{p.numeroOrcamento} · {new Date(p.createdAt).toLocaleDateString("pt-PT")}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 800, fontSize: 24, color: theme.colors.accent.primary }}>{p.valor?.toFixed(2)} €</div>
                      {p.resposta === "sim" && (
                        <div style={{ fontSize: 12, color: "#10B981", fontWeight: 600 }}>
                          Comissão: {(p.valor * vendedor.comissaoPercent / 100).toFixed(2)}€
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {propostas.length === 0 && (
                <div style={{ textAlign: "center", padding: 60, backgroundColor: "#ffffff", borderRadius: 16, color: theme.colors.text.secondary }}>
                  Nenhuma proposta ainda
                </div>
              )}
            </div>
          </div>
        )}

        {/* FATURAÇÃO */}
        {activeTab === "faturacao" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
              <div>
                <h1 style={{ fontFamily: theme.fontFamily.sans, fontSize: 28, fontWeight: 900, color: theme.colors.text.primary, marginBottom: 8 }}>Faturação</h1>
                <p style={{ color: theme.colors.text.secondary, fontSize: 14 }}>Suas vendas e comissões</p>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 32 }}>
              <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8" }}>
                <span style={{ fontSize: 12, color: theme.colors.text.secondary, fontWeight: 600 }}>Total Vendido</span>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#10B981", marginTop: 8 }}>{stats.valorTotalPropostas.toFixed(2)}€</div>
              </div>
              <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8" }}>
                <span style={{ fontSize: 12, color: theme.colors.text.secondary, fontWeight: 600 }}>Sua Comissão ({vendedor.comissaoPercent}%)</span>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#F22283", marginTop: 8 }}>{stats.comissaoTotal.toFixed(2)}€</div>
              </div>
              <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8" }}>
                <span style={{ fontSize: 12, color: theme.colors.text.secondary, fontWeight: 600 }}>Clientes Fiéis</span>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#3498DB", marginTop: 8 }}>{clientes.filter(c => c.categoria === "cliente").length}</div>
              </div>
            </div>

            {/* Propostas Aceitas com Comissão */}
            <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Vendas com Comissão</h3>
              {propostas.filter(p => p.resposta === "sim").map(p => {
                const comissao = (p.valor || 0) * vendedor.comissaoPercent / 100;
                return (
                  <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #f0f0f0" }}>
                    <div>
                      <div style={{ fontWeight: 600, color: theme.colors.text.primary }}>{p.cliente}</div>
                      <div style={{ fontSize: 12, color: theme.colors.text.secondary }}>{p.numeroOrcamento}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700, color: "#10B981" }}>{p.valor?.toFixed(2)}€</div>
                      <div style={{ fontSize: 12, color: "#F22283" }}>+{comissao.toFixed(2)}€ comissão</div>
                    </div>
                  </div>
                );
              })}
              {propostas.filter(p => p.resposta === "sim").length === 0 && (
                <div style={{ textAlign: "center", padding: 40, color: theme.colors.text.secondary }}>
                  Nenhuma venda concretizada ainda
                </div>
              )}
            </div>
          </div>
        )}

        {/* PERFIL */}
        {activeTab === "perfil" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
              <div>
                <h1 style={{ fontFamily: theme.fontFamily.sans, fontSize: 28, fontWeight: 900, color: theme.colors.text.primary, marginBottom: 8 }}>Meu Perfil</h1>
                <p style={{ color: theme.colors.text.secondary, fontSize: 14 }}>Gerencia suas informações pessoais e redes sociais</p>
              </div>
              {!editProfile && (
                <button onClick={() => setEditProfile(true)} style={{ padding: "10px 20px", borderRadius: 10, backgroundColor: theme.colors.accent.primary, color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
                  Editar Perfil
                </button>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>
              {/* Foto de Perfil */}
              <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8", textAlign: "center" }}>
                <div style={{ width: 120, height: 120, borderRadius: "50%", backgroundColor: theme.colors.accent.primary, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 48, fontWeight: 900, overflow: "hidden" }}>
                  {profileData.fotoPerfil ? <img src={profileData.fotoPerfil} alt="Foto" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : profileData.nome?.charAt(0).toUpperCase()}
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: theme.colors.text.primary }}>{vendedor.nome}</div>
                <div style={{ fontSize: 13, color: theme.colors.text.secondary, marginBottom: 16 }}>Vendedor</div>
                {editProfile && (
                  <div style={{ marginTop: 16 }}>
                    <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", color: theme.colors.accent.primary, fontSize: 13, fontWeight: 600 }}>
                      <Camera size={16} /> Alterar Foto
                      <input type="text" value={profileData.fotoPerfil} onChange={(e) => setProfileData({...profileData, fotoPerfil: e.target.value})} placeholder="URL da foto" style={{ display: "none" }} />
                    </label>
                  </div>
                )}
              </div>

              {/* Informações */}
              <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Informações Pessoais</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 4 }}>Nome</label>
                    {editProfile ? (
                      <input value={profileData.nome} onChange={(e) => setProfileData({...profileData, nome: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: `2px solid ${theme.colors.border}`, fontSize: 13 }} />
                    ) : (
                      <div style={{ fontSize: 14, color: theme.colors.text.primary, fontWeight: 500 }}>{vendedor.nome}</div>
                    )}
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 4 }}>Email</label>
                    {editProfile ? (
                      <input value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: `2px solid ${theme.colors.border}`, fontSize: 13 }} />
                    ) : (
                      <div style={{ fontSize: 14, color: theme.colors.text.primary, fontWeight: 500 }}>{vendedor.email}</div>
                    )}
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 4 }}>Telefone</label>
                    {editProfile ? (
                      <input value={profileData.telefone} onChange={(e) => setProfileData({...profileData, telefone: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: `2px solid ${theme.colors.border}`, fontSize: 13 }} />
                    ) : (
                      <div style={{ fontSize: 14, color: theme.colors.text.primary, fontWeight: 500 }}>{vendedor.telefone || "—"}</div>
                    )}
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 4 }}>Comissão</label>
                    <div style={{ fontSize: 14, color: theme.colors.accent.primary, fontWeight: 700 }}>{vendedor.comissaoPercent}%</div>
                  </div>
                </div>

                <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 20 }}>Redes Sociais</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Instagram size={20} color="#E1306C" />
                    {editProfile ? (
                      <input value={profileData.instagram} onChange={(e) => setProfileData({...profileData, instagram: e.target.value})} placeholder="@instagram" style={{ flex: 1, padding: "10px", borderRadius: 8, border: `2px solid ${theme.colors.border}`, fontSize: 13 }} />
                    ) : (
                      <span style={{ fontSize: 14, color: theme.colors.text.primary }}>{vendedor.redesSociais?.instagram || "Não vinculado"}</span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Facebook size={20} color="#1877F2" />
                    {editProfile ? (
                      <input value={profileData.facebook} onChange={(e) => setProfileData({...profileData, facebook: e.target.value})} placeholder="Facebook" style={{ flex: 1, padding: "10px", borderRadius: 8, border: `2px solid ${theme.colors.border}`, fontSize: 13 }} />
                    ) : (
                      <span style={{ fontSize: 14, color: theme.colors.text.primary }}>{vendedor.redesSociais?.facebook || "Não vinculado"}</span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Linkedin size={20} color="#0A66C2" />
                    {editProfile ? (
                      <input value={profileData.linkedin} onChange={(e) => setProfileData({...profileData, linkedin: e.target.value})} placeholder="LinkedIn" style={{ flex: 1, padding: "10px", borderRadius: 8, border: `2px solid ${theme.colors.border}`, fontSize: 13 }} />
                    ) : (
                      <span style={{ fontSize: 14, color: theme.colors.text.primary }}>{vendedor.redesSociais?.linkedin || "Não vinculado"}</span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Twitter size={20} color="#000000" />
                    {editProfile ? (
                      <input value={profileData.twitter} onChange={(e) => setProfileData({...profileData, twitter: e.target.value})} placeholder="@twitter" style={{ flex: 1, padding: "10px", borderRadius: 8, border: `2px solid ${theme.colors.border}`, fontSize: 13 }} />
                    ) : (
                      <span style={{ fontSize: 14, color: theme.colors.text.primary }}>{vendedor.redesSociais?.twitter || "Não vinculado"}</span>
                    )}
                  </div>
                </div>

                {editProfile && (
                  <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                    <button onClick={async () => {
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
                    }} style={{ padding: "12px 24px", borderRadius: 10, backgroundColor: theme.colors.accent.primary, color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                      <Save size={16} /> Guardar Alterações
                    </button>
                    <button onClick={() => setEditProfile(false)} style={{ padding: "12px 24px", borderRadius: 10, backgroundColor: theme.colors.bg.secondary, color: theme.colors.text.primary, border: `1px solid ${theme.colors.border}`, fontWeight: 600, cursor: "pointer" }}>
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}