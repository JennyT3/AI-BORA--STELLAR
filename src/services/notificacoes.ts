import { db } from './firebase';
import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { generateId } from './firebase';

export type NotificacaoTipo = 
  | 'nova_solicitacao'
  | 'nova_tarefa_solicitada'
  | 'delegacao_pendente'
  | 'tarefa_entregue'
  | 'proposta_aceita'
  | 'tarefa_aprovada'
  | 'tarefa_rejeitada'
  | 'fatura_paga'
  | 'novo_cliente'
  | 'solicitacao_aprovada';

export interface Notificacao {
  id: string;
  tipo: NotificacaoTipo;
  titulo: string;
  mensagem: string;
  lida: boolean;
  tarefaId?: string;
  clienteId?: string;
  vendedorId?: string;
  solicitacaoId?: string;
  dataCriacao: any;
}

export async function criarNotificacao(data: {
  tipo: NotificacaoTipo;
  titulo: string;
  mensagem: string;
  tarefaId?: string;
  clienteId?: string;
  vendedorId?: string;
  solicitacaoId?: string;
}): Promise<string> {
  const id = generateId();
  
  await setDoc(doc(db, 'notificacoes_admin', id), {
    id,
    ...data,
    lida: false,
    dataCriacao: new Date().toISOString()
  });
  
  return id;
}

export async function listNotificacoes(limitNum = 50): Promise<Notificacao[]> {
  const q = query(
    collection(db, 'notificacoes_admin'),
    orderBy('dataCriacao', 'desc'),
    limit(limitNum)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Notificacao));
}

export async function getNotificacoesNaoLidas(): Promise<Notificacao[]> {
  const q = query(
    collection(db, 'notificacoes_admin'),
    where('lida', '==', false),
    orderBy('dataCriacao', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Notificacao));
}

export async function contarNaoLidas(): Promise<number> {
  const notificacoes = await getNotificacoesNaoLidas();
  return notificacoes.length;
}

export async function marcarNotificacaoComoLida(id: string): Promise<void> {
  const { updateDoc } = await import('firebase/firestore');
  await updateDoc(doc(db, 'notificacoes_admin', id), { lida: true });
}

export async function marcarTodasComoLidas(): Promise<void> {
  const { updateDoc, writeBatch } = await import('firebase/firestore');
  const notificacoes = await getNotificacoesNaoLidas();
  
  if (notificacoes.length === 0) return;
  
  const batch = writeBatch(db);
  for (const n of notificacoes) {
    batch.update(doc(db, 'notificacoes_admin', n.id), { lida: true });
  }
  await batch.commit();
}

export async function excluirNotificacao(id: string): Promise<void> {
  const { deleteDoc } = await import('firebase/firestore');
  await deleteDoc(doc(db, 'notificacoes_admin', id));
}

export function subscribeToNotificacoes(
  callback: (notificacoes: Notificacao[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'notificacoes_admin'),
    orderBy('dataCriacao', 'desc'),
    limit(50)
  );
  
  return onSnapshot(q, (snap) => {
    const notificacoes = snap.docs.map(d => ({ id: d.id, ...d.data() } as Notificacao));
    callback(notificacoes);
  });
}

export function subscribeToNaoLidas(
  callback: (count: number) => void
): Unsubscribe {
  const q = query(
    collection(db, 'notificacoes_admin'),
    where('lida', '==', false)
  );
  
  return onSnapshot(q, (snap) => {
    callback(snap.size);
  });
}

export function getNotificacaoIcon(tipo: NotificacaoTipo): string {
  const icons: Record<NotificacaoTipo, string> = {
    nova_solicitacao: '📩',
    nova_tarefa_solicitada: '🙋',
    delegacao_pendente: '🔄',
    tarefa_entregue: '📦',
    proposta_aceita: '✅',
    tarefa_aprovada: '👏',
    tarefa_rejeitada: '❌',
    fatura_paga: '💰',
    novo_cliente: '👤',
    solicitacao_aprovada: '🎉'
  };
  return icons[tipo] || '📢';
}

export function getNotificacaoColor(tipo: NotificacaoTipo): string {
  const colors: Record<NotificacaoTipo, string> = {
    nova_solicitacao: '#3b82f6',
    nova_tarefa_solicitada: '#8b5cf6',
    delegacao_pendente: '#f59e0b',
    tarefa_entregue: '#10b981',
    proposta_aceita: '#22c55e',
    tarefa_aprovada: '#06b6d4',
    tarefa_rejeitada: '#ef4444',
    fatura_paga: '#eab308',
    novo_cliente: '#ec4899',
    solicitacao_aprovada: '#22c55e'
  };
  return colors[tipo] || '#6b7280';
}