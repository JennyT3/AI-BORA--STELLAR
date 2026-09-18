import { db } from './firebase';
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { generateId } from './firebase';

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  mobile?: string;
  message?: string;
  negocio?: string;
  source?: string;
  type?: string;
  status?: string;
  createdAt: string;
}

export async function createContact(data: Partial<Contact>): Promise<string> {
  const id = generateId();
  await setDoc(doc(db, 'contacts', id), {
    ...data,
    createdAt: new Date().toISOString()
  });
  return id;
}

export async function getContact(id: string): Promise<Contact | null> {
  const docSnap = await getDoc(doc(db, 'contacts', id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Contact;
  }
  return null;
}

export async function updateContact(id: string, data: Partial<Contact>): Promise<void> {
  await updateDoc(doc(db, 'contacts', id), {
    ...data,
    updatedAt: new Date().toISOString()
  });
}

export async function deleteContact(id: string): Promise<void> {
  await deleteDoc(doc(db, 'contacts', id));
}

export async function listContacts(limitNum = 100): Promise<Contact[]> {
  const q = query(collection(db, 'contacts'), orderBy('createdAt', 'desc'), limit(limitNum));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Contact));
}

export async function listContactsBySource(source: string): Promise<Contact[]> {
  const q = query(collection(db, 'contacts'), where('source', '==', source), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Contact));
}

export async function searchContacts(searchTerm: string): Promise<Contact[]> {
  const allContacts = await listContacts(500);
  const term = searchTerm.toLowerCase();
  return allContacts.filter(c => 
    c.name?.toLowerCase().includes(term) ||
    c.email?.toLowerCase().includes(term) ||
    c.message?.toLowerCase().includes(term)
  );
}