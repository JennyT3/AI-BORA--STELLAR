import { initializeApp } from 'firebase/app';
import { Proposal, Cliente, OrcamentoRequest, Tarea } from '../types';
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Generate unique ID
export function generateProposalId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// Create new proposal
export async function createProposal(data: Partial<Proposal>): Promise<string> {
  const id = generateProposalId();
  const docData = {
    ...data,
    createdAt: new Date().toISOString(),
    validUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
  };
  await setDoc(doc(db, 'propostas', id), docData);
  return id;
}

// Get proposal by ID
export async function getProposal(id: string): Promise<Proposal | null> {
  const docSnap = await getDoc(doc(db, 'propostas', id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as any;
  }
  return null;
}

// Update proposal
export async function updateProposal(id: string, data: Partial<Proposal>): Promise<void> {
  await updateDoc(doc(db, 'propostas', id), {
    ...data,
    updatedAt: new Date().toISOString()
  });
}

// Delete proposal
export async function deleteProposal(id: string): Promise<void> {
  await deleteDoc(doc(db, 'propostas', id));
}

// List all proposals (most recent first)
export async function listProposals(limitNum: number = 50): Promise<Proposal[]> {
  const q = query(collection(db, 'propostas'), orderBy('createdAt', 'desc'), limit(limitNum));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
}

// Check if proposal is valid (within 10 days)
export function isProposalValid(proposal: Proposal): boolean {
  if (!proposal.validUntil) return true;
  return new Date(proposal.validUntil) > new Date();
}

// ========== SOLICITUDES DE ORÇAMENTO (Clientes pidiendo orçamento) ==========

// Create new Orçamento request (cliente pide orçamento sin precio aún)
export async function createOrcamentoRequest(data: Partial<OrcamentoRequest>): Promise<string> {
  const id = generateProposalId();
  const docData = {
    ...data,
    tipo: 'solicitacao', // distinguish from proposta with price
    status: 'pendente', // pendente, contacted, converted
    createdAt: new Date().toISOString()
  };
  await setDoc(doc(db, 'solicitacoes', id), docData);
  return id;
}

// List all Orçamento requests
export async function listOrcamentoRequests(limitNum: number = 50): Promise<OrcamentoRequest[]> {
  const q = query(collection(db, 'solicitacoes'), orderBy('createdAt', 'desc'), limit(limitNum));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
}

// Update Orçamento request status
export async function updateOrcamentoRequest(id: string, data: Partial<OrcamentoRequest>): Promise<void> {
  await updateDoc(doc(db, 'solicitacoes', id), {
    ...data,
    updatedAt: new Date().toISOString()
  });
}

// Delete Orçamento request
export async function deleteOrcamentoRequest(id: string): Promise<void> {
  await deleteDoc(doc(db, 'solicitacoes', id));
}

// ========== CLIENTES ==========

export async function createCliente(data: Partial<Cliente>): Promise<string> {
  const id = generateProposalId();
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
    return { id: docSnap.id, ...docSnap.data() } as any;
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

export async function listClientes(limitNum: number = 100): Promise<Cliente[]> {
  const q = query(collection(db, 'clientes'), orderBy('createdAt', 'desc'), limit(limitNum));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
}

export async function getClientesByCategoria(categoria: string): Promise<Cliente[]> {
  const q = query(collection(db, 'clientes'), where('categoria', '==', categoria));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
}

function generateContactoId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));
  return 'cont-' + id;
}

export interface Contacto {
  id?: string;
  nome: string;
  negocio?: string;
  telemovel?: string;
  email?: string;
  mensagem?: string;
  origem?: string;
  tipo?: string;
  status?: string;
  createdAt?: string;
}

export async function createContacto(data: Partial<Contacto>): Promise<string> {
  const id = generateContactoId();
  await setDoc(doc(db, 'contactos', id), {
    ...data,
    origem: data.origem || 'Home',
    tipo: data.tipo || 'contacto',
    status: data.status || 'pendente',
    createdAt: new Date().toISOString(),
  });
  return id;
}

export async function listContactos(limitNum: number = 100): Promise<Contacto[]> {
  const q = query(collection(db, 'contactos'), orderBy('createdAt', 'desc'), limit(limitNum));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contacto));
}

export async function delegarClienteAVendedor(clienteId: string, vendedorId: string): Promise<void> {
  await updateDoc(doc(db, 'clientes', clienteId), { vendedorId });
}

export async function listVendedoresAtivos(): Promise<any[]> {
  const q = query(collection(db, 'vendedores'), where('ativo', '==', true), orderBy('nome', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getClienteByPropostaId(propostaId: string): Promise<Cliente | null> {
  const q = query(collection(db, 'clientes'), where('propostaId', '==', propostaId));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Cliente;
  }
  return null;
}

function generateTareaId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));
  return 'tar-' + id;
}

export async function createTarea(data: Partial<Tarea>): Promise<string> {
  const id = generateTareaId();
  await setDoc(doc(db, 'tareas', id), {
    ...data,
    estado: data.estado || 'disponivel',
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  });
  return id;
}

export async function listTareas(filtro?: { estado?: string; asignadaA?: string }): Promise<Tarea[]> {
  let q;
  
  if (filtro?.estado && filtro?.asignadaA) {
    q = query(collection(db, 'tareas'), where('estado', '==', filtro.estado), where('asignadaA', '==', filtro.asignadaA), orderBy('criadoEm', 'desc'));
  } else if (filtro?.estado) {
    q = query(collection(db, 'tareas'), where('estado', '==', filtro.estado), orderBy('criadoEm', 'desc'));
  } else if (filtro?.asignadaA) {
    q = query(collection(db, 'tareas'), where('asignadaA', '==', filtro.asignadaA), orderBy('criadoEm', 'desc'));
  } else {
    q = query(collection(db, 'tareas'), orderBy('criadoEm', 'desc'));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Record<string, any> } as Tarea));
}

export async function getTarea(id: string): Promise<Tarea | null> {
  const docSnap = await getDoc(doc(db, 'tareas', id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Tarea;
  }
  return null;
}

export async function updateTarea(id: string, data: Partial<Tarea>): Promise<void> {
  await updateDoc(doc(db, 'tareas', id), {
    ...data,
    atualizadoEm: new Date().toISOString(),
  });
}

export async function solicitarTarea(tareaId: string, vendedorId: string): Promise<void> {
  const tarea = await getTarea(tareaId);
  if (!tarea) return;
  
  const solicitantes = tarea.solicitantes || [];
  if (!solicitantes.includes(vendedorId)) {
    await updateTarea(tareaId, { solicitantes: [...solicitantes, vendedorId] });
  }
}

export async function asignarTarea(tareaId: string, vendedorId: string, prazo: string): Promise<void> {
  const q = query(collection(db, 'vendedores'), where('__name__', '==', vendedorId));
  const snapshot = await getDocs(q);
  const vendedorNome = snapshot.empty ? 'Vendedor' : snapshot.docs[0].data().nome || 'Vendedor';
  
  await updateTarea(tareaId, {
    asignadaA: vendedorId,
    asignadoNome: vendedorNome,
    prazo: prazo,
    estado: 'asignada',
  });
}

export async function entregarTarea(tareaId: string, entregaUrl: string, nota?: string): Promise<void> {
  await updateTarea(tareaId, {
    entregaUrl: entregaUrl,
    entregaNota: nota,
    estado: 'entregue',
  });
}

export async function aprobarTarea(tareaId: string, tipo: 'admin' | 'cliente'): Promise<void> {
  const estado = tipo === 'admin' ? 'aprovada_admin' : 'aprovada_cliente';
  await updateTarea(tareaId, { estado });
}

export async function marcarTareaPaga(tareaId: string): Promise<void> {
  await updateTarea(tareaId, { estado: 'paga' });
}

export { app, db };