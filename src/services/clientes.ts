import { db } from './firebase';
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { generateId } from './firebase';

export type ClienteCategoria = 'potencial' | 'cliente' | 'curioso' | 'sem_interesse' | 'ativo' | 'inativo' | 'proposta_enviada';

export type ClienteProcesso = 'sem_processo' | 'inicio' | 'em_progresso' | 'em_revisao' | 'aprovado' | 'feito' | 'concluido';

export interface Cliente {
  id: string;
  
  // Datos obligatorios para cualquier contacto
  nome: string;
  email?: string;
  origem?: string;
  
  // Datos opcionales de contacto
  telemovel?: string;
  nif?: string;
  empresa?: string;
  website?: string;
  morada?: string;
  codigoPostal?: string;
  cidade?: string;
  
  // Clasificación - solo cambia para clientes
  categoria: ClienteCategoria;
  processo: ClienteProcesso;
  
  // Notas y seguimiento
  observacoes?: string;
  notasVendedor?: string;
  dataUltimoContacto?: string;
  
  // Relaciones con documentos
  vendedorId?: string;
  criadoPor?: string;
  solicitacaoId?: string;
  orcamentoIds?: string[];
  propostaIds?: string[];
  faturaIds?: string[];
  servicoIds?: string[];
  
  // Respuesta del cliente
  resposta?: string;
  dataResposta?: string;
  
  // Metadatos
  servicos?: string[];
  tarefas?: string[];
  criadoEm?: string;
  createdAt: string;
  updatedAt?: string;
  fichaUrl?: string;
  
  // Métricas
  totalFacturado?: number;
  numeroOrcamentos?: number;
  
  // Auditoría de importación
  importadoPor?: string;
  dataImportacao?: string;
}

export async function createCliente(data: Partial<Cliente>): Promise<string> {
  const id = generateId();
  const now = new Date().toISOString();
  const docData = {
    ...data,
    createdAt: now,
    updatedAt: now,
    processo: data.processo || 'sem_processo',
    totalFacturado: 0,
    numeroOrcamentos: 0,
    orcamentoIds: [],
    propostaIds: [],
    faturaIds: [],
    servicoIds: []
  };
  await setDoc(doc(db, 'clientes', id), docData);
  return id;
}

export async function getCliente(id: string): Promise<Cliente | null> {
  const docSnap = await getDoc(doc(db, 'clientes', id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Cliente;
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
  try {
    const q = query(collection(db, 'clientes'), orderBy('createdAt', 'desc'), limit(limitNum));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Cliente));
  } catch (error) {
    console.error("Erro ao listar clientes com ordenação:", error);
    // Fallback: tentar listar sem ordenação (caso falte o índice)
    const q = query(collection(db, 'clientes'), limit(limitNum));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Cliente))
      .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  }
}

export async function listClientesByVendedor(vendedorId: string): Promise<Cliente[]> {
  const q = query(collection(db, 'clientes'), where('vendedorId', '==', vendedorId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Cliente));
}

export async function getClienteByPropostaId(propostaId: string): Promise<Cliente | null> {
  const q = query(collection(db, 'clientes'), where('propostaId', '==', propostaId), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Cliente;
}

export async function getClienteByEmail(email: string): Promise<Cliente | null> {
  const q = query(collection(db, 'clientes'), where('email', '==', email), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Cliente;
}

export async function searchClientes(searchTerm: string): Promise<Cliente[]> {
  const allClientes = await listClientes(500);
  const term = searchTerm.toLowerCase();
  return allClientes.filter(c => 
    c.nome?.toLowerCase().includes(term) ||
    c.email?.toLowerCase().includes(term) ||
    c.empresa?.toLowerCase().includes(term) ||
    c.telemovel?.includes(term)
  );
}

export async function delegarClienteAVendedor(clienteId: string, vendedorId: string): Promise<void> {
  await updateDoc(doc(db, 'clientes', clienteId), {
    vendedorId
  });
}

// ============================================
// IMPORTACIÓN CON DEDUPLICACIÓN (UPSERT)
// ============================================

export interface UpsertClienteResult {
  clienteId: string;
  wasCreated: boolean;
  wasUpdated: boolean;
}

export interface ImportResult {
  sucesso: number;
  atualizados: number;
  criados: number;
  erros: number;
  detalles: { nome: string; email: string; resultado: string; erro?: string }[];
}

// Función de deduplicación mejorada: nif → email → telemovel
async function findClienteByKeys(nif?: string, email?: string, telemovel?: string): Promise<Cliente | null> {
  // 1. Buscar por NIF (prioridad más alta)
  if (nif) {
    const qNif = query(collection(db, 'clientes'), where('nif', '==', nif), limit(1));
    const snapNif = await getDocs(qNif);
    if (!snapNif.empty) {
      return { id: snapNif.docs[0].id, ...snapNif.docs[0].data() } as Cliente;
    }
  }
  
  // 2. Buscar por email
  if (email) {
    const qEmail = query(collection(db, 'clientes'), where('email', '==', email), limit(1));
    const snapEmail = await getDocs(qEmail);
    if (!snapEmail.empty) {
      return { id: snapEmail.docs[0].id, ...snapEmail.docs[0].data() } as Cliente;
    }
  }
  
  // 3. Buscar por telemovel
  if (telemovel) {
    const qTel = query(collection(db, 'clientes'), where('telemovel', '==', telemovel), limit(1));
    const snapTel = await getDocs(qTel);
    if (!snapTel.empty) {
      return { id: snapTel.docs[0].id, ...snapTel.docs[0].data() } as Cliente;
    }
  }
  
  return null;
}

// Función principal de upsert para importar clientes
export async function upsertCliente(data: {
  nome: string;
  email?: string;
  telemovel?: string;
  nif?: string;
  empresa?: string;
  website?: string;
  morada?: string;
  codigoPostal?: string;
  cidade?: string;
  categoria?: ClienteCategoria;
  processo?: ClienteProcesso;
  origem: string;
  notasVendedor?: string;
  dataUltimoContacto?: string;
  servicos?: string[];
  vendedorId: string;
  importadoPor?: string;
}, vendedorId: string): Promise<UpsertClienteResult> {
  
  // Normalizar campos para evitar erros com números vindos do Excel
  const nome = data.nome != null ? String(data.nome).trim() : '';
  const email = data.email != null ? String(data.email).trim().toLowerCase() : '';
  const telemovel = data.telemovel != null ? String(data.telemovel).trim() : '';
  const nif = data.nif != null ? String(data.nif).trim() : '';
  const codigoPostal = data.codigoPostal != null ? String(data.codigoPostal).trim() : '';
  const origem = data.origem != null ? String(data.origem).trim() : '';

  // Validar campos obrigatórios
  if (!nome) {
    throw new Error('Nome é obrigatório');
  }
  if (!origem) {
    throw new Error('Origem é obrigatória');
  }
  
  const now = new Date().toISOString();
  
  // Buscar cliente existente usando variáveis normalizadas
  const existente = await findClienteByKeys(nif, email, telemovel);
  
  if (existente) {
    // Actualizar cliente existente
    const updateData: Partial<Cliente> = {
      ...data,
      nome,
      email: email || undefined,
      telemovel: telemovel || undefined,
      nif: nif || undefined,
      codigoPostal: codigoPostal || undefined,
      origem,
      updatedAt: now,
      // Actualizar notas pero no borrar las existentes
      notasVendedor: existente.notasVendedor 
        ? `${existente.notasVendedor}\n[${now}] ${data.notasVendedor || ''}`
        : data.notasVendedor,
      dataUltimoContacto: data.dataUltimoContacto || now,
      // Asignar vendedor si no lo tenía
      vendedorId: existente.vendedorId || vendedorId
    };
    
    await updateDoc(doc(db, 'clientes', existente.id), updateData);
    
    return {
      clienteId: existente.id,
      wasCreated: false,
      wasUpdated: true
    };
  } else {
    // Crear nuevo cliente
    const id = generateId();
    const newData: Cliente = {
      id,
      nome,
      email: email || undefined,
      telemovel: telemovel || undefined,
      nif: nif || undefined,
      empresa: data.empresa != null ? String(data.empresa).trim() : undefined,
      website: data.website != null ? String(data.website).trim() : undefined,
      morada: data.morada != null ? String(data.morada).trim() : undefined,
      codigoPostal: codigoPostal || undefined,
      cidade: data.cidade != null ? String(data.cidade).trim() : undefined,
      categoria: data.categoria || 'potencial',
      processo: data.processo || 'sem_processo',
      origem,
      notasVendedor: data.notasVendedor != null ? String(data.notasVendedor).trim() : undefined,
      dataUltimoContacto: data.dataUltimoContacto || now,
      servicos: data.servicos || [],
      vendedorId,
      criadoPor: data.importadoPor || 'importacao',
      importadoPor: data.importadoPor,
      dataImportacao: now,
      createdAt: now,
      updatedAt: now,
      orcamentoIds: [],
      propostaIds: [],
      faturaIds: [],
      servicoIds: [],
      totalFacturado: 0,
      numeroOrcamentos: 0
    };
    
    await setDoc(doc(db, 'clientes', id), newData);
    
    return {
      clienteId: id,
      wasCreated: true,
      wasUpdated: false
    };
  }
}

// Función para importar múltiples clientes con deduplicación
export async function importarClientes(
  clientesData: Array<{
    nome: string;
    email?: string;
    telemovel?: string;
    nif?: string;
    empresa?: string;
    website?: string;
    morada?: string;
    codigoPostal?: string;
    cidade?: string;
    categoria?: ClienteCategoria;
    origem?: string;
    notasVendedor?: string;
    servicos?: string[];
  }>,
  vendedorId: string,
  importadoPor?: string
): Promise<ImportResult> {
  const result: ImportResult = {
    sucesso: 0,
    atualizados: 0,
    criados: 0,
    erros: 0,
    detalles: []
  };
  
  for (const data of clientesData) {
    try {
      // Validar campos obligatorios
      if (!data.nome?.trim()) {
        throw new Error('Nome é obrigatório');
      }
      if (!data.origem?.trim()) {
        throw new Error('Origem é obrigatória');
      }
      
      const upsertResult = await upsertCliente(
        { ...data, origem: data.origem || 'Importação', vendedorId, importadoPor },
        vendedorId
      );
      
      if (upsertResult.wasCreated) {
        result.criados++;
        result.sucesso++;
        result.detalles.push({
          nome: data.nome,
          email: data.email || '',
          resultado: 'criado'
        });
      } else {
        result.atualizados++;
        result.sucesso++;
        result.detalles.push({
          nome: data.nome,
          email: data.email || '',
          resultado: 'atualizado'
        });
      }
    } catch (err: any) {
      result.erros++;
      result.detalles.push({
        nome: data.nome,
        email: data.email || '',
        resultado: 'erro',
        erro: err.message
      });
    }
  }
  
  return result;
}