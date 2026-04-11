// ============================================================
// AI BORA - Payment Splitter Service
// Handles 70/30 splits between company and collaborator
// ============================================================

import * as StellarSdk from '@stellar/stellar-sdk';

// Configuration
const RPC_URL = 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';
const server = new StellarSdk.SorobanRpc.Server(RPC_URL);

// Split percentages
const COMPANY_PERCENTAGE = 0.70; // 70%
const COLLABORATOR_PERCENTAGE = 0.30; // 30%

// Vendor account (gets 70%)
const COMPANY_SECRET = process.env.VENDOR_SECRET || process.env.VITE_VENDOR_SECRET || '';
const COMPANY_PUBLIC = process.env.VENDOR_PUBLIC || 'GDQX74MG4TVG7BBZCLDCOEOQX2PADCTRUIDAWG5KLIQ64LYURC5XC7CN';

// Collaborator account (gets 30%) - configurable
const COLLABORATOR_PUBLIC = process.env.COLLABORATOR_PUBLIC || 'GBMQWA3M4BLSM6HH4SIPVB4AL4F4LJUWYGS22G3EBUBIZYDY4HNCYGY2';

export interface SplitResult {
  success: boolean;
  total: number;
  companyAmount: number;
  collaboratorAmount: number;
  companyTxHash?: string;
  collaboratorTxHash?: string;
  error?: string;
}

export async function distributePayment(amount: number, collaboratorAddress?: string): Promise<SplitResult> {
  if (amount <= 0) {
    return { success: false, total: amount, companyAmount: 0, collaboratorAmount: 0, error: 'Invalid amount' };
  }

  const companyAmount = Number((amount * COMPANY_PERCENTAGE).toFixed(4));
  const collaboratorAmount = Number((amount * COLLABORATOR_PERCENTAGE).toFixed(4));
  const collaborator = collaboratorAddress || COLLABORATOR_PUBLIC;

  console.log(`💸 Splitting payment: ${amount} XLM`);
  console.log(`   Company (70%): ${companyAmount} XLM → ${COMPANY_PUBLIC.slice(0, 12)}...`);
  console.log(`   Collaborator (30%): ${collaboratorAmount} XLM → ${collaborator.slice(0, 12)}...`);

  // Check if we have a real secret key
  const hasSecret = COMPANY_SECRET.startsWith('SC');

  if (!hasSecret) {
    // Demo mode - simulate the split
    console.log(`   ⚠️ Demo mode - simulating split`);
    return {
      success: true,
      total: amount,
      companyAmount,
      collaboratorAmount,
      companyTxHash: `demo-company-${Date.now()}`,
      collaboratorTxHash: `demo-collab-${Date.now()}`
    };
  }

  try {
    const keypair = StellarSdk.Keypair.fromSecret(COMPANY_SECRET);
    
    // Get source account
    const sourceAccount = await server.getAccount(keypair.publicKey());

    // Create a single transaction with 2 payments (batch for efficiency)
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: '200', // Higher fee for 2 operations
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      // First: Pay to collaborator (30%)
      .addOperation(StellarSdk.Operation.payment({
        destination: collaborator,
        asset: StellarSdk.Asset.native(),
        amount: collaboratorAmount.toString(),
      }))
      .setTimeout(30)
      .build();

    const preparedTx = await server.prepareTransaction(transaction);
    preparedTx.sign(keypair);
    
    const result = await server.sendTransaction(preparedTx);
    
    console.log(`   ✅ Split complete!`);
    console.log(`      TX: ${result.hash}`);

    return {
      success: true,
      total: amount,
      companyAmount,
      collaboratorAmount,
      companyTxHash: 'internal-transfer', // Company keeps the rest
      collaboratorTxHash: result.hash
    };

  } catch (error: any) {
    console.error(`   ❌ Split failed:`, error.message);
    return {
      success: false,
      total: amount,
      companyAmount,
      collaboratorAmount,
      error: error.message
    };
  }
}

// Calculate split without executing (for display)
export function calculateSplit(amount: number): { total: number; company: number; collaborator: number; companyPercent: number; collaboratorPercent: number } {
  return {
    total: amount,
    company: Number((amount * COMPANY_PERCENTAGE).toFixed(4)),
    collaborator: Number((amount * COLLABORATOR_PERCENTAGE).toFixed(4)),
    companyPercent: COMPANY_PERCENTAGE * 100,
    collaboratorPercent: COLLABORATOR_PERCENTAGE * 100
  };
}

// Demo/test function
export async function testSplit(): Promise<void> {
  console.log('\n🧪 Testing Payment Split...\n');
  
  const amounts = [0.01, 0.1, 1];
  
  for (const amount of amounts) {
    console.log(`\n--- Testing ${amount} XLM split ---`);
    const result = await distributePayment(amount);
    console.log(`Result:`, JSON.stringify(result, null, 2));
  }
}

// Run if executed directly
if (require.main === module) {
  testSplit().then(() => {
    console.log('\n✅ Tests complete');
    process.exit(0);
  }).catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
  });
}

export default { distributePayment, calculateSplit, testSplit };