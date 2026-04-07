import { db } from './firebase';
import { collection, doc, setDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';

export interface Comissao {
  id: string;
  faturaId: string;
  vendedorId?: string;
  colaboradorId?: string;
  valorVenda: number;
  percentualVendedor: number;
  percentualColaborador: number;
  valorVendedor: number;
  valorColaborador: number;
  status: 'pendente' | 'pago';
  dataCriacao: Date;
}

export function calcularComissoes(valorVenda: number, tipoServico?: string) {
  // Logic standard
  const percentualVendedor = 10;
  const percentualColaborador = 60;
  
  return {
    valorVendedor: valorVenda * (percentualVendedor / 100),
    valorColaborador: valorVenda * (percentualColaborador / 100),
    percentualVendedor,
    percentualColaborador
  };
}

export async function gerarComissao(
  faturaId: string, 
  dadosVenda: {
    valorVenda: number;
    vendedorId?: string;
    colaboradorId?: string;
  }
): Promise<string> {
  const percentuais = calcularComissoes(dadosVenda.valorVenda);
  
  const id = 'com-' + Math.random().toString(36).substring(2, 10);
  
  const comissao: Omit<Comissao, 'id'> = {
    faturaId,
    vendedorId: dadosVenda.vendedorId,
    colaboradorId: dadosVenda.colaboradorId,
    valorVenda: dadosVenda.valorVenda,
    percentualVendedor: percentuais.percentualVendedor,
    percentualColaborador: percentuais.percentualColaborador,
    valorVendedor: percentuais.valorVendedor,
    valorColaborador: percentuais.valorColaborador,
    status: 'pendente',
    dataCriacao: new Date()
  };
  
  await setDoc(doc(db, 'comissoes', id), comissao);
  return id;
}

export async function getComissoes(userId: string, tipo: 'vendedor' | 'colaborador'): Promise<Comissao[]> {
  const queryField = tipo === 'vendedor' ? 'vendedorId' : 'colaboradorId';
  const q = query(collection(db, 'comissoes'), where(queryField, '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Comissao));
}

export async function marcarComissaoPaga(id: string): Promise<void> {
  await updateDoc(doc(db, 'comissoes', id), {
    status: 'pago'
  });
}
