import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import { sendConfirmationEmail } from './emailService';

export interface Solicitude {
  id?: string;
  nome: string;
  telefone: string;
  empresa?: string;
  email?: string;
  website?: string;
  observacoes?: string;
  servicos: string[];
  marcas: { nome: string; redes: string[] }[];
  origem?: string;
  status: 'pendente' | 'em-analise' | 'proposta-enviada';
  clienteId?: string;
  createdAt: string;
}

function generateId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));
  return 'sol-' + id;
}

export async function createSolicitude(data: Partial<Solicitude>): Promise<string> {
  const id = generateId();
  await setDoc(doc(db, 'solicitudes', id), {
    ...data,
    origem: data.origem || 'Website',
    status: 'pendente',
    createdAt: new Date().toISOString(),
  });

  if (data.email) {
    try {
      await sendConfirmationEmail({
        nome: data.nome,
        email: data.email,
        servicos: data.servicos || []
      });
    } catch (e) {
      console.error("Erro ao enviar email de confirmação:", e);
    }
  }

  return id;
}

export async function listSolicitudes(limitNum = 100): Promise<Solicitude[]> {
  const q = query(collection(db, 'solicitudes'), orderBy('createdAt', 'desc'), limit(limitNum));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Solicitude));
}

export async function updateSolicitudeStatus(id: string, status: Solicitude['status']): Promise<void> {
  await updateDoc(doc(db, 'solicitudes', id), { status, updatedAt: new Date().toISOString() });
}

export async function asignarVendedorASolicitude(id: string, vendedorId: string): Promise<void> {
  if (vendedorId) {
    await updateDoc(doc(db, 'solicitudes', id), { vendedorId, updatedAt: new Date().toISOString() });
  } else {
    await updateDoc(doc(db, 'solicitudes', id), { vendedorId: null, updatedAt: new Date().toISOString() });
  }
}

export async function deleteSolicitude(id: string): Promise<void> {
  await deleteDoc(doc(db, 'solicitudes', id));
}

export async function getSolicitude(id: string): Promise<Solicitude | null> {
  const docSnap = await getDoc(doc(db, 'solicitudes', id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Solicitude;
  }
  return null;
}
