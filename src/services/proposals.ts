import { db } from './firebase';
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { generateId } from './firebase';

function generateToken(length = 32): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export interface Proposal {
  id: string;
  accessToken?: string;
  cliente: string;
  email?: string;
  telefone?: string;
  empresa?: string;
  website?: string;
  nif?: string;
  morada?: string;
  servicos?: string[];
  marcas?: { id?: string; nome: string; redes: string[]; servicos?: string[] }[];
  total?: number;
  valor?: number;
  numeroOrcamento?: string;
  descontoPercent?: number;
  descontoValor?: number;
  status?: string;
  resposta?: "sim" | "nao" | "reagendar";
  dataEnvio?: string;
  dataResposta?: string;
  enviadoPor?: string;
  respondidoPor?: string;
  atualizadoPor?: string;
  atualizadoEm?: string;
  criadoPor?: string;
  criadoEm?: string;
  createdAt?: string;
  updatedAt?: string;
  validUntil?: string;
  clienteId?: string;
  vendedorId?: string;
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
  await setDoc(doc(db, 'propostas', id), docData);
  return id;
}

export async function getProposalByToken(token: string): Promise<Proposal | null> {
  const q = query(collection(db, 'propostas'), where('accessToken', '==', token), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Proposal;
}

export async function getProposal(id: string): Promise<Proposal | null> {
  const docSnap = await getDoc(doc(db, 'propostas', id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Proposal;
  }
  return null;
}

export async function updateProposal(id: string, data: Partial<Proposal>): Promise<void> {
  await updateDoc(doc(db, 'propostas', id), {
    ...data,
    updatedAt: new Date().toISOString()
  });
}

export async function deleteProposal(id: string): Promise<void> {
  await deleteDoc(doc(db, 'propostas', id));
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
  const q = query(collection(db, 'propostas'), orderBy('createdAt', 'desc'), limit(limitNum));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Proposal));
}

export async function listProposalsByVendedor(vendedorId: string): Promise<Proposal[]> {
  const q = query(collection(db, 'propostas'), where('vendedorId', '==', vendedorId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Proposal));
}

export async function listProposalsByCliente(clienteId: string): Promise<Proposal[]> {
  const q = query(collection(db, 'propostas'), where('clienteId', '==', clienteId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Proposal));
}