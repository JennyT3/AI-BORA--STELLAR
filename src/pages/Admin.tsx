import { useState, useEffect } from "react";
import { getProposal, listProposals, updateProposal, deleteProposal, createCliente, listClientes, updateCliente, deleteCliente } from "../services/firebase";
import { listSolicitudes, updateSolicitudeStatus, deleteSolicitude } from "../services/solicitudes";
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
  const [activeTab, setActiveTab] = useState<"dashboard" | "propostas" | "solicitacoes" | "clientes" | "faturacao">("dashboard");
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = USERS.find(u => u.id === username.toLowerCase());
    if (user && password === ADMIN_PASSWORD) {
      setAuthenticated(true); setCurrentUser(user); localStorage.setItem("adminUser", JSON.stringify(user)); setError(""); loadAll();
    } else { setError("Utilizador ou password incorretos"); }
  };

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
            <h1 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 900, fontSize: 28, color: "#1A1A1A", marginBottom: 8 }}>AI BORA <span style={{ color: "#F22283" }}>Admin</span></h1>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, color: "#888" }}>Gestao de Propostas</p>
          </div>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#666", display: "block", marginBottom: 8 }}>Utilizador</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="jenny ou portugal" style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "2px solid #e0e0e0", fontSize: 14, fontFamily: "Montserrat, sans-serif", backgroundColor: "#fafafa", color: "#1A1A1A" }} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#666", display: "block", marginBottom: 8 }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "2px solid #e0e0e0", fontSize: 14, fontFamily: "Montserrat, sans-serif", backgroundColor: "#fafafa", color: "#1A1A1A" }} />
            </div>
            {error && <p style={{ color: "#F22283", fontSize: 13, marginBottom: 20, textAlign: "center", fontWeight: 600 }}>{error}</p>}
            <button type="submit" style={{ width: "100%", padding: "16px", borderRadius: 12, background: "linear-gradient(135deg, #F25C05 0%, #F22283 100%)", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer", fontSize: 14, fontFamily: "Montserrat, sans-serif", boxShadow: "0 4px 20px rgba(242,34,131,0.3)" }}>Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  const getUserName = (userId: string) => USERS.find(u => u.id === userId)?.nome || userId;
  const getStatusColor = (p: any) => { if (p.resposta === "sim") return "#10B981"; if (p.resposta === "nao") return "#dc2626"; if (p.resposta === "reagendar") return "#F25C05"; if (p.dataEnvio) return "#3498DB"; return "#888"; };
  const getStatusLabel = (p: any) => { if (p.resposta === "sim") return "Aceite"; if (p.resposta === "nao") return "Recusada"; if (p.resposta === "reagendar") return "Reagendada"; if (p.dataEnvio) return "Enviada"; return "Pendente"; };
  const getCategoriaColor = (cat: string) => { 
    if (cat === "cliente") return "#10B981"; 
    if (cat === "proposta_enviada") return "#F59E0B"; 
    if (cat === "potencial") return "#F97316"; 
    if (cat === "curioso") return "#8B5CF6"; 
    if (cat === "sem_interesse") return "#DC2626"; 
    return "#888"; 
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
    <div style={{ minHeight: "100vh", backgroundColor: "#fafafa", display: "flex" }}>
      <aside style={{ width: 260, backgroundColor: "#ffffff", borderRight: "1px solid #e8e8e8", padding: "32px 0", display: "flex", flexDirection: "column", boxShadow: "4px 0 24px rgba(0,0,0,0.02)" }}>
        <div style={{ padding: "0 28px", marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src="/logo.png" alt="AI BORA" style={{ width: 44, height: 44, borderRadius: 12 }} />
            <div><div style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 900, fontSize: 18, color: "#1A1A1A" }}>AI BORA</div><div style={{ fontSize: 10, fontWeight: 600, color: "#F22283", letterSpacing: 1 }}>ADMIN PANEL</div></div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "0 16px" }}>
          <button onClick={() => setActiveTab("dashboard")} style={{ width: "100%", padding: "14px 16px", border: "none", backgroundColor: activeTab === "dashboard" ? "#F25C05" : "transparent", color: activeTab === "dashboard" ? "#ffffff" : "#1A1A1A", fontWeight: 600, fontSize: 13, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12, borderRadius: 10, marginBottom: 4, fontFamily: "Montserrat, sans-serif" }}>Dashboard</button>
          <button onClick={() => window.location.href = "/admin/orcamento"} style={{ width: "100%", padding: "14px 16px", border: "none", backgroundColor: "transparent", color: "#1A1A1A", fontWeight: 600, fontSize: 13, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12, borderRadius: 10, marginBottom: 4, fontFamily: "Montserrat, sans-serif" }}>Novo Orcamento</button>
          <button onClick={() => setActiveTab("propostas")} style={{ width: "100%", padding: "14px 16px", border: "none", backgroundColor: activeTab === "propostas" ? "#F25C05" : "transparent", color: activeTab === "propostas" ? "#ffffff" : "#1A1A1A", fontWeight: 600, fontSize: 13, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12, borderRadius: 10, marginBottom: 4, fontFamily: "Montserrat, sans-serif" }}>Propostas <span style={{ backgroundColor: activeTab === "propostas" ? "rgba(255,255,255,0.2)" : "#f0f0f0", padding: "2px 10px", borderRadius: 20, fontSize: 11, marginLeft: "auto", fontWeight: 700 }}>{proposals.length}</span></button>
          <button onClick={() => setActiveTab("solicitacoes")} style={{ width: "100%", padding: "14px 16px", border: "none", backgroundColor: activeTab === "solicitacoes" ? "#F25C05" : "transparent", color: activeTab === "solicitacoes" ? "#ffffff" : "#1A1A1A", fontWeight: 600, fontSize: 13, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12, borderRadius: 10, marginBottom: 4, fontFamily: "Montserrat, sans-serif" }}>Solicitacoes <span style={{ backgroundColor: activeTab === "solicitacoes" ? "rgba(255,255,255,0.2)" : "#FFF0F5", padding: "2px 10px", borderRadius: 20, fontSize: 11, marginLeft: "auto", fontWeight: 700, color: activeTab === "solicitacoes" ? "#fff" : "#F22283" }}>{solicitudes.filter(s => s.status === "pendente").length}</span></button>
          <button onClick={() => setActiveTab("clientes")} style={{ width: "100%", padding: "14px 16px", border: "none", backgroundColor: activeTab === "clientes" ? "#F25C05" : "transparent", color: activeTab === "clientes" ? "#ffffff" : "#1A1A1A", fontWeight: 600, fontSize: 13, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12, borderRadius: 10, marginBottom: 4, fontFamily: "Montserrat, sans-serif" }}>Clientes <span style={{ backgroundColor: activeTab === "clientes" ? "rgba(255,255,255,0.2)" : "#f0f0f0", padding: "2px 10px", borderRadius: 20, fontSize: 11, marginLeft: "auto", fontWeight: 700 }}>{clientes.length}</span></button>
          <button onClick={() => setActiveTab("faturacao")} style={{ width: "100%", padding: "14px 16px", border: "none", backgroundColor: activeTab === "faturacao" ? "#F25C05" : "transparent", color: activeTab === "faturacao" ? "#ffffff" : "#1A1A1A", fontWeight: 600, fontSize: 13, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12, borderRadius: 10, marginBottom: 4, fontFamily: "Montserrat, sans-serif" }}>Faturacao</button>
        </nav>
        <div style={{ padding: "24px 28px", borderTop: "1px solid #e8e8e8" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #F25C05 0%, #F22283 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>{currentUser?.nome[0]}</div>
            <div><div style={{ fontSize: 14, color: "#1A1A1A", fontWeight: 600, fontFamily: "Montserrat, sans-serif" }}>{currentUser?.nome}</div><div style={{ fontSize: 11, color: "#888" }}>{currentUser?.role === "admin" ? "Administrador" : "Utilizador"}</div></div>
          </div>
          <button onClick={() => { setAuthenticated(false); setCurrentUser(null); localStorage.removeItem("adminUser"); }} style={{ width: "100%", padding: "10px", borderRadius: 8, backgroundColor: "#f5f5f5", color: "#1A1A1A", border: "none", fontSize: 12, cursor: "pointer", fontFamily: "Montserrat, sans-serif", fontWeight: 600 }}>Terminar sessao</button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: 40, overflow: "auto" }}>
        {activeTab === "dashboard" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
              <div><h1 style={{ fontFamily: "Montserrat, sans-serif", fontSize: 32, fontWeight: 900, color: "#1A1A1A", marginBottom: 8 }}>Dashboard</h1><p style={{ color: "#888", fontSize: 14 }}>Resumo da tua atividade</p></div>
              <button onClick={() => exportToExcel(proposals, solicitudes)} style={{ padding: "12px 24px", borderRadius: 10, backgroundColor: "#10B981", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>📊 Exportar</button>
            </div>

            {/* Quick Actions */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 32 }}>
              <button onClick={() => window.location.href = "/admin/orcamento"} style={{ padding: 20, borderRadius: 16, backgroundColor: "linear-gradient(135deg, #F25C05 0%, #F22283 100%)", color: "#fff", border: "none", cursor: "pointer", textAlign: "center", boxShadow: "0 4px 15px rgba(242,92,5,0.3)" }}>
                <div style={{ fontSize: 24, marginBottom: 8, fontWeight: "bold" }}>+</div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Novo Orçamento</div>
              </button>
              <button onClick={() => setActiveTab("clientes")} style={{ padding: 20, borderRadius: 16, backgroundColor: "#ffffff", color: "#1A1A1A", border: "2px solid #e8e8e8", cursor: "pointer", textAlign: "center" }}>
                <div style={{ fontSize: 24, marginBottom: 8, fontWeight: "bold" }}>👥</div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Clientes</div>
                <div style={{ fontSize: 11, color: "#F25C05", fontWeight: 600 }}>{clientes.length} total</div>
              </button>
              <button onClick={() => setActiveTab("propostas")} style={{ padding: 20, borderRadius: 16, backgroundColor: "#ffffff", color: "#1A1A1A", border: "2px solid #e8e8e8", cursor: "pointer", textAlign: "center" }}>
                <div style={{ fontSize: 24, marginBottom: 8, fontWeight: "bold" }}>📄</div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Propostas</div>
                <div style={{ fontSize: 11, color: "#3498DB", fontWeight: 600 }}>{proposals.length} total</div>
              </button>
              <button onClick={() => setActiveTab("faturacao")} style={{ padding: 20, borderRadius: 16, backgroundColor: "#ffffff", color: "#1A1A1A", border: "2px solid #e8e8e8", cursor: "pointer", textAlign: "center" }}>
                <div style={{ fontSize: 24, marginBottom: 8, fontWeight: "bold" }}>€</div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Faturação</div>
              </button>
              <button onClick={() => window.open("/", "_blank")} style={{ padding: 20, borderRadius: 16, backgroundColor: "#ffffff", color: "#1A1A1A", border: "2px solid #e8e8e8", cursor: "pointer", textAlign: "center" }}>
                <div style={{ fontSize: 24, marginBottom: 8, fontWeight: "bold" }}>→</div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Ver Site</div>
              </button>
            </div>

            {/* Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 32 }}>
              <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8", borderLeft: "4px solid #F25C05" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>PROPOSTAS</span>
                </div>
                <div style={{ fontSize: 36, fontWeight: 900, color: "#1A1A1A" }}>{stats.total}</div>
                <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>{stats.enviadas} enviadas</div>
              </div>
              <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8", borderLeft: "4px solid #3498DB" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>RESPONDIDAS</span>
                </div>
                <div style={{ fontSize: 36, fontWeight: 900, color: "#3498DB" }}>{stats.respondidas}</div>
                <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>{stats.total > 0 ? Math.round((stats.respondidas/stats.total)*100) : 0}% resposta</div>
              </div>
              <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8", borderLeft: "4px solid #10B981" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>ACEITES</span>
                </div>
                <div style={{ fontSize: 36, fontWeight: 900, color: "#10B981" }}>{stats.aceitas}</div>
                <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>{stats.respondidas > 0 ? Math.round((stats.aceitas/stats.respondidas)*100) : 0}% aceitação</div>
              </div>
              <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8", borderLeft: "4px solid #F22283" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>CLIENTES</span>
                </div>
                <div style={{ fontSize: 36, fontWeight: 900, color: "#F22283" }}>{clientes.filter(c => c.categoria === "cliente").length}</div>
                <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>{clientes.filter(c => c.categoria === "potencial").length} potenciales</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A1A", fontFamily: "Montserrat, sans-serif" }}>Solicitações Recentes</h3>
                  <button onClick={() => setActiveTab("solicitacoes")} style={{ fontSize: 12, color: "#F25C05", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Ver todas →</button>
                </div>
                <div style={{ display: "grid", gap: 12 }}>
                  {solicitudes.slice(0, 5).map(s => {
                    const statusCor = s.status === "pendente" ? "#F25C05" : s.status === "em-analise" ? "#3498DB" : "#10B981";
                    const statusLabel = s.status === "pendente" ? "Pendente" : s.status === "em-analise" ? "Em Análise" : "Concluída";
                    return (
                      <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", backgroundColor: "#fafafa", borderRadius: 10, border: "1px solid #f0f0f0" }}>
                        <div><div style={{ fontWeight: 700, color: "#1A1A1A", fontSize: 14 }}>{s.nome}</div><div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{s.telefone} · {new Date(s.createdAt).toLocaleDateString("pt-PT")}</div></div>
                        <span style={{ fontSize: 10, padding: "4px 10px", borderRadius: 20, backgroundColor: statusCor + "15", color: statusCor, fontWeight: 600 }}>{statusLabel}</span>
                      </div>
                    );
                  })}
                  {solicitudes.length === 0 && <div style={{ textAlign: "center", padding: 20, color: "#888" }}>Nenhuma solicitação ainda</div>}
                </div>
              </div>

              <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A1A", fontFamily: "Montserrat, sans-serif" }}>Propostas Recentes</h3>
                  <button onClick={() => setActiveTab("propostas")} style={{ fontSize: 12, color: "#F25C05", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Ver todas →</button>
                </div>
                <div style={{ display: "grid", gap: 10 }}>
                  {proposals.slice(0, 5).map(p => (
                    <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", backgroundColor: "#F5F2F0", borderRadius: 12, border: "1px solid #e8e4df" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#F25C05", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>{p.cliente?.charAt(0).toUpperCase()}</div>
                        <div><div style={{ fontWeight: 700, color: "#1A1A1A", fontSize: 13 }}>{p.cliente}</div><div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>{p.numeroOrcamento} · {new Date(p.createdAt).toLocaleDateString("pt-PT")}</div></div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ textAlign: "right" }}><div style={{ fontWeight: 800, color: "#F22283", fontSize: 16 }}>{p.valor?.toFixed(2)} €</div></div>
                        {p.resposta === "sim" && <span style={{ fontSize: 10, padding: "4px 8px", borderRadius: 4, backgroundColor: "#dcfce7", color: "#16a34a", fontWeight: 600 }}>✓</span>}
                        {p.resposta === "nao" && <span style={{ fontSize: 10, padding: "4px 8px", borderRadius: 4, backgroundColor: "#fee2e2", color: "#dc2626", fontWeight: 600 }}>✕</span>}
                        {!p.resposta && p.dataEnvio && <span style={{ fontSize: 10, padding: "4px 8px", borderRadius: 4, backgroundColor: "#E8F4FD", color: "#3498DB", fontWeight: 600 }}>Enviada</span>}
                      </div>
                    </div>
                  ))}
                  {proposals.length === 0 && <div style={{ textAlign: "center", padding: 20, color: "#888" }}>Nenhuma proposta ainda</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "propostas" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
              <div><h1 style={{ fontFamily: "Montserrat, sans-serif", fontSize: 28, fontWeight: 900, color: "#1A1A1A", marginBottom: 8 }}>Propostas</h1><p style={{ color: "#888", fontSize: 14 }}>{proposals.length} propostas guardadas</p></div>
              <button onClick={loadProposals} style={{ padding: "12px 20px", borderRadius: 10, backgroundColor: "#ffffff", color: "#666", border: "1px solid #e0e0e0", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Atualizar</button>
            </div>
            {loading ? <div style={{ textAlign: "center", padding: 60, color: "#888" }}>A carregar...</div> : proposals.length === 0 ? <div style={{ textAlign: "center", padding: 60, color: "#888", backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e8e8e8" }}>Nenhuma proposta guardada ainda.</div> : (
              <div style={{ display: "grid", gap: 16 }}>
                {proposals.map((p) => (
                  <div key={p.id} style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8" }}>
                    {editingId === p.id ? (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                        <div><label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 6, fontWeight: 600 }}>Cliente</label><input value={editData.cliente} onChange={(e) => setEditData({...editData, cliente: e.target.value})} style={{ width: "100%", padding: "12px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13, backgroundColor: "#fafafa", color: "#1A1A1A" }} /></div>
                        <div><label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 6, fontWeight: 600 }}>Valor (€)</label><input type="number" value={editData.valor} onChange={(e) => setEditData({...editData, valor: parseFloat(e.target.value)})} style={{ width: "100%", padding: "12px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13, backgroundColor: "#fafafa", color: "#1A1A1A" }} /></div>
                        <div><label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 6, fontWeight: 600 }}>Desconto (€)</label><input type="number" value={editData.desconto} onChange={(e) => setEditData({...editData, desconto: parseFloat(e.target.value)})} style={{ width: "100%", padding: "12px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13, backgroundColor: "#fafafa", color: "#1A1A1A" }} /></div>
                        <div><label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 6, fontWeight: 600 }}>Marcas</label><input type="number" value={editData.marcas} onChange={(e) => setEditData({...editData, marcas: parseInt(e.target.value)})} style={{ width: "100%", padding: "12px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 13, backgroundColor: "#fafafa", color: "#1A1A1A" }} /></div>
                        <div style={{ gridColumn: "1 / -1", display: "flex", gap: 12, marginTop: 8 }}><button onClick={() => handleUpdate(p.id)} style={{ flex: 1, padding: "12px", borderRadius: 8, backgroundColor: "#10B981", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Guardar</button><button onClick={() => setEditingId(null)} style={{ flex: 1, padding: "12px", borderRadius: 8, backgroundColor: "#f0f0f0", color: "#666", border: "none", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Cancelar</button></div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}><span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 18, color: "#1A1A1A" }}>{p.cliente}</span><span style={{ fontSize: 11, padding: "6px 12px", borderRadius: 20, backgroundColor: getStatusColor(p) + "15", color: getStatusColor(p), fontWeight: 600 }}>{getStatusLabel(p)}</span></div>
                          <div style={{ fontSize: 13, color: "#666", marginBottom: 12, display: "flex", flexWrap: "wrap", gap: 16 }}><span>{p.numeroOrcamento}</span><span style={{ color: "#F25C05", fontWeight: 700 }}>{p.valor?.toFixed(2)} €</span><span>{p.marcas} marca{p.marcas !== 1 ? "s" : ""}</span>{p.dataEnvio && <span style={{ color: "#3498DB" }}>Enviada: {p.dataEnvio}</span>}{p.criadoPor && <span>Por: {getUserName(p.criadoPor)}</span>}</div>
                          {p.servicos && p.servicos.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{p.servicos.slice(0, 4).map((s: string, i: number) => <span key={i} style={{ fontSize: 11, backgroundColor: "#f5f5f5", padding: "6px 12px", borderRadius: 20, color: "#666", fontWeight: 500 }}>{s}</span>)}{p.servicos.length > 4 && <span style={{ fontSize: 11, color: "#888" }}>+{p.servicos.length - 4}</span>}</div>}
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <a href={`/p/${p.id}`} target="_blank" style={{ padding: "10px 16px", borderRadius: 8, backgroundColor: "#3498DB", color: "#fff", border: "none", fontSize: 12, fontWeight: 600, textDecoration: "none", display: "inline-block" }}>Ver Proposta</a>
                          <button onClick={() => { navigator.clipboard.writeText(`https://aibora.pt/p/${p.id}`); alert("Link copiado!"); }} style={{ padding: "10px 16px", borderRadius: 8, backgroundColor: "#f5f5f5", color: "#666", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Copiar</button>
                          <button onClick={() => window.location.href = `/admin/orcamento?edit=${p.id}`} style={{ padding: "10px 16px", borderRadius: 8, backgroundColor: "#FFF5F0", color: "#F25C05", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Editar</button>
                          <button onClick={() => handleMarcarEnviada(p)} style={{ padding: "10px 16px", borderRadius: 8, backgroundColor: p.dataEnvio ? "#E8F4FD" : "#f5f5f5", color: p.dataEnvio ? "#3498DB" : "#666", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Enviada</button>
                          {p.resposta === "sim" ? (
                            <span style={{ padding: "10px 16px", borderRadius: 8, backgroundColor: "#10B981", color: "#fff", border: "none", fontSize: 12, fontWeight: 600 }}>✓ Accept</span>
                          ) : p.resposta === "nao" ? (
                            <span style={{ padding: "10px 16px", borderRadius: 8, backgroundColor: "#DC2626", color: "#fff", border: "none", fontSize: 12, fontWeight: 600 }}>✕ Recusado</span>
                          ) : (
                            <button onClick={() => handleRegistrarResposta(p)} style={{ padding: "10px 16px", borderRadius: 8, backgroundColor: "#f5f5f5", color: "#666", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Resposta</button>
                          )}
                          <button onClick={() => handleDelete(p.id, p.cliente)} style={{ padding: "10px 16px", borderRadius: 8, backgroundColor: "#FEE2E2", color: "#dc2626", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>X</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "solicitacoes" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
              <div><h1 style={{ fontFamily: "Montserrat, sans-serif", fontSize: 28, fontWeight: 900, color: "#1A1A1A", marginBottom: 8 }}>Solicitacoes</h1><p style={{ color: "#888", fontSize: 14 }}>{solicitudes.filter(s => s.status === "pendente").length} pendentes</p></div>
              <button onClick={loadSolicitudes} style={{ padding: "12px 20px", borderRadius: 10, backgroundColor: "#ffffff", color: "#666", border: "1px solid #e0e0e0", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Atualizar</button>
            </div>
            {loading ? <div style={{ textAlign: "center", padding: 60, color: "#888" }}>A carregar...</div> : solicitudes.length === 0 ? <div style={{ textAlign: "center", padding: 60, color: "#888", backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e8e8e8" }}>Nenhuma solicitacao ainda.</div> : (
              <div style={{ display: "grid", gap: 16 }}>
                {solicitudes.map((s) => (
                  <div key={s.id} style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}><span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 18, color: "#1A1A1A" }}>{s.nome}</span><span style={{ fontSize: 11, padding: "6px 12px", borderRadius: 20, backgroundColor: s.status === "pendente" ? "#FFF5F0" : "#E8F5E9", color: s.status === "pendente" ? "#F25C05" : "#10B981", fontWeight: 600 }}>{s.status === "pendente" ? "Pendente" : s.status === "em-analise" ? "Em Analise" : "Convertida"}</span></div>
                        <div style={{ fontSize: 14, color: "#666", marginBottom: 12 }}>{s.telefone} {s.empresa && `| ${s.empresa}`} {s.email && `| ${s.email}`}</div>
                        <div style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>{new Date(s.createdAt).toLocaleDateString("pt-PT")}</div>
                        {s.servicos && s.servicos.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{s.servicos.slice(0, 4).map((serv: string, i: number) => <span key={i} style={{ fontSize: 11, backgroundColor: "#f5f5f5", padding: "6px 12px", borderRadius: 20, color: "#666", fontWeight: 500 }}>{serv}</span>)}</div>}
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button onClick={() => window.location.href = `/admin/orcamento?sol=${s.id}`} style={{ padding: "10px 16px", borderRadius: 8, background: "linear-gradient(135deg, #F25C05 0%, #F22283 100%)", color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 15px rgba(242,34,131,0.2)" }}>Criar Proposta</button>
                        <button onClick={() => handleCriarClienteFromSolicitude(s)} style={{ padding: "10px 16px", borderRadius: 8, backgroundColor: "#E8F4FD", color: "#3498DB", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Criar Cliente</button>
                        <button onClick={async () => { await updateSolicitudeStatus(s.id, "em-analise"); loadSolicitudes(); }} style={{ padding: "10px 16px", borderRadius: 8, backgroundColor: s.status === "em-analise" ? "#FFF5F0" : "#f5f5f5", color: s.status === "em-analise" ? "#F25C05" : "#666", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Analise</button>
                        <button onClick={async () => { await updateSolicitudeStatus(s.id, "proposta-enviada"); loadSolicitudes(); loadProposals(); }} style={{ padding: "10px 16px", borderRadius: 8, backgroundColor: s.status === "proposta-enviada" ? "#E8F5E9" : "#f5f5f5", color: s.status === "proposta-enviada" ? "#10B981" : "#666", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Convertida</button>
                        <button onClick={async () => { if(confirm("Eliminar solicitacao?")) { await deleteSolicitude(s.id); loadSolicitudes(); }}} style={{ padding: "10px 16px", borderRadius: 8, backgroundColor: "#FEE2E2", color: "#dc2626", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>X</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "clientes" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div><h1 style={{ fontFamily: "Montserrat, sans-serif", fontSize: 28, fontWeight: 900, color: "#1A1A1A", marginBottom: 8 }}>Clientes</h1><p style={{ color: "#888", fontSize: 14 }}>{clientes.length} clientes</p></div>
              <div style={{ display: "flex", gap: 8 }}>
                <label style={{ padding: "12px 20px", borderRadius: 10, backgroundColor: "#f5f5f5", color: "#666", border: "1px solid #e0e0e0", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
                  Importar CSV
                  <input type="file" accept=".csv,.xlsx" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = async (event) => { try { const text = event.target?.result as string; const lines = text.split('\n'); const headers = lines[0].split(',').map(h => h.trim().toLowerCase()); const newClientes = []; for (let i = 1; i < lines.length; i++) { if (!lines[i].trim()) continue; const values = lines[i].split(',').map(v => v.trim().replace(/"/g, '')); const obj: any = { categoria: "curioso", createdAt: new Date().toISOString() }; headers.forEach((h, idx) => { if (values[idx]) obj[h === 'nome' ? 'nome' : h === 'email' ? 'email' : h === 'telemovel' ? 'telemovel' : h === 'telefone' ? 'telemovel' : h === 'nif' ? 'nif' : h === 'morada' ? 'morada' : h === 'empresa' ? 'empresa' : h] = values[idx]; }); newClientes.push(obj); } for (const c of newClientes) { await createCliente(c); } loadClientes(); alert(`Importados ${newClientes.length} clientes!`); } catch (err) { alert('Erro ao importar: ' + err); } }; reader.readAsText(file); }} style={{ display: "none" }} />
                </label>
                <button onClick={() => { setClienteFormData({ nome: "", email: "", telemovel: "", nif: "", morada: "", categoria: "curioso", observacoes: "" }); setShowClienteForm(true); }} style={{ padding: "12px 20px", borderRadius: 10, backgroundColor: "#F25C05", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>+ Novo Cliente</button>
              </div>
            </div>

            {/* Filtros y Busqueda */}
            <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 20, marginBottom: 24, border: "1px solid #e8e8e8" }}>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <input type="text" placeholder="Buscar..." value={clienteSearch} onChange={(e) => setClienteSearch(e.target.value)} style={{ flex: 1, minWidth: 150, padding: "10px 14px", borderRadius: 8, border: "2px solid #e0e0e0", fontSize: 12 }} />
                <select value={clienteFilterOrigem} onChange={(e) => setClienteFilterOrigem(e.target.value)} style={{ padding: "10px 14px", borderRadius: 8, border: "2px solid #e0e0e0", fontSize: 12, minWidth: 120 }}>
                  <option value="todos">Origem</option>
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
                <select value={clienteFilterCategoria} onChange={(e) => setClienteFilterCategoria(e.target.value)} style={{ padding: "10px 14px", borderRadius: 8, border: "2px solid #e0e0e0", fontSize: 12, minWidth: 120 }}>
                  <option value="todos">Categoria</option>
                  <option value="curioso">Curioso</option>
                  <option value="potencial">Potencial</option>
                  <option value="proposta_enviada">Proposta Enviada</option>
                  <option value="cliente">Cliente</option>
                  <option value="sem_interesse">Sem Interesse</option>
                </select>
                <select value={clienteFilterResposta} onChange={(e) => setClienteFilterResposta(e.target.value)} style={{ padding: "10px 14px", borderRadius: 8, border: "2px solid #e0e0e0", fontSize: 12, minWidth: 120 }}>
                  <option value="todos">Resposta</option>
                  <option value="sim">Aceito</option>
                  <option value="nao">Recusado</option>
                  <option value="reagendar">Reagendado</option>
                  <option value="pendente">Pendente</option>
                </select>
                <select value={clienteSortBy} onChange={(e) => setClienteSortBy(e.target.value as any)} style={{ padding: "10px 14px", borderRadius: 8, border: "2px solid #e0e0e0", fontSize: 12, minWidth: 120 }}>
                  <option value="createdAt">Data</option>
                  <option value="nome">Nome</option>
                </select>
                <button onClick={() => setClienteSortOrder(clienteSortOrder === "asc" ? "desc" : "asc")} style={{ padding: "10px 14px", borderRadius: 8, border: "2px solid #e0e0e0", backgroundColor: "#fff", fontSize: 12, cursor: "pointer", minWidth: 40 }}>
                  {clienteSortOrder === "asc" ? "↑" : "↓"}
                </button>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                {["curioso", "potencial", "proposta_enviada", "cliente", "sem_interesse"].map(cat => {
                  const count = clientes.filter(c => c.categoria === cat).length;
                  return (
                    <button key={cat} onClick={() => setClienteFilterCategoria(clienteFilterCategoria === cat ? "todos" : cat)} style={{ padding: "6px 12px", borderRadius: 20, border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer", backgroundColor: clienteFilterCategoria === cat ? getCategoriaColor(cat) : "#f5f5f5", color: clienteFilterCategoria === cat ? "#fff" : "#666" }}>
                      {getCategoriaLabel(cat)} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedCliente ? (
              <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <button onClick={() => setSelectedCliente(null)} style={{ padding: "8px 16px", borderRadius: 8, backgroundColor: "#f5f5f5", color: "#666", border: "none", fontSize: 12, cursor: "pointer" }}>← Voltar</button>
                    <h2 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 800, fontSize: 22, color: "#1A1A1A" }}>{selectedCliente.nome}</h2>
                    <span style={{ fontSize: 12, backgroundColor: getCategoriaColor(selectedCliente.categoria) + "20", padding: "6px 14px", borderRadius: 20, color: getCategoriaColor(selectedCliente.categoria), fontWeight: 600 }}>{getCategoriaLabel(selectedCliente.categoria)}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => { setClienteFormData(selectedCliente); setShowClienteForm(true); }} style={{ padding: "10px 16px", borderRadius: 8, backgroundColor: "#f5f5f5", color: "#666", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Editar</button>
                    {selectedCliente.categoria === "cliente" && <button onClick={() => { setFaturaData(selectedCliente); setShowFaturaModal(true); }} style={{ padding: "10px 16px", borderRadius: 8, backgroundColor: "#F25C05", color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Faturar</button>}
                  </div>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
                  <div style={{ backgroundColor: "#F5F2F0", borderRadius: 12, padding: 20 }}>
                    <h4 style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", marginBottom: 12 }}>Dados de Contacto</h4>
                    <div style={{ fontSize: 14, color: "#1A1A1A", marginBottom: 8 }}><strong>Email:</strong> {selectedCliente.email || "—"}</div>
                    <div style={{ fontSize: 14, color: "#1A1A1A", marginBottom: 8 }}><strong>Telemóvel:</strong> {selectedCliente.telemovel || "—"}</div>
                    <div style={{ fontSize: 14, color: "#1A1A1A", marginBottom: 8 }}><strong>NIF:</strong> {selectedCliente.nif || "—"}</div>
                    <div style={{ fontSize: 14, color: "#1A1A1A", marginBottom: 8 }}><strong>Morada:</strong> {selectedCliente.morada || "—"}</div>
                  </div>
                  <div style={{ backgroundColor: "#F5F2F0", borderRadius: 12, padding: 20 }}>
                    <h4 style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", marginBottom: 12 }}>Histórico</h4>
                    <div style={{ fontSize: 14, color: "#1A1A1A", marginBottom: 8 }}><strong>Entrada:</strong> {selectedCliente.createdAt ? new Date(selectedCliente.createdAt).toLocaleDateString("pt-PT") : "—"}</div>
                    {selectedCliente.propostaNumero && <div style={{ fontSize: 14, color: "#1A1A1A", marginBottom: 8 }}><strong>Orçamento:</strong> {selectedCliente.propostaNumero}</div>}
                    {selectedCliente.propostaValor && <div style={{ fontSize: 14, color: "#1A1A1A", marginBottom: 8 }}><strong>Valor Proposta:</strong> {selectedCliente.propostaValor}€</div>}
                    {selectedCliente.dataEnvio && <div style={{ fontSize: 14, color: "#1A1A1A", marginBottom: 8 }}><strong>Proposta Enviada:</strong> {selectedCliente.dataEnvio}</div>}
                    {selectedCliente.resposta && <div style={{ fontSize: 14, color: "#1A1A1A", marginBottom: 8 }}><strong>Resposta:</strong> <span style={{ color: selectedCliente.resposta === "sim" ? "#10B981" : "#dc2626", fontWeight: 600 }}>{selectedCliente.resposta === "sim" ? "Aceito" : selectedCliente.resposta === "nao" ? "Recusado" : "Reagendado"}</span></div>}
                    {selectedCliente.dataResposta && <div style={{ fontSize: 14, color: "#1A1A1A", marginBottom: 8 }}><strong>Data Resposta:</strong> {new Date(selectedCliente.dataResposta).toLocaleDateString("pt-PT")}</div>}
                  </div>
                  {selectedCliente.observacoes && (
                    <div style={{ gridColumn: "1 / -1", backgroundColor: "#F5F2F0", borderRadius: 12, padding: 20 }}>
                      <h4 style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", marginBottom: 12 }}>Observações</h4>
                      <div style={{ fontSize: 14, color: "#666" }}>{selectedCliente.observacoes}</div>
                    </div>
                  )}
                </div>
              </div>
            ) : clientes.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: "#888", backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e8e8e8" }}>
                Nenhum cliente ainda. Crie clientes a partir de propostas aceitas ou adicione manualmente.
              </div>
            ) : (
              <div style={{ backgroundColor: "#ffffff", borderRadius: 16, overflow: "hidden", border: "1px solid #e8e8e8" }}>
                <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f5f5f5" }}>
                      <th onClick={() => { setClienteSortBy("origem"); setClienteSortOrder(clienteSortOrder === "asc" ? "desc" : "asc"); }} style={{ padding: "12px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase", cursor: "pointer" }}>Origem {clienteSortBy === "origem" && (clienteSortOrder === "asc" ? "↑" : "↓")}</th>
                      <th onClick={() => { setClienteSortBy("nome"); setClienteSortOrder(clienteSortOrder === "asc" ? "desc" : "asc"); }} style={{ padding: "12px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase", cursor: "pointer" }}>Nome {clienteSortBy === "nome" && (clienteSortOrder === "asc" ? "↑" : "↓")}</th>
                      <th onClick={() => { setClienteSortBy("categoria"); setClienteSortOrder(clienteSortOrder === "asc" ? "desc" : "asc"); }} style={{ padding: "12px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase", cursor: "pointer" }}>Categoria {clienteSortBy === "categoria" && (clienteSortOrder === "asc" ? "↑" : "↓")}</th>
                      <th style={{ padding: "12px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase" }}>Telemóvel</th>
                      <th style={{ padding: "12px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase" }}>Email</th>
                      <th style={{ padding: "12px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase" }}>NIF</th>
                      <th onClick={() => { setClienteSortBy("propostaNumero"); setClienteSortOrder(clienteSortOrder === "asc" ? "desc" : "asc"); }} style={{ padding: "12px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase", cursor: "pointer" }}>Orçamento {clienteSortBy === "propostaNumero" && (clienteSortOrder === "asc" ? "↑" : "↓")}</th>
                      <th style={{ padding: "12px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase" }}>Proposta</th>
                      <th onClick={() => { setClienteSortBy("resposta"); setClienteSortOrder(clienteSortOrder === "asc" ? "desc" : "asc"); }} style={{ padding: "12px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase", cursor: "pointer" }}>Resposta {clienteSortBy === "resposta" && (clienteSortOrder === "asc" ? "↑" : "↓")}</th>
                      <th style={{ padding: "12px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase" }}>Factura</th>
                      <th style={{ padding: "12px 14px", textAlign: "center", fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase" }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientes.filter(c => {
                      const searchLower = clienteSearch.toLowerCase();
                      const matchesSearch = !clienteSearch || 
                        c.nome?.toLowerCase().includes(searchLower) || 
                        c.email?.toLowerCase().includes(searchLower) ||
                        c.nif?.includes(clienteSearch) ||
                        c.telemovel?.includes(clienteSearch);
                      const matchesCategoria = clienteFilterCategoria === "todos" || c.categoria === clienteFilterCategoria;
                      const matchesOrigem = clienteFilterOrigem === "todos" || c.origem === clienteFilterOrigem;
                      const matchesResposta = clienteFilterResposta === "todos" || (clienteFilterResposta === "pendente" ? !c.resposta : c.resposta === clienteFilterResposta);
                      return matchesSearch && matchesCategoria && matchesOrigem && matchesResposta;
                    }).sort((a, b) => {
                      let comparison = 0;
                      if (clienteSortBy === "nome") {
                        comparison = (a.nome || "").localeCompare(b.nome || "");
                      } else if (clienteSortBy === "origem") {
                        comparison = (a.origem || "").localeCompare(b.origem || "");
                      } else if (clienteSortBy === "categoria") {
                        comparison = (a.categoria || "").localeCompare(b.categoria || "");
                      } else if (clienteSortBy === "propostaNumero") {
                        comparison = (a.propostaNumero || "").localeCompare(b.propostaNumero || "");
                      } else if (clienteSortBy === "resposta") {
                        comparison = (a.resposta || "pendente").localeCompare(b.resposta || "pendente");
                      } else if (clienteSortBy === "createdAt") {
                        comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
                      } else if (clienteSortBy === "propostaValor") {
                        comparison = (a.propostaValor || 0) - (b.propostaValor || 0);
                      }
                      return clienteSortOrder === "asc" ? comparison : -comparison;
                    }).map((c) => (
                      <tr key={c.id} onClick={() => setSelectedCliente(c)} style={{ cursor: "pointer", borderTop: "1px solid #f0f0f0", backgroundColor: "#fff" }}>
                        <td style={{ padding: "12px 14px", fontSize: 12, color: "#666" }}>{c.origem || "—"}</td>
                        <td style={{ padding: "12px 14px", fontSize: 12 }}><div style={{ fontWeight: 700, color: "#1A1A1A" }}>{c.nome}</div></td>
                        <td style={{ padding: "12px 14px" }}><span style={{ fontSize: 10, backgroundColor: getCategoriaColor(c.categoria) + "20", padding: "4px 8px", borderRadius: 12, color: getCategoriaColor(c.categoria), fontWeight: 600 }}>{getCategoriaLabel(c.categoria)}</span></td>
                        <td style={{ padding: "12px 14px", fontSize: 12, color: "#666" }}>{c.telemovel || "—"}</td>
                        <td style={{ padding: "12px 14px", fontSize: 12, color: "#666" }}>{c.email || "—"}</td>
                        <td style={{ padding: "12px 14px", fontSize: 12, color: "#666" }}>{c.nif || "—"}</td>
                        <td style={{ padding: "12px 14px" }}>
                          {c.propostaNumero ? (
                            <a href={`/admin/orcamento?edit=${c.propostaId}`} target="_blank" onClick={(e) => e.stopPropagation()} style={{ color: "#3498DB", fontWeight: 600, fontSize: 12, cursor: "pointer", textDecoration: "none" }}>{c.propostaNumero}</a>
                          ) : (
                            <span style={{ fontSize: 12, color: "#d1d5db" }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          {c.propostaId ? (
                            <a href={`/p/${c.propostaId}`} target="_blank" onClick={(e) => e.stopPropagation()} style={{ padding: "6px 12px", borderRadius: 6, backgroundColor: "#3498DB", color: "#fff", border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer", textDecoration: "none", display: "inline-block" }}>Ver</a>
                          ) : (
                            <button onClick={() => { const proposta = proposals.find(p => p.cliente?.toLowerCase().includes(c.nome?.toLowerCase()) || p.email?.toLowerCase() === c.email?.toLowerCase() || p.telefone === c.telemovel); if (proposta) { if (confirm(`Vincular a ${proposta.numeroOrcamento}?`)) { updateCliente(c.id, { propostaId: proposta.id, propostaNumero: proposta.numeroOrcamento, propostaValor: proposta.valor }).then(() => { loadClientes(); alert("Proposta vinculada!"); }); } else { alert("Nenhuma proposta encontrada para este cliente. Crie primeiro em Propostas."); } } }} style={{ padding: "4px 10px", borderRadius: 6, backgroundColor: "#F59E0B", color: "#fff", border: "none", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>Vincular</button>
                          )}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          {c.resposta ? (
                            <span style={{ 
                              fontSize: 10, 
                              padding: "4px 8px", 
                              borderRadius: 4, 
                              fontWeight: 600,
                              backgroundColor: c.resposta === "sim" ? "#dcfce7" : c.resposta === "nao" ? "#fee2e2" : "#fef3c7",
                              color: c.resposta === "sim" ? "#16a34a" : c.resposta === "nao" ? "#dc2626" : "#d97706"
                            }}>
                              {c.resposta === "sim" ? "✓ Aceito" : c.resposta === "nao" ? "✕ Recusado" : "↻ Reagendado"}
                            </span>
                          ) : (
                            <span style={{ fontSize: 10, padding: "4px 8px", borderRadius: 4, backgroundColor: "#f3f4f6", color: "#9ca3af" }}>Pendente</span>
                          )}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          {c.categoria === "cliente" ? (
                            <button onClick={(e) => { e.stopPropagation(); setSelectedCliente(c); setActiveTab("faturacao"); }} style={{ padding: "4px 10px", borderRadius: 6, backgroundColor: "#10B981", color: "#fff", border: "none", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>
                              Faturas
                            </button>
                          ) : (
                            <span style={{ fontSize: 10, color: "#d1d5db" }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center" }}>
                          <div style={{ display: "flex", gap: 4, justifyContent: "center" }} onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => { setClienteFormData(c); setShowClienteForm(true); }} title="Editar" style={{ padding: "6px 8px", borderRadius: 6, backgroundColor: "#f3f4f6", color: "#6b7280", border: "none", fontSize: 11, cursor: "pointer" }}>✎</button>
                            <button onClick={() => { if(confirm("Tens a certeza que queres eliminar este cliente?")) { if(confirm("Confirmar eliminaçao definitiva?")) { deleteCliente(c.id).then(loadClientes); } } }} title="Eliminar" style={{ padding: "6px 8px", borderRadius: 6, backgroundColor: "#fee2e2", color: "#dc2626", border: "none", fontSize: 11, cursor: "pointer" }}>✕</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "faturacao" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
              <div><h1 style={{ fontFamily: "Montserrat, sans-serif", fontSize: 28, fontWeight: 900, color: "#1A1A1A", marginBottom: 8 }}>Faturacao</h1><p style={{ color: "#888", fontSize: 14 }}>Gestao de faturas e pagamentos</p></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 32 }}>
              <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8" }}><div style={{ fontSize: 12, color: "#888", fontWeight: 600, marginBottom: 8 }}>Total Faturado (Ano)</div><div style={{ fontSize: 32, fontWeight: 900, color: "#10B981" }}>0 €</div></div>
              <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8" }}><div style={{ fontSize: 12, color: "#888", fontWeight: 600, marginBottom: 8 }}>Faturas Pagas</div><div style={{ fontSize: 32, fontWeight: 900, color: "#3498DB" }}>0</div></div>
              <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8" }}><div style={{ fontSize: 12, color: "#888", fontWeight: 600, marginBottom: 8 }}>Faturas Pendentes</div><div style={{ fontSize: 32, fontWeight: 900, color: "#F25C05" }}>0</div></div>
              <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8" }}><div style={{ fontSize: 12, color: "#888", fontWeight: 600, marginBottom: 8 }}>IVA a Pagar</div><div style={{ fontSize: 32, fontWeight: 900, color: "#F22283" }}>0 €</div></div>
            </div>
            <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A1A", marginBottom: 20 }}>Faturas Recentes</h3>
              <div style={{ textAlign: "center", padding: 40, color: "#888" }}>Nenhuma fatura gerada ainda.</div>
            </div>
          </div>
        )}
      </main>

      {showFaturaModal && faturaData && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#fff", borderRadius: 16, padding: 24, maxWidth: 400, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1A1A1A", marginBottom: 16 }}>Gerar Fatura</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Número da Fatura</label>
              <input type="text" value={numeroFatura} onChange={(e) => setNumeroFatura(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "2px solid #1A1A1A", fontSize: 14, fontWeight: 600 }} />
            </div>
            <div style={{ backgroundColor: "#f5f5f5", borderRadius: 8, padding: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#666" }}>Cliente: <strong>{faturaData.cliente}</strong></div>
              <div style={{ fontSize: 12, color: "#666" }}>Valor: <strong style={{ color: "#F22283" }}>{faturaData.valor?.toFixed(2)} €</strong></div>
              <div style={{ fontSize: 11, color: "#888" }}>IVA (23%): {(faturaData.valor / 1.23 * 0.23).toFixed(2)} €</div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => { gerarFaturaPDF(faturaData); setShowFaturaModal(false); }} style={{ flex: 1, padding: "12px", borderRadius: 8, backgroundColor: "#F25C05", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}>Gerar PDF</button>
              <button onClick={() => setShowFaturaModal(false)} style={{ flex: 1, padding: "12px", borderRadius: 8, backgroundColor: "#f5f5f5", color: "#666", border: "none", fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {showClienteForm && clienteFormData && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#fff", borderRadius: 16, padding: 24, maxWidth: 500, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1A1A1A", marginBottom: 20 }}>Editar Cliente</h3>
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
                          <div style={{ fontSize: 11, color: "#888" }}>{c.email} | {c.telemovel}</div>
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
              <button onClick={handleSalvarCliente} style={{ flex: 1, padding: "12px", borderRadius: 8, backgroundColor: "#F25C05", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}>Guardar Cliente</button>
              <button onClick={() => { setShowClienteForm(false); setClienteFormData(null); setClienteSearch(""); setShowClienteSuggestions(false); }} style={{ flex: 1, padding: "12px", borderRadius: 8, backgroundColor: "#f5f5f5", color: "#666", border: "none", fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}