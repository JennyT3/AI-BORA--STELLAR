import { db } from './firebase';
import { collection, doc, setDoc, getDoc, updateDoc, query, where, getDocs, orderBy, serverTimestamp } from 'firebase/firestore';
import { generateId } from './firebase';

export type DelegationStatus = 'pending' | 'approved' | 'rejected';

export interface ClientDelegation {
  clientId: string;
  clientName: string;
  salesRepAtualId?: string;
  taxId: string;
  email: string;
}

export interface DelegationRequest {
  id: string;
  salesRepRequesterId: string;
  salesRepRequesterName: string;
  adminId?: string;
  status: DelegationStatus;
  clientsRequested: ClientDelegation[];
  totalClients: number;
  requestDate: any;
  responseDate?: any;
  reasonRejeicao?: string;
}

export async function createDelegationRequest(
  salesRepRequesterId: string,
  salesRepRequesterName: string,
  duplicados: ClientDelegation[]
): Promise<string> {
  const id = generateId();
  
  await setDoc(doc(db, 'delegation_requests', id), {
    id,
    salesRepRequesterId,
    salesRepRequesterName,
    status: 'pending',
    clientsRequested: duplicados,
    totalClients: duplicados.length,
    requestDate: serverTimestamp()
  });
  
  return id;
}

export async function listPendingDelegationRequests(): Promise<DelegationRequest[]> {
  const q = query(
    collection(db, 'delegation_requests'),
    where('status', '==', 'pending'),
    orderBy('dataSolicitacao', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as DelegationRequest));
}

export async function listAllDelegationRequests(): Promise<DelegationRequest[]> {
  const q = query(
    collection(db, 'delegation_requests'),
    orderBy('dataSolicitacao', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as DelegationRequest));
}

export async function getDelegationRequest(id: string): Promise<DelegationRequest | null> {
  const docSnap = await getDoc(doc(db, 'delegation_requests', id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as DelegationRequest;
  }
  return null;
}

export async function aprovarDelegation(
  requestId: string,
  adminId: string
): Promise<void> {
  const request = await getDelegationRequest(requestId);
  if (!request) {
    throw new Error('Request not found');
  }
  
  const { writeBatch } = await import('firebase/firestore');
  const batch = writeBatch(db);
  
  for (const client of request.clientsRequested) {
    const clientRef = doc(db, 'clients', client.clientId);
    batch.update(clientRef, {
      salesRepId: request.salesRepRequesterId,
      updatedAt: new Date().toISOString()
    });
  }
  
  const requestRef = doc(db, 'delegation_requests', requestId);
  batch.update(requestRef, {
    status: 'approved',
    adminId,
    responseDate: serverTimestamp()
  });
  
  await batch.commit();
}

export async function rejeitarDelegation(
  requestId: string,
  adminId: string,
  reasonRejeicao: string
): Promise<void> {
  await updateDoc(doc(db, 'delegation_requests', requestId), {
    status: 'rejected',
    adminId,
    responseDate: serverTimestamp(),
    reasonRejeicao
  });
}