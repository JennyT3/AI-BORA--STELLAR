import { db } from './firebase';
import { collection, doc, setDoc, getDoc, updateDoc, query, where, getDocs, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { generateId } from './firebase';

export interface ClienteLogin {
  id: string;
  clienteId: string;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

export async function gerarMagicLink(clienteId: string, email: string): Promise<string> {
  const token = generateId() + '-' + Math.random().toString(36).substring(2, 15);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
  const loginData: ClienteLogin = {
    id: generateId(),
    clienteId,
    token,
    expiresAt,
    used: false,
    createdAt: new Date()
  };
  
  await setDoc(doc(db, 'cliente_logins', loginData.id), loginData);
  
  return token;
}

export async function validarMagicLink(token: string): Promise<{ clienteId: string; email: string } | null> {
  const q = query(
    collection(db, 'cliente_logins'),
    where('token', '==', token),
    where('used', '==', false),
    limit(1)
  );
  
  const snap = await getDocs(q);
  
  if (snap.empty) {
    return null;
  }
  
  const loginData = snap.docs[0].data() as ClienteLogin;
  
  if (new Date() > new Date(loginData.expiresAt)) {
    return null;
  }
  
  const clienteDoc = await getDoc(doc(db, 'clientes', loginData.clienteId));
  if (!clienteDoc.exists()) {
    return null;
  }
  
  const clienteData = clienteDoc.data();
  
  return {
    clienteId: loginData.clienteId,
    email: clienteData.email || ''
  };
}

export async function usarMagicLink(loginId: string): Promise<void> {
  await updateDoc(doc(db, 'cliente_logins', loginId), {
    used: true,
    usedAt: new Date()
  });
}

export async function getClienteLoginByToken(token: string): Promise<ClienteLogin | null> {
  const q = query(
    collection(db, 'cliente_logins'),
    where('token', '==', token),
    limit(1)
  );
  
  const snap = await getDocs(q);
  
  if (snap.empty) {
    return null;
  }
  
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as ClienteLogin;
}

export async function invalidateOldTokens(clienteId: string): Promise<void> {
  const q = query(
    collection(db, 'cliente_logins'),
    where('clienteId', '==', clienteId),
    where('used', '==', false)
  );
  
  const snap = await getDocs(q);
  
  const { updateDoc, writeBatch } = await import('firebase/firestore');
  const batch = writeBatch(db);
  
  snap.docs.forEach(doc => {
    batch.update(doc.ref, { used: true, invalidatedAt: new Date() });
  });
  
  await batch.commit();
}