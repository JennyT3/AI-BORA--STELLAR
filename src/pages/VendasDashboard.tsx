import { useState, useEffect, ChangeEvent } from "react";
import { theme } from "../styles/theme";
import { VendasSidebar } from "../components/admin/VendasSidebar";
import { getStatsVendedor, updateVendedor, Vendedor, importarClientesParaVendedor } from "../services/vendedores";
import { listClientesByVendedor, listProposalsByVendedor, createCliente, listTareas, solicitarTarea, entregarTarea } from "../services/firebase";
import { FileText, Users, DollarSign, Plus, TrendingUp, Upload, X, Check, CheckSquare, Clock, Calendar, Link as LinkIcon, Sparkles, Target, Zap, Menu, Bell, HelpCircle, LogOut, LayoutDashboard, User } from "lucide-react";
import { VendasClientesTab } from "../components/dashboard/VendasClientesTab";
import { VendasPropostasTab } from "../components/dashboard/VendasPropostasTab";
import { VendasFaturacaoTab } from "../components/dashboard/VendasFaturacaoTab";
import { VendasPerfilTab } from "../components/dashboard/VendasPerfilTab";
import { Cliente, Proposal, Tarea } from "../types";
import * as XLSX from "xlsx";
import { NewStatsCard } from "../components/admin/NewStatsCard";
import { ConviteModal } from "../components/dashboard/ConviteModal";

import { VendasTarefasTab } from "../components/dashboard/VendasTarefasTab";

interface VendasDashboardProps {
  vendedor: Vendedor;
  onLogout: () => void;
}

export function VendasDashboard({ vendedor, onLogout }: VendasDashboardProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "orcamento" | "clientes" | "propostas" | "faturacao" | "perfil" | "tarefas">("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setSidebarOpen(mobile); // En móvil empezar oculto
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && ['dashboard', 'orcamento', 'clientes', 'propostas', 'faturacao', 'perfil', 'tarefas'].includes(tab)) {
      setActiveTab(tab as any);
    }
  }, []);
  
  const [stats, setStats] = useState({ totalClientes: 0, propostasEnviadas: 0, propostasAceitas: 0, valorTotalPropostas: 0, comissaoTotal: 0 });
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [propostas, setPropostas] = useState<Proposal[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [showConviteModal, setShowConviteModal] = useState(false);
  const [showNovoCliente, setShowNovoCliente] = useState(false);
  const [novoCliente, setNovoCliente] = useState({ nome: "", email: "", telemovel: "", nif: "", morada: "", empresa: "" });
  const [showImportModal, setShowImportModal] = useState(false);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ sucesso: number; erros: number } | null>(null);
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

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, clientesDoVendedor, propostasDoVendedor, tareasData] = await Promise.all([
        getStatsVendedor(vendedor.id),
        listClientesByVendedor(vendedor.id),
        listProposalsByVendedor(vendedor.id),
        listTareas()
      ]);
      setStats(statsData);
      setClientes(clientesDoVendedor);
      setPropostas(propostasDoVendedor);
      setTareas(tareasData);
    } catch (err) {
      console.error("Error loading data:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const navigateTo = (tab: string) => {
    if (tab === "orcamento") {
      window.location.href = `/admin/orcamento?vendedor=${vendedor.id}`;
    } else {
      setActiveTab(tab as any);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "3px solid rgba(255,255,255,0.1)", borderTop: `3px solid #F25C05`, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ color: "#94a3b8", fontSize: 14, fontFamily: 'Montserrat, sans-serif' }}>A carregar o teu sucesso...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", display: "flex", fontFamily: 'Montserrat, sans-serif', flexDirection: 'column' }}>
      
      {/* Mobile Header */}
      {isMobile && (
        <header style={{
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          height: 56,
          backgroundColor: '#fff',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          zIndex: 100,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          {/* Hamburger Menu */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: 'none', padding: 8, cursor: 'pointer' }}
          >
            <Menu size={24} color="#1b1c1b" />
          </button>

          {/* Center - Empty for cleaner mobile */}

          {/* Right Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {/* Notifications */}
            <button 
              onClick={() => {
                const notifs = propostas.filter(p => p.resposta === 'pendente').length;
                if (notifs === 0) {
                  alert('Ainda não tem notificações. Em breve, receberá alertas de novos clientes e comissões.');
                } else {
                  setActiveTab('dashboard');
                }
              }}
              style={{ background: 'none', border: 'none', padding: 8, cursor: 'pointer', position: 'relative' }}
            >
              <Bell size={20} color="#1b1c1b" />
              {propostas.filter(p => p.resposta === 'pendente').length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 16,
                  height: 16,
                  backgroundColor: '#EF4444',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 700,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {propostas.filter(p => p.resposta === 'pendente').length}
                </span>
              )}
            </button>

            {/* Help/FAQ */}
            <button 
              onClick={() => alert('Academia Ai Bora em breve! Estamos preparando tutoriais e formação para maximizar as tuas vendas.')}
              style={{ background: 'none', border: 'none', padding: 8, cursor: 'pointer' }}
            >
              <HelpCircle size={20} color="#1b1c1b" />
            </button>

            {/* Profile Avatar */}
            <button 
              onClick={() => setActiveTab('perfil')}
              style={{ 
                width: 32, 
                height: 32, 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #F25C05 0%, #F22283 100%)',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}
            >
              <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>
                {vendedor.nome?.charAt(0).toUpperCase()}
              </span>
            </button>
          </div>
        </header>
      )}

      {/* Mobile Menu Drawer */}
      {isMobile && menuOpen && (
        <>
          {/* Backdrop */}
          <div 
            onClick={() => setMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              zIndex: 199,
              animation: 'fadeIn 0.2s ease',
            }}
          />
          {/* Drawer - Same dark theme */}
          <aside style={{
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            width: 280,
            backgroundColor: '#1b1c1b',
            zIndex: 200,
            padding: '24px 16px',
            boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
            animation: 'slideIn 0.3s ease',
            overflowY: 'auto',
            borderRight: '1px solid rgba(242, 92, 5, 0.2)',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <img src="/logo.png" alt="AI BORA" style={{ height: 32, width: 'auto', borderRadius: 8 }} />
                <span style={{ fontSize: 14, fontWeight: 900, color: '#fff' }}>AI BORA</span>
              </div>
              <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer' }}>
                <X size={24} color="#fff" />
              </button>
            </div>

            {/* Nav Items */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'tarefas', label: 'Minhas Tarefas', icon: CheckSquare },
                { id: 'clientes', label: 'Meus Clientes', icon: Users },
                { id: 'propostas', label: 'Propostas', icon: FileText },
                { id: 'faturacao', label: 'Comissões', icon: DollarSign },
                { id: 'perfil', label: 'Perfil', icon: User },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button 
                    key={item.id}
                    onClick={() => { setActiveTab(item.id as any); setMenuOpen(false); }}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: isActive ? 'rgba(242, 92, 5, 0.15)' : 'transparent',
                      color: isActive ? '#F25C05' : '#fff',
                      border: 'none',
                      borderRadius: 12,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      fontSize: 14,
                      fontWeight: 600,
                      textAlign: 'left',
                    }}
                  >
                    <Icon size={20} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Logout */}
            <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1px solid #eee' }}>
              <button 
                onClick={onLogout}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#EF4444',
                  border: 'none',
                  borderRadius: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                <LogOut size={20} />
                Terminar Sessão
              </button>
            </div>
          </aside>
        </>
      )}


      {!isMobile && (
        <VendasSidebar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as any)}
          userName={vendedor.nome}
          onLogout={onLogout}
          proposalCount={propostas.length}
          clienteCount={clientes.length}
          collapsed={false}
          isMobile={false}
          onToggleCollapse={() => {}}
          onCloseMobile={() => {}}
          vendedorId={vendedor.id}
        />
      )}

      <main style={{ 
        flex: 1, 
        padding: isMobile ? '24px 16px 80px 16px' : '40px 40px 40px 40px', 
        marginLeft: isMobile ? 0 : 280,
        transition: 'all 0.3s ease',
        minHeight: '100vh',
        paddingTop: isMobile ? 24 : 40,
        paddingBottom: isMobile ? 80 : 40,
      }}>
        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <div style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {/* Welcome Hero - Admin Style */}
            <div style={{
              position: 'relative',
              overflow: 'hidden',
              background: '#f6f3f1',
              padding: isMobile ? '32px 24px' : '48px 40px',
              borderRadius: 24,
              minHeight: 220,
              display: 'flex',
              alignItems: 'center',
              marginBottom: 40,
              boxShadow: '0px 20px 40px rgba(90, 65, 55, 0.06)',
            }}>
              {/* Geometric Pattern */}
              <div style={{
                position: 'absolute',
                right: 0,
                top: 0,
                width: '50%',
                height: '100%',
                opacity: 0.03,
                pointerEvents: 'none',
              }}>
                <svg width="100%" height="100%" viewBox="0 0 400 220" preserveAspectRatio="none">
                  <path d="M350 0 L400 50 L400 220 L350 220 Z" fill="#F25C05" />
                  <circle cx="380" cy="180" r="60" fill="#e10977" />
                </svg>
              </div>

              {/* Content */}
              <div style={{ position: 'relative', zIndex: 10, maxWidth: 600 }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 900,
                  color: '#F25C05',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  marginBottom: 16,
                  display: 'block',
                }}>
                  Carteira Pessoal
                </span>
                <h1 style={{
                  fontSize: isMobile ? 32 : 48,
                  fontWeight: 900,
                  color: '#1b1c1b',
                  letterSpacing: '-1.5px',
                  lineHeight: 1.1,
                  marginBottom: 16,
                  fontFamily: 'Montserrat, sans-serif',
                }}>
                  {new Date().getHours() < 12 ? 'Bom dia' : new Date().getHours() < 18 ? 'Boa tarde' : 'Boa noite'}, {vendedor.nome.split(' ')[0]}.
                </h1>
                <p style={{
                  color: 'rgba(90, 65, 55, 0.7)',
                  fontWeight: 500,
                  maxWidth: 500,
                  fontSize: 15,
                  fontFamily: 'Montserrat, sans-serif',
                }}>
                  A tua carteira tem <strong style={{ color: '#F25C05' }}>{stats.totalClientes}</strong> clientes ativos. <strong style={{ color: '#F25C05' }}>{propostas.filter(p => p.resposta === 'pendente').length}</strong> propostas pendentes de aprovação.
                </p>
              </div>
            </div>

            {/* Stats Grid - 5 cards */}
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(5, 1fr)", 
              gap: isMobile ? 16 : 24, 
              marginBottom: 40 
            }}>
              <NewStatsCard 
                label="Convidados" 
                value={vendedor.referidosInvitados?.length || 0} 
                subtitle={`${vendedor.referidosConvertidos || 0} sucessos`}
                percentage={vendedor.referidosInvitados?.length ? 100 : 0}
                percentageColor="orange"
                icon={<Sparkles size={20} />}
                iconColor="#F25C05"
                iconBg="rgba(242, 92, 5, 0.05)"
                onClick={() => setShowConviteModal(true)}
              />
              <NewStatsCard 
                label="Clientes" 
                value={stats.totalClientes} 
                percentage={12.5}
                percentageColor="green"
                icon={<Users size={20} />}
                iconColor="#F25C05"
                iconBg="rgba(242, 92, 5, 0.05)"
                onClick={() => setActiveTab("clientes")}
              />
              <NewStatsCard 
                label="Propostas" 
                value={stats.propostasEnviadas} 
                subtitle={`${stats.propostasAceitas} aceites`}
                percentage={8.2}
                percentageColor="green"
                icon={<FileText size={20} />}
                iconColor="#3498DB"
                iconBg="rgba(52, 152, 219, 0.05)"
                onClick={() => setActiveTab("propostas")}
              />
              <NewStatsCard 
                label="Comissão" 
                value={`${stats.comissaoTotal.toFixed(0)}€`} 
                subtitle={`Taxa ${vendedor.comissaoPercent}%`}
                percentage={-2.1}
                percentageColor="orange"
                icon={<DollarSign size={20} />}
                iconColor="#F22283"
                iconBg="rgba(242, 34, 131, 0.05)"
                onClick={() => setActiveTab("faturacao")}
              />
              <NewStatsCard 
                label="Volume Vendas" 
                value={`${stats.valorTotalPropostas.toFixed(0)}€`} 
                percentage={14.2}
                percentageColor="green"
                icon={<TrendingUp size={20} />}
                iconColor="#10B981"
                iconBg="rgba(16, 185, 129, 0.05)"
              />
            </div>

            {/* Monthly Sales Chart */}
            <div style={{ 
              backgroundColor: "#ffffff", 
              borderRadius: 24, 
              padding: 32, 
              marginBottom: 48, 
              boxShadow: "0px 20px 40px rgba(90, 65, 55, 0.04)",
              border: "1px solid rgba(0,0,0,0.02)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: "#1b1c1b", marginBottom: 4 }}>Monthly Sales</h3>
                  <p style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>Performance evolution over the last 6 months</p>
                </div>
                <span style={{ fontSize: 10, fontWeight: 900, color: "#F22283", background: "rgba(242, 34, 131, 0.1)", padding: "4px 10px", borderRadius: 100, letterSpacing: 1 }}>LIVE TRACKING</span>
              </div>
              
              <div style={{ width: "100%", height: 200, position: "relative", marginTop: 40 }}>
                <svg width="100%" height="100%" viewBox="0 0 1000 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="vendorChartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F25C05" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#F25C05" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M0,150 Q150,140 250,130 T500,100 T750,90 T1000,60" 
                    fill="none" 
                    stroke="#F25C05" 
                    strokeWidth="3" 
                  />
                  <path 
                    d="M0,150 Q150,140 250,130 T500,100 T750,90 T1000,60 L1000,200 L0,200 Z" 
                    fill="url(#vendorChartGradient)" 
                  />
                  {[0, 200, 400, 600, 800, 1000].map((x, i) => {
                    const y = [150, 130, 100, 90, 75, 60][i];
                    return <circle key={i} cx={x} cy={y} r="5" fill="#fff" stroke="#F25C05" strokeWidth="2" />;
                  })}
                </svg>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, color: "#94a3b8", fontSize: 11, fontWeight: 800 }}>
                  <span>JAN</span><span>FEV</span><span>MAR</span><span>ABR</span><span>MAI</span><span>JUN</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)", 
              gap: 16, 
              marginBottom: 48 
            }}>
              <button 
                onClick={() => navigateTo("orcamento")} 
                style={{ padding: "14px 20px", borderRadius: 16, backgroundColor: "#F25C05", color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, fontSize: 13, fontWeight: 800, boxShadow: "0 4px 12px rgba(242,92,5,0.2)", transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={16} strokeWidth={3} /></div>
                Nova Proposta
              </button>
              <button 
                onClick={() => setActiveTab("clientes")} 
                style={{ padding: "14px 20px", borderRadius: 16, backgroundColor: "#fff", color: "#1b1c1b", border: "1px solid rgba(0,0,0,0.05)", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, fontSize: 13, fontWeight: 800, boxShadow: "0 4px 12px rgba(0,0,0,0.02)", transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "#F25C05", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><Users size={16} /></div>
                Ver Clientes
              </button>
              <button 
                onClick={() => setActiveTab("faturacao")} 
                style={{ padding: "14px 20px", borderRadius: 16, backgroundColor: "#fff", color: "#1b1c1b", border: "1px solid rgba(0,0,0,0.05)", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, fontSize: 13, fontWeight: 800, boxShadow: "0 4px 12px rgba(0,0,0,0.02)", transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "#1b1c1b", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><DollarSign size={16} /></div>
                Ver Comissões
              </button>
            </div>

            {/* Recent Clients List */}
            <div style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 32, boxShadow: "0px 20px 40px rgba(90, 65, 55, 0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: "#1b1c1b" }}>Clientes Recentes</h3>
                <button onClick={() => setActiveTab("clientes")} style={{ fontSize: 12, color: "#F25C05", background: "none", border: "none", cursor: "pointer", fontWeight: 800 }}>Ver todos</button>
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                {clientes.slice(0, 5).map(c => {
                  const statusColor = c.categoria === 'cliente' ? '#10B981' : c.categoria === 'potencial' ? '#F25C05' : '#64748b';
                  const statusLabel = c.categoria === 'cliente' ? 'Ativo' : c.categoria === 'potencial' ? 'Potencial' : c.categoria;
                  return (
                    <div 
                      key={c.id}
                      onClick={() => setActiveTab("clientes")}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", backgroundColor: "#fcf9f7", borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0edeb'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fcf9f7'}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Users size={18} color="#64748b" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: "#1b1c1b", fontSize: 14 }}>{c.nome}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{c.empresa || c.email}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: 9, padding: "4px 10px", borderRadius: 100, backgroundColor: statusColor + "15", color: statusColor, fontWeight: 900, textTransform: 'uppercase' }}>
                        {statusLabel}
                      </span>
                    </div>
                  );
                })}
                {clientes.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                    <Users size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                    <p style={{ fontWeight: 600 }}>Nenhum cliente ainda</p>
                    <p style={{ fontSize: 12 }}>Começa por adicionar os teus primeiros clientes</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Other Tabs (Keeping logic intact) */}
        {activeTab === "clientes" && (
          <div style={{ background: '#fff', padding: 32, borderRadius: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
              <h2 style={{ fontSize: 24, fontWeight: 900 }}>Meus Clientes</h2>
              <button onClick={() => setShowImportModal(true)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", borderRadius: 12, backgroundColor: '#F25C05', color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: '0 4px 12px rgba(242,92,5,0.2)' }}>
                <Upload size={16} /> Importar Excel
              </button>
            </div>
            <VendasClientesTab
              clientes={clientes}
              showNovoCliente={showNovoCliente}
              novoCliente={novoCliente}
              onNovoClienteChange={(field, val) => setNovoCliente({...novoCliente, [field]: val})}
              onToggleForm={() => setShowNovoCliente(!showNovoCliente)}
              onSubmit={async () => {
                if (!novoCliente.nome?.trim()) return;
                await createCliente({ ...novoCliente, categoria: "potencial", origem: "Vendedor", vendedorId: vendedor.id });
                await loadData();
                setShowNovoCliente(false);
                setNovoCliente({ nome: "", email: "", telemovel: "", nif: "", morada: "", empresa: "" });
              }}
            />
          </div>
        )}

        {activeTab === "propostas" && (
          <div style={{ background: '#fff', padding: 32, borderRadius: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <VendasPropostasTab propostas={propostas} vendedor={vendedor} onNavigateTo={navigateTo} isMobile={isMobile} />
          </div>
        )}

        {activeTab === "faturacao" && (
          <div style={{ background: '#fff', padding: 32, borderRadius: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <VendasFaturacaoTab stats={stats} propostas={propostas} vendedor={vendedor} clientes={clientes} tareas={tareas} isMobile={isMobile} />
          </div>
        )}

        {activeTab === "perfil" && (
          <div style={{ background: '#fff', padding: 32, borderRadius: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <VendasPerfilTab
              vendedor={vendedor}
              profileData={profileData}
              editProfile={editProfile}
              isMobile={isMobile}
              onOpenConvite={() => setShowConviteModal(true)}
              onProfileChange={(field, val) => setProfileData({...profileData, [field]: val})}
              onToggleEdit={() => setEditProfile(!editProfile)}
              onSave={async () => {
                const updatePayload = {
                  nome: profileData.nome,
                  email: profileData.email,
                  telefone: profileData.telefone,
                  fotoPerfil: profileData.fotoPerfil,
                  redesSociais: {
                    instagram: profileData.instagram,
                    facebook: profileData.facebook,
                    linkedin: profileData.linkedin,
                    twitter: profileData.twitter
                  }
                };
                await updateVendedor(vendedor.id, updatePayload);
                setEditProfile(false);
                loadData();
              }}
            />
          </div>
        )}

        {activeTab === "tarefas" && (
          <div style={{ background: '#fff', padding: 32, borderRadius: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 32 }}>Minhas Tarefas</h2>
            {/* Tareas logic remains same but with better styling */}
            <div style={{ display: 'grid', gap: 16 }}>
              {tareas.filter(t => t.asignadaA === vendedor.id).map(t => (
                <div key={t.id} style={{ padding: 24, borderRadius: 20, border: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontWeight: 700, marginBottom: 4 }}>{t.titulo}</h4>
                    <p style={{ fontSize: 12, color: '#64748b' }}>{t.clienteNome || 'Cliente'} - {t.servicoNome}</p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: '6px 12px', borderRadius: 100, background: '#F25C0515', color: '#F25C05' }}>{t.estado.toUpperCase()}</span>
                </div>
              ))}
              {tareas.filter(t => t.asignadaA === vendedor.id).length === 0 && (
                <div style={{ color: '#64748b', fontSize: 14 }}>Sem tarefas ativas.</div>
              )}
            </div>

            <div style={{ marginTop: 48, paddingTop: 48, borderTop: '1px solid #f1f5f9' }}>
               <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                 <CheckSquare size={20} color="#F25C05" /> Tarefas Disponíveis
               </h3>
               <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>
                 Tarefas abertas que podes aceitar. Podes também ver tarefas próximas de entregar.
               </p>
               
               {/* Tarefas Disponíveis - no assigned yet */}
               <div style={{ display: 'grid', gap: 12, marginBottom: 32 }}>
                 {tareas.filter(t => !t.asignadaA).slice(0, 5).map(t => (
                   <div key={t.id} style={{ padding: 16, borderRadius: 16, border: '1px solid rgba(242, 92, 5, 0.2)', background: 'rgba(242, 92, 5, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div>
                       <h4 style={{ fontWeight: 700, marginBottom: 4, fontSize: 14 }}>{t.titulo}</h4>
                       <p style={{ fontSize: 12, color: '#64748b' }}>{t.clienteNome || 'Cliente'} - {t.servicoNome}</p>
                     </div>
                     <button 
                       onClick={async () => {
                         if (confirm('Aceitar esta tarefa?')) {
                           await solicitarTarea(t.id, vendedor.id);
                           await loadData();
                         }
                       }}
                       style={{ padding: '8px 16px', borderRadius: 8, background: '#F25C05', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                     >
                       Aceitar
                     </button>
                   </div>
                 ))}
                 {tareas.filter(t => !t.asignadaA).length === 0 && (
                   <div style={{ padding: 24, background: '#f8fafc', borderRadius: 16, color: '#64748b', fontSize: 13 }}>
                     Não há tarefas disponíveis neste momento.
                   </div>
                 )}
               </div>

               {/* Próximas a entregar */}
               {tareas.filter(t => t.asignadaA === vendedor.id && t.estado !== 'entregue' && t.estado !== 'paga').length > 0 && (
                 <>
                   <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, marginTop: 24 }}>Próximas a Entregar</h3>
                   <div style={{ display: 'grid', gap: 12 }}>
                     {tareas.filter(t => t.asignadaA === vendedor.id && t.estado !== 'entregue' && t.estado !== 'paga').slice(0, 5).map(t => (
                       <div key={t.id} style={{ padding: 16, borderRadius: 16, border: '1px solid #e2e8f0', background: '#fff' }}>
                         <h4 style={{ fontWeight: 700, marginBottom: 4, fontSize: 14 }}>{t.titulo}</h4>
                         <p style={{ fontSize: 12, color: '#64748b' }}>Data entrega: {t.prazo ? new Date(t.prazo).toLocaleDateString('pt-PT') : 'Sem prazo'}</p>
                       </div>
                     ))}
                   </div>
                 </>
               )}

               <VendasTarefasTab vendedorId={vendedor.id} isMobile={isMobile} />
            </div>
          </div>
        )}

      </main>

      <ConviteModal
        isOpen={showConviteModal}
        onClose={() => setShowConviteModal(false)}
        vendedor={vendedor}
      />
    </div>
  );
}
