import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export { app };

const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };

// ============================================
// UTILITIES
// ============================================

export function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// Alias for backward compatibility
export const generateProposalId = generateId;

// ============================================
// RE-EXPORT MODULES (BACKWARD COMPATIBILITY)
// ============================================

export * from './proposals';
export * from './clients';
export * from './tasks';
export * from './contacts';

// NOTE: Sales rep functions - imported directly from vendedores.ts
// import { listActiveSalesReps, delegateClientToSalesRep } from './salesReps';

// Re-export for backward compatibility
import { listActiveSalesReps, delegateClientToSalesRep } from './salesReps';
export { listActiveSalesReps, delegateClientToSalesRep };

// ============================================
// EMAIL LOGS (still in firebase.ts due to dependencies)
// ============================================

export async function createRegistoEmail(data: Partial<any>): Promise<string> {
  const id = 'email-' + generateId();
  await setDoc(doc(db, 'email_records', id), {
    ...data,
    id,
    sentAt: new Date().toISOString()
  });
  return id;
}

export async function listRecordsEmailByClient(clientId: string): Promise<any[]> {
  const { query, where, orderBy, getDocs } = await import('firebase/firestore');
  const q = query(collection(db, 'email_records'), where('clientId', '==', clientId), orderBy('sentAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createInvoiceMonthlyLocal(data: Partial<any>): Promise<string> {
  const id = 'fat-' + generateId();
  await setDoc(doc(db, 'recurring_invoices', id), {
    ...data,
    id,
    createdAt: new Date().toISOString()
  });
  return id;
}

export async function updateInvoiceStatus(id: string, status: string): Promise<void> {
  const { updateDoc, doc } = await import('firebase/firestore');
  await updateDoc(doc(db, 'recurring_invoices', id), {
    status,
    updatedAt: new Date().toISOString()
  });
}

export async function listInvoicesByClient(clientId: string): Promise<any[]> {
  const { query, where, orderBy, getDocs } = await import('firebase/firestore');
  const q = query(collection(db, 'recurring_invoices'), where('clientId', '==', clientId), orderBy('dueDate', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}