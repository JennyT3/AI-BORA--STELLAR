import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FOOTER = `
  <tr><td style="background:#1a1a1a;padding:32px 40px 28px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    <tr><td align="center" style="line-height:2.4;">
      <a href="https://aibora.pt/" style="font-size:12px;color:#888888;text-decoration:none;margin:0 8px;">Sobre nós</a>
      <span style="color:#444;">|</span>
      <a href="https://aibora.pt/servicos" style="font-size:12px;color:#888888;text-decoration:none;margin:0 8px;">Serviços</a>
      <span style="color:#444;">|</span>
      <a href="https://aibora.pt/privacidade" style="font-size:12px;color:#888888;text-decoration:none;margin:0 8px;">Política de Privacidade</a>
      <span style="color:#444;">|</span>
      <a href="https://aibora.pt/unsubscribe" style="font-size:12px;color:#888888;text-decoration:none;margin:0 8px;">Cancelar subscrição</a>
    </td></tr></table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    <tr><td align="center">
      <table cellpadding="0" cellspacing="0"><tr>
        <td style="padding:0 6px;"><a href="https://www.instagram.com/aibora.pt/" style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:8px;background:#E1306C;text-decoration:none;"><svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a></td>
        <td style="padding:0 6px;"><a href="https://www.linkedin.com/company/aibora-pt" style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:8px;background:#0A66C2;text-decoration:none;"><svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a></td>
        <td style="padding:0 6px;"><a href="https://x.com/boraweb3" style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:8px;background:#000000;text-decoration:none;border:1px solid #333;"><svg width="14" height="14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a></td>
        <td style="padding:0 6px;"><a href="https://www.facebook.com/aibora.pt/" style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:8px;background:#1877F2;text-decoration:none;"><svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a></td>
        <td style="padding:0 6px;"><a href="https://www.youtube.com/@AiBora_pt" style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:8px;background:#FF0000;text-decoration:none;"><svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a></td>
        <td style="padding:0 6px;"><a href="https://wa.me/351936021747" style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:8px;background:#25D366;text-decoration:none;"><svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.162-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.173-.148.297-.297.446-.521.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.524-.05-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a></td>
      </tr></table>
    </td></tr></table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
    <tr><td align="center">
      <p style="font-size:14px;color:#ffffff;text-align:center;margin:0 0 8px;">
        <a href="mailto:geral@aibora.pt" style="color:#ff6f2e;text-decoration:none;font-weight:500;">geral@aibora.pt</a>
        &nbsp;&nbsp;·&nbsp;&nbsp;
        <a href="tel:+351936021747" style="color:#ffffff;text-decoration:none;">+351 936 021 747</a>
      </p>
    </td></tr></table>
    <p style="font-size:11px;color:#666666;text-align:center;margin:16px 0 0;">© 2026 Ai Bora. Todos os direitos reservados.</p>
  </td></tr>`;

const HEADER = `<!DOCTYPE html><html lang="pt"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#e8e8e8;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#e8e8e8;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;">
<tr><td style="background:#1a1a1a;padding:28px 40px;text-align:center;">
  <img src="https://aibora.pt/logo.png" alt="Ai Bora" height="48" style="display:block;margin:0 auto;" />
</td></tr>
<tr><td style="height:4px;background:linear-gradient(90deg,#cb1a74 0%,#fb4a50 50%,#ff6f2e 100%);font-size:0;">&nbsp;</td></tr>`;

const CLOSE = `</table></td></tr></table></body></html>`;

function wrap(body: string): string {
  return HEADER + body + FOOTER + CLOSE;
}

const templates: Record<string, (data: any) => { subject: string; html: string }> = {

  'link-proposta': (data) => ({
    subject: `✦ A sua proposta exclusiva está pronta, ${data.clienteNome}`,
    html: wrap(`
      <tr><td style="padding:48px 40px 16px;">
        <p style="font-size:12px;font-weight:700;color:#ff6f2e;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;">✦ Proposta Exclusiva ✦</p>
        <h1 style="font-size:26px;font-weight:700;color:#111;margin:0 0 20px;line-height:1.25;">Olá, ${data.clienteNome} 👋</h1>
        <p style="font-size:15px;color:#444;line-height:1.75;margin:0 0 16px;">Preparámos uma proposta pensada especialmente para si e para o seu projeto. Pode ver todos os detalhes e dar o seu feedback pelo link abaixo.</p>
        <p style="font-size:15px;color:#444;line-height:1.75;margin:0 0 36px;">Tem alguma questão? Responda a este email ou contacte-nos — estamos aqui para ajudar.</p>
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:0 0 36px;">
          <a href="${data.linkProposta}" style="display:inline-block;padding:16px 52px;background:#ff6f2e;color:#fff;text-decoration:none;font-size:15px;font-weight:700;border-radius:8px;">Ver a minha proposta →</a>
        </td></tr></table>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:40px;"><tr><td style="background:#fafafa;border-left:3px solid #ff6f2e;border-radius:0 8px 8px 0;padding:18px 22px;">
          <p style="font-size:12px;color:#999;margin:0 0 2px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Válida até</p>
          <p style="font-size:15px;color:#111;margin:0;font-weight:600;">${data.validade}</p>
        </td></tr></table>
        <p style="font-size:15px;color:#444;margin:0 0 4px;">Com os melhores cumprimentos,</p>
        <p style="font-size:15px;font-weight:700;color:#111;margin:0 0 40px;">Equipa Ai Bora 💞</p>
      </td></tr>
      <tr><td style="padding:0 40px;"><div style="height:1px;background:#eee;"></div></td></tr>`)
  }),

  'confirmacao-orcamento': (data) => ({
    subject: `Recebemos o seu pedido de orçamento, ${data.clienteNome}!`,
    html: wrap(`
      <tr><td style="padding:48px 40px 16px;">
        <p style="font-size:12px;font-weight:700;color:#ff6f2e;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;">📋 Pedido Recebido</p>
        <h1 style="font-size:26px;font-weight:700;color:#111;margin:0 0 20px;line-height:1.25;">Olá, ${data.clienteNome}!</h1>
        <p style="font-size:15px;color:#444;line-height:1.75;margin:0 0 16px;">Obrigado pelo seu interesse nos serviços da Ai Bora. Recebemos o seu pedido de orçamento e a nossa equipa está a analisá-lo.</p>
        <p style="font-size:15px;color:#444;line-height:1.75;margin:0 0 16px;">Dentro de <strong>2 dias úteis</strong> receberá uma proposta personalizada, elaborada especificamente para as necessidades do seu negócio.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:40px;"><tr><td style="background:#fafafa;border-left:3px solid #ff6f2e;border-radius:0 8px 8px 0;padding:18px 22px;">
          <p style="font-size:12px;color:#999;margin:0 0 8px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Resumo do pedido</p>
          <p style="font-size:14px;color:#111;margin:0 0 4px;"><strong>ID:</strong> ${data.solicitacaoId}</p>
          <p style="font-size:14px;color:#111;margin:0 0 4px;"><strong>Data:</strong> ${data.data}</p>
          ${data.tipoProjeto ? `<p style="font-size:14px;color:#111;margin:0;"><strong>Serviços:</strong> ${data.tipoProjeto}</p>` : ''}
        </td></tr></table>
        <p style="font-size:15px;color:#444;margin:0 0 4px;">Estamos ansiosos por ajudar o seu negócio a crescer!</p>
        <p style="font-size:15px;font-weight:700;color:#111;margin:0 0 40px;">Equipa Ai Bora</p>
      </td></tr>
      <tr><td style="padding:0 40px;"><div style="height:1px;background:#eee;"></div></td></tr>`)
  }),

  'confirmacao-mensagem': (data) => ({
    subject: `Obrigado por nos contactar, ${data.clienteNome}!`,
    html: wrap(`
      <tr><td style="padding:48px 40px 16px;">
        <p style="font-size:12px;font-weight:700;color:#ff6f2e;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;">👋 Recebemos a sua mensagem</p>
        <h1 style="font-size:26px;font-weight:700;color:#111;margin:0 0 20px;line-height:1.25;">Olá, ${data.clienteNome}!</h1>
        <p style="font-size:15px;color:#444;line-height:1.75;margin:0 0 16px;">Obrigado por nos contactar. Recebemos a sua mensagem e vamos analisar o seu pedido com atenção.</p>
        <p style="font-size:15px;color:#444;line-height:1.75;margin:0 0 36px;">A nossa equipa vai entrar em contacto consigo dentro de <strong>24 horas</strong>. Enquanto isso, se tiver alguma dúvida, pode responder a este email ou chamar-nos diretamente.</p>
        <p style="font-size:15px;color:#444;margin:0 0 4px;">Estamos ansiosos por ajudar!</p>
        <p style="font-size:15px;font-weight:700;color:#111;margin:0 0 40px;">Equipa Ai Bora</p>
      </td></tr>
      <tr><td style="padding:0 40px;"><div style="height:1px;background:#eee;"></div></td></tr>`)
  }),

  'confirmacao-colaborador': (data) => ({
    subject: `Recebemos a sua candidatura, ${data.clienteNome}!`,
    html: wrap(`
      <tr><td style="padding:48px 40px 16px;">
        <p style="font-size:12px;font-weight:700;color:#ff6f2e;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;">✨ Recebemos a sua candidatura</p>
        <h1 style="font-size:26px;font-weight:700;color:#111;margin:0 0 20px;line-height:1.25;">Olá, ${data.clienteNome}!</h1>
        <p style="font-size:15px;color:#444;line-height:1.75;margin:0 0 16px;">Obrigado por se candidatar para fazer parte da rede Ai Bora. Recebemos o seu formulário e a nossa equipa está a analisar o seu perfil.</p>
        <p style="font-size:15px;color:#444;line-height:1.75;margin:0 0 16px;">Dentro de <strong>48 horas</strong> receberá feedback sobre a sua candidatura. Se for selecionado, receberá instruções detalhadas sobre os próximos passos.</p>
        <p style="font-size:15px;color:#444;line-height:1.75;margin:0 0 36px;">Fique atento ao seu email — temos imensas oportunidades para si!</p>
        <p style="font-size:15px;color:#444;margin:0 0 4px;">Estamos ansiosos por trabalhar consigo!</p>
        <p style="font-size:15px;font-weight:700;color:#111;margin:0 0 40px;">Equipa Ai Bora</p>
      </td></tr>
      <tr><td style="padding:0 40px;"><div style="height:1px;background:#eee;"></div></td></tr>`)
  }),

  'resposta-proposta': (data) => ({
    subject: `Resposta à proposta de ${data.clienteNome} — Ai Bora`,
    html: wrap(`
      <tr><td style="padding:48px 40px 16px;">
        <p style="font-size:12px;font-weight:700;color:#ff6f2e;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;">✦ Resposta Recebida ✦</p>
        <h1 style="font-size:26px;font-weight:700;color:#111;margin:0 0 20px;">Resposta de ${data.clienteNome}</h1>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:40px;"><tr><td style="background:#fafafa;border-left:3px solid #ff6f2e;border-radius:0 8px 8px 0;padding:18px 22px;">
          <p style="font-size:14px;color:#111;margin:0 0 8px;"><strong>Resposta:</strong> ${data.resposta}</p>
          ${data.comentarios ? `<p style="font-size:14px;color:#444;margin:0;"><strong>Comentários:</strong> ${data.comentarios}</p>` : ''}
        </td></tr></table>
        <p style="font-size:15px;color:#444;margin:0 0 4px;">Com os melhores cumprimentos,</p>
        <p style="font-size:15px;font-weight:700;color:#111;margin:0 0 40px;">Equipa Ai Bora 💞</p>
      </td></tr>
      <tr><td style="padding:0 40px;"><div style="height:1px;background:#eee;"></div></td></tr>`)
  }),

  'proposta-rejeitada': (data) => ({
    subject: `Obrigado pelo seu tempo — Ai Bora`,
    html: wrap(`
      <tr><td style="padding:48px 40px 16px;">
        <p style="font-size:12px;font-weight:700;color:#ff6f2e;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;">✦ Até breve ✦</p>
        <h1 style="font-size:26px;font-weight:700;color:#111;margin:0 0 20px;line-height:1.25;">Olá, ${data.clienteNome} 👋</h1>
        <p style="font-size:15px;color:#444;line-height:1.75;margin:0 0 36px;">Obrigado pelo seu tempo e pela confiança depositada em nós. Ficamos à sua disposição para qualquer questão futura — será sempre bem-vindo/a.</p>
        <p style="font-size:15px;color:#444;margin:0 0 4px;">Com os melhores cumprimentos,</p>
        <p style="font-size:15px;font-weight:700;color:#111;margin:0 0 40px;">Equipa Ai Bora 💞</p>
      </td></tr>
      <tr><td style="padding:0 40px;"><div style="height:1px;background:#eee;"></div></td></tr>`)
  }),

  'boas-vindas-cliente': (data) => ({
    subject: `Bem-vindo/a à Ai Bora, ${data.clienteNome}! 🎉`,
    html: wrap(`
      <tr><td style="padding:48px 40px 16px;">
        <p style="font-size:12px;font-weight:700;color:#ff6f2e;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;">✦ Bem-vindo/a ✦</p>
        <h1 style="font-size:26px;font-weight:700;color:#111;margin:0 0 20px;line-height:1.25;">Olá, ${data.clienteNome} 🎉</h1>
        <p style="font-size:15px;color:#444;line-height:1.75;margin:0 0 36px;">É oficial — já é cliente ativo Ai Bora! Pode aceder à sua ficha pessoal a qualquer momento pelo link abaixo.</p>
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:0 0 36px;">
          <a href="${data.linkFicha}" style="display:inline-block;padding:16px 52px;background:#ff6f2e;color:#fff;text-decoration:none;font-size:15px;font-weight:700;border-radius:8px;">Ver a minha ficha →</a>
        </td></tr></table>
        <p style="font-size:15px;color:#444;margin:0 0 4px;">Com os melhores cumprimentos,</p>
        <p style="font-size:15px;font-weight:700;color:#111;margin:0 0 40px;">Equipa Ai Bora 💞</p>
      </td></tr>
      <tr><td style="padding:0 40px;"><div style="height:1px;background:#eee;"></div></td></tr>`)
  }),

  'nova-oferta-colaboradores': (data) => ({
    subject: `✦ Novas tarefas disponíveis — Ai Bora`,
    html: wrap(`
      <tr><td style="padding:48px 40px 16px;">
        <p style="font-size:12px;font-weight:700;color:#ff6f2e;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;">✦ Nova Oportunidade ✦</p>
        <h1 style="font-size:26px;font-weight:700;color:#111;margin:0 0 20px;line-height:1.25;">Olá, ${data.colaboradorNome} 👋</h1>
        <p style="font-size:15px;color:#444;line-height:1.75;margin:0 0 36px;">Há novas tarefas disponíveis no painel. Entre agora e solicite as que mais lhe interessam antes que sejam atribuídas.</p>
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:0 0 36px;">
          <a href="${data.linkPainel}" style="display:inline-block;padding:16px 52px;background:#ff6f2e;color:#fff;text-decoration:none;font-size:15px;font-weight:700;border-radius:8px;">Ver tarefas disponíveis →</a>
        </td></tr></table>
        <p style="font-size:15px;color:#444;margin:0 0 4px;">Com os melhores cumprimentos,</p>
        <p style="font-size:15px;font-weight:700;color:#111;margin:0 0 40px;">Equipa Ai Bora 💞</p>
      </td></tr>
      <tr><td style="padding:0 40px;"><div style="height:1px;background:#eee;"></div></td></tr>`)
  }),

  'tarefa-atribuida': (data) => ({
    subject: `Nova tarefa atribuída: ${data.nomeTarefa} — Ai Bora`,
    html: wrap(`
      <tr><td style="padding:48px 40px 16px;">
        <p style="font-size:12px;font-weight:700;color:#ff6f2e;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;">✦ Tarefa Atribuída ✦</p>
        <h1 style="font-size:26px;font-weight:700;color:#111;margin:0 0 20px;line-height:1.25;">Olá, ${data.colaboradorNome} 👋</h1>
        <p style="font-size:15px;color:#444;line-height:1.75;margin:0 0 16px;">Foi-lhe atribuída uma nova tarefa. Aceda ao painel para ver todos os detalhes e dar início ao trabalho.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:36px;"><tr><td style="background:#fafafa;border-left:3px solid #ff6f2e;border-radius:0 8px 8px 0;padding:18px 22px;">
          <p style="font-size:12px;color:#999;margin:0 0 8px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Detalhes</p>
          <p style="font-size:14px;color:#111;margin:0 0 4px;"><strong>Tarefa:</strong> ${data.nomeTarefa}</p>
          <p style="font-size:14px;color:#111;margin:0;"><strong>Cliente:</strong> ${data.nomeCliente}</p>
        </td></tr></table>
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:0 0 36px;">
          <a href="${data.linkPainel}" style="display:inline-block;padding:16px 52px;background:#ff6f2e;color:#fff;text-decoration:none;font-size:15px;font-weight:700;border-radius:8px;">Ver a minha tarefa →</a>
        </td></tr></table>
        <p style="font-size:15px;color:#444;margin:0 0 4px;">Com os melhores cumprimentos,</p>
        <p style="font-size:15px;font-weight:700;color:#111;margin:0 0 40px;">Equipa Ai Bora 💞</p>
      </td></tr>
      <tr><td style="padding:0 40px;"><div style="height:1px;background:#eee;"></div></td></tr>`)
  }),

  'entrega-aprovada': (data) => ({
    subject: `A sua entrega está pronta para rever — Ai Bora`,
    html: wrap(`
      <tr><td style="padding:48px 40px 16px;">
        <p style="font-size:12px;font-weight:700;color:#ff6f2e;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;">✦ Entrega Pronta ✦</p>
        <h1 style="font-size:26px;font-weight:700;color:#111;margin:0 0 20px;line-height:1.25;">Olá, ${data.clienteNome} 👋</h1>
        <p style="font-size:15px;color:#444;line-height:1.75;margin:0 0 36px;">A sua entrega está pronta! Pode rever o trabalho e dar a aprovação diretamente pelo link abaixo.</p>
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:0 0 36px;">
          <a href="${data.linkEntrega}" style="display:inline-block;padding:16px 52px;background:#ff6f2e;color:#fff;text-decoration:none;font-size:15px;font-weight:700;border-radius:8px;">Ver e aprovar entrega →</a>
        </td></tr></table>
        <p style="font-size:15px;color:#444;margin:0 0 4px;">Com os melhores cumprimentos,</p>
        <p style="font-size:15px;font-weight:700;color:#111;margin:0 0 40px;">Equipa Ai Bora 💞</p>
      </td></tr>
      <tr><td style="padding:0 40px;"><div style="height:1px;background:#eee;"></div></td></tr>`)
  }),

  'fatura': (data) => ({
    subject: `A sua fatura Ai Bora — ${data.valor}€`,
    html: wrap(`
      <tr><td style="padding:48px 40px 16px;">
        <p style="font-size:12px;font-weight:700;color:#ff6f2e;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;">✦ Fatura Disponível ✦</p>
        <h1 style="font-size:26px;font-weight:700;color:#111;margin:0 0 20px;line-height:1.25;">Olá, ${data.clienteNome} 👋</h1>
        <p style="font-size:15px;color:#444;line-height:1.75;margin:0 0 16px;">Segue a sua fatura pelos serviços contratados. Pode efetuar o pagamento pelo link abaixo.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:36px;"><tr><td style="background:#fafafa;border-left:3px solid #ff6f2e;border-radius:0 8px 8px 0;padding:18px 22px;">
          <p style="font-size:12px;color:#999;margin:0 0 8px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Resumo</p>
          <p style="font-size:14px;color:#111;margin:0 0 4px;"><strong>Valor:</strong> ${data.valor}€</p>
          <p style="font-size:14px;color:#111;margin:0;"><strong>Vencimento:</strong> ${data.vencimento}</p>
        </td></tr></table>
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:0 0 36px;">
          <a href="${data.linkFatura}" style="display:inline-block;padding:16px 52px;background:#ff6f2e;color:#fff;text-decoration:none;font-size:15px;font-weight:700;border-radius:8px;">Pagar agora →</a>
        </td></tr></table>
        <p style="font-size:15px;color:#444;margin:0 0 4px;">Com os melhores cumprimentos,</p>
        <p style="font-size:15px;font-weight:700;color:#111;margin:0 0 40px;">Equipa Ai Bora 💞</p>
      </td></tr>
      <tr><td style="padding:0 40px;"><div style="height:1px;background:#eee;"></div></td></tr>`)
  }),

  'liquidacao-executor': (data) => ({
    subject: `A sua comissão está pronta — Ai Bora`,
    html: wrap(`
      <tr><td style="padding:48px 40px 16px;">
        <p style="font-size:12px;font-weight:700;color:#ff6f2e;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;">✦ Comissão Pronta ✦</p>
        <h1 style="font-size:26px;font-weight:700;color:#111;margin:0 0 20px;line-height:1.25;">Olá, ${data.colaboradorNome} 👋</h1>
        <p style="font-size:15px;color:#444;line-height:1.75;margin:0 0 16px;">A sua comissão pelo trabalho realizado está pronta. Segue o detalhe.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:40px;"><tr><td style="background:#fafafa;border-left:3px solid #ff6f2e;border-radius:0 8px 8px 0;padding:18px 22px;">
          <p style="font-size:12px;color:#999;margin:0 0 8px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Detalhe</p>
          <p style="font-size:14px;color:#111;margin:0 0 4px;"><strong>Tarefa:</strong> ${data.nomeTarefa}</p>
          <p style="font-size:14px;color:#111;margin:0 0 4px;"><strong>Comissão:</strong> ${data.valor}€</p>
          <p style="font-size:14px;color:#111;margin:0;"><strong>Data:</strong> ${data.data}</p>
        </td></tr></table>
        <p style="font-size:15px;color:#444;margin:0 0 4px;">Com os melhores cumprimentos,</p>
        <p style="font-size:15px;font-weight:700;color:#111;margin:0 0 40px;">Equipa Ai Bora 💞</p>
      </td></tr>
      <tr><td style="padding:0 40px;"><div style="height:1px;background:#eee;"></div></td></tr>`)
  }),

  'liquidacao-captador': (data) => ({
    subject: `A sua comissão de captação está pronta — Ai Bora`,
    html: wrap(`
      <tr><td style="padding:48px 40px 16px;">
        <p style="font-size:12px;font-weight:700;color:#ff6f2e;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;">✦ Comissão de Captação ✦</p>
        <h1 style="font-size:26px;font-weight:700;color:#111;margin:0 0 20px;line-height:1.25;">Olá, ${data.colaboradorNome} 👋</h1>
        <p style="font-size:15px;color:#444;line-height:1.75;margin:0 0 16px;">A sua comissão pela captação do cliente está pronta. Segue o detalhe.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:40px;"><tr><td style="background:#fafafa;border-left:3px solid #ff6f2e;border-radius:0 8px 8px 0;padding:18px 22px;">
          <p style="font-size:12px;color:#999;margin:0 0 8px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Detalhe</p>
          <p style="font-size:14px;color:#111;margin:0 0 4px;"><strong>Cliente captado:</strong> ${data.nomeCliente}</p>
          <p style="font-size:14px;color:#111;margin:0 0 4px;"><strong>Comissão:</strong> ${data.valor}€</p>
          <p style="font-size:14px;color:#111;margin:0;"><strong>Data:</strong> ${data.data}</p>
        </td></tr></table>
        <p style="font-size:15px;color:#444;margin:0 0 4px;">Com os melhores cumprimentos,</p>
        <p style="font-size:15px;font-weight:700;color:#111;margin:0 0 40px;">Equipa Ai Bora 💞</p>
      </td></tr>
      <tr><td style="padding:0 40px;"><div style="height:1px;background:#eee;"></div></td></tr>`)
  }),

  'pagamento-confirmado': (data) => ({
    subject: `Pagamento confirmado — Obrigado, ${data.clienteNome}!`,
    html: wrap(`
      <tr><td style="padding:48px 40px 16px;">
        <p style="font-size:12px;font-weight:700;color:#ff6f2e;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;">✦ Pagamento Confirmado ✦</p>
        <h1 style="font-size:26px;font-weight:700;color:#111;margin:0 0 20px;line-height:1.25;">Obrigado, ${data.clienteNome}! 🙏</h1>
        <p style="font-size:15px;color:#444;line-height:1.75;margin:0 0 36px;">Recebemos o seu pagamento com sucesso. Pode consultar todos os detalhes na sua ficha pessoal.</p>
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:0 0 36px;">
          <a href="${data.linkFicha}" style="display:inline-block;padding:16px 52px;background:#ff6f2e;color:#fff;text-decoration:none;font-size:15px;font-weight:700;border-radius:8px;">Ver a minha ficha →</a>
        </td></tr></table>
        <p style="font-size:15px;color:#444;margin:0 0 4px;">Com os melhores cumprimentos,</p>
        <p style="font-size:15px;font-weight:700;color:#111;margin:0 0 40px;">Equipa Ai Bora 💞</p>
      </td></tr>
      <tr><td style="padding:0 40px;"><div style="height:1px;background:#eee;"></div></td></tr>`)
  }),

  'comissao-enviada-executor': (data) => ({
    subject: `A sua comissão foi enviada — Ai Bora`,
    html: wrap(`
      <tr><td style="padding:48px 40px 16px;">
        <p style="font-size:12px;font-weight:700;color:#ff6f2e;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;">✦ Comissão Enviada ✦</p>
        <h1 style="font-size:26px;font-weight:700;color:#111;margin:0 0 20px;line-height:1.25;">Olá, ${data.colaboradorNome} 👋</h1>
        <p style="font-size:15px;color:#444;line-height:1.75;margin:0 0 16px;">A sua comissão foi processada e enviada com sucesso.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:40px;"><tr><td style="background:#fafafa;border-left:3px solid #ff6f2e;border-radius:0 8px 8px 0;padding:18px 22px;">
          <p style="font-size:12px;color:#999;margin:0 0 8px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Detalhe</p>
          <p style="font-size:14px;color:#111;margin:0 0 4px;"><strong>Tarefa:</strong> ${data.nomeTarefa}</p>
          <p style="font-size:14px;color:#111;margin:0 0 4px;"><strong>Valor enviado:</strong> ${data.valor}€</p>
          <p style="font-size:14px;color:#111;margin:0;"><strong>Data:</strong> ${data.data}</p>
        </td></tr></table>
        <p style="font-size:15px;color:#444;margin:0 0 4px;">Com os melhores cumprimentos,</p>
        <p style="font-size:15px;font-weight:700;color:#111;margin:0 0 40px;">Equipa Ai Bora 💞</p>
      </td></tr>
      <tr><td style="padding:0 40px;"><div style="height:1px;background:#eee;"></div></td></tr>`)
  }),

  'comissao-enviada-captador': (data) => ({
    subject: `A sua comissão de venda foi enviada — Ai Bora`,
    html: wrap(`
      <tr><td style="padding:48px 40px 16px;">
        <p style="font-size:12px;font-weight:700;color:#ff6f2e;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;">✦ Comissão de Venda Enviada ✦</p>
        <h1 style="font-size:26px;font-weight:700;color:#111;margin:0 0 20px;line-height:1.25;">Olá, ${data.colaboradorNome} 👋</h1>
        <p style="font-size:15px;color:#444;line-height:1.75;margin:0 0 16px;">A sua comissão por captação de cliente foi processada e enviada com sucesso.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:40px;"><tr><td style="background:#fafafa;border-left:3px solid #ff6f2e;border-radius:0 8px 8px 0;padding:18px 22px;">
          <p style="font-size:12px;color:#999;margin:0 0 8px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Detalhe</p>
          <p style="font-size:14px;color:#111;margin:0 0 4px;"><strong>Cliente captado:</strong> ${data.nomeCliente}</p>
          <p style="font-size:14px;color:#111;margin:0 0 4px;"><strong>Valor enviado:</strong> ${data.valor}€</p>
          <p style="font-size:14px;color:#111;margin:0;"><strong>Data:</strong> ${data.data}</p>
        </td></tr></table>
        <p style="font-size:15px;color:#444;margin:0 0 4px;">Com os melhores cumprimentos,</p>
        <p style="font-size:15px;font-weight:700;color:#111;margin:0 0 40px;">Equipa Ai Bora 💞</p>
      </td></tr>
      <tr><td style="padding:0 40px;"><div style="height:1px;background:#eee;"></div></td></tr>`)
  }),

  'novo-colaborador-admin': (data) => ({
    subject: `Novo colaborador registado — ${data.vendedorNome}`,
    html: wrap(`
      <tr><td style="padding:48px 40px 16px;">
        <p style="font-size:12px;font-weight:700;color:#ff6f2e;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;">✦ Novo Colaborador ✦</p>
        <h1 style="font-size:26px;font-weight:700;color:#111;margin:0 0 20px;">Novo colaborador registado</h1>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:40px;"><tr><td style="background:#fafafa;border-left:3px solid #ff6f2e;border-radius:0 8px 8px 0;padding:18px 22px;">
          <p style="font-size:14px;color:#111;margin:0 0 4px;"><strong>Nome:</strong> ${data.vendedorNome}</p>
          <p style="font-size:14px;color:#111;margin:0 0 4px;"><strong>Email:</strong> ${data.vendedorEmail}</p>
          <p style="font-size:14px;color:#111;margin:0;"><strong>Data:</strong> ${data.dataRegistro}</p>
        </td></tr></table>
        <p style="font-size:15px;color:#444;margin:0 0 40px;">Aceda ao painel admin para aprovar este colaborador.</p>
      </td></tr>
      <tr><td style="padding:0 40px;"><div style="height:1px;background:#eee;"></div></td></tr>`)
  }),

  'acesso-colaborador': (data) => ({
    subject: `O seu acesso à Ai Bora está pronto`,
    html: wrap(`
      <tr><td style="padding:48px 40px 16px;">
        <p style="font-size:12px;font-weight:700;color:#ff6f2e;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;">✦ Acesso Aprovado ✦</p>
        <h1 style="font-size:26px;font-weight:700;color:#111;margin:0 0 20px;line-height:1.25;">Bem-vindo/a, ${data.vendedorNome}! 🎉</h1>
        <p style="font-size:15px;color:#444;line-height:1.75;margin:0 0 16px;">O seu acesso à plataforma Ai Bora foi aprovado. Use o botão abaixo para entrar.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:36px;"><tr><td style="background:#fafafa;border-left:3px solid #ff6f2e;border-radius:0 8px 8px 0;padding:18px 22px;">
          <p style="font-size:14px;color:#111;margin:0;"><strong>Email:</strong> ${data.email}</p>
        </td></tr></table>
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:0 0 36px;">
          <a href="${data.linkLogin}" style="display:inline-block;padding:16px 52px;background:#ff6f2e;color:#fff;text-decoration:none;font-size:15px;font-weight:700;border-radius:8px;">Entrar na plataforma →</a>
        </td></tr></table>
        <p style="font-size:13px;color:#888;margin:0 0 36px;">Use "Esqueci a password" para criar a sua senha inicial.</p>
        <p style="font-size:15px;color:#444;margin:0 0 4px;">Com os melhores cumprimentos,</p>
        <p style="font-size:15px;font-weight:700;color:#111;margin:0 0 40px;">Equipa Ai Bora 💞</p>
      </td></tr>
      <tr><td style="padding:0 40px;"><div style="height:1px;background:#eee;"></div></td></tr>`)
  }),

  'campanha-marketing': (data) => ({
    subject: data.titulo,
    html: wrap(`
      <tr><td style="padding:48px 40px 16px;">
        <p style="font-size:12px;font-weight:700;color:#ff6f2e;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;">✦ Ai Bora ✦</p>
        <h1 style="font-size:26px;font-weight:700;color:#111;margin:0 0 20px;line-height:1.25;">${data.titulo}</h1>
        ${data.nomeDestinatario ? `<p style="font-size:15px;color:#444;line-height:1.75;margin:0 0 16px;">Olá, ${data.nomeDestinatario}!</p>` : ''}
        <p style="font-size:15px;color:#444;line-height:1.75;margin:0 0 36px;">${data.mensagem}</p>
        ${data.link ? `<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:0 0 36px;"><a href="${data.link}" style="display:inline-block;padding:16px 52px;background:#ff6f2e;color:#fff;text-decoration:none;font-size:15px;font-weight:700;border-radius:8px;">Saber mais →</a></td></tr></table>` : ''}
        <p style="font-size:15px;color:#444;margin:0 0 4px;">Com os melhores cumprimentos,</p>
        <p style="font-size:15px;font-weight:700;color:#111;margin:0 0 40px;">Equipa Ai Bora 💞</p>
      </td></tr>
      <tr><td style="padding:0 40px;"><div style="height:1px;background:#eee;"></div></td></tr>`)
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
      from: 'Ai Bora <geral@aibora.pt>',
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
