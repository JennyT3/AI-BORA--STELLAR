import { useState, useEffect, FormEvent } from "react";
import { useLocation } from "wouter";
import { updateCliente } from "../services/firebase";
import { updateSolicitudeStatus } from "../services/solicitudes";
import { Sidebar } from "../components/admin/Sidebar";
import { theme } from "../styles/theme";
import { Dashboard } from "./admin/Dashboard";
import { Propostas } from "./admin/Propostas";
import { Solicitacoes } from "./admin/Solicitacoes";
import { Clientes } from "./admin/Clientes";
import { Faturacao } from "./admin/Faturacao";
import { VendoresAdmin } from "./admin/Vendores";
import { gerarFaturaPDF } from "../services/pdfAdmin";
import { ClienteFormModal } from "../components/admin/ClienteFormModal";
import { FaturaModal } from "../components/admin/FaturaModal";
import { exportToExcel } from "../services/exportService";
import { useAuth } from "../hooks/useAuth";
import { useAdminData } from "../hooks/useAdminData";

type AdminTab = "dashboard" | "orcamento" | "propostas" | "solicitacoes" | "clientes" | "faturacao" | "vendedores";

export function Admin() {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const { authenticated, currentUser, login, logout, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  const admin = useAdminData({ currentUserId: currentUser?.id });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab && ["dashboard", "orcamento", "propostas", "solicitacoes", "clientes", "faturacao"].includes(tab)) {
      setActiveTab(tab as AdminTab);
    }
  }, []);

  useEffect(() => {
    if (authenticated) admin.loadAll();
  }, [authenticated]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    const result = await login("admin", username, password);
    if (result?.success) {
      setError("");
      admin.loadAll();
    } else {
      setError(result?.error || "Erro no login");
    }
  };

  if (authLoading || authenticated === null) {
    return <div style={{ minHeight: "100vh", backgroundColor: "#fff" }} />;
  }

  if (!authenticated) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 48, maxWidth: 420, width: "100%", boxShadow: "0 8px 40px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <img src="/logo.png" alt="AI BORA" style={{ width: 80, height: 80, borderRadius: 16, marginBottom: 20 }} />
            <h1 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 900, fontSize: 28, color: theme.colors.text.primary, marginBottom: 8 }}>
              AI BORA <span style={{ color: "#F22283" }}>Admin</span>
            </h1>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, color: theme.colors.text.secondary }}>Gestão de Propostas</p>
          </div>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#666", display: "block", marginBottom: 8 }}>Utilizador</label>
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
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: theme.colors.bg.primary, display: "flex" }}>
      <Sidebar
        activeTab={activeTab}
        onTabChange={tab => setActiveTab(tab as AdminTab)}
        userName={currentUser?.nome || ""}
        onLogout={() => logout("admin")}
        proposalCount={admin.proposals.length}
        solicitudCount={admin.solicitudes.filter(s => s.status === "pendente").length}
        clienteCount={admin.clientes.length}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main style={{ flex: 1, padding: 40, overflow: "auto", marginLeft: sidebarCollapsed ? 80 : 260, transition: "margin-left 0.3s ease" }}>

        {activeTab === "dashboard" && (
          <Dashboard
            stats={admin.stats}
            proposals={admin.proposals}
            solicitudes={admin.solicitudes}
            clientes={admin.clientes}
            onExport={() => exportToExcel(admin.proposals, admin.solicitudes)}
            onNovoOrcamento={() => navigate("/admin/orcamento")}
            onNovoCliente={() => { admin.setClienteFormData({ nome: "", email: "", telemovel: "", nif: "", morada: "", categoria: "curioso", observacoes: "" }); admin.setShowClienteForm(true); }}
            onNovaFatura={() => admin.abrirFatura({} as any)}
            onNavigate={tab => setActiveTab(tab as AdminTab)}
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
          />
        )}

        {activeTab === "clientes" && (
          <Clientes
            clientes={admin.clientes}
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
            onEditarProposta={id => navigate(`/admin/orcamento?edit=${id}`)}
            onFaturar={admin.abrirFatura}
            onEditar={c => admin.setClienteFormData(c)}
            onEliminar={admin.handleEliminarCliente}
            onNavigateFaturacao={() => setActiveTab("faturacao")}
            onUpdateProcesso={(clienteId, processo) => { updateCliente(clienteId, { processo }).then(() => admin.loadClientes()); }}
            onUpdateTarefas={(clienteId, tarefas) => { updateCliente(clienteId, { tarefas }).then(() => admin.loadClientes()); }}
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
            onNavigateVendas={vendedorId => window.open(`/vendas?admin=true&vendedor=${vendedorId}`, "_blank")}
          />
        )}
      </main>

      {admin.showFaturaModal && admin.faturaData && (
        <FaturaModal
          faturaData={admin.faturaData}
          numeroFatura={admin.numeroFatura}
          onNumeroFaturaChange={admin.setNumeroFatura}
          onConfirm={() => {
            gerarFaturaPDF(admin.faturaData!, admin.numeroFatura);
            admin.closeFaturaModal();
          }}
          onClose={admin.closeFaturaModal}
        />
      )}

      {admin.showClienteForm && admin.clienteFormData && (
        <ClienteFormModal
          clienteFormData={admin.clienteFormData}
          clientes={admin.clientes}
          clienteSearch={admin.clienteSearch}
          showClienteSuggestions={admin.showClienteSuggestions}
          onClienteSearchChange={val => {
            admin.setClienteSearch(val);
            admin.setShowClienteSuggestions(true);
          }}
          onSuggestionSelect={c => {
            admin.setClienteFormData({ ...admin.clienteFormData, nome: c.nome || "", email: c.email || "", telemovel: c.telemovel || "", nif: c.nif || "", morada: c.morada || "" });
            admin.setClienteSearch(c.nome || "");
            admin.setShowClienteSuggestions(false);
          }}
          onFieldChange={(field, value) => {
            admin.setClienteFormData({ ...admin.clienteFormData, [field]: value });
          }}
          onSave={admin.handleSalvarCliente}
          onClose={admin.closeClienteForm}
        />
      )}
    </div>
  );
}