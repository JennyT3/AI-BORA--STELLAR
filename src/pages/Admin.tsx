import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Sidebar } from "../components/admin/Sidebar";
import { AdminHeader } from "../components/admin/AdminHeader";
import { Dashboard } from "./admin/Dashboard";
import { Propostas } from "./admin/Propostas";
import { Clientes } from "./admin/Clientes";
import { TarefasKanban } from "./admin/TarefasKanban";
import { useAuth } from "../hooks/useAuth";
import { useAdminData } from "../hooks/useAdminData";
import { updateSolicitudeStatus } from "../services/solicitudes";
import { ClienteFormModal } from "../components/admin/ClienteFormModal";
import { FaturaModal } from "../components/admin/FaturaModal";
import { FileText, Users, CheckSquare, Bot, Home, GraduationCap, ExternalLink, MessageCircle, X, Send } from "lucide-react";

type AdminTab = "dashboard" | "propostas" | "clientes" | "tarefas";

export function Admin() {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [passkeyAuth, setPasskeyAuth] = useState<boolean | null>(null);
  const [userName, setUserName] = useState("");
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    { role: 'bot', text: "Hi! I'm Bora, your AI assistant. How can I help you navigate AI BORA?" }
  ]);

  const [, navigate] = useLocation();

  useEffect(() => {
    const name = localStorage.getItem('aibora_user_name') || '';
    const company = localStorage.getItem('aibora_company_name') || '';
    setUserName(name || company || 'Admin');
  }, []);

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

  const passkeyUserId = typeof window !== 'undefined' ? localStorage.getItem('aibora_passkey_id') : null;
  const effectiveUserId = currentUser?.id || passkeyUserId || 'passkey_user';

  const admin = useAdminData({ currentUserId: effectiveUserId });

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
        publicKey: { challenge, timeout: 60000, userVerification: 'preferred' }
      });

      if (credential) {
        localStorage.setItem('aibora_passkey_user', 'true');
        setPasskeyAuth(true);
        admin.loadAll();
      }
    } catch (err: any) {
      if (err.name === 'NotAllowedError') setError('Authentication cancelled.');
      else if (err.name === 'InvalidStateError') {
        setError('No passkey found. Create an account first.');
        setTimeout(() => window.location.href = '/register', 2000);
      } else {
        setError('Authentication failed.');
      }
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    setChatMessages(prev => [...prev, { role: 'user', text: chatMessage }]);
    const userMsg = chatMessage;
    setChatMessage("");
    
    setTimeout(() => {
      let response = "I'm here to help! You can ask me about proposals, payments, or how the AI agent works.";
      if (userMsg.toLowerCase().includes('proposal') || userMsg.toLowerCase().includes('pdf')) {
        response = "To create a proposal: Click 'New Proposal' → Fill client details & services → Generate PDF with Stellar hash → Send to client.";
      } else if (userMsg.toLowerCase().includes('payment') || userMsg.toLowerCase().includes('collaborator')) {
        response = "Payments work like this: Client accepts proposal → Tasks created → AI agent pays collaborators automatically → 70/30 split on-chain.";
      } else if (userMsg.toLowerCase().includes('agent') || userMsg.toLowerCase().includes('ai')) {
        response = "The AI agent uses x402 protocol: It discovers services, reads 402 Payment Required headers, and pays automatically via Stellar.";
      }
      setChatMessages(prev => [...prev, { role: 'bot', text: response }]);
    }, 500);
  };

  if (authLoading || authenticated === null) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F7F4' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(242, 92, 5, 0.1)', borderTop: '3px solid #F25C05', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!authenticated && !passkeyAuth) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ backgroundColor: "rgba(30, 41, 59, 0.9)", backdropFilter: "blur(20px)", borderRadius: 24, padding: 48, maxWidth: 400, width: "100%", border: "1px solid rgba(242, 92, 5, 0.3)" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <img src="/logo.png" alt="AI BORA" style={{ height: 48, marginBottom: 16 }} />
            <h1 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 900, fontSize: 24, color: "#fff", marginBottom: 8 }}>
              AI <span style={{ color: "#F25C05" }}>BORA</span> Admin
            </h1>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, color: "#94a3b8" }}>B2B Sales with Stellar Payments</p>
          </div>
          
          <button onClick={handlePasskeyAuth} style={{ width: "100%", padding: 14, borderRadius: 12, background: "linear-gradient(135deg, #F25C05 0%, #F22283 100%)", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer", fontSize: 14, marginBottom: 12 }}>
            Sign in with Passkey
          </button>
          <a href="/register" style={{ width: "100%", padding: 14, borderRadius: 12, background: "transparent", color: "#fff", border: "2px solid rgba(255,255,255,0.2)", fontWeight: 600, cursor: "pointer", fontSize: 14, textDecoration: "none", textAlign: "center", display: "block" }}>
            Create Account
          </a>

          {error && <p style={{ color: "#f87171", fontSize: 13, marginTop: 16, textAlign: "center" }}>{error}</p>}
        </div>
      </div>
    );
  }

  const sidebarWidth = isMobile ? 0 : (sidebarCollapsed ? 80 : 240);

  // Sample Proposal PDF Card
  const SampleProposalCard = () => (
    <div style={{ 
      background: 'white', 
      borderRadius: 16, 
      padding: 20, 
      marginBottom: 24,
      border: '1px solid rgba(0,0,0,0.06)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'Montserrat', fontSize: 14, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
          📄 Sample Proposal (with Stellar Hash)
        </h3>
        <a 
          href="https://stellar.expert/explorer/testnet/tx/227828308b72a57f6df4ab4346ad7f9811a682bc3eee7cfc30c1011fe89de549"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 12, color: '#F25C05', textDecoration: 'none', fontWeight: 600 }}
        >
          View on Explorer →
        </a>
      </div>
      <div style={{ 
        background: '#F8F7F4', 
        borderRadius: 8, 
        padding: 16, 
        fontFamily: 'monospace', 
        fontSize: 11,
        color: '#666',
        marginBottom: 12,
        overflow: 'auto'
      }}>
        <div style={{ marginBottom: 8 }}><strong>Contract:</strong> CCP4JPWI33BC2XCDOLEDOIURMP7NPBY7I532H4N56ZDBCXX3A6BZNZ3P</div>
        <div style={{ marginBottom: 8 }}><strong>Transaction:</strong> 227828308b72a57f6df4ab4346ad7f9811a682bc3eee7cfc30c1011fe89de549</div>
        <div style={{ marginBottom: 8 }}><strong>Split:</strong> 70% Company / 30% Collaborator</div>
        <div><strong>Network:</strong> Stellar Testnet</div>
      </div>
      <p style={{ fontFamily: 'Montserrat', fontSize: 12, color: '#888', margin: 0 }}>
        When you create a proposal, PDF is generated with a blockchain hash for verification.
      </p>
    </div>
  );

  // Flow Explanation
  const FlowCard = () => (
    <div style={{ 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', 
      borderRadius: 16, 
      padding: 20, 
      marginBottom: 24,
      color: '#fff'
    }}>
      <h3 style={{ fontFamily: 'Montserrat', fontSize: 14, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Bot size={18} color="#F25C05" /> How AI BORA Works
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {[
          { step: '1', title: 'Create Proposal', desc: 'Admin creates proposal → PDF with Stellar hash' },
          { step: '2', title: 'Client Accepts', desc: 'Client receivesSecure link → Accepts proposal' },
          { step: '3', title: 'Tasks Created', desc: 'Services become tasks → Assigned to collaborators' },
          { step: '4', title: 'AI Agent Pays', desc: 'Agent discovers services → Pays via x402 protocol' },
          { step: '5', title: '70/30 Split', desc: 'PaymentSplitter contract → Auto distribution' },
        ].map((item, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ 
                width: 24, 
                height: 24, 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #F25C05, #F22283)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700
              }}>{item.step}</span>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{item.title}</span>
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', margin: 0 }}>{item.desc}</p>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <a href="/agent-x402-demo" style={{ 
          padding: '8px 16px', 
          background: '#F25C05', 
          color: '#fff', 
          borderRadius: 8, 
          textDecoration: 'none', 
          fontSize: 12, 
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <Bot size={14} /> Watch AI Agent
        </a>
        <a href="https://github.com/JennyT3/AI-BORA--STELLAR" target="_blank" rel="noopener noreferrer" style={{ 
          padding: '8px 16px', 
          background: 'rgba(255,255,255,0.1)', 
          color: '#fff', 
          borderRadius: 8, 
          textDecoration: 'none', 
          fontSize: 12, 
          fontWeight: 600
        }}>
          📄 Documentation
        </a>
      </div>
    </div>
  );

  // Quick Links
  const QuickLinks = () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
      <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#F8F7F4', borderRadius: 8, textDecoration: 'none', color: '#1A1A1A', fontSize: 12, fontWeight: 600 }}>
        <Home size={14} /> Home
      </a>
      <a href="/agent-x402-demo" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: 8, textDecoration: 'none', color: '#22c55e', fontSize: 12, fontWeight: 600 }}>
        <Bot size={14} /> AI Agent Demo
      </a>
      <a href="/onboarding" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(242, 92, 5, 0.1)', borderRadius: 8, textDecoration: 'none', color: '#F25C05', fontSize: 12, fontWeight: 600 }}>
        <GraduationCap size={14} /> Onboarding
      </a>
      <a href="/academy" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(242, 34, 131, 0.1)', borderRadius: 8, textDecoration: 'none', color: '#F22283', fontSize: 12, fontWeight: 600 }}>
        <GraduationCap size={14} /> Academy
      </a>
      <a href="https://aibora.pt/" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#1a1a1a', borderRadius: 8, textDecoration: 'none', color: '#fff', fontSize: 12, fontWeight: 600 }}>
        <ExternalLink size={14} /> aibora.pt
      </a>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8F7F4", display: "flex", position: "relative" }}>
      <Sidebar
        activeTab={activeTab}
        onTabChange={tab => {
          setActiveTab(tab as AdminTab);
          if (isMobile) setSidebarCollapsed(true);
        }}
        userName={currentUser?.nome || userName}
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
          userName={currentUser?.nome || userName} 
          userRole="ADMIN"
          onLogout={() => logout("admin")}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          isMobile={isMobile}
          onNavigate={(tab) => setActiveTab(tab as any)}
        />

        <main style={{ 
          padding: isMobile ? '20px 16px' : '32px 40px', 
          flex: 1,
          overflowX: 'auto',
          width: '100%'
        }}>
          {activeTab === 'dashboard' && (
            <>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 900, color: '#1A1A1A', marginBottom: 8, fontFamily: 'Montserrat' }}>
                  Welcome, {userName}
                </h1>
                <p style={{ color: '#666', fontSize: 14, margin: 0, fontFamily: 'Montserrat' }}>
                  Manage proposals, payments, and AI agent flows
                </p>
              </div>

              <QuickLinks />
              <FlowCard />
              <SampleProposalCard />
            </>
          )}

          {activeTab === "dashboard" && (
            <Dashboard
              stats={admin.stats}
              proposals={admin.proposals}
              solicitudes={admin.solicitudes}
              clientes={admin.clientes}
              onExport={() => {}}
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
              onNavigateFaturacao={() => {}}
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
        </main>
      </div>

      {/* Chatbot Widget */}
      <button
        onClick={() => setShowChatbot(!showChatbot)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #F25C05, #F22283)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(242, 92, 5, 0.4)',
          zIndex: 1000
        }}
      >
        <MessageCircle size={24} color="#fff" />
      </button>

      {/* Chatbot Panel */}
      {showChatbot && (
        <div style={{
          position: 'fixed',
          bottom: 96,
          right: 24,
          width: 360,
          maxHeight: 480,
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          <div style={{ 
            padding: '16px 20px', 
            background: 'linear-gradient(135deg, #F25C05, #F22283)', 
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Bot size={20} />
              <span style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 14 }}>Bora AI Assistant</span>
            </div>
            <button onClick={() => setShowChatbot(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {chatMessages.map((msg, i) => (
              <div key={i} style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%'
              }}>
                <div style={{
                  padding: '10px 14px',
                  borderRadius: msg.role === 'user' ? 16 : 16,
                  borderBottomRightRadius: msg.role === 'user' ? 4 : 16,
                  borderBottomLeftRadius: msg.role === 'bot' ? 4 : 16,
                  background: msg.role === 'user' ? '#F25C05' : '#F8F7F4',
                  color: msg.role === 'user' ? '#fff' : '#1A1A1A',
                  fontFamily: 'Montserrat',
                  fontSize: 13
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          
          <form onSubmit={handleChatSubmit} style={{ padding: '12px 16px', borderTop: '1px solid #eee', display: 'flex', gap: 8 }}>
            <input
              value={chatMessage}
              onChange={e => setChatMessage(e.target.value)}
              placeholder="Ask about proposals, payments..."
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 12,
                border: '1px solid #ddd',
                fontSize: 13,
                fontFamily: 'Montserrat',
                outline: 'none'
              }}
            />
            <button type="submit" style={{
              padding: '10px 16px',
              background: '#F25C05',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              cursor: 'pointer'
            }}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {admin.showClienteForm && admin.clienteFormData && (
        <ClienteFormModal
          clienteFormData={admin.clienteFormData}
          clientes={admin.clientes}
          clienteSearch={admin.clienteSearch}
          showClienteSuggestions={admin.showClienteSuggestions}
          onClienteSearchChange={admin.setClienteSearch}
          onSuggestionSelect={(c) => { admin.setClienteFormData({...admin.clienteFormData, ...c}); admin.setShowClienteSuggestions(false); }}
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
          onConfirm={() => { alert('Invoice generated'); admin.closeFaturaModal(); }}
          onClose={admin.closeFaturaModal}
        />
      )}
    </div>
  );
}