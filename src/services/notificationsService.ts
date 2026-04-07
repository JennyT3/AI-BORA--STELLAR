import { db } from './firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';

export interface PendingNotification {
  id?: string;
  tipo: 'confirmacion' | 'proposta' | 'resposta' | 'vendedor_access' | 'admin_alert';
  destinatario: string;
  asunto: string;
  mensaje: string;
  datos?: Record<string, any>;
  estado?: string;
  createdAt?: any;
  enviadaAt?: any;
}

const COLLECTION = 'notificacoes_pendentes';

export async function queueNotification(data: Omit<PendingNotification, 'id' | 'createdAt' | 'estado'>): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    estado: 'pendente',
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getPendingNotifications(limitCount = 50): Promise<PendingNotification[]> {
  const q = query(
    collection(db, COLLECTION),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PendingNotification));
}

export interface AdminAlertData {
  tipo: 'nova_solicitacao' | 'nova_proposta' | 'proposta_aceite' | 'proposta_rejeitada' | 'novo_cliente';
  entidade: string;
  detalhes: string;
}

export async function sendAdminAlert(data: AdminAlertData): Promise<boolean> {
  const mensagemMap: Record<string, string> = {
    nova_solicitacao: `📬 Nova solicitação de ${data.entidade}`,
    nova_proposta: `📄 Nova proposta de ${data.entidade}`,
    proposta_aceite: `✅ Proposta ACEITE de ${data.entidade}`,
    proposta_rejeitada: `❌ Proposta REJEITADA de ${data.entidade}`,
    novo_cliente: `👤 Novo cliente: ${data.entidade}`,
  };

  await queueNotification({
    tipo: 'admin_alert',
    destinatario: 'admin@aibora.pt',
    asunto: mensagemMap[data.tipo] || 'Alerta AI BORA',
    mensaje: data.detalhes,
  });
  return true;
}