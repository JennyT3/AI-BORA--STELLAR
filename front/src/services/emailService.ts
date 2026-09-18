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

// Home contact form confirmation
export async function sendMensagemConfirmation(email: string, name: string) {
  return sendEmail(email, 'message-confirmation', {
    clientName: name,
  });
}

// Quote / request confirmation
export async function sendQuoteConfirmation(email: string, name: string, services?: string[]) {
  return sendEmail(email, 'quote-confirmation', {
    clientName: name,
    requestId: Math.random().toString(36).substring(2, 10).toUpperCase(),
    data: new Date().toLocaleDateString('en-GB'),
    projectType: services?.join(', ') || 'Project',
  });
}

// Collaborator application confirmation
export async function sendCollaboratorConfirmation(email: string, name: string) {
  return sendEmail(email, 'collaborator-confirmation', {
    clientName: name,
  });
}

// Notify admin of new collaborator
export async function notifyNewCollaboratorAdmin(salesRepData: { salesRepName: string; salesRepEmail: string; registrationDate: string }) {
  return sendEmail('geral@aibora.pt', 'new-collaborator-admin', salesRepData);
}

// Send collaborator access email
export async function sendCollaboratorAccess(salesRepData: { salesRepName: string; email: string; loginLink: string }) {
  return sendEmail(salesRepData.email, 'collaborator-access', salesRepData);
}

// Send proposal link email
export async function sendProposalLinkEmail(clientEmail: string, clientName: string, proposalLink: string, expiryDate: string) {
  return sendEmail(clientEmail, 'proposal-link', {
    clientName,
    proposalLink,
    expiryDate,
  });
}

// Proposal response: notify admin + confirmation to client
export async function sendProposalResponseEmail(params: {
  name: string;
  email: string;
  response: string;
  company?: string;
  recordUrl?: string;
}) {
  // Email to admin
  sendEmail('geral@aibora.pt', 'proposal-response', {
    clientName: params.name,
    clientEmail: params.email,
    company: params.company || '',
    response: params.response,
  }).catch(() => {});

  // Confirmation email to client
  return sendEmail(params.email, 'proposal-response-confirmation', {
    clientName: params.name,
    response: params.response,
    recordUrl: params.recordUrl || '',
  });
}

// Delivery approved notification
export async function sendDeliveryApprovalEmail(clientEmail: string, clientName: string, projectName: string, deliveryDate: string) {
  return sendEmail(clientEmail, 'delivery-approved', {
    clientName,
    projectName,
    deliveryDate,
  });
}

// Send invoice email
export async function sendInvoiceEmail(clientEmail: string, clientName: string, amount: string, invoiceLink: string, dueDate: string) {
  return sendEmail(clientEmail, 'invoice', {
    clientName,
    amount,
    invoiceLink,
    dueDate,
  });
}

// Removed for security — no longer used
// export async function sendVendedorAccessEmail(...) — removed

// Marketing campaign email
export async function sendMarketingCampaignEmail(recipientEmail: string, title: string, message: string, link?: string, recipientName?: string) {
  return sendEmail(recipientEmail, 'marketing-campaign', {
    title,
    message,
    link,
    recipientName,
  });
}
