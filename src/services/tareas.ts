import { db } from './firebase';
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { generateId } from './firebase';
import { createFatura } from './faturas';
import { sendFaturaEmail } from './emailService';

export type TareaEstado = 'disponivel' | 'asignada' | 'entregue' | 'aprovada_admin' | 'aprovada_cliente' | 'paga';

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
  asignadaA?: string;
  asignadoNombre?: string;
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

export async function solicitarTarea(tareaId: string, vendedorId: string): Promise<void> {
  const tarea = await getTarea(tareaId);
  if (!tarea) return;
  
  const solicitantes = tarea.solicitantes || [];
  if (!solicitantes.includes(vendedorId)) {
    solicitantes.push(vendedorId);
  }
  
  await updateTarea(tareaId, {
    solicitantes,
    estado: 'disponivel', // Se mantiene disponible hasta que el admin asigne
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
    asignadoNombre: vendedorNome,
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

export async function aprobarTareaPorCliente(clienteId: string, tareaId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const tarea = await getTarea(tareaId);
    if (!tarea) {
      return { success: false, error: 'Tarefa não encontrada.' };
    }
    
    if (tarea.clienteId !== clienteId) {
      return { success: false, error: 'Acesso negado: a tarefa pertence a outro cliente.' };
    }

    await updateTarea(tareaId, {
      estado: 'aprovada_cliente',
      updatedAt: new Date().toISOString()
    });

    const docSnap = await getDoc(doc(db, 'clientes', clienteId));
    const cliente = docSnap.exists() ? docSnap.data() : null;

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
  const tareaRef = doc(db, 'tareas', tareaId);
  const tareaSnap = await getDoc(tareaRef);
  const tarea = tareaSnap.data();
  
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