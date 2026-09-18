import { db, app } from './firebase';
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { generateId } from './firebase';

const DEMO_STORAGE_KEY = 'aibora_proposals_demo';

function generateToken(length = 32): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

const isFirebaseConfigured = (): boolean => {
  try {
    return !!(app?.options?.apiKey && app.options.apiKey !== 'your_firebase_api_key');
  } catch {
    return false;
  }
};

const getDemoStorage = (): Record<string, any> => {
  try {
    const stored = localStorage.getItem(DEMO_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveToDemoStorage = (proposals: Record<string, any>) => {
  try {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(proposals));
  } catch {}
};

export interface Proposal {
  id: string;
  accessToken?: string;
  client: string;
  email?: string;
  phone?: string;
  company?: string;
  website?: string;
  taxId?: string;
  address?: string;
  services?: string[];
  marcas?: { id?: string; name: string; social: string[]; services?: string[] }[];
  total?: number;
  amount?: number;
  quoteNumber?: string;
  descontoPercent?: number;
  discountAmount?: number;
  status?: string;
  response?: "yes" | "not" | "reschedule";
  sentAt?: string;
  responseDate?: string;
  sentBy?: string;
  respondedBy?: string;
  updatedBy?: string;
  updatedAt?: string;
  createdBy?: string;
  createdAt?: string;
  validUntil?: string;
  clientId?: string;
  salesRepId?: string;
  expiryDate?: string;
  pdfHash?: string;
  subtotal?: number;
  vat?: number;
  desconto?: number;
  social?: { name: string; social: string[] }[];
}

export async function createProposal(data: Partial<Proposal>): Promise<string> {
  const id = generateId();
  const accessToken = generateToken(32);
  const docData = {
    ...data,
    accessToken,
    createdAt: new Date().toISOString(),
    validUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
  };

  if (isFirebaseConfigured()) {
    await setDoc(doc(db, 'proposals', id), docData);
  } else {
    const storage = getDemoStorage();
    storage[id] = docData;
    saveToDemoStorage(storage);
    console.log('[Demo] Proposal saved locally:', id);
  }
  return id;
}

export async function getProposalByToken(token: string): Promise<Proposal | null> {
  if (isFirebaseConfigured()) {
    const q = query(collection(db, 'proposals'), where('accessToken', '==', token), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as Proposal;
  } else {
    const storage = getDemoStorage();
    const found = Object.entries(storage).find(([_, v]: any) => v.accessToken === token);
    if (found) return { id: found[0], ...found[1] } as Proposal;
    return null;
  }
}

export async function getProposal(id: string): Promise<Proposal | null> {
  if (isFirebaseConfigured()) {
    const docSnap = await getDoc(doc(db, 'proposals', id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Proposal;
    }
  } else {
    const storage = getDemoStorage();
    if (storage[id]) return { id, ...storage[id] } as Proposal;
  }
  return null;
}

export async function updateProposal(id: string, data: Partial<Proposal>): Promise<void> {
  const updateData = { ...data, updatedAt: new Date().toISOString() };
  if (isFirebaseConfigured()) {
    await updateDoc(doc(db, 'proposals', id), updateData);
  } else {
    const storage = getDemoStorage();
    storage[id] = { ...storage[id], ...updateData };
    saveToDemoStorage(storage);
  }
}

export async function deleteProposal(id: string): Promise<void> {
  if (isFirebaseConfigured()) {
    await deleteDoc(doc(db, 'proposals', id));
  } else {
    const storage = getDemoStorage();
    delete storage[id];
    saveToDemoStorage(storage);
  }
}

export async function isProposalValid(id: string): Promise<boolean> {
  const proposal = await getProposal(id);
  if (!proposal) return false;
  if (proposal.validUntil) {
    const validUntil = new Date(proposal.validUntil);
    if (validUntil < new Date()) return false;
  }
  return true;
}

export async function listProposals(limitNum = 100): Promise<Proposal[]> {
  if (isFirebaseConfigured()) {
    const q = query(collection(db, 'proposals'), orderBy('createdAt', 'desc'), limit(limitNum));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Proposal));
  } else {
    const storage = getDemoStorage();
    return Object.entries(storage).map(([id, data]) => ({ id, ...data } as Proposal)).slice(0, limitNum);
  }
}

export async function listProposalsBySalesRep(salesRepId: string): Promise<Proposal[]> {
  if (isFirebaseConfigured()) {
    const q = query(collection(db, 'proposals'), where('salesRepId', '==', salesRepId), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Proposal));
  } else {
    const storage = getDemoStorage();
    return Object.entries(storage).filter(([_, v]: any) => v.salesRepId === salesRepId).map(([id, data]) => ({ id, ...data } as Proposal));
  }
}

export async function listProposalsByClient(clientId: string): Promise<Proposal[]> {
  if (isFirebaseConfigured()) {
    const q = query(collection(db, 'proposals'), where('clientId', '==', clientId), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Proposal));
  } else {
    const storage = getDemoStorage();
    return Object.entries(storage).filter(([_, v]: any) => v.clientId === clientId).map(([id, data]) => ({ id, ...data } as Proposal));
  }
}