import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const gerarFaturaPDF = (proposal: any, numeroFatura: string) => {
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
    doc.setTextColor(242, 92, 5); doc.setFontSize(13); doc.setFont("helvetica", "bold"); doc.text("INVOICE", 198, 13, { align: "right" });
    doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(90, 90, 90); doc.text("No. " + faturaNum, 198, 20, { align: "right" }); doc.text("Date: " + dataAtual, 198, 26, { align: "right" }); doc.text("Valid until: " + dataVencimento, 198, 32, { align: "right" });

    let y = 46;
    doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(242, 92, 5); doc.text("CLIENT DETAILS", 14, y);
    doc.setDrawColor(242, 92, 5); doc.setLineWidth(0.4); doc.line(14, y + 1.5, 196, y + 1.5);
    y += 5; doc.setFillColor(247, 245, 243); doc.rect(14, y, 182, 32, "F");
    const lbl = (label: string, value: string, x: number, yy: number) => { doc.setFontSize(8.5); doc.setFont("helvetica", "bold"); doc.setTextColor(26, 26, 26); doc.text(label, x, yy); doc.setFont("helvetica", "normal"); doc.setTextColor(70, 70, 70); doc.text(value || "—", x + 22, yy); };
    lbl("Name:", proposal.cliente || "", 18, y + 8); lbl("Company:", proposal.empresa || "", 107, y + 8); lbl("Tax ID:", proposal.nif || "", 18, y + 16); lbl("Email:", proposal.email || "", 107, y + 16); lbl("Phone:", proposal.telefone || "", 18, y + 24); lbl("Address:", proposal.morada || "", 107, y + 24);

    y += 40;
    doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(242, 92, 5); doc.text("SERVICES PROVIDED", 14, y);
    doc.setLineWidth(0.4); doc.line(14, y + 1.5, 196, y + 1.5); y += 7;

    const servicosLista = proposal.servicos || ["Social media management", "Content creation"];
    const tableData = servicosLista.map((s: string) => [s, "1", "", ""]);
    
    autoTable(doc, {
      startY: y,
      head: [["Service", "Qty", "Unit price", "Total"]],
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
    doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(242, 92, 5); doc.text("FINANCIAL SUMMARY", 14, y);
    doc.setLineWidth(0.4); doc.line(14, y + 1.5, 196, y + 1.5); y += 7;
    
    const subtotal = proposal.valor / 1.23;
    const iva = proposal.valor - subtotal;
    const desconto = proposal.desconto || 0;
    
    doc.setFillColor(242, 92, 5); doc.roundedRect(120, y, 76, 22, 3, 3, "F");
    doc.setTextColor(255, 255, 255); doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.text("TOTAL DUE (incl. 23% VAT)", 158, y + 7, { align: "center" });
    doc.setFontSize(17); doc.setFont("helvetica", "bold"); doc.text(proposal.valor?.toFixed(2) + " €", 194, y + 18, { align: "right" });

    let ty = y + 4;
    const linhaFin = (label: string, valor: string, bold: boolean, cor: [number, number, number]) => { doc.setFontSize(8.5); doc.setFont("helvetica", bold ? "bold" : "normal"); doc.setTextColor(cor[0], cor[1], cor[2]); doc.text(label, 14, ty); doc.text(valor, 115, ty, { align: "right" }); doc.setDrawColor(225, 220, 215); doc.setLineWidth(0.2); doc.line(14, ty + 1.5, 115, ty + 1.5); ty += 7; };
    linhaFin("Subtotal (excl. VAT):", subtotal.toFixed(2) + " €", false, [80, 80, 80]);
    if (desconto > 0) linhaFin("Discount:", "- " + desconto.toFixed(2) + " €", false, [16, 185, 129]);
    linhaFin("VAT (23%):", iva.toFixed(2) + " €", false, [80, 80, 80]);
    linhaFin("TOTAL DUE:", proposal.valor?.toFixed(2) + " €", true, [242, 92, 5]);

    ty += 6;
    if (ty > 238) { doc.addPage(); ty = 18; }
    doc.setFillColor(247, 245, 243); doc.rect(14, ty, 182, 54, "F");
    doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(26, 26, 26); doc.text("PAYMENT DETAILS", 18, ty + 8);
    doc.setDrawColor(242, 92, 5); doc.setLineWidth(0.3); doc.line(18, ty + 10, 192, ty + 10);
    const paymentInfo = [
      "Bank: Millennium BCP",
      "IBAN: PT50 0000 0000 0000 0000 00XX",
      "SWIFT/BIC: BAPTPTPL",
      "Reference: " + faturaNum,
      "",
      "Due: 30 days",
      "Address: Rua Example, 123, 1000-000 Lisboa"
    ];
    doc.setFontSize(7.8); doc.setFont("helvetica", "normal"); doc.setTextColor(60, 60, 60); let py = ty + 17; paymentInfo.forEach(c => { doc.text("•  " + c, 18, py, { maxWidth: 174 }); py += 6.5; });

    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) { doc.setPage(p); doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.3); doc.line(14, pH - 18, 196, pH - 18); doc.setTextColor(100, 100, 100); doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.text("AI BORA, Lda  |  NIF: 319918645  |  geral@aibora.pt  |  +351 936 021 747  |  www.aibora.pt", 105, pH - 12, { align: "center" }); doc.setFontSize(6.5); doc.setTextColor(160, 160, 160); doc.text("Invoice generated automatically", 105, pH - 7, { align: "center" }); doc.setTextColor(190, 190, 190); doc.text(p + " / " + totalPages, 196, pH - 7, { align: "right" }); }

    doc.output("dataurlnewwindow");
  };
