/**
 * Stellar Signer Service
 * 
 * SEGURO: Nunca almacena claves privadas en el browser.
 * 
 * Flujo:
 * 1. Si el usuario tiene Freighter wallet → firma con Freighter
 * 2. Si no → envía XDR al servidor para firma server-side
 */

import * as StellarSdk from '@stellar/stellar-sdk';

const RPC_URL = 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';
const CONTRACT_ID = 'CBUTZRV7YSJAYQTVSP3NSEDW3URRVCH3WDJQOXYASYQRNZFSLSIGROU5';

// Check if Freighter is available
export async function isFreighterAvailable(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  try {
    // @ts-ignore - Freighter injects into window
    const freighter = window?.freighter;
    return freighter?.isConnected?.() || freighter?.getPublicKey?.() != null;
  } catch {
    return false;
  }
}

// Get public key from Freighter
export async function getFreighterPublicKey(): Promise<string | null> {
  try {
    // @ts-ignore
    const freighter = window?.freighter;
    if (!freighter) return null;
    
    const publicKey = await freighter.getPublicKey();
    return publicKey;
  } catch (e) {
    console.error('[Freighter] Error getting public key:', e);
    return null;
  }
}

// Sign transaction with Freighter
export async function signWithFreighter(xdr: string): Promise<{ signedXdr: string; publicKey: string } | null> {
  try {
    // @ts-ignore
    const freighter = window?.freighter;
    if (!freighter) {
      console.error('[Freighter] Not available');
      return null;
    }

    const publicKey = await freighter.getPublicKey();
    const signedXdr = await freighter.signTransaction(xdr, {
      networkPassphrase: NETWORK_PASSPHRASE,
    });

    return { signedXdr, publicKey };
  } catch (e: any) {
    console.error('[Freighter] Sign error:', e);
    return null;
  }
}

// Build unsigned transaction XDR for proposal storage
export async function buildProposalTransaction(
  proposalId: string,
  clientEmail: string,
  pdfHash: string,
  amount: number,
  sourceAddress: string
): Promise<string> {
  const server = new StellarSdk.SorobanRpc.Server(RPC_URL);
  
  // Load source account
  const account = await server.getAccount(sourceAddress);
  
  // Convert hash to bytes
  const hashBytes = hexToBytes(pdfHash);
  
  // Build contract call
  const contract = new StellarSdk.Contract(CONTRACT_ID);
  
  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: '100000',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(
      'store_proposal',
      StellarSdk.nativeToScVal(proposalId, { type: 'string' }),
      StellarSdk.nativeToScVal(clientEmail, { type: 'string' }),
      StellarSdk.nativeToScVal(hashBytes, { type: 'bytes' }),
      StellarSdk.nativeToScVal(BigInt(Math.round(amount * 1000000)), { type: 'i128' }),
    ))
    .setTimeout(30)
    .build();

  return tx.toXDR();
}

// Build unsigned transaction XDR for payment split
export async function buildSplitTransaction(
  paymentId: string,
  adminAddress: string,
  collaboratorAddress: string,
  tokenAddress: string,
  sourceAddress: string
): Promise<string> {
  const server = new StellarSdk.SorobanRpc.Server(RPC_URL);
  
  const account = await server.getAccount(sourceAddress);
  
  const contract = new StellarSdk.Contract(CONTRACT_ID);
  
  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: '100000',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(
      'execute_split',
      StellarSdk.nativeToScVal(sourceAddress, { type: 'address' }),
      StellarSdk.nativeToScVal(paymentId, { type: 'string' }),
      StellarSdk.nativeToScVal(adminAddress, { type: 'address' }),
      StellarSdk.nativeToScVal(collaboratorAddress, { type: 'address' }),
    ))
    .setTimeout(30)
    .build();

  return tx.toXDR();
}

// Submit signed transaction
export async function submitSignedTransaction(signedXdr: string): Promise<{ hash: string; status: string }> {
  const server = new StellarSdk.SorobanRpc.Server(RPC_URL);
  
  const tx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  const result = await server.sendTransaction(tx);
  
  if (result.status === 'ERROR') {
    throw new Error(`Transaction failed: ${result.errorResultXdr}`);
  }
  
  // Wait for confirmation
  let finalResult = await server.getTransaction(result.hash);
  let attempts = 0;
  
  while (finalResult.status === 'NOT_FOUND' && attempts < 30) {
    await new Promise(r => setTimeout(r, 2000));
    finalResult = await server.getTransaction(result.hash);
    attempts++;
  }
  
  return {
    hash: result.hash,
    status: finalResult.status,
  };
}

// ========================================
// SERVER-SIDE SIGNING (when no Freighter)
// ========================================

export interface ServerSignRequest {
  xdr: string;
  proposalId?: string;
  clientEmail?: string;
  pdfHash?: string;
  amount?: number;
}

export interface ServerSignResponse {
  success: boolean;
  txHash?: string;
  explorerUrl?: string;
  error?: string;
}

// Send XDR to server for signing
export async function signWithServer(request: ServerSignRequest): Promise<ServerSignResponse> {
  try {
    const response = await fetch('/api/sign-and-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Server signing failed');
    }

    const result = await response.json();
    
    return {
      success: true,
      txHash: result.txHash,
      explorerUrl: `https://stellar.expert/explorer/testnet/tx/${result.txHash}`,
    };
  } catch (e: any) {
    console.error('[ServerSign] Error:', e);
    return {
      success: false,
      error: e.message,
    };
  }
}

// ========================================
// MAIN SIGNING FUNCTION
// ========================================

export interface SignResult {
  success: boolean;
  txHash?: string;
  explorerUrl?: string;
  method: 'freighter' | 'server' | 'demo';
  error?: string;
}

// Sign transaction using available method
// Priority: Freighter > Server > Demo
export async function signAndSubmitProposal(
  proposalId: string,
  clientEmail: string,
  pdfHash: string,
  amount: number
): Promise<SignResult> {
  console.log('[Signer] Starting signing process...');
  
  // Try Freighter first
  const hasFreighter = await isFreighterAvailable();
  
  if (hasFreighter) {
    console.log('[Signer] Freighter detected, attempting to sign...');
    
    try {
      const publicKey = await getFreighterPublicKey();
      if (!publicKey) {
        throw new Error('Could not get Freighter public key');
      }
      
      console.log('[Signer] Building transaction for:', publicKey);
      
      // Build unsigned XDR
      const xdr = await buildProposalTransaction(
        proposalId,
        clientEmail,
        pdfHash,
        amount,
        publicKey
      );
      
      console.log('[Signer] Asking Freighter to sign...');
      
      // Sign with Freighter
      const signResult = await signWithFreighter(xdr);
      if (!signResult) {
        throw new Error('Freighter signing failed');
      }
      
      console.log('[Signer] Submitting signed transaction...');
      
      // Submit
      const result = await submitSignedTransaction(signResult.signedXdr);
      
      return {
        success: true,
        txHash: result.hash,
        explorerUrl: `https://stellar.expert/explorer/testnet/tx/${result.hash}`,
        method: 'freighter',
      };
    } catch (e: any) {
      console.error('[Signer] Freighter error:', e);
      // Continue to server-side fallback
    }
  }
  
  // Fallback: Server-side signing
  console.log('[Signer] Using server-side signing...');
  
  const serverResult = await signWithServer({
    proposalId,
    clientEmail,
    pdfHash,
    amount,
    xdr: '', // Server will build the transaction
  });
  
  if (serverResult.success) {
    return {
      success: true,
      txHash: serverResult.txHash,
      explorerUrl: serverResult.explorerUrl,
      method: 'server',
    };
  }
  
  // Last resort: Demo mode
  console.warn('[Signer] No signing method available, using demo mode');
  return {
    success: false,
    txHash: `demo-${Date.now()}`,
    explorerUrl: 'https://stellar.expert/explorer/testnet',
    method: 'demo',
    error: serverResult.error || 'No signing method available',
  };
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