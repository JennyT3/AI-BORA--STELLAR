import { useState, useEffect, lazy, Suspense } from "react";
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
import { QuickProposalForm } from "../components/admin/QuickProposalForm";

type AdminTab = "dashboard" | "orcamento" | "propostas" | "solicitacoes" | "clientes" | "faturacao" | "vendedores" | "delegacoes" | "tarefas" | "marketing";

export function Admin() {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [passkeyAuth, setPasskeyAuth] = useState<boolean | null>(null);
  const [showQuickProposal, setShowQuickProposal] = useState(false);

  useEffect(() => {
    const checkPasskey = () => {
      const hasPasskey = localStorage.getItem('aibora_passkey_user');
      setPasskeyAuth(!!hasPasskey);
    };
    checkPasskey();
  }, []);

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

  const { authenticated, currentUser, logout, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  const passkeyUserId = typeof window !== 'undefined' ? localStorage.getItem('aibora_passkey_id') : null;
  const effectiveUserId = currentUser?.id || passkeyUserId || 'passkey_user';

  const admin = useAdminData({ currentUserId: effectiveUserId });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab && ["dashboard", "orcamento", "propostas", "solicitacoes", "clientes", "faturacao", "vendedores", "tarefas", "marketing"].includes(tab)) {
      setActiveTab(tab as AdminTab);
    }
  }, []);

  useEffect(() => {
    if (authenticated || passkeyAuth) {
      admin.loadAll();
    }
  }, [authenticated, passkeyAuth]);

  const handlePasskeyAuth = async () => {
    if (!window.PublicKeyCredential) {
      setError('WebAuthn not supported. Please use a modern browser.');
      return;
    }

    setError('');
    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge,
          timeout: 60000,
          userVerification: 'preferred'
        }
      });

      if (credential) {
        const userId = localStorage.getItem('aibora_passkey_id') || 'passkey_user';
        localStorage.setItem('aibora_passkey_user', 'true');
        setPasskeyAuth(true);
        admin.loadAll();
      }
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setError('Authentication cancelled. Please try again.');
      } else if (err.name === 'InvalidStateError') {
        setError('No passkey found. Please create an account first.');
        setTimeout(() => window.location.href = '/register', 2000);
      } else {
        setError('Authentication failed. Please try again.');
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

  if (!authenticated && !passkeyAuth) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ backgroundColor: "rgba(30, 41, 59, 0.8)", backdropFilter: "blur(20px)", borderRadius: 24, padding: 48, maxWidth: 420, width: "100%", border: "1px solid rgba(6, 182, 212, 0.3)" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)', borderRadius: 16, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 24 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white"/>
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" fill="none"/>
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            <h1 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 900, fontSize: 28, color: "#ffffff", marginBottom: 8 }}>
              AI BORA <span style={{ color: "#F25C05" }}>Admin</span>
            </h1>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, color: "#94a3b8" }}>B2B Sales Platform with Stellar</p>
          </div>
          
          <div className="flex flex-col gap-4">
            <button 
              onClick={handlePasskeyAuth}
              style={{ width: "100%", padding: "16px", borderRadius: 12, background: "linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer", fontSize: 14, fontFamily: "Montserrat, sans-serif", boxShadow: "0 4px 20px rgba(6, 182, 212, 0.3)" }}
            >
              🔐 Sign in with Passkey
            </button>
            <a 
              href="/register"
              style={{ width: "100%", padding: "16px", borderRadius: 12, background: "transparent", color: "#fff", border: "2px solid rgba(6, 182, 212, 0.5)", fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "Montserrat, sans-serif", textDecoration: "none", textAlign: "center", display: "block" }}
            >
              ➕ Create Account
            </a>
          </div>

          {error && <p style={{ color: "#f87171", fontSize: 13, marginTop: 20, textAlign: "center", fontWeight: 600 }}>{error}</p>}
          
          <p style={{ color: "#64748b", fontSize: 12, marginTop: 24, textAlign: "center" }}>
            Uses your device's fingerprint or Face ID - no password needed
          </p>
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
              <>
                {showQuickProposal ? (
                  <div className="max-w-2xl mx-auto">
                    <QuickProposalForm 
                      onSuccess={(proposalId) => {
                        admin.loadProposals();
                        setShowQuickProposal(false);
                      }}
                      onCancel={() => setShowQuickProposal(false)}
                    />
                  </div>
                ) : (
                  <>
                    <div className="mb-8 flex justify-center">
                      <button
                        onClick={() => setShowQuickProposal(true)}
                        className="px-10 py-5 bg-gradient-to-r from-orange-500 to-fuchsia-600 text-white font-bold text-xl rounded-2xl flex items-center gap-4 hover:opacity-90 transition-all transform hover:scale-[1.02] shadow-lg"
                      >
                        <span className="text-2xl">➕</span>
                        New Quick Proposal
                      </button>
                    </div>
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
                  </>
                )}
              </>
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
