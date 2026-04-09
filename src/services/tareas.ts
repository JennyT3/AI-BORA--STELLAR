import { db } from './firebase';
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { generateId } from './firebase';
import { createFatura } from './faturas';
import { sendFaturaEmail } from './emailService';
import { criarNotificacao } from './notificacoes';

export type TareaEstado = 
  | 'disponivel'           // Open to any collaborator
  | 'pendente_atribuicao'  // Collaborator requested; awaiting admin approval
  | 'atribuida'            // Admin approved collaborator request
  | 'em_analise'           // Collaborator reviewing / understanding
  | 'em_execucao'          // Collaborator actively working
  | 'em_revisao'           // Work submitted; admin review
  | 'aprovada'             // Admin approved delivery
  | 'entregue'             // Sent to client for approval
  | 'paga';                // Client paid the invoice

export const TAREFA_ESTADOS: { value: TareaEstado; label: string; color: string }[] = [
  { value: 'disponivel', label: 'Available', color: '#22c55e' },
  { value: 'pendente_atribuicao', label: 'Awaiting approval', color: '#f59e0b' },
  { value: 'atribuida', label: 'Assigned', color: '#3b82f6' },
  { value: 'em_analise', label: 'In review', color: '#8b5cf6' },
  { value: 'em_execucao', label: 'In progress', color: '#ec4899' },
  { value: 'em_revisao', label: 'In revision', color: '#14b8a6' },
  { value: 'aprovada', label: 'Approved', color: '#10b981' },
  { value: 'entregue', label: 'Delivered to client', color: '#f97316' },
  { value: 'paga', label: 'Paid', color: '#65a30d' },
];

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
  porcentajeColaborador?: number;
  porcentajeVendedor?: number;
  recurrente?: boolean;
  periodicidade?: 'mensal' | 'pontual';
  estado: TareaEstado;
  solicitantes?: string[];
  solicitanteInfo?: { id: string; nome: string; data: string }[];
  asignadaA?: string;
  asignadoNombre?: string;
  entregaArquivos?: string[];
  entregaLinks?: string[];
  entregaNota?: string;
  entregaData?: string;
  revisaoNota?: string;
  dataSolicitacao?: string;
  dataAtribuicao?: string;
  dataInicio?: string;
  dataEntrega?: string;
  dataAprovacao?: string;
  dataEntregue?: string;
  dataPagamento?: string;
  prazo?: string;
  comissaoColaboradorValor?: number;
  comissaoColaboradorTipo?: 'fixo' | 'percentagem';
  createdAt: string;
  updatedAt?: string;
}

export async function createTarea(data: Partial<Tarea>): Promise<string> {
  const id = 'tarea-' + generateId();
  await setDoc(doc(db, 'tareas', id), {
    ...data,
    createdAt: new Date().toISOString()
  });
  return id;
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
    updatedAt: new Date().toISOString()
  });
}

export async function deleteTarea(id: string): Promise<void> {
  await deleteDoc(doc(db, 'tareas', id));
}

export async function listTareas(limitNum = 100): Promise<Tarea[]> {
  const q = query(collection(db, 'tareas'), orderBy('createdAt', 'desc'), limit(limitNum));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Tarea));
}

export async function listTareasDisponiveis(limitNum = 100): Promise<Tarea[]> {
  const q = query(collection(db, 'tareas'), where('estado', '==', 'disponivel'), orderBy('createdAt', 'desc'), limit(limitNum));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Tarea));
}

export async function listTareasByVendedor(vendedorId: string): Promise<Tarea[]> {
  const q = query(collection(db, 'tareas'), where('asignadaA', '==', vendedorId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Tarea));
}

export async function listTareasByCliente(clienteId: string): Promise<Tarea[]> {
  const q = query(collection(db, 'tareas'), where('clienteId', '==', clienteId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Tarea));
}

export async function solicitarTarea(tareaId: string, vendedorId: string, vendedorNome: string): Promise<void> {
  const tarea = await getTarea(tareaId);
  if (!tarea) return;
  
  const solicitantes = tarea.solicitantes || [];
  const solicitanteInfo = tarea.solicitanteInfo || [];
  
  if (!solicitantes.includes(vendedorId)) {
    solicitantes.push(vendedorId);
    solicitanteInfo.push({ id: vendedorId, nome: vendedorNome, data: new Date().toISOString() });
  }
  
  await updateTarea(tareaId, {
    solicitantes,
    solicitanteInfo,
    estado: 'pendente_atribuicao',
    dataSolicitacao: new Date().toISOString()
  });

  await criarNotificacao({
    tipo: 'nova_tarefa_solicitada',
    titulo: 'New task request',
    mensagem: `${vendedorNome} requested to work on "${tarea.titulo}". Approve or reject?`,
    tarefaId,
    clienteId: tarea.clienteId
  });
}

export async function aprobarSolicitudTarea(tareaId: string, vendedorId: string, vendedorNome: string): Promise<void> {
  const tarea = await getTarea(tareaId);
  if (!tarea) return;

  await updateTarea(tareaId, {
    asignadaA: vendedorId,
    asignadoNombre: vendedorNome,
    estado: 'atribuida',
    dataAtribuicao: new Date().toISOString()
  });

  await criarNotificacao({
    tipo: 'tarefa_aprovada',
    titulo: 'Task assigned',
    mensagem: `Your request for "${tarea.titulo}" was approved. You can start.`,
    tarefaId,
    vendedorId
  });
}

export async function rechazarSolicitudTarea(tareaId: string, vendedorId: string, vendedorNome: string, motivo?: string): Promise<void> {
  const tarea = await getTarea(tareaId);
  if (!tarea) return;

  const solicitantes = (tarea.solicitantes || []).filter(id => id !== vendedorId);
  const solicitanteInfo = (tarea.solicitanteInfo || []).filter(s => s.id !== vendedorId);

  await updateTarea(tareaId, {
    solicitantes,
    solicitanteInfo,
    estado: solicitantes.length > 0 ? 'pendente_atribuicao' : 'disponivel'
  });

  await criarNotificacao({
    tipo: 'tarefa_rejeitada',
    titulo: 'Request rejected',
    mensagem: `Your request for "${tarea.titulo}" was rejected. ${motivo ? `Reason: ${motivo}` : ''}`,
    tarefaId,
    vendedorId
  });
}

export async function iniciarTarea(tareaId: string): Promise<void> {
  await updateTarea(tareaId, {
    estado: 'em_analise',
    dataInicio: new Date().toISOString()
  });
}

export async function executarTarea(tareaId: string): Promise<void> {
  await updateTarea(tareaId, {
    estado: 'em_execucao'
  });
}

export async function entregarTarea(tareaId: string, arquivos?: string[], links?: string[], nota?: string): Promise<void> {
  const tarea = await getTarea(tareaId);
  if (!tarea) return;

  await updateTarea(tareaId, {
    entregaArquivos: arquivos,
    entregaLinks: links,
    entregaNota: nota,
    entregaData: new Date().toISOString(),
    estado: 'em_revisao'
  });

  await criarNotificacao({
    tipo: 'tarefa_entregue',
    titulo: 'Task submitted for review',
    mensagem: `"${tarea.titulo}" was submitted. Review and approve or request changes.`,
    tarefaId,
    clienteId: tarea.clienteId
  });
}

export async function aprobarEntregaTarea(tareaId: string): Promise<void> {
  const tarea = await getTarea(tareaId);
  if (!tarea) return;

  await updateTarea(tareaId, {
    estado: 'aprovada',
    revisaoNota: 'Approved by admin',
    dataAprovacao: new Date().toISOString()
  });

  await criarNotificacao({
    tipo: 'tarefa_aprovada',
    titulo: 'Delivery approved',
    mensagem: `Your delivery for "${tarea.titulo}" was approved by admin.`,
    tarefaId,
    vendedorId: tarea.asignadaA
  });
}

export async function solicitarAlteracoes(tareaId: string, nota: string): Promise<void> {
  const tarea = await getTarea(tareaId);
  if (!tarea) return;

  await updateTarea(tareaId, {
    estado: 'em_execucao',
    revisaoNota: nota
  });

  await criarNotificacao({
    tipo: 'tarefa_rejeitada',
    titulo: 'Changes requested',
    mensagem: `Admin requested changes on "${tarea.titulo}": ${nota}`,
    tarefaId,
    vendedorId: tarea.asignadaA
  });
}

export async function enviarAoCliente(tareaId: string): Promise<void> {
  const tarea = await getTarea(tareaId);
  if (!tarea) return;

  await updateTarea(tareaId, {
    estado: 'entregue',
    dataEntregue: new Date().toISOString()
  });
}

export async function marcarTareaPaga(tareaId: string): Promise<void> {
  const tareaRef = doc(db, 'tareas', tareaId);
  const tareaSnap = await getDoc(tareaRef);
  const tarea = tareaSnap.data();
  
  if (tarea?.valorCliente && tarea.valorCliente > 0) {
    const comision = {
      tareaId,
      clienteId: tarea.clienteId,
      vendedorId: tarea.vendedorCaptou || tarea.vendedorId,
      collaboratorId: tarea.asignadaA,
      montoVenta: tarea.valorCliente,
      comisionVendedor: (tarea.valorCliente * (tarea.porcentajeVendedor || 10) / 100),
      comisionCollaborator: (tarea.valorCliente * (tarea.porcentajeColaborador || 60) / 100),
      fecha: new Date().toISOString(),
      estado: 'pendente'
    };
    
    await setDoc(doc(db, 'comisiones', tareaId), comision);
  }
  
  await updateTarea(tareaId, {
    estado: 'paga',
    dataPagamento: new Date().toISOString()
  });

  if (tarea?.asignadaA) {
    await criarNotificacao({
      tipo: 'fatura_paga',
      titulo: 'Task paid — commission available',
      mensagem: `Task "${tarea.titulo}" was paid. Your commission is available for payout.`,
      tarefaId,
      vendedorId: tarea.asignadaA
    });
  }
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
    asignadoNombre: vendedorNome,
    prazo,
    comissaoColaboradorValor: comissaoValor,
    comissaoColaboradorTipo: comissaoTipo,
    estado: 'atribuida',
    dataAtribuicao: new Date().toISOString()
  });

  await criarNotificacao({
    tipo: 'tarefa_aprovada',
    titulo: 'Task assigned',
    mensagem: `You were assigned task "${await getTarea(tareaId).then(t => t?.titulo)}". Deadline: ${prazo}`,
    tarefaId,
    vendedorId
  });
}

export async function aprobarTarea(tareaId: string): Promise<void> {
  await updateTarea(tareaId, {
    estado: 'aprovada',
    dataAprovacao: new Date().toISOString()
  });
}

export async function aprobarTareaPorCliente(clienteId: string, tareaId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const tarea = await getTarea(tareaId);
    if (!tarea) {
      return { success: false, error: 'Task not found.' };
    }
    
    if (tarea.clienteId !== clienteId) {
      return { success: false, error: 'Access denied: this task belongs to another client.' };
    }

    await updateTarea(tareaId, {
      estado: 'aprovada_cliente',
      updatedAt: new Date().toISOString()
    });

    const docSnap = await getDoc(doc(db, 'clientes', clienteId));
    const cliente = docSnap.exists() ? docSnap.data() : null;

    const faturaId = await createFatura({
      clienteId,
      clienteNome: cliente?.nome || tarea.clienteNome || 'Independent client',
      clienteEmail: cliente?.email || tarea.clienteEmail,
      clienteNif: cliente?.nif,
      clienteEmpresa: cliente?.empresa,
      servicos: [{
        nome: tarea.titulo,
        descricao: tarea.descricao || 'Service delivered',
        preco: tarea.valorCliente || 0
      }],
      vendedorId: tarea.asignadaA || cliente?.vendedorId,
      propostaId: tarea.propostaId
    });

    const valorOriginal = tarea.valorCliente || 0;
    const valorComIva = (valorOriginal * 1.23).toFixed(2);
    
    if (cliente?.email || tarea.clienteEmail) {
      await sendFaturaEmail({
        nome: cliente?.nome || tarea.clienteNome || 'Client',
        email: cliente?.email || tarea.clienteEmail || '',
        numeroFatura: 'Automatic',
        valorTotal: `${valorComIva} €`,
        dataVencimento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-PT'),
        linkFatura: `https://aibora.pt/admin/faturas`, 
        linkPagar: `https://aibora.pt/pagar/${faturaId}`
      });
    }

    return { success: true };
  } catch (err: any) {
    console.error('Approval error:', err);
    return { success: false, error: err.message };
  }
}