import { useState, useEffect, ChangeEvent } from "react";
import { theme } from "../styles/theme";
import { VendasSidebar } from "../components/admin/VendasSidebar";
import { getStatsVendedor, updateVendedor, Vendedor, importarClientesParaVendedor } from "../services/vendedores";
import { listClientes, createCliente, listProposals, listTareas, solicitarTarea, entregarTarea } from "../services/firebase";
import { FileText, Users, DollarSign, Plus, TrendingUp, Upload, X, Check, CheckSquare, Clock, Calendar, Link as LinkIcon } from "lucide-react";
import { VendasClientesTab } from "../components/dashboard/VendasClientesTab";
import { VendasPropostasTab } from "../components/dashboard/VendasPropostasTab";
import { VendasFaturacaoTab } from "../components/dashboard/VendasFaturacaoTab";
import { VendasPerfilTab } from "../components/dashboard/VendasPerfilTab";
import { Cliente, Proposal, Tarea } from "../types";
import * as XLSX from "xlsx";

interface VendasDashboardProps {
  vendedor: Vendedor;
  onLogout: () => void;
}

export function VendasDashboard({ vendedor, onLogout }: VendasDashboardProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "orcamento" | "clientes" | "propostas" | "faturacao" | "perfil" | "tarefas">("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Data states
  const [stats, setStats] = useState({ totalClientes: 0, propostasEnviadas: 0, propostasAceitas: 0, valorTotalPropostas: 0, comissaoTotal: 0 });
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [propostas, setPropostas] = useState<Proposal[]>([]);
  const [allPropostas, setAllPropostas] = useState<Proposal[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);

  // Form states
  const [showNovoCliente, setShowNovoCliente] = useState(false);
  const [novoCliente, setNovoCliente] = useState({ nome: "", email: "", telemovel: "", nif: "", morada: "", empresa: "" });

  // Import modal states
  const [showImportModal, setShowImportModal] = useState(false);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<number[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ sucesso: number; erros: number } | null>(null);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        
        const validRows = jsonData.slice(0, 5).map((row: any, idx: number) => {
          const hasNome = row.Nome || row.nome || row.Name || row.NOME;
          return { ...row, _hasNome: !!hasNome, _index: idx };
        });
        
        setImportPreview(validRows);
        setImportErrors(validRows.filter(r => !r._hasNome).map(r => r._index));
      } catch (err) {
        console.error("Erro ao ler arquivo:", err);
        alert("Erro ao ler arquivo. Verifique o formato.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    if (importPreview.length === 0) return;
    
    setIsImporting(true);
    try {
      const validRows = importPreview.filter(r => r._hasNome).map(row => ({
        nome: row.Nome || row.nome || row.Name || row.NOME,
        email: row.Email || row.email || row.EMAIL || "",
        telemovel: row.Telemovel || row.telemovel || row.TELEMOVEL || row.Telefone || row.telefone || "",
        empresa: row.Empresa || row.empresa || row.EMPRESA || "",
        website: row.Website || row.website || row.WEBSITE || "",
        origem: row.Origem || row.origem || row.ORIGEM || "Excel",
        observacoes: row.Observacoes || row.observacoes || row.OBSERVACOES || "",
      }));
      
      const result = await importarClientesParaVendedor(vendedor.id, validRows);
      setImportResult({ sucesso: result.sucesso, erros: result.erros.length });
      
      if (result.sucesso > 0) {
        loadData();
      }
    } catch (err) {
      console.error("Erro ao importar:", err);
    }
    setIsImporting(false);
  };

  const closeImportModal = () => {
    setShowImportModal(false);
    setImportPreview([]);
    setImportErrors([]);
    setImportResult(null);
  };

  const handleSolicitarTarea = async (tareaId: string) => {
    try {
      await solicitarTarea(tareaId, vendedor.id);
      loadData();
      alert("Tarefa solicitada! Aguarde pela atribuição.");
    } catch (err) {
      console.error(err);
      alert("Erro ao solicitar tarefa");
    }
  };

  const [showEntregaModal, setShowEntregaModal] = useState(false);
  const [entregaTarea, setEntregaTarea] = useState<Tarea | null>(null);
  const [entregaUrl, setEntregaUrl] = useState("");
  const [entregaNota, setEntregaNota] = useState("");

  const handleEntregarTarea = async () => {
    if (!entregaTarea) return;
    try {
      await entregarTarea(entregaTarea.id, entregaUrl, entregaNota);
      loadData();
      setShowEntregaModal(false);
      setEntregaTarea(null);
      setEntregaUrl("");
      setEntregaNota("");
      alert("Tarefa entregue com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao entregar tarefa");
    }
  };

  const misTareas = tareas.filter(t => t.asignadaA === vendedor.id);
  const disponiblesTareas = tareas.filter(t => t.estado === 'disponivel');

  const getEstadoTareaColor = (estado: string) => {
    switch (estado) {
      case 'asignada': return { bg: '#FEF3C7', color: '#D97706', label: 'Em Andamento' };
      case 'entregue': return { bg: '#DBEAFE', color: '#2563EB', label: 'Entregue' };
      case 'aprovada_admin': return { bg: '#D1FAE5', color: '#059669', label: 'Aprovada' };
      case 'aprovada_cliente': return { bg: '#D1FAE5', color: '#059669', label: 'Confirmada' };
      case 'paga': return { bg: '#F3E8FF', color: '#9333EA', label: 'Paga' };
      default: return { bg: '#E0F2FE', color: '#0284C7', label: 'Disponível' };
    }
  };

  const isPrazoVencido = (prazo?: string) => {
    if (!prazo) return false;
    return new Date(prazo) < new Date();
  };

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
      const [statsData, clientesData, propostasData, tareasData] = await Promise.all([
        getStatsVendedor(vendedor.id),
        listClientes(100),
        listProposals(100),
        listTareas()
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
      setTareas(tareasData);
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
        origem: "Vendedor",
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
    return <div style={{ minHeight: "100vh", backgroundColor: theme.colors.bg.primary }} />;
  }

  return (
    <div data-theme="dark" style={{ minHeight: "100vh", backgroundColor: theme.colors.bg.primary, display: "flex" }}>
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

      <main style={{ 
        flex: 1, 
        padding: isMobile ? '80px 16px 24px 16px' : 40, 
        overflow: "auto", 
        backgroundColor: theme.colors.bg.primary, 
        marginLeft: sidebarCollapsed ? 80 : 260, 
        marginTop: isMobile ? 60 : 0,
        transition: 'margin-left 0.3s ease, padding 0.3s ease' 
      }}>
        
        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: isMobile ? 20 : 32, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h1 style={{ fontFamily: theme.fontFamily.sans, fontSize: isMobile ? 24 : 32, fontWeight: 900, color: theme.colors.text.primary, marginBottom: 8 }}>Painel de Vendas</h1>
                <p style={{ color: theme.colors.text.secondary, fontSize: 14 }}>Bem-vindo, {vendedor.nome}</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ fontSize: 12, color: theme.colors.text.secondary }}>Comissão:</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: theme.colors.accent.primary }}>{vendedor.comissaoPercent}%</span>
              </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)", gap: isMobile ? 12 : 20, marginBottom: isMobile ? 20 : 32 }}>
              <div style={{ backgroundColor: "#ffffff", borderRadius: isMobile ? 12 : 16, padding: isMobile ? 16 : 24, border: "1px solid #e8e8e8", borderLeft: `4px solid ${theme.colors.accent.primary}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <Users size={20} color={theme.colors.accent.primary} />
                  <span style={{ fontSize: 12, color: theme.colors.text.secondary, fontWeight: 600 }}>MEUS CLIENTES</span>
                </div>
                <div style={{ fontSize: isMobile ? 28 : 36, fontWeight: 900, color: theme.colors.text.primary }}>{stats.totalClientes}</div>
                <div style={{ fontSize: 11, color: theme.colors.text.secondary, marginTop: 4 }}>Clientes atribuídos</div>
              </div>

              <div style={{ backgroundColor: "#ffffff", borderRadius: isMobile ? 12 : 16, padding: isMobile ? 16 : 24, border: "1px solid #e8e8e8", borderLeft: "4px solid #3498DB" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <FileText size={20} color="#3498DB" />
                  <span style={{ fontSize: 12, color: theme.colors.text.secondary, fontWeight: 600 }}>PROPOSTAS</span>
                </div>
                <div style={{ fontSize: isMobile ? 28 : 36, fontWeight: 900, color: "#3498DB" }}>{stats.propostasEnviadas}</div>
                <div style={{ fontSize: 11, color: theme.colors.text.secondary, marginTop: 4 }}>{stats.propostasAceitas} aceites</div>
              </div>

              <div style={{ backgroundColor: "#ffffff", borderRadius: isMobile ? 12 : 16, padding: isMobile ? 16 : 24, border: "1px solid #e8e8e8", borderLeft: "4px solid #10B981" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <DollarSign size={20} color="#10B981" />
                  <span style={{ fontSize: 12, color: theme.colors.text.secondary, fontWeight: 600 }}>VALOR VENDAS</span>
                </div>
                <div style={{ fontSize: isMobile ? 28 : 36, fontWeight: 900, color: "#10B981" }}>{stats.valorTotalPropostas.toFixed(2)}€</div>
                <div style={{ fontSize: 11, color: theme.colors.text.secondary, marginTop: 4 }}>Total propostas</div>
              </div>

              <div style={{ backgroundColor: "#ffffff", borderRadius: isMobile ? 12 : 16, padding: isMobile ? 16 : 24, border: "1px solid #e8e8e8", borderLeft: "4px solid #F22283" }}>
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
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
              <button 
                onClick={() => setShowImportModal(true)}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 10, backgroundColor: theme.colors.accent.primary, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                <Upload size={16} /> Importar Clientes
              </button>
            </div>
            <VendasClientesTab
              clientes={clientes}
              showNovoCliente={showNovoCliente}
              novoCliente={novoCliente}
              onNovoClienteChange={(field, val) => setNovoCliente({...novoCliente, [field]: val})}
              onToggleForm={() => setShowNovoCliente(!showNovoCliente)}
              onSubmit={handleNovoCliente}
            />
          </div>
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

        {/* TAREFAS */}
        {activeTab === "tarefas" && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Tarefas</h2>
            
            {/* Disponíveis */}
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Tarefas Disponíveis</h3>
              {disponiblesTareas.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "#999", backgroundColor: "#f9f9f9", borderRadius: 12 }}>Nenhuma tarefa disponível</div>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {disponiblesTareas.map(t => {
                    const yaSolicito = t.solicitantes?.includes(vendedor.id);
                    return (
                      <div key={t.id} style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16, border: "1px solid #e0e0e0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{t.titulo}</div>
                            <div style={{ fontSize: 12, color: "#666" }}>{t.clienteNome} • {t.servicoNome}</div>
                            {t.periodicidade && (
                              <span style={{ fontSize: 11, color: "#9333EA", marginTop: 4, display: "block" }}>
                                {t.periodicidade === 'mensal' ? '🔄 Mensal' : '📌 Pontual'}
                              </span>
                            )}
                          </div>
                          {yaSolicito ? (
                            <span style={{ fontSize: 12, padding: "6px 12px", borderRadius: 20, backgroundColor: "#FEF3C7", color: "#D97706", fontWeight: 600 }}>
                              Aguardando atribuição
                            </span>
                          ) : (
                            <button 
                              onClick={() => handleSolicitarTarea(t.id)}
                              style={{ padding: "8px 16px", borderRadius: 8, backgroundColor: theme.colors.accent.primary, color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                            >
                              Solicitar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* As Minhas Tarefas */}
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>As Minhas Tarefas</h3>
              {misTareas.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "#999", backgroundColor: "#f9f9f9", borderRadius: 12 }}>Nenhuma tarefa atribuída</div>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {misTareas.map(t => {
                    const estado = getEstadoTareaColor(t.estado);
                    const vencido = isPrazoVencido(t.prazo);
                    return (
                      <div key={t.id} style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16, border: "1px solid #e0e0e0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{t.titulo}</div>
                            <div style={{ fontSize: 12, color: "#666" }}>{t.clienteNome}</div>
                            {t.prazo && (
                              <div style={{ fontSize: 11, marginTop: 8, display: "flex", alignItems: "center", gap: 4, color: vencido ? "#dc2626" : "#666" }}>
                                <Calendar size={12} /> Prazo: {t.prazo} {vencido && " (vencido)"}
                              </div>
                            )}
                            {t.entregaUrl && (
                              <div style={{ fontSize: 11, marginTop: 4, color: "#2563EB" }}>
                                <LinkIcon size={12} style={{ display: "inline" }} /> {t.entregaUrl}
                              </div>
                            )}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                            <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, backgroundColor: estado.bg, color: estado.color, fontWeight: 600 }}>
                              {estado.label}
                            </span>
                            {t.estado === 'asignada' && (
                              <button 
                                onClick={() => { setEntregaTarea(t); setShowEntregaModal(true); }}
                                style={{ padding: "8px 16px", borderRadius: 8, backgroundColor: "#2563EB", color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                              >
                                Entregar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Import Modal */}
      {showImportModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}>
          <div style={{ backgroundColor: "#fff", borderRadius: 20, width: "100%", maxWidth: 600, maxHeight: "90vh", overflow: "auto", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: "Montserrat, sans-serif" }}>Importar Clientes</h2>
              <button onClick={closeImportModal} style={{ background: "none", border: "none", cursor: "pointer", padding: 8 }}>
                <X size={20} />
              </button>
            </div>

            {!importResult ? (
              <>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Arquivo .xlsx ou .csv</label>
                  <input 
                    type="file" 
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    style={{ width: "100%", padding: 12, border: "2px dashed #e0e0e0", borderRadius: 10 }}
                  />
                </div>

                {importPreview.length > 0 && (
                  <>
                    <div style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>Preview (primeiras 5 linhas):</div>
                    <div style={{ border: "1px solid #e0e0e0", borderRadius: 10, overflow: "hidden", marginBottom: 20 }}>
                      <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ backgroundColor: "#f5f5f5" }}>
                            <th style={{ padding: 10, textAlign: "left", borderBottom: "1px solid #e0e0e0" }}>#</th>
                            <th style={{ padding: 10, textAlign: "left", borderBottom: "1px solid #e0e0e0" }}>Nome *</th>
                            <th style={{ padding: 10, textAlign: "left", borderBottom: "1px solid #e0e0e0" }}>Email</th>
                            <th style={{ padding: 10, textAlign: "left", borderBottom: "1px solid #e0e0e0" }}>Telemóvel</th>
                            <th style={{ padding: 10, textAlign: "left", borderBottom: "1px solid #e0e0e0" }}>Origem</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importPreview.map((row, idx) => (
                            <tr key={idx} style={{ backgroundColor: importErrors.includes(idx) ? "#FEE2E2" : "#fff" }}>
                              <td style={{ padding: 10, borderBottom: "1px solid #e0e0e0" }}>{idx + 1}</td>
                              <td style={{ padding: 10, borderBottom: "1px solid #e0e0e0" }}>{row.Nome || row.nome || row.Name || "—"}</td>
                              <td style={{ padding: 10, borderBottom: "1px solid #e0e0e0" }}>{row.Email || row.email || "—"}</td>
                              <td style={{ padding: 10, borderBottom: "1px solid #e0e0e0" }}>{row.Telemovel || row.telemovel || row.Telefone || "—"}</td>
                              <td style={{ padding: 10, borderBottom: "1px solid #e0e0e0" }}>{row.Origem || row.origem || "Excel"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {importErrors.length > 0 && (
                      <div style={{ color: "#dc2626", fontSize: 12, marginBottom: 16 }}>
                        ⚠️ {importErrors.length} linha(s) sem Nome não serão importadas
                      </div>
                    )}

                    <button 
                      onClick={handleImport}
                      disabled={isImporting}
                      style={{ width: "100%", padding: 14, borderRadius: 10, backgroundColor: isImporting ? "#ccc" : theme.colors.accent.primary, color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: isImporting ? "not-allowed" : "pointer" }}
                    >
                      {isImporting ? "A importar..." : `Importar ${importPreview.filter(r => r._hasNome).length} clientes`}
                    </button>
                  </>
                )}
              </>
            ) : (
              <div style={{ textAlign: "center", padding: 20 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "16px 24px", borderRadius: 12, backgroundColor: importResult.sucesso > 0 ? "#dcfce7" : "#fee2e2", marginBottom: 16 }}>
                  {importResult.sucesso > 0 ? <Check size={24} color="#16a34a" /> : <X size={24} color="#dc2626" />}
                  <span style={{ fontSize: 16, fontWeight: 600, color: importResult.sucesso > 0 ? "#16a34a" : "#dc2626" }}>
                    {importResult.sucesso} importados, {importResult.erros} com erro
                  </span>
                </div>
                <button 
                  onClick={closeImportModal}
                  style={{ padding: "12px 24px", borderRadius: 10, backgroundColor: theme.colors.accent.primary, color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                >
                  Fechar
                </button>
              </div>
              )}
          </div>
        </div>
      )}

      {/* Entrega Modal */}
      {showEntregaModal && entregaTarea && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}>
          <div style={{ backgroundColor: "#fff", borderRadius: 16, padding: 24, width: 450 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Entregar Tarefa</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Link da Entrega (URL)</label>
              <input 
                type="url"
                value={entregaUrl}
                onChange={e => setEntregaUrl(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13 }}
                placeholder="https://..."
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Notas</label>
              <textarea 
                value={entregaNota}
                onChange={e => setEntregaNota(e.target.value)}
                rows={3}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13 }}
                placeholder="Descrição do trabalho realizado..."
              />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => { setShowEntregaModal(false); setEntregaTarea(null); }} style={{ flex: 1, padding: 10, borderRadius: 8, backgroundColor: "#f3f4f6", border: "none", fontSize: 13, cursor: "pointer" }}>Cancelar</button>
              <button onClick={handleEntregarTarea} style={{ flex: 1, padding: 10, borderRadius: 8, backgroundColor: theme.colors.accent.primary, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Entregar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}