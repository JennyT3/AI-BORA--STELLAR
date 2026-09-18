import { db } from './firebase';
import { collection, doc, setDoc, getDoc, updateDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { generateCommission } from './commissions';

const IVA_RATE = 0.23;
const PAYMENT_DAYS = 15;

export interface ServiceInvoice {
  name: string;
  description?: string;
  price: number;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  clientEmail?: string;
  clientTaxId?: string;
  clientAddress?: string;
  clientCompany?: string;
  services: ServiceInvoice[];
  subtotalAmount: number;
  vatAmount: number;
  totalAmount: number;
  dataEmissao: Date;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paymentDate?: Date;
  paymentMethod?: string;
  salesRepId?: string;
  proposalId?: string;
  taskId?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const q = query(
    collection(db, 'invoices'),
    where('number', '>=', `F-${year}-000000`),
    where('number', '<=', `F-${year}-999999`),
    orderBy('number', 'desc'),
    limit(1)
  );
  
  const snap = await getDocs(q);
  let nextNum = 1;
  
  if (!snap.empty) {
    const lastNumber = snap.docs[0].data().number;
    const match = lastNumber.match(/F-(\d{4})-(\d{6})/);
    if (match) {
      const lastYear = parseInt(match[1]);
      if (lastYear === year) {
        nextNum = parseInt(match[2]) + 1;
      }
    }
  }
  
  return `F-${year}-${nextNum.toString().padStart(6, '0')}`;
}

export async function createInvoice(data: {
  clientId: string;
  clientName: string;
  clientEmail?: string;
  clientTaxId?: string;
  clientAddress?: string;
  clientCompany?: string;
  services: ServiceInvoice[];
  salesRepId?: string;
  proposalId?: string;
  taskId?: string;
}): Promise<string> {
  const number = await generateInvoiceNumber();
  const dataEmissao = new Date();
  const dueDate = new Date(Date.now() + PAYMENT_DAYS * 24 * 60 * 60 * 1000);
  
  const subtotalAmount = data.services.reduce((sum, s) => sum + s.price, 0);
  const vatAmount = subtotalAmount * IVA_RATE;
  const totalAmount = subtotalAmount + vatAmount;
  
  const id = 'fat-' + Math.random().toString(36).substring(2, 10);
  
  const invoice: Omit<Invoice, 'id'> = {
    number,
    clientId: data.clientId,
    clientName: data.clientName,
    clientEmail: data.clientEmail,
    clientTaxId: data.clientTaxId,
    clientAddress: data.clientAddress,
    clientCompany: data.clientCompany,
    services: data.services,
    subtotalAmount,
    vatAmount,
    totalAmount,
    dataEmissao,
    dueDate,
    status: 'pending',
    salesRepId: data.salesRepId,
    proposalId: data.proposalId,
    taskId: data.taskId,
    createdAt: new Date()
  };
  
  await setDoc(doc(db, 'invoices', id), invoice);
  return id;
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  const docSnap = await getDoc(doc(db, 'invoices', id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as any;
  }
  return null;
}

export async function updateInvoice(id: string, data: Partial<Invoice>): Promise<void> {
  await updateDoc(doc(db, 'invoices', id), {
    ...data,
    updatedAt: new Date()
  });
}

export async function listAllInvoices(filters?: {
  status?: string;
  clientId?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<Invoice[]> {
  let q = query(collection(db, 'invoices'), orderBy('dataEmissao', 'desc'));
  const snap = await getDocs(q);
  let invoices = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
  
  if (filters?.status) {
    invoices = invoices.filter(f => f.status === filters.status);
  }
  if (filters?.clientId) {
    invoices = invoices.filter(f => f.clientId === filters.clientId);
  }
  if (filters?.startDate) {
    invoices = invoices.filter(f => new Date(f.dataEmissao) >= filters.startDate!);
  }
  if (filters?.endDate) {
    invoices = invoices.filter(f => new Date(f.dataEmissao) <= filters.endDate!);
  }
  
  return invoices;
}

export async function listInvoicesByClient(clientId: string): Promise<Invoice[]> {
  const q = query(collection(db, 'invoices'), where('clientId', '==', clientId), orderBy('dataEmissao', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
}

export async function payInvoice(
  id: string, 
  paymentMethod: string,
  commissionData?: { salesRepId?: string; collaboratorId?: string }
): Promise<void> {
  const invoice = await getInvoice(id);
  if (!invoice) return;
  
  await updateDoc(doc(db, 'invoices', id), {
    status: 'paid',
    paymentDate: new Date(),
    paymentMethod,
    updatedAt: new Date()
  });
  
  if (commissionData && (commissionData.salesRepId || commissionData.collaboratorId)) {
    await generateCommission(id, {
      saleAmount: invoice.subtotalAmount,
      salesRepId: commissionData.salesRepId,
      collaboratorId: commissionData.collaboratorId
    });
  }
}

export async function checkAndSendReminders(): Promise<void> {
  const today = new Date();
  const q = query(collection(db, 'invoices'), where('status', '==', 'pending'));
  const snap = await getDocs(q);
  const invoices = snap.docs.map(d => ({ id: d.id, ...d.data() } as Invoice));
  
  for (const invoice of invoices) {
    const dueDate = new Date(invoice.dueDate);
    const diffDays = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 7 || diffDays === 12 || diffDays === 15) {
      console.log(`📧 Invoice ${invoice.number}: reminder ${diffDays} days before due date`);
    }
  }
}

export async function processPayment(invoiceId: string): Promise<void> {
  const invoice = await getInvoice(invoiceId);
  if (!invoice || invoice.status !== 'paid') return;
  
  if (invoice.salesRepId) {
    console.log(`💰 Processing commission for sales rep ${invoice.salesRepId}`);
  }
}

export function calculateInvoiceStats(invoices: Invoice[]): {
  totalPending: number;
  totalPaid: number;
  totalOverdue: number;
  grandTotal: number;
  countPending: number;
  paidCount: number;
  countOverdue: number;
} {
  const today = new Date();
  
  let totalPending = 0;
  let totalPaid = 0;
  let totalOverdue = 0;
  let countPending = 0;
  let paidCount = 0;
  let countOverdue = 0;
  
  for (const f of invoices) {
    if (f.status === 'paid') {
      totalPaid += f.totalAmount;
      paidCount++;
    } else if (f.status === 'pending') {
      const dueDate = new Date(f.dueDate);
      if (dueDate < today) {
        totalOverdue += f.totalAmount;
        countOverdue++;
      } else {
        totalPending += f.totalAmount;
        countPending++;
      }
    }
  }
  
  return {
    totalPending,
    totalPaid,
    totalOverdue,
    grandTotal: totalPending + totalPaid + totalOverdue,
    countPending,
    paidCount,
    countOverdue
  };
}