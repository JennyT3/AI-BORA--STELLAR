import { db } from './firebase';
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { generateId } from './firebase';

export interface Contacto {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  telemovel?: string;
  mensagem?: string;
  negocio?: string;
  origem?: string;
  tipo?: string;
  status?: string;
  createdAt: string;
}

export async function createContacto(data: Partial<Contacto>): Promise<string> {
  const id = generateId();
  await setDoc(doc(db, 'contactos', id), {
    ...data,
    createdAt: new Date().toISOString()
  });
  return id;
}

export async function getContacto(id: string): Promise<Contacto | null> {
  const docSnap = await getDoc(doc(db, 'contactos', id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Contacto;
  }
  return null;
}

export async function updateContacto(id: string, data: Partial<Contacto>): Promise<void> {
  await updateDoc(doc(db, 'contactos', id), {
    ...data,
    updatedAt: new Date().toISOString()
  });
}

export async function deleteContacto(id: string): Promise<void> {
  await deleteDoc(doc(db, 'contactos', id));
}

export async function listContactos(limitNum = 100): Promise<Contacto[]> {
  const q = query(collection(db, 'contactos'), orderBy('createdAt', 'desc'), limit(limitNum));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Contacto));
}

export async function listContactosByOrigem(origem: string): Promise<Contacto[]> {
  const q = query(collection(db, 'contactos'), where('origem', '==', origem), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Contacto));
}

export async function searchContactos(searchTerm: string): Promise<Contacto[]> {
  const allContactos = await listContactos(500);
  const term = searchTerm.toLowerCase();
  return allContactos.filter(c => 
    c.nome?.toLowerCase().includes(term) ||
    c.email?.toLowerCase().includes(term) ||
    c.mensagem?.toLowerCase().includes(term)
  );
}