// AI BORA Autonomous Agent v4.0
// x402 agent: HTTP 402 invoice → on-chain Stellar payment → service deliverable.
// Run: npx tsx agent.ts

import dotenv from 'dotenv';
dotenv.config();

import { X402Client } from './x402';

const SERVICE_BASE = process.env.SERVICE_BASE_URL || 'http://localhost:3001/api/agent-service';

const CLIENT_SECRET = process.env.CLIENT_SECRET || process.env.STELLAR_CLIENT_SECRET || process.env.VENDOR_SECRET;

const SERVICES = ['marketing-plan', 'sales-script', 'contract-draft'];

interface ServiceResult {
  success: boolean;
  service: string;
  txHash?: string;
  title?: string;
  error?: string;
}

async function runService(client: X402Client, serviceId: string): Promise<ServiceResult> {
  const serviceUrl = `${SERVICE_BASE}?service=${serviceId}`;
  console.log(`\n📡 Calling service: ${serviceId}`);
  console.log(`   URL: ${serviceUrl}`);
  console.log('========================================');

  try {
    console.log('   1. Requesting invoice (expect HTTP 402)...');
    const invoice = await client.getInvoice(serviceUrl);
    console.log(
      `   → Invoice: pay ${invoice.payment.amount} ${invoice.payment.asset} to ${invoice.payment.destination.slice(
        0,
        8
      )}... (memo: ${invoice.payment.memo})`
    );

    console.log('   2. Paying on Stellar...');
    const txHash = await client.payForService(
      serviceUrl,
      invoice.payment.destination,
      invoice.payment.amount.toFixed(7),
      invoice.payment.memo
    );
    console.log(`   ✅ Payment submitted: https://stellar.expert/explorer/testnet/tx/${txHash}`);

    console.log('   3. Redeeming the deliverable with payment proof...');
    const { payload } = await client.complete<{ title?: string }>(serviceUrl, invoice, txHash);
    console.log(`   ✅ Service complete: ${payload.title || 'deliverable received'}`);

    return { success: true, service: serviceId, txHash, title: payload.title };
  } catch (error: any) {
    console.log(`   ❌ Service failed: ${error.message}`);
    return { success: false, service: serviceId, error: error.message };
  }
}

async function main() {
  console.log('\n════════════════════════════════════════════════════');
  console.log('  AI BORA Autonomous Agent v4.0');
  console.log('  x402: 402 invoice → Stellar payment → deliverable');
  console.log('════════════════════════════════════════════════════\n');

  console.log('  This agent:');
  console.log('  1. Requests each service invoice (HTTP 402)');
  console.log('  2. Pays in XLM on Stellar');
  console.log('  3. Redeems the deliverable with on-chain proof');
  console.log('');

  if (!CLIENT_SECRET || !CLIENT_SECRET.startsWith('S')) {
    console.log('  ❌ Set CLIENT_SECRET in .env');
    console.log('  Get testnet keys from: https://laboratory.stellar.org');
    console.log('  Fund with: curl "https://friendbot.stellar.org/?addr=YOUR_PUBLIC"');
    process.exit(1);
  }

  const client = new X402Client(CLIENT_SECRET);
  console.log(`  Payer: ${client.getPublicKey().slice(0, 10)}...`);
  console.log(`  Backend: ${SERVICE_BASE}`);
  console.log('');

  console.log('  Services:');
  SERVICES.forEach((s) => console.log(`    ${s}`));
  console.log('');

  const results: ServiceResult[] = [];
  for (const service of SERVICES) {
    const result = await runService(client, service);
    results.push(result);

    if (result.success) {
      console.log('   ⏳ Waiting 2s before next service...');
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  console.log('\n════════════════════════════════════════════════════');
  console.log('  Summary:');
  console.log('════════════════════════════════════════════════════');

  let successCount = 0;
  results.forEach((r) => {
    if (r.success) {
      successCount++;
      console.log(`  ✅ ${r.service}: ${r.title}`);
      console.log(`     TX: ${r.txHash?.slice(0, 20)}...`);
    } else {
      console.log(`  ❌ ${r.service}: FAILED — ${r.error}`);
    }
  });

  console.log('');
  console.log(`  Total: ${successCount}/${SERVICES.length} services`);
  console.log('');
  console.log('  View on Stellar Expert:');
  console.log('  https://stellar.expert/explorer/testnet');
  console.log('');
}

main().catch(console.error);