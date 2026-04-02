import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { CTAFooterSection } from "../components/CTAFooterSection";
import { FloatingWhatsApp } from "../components/FloatingWhatsApp";
import { Footer } from "../components/Footer";
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
  { id: "instagram", nome: "Instagram", cor: "#E1306C", pdfColor: [225, 48, 108] as [number,number,number],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>` },
  { id: "facebook", nome: "Facebook", cor: "#1877F2", pdfColor: [24, 119, 242] as [number,number,number],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>` },
  { id: "tiktok", nome: "TikTok", cor: "#000000", pdfColor: [0, 0, 0] as [number,number,number],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>` },
  { id: "linkedin", nome: "LinkedIn", cor: "#0A66C2", pdfColor: [10, 102, 194] as [number,number,number],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>` },
  { id: "youtube", nome: "YouTube", cor: "#FF0000", pdfColor: [255, 0, 0] as [number,number,number],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>` },
  { id: "twitter", nome: "X", cor: "#000000", pdfColor: [0, 0, 0] as [number,number,number],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>` },
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
  const [numeroOrcamentoInput, setNumeroOrcamentoInput] = useState("ORC-0001");
  const [precoTotal, setPrecoTotal] = useState<number>(0);
  const [descontoPercent, setDescontoPercent] = useState<number>(0);
  const [descontoValor, setDescontoValor] = useState<number>(0);
  const [marcas, setMarcas] = useState<MarcaData[]>([
    { id: "1", nome: "", redes: [], servicos: [] }
  ]);
  const [cliente, setCliente] = useState<ClienteData>({
    nome: "", empresa: "", email: "", telefone: "", nif: "", morada: ""
  });

  const dataCriacao = new Date();
  const dataValidade = new Date(dataCriacao.getTime() + 10 * 24 * 60 * 60 * 1000);
  const dataCriacaoStr = dataCriacao.toLocaleDateString("pt-PT");
  const dataValidadeStr = dataValidade.toLocaleDateString("pt-PT");

  const numeroOrcamento = numeroOrcamentoInput || "ORC-0001";
  
  // El precio total es el valor que el usuario ingresa (valor cerrado/final con IVA)
  // El descuento se resta directamente del total
  const total = precoTotal;
  const descuentoPorcentaje = total * (descontoPercent / 100);
  const descuentoAplicado = descuentoPorcentaje + descontoValor;
  const totalConDescuento = total - descuentoAplicado;
  
  // Calculamos el subtotal y IVA a partir del total con descuento
  const subtotalComDesconto = totalConDescuento / (1 + IVA_TAXA);
  const ivaComDesconto = totalConDescuento - subtotalComDesconto;
  
  // Valor por marca (sin IVA)
  const porMarcaSemIVA = marcas.length > 0 ? subtotalComDesconto / marcas.length : 0;

  const toggleRede = (marcaId: string, redeId: string) => {
    setMarcas(prev => prev.map(m => {
      if (m.id !== marcaId) return m;
      const redes = m.redes.includes(redeId)
        ? m.redes.filter(r => r !== redeId)
        : [...m.redes, redeId];
      return { ...m, redes };
    }));
  };

  const toggleServico = (marcaId: string, servico: string) => {
    setMarcas(prev => prev.map(m => {
      if (m.id !== marcaId) return m;
      const servicos = m.servicos.includes(servico)
        ? m.servicos.filter(s => s !== servico)
        : [...m.servicos, servico];
      return { ...m, servicos };
    }));
  };

  const adicionarMarca = () => {
    setMarcas(prev => [...prev, {
      id: Date.now().toString(),
      nome: "",
      redes: [],
      servicos: []
    }]);
  };

  const removerMarca = (id: string) => {
    if (marcas.length === 1) return;
    setMarcas(prev => prev.filter(m => m.id !== id));
  };

  const svgToBase64 = (svg: string): string => {
    const encoded = btoa(unescape(encodeURIComponent(svg)));
    return `data:image/svg+xml;base64,${encoded}`;
  };

  const loadImageAsBase64 = async (url: string): Promise<string | null> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch { return null; }
  };

  const criarPDF = async (): Promise<jsPDF> => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pW = 210;
    const pH = 297;
    
    const logoBase64 = await loadImageAsBase64("/logo.png");
    
    const redeIconMap: Record<string, string> = {};
    for (const rede of REDES) {
      redeIconMap[rede.id] = svgToBase64(rede.svg);
    }

    // HEADER blanco con línea naranja sutil
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pW, 38, "F");
    doc.setFillColor(242, 92, 5);
    doc.rect(0, 37.5, pW, 0.8, "F");

    // Logo 1:1 — 24×24 mm
    if (logoBase64) {
      doc.addImage(logoBase64, "PNG", 12, 7, 24, 24);
    }

    // "AI BORA" en negro
    doc.setTextColor(26, 26, 26);
    doc.setFontSize(17);
    doc.setFont("helvetica", "bold");
    doc.text("AI BORA", 40, 18);

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(140, 140, 140);
    doc.text("Marketing Digital & Criativo", 40, 24);

    // Bloque derecha: ORÇAMENTO + Nº + Data + Válido até
    doc.setTextColor(26, 26, 26);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("ORÇAMENTO", 198, 13, { align: "right" });

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(90, 90, 90);
    doc.text("Nº " + numeroOrcamento, 198, 20, { align: "right" });
    doc.text("Data: " + dataCriacaoStr, 198, 26, { align: "right" });
    doc.text("Válido até: " + dataValidadeStr, 198, 32, { align: "right" });

    // DADOS DO CLIENTE
    let y = 46;

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(242, 92, 5);
    doc.text("DADOS DO CLIENTE", 14, y);
    doc.setDrawColor(242, 92, 5);
    doc.setLineWidth(0.4);
    doc.line(14, y + 1.5, 196, y + 1.5);

    y += 5;
    doc.setFillColor(247, 245, 243);
    doc.rect(14, y, 182, 32, "F");

    const lbl = (label: string, value: string, x: number, yy: number) => {
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(26, 26, 26);
      doc.text(label, x, yy);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(70, 70, 70);
      doc.text(value || "—", x + 22, yy);
    };

    lbl("Nome:", cliente.nome, 18, y + 8);
    lbl("Empresa:", cliente.empresa, 107, y + 8);
    lbl("NIF:", cliente.nif, 18, y + 16);
    lbl("Email:", cliente.email, 107, y + 16);
    lbl("Telefone:", cliente.telefone, 18, y + 24);
    lbl("Morada:", cliente.morada, 107, y + 24);

    // MARCAS E SERVIÇOS
    y += 40;
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(242, 92, 5);
    doc.text("MARCAS E SERVIÇOS", 14, y);
    doc.setDrawColor(242, 92, 5);
    doc.setLineWidth(0.4);
    doc.line(14, y + 1.5, 196, y + 1.5);
    y += 7;

    for (let mi = 0; mi < marcas.length; mi++) {
      const marca = marcas[mi];
      if (y > 248) { doc.addPage(); y = 18; }

      // Barra naranja: MARCA: NOME
      const subtotalMarca = marcas.length > 0 ? subtotalComDesconto / marcas.length : 0;
      doc.setFillColor(242, 92, 5);
      doc.rect(14, y, 182, 9, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      const nomeMarca = marca.nome ? marca.nome.toUpperCase() : "MARCA " + (mi + 1);
      doc.text("MARCA: " + nomeMarca, 18, y + 6.2);
      y += 13;

      // Redes sociais com ícones coloridos
      if (marca.redes.length > 0) {
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(100, 100, 100);
        doc.text("REDES SOCIAIS:", 18, y);
        y += 4;

        let rx = 18;
        for (const redeId of marca.redes) {
          const rede = REDES.find(r => r.id === redeId);
          if (!rede) continue;
          const pilW = Math.max(doc.getTextWidth(rede.nome) + 14, 24);
          doc.setFillColor(rede.pdfColor[0], rede.pdfColor[1], rede.pdfColor[2]);
          doc.roundedRect(rx, y, pilW, 7, 2, 2, "F");
          try { doc.addImage(redeIconMap[rede.id], "PNG", rx + 1.5, y + 1, 5, 5); } catch (_) {}
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(6.5);
          doc.setFont("helvetica", "bold");
          doc.text(rede.nome, rx + 8, y + 5);
          rx += pilW + 3;
          if (rx > 178) { rx = 18; y += 9; }
        }
        y += 10;
      }

      // Tabela de serviços com preço no encabezado
      if (marca.servicos.length > 0) {
        autoTable(doc, {
          startY: y,
          head: [["#", "Serviços Incluídos", subtotalMarca.toFixed(2) + " € s/ IVA"]],
          body: marca.servicos.map((s, i) => [(i + 1).toString(), s, ""]),
          theme: "plain",
          headStyles: { fillColor: [26, 26, 26], textColor: [255, 255, 255], fontSize: 7.5, fontStyle: "bold", cellPadding: 3 },
          bodyStyles: { fontSize: 8, textColor: [40, 40, 40], cellPadding: 3 },
          columnStyles: { 0: { cellWidth: 8, halign: "center" }, 1: { cellWidth: 148 }, 2: { cellWidth: 26, halign: "right" } },
          alternateRowStyles: { fillColor: [250, 248, 246] },
          margin: { left: 14, right: 14 },
          tableLineColor: [220, 215, 210],
          tableLineWidth: 0.2,
        });
        y = (doc as any).lastAutoTable?.finalY + 8;
      } else {
        doc.setFillColor(250, 248, 246);
        doc.rect(14, y, 182, 8, "F");
        doc.setTextColor(160, 160, 160);
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "italic");
        doc.text("Serviços a definir conforme proposta comercial", 18, y + 5.5);
        y += 14;
      }
      y += 3;
    }

    // RESUMO FINANCEIRO
    if (y > 235) { doc.addPage(); y = 18; }
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(242, 92, 5);
    doc.text("RESUMO FINANCEIRO", 14, y);
    doc.setDrawColor(242, 92, 5);
    doc.setLineWidth(0.4);
    doc.line(14, y + 1.5, 196, y + 1.5);
    y += 7;

    // Caixa laranja — total
    doc.setFillColor(242, 92, 5);
    doc.roundedRect(120, y, 76, 22, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("TOTAL MENSAL (c/ IVA 23%)", 158, y + 7, { align: "center" });
    doc.setFontSize(17);
    doc.setFont("helvetica", "bold");
    doc.text(totalConDescuento.toFixed(2) + " €", 194, y + 18, { align: "right" });

    let ty = y + 4;
    const linhaFin = (label: string, valor: string, bold: boolean, cor: [number,number,number]) => {
      doc.setFontSize(8.5);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setTextColor(cor[0], cor[1], cor[2]);
      doc.text(label, 14, ty);
      doc.text(valor, 115, ty, { align: "right" });
      doc.setDrawColor(225, 220, 215);
      doc.setLineWidth(0.2);
      doc.line(14, ty + 1.5, 115, ty + 1.5);
      ty += 7;
    };

    linhaFin("Subtotal (sem IVA):", subtotalComDesconto.toFixed(2) + " €", false, [80,80,80]);
    if (descuentoAplicado > 0) {
      linhaFin("Desconto:", "- " + descuentoAplicado.toFixed(2) + " €", false, [242,92,5]);
    }
    linhaFin("IVA (23%):", ivaComDesconto.toFixed(2) + " €", false, [80,80,80]);
    linhaFin("TOTAL A PAGAR:", totalConDescuento.toFixed(2) + " €", true, [242,92,5]);

    // CONDIÇÕES COMERCIAIS
    ty += 6;
    if (ty > 238) { doc.addPage(); ty = 18; }
    doc.setFillColor(247, 245, 243);
    doc.rect(14, ty, 182, 54, "F");
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 26, 26);
    doc.text("CONDIÇÕES COMERCIAIS", 18, ty + 8);
    doc.setDrawColor(242, 92, 5);
    doc.setLineWidth(0.3);
    doc.line(18, ty + 10, 192, ty + 10);

    const conds = [
      "Âmbito: Prestação de serviços conforme detalhado acima para " + marcas.length + " marca" + (marcas.length > 1 ? "s" : "") + ".",
      "Período: 3 meses experimentais + contrato anual renovável automaticamente.",
      "Pagamento: Mensal, por transferência bancária ou débito direto até ao dia 5 de cada mês.",
      "Validade: Orçamento válido até " + dataValidadeStr + " (10 dias corridos a partir da emissão).",
      "Rescisão: Aviso prévio de 30 dias após o período experimental, por escrito.",
      "Propriedade Intelectual: Todo o conteúdo criado é propriedade do cliente após liquidação total.",
    ];

    doc.setFontSize(7.8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    let cy = ty + 17;
    conds.forEach(c => {
      doc.text("•  " + c, 18, cy, { maxWidth: 174 });
      cy += 6.5;
    });

    // FOOTER todas as páginas
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(14, pH - 18, 196, pH - 18);
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.text("AI BORA, Lda  |  NIF: 319918645  |  helloaibora@proton.me  |  +351 936 021 747  |  www.aibora.pt", 105, pH - 12, { align: "center" });
      doc.setFontSize(6.5);
      doc.setTextColor(160, 160, 160);
      doc.text("Este orçamento não constitui fatura. Sujeito à aceitação formal por escrito.", 105, pH - 7, { align: "center" });
      doc.setTextColor(190, 190, 190);
      doc.text(p + " / " + totalPages, 196, pH - 7, { align: "right" });
    }

    return doc;
  };

  const criarPropostaPDF = async (): Promise<jsPDF> => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pW = 210;
    const pH = 297;
    
    const logoBase64 = await loadImageAsBase64("/logo.png");
    
    // ====== HEADER NEGRO ======
    doc.setFillColor(26, 26, 26);
    doc.rect(0, 0, pW, 70, "F");
    
    if (logoBase64) {
      doc.addImage(logoBase64, "PNG", 15, 15, 20, 20);
    }
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("AI BORA", 40, 22);
    
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(200, 200, 200);
    doc.text("Marketing Digital & Criativo", 40, 28);
    
    doc.setTextColor(242, 92, 5);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("PROPOSTA COMERCIAL", 195, 18, { align: "right" });
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Nº " + numeroOrcamento, 195, 25, { align: "right" });
    doc.text("Data: " + dataCriacaoStr, 195, 31, { align: "right" });
    doc.text("Validade: " + dataValidadeStr, 195, 37, { align: "right" });
    
    // Cliente info en header
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Proposta exclusiva para", 15, 50);
    doc.setTextColor(242, 92, 5);
    doc.text(cliente.nome || "Cliente", 15, 58);
    if (cliente.empresa) {
      doc.setTextColor(180, 180, 180);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(cliente.empresa, 15, 64);
    }
    
    // ====== INVESTIMENTO BOX ======
    const valorPorMarca = porMarcaSemIVA;
    doc.setFillColor(242, 92, 5);
    doc.roundedRect(15, 78, 180, 32, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("VALOR POR MARCA (SEM IVA)", 105, 85, { align: "center" });
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    // Big number is por marca (or subtotal if 1 marca)
    const valorMostrar = marcas.length > 1 ? porMarcaSemIVA : subtotalComDesconto;
    doc.text(valorMostrar.toFixed(2) + " €", 190, 98, { align: "right" });
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    if (marcas.length > 1) {
      doc.text("por marca (sem IVA)", 105, 107, { align: "center" });
    } else {
      doc.text("(sem IVA)", 105, 107, { align: "center" });
    }
    if (descuentoAplicado > 0) {
      const descuentoPorMarca = (descuentoAplicado / marcas.length).toFixed(2);
      // Show discount in a separate box
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(80, 103, 50, 12, 2, 2, 'F');
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.text("💰 " + descuentoAplicado.toFixed(2) + " € desc. (" + descuentoPorMarca + " €/marca)", 105, 110, { align: "center" });
    }
    
    // ====== QUEM SOMOS ======
    let y = 115;
    doc.setTextColor(26, 26, 26);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Marketing digital", 15, y);
    doc.setTextColor(242, 92, 5);
    doc.text("que realmente funciona.", 15, y + 6);
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    const sobreTexto = "A AI BORA é uma empresa especializada em ajudar negócios locais a crescer na internet. Somos o teu parceiro digital — com foco em resultados concretos e atenção prioritária.";
    doc.text(sobreTexto, 15, y + 14, { maxWidth: 100 });
    
    // Stats
    y += 35;
    const stats = [
      { icon: "💪", label: "Proximidade" },
      { icon: "📈", label: "Crescimento" },
      { icon: "🎯", label: "Prioridade" },
      { icon: "❤️", label: "Satisfação" }
    ];
    stats.forEach((s, i) => {
      doc.setFillColor(245, 242, 240);
      doc.roundedRect(15 + (i * 45), y, 42, 18, 2, 2, "F");
      doc.setFontSize(12);
      doc.text(s.icon, 22 + (i * 45), y + 8);
      doc.setFontSize(6);
      doc.setTextColor(100, 100, 100);
      doc.text(s.label, 35 + (i * 45), y + 8);
    });
    
    // ====== SERVIÇOS ======
    y += 30;
    doc.setTextColor(242, 92, 5);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("SERVIÇOS INCLUÍDOS", 15, y);
    doc.setDrawColor(242, 92, 5);
    doc.setLineWidth(0.5);
    doc.line(15, y + 2, 195, y + 2);
    
    y += 10;
    
    // Servicios em cards
    const servicosMap: Record<string, {icon: string, desc: string}> = {
      "Gestão de Redes Sociais": { icon: "📱", desc: "Gestão completa das tuas redes sociais" },
      "Criação de Conteúdo": { icon: "📝", desc: "Conteúdo de qualidade e estratégia" },
      "Community Management": { icon: "💬", desc: "Engajamento e comunidade" },
      "Email Marketing": { icon: "📧", desc: "Email marketing e newsletters" },
      "Design de Posts": { icon: "🎨", desc: "Design visual profissional" },
      "Logotipo": { icon: "✏️", desc: "Logotipo e identidade" },
      "Identidade Corporativa": { icon: "🏢", desc: "Identidade visual completa" },
      "Banners e Posters": { icon: "📰", desc: "Banners e materiais gráficos" },
      "Landing Page": { icon: "🌐", desc: "Página web moderna" },
      "Site Catálogo": { icon: "📦", desc: "Catálogo online" },
      "Loja Online": { icon: "🛒", desc: "E-commerce completo" },
      "SEO Local": { icon: "🔍", desc: "SEO para negócios locais" },
      "Fotografia Profissional": { icon: "📸", desc: "Fotografia profissional" },
      "Produção de Videos": { icon: "🎬", desc: "Produção de vídeo" },
      "Criação de Reels": { icon: " Reels", desc: "Conteúdo para Reels" },
      "Edição de Conteúdo": { icon: "✂️", desc: "Edição profissional" },
      "Google Ads": { icon: "🔵", desc: "Campanhas Google Ads" },
      "Facebook Ads": { icon: "🔷", desc: "Campanhas Facebook" },
      "Instagram Ads": { icon: "📸", desc: "Campanhas Instagram" },
      "Gestão de Budget": { icon: "💰", desc: "Gestão de orçamento" },
      "Chatbot WhatsApp": { icon: "🤖", desc: "Chatbot automático" },
      "IA e Automação": { icon: "⚡", desc: "Automação com IA" },
      "Respostas Automáticas": { icon: "💬", desc: "Respostas 24/7" },
      "Fluxos de CRM": { icon: "📊", desc: "CRM automatizado" },
      "Consultoria Estratégica": { icon: "📊", desc: "Estratégia digital" },
      "Análise de Concorrentes": { icon: "🔎", desc: "Análise da concorrência" },
      "Dashboard Excel": { icon: "📈", desc: "Relatórios Excel" },
      "Plano de Marketing": { icon: "📋", desc: "Plano de marketing" },
    };
    
    if (marcas[0]?.servicos && marcas[0].servicos.length > 0) {
      const cols = 2;
      const cardW = 85;
      const cardH = 22;
      const gapX = 8;
      const gapY = 8;
      
      marcas[0].servicos.forEach((servico, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const cardX = 15 + (col * (cardW + gapX));
        const cardY = y + (row * (cardH + gapY));
        
        doc.setFillColor(245, 242, 240);
        doc.roundedRect(cardX, cardY, cardW, cardH, 2, 2, "F");
        
        const info = servicosMap[servico] || { icon: "📋", desc: servico };
        doc.setFillColor(242, 92, 5);
        doc.roundedRect(cardX, cardY, 5, cardH, 1, 1, "F");
        
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(26, 26, 26);
        doc.text(servico, cardX + 8, cardY + 8);
        
        doc.setFontSize(6);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text(info.desc, cardX + 8, cardY + 14);
      });
    }
    
    // ====== CONDIÇÕES ======
    y = 230;
    if (y > 200) { doc.addPage(); y = 20; }
    doc.setFillColor(245, 242, 240);
    doc.roundedRect(15, y, 180, 40, 3, 3, "F");
    
    doc.setTextColor(242, 92, 5);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("CONDIÇÕES COMERCIAIS", 20, y + 8);
    doc.setDrawColor(242, 92, 5);
    doc.setLineWidth(0.3);
    doc.line(20, y + 10, 190, y + 10);
    
    const conds = [
      "Período experimental de 3 meses",
      "Contrato anual renovável automaticamente",
      "Pagamento mensal até ao dia 5",
      "Validade da proposta: 10 dias"
    ];
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    let cy = y + 18;
    conds.forEach(c => {
      doc.text("•  " + c, 20, cy);
      cy += 6;
    });
    
    // ====== CTA ======
    y += 48;
    doc.setTextColor(26, 26, 26);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Pronto para começar, " + (cliente.nome || "cliente") + "?", 105, y, { align: "center" });
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("Fala connosco hoje e começamos esta semana!", 105, y + 7, { align: "center" });
    
    // ====== FOOTER ======
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(15, pH - 15, 195, pH - 15);
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(7);
    doc.text("AI BORA, Lda  |  NIF: 319918645  |  helloaibora@proton.me  |  +351 936 021 747  |  www.aibora.pt", 105, pH - 10, { align: "center" });
    
    return doc;
  };

  const gerarPDF = async () => {
    if (!cliente.nome || totalConDescuento <= 0) {
      alert("Preenche o Nome do Cliente e o Valor Total.");
      return;
    }
    try {
      const doc = await criarPDF();
      doc.save(`Orçamento-${numeroOrcamento}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Erro ao gerar PDF.");
    }
  };

  const gerarPropostaPDF = async () => {
    if (!cliente.nome || totalConDescuento <= 0) {
      alert("Preenche o Nome do Cliente e o Valor Total.");
      return;
    }
    try {
      const doc = await criarPropostaPDF();
      doc.save(`Proposta-${cliente.nome.replace(/\s+/g, '-')}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Erro ao gerar Proposta PDF.");
    }
  };

  const podeGerar = !!cliente.nome && totalConDescuento > 0;

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="pt-20">
        <section style={{ backgroundColor: "#1A1A1A", padding: "80px 16px 60px" }}>
          <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
            <h1 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 900, fontSize: "clamp(28px, 5vw, 48px)", color: "#ffffff", lineHeight: 1.1, margin: "0 0 16px" }}>
              Gerador de <span style={{ color: "#F22283" }}>Orçamentos</span> Profissionais
            </h1>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 16, color: "#aaaaaa", margin: 0, lineHeight: 1.5 }}>
              Configura cada marca com as suas redes sociais e serviços. Gera um PDF profissional em segundos.
            </p>
          </div>
        </section>

        <section style={{ backgroundColor: "#ffffff", padding: "64px 16px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>

            <div style={{ flex: "1 1 600px" }}>
              <div style={{ marginBottom: 40 }}>
                <div style={{ width: 36, height: 3, backgroundColor: "#F25C05", marginBottom: 16, borderRadius: 2 }} />
                <h2 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 900, fontSize: "clamp(22px, 4vw, 32px)", color: "#1A1A1A", margin: "0 0 8px" }}>
                  Seleciona os Serviços
                </h2>
                <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, color: "#4A4A4A", margin: 0 }}>
                  Clica nos serviços para adicionares ao teu orçamento personalizado
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
                {Object.entries(SERVICOS_POR_CATEGORIA).map(([categoria, servicos]) => {
                  const catInfo = [
                    { nome: "Marketing", icon: "📱" },
                    { nome: "Design", icon: "🎨" },
                    { nome: "Web", icon: "💻" },
                    { nome: "Multimédia", icon: "🎬" },
                    { nome: "Publicidade", icon: "📢" },
                    { nome: "Automação", icon: "⚡" },
                    { nome: "Consultoria", icon: "📊" },
                  ].find(c => c.nome === categoria);
                  
                  return (
                    <div key={categoria} style={{ backgroundColor: "#F5F2F0", borderRadius: 16, padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 24 }}>{catInfo?.icon}</span>
                        <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 800, fontSize: 15, color: "#1A1A1A" }}>{categoria}</span>
                      </div>
                      <div style={{ height: 1, backgroundColor: "#e0ddd9" }} />
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {servicos.map((s) => {
                          const sel = marcas[0]?.servicos.includes(s);
                          return (
                            <button 
                              key={s} 
                              onClick={() => marcas.length === 1 && toggleServico(marcas[0].id, s)}
                              style={{ fontFamily: "Montserrat, sans-serif", fontSize: 11, fontWeight: 600, backgroundColor: sel ? "#F22283" : "#ffffff", color: sel ? "#ffffff" : "#1A1A1A", border: sel ? "1px solid #F22283" : "1px solid rgba(0,0,0,0.10)", borderRadius: 20, padding: "5px 12px", cursor: "pointer", transition: "all 0.15s ease" }}>
                              {sel ? "✓ " : ""}{s}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 32, backgroundColor: "#F5F2F0", borderRadius: 16, padding: 24 }}>
                <h3 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 800, fontSize: 16, color: "#1A1A1A", margin: "0 0 16px" }}>
                  🏷️ Marcas e Redes Sociais
                </h3>
                {marcas.map((marca, idx) => (
                  <div key={marca.id} style={{ backgroundColor: "#ffffff", borderRadius: 12, padding: 16, marginBottom: 12, border: "1px solid #e0ddd9" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 14, color: "#1A1A1A" }}>Marca {idx + 1}</span>
                      {marcas.length > 1 && (
                        <button onClick={() => removerMarca(marca.id)} style={{ background: "none", border: "none", color: "#F22283", cursor: "pointer", fontSize: 18, padding: "0 4px" }}>✕</button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={marca.nome}
                      onChange={e => setMarcas(prev => prev.map(m => m.id === marca.id ? { ...m, nome: e.target.value } : m))}
                      placeholder="Nome da marca"
                      style={{ fontFamily: "Montserrat, sans-serif", width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13, marginBottom: 12, outline: "none" }}
                    />
                    <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 11, fontWeight: 600, color: "#666", marginBottom: 8 }}>Redes Sociais:</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {REDES.map(rede => {
                        const isSelected = marca.redes.includes(rede.id);
                        return (
                          <button
                            key={rede.id}
                            onClick={() => toggleRede(marca.id, rede.id)}
                            style={{ fontFamily: "Montserrat, sans-serif", fontSize: 10, fontWeight: 600, backgroundColor: isSelected ? rede.cor : "#ffffff", color: isSelected ? "#ffffff" : "#1A1A1A", border: isSelected ? "none" : "1px solid #ddd", borderRadius: 20, padding: "6px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, transition: "all 0.15s ease" }}
                          >
                            <span dangerouslySetInnerHTML={{ __html: rede.svg.replace('width="20" height="20"', 'width="14" height="14"') }} />
                            {rede.nome}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <button onClick={adicionarMarca} style={{ fontFamily: "Montserrat, sans-serif", width: "100%", padding: "12px", borderRadius: 10, border: "2px dashed #ccc", backgroundColor: "transparent", color: "#666", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.15s ease" }}>
                  <Plus size={16} /> Adicionar Marca
                </button>
              </div>

              <div style={{ marginTop: 32, backgroundColor: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e0ddd9" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <User size={24} color="#F22283" />
                  <h3 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 800, fontSize: 18, color: "#1A1A1A", margin: 0 }}>Dados do Cliente</h3>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                  <div>
                    <label style={{ fontFamily: "Montserrat, sans-serif", fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Nome Completo *</label>
                    <input
                      type="text"
                      value={cliente.nome}
                      onChange={e => setCliente({...cliente, nome: e.target.value})}
                      style={{ fontFamily: "Montserrat, sans-serif", width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13, outline: "none" }}
                      placeholder="Ex: João Silva"
                    />
                  </div>
                  <div>
                    <label style={{ fontFamily: "Montserrat, sans-serif", fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Empresa</label>
                    <input
                      type="text"
                      value={cliente.empresa}
                      onChange={e => setCliente({...cliente, empresa: e.target.value})}
                      style={{ fontFamily: "Montserrat, sans-serif", width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13, outline: "none" }}
                      placeholder="Ex: Empresa, Lda"
                    />
                  </div>
                  <div>
                    <label style={{ fontFamily: "Montserrat, sans-serif", fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Email *</label>
                    <input
                      type="email"
                      value={cliente.email}
                      onChange={e => setCliente({...cliente, email: e.target.value})}
                      style={{ fontFamily: "Montserrat, sans-serif", width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13, outline: "none" }}
                      placeholder="joao@empresa.pt"
                    />
                  </div>
                  <div>
                    <label style={{ fontFamily: "Montserrat, sans-serif", fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Telefone</label>
                    <input
                      type="tel"
                      value={cliente.telefone}
                      onChange={e => setCliente({...cliente, telefone: e.target.value})}
                      style={{ fontFamily: "Montserrat, sans-serif", width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13, outline: "none" }}
                      placeholder="+351 912 345 678"
                    />
                  </div>
                  <div>
                    <label style={{ fontFamily: "Montserrat, sans-serif", fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>NIF</label>
                    <input
                      type="text"
                      value={cliente.nif}
                      onChange={e => setCliente({...cliente, nif: e.target.value})}
                      style={{ fontFamily: "Montserrat, sans-serif", width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13, outline: "none" }}
                      placeholder="123456789"
                    />
                  </div>
                  <div>
                    <label style={{ fontFamily: "Montserrat, sans-serif", fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Morada</label>
                    <input
                      type="text"
                      value={cliente.morada}
                      onChange={e => setCliente({...cliente, morada: e.target.value})}
                      style={{ fontFamily: "Montserrat, sans-serif", width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13, outline: "none" }}
                      placeholder="Rua Example, 123, Lisboa"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ flex: "0 1 320px", position: "sticky", top: 100 }}>
              <div style={{ backgroundColor: "#F5F2F0", borderRadius: 16, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                <h3 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 16, color: "#1A1A1A", margin: "0 0 16px" }}>
                  📋 Resumo do Orçamento
                </h3>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontFamily: "Montserrat, sans-serif", fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Nº Orçamento</label>
                  <input
                    type="text"
                    value={numeroOrcamentoInput}
                    onChange={e => setNumeroOrcamentoInput(e.target.value.toUpperCase())}
                    placeholder="ORC-0001"
                    style={{ fontFamily: "Montserrat, sans-serif", width: "100%", padding: "10px 12px", borderRadius: 8, border: "2px solid #1A1A1A", fontSize: 14, fontWeight: 700, textAlign: "center", outline: "none" }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontFamily: "Montserrat, sans-serif", fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Valor Total (com IVA)</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="number"
                      value={precoTotal || ""}
                      onChange={e => setPrecoTotal(Number(e.target.value))}
                      placeholder="0.00"
                      style={{ fontFamily: "Montserrat, sans-serif", flex: 1, padding: "12px", borderRadius: 8, border: "2px solid #1A1A1A", fontSize: 18, fontWeight: 700, textAlign: "right", outline: "none" }}
                    />
                    <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 18, color: "#1A1A1A" }}>€</span>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontFamily: "Montserrat, sans-serif", fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 6 }}>Desconto</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4 }}>
                      <input
                        type="number"
                        value={descontoPercent || ""}
                        onChange={e => setDescontoPercent(Number(e.target.value))}
                        placeholder="0"
                        style={{ fontFamily: "Montserrat, sans-serif", width: "100%", padding: "8px", borderRadius: 6, border: "1px solid #ddd", fontSize: 13, textAlign: "right" }}
                      />
                      <span style={{ fontSize: 12, color: "#666" }}>%</span>
                    </div>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4 }}>
                      <input
                        type="number"
                        value={descontoValor || ""}
                        onChange={e => setDescontoValor(Number(e.target.value))}
                        placeholder="0"
                        style={{ fontFamily: "Montserrat, sans-serif", width: "100%", padding: "8px", borderRadius: 6, border: "1px solid #ddd", fontSize: 13, textAlign: "right" }}
                      />
                      <span style={{ fontSize: 12, color: "#666" }}>€</span>
                    </div>
                  </div>
                  {(descontoPercent > 0 || descontoValor > 0) && (
                    <div style={{ fontSize: 10, color: "#F25C05", marginTop: 4 }}>
                      Desconto total: {descuentoAplicado.toFixed(2)} € (aplicado ao total)
                    </div>
                  )}
                </div>

                <div style={{ backgroundColor: "#ffffff", borderRadius: 12, padding: 16, marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed #e0ddd9" }}>
                      <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, color: "#666" }}>Subtotal (sem IVA)</span>
                      <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, fontWeight: 600, color: "#1A1A1A" }}>{subtotalComDesconto.toFixed(2)} €</span>
                    </div>
                    {descuentoAplicado > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed #e0ddd9", color: "#F25C05" }}>
                        <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, fontWeight: 600 }}>Desconto</span>
                        <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, fontWeight: 600 }}>- {descuentoAplicado.toFixed(2)} €</span>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed #e0ddd9" }}>
                      <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, color: "#666" }}>IVA (23%)</span>
                      <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, fontWeight: 600, color: "#1A1A1A" }}>{ivaComDesconto.toFixed(2)} €</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8 }}>
                      <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, fontWeight: 700, color: "#1A1A1A" }}>TOTAL</span>
                      <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 18, fontWeight: 900, color: "#F22283" }}>{totalConDescuento.toFixed(2)} €</span>
                    </div>
                </div>

                <div style={{ backgroundColor: "#ffffff", borderRadius: 12, padding: 12, marginBottom: 16, fontSize: 11, color: "#666", lineHeight: 1.6 }}>
                  <strong style={{ color: "#1A1A1A", fontFamily: "Montserrat, sans-serif" }}>Condições:</strong><br />
                  <span style={{ fontFamily: "Montserrat, sans-serif" }}>• 3 meses período experimental</span><br />
                  <span style={{ fontFamily: "Montserrat, sans-serif" }}>• Contrato anual renovável</span><br />
                  <span style={{ fontFamily: "Montserrat, sans-serif" }}>• Pagamento mensal</span><br />
                  <span style={{ fontFamily: "Montserrat, sans-serif" }}>• Validade: 30 dias</span>
                </div>

                <button
                  onClick={async () => {
                    const doc = await criarPDF();
                    const pdfBlob = doc.output('blob');
                    const pdfUrl = URL.createObjectURL(pdfBlob);
                    window.open(pdfUrl, '_blank');
                  }}
                  disabled={!podeGerar}
                  style={{ fontFamily: "Montserrat, sans-serif", display: "block", width: "100%", padding: "14px", borderRadius: 10, fontWeight: 700, fontSize: 13, textDecoration: "none", textAlign: "center", cursor: podeGerar ? "pointer" : "not-allowed", backgroundColor: podeGerar ? "#1A1A1A" : "#cccccc", color: "#ffffff", border: "2px solid #1A1A1A", transition: "all 0.2s ease", marginBottom: 12 }}
                >
                  👁️ Previsualizar Orçamento
                </button>

                <button
                  onClick={gerarPDF}
                  disabled={!podeGerar}
                  style={{ fontFamily: "Montserrat, sans-serif", display: "block", width: "100%", padding: "14px", borderRadius: 10, fontWeight: 700, fontSize: 13, textDecoration: "none", textAlign: "center", cursor: podeGerar ? "pointer" : "not-allowed", backgroundColor: podeGerar ? "#F22283" : "#cccccc", color: "#ffffff", border: "none", transition: "all 0.2s ease", marginBottom: 12 }}
                >
                  📄 Gerar PDF do Orçamento
                </button>

                <button
                  onClick={async () => {
                    if (!cliente.nome || totalConDescuento <= 0) {
                      alert("Preenche o Nome do Cliente e o Valor Total.");
                      return;
                    }
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
                        valorPorMarca: porMarcaSemIVA,
                        servicos: marcas[0]?.servicos || [],
                        redes: marcas.map(m => ({ nome: m.nome, redes: m.redes })),
                        numeroOrcamento: numeroOrcamento,
                        dataCriacao: dataCriacaoStr,
                        dataValidade: dataValidadeStr,
                        temOrcamentoPDF: true
                      };
                      const id = await createProposal(proposalData);
                      
                      const link = `https://aibora.pt/p/${id}`;
                      navigator.clipboard.writeText(link).then(() => {
                        const pdfUrl = URL.createObjectURL(pdfBlob);
                        window.open(pdfUrl, '_blank');
                        setTimeout(() => {
                          alert(`✅ Proposta guardada! Link único copiado:\n${link}\n\nO PDF do orçamento também foi aberto.`);
                        }, 500);
                      });
                    } catch (err) {
                      console.error(err);
                      alert("Erro ao guardar proposta: " + err.message);
                    }
                  }}
                  disabled={!podeGerar}
                  style={{ fontFamily: "Montserrat, sans-serif", display: "block", width: "100%", padding: "16px", borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: "none", textAlign: "center", cursor: podeGerar ? "pointer" : "not-allowed", backgroundColor: podeGerar ? "#F25C05" : "#cccccc", color: "#ffffff", border: "none", transition: "all 0.2s ease" }}
                >
                  💾 Guardar Proposta (Link Único)
                </button>

                <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 10, color: "#888", textAlign: "center", marginTop: 12 }}>
                  Orçamento válido por 30 dias<br />Sujeito a disponibilidade de agenda
                </p>
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
