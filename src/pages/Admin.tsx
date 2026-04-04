import { useState, useEffect, FormEvent } from "react";
import { getProposal, listProposals, updateProposal, deleteProposal, createCliente, listClientes, updateCliente, deleteCliente } from "../services/firebase";
import { listSolicitudes, updateSolicitudeStatus, deleteSolicitude } from "../services/solicitudes";
import { Sidebar } from "../components/admin/Sidebar";
import { StatsCard } from "../components/admin/StatsCard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { theme } from "../styles/theme";
import { Dashboard } from "./admin/Dashboard";
import { Propostas } from "./admin/Propostas";
import { Solicitacoes } from "./admin/Solicitacoes";
import { Clientes } from "./admin/Clientes";
import { Faturacao } from "./admin/Faturacao";
import { VendoresAdmin } from "./admin/Vendores";
import { FileSpreadsheet } from "lucide-react";
import { gerarFaturaPDF } from "../services/pdfAdmin";
import { ClienteFormModal } from "../components/admin/ClienteFormModal";
import { FaturaModal } from "../components/admin/FaturaModal";
import { exportToExcel } from "../services/exportService";
import { Proposal, Solicitude, Cliente } from "../types";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "aibora2026";

interface User {
  id: string;
  nome: string;
  role: "admin" | "user";
}

const USERS: User[] = [
  { id: "jenny", nome: "Jenny", role: "admin" },
  { id: "portugal", nome: "Portugal", role: "user" },
];

export function Admin() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "orcamento" | "propostas" | "solicitacoes" | "clientes" | "faturacao" | "vendedores">("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [solicitudes, setSolicitudes] = useState<Solicitude[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, enviadas: 0, respondidas: 0, aceitas: 0, reagendadas: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [showFaturaModal, setShowFaturaModal] = useState(false);
  const [faturaData, setFaturaData] = useState<Proposal | null>(null);
  const [numeroFatura, setNumeroFatura] = useState("");
  const [showClienteForm, setShowClienteForm] = useState(false);
  const [clienteFormData, setClienteFormData] = useState<Partial<Cliente> | null>(null);
  const [clienteProposalData, setClienteProposalData] = useState<Proposal | null>(null);
  const [clienteSearch, setClienteSearch] = useState("");
  const [showClienteSuggestions, setShowClienteSuggestions] = useState(false);
  const [clienteFilterCategoria, setClienteFilterCategoria] = useState<string>("todos");
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [clienteSortBy, setClienteSortBy] = useState<"nome" | "createdAt" | "propostaValor">("createdAt");
  const [clienteSortOrder, setClienteSortOrder] = useState<"asc" | "desc">("desc");
  const [clienteFilterOrigem, setClienteFilterOrigem] = useState<string>("todos");
  const [clienteFilterResposta, setClienteFilterResposta] = useState<string>("todos");
  const [showVendedorForm, setShowVendedorForm] = useState(false);



  const abrirFatura = (p: any) => {
    setFaturaData(p);
    setNumeroFatura(`FAC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`);
    setShowFaturaModal(true);
  };

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    const user = USERS.find(u => u.id === username.toLowerCase());
    if (user && password === ADMIN_PASSWORD) {
      setAuthenticated(true); setCurrentUser(user); localStorage.setItem("adminUser", JSON.stringify(user)); setError(""); loadAll();
    } else { setError("Utilizador ou password incorretos"); }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab && ["dashboard", "orcamento", "propostas", "solicitacoes", "clientes", "faturacao"].includes(tab)) {
      setActiveTab(tab as any);
    }
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem("adminUser");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setAuthenticated(true);
      loadAll();
    }
  }, []);

  const loadAll = () => { loadProposals(); loadSolicitudes(); loadClientes(); loadStats(); };
  useEffect(() => { if (authenticated) loadAll(); }, [authenticated]);

  const loadStats = async () => { try { const data = await listProposals(500); setStats({ total: data.length, enviadas: data.filter(p => p.dataEnvio).length, respondidas: data.filter(p => p.resposta).length, aceitas: data.filter(p => p.resposta === "sim").length, reagendadas: data.filter(p => p.resposta === "reagendar").length }); } catch (e) { console.error(e); } };
  const loadProposals = async () => { setLoading(true); try { const data = await listProposals(100); setProposals(data); } catch (err) { console.error(err); } setLoading(false); };
  const loadSolicitudes = async () => { setLoading(true); try { const data = await listSolicitudes(100); setSolicitudes(data); } catch (err) { console.error(err); } setLoading(false); };
  const loadClientes = async () => { setLoading(true); try { const data = await listClientes(100); setClientes(data); } catch (err) { console.error(err); } setLoading(false); };

  const handleUpdate = async (id: string) => { try { await updateProposal(id, { ...editData, atualizadoPor: currentUser?.id, atualizadoEm: new Date().toISOString() }); setEditingId(null); loadProposals(); alert("Proposta atualizada!"); } catch (err: any) { alert("Erro: " + err.message); } };
  const handleDelete = async (id: string, cliente: string) => { if (!confirm(`Eliminar proposta de ${cliente}?`)) return; try { await deleteProposal(id); loadProposals(); alert("Proposta eliminada"); } catch (err: any) { alert("Erro: " + err.message); } };
  const handleMarcarEnviada = async (proposal: any) => { const dataEnvio = prompt("Data de envio (DD/MM/AAAA):", new Date().toLocaleDateString("pt-PT")); if (!dataEnvio) return; try { await updateProposal(proposal.id, { dataEnvio, enviadoPor: currentUser?.id }); loadProposals(); } catch (e) { alert("Erro: " + e); } };
  const handleRegistrarResposta = async (proposal: any) => { const resposta = prompt("Resposta do cliente (sim/nao):", proposal.resposta || ""); if (!resposta || (resposta !== "sim" && resposta !== "nao")) { alert("Resposta deve ser 'sim' ou 'nao'"); return; } try { 
    await updateProposal(proposal.id, { resposta: resposta.toLowerCase(), dataResposta: new Date().toISOString(), respondidoPor: currentUser?.id });
    const clienteVinculado = clientes.find(c => c.propostaId === proposal.id);
    if (clienteVinculado) { await updateCliente(clienteVinculado.id, { resposta: resposta.toLowerCase(), dataResposta: new Date().toISOString(), categoria: resposta === "sim" ? "cliente" : "sem_interesse" }); loadClientes(); }
    loadProposals(); 
  } catch (e) { alert("Erro: " + e); } };
  const handleCriarCliente = (proposal: any) => {
    const existingClienteByProposta = clientes.find(c => c.propostaId === proposal.id);
    const existingClienteByContact = clientes.find(c => 
      (c.email && c.email.toLowerCase() === proposal.email?.toLowerCase()) ||
      (c.telemovel && c.telemovel === proposal.telefone)
    );
    
    if (existingClienteByProposta) {
      alert(`Cliente já criado e vinculado a esta proposta: ${existingClienteByProposta.nome}. Pode editá-lo na aba Clientes.`);
      setSelectedCliente(existingClienteByProposta);
      setActiveTab("clientes");
      return;
    }
    
    if (existingClienteByContact) {
      if (confirm(`Cliente "${existingClienteByContact.nome}" já existe (criado anteriormente). Deseja vincular esta proposta (${proposal.numeroOrcamento}) a este cliente?`)) {
        updateCliente(existingClienteByContact.id, {
          propostaId: proposal.id,
          propostaNumero: proposal.numeroOrcamento,
          propostaValor: proposal.valor,
          resposta: proposal.resposta || "",
          dataResposta: proposal.dataResposta || "",
          dataEnvio: proposal.dataEnvio || "",
          categoria: proposal.resposta === "sim" ? "cliente" : (proposal.dataEnvio ? "proposta_enviada" : existingClienteByContact.categoria),
          observacoes: `Proposta vinculada: ${proposal.numeroOrcamento} - Valor: ${proposal.valor}€\n\n${existingClienteByContact.observacoes || ""}`
        }).then(() => {
          loadClientes();
          alert("Cliente atualizado com sucesso! Proposta vinculada.");
        });
      }
      return;
    }
    
    setClienteProposalData(proposal); 
    setClienteFormData({ nome: proposal.cliente || "", email: proposal.email || "", telemovel: proposal.telefone || "", nif: proposal.nif || "", morada: proposal.morada || "", categoria: proposal.resposta === "sim" ? "cliente" : (proposal.dataEnvio ? "proposta_enviada" : "potencial"), origem: "Website", observacoes: `Proposta aceita: ${proposal.numeroOrcamento} - Valor: ${proposal.valor}€`, propostaId: proposal.id, propostaNumero: proposal.numeroOrcamento, propostaValor: proposal.valor, resposta: proposal.resposta || "", dataResposta: proposal.dataResposta || "", dataEnvio: proposal.dataEnvio || "", criadoPor: proposal.criadoPor || "" }); 
    setShowClienteForm(true); 
  };
  const handleCriarClienteFromSolicitude = (sol: any) => { setClienteFormData({ nome: sol.nome || "", email: sol.email || "", telemovel: sol.telefone || "", nif: "", morada: "", empresa: sol.empresa || "", website: sol.website || "", categoria: "potencial", origem: sol.origem || "Website", observacoes: `Solicitação: ${sol.servicos?.join(", ")}`, solicitacaoId: sol.id, servicos: sol.servicos || [], criadoPor: currentUser?.id }); setShowClienteForm(true); };
  const handleSalvarCliente = async () => { try { await createCliente({ ...clienteFormData, criadoPor: currentUser?.id }); setShowClienteForm(false); setClienteFormData(null); setClienteSearch(""); setShowClienteSuggestions(false); loadClientes(); alert("Cliente criado com sucesso!"); } catch (err: any) { alert("Erro: " + err.message); } };

  if (!authenticated) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 48, maxWidth: 420, width: "100%", boxShadow: "0 8px 40px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <img src="/logo.png" alt="AI BORA" style={{ width: 80, height: 80, borderRadius: 16, marginBottom: 20 }} />
            <h1 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 900, fontSize: 28, color: "theme.colors.text.primary", marginBottom: 8 }}>AI BORA <span style={{ color: "#F22283" }}>Admin</span></h1>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, color: "theme.colors.text.secondary" }}>Gestao de Propostas</p>
          </div>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#666", display: "block", marginBottom: 8 }}>Utilizador</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="jenny ou portugal" style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "2px solid #e0e0e0", fontSize: 14, fontFamily: "Montserrat, sans-serif", backgroundColor: "#fafafa", color: "theme.colors.text.primary" }} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#666", display: "block", marginBottom: 8 }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "2px solid #e0e0e0", fontSize: 14, fontFamily: "Montserrat, sans-serif", backgroundColor: "#fafafa", color: "theme.colors.text.primary" }} />
            </div>
            {error && <p style={{ color: "#F22283", fontSize: 13, marginBottom: 20, textAlign: "center", fontWeight: 600 }}>{error}</p>}
            <button type="submit" style={{ width: "100%", padding: "16px", borderRadius: 12, background: "linear-gradient(135deg, theme.colors.accent.primary 0%, #F22283 100%)", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer", fontSize: 14, fontFamily: "Montserrat, sans-serif", boxShadow: "0 4px 20px rgba(242,34,131,0.3)" }}>Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  const getUserName = (userId: string) => USERS.find(u => u.id === userId)?.nome || userId;
  const getStatusColor = (p: any) => { if (p.resposta === "sim") return "#10B981"; if (p.resposta === "nao") return "#dc2626"; if (p.resposta === "reagendar") return "theme.colors.accent.primary"; if (p.dataEnvio) return "#3498DB"; return "theme.colors.text.secondary"; };
  const getStatusLabel = (p: any) => { if (p.resposta === "sim") return "Aceite"; if (p.resposta === "nao") return "Recusada"; if (p.resposta === "reagendar") return "Reagendada"; if (p.dataEnvio) return "Enviada"; return "Pendente"; };
  const getCategoriaColor = (cat: string) => { 
    if (cat === "cliente") return "#10B981"; 
    if (cat === "proposta_enviada") return "#F59E0B"; 
    if (cat === "potencial") return "#F97316"; 
    if (cat === "curioso") return "#8B5CF6"; 
    if (cat === "sem_interesse") return "#DC2626"; 
    return "theme.colors.text.secondary"; 
  };
  const getCategoriaLabel = (cat: string) => { 
    if (cat === "cliente") return "Cliente"; 
    if (cat === "proposta_enviada") return "Proposta Enviada"; 
    if (cat === "potencial") return "Potencial"; 
    if (cat === "curioso") return "Curioso"; 
    if (cat === "sem_interesse") return "Sem Interesse"; 
    return cat; 
  };
  const getRespostaColor = (resposta: string) => {
    if (resposta === "sim") return { bg: "#dcfce7", color: "#16a34a" };
    if (resposta === "nao") return { bg: "#fee2e2", color: "#dc2626" };
    if (resposta === "reagendar") return { bg: "#fef3c7", color: "#d97706" };
    return { bg: "#f3f4f6", color: "#9ca3af" };
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: theme.colors.bg.primary, display: "flex" }}>
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as any)}
        userName={currentUser?.nome || ""}
        onLogout={() => { setAuthenticated(false); setCurrentUser(null); localStorage.removeItem("adminUser"); }}
        proposalCount={proposals.length}
        solicitudCount={solicitudes.filter(s => s.status === "pendente").length}
        clienteCount={clientes.length}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main style={{ flex: 1, padding: 40, overflow: "auto", marginLeft: sidebarCollapsed ? 80 : 260, transition: 'margin-left 0.3s ease' }}>
        {activeTab === "dashboard" && (
          <Dashboard 
            stats={stats} 
            proposals={proposals} 
            solicitudes={solicitudes} 
            clientes={clientes} 
            onExport={() => exportToExcel(proposals, solicitudes)}
            onNovoOrcamento={() => window.location.href = "/admin/orcamento"}
            onNovoCliente={() => { setClienteFormData({ nome: "", email: "", telemovel: "", nif: "", morada: "", categoria: "curioso", observacoes: "" }); setShowClienteForm(true); }}
            onNovaFatura={() => { const faturaNum = `FAC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`; setNumeroFatura(faturaNum); setShowFaturaModal(true); }}
            onNavigate={(tab: string) => setActiveTab(tab as any)}
          />
        )}

        {activeTab === "propostas" && (
          <Propostas 
            proposals={proposals}
            loading={loading}
            editingId={editingId}
            editData={editData}
            onEdit={(id) => { setEditingId(id); const p = proposals.find(p => p.id === id); if (p) setEditData(p); }}
            onSave={handleUpdate}
            onCancel={() => setEditingId(null)}
            onUpdateEditData={setEditData}
            onDelete={handleDelete}
            onMarcarEnviada={handleMarcarEnviada}
            onRegistrarResposta={handleRegistrarResposta}
            onRefresh={loadProposals}
            onEditOrcamento={(id) => window.location.href = `/admin/orcamento?edit=${id}`}
          />
        )}

        {activeTab === "solicitacoes" && (
          <Solicitacoes 
            solicitudes={solicitudes}
            loading={loading}
            onRefresh={loadSolicitudes}
            onCriarProposta={(id) => window.location.href = `/admin/orcamento?sol=${id}`}
            onCriarCliente={handleCriarClienteFromSolicitude}
            onUpdateStatus={updateSolicitudeStatus}
            onDelete={async (id) => { if (confirm("Eliminar solicitação?")) { await deleteSolicitude(id); loadSolicitudes(); } }}
          />
        )}

        {activeTab === "clientes" && (
          <Clientes
            clientes={clientes}
            search={clienteSearch}
            onSearchChange={setClienteSearch}
            filterCategoria={clienteFilterCategoria}
            onFilterCategoriaChange={setClienteFilterCategoria}
            filterOrigem={clienteFilterOrigem}
            onFilterOrigemChange={setClienteFilterOrigem}
            filterResposta={clienteFilterResposta}
            onFilterRespostaChange={setClienteFilterResposta}
            sortBy={clienteSortBy}
            onSortByChange={setClienteSortBy}
            sortOrder={clienteSortOrder}
            onSortOrderChange={setClienteSortOrder}
            selectedCliente={selectedCliente}
            onSelectCliente={setSelectedCliente}
            onNovoCliente={() => { setClienteFormData({ nome: "", email: "", telemovel: "", nif: "", morada: "", categoria: "curioso", observacoes: "" }); setShowClienteForm(true); }}
            onVincularProposta={(c) => { const proposta = proposals.find(p => p.cliente?.toLowerCase().includes(c.nome?.toLowerCase()) || p.email?.toLowerCase() === c.email?.toLowerCase() || p.telefone === c.telemovel); if (proposta) { if (confirm(`Vincular a ${proposta.numeroOrcamento}?`)) { updateCliente(c.id, { propostaId: proposta.id, propostaNumero: proposta.numeroOrcamento, propostaValor: proposta.valor }).then(() => { loadClientes(); alert("Proposta vinculada!"); }); } } else { alert("Nenhuma proposta encontrada para este cliente."); } }}
            onVerProposta={(id) => window.open(`/p/${id}`, "_blank")}
            onEditarProposta={(id) => window.location.href = `/admin/orcamento?edit=${id}`}
            onFaturar={(c) => { setFaturaData(c); setShowFaturaModal(true); }}
            onEditar={(c) => { setClienteFormData(c); setShowClienteForm(true); }}
            onEliminar={(id) => { if (confirm("Eliminar cliente?")) { deleteCliente(id).then(() => loadClientes()); } }}
            onNavigateFaturacao={() => setActiveTab("faturacao")}
            onUpdateProcesso={(clienteId, processo) => { updateCliente(clienteId, { processo }).then(() => loadClientes()); }}
            onUpdateTarefas={(clienteId, tarefas) => { updateCliente(clienteId, { tarefas }).then(() => loadClientes()); }}
          />
        )}

        {activeTab === "faturacao" && (
          <Faturacao 
            clientes={clientes}
            onCriarFatura={(cliente) => { setFaturaData(cliente); setNumeroFatura(`FAC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`); setShowFaturaModal(true); }}
            onNavigateClientes={() => setActiveTab("clientes")}
          />
        )}

        {activeTab === "vendedores" && (
          <VendoresAdmin 
            onNavigateVendas={(vendedorId) => {
              window.open(`/vendas?admin=true&vendedor=${vendedorId}`, "_blank");
            }}
          />
        )}
      </main>

      {showFaturaModal && faturaData && (
        <FaturaModal
          faturaData={faturaData}
          numeroFatura={numeroFatura}
          onNumeroFaturaChange={setNumeroFatura}
          onConfirm={() => {
            gerarFaturaPDF(faturaData, numeroFatura);
            setShowFaturaModal(false);
          }}
          onClose={() => setShowFaturaModal(false)}
        />
      )}

      {showClienteForm && clienteFormData && (
        <ClienteFormModal
          clienteFormData={clienteFormData}
          clientes={clientes}
          clienteSearch={clienteSearch}
          showClienteSuggestions={showClienteSuggestions}
          onClienteSearchChange={(val) => {
            setClienteSearch(val);
            setShowClienteSuggestions(true);
          }}
          onSuggestionSelect={(c) => {
            setClienteFormData({...clienteFormData, nome: c.nome || "", email: c.email || "", telemovel: c.telemovel || "", nif: c.nif || "", morada: c.morada || "" });
            setClienteSearch(c.nome || "");
            setShowClienteSuggestions(false);
          }}
          onFieldChange={(field, value) => {
            setClienteFormData({...clienteFormData, [field]: value});
          }}
          onSave={handleSalvarCliente}
          onClose={() => {
            setShowClienteForm(false);
            setClienteFormData(null);
            setClienteSearch("");
            setShowClienteSuggestions(false);
          }}
        />
      )}
    </div>
  );
}