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

// Función específica: Confirmación de mensaje del home
export async function sendMensagemConfirmacao(email: string, nome: string) {
  return sendEmail(email, 'confirmacao-mensagem', {
    clienteNome: nome,
  });
}

// Función específica: Confirmación de orçamento/solicitud
export async function sendOrcamentoConfirmacao(email: string, nome: string, servicos?: string[]) {
  return sendEmail(email, 'confirmacao-orcamento', {
    clienteNome: nome,
    solicitacaoId: Math.random().toString(36).substring(2, 10).toUpperCase(),
    data: new Date().toLocaleDateString('pt-PT'),
    tipoProjeto: servicos?.join(', ') || 'Projeto',
  });
}

// Función específica: Confirmación de colaborador
export async function sendColaboradorConfirmacao(email: string, nome: string) {
  return sendEmail(email, 'confirmacao-colaborador', {
    clienteNome: nome,
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

// Función específica: Notificar respuesta de propuesta (al admin + confirmación al cliente)
export async function sendPropostaRespostaEmail(params: {
  nome: string;
  email: string;
  resposta: string;
  empresa?: string;
  fichaUrl?: string;
}) {
  // Email al admin
  sendEmail('geral@aibora.pt', 'resposta-proposta', {
    clienteNome: params.nome,
    clienteEmail: params.email,
    empresa: params.empresa || '',
    resposta: params.resposta,
  }).catch(() => {});

  // Email de confirmação ao cliente
  return sendEmail(params.email, 'confirmacao-resposta-proposta', {
    clienteNome: params.nome,
    resposta: params.resposta,
    fichaUrl: params.fichaUrl || '',
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

// Função específica: Campanha de marketing
export async function sendMarketingCampaignEmail(destinatarioEmail: string, titulo: string, mensagem: string, link?: string, nomeDestinatario?: string) {
  return sendEmail(destinatarioEmail, 'campanha-marketing', {
    titulo,
    mensagem,
    link,
    nomeDestinatario,
  });
}
