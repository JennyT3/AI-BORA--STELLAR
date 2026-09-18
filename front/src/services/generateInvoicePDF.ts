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

export interface InvoiceData {
  invoiceNumber: string;
  dataEmissao: string;
  client: string;
  company?: string;
  email?: string;
  phone?: string;
  taxId?: string;
  address?: string;
  services: string[];
  subtotal: number;
  vat: number;
  total: number;
  desconto?: number;
  type: 'client' | 'collaborator';
  collaboratorName?: string;
  collaboratorTaxId?: string;
  commissionAmount?: number;
  commissionPercent?: number;
}

export async function generateInvoicePdf(data: InvoiceData): Promise<jsPDF> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pW = 210, pH = 297;
  const logoBase64 = await loadImageAsBase64("/logo.png");

  doc.setFillColor(255, 255, 255); doc.rect(0, 0, pW, 38, "F");
  doc.setFillColor(242, 92, 5); doc.rect(0, 37.5, pW, 0.8, "F");
  if (logoBase64) doc.addImage(logoBase64, "PNG", 12, 7, 24, 24);
  doc.setTextColor(26, 26, 26); doc.setFontSize(17); doc.setFont("helvetica", "bold"); doc.text("AI BORA", 40, 18);
  doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(140, 140, 140); doc.text("Marketing Digital & Criativo", 40, 24);

  const typeLabel = data.type === 'collaborator' ? "COMMISSION RECEIPT" : "INVOICE";
  doc.setTextColor(26, 26, 26); doc.setFontSize(13); doc.setFont("helvetica", "bold"); doc.text(typeLabel, 198, 13, { align: "right" });
  doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(90, 90, 90);
  doc.text("No. " + data.invoiceNumber, 198, 20, { align: "right" });
  doc.text("Date: " + data.dataEmissao, 198, 26, { align: "right" });

  let y = 46;

  doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(242, 92, 5); doc.text("ISSUED BY", 14, y);
  doc.setDrawColor(242, 92, 5); doc.setLineWidth(0.4); doc.line(14, y + 1.5, 196, y + 1.5);
  y += 5; doc.setFillColor(247, 245, 243); doc.rect(14, y, 182, 20, "F");
  doc.setFontSize(8.5); doc.setFont("helvetica", "bold"); doc.setTextColor(26, 26, 26);
  doc.text("AI BORA, Lda", 18, y + 7);
  doc.setFont("helvetica", "normal"); doc.setTextColor(70, 70, 70);
  doc.text("NIF: 319918645  |  geral@aibora.pt  |  +351 936 021 747  |  www.aibora.pt", 18, y + 13);
  y += 28;

  const destinatarioLabel = data.type === 'collaborator' ? "COLLABORATOR" : "CLIENT DETAILS";
  doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(242, 92, 5); doc.text(destinatarioLabel, 14, y);
  doc.setLineWidth(0.4); doc.line(14, y + 1.5, 196, y + 1.5);
  y += 5; doc.setFillColor(247, 245, 243); doc.rect(14, y, 182, 28, "F");

  const lbl = (label: string, value: string, x: number, yy: number) => {
    doc.setFontSize(8.5); doc.setFont("helvetica", "bold"); doc.setTextColor(26, 26, 26); doc.text(label, x, yy);
    doc.setFont("helvetica", "normal"); doc.setTextColor(70, 70, 70); doc.text(value || "—", x + 22, yy);
  };

  if (data.type === 'collaborator') {
    lbl("Name:", data.collaboratorName || data.client, 18, y + 8);
    lbl("Tax ID:", data.collaboratorTaxId || "—", 18, y + 16);
    lbl("Email:", data.email || "—", 107, y + 8);
  } else {
    lbl("Name:", data.client, 18, y + 8);
    lbl("Company:", data.company || "—", 107, y + 8);
    lbl("Tax ID:", data.taxId || "—", 18, y + 16);
    lbl("Email:", data.email || "—", 107, y + 16);
    lbl("Phone:", data.phone || "—", 18, y + 24);
    lbl("Address:", data.address || "—", 107, y + 24);
  }
  y += data.type === 'collaborator' ? 36 : 40;

  doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(242, 92, 5);
  doc.text(data.type === 'collaborator' ? "SERVICES PERFORMED" : "SERVICE DESCRIPTION", 14, y);
  doc.setLineWidth(0.4); doc.line(14, y + 1.5, 196, y + 1.5); y += 7;

  autoTable(doc, {
    startY: y,
    head: [["#", "Description", "Amount"]],
    body: data.type === 'collaborator'
      ? data.services.map((s, i) => [(i + 1).toString(), s, ""])
      : data.services.map((s, i) => [(i + 1).toString(), s, i === 0 ? data.subtotal.toFixed(2) + " €" : ""]),
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
  doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(242, 92, 5); doc.text("FINANCIAL SUMMARY", 14, y);
  doc.setLineWidth(0.4); doc.line(14, y + 1.5, 196, y + 1.5); y += 7;

  doc.setFillColor(242, 92, 5); doc.roundedRect(120, y, 76, 22, 3, 3, "F");
  doc.setTextColor(255, 255, 255); doc.setFontSize(7); doc.setFont("helvetica", "normal");
  doc.text(data.type === 'collaborator' ? "TOTAL COMMISSION (incl. VAT)" : "TOTAL DUE (incl. 23% VAT)", 158, y + 7, { align: "center" });
  doc.setFontSize(17); doc.setFont("helvetica", "bold");
  doc.text(data.total.toFixed(2) + " €", 194, y + 18, { align: "right" });

  let ty = y + 4;
  const linhaFin = (label: string, amount: string, bold: boolean, color: [number, number, number]) => {
    doc.setFontSize(8.5); doc.setFont("helvetica", bold ? "bold" : "normal"); doc.setTextColor(color[0], color[1], color[2]);
    doc.text(label, 14, ty); doc.text(amount, 115, ty, { align: "right" });
    doc.setDrawColor(225, 220, 215); doc.setLineWidth(0.2); doc.line(14, ty + 1.5, 115, ty + 1.5); ty += 7;
  };

  if (data.type === 'collaborator') {
    linhaFin("Services performed:", data.commissionAmount ? (data.commissionAmount / (1 - (data.commissionPercent || 0) / 100)).toFixed(2) + " €" : "—", false, [80, 80, 80]);
    linhaFin("Commission (" + (data.commissionPercent || 0) + "%):", data.commissionAmount?.toFixed(2) + " €" || "—", false, [242, 92, 5]);
    linhaFin("VAT (23%):", data.vat.toFixed(2) + " €", false, [80, 80, 80]);
    linhaFin("TOTAL TO RECEIVE:", data.total.toFixed(2) + " €", true, [242, 92, 5]);
  } else {
    linhaFin("Subtotal (excl. VAT):", data.subtotal.toFixed(2) + " €", false, [80, 80, 80]);
    if (data.desconto && data.desconto > 0) linhaFin("Discount:", "- " + data.desconto.toFixed(2) + " €", false, [242, 92, 5]);
    linhaFin("VAT (23%):", data.vat.toFixed(2) + " €", false, [80, 80, 80]);
    linhaFin("TOTAL DUE:", data.total.toFixed(2) + " €", true, [242, 92, 5]);
  }

  ty += 6;
  if (ty > 238) { doc.addPage(); ty = 18; }
  doc.setFillColor(247, 245, 243); doc.rect(14, ty, 182, 30, "F");
  doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(26, 26, 26); doc.text("PAYMENT DETAILS", 18, ty + 8);
  doc.setDrawColor(242, 92, 5); doc.setLineWidth(0.3); doc.line(18, ty + 10, 192, ty + 10);
  doc.setFontSize(7.8); doc.setFont("helvetica", "normal"); doc.setTextColor(60, 60, 60);
  doc.text("IBAN: PT50 0000 0000 0000 0000 0000 0  |  Bank: —  |  Reference: " + data.invoiceNumber, 18, ty + 18);
  doc.text("Payment by bank transfer within 5 business days of this invoice date.", 18, ty + 25);

  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.3); doc.line(14, pH - 18, 196, pH - 18);
    doc.setTextColor(100, 100, 100); doc.setFontSize(7.5); doc.setFont("helvetica", "normal");
    doc.text("AI BORA, Lda  |  NIF: 319918645  |  geral@aibora.pt  |  +351 936 021 747  |  www.aibora.pt", 105, pH - 12, { align: "center" });
    doc.setFontSize(6.5); doc.setTextColor(160, 160, 160);
    doc.text("Computer-generated document.", 105, pH - 7, { align: "center" });
    doc.setTextColor(190, 190, 190); doc.text(p + " / " + totalPages, 196, pH - 7, { align: "right" });
  }

  return doc;
}
