import { db, generateProposalId } from './firebase';
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy } from 'firebase/firestore';

export interface Vendedor {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  // password eliminado — Firebase Auth gestiona autenticación
  comissaoPercent: number; // % de comisión (ej: 20 = 20%)
  ativo: boolean;
  createdAt: string;
  clientesIds?: string[]; // IDs de clientes asignados a este vendedor
  fotoPerfil?: string;
  redesSociais?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    twitter?: string;
  };
  referidoPor?: string;
  referidosInvitados?: string[];
  referidosConvertidos?: number;
  bonusProximoCliente?: boolean;
}

// ========== VENDEDORES ==========

export async function createVendedor(data: Omit<Vendedor, 'id'>): Promise<string> {
  const id = generateProposalId();
  const docData = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'vendedores', id), docData);
  return id;
}

export async function getVendedor(id: string): Promise<Vendedor | null> {
  const docSnap = await getDoc(doc(db, 'vendedores', id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Vendedor;
  }
  return null;
}

export async function getVendedorByEmail(email: string): Promise<Vendedor | null> {
  const q = query(collection(db, 'vendedores'), where('email', '==', email));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Vendedor;
  }
  return null;
}

export async function updateVendedor(id: string, data: Partial<Vendedor>): Promise<void> {
  await updateDoc(doc(db, 'vendedores', id), {
    ...data,
    updatedAt: new Date().toISOString()
  });
}

export async function deleteVendedor(id: string): Promise<void> {
  await deleteDoc(doc(db, 'vendedores', id));
}

export async function listVendedores(): Promise<Vendedor[]> {
  const q = query(collection(db, 'vendedores'), orderBy('nome', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vendedor));
}

export async function listVendedoresAtivos(): Promise<Vendedor[]> {
  const q = query(collection(db, 'vendedores'), where('ativo', '==', true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vendedor));
}

export async function delegarClienteAVendedor(clienteId: string, vendedorId: string): Promise<void> {
  const { updateDoc, doc } = await import('firebase/firestore');
  await updateDoc(doc(db, 'clientes', clienteId), {
    vendedorId
  });
}

// ========== ASIGNAR CLIENTES A VENDEDOR ==========

export async function asignarClientesAVendedor(vendedorId: string, clientesIds: string[]): Promise<void> {
  await updateVendedor(vendedorId, { clientesIds });
}

export async function addClienteAVendedor(vendedorId: string, clienteId: string): Promise<void> {
  const vendedor = await getVendedor(vendedorId);
  if (vendedor) {
    const clientesIds = vendedor.clientesIds || [];
    if (!clientesIds.includes(clienteId)) {
      await updateVendedor(vendedorId, { clientesIds: [...clientesIds, clienteId] });
    }
  }
}

export async function removeClienteDeVendedor(vendedorId: string, clienteId: string): Promise<void> {
  const vendedor = await getVendedor(vendedorId);
  if (vendedor) {
    const clientesIds = (vendedor.clientesIds || []).filter(id => id !== clienteId);
    await updateVendedor(vendedorId, { clientesIds });
  }
}

// ========== IMPORTAR CLIENTES DESDE EXCEL (Asignar a vendedor) ==========

export async function importarClientesParaVendedor(vendedorId: string, clientesData: any[]): Promise<{ sucesso: number; erros: string[] }> {
  let sucesso = 0;
  const erros: string[] = [];
  
  // Primeiro, importar os clientes para Firestore
  for (const cliente of clientesData) {
    try {
      // Verificar se cliente já existe pelo email ou telemovel
      const q = query(collection(db, 'clientes'), where('email', '==', cliente.email || cliente.email));
      const existing = await getDocs(q);
      
      let clienteId: string;
      
      if (!existing.empty) {
        // Cliente já existe, usar ID existente
        clienteId = existing.docs[0].id;
        // Atualizar com origem do vendedor
        await updateDoc(doc(db, 'clientes', clienteId), {
          vendedorId,
          origem: cliente.origem || 'Importado',
        });
      } else {
        // Criar novo cliente
        clienteId = generateProposalId();
        const docData = {
          nome: cliente.nome,
          email: cliente.email || '',
          telemovel: cliente.telemovel || cliente.telefone || '',
          nif: cliente.nif || '',
          morada: cliente.morada || '',
          empresa: cliente.empresa || '',
          categoria: 'potencial',
          origem: cliente.origem || 'Importado',
          vendedorId,
          createdAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'clientes', clienteId), docData);
      }
      
      // Adicionar ID do cliente ao vendedor
      await addClienteAVendedor(vendedorId, clienteId);
      sucesso++;
    } catch (err: any) {
      erros.push(`Erro ao importar ${cliente.nome}: ${err.message}`);
    }
  }
  
  return { sucesso, erros };
}

// ========== STATS DEL VENDEDOR ==========

export async function getStatsVendedor(vendedorId: string): Promise<{
  totalClientes: number;
  propostasEnviadas: number;
  propostasAceitas: number;
  valorTotalPropostas: number;
  comissaoTotal: number;
}> {
  const vendedor = await getVendedor(vendedorId);
  if (!vendedor) {
    return { totalClientes: 0, propostasEnviadas: 0, propostasAceitas: 0, valorTotalPropostas: 0, comissaoTotal: 0 };
  }
  
  const clientesIds = vendedor.clientesIds || [];
  let propostasEnviadas = 0;
  let propostasAceitas = 0;
  let valorTotalPropostas = 0;
  
  // Buscar propostas dos clientes deste vendedor
  if (clientesIds.length > 0) {
    for (const clienteId of clientesIds) {
      const q = query(collection(db, 'propostas'), where('clienteId', '==', clienteId));
      const snapshot = await getDocs(q);
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        propostasEnviadas++;
        if (data.resposta === 'sim') {
          propostasAceitas++;
          valorTotalPropostas += data.valor || 0;
        }
      });
    }
  }
  
  const comissaoTotal = valorTotalPropostas * (vendedor.comissaoPercent / 100);
  
  return {
    totalClientes: clientesIds.length,
    propostasEnviadas,
    propostasAceitas,
    valorTotalPropostas,
    comissaoTotal
  };
}