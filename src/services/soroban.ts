import * as StellarSdk from '@stellar/stellar-sdk';

const CONTRACT_ID = 'CBUTZRV7YSJAYQTVSP3NSEDW3URRVCH3WDJQOXYASYQRNZFSLSIGROU5';
const RPC_URL = 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';

const server = new StellarSdk.SorobanRpc.Server(RPC_URL);

async function waitForTransaction(hash: string, retries = 20): Promise<StellarSdk.SorobanRpc.GetTransactionResponse> {
  for (let i = 0; i < retries; i++) {
    const result = await server.getTransaction(hash);
    if (result.status !== 'NOT_FOUND') return result;
    await new Promise(r => setTimeout(r, 2000));
  }
  throw new Error('Transaction timeout');
}

export interface InvokeContractResult {
  txHash: string;
  success: boolean;
  explorerUrl: string;
}

export async function invokeContract(
  method: string,
  args: StellarSdk.xdr.ScVal[],
  secretKey: string
): Promise<InvokeContractResult> {
  console.log('--- START invokeContract ---');
  console.log('Method:', method);
  
  const sourceKeypair = StellarSdk.Keypair.fromSecret(secretKey);
  const publicKey = sourceKeypair.publicKey();
  console.log('1. Source Public Key:', publicKey);

  let sourceAccount;
  try {
    sourceAccount = await server.getAccount(publicKey);
    console.log('2. Source Account loaded, sequence:', sourceAccount.sequenceNumber());
  } catch (accErr) {
    console.error('❌ Error loading account:', accErr);
    throw new Error(`Failed to load account ${publicKey}. Is it funded on testnet?`);
  }

  const contract = new StellarSdk.Contract(CONTRACT_ID);
  console.log('3. Contract ID:', CONTRACT_ID);

  const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: '100000',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  console.log('4. Transaction built');

  let prepared;
  try {
    prepared = await server.prepareTransaction(tx);
    console.log('5. Transaction prepared (simulation successful)');
  } catch (prepErr: any) {
    console.error('❌ Simulation/Preparation failed:', prepErr);
    // Extraer detalles si es posible
    if (prepErr.response?.data) {
        console.error('Detail:', JSON.stringify(prepErr.response.data));
    }
    throw prepErr;
  }

  prepared.sign(sourceKeypair);
  console.log('6. Transaction signed');

  // ENVIAR TRANSACCIÓN
  console.log('7. Sending to network...');
  const response = await server.sendTransaction(prepared);

  if (response.status === 'ERROR') {
    console.error('❌ Submission ERROR:', response.errorResultXdr);
    throw new Error('Transaction submission error: ' + response.status);
  }

  const txHash = response.hash;
  console.log('✅ Transaction submitted! Hash:', txHash);
  const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${txHash}`;

  // AHORA intentar esperar confirmación
  let success = false;
  try {
    console.log('8. Waiting for confirmation...');
    const waitResponse = await waitForTransaction(txHash);
    success = waitResponse.status === 'SUCCESS';
    console.log('🏁 Confirmation status:', waitResponse.status);
    if (!success) {
        console.error('❌ Transaction failed execution:', waitResponse.resultXdr);
    }
  } catch (waitError) {
    console.warn('⚠️ Wait failed, but hash is preserved:', txHash);
  }

  return { txHash, success, explorerUrl };
}

/**
 * Convierte un string hexadecimal a Uint8Array (bytes)
 * Compatible con navegador (no usa Buffer de Node.js)
 */
function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16);
  }
  return bytes;
}

export async function storeProposalOnChain(
  proposalId: string,
  clientEmail: string,
  pdfHash: string,
  amount: number,
  secretKey: string
): Promise<InvokeContractResult | null> {
  const adminKey = secretKey || import.meta.env.VITE_STELLAR_ADMIN_SECRET;
  if (!adminKey) {
      console.error('❌ No STELLAR_ADMIN_SECRET found in env or localStorage');
      throw new Error('No admin secret key configured');
  }

  console.log('Preparing store_proposal args...');
  console.log('  proposalId:', proposalId);
  console.log('  clientEmail:', clientEmail);
  console.log('  pdfHash (hex):', pdfHash);
  console.log('  amount:', amount);

  // Convertir el hash hexadecimal a bytes
  const pdfHashBytes = hexToBytes(pdfHash);
  console.log('  pdfHash (bytes):', new TextEncoder().encode(pdfHashBytes.toString()).toString());

  const args = [
    // id: String (proposal_id)
    StellarSdk.nativeToScVal(proposalId, { type: 'string' }),
    // client_email: String
    StellarSdk.nativeToScVal(clientEmail, { type: 'string' }),
    // pdf_hash: Bytes
    StellarSdk.nativeToScVal(pdfHashBytes, { type: 'bytes' }),
    // amount: i128 (BigInt)
    StellarSdk.nativeToScVal(BigInt(Math.round(amount)), { type: 'i128' }),
  ];

  console.log('Arguments prepared successfully');

  try {
    return await invokeContract('store_proposal', args, adminKey);
  } catch (err: any) {
    console.error('❌ storeProposalOnChain top-level error:', err.message || err);
    return null;
  }
}

export async function updateProposalStatus(
  proposalId: string,
  newStatus: string,
  secretKey: string
): Promise<void> {
  const adminKey = secretKey || import.meta.env.VITE_STELLAR_ADMIN_SECRET;
  if (!adminKey) return;

  const args = [
    // id: String
    StellarSdk.nativeToScVal(proposalId, { type: 'string' }),
    // new_status: String
    StellarSdk.nativeToScVal(newStatus, { type: 'string' }),
  ];

  try {
    await invokeContract('update_status', args, adminKey);
    console.log('✅ Status updated on chain:', newStatus);
  } catch (err: any) {
    console.warn('⚠️ Status update failed (non-critical):', err.message);
  }
}

export async function getProposalFromChain(proposalId: string): Promise<any> {
  try {
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const account = await server.getAccount(import.meta.env.VITE_STELLAR_ADMIN_PUBLIC || '');
    
    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: '100',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call('get_proposal', StellarSdk.nativeToScVal(proposalId, { type: 'string' })))
      .setTimeout(10)
      .build();

    const simResult = await server.simulateTransaction(tx);
    if ('result' in simResult && simResult.result) {
      return StellarSdk.scValToNative(simResult.result.retval);
    }
    return null;
  } catch {
    return null;
  }
}
