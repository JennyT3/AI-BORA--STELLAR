export interface ConfirmationEmailData {
  nome: string;
  email: string;
  servicos: string[];
}

export async function sendConfirmationEmail(data: ConfirmationEmailData) {
  const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    console.warn("Resend API key missing. Não foi possível enviar o email de confirmação.");
    return false;
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <h2 style="color: #1a1a1a;">Olá ${data.nome},</h2>
      <p>Recebemos o seu pedido com sucesso! A nossa equipa irá analisar a sua submissão e entraremos em contacto em menos de <strong>24 horas</strong>.</p>
      
      <p>Os serviços solicitados foram:</p>
      <ul>
        ${data.servicos.map(s => `<li>${s}</li>`).join('')}
      </ul>

      <p>Se tiver alguma questão adicional ou urgência, não hesite em contactar-nos diretamente através do email <a href="mailto:geral@aibora.pt">geral@aibora.pt</a>.</p>
      
      <br />
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
      <p style="font-size: 14px; color: #666;">
        A equipa AIBORA<br />
        <a href="https://aibora.pt" style="color: #666; text-decoration: none;">aibora.pt</a>
      </p>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'AIBORA <geral@aibora.pt>',
        to: [data.email],
        subject: 'Recebemos o seu pedido — AIBORA',
        html: htmlContent
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro ao enviar email via Resend:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro na requisição para a API do Resend:', error);
    return false;
  }
}
