import { db } from './firebase';
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy, serverTimestamp } from 'firebase/firestore';
import { generateId } from './firebase';

export type DelegacaoStatus = 'pendente' | 'aprovada' | 'rejeitada';

export interface ClienteDelegacao {
  clienteId: string;
  clienteNome: string;
  vendedorAtualId?: string;
  nif: string;
  email: string;
}

export interface SolicitacaoDelegacao {
  id: string;
  vendedorSolicitanteId: string;
  vendedorSolicitanteNome: string;
  adminId?: string;
  status: DelegacaoStatus;
  clientesSolicitados: ClienteDelegacao[];
  totalClientes: number;
  dataSolicitacao: any;
  dataResposta?: any;
  motivoRejeicao?: string;
}

export async function criarSolicitacaoDelegacao(
  vendedorSolicitanteId: string,
  vendedorSolicitanteNome: string,
  duplicados: ClienteDelegacao[]
): Promise<string> {
  const id = generateId();
  
  await setDoc(doc(db, 'solicitacoes_delegacao', id), {
    id,
    vendedorSolicitanteId,
    vendedorSolicitanteNome,
    status: 'pendente',
    clientesSolicitados: duplicados,
    totalClientes: duplicados.length,
    dataSolicitacao: serverTimestamp()
  });
  
  return id;
}

export async function listSolicitacoesDelegacaoPendentes(): Promise<SolicitacaoDelegacao[]> {
  const q = query(
    collection(db, 'solicitacoes_delegacao'),
    where('status', '==', 'pendente'),
    orderBy('dataSolicitacao', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as SolicitacaoDelegacao));
}

export async function listTodasSolicitacoesDelegacao(): Promise<SolicitacaoDelegacao[]> {
  const q = query(
    collection(db, 'solicitacoes_delegacao'),
    orderBy('dataSolicitacao', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as SolicitacaoDelegacao));
}

export async function getSolicitacaoDelegacao(id: string): Promise<SolicitacaoDelegacao | null> {
  const docSnap = await getDoc(doc(db, 'solicitacoes_delegacao', id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as SolicitacaoDelegacao;
  }
  return null;
}

export async function aprovarDelegacao(
  solicitacaoId: string,
  adminId: string
): Promise<void> {
  const solicitacao = await getSolicitacaoDelegacao(solicitacaoId);
  if (!solicitacao) {
    throw new Error('Solicitação não encontrada');
  }
  
  const { writeBatch } = await import('firebase/firestore');
  const batch = writeBatch(db);
  
  for (const cliente of solicitacao.clientesSolicitados) {
    const clienteRef = doc(db, 'clientes', cliente.clienteId);
    batch.update(clienteRef, {
      vendedorId: solicitacao.vendedorSolicitanteId,
      updatedAt: new Date().toISOString()
    });
  }
  
  const solicitacaoRef = doc(db, 'solicitacoes_delegacao', solicitacaoId);
  batch.update(solicitacaoRef, {
    status: 'aprovada',
    adminId,
    dataResposta: serverTimestamp()
  });
  
  await batch.commit();
}

export async function rejeitarDelegacao(
  solicitacaoId: string,
  adminId: string,
  motivoRejeicao: string
): Promise<void> {
  await updateDoc(doc(db, 'solicitacoes_delegacao', solicitacaoId), {
    status: 'rejeitada',
    adminId,
    dataResposta: serverTimestamp(),
    motivoRejeicao
  });
}