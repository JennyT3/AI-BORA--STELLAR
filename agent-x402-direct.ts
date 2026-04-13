// AI BORA Autonomous Agent v3.0
// Direct Stellar payment (bypassing x402 library for native XLM)
// Run: npx tsx agent-x402-direct.ts

import dotenv from 'dotenv';
dotenv.config();

import { Keypair, Horizon, TransactionBuilder, Operation, Networks, Asset, BASE_FEE, Memo } from '@stellar/stellar-sdk';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const NETWORK_PASSPHRASE = Networks.TESTNET;
const horizon = new Horizon.Server(HORIZON_URL);

const VENDOR_PUBLIC = process.env.VENDOR_PUBLIC || 'GDQX74MG4TVG7BBZCLDCOEOQX2PADCTRUIDAWG5KLIQ64LYURC5XC7CN';
const CLIENT_SECRET = process.env.CLIENT_SECRET || process.env.STELLAR_CLIENT_SECRET || process.env.VENDOR_SECRET;

const MAX_PRICES: Record<string, number> = {
  'marketing-plan': 0.05,
  'sales-script': 0.03,
  'contract-draft': 0.10,
};

const SERVICES = ['marketing-plan', 'sales-script', 'contract-draft'];

async function payAndCallService(serviceId: string) {
  console.log(`\n📡 Calling service: ${serviceId}`);
  console.log('========================================');
  
  if (!CLIENT_SECRET || !CLIENT_SECRET.startsWith('S')) {
    console.log('❌ No CLIENT_SECRET configured');
    console.log('Add to .env: CLIENT_SECRET=S...');
    return { success: false };
  }

  const price = MAX_PRICES[serviceId] || 0.05;
  const amountStroops = Math.floor(price * 10_000_000);

  console.log(`   Price: ${price} XLM`);
  console.log(`   Paying to: ${VENDOR_PUBLIC}`);
  
  try {
    const keypair = Keypair.fromSecret(CLIENT_SECRET);
    const account = await horizon.loadAccount(keypair.publicKey());
    
    console.log(`   ✅ Account loaded: ${keypair.publicKey().slice(0, 10)}...`);
    
    // Build transaction
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(Operation.payment({
        destination: VENDOR_PUBLIC,
        asset: Asset.native(),
        amount: price.toString(),
      }))
      .addMemo(Memo.text(`AI-BORA:${serviceId}`))
      .setTimeout(30)
      .build();
    
    tx.sign(keypair);
    
    console.log(`   📡 Submitting payment to Stellar...`);
    
    const result = await horizon.submitTransaction(tx);
    
    console.log('\n   ✅ PAYMENT SUCCESSFUL!');
    console.log(`   TX Hash: ${result.hash}`);
    console.log(`   Explorer: https://stellar.expert/explorer/testnet/tx/${result.hash}`);
    
    return {
      success: true,
      txHash: result.hash,
      service: serviceId,
      price,
      paidTo: VENDOR_PUBLIC
    };
    
  } catch (error: any) {
    console.log(`   ❌ Payment failed:`, error.message);
    
    if (error.response?.data?.extras?.result_codes) {
      console.log('   Result:', error.response.data.extras.result_codes);
    }
    
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('\n════════════════════════════════════════════════════');
  console.log('  AI BORA Autonomous Agent v3.0');
  console.log('  Direct Stellar Payment (NativeXLM)');
  console.log('════════════════════════════════════════════════════\n');
  
  console.log('  This agent:');
  console.log('  1. Pays directly with XLM to vendor');
  console.log('  2. No x402 library overhead');
  console.log('  3. Simple Horizon API call');
  console.log('');
  
  console.log(`  Client: ${CLIENT_SECRET ? 'configured ✓' : 'NOT CONFIGURED ✗'}`);
  console.log(`  Vendor: ${VENDOR_PUBLIC}`);
  console.log('');
  
  if (!CLIENT_SECRET) {
    console.log('  ❌ Set CLIENT_SECRET in .env');
    console.log('  Get testnet keys from: https://laboratory.stellar.org');
    console.log('  Fund with: curl "https://friendbot.stellar.org/?addr=YOUR_PUBLIC"');
    process.exit(1);
  }

  console.log('  Services:');
  SERVICES.forEach(s => {
    console.log(`    ${s}: ${MAX_PRICES[s]} XLM`);
  });
  console.log('');
  
  const results = [];
  
  for (const service of SERVICES) {
    const result = await payAndCallService(service);
    results.push({ service, result });
    
    // Wait a bit between services
    if (result.success) {
      console.log('   ⏳ Waiting 2s before next service...');
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  
  console.log('\n════════════════════════════════════════════════════');
  console.log('  Summary:');
  console.log('════════════════════════════════════════════════════');
  
  let totalPaid = 0;
  let successCount = 0;
  
  results.forEach(({ service, result }) => {
    if (result.success) {
      totalPaid += result.price;
      successCount++;
      console.log(`  ✅ ${service}: ${result.price} XLM`);
      console.log(`     TX: ${result.txHash?.slice(0, 20)}...`);
    } else {
      console.log(`  ❌ ${service}: FAILED`);
    }
  });
  
  console.log('');
  console.log(`  Total: ${successCount}/${SERVICES.length} services`);
  console.log(`  Total paid: ${totalPaid} XLM`);
  console.log('');
  console.log('  View on Stellar Expert:');
  console.log('  https://stellar.expert/explorer/testnet');
  console.log('');
}

main().catch(console.error);