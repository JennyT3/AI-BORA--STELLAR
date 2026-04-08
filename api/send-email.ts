import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const templates: Record<string, (data: any) => { subject: string; html: string }> = {
  'confirmacao-orcamento': (data) => ({
    subject: 'Recebemos seu orçamento - Aibora',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #667eea; margin-bottom: 20px;">Olá ${data.clienteNome},</h2>
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
          Recebemos a sua solicitação com sucesso! Agradecemos o seu contacto.
        </p>
        <div style="background: #f7fafc; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 6px;">
          <p style="margin: 5px 0; color: #4a5568; font-size: 14px;"><strong>ID:</strong> ${data.solicitacaoId}</p>
          <p style="margin: 5px 0; color: #4a5568; font-size: 14px;"><strong>Data:</strong> ${data.data}</p>
          <p style="margin: 5px 0; color: #4a5568; font-size: 14px;"><strong>Tipo:</strong> ${data.tipoProjeto}</p>
        </div>
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
          A nossa equipa vai analisar o seu pedido e entraremos em contacto consigo nos próximos <strong>2 dias úteis</strong>.
        </p>
        <p style="color: #718096; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          © 2026 Aibora. Todos os direitos reservados.
        </p>
      </div>
    `
  }),
  
  'novo-colaborador-admin': (data) => ({
    subject: 'Novo colaborador registrado - Aibora',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #667eea; margin-bottom: 20px;">Novo colaborador registrado</h2>
        <div style="background: #f7fafc; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 6px;">
          <p style="margin: 5px 0; color: #4a5568; font-size: 14px;"><strong>Nome:</strong> ${data.vendedorNome}</p>
          <p style="margin: 5px 0; color: #4a5568; font-size: 14px;"><strong>Email:</strong> ${data.vendedorEmail}</p>
          <p style="margin: 5px 0; color: #4a5568; font-size: 14px;"><strong>Data:</strong> ${data.dataRegistro}</p>
        </div>
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
          Acesse o painel admin para aprovar este colaborador.
        </p>
      </div>
    `
  }),
  
  'acesso-colaborador': (data) => ({
    subject: 'Acesso à plataforma Aibora',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #667eea; margin-bottom: 20px;">Bem-vindo à Aibora, ${data.vendedorNome}!</h2>
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
          Seu acesso foi aprovado.
        </p>
        <div style="background: #f7fafc; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 6px;">
          <p style="margin: 5px 0; color: #4a5568; font-size: 14px;"><strong>Email:</strong> ${data.email}</p>
          <p style="margin: 5px 0; color: #4a5568; font-size: 14px;">
            <strong>Link:</strong> <a href="${data.linkLogin}" style="color: #667eea;">${data.linkLogin}</a>
          </p>
        </div>
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
          <strong>Importante:</strong> Use "Esqueci a password" na página de login para criar sua senha inicial.
        </p>
      </div>
    `
  }),
  
  'link-proposta': (data) => ({
    subject: 'Sua proposta exclusiva - Aibora',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #667eea; margin-bottom: 20px;">Olá ${data.clienteNome},</h2>
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
          Preparamos uma proposta exclusiva para si.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.linkProposta}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 6px;">
            Ver Proposta
          </a>
        </div>
        <p style="color: #718096; font-size: 12px;">
          Link válido até: ${data.validade}
        </p>
      </div>
    `
  }),
  
  'resposta-proposta': (data) => ({
    subject: 'Resposta recebida - Aibora',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #667eea; margin-bottom: 20px;">Resposta de ${data.clienteNome}</h2>
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
          <strong>Resposta:</strong> ${data.resposta}
        </p>
        ${data.comentarios ? `<p style="color: #4a5568; font-size: 14px;"><strong>Comentários:</strong> ${data.comentarios}</p>` : ''}
      </div>
    `
  }),
  
  'entrega-aprovada': (data) => ({
    subject: 'Entrega confirmada - Aibora',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #667eea; margin-bottom: 20px;">Entrega Confirmada</h2>
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
          Projeto: <strong>${data.projetoNome}</strong>
        </p>
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
          Data de entrega: ${data.dataEntrega}
        </p>
      </div>
    `
  }),
  
  'fatura': (data) => ({
    subject: 'Fatura disponível - Aibora',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #667eea; margin-bottom: 20px;">Fatura Disponível</h2>
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
          Valor: <strong>${data.valor}€</strong>
        </p>
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
          Vencimento: ${data.vencimento}
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.linkFatura}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 6px;">
            Ver Fatura
          </a>
        </div>
      </div>
    `
  })
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, templateId, templateData } = req.body;

    if (!to || !templateId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const template = templates[templateId];
    if (!template) {
      return res.status(400).json({ error: 'Template not found' });
    }

    const { subject, html } = template(templateData);

    const { data, error } = await resend.emails.send({
      from: 'geral@aibora.pt',
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ success: true, id: data?.id });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
