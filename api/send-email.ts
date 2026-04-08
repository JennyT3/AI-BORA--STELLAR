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
,
  'link-proposta': (data) => ({
    subject: `✦ Proposta exclusiva ✦, ${data.clienteNome}`,
    html: `
<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#e8e8e8;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#e8e8e8;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;">

  <!-- HEADER -->
  <tr><td style="background:#000000;padding:32px 40px;text-align:center;">
    <img src="https://aibora.pt/logo.png" alt="Ai Bora" height="56" style="display:block;margin:0 auto;height:56px;width:auto;" />
  </td></tr>

  <!-- GRADIENT BAR -->
  <tr><td style="height:4px;background:linear-gradient(90deg,#cb1a74 0%,#fb4a50 50%,#ff6f2e 100%);font-size:0;line-height:0;">&nbsp;</td></tr>

  <!-- BODY -->
  <tr><td style="padding:48px 40px 16px;">
    <p style="font-size:12px;font-weight:700;color:#ff6f2e;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;">✦ Proposta Exclusiva ✦</p>
    <h1 style="font-size:26px;font-weight:700;color:#111111;margin:0 0 20px;line-height:1.25;">Olá, ${data.clienteNome} 👋</h1>
    <p style="font-size:15px;color:#444444;line-height:1.75;margin:0 0 16px;">
      Preparámos uma proposta pensada especialmente para si e para o seu projeto. Pode ver todos os detalhes e dar o seu feedback diretamente pelo link abaixo.
    </p>
    <p style="font-size:15px;color:#444444;line-height:1.75;margin:0 0 36px;">
      Tem alguma questão? Responda a este email ou contacte-nos diretamente — estamos aqui para ajudar.
    </p>

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:0 0 36px;">
      <a href="${data.linkProposta}" style="display:inline-block;padding:16px 52px;background:#ff6f2e;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;border-radius:8px;letter-spacing:0.3px;">Ver a minha proposta →</a>
    </td></tr></table>

    <!-- INFO BOX -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:40px;">
    <tr><td style="background:#fafafa;border-left:3px solid #ff6f2e;border-radius:0 8px 8px 0;padding:18px 22px;">
      <p style="font-size:12px;color:#999999;margin:0 0 2px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Válida até</p>
      <p style="font-size:15px;color:#111111;margin:0;font-weight:600;">${data.validade}</p>
    </td></tr></table>

    <!-- FIRMA -->
    <p style="font-size:15px;color:#444444;margin:0 0 4px;">Com os melhores cumprimentos,</p>
    <p style="font-size:15px;font-weight:700;color:#111111;margin:0 0 40px;">Equipa Ai Bora 💞</p>
  </td></tr>

  <!-- DIVIDER -->
  <tr><td style="padding:0 40px;"><div style="height:1px;background:#eeeeee;"></div></td></tr>

  <!-- FOOTER -->
  <tr><td style="background:#000000;padding:32px 40px 28px;">

    <!-- NAV -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    <tr><td align="center" style="line-height:2.4;">
      <a href="https://aibora.pt/" style="font-size:12px;color:#aaaaaa;text-decoration:none;margin:0 8px;">Sobre nós</a>
      <span style="color:#333;">|</span>
      <a href="https://aibora.pt/servicos" style="font-size:12px;color:#aaaaaa;text-decoration:none;margin:0 8px;">Serviços</a>
      <span style="color:#333;">|</span>
      <a href="https://aibora.pt/privacidade" style="font-size:12px;color:#aaaaaa;text-decoration:none;margin:0 8px;">Política de Privacidade</a>
      <span style="color:#333;">|</span>
      <a href="https://aibora.pt/unsubscribe" style="font-size:12px;color:#aaaaaa;text-decoration:none;margin:0 8px;">Cancelar subscrição</a>
    </td></tr></table>

    <!-- REDES SOCIAIS -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    <tr><td align="center">
      <table cellpadding="0" cellspacing="0"><tr>

        <td style="padding:0 6px;">
          <a href="https://www.instagram.com/aibora.pt/" style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:8px;background:#E1306C;text-decoration:none;">
            <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="18" height="18" alt="Instagram" style="display:block;" />
          </a>
        </td>

        <td style="padding:0 6px;">
          <a href="https://www.linkedin.com/company/aibora-pt" style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:8px;background:#0A66C2;text-decoration:none;">
            <img src="https://cdn-icons-png.flaticon.com/512/3536/3536505.png" width="18" height="18" alt="LinkedIn" style="display:block;" />
          </a>
        </td>

        <td style="padding:0 6px;">
          <a href="https://x.com/boraweb3" style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:8px;background:#000000;border:1px solid #444444;text-decoration:none;">
            <img src="https://cdn-icons-png.flaticon.com/512/5968/5968830.png" width="16" height="16" alt="X" style="display:block;" />
          </a>
        </td>

        <td style="padding:0 6px;">
          <a href="https://www.facebook.com/aibora.ptt/" style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:8px;background:#1877F2;text-decoration:none;">
            <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="18" height="18" alt="Facebook" style="display:block;" />
          </a>
        </td>

        <td style="padding:0 6px;">
          <a href="https://www.youtube.com/@AiBora_pt" style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:8px;background:#FF0000;text-decoration:none;">
            <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" width="18" height="18" alt="YouTube" style="display:block;" />
          </a>
        </td>

      </tr></table>
    </td></tr></table>

    <!-- CONTACTO -->
    <p style="font-size:12px;color:#666666;text-align:center;margin:0 0 4px;">
      <a href="https://aibora.pt" style="color:#ff6f2e;text-decoration:none;">aibora.pt</a>
      &nbsp;·&nbsp;
      <a href="mailto:geral@aibora.pt" style="color:#ff6f2e;text-decoration:none;">geral@aibora.pt</a>
      &nbsp;·&nbsp;
      <a href="tel:+351936021747" style="color:#aaaaaa;text-decoration:none;">+351 936 021 747</a>
    </p>
    <p style="font-size:11px;color:#444444;text-align:center;margin:16px 0 0;">
      © 2026 Ai Bora. Todos os direitos reservados.
    </p>

  </td></tr>

</table>
</td></tr></table>
</body>
</html>
    `
  })
