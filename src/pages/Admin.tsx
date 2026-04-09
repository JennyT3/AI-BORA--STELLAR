import { useState, useEffect, FormEvent } from "react";
import { useLocation } from "wouter";
import { Sidebar } from "../components/admin/Sidebar";
import { AdminHeader } from "../components/admin/AdminHeader";
import { theme } from "../styles/theme";
import { Dashboard } from "./admin/Dashboard";
import { Propostas } from "./admin/Propostas";
import { Solicitacoes } from "./admin/Solicitacoes";
import { Clientes } from "./admin/Clientes";
import { Faturacao } from "./admin/Faturacao";
import { VendoresAdmin } from "./admin/Vendores";
import { Marketing } from "./admin/Marketing";
import { TarefasKanban } from "./admin/TarefasKanban";
import { DelegacoesAdmin } from "./admin/Delegacoes";
import { exportToExcel } from "../services/exportService";
import { useAuth } from "../hooks/useAuth";
import { useAdminData } from "../hooks/useAdminData";
import { updateSolicitudeStatus } from "../services/solicitudes";
import { ClienteFormModal } from "../components/admin/ClienteFormModal";
import { FaturaModal } from "../components/admin/FaturaModal";

type AdminTab = "dashboard" | "orcamento" | "propostas" | "solicitacoes" | "clientes" | "faturacao" | "vendedores" | "delegacoes" | "tarefas" | "marketing";

export function Admin() {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarCollapsed(true);
      else setSidebarCollapsed(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { authenticated, currentUser, login, logout, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  const admin = useAdminData({ currentUserId: currentUser?.id });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab && ["dashboard", "orcamento", "propostas", "solicitacoes", "clientes", "faturacao", "vendedores", "tarefas", "marketing"].includes(tab)) {
      setActiveTab(tab as AdminTab);
    }
  }, []);

  useEffect(() => {
    if (authenticated) admin.loadAll();
  }, [authenticated]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    const result = await login("admin", username, password);
    
    if (result?.success) {
      setError("");
      setLoginAttempts(0);
      admin.loadAll();
    } else {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      if (newAttempts >= 5) {
        setIsLocked(true);
        setError("Too many attempts. Please try again in 30 seconds.");
        setTimeout(() => {
          setIsLocked(false);
          setLoginAttempts(0);
          setError("");
        }, 30000);
      } else {
        setError("Incorrect username or password.");
      }
    }
  };

  if (authLoading || authenticated === null) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fcf9f7' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(242, 92, 5, 0.1)', borderTop: '3px solid #F25C05', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 48, maxWidth: 420, width: "100%", boxShadow: "0 8px 40px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #F25C05 0%, #F22283 100%)', borderRadius: 16, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 24 }}>A</div>
            <h1 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 900, fontSize: 28, color: theme.colors.text.primary, marginBottom: 8 }}>
              AI BORA <span style={{ color: "#F22283" }}>Admin</span>
            </h1>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, color: theme.colors.text.secondary }}>Proposal management</p>
          </div>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#666", display: "block", marginBottom: 8 }}>Username</label>
              <input type="email" value={username} onChange={e => setUsername(e.target.value)} placeholder="Email"
                style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "2px solid #e0e0e0", fontSize: 14, fontFamily: "Montserrat, sans-serif", backgroundColor: "#fafafa", color: theme.colors.text.primary }} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#666", display: "block", marginBottom: 8 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"
                style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "2px solid #e0e0e0", fontSize: 14, fontFamily: "Montserrat, sans-serif", backgroundColor: "#fafafa", color: theme.colors.text.primary }} />
            </div>
            {error && <p style={{ color: "#F22283", fontSize: 13, marginBottom: 20, textAlign: "center", fontWeight: 600 }}>{error}</p>}
            <button type="submit"
              style={{ width: "100%", padding: "16px", borderRadius: 12, background: `linear-gradient(135deg, ${theme.colors.accent.primary} 0%, #F22283 100%)`, color: "#fff", border: "none", fontWeight: 700, cursor: "pointer", fontSize: 14, fontFamily: "Montserrat, sans-serif", boxShadow: "0 4px 20px rgba(242,34,131,0.3)" }}>
              Sign in
            </button>
          </form>
        </div>
      </div>
    );
  }

  const sidebarWidth = isMobile ? 0 : (sidebarCollapsed ? 80 : 280);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fcf9f7", display: "flex", position: "relative" }}>
      <Sidebar
        activeTab={activeTab}
        onTabChange={tab => {
          setActiveTab(tab as AdminTab);
          if (isMobile) setSidebarCollapsed(true);
        }}
        userName={currentUser?.nome || ""}
        onLogout={() => logout("admin")}
        proposalCount={admin.proposals.length}
        clienteCount={admin.clientes.length}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobile={isMobile}
        onCloseMobile={() => setSidebarCollapsed(true)}
      />

      <div style={{ 
        flex: 1, 
        marginLeft: sidebarWidth, 
        transition: "margin-left 0.3s ease",
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        width: isMobile ? '100%' : `calc(100% - ${sidebarWidth}px)`
      }}>
        <AdminHeader 
          userName={currentUser?.nome || "Admin"} 
          userRole="ADMIN"
          onLogout={() => logout("admin")}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          isMobile={isMobile}
          onNavigate={(tab) => setActiveTab(tab as any)}
        />

        <main style={{ 
          padding: isMobile ? '24px 16px' : '40px 60px', 
          flex: 1,
          overflowX: 'auto',
          width: '100%'
        }}>
          {activeTab === "dashboard" && (
              <Dashboard
                stats={admin.stats}
                proposals={admin.proposals}
                solicitudes={admin.solicitudes}
                clientes={admin.clientes}
                onExport={() => exportToExcel(admin.proposals, admin.solicitudes, admin.clientes, admin.vendedores)}
              onNovoOrcamento={() => navigate("/admin/orcamento")}
              onNovoCliente={() => { admin.setClienteFormData({ nome: "", email: "", telemovel: "", nif: "", morada: "", categoria: "curioso", observacoes: "" }); admin.setShowClienteForm(true); }}
              onNovaFatura={() => admin.abrirFatura({} as any)}
              onNavigate={tab => setActiveTab(tab as AdminTab)}
              isMobile={isMobile}
            />
          )}

          {activeTab === "propostas" && (
            <Propostas
              proposals={admin.proposals}
              loading={admin.loading}
              editingId={admin.editingId}
              editData={admin.editData}
              onEdit={admin.handleEdit}
              onSave={admin.handleUpdate}
              onCancel={admin.cancelEdit}
              onUpdateEditData={admin.setEditData}
              onDelete={admin.handleDelete}
              onMarcarEnviada={admin.handleMarcarEnviada}
              onRegistrarResposta={admin.handleRegistrarResposta}
              onRefresh={admin.loadProposals}
              onEditOrcamento={id => navigate(`/admin/orcamento?edit=${id}`)}
            />
          )}

          {activeTab === "solicitacoes" && (
            <Solicitacoes
              solicitudes={admin.solicitudes}
              contactos={admin.contactos}
              loading={admin.loading}
              onRefresh={admin.loadSolicitudes}
              onCriarProposta={id => navigate(`/admin/orcamento?sol=${id}`)}
              onCriarCliente={admin.handleCriarClienteFromSolicitude}
              onUpdateStatus={updateSolicitudeStatus}
              onDelete={admin.handleEliminarSolicitude}
              vendedores={admin.vendedores}
            />
          )}

          {activeTab === "clientes" && (
            <Clientes
              clientes={admin.clientes}
              vendedores={admin.vendedores}
              search={admin.clienteSearch}
              onSearchChange={admin.setClienteSearch}
              filterCategoria={admin.clienteFilterCategoria}
              onFilterCategoriaChange={admin.setClienteFilterCategoria}
              filterOrigem={admin.clienteFilterOrigem}
              onFilterOrigemChange={admin.setClienteFilterOrigem}
              filterResposta={admin.clienteFilterResposta}
              onFilterRespostaChange={admin.setClienteFilterResposta}
              sortBy={admin.clienteSortBy}
              onSortByChange={admin.setClienteSortBy}
              sortOrder={admin.clienteSortOrder}
              onSortOrderChange={admin.setClienteSortOrder}
              selectedCliente={admin.selectedCliente}
              onSelectCliente={admin.setSelectedCliente}
              onNovoCliente={() => { admin.setClienteFormData({ nome: "", email: "", telemovel: "", nif: "", morada: "", categoria: "curioso", observacoes: "" }); admin.setShowClienteForm(true); }}
              onVincularProposta={admin.handleVincularProposta}
              onVerProposta={id => window.open(`/p/${id}`, "_blank")}
              onVerFicha={c => admin.setSelectedCliente(c)}
              onEditarProposta={id => { admin.handleEdit(id); setActiveTab("propostas"); }}
              onFaturar={c => admin.abrirFatura(c)}
              onEditar={(c) => { admin.setClienteFormData(c); admin.setShowClienteForm(true); }}
              onEliminar={admin.handleEliminarCliente}
              onNavigateFaturacao={() => setActiveTab("faturacao")}
              onUpdateProcesso={async (id, processo) => { 
                try {
                  const { updateCliente } = await import('../services/firebase');
                  await updateCliente(id, { processo });
                  admin.loadClientes();
                } catch(e) { console.error(e); }
              }}
              onUpdateTarefas={async (id, tarefas) => {
                try {
                  const { updateCliente } = await import('../services/firebase');
                  await updateCliente(id, { tarefas });
                  admin.loadClientes();
                } catch(e) { console.error(e); }
              }}
              onDelegarVendedor={admin.handleDelegarVendedor}
            />
          )}

          {activeTab === "faturacao" && (
            <Faturacao
              clientes={admin.clientes}
              onCriarFatura={admin.abrirFatura}
              onNavigateClientes={() => setActiveTab("clientes")}
            />
          )}

          {activeTab === "vendedores" && (
            <VendoresAdmin
              onNavigateVendas={(id) => navigate(`/vendas?v=${id}`)}
            />
          )}

          {activeTab === "delegacoes" && (
            <DelegacoesAdmin />
          )}

          {activeTab === "tarefas" && (
                <TarefasKanban
                  tareas={admin.tareas}
                  clientes={admin.clientes}
                  vendedores={admin.vendedores}
                  isAdmin={true}
                  onRefresh={admin.loadTareas}
                  onVerFicha={(id) => { admin.onVerFicha(id); setActiveTab('clientes'); }}
                />
          )}

          {activeTab === "marketing" && (
            <Marketing clientes={admin.clientes} />
          )}
        </main>
      </div>

      {/* Client and invoice modals */}
      {admin.showClienteForm && admin.clienteFormData && (
        <ClienteFormModal
          clienteFormData={admin.clienteFormData}
          clientes={admin.clientes}
          clienteSearch={admin.clienteSearch}
          showClienteSuggestions={admin.showClienteSuggestions}
          onClienteSearchChange={admin.setClienteSearch}
          onSuggestionSelect={(c) => {
            admin.setClienteFormData({...admin.clienteFormData, ...c});
            admin.setShowClienteSuggestions(false);
          }}
          onFieldChange={(f, v) => admin.setClienteFormData({...admin.clienteFormData, [f]: v})}
          onSave={admin.handleSalvarCliente}
          onClose={admin.closeClienteForm}
        />
      )}

      {admin.showFaturaModal && admin.faturaData && (
        <FaturaModal
          faturaData={admin.faturaData}
          numeroFatura={admin.numeroFatura}
          onNumeroFaturaChange={admin.setNumeroFatura}
          onConfirm={() => { alert('Invoice generated successfully in background routines.'); admin.closeFaturaModal(); }}
          onClose={admin.closeFaturaModal}
        />
      )}
    </div>
  );
}
