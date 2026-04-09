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
  ultimaImportacao?: string; // Timestamp de última importación
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

export async function importarClientesParaVendedor(vendedorId: string, clientesData: any[], importadoPor?: string): Promise<{ sucesso: number; erros: string[]; atualizados: number; criados: number }> {
  // Importar la función de clientes
  const { upsertCliente } = await import('./clientes');
  
  let sucesso = 0;
  let atualizados = 0;
  let criados = 0;
  const erros: string[] = [];
  
  const now = new Date().toISOString();
  
  for (const cliente of clientesData) {
    try {
      // Normalizar TODOS los campos con ?? para evitar undefined
      const nome = String(cliente.nome ?? '').trim();
      const email = String(cliente.email ?? '').trim().toLowerCase();
      const telemovel = String((cliente.telemovel ?? cliente.telefone ?? '')).trim();
      const nif = String(cliente.nif ?? '').trim();
      const empresa = String(cliente.empresa ?? '').trim();
      const website = String(cliente.website ?? '').trim();
      const morada = String(cliente.morada ?? '').trim();
      const codigoPostal = String(cliente.codigoPostal ?? '').trim();
      const cidade = String(cliente.cidade ?? '').trim();
      const origem = String(cliente.origem ?? 'Importado').trim();
      const notasVendedor = String(cliente.notasVendedor ?? '').trim();
      const dataUltimoContacto = String(cliente.dataUltimoContacto ?? '').trim();
      
      // Usar la función de upsert con deduplicación
      const result = await upsertCliente({
        nome,
        email: email || undefined,
        telemovel: telemovel || undefined,
        nif: nif || undefined,
        empresa: empresa || undefined,
        website: website || undefined,
        morada: morada || undefined,
        codigoPostal: codigoPostal || undefined,
        cidade: cidade || undefined,
        categoria: 'potencial',
        processo: 'sem_processo',
        origem,
        notasVendedor: notasVendedor || undefined,
        dataUltimoContacto: dataUltimoContacto || undefined,
        servicos: (() => {
          if (Array.isArray(cliente.servicos)) return cliente.servicos;
          if (typeof cliente.servicos === 'string' && cliente.servicos.trim() !== '') {
            return cliente.servicos.split(';').map((s: string) => s.trim());
          }
          return [];
        })(),
        vendedorId,
        importadoPor
      }, vendedorId);
      
      if (result.wasCreated) {
        criados++;
      } else {
        atualizados++;
      }
      sucesso++;
      
      // Adicionar ID do cliente ao vendedor
      await addClienteAVendedor(vendedorId, result.clienteId);
    } catch (err: any) {
      erros.push(`Erro ao importar ${cliente.nome || 'sem nome'}: ${err.message}`);
    }
  }
  
  // Actualizar timestamp de última importación
  if (sucesso > 0) {
    await updateDoc(doc(db, 'vendedores', vendedorId), {
      ultimaImportacao: now
    });
  }
  
  return { sucesso, erros, atualizados, criados };
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