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

export interface PropostaRespostaEmailData {
  nome: string;
  email: string;
  resposta: 'sim' | 'nao' | 'reagendar';
  empresa?: string;
}

export async function sendPropostaRespostaEmail(data: PropostaRespostaEmailData) {
  const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    console.warn("Resend API key missing. Não foi possível enviar o email de resposta.");
    return false;
  }

  let subject = '';
  let htmlContent = '';

  if (data.resposta === 'sim') {
    subject = '🎉 O seu orçamento foi aprovado! — AIBORA';
    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
        <h2 style="color: #10B981;">Parabéns ${data.nome}!</h2>
        <p>Recebemos a confirmação do seu orçamento${data.empresa ? ` para ${data.empresa}` : ''}. Vamos começar a trabalhar!</p>
        
        <p>A nossa equipa irá contactá-lo em <strong>menos de 24 horas</strong> para dar início ao processo.</p>

        <p>Se tiver alguma questão adicional ou urgência, não hesite em contactar-nos diretamente através do email <a href="mailto:geral@aibora.pt">geral@aibora.pt</a> ou pelo WhatsApp.</p>
        
        <br />
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
        <p style="font-size: 14px; color: #666;">
          A equipa AIBORA<br />
          <a href="https://aibora.pt" style="color: #666; text-decoration: none;">aibora.pt</a>
        </p>
      </div>
    `;
  } else if (data.resposta === 'nao') {
    subject = 'Entendemos a sua decisão — AIBORA';
    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
        <h2 style="color: #1a1a1a;">Olá ${data.nome},</h2>
        <p>Recebemos a sua resposta${data.empresa ? ` sobre o orçamento para ${data.empresa}` : ''}. Respeitamos a sua decisão.</p>
        
        <p>Caso mude de ideias no futuro ou precise de mais informações, estamos sempre disponíveis para ajudar.</p>

        <p>Não hesite em contactar-nos através do email <a href="mailto:geral@aibora.pt">geral@aibora.pt</a> se precisar de algo no futuro.</p>
        
        <br />
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
        <p style="font-size: 14px; color: #666;">
          A equipa AIBORA<br />
          <a href="https://aibora.pt" style="color: #666; text-decoration: none;">aibora.pt</a>
        </p>
      </div>
    `;
  } else if (data.resposta === 'reagendar') {
    subject = 'Vamos remarcar a nossa reunião — AIBORA';
    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
        <h2 style="color: #F25C05;">Olá ${data.nome},</h2>
        <p>Entendemos que precisa de remarcar${data.empresa ? ` a reunião sobre o orçamento para ${data.empresa}` : ''}.</p>
        
        <p>A nossa equipa irá contactá-lo em <strong>menos de 24 horas</strong> para combinar uma nova data e hora.</p>

        <p>Se preferir, pode também contactar-nos diretamente através do email <a href="mailto:geral@aibora.pt">geral@aibora.pt</a>.</p>
        
        <br />
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
        <p style="font-size: 14px; color: #666;">
          A equipa AIBORA<br />
          <a href="https://aibora.pt" style="color: #666; text-decoration: none;">aibora.pt</a>
        </p>
      </div>
    `;
  }

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
        subject,
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

export interface PropostaLinkEmailData {
  nome: string;
  email: string;
  link: string;
  empresa?: string;
}

export async function sendPropostaLinkEmail(data: PropostaLinkEmailData) {
  const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;
  if (!RESEND_API_KEY) return false;

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
        subject: 'A sua proposta personalizada — AIBORA',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
            <h2 style="color: #1a1a1a;">Olá ${data.nome},</h2>
            <p>Preparámos uma proposta personalizada${data.empresa ? ` para ${data.empresa}` : ''} especialmente para si.</p>
            <p style="margin: 32px 0;">
              <a href="${data.link}" style="background-color: #F22283; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px;">
                Ver a minha proposta
              </a>
            </p>
            <p style="font-size: 13px; color: #888;">Ou copia este link: <a href="${data.link}" style="color: #F22283;">${data.link}</a></p>
            <p>A proposta é válida por 10 dias. Se tiver alguma questão, contacte-nos em <a href="mailto:geral@aibora.pt">geral@aibora.pt</a>.</p>
            <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
            <p style="font-size: 14px; color: #666;">A equipa AIBORA<br /><a href="https://aibora.pt" style="color: #666;">aibora.pt</a></p>
          </div>
        `
      })
    });
    return response.ok;
  } catch {
    return false;
  }
}
