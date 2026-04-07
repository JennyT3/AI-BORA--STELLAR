import emailjs from '@emailjs/browser';

const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const TEMPLATE_CONFIRMATION = import.meta.env.VITE_EMAILJS_TEMPLATE_CONFIRMATION || 'confirmation_template';
const TEMPLATE_PROPOSTA = import.meta.env.VITE_EMAILJS_TEMPLATE_PROPOSTA || 'proposta_template';
const TEMPLATE_ACEITE = import.meta.env.VITE_EMAILJS_TEMPLATE_ACEITE || 'resposta_aceite_template';
const TEMPLATE_NAO = import.meta.env.VITE_EMAILJS_TEMPLATE_NAO || 'resposta_nao_template';
const TEMPLATE_REAGENDAR = import.meta.env.VITE_EMAILJS_TEMPLATE_REAGENDAR || 'resposta_reagendar_template';
const TEMPLATE_ENTREGA = import.meta.env.VITE_EMAILJS_TEMPLATE_ENTREGA || 'template_entrega';
const TEMPLATE_MARKETING = import.meta.env.VITE_EMAILJS_TEMPLATE_MARKETING || 'marketing_template';

const isConfigured = PUBLIC_KEY && SERVICE_ID && PUBLIC_KEY !== 'tu_public_key_real';

if (isConfigured) {
  emailjs.init({
    publicKey: PUBLIC_KEY,
  });
  console.log('✅ EmailJS inicializado correctamente');
} else {
  console.warn('⚠️ EmailJS NO configurado. Los emails no se enviarán hasta que configures las credenciales en .env');
}

export interface ConfirmationEmailData {
  nome: string;
  email: string;
  servicos: string[];
}

export interface PropostaLinkEmailData {
  nome: string;
  email: string;
  link: string;
  empresa?: string;
}

export interface PropostaRespostaEmailData {
  nome: string;
  email: string;
  resposta: 'sim' | 'nao' | 'reagendar';
  empresa?: string;
  fichaUrl?: string;
}

async function sendEmail(templateId: string, templateParams: Record<string, string>): Promise<boolean> {
  if (!isConfigured) {
    console.warn('📧 Email simulado (EmailJS no configurado):', { templateId, ...templateParams });
    console.warn('📧 → No se envió realmente. Configura EmailJS en https://emailjs.com');
    return false;
  }
  
  try {
    await emailjs.send(SERVICE_ID, templateId, templateParams);
    console.log('✅ Email enviado:', templateId);
    return true;
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    return false;
  }
}

export async function sendConfirmationEmail(data: ConfirmationEmailData): Promise<boolean> {
  return sendEmail(TEMPLATE_CONFIRMATION, {
    nome: data.nome,
    email: data.email,
    servicos: data.servicos.join(', '),
  });
}

export async function sendPropostaLinkEmail(data: PropostaLinkEmailData): Promise<boolean> {
  return sendEmail(TEMPLATE_PROPOSTA, {
    nome: data.nome,
    email: data.email,
    link: data.link,
    empresa: data.empresa || '',
  });
}

export async function sendPropostaRespostaEmail(data: PropostaRespostaEmailData): Promise<boolean> {
  const templateMap = {
    'sim': TEMPLATE_ACEITE,
    'nao': TEMPLATE_NAO,
    'reagendar': TEMPLATE_REAGENDAR,
  };
  
  const template = templateMap[data.resposta] || TEMPLATE_NAO;
  
  return sendEmail(template, {
    nome: data.nome,
    email: data.email,
    empresa: data.empresa || '',
    ficha_url: data.fichaUrl || '',
  });
}

export async function sendVendedorAccessEmail(data: { nome: string; email: string; password: string }): Promise<boolean> {
  return sendEmail('vendedor_access_template', {
    nome: data.nome,
    email: data.email,
    password: data.password,
  });
}

export interface DeliveryApprovalEmailData {
  nome: string;
  email: string;
  tareaTitulo: string;
  fichaUrl: string;
}

export async function sendDeliveryApprovalEmail(data: DeliveryApprovalEmailData): Promise<boolean> {
  return sendEmail(TEMPLATE_ENTREGA, {
    nome: data.nome,
    email: data.email,
    tarea_titulo: data.tareaTitulo,
    ficha_url: data.fichaUrl,
  });
}

export interface MarketingEmailData {
  nome: string;
  email: string;
  assunto: string;
  mensagemHtml: string;
}

export async function sendMarketingCampaignEmail(data: MarketingEmailData): Promise<boolean> {
  return sendEmail(TEMPLATE_MARKETING, {
    to_name: data.nome,
    to_email: data.email,
    subject: data.assunto,
    message_html: data.mensagemHtml,
  });
}

export interface FaturaEmailData {
  nome: string;
  email: string;
  numeroFatura: string;
  valorTotal: string;
  dataVencimento: string;
  linkFatura?: string;
  linkPagar?: string;
}

const TEMPLATE_FATURA = import.meta.env.VITE_EMAILJS_TEMPLATE_FATURA || 'fatura_template';

export async function sendFaturaEmail(data: FaturaEmailData): Promise<boolean> {
  return sendEmail(TEMPLATE_FATURA, {
    nome: data.nome,
    email: data.email,
    numero_fatura: data.numeroFatura,
    valor_total: data.valorTotal,
    data_vencimento: data.dataVencimento,
    link_fatura: data.linkFatura || '',
    link_pagar: data.linkPagar || '',
  });
}