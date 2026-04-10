import { db } from './firebase';
import { collection, doc, setDoc, getDoc, updateDoc, query, where, getDocs, orderBy, limit, addDoc } from 'firebase/firestore';
import { generateId } from './firebase';

export interface PaymentLink {
  id: string;
  faturaId: string;
  clienteId: string;
  clienteEmail: string;
  valor: number;
  descricao: string;
  stripeSessionId?: string;
  revolutLink?: string;
  status: 'pendente' | 'pago' | 'expirado' | 'cancelado';
  expiresAt: Date;
  paidAt?: Date;
  createdAt: Date;
}

export async function criarPaymentLinkSimples(proposalId: string, clienteEmail: string, clienteId: string, valor: number, descricao: string): Promise<PaymentLink> {
  const paymentLink: PaymentLink = {
    id: generateId(),
    faturaId: proposalId,
    clienteId,
    clienteEmail,
    valor,
    descricao,
    status: 'pendente',
    expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    createdAt: new Date()
  };

  const docData = {
    ...paymentLink,
    expiresAt: paymentLink.expiresAt.toISOString(),
    createdAt: paymentLink.createdAt.toISOString()
  };

  await setDoc(doc(db, 'payment_links', paymentLink.id), docData);
  return paymentLink;
}

export async function criarPaymentLink(faturaId: string): Promise<PaymentLink | null> {
  const faturaDoc = await getDoc(doc(db, 'faturas', faturaId));
  if (!faturaDoc.exists()) return null;
  
  const fatura = faturaDoc.data();
  
  const paymentLink: PaymentLink = {
    id: generateId(),
    faturaId,
    clienteId: fatura.clienteId,
    clienteEmail: fatura.clienteEmail || '',
    valor: fatura.valorTotal || 0,
    descricao: `Invoice ${fatura.numero}`,
    status: 'pendente',
    expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    createdAt: new Date()
  };

  if (process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usdc',
            product_data: {
              name: `Invoice ${fatura.numero}`,
              description: fatura.descricao || 'Ai Bora services'
            },
            unit_amount: Math.round((fatura.valorTotal || 0) * 100)
          },
          quantity: 1
        }],
        mode: 'payment',
        success_url: `https://aibora.pt/c/${fatura.clienteId}?pagamento=success&fatura=${faturaId}`,
        cancel_url: `https://aibora.pt/c/${fatura.clienteId}?pagamento=cancel`,
        customer_email: fatura.clienteEmail,
        metadata: {
          faturaId,
          clienteId: fatura.clienteId
        }
      });
      
      paymentLink.stripeSessionId = session.id;
    } catch (error) {
      console.error('Stripe error:', error);
    }
  }

  await setDoc(doc(db, 'payment_links', paymentLink.id), paymentLink);
  
  return paymentLink;
}

export async function getPaymentLink(id: string): Promise<PaymentLink | null> {
  const docSnap = await getDoc(doc(db, 'payment_links', id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as PaymentLink;
  }
  return null;
}

export async function getPaymentLinkByFatura(faturaId: string): Promise<PaymentLink | null> {
  const q = query(
    collection(db, 'payment_links'),
    where('faturaId', '==', faturaId),
    orderBy('createdAt', 'desc'),
    limit(1)
  );
  const snap = await getDocs(q);
  if (!snap.empty) {
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as PaymentLink;
  }
  return null;
}

export async function marcarComoPago(paymentLinkId: string): Promise<void> {
  const paymentLink = await getPaymentLink(paymentLinkId);
  if (!paymentLink) return;
  
  await updateDoc(doc(db, 'payment_links', paymentLinkId), {
    status: 'pago',
    paidAt: new Date()
  });
  
  await updateDoc(doc(db, 'faturas', paymentLink.faturaId), {
    status: 'paga',
    dataPagamento: new Date().toISOString()
  });

  const { updateTareaByFaturaId } = await import('./tareas');
  await updateTareaByFaturaId(paymentLink.faturaId);
}

export async function verificarPaymentStripe(sessionId: string): Promise<boolean> {
  if (!process.env.STRIPE_SECRET_KEY) return false;
  
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    return session.payment_status === 'paid';
  } catch (error) {
    console.error('Stripe verification error:', error);
    return false;
  }
}

export function getStripeCheckoutUrl(sessionId: string): string {
  return `https://checkout.stripe.com/c/pay/${sessionId}`;
}

export function getRevolutCheckoutUrl(amount: number, email: string, description: string): string {
  const params = new URLSearchParams({
    amount: String(Math.round(amount * 100)),
    currency: 'USDC',
    email,
    title: description
  });
  return `https://pay.revolut.com/?${params.toString()}`;
}