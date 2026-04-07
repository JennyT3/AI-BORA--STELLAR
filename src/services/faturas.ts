import { db } from './firebase';
import { collection, doc, setDoc, getDoc, updateDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { gerarComissao } from './comissoes';

const IVA_RATE = 0.23;
const PAYMENT_DAYS = 15;

export interface ServicoFatura {
  nome: string;
  descricao?: string;
  preco: number;
}

export interface Fatura {
  id: string;
  numero: string;
  clienteId: string;
  clienteNome: string;
  clienteEmail?: string;
  clienteNif?: string;
  clienteMorada?: string;
  clienteEmpresa?: string;
  servicos: ServicoFatura[];
  valorSubtotal: number;
  valorIVA: number;
  valorTotal: number;
  dataEmissao: Date;
  dataVencimento: Date;
  estado: 'pendente' | 'paga' | 'vencida' | 'cancelada';
  dataPagamento?: Date;
  metodoPagamento?: string;
  vendedorId?: string;
  propostaId?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const q = query(
    collection(db, 'faturas'),
    where('numero', '>=', `F-${year}-000000`),
    where('numero', '<=', `F-${year}-999999`),
    orderBy('numero', 'desc'),
    limit(1)
  );
  
  const snap = await getDocs(q);
  let nextNum = 1;
  
  if (!snap.empty) {
    const lastNumero = snap.docs[0].data().numero;
    const match = lastNumero.match(/F-(\d{4})-(\d{6})/);
    if (match) {
      const lastYear = parseInt(match[1]);
      if (lastYear === year) {
        nextNum = parseInt(match[2]) + 1;
      }
    }
  }
  
  return `F-${year}-${nextNum.toString().padStart(6, '0')}`;
}

export async function createFatura(data: {
  clienteId: string;
  clienteNome: string;
  clienteEmail?: string;
  clienteNif?: string;
  clienteMorada?: string;
  clienteEmpresa?: string;
  servicos: ServicoFatura[];
  vendedorId?: string;
  propostaId?: string;
}): Promise<string> {
  const numero = await generateInvoiceNumber();
  const dataEmissao = new Date();
  const dataVencimento = new Date(Date.now() + PAYMENT_DAYS * 24 * 60 * 60 * 1000);
  
  const valorSubtotal = data.servicos.reduce((sum, s) => sum + s.preco, 0);
  const valorIVA = valorSubtotal * IVA_RATE;
  const valorTotal = valorSubtotal + valorIVA;
  
  const id = 'fat-' + Math.random().toString(36).substring(2, 10);
  
  const fatura: Omit<Fatura, 'id'> = {
    numero,
    clienteId: data.clienteId,
    clienteNome: data.clienteNome,
    clienteEmail: data.clienteEmail,
    clienteNif: data.clienteNif,
    clienteMorada: data.clienteMorada,
    clienteEmpresa: data.clienteEmpresa,
    servicos: data.servicos,
    valorSubtotal,
    valorIVA,
    valorTotal,
    dataEmissao,
    dataVencimento,
    estado: 'pendente',
    vendedorId: data.vendedorId,
    propostaId: data.propostaId,
    createdAt: new Date()
  };
  
  await setDoc(doc(db, 'faturas', id), fatura);
  return id;
}

export async function getFatura(id: string): Promise<Fatura | null> {
  const docSnap = await getDoc(doc(db, 'faturas', id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as any;
  }
  return null;
}

export async function updateFatura(id: string, data: Partial<Fatura>): Promise<void> {
  await updateDoc(doc(db, 'faturas', id), {
    ...data,
    updatedAt: new Date()
  });
}

export async function listFaturasAll(filters?: {
  estado?: string;
  clienteId?: string;
  dataInicio?: Date;
  dataFim?: Date;
}): Promise<Fatura[]> {
  let q = query(collection(db, 'faturas'), orderBy('dataEmissao', 'desc'));
  const snap = await getDocs(q);
  let faturas = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
  
  if (filters?.estado) {
    faturas = faturas.filter(f => f.estado === filters.estado);
  }
  if (filters?.clienteId) {
    faturas = faturas.filter(f => f.clienteId === filters.clienteId);
  }
  if (filters?.dataInicio) {
    faturas = faturas.filter(f => new Date(f.dataEmissao) >= filters.dataInicio!);
  }
  if (filters?.dataFim) {
    faturas = faturas.filter(f => new Date(f.dataEmissao) <= filters.dataFim!);
  }
  
  return faturas;
}

export async function listFaturasByCliente(clienteId: string): Promise<Fatura[]> {
  const q = query(collection(db, 'faturas'), where('clienteId', '==', clienteId), orderBy('dataEmissao', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
}

export async function pagarFatura(
  id: string, 
  metodoPagamento: string,
  dadosComissao?: { vendedorId?: string; colaboradorId?: string }
): Promise<void> {
  const fatura = await getFatura(id);
  if (!fatura) return;
  
  await updateDoc(doc(db, 'faturas', id), {
    estado: 'paga',
    dataPagamento: new Date(),
    metodoPagamento,
    updatedAt: new Date()
  });
  
  if (dadosComissao && (dadosComissao.vendedorId || dadosComissao.colaboradorId)) {
    await gerarComissao(id, {
      valorVenda: fatura.valorSubtotal,
      vendedorId: dadosComissao.vendedorId,
      colaboradorId: dadosComissao.colaboradorId
    });
  }
}

export async function checkAndSendReminders(): Promise<void> {
  const hoje = new Date();
  const q = query(collection(db, 'faturas'), where('estado', '==', 'pendente'));
  const snap = await getDocs(q);
  const faturas = snap.docs.map(d => ({ id: d.id, ...d.data() } as Fatura));
  
  for (const fatura of faturas) {
    const dataVencimento = new Date(fatura.dataVencimento);
    const diffDays = Math.floor((dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 7 || diffDays === 12 || diffDays === 15) {
      console.log(`📧 Fatura ${fatura.numero}: Lembrete dia ${diffDays} antes do vencimento`);
    }
  }
}

export async function processPagamento(faturaId: string): Promise<void> {
  const fatura = await getFatura(faturaId);
  if (!fatura || fatura.estado !== 'paga') return;
  
  if (fatura.vendedorId) {
    console.log(`💰 Processando comissão para vendedor ${fatura.vendedorId}`);
  }
}

export function calcularEstatisticasFaturas(faturas: Fatura[]): {
  totalPendente: number;
  totalPago: number;
  totalVencido: number;
  totalGeral: number;
  contagemPendente: number;
  contagemPago: number;
  contagemVencido: number;
} {
  const hoje = new Date();
  
  let totalPendente = 0;
  let totalPago = 0;
  let totalVencido = 0;
  let contagemPendente = 0;
  let contagemPago = 0;
  let contagemVencido = 0;
  
  for (const f of faturas) {
    if (f.estado === 'paga') {
      totalPago += f.valorTotal;
      contagemPago++;
    } else if (f.estado === 'pendente') {
      const dataVencimento = new Date(f.dataVencimento);
      if (dataVencimento < hoje) {
        totalVencido += f.valorTotal;
        contagemVencido++;
      } else {
        totalPendente += f.valorTotal;
        contagemPendente++;
      }
    }
  }
  
  return {
    totalPendente,
    totalPago,
    totalVencido,
    totalGeral: totalPendente + totalPago + totalVencido,
    contagemPendente,
    contagemPago,
    contagemVencido
  };
}