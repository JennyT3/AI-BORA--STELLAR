import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Inicializar Firebase Admin (solo una vez)
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

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Permitir CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { nome, email, especialidade } = req.body;

    if (!nome || !email || !especialidade) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Criar vendedor
    const vendedorRef = await db.collection('vendedores').add({
      nome,
      email,
      especialidade,
      status: 'pendente',
      criadoEm: new Date(),
    });

    return res.status(200).json({
      success: true,
      id: vendedorRef.id,
    });
  } catch (error) {
    console.error('Error creating vendedor:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
