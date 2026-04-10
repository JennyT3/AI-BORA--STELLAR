import * as StellarSdk from '@stellar/stellar-sdk';

const CONTRACT_ID = 'CBUTZRV7YSJAYQTVSP3NSEDW3URRVCH3WDJQOXYASYQRNZFSLSIGROU5';
const RPC_URL = 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';

const server = new StellarSdk.SorobanRpc.Server(RPC_URL, { allowHttp: true });

async function waitForTransaction(hash: string, retries = 20): Promise<StellarSdk.SorobanRpc.GetTransactionResponse> {
  for (let i = 0; i < retries; i++) {
    const result = await server.getTransaction(hash);
    if (result.status !== 'NOT_FOUND') return result;
    await new Promise(r => setTimeout(r, 2000));
  }
  throw new Error('Transaction timeout');
}

export async function invokeContract(
  method: string,
  args: StellarSdk.xdr.ScVal[],
  secretKey: string
): Promise<any> {
  const sourceKeypair = StellarSdk.Keypair.fromSecret(secretKey);
  const sourceAccount = await server.getAccount(sourceKeypair.publicKey());
  const contract = new StellarSdk.Contract(CONTRACT_ID);

  const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: '100000',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const prepared = await server.prepareTransaction(tx);
  prepared.sign(sourceKeypair);

  const response = await server.sendTransaction(prepared);

  if (response.status === 'ERROR') {
    throw new Error('Transaction error: ' + response.errorResult?.toString());
  }

  const result = await waitForTransaction(response.hash);
  return result;
}

export async function storeProposalOnChain(
  proposalId: string,
  clientEmail: string,
  pdfHash: string,
  amount: number,
  secretKey: string
): Promise<{ txHash: string; explorerUrl: string }> {
  const adminKey = secretKey || import.meta.env.VITE_STELLAR_ADMIN_SECRET;
  if (!adminKey) throw new Error('No admin secret key configured');

  const args = [
    StellarSdk.nativeToScVal(proposalId, { type: 'string' }),
    StellarSdk.nativeToScVal(clientEmail, { type: 'string' }),
    StellarSdk.nativeToScVal(pdfHash, { type: 'string' }),
    StellarSdk.nativeToScVal(Math.round(amount * 10_000_000), { type: 'i128' }),
  ];

  try {
    const result = await invokeContract('store_proposal', args, adminKey);
    const txHash = result.hash || '';
    console.log('✅ Proposal stored on chain:', txHash);
    return {
      txHash,
      explorerUrl: `https://stellar.expert/explorer/testnet/tx/${txHash}`
    };
  } catch (err: any) {
    console.warn('⚠️ Blockchain storage failed (non-critical):', err.message);
    return { txHash: '', explorerUrl: '' };
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
    StellarSdk.nativeToScVal(proposalId, { type: 'string' }),
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
