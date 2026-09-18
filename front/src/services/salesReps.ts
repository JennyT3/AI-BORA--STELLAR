import { db, generateProposalId } from './firebase';
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy } from 'firebase/firestore';

export interface SalesRep {
  id: string;
  name: string;
  email: string;
  phone?: string;
  // password removed — Firebase Auth handles authentication
  commissionPercent: number; // commission % (e.g. 20 = 20%)
  active: boolean;
  createdAt: string;
  clientsIds?: string[]; // client IDs assigned to this sales rep
  fotoPerfil?: string;
  redesSociais?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    twitter?: string;
  };
  referidoBy?: string;
  referidosInvitados?: string[];
  referidosConvertidos?: number;
  nextClientBonus?: boolean;
  lastImport?: string; // Timestamp of the last import
}

// ========== VENDEDORES ==========

export async function createSalesRep(data: Omit<SalesRep, 'id'>): Promise<string> {
  const id = generateProposalId();
  const docData = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'salesReps', id), docData);
  return id;
}

export async function getSalesRep(id: string): Promise<SalesRep | null> {
  const docSnap = await getDoc(doc(db, 'salesReps', id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as SalesRep;
  }
  return null;
}

export async function getSalesRepByEmail(email: string): Promise<SalesRep | null> {
  const q = query(collection(db, 'salesReps'), where('email', '==', email));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as SalesRep;
  }
  return null;
}

export async function updateSalesRep(id: string, data: Partial<SalesRep>): Promise<void> {
  await updateDoc(doc(db, 'salesReps', id), {
    ...data,
    updatedAt: new Date().toISOString()
  });
}

export async function deleteSalesRep(id: string): Promise<void> {
  await deleteDoc(doc(db, 'salesReps', id));
}

export async function listSalesReps(): Promise<SalesRep[]> {
  const q = query(collection(db, 'salesReps'), orderBy('name', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SalesRep));
}

export async function listActiveSalesReps(): Promise<SalesRep[]> {
  const q = query(collection(db, 'salesReps'), where('active', '==', true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SalesRep));
}

export async function delegateClientToSalesRep(clientId: string, salesRepId: string): Promise<void> {
  const { updateDoc, doc } = await import('firebase/firestore');
  await updateDoc(doc(db, 'clients', clientId), {
    salesRepId
  });
}

// ========== ASSIGN CLIENTES TO VENDEDOR ==========

export async function assignClientsToSalesRep(salesRepId: string, clientsIds: string[]): Promise<void> {
  await updateSalesRep(salesRepId, { clientsIds });
}

export async function addClientToSalesRep(salesRepId: string, clientId: string): Promise<void> {
  const salesRep = await getSalesRep(salesRepId);
  if (salesRep) {
    const clientsIds = salesRep.clientsIds || [];
    if (!clientsIds.includes(clientId)) {
      await updateSalesRep(salesRepId, { clientsIds: [...clientsIds, clientId] });
    }
  }
}

export async function removeClientFromSalesRep(salesRepId: string, clientId: string): Promise<void> {
  const salesRep = await getSalesRep(salesRepId);
  if (salesRep) {
    const clientsIds = (salesRep.clientsIds || []).filter(id => id !== clientId);
    await updateSalesRep(salesRepId, { clientsIds });
  }
}

// ========== IMPORT CLIENTS FROM EXCEL (assign to sales rep) ==========

export interface DuplicadoInfo {
  clientImportedName: string;
  clientImportedTaxId: string;
  clientImportedEmail: string;
  clientExistenteId: string;
  clientExistenteName: string;
  salesRepAtualId?: string;
}

export async function importClientsForSalesRep(salesRepId: string, clientsData: any[], importedBy?: string): Promise<{ success: number; errors: string[]; updated: number; created: number; duplicados: DuplicadoInfo[] }> {
  if (!salesRepId) {
    throw new Error('Sales Rep ID is required. Please sign in again.');
  }

  const { upsertClient } = await import('./clients');
  
  let success = 0;
  let updated = 0;
  let created = 0;
  const errors: string[] = [];
  const duplicados: DuplicadoInfo[] = [];
  
  const now = new Date().toISOString();
  
  for (const client of clientsData) {
    try {
      const name = String(client.name ?? '').trim();
      const email = String(client.email ?? '').trim().toLowerCase();
      const mobile = String((client.mobile ?? client.phone ?? '')).trim();
      const taxId = String(client.taxId ?? '').trim();
      const company = String(client.company ?? '').trim();
      const website = String(client.website ?? '').trim();
      const address = String(client.address ?? '').trim();
      const postalCode = String(client.postalCode ?? '').trim();
      const city = String(client.city ?? '').trim();
      const source = String(client.source ?? 'Importado').trim();
      const salesRepNotes = String(client.salesRepNotes ?? '').trim();
      const lastContactDate = String(client.lastContactDate ?? '').trim();
      
      const result = await upsertClient({
        name,
        email: email,
        mobile: mobile,
        taxId: taxId,
        company: company,
        website: website,
        address: address,
        postalCode: postalCode,
        city: city,
        category: 'potential',
        stage: 'no_stage',
        source,
        salesRepNotes: salesRepNotes,
        lastContactDate: lastContactDate,
        services: (() => {
          if (Array.isArray(client.services)) return client.services;
          if (typeof client.services === 'string' && client.services.trim() !== '') {
            return client.services.split(';').map((s: string) => s.trim());
          }
          return [];
        })(),
        salesRepId,
        importedBy
      }, salesRepId);
      
      if (result.isDuplicate) {
        duplicados.push({
          clientImportedName: name,
          clientImportedTaxId: taxId,
          clientImportedEmail: email,
          clientExistenteId: result.clientId,
          clientExistenteName: name,
          salesRepAtualId: result.existingSalesRepId
        });
      } else if (result.wasCreated) {
        created++;
        success++;
        await addClientToSalesRep(salesRepId, result.clientId);
      } else if (result.wasUpdated) {
        updated++;
        success++;
        await addClientToSalesRep(salesRepId, result.clientId);
      }
    } catch (err: any) {
      errors.push(`Failed to import ${client.name || 'unnamed'}: ${err.message}`);
    }
  }
  
  if (success > 0) {
    await updateDoc(doc(db, 'salesReps', salesRepId), {
      lastImport: now
    });
  }
  
  return { success, errors, updated, created, duplicados };
}

// ========== VENDEDOR STATS ==========

export async function getSalesRepStats(salesRepId: string): Promise<{
  totalClients: number;
  proposalsSent: number;
  proposalsAceitas: number;
  totalProposalsAmount: number;
  commissionTotal: number;
}> {
  const salesRep = await getSalesRep(salesRepId);
  if (!salesRep) {
    return { totalClients: 0, proposalsSent: 0, proposalsAceitas: 0, totalProposalsAmount: 0, commissionTotal: 0 };
  }
  
  const clientsIds = salesRep.clientsIds || [];
  let proposalsSent = 0;
  let proposalsAceitas = 0;
  let totalProposalsAmount = 0;
  
  // Load proposals for this sales rep's clients
  if (clientsIds.length > 0) {
    for (const clientId of clientsIds) {
      const q = query(collection(db, 'proposals'), where('clientId', '==', clientId));
      const snapshot = await getDocs(q);
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        proposalsSent++;
        if (data.response === 'yes') {
          proposalsAceitas++;
          totalProposalsAmount += data.amount || 0;
        }
      });
    }
  }
  
  const commissionTotal = totalProposalsAmount * (salesRep.commissionPercent / 100);
  
  return {
    totalClients: clientsIds.length,
    proposalsSent,
    proposalsAceitas,
    totalProposalsAmount,
    commissionTotal
  };
}