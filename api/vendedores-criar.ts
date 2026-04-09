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

function generateSecurePassword(length: number = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { nome, email, telefone, tipo, especialidade, solicitacaoId } = req.body;

    if (!nome || !email || !tipo) {
      return res.status(400).json({ error: 'Nome, email e tipo são obrigatórios' });
    }

    const isColaborador = tipo === 'colaborador';
    const passwordTemporaria = generateSecurePassword(12);

    let clerkUserId = null;
    
    if (process.env.CLERK_SECRET_KEY) {
      try {
        const clerkResponse = await fetch('https://api.clerk.com/v1/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`
          },
          body: JSON.stringify({
            email_addresses: [{ email }],
            first_name: nome.split(' ')[0],
            last_name: nome.split(' ').slice(1).join(' ') || '',
            password: passwordTemporaria,
            public_metadata: {
              tipo,
              ...(especialidade && { especialidade })
            }
          })
        });

        if (clerkResponse.ok) {
          const clerkData = await clerkResponse.json();
          clerkUserId = clerkData.id;
        } else {
          console.error('Clerk error:', await clerkResponse.text());
        }
      } catch (clerkError) {
        console.error('Clerk creation error:', clerkError);
      }
    }

    const linkLogin = isColaborador 
      ? 'https://aibora.pt/vendas' 
      : 'https://aibora.pt/vendas';
    
    const manualLink = isColaborador
      ? 'https://aibora.pt/manual-colaborador.pdf'
      : 'https://aibora.pt/manual-vendedor.pdf';
    
    const academiaLink = 'https://aibora.pt/academia';
    const catalogoLink = 'https://aibora.pt/catalogo-servicos';

    const html = wrap(`
      <tr><td style="padding:48px 40px 16px;">
        <p style="font-size:12px;font-weight:700;color:#ff6f2e;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;">🎉 Bem-vindo/a à Ai Bora!</p>
        <h1 style="font-size:26px;font-weight:700;color:#111;margin:0 0 20px;line-height:1.25;">Olá, ${nome}! 🎉</h1>
        <p style="font-size:15px;color:#444;line-height:1.75;margin:0 0 16px;">A sua conta foi criada com sucesso. Você agora faz parte da rede Ai Bora como <strong>${isColaborador ? 'Colaborador' : 'Vendedor'}</strong>.</p>
        
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;"><tr><td style="background:#fafafa;border-left:3px solid #ff6f2e;border-radius:0 8px 8px 0;padding:18px 22px;">
          <p style="font-size:14px;color:#111;margin:0 0 8px;"><strong>Email:</strong> ${email}</p>
          <p style="font-size:14px;color:#111;margin:0;"><strong>Password temporária:</strong> ${passwordTemporaria}</p>
        </td></tr></table>

        <p style="font-size:13px;color:#888;margin:0 0 36px;">⚠️ Altere a sua password no primeiro acesso.</p>

        <h2 style="font-size:18px;font-weight:700;color:#111;margin:0 0 16px;">Os seus próximos passos:</h2>
        
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:36px;">
          <tr><td style="padding:12px;background:#f8f7f4;border-radius:8px;margin-bottom:8px;">
            <strong style="color:#111;">1. Aceda à plataforma</strong><br/>
            <span style="color:#666;font-size:13px;">Faça login para aceder ao seu painel</span><br/>
            <a href="${linkLogin}" style="color:#ff6f2e;font-size:13px;">${linkLogin}</a>
          </td></tr>
          <tr><td style="padding:12px;background:#f8f7f4;border-radius:8px;margin-bottom:8px;">
            <strong style="color:#111;">2. ${isColaborador ? 'Manual do Colaborador' : 'Manual do Vendedor'}</strong><br/>
            <span style="color:#666;font-size:13px;">Conheça os processos e procedimentos</span><br/>
            <a href="${manualLink}" style="color:#ff6f2e;font-size:13px;">Ver manual</a>
          </td></tr>
          <tr><td style="padding:12px;background:#f8f7f4;border-radius:8px;margin-bottom:8px;">
            <strong style="color:#111;">3. AI BORA Academy</strong><br/>
            <span style="color:#666;font-size:13px;">Cursos de vendas, ferramentas e metodologias</span><br/>
            <a href="${academiaLink}" style="color:#ff6f2e;font-size:13px;">Aceder à Academia</a>
          </td></tr>
          <tr><td style="padding:12px;background:#f8f7f4;border-radius:8px;">
            <strong style="color:#111;">4. Catálogo de Serviços</strong><br/>
            <span style="color:#666;font-size:13px;">Preços base, comissões e tempos de entrega</span><br/>
            <a href="${catalogoLink}" style="color:#ff6f2e;font-size:13px;">Ver catálogo</a>
          </td></tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:0 0 36px;">
          <a href="${linkLogin}" style="display:inline-block;padding:16px 52px;background:#ff6f2e;color:#fff;text-decoration:none;font-size:15px;font-weight:700;border-radius:8px;">Entrar na plataforma →</a>
        </td></tr></table>

        <p style="font-size:15px;color:#444;margin:0 0 4px;">Estamos ansiosos por trabalhar consigo!</p>
        <p style="font-size:15px;font-weight:700;color:#111;margin:0 0 40px;">Equipa Ai Bora 💞</p>
      </td></tr>
      <tr><td style="padding:0 40px;"><div style="height:1px;background:#eee;"></div></td></tr>`);

    const { data, error } = await resend.emails.send({
      from: 'Ai Bora <geral@aibora.pt>',
      to: [email],
      subject: `Bem-vindo/a à Ai Bora, ${nome}! 🎉`,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send welcome email' });
    }

    return res.status(200).json({ 
      success: true, 
      emailId: data?.id,
      clerkUserId,
      message: 'Vendedor criado e email de bem-vindo enviado'
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}