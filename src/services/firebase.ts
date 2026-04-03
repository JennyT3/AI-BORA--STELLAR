import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: "G-8T40H61S36"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Generate unique ID
export function generateProposalId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// Create new proposal
export async function createProposal(data: any): Promise<string> {
  const id = generateProposalId();
  const docData = {
    ...data,
    createdAt: new Date().toISOString(),
    validUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
  };
  await setDoc(doc(db, 'propostas', id), docData);
  return id;
}

// Get proposal by ID
export async function getProposal(id: string): Promise<any | null> {
  const docSnap = await getDoc(doc(db, 'propostas', id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

// Update proposal
export async function updateProposal(id: string, data: any): Promise<void> {
  await updateDoc(doc(db, 'propostas', id), {
    ...data,
    updatedAt: new Date().toISOString()
  });
}

// Delete proposal
export async function deleteProposal(id: string): Promise<void> {
  await deleteDoc(doc(db, 'propostas', id));
}

// List all proposals (most recent first)
export async function listProposals(limitNum: number = 50): Promise<any[]> {
  const q = query(collection(db, 'propostas'), orderBy('createdAt', 'desc'), limit(limitNum));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Check if proposal is valid (within 10 days)
export function isProposalValid(proposal: any): boolean {
  if (!proposal.validUntil) return true;
  return new Date(proposal.validUntil) > new Date();
}

export { db };