import { db } from './firebase';
import { collection, doc, setDoc, getDoc, updateDoc, query, where, getDocs, orderBy, limit, deleteDoc } from 'firebase/firestore';

export interface NurturingContacto {
  id: string;
  contactoId: string;
  nome: string;
  email: string;
  telefone?: string;
  servicosRejeitados: string[];
  dataRejeicao: Date;
  tags: string[];
  estado: 'nurturing' | 'reativado' | 'convertido';
  origem: 'proposta_nao' | 'campanha' | 'newsletter';
  createdAt: Date;
  reativadoAt?: Date;
  vendedorOriginalId?: string;
  ultimaInteracao?: Date;
  numInteracoes?: number;
  notas?: string;
}

export async function createNurturingContacto(data: {
  contactoId: string;
  nome: string;
  email: string;
  telefone?: string;
  servicosRejeitados: string[];
  origem: 'proposta_nao' | 'campanha' | 'newsletter';
  vendedorOriginalId?: string;
}): Promise<string> {
  const id = 'nurt-' + Math.random().toString(36).substring(2, 10);
  
  const contacto: Omit<NurturingContacto, 'id'> = {
    contactoId: data.contactoId,
    nome: data.nome,
    email: data.email,
    telefone: data.telefone,
    servicosRejeitados: data.servicosRejeitados,
    dataRejeicao: new Date(),
    tags: ['nurturing', 'remarketing'],
    estado: 'nurturing',
    origem: data.origem,
    vendedorOriginalId: data.vendedorOriginalId,
    createdAt: new Date(),
    numInteracoes: 0
  };
  
  await setDoc(doc(db, 'nurturing', id), contacto);
  return id;
}

export async function getNurturingContacto(id: string): Promise<NurturingContacto | null> {
  const docSnap = await getDoc(doc(db, 'nurturing', id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as any;
  }
  return null;
}

export async function updateNurturingContacto(id: string, data: Partial<NurturingContacto>): Promise<void> {
  await updateDoc(doc(db, 'nurturing', id), {
    ...data,
    updatedAt: new Date()
  });
}

export async function listNurturingContactos(filters?: {
  estado?: string;
  origem?: string;
  vendedorId?: string;
}): Promise<NurturingContacto[]> {
  const q = query(collection(db, 'nurturing'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  let contactos = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
  
  if (filters?.estado) {
    contactos = contactos.filter(c => c.estado === filters.estado);
  }
  if (filters?.origem) {
    contactos = contactos.filter(c => c.origem === filters.origem);
  }
  if (filters?.vendedorId) {
    contactos = contactos.filter(c => c.vendedorOriginalId === filters.vendedorId);
  }
  
  return contactos;
}

export async function reativarContacto(id: string): Promise<void> {
  const contacto = await getNurturingContacto(id);
  if (!contacto) return;
  
  await updateDoc(doc(db, 'nurturing', id), {
    estado: 'reativado',
    reativadoAt: new Date(),
    tags: ['reativado', 'remarketing']
  });
}

export async function marcarConvertido(id: string, clienteId?: string): Promise<void> {
  await updateDoc(doc(db, 'nurturing', id), {
    estado: 'convertido',
    convertidoAt: new Date(),
    clienteId,
    tags: ['convertido', 'cliente']
  });
}

export async function adicionarInteracaoNurturing(id: string, nota?: string): Promise<void> {
  const contacto = await getNurturingContacto(id);
  if (!contacto) return;
  
  await updateDoc(doc(db, 'nurturing', id), {
    ultimaInteracao: new Date(),
    numInteracoes: (contacto.numInteracoes || 0) + 1,
    ...(nota && { notas: (contacto.notas || '') + '\n' + new Date().toISOString() + ': ' + nota })
  });
}

export async function deleteNurturingContacto(id: string): Promise<void> {
  await deleteDoc(doc(db, 'nurturing', id));
}

export async function getNurturingStats(): Promise<{
  total: number;
  nurturing: number;
  reativado: number;
  convertido: number;
}> {
  const snap = await getDocs(collection(db, 'nurturing'));
  const contactos = snap.docs.map(d => d.data());
  
  return {
    total: contactos.length,
    nurturing: contactos.filter(c => c.estado === 'nurturing').length,
    reativado: contactos.filter(c => c.estado === 'reativado').length,
    convertido: contactos.filter(c => c.estado === 'convertido').length
  };
}