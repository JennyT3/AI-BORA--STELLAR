const API_URL = import.meta.env.VITE_API_URL || '/api/send-email';

export async function sendEmail(to: string, templateId: string, templateData: any) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        templateId,
        templateData,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send email');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Función específica: Confirmación de orçamento
export async function sendConfirmationEmail(clienteEmail: string, clienteNome: string, orcamentoId: string, tipoProjeto: string) {
  return sendEmail(clienteEmail, 'confirmacao-orcamento', {
    clienteNome,
    solicitacaoId: orcamentoId,
    data: new Date().toLocaleDateString('pt-PT'),
    tipoProjeto: tipoProjeto || 'Projeto',
  });
}

// Función específica: Notificar admin de nuevo colaborador
export async function notificarNovoColaboradorAdmin(vendedorData: { vendedorNome: string; vendedorEmail: string; dataRegistro: string }) {
  return sendEmail('geral@aibora.pt', 'novo-colaborador-admin', vendedorData);
}

// Función específica: Enviar acceso a colaborador
export async function enviarAcessoColaborador(vendedorData: { vendedorNome: string; email: string; linkLogin: string }) {
  return sendEmail(vendedorData.email, 'acesso-colaborador', vendedorData);
}

// Función específica: Enviar link de propuesta
export async function sendPropostaLinkEmail(clienteEmail: string, clienteNome: string, linkProposta: string, validade: string) {
  return sendEmail(clienteEmail, 'link-proposta', {
    clienteNome,
    linkProposta,
    validade,
  });
}

// Función específica: Notificar respuesta de propuesta
export async function sendPropostaRespostaEmail(adminEmail: string, clienteNome: string, resposta: string, comentarios?: string) {
  return sendEmail(adminEmail, 'resposta-proposta', {
    clienteNome,
    resposta,
    comentarios: comentarios || '',
  });
}

// Función específica: Aprobar entrega
export async function sendDeliveryApprovalEmail(clienteEmail: string, clienteNome: string, projetoNome: string, dataEntrega: string) {
  return sendEmail(clienteEmail, 'entrega-aprovada', {
    clienteNome,
    projetoNome,
    dataEntrega,
  });
}

// Función específica: Enviar fatura
export async function sendFaturaEmail(clienteEmail: string, clienteNome: string, valor: string, linkFatura: string, vencimento: string) {
  return sendEmail(clienteEmail, 'fatura', {
    clienteNome,
    valor,
    linkFatura,
    vencimento,
  });
}

// Función eliminada por seguridad - ya no se usa
// export async function sendVendedorAccessEmail(...) - ELIMINADA
