import { collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import { sendQuoteConfirmation } from './emailService';

export interface Request {
  id?: string;
  name: string;
  phone: string;
  company?: string;
  email?: string;
  website?: string;
  notes?: string;
  services: string[];
  marcas: { name: string; social: string[] }[];
  source?: string;
  status: 'pending' | 'em-analise' | 'proposta-enviada';
  clientId?: string;
  createdAt: string;
}

function generateId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));
  return 'sol-' + id;
}

export async function createRequest(data: Partial<Request>): Promise<string> {
  const id = generateId();
  await setDoc(doc(db, 'requests', id), {
    ...data,
    source: data.source || 'Website',
    status: 'pending',
    createdAt: new Date().toISOString(),
  });

  if (data.email) {
    try {
      await sendQuoteConfirmation(data.email, data.name || '', data.services || []);
    } catch (e) {
      console.error('Failed to send confirmation email:', e);
    }
  }

  return id;
}

export async function listRequests(limitNum = 100): Promise<Request[]> {
  const q = query(collection(db, 'requests'), orderBy('createdAt', 'desc'), limit(limitNum));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Request));
}

export async function updateRequestStatus(id: string, status: Request['status']): Promise<void> {
  await updateDoc(doc(db, 'requests', id), { status, updatedAt: new Date().toISOString() });
}

export async function assignSalesRepToRequest(id: string, salesRepId: string): Promise<void> {
  if (salesRepId) {
    await updateDoc(doc(db, 'requests', id), { salesRepId, updatedAt: new Date().toISOString() });
  } else {
    await updateDoc(doc(db, 'requests', id), { salesRepId: null, updatedAt: new Date().toISOString() });
  }
}

export async function deleteRequest(id: string): Promise<void> {
  await deleteDoc(doc(db, 'requests', id));
}

export async function getRequest(id: string): Promise<Request | null> {
  const docSnap = await getDoc(doc(db, 'requests', id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Request;
  }
  return null;
}
