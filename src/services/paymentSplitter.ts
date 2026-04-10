import * as StellarSdk from '@stellar/stellar-sdk';

const PAYMENT_SPLITTER_ID = 'CCP4JPWI33BC2XCDOLEDOIURMP7NPBY7I532H4N56ZDBCXX3A6BZNZ3P';
const RPC_URL = 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';

const server = new StellarSdk.SorobanRpc.Server(RPC_URL, { allowHttp: true });

export interface PaymentSplitResult {
  success: boolean;
  adminAmount?: string;
  collaboratorAmount?: string;
  txHash?: string;
  error?: string;
  explorerUrl?: string;
}

export async function createPaymentOnChain(
  paymentId: string,
  totalAmount: number, // in stroops (1 USDC = 10^7 stroops)
  adminSecret: string
): Promise<{ txHash: string; success: boolean }> {
  const adminKeypair = StellarSdk.Keypair.fromSecret(adminSecret);
  const adminAccount = await server.getAccount(adminKeypair.publicKey());
  
  const contract = new StellarSdk.Contract(PAYMENT_SPLITTER_ID);
  
  const tx = new StellarSdk.TransactionBuilder(adminAccount, {
    fee: '100000',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(
      'create_payment',
      adminKeypair.publicKey(),
      paymentId,
      totalAmount.toString()
    ))
    .setTimeout(60)
    .build();
  
  tx.sign(adminKeypair);
  
  const result = await server.sendTransaction(tx);
  
  if (result.status === 'PENDING') {
    const txResult = await server.getTransaction(result.hash);
    return {
      txHash: result.hash,
      success: txResult.status === 'COMMITTED'
    };
  }
  
  return { txHash: result.hash, success: true };
}

export async function executePaymentSplit(
  paymentId: string,
  adminSecret: string
): Promise<PaymentSplitResult> {
  try {
    const adminKeypair = StellarSdk.Keypair.fromSecret(adminSecret);
    const adminAccount = await server.getAccount(adminKeypair.publicKey());
    
    const contract = new StellarSdk.Contract(PAYMENT_SPLITTER_ID);
    
    const tx = new StellarSdk.TransactionBuilder(adminAccount, {
      fee: '100000',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call(
        'execute_split',
        adminKeypair.publicKey(),
        paymentId
      ))
      .setTimeout(60)
      .build();
    
    tx.sign(adminKeypair);
    
    const result = await server.sendTransaction(tx);
    
    if (result.status === 'ERROR') {
      return {
        success: false,
        error: result.errorResult?.toString() || 'Transaction failed'
      };
    }
    
    if (result.status === 'PENDING') {
      const txResult = await server.getTransaction(result.hash);
      
      // Parse the result to get the amounts
      const returnValue = txResult.resultMetaXdr?.v3()?.sorobanMeta()?.returnValue();
      const vec = returnValue?.vec();
      const adminAmt = vec ? Number(vec.get(0)?.i128()?.lo() ?? 0) : 0;
      const collabAmt = vec ? Number(vec.get(1)?.i128()?.lo() ?? 0) : 0;
      
      return {
        success: true,
        adminAmount: (adminAmt / 10_000_000).toFixed(2),
        collaboratorAmount: (collabAmt / 10_000_000).toFixed(2),
        txHash: result.hash,
        explorerUrl: `https://stellar.expert/explorer/testnet/tx/${result.hash}`
      };
    }
    
    return {
      success: true,
      txHash: result.hash,
      explorerUrl: `https://stellar.expert/explorer/testnet/tx/${result.hash}`
    };
    
  } catch (err: any) {
    console.error('executePaymentSplit error:', err);
    return {
      success: false,
      error: err.message || 'Unknown error'
    };
  }
}

export async function getPaymentFromChain(paymentId: string): Promise<{
  totalAmount: string;
  adminAmount: string;
  collaboratorAmount: string;
  status: string;
} | null> {
  try {
    const contract = new StellarSdk.Contract(PAYMENT_SPLITTER_ID);
    
    const result = await server.simulateTransaction(
      new StellarSdk.TransactionBuilder(server.getBaseUrl(), {
        fee: '10000',
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .appendOperation(contract.call('get_payment', paymentId))
        .setTimeout(30)
        .build()
    );
    
    // Parse result...
    return {
      totalAmount: '0',
      adminAmount: '0',
      collaboratorAmount: '0',
      status: 'pending'
    };
  } catch (err) {
    console.error('getPaymentFromChain error:', err);
    return null;
  }
}

export { PAYMENT_SPLITTER_ID };