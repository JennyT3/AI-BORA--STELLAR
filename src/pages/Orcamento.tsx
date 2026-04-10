import { useState, useEffect } from "react";
import { IVA_TAXA, REDES, SERVICOS_POR_CATEGORIA } from '../lib/constants';
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
import { sendPropostaLinkEmail } from "../services/emailService";
import { storeProposalOnChain } from "../services/soroban";

import { OrcamentoForm } from '../components/OrcamentoForm';


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



export function Orcamento() {
  const [searchParams] = useSearchParams();
  const isAdminMode = window.location.href.includes("/admin");
  const vendedorId = searchParams.get('vendedor');
  const isVendedorOrcamento = isAdminMode && vendedorId && vendedorId !== "true";
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
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
  const [clientesCRM, setClientesCRM] = useState<any[]>([]);
  const [clienteIdSeleccionado, setClienteIdSeleccionado] = useState<string | null>(null);
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);
  const [stellarTxHash, setStellarTxHash] = useState<string>("");
  const [stellarExplorerUrl, setStellarExplorerUrl] = useState<string>("");
  const [stellarSuccess, setStellarSuccess] = useState<boolean>(false);

  const dataCriacao = new Date();
  const dataValidade = new Date(dataCriacao.getTime() + 10 * 24 * 60 * 60 * 1000);
  const dataCriacaoStr = dataCriacao.toLocaleDateString("en-GB");
  const dataValidadeStr = dataValidade.toLocaleDateString("en-GB");

  useEffect(() => {
    if (solId) {
      setLoadingSolicitude(true);
      import("../services/solicitudes").then(async ({ getSolicitude }) => {
        if (getSolicitude) {
          try {
            const sol = await getSolicitude(solId);
            if (sol) {
              setCliente({ nome: sol.nome || "", empresa: sol.empresa || "", email: sol.email || "", telefone: sol.telefone || "", nif: "", morada: "" });
              if (sol.clienteId) {
                setClienteIdSeleccionado(sol.clienteId);
              }
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

  useEffect(() => {
    import("../services/firebase").then(async ({ listClientes }) => {
      try {
        const lista = await listClientes(200);
        console.log("clientesCRM loaded:", lista?.length);
        setClientesCRM(lista || []);
      } catch (e) {
        console.error("Error loading CRM clients:", e);
      }
    });
  }, []);

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
  // VAT on discounted total (not on pre-discount total)
  const ivaBase = totalConDescuento / (1 + IVA_TAXA);
  const ivaComDesconto = totalConDescuento - ivaBase;
  const subtotalComDesconto = ivaBase;
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
    doc.setTextColor(26, 26, 26); doc.setFontSize(13); doc.setFont("helvetica", "bold"); doc.text("QUOTE", 198, 13, { align: "right" });
    doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(90, 90, 90); doc.text("No. " + numeroOrcamento, 198, 20, { align: "right" }); doc.text("Date: " + dataCriacaoStr, 198, 26, { align: "right" }); doc.text("Valid until: " + dataValidadeStr, 198, 32, { align: "right" });

    let y = 46;
    doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(242, 92, 5); doc.text("CLIENT DETAILS", 14, y);
    doc.setDrawColor(242, 92, 5); doc.setLineWidth(0.4); doc.line(14, y + 1.5, 196, y + 1.5);
    y += 5; doc.setFillColor(247, 245, 243); doc.rect(14, y, 182, 32, "F");
    const lbl = (label: string, value: string, x: number, yy: number) => { doc.setFontSize(8.5); doc.setFont("helvetica", "bold"); doc.setTextColor(26, 26, 26); doc.text(label, x, yy); doc.setFont("helvetica", "normal"); doc.setTextColor(70, 70, 70); doc.text(value || "—", x + 22, yy); };
    lbl("Name:", cliente.nome, 18, y + 8); lbl("Company:", cliente.empresa, 107, y + 8); lbl("Tax ID:", cliente.nif, 18, y + 16); lbl("Email:", cliente.email, 107, y + 16); lbl("Phone:", cliente.telefone, 18, y + 24); lbl("Address:", cliente.morada, 107, y + 24);

    y += 40;
    doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(242, 92, 5); doc.text("BRANDS AND SERVICES", 14, y);
    doc.setLineWidth(0.4); doc.line(14, y + 1.5, 196, y + 1.5); y += 7;

    for (let mi = 0; mi < marcas.length; mi++) {
      const marca = marcas[mi]; if (y > 248) { doc.addPage(); y = 18; }
      const subtotalMarca = marcas.length > 0 ? subtotalComDesconto / marcas.length : 0;
      doc.setFillColor(242, 92, 5); doc.rect(14, y, 182, 9, "F");
      doc.setTextColor(255, 255, 255); doc.setFontSize(8.5); doc.setFont("helvetica", "bold");
      const nomeMarca = marca.nome ? marca.nome.toUpperCase() : "BRAND " + (mi + 1);
      doc.text("BRAND: " + nomeMarca, 18, y + 6.2); y += 13;

      if (marca.redes.length > 0) {
        doc.setFontSize(7); doc.setFont("helvetica", "bold"); doc.setTextColor(100, 100, 100); doc.text("SOCIAL MEDIA:", 18, y); y += 4;
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
        autoTable(doc, { startY: y, head: [["#", "Services included", subtotalMarca.toFixed(2) + " € ex VAT"]], body: marca.servicos.map((s, i) => [(i + 1).toString(), s, ""]), theme: "plain", headStyles: { fillColor: [26, 26, 26], textColor: [255, 255, 255], fontSize: 7.5, fontStyle: "bold", cellPadding: 3 }, bodyStyles: { fontSize: 8, textColor: [40, 40, 40], cellPadding: 3 }, columnStyles: { 0: { cellWidth: 8, halign: "center" }, 1: { cellWidth: 148 }, 2: { cellWidth: 26, halign: "right" } }, alternateRowStyles: { fillColor: [250, 248, 246] }, margin: { left: 14, right: 14 }, tableLineColor: [220, 215, 210], tableLineWidth: 0.2 });
        y = (doc as any).lastAutoTable?.finalY + 8;
      } else {
        doc.setFillColor(250, 248, 246); doc.rect(14, y, 182, 8, "F");
        doc.setTextColor(160, 160, 160); doc.setFontSize(7.5); doc.setFont("helvetica", "italic"); doc.text("Services to be defined per commercial proposal", 18, y + 5.5); y += 14;
      }
      y += 3;
    }

    if (y > 235) { doc.addPage(); y = 18; }
    doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(242, 92, 5); doc.text("FINANCIAL SUMMARY", 14, y);
    doc.setLineWidth(0.4); doc.line(14, y + 1.5, 196, y + 1.5); y += 7;
    doc.setFillColor(242, 92, 5); doc.roundedRect(120, y, 76, 22, 3, 3, "F");
    doc.setTextColor(255, 255, 255); doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.text("MONTHLY TOTAL (incl. 23% VAT)", 158, y + 7, { align: "center" });
    doc.setFontSize(17); doc.setFont("helvetica", "bold"); doc.text(totalConDescuento.toFixed(2) + " €", 194, y + 18, { align: "right" });

    let ty = y + 4;
    const linhaFin = (label: string, valor: string, bold: boolean, cor: [number, number, number]) => { doc.setFontSize(8.5); doc.setFont("helvetica", bold ? "bold" : "normal"); doc.setTextColor(cor[0], cor[1], cor[2]); doc.text(label, 14, ty); doc.text(valor, 115, ty, { align: "right" }); doc.setDrawColor(225, 220, 215); doc.setLineWidth(0.2); doc.line(14, ty + 1.5, 115, ty + 1.5); ty += 7; };
    linhaFin("Subtotal (ex VAT):", subtotalComDesconto.toFixed(2) + " €", false, [80, 80, 80]);
    if (descuentoAplicado > 0) linhaFin("Discount:", "- " + descuentoAplicado.toFixed(2) + " €", false, [242, 92, 5]);
    linhaFin("VAT (23%):", ivaComDesconto.toFixed(2) + " €", false, [80, 80, 80]);
    linhaFin("TOTAL DUE:", totalConDescuento.toFixed(2) + " €", true, [242, 92, 5]);

    ty += 6;
    if (ty > 238) { doc.addPage(); ty = 18; }
    doc.setFillColor(247, 245, 243); doc.rect(14, ty, 182, 54, "F");
    doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(26, 26, 26); doc.text("COMMERCIAL TERMS", 18, ty + 8);
    doc.setDrawColor(242, 92, 5); doc.setLineWidth(0.3); doc.line(18, ty + 10, 192, ty + 10);
    const conds = ["Scope: Delivery of services as detailed above for " + marcas.length + " brand" + (marcas.length > 1 ? "s" : "") + ".", "Term: 3-month trial + annual contract with automatic renewal.", "Payment: Monthly by bank transfer or direct debit by the 5th of each month.", "Validity: This quote is valid until " + dataValidadeStr + " (10 calendar days from issue).", "Termination: 30 days' written notice after the trial period.", "Intellectual property: All created content belongs to the client after full payment."];
    doc.setFontSize(7.8); doc.setFont("helvetica", "normal"); doc.setTextColor(60, 60, 60); let cy = ty + 17; conds.forEach(c => { doc.text("•  " + c, 18, cy, { maxWidth: 174 }); cy += 6.5; });

    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) { doc.setPage(p); doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.3); doc.line(14, pH - 18, 196, pH - 18); doc.setTextColor(100, 100, 100); doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.text("AI BORA, Lda  |  Tax ID: 319918645  |  geral@aibora.pt  |  +351 936 021 747  |  www.aibora.pt", 105, pH - 12, { align: "center" }); doc.setFontSize(6.5); doc.setTextColor(160, 160, 160); doc.text("This quote is not an invoice. Subject to formal written acceptance.", 105, pH - 7, { align: "center" }); doc.setTextColor(190, 190, 190); doc.text(p + " / " + totalPages, 196, pH - 7, { align: "right" }); }

    return doc;
  };

  const gerarPDF = async () => {
    if (!cliente.nome || totalConDescuento <= 0) { alert("Please enter the client name and total amount."); return; }
    try { const doc = await criarPDF(); const pdfBlob = doc.output('blob'); const pdfUrl = URL.createObjectURL(pdfBlob); window.open(pdfUrl, '_blank'); } catch (err) { console.error(err); alert("Could not generate PDF."); }
  };

  const podeGerarProposta = !!cliente.nome && totalConDescuento > 0;

  const handleGuardarProposta = async () => {
    if (!cliente.nome || totalConDescuento <= 0) { alert("Please enter the client name and total amount."); return; }
    const savedUser = localStorage.getItem("adminUser");
    const currentUser = savedUser ? JSON.parse(savedUser) : null;
    try {
      const doc = await criarPDF();
      const pdfBlob = doc.output('blob');
      
      // Calculate SHA-256 of PDF
      const pdfArrayBuffer = await pdfBlob.arrayBuffer();
      const pdfHashBuffer = await crypto.subtle.digest('SHA-256', pdfArrayBuffer);
      const pdfHashArray = Array.from(new Uint8Array(pdfHashBuffer));
      const pdfHash = pdfHashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      console.log('📄 PDF SHA-256:', pdfHash);
      
      const proposalData = { 
        cliente: cliente.nome, 
        empresa: cliente.empresa || '', 
        email: cliente.email || '', 
        telefone: cliente.telefone || '', 
        clienteId: clienteIdSeleccionado || null, 
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
        criadoPor: currentUser?.id || 'admin',
        pdfHash: pdfHash
      };
      
      // Store on Soroban smart contract
      let stellarTxHashLocal = '';
      let stellarExplorerUrlLocal = '';
      let stellarSuccessLocal = false;
      
      try {
        const uniqueProposalId = `${numeroOrcamento}-${Date.now()}`;
        
        // LLAMADA AL CONTRATO - AHORA RETORNA HASH INMEDIATAMENTE
        const stellarResult = await storeProposalOnChain(
          uniqueProposalId,
          cliente.email || 'unknown@email.com',
          pdfHash,
          totalConDescuento,
          import.meta.env.VITE_STELLAR_ADMIN_SECRET || localStorage.getItem('aibora_stellar_secret') || ''
        );
        
        if (stellarResult && stellarResult.txHash) {
          stellarTxHashLocal = stellarResult.txHash;
          stellarExplorerUrlLocal = stellarResult.explorerUrl;
          stellarSuccessLocal = stellarResult.success || false;
          
          // Actualizar estados para mostrar en la UI
          setStellarTxHash(stellarTxHashLocal);
          setStellarExplorerUrl(stellarExplorerUrlLocal);
          setStellarSuccess(stellarSuccessLocal);
          
          console.log('✅ Stellar Transaction Hash:', stellarTxHashLocal);
          console.log('✅ Stellar Success:', stellarSuccessLocal);
        } else {
          console.warn('⚠️ No hash returned from storeProposalOnChain');
        }
      } catch (stellarErr) {
        console.error('⚠️ Critical Soroban error:', stellarErr);
      }
      
      // Add Stellar data to proposal
      if (stellarTxHashLocal) {
        proposalData.stellarTxHash = stellarTxHashLocal;
        proposalData.stellarExplorerUrl = stellarExplorerUrlLocal;
      }
      
      const id = await createProposal(proposalData);
      setPropostaId(id);
      
      // Link proposal to client record
      if (clienteIdSeleccionado) {
        try {
          const { updateCliente } = await import('../services/firebase');
          await updateCliente(clienteIdSeleccionado, {
            propostaId: id,
            propostaNumero: numeroOrcamento,
            propostaValor: subtotalComDesconto,
            categoria: cliente.categoria === 'curioso' ? 'potencial' : cliente.categoria,
            processo: 'iniciado',
            servicos: marcas[0]?.servicos || [],
            dataUltimoContacto: new Date().toISOString()
          });
        } catch (err) {
          console.error('Error linking proposal to client:', err);
        }
      }
      
      // Load proposal for access token
      const { getProposal } = await import('../services/firebase');
      const propostaCriada = await getProposal(id);
      const accessToken = propostaCriada?.accessToken || id;
      
      const link = `${window.location.origin}/proposal/${accessToken}`;
      // 1. Ya mostrado arriba inmediatamente tras la llamada al contrato

      // 2. Intentar enviar email (puede fallar, no bloquea la UI)
      if (cliente.email) {
        sendPropostaLinkEmail({ 
          nome: cliente.nome, 
          email: cliente.email, 
          link, 
          empresa: cliente.empresa 
        }).catch(err => console.error("Email failed:", err));
      }

      // 3. Copiar link y abrir PDF
      navigator.clipboard.writeText(link).then(() => { 
        const pdfUrl = URL.createObjectURL(pdfBlob); 
        window.open(pdfUrl, '_blank'); 
        
        let successMsg = `Proposal saved successfully!\n\nUnique link copied:\n${link}`;
        if (stellarTxHash) {
          successMsg += `\n\n🔗 Stellar Transaction:\n${stellarTxHash}`;
        }
        
        setTimeout(() => { alert(successMsg); }, 500); 
      });
    } catch (err) { console.error(err); alert("Could not save proposal: " + err.message); }
  };

  if (!isAdminMode) {
    if (loadingSolicitude) {
      return (
        <div className="min-h-screen bg-bg">
          <Navbar />
          <main className="pt-20">
            <section style={{ backgroundColor: "#1A1A1A", padding: "80px 16px 60px" }}>
              <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
                <h1 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 900, fontSize: "clamp(28px, 5vw, 48px)", color: "#ffffff" }}>Loading...</h1>
              </div>
            </section>
          </main>
          <Footer />
        </div>
      );
    }
  }

  if (isVendedorOrcamento) {
    const vendedorNome = currentVendedor?.nome || "Sales rep";
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
          onLogout={() => { 
            import('../lib/auth').then(m => m.clearSession()); 
            window.location.href = "/vendas"; 
          }}
          proposalCount={0}
          clienteCount={0}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          vendedorId={vendedorId}
        />

        <main style={{ flex: 1, padding: isMobile ? '80px 16px 24px 16px' : 40, overflow: "auto", marginLeft: sidebarCollapsed ? 80 : 260, marginTop: isMobile ? 60 : 0, transition: 'margin-left 0.3s ease', height: "100vh" }}>
          <div style={{ height: "100%", overflow: "auto", paddingRight: 16 }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontFamily: theme.fontFamily.sans, fontSize: 32, fontWeight: 900, color: theme.colors.text.primary }}>New quote</h1>
                <p style={{ color: theme.colors.text.secondary, fontSize: 14 }}>Create a new sales proposal</p>
              </div>
<OrcamentoForm
                cliente={cliente} setCliente={setCliente} marcas={marcas} setMarcas={setMarcas}
                adicionarMarca={adicionarMarca} removerMarca={removerMarca} toggleRede={toggleRede} toggleServico={toggleServico}
                numeroOrcamentoInput={numeroOrcamentoInput} setNumeroOrcamentoInput={setNumeroOrcamentoInput} isEditingProposta={isEditingProposta}
                precoTotal={precoTotal} setPrecoTotal={setPrecoTotal} descontoPercent={descontoPercent} setDescontoPercent={setDescontoPercent}
                descontoValor={descontoValor} setDescontoValor={setDescontoValor}
                subtotalComDesconto={subtotalComDesconto} descuentoAplicado={descuentoAplicado} ivaComDesconto={ivaComDesconto} totalConDescuento={totalConDescuento}
                propostaId={propostaId} gerarPDF={gerarPDF} handleGuardarProposta={handleGuardarProposta} podeGerarProposta={podeGerarProposta}
                isPublicView={false}
                clientesCRM={clientesCRM} clienteIdSeleccionado={clienteIdSeleccionado} setClienteIdSeleccionado={setClienteIdSeleccionado}
                showClienteDropdown={showClienteDropdown} setShowClienteDropdown={setShowClienteDropdown}
              />
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
          onLogout={() => { 
            import('../lib/auth').then(m => m.clearSession()); 
            window.location.href = "/admin"; 
          }}
          proposalCount={0}
          clienteCount={0}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main style={{ flex: 1, padding: isMobile ? '80px 16px 24px 16px' : 40, overflow: "auto", marginLeft: sidebarCollapsed ? 80 : 260, marginTop: isMobile ? 60 : 0, transition: 'margin-left 0.3s ease', height: "100vh" }}>
          <div style={{ height: "100%", overflow: "auto", paddingRight: 16 }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontFamily: theme.fontFamily.sans, fontSize: 32, fontWeight: 900, color: theme.colors.text.primary }}>New quote</h1>
                <p style={{ color: theme.colors.text.secondary, fontSize: 14 }}>Create a new sales proposal</p>
              </div>

              <OrcamentoForm
                cliente={cliente} setCliente={setCliente} marcas={marcas} setMarcas={setMarcas}
                adicionarMarca={adicionarMarca} removerMarca={removerMarca} toggleRede={toggleRede} toggleServico={toggleServico}
                numeroOrcamentoInput={numeroOrcamentoInput} setNumeroOrcamentoInput={setNumeroOrcamentoInput} isEditingProposta={isEditingProposta}
                precoTotal={precoTotal} setPrecoTotal={setPrecoTotal} descontoPercent={descontoPercent} setDescontoPercent={setDescontoPercent}
                descontoValor={descontoValor} setDescontoValor={setDescontoValor}
                subtotalComDesconto={subtotalComDesconto} descuentoAplicado={descuentoAplicado} ivaComDesconto={ivaComDesconto} totalConDescuento={totalConDescuento}
                propostaId={propostaId} gerarPDF={gerarPDF} handleGuardarProposta={handleGuardarProposta} podeGerarProposta={podeGerarProposta}
                isPublicView={false}
              />
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
            <h1 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 900, fontSize: "clamp(28px, 5vw, 48px)", color: "#ffffff", lineHeight: 1.1 }}>Quote <span style={{ color: "#F22283" }}>generator</span></h1>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 16, color: "#aaaaaa" }}>Set up brands and services and generate a professional PDF in seconds.</p>
          </div>
        </section>

        <section style={{ backgroundColor: "#ffffff", padding: "48px 16px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
<OrcamentoForm
                cliente={cliente} setCliente={setCliente} marcas={marcas} setMarcas={setMarcas}
                adicionarMarca={adicionarMarca} removerMarca={removerMarca} toggleRede={toggleRede} toggleServico={toggleServico}
                numeroOrcamentoInput={numeroOrcamentoInput} setNumeroOrcamentoInput={setNumeroOrcamentoInput} isEditingProposta={isEditingProposta}
                precoTotal={precoTotal} setPrecoTotal={setPrecoTotal} descontoPercent={descontoPercent} setDescontoPercent={setDescontoPercent}
                descontoValor={descontoValor} setDescontoValor={setDescontoValor}
                subtotalComDesconto={subtotalComDesconto} descuentoAplicado={descuentoAplicado} ivaComDesconto={ivaComDesconto} totalConDescuento={totalConDescuento}
                propostaId={propostaId} gerarPDF={gerarPDF} handleGuardarProposta={handleGuardarProposta} podeGerarProposta={podeGerarProposta}
                isPublicView={false}
                clientesCRM={clientesCRM} clienteIdSeleccionado={clienteIdSeleccionado} setClienteIdSeleccionado={setClienteIdSeleccionado}
                showClienteDropdown={showClienteDropdown} setShowClienteDropdown={setShowClienteDropdown}
              />
          </div>
        </section>

        {/* Mostrar resultado de Stellar cuando exista */}
        {stellarTxHash && (
          <section style={{ backgroundColor: "#f0fdf4", padding: "32px 16px", borderTop: "1px solid #dcfce7" }}>
            <div style={{ maxWidth: 800, margin: "0 auto", padding: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <div style={{ width: "12px", height: "12px", backgroundColor: "#22c55e", borderRadius: "50%", animation: "pulse 2s infinite" }}></div>
                <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#166534", margin: 0 }}>✅ Propuesta registrada en Stellar</h3>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#4b5563" }}>Estado:</span>
                  <span style={{ fontWeight: "500", color: stellarSuccess ? "#16a34a" : "#ca8a04" }}>
                    {stellarSuccess ? "Confirmada ✅" : "Pendiente ⏳"}
                  </span>
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#4b5563" }}>Hash:</span>
                  <code style={{ backgroundColor: "#f3f4f6", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontFamily: "monospace", color: "#1f2937" }}>
                    {stellarTxHash.slice(0, 16)}...{stellarTxHash.slice(-8)}
                  </code>
                </div>
              </div>
              
              <a 
                href={stellarExplorerUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  marginTop: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  backgroundColor: "#2563eb",
                  color: "white",
                  fontWeight: "500",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  cursor: "pointer",
                  transition: "background-color 0.3s",
                  width: "100%",
                  textAlign: "center",
                  boxSizing: "border-box"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1d4ed8"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}
              >
                <span>🔍 Ver en Stellar Explorer</span>
                <svg style={{ width: "16px", height: "16px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              
              <p style={{ marginTop: "8px", fontSize: "12px", color: "#6b7280", textAlign: "center", margin: "8px 0 0 0" }}>
                La transacción está verificada en la blockchain de Stellar
              </p>
            </div>
          </section>
        )}

        <CTAFooterSection />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}

export default Orcamento;