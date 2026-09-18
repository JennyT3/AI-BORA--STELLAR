import { db } from './firebase';
import { collection, doc, setDoc, getDoc, updateDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { generateId } from './firebase';

export interface PaymentLink {
  id: string;
  invoiceId: string;
  clientId: string;
  clientEmail: string;
  amount: number;
  description: string;
  stripeSessionId?: string;
  revolutLink?: string;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  expiresAt: Date;
  paidAt?: Date;
  createdAt: Date;
}

export async function createSimplePaymentLink(proposalId: string, clientEmail: string, clientId: string, amount: number, description: string): Promise<PaymentLink> {
  const paymentLink: PaymentLink = {
    id: generateId(),
    invoiceId: proposalId,
    clientId,
    clientEmail,
    amount,
    description,
    status: 'pending',
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

export async function createPaymentLink(invoiceId: string): Promise<PaymentLink | null> {
  const invoiceDoc = await getDoc(doc(db, 'invoices', invoiceId));
  if (!invoiceDoc.exists()) return null;
  
  const invoice = invoiceDoc.data();
  
  const paymentLink: PaymentLink = {
    id: generateId(),
    invoiceId,
    clientId: invoice.clientId,
    clientEmail: invoice.clientEmail || '',
    amount: invoice.totalAmount || 0,
    description: `Invoice ${invoice.number}`,
    status: 'pending',
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
              name: `Invoice ${invoice.number}`,
              description: invoice.description || 'Ai Bora services'
            },
            unit_amount: Math.round((invoice.totalAmount || 0) * 100)
          },
          quantity: 1
        }],
        mode: 'payment',
        success_url: `https://aibora.pt/c/${invoice.clientId}?payment=success&invoice=${invoiceId}`,
        cancel_url: `https://aibora.pt/c/${invoice.clientId}?payment=cancel`,
        customer_email: invoice.clientEmail,
        metadata: {
          invoiceId,
          clientId: invoice.clientId
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

export async function getPaymentLinkByInvoice(invoiceId: string): Promise<PaymentLink | null> {
  const q = query(
    collection(db, 'payment_links'),
    where('invoiceId', '==', invoiceId),
    orderBy('createdAt', 'desc'),
    limit(1)
  );
  const snap = await getDocs(q);
  if (!snap.empty) {
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as PaymentLink;
  }
  return null;
}

export async function markAsPaid(paymentLinkId: string): Promise<void> {
  const paymentLink = await getPaymentLink(paymentLinkId);
  if (!paymentLink) return;
  
  await updateDoc(doc(db, 'payment_links', paymentLinkId), {
    status: 'paid',
    paidAt: new Date()
  });
  
  await updateDoc(doc(db, 'invoices', paymentLink.invoiceId), {
    status: 'paid',
    paymentDate: new Date().toISOString()
  });

  const { updateTaskByInvoiceId } = await import('./tasks');
  await updateTaskByInvoiceId(paymentLink.invoiceId);
}

export async function verifyPaymentStripe(sessionId: string): Promise<boolean> {
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