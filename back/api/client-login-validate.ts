import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  const docRef = db.collection('client_logins').doc(String(token));
  const snap = await docRef.get();

  if (!snap.exists) {
    return res.status(400).json({ error: 'Link invalid' });
  }

  const login = snap.data();

  if (!login) {
    return res.status(400).json({ error: 'Link invalid' });
  }

  if (login.used) {
    return res.status(400).json({ error: 'Link already used' });
  }

  if (new Date(login.expiresAt) < new Date()) {
    return res.status(400).json({ error: 'Link expired' });
  }

  await docRef.update({ used: true, usedAt: new Date().toISOString() });

  return res.status(200).json({
    success: true,
    clientId: login.clientId,
    email: login.email,
  });
}