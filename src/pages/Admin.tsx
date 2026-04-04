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
import { FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

const exportToExcel = (proposals: any[], solicitudes: any[]) => {
  const csvProposals = "Nº Orçamento,Cliente,Email,Telefone,Valor,Data,Criado Por,Status,Data Envio,Resposta\n" + 
    proposals.map(p => `"${p.numeroOrcamento}","${p.cliente}","${p.email || ''}","${p.telefone || ''}",${p.valor || 0},"${new Date(p.createdAt).toLocaleDateString('pt-PT')}","${p.criadoPor || ''}","${p.resposta || 'pendente'}","${p.dataEnvio || ''}","${p.resposta || ''}"`).join("\n");
  
  const csvSolicitudes = "Nome,Empresa,Email,Telefone,Servicos,Data,Status\n" + 
    solicitudes.map(s => `"${s.nome}","${s.empresa || ''}","${s.email || ''}","${s.telefone || ''}","${(s.servicos || []).join(', ')}","${new Date(s.createdAt).toLocaleDateString('pt-PT')}","${s.status || 'pendente'}"`).join("\n");
  
  const csvContent = "=== PROPOSTAS ===\n" + csvProposals + "\n\n=== SOLICITAÇÕES ===\n" + csvSolicitudes;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `AIBORA_Export_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

export function Admin() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "orcamento" | "propostas" | "solicitacoes" | "clientes" | "faturacao">("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [proposals, setProposals] = useState<any[]>([]);
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, enviadas: 0, respondidas: 0, aceitas: 0, reagendadas: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [showFaturaModal, setShowFaturaModal] = useState(false);
  const [faturaData, setFaturaData] = useState<any>(null);
  const [numeroFatura, setNumeroFatura] = useState("");
  const [showClienteForm, setShowClienteForm] = useState(false);
  const [clienteFormData, setClienteFormData] = useState<any>(null);
  const [clienteProposalData, setClienteProposalData] = useState<any>(null);
  const [clienteSearch, setClienteSearch] = useState("");
  const [showClienteSuggestions, setShowClienteSuggestions] = useState(false);
  const [clienteFilterCategoria, setClienteFilterCategoria] = useState<string>("todos");
  const [selectedCliente, setSelectedCliente] = useState<any>(null);
  const [clienteSortBy, setClienteSortBy] = useState<"nome" | "createdAt" | "propostaValor">("createdAt");
  const [clienteSortOrder, setClienteSortOrder] = useState<"asc" | "desc">("desc");
  const [clienteFilterOrigem, setClienteFilterOrigem] = useState<string>("todos");
  const [clienteFilterResposta, setClienteFilterResposta] = useState<string>("todos");

const gerarFaturaPDF = (proposal: any) => {
    const faturaNum = numeroFatura || `FAC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const dataAtual = new Date().toLocaleDateString("pt-PT");
    const dataVencimento = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-PT");
    
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pW = 210, pH = 297;
    
    doc.setFillColor(255, 255, 255); doc.rect(0, 0, pW, 38, "F");
    doc.setFillColor(242, 92, 5); doc.rect(0, 37.5, pW, 0.8, "F");
    doc.setFillColor(242, 92, 5); doc.roundedRect(12, 7, 24, 24, 3, 3, "F");
    doc.setTextColor(255, 255, 255); doc.setFontSize(17); doc.setFont("helvetica", "bold"); doc.text("A", 24, 23, { align: "center" });
    doc.setTextColor(26, 26, 26); doc.setFontSize(17); doc.setFont("helvetica", "bold"); doc.text("AI BORA", 40, 18);
    doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(140, 140, 140); doc.text("Marketing Digital & Criativo", 40, 24);
    doc.setTextColor(242, 92, 5); doc.setFontSize(13); doc.setFont("helvetica", "bold"); doc.text("FATURA", 198, 13, { align: "right" });
    doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(90, 90, 90); doc.text("Nº " + faturaNum, 198, 20, { align: "right" }); doc.text("Data: " + dataAtual, 198, 26, { align: "right" }); doc.text("Válido até: " + dataVencimento, 198, 32, { align: "right" });

    let y = 46;
    doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(242, 92, 5); doc.text("DADOS DO CLIENTE", 14, y);
    doc.setDrawColor(242, 92, 5); doc.setLineWidth(0.4); doc.line(14, y + 1.5, 196, y + 1.5);
    y += 5; doc.setFillColor(247, 245, 243); doc.rect(14, y, 182, 32, "F");
    const lbl = (label: string, value: string, x: number, yy: number) => { doc.setFontSize(8.5); doc.setFont("helvetica", "bold"); doc.setTextColor(26, 26, 26); doc.text(label, x, yy); doc.setFont("helvetica", "normal"); doc.setTextColor(70, 70, 70); doc.text(value || "—", x + 22, yy); };
    lbl("Nome:", proposal.cliente || "", 18, y + 8); lbl("Empresa:", proposal.empresa || "", 107, y + 8); lbl("NIF:", proposal.nif || "", 18, y + 16); lbl("Email:", proposal.email || "", 107, y + 16); lbl("Telefone:", proposal.telefone || "", 18, y + 24); lbl("Morada:", proposal.morada || "", 107, y + 24);

    y += 40;
    doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(242, 92, 5); doc.text("SERVIÇOS PRESTADOS", 14, y);
    doc.setLineWidth(0.4); doc.line(14, y + 1.5, 196, y + 1.5); y += 7;

    const servicosLista = proposal.servicos || ["Gestão de Redes Sociais", "Criação de Conteúdo"];
    const tableData = servicosLista.map((s: string) => [s, "1", "", ""]);
    
    autoTable(doc, {
      startY: y,
      head: [["Serviço", "Qtd", "Valor Unit.", "Total"]],
      body: tableData,
      theme: "plain",
      headStyles: { fillColor: [26, 26, 26], textColor: [255, 255, 255], fontSize: 7.5, fontStyle: "bold", cellPadding: 3 },
      bodyStyles: { fontSize: 8, textColor: [40, 40, 40], cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: 20, halign: "center" }, 2: { cellWidth: 35, halign: "right" }, 3: { cellWidth: 35, halign: "right" } },
      alternateRowStyles: { fillColor: [250, 248, 246] },
      margin: { left: 14, right: 14 },
      tableLineColor: [220, 215, 210],
      tableLineWidth: 0.2
    });
    y = (doc as any).lastAutoTable.finalY + 10;

    if (y > 235) { doc.addPage(); y = 18; }
    doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(242, 92, 5); doc.text("RESUMO FINANCEIRO", 14, y);
    doc.setLineWidth(0.4); doc.line(14, y + 1.5, 196, y + 1.5); y += 7;
    
    const subtotal = proposal.valor / 1.23;
    const iva = proposal.valor - subtotal;
    const desconto = proposal.desconto || 0;
    
    doc.setFillColor(242, 92, 5); doc.roundedRect(120, y, 76, 22, 3, 3, "F");
    doc.setTextColor(255, 255, 255); doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.text("TOTAL A PAGAR (c/ IVA 23%)", 158, y + 7, { align: "center" });
    doc.setFontSize(17); doc.setFont("helvetica", "bold"); doc.text(proposal.valor?.toFixed(2) + " €", 194, y + 18, { align: "right" });

    let ty = y + 4;
    const linhaFin = (label: string, valor: string, bold: boolean, cor: [number, number, number]) => { doc.setFontSize(8.5); doc.setFont("helvetica", bold ? "bold" : "normal"); doc.setTextColor(cor[0], cor[1], cor[2]); doc.text(label, 14, ty); doc.text(valor, 115, ty, { align: "right" }); doc.setDrawColor(225, 220, 215); doc.setLineWidth(0.2); doc.line(14, ty + 1.5, 115, ty + 1.5); ty += 7; };
    linhaFin("Subtotal (sem IVA):", subtotal.toFixed(2) + " €", false, [80, 80, 80]);
    if (desconto > 0) linhaFin("Desconto:", "- " + desconto.toFixed(2) + " €", false, [16, 185, 129]);
    linhaFin("IVA (23%):", iva.toFixed(2) + " €", false, [80, 80, 80]);
    linhaFin("TOTAL A PAGAR:", proposal.valor?.toFixed(2) + " €", true, [242, 92, 5]);

    ty += 6;
    if (ty > 238) { doc.addPage(); ty = 18; }
    doc.setFillColor(247, 245, 243); doc.rect(14, ty, 182, 54, "F");
    doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(26, 26, 26); doc.text("DADOS PARA PAGAMENTO", 18, ty + 8);
    doc.setDrawColor(242, 92, 5); doc.setLineWidth(0.3); doc.line(18, ty + 10, 192, ty + 10);
    const paymentInfo = [
      "Banco: Millennium BCP",
      "IBAN: PT50 0000 0000 0000 0000 00XX",
      "SWIFT/BIC: BAPTPTPL",
      "Referência: " + faturaNum,
      "",
      "Prazo: 30 dias",
      "Morada: Rua Example, 123, 1000-000 Lisboa"
    ];
    doc.setFontSize(7.8); doc.setFont("helvetica", "normal"); doc.setTextColor(60, 60, 60); let py = ty + 17; paymentInfo.forEach(c => { doc.text("•  " + c, 18, py, { maxWidth: 174 }); py += 6.5; });

    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) { doc.setPage(p); doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.3); doc.line(14, pH - 18, 196, pH - 18); doc.setTextColor(100, 100, 100); doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.text("AI BORA, Lda  |  NIF: 319918645  |  helloaibora@proton.me  |  +351 936 021 747  |  www.aibora.pt", 105, pH - 12, { align: "center" }); doc.setFontSize(6.5); doc.setTextColor(160, 160, 160); doc.text("Fatura emitida automaticamente", 105, pH - 7, { align: "center" }); doc.setTextColor(190, 190, 190); doc.text(p + " / " + totalPages, 196, pH - 7, { align: "right" }); }

    doc.output("dataurlnewwindow");
  };

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
      </main>

      {showFaturaModal && faturaData && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#fff", borderRadius: 16, padding: 24, maxWidth: 400, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "theme.colors.text.primary", marginBottom: 16 }}>Gerar Fatura</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Número da Fatura</label>
              <input type="text" value={numeroFatura} onChange={(e) => setNumeroFatura(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "2px solid theme.colors.text.primary", fontSize: 14, fontWeight: 600 }} />
            </div>
            <div style={{ backgroundColor: "#f5f5f5", borderRadius: 8, padding: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#666" }}>Cliente: <strong>{faturaData.cliente}</strong></div>
              <div style={{ fontSize: 12, color: "#666" }}>Valor: <strong style={{ color: "#F22283" }}>{faturaData.valor?.toFixed(2)} €</strong></div>
              <div style={{ fontSize: 11, color: "theme.colors.text.secondary" }}>IVA (23%): {(faturaData.valor / 1.23 * 0.23).toFixed(2)} €</div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => { gerarFaturaPDF(faturaData); setShowFaturaModal(false); }} style={{ flex: 1, padding: "12px", borderRadius: 8, backgroundColor: "theme.colors.accent.primary", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}>Gerar PDF</button>
              <button onClick={() => setShowFaturaModal(false)} style={{ flex: 1, padding: "12px", borderRadius: 8, backgroundColor: "#f5f5f5", color: "#666", border: "none", fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {showClienteForm && clienteFormData && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#fff", borderRadius: 16, padding: 24, maxWidth: 500, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "theme.colors.text.primary", marginBottom: 20 }}>Editar Cliente</h3>
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
                <div style={{ position: "relative" }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Nome</label>
                  <input type="text" value={clienteFormData.nome} onChange={(e) => { setClienteFormData({...clienteFormData, nome: e.target.value}); setClienteSearch(e.target.value); setShowClienteSuggestions(true); }} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "2px solid #e0e0e0", fontSize: 14 }} />
                  {showClienteSuggestions && clienteSearch.length > 0 && clientes.filter(c => c.nome?.toLowerCase().includes(clienteSearch.toLowerCase())).length > 0 && (
                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 100, maxHeight: 180, overflow: "auto" }}>
                      {clientes.filter(c => c.nome?.toLowerCase().includes(clienteSearch.toLowerCase())).slice(0, 5).map(c => (
                        <div key={c.id} onClick={() => { setClienteFormData({...clienteFormData, nome: c.nome || "", email: c.email || "", telemovel: c.telemovel || "", nif: c.nif || "", morada: c.morada || "" }); setClienteSearch(c.nome || ""); setShowClienteSuggestions(false); }} style={{ padding: "10px 12px", cursor: "pointer", borderBottom: "1px solid #f0f0f0", fontSize: 13 }} onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f5f5f5"} onMouseLeave={e => e.currentTarget.style.backgroundColor = "#fff"}>
                          <div style={{ fontWeight: 600 }}>{c.nome}</div>
                          <div style={{ fontSize: 11, color: "theme.colors.text.secondary" }}>{c.email} | {c.telemovel}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Origem</label>
                  <select value={clienteFormData.origem || ""} onChange={(e) => setClienteFormData({...clienteFormData, origem: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "2px solid #e0e0e0", fontSize: 14 }}>
                    <option value="">Selecionar...</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="TikTok">TikTok</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Google">Google</option>
                    <option value="Recomendado">Recomendado</option>
                    <option value="Website">Website</option>
                    <option value="Formulario">Formulário</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Email</label>
                  <input type="email" value={clienteFormData.email} onChange={(e) => setClienteFormData({...clienteFormData, email: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "2px solid #e0e0e0", fontSize: 14 }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Telemóvel</label>
                  <input type="tel" value={clienteFormData.telemovel} onChange={(e) => setClienteFormData({...clienteFormData, telemovel: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "2px solid #e0e0e0", fontSize: 14 }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>NIF</label>
                  <input type="text" value={clienteFormData.nif} onChange={(e) => setClienteFormData({...clienteFormData, nif: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "2px solid #e0e0e0", fontSize: 14 }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Categoria</label>
                  <select value={clienteFormData.categoria} onChange={(e) => setClienteFormData({...clienteFormData, categoria: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "2px solid #e0e0e0", fontSize: 14 }}>
                    <option value="curioso">Curioso</option>
                    <option value="potencial">Potencial</option>
                    <option value="proposta_enviada">Proposta Enviada</option>
                    <option value="cliente">Cliente</option>
                    <option value="sem_interesse">Sem Interesse</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Morada</label>
                <input type="text" value={clienteFormData.morada} onChange={(e) => setClienteFormData({...clienteFormData, morada: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "2px solid #e0e0e0", fontSize: 14 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Website</label>
                <input type="text" value={clienteFormData.website || ""} onChange={(e) => setClienteFormData({...clienteFormData, website: e.target.value})} placeholder="https://..." style={{ width: "100%", padding: "10px", borderRadius: 8, border: "2px solid #e0e0e0", fontSize: 14 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Observações</label>
                <textarea value={clienteFormData.observacoes} onChange={(e) => setClienteFormData({...clienteFormData, observacoes: e.target.value})} rows={3} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "2px solid #e0e0e0", fontSize: 14 }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button onClick={handleSalvarCliente} style={{ flex: 1, padding: "12px", borderRadius: 8, backgroundColor: "theme.colors.accent.primary", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}>Guardar Cliente</button>
              <button onClick={() => { setShowClienteForm(false); setClienteFormData(null); setClienteSearch(""); setShowClienteSuggestions(false); }} style={{ flex: 1, padding: "12px", borderRadius: 8, backgroundColor: "#f5f5f5", color: "#666", border: "none", fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}