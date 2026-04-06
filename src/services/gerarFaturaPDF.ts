import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

export interface DadosFatura {
  numeroFatura: string;
  dataEmissao: string;
  cliente: string;
  empresa?: string;
  email?: string;
  telefone?: string;
  nif?: string;
  morada?: string;
  servicos: string[];
  subtotal: number;
  iva: number;
  total: number;
  desconto?: number;
  tipo: 'cliente' | 'colaborador';
  colaboradorNome?: string;
  colaboradorNif?: string;
  comissaoValor?: number;
  comissaoPercent?: number;
}

export async function gerarFaturaPDF(dados: DadosFatura): Promise<jsPDF> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pW = 210, pH = 297;
  const logoBase64 = await loadImageAsBase64("/logo.png");

  doc.setFillColor(255, 255, 255); doc.rect(0, 0, pW, 38, "F");
  doc.setFillColor(242, 92, 5); doc.rect(0, 37.5, pW, 0.8, "F");
  if (logoBase64) doc.addImage(logoBase64, "PNG", 12, 7, 24, 24);
  doc.setTextColor(26, 26, 26); doc.setFontSize(17); doc.setFont("helvetica", "bold"); doc.text("AI BORA", 40, 18);
  doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(140, 140, 140); doc.text("Marketing Digital & Criativo", 40, 24);

  const tipoLabel = dados.tipo === 'colaborador' ? "RECIBO DE COMISSÃO" : "FATURA";
  doc.setTextColor(26, 26, 26); doc.setFontSize(13); doc.setFont("helvetica", "bold"); doc.text(tipoLabel, 198, 13, { align: "right" });
  doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(90, 90, 90);
  doc.text("Nº " + dados.numeroFatura, 198, 20, { align: "right" });
  doc.text("Data: " + dados.dataEmissao, 198, 26, { align: "right" });

  let y = 46;

  doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(242, 92, 5); doc.text("EMITIDO POR", 14, y);
  doc.setDrawColor(242, 92, 5); doc.setLineWidth(0.4); doc.line(14, y + 1.5, 196, y + 1.5);
  y += 5; doc.setFillColor(247, 245, 243); doc.rect(14, y, 182, 20, "F");
  doc.setFontSize(8.5); doc.setFont("helvetica", "bold"); doc.setTextColor(26, 26, 26);
  doc.text("AI BORA, Lda", 18, y + 7);
  doc.setFont("helvetica", "normal"); doc.setTextColor(70, 70, 70);
  doc.text("NIF: 319918645  |  geral@aibora.pt  |  +351 936 021 747  |  www.aibora.pt", 18, y + 13);
  y += 28;

  const destinatarioLabel = dados.tipo === 'colaborador' ? "COLABORADOR" : "DADOS DO CLIENTE";
  doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(242, 92, 5); doc.text(destinatarioLabel, 14, y);
  doc.setLineWidth(0.4); doc.line(14, y + 1.5, 196, y + 1.5);
  y += 5; doc.setFillColor(247, 245, 243); doc.rect(14, y, 182, 28, "F");

  const lbl = (label: string, value: string, x: number, yy: number) => {
    doc.setFontSize(8.5); doc.setFont("helvetica", "bold"); doc.setTextColor(26, 26, 26); doc.text(label, x, yy);
    doc.setFont("helvetica", "normal"); doc.setTextColor(70, 70, 70); doc.text(value || "—", x + 22, yy);
  };

  if (dados.tipo === 'colaborador') {
    lbl("Nome:", dados.colaboradorNome || dados.cliente, 18, y + 8);
    lbl("NIF:", dados.colaboradorNif || "—", 18, y + 16);
    lbl("Email:", dados.email || "—", 107, y + 8);
  } else {
    lbl("Nome:", dados.cliente, 18, y + 8);
    lbl("Empresa:", dados.empresa || "—", 107, y + 8);
    lbl("NIF:", dados.nif || "—", 18, y + 16);
    lbl("Email:", dados.email || "—", 107, y + 16);
    lbl("Telefone:", dados.telefone || "—", 18, y + 24);
    lbl("Morada:", dados.morada || "—", 107, y + 24);
  }
  y += dados.tipo === 'colaborador' ? 36 : 40;

  doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(242, 92, 5);
  doc.text(dados.tipo === 'colaborador' ? "SERVIÇOS EXECUTADOS" : "DESCRIÇÃO DOS SERVIÇOS", 14, y);
  doc.setLineWidth(0.4); doc.line(14, y + 1.5, 196, y + 1.5); y += 7;

  autoTable(doc, {
    startY: y,
    head: [["#", "Descrição", "Valor"]],
    body: dados.tipo === 'colaborador'
      ? dados.servicos.map((s, i) => [(i + 1).toString(), s, ""])
      : dados.servicos.map((s, i) => [(i + 1).toString(), s, i === 0 ? dados.subtotal.toFixed(2) + " €" : ""]),
    theme: "plain",
    headStyles: { fillColor: [26, 26, 26], textColor: [255, 255, 255], fontSize: 7.5, fontStyle: "bold", cellPadding: 3 },
    bodyStyles: { fontSize: 8, textColor: [40, 40, 40], cellPadding: 3 },
    columnStyles: { 0: { cellWidth: 8, halign: "center" }, 1: { cellWidth: 148 }, 2: { cellWidth: 26, halign: "right" } },
    alternateRowStyles: { fillColor: [250, 248, 246] },
    margin: { left: 14, right: 14 },
    tableLineColor: [220, 215, 210], tableLineWidth: 0.2,
  });
  y = (doc as any).lastAutoTable?.finalY + 12;

  if (y > 235) { doc.addPage(); y = 18; }
  doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(242, 92, 5); doc.text("RESUMO FINANCEIRO", 14, y);
  doc.setLineWidth(0.4); doc.line(14, y + 1.5, 196, y + 1.5); y += 7;

  doc.setFillColor(242, 92, 5); doc.roundedRect(120, y, 76, 22, 3, 3, "F");
  doc.setTextColor(255, 255, 255); doc.setFontSize(7); doc.setFont("helvetica", "normal");
  doc.text(dados.tipo === 'colaborador' ? "COMISSÃO TOTAL (c/ IVA)" : "TOTAL A PAGAR (c/ IVA 23%)", 158, y + 7, { align: "center" });
  doc.setFontSize(17); doc.setFont("helvetica", "bold");
  doc.text(dados.total.toFixed(2) + " €", 194, y + 18, { align: "right" });

  let ty = y + 4;
  const linhaFin = (label: string, valor: string, bold: boolean, cor: [number, number, number]) => {
    doc.setFontSize(8.5); doc.setFont("helvetica", bold ? "bold" : "normal"); doc.setTextColor(cor[0], cor[1], cor[2]);
    doc.text(label, 14, ty); doc.text(valor, 115, ty, { align: "right" });
    doc.setDrawColor(225, 220, 215); doc.setLineWidth(0.2); doc.line(14, ty + 1.5, 115, ty + 1.5); ty += 7;
  };

  if (dados.tipo === 'colaborador') {
    linhaFin("Serviços executados:", dados.comissaoValor ? (dados.comissaoValor / (1 - (dados.comissaoPercent || 0) / 100)).toFixed(2) + " €" : "—", false, [80, 80, 80]);
    linhaFin("Comissão (" + (dados.comissaoPercent || 0) + "%):", dados.comissaoValor?.toFixed(2) + " €" || "—", false, [242, 92, 5]);
    linhaFin("IVA (23%):", dados.iva.toFixed(2) + " €", false, [80, 80, 80]);
    linhaFin("TOTAL A RECEBER:", dados.total.toFixed(2) + " €", true, [242, 92, 5]);
  } else {
    linhaFin("Subtotal (sem IVA):", dados.subtotal.toFixed(2) + " €", false, [80, 80, 80]);
    if (dados.desconto && dados.desconto > 0) linhaFin("Desconto:", "- " + dados.desconto.toFixed(2) + " €", false, [242, 92, 5]);
    linhaFin("IVA (23%):", dados.iva.toFixed(2) + " €", false, [80, 80, 80]);
    linhaFin("TOTAL A PAGAR:", dados.total.toFixed(2) + " €", true, [242, 92, 5]);
  }

  ty += 6;
  if (ty > 238) { doc.addPage(); ty = 18; }
  doc.setFillColor(247, 245, 243); doc.rect(14, ty, 182, 30, "F");
  doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(26, 26, 26); doc.text("DADOS DE PAGAMENTO", 18, ty + 8);
  doc.setDrawColor(242, 92, 5); doc.setLineWidth(0.3); doc.line(18, ty + 10, 192, ty + 10);
  doc.setFontSize(7.8); doc.setFont("helvetica", "normal"); doc.setTextColor(60, 60, 60);
  doc.text("IBAN: PT50 0000 0000 0000 0000 0000 0  |  Banco: —  |  Referência: " + dados.numeroFatura, 18, ty + 18);
  doc.text("Pagamento por transferência bancária até 5 dias úteis após emissão desta fatura.", 18, ty + 25);

  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.3); doc.line(14, pH - 18, 196, pH - 18);
    doc.setTextColor(100, 100, 100); doc.setFontSize(7.5); doc.setFont("helvetica", "normal");
    doc.text("AI BORA, Lda  |  NIF: 319918645  |  geral@aibora.pt  |  +351 936 021 747  |  www.aibora.pt", 105, pH - 12, { align: "center" });
    doc.setFontSize(6.5); doc.setTextColor(160, 160, 160);
    doc.text("Documento processado por computador.", 105, pH - 7, { align: "center" });
    doc.setTextColor(190, 190, 190); doc.text(p + " / " + totalPages, 196, pH - 7, { align: "right" });
  }

  return doc;
}
