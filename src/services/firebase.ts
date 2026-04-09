import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut, User } from 'firebase/auth';
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
// UTILITÁRIOS
// ============================================

export function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// Alias para backward compatibility
export const generateProposalId = generateId;

// ============================================
// RE-EXPORT DOS MÓDULOS (BACKWARD COMPATIBILITY)
// ============================================

export * from './proposals';
export * from './clientes';
export * from './tareas';
export * from './contactos';

// NOTE: Vendedores functions - imported directly from vendedores.ts
// import { listVendedoresAtivos, delegarClienteAVendedor } from './vendedores';

// Re-export for backward compatibility
import { listVendedoresAtivos, delegarClienteAVendedor } from './vendedores';
export { listVendedoresAtivos, delegarClienteAVendedor };

// ============================================
// EMAILS E LOGS (ainda em firebase.ts por dependências)
// ============================================

import { collection, setDoc } from 'firebase/firestore';

export async function createRegistoEmail(data: Partial<any>): Promise<string> {
  const id = 'email-' + generateId();
  await setDoc(doc(db, 'registos_email', id), {
    ...data,
    id,
    dataEnvio: new Date().toISOString()
  });
  return id;
}

export async function listRegistosEmailByCliente(clienteId: string): Promise<any[]> {
  const { query, where, orderBy, getDocs } = await import('firebase/firestore');
  const q = query(collection(db, 'registos_email'), where('clienteId', '==', clienteId), orderBy('dataEnvio', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createFaturaMensalLocal(data: Partial<any>): Promise<string> {
  const id = 'fat-' + generateId();
  await setDoc(doc(db, 'faturas_recorrentes'), {
    ...data,
    id,
    createdAt: new Date().toISOString()
  });
  return id;
}

export async function updateFaturaStatus(id: string, status: string): Promise<void> {
  const { updateDoc, doc } = await import('firebase/firestore');
  await updateDoc(doc(db, 'faturas_recorrentes', id), {
    status,
    updatedAt: new Date().toISOString()
  });
}

export async function listFaturasByCliente(clienteId: string): Promise<any[]> {
  const { query, where, orderBy, getDocs } = await import('firebase/firestore');
  const q = query(collection(db, 'faturas_recorrentes'), where('clienteId', '==', clienteId), orderBy('dueDate', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}