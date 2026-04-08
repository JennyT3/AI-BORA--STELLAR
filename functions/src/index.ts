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

// ============================================
// HEADER COMUM PARA TODOS OS EMAILS
// ============================================

const EMAIL_HEADER = `
<div style="background: #1b1c1b; padding: 30px; text-align: center; margin-bottom: 30px;">
  <img src="https://aibora.pt/logo.png" alt="AIBORA" style="height: 60px; margin-bottom: 12px;">
  <div style="color: white; font-size: 28px; font-weight: 900; margin-bottom: 6px;">
    AI BORA
  </div>
  <div style="color: #F25C05; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">
    Estúdio de Transformação Digital
  </div>
</div>
`;

// Footer comum com icons das redes sociais
const EMAIL_FOOTER = (ano: number) => `
<div style="border-top: 1px solid #eee; padding-top: 25px; margin-top: 40px; text-align: center;">
  <div style="margin-bottom: 15px;">
    <a href="https://instagram.com/aiborapt" style="display: inline-block; margin: 0 10px; text-decoration: none;">
      <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" width="28" height="28">
    </a>
    <a href="https://facebook.com/aiborapt" style="display: inline-block; margin: 0 10px; text-decoration: none;">
      <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" width="28" height="28">
    </a>
    <a href="https://linkedin.com/company/aibora" style="display: inline-block; margin: 0 10px; text-decoration: none;">
      <img src="https://cdn-icons-png.flaticon.com/512/733/733561.png" alt="LinkedIn" width="28" height="28">
    </a>
    <a href="https://wa.me/351936021747" style="display: inline-block; margin: 0 10px; text-decoration: none;">
      <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" alt="WhatsApp" width="28" height="28">
    </a>
  </div>
  <p style="color: #666; font-size: 12px; margin: 0;">
    © ${ano} AIBORA - Marketing & Design
  </p>
  <p style="color: #999; font-size: 11px; margin: 8px 0 0;">
    <a href="https://aibora.pt" style="color: #F25C05; text-decoration: none;">aibora.pt</a> | 
    <a href="https://aibora.pt/privacidade" style="color: #999; text-decoration: none;">Privacidade</a> | 
    <a href="https://aibora.pt/termos" style="color: #999; text-decoration: none;">Termos</a>
  </p>
</div>
`;

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
      <body style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fafafa;">
        ${EMAIL_HEADER}
        <div style="background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          <h2 style="color: #1b1c1b; margin: 0 0 20px; font-size: 22px;">Obrigado pelo seu contacto!</h2>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Olá <strong>${data.clienteNome || 'Cliente'}</strong>,
          </p>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            Recebemos o seu orçamento com sucesso. O número do seu pedido é <strong>#${data.orcamentoId || 'N/A'}</strong>.
          </p>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            Data do pedido: ${data.data || new Date().toLocaleDateString('pt-PT')}
          </p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              A nossa equipa analisará o seu pedido e entrará em contacto em breve.
            </p>
          </div>
        </div>
        ${EMAIL_FOOTER(new Date().getFullYear())}
      </body>
      </html>
    `
  },
  'link-proposta': {
    subject: '✦ A sua proposta está pronta - AI BORA',
    getHtml: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sua Proposta</title>
      </head>
      <body style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fafafa;">
        ${EMAIL_HEADER}
        <div style="background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          <h2 style="color: #1b1c1b; margin: 0 0 20px; font-size: 22px;">✦ A sua proposta está pronta!</h2>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Olá <strong>${data.clienteNome || 'Cliente'}</strong>,
          </p>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            We've prepared your custom proposal. Click below to view all the details:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.linkProposta || '#'}" style="background: linear-gradient(135deg, #F25C05 0%, #F22283 100%); color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Ver Proposta
            </a>
          </div>
          <p style="color: #999; font-size: 12px;">
            Esta proposta é válida até: ${data.validade || '10 dias'}
          </p>
        </div>
        ${EMAIL_FOOTER(new Date().getFullYear())}
      </body>
      </html>
    `
  },
  'resposta-proposta': {
    subject: 'Resposta recebida - Aibora',
    getHtml: (data) => {
      const respostaLabel = data.resposta === 'sim' ? '✓ Aceites' : data.resposta === 'reagendar' ? '📅 Reagendar' : '✗ Não aceites';
      const respostaBg = data.resposta === 'sim' ? '#d1fae5' : data.resposta === 'reagendar' ? '#fef3c7' : '#fee2e2';
      const respostaColor = data.resposta === 'sim' ? '#059669' : data.resposta === 'reagendar' ? '#d97706' : '#dc2626';
      
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Resposta Recebida</title>
        </head>
        <body style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fafafa;">
          ${EMAIL_HEADER}
          <div style="background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
            <h2 style="color: #1b1c1b; margin: 0 0 20px; font-size: 22px;">Resposta do Cliente</h2>
            <p style="color: #333; font-size: 16px;">
              O cliente <strong>${data.clienteNome || 'Cliente'}</strong> respondeu à proposta.
            </p>
            <div style="background: ${respostaBg}; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
              <strong style="font-size: 18px; color: ${respostaColor};">
                ${respostaLabel}
              </strong>
            </div>
            ${data.comentarios ? `<p style="color: #666; font-size: 14px;"><strong>Comentários:</strong> ${data.comentarios}</p>` : ''}
          </div>
          ${EMAIL_FOOTER(new Date().getFullYear())}
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
      <body style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fafafa;">
        ${EMAIL_HEADER}
        <div style="background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          <h2 style="color: #10B981; margin: 0 0 20px; font-size: 22px;">✓ Entrega Aprovada!</h2>
          <p style="color: #333; font-size: 16px;">
            Olá <strong>${data.clienteNome || 'Cliente'}</strong>,
          </p>
          <p style="color: #666; font-size: 14px;">
            A sua entrega foi aprovada! Projeto: <strong>${data.projetoNome || 'N/A'}</strong>
          </p>
          <p style="color: #666; font-size: 14px;">
            Data de aprovação: ${data.dataEntrega || new Date().toLocaleDateString('pt-PT')}
          </p>
        </div>
        ${EMAIL_FOOTER(new Date().getFullYear())}
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
      <body style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fafafa;">
        ${EMAIL_HEADER}
        <div style="background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          <h2 style="color: #1b1c1b; margin: 0 0 20px; font-size: 22px;">Nova Fatura Disponível</h2>
          <p style="color: #333; font-size: 16px;">
            Olá <strong>${data.clienteNome || 'Cliente'}</strong>,
          </p>
          <p style="color: #666; font-size: 14px;">
            Tem uma nova fatura disponível.
          </p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Valor:</strong> ${data.valor || 'N/A'}</p>
            <p style="margin: 10px 0 0;"><strong>Vencimento:</strong> ${data.vencimento || 'N/A'}</p>
          </div>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${data.linkFatura || '#'}" style="background: #F25C05; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
              Ver Fatura
            </a>
          </div>
        </div>
        ${EMAIL_FOOTER(new Date().getFullYear())}
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
      <body style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fafafa;">
        ${EMAIL_HEADER}
        <div style="background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          <h2 style="color: #1b1c1b; margin: 0 0 20px; font-size: 22px;">Novo Colaborador</h2>
          <p style="color: #333; font-size: 16px;">
            Um novo colaborador registou-se na plataforma.
          </p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Nome:</strong> ${data.vendedorNome || 'N/A'}</p>
            <p style="margin: 10px 0 0;"><strong>Email:</strong> ${data.vendedorEmail || 'N/A'}</p>
            <p style="margin: 10px 0 0;"><strong>Data:</strong> ${data.dataRegistro || new Date().toLocaleDateString('pt-PT')}</p>
          </div>
        </div>
        ${EMAIL_FOOTER(new Date().getFullYear())}
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
      <body style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fafafa;">
        ${EMAIL_HEADER}
        <div style="background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          <h2 style="color: #F25C05; margin: 0 0 20px; font-size: 22px;">✓ Bem-vindo à AIBORA!</h2>
          <p style="color: #333; font-size: 16px;">
            Olá <strong>${data.vendedorNome || 'Novo Colaborador'}</strong>,
          </p>
          <p style="color: #666; font-size: 14px;">
            O seu acesso à plataforma AIBORA foi aprovado. Já pode começar a trabalhar!
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.linkLogin || 'https://aibora.pt/vendas'}" style="background: linear-gradient(135deg, #F25C05 0%, #F22283 100%); color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Entrar na Plataforma
            </a>
          </div>
          <div style="background: #fef3c7; padding: 15px; border-radius: 12px; margin: 20px 0;">
            <p style="color: #92400e; font-size: 14px; margin: 0;">
              <strong>Nota:</strong> Se nunca criou uma password, use "Esqueci a password" na página de login para criar uma nova.
            </p>
          </div>
        </div>
        ${EMAIL_FOOTER(new Date().getFullYear())}
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