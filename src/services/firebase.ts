import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut, User } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { createFatura } from './faturas';
import { sendFaturaEmail } from './emailService';

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
export { app };

const db = getFirestore(app);
const auth = getAuth(app);

export { db };

export function generateProposalId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// ============================================
// PROPOSTAS
// ============================================

export interface Proposal {
  id: string;
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
}

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

export async function getProposal(id: string): Promise<Proposal | null> {
  const docSnap = await getDoc(doc(db, 'propostas', id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as any;
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
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
}

export async function listProposalsByVendedor(vendedorId: string): Promise<Proposal[]> {
  const q = query(collection(db, 'propostas'), where('vendedorId', '==', vendedorId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
}

// ============================================
// CLIENTES
// ============================================

export interface Cliente {
  id: string;
  nome: string;
  email?: string;
  telemovel?: string;
  empresa?: string;
  nif?: string;
  morada?: string;
  website?: string;
  categoria: 'potencial' | 'cliente' | 'curioso' | 'sem_interesse' | 'ativo' | 'inativo' | 'proposta_enviada';
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
}

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

export async function listClientes(limitNum = 100): Promise<Cliente[]> {
  const q = query(collection(db, 'clientes'), orderBy('createdAt', 'desc'), limit(limitNum));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
}

export async function listClientesByVendedor(vendedorId: string): Promise<Cliente[]> {
  const q = query(collection(db, 'clientes'), where('vendedorId', '==', vendedorId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
}

export async function getClienteByPropostaId(propostaId: string): Promise<Cliente | null> {
  const q = query(collection(db, 'clientes'), where('propostaId', '==', propostaId), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as any;
}

// ============================================
// TAREFAS
// ============================================

export interface Tarea {
  id: string;
  titulo: string;
  descricao?: string;
  servicoId?: string;
  servicoNome?: string;
  clienteId: string;
  clienteNome?: string;
  clienteEmail?: string;
  propostaId?: string;
  valorCliente?: number;
  porcentagemColaborador?: number;
  porcentagemVendedor?: number;
  recurrente?: boolean;
  recorrente?: boolean;
  recurrante?: boolean;
  periodicidade?: 'mensal' | 'pontual';
  estado: 'disponivel' | 'asignada' | 'entregue' | 'aprovada_admin' | 'aprovada_cliente' | 'paga';
  solicitantes?: string[];
  asignadaA?: string;
  asignadoNome?: string;
  urlEntrega?: string;
  entregaNota?: string;
  dataSolicitacao?: string;
  dataEntrega?: string;
  dataAprovacao?: string;
  dataPagamento?: string;
  prazo?: string;
  comissaoColaboradorValor?: number;
  comissaoColaboradorTipo?: 'fixo' | 'percentagem';
  createdAt: string;
  updatedAt?: string;
}

export async function createTarea(data: Partial<Tarea>): Promise<string> {
  const id = 'tarea-' + generateProposalId();
  await setDoc(doc(db, 'tareas', id), {
    ...data,
    createdAt: new Date().toISOString()
  });
  return id;
}

export async function getTarea(id: string): Promise<Tarea | null> {
  const docSnap = await getDoc(doc(db, 'tareas', id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as any;
  }
  return null;
}

export async function updateTarea(id: string, data: Partial<Tarea>): Promise<void> {
  await updateDoc(doc(db, 'tareas', id), {
    ...data,
    updatedAt: new Date().toISOString()
  });
}

export async function deleteTarea(id: string): Promise<void> {
  await deleteDoc(doc(db, 'tareas', id));
}

export async function listTareas(limitNum = 100): Promise<Tarea[]> {
  const q = query(collection(db, 'tareas'), orderBy('createdAt', 'desc'), limit(limitNum));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
}

export async function listTareasDisponiveis(limitNum = 100): Promise<Tarea[]> {
  const q = query(collection(db, 'tareas'), where('estado', '==', 'disponivel'), orderBy('createdAt', 'desc'), limit(limitNum));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
}

export async function solicitarTarea(tareaId: string, vendedorId: string): Promise<void> {
  const tarea = await getTarea(tareaId);
  if (!tarea) return;
  
  const solicitantes = tarea.solicitantes || [];
  if (!solicitantes.includes(vendedorId)) {
    solicitantes.push(vendedorId);
  }
  
  await updateTarea(tareaId, {
    solicitantes,
    asignadaA: vendedorId,
    estado: 'asignada',
    dataSolicitacao: new Date().toISOString()
  });
}

export async function entregarTarea(tareaId: string, urlEntrega: string, nota?: string): Promise<void> {
  await updateTarea(tareaId, {
    urlEntrega,
    entregaNota: nota,
    estado: 'entregue',
    dataEntrega: new Date().toISOString()
  });
}

export async function asignarTarea(
  tareaId: string, 
  vendedorId: string, 
  vendedorNome: string, 
  prazo: string, 
  comissaoValor?: number, 
  comissaoTipo?: 'fixo' | 'percentagem'
): Promise<void> {
  await updateTarea(tareaId, {
    asignadaA: vendedorId,
    asignadoNome: vendedorNome,
    prazo,
    comissaoColaboradorValor: comissaoValor,
    comissaoColaboradorTipo: comissaoTipo,
    estado: 'asignada'
  });
}

export async function aprobarTarea(tareaId: string): Promise<void> {
  await updateTarea(tareaId, {
    estado: 'aprovada_admin',
    dataAprovacao: new Date().toISOString()
  });
}

export async function aprovarTareaPorCliente(clienteId: string, tareaId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const tarea = await getTarea(tareaId);
    if (!tarea) {
      return { success: false, error: 'Tarefa não encontrada.' };
    }
    
    // Validação de segurança: só o cliente dono pode aprovar
    if (tarea.clienteId !== clienteId) {
      return { success: false, error: 'Acesso negado: a tarefa pertence a outro cliente.' };
    }

    // 1. Atualizar Tarea (aprovada_cliente + kanban "Aprovação Pendente Admin")
    await updateTarea(tareaId, {
      estado: 'aprovada_cliente',
      updatedAt: new Date().toISOString()
    });

    const docSnap = await getDoc(doc(db, 'clientes', clienteId));
    const cliente = docSnap.exists() ? docSnap.data() : null;

    // 2. Gerar Fatura Automática (usando o módulo faturas.ts)
    const faturaId = await createFatura({
      clienteId,
      clienteNome: cliente?.nome || tarea.clienteNome || 'Cliente Independente',
      clienteEmail: cliente?.email || tarea.clienteEmail,
      clienteNif: cliente?.nif,
      clienteEmpresa: cliente?.empresa,
      servicos: [{
        nome: tarea.titulo,
        descricao: tarea.descricao || 'Serviço prestado',
        preco: tarea.valorCliente || 0
      }],
      vendedorId: tarea.asignadaA || cliente?.vendedorId,
      propostaId: tarea.propostaId
    });

    // 3. Disparar email de confirmação ao cliente
    const valorOriginal = tarea.valorCliente || 0;
    const valorComIva = (valorOriginal * 1.23).toFixed(2);
    
    if (cliente?.email || tarea.clienteEmail) {
      await sendFaturaEmail({
        nome: cliente?.nome || tarea.clienteNome || 'Cliente',
        email: cliente?.email || tarea.clienteEmail || '',
        numeroFatura: 'Automática',
        valorTotal: `${valorComIva} €`,
        dataVencimento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-PT'),
        linkFatura: `https://aibora.pt/admin/faturas`, 
        linkPagar: `https://aibora.pt/pagar/${faturaId}`
      });
    }

    return { success: true };
  } catch (err: any) {
    console.error("Erro na aprovação:", err);
    return { success: false, error: err.message };
  }
}

export async function marcarTareaPaga(tareaId: string): Promise<void> {
  // Buscar la tarea para obtener datos de comisión
  const tareaRef = doc(db, 'tareas', tareaId);
  const tareaSnap = await getDoc(tareaRef);
  const tarea = tareaSnap.data();
  
  // Guardar comisión en Firebase si existe
  if (tarea?.comissaoMonto && tarea?.comissaoMonto > 0) {
    const comision = {
      tareaId,
      clienteId: tarea.clienteId,
      vendedorId: tarea.vendedorCaptou || tarea.vendedorId,
      collaboratorId: tarea.asignadaA,
      montoVenta: tarea.comissaoMonto,
      comisionVendedor: tarea.comissaoTipo === 'percent' ? (tarea.comissaoMonto * (tarea.comissaoPercent || 20) / 100) : 0,
      comisionCollaborator: tarea.comissaoTipo === 'percent' ? (tarea.comissaoMonto * (tarea.comissaoPercent || 20) / 100) : tarea.comissaoMonto,
      fecha: new Date().toISOString(),
      estado: 'pendente'
    };
    
    await setDoc(doc(db, 'comisiones', tareaId), comision);
  }
  
  await updateTarea(tareaId, {
    estado: 'paga',
    dataPagamento: new Date().toISOString()
  });
}

// ============================================
// CONTACTOS
// ============================================

export interface Contacto {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  telemovel?: string;
  mensagem?: string;
  negocio?: string;
  origem?: string;
  tipo?: string;
  status?: string;
  createdAt: string;
}

export async function createContacto(data: Partial<Contacto>): Promise<string> {
  const id = generateProposalId();
  await setDoc(doc(db, 'contactos', id), {
    ...data,
    createdAt: new Date().toISOString()
  });
  return id;
}

export async function listContactos(limitNum = 100): Promise<Contacto[]> {
  const q = query(collection(db, 'contactos'), orderBy('createdAt', 'desc'), limit(limitNum));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
}

// ============================================
// VENDEDORES
// ============================================

export interface Vendedor {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  // password — no longer stored (Firebase Auth handles auth)
  comissaoPercent: number;
  ativo: boolean;
  createdAt: string;
  clientesIds?: string[];
  fotoPerfil?: string;
  redesSociais?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    twitter?: string;
  };
}

export async function listVendedoresAtivos(): Promise<Vendedor[]> {
  const q = query(collection(db, 'vendedores'), where('ativo', '==', true));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
}

export async function delegarClienteAVendedor(clienteId: string, vendedorId: string): Promise<void> {
  await updateDoc(doc(db, 'clientes', clienteId), {
    vendedorId
  });
}

// ============================================
// FATURAÇÃO E EMAILS (Logs)
// ============================================

export async function createFaturaMensalLocal(data: Partial<any>): Promise<string> {
  const id = 'fat-' + generateProposalId();
  await setDoc(doc(db, 'faturas_recorrentes', id), {
    ...data,
    id,
    createdAt: new Date().toISOString()
  });
  return id;
}

export async function listFaturasByCliente(clienteId: string): Promise<any[]> {
  const q = query(collection(db, 'faturas_recorrentes'), where('clienteId', '==', clienteId), orderBy('dueDate', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
}

export async function updateFaturaStatus(id: string, status: string): Promise<void> {
  await updateDoc(doc(db, 'faturas_recorrentes', id), {
    status,
    updatedAt: new Date().toISOString()
  });
}

export async function createRegistoEmail(data: Partial<any>): Promise<string> {
  const id = 'email-' + generateProposalId();
  await setDoc(doc(db, 'registos_email'), {
    ...data,
    id,
    dataEnvio: new Date().toISOString()
  });
  return id;
}

export async function listRegistosEmailByCliente(clienteId: string): Promise<any[]> {
  const q = query(collection(db, 'registos_email'), where('clienteId', '==', clienteId), orderBy('dataEnvio', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
}
