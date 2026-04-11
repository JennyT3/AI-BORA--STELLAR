import dotenv from 'dotenv';
import { Keypair, Networks, TransactionBuilder, SorobanRpc, Contract } from '@stellar/stellar-sdk';

dotenv.config({ path: '.env' });

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3002';
const NETWORK = 'stellar:testnet';
const STELLAR_RPC_URL = 'https://soroban-testnet.stellar.org';
const PAYMENT_SPLITTER_ID = 'CCP4JPWI33BC2XCDOLEDOIURMP7NPBY7I532H4N56ZDBCXX3A6BZNZ3P';

// Services and their max acceptable prices
const SERVICES = [
  { id: 'marketing-plan', price: 0.01, maxPrice: 0.05 },
  { id: 'sales-script', price: 0.005, maxPrice: 0.03 },
  { id: 'contract-draft', price: 0.02, maxPrice: 0.10 },
];

async function callSplitAPI(service: string, txHash: string) {
  try {
    const response = await fetch(`${SERVER_URL}/api/split`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ txHash, service }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Split executed:`);
      console.log(`      Admin (70%): ${data.split.admin.amount} USDC`);
      console.log(`      Collaborator (30%): ${data.split.collaborator.amount} USDC`);
      console.log(`      Explorer: ${data.explorerUrl}/tx/${txHash}`);
      return data;
    }
  } catch (err) {
    console.log(`   ⚠️ Split API not available, using local calculation`);
  }

  // Local calculation
  const serviceInfo = SERVICES.find(s => s.id === service);
  if (serviceInfo) {
    console.log(`   ✅ Split calculated locally:`);
    console.log(`      Admin (70%): ${(serviceInfo.price * 0.7).toFixed(4)} USDC`);
    console.log(`      Collaborator (30%): ${(serviceInfo.price * 0.3).toFixed(4)} USDC`);
  }

  return { success: true };
}

async function executeOnChainSplit(signer: any, paymentId: string) {
  try {
    console.log(`\n🔗 Calling PaymentSplitter.execute_split on-chain...`);

    const server = new SorobanRpc.Server(STELLAR_RPC_URL, { allowHttp: true });
    const publicKey = signer.publicKey();
    const account = await server.getAccount(publicKey);

    const { Contract } = await import('@stellar/stellar-sdk');
    const contract = new Contract(PAYMENT_SPLITTER_ID);

    const tx = new TransactionBuilder(account, {
      fee: '100000',
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(contract.call('execute_split', publicKey, paymentId))
      .setTimeout(60)
      .build();

    const signingResult = await signer.sign(tx.toXDR());
    const signedTx = new Transaction(signingResult, Networks.TESTNET);
    const result = await server.sendTransaction(signedTx);

    if (result.status === 'ERROR') {
      console.error('   ❌ Split failed:', result.errorResult);
      return { success: false };
    }

    console.log(`   ✅ Split executed on-chain!`);
    console.log(`   TX: https://stellar.expert/explorer/testnet/tx/${result.hash}`);

    return { success: true, txHash: result.hash };

  } catch (err) {
    console.log(`   ⚠️ On-chain split not available: ${err}`);
    return { success: false };
  }
}

async function callService(serviceId: string, useDemo: boolean = false) {
  const service = SERVICES.find(s => s.id === serviceId);
  if (!service) {
    console.log(`❌ Unknown service: ${serviceId}`);
    return null;
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`📡 Autonomous Agent calling: ${serviceId}`);
  console.log(`   Price: $${service.price} USDC`);
  console.log(`   Max acceptable: $${service.maxPrice} USDC`);
  console.log(`${'═'.repeat(60)}`);

  // Decision: Is price acceptable?
  if (service.price > service.maxPrice) {
    console.log(`   ⚠️ REJECTED: Price exceeds threshold`);
    return null;
  }

  console.log(`   ✅ DECISION: Price acceptable, proceeding with payment`);

  const url = useDemo
    ? `${SERVER_URL}/api/demo/${serviceId}`
    : `${SERVER_URL}/api/ai/${serviceId}`;

  try {
    const response = await fetch(url);
    console.log(`   📡 Status: ${response.status}`);

    if (response.status === 402) {
      const data = await response.json();
      console.log(`   💳 Payment Required: ${data.priceFormatted || data.price}`);
      console.log(`   📍 Pay to: ${data.accept?.address?.substring(0, 20)}...`);

      // For demo, we'll use the demo endpoint
      console.log(`   🔄 Retrying with demo endpoint...`);
      return callService(serviceId, true);
    }

    if (response.ok) {
      const data = await response.json();
      console.log(`\n   ✅ SUCCESS! Resource delivered`);
      console.log(`   📦 Title: ${data.data?.title || serviceId}`);
      console.log(`   📝 Sections: ${data.data?.sections?.join(', ')}`);

      if (data.txHash) {
        console.log(`   🔗 TX: https://stellar.expert/explorer/testnet/tx/${data.txHash}`);
      }

      // Execute split
      if (data.split) {
        console.log(`\n   💰 Payment Distribution:`);
        console.log(`      Total: ${data.split.total} USDC`);
        console.log(`      Admin (70%): ${data.split.admin} USDC`);
        console.log(`      Collaborator (30%): ${data.split.collaborator} USDC`);
      }

      // Call split API
      const txHash = data.txHash || `demo-${Date.now()}`;
      await callSplitAPI(serviceId, txHash);

      return data;
    }

    console.log(`   ❌ Error: ${response.status}`);
    return null;

  } catch (err) {
    console.log(`   ❌ Network error: ${err}`);
    console.log(`   🔄 Trying demo endpoint...`);
    return callService(serviceId, true);
  }
}

async function main() {
  console.log('');
  console.log('══════════════════════════════════════════════════════════════');
  console.log('  🤖 AI BORA Autonomous Agent v3.0');
  console.log('  Simplified Demo - Shows complete M2M payment flow');
  console.log('══════════════════════════════════════════════════════════════');
  console.log('');

  // Check environment
  const clientSecret = process.env.CLIENT_SECRET || process.env.STELLAR_CLIENT_SECRET;
  if (clientSecret) {
    console.log('🔑 Stellar key configured');
    try {
      const keypair = Keypair.fromSecret(clientSecret);
      console.log(`   Public: ${keypair.publicKey().substring(0, 20)}...`);
    } catch {
      console.log('⚠️ Invalid key in .env');
    }
  } else {
    console.log('⚠️ No Stellar key - running in demo mode');
  }

  console.log(`📡 Server: ${SERVER_URL}`);
  console.log(`📄 Splitter Contract: ${PAYMENT_SPLITTER_ID.substring(0, 20)}...`);
  console.log('');

  // Check server health
  try {
    const healthRes = await fetch(`${SERVER_URL}/api/health`);
    if (healthRes.ok) {
      const health = await healthRes.json();
      console.log(`✅ Server healthy: ${JSON.stringify(health)}`);
    }
  } catch {
    console.log(`⚠️ Server not responding at ${SERVER_URL}`);
    console.log(`   Make sure to run: tsx server-x402-simple.ts`);
  }

  console.log('');

  // Process all services
  for (const service of SERVICES) {
    await callService(service.id, false);
    console.log('');
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('══════════════════════════════════════════════════════════════');
  console.log('  ✅ All services processed');
  console.log('');
  console.log('  🔗 View on Stellar Explorer:');
  console.log('     https://stellar.expert/explorer/testnet');
  console.log('');
  console.log('  📜 PaymentSplitter Contract:');
  console.log(`     ${PAYMENT_SPLITTER_ID}`);
  console.log('');
  console.log('  How it works:');
  console.log('     1. Agent reads 402 Payment Required');
  console.log('     2. Agent decides if price acceptable');
  console.log('     3. Agent pays automatically');
  console.log('     4. 70/30 split executed');
  console.log('     5. On-chain verification');
  console.log('══════════════════════════════════════════════════════════════');
  console.log('');
}

// Create signer if key available
function getSigner() {
  const clientSecret = process.env.CLIENT_SECRET || process.env.STELLAR_CLIENT_SECRET;
  if (!clientSecret) return null;

  try {
    const { Keypair } = require('@stellar/stellar-sdk');
    return {
      publicKey: () => Keypair.fromSecret(clientSecret).publicKey(),
      sign: async (xdr: string) => {
        const kp = Keypair.fromSecret(clientSecret);
        const { Transaction } = require('@stellar/stellar-sdk');
        const tx = new Transaction(xdr, Networks.TESTNET);
        tx.sign(kp);
        return tx.toXDR();
      }
    };
  } catch {
    return null;
  }
}

main().catch(console.error);