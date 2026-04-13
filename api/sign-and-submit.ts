/**
 * API Endpoint: Sign and Submit Transaction
 * 
 * SECURITY: This endpoint signs transactions with a server-side secret key.
 * The secret key is NEVER exposed to the client.
 * 
 * This is the FALLBACK method when Freighter wallet is not available.
 * For production, prefer user-managed wallets (Freighter, Albedo, etc.)
 */

import type { Request, Response } from 'express';
import * as StellarSdk from '@stellar/stellar-sdk';

const RPC_URL = 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';
const CONTRACT_ID = process.env.PROPOSAL_REGISTRY_CONTRACT || 'CBUTZRV7YSJAYQTVSP3NSEDW3URRVCH3WDJQOXYASYQRNZFSLSIGROU5';

// Server's signing key (from environment - NEVER hardcode!)
const SERVER_SECRET = process.env.VENDOR_SECRET || process.env.STELLAR_ADMIN_SECRET;
const SERVER_PUBLIC = process.env.VENDOR_PUBLIC || process.env.STELLAR_ADMIN_PUBLIC;

interface SignRequest {
  xdr?: string;                    // Pre-built XDR (optional)
  proposalId?: string;
  clientEmail?: string;
  pdfHash?: string;
  amount?: number;
  operation?: 'store_proposal' | 'execute_split';
}

export default async function handler(req: Request, res: Response) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Security check: Ensure secret key is available
  if (!SERVER_SECRET || !SERVER_SECRET.startsWith('S')) {
    console.error('[SignAndSubmit] CRITICAL: SERVER_SECRET not configured or invalid');
    return res.status(500).json({ 
      error: 'Server configuration error',
      message: 'Signing key not available. Please use Freighter wallet for client-side signing.',
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

    console.log('[SignAndSubmit] Server public key:', publicKey.slice(0, 10) + '...');

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

    // Build transaction
    let tx: StellarSdk.Transaction;

    if (body.xdr) {
      // Use pre-built XDR
      console.log('[SignAndSubmit] Using provided XDR');
      tx = StellarSdk.TransactionBuilder.fromXDR(body.xdr, NETWORK_PASSPHRASE);
    } else {
      // Build transaction from parameters
      console.log('[SignAndSubmit] Building transaction from parameters');
      
      const contract = new StellarSdk.Contract(CONTRACT_ID);
      
      // Convert hex hash to bytes
      const hashBytes = body.pdfHash 
        ? hexToBytes(body.pdfHash.startsWith('0x') ? body.pdfHash : body.pdfHash)
        : new Uint8Array(32);

      // Build operation based on type
      const operation = body.operation || 'store_proposal';
      
      let operationCall: StellarSdk.xdr.Operation;
      
      if (operation === 'store_proposal') {
        if (!body.proposalId || !body.clientEmail || !body.pdfHash || body.amount === undefined) {
          return res.status(400).json({ 
            error: 'Missing parameters for store_proposal',
            required: ['proposalId', 'clientEmail', 'pdfHash', 'amount'],
          });
        }

        operationCall = contract.call(
          'store_proposal',
          StellarSdk.nativeToScVal(body.proposalId, { type: 'string' }),
          StellarSdk.nativeToScVal(body.clientEmail, { type: 'string' }),
          StellarSdk.nativeToScVal(hashBytes, { type: 'bytes' }),
          StellarSdk.nativeToScVal(BigInt(Math.round(body.amount * 1000000)), { type: 'i128' }),
        );
      } else {
        return res.status(400).json({ 
          error: 'Unknown operation',
          supported: ['store_proposal', 'execute_split (not implemented yet)'],
        });
      }

      tx = new StellarSdk.TransactionBuilder(account, {
        fee: '100000',
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(operationCall)
        .setTimeout(60)
        .build();
    }

    // Simulate transaction first
    console.log('[SignAndSubmit] Simulating transaction...');
    const simulated = await server.simulateTransaction(tx);
    
    if (simulated.error) {
      console.error('[SignAndSubmit] Simulation failed:', simulated.error);
      return res.status(400).json({ 
        error: 'Transaction simulation failed',
        details: simulated.error,
      });
    }

    // Prepare transaction
    console.log('[SignAndSubmit] Preparing transaction...');
    const prepared = await server.prepareTransaction(tx);
    
    // Sign transaction
    console.log('[SignAndSubmit] Signing transaction...');
    prepared.sign(keypair);
    
    // Submit transaction
    console.log('[SignAndSubmit] Submitting transaction...');
    const sendResult = await server.sendTransaction(prepared);
    
    if (sendResult.status === 'ERROR') {
      console.error('[SignAndSubmit] Submission error:', sendResult.errorResultXdr);
      return res.status(500).json({ 
        error: 'Transaction submission failed',
        details: sendResult.errorResultXdr,
      });
    }

    const txHash = sendResult.hash;
    console.log('[SignAndSubmit] Transaction submitted:', txHash);

    // Wait for confirmation
    console.log('[SignAndSubmit] Waiting for confirmation...');
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