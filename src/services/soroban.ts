import * as StellarSdk from '@stellar/stellar-sdk';

const CONTRACT_ID = 'CBUTZRV7YSJAYQTVSP3NSEDW3URRVCH3WDJQOXYASYQRNZFSLSIGROU5';
const AGENT_REGISTRY_ID = 'CCXDYLNIWJJB7VNTUWBWJOH26LUZOXKE24JWOPE7Y2E3MOTX2TC66T7M';
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
  console.log('=== storeProposalOnChain ===');
  
  // Use passed key or get from env
  const adminKey = secretKey || import.meta.env.VITE_VENDOR_SECRET;
  
  console.log('  Secret key:', adminKey ? `${adminKey.slice(0, 4)}...${adminKey.slice(-4)}` : 'NOT FOUND');
  console.log('  Proposal ID:', proposalId);
  console.log('  Client:', clientEmail);
  console.log('  Amount:', amount, 'USDC');

  if (!adminKey) {
    console.error('❌ No VITE_VENDOR_SECRET in .env');
    throw new Error('Add VITE_VENDOR_SECRET to .env file');
  }

  if (!adminKey.startsWith('S')) {
    console.error('❌ Invalid key format');
    throw new Error('Secret key must start with S');
  }

  // Convert hash to bytes
  const pdfHashBytes = hexToBytes(pdfHash);

  const args = [
    StellarSdk.nativeToScVal(proposalId, { type: 'string' }),
    StellarSdk.nativeToScVal(clientEmail, { type: 'string' }),
    StellarSdk.nativeToScVal(pdfHashBytes, { type: 'bytes' }),
    StellarSdk.nativeToScVal(BigInt(Math.round(amount * 1000000)), { type: 'i128' }), // USDC has 6 decimals
  ];

  console.log('  Calling contract store_proposal...');

  try {
    const result = await invokeContract('store_proposal', args, adminKey);
    console.log('✅ Contract result:', result);
    return result;
  } catch (err: any) {
    console.error('❌ Contract error:', err.message);
    throw err;
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
