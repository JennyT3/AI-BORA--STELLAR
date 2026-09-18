import { db } from './firebase';
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { generateId } from './firebase';

export type ClientCategory = 'potential' | 'client' | 'curious' | 'not_interested' | 'active' | 'inactive' | 'proposal_sent';

export type ClientStage = 'no_stage' | 'start' | 'in_progress' | 'in_revision' | 'approved' | 'done' | 'completed';

export interface Client {
  id: string;
  
  // Required fields for any contact
  name: string;
  email?: string;
  source?: string;
  
  // Optional contact fields
  mobile?: string;
  taxId?: string;
  company?: string;
  website?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  
  // Classification — mainly for clients
  category: ClientCategory;
  stage: ClientStage;
  
  // Notes and follow-up
  notes?: string;
  salesRepNotes?: string;
  lastContactDate?: string;
  
  // Links to other documents
  salesRepId?: string;
  createdBy?: string;
  requestId?: string;
  proposalId?: string;
  quoteIds?: string[];
  proposalIds?: string[];
  invoiceIds?: string[];
  serviceIds?: string[];
  
  // Client response
  response?: string;
  responseDate?: string;
  notInterested?: boolean;
  notInterestedReason?: string;
  tags?: string[];
  
  // Metadata
  services?: string[];
  tasks?: string[];
  createdAt: string;
  updatedAt?: string;
  recordUrl?: string;
  
  // Metrics
  totalBilled?: number;
  quoteCount?: number;
  
  // Import audit fields
  importedBy?: string;
  importedAt?: string;
}

export async function createClient(data: Partial<Client>): Promise<string> {
  const id = generateId();
  const now = new Date().toISOString();
  const docData = {
    ...data,
    createdAt: now,
    updatedAt: now,
    stage: data.stage || 'no_stage',
    totalBilled: 0,
    quoteCount: 0,
    quoteIds: [],
    proposalIds: [],
    invoiceIds: [],
    serviceIds: []
  };
  await setDoc(doc(db, 'clients', id), docData);
  return id;
}

export async function getClient(id: string): Promise<Client | null> {
  const docSnap = await getDoc(doc(db, 'clients', id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Client;
  }
  return null;
}

export async function updateClient(id: string, data: Partial<Client>): Promise<void> {
  await updateDoc(doc(db, 'clients', id), {
    ...data,
    updatedAt: new Date().toISOString()
  });
}

export async function deleteClient(id: string): Promise<void> {
  await deleteDoc(doc(db, 'clients', id));
}

export async function listClients(limitNum = 100): Promise<Client[]> {
  try {
    const q = query(collection(db, 'clients'), orderBy('createdAt', 'desc'), limit(limitNum));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Client));
  } catch (error) {
    console.error('Failed to list clients with ordering:', error);
    // Fallback: list without ordering if index is missing
    const q = query(collection(db, 'clients'), limit(limitNum));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Client))
      .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  }
}

export async function listClientsBySalesRep(salesRepId: string): Promise<Client[]> {
  const q = query(collection(db, 'clients'), where('salesRepId', '==', salesRepId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Client));
}

export async function getClientByProposalId(proposalId: string): Promise<Client | null> {
  const q = query(collection(db, 'clients'), where('proposalId', '==', proposalId), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Client;
}

export async function getClientByEmail(email: string): Promise<Client | null> {
  const q = query(collection(db, 'clients'), where('email', '==', email), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Client;
}

export async function searchClients(searchTerm: string): Promise<Client[]> {
  const allClients = await listClients(500);
  const term = searchTerm.toLowerCase();
  return allClients.filter(c => 
    c.name?.toLowerCase().includes(term) ||
    c.email?.toLowerCase().includes(term) ||
    c.company?.toLowerCase().includes(term) ||
    c.mobile?.includes(term)
  );
}

export async function delegateClientToSalesRep(clientId: string, salesRepId: string): Promise<void> {
  await updateDoc(doc(db, 'clients', clientId), {
    salesRepId
  });
}

// ============================================
// IMPORT WITH DEDUPLICATION (UPSERT)
// ============================================

export interface UpsertClientResult {
  clientId: string;
  wasCreated: boolean;
  wasUpdated: boolean;
  isDuplicate: boolean;
  existingSalesRepId?: string;
  existingSalesRepName?: string;
}

export interface ImportResult {
  success: number;
  updated: number;
  created: number;
  errors: number;
  details: { name: string; email: string; result: string; error?: string }[];
}

// Deduplication: nif → email → telemovel
async function findClientByKeys(taxId?: string, email?: string, mobile?: string): Promise<Client | null> {
  // 1. Match by NIF (highest priority)
  if (taxId) {
    const qTaxId = query(collection(db, 'clients'), where('taxId', '==', taxId), limit(1));
    const snapTaxId = await getDocs(qTaxId);
    if (!snapTaxId.empty) {
      return { id: snapTaxId.docs[0].id, ...snapTaxId.docs[0].data() } as Client;
    }
  }
  
  // 2. Match by email
  if (email) {
    const qEmail = query(collection(db, 'clients'), where('email', '==', email), limit(1));
    const snapEmail = await getDocs(qEmail);
    if (!snapEmail.empty) {
      return { id: snapEmail.docs[0].id, ...snapEmail.docs[0].data() } as Client;
    }
  }
  
  // 3. Match by telemovel
  if (mobile) {
    // Primary field is `mobile`; fall back to legacy `phone` field for older docs.
    const qMobile = query(collection(db, 'clients'), where('mobile', '==', mobile), limit(1));
    const snapMobile = await getDocs(qMobile);
    if (!snapMobile.empty) {
      return { id: snapMobile.docs[0].id, ...snapMobile.docs[0].data() } as Client;
    }
    const qTel = query(collection(db, 'clients'), where('phone', '==', mobile), limit(1));
    const snapTel = await getDocs(qTel);
    if (!snapTel.empty) {
      return { id: snapTel.docs[0].id, ...snapTel.docs[0].data() } as Client;
    }
  }
  
  return null;
}

// Main upsert for importing clients
export async function upsertClient(data: {
  name: string;
  email?: string;
  mobile?: string;
  taxId?: string;
  company?: string;
  website?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  category?: ClientCategory;
  stage?: ClientStage;
  source: string;
  salesRepNotes?: string;
  lastContactDate?: string;
  services?: string[];
  salesRepId: string;
  importedBy?: string;
}, salesRepId: string): Promise<UpsertClientResult> {
  
  // Normalize fields to avoid issues with numbers from Excel
  const name = data.name != null ? String(data.name).trim() : '';
  const email = data.email != null ? String(data.email).trim().toLowerCase() : '';
  const mobile = data.mobile != null ? String(data.mobile).trim() : '';
  const taxId = data.taxId != null ? String(data.taxId).trim() : '';
  const postalCode = data.postalCode != null ? String(data.postalCode).trim() : '';
  const source = data.source != null ? String(data.source).trim() : '';

  if (!name) {
    throw new Error('Name is required');
  }
  if (!source) {
    throw new Error('Origin is required');
  }
  
  const now = new Date().toISOString();
  
  // Find an existing client using normalized fields
  const existente = await findClientByKeys(taxId, email, mobile);
  
  if (existente) {
    // Return duplicate info for possible delegation request
    return {
      clientId: existente.id,
      wasCreated: false,
      wasUpdated: false,
      isDuplicate: true,
      existingSalesRepId: existente.salesRepId,
      existingSalesRepName: existente.salesRepId ? 'Sales Rep ID: ' + existente.salesRepId : 'Unknown'
    };
  } else {
    // Create a new client
    const id = generateId();
    const newData: Client = {
      id,
      name,
      email,
      mobile,
      taxId,
      company: data.company != null ? String(data.company).trim() : '',
      website: data.website != null ? String(data.website).trim() : '',
      address: data.address != null ? String(data.address).trim() : '',
      postalCode,
      city: data.city != null ? String(data.city).trim() : '',
      category: data.category || 'potential',
      stage: data.stage || 'no_stage',
      source,
      salesRepNotes: data.salesRepNotes != null ? String(data.salesRepNotes).trim() : '',
      lastContactDate: data.lastContactDate || now,
      services: data.services || [],
      salesRepId,
      createdBy: data.importedBy || 'import',
      importedBy: data.importedBy,
      importedAt: now,
      createdAt: now,
      updatedAt: now,
      quoteIds: [],
      proposalIds: [],
      invoiceIds: [],
      serviceIds: [],
      totalBilled: 0,
      quoteCount: 0
    };
    
    await setDoc(doc(db, 'clients', id), newData);
    
    return {
      clientId: id,
      wasCreated: true,
      wasUpdated: false,
      isDuplicate: false
    };
  }
}

// Import multiple clients with deduplication
export async function importClients(
  clientsData: Array<{
    name: string;
    email?: string;
    mobile?: string;
    taxId?: string;
    company?: string;
    website?: string;
    address?: string;
    postalCode?: string;
    city?: string;
    category?: ClientCategory;
    source?: string;
    salesRepNotes?: string;
    services?: string[];
  }>,
  salesRepId: string,
  importedBy?: string
): Promise<ImportResult> {
  const result: ImportResult = {
    success: 0,
    updated: 0,
    created: 0,
    errors: 0,
    details: []
  };
  
  for (const data of clientsData) {
    try {
      if (!data.name?.trim()) {
        throw new Error('Name is required');
      }
      if (!data.source?.trim()) {
        throw new Error('Origin is required');
      }
      
      const upsertResult = await upsertClient(
        { ...data, source: data.source || 'Import', salesRepId, importedBy },
        salesRepId
      );
      
      if (upsertResult.wasCreated) {
        result.created++;
        result.success++;
        result.details.push({
          name: data.name,
          email: data.email || '',
          result: 'created'
        });
      } else {
        result.updated++;
        result.success++;
        result.details.push({
          name: data.name,
          email: data.email || '',
          result: 'updated'
        });
      }
    } catch (err: any) {
      result.errors++;
      result.details.push({
        name: data.name,
        email: data.email || '',
        result: 'error',
        error: err.message
      });
    }
  }
  
  return result;
}