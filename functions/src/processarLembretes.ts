import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { sendFaturaEmail, sendMarketingCampaignEmail } from "../services/emailService";

// Initialize the Firebase Admin App only if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export const processarLembretesFaturas = onSchedule("every 24 hours", async (event) => {
  console.log("Iniciando processamento de lembretes...");
  
  const hoje = new Date();
  
  // 1. Processar Lembretes de Faturas (pendentes e com vencimento em 7, 3, 1 dias)
  const faturasSnap = await db.collection("faturas").where("estado", "==", "pendente").get();
  
  for (const doc of faturasSnap.docs) {
    const fatura = doc.data();
    if (!fatura.dataVencimento) continue;
    
    const dataVencimento = fatura.dataVencimento.toDate ? fatura.dataVencimento.toDate() : new Date(fatura.dataVencimento);
    // Diferença em dias do momento atual até o vencimento
    const diffDays = Math.ceil((dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 7 || diffDays === 3 || diffDays === 1) {
      console.log(`📧 Enviando lembrete de fatura ${fatura.numero} (Vence em ${diffDays} dias)`);
      
      await sendFaturaEmail({
        nome: fatura.clienteNome || "Cliente",
        email: fatura.clienteEmail || "",
        numeroFatura: fatura.numero || doc.id,
        valorTotal: `${fatura.valorTotal} €`,
        dataVencimento: dataVencimento.toLocaleDateString('pt-PT'),
        linkFatura: `https://aibora.pt/admin/faturas`,
        linkPagar: `https://aibora.pt/pagar/${doc.id}`
      });
    }
  }

  // 2. Processar Lembretes de Nurturing (baseado na dataRejeicao aos 7, 12, 15 dias)
  const nurturingSnap = await db.collection("nurturing").where("estado", "==", "nurturing").get();
  
  for (const doc of nurturingSnap.docs) {
    const nurturing = doc.data();
    if (!nurturing.dataRejeicao) continue;
    
    const dataRejeicao = nurturing.dataRejeicao.toDate ? nurturing.dataRejeicao.toDate() : new Date(nurturing.dataRejeicao);
    // Dias decorridos desde a rejeição/entrada no pipeline de nurturing
    const diffDays = Math.floor((hoje.getTime() - dataRejeicao.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 7 || diffDays === 12 || diffDays === 15) {
      console.log(`📧 Enviando email de nurturing para ${nurturing.nome} (Dia ${diffDays} na jornada)`);
      
      const assunto = diffDays === 7 ? "Ainda está a pensar no seu projeto?" : 
                     diffDays === 12 ? "Descubra como podemos ajudar a escalar a sua marca" :
                     "Última oportunidade para iniciar com condições especiais";
                     
      await sendMarketingCampaignEmail({
        nome: nurturing.nome || "Cliente",
        email: nurturing.email || "",
        assunto,
        mensagemHtml: `<p>Olá ${nurturing.nome}, notámos que ainda não avançou com o seu projeto. A AI BORA está aqui para ajudar. Responda a este email para retomarmos a conversa!</p>`
      });
    }
  }
  
  console.log("✅ Processamento diário concluído.");
});
