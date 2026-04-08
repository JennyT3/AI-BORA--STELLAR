import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FOOTER = `
  <tr><td style="background:#000000;padding:32px 40px 28px;">
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
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    <tr><td align="center">
      <table cellpadding="0" cellspacing="0"><tr>
        <td style="padding:0 6px;"><a href="https://www.instagram.com/aibora.pt/" style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:8px;background:#E1306C;text-decoration:none;font-size:18px;color:#fff;">&#x1F4F7;</a></td>
        <td style="padding:0 6px;"><a href="https://www.linkedin.com/company/aibora-pt" style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:8px;background:#0A66C2;text-decoration:none;font-size:15px;color:#fff;font-weight:700;">in</a></td>
        <td style="padding:0 6px;"><a href="https://x.com/boraweb3" style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:8px;background:#000;border:1px solid #444;text-decoration:none;font-size:15px;color:#fff;font-weight:700;">𝕏</a></td>
        <td style="padding:0 6px;"><a href="https://www.facebook.com/aibora.ptt/" style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:8px;background:#1877F2;text-decoration:none;font-size:18px;color:#fff;">f</a></td>
        <td style="padding:0 6px;"><a href="https://www.youtube.com/@AiBora_pt" style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:8px;background:#FF0000;text-decoration:none;font-size:15px;color:#fff;font-weight:700;">▶</a></td>
      </tr></table>
    </td></tr></table>
    <p style="font-size:12px;color:#666666;text-align:center;margin:0 0 4px;">
      <a href="https://aibora.pt" style="color:#ff6f2e;text-decoration:none;">aibora.pt</a>
      &nbsp;·&nbsp;
      <a href="mailto:geral@aibora.pt" style="color:#ff6f2e;text-decoration:none;">geral@aibora.pt</a>
      &nbsp;·&nbsp;
      <a href="tel:+351936021747" style="color:#aaaaaa;text-decoration:none;">+351 936 021 747</a>
    </p>
    <p style="font-size:11px;color:#444444;text-align:center;margin:16px 0 0;">© 2026 Ai Bora. Todos os direitos reservados.</p>
  </td></tr>`;

const HEADER = `<!DOCTYPE html><html lang="pt"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#e8e8e8;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#e8e8e8;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;">
<tr><td style="background:#000000;padding:32px 40px;text-align:center;">
  <img src="https://aibora.pt/logo.png" alt="Ai Bora" height="56" style="display:block;margin:0 auto;" />
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
    subject: `Recebemos o seu pedido — Ai Bora`,
    html: wrap(`
      <tr><td style="padding:48px 40px 16px;">
        <p style="font-size:12px;font-weight:700;color:#ff6f2e;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;">✦ Pedido Recebido ✦</p>
        <h1 style="font-size:26px;font-weight:700;color:#111;margin:0 0 20px;line-height:1.25;">Olá, ${data.clienteNome} 👋</h1>
        <p style="font-size:15px;color:#444;line-height:1.75;margin:0 0 16px;">Recebemos o seu pedido com sucesso! A nossa equipa vai analisá-lo e entrará em contacto consigo nos próximos <strong>2 dias úteis</strong>.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:40px;"><tr><td style="background:#fafafa;border-left:3px solid #ff6f2e;border-radius:0 8px 8px 0;padding:18px 22px;">
          <p style="font-size:12px;color:#999;margin:0 0 8px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Detalhes do pedido</p>
          <p style="font-size:14px;color:#111;margin:0 0 4px;"><strong>ID:</strong> ${data.solicitacaoId}</p>
          <p style="font-size:14px;color:#111;margin:0 0 4px;"><strong>Data:</strong> ${data.data}</p>
          <p style="font-size:14px;color:#111;margin:0;"><strong>Tipo:</strong> ${data.tipoProjeto}</p>
        </td></tr></table>
        <p style="font-size:15px;color:#444;margin:0 0 4px;">Com os melhores cumprimentos,</p>
        <p style="font-size:15px;font-weight:700;color:#111;margin:0 0 40px;">Equipa Ai Bora 💞</p>
      </td></tr>
      <tr><td style="padding:0 40px;"><div style="height:1px;background:#eee;"></div></td></tr>`)
  }),

  'confirmacao-mensagem': (data) => ({
    subject: `Recebemos a sua mensagem — Ai Bora`,
    html: wrap(`
      <tr><td style="padding:48px 40px 16px;">
        <p style="font-size:12px;font-weight:700;color:#ff6f2e;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;">✦ Mensagem Recebida ✦</p>
        <h1 style="font-size:26px;font-weight:700;color:#111;margin:0 0 20px;line-height:1.25;">Olá, ${data.clienteNome} 👋</h1>
        <p style="font-size:15px;color:#444;line-height:1.75;margin:0 0 36px;">Recebemos a sua mensagem com sucesso. Em breve entraremos em contacto consigo.</p>
        <p style="font-size:15px;color:#444;margin:0 0 4px;">Com os melhores cumprimentos,</p>
        <p style="font-size:15px;font-weight:700;color:#111;margin:0 0 40px;">Equipa Ai Bora 💞</p>
      </td></tr>
      <tr><td style="padding:0 40px;"><div style="height:1px;background:#eee;"></div></td></tr>`)
  }),

  'confirmacao-colaborador': (data) => ({
    subject: `Recebemos a sua candidatura — Ai Bora`,
    html: wrap(`
      <tr><td style="padding:48px 40px 16px;">
        <p style="font-size:12px;font-weight:700;color:#ff6f2e;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;">✦ Candidatura Recebida ✦</p>
        <h1 style="font-size:26px;font-weight:700;color:#111;margin:0 0 20px;line-height:1.25;">Olá, ${data.clienteNome} 👋</h1>
        <p style="font-size:15px;color:#444;line-height:1.75;margin:0 0 36px;">Recebemos a sua candidatura para fazer parte da equipa Ai Bora. Analisaremos o seu perfil e entraremos em contacto brevemente.</p>
        <p style="font-size:15px;color:#444;margin:0 0 4px;">Com os melhores cumprimentos,</p>
        <p style="font-size:15px;font-weight:700;color:#111;margin:0 0 40px;">Equipa Ai Bora 💞</p>
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
