/**
 * API Endpoint: Register a Pollar user + custodial wallet.
 *
 * Registers an AI BORA collaborator/vendor on Pollar so they hold a custodial
 * Stellar wallet that can RECEIVE the 30% share paid by the on-chain
 * PaymentSplitter. Once funded, the collaborator can off-ramp it to local fiat
 * (Mobile Money / bank) with the SEP-24 flow driven by @pollar/core in the
 * browser.
 *
 * Requires POLLAR_SECRET_KEY (server-side only). Never expose it via VITE_*.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { registerPollarUser, isPollarConfigured } from '../services/pollar.js';

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173',
  'https://ai-bora-stellar.vercel.app',
  'https://ai-bora-staging.vercel.app',
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!isPollarConfigured()) {
    return res.status(503).json({
      success: false,
      error: 'Pollar is not configured',
      message: 'POLLAR_SECRET_KEY is missing on the server.',
    });
  }

  const { externalId, email, firstName, lastName } = req.body || {};

  if (!externalId || typeof externalId !== 'string' || externalId.length > 255) {
    return res.status(400).json({ error: 'externalId (string, <=255 chars) is required' });
  }

  if (email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  try {
    const result = await registerPollarUser({ externalId, email, firstName, lastName, withWallet: true });

    return res.status(201).json({
      success: true,
      userId: result.userId,
      pollarWallet: result.walletAddress || null,
      funded: result.funded === true,
      message: 'Pollar user registered with custodial wallet',
    });
  } catch (error: any) {
    console.error('Pollar register error:', error);
    const status = typeof error?.status === 'number' ? error.status : 502;
    return res.status(status).json({
      success: false,
      error: error?.code || 'POLLAR_REGISTER_FAILED',
      message: error?.message || 'Failed to register Pollar user',
    });
  }
}