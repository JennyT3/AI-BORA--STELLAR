/**
 * API Endpoint: Verify a Pollar SDK access token server-side.
 *
 * The browser completes a Pollar login with @pollar/core (email OTP, etc.) and
 * receives an access token. This endpoint validates that token against the
 * Pollar SERVER API and returns the user + wallet, so the AI BORA backend can
 * authorize a collaborator's off-ramp and record their Pollar Stellar address.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyPollarToken, isPollarConfigured } from '../services/pollar.js';

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

  const { token } = req.body || {};
  if (!token || typeof token !== 'string' || !token.trim()) {
    return res.status(400).json({ error: 'token is required' });
  }

  try {
    const result = await verifyPollarToken(token.trim());

    return res.status(200).json({
      success: true,
      userId: result.userId,
      network: result.network,
      wallet: result.wallet || null,
      profile: result.profile || null,
    });
  } catch (error: any) {
    console.error('Pollar verify error:', error);
    const status = typeof error?.status === 'number' ? error.status : 502;
    return res.status(status).json({
      success: false,
      error: error?.code || 'POLLAR_VERIFY_FAILED',
      message: error?.message || 'Failed to verify Pollar token',
    });
  }
}