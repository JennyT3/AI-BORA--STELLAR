import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function generateSecureToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    const q = query(
      collection(db, 'clientes'),
      where('email', '==', email.toLowerCase()),
      where('categoria', '==', 'ativo'),
      where('resposta', '==', 'sim')
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      return res.status(404).json({ error: 'Cliente não encontrado ou não ativo' });
    }

    const cliente = snap.docs[0].data();
    const clienteId = snap.docs[0].id;

    const token = generateSecureToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
    
    const loginDoc = {
      clienteId,
      token,
      email: email.toLowerCase(),
      expiresAt: expiresAt.toISOString(),
      used: false,
      createdAt: serverTimestamp()
    };

    await setDoc(doc(db, 'cliente_logins', token), loginDoc);

    const loginLink = `https://aibora.pt/cliente/login/${token}`;

    const html = `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#e8e8e8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#e8e8e8;padding:32px 16px;">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;">
  <tr><td style="background:#1a1a1a;padding:28px 40px;text-align:center;">
    <img src="https://aibora.pt/logo.png" alt="Ai Bora" height="48" style="display:block;margin:0 auto;" />
  </td></tr>
  <tr><td style="height:4px;background:linear-gradient(90deg,#cb1a74 0%,#fb4a50 50%,#ff6f2e 100%);font-size:0;">&nbsp;</td></tr>
  <tr><td style="padding:48px 40px 16px;">
    <p style="font-size:12px;font-weight:700;color:#ff6f2e;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;">🔐 Acesso à Área do Cliente</p>
    <h1 style="font-size:26px;font-weight:700;color:#111;margin:0 0 20px;line-height:1.25;">Olá, ${cliente.nome} 👋</h1>
    <p style="font-size:15px;color:#444;line-height:1.75;margin:0 0 16px;">Solicitou acesso à sua área de cliente. Clique no botão abaixo para aceder.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:40px;"><tr><td style="background:#fafafa;border-left:3px solid #ff6f2e;border-radius:0 8px 8px 0;padding:18px 22px;">
      <p style="font-size:14px;color:#111;margin:0 0 4px;"><strong>Cliente:</strong> ${cliente.nome}</p>
      <p style="font-size:14px;color:#111;margin:0;"><strong>Email:</strong> ${email}</p>
    </td></tr></table>
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:0 0 36px;">
      <a href="${loginLink}" style="display:inline-block;padding:16px 52px;background:#ff6f2e;color:#fff;text-decoration:none;font-size:15px;font-weight:700;border-radius:8px;">Aceder à minha área →</a>
    </td></tr></table>
    <p style="font-size:13px;color:#888;margin:0 0 36px;">⚠️ Este link é válido por 24 horas. Se não pediu este acesso, ignore este email.</p>
    <p style="font-size:15px;color:#444;margin:0 0 4px;">Com os melhores cumprimentos,</p>
    <p style="font-size:15px;font-weight:700;color:#111;margin:0 0 40px;">Equipa Ai Bora 💞</p>
  </td></tr>
  </table></td></tr></table>
</body>
</html>`;

    const { data, error } = await resend.emails.send({
      from: 'Ai Bora <geral@aibora.pt>',
      to: [email],
      subject: `Acesso à sua área de cliente - Ai Bora`,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Magic link enviado para o email' 
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}