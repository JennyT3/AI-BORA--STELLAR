/**
 * API Endpoint: Sign and Submit Transaction
 *
 * SECURITY (Phase 1 fix):
 * - Blind signing of arbitrary client XDR has been REMOVED. This endpoint no
 *   longer accepts `xdr` from the client. Building transactions from arbitrary
 *   client input let anyone drain the server wallet on Mainnet.
 * - Requests MUST provide the shared secret in the `x-api-key` header, matched
 *   against `INTERNAL_API_KEY`. If that variable is not configured, this
 *   endpoint refuses to run (safe-by-default).
 * - CORS is restricted to known origins (no more `*`).
 * - This remains a FALLBACK only for the testnet. For production, prefer
 *   user-managed wallets (Freighter, Albedo) or server-side trusted flows.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as StellarSdk from '@stellar/stellar-sdk';

const RPC_URL = 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';
const CONTRACT_ID = process.env.PROPOSAL_REGISTRY_CONTRACT || 'CBUTZRV7YSJAYQTVSP3NSEDW3URRVCH3WDJQOXYASYQRNZFSLSIGROU5';

// Server's signing key (from environment - NEVER hardcode!)
const SERVER_SECRET = process.env.VENDOR_SECRET || process.env.STELLAR_ADMIN_SECRET;
const SERVER_PUBLIC = process.env.VENDOR_PUBLIC || process.env.STELLAR_ADMIN_PUBLIC;

// Shared internal API key. Endpoint is DISABLED unless configured.
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173',
  'https://ai-bora-stellar.vercel.app',
  'https://ai-bora-staging.vercel.app',
];

interface SignRequest {
  proposalId?: string;
  clientEmail?: string;
  pdfHash?: string;
  amount?: number;
  operation?: 'store_proposal';
}

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  return ALLOWED_ORIGINS.includes(origin);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers - restricted to known origins only
  const origin = req.headers.origin;
  if (isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Api-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Security: require the shared internal API key to invoke this endpoint
  if (!INTERNAL_API_KEY) {
    console.error('[SignAndSubmit] DISABLED: INTERNAL_API_KEY not configured');
    return res.status(503).json({
      error: 'Endpoint disabled',
      message: 'INTERNAL_API_KEY is not configured on the server.',
    });
  }
  const providedKey = req.headers['x-api-key'] as string | undefined;
  if (!providedKey || providedKey !== INTERNAL_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Security check: Ensure secret key is available
if (!SERVER_SECRET || !SERVER_SECRET.startsWith('S')) {
      console.error('[SignAndSubmit] CRITICAL: SERVER_SECRET not configured or invalid');
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'Signing key not available. Please use Freighter wallet for client-side signing.',
      });
    }
    if (!SERVER_PUBLIC || !SERVER_PUBLIC.startsWith('G')) {
      console.error('[SignAndSubmit] CRITICAL: SERVER_PUBLIC not configured');
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'VENDOR_PUBLIC (server public key) not configured.',
      });
    }

  const body: SignRequest = req.body;

  try {
    console.log('[SignAndSubmit] Starting...');
    console.log('[SignAndSubmit] Operation:', body.operation || 'store_proposal');
    console.log('[SignAndSubmit] Proposal ID:', body.proposalId);

    // Initialize Soroban server
    const server = new StellarSdk.SorobanRpc.Server(RPC_URL);
    const keypair = StellarSdk.Keypair.fromSecret(SERVER_SECRET);
    const publicKey = keypair.publicKey();

    // Load account
    let account: StellarSdk.Account;
    try {
      account = await server.getAccount(publicKey);
      console.log('[SignAndSubmit] Account loaded, sequence:', account.sequenceNumber());
    } catch (e: any) {
      console.error('[SignAndSubmit] Account load failed:', e.message);
      return res.status(500).json({
        error: 'Account not found',
        message: 'Server account not funded. Run friendbot.',
        publicKey,
      });
    }

    // SECURITY: Transactions are ALWAYS built server-side from validated
    // parameters. Arbitrary client XDR is never accepted or signed.
    const operation = body.operation || 'store_proposal';

    if (operation !== 'store_proposal') {
      return res.status(400).json({
        error: 'Unknown operation',
        supported: ['store_proposal'],
      });
    }

    if (!body.proposalId || !body.clientEmail || !body.pdfHash || body.amount === undefined) {
      return res.status(400).json({
        error: 'Missing parameters for store_proposal',
        required: ['proposalId', 'clientEmail', 'pdfHash', 'amount'],
      });
    }

    if (body.amount <= 0 || isNaN(body.amount)) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Basic input validation
    const clientEmail = String(body.clientEmail).trim();
    if (!clientEmail.includes('@')) {
      return res.status(400).json({ error: 'Invalid clientEmail' });
    }
    const pdfHash = String(body.pdfHash).trim();
    if (!pdfHash || !/^[0-9a-fA-F]{32,128}$/.test(pdfHash.replace(/^0x/, ''))) {
      return res.status(400).json({ error: 'Invalid pdfHash (expect SHA-256 hex)' });
    }

    const contract = new StellarSdk.Contract(CONTRACT_ID);

    // Convert hex hash to bytes
    const hashBytes = hexToBytes(pdfHash.startsWith('0x') ? pdfHash : pdfHash);
    if (hashBytes.length !== 32) {
      return res.status(400).json({ error: 'pdfHash must be 32 bytes for SHA-256' });
    }

    const operationCall = contract.call(
      'store_proposal',
      StellarSdk.nativeToScVal(publicKey, { type: 'address' }),
      StellarSdk.nativeToScVal(body.proposalId, { type: 'string' }),
      StellarSdk.nativeToScVal(clientEmail, { type: 'string' }),
      StellarSdk.nativeToScVal(hashBytes, { type: 'bytes' }),
      StellarSdk.nativeToScVal(BigInt(Math.round(body.amount * 1000000)), { type: 'i128' }),
    );

    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: '100000',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(operationCall)
      .setTimeout(60)
      .build();

    // Simulate transaction first
    const simulated = await server.simulateTransaction(tx);
    if ('error' in simulated) {
      console.error('[SignAndSubmit] Simulation failed:', simulated.error);
      return res.status(400).json({
        error: 'Transaction simulation failed',
        details: simulated.error,
      });
    }

    // Prepare transaction
    const prepared = await server.prepareTransaction(tx);

    // Sign transaction
    prepared.sign(keypair);

    // Submit transaction
    const sendResult = await server.sendTransaction(prepared);

    if (sendResult.status === 'ERROR') {
      console.error('[SignAndSubmit] Submission error:', sendResult.errorResult);
      return res.status(500).json({
        error: 'Transaction submission failed',
        details: sendResult.errorResult,
      });
    }

    const txHash = sendResult.hash;
    console.log('[SignAndSubmit] Transaction submitted:', txHash);

    // Wait for confirmation
    let finalResult = await server.getTransaction(txHash);
    let attempts = 0;
    while (finalResult.status === 'NOT_FOUND' && attempts < 30) {
      await new Promise(r => setTimeout(r, 2000));
      finalResult = await server.getTransaction(txHash);
      attempts++;
      console.log(`[SignAndSubmit] Confirmation attempt ${attempts}, status: ${finalResult.status}`);
    }

    if (finalResult.status !== 'SUCCESS') {
      console.error('[SignAndSubmit] Transaction not successful:', finalResult.status);
      return res.status(500).json({
        error: 'Transaction failed',
        status: finalResult.status,
        txHash,
      });
    }

    console.log('[SignAndSubmit] ✅ Transaction confirmed!');

    // Return success
    res.status(200).json({
      success: true,
      txHash,
      explorerUrl: `https://stellar.expert/explorer/testnet/tx/${txHash}`,
      status: finalResult.status,
      signer: publicKey.slice(0, 10) + '...',
      method: 'server-side',
    });
  } catch (error: any) {
    console.error('[SignAndSubmit] Unexpected error:', error);

    // Sanitize error message for client
    const safeMessage = error.message?.includes('secret')
      ? 'Internal server error'
      : error.message;

    res.status(500).json({
      error: 'Transaction processing failed',
      message: safeMessage,
    });
  }
}

// Helper: hex string to bytes
function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16);
  }
  return bytes;
}