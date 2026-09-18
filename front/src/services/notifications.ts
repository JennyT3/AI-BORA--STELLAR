import { db } from './firebase';
import { collection, doc, setDoc, getDocs, query, where, orderBy, limit, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { generateId } from './firebase';

export type NotificationType = 
  | 'new_request'
  | 'new_task_requested'
  | 'pending_delegation'
  | 'task_delivered'
  | 'proposal_accepted'
  | 'task_approved'
  | 'task_rejected'
  | 'invoice_paid'
  | 'new_client'
  | 'request_approved';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  taskId?: string;
  clientId?: string;
  salesRepId?: string;
  requestId?: string;
  createdAt: any;
}

export async function createNotification(data: {
  type: NotificationType;
  title: string;
  message: string;
  taskId?: string;
  clientId?: string;
  salesRepId?: string;
  requestId?: string;
}): Promise<string> {
  const id = generateId();
  
  await setDoc(doc(db, 'admin_notifications', id), {
    id,
    ...data,
    read: false,
    createdAt: new Date().toISOString()
  });
  
  return id;
}

export async function listNotifications(limitNum = 50): Promise<Notification[]> {
  const q = query(
    collection(db, 'admin_notifications'),
    orderBy('createdAt', 'desc'),
    limit(limitNum)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
}

export async function getUnreadNotifications(): Promise<Notification[]> {
  const q = query(
    collection(db, 'admin_notifications'),
    where('read', '==', false),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
}

export async function contarNotRead(): Promise<number> {
  const notifications = await getUnreadNotifications();
  return notifications.length;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const { updateDoc } = await import('firebase/firestore');
  await updateDoc(doc(db, 'admin_notifications', id), { read: true });
}

export async function markAllAsRead(): Promise<void> {
  const { writeBatch } = await import('firebase/firestore');
  const notifications = await getUnreadNotifications();
  
  if (notifications.length === 0) return;
  
  const batch = writeBatch(db);
  for (const n of notifications) {
    batch.update(doc(db, 'admin_notifications', n.id), { read: true });
  }
  await batch.commit();
}

export async function deleteNotification(id: string): Promise<void> {
  const { deleteDoc } = await import('firebase/firestore');
  await deleteDoc(doc(db, 'admin_notifications', id));
}

export function subscribeToNotifications(
  callback: (notifications: Notification[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'admin_notifications'),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  
  return onSnapshot(q, (snap) => {
    const notifications = snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
    callback(notifications);
  });
}

export function subscribeToNotRead(
  callback: (count: number) => void
): Unsubscribe {
  const q = query(
    collection(db, 'admin_notifications'),
    where('read', '==', false)
  );
  
  return onSnapshot(q, (snap) => {
    callback(snap.size);
  });
}

export function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    new_request: '📩',
    new_task_requested: '🙋',
    pending_delegation: '🔄',
    task_delivered: '📦',
    proposal_accepted: '✅',
    task_approved: '👏',
    task_rejected: '❌',
    invoice_paid: '💰',
    new_client: '👤',
    request_approved: '🎉'
  };
  return icons[type] || '📢';
}

export function getNotificationColor(type: NotificationType): string {
  const colors: Record<NotificationType, string> = {
    new_request: '#3b82f6',
    new_task_requested: '#8b5cf6',
    pending_delegation: '#f59e0b',
    task_delivered: '#10b981',
    proposal_accepted: '#22c55e',
    task_approved: '#06b6d4',
    task_rejected: '#ef4444',
    invoice_paid: '#eab308',
    new_client: '#ec4899',
    request_approved: '#22c55e'
  };
  return colors[type] || '#6b7280';
}