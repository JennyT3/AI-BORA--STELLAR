import { useState, useEffect } from "react";
import { IVA_TAXA, REDES, SERVICOS_POR_CATEGORIA } from '../lib/constants';
import { useSearchParams } from "wouter";
import { Sidebar } from "../components/admin/Sidebar";
import { FileText, ExternalLink, Copy, CheckCircle, AlertCircle, Loader2, Plus, Trash2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { createProposal } from "../services/proposals";
import { sendPropostaLinkEmail } from "../services/emailService";
import { storeProposalOnChain } from "../services/soroban";

const colors = {
  orange: '#ff6f2e',
  magenta: '#cb1a74',
  dark: '#1c1b1b',
  light: '#fcf9f8',
  success: '#10b981',
};

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
  
  const [numeroOrcamentoInput, setNumeroOrcamentoInput] = useState("ORC-0001");
  const [precoTotal, setPrecoTotal] = useState<number>(0);
  const [descontoPercent, setDescontoPercent] = useState<number>(0);
  const [descontoValor, setDescontoValor] = useState<number>(0);
  const [marcas, setMarcas] = useState<MarcaData[]>([{ id: "1", nome: "", redes: [], servicos: [] }]);
  const [cliente, setCliente] = useState<ClienteData>({ nome: "", empresa: "", email: "", telefone: "", nif: "", morada: "" });
  
  const [step, setStep] = useState<'form' | 'generating' | 'blockchain' | 'success'>('form');
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [proposalId, setProposalId] = useState<string>("");
  const [proposalLink, setProposalLink] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const [explorerUrl, setExplorerUrl] = useState<string>("");
  const [txStatus, setTxStatus] = useState<'confirmed' | 'pending' | 'demo'>('pending');
  const [copied, setCopied] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const dataCriacao = new Date();
  const dataValidade = new Date(dataCriacao.getTime() + 10 * 24 * 60 * 60 * 1000);
  const dataCriacaoStr = dataCriacao.toLocaleDateString("en-GB");
  const dataValidadeStr = dataValidade.toLocaleDateString("en-GB");

  const total = precoTotal;
  const descuentoAplicado = (total * (descontoPercent / 100)) + descontoValor;
  const totalConDescuento = total - descuentoAplicado;
  const ivaBase = totalConDescuento / (1 + IVA_TAXA);
  const ivaComDesconto = totalConDescuento - ivaBase;
  const subtotalComDesconto = ivaBase;

  // Obtener lista de servicios de forma segura
  const getAllServicos = () => {
    try {
      if (!Array.isArray(SERVICOS_POR_CATEGORIA)) return [];
      return SERVICOS_POR_CATEGORIA.flatMap((cat: any) => cat?.servicos || []);
    } catch {
      return [
        "Social Media Management",
        "Content Creation", 
        "Paid Advertising",
        "SEO Optimization",
        "Web Development",
        "Branding",
        "Photography",
        "Video Production"
      ];
    }
  };

  const todosServicos = getAllServicos();

  const toggleRede = (marcaId: string, redeId: string) => {
    setMarcas(prev => prev.map(m => 
      m.id !== marcaId ? m : { 
        ...m, 
        redes: m.redes.includes(redeId) ? m.redes.filter(r => r !== redeId) : [...m.redes, redeId] 
      }
    ));
  };

  const toggleServico = (marcaId: string, servico: string) => {
    setMarcas(prev => prev.map(m => 
      m.id !== marcaId ? m : { 
        ...m, 
        servicos: m.servicos.includes(servico) ? m.servicos.filter(s => s !== servico) : [...m.servicos, servico] 
      }
    ));
  };

  const adicionarMarca = () => setMarcas(prev => [...prev, { id: Date.now().toString(), nome: "", redes: [], servicos: [] }]);
  const removerMarca = (id: string) => { 
    if (marcas.length > 1) setMarcas(prev => prev.filter(m => m.id !== id)); 
  };

  const svgToBase64 = (svg: string): string => `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  
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
    } catch { 
      return null; 
    }
  };

  const criarPDF = async (): Promise<jsPDF> => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pW = 210, pH = 297;
    const logoBase64 = await loadImageAsBase64("/logo.png");
    const redeIconMap: Record<string, string> = {}; 
    REDES.forEach(r => redeIconMap[r.id] = svgToBase64(r.svg));

    doc.setFillColor(255, 255, 255); 
    doc.rect(0, 0, pW, 38, "F");
    doc.setFillColor(242, 92, 5); 
    doc.rect(0, 37.5, pW, 0.8, "F");
    
    if (logoBase64) doc.addImage(logoBase64, "PNG", 12, 7, 24, 24);
    
    doc.setTextColor(26, 26, 26); 
    doc.setFontSize(17); 
    doc.setFont("helvetica", "bold"); 
    doc.text("AI BORA", 40, 18);
    doc.setFontSize(7.5); 
    doc.setFont("helvetica", "normal"); 
    doc.setTextColor(140, 140, 140); 
    doc.text("Marketing Digital & Criativo", 40, 24);
    
    doc.setTextColor(26, 26, 26); 
    doc.setFontSize(13); 
    doc.setFont("helvetica", "bold"); 
    doc.text("QUOTE", 198, 13, { align: "right" });
    doc.setFontSize(8); 
    doc.setFont("helvetica", "normal"); 
    doc.setTextColor(90, 90, 90); 
    doc.text("No. " + numeroOrcamentoInput, 198, 20, { align: "right" }); 
    doc.text("Date: " + dataCriacaoStr, 198, 26, { align: "right" }); 
    doc.text("Valid until: " + dataValidadeStr, 198, 32, { align: "right" });

    let y = 46;
    doc.setFontSize(7.5); 
    doc.setFont("helvetica", "bold"); 
    doc.setTextColor(242, 92, 5); 
    doc.text("CLIENT DETAILS", 14, y);
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
    
    lbl("Name:", cliente.nome, 18, y + 8); 
    lbl("Company:", cliente.empresa, 107, y + 8); 
    lbl("Tax ID:", cliente.nif, 18, y + 16); 
    lbl("Email:", cliente.email, 107, y + 16); 
    lbl("Phone:", cliente.telefone, 18, y + 24); 
    lbl("Address:", cliente.morada, 107, y + 24);

    y += 40;
    doc.setFontSize(7.5); 
    doc.setFont("helvetica", "bold"); 
    doc.setTextColor(242, 92, 5); 
    doc.text("BRANDS AND SERVICES", 14, y);
    doc.setLineWidth(0.4); 
    doc.line(14, y + 1.5, 196, y + 1.5); 
    y += 7;

    for (let mi = 0; mi < marcas.length; mi++) {
      const marca = marcas[mi]; 
      if (y > 248) { doc.addPage(); y = 18; }
      
      const subtotalMarca = marcas.length > 0 ? subtotalComDesconto / marcas.length : 0;
      doc.setFillColor(242, 92, 5); 
      doc.rect(14, y, 182, 9, "F");
      doc.setTextColor(255, 255, 255); 
      doc.setFontSize(8.5); 
      doc.setFont("helvetica", "bold");
      const nomeMarca = marca.nome ? marca.nome.toUpperCase() : "BRAND " + (mi + 1);
      doc.text("BRAND: " + nomeMarca, 18, y + 6.2); 
      y += 13;

      if (marca.redes.length > 0) {
        doc.setFontSize(7); 
        doc.setFont("helvetica", "bold"); 
        doc.setTextColor(100, 100, 100); 
        doc.text("SOCIAL MEDIA:", 18, y); 
        y += 4;
        let rx = 18;
        for (const redeId of marca.redes) {
          const rede = REDES.find(r => r.id === redeId); 
          if (!rede) continue;
          const pilW = Math.max(doc.getTextWidth(rede.nome) + 14, 24);
          doc.setFillColor(rede.id === "instagram" ? 225 : rede.id === "facebook" ? 24 : rede.id === "tiktok" ? 0 : rede.id === "linkedin" ? 10 : rede.id === "youtube" ? 255 : 0, rede.id === "instagram" ? 48 : rede.id === "facebook" ? 119 : rede.id === "tiktok" ? 0 : rede.id === "linkedin" ? 102 : rede.id === "youtube" ? 0 : 0, rede.id === "instagram" ? 108 : rede.id === "facebook" ? 242 : rede.id === "tiktok" ? 0 : rede.id === "linkedin" ? 194 : rede.id === "youtube" ? 0 : 0);
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

      if (marca.servicos.length > 0) {
        autoTable(doc, { 
          startY: y, 
          head: [["#", "Services included", subtotalMarca.toFixed(2) + " € ex VAT"]], 
          body: marca.servicos.map((s, i) => [(i + 1).toString(), s, ""]), 
          theme: "plain", 
          headStyles: { fillColor: [26, 26, 26], textColor: [255, 255, 255], fontSize: 7.5, fontStyle: "bold", cellPadding: 3 }, 
          bodyStyles: { fontSize: 8, textColor: [40, 40, 40], cellPadding: 3 }, 
          columnStyles: { 0: { cellWidth: 8, halign: "center" }, 1: { cellWidth: 148 }, 2: { cellWidth: 26, halign: "right" } }, 
          alternateRowStyles: { fillColor: [250, 248, 246] }, 
          margin: { left: 14, right: 14 }, 
          tableLineColor: [220, 215, 210], 
          tableLineWidth: 0.2 
        });
        y = (doc as any).lastAutoTable?.finalY + 8;
      } else {
        doc.setFillColor(250, 248, 246); 
        doc.rect(14, y, 182, 8, "F");
        doc.setTextColor(160, 160, 160); 
        doc.setFontSize(7.5); 
        doc.setFont("helvetica", "italic"); 
        doc.text("Services to be defined per commercial proposal", 18, y + 5.5); 
        y += 14;
      }
      y += 3;
    }

    if (y > 235) { doc.addPage(); y = 18; }
    doc.setFontSize(7.5); 
    doc.setFont("helvetica", "bold"); 
    doc.setTextColor(242, 92, 5); 
    doc.text("FINANCIAL SUMMARY", 14, y);
    doc.setLineWidth(0.4); 
    doc.line(14, y + 1.5, 196, y + 1.5); 
    y += 7;
    
    doc.setFillColor(242, 92, 5); 
    doc.roundedRect(120, y, 76, 22, 3, 3, "F");
    doc.setTextColor(255, 255, 255); 
    doc.setFontSize(7); 
    doc.setFont("helvetica", "normal"); 
    doc.text("MONTHLY TOTAL (incl. 23% VAT)", 158, y + 7, { align: "center" });
    doc.setFontSize(17); 
    doc.setFont("helvetica", "bold"); 
    doc.text(totalConDescuento.toFixed(2) + " €", 194, y + 18, { align: "right" });

    let ty = y + 4;
    const linhaFin = (label: string, valor: string, bold: boolean, cor: [number, number, number]) => { 
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
    
    linhaFin("Subtotal (ex VAT):", subtotalComDesconto.toFixed(2) + " €", false, [80, 80, 80]);
    if (descuentoAplicado > 0) linhaFin("Discount:", "- " + descuentoAplicado.toFixed(2) + " €", false, [242, 92, 5]);
    linhaFin("VAT (23%):", ivaComDesconto.toFixed(2) + " €", false, [80, 80, 80]);
    linhaFin("TOTAL DUE:", totalConDescuento.toFixed(2) + " €", true, [242, 92, 5]);

    ty += 6;
    if (ty > 238) { doc.addPage(); ty = 18; }
    doc.setFillColor(247, 245, 243); 
    doc.rect(14, ty, 182, 54, "F");
    doc.setFontSize(7.5); 
    doc.setFont("helvetica", "bold"); 
    doc.setTextColor(26, 26, 26); 
    doc.text("COMMERCIAL TERMS", 18, ty + 8);
    doc.setDrawColor(242, 92, 5); 
    doc.setLineWidth(0.3); 
    doc.line(18, ty + 10, 192, ty + 10);
    
    const conds = [
      "Scope: Delivery of services as detailed above for " + marcas.length + " brand" + (marcas.length > 1 ? "s" : "") + ".", 
      "Term: 3-month trial + annual contract with automatic renewal.", 
      "Payment: Monthly by bank transfer or direct debit by the 5th of each month.", 
      "Validity: This quote is valid until " + dataValidadeStr + " (10 calendar days from issue).", 
      "Termination: 30 days' written notice after the trial period.", 
      "Intellectual property: All created content belongs to the client after full payment."
    ];
    
    doc.setFontSize(7.8); 
    doc.setFont("helvetica", "normal"); 
    doc.setTextColor(60, 60, 60); 
    let cy = ty + 17; 
    conds.forEach(c => { 
      doc.text("•  " + c, 18, cy, { maxWidth: 174 }); 
      cy += 6.5; 
    });

    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) { 
      doc.setPage(p); 
      doc.setDrawColor(220, 220, 220); 
      doc.setLineWidth(0.3); 
      doc.line(14, pH - 18, 196, pH - 18); 
      doc.setTextColor(100, 100, 100); 
      doc.setFontSize(7.5); 
      doc.setFont("helvetica", "normal"); 
      doc.text("AI BORA, Lda  |  Tax ID: 319918645  |  geral@aibora.pt  |  +351 936 021 747  |  www.aibora.pt", 105, pH - 12, { align: "center" }); 
      doc.setFontSize(6.5); 
      doc.setTextColor(160, 160, 160); 
      doc.text("This quote is not an invoice. Subject to formal written acceptance.", 105, pH - 7, { align: "center" }); 
      doc.setTextColor(190, 190, 190); 
      doc.text(p + " / " + totalPages, 196, pH - 7, { align: "right" }); 
    }

    return doc;
  };

  const handleCreateProposal = async () => {
    if (!cliente.nome) {
      alert("Please enter client name");
      return;
    }
    if (totalConDescuento <= 0) {
      alert("Please enter a total amount");
      return;
    }

    setStep('generating');
    console.log('[Proposal] Starting PDF generation...');
    
    try {
      console.log('[Proposal] Creating PDF...');
      const doc = await criarPDF();
      const blob = doc.output('blob');
      setPdfBlob(blob);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      console.log('[Proposal] PDF created, generating hash...');

      const arrayBuffer = await blob.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const pdfHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      console.log('[Proposal] Hash:', pdfHash);

      const proposalData = {
        cliente: cliente.nome,
        empresa: cliente.empresa,
        email: cliente.email,
        telefone: cliente.telefone,
        nif: cliente.nif,
        valor: totalConDescuento,
        subtotal: subtotalComDesconto,
        iva: ivaComDesconto,
        desconto: descuentoAplicado,
        marcas: marcas.length,
        servicos: marcas.flatMap(m => m.servicos),
        redes: marcas.map(m => ({ nome: m.nome, redes: m.redes })),
        numeroOrcamento: numeroOrcamentoInput,
        dataCriacao: dataCriacaoStr,
        dataValidade: dataValidadeStr,
        pdfHash: pdfHash,
        status: 'pending'
      };

      console.log('[Proposal] Saving to Firestore...');
      const id = await createProposal(proposalData);
      setProposalId(id);
      console.log('[Proposal] Proposal ID:', id);

      const { getProposal } = await import('../services/firebase');
      const propostaCriada = await getProposal(id);
      const accessToken = propostaCriada?.accessToken || id;
      const link = `${window.location.origin}/proposal/${accessToken}`;
      setProposalLink(link);
      console.log('[Proposal] Link:', link);

      setStep('blockchain');
      console.log('[Proposal] Storing on blockchain...');
      const uniqueId = `${numeroOrcamentoInput}-${Date.now()}`;
      
      const secretKey = localStorage.getItem('aibora_stellar_secret') || import.meta.env.VITE_VENDOR_SECRET || import.meta.env.VENDOR_SECRET || '';
      console.log('[Proposal] Using secret key:', secretKey ? 'Yes (' + secretKey.slice(0, 8) + '...)' : 'No');
      
      let result: any = null;
      if (secretKey && secretKey.startsWith('SC')) {
        try {
          result = await storeProposalOnChain(uniqueId, cliente.email, pdfHash, totalConDescuento, secretKey);
        } catch (e: any) {
          console.log('[Proposal] Blockchain error (continuing anyway):', e.message);
        }
      } else {
        console.log('[Proposal] ⚠️ No stellar key - running in DEMO mode');
        result = { txHash: 'demo-' + Date.now(), explorerUrl: '', status: 'demo' };
        setTxStatus('demo');
      }
      
      if (result) {
        setTxHash(result.txHash);
        setExplorerUrl(result.explorerUrl);
        setTxStatus(result.status as any);
        console.log('[Proposal] Blockchain tx:', result.txHash);
      }

      if (cliente.email) {
        console.log('[Proposal] Sending email...');
        sendPropostaLinkEmail(
          cliente.email, 
          cliente.nome, 
          link, 
          dataValidadeStr
        ).catch((e) => console.log('[Proposal] Email error:', e));
      }

      setStep('success');
      console.log('[Proposal] Done!');

    } catch (err: any) {
      console.error('[Proposal] Error:', err);
      alert("Error: " + (err?.message || err?.toString() || 'Unknown error'));
      setStep('form');
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(proposalLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openExplorer = () => {
    if (txHash) {
      const url = txHash.startsWith('demo') 
        ? `https://stellar.expert/explorer/testnet`
        : `https://stellar.expert/explorer/testnet/tx/${txHash}`;
      window.open(url, '_blank');
    } else if (explorerUrl) {
      window.open(explorerUrl, '_blank');
    } else {
      window.open('https://stellar.expert/explorer/testnet', '_blank');
    }
  };

  const openPDF = () => {
    if (pdfUrl) window.open(pdfUrl, '_blank');
  };

  const openProposal = () => {
    window.open(proposalLink, '_blank');
  };

  if (step === 'success') {
    return (
      <div style={{ minHeight: '100vh', background: colors.light, display: 'flex' }}>
        {isAdminMode && (
          <Sidebar
            activeTab="orcamento"
            onTabChange={(tab) => window.location.href = `/admin?tab=${tab}`}
            userName="Admin"
            onLogout={() => {}}
            proposalCount={0}
            clienteCount={0}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        )}
        
        <main style={{ flex: 1, padding: '40px', marginLeft: isAdminMode ? (sidebarCollapsed ? 80 : 280) : 0, fontFamily: 'Montserrat, sans-serif' }}>
          
          {txHash && (
            <div style={{
              position: 'fixed',
              top: 20,
              right: 20,
              background: 'white',
              borderRadius: 16,
              padding: '20px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
              border: `2px solid ${txStatus === 'confirmed' ? colors.success : colors.orange}`,
              maxWidth: 400,
              zIndex: 1000,
              animation: 'slideIn 0.3s ease'
            }}>
              <style>{`@keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: txStatus === 'confirmed' ? `${colors.success}20` : `${colors.orange}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {txStatus === 'confirmed' ? <CheckCircle size={24} color={colors.success} /> : <AlertCircle size={24} color={colors.orange} />}
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: colors.dark, fontSize: 16 }}>
                    {txStatus === 'confirmed' ? '✅ On Blockchain!' : '⚡ Demo Mode'}
                  </div>
                  <div style={{ fontSize: 13, color: '#666' }}>
                    Hash: {txHash.slice(0, 12)}...
                  </div>
                </div>
              </div>

              <button
                onClick={openExplorer}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: colors.orange,
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <ExternalLink size={16} />
                View on Stellar Explorer
              </button>
            </div>
          )}

          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.magenta} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                <CheckCircle size={40} color="white" />
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: colors.dark, marginBottom: 8 }}>
                Proposal Created!
              </h1>
              <p style={{ color: '#666', fontSize: 16 }}>
                {txHash ? 'Secured on Stellar Blockchain' : 'Ready to send'}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              <button onClick={openPDF} style={buttonStyle('#fff', colors.orange)}>
                <div style={iconStyle(`${colors.orange}15`, colors.orange)}>
                  <FileText size={28} color={colors.orange} />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: colors.dark, marginBottom: 4 }}>
                    📄 Preview PDF
                  </div>
                  <div style={{ fontSize: 14, color: '#666' }}>
                    View professional proposal
                  </div>
                </div>
                <ExternalLink size={24} color={colors.orange} />
              </button>

              <button onClick={copyLink} style={buttonStyle('#fff', colors.magenta)}>
                <div style={iconStyle(`${colors.magenta}15`, colors.magenta)}>
                  {copied ? <CheckCircle size={28} color={colors.success} /> : <Copy size={28} color={colors.magenta} />}
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: colors.dark, marginBottom: 4 }}>
                    {copied ? '✅ Link Copied!' : '🔗 Copy Proposal Link'}
                  </div>
                  <div style={{ fontSize: 14, color: '#666' }}>
                    Send to client
                  </div>
                </div>
                <Copy size={24} color={colors.magenta} />
              </button>

              <button onClick={openProposal} style={buttonStyle('#fff', '#0891b2')}>
                <div style={iconStyle('rgba(8, 145, 178, 0.15)', '#0891b2')}>
                  <ExternalLink size={28} color="#0891b2" />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: colors.dark, marginBottom: 4 }}>
                    🌐 Open Client View
                  </div>
                  <div style={{ fontSize: 14, color: '#666' }}>
                    See acceptance page
                  </div>
                </div>
                <ExternalLink size={24} color="#0891b2" />
              </button>

              {txHash && (
                <button onClick={openExplorer} style={buttonStyle('#f0fdf4', colors.success)}>
                  <div style={iconStyle(`${colors.success}20`, colors.success)}>
                    <ExternalLink size={28} color={colors.success} />
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: colors.dark, marginBottom: 4 }}>
                      🔍 Stellar Explorer
                    </div>
                    <div style={{ fontSize: 14, color: '#666' }}>
                      Verify: {txHash.slice(0, 20)}...
                    </div>
                  </div>
                  <ExternalLink size={24} color={colors.success} />
                </button>
              )}

            </div>

            <button
              onClick={() => window.location.href = '/admin'}
              style={{
                marginTop: 40,
                width: '100%',
                padding: '16px',
                background: colors.dark,
                color: 'white',
                border: 'none',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer'
              }}
            >
              ← Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  function buttonStyle(bg: string, hoverColor: string) {
    return {
      padding: '24px',
      background: bg,
      border: '2px solid #eee',
      borderRadius: 16,
      cursor: 'pointer',
      textAlign: 'left' as const,
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      transition: 'all 0.3s',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      width: '100%'
    };
  }

  function iconStyle(bg: string, color: string) {
    return {
      width: 56,
      height: 56,
      borderRadius: 12,
      background: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0 as const
    };
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.light, display: 'flex' }}>
      {isAdminMode && (
        <Sidebar
          activeTab="orcamento"
          onTabChange={(tab) => window.location.href = `/admin?tab=${tab}`}
          userName="Admin"
          onLogout={() => {}}
          proposalCount={0}
          clienteCount={0}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}
      
      <main style={{ flex: 1, padding: '40px', marginLeft: isAdminMode ? (sidebarCollapsed ? 80 : 280) : 0, overflow: 'auto' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: colors.dark, marginBottom: 8 }}>
            New Quote / Proposal
          </h1>
          <p style={{ color: '#666', marginBottom: 32 }}>
            Create professional proposal with blockchain verification
          </p>

          <div style={{ display: 'grid', gap: 20, background: 'white', padding: 32, borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            
            <div>
              <label style={{ fontSize: 14, fontWeight: 700, color: colors.dark, marginBottom: 8, display: 'block' }}>
                Quote Number
              </label>
              <input
                type="text"
                value={numeroOrcamentoInput}
                onChange={(e) => setNumeroOrcamentoInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #eee',
                  borderRadius: 8,
                  fontSize: 14,
                  fontFamily: 'Montserrat, sans-serif'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ fontSize: 14, fontWeight: 700, color: colors.dark, marginBottom: 8, display: 'block' }}>
                  Client Name *
                </label>
                <input
                  type="text"
                  value={cliente.nome}
                  onChange={(e) => setCliente({...cliente, nome: e.target.value})}
                  placeholder="John Doe"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #eee',
                    borderRadius: 8,
                    fontSize: 14,
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 14, fontWeight: 700, color: colors.dark, marginBottom: 8, display: 'block' }}>
                  Company
                </label>
                <input
                  type="text"
                  value={cliente.empresa}
                  onChange={(e) => setCliente({...cliente, empresa: e.target.value})}
                  placeholder="Company Ltd"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #eee',
                    borderRadius: 8,
                    fontSize: 14,
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ fontSize: 14, fontWeight: 700, color: colors.dark, marginBottom: 8, display: 'block' }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={cliente.email}
                  onChange={(e) => setCliente({...cliente, email: e.target.value})}
                  placeholder="john@company.com"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #eee',
                    borderRadius: 8,
                    fontSize: 14,
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 14, fontWeight: 700, color: colors.dark, marginBottom: 8, display: 'block' }}>
                  Phone
                </label>
                <input
                  type="text"
                  value={cliente.telefone}
                  onChange={(e) => setCliente({...cliente, telefone: e.target.value})}
                  placeholder="+351 900 000 000"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #eee',
                    borderRadius: 8,
                    fontSize: 14,
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <label style={{ fontSize: 14, fontWeight: 700, color: colors.dark }}>
                  Brands & Services
                </label>
                <button
                  onClick={adicionarMarca}
                  style={{
                    padding: '8px 16px',
                    background: colors.orange,
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Plus size={16} /> Add Brand
                </button>
              </div>

              {marcas.map((marca, index) => (
                <div key={marca.id} style={{ 
                  border: '2px solid #eee', 
                  borderRadius: 12, 
                  padding: 20, 
                  marginBottom: 16,
                  background: '#fafafa'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <input
                      type="text"
                      placeholder={`Brand ${index + 1} Name`}
                      value={marca.nome}
                      onChange={(e) => setMarcas(prev => prev.map(m => m.id === marca.id ? {...m, nome: e.target.value} : m))}
                      style={{
                        flex: 1,
                        padding: '10px',
                        border: '2px solid #eee',
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 700
                      }}
                    />
                    {marcas.length > 1 && (
                      <button
                        onClick={() => removerMarca(marca.id)}
                        style={{
                          marginLeft: 8,
                          padding: '10px',
                          background: '#fee2e2',
                          border: 'none',
                          borderRadius: 8,
                          cursor: 'pointer',
                          color: '#ef4444'
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#666', marginBottom: 8 }}>SERVICES</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {todosServicos.map((servico) => (
                        <button
                          key={servico}
                          onClick={() => toggleServico(marca.id, servico)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: 20,
                            border: '2px solid',
                            borderColor: marca.servicos.includes(servico) ? colors.orange : '#eee',
                            background: marca.servicos.includes(servico) ? `${colors.orange}15` : 'white',
                            color: marca.servicos.includes(servico) ? colors.orange : '#666',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          {servico}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#666', marginBottom: 8 }}>SOCIAL MEDIA</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {REDES.map((rede) => (
                        <button
                          key={rede.id}
                          onClick={() => toggleRede(marca.id, rede.id)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: 20,
                            border: '2px solid',
                            borderColor: marca.redes.includes(rede.id) ? rede.color : '#eee',
                            background: marca.redes.includes(rede.id) ? `${rede.color}15` : 'white',
                            color: marca.redes.includes(rede.id) ? rede.color : '#666',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          {rede.nome}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginTop: 20 }}>
              <div>
                <label style={{ fontSize: 14, fontWeight: 700, color: colors.dark, marginBottom: 8, display: 'block' }}>
                  Total Amount (€)
                </label>
                <input
                  type="number"
                  value={precoTotal}
                  onChange={(e) => setPrecoTotal(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #eee',
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 700,
                    color: colors.orange
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 14, fontWeight: 700, color: colors.dark, marginBottom: 8, display: 'block' }}>
                  Discount %
                </label>
                <input
                  type="number"
                  value={descontoPercent}
                  onChange={(e) => setDescontoPercent(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #eee',
                    borderRadius: 8,
                    fontSize: 14
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 14, fontWeight: 700, color: colors.dark, marginBottom: 8, display: 'block' }}>
                  Discount €
                </label>
                <input
                  type="number"
                  value={descontoValor}
                  onChange={(e) => setDescontoValor(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #eee',
                    borderRadius: 8,
                    fontSize: 14
                  }}
                />
              </div>
            </div>

            <div style={{ 
              background: `linear-gradient(135deg, ${colors.orange}15 0%, ${colors.magenta}15 100%)`, 
              padding: 20, 
              borderRadius: 12,
              marginTop: 20,
              border: `2px solid ${colors.orange}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 600 }}>Subtotal:</span>
                <span>{subtotalComDesconto.toFixed(2)} €</span>
              </div>
              {descuentoAplicado > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: colors.orange }}>
                  <span style={{ fontWeight: 600 }}>Discount:</span>
                  <span>-{descuentoAplicado.toFixed(2)} €</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 600 }}>VAT (23%):</span>
                <span>{ivaComDesconto.toFixed(2)} €</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 800, color: colors.orange, marginTop: 12, paddingTop: 12, borderTop: '2px solid rgba(255,111,46,0.3)' }}>
                <span>TOTAL:</span>
                <span>{totalConDescuento.toFixed(2)} €</span>
              </div>
            </div>

            <button
              onClick={handleCreateProposal}
              disabled={step === 'generating' || step === 'blockchain'}
              style={{
                marginTop: 20,
                width: '100%',
                padding: '20px',
                background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.magenta} 100%)`,
                color: 'white',
                border: 'none',
                borderRadius: 16,
                fontSize: 18,
                fontWeight: 800,
                cursor: step === 'generating' || step === 'blockchain' ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                opacity: step === 'generating' || step === 'blockchain' ? 0.7 : 1,
                boxShadow: '0 4px 20px rgba(242, 92, 5, 0.3)'
              }}
            >
              {step === 'generating' ? (
                <><Loader2 size={24} className="spin" /> Generating PDF...</>
              ) : step === 'blockchain' ? (
                <><Loader2 size={24} className="spin" /> Storing on Blockchain...</>
              ) : step === 'success' ? (
                <>✓ Proposal Created!</>
              ) : (
                <>Create Proposal + Store on Blockchain</>
              )}
            </button>
            
            {!cliente.nome && (
              <p style={{ marginTop: 8, color: colors.orange, fontSize: 12, textAlign: 'center' }}>
                ⚠️ Please enter client name
              </p>
            )}
            {cliente.nome && totalConDescuento <= 0 && (
              <p style={{ marginTop: 8, color: colors.orange, fontSize: 12, textAlign: 'center' }}>
                ⚠️ Please enter total amount above
              </p>
            )}
          </div>
        </div>
      </main>
      
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default Orcamento;
