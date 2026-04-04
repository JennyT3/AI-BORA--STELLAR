import { useState, useEffect } from "react";
import { useSearchParams } from "wouter";
import { Navbar } from "../components/Navbar";
import { CTAFooterSection } from "../components/CTAFooterSection";
import { FloatingWhatsApp } from "../components/FloatingWhatsApp";
import { Footer } from "../components/Footer";
import { Sidebar } from "../components/admin/Sidebar";
import { VendasSidebar } from "../components/admin/VendasSidebar";
import { theme } from "../styles/theme";
import { Download, Mail, User, FileText, Check, X, Plus, Trash2, Calculator, Save, Link as LinkIcon } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { createProposal } from "../services/firebase";

const IVA_TAXA = 0.23;

interface MarcaData {
  id: string;
  nome: string;
  redes: string[];
  servicos: string[];
}

interface ClienteData {
  nome: string;
  empresa: string;
  email: string;
  telefone: string;
  nif: string;
  morada: string;
}

const REDES = [
  { id: "instagram", nome: "Instagram", cor: "#E1306C", svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>` },
  { id: "facebook", nome: "Facebook", cor: "#1877F2", svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>` },
  { id: "tiktok", nome: "TikTok", cor: "#000000", svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>` },
  { id: "linkedin", nome: "LinkedIn", cor: "#0A66C2", svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>` },
  { id: "youtube", nome: "YouTube", cor: "#FF0000", svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>` },
  { id: "twitter", nome: "X", cor: "#000000", svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>` },
];

const SERVICOS_POR_CATEGORIA: Record<string, string[]> = {
  "Marketing": ["Gestão de Redes Sociais", "Criação de Conteúdo", "Community Management", "Email Marketing"],
  "Design": ["Design de Posts", "Logotipo", "Identidade Corporativa", "Banners e Posters"],
  "Web": ["Landing Page", "Site Catálogo", "Loja Online", "SEO Local"],
  "Multimédia": ["Fotografia Profissional", "Produção de Videos", "Criação de Reels", "Edição de Conteúdo"],
  "Publicidade": ["Google Ads", "Facebook Ads", "Instagram Ads", "Gestão de Budget"],
  "Automação": ["Chatbot WhatsApp", "IA e Automação", "Respostas Automáticas", "Fluxos de CRM"],
  "Consultoria": ["Consultoria Estratégica", "Análise de Concorrentes", "Dashboard Excel", "Plano de Marketing"],
};

export function Orcamento() {
  const [searchParams] = useSearchParams();
  const isAdminMode = window.location.href.includes("/admin");
  const vendedorId = searchParams.get('vendedor');
  const isVendedorOrcamento = isAdminMode && vendedorId && vendedorId !== "true";
  const [activeTab, setActiveTab] = useState<"dashboard" | "orcamento" | "propostas" | "solicitacoes" | "clientes" | "faturacao">("orcamento");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const solId = searchParams.get('sol');
  const [loadingSolicitude, setLoadingSolicitude] = useState(false);
  const [propostaId, setPropostaId] = useState<string | null>(null);
  const [isEditingProposta, setIsEditingProposta] = useState(false);
  const [currentVendedor, setCurrentVendedor] = useState<any>(null);

  useEffect(() => {
    if (isVendedorOrcamento) {
      import("../services/vendedores").then(({ getVendedor }) => {
        if (getVendedor) getVendedor(vendedorId).then(v => setCurrentVendedor(v));
      });
    }
  }, [isVendedorOrcamento, vendedorId]);

  const [numeroOrcamentoInput, setNumeroOrcamentoInput] = useState("ORC-0001");
  const [precoTotal, setPrecoTotal] = useState<number>(0);
  const [descontoPercent, setDescontoPercent] = useState<number>(0);
  const [descontoValor, setDescontoValor] = useState<number>(0);
  const [marcas, setMarcas] = useState<MarcaData[]>([{ id: "1", nome: "", redes: [], servicos: [] }]);
  const [cliente, setCliente] = useState<ClienteData>({ nome: "", empresa: "", email: "", telefone: "", nif: "", morada: "" });

  const dataCriacao = new Date();
  const dataValidade = new Date(dataCriacao.getTime() + 10 * 24 * 60 * 60 * 1000);
  const dataCriacaoStr = dataCriacao.toLocaleDateString("pt-PT");
  const dataValidadeStr = dataValidade.toLocaleDateString("pt-PT");

  useEffect(() => {
    if (solId) {
      setLoadingSolicitude(true);
      import("../services/solicitudes").then(async ({ getSolicitude }) => {
        if (getSolicitude) {
          try {
            const sol = await getSolicitude(solId);
            if (sol) {
              setCliente({ nome: sol.nome || "", empresa: sol.empresa || "", email: sol.email || "", telefone: sol.telefone || "", nif: "", morada: "" });
              if (sol.marcas && sol.marcas.length > 0) {
                setMarcas(sol.marcas.map((m: any, i: number) => ({ id: (i + 1).toString(), nome: m.nome || "", redes: m.redes || [], servicos: sol.servicos || [] })));
              } else if (sol.servicos && sol.servicos.length > 0) {
                setMarcas([{ id: "1", nome: "", redes: [], servicos: sol.servicos }]);
              }
            }
          } catch (e) { console.error("Error loading solicitude:", e); }
        }
        setLoadingSolicitude(false);
      });
    }
    
    const params = new URLSearchParams(window.location.search);
    const editId = params.get("edit");
    if (editId) {
      setLoadingSolicitude(true);
      import("../services/firebase").then(async ({ getProposal }) => {
        try {
          const proposal = await getProposal(editId);
          if (proposal) {
            setNumeroOrcamentoInput(proposal.numeroOrcamento || "ORC-0001");
            setPrecoTotal(proposal.valor || 0);
            setDescontoPercent(proposal.descontoPercent || 0);
            setDescontoValor(proposal.descontoValor || 0);
            setCliente({ 
              nome: proposal.cliente || "", 
              empresa: proposal.empresa || "", 
              email: proposal.email || "", 
              telefone: proposal.telefone || "", 
              nif: proposal.nif || "", 
              morada: proposal.morada || "" 
            });
            if (proposal.marcas && proposal.marcas.length > 0) {
              setMarcas(proposal.marcas.map((m: any, i: number) => ({ id: (i + 1).toString(), nome: m.nome || "", redes: m.redes || [], servicos: m.servicos || [] })));
            } else {
              setMarcas([{ id: "1", nome: "", redes: [], servicos: proposal.servicos || [] }]);
            }
            setPropostaId(editId);
            setIsEditingProposta(true);
          }
        } catch (e) { console.error("Error loading proposal:", e); }
        setLoadingSolicitude(false);
      });
    }
  }, [solId]);

  const toggleRede = (marcaId: string, redeId: string) => {
    setMarcas(prev => prev.map(m => m.id !== marcaId ? m : { ...m, redes: m.redes.includes(redeId) ? m.redes.filter(r => r !== redeId) : [...m.redes, redeId] }));
  };

  const toggleServico = (marcaId: string, servico: string) => {
    setMarcas(prev => prev.map(m => m.id !== marcaId ? m : { ...m, servicos: m.servicos.includes(servico) ? m.servicos.filter(s => s !== servico) : [...m.servicos, servico] }));
  };

  const adicionarMarca = () => setMarcas(prev => [...prev, { id: Date.now().toString(), nome: "", redes: [], servicos: [] }]);
  const removerMarca = (id: string) => { if (marcas.length > 1) setMarcas(prev => prev.filter(m => m.id !== id)); };

  const total = precoTotal;
  const descuentoAplicado = (total * (descontoPercent / 100)) + descontoValor;
  const totalConDescuento = total - descuentoAplicado;
  const subtotalComDesconto = totalConDescuento / (1 + IVA_TAXA);
  const ivaComDesconto = totalConDescuento - subtotalComDesconto;
  const porMarcaSemIVA = marcas.length > 0 ? subtotalComDesconto / marcas.length : 0;

  const podeGerar = !!cliente.nome && totalConDescuento > 0;
  const numeroOrcamento = numeroOrcamentoInput || "ORC-0001";

  const svgToBase64 = (svg: string): string => `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  const loadImageAsBase64 = async (url: string): Promise<string | null> => {
    try { const response = await fetch(url); const blob = await response.blob(); return new Promise((resolve) => { const reader = new FileReader(); reader.onloadend = () => resolve(reader.result as string); reader.onerror = () => resolve(null); reader.readAsDataURL(blob); }); } catch { return null; }
  };

  const criarPDF = async (): Promise<jsPDF> => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pW = 210, pH = 297;
    const logoBase64 = await loadImageAsBase64("/logo.png");
    const redeIconMap: Record<string, string> = {}; REDES.forEach(r => redeIconMap[r.id] = svgToBase64(r.svg));

    doc.setFillColor(255, 255, 255); doc.rect(0, 0, pW, 38, "F");
    doc.setFillColor(242, 92, 5); doc.rect(0, 37.5, pW, 0.8, "F");
    if (logoBase64) doc.addImage(logoBase64, "PNG", 12, 7, 24, 24);
    doc.setTextColor(26, 26, 26); doc.setFontSize(17); doc.setFont("helvetica", "bold"); doc.text("AI BORA", 40, 18);
    doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(140, 140, 140); doc.text("Marketing Digital & Criativo", 40, 24);
    doc.setTextColor(26, 26, 26); doc.setFontSize(13); doc.setFont("helvetica", "bold"); doc.text("ORÇAMENTO", 198, 13, { align: "right" });
    doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(90, 90, 90); doc.text("Nº " + numeroOrcamento, 198, 20, { align: "right" }); doc.text("Data: " + dataCriacaoStr, 198, 26, { align: "right" }); doc.text("Válido até: " + dataValidadeStr, 198, 32, { align: "right" });

    let y = 46;
    doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(242, 92, 5); doc.text("DADOS DO CLIENTE", 14, y);
    doc.setDrawColor(242, 92, 5); doc.setLineWidth(0.4); doc.line(14, y + 1.5, 196, y + 1.5);
    y += 5; doc.setFillColor(247, 245, 243); doc.rect(14, y, 182, 32, "F");
    const lbl = (label: string, value: string, x: number, yy: number) => { doc.setFontSize(8.5); doc.setFont("helvetica", "bold"); doc.setTextColor(26, 26, 26); doc.text(label, x, yy); doc.setFont("helvetica", "normal"); doc.setTextColor(70, 70, 70); doc.text(value || "—", x + 22, yy); };
    lbl("Nome:", cliente.nome, 18, y + 8); lbl("Empresa:", cliente.empresa, 107, y + 8); lbl("NIF:", cliente.nif, 18, y + 16); lbl("Email:", cliente.email, 107, y + 16); lbl("Telefone:", cliente.telefone, 18, y + 24); lbl("Morada:", cliente.morada, 107, y + 24);

    y += 40;
    doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(242, 92, 5); doc.text("MARCAS E SERVIÇOS", 14, y);
    doc.setLineWidth(0.4); doc.line(14, y + 1.5, 196, y + 1.5); y += 7;

    for (let mi = 0; mi < marcas.length; mi++) {
      const marca = marcas[mi]; if (y > 248) { doc.addPage(); y = 18; }
      const subtotalMarca = marcas.length > 0 ? subtotalComDesconto / marcas.length : 0;
      doc.setFillColor(242, 92, 5); doc.rect(14, y, 182, 9, "F");
      doc.setTextColor(255, 255, 255); doc.setFontSize(8.5); doc.setFont("helvetica", "bold");
      const nomeMarca = marca.nome ? marca.nome.toUpperCase() : "MARCA " + (mi + 1);
      doc.text("MARCA: " + nomeMarca, 18, y + 6.2); y += 13;

      if (marca.redes.length > 0) {
        doc.setFontSize(7); doc.setFont("helvetica", "bold"); doc.setTextColor(100, 100, 100); doc.text("REDES SOCIAIS:", 18, y); y += 4;
        let rx = 18;
        for (const redeId of marca.redes) {
          const rede = REDES.find(r => r.id === redeId); if (!rede) continue;
          const pilW = Math.max(doc.getTextWidth(rede.nome) + 14, 24);
          doc.setFillColor(rede.id === "instagram" ? 225 : rede.id === "facebook" ? 24 : rede.id === "tiktok" ? 0 : rede.id === "linkedin" ? 10 : rede.id === "youtube" ? 255 : 0, rede.id === "instagram" ? 48 : rede.id === "facebook" ? 119 : rede.id === "tiktok" ? 0 : rede.id === "linkedin" ? 102 : rede.id === "youtube" ? 0 : 0, rede.id === "instagram" ? 108 : rede.id === "facebook" ? 242 : rede.id === "tiktok" ? 0 : rede.id === "linkedin" ? 194 : rede.id === "youtube" ? 0 : 0);
          doc.roundedRect(rx, y, pilW, 7, 2, 2, "F");
          try { doc.addImage(redeIconMap[rede.id], "PNG", rx + 1.5, y + 1, 5, 5); } catch (_) {}
          doc.setTextColor(255, 255, 255); doc.setFontSize(6.5); doc.setFont("helvetica", "bold"); doc.text(rede.nome, rx + 8, y + 5); rx += pilW + 3;
          if (rx > 178) { rx = 18; y += 9; }
        }
        y += 10;
      }

      if (marca.servicos.length > 0) {
        autoTable(doc, { startY: y, head: [["#", "Serviços Incluídos", subtotalMarca.toFixed(2) + " € s/ IVA"]], body: marca.servicos.map((s, i) => [(i + 1).toString(), s, ""]), theme: "plain", headStyles: { fillColor: [26, 26, 26], textColor: [255, 255, 255], fontSize: 7.5, fontStyle: "bold", cellPadding: 3 }, bodyStyles: { fontSize: 8, textColor: [40, 40, 40], cellPadding: 3 }, columnStyles: { 0: { cellWidth: 8, halign: "center" }, 1: { cellWidth: 148 }, 2: { cellWidth: 26, halign: "right" } }, alternateRowStyles: { fillColor: [250, 248, 246] }, margin: { left: 14, right: 14 }, tableLineColor: [220, 215, 210], tableLineWidth: 0.2 });
        y = (doc as any).lastAutoTable?.finalY + 8;
      } else {
        doc.setFillColor(250, 248, 246); doc.rect(14, y, 182, 8, "F");
        doc.setTextColor(160, 160, 160); doc.setFontSize(7.5); doc.setFont("helvetica", "italic"); doc.text("Serviços a definir conforme proposta comercial", 18, y + 5.5); y += 14;
      }
      y += 3;
    }

    if (y > 235) { doc.addPage(); y = 18; }
    doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(242, 92, 5); doc.text("RESUMO FINANCEIRO", 14, y);
    doc.setLineWidth(0.4); doc.line(14, y + 1.5, 196, y + 1.5); y += 7;
    doc.setFillColor(242, 92, 5); doc.roundedRect(120, y, 76, 22, 3, 3, "F");
    doc.setTextColor(255, 255, 255); doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.text("TOTAL MENSAL (c/ IVA 23%)", 158, y + 7, { align: "center" });
    doc.setFontSize(17); doc.setFont("helvetica", "bold"); doc.text(totalConDescuento.toFixed(2) + " €", 194, y + 18, { align: "right" });

    let ty = y + 4;
    const linhaFin = (label: string, valor: string, bold: boolean, cor: [number, number, number]) => { doc.setFontSize(8.5); doc.setFont("helvetica", bold ? "bold" : "normal"); doc.setTextColor(cor[0], cor[1], cor[2]); doc.text(label, 14, ty); doc.text(valor, 115, ty, { align: "right" }); doc.setDrawColor(225, 220, 215); doc.setLineWidth(0.2); doc.line(14, ty + 1.5, 115, ty + 1.5); ty += 7; };
    linhaFin("Subtotal (sem IVA):", subtotalComDesconto.toFixed(2) + " €", false, [80, 80, 80]);
    if (descuentoAplicado > 0) linhaFin("Desconto:", "- " + descuentoAplicado.toFixed(2) + " €", false, [242, 92, 5]);
    linhaFin("IVA (23%):", ivaComDesconto.toFixed(2) + " €", false, [80, 80, 80]);
    linhaFin("TOTAL A PAGAR:", totalConDescuento.toFixed(2) + " €", true, [242, 92, 5]);

    ty += 6;
    if (ty > 238) { doc.addPage(); ty = 18; }
    doc.setFillColor(247, 245, 243); doc.rect(14, ty, 182, 54, "F");
    doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(26, 26, 26); doc.text("CONDIÇÕES COMERCIAIS", 18, ty + 8);
    doc.setDrawColor(242, 92, 5); doc.setLineWidth(0.3); doc.line(18, ty + 10, 192, ty + 10);
    const conds = ["Âmbito: Prestação de serviços conforme detalhado acima para " + marcas.length + " marca" + (marcas.length > 1 ? "s" : "") + ".", "Período: 3 meses experimentais + contrato anual renovável automaticamente.", "Pagamento: Mensal, por transferência bancária ou débito direto até ao dia 5 de cada mês.", "Validade: Orçamento válido até " + dataValidadeStr + " (10 dias corridos a partir da emissão).", "Rescisão: Aviso prévio de 30 dias após o período experimental, por escrito.", "Propriedade Intelectual: Todo o conteúdo criado é propriedade do cliente após liquidação total."];
    doc.setFontSize(7.8); doc.setFont("helvetica", "normal"); doc.setTextColor(60, 60, 60); let cy = ty + 17; conds.forEach(c => { doc.text("•  " + c, 18, cy, { maxWidth: 174 }); cy += 6.5; });

    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) { doc.setPage(p); doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.3); doc.line(14, pH - 18, 196, pH - 18); doc.setTextColor(100, 100, 100); doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.text("AI BORA, Lda  |  NIF: 319918645  |  helloaibora@proton.me  |  +351 936 021 747  |  www.aibora.pt", 105, pH - 12, { align: "center" }); doc.setFontSize(6.5); doc.setTextColor(160, 160, 160); doc.text("Este orçamento não constitui fatura. Sujeito à aceitação formal por escrito.", 105, pH - 7, { align: "center" }); doc.setTextColor(190, 190, 190); doc.text(p + " / " + totalPages, 196, pH - 7, { align: "right" }); }

    return doc;
  };

  const gerarPDF = async () => {
    if (!cliente.nome || totalConDescuento <= 0) { alert("Preenche o Nome do Cliente e o Valor Total."); return; }
    try { const doc = await criarPDF(); const pdfBlob = doc.output('blob'); const pdfUrl = URL.createObjectURL(pdfBlob); window.open(pdfUrl, '_blank'); } catch (err) { console.error(err); alert("Erro ao gerar PDF."); }
  };

  const podeGerarProposta = !!cliente.nome && totalConDescuento > 0;

  const handleGuardarProposta = async () => {
    if (!cliente.nome || totalConDescuento <= 0) { alert("Preenche o Nome do Cliente e o Valor Total."); return; }
    const savedUser = localStorage.getItem("adminUser");
    const currentUser = savedUser ? JSON.parse(savedUser) : null;
    try {
      const doc = await criarPDF();
      const pdfBlob = doc.output('blob');
      const proposalData = { 
        cliente: cliente.nome, 
        empresa: cliente.empresa || '', 
        email: cliente.email || '', 
        telefone: cliente.telefone || '', 
        valor: totalConDescuento, 
        subtotal: subtotalComDesconto, 
        iva: ivaComDesconto, 
        desconto: descuentoAplicado, 
        marcas: marcas.length, 
        valorPorMarca: subtotalComDesconto / marcas.length, 
        servicos: marcas[0]?.servicos || [], 
        redes: marcas.map(m => ({ nome: m.nome, redes: m.redes })), 
        numeroOrcamento: numeroOrcamento, 
        dataCriacao: dataCriacaoStr, 
        dataValidade: dataValidadeStr, 
        temOrcamentoPDF: true,
        criadoPor: currentUser?.id || 'admin'
      };
      const id = await createProposal(proposalData);
      setPropostaId(id);
      const link = `https://aibora.pt/p/${id}`;
      navigator.clipboard.writeText(link).then(() => { const pdfUrl = URL.createObjectURL(pdfBlob); window.open(pdfUrl, '_blank'); setTimeout(() => { alert(`✅ Proposta guardada!\n\nLink único copiado:\n${link}`); }, 500); });
    } catch (err) { console.error(err); alert("Erro ao guardar proposta: " + err.message); }
  };

  if (!isAdminMode) {
    if (loadingSolicitude) {
      return (
        <div className="min-h-screen bg-bg">
          <Navbar />
          <main className="pt-20">
            <section style={{ backgroundColor: "#1A1A1A", padding: "80px 16px 60px" }}>
              <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
                <h1 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 900, fontSize: "clamp(28px, 5vw, 48px)", color: "#ffffff" }}>A carregar dados...</h1>
              </div>
            </section>
          </main>
          <Footer />
        </div>
      );
    }
  }

  if (isVendedorOrcamento) {
    const vendedorNome = currentVendedor?.nome || "Vendedor";
    return (
      <div style={{ minHeight: "100vh", backgroundColor: theme.colors.bg.primary, display: "flex" }}>
        <VendasSidebar
          activeTab="orcamento"
          onTabChange={(tab) => {
            if (tab === 'dashboard') window.location.href = `/vendas?admin=true&vendedor=${vendedorId}`;
            else if (tab === 'orcamento') window.location.href = `/admin/orcamento?vendedor=${vendedorId}`;
            else if (tab === 'propostas') window.location.href = `/vendas?admin=true&vendedor=${vendedorId}&tab=propostas`;
            else if (tab === 'clientes') window.location.href = `/vendas?admin=true&vendedor=${vendedorId}&tab=clientes`;
            else if (tab === 'faturacao') window.location.href = `/vendas?admin=true&vendedor=${vendedorId}&tab=faturacao`;
            else if (tab === 'perfil') window.location.href = `/vendas?admin=true&vendedor=${vendedorId}&tab=perfil`;
          }}
          userName={vendedorNome}
          onLogout={() => { localStorage.removeItem("vendedorUser"); window.location.href = "/vendas"; }}
          proposalCount={0}
          clienteCount={0}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          vendedorId={vendedorId}
        />

        <main style={{ flex: 1, padding: 40, overflow: "auto", marginLeft: sidebarCollapsed ? 80 : 260, transition: 'margin-left 0.3s ease', height: "100vh" }}>
          <div style={{ height: "100%", overflow: "auto", paddingRight: 16 }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontFamily: theme.fontFamily.sans, fontSize: 32, fontWeight: 900, color: theme.colors.text.primary }}>Novo Orçamento</h1>
                <p style={{ color: theme.colors.text.secondary, fontSize: 14 }}>Cria uma nova proposta comercial para o seu cliente</p>
              </div>
              <div style={{ display: "flex", gap: 32 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: 24, backgroundColor: theme.colors.bg.secondary, borderRadius: 16, padding: 24, border: `1px solid ${theme.colors.border}` }}>
                    <h3 style={{ fontFamily: theme.fontFamily.sans, fontWeight: 700, fontSize: 16, color: theme.colors.text.primary, margin: "0 0 16px" }}>Dados do Cliente</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                      <div><label style={{ fontSize: 10, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 4 }}>Nome *</label><input value={cliente.nome} onChange={(e) => setCliente({...cliente, nome: e.target.value})} style={{ width: "100%", padding: "8px", borderRadius: 6, border: `2px solid ${theme.colors.text.primary}`, fontSize: 12, backgroundColor: theme.colors.bg.primary, color: theme.colors.text.primary }} /></div>
                      <div><label style={{ fontSize: 10, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 4 }}>Empresa</label><input value={cliente.empresa} onChange={(e) => setCliente({...cliente, empresa: e.target.value})} style={{ width: "100%", padding: "8px", borderRadius: 6, border: `2px solid ${theme.colors.text.primary}`, fontSize: 12, backgroundColor: theme.colors.bg.primary, color: theme.colors.text.primary }} /></div>
                      <div><label style={{ fontSize: 10, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 4 }}>Email</label><input value={cliente.email} onChange={(e) => setCliente({...cliente, email: e.target.value})} style={{ width: "100%", padding: "8px", borderRadius: 6, border: `2px solid ${theme.colors.text.primary}`, fontSize: 12, backgroundColor: theme.colors.bg.primary, color: theme.colors.text.primary }} /></div>
                      <div><label style={{ fontSize: 10, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 4 }}>Telefone</label><input value={cliente.telefone} onChange={(e) => setCliente({...cliente, telefone: e.target.value})} style={{ width: "100%", padding: "8px", borderRadius: 6, border: `2px solid ${theme.colors.text.primary}`, fontSize: 12, backgroundColor: theme.colors.bg.primary, color: theme.colors.text.primary }} /></div>
                      <div><label style={{ fontSize: 10, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 4 }}>NIF</label><input value={cliente.nif} onChange={(e) => setCliente({...cliente, nif: e.target.value})} placeholder="123456789" style={{ width: "100%", padding: "8px", borderRadius: 6, border: `2px solid ${theme.colors.text.primary}`, fontSize: 12, backgroundColor: theme.colors.bg.primary, color: theme.colors.text.primary }} /></div>
                      <div><label style={{ fontSize: 10, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 4 }}>Morada</label><input value={cliente.morada} onChange={(e) => setCliente({...cliente, morada: e.target.value})} placeholder="Rua, Nº, Cidade" style={{ width: "100%", padding: "8px", borderRadius: 6, border: `2px solid ${theme.colors.text.primary}`, fontSize: 12, backgroundColor: theme.colors.bg.primary, color: theme.colors.text.primary }} /></div>
                    </div>
                  </div>
                  <div style={{ marginBottom: 24, backgroundColor: theme.colors.bg.secondary, borderRadius: 16, padding: 20, border: `1px solid ${theme.colors.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <h3 style={{ fontFamily: theme.fontFamily.sans, fontWeight: 800, fontSize: 14, color: theme.colors.text.primary }}>Marcas e Redes Sociais</h3>
                      <button onClick={adicionarMarca} style={{ padding: "6px 12px", borderRadius: 6, backgroundColor: theme.colors.accent.secondary, color: "#fff", border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>+ Adicionar</button>
                    </div>
                    {marcas.map((marca, idx) => (
                      <div key={marca.id} style={{ backgroundColor: theme.colors.bg.primary, borderRadius: 10, padding: 12, marginBottom: 8, border: `1px solid ${theme.colors.border}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ fontWeight: 700, fontSize: 12 }}>Marca {idx + 1}</span>{marcas.length > 1 && <button onClick={() => removerMarca(marca.id)} style={{ background: "none", border: "none", color: theme.colors.accent.primary, cursor: "pointer", fontSize: 10 }}>X</button>}</div>
                        <input type="text" value={marca.nome} onChange={e => setMarcas(prev => prev.map(m => m.id === marca.id ? { ...m, nome: e.target.value } : m))} placeholder="Nome da marca" style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: `1px solid ${theme.colors.border}`, fontSize: 11, marginBottom: 8, backgroundColor: theme.colors.bg.secondary, color: theme.colors.text.primary }} />
                        <p style={{ fontSize: 10, fontWeight: 600, color: theme.colors.text.secondary, marginBottom: 6 }}>Redes Sociais:</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {REDES.map(rede => { const isSelected = marca.redes.includes(rede.id); return <button key={rede.id} onClick={() => toggleRede(marca.id, rede.id)} style={{ fontSize: 9, fontWeight: 600, backgroundColor: isSelected ? rede.cor : theme.colors.bg.primary, color: isSelected ? "#ffffff" : theme.colors.text.primary, border: isSelected ? "none" : `1px solid ${theme.colors.border}`, borderRadius: 20, padding: "4px 8px", cursor: "pointer" }}>{rede.nome}</button>; })}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ marginBottom: 12 }}><h2 style={{ fontFamily: theme.fontFamily.sans, fontWeight: 900, fontSize: "clamp(16px, 3vw, 22px)", color: theme.colors.text.primary, margin: "0 0 4px" }}>Seleciona os Serviços</h2></div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                      {Object.entries(SERVICOS_POR_CATEGORIA).map(([categoria, servicos]) => {
                        const catIcon = { "Marketing": "📱", "Design": "🎨", "Web": "💻", "Multimédia": "🎬", "Publicidade": "📢", "Automação": "⚡", "Consultoria": "📊" }[categoria];
                        return (
                          <div key={categoria} style={{ backgroundColor: theme.colors.bg.secondary, borderRadius: 12, padding: 12, display: "flex", flexDirection: "column", gap: 8, border: `1px solid ${theme.colors.border}` }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 18 }}>{catIcon}</span><span style={{ fontWeight: 700, fontSize: 12 }}>{categoria}</span></div>
                            <div style={{ height: 1, backgroundColor: theme.colors.border }} />
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                              {servicos.map((s) => { const sel = marcas[0]?.servicos.includes(s); return <button key={s} onClick={() => marcas.length === 1 && toggleServico(marcas[0].id, s)} style={{ fontSize: 9, fontWeight: 600, backgroundColor: sel ? theme.colors.accent.primary : theme.colors.bg.primary, color: sel ? "#ffffff" : theme.colors.text.primary, border: sel ? `1px solid ${theme.colors.accent.primary}` : `1px solid rgba(0,0,0,0.10)`, borderRadius: 20, padding: "3px 8px", cursor: "pointer" }}>{sel ? "✓ " : ""}{s}</button>; })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div style={{ width: 320, flexShrink: 0 }}>
                  <div style={{ backgroundColor: theme.colors.bg.secondary, borderRadius: 16, padding: 24, position: "sticky", top: 40, border: `1px solid ${theme.colors.border}` }}>
                    <h3 style={{ fontWeight: 700, fontSize: 16, margin: "0 0 16px", color: theme.colors.text.primary }}>Resumo do Orçamento</h3>
                    <div style={{ marginBottom: 16 }}><label style={{ fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 6 }}>Nº Orçamento</label><input type="text" value={numeroOrcamentoInput} onChange={e => !isEditingProposta && setNumeroOrcamentoInput(e.target.value.toUpperCase())} placeholder="ORC-0001" disabled={isEditingProposta} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `2px solid ${theme.colors.text.primary}`, fontSize: 14, fontWeight: 700, textAlign: "center", backgroundColor: isEditingProposta ? theme.colors.bg.tertiary : theme.colors.bg.primary }} /></div>
                    <div style={{ marginBottom: 16 }}><label style={{ fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 6 }}>Valor Total (com IVA)</label><div style={{ display: "flex", alignItems: "center", gap: 8 }}><input type="number" value={precoTotal || ""} onChange={e => setPrecoTotal(Number(e.target.value))} placeholder="0.00" style={{ flex: 1, padding: "12px", borderRadius: 8, border: `2px solid ${theme.colors.text.primary}`, fontSize: 18, fontWeight: 700, textAlign: "right", backgroundColor: theme.colors.bg.primary }} /><span style={{ fontWeight: 700, fontSize: 18 }}>€</span></div></div>
                    <div style={{ marginBottom: 16 }}><label style={{ fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 6 }}>Desconto</label><div style={{ display: "flex", gap: 8 }}><div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4 }}><input type="number" value={descontoPercent || ""} onChange={e => setDescontoPercent(Number(e.target.value))} placeholder="0" style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${theme.colors.border}`, fontSize: 13, textAlign: "right", backgroundColor: theme.colors.bg.primary }} /><span style={{ fontSize: 12, color: theme.colors.text.secondary }}>%</span></div><div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4 }}><input type="number" value={descontoValor || ""} onChange={e => setDescontoValor(Number(e.target.value))} placeholder="0" style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${theme.colors.border}`, fontSize: 13, textAlign: "right", backgroundColor: theme.colors.bg.primary }} /><span style={{ fontSize: 12, color: theme.colors.text.secondary }}>€</span></div></div></div>
                    <div style={{ backgroundColor: theme.colors.bg.primary, borderRadius: 12, padding: 16, marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px dashed ${theme.colors.border}` }}><span style={{ fontSize: 12, color: theme.colors.text.secondary }}>Subtotal (sem IVA)</span><span style={{ fontSize: 12, fontWeight: 600 }}>{subtotalComDesconto.toFixed(2)} €</span></div>
                      {descuentoAplicado > 0 && <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px dashed ${theme.colors.border}`, color: theme.colors.accent.primary }}><span style={{ fontSize: 12, fontWeight: 600 }}>Desconto</span><span style={{ fontSize: 12, fontWeight: 600 }}>- {descuentoAplicado.toFixed(2)} €</span></div>}
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px dashed ${theme.colors.border}` }}><span style={{ fontSize: 12, color: theme.colors.text.secondary }}>IVA (23%)</span><span style={{ fontSize: 12, fontWeight: 600 }}>{ivaComDesconto.toFixed(2)} €</span></div>
                      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8 }}><span style={{ fontSize: 14, fontWeight: 700 }}>TOTAL</span><span style={{ fontSize: 20, fontWeight: 900, color: theme.colors.accent.primary }}>{totalConDescuento.toFixed(2)} €</span></div>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                      {propostaId ? <a href={`/p/${propostaId}`} target="_blank" style={{ flex: 1, padding: "12px", borderRadius: 10, fontWeight: 700, fontSize: 12, backgroundColor: theme.colors.accent.primary, color: "#ffffff", border: "none", textDecoration: "none", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>Ver Proposta</a> : <button disabled style={{ flex: 1, padding: "12px", borderRadius: 10, fontWeight: 700, fontSize: 12, backgroundColor: "#ccc", color: "#fff", border: "none" }}>Guardar primeiro</button>}
                      <button onClick={gerarPDF} disabled={!podeGerarProposta} style={{ flex: 1, padding: "12px", borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: podeGerarProposta ? "pointer" : "not-allowed", backgroundColor: "#3498DB", color: "#ffffff", border: "none" }}>PDF</button>
                    </div>
                    <button onClick={handleGuardarProposta} disabled={!podeGerarProposta} style={{ width: "100%", padding: "14px", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: podeGerarProposta ? "pointer" : "not-allowed", backgroundColor: podeGerarProposta ? theme.colors.accent.secondary : "#cccccc", color: "#ffffff", border: "none" }}>Guardar Proposta</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (isAdminMode) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: theme.colors.bg.primary, display: "flex" }}>
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            if (tab === 'dashboard') window.location.href = '/admin';
            else if (tab === 'propostas') window.location.href = '/admin?tab=propostas';
            else if (tab === 'solicitacoes') window.location.href = '/admin?tab=solicitacoes';
            else if (tab === 'clientes') window.location.href = '/admin?tab=clientes';
            else if (tab === 'faturacao') window.location.href = '/admin?tab=faturacao';
          }}
          userName="Admin"
          onLogout={() => { localStorage.removeItem("adminUser"); window.location.href = "/admin"; }}
          proposalCount={0}
          solicitudCount={0}
          clienteCount={0}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main style={{ flex: 1, padding: 40, overflow: "auto", marginLeft: sidebarCollapsed ? 80 : 260, transition: 'margin-left 0.3s ease', height: "100vh" }}>
          <div style={{ height: "100%", overflow: "auto", paddingRight: 16 }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontFamily: theme.fontFamily.sans, fontSize: 32, fontWeight: 900, color: theme.colors.text.primary }}>Novo Orçamento</h1>
                <p style={{ color: theme.colors.text.secondary, fontSize: 14 }}>Cria uma nova proposta comercial</p>
              </div>

              <div style={{ display: "flex", gap: 32 }}>
                <div style={{ flex: 1 }}>
                  {/* CLIENTE INFO */}
                  <div style={{ marginBottom: 24, backgroundColor: theme.colors.bg.secondary, borderRadius: 16, padding: 24, border: `1px solid ${theme.colors.border}` }}>
                    <h3 style={{ fontFamily: theme.fontFamily.sans, fontWeight: 700, fontSize: 16, color: theme.colors.text.primary, margin: "0 0 16px" }}>Dados do Cliente</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                      <div><label style={{ fontSize: 10, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 4 }}>Nome *</label><input value={cliente.nome} onChange={(e) => setCliente({...cliente, nome: e.target.value})} style={{ width: "100%", padding: "8px", borderRadius: 6, border: `2px solid ${theme.colors.text.primary}`, fontSize: 12, backgroundColor: theme.colors.bg.primary, color: theme.colors.text.primary }} /></div>
                      <div><label style={{ fontSize: 10, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 4 }}>Empresa</label><input value={cliente.empresa} onChange={(e) => setCliente({...cliente, empresa: e.target.value})} style={{ width: "100%", padding: "8px", borderRadius: 6, border: `2px solid ${theme.colors.text.primary}`, fontSize: 12, backgroundColor: theme.colors.bg.primary, color: theme.colors.text.primary }} /></div>
                      <div><label style={{ fontSize: 10, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 4 }}>Email</label><input value={cliente.email} onChange={(e) => setCliente({...cliente, email: e.target.value})} style={{ width: "100%", padding: "8px", borderRadius: 6, border: `2px solid ${theme.colors.text.primary}`, fontSize: 12, backgroundColor: theme.colors.bg.primary, color: theme.colors.text.primary }} /></div>
                      <div><label style={{ fontSize: 10, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 4 }}>Telefone</label><input value={cliente.telefone} onChange={(e) => setCliente({...cliente, telefone: e.target.value})} style={{ width: "100%", padding: "8px", borderRadius: 6, border: `2px solid ${theme.colors.text.primary}`, fontSize: 12, backgroundColor: theme.colors.bg.primary, color: theme.colors.text.primary }} /></div>
                      <div><label style={{ fontSize: 10, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 4 }}>NIF</label><input value={cliente.nif} onChange={(e) => setCliente({...cliente, nif: e.target.value})} placeholder="123456789" style={{ width: "100%", padding: "8px", borderRadius: 6, border: `2px solid ${theme.colors.text.primary}`, fontSize: 12, backgroundColor: theme.colors.bg.primary, color: theme.colors.text.primary }} /></div>
                      <div><label style={{ fontSize: 10, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 4 }}>Morada</label><input value={cliente.morada} onChange={(e) => setCliente({...cliente, morada: e.target.value})} placeholder="Rua, Nº, Cidade" style={{ width: "100%", padding: "8px", borderRadius: 6, border: `2px solid ${theme.colors.text.primary}`, fontSize: 12, backgroundColor: theme.colors.bg.primary, color: theme.colors.text.primary }} /></div>
                    </div>
                  </div>

                  {/* MARCAS E REDES */}
                  <div style={{ marginBottom: 24, backgroundColor: theme.colors.bg.secondary, borderRadius: 16, padding: 20, border: `1px solid ${theme.colors.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <h3 style={{ fontFamily: theme.fontFamily.sans, fontWeight: 800, fontSize: 14, color: theme.colors.text.primary }}>Marcas e Redes Sociais</h3>
                      <button onClick={adicionarMarca} style={{ padding: "6px 12px", borderRadius: 6, backgroundColor: theme.colors.accent.secondary, color: "#fff", border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>+ Adicionar</button>
                    </div>
                    {marcas.map((marca, idx) => (
                      <div key={marca.id} style={{ backgroundColor: theme.colors.bg.primary, borderRadius: 10, padding: 12, marginBottom: 8, border: `1px solid ${theme.colors.border}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ fontWeight: 700, fontSize: 12 }}>Marca {idx + 1}</span>{marcas.length > 1 && <button onClick={() => removerMarca(marca.id)} style={{ background: "none", border: "none", color: theme.colors.accent.primary, cursor: "pointer", fontSize: 10 }}>X</button>}</div>
                        <input type="text" value={marca.nome} onChange={e => setMarcas(prev => prev.map(m => m.id === marca.id ? { ...m, nome: e.target.value } : m))} placeholder="Nome da marca" style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: `1px solid ${theme.colors.border}`, fontSize: 11, marginBottom: 8, backgroundColor: theme.colors.bg.secondary, color: theme.colors.text.primary }} />
                        <p style={{ fontSize: 10, fontWeight: 600, color: theme.colors.text.secondary, marginBottom: 6 }}>Redes Sociais:</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {REDES.map(rede => { const isSelected = marca.redes.includes(rede.id); return <button key={rede.id} onClick={() => toggleRede(marca.id, rede.id)} style={{ fontSize: 9, fontWeight: 600, backgroundColor: isSelected ? rede.cor : theme.colors.bg.primary, color: isSelected ? "#ffffff" : theme.colors.text.primary, border: isSelected ? "none" : `1px solid ${theme.colors.border}`, borderRadius: 20, padding: "4px 8px", cursor: "pointer" }}>{rede.nome}</button>; })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* SERVIÇOS */}
                  <div>
                    <div style={{ marginBottom: 12 }}><h2 style={{ fontFamily: theme.fontFamily.sans, fontWeight: 900, fontSize: "clamp(16px, 3vw, 22px)", color: theme.colors.text.primary, margin: "0 0 4px" }}>Seleciona os Serviços</h2></div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                      {Object.entries(SERVICOS_POR_CATEGORIA).map(([categoria, servicos]) => {
                        const catIcon = { "Marketing": "📱", "Design": "🎨", "Web": "💻", "Multimédia": "🎬", "Publicidade": "📢", "Automação": "⚡", "Consultoria": "📊" }[categoria];
                        return (
                          <div key={categoria} style={{ backgroundColor: theme.colors.bg.secondary, borderRadius: 12, padding: 12, display: "flex", flexDirection: "column", gap: 8, border: `1px solid ${theme.colors.border}` }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 18 }}>{catIcon}</span><span style={{ fontWeight: 700, fontSize: 12 }}>{categoria}</span></div>
                            <div style={{ height: 1, backgroundColor: theme.colors.border }} />
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                              {servicos.map((s) => { const sel = marcas[0]?.servicos.includes(s); return <button key={s} onClick={() => marcas.length === 1 && toggleServico(marcas[0].id, s)} style={{ fontSize: 9, fontWeight: 600, backgroundColor: sel ? theme.colors.accent.primary : theme.colors.bg.primary, color: sel ? "#ffffff" : theme.colors.text.primary, border: sel ? `1px solid ${theme.colors.accent.primary}` : `1px solid rgba(0,0,0,0.10)`, borderRadius: 20, padding: "3px 8px", cursor: "pointer" }}>{sel ? "✓ " : ""}{s}</button>; })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* RESUMO SIDEBAR */}
                <div style={{ width: 320, flexShrink: 0 }}>
                  <div style={{ backgroundColor: theme.colors.bg.secondary, borderRadius: 16, padding: 24, position: "sticky", top: 40, border: `1px solid ${theme.colors.border}` }}>
                    <h3 style={{ fontWeight: 700, fontSize: 16, margin: "0 0 16px", color: theme.colors.text.primary }}>Resumo do Orçamento</h3>
                    <div style={{ marginBottom: 16 }}><label style={{ fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 6 }}>Nº Orçamento</label><input type="text" value={numeroOrcamentoInput} onChange={e => !isEditingProposta && setNumeroOrcamentoInput(e.target.value.toUpperCase())} placeholder="ORC-0001" disabled={isEditingProposta} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `2px solid ${theme.colors.text.primary}`, fontSize: 14, fontWeight: 700, textAlign: "center", backgroundColor: isEditingProposta ? theme.colors.bg.tertiary : theme.colors.bg.primary }} /></div>
                    <div style={{ marginBottom: 16 }}><label style={{ fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 6 }}>Valor Total (com IVA)</label><div style={{ display: "flex", alignItems: "center", gap: 8 }}><input type="number" value={precoTotal || ""} onChange={e => setPrecoTotal(Number(e.target.value))} placeholder="0.00" style={{ flex: 1, padding: "12px", borderRadius: 8, border: `2px solid ${theme.colors.text.primary}`, fontSize: 18, fontWeight: 700, textAlign: "right", backgroundColor: theme.colors.bg.primary }} /><span style={{ fontWeight: 700, fontSize: 18 }}>€</span></div></div>
                    <div style={{ marginBottom: 16 }}><label style={{ fontSize: 11, fontWeight: 600, color: theme.colors.text.secondary, display: "block", marginBottom: 6 }}>Desconto</label><div style={{ display: "flex", gap: 8 }}><div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4 }}><input type="number" value={descontoPercent || ""} onChange={e => setDescontoPercent(Number(e.target.value))} placeholder="0" style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${theme.colors.border}`, fontSize: 13, textAlign: "right", backgroundColor: theme.colors.bg.primary }} /><span style={{ fontSize: 12, color: theme.colors.text.secondary }}>%</span></div><div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4 }}><input type="number" value={descontoValor || ""} onChange={e => setDescontoValor(Number(e.target.value))} placeholder="0" style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${theme.colors.border}`, fontSize: 13, textAlign: "right", backgroundColor: theme.colors.bg.primary }} /><span style={{ fontSize: 12, color: theme.colors.text.secondary }}>€</span></div></div></div>
                    <div style={{ backgroundColor: theme.colors.bg.primary, borderRadius: 12, padding: 16, marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px dashed ${theme.colors.border}` }}><span style={{ fontSize: 12, color: theme.colors.text.secondary }}>Subtotal (sem IVA)</span><span style={{ fontSize: 12, fontWeight: 600 }}>{subtotalComDesconto.toFixed(2)} €</span></div>
                      {descuentoAplicado > 0 && <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px dashed ${theme.colors.border}`, color: theme.colors.accent.primary }}><span style={{ fontSize: 12, fontWeight: 600 }}>Desconto</span><span style={{ fontSize: 12, fontWeight: 600 }}>- {descuentoAplicado.toFixed(2)} €</span></div>}
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px dashed ${theme.colors.border}` }}><span style={{ fontSize: 12, color: theme.colors.text.secondary }}>IVA (23%)</span><span style={{ fontSize: 12, fontWeight: 600 }}>{ivaComDesconto.toFixed(2)} €</span></div>
                      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8 }}><span style={{ fontSize: 14, fontWeight: 700 }}>TOTAL</span><span style={{ fontSize: 20, fontWeight: 900, color: theme.colors.accent.primary }}>{totalConDescuento.toFixed(2)} €</span></div>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                      {propostaId ? <a href={`/p/${propostaId}`} target="_blank" style={{ flex: 1, padding: "12px", borderRadius: 10, fontWeight: 700, fontSize: 12, backgroundColor: theme.colors.accent.primary, color: "#ffffff", border: "none", textDecoration: "none", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>Ver Proposta</a> : <button disabled style={{ flex: 1, padding: "12px", borderRadius: 10, fontWeight: 700, fontSize: 12, backgroundColor: "#ccc", color: "#fff", border: "none" }}>Guardar primeiro</button>}
                      <button onClick={gerarPDF} disabled={!podeGerarProposta} style={{ flex: 1, padding: "12px", borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: podeGerarProposta ? "pointer" : "not-allowed", backgroundColor: "#3498DB", color: "#ffffff", border: "none" }}>PDF</button>
                    </div>
                    <button onClick={handleGuardarProposta} disabled={!podeGerarProposta} style={{ width: "100%", padding: "14px", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: podeGerarProposta ? "pointer" : "not-allowed", backgroundColor: podeGerarProposta ? theme.colors.accent.secondary : "#cccccc", color: "#ffffff", border: "none" }}>Guardar Proposta</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="pt-20">
        <section style={{ backgroundColor: "#1A1A1A", padding: "80px 16px 60px" }}>
          <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
            <h1 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 900, fontSize: "clamp(28px, 5vw, 48px)", color: "#ffffff", lineHeight: 1.1 }}>Gerador de <span style={{ color: "#F22283" }}>Orçamentos</span></h1>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 16, color: "#aaaaaa" }}>Configura as marcas, serviços e gera um PDF profissional em segundos.</p>
          </div>
        </section>

        <section style={{ backgroundColor: "#ffffff", padding: "48px 16px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 600px" }}>
              
              {/* DADOS DO CLIENTE */}
              <div style={{ marginBottom: 24, backgroundColor: "#F5F2F0", borderRadius: 16, padding: 24 }}>
                <h3 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 800, fontSize: 18, color: "#1A1A1A", margin: "0 0 16px" }}>👤 Dados do Cliente</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ position: "relative" }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Nome Completo *</label>
                    <input type="text" value={cliente.nome} onChange={e => setCliente({...cliente, nome: e.target.value})} placeholder="Ex: João Silva" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13 }} />
                  </div>
                  <div><label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Empresa</label><input type="text" value={cliente.empresa} onChange={e => setCliente({...cliente, empresa: e.target.value})} placeholder="Ex: Empresa, Lda" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13 }} /></div>
                  <div><label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Email</label><input type="email" value={cliente.email} onChange={e => setCliente({...cliente, email: e.target.value})} placeholder="email@empresa.pt" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13 }} /></div>
                  <div><label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Telefone</label><input type="tel" value={cliente.telefone} onChange={e => setCliente({...cliente, telefone: e.target.value})} placeholder="+351 912 345 678" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13 }} /></div>
                  <div><label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>NIF</label><input type="text" value={cliente.nif} onChange={e => setCliente({...cliente, nif: e.target.value})} placeholder="123456789" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13 }} /></div>
                  <div><label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Morada</label><input type="text" value={cliente.morada} onChange={e => setCliente({...cliente, morada: e.target.value})} placeholder="Rua Example, 123" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13 }} /></div>
                </div>
              </div>

              {/* MARCAS E REDES */}
              <div style={{ marginBottom: 24, backgroundColor: "#F5F2F0", borderRadius: 16, padding: 24 }}>
                <h3 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 800, fontSize: 16, color: "#1A1A1A", margin: "0 0 16px" }}>🏷️ Marcas e Redes Sociais</h3>
                {marcas.map((marca, idx) => (
                  <div key={marca.id} style={{ backgroundColor: "#ffffff", borderRadius: 12, padding: 16, marginBottom: 12, border: "1px solid #e0ddd9" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}><span style={{ fontWeight: 700, fontSize: 14 }}>Marca {idx + 1}</span>{marcas.length > 1 && <button onClick={() => removerMarca(marca.id)} style={{ background: "none", border: "none", color: "#F22283", cursor: "pointer" }}>✕</button>}</div>
                    <input type="text" value={marca.nome} onChange={e => setMarcas(prev => prev.map(m => m.id === marca.id ? { ...m, nome: e.target.value } : m))} placeholder="Nome da marca" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13, marginBottom: 12 }} />
                    <p style={{ fontSize: 11, fontWeight: 600, color: "#666", marginBottom: 8 }}>Redes Sociais:</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {REDES.map(rede => { const isSelected = marca.redes.includes(rede.id); return <button key={rede.id} onClick={() => toggleRede(marca.id, rede.id)} style={{ fontSize: 10, fontWeight: 600, backgroundColor: isSelected ? rede.cor : "#ffffff", color: isSelected ? "#ffffff" : "#1A1A1A", border: isSelected ? "none" : "1px solid #ddd", borderRadius: 20, padding: "6px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>{rede.nome}</button>; })}
                    </div>
                  </div>
                ))}
                <button onClick={adicionarMarca} style={{ width: "100%", padding: "12px", borderRadius: 10, border: "2px dashed #ccc", backgroundColor: "transparent", color: "#666", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Plus size={16} /> Adicionar Marca</button>
              </div>

              {/* SERVIÇOS */}
              <div>
                <div style={{ marginBottom: 20 }}><h2 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 900, fontSize: "clamp(20px, 4vw, 28px)", color: "#1A1A1A", margin: "0 0 8px" }}>Seleciona os Serviços</h2></div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
                  {Object.entries(SERVICOS_POR_CATEGORIA).map(([categoria, servicos]) => {
                    const catIcon = { "Marketing": "📱", "Design": "🎨", "Web": "💻", "Multimédia": "🎬", "Publicidade": "📢", "Automação": "⚡", "Consultoria": "📊" }[categoria];
                    return (
                      <div key={categoria} style={{ backgroundColor: "#F5F2F0", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 24 }}>{catIcon}</span><span style={{ fontWeight: 800, fontSize: 15 }}>{categoria}</span></div>
                        <div style={{ height: 1, backgroundColor: "#e0ddd9" }} />
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {servicos.map((s) => { const sel = marcas[0]?.servicos.includes(s); return <button key={s} onClick={() => marcas.length === 1 && toggleServico(marcas[0].id, s)} style={{ fontSize: 11, fontWeight: 600, backgroundColor: sel ? "#F22283" : "#ffffff", color: sel ? "#ffffff" : "#1A1A1A", border: sel ? "1px solid #F22283" : "1px solid rgba(0,0,0,0.10)", borderRadius: 20, padding: "5px 12px", cursor: "pointer" }}>{sel ? "✓ " : ""}{s}</button>; })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* SIDEBAR RESUMO */}
            <div style={{ flex: "0 1 320px", position: "sticky", top: 100 }}>
              <div style={{ backgroundColor: "#F5F2F0", borderRadius: 16, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                <h3 style={{ fontWeight: 700, fontSize: 16, margin: "0 0 16px" }}>📋 Resumo do Orçamento</h3>
                <div style={{ marginBottom: 16 }}><label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Nº Orçamento</label><input type="text" value={numeroOrcamentoInput} onChange={e => !isEditingProposta && setNumeroOrcamentoInput(e.target.value.toUpperCase())} placeholder="ORC-0001" disabled={isEditingProposta} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "2px solid #1A1A1A", fontSize: 14, fontWeight: 700, textAlign: "center", backgroundColor: isEditingProposta ? "#f0f0f0" : "#fff" }} /></div>
                <div style={{ marginBottom: 16 }}><label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Valor Total (com IVA)</label><div style={{ display: "flex", alignItems: "center", gap: 8 }}><input type="number" value={precoTotal || ""} onChange={e => setPrecoTotal(Number(e.target.value))} placeholder="0.00" style={{ flex: 1, padding: "12px", borderRadius: 8, border: "2px solid #1A1A1A", fontSize: 18, fontWeight: 700, textAlign: "right" }} /><span style={{ fontWeight: 700, fontSize: 18 }}>€</span></div></div>
                <div style={{ marginBottom: 16 }}><label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Desconto</label><div style={{ display: "flex", gap: 8 }}><div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4 }}><input type="number" value={descontoPercent || ""} onChange={e => setDescontoPercent(Number(e.target.value))} placeholder="0" style={{ width: "100%", padding: "8px", borderRadius: 6, border: "1px solid #ddd", fontSize: 13, textAlign: "right" }} /><span style={{ fontSize: 12, color: "#666" }}>%</span></div><div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4 }}><input type="number" value={descontoValor || ""} onChange={e => setDescontoValor(Number(e.target.value))} placeholder="0" style={{ width: "100%", padding: "8px", borderRadius: 6, border: "1px solid #ddd", fontSize: 13, textAlign: "right" }} /><span style={{ fontSize: 12, color: "#666" }}>€</span></div></div></div>
                <div style={{ backgroundColor: "#ffffff", borderRadius: 12, padding: 16, marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px dashed #e0ddd9" }}><span style={{ fontSize: 12, color: "#666" }}>Subtotal (sem IVA)</span><span style={{ fontSize: 12, fontWeight: 600 }}>{subtotalComDesconto.toFixed(2)} €</span></div>
                  {descuentoAplicado > 0 && <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px dashed #e0ddd9", color: "#F25C05" }}><span style={{ fontSize: 12, fontWeight: 600 }}>Desconto</span><span style={{ fontSize: 12, fontWeight: 600 }}>- {descuentoAplicado.toFixed(2)} €</span></div>}
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px dashed #e0ddd9" }}><span style={{ fontSize: 12, color: "#666" }}>IVA (23%)</span><span style={{ fontSize: 12, fontWeight: 600 }}>{ivaComDesconto.toFixed(2)} €</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8 }}><span style={{ fontSize: 14, fontWeight: 700 }}>TOTAL</span><span style={{ fontSize: 18, fontWeight: 900, color: "#F22283" }}>{totalConDescuento.toFixed(2)} €</span></div>
                </div>
                
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <button onClick={gerarPDF} disabled={!podeGerarProposta} style={{ flex: 1, padding: "12px", borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: podeGerarProposta ? "pointer" : "not-allowed", backgroundColor: "#3498DB", color: "#ffffff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>📄 Preview PDF</button>
                  {propostaId ? (
                    <a href={`/p/${propostaId}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: "12px", borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: "pointer", backgroundColor: "#F22283", color: "#ffffff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, textDecoration: "none" }}>👁️ Preview Proposta</a>
                  ) : (
                    <button disabled style={{ flex: 1, padding: "12px", borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: "not-allowed", backgroundColor: "#666666", color: "#aaaaaa", border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>👁️ Guardar primeiro</button>
                  )}
                </div>
                <button onClick={handleGuardarProposta} disabled={!podeGerarProposta} style={{ width: "100%", padding: "14px", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: podeGerarProposta ? "pointer" : "not-allowed", backgroundColor: podeGerarProposta ? "#F25C05" : "#cccccc", color: "#ffffff", border: "none" }}>💾 Guardar Proposta</button>
              </div>
            </div>
          </div>
        </section>
        <CTAFooterSection />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}

export default Orcamento;