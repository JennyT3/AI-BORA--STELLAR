import { db } from './firebase';
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { generateId } from './firebase';

export type ClienteCategoria = 'potencial' | 'cliente' | 'curioso' | 'sem_interesse' | 'ativo' | 'inativo' | 'proposta_enviada';

export interface Cliente {
  id: string;
  nome: string;
  email?: string;
  telemovel?: string;
  empresa?: string;
  nif?: string;
  morada?: string;
  website?: string;
  categoria: ClienteCategoria;
  processo?: string;
  origem?: string;
  observacoes?: string;
  vendedorId?: string;
  resposta?: string;
  dataResposta?: string;
  solicitacaoId?: string;
  propostaId?: string;
  tarefas?: string[];
  servicos?: string[];
  criadoPor?: string;
  criadoEm?: string;
  createdAt: string;
  updatedAt?: string;
  fichaUrl?: string;
  totalFacturado?: number;
  numeroOrcamentos?: number;
}

export async function createCliente(data: Partial<Cliente>): Promise<string> {
  const id = generateId();
  const docData = {
    ...data,
    createdAt: new Date().toISOString(),
    totalFacturado: 0,
    numeroOrcamentos: 0,
    estado: data.categoria || "curioso"
  };
  await setDoc(doc(db, 'clientes', id), docData);
  return id;
}

export async function getCliente(id: string): Promise<Cliente | null> {
  const docSnap = await getDoc(doc(db, 'clientes', id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Cliente;
  }
  return null;
}

export async function updateCliente(id: string, data: Partial<Cliente>): Promise<void> {
  await updateDoc(doc(db, 'clientes', id), {
    ...data,
    updatedAt: new Date().toISOString()
  });
}

export async function deleteCliente(id: string): Promise<void> {
  await deleteDoc(doc(db, 'clientes', id));
}

export async function listClientes(limitNum = 100): Promise<Cliente[]> {
  const q = query(collection(db, 'clientes'), orderBy('createdAt', 'desc'), limit(limitNum));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Cliente));
}

export async function listClientesByVendedor(vendedorId: string): Promise<Cliente[]> {
  const q = query(collection(db, 'clientes'), where('vendedorId', '==', vendedorId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Cliente));
}

export async function getClienteByPropostaId(propostaId: string): Promise<Cliente | null> {
  const q = query(collection(db, 'clientes'), where('propostaId', '==', propostaId), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Cliente;
}

export async function getClienteByEmail(email: string): Promise<Cliente | null> {
  const q = query(collection(db, 'clientes'), where('email', '==', email), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Cliente;
}

export async function searchClientes(searchTerm: string): Promise<Cliente[]> {
  const allClientes = await listClientes(500);
  const term = searchTerm.toLowerCase();
  return allClientes.filter(c => 
    c.nome?.toLowerCase().includes(term) ||
    c.email?.toLowerCase().includes(term) ||
    c.empresa?.toLowerCase().includes(term) ||
    c.telemovel?.includes(term)
  );
}

export async function delegarClienteAVendedor(clienteId: string, vendedorId: string): Promise<void> {
  await updateDoc(doc(db, 'clientes', clienteId), {
    vendedorId
  });
}