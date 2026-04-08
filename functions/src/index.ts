import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Resend } from 'resend';

// ============================================
// INICIALIZAÇÃO
// ============================================

admin.initializeApp();

const resend = new Resend(process.env.RESEND_API_KEY);

// Email do remetente (do seu domínio configurado no Resend)
const FROM_EMAIL = 'AIBORA <geral@aibora.pt>';

// Mapeamento de templates
const TEMPLATES: Record<string, {
  subject: string;
  getHtml: (data: Record<string, string>) => string;
}> = {
  'confirmacao-orcamento': {
    subject: 'Recebemos seu orçamento - Aibora',
    getHtml: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Orçamento Recebido</title>
      </head>
      <body style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #F25C05 0%, #F22283 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Obrigado pelo seu contacto!</h1>
        </div>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Olá <strong>${data.clienteNome || 'Cliente'}</strong>,
        </p>
        <p style="color: #666; font-size: 14px; line-height: 1.6;">
          Recebemos o seu orçamento com sucesso. O número do seu pedido é <strong>#${data.orcamentoId || 'N/A'}</strong>.
        </p>
        <p style="color: #666; font-size: 14px; line-height: 1.6;">
          Data do pedido: ${data.data || new Date().toLocaleDateString('pt-PT')}
        </p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #666; font-size: 14px; margin: 0;">
            A nossa equipa analisará o seu pedido e entrará em contacto em breve.
          </p>
        </div>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          © ${new Date().getFullYear()} AIBORA - Marketing & Design
        </p>
      </body>
      </html>
    `
  },
  'link-proposta': {
    subject: 'Sua proposta exclusiva - Aibora',
    getHtml: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sua Proposta</title>
      </head>
      <body style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #F25C05 0%, #F22283 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Sua Proposta Exclusiva</h1>
        </div>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Olá <strong>${data.clienteNome || 'Cliente'}</strong>,
        </p>
        <p style="color: #666; font-size: 14px; line-height: 1.6;">
          Preparámos uma proposta exclusiva para si! Clique no botão abaixo para a visualizar:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.linkProposta || '#'}" style="background: linear-gradient(135deg, #F25C05 0%, #F22283 100%); color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
            Ver Proposta
          </a>
        </div>
        <p style="color: #999; font-size: 12px;">
          Esta proposta é válida até: ${data.validade || '10 dias'}
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          © ${new Date().getFullYear()} AIBORA - Marketing & Design
        </p>
      </body>
      </html>
    `
  },
  'resposta-proposta': {
    subject: 'Resposta recebida - Aibora',
    getHtml: (data) => {
      const respostaLabel = data.resposta === 'sim' ? '✅ Aceites' : data.resposta === 'reagendar' ? '📅 Reagendar' : '❌ Não aceites';
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Resposta Recebida</title>
        </head>
        <body style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #F25C05 0%, #F22283 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Resposta do Cliente</h1>
          </div>
          <p style="color: #333; font-size: 16px;">
            O cliente <strong>${data.clienteNome || 'Cliente'}</strong> respondeu à proposta.
          </p>
          <div style="background: ${data.resposta === 'sim' ? '#d1fae5' : data.resposta === 'reagendar' ? '#fef3c7' : '#fee2e2'}; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <strong style="font-size: 18px; color: ${data.resposta === 'sim' ? '#059669' : data.resposta === 'reagendar' ? '#d97706' : '#dc2626'};">
              ${respostaLabel}
            </strong>
          </div>
          ${data.comentarios ? `<p style="color: #666; font-size: 14px;"><strong>Comentários:</strong> ${data.comentarios}</p>` : ''}
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            © ${new Date().getFullYear()} AIBORA - Marketing & Design
          </p>
        </body>
      </html>
    `;
    }
  },
  'entrega-aprovada': {
    subject: 'Entrega confirmada - Aibora',
    getHtml: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Entrega Aprovada</title>
      </head>
      <body style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Entrega Aprovada!</h1>
        </div>
        <p style="color: #333; font-size: 16px;">
          Olá <strong>${data.clienteNome || 'Cliente'}</strong>,
        </p>
        <p style="color: #666; font-size: 14px;">
          A sua entrega foi aprovada! Projeto: <strong>${data.projetoNome || 'N/A'}</strong>
        </p>
        <p style="color: #666; font-size: 14px;">
          Data de aprovação: ${data.dataEntrega || new Date().toLocaleDateString('pt-PT')}
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          © ${new Date().getFullYear()} AIBORA - Marketing & Design
        </p>
      </body>
      </html>
    `
  },
  'fatura': {
    subject: 'Fatura disponível - Aibora',
    getHtml: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nova Fatura</title>
      </head>
      <body style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #F25C05 0%, #F22283 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Nova Fatura Disponível</h1>
        </div>
        <p style="color: #333; font-size: 16px;">
          Olá <strong>${data.clienteNome || 'Cliente'}</strong>,
        </p>
        <p style="color: #666; font-size: 14px;">
          Tem uma nova fatura disponível.
        </p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Valor:</strong> ${data.valor || 'N/A'}</p>
          <p style="margin: 10px 0 0;"><strong>Vencimento:</strong> ${data.vencimento || 'N/A'}</p>
        </div>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${data.linkFatura || '#'}" style="background: #F25C05; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
            Ver Fatura
          </a>
        </div>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          © ${new Date().getFullYear()} AIBORA - Marketing & Design
        </p>
      </body>
      </html>
    `
  },
  'novo-colaborador-admin': {
    subject: 'Novo colaborador registrado - Aibora',
    getHtml: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Novo Colaborador</title>
      </head>
      <body style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #F25C05 0%, #F22283 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Novo Colaborador</h1>
        </div>
        <p style="color: #333; font-size: 16px;">
          Um novo colaborador registou-se na plataforma.
        </p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Nome:</strong> ${data.vendedorNome || 'N/A'}</p>
          <p style="margin: 10px 0 0;"><strong>Email:</strong> ${data.vendedorEmail || 'N/A'}</p>
          <p style="margin: 10px 0 0;"><strong>Data:</strong> ${data.dataRegistro || new Date().toLocaleDateString('pt-PT')}</p>
        </div>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          © ${new Date().getFullYear()} AIBORA - Marketing & Design
        </p>
      </body>
      </html>
    `
  },
  'acesso-colaborador': {
    subject: 'Acesso à plataforma Aibora',
    getHtml: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bem-vindo à AIBORA</title>
      </head>
      <body style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #F25C05 0%, #F22283 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Bem-vindo à AIBORA!</h1>
        </div>
        <p style="color: #333; font-size: 16px;">
          Olá <strong>${data.vendedorNome || 'Novo Colaborador'}</strong>,
        </p>
        <p style="color: #666; font-size: 14px;">
          O seu acesso à plataforma AIBORA foi aprovado. Ya pode começar a trabalhar!
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.linkLogin || 'https://aibora.pt/vendas'}" style="background: linear-gradient(135deg, #F25C05 0%, #F22283 100%); color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
            Entrar na Plataforma
          </a>
        </div>
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #92400e; font-size: 14px; margin: 0;">
            <strong>Nota:</strong> Se nunca criou uma password, use "Esqueci a password" na página de login para criar uma nova.
          </p>
        </div>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          © ${new Date().getFullYear()} AIBORA - Marketing & Design
        </p>
      </body>
      </html>
    `
  }
};

// ============================================
// ENDPOINT: Enviar Email
// ============================================

export const sendEmail = functions.https.onCall(async (data, context) => {
  // ============================================
  // VERIFICAR AUTENTICAÇÃO
  // ============================================
  
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'É necessário estar autenticado para enviar emails'
    );
  }

  // ============================================
  // VALIDAR INPUT
  // ============================================
  
  const { to, templateId, templateData } = data;

  if (!to || !templateId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Parâmetros obrigatórios: to, templateId'
    );
  }

  // ============================================
  // OBTER TEMPLATE
  // ============================================
  
  const template = TEMPLATES[templateId];
  
  if (!template) {
    throw new functions.https.HttpsError(
      'not-found',
      `Template não encontrado: ${templateId}`
    );
  }

  // ============================================
  // ENVIAR EMAIL VIA RESEND
  // ============================================
  
  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: to,
      subject: template.subject,
      html: template.getHtml(templateData || {})
    });

    console.log(`✅ Email enviado: ${templateId} para ${to}`, result.data);

    return {
      success: true,
      messageId: result.data?.id
    };
  } catch (error: any) {
    console.error(`❌ Erro ao enviar email:`, error);
    
    throw new functions.https.HttpsError(
      'internal',
      'Erro ao enviar email',
      error.message
    );
  }
});

// ============================================
// ENDPOINT: Webhook para testes (opcional)
// ============================================

export const testEmail = functions.https.onRequest(async (req, res) => {
  // Apenas para testes em desenvolvimento
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const { to, templateId, templateData } = req.body;

  if (!to || !templateId) {
    res.status(400).json({ error: 'Parâmetros obrigatórios: to, templateId' });
    return;
  }

  const template = TEMPLATES[templateId];
  
  if (!template) {
    res.status(404).json({ error: `Template não encontrado: ${templateId}` });
    return;
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: to,
      subject: template.subject,
      html: template.getHtml(templateData || {})
    });

    res.json({ success: true, messageId: result.data?.id });
  } catch (error: any) {
    console.error('Erro:', error);
    res.status(500).json({ error: error.message });
  }
});