import dotenv from 'dotenv';
import { Transaction, TransactionBuilder } from '@stellar/stellar-sdk';
import { x402Client, x402HTTPClient } from '@x402/fetch';
import { createEd25519Signer, getNetworkPassphrase } from '@x402/stellar';
import { ExactStellarScheme } from '@x402/stellar/exact/client';

dotenv.config({ path: '.env' });

const NETWORK = 'stellar:testnet';
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3002';
const STELLAR_PRIVATE_KEY = process.env.CLIENT_SECRET || process.env.STELLAR_CLIENT_SECRET;
const STELLAR_RPC_URL = 'https://soroban-testnet.stellar.org';

const RESOURCE_PATHS = ['marketing-plan', 'sales-script', 'contract-draft'];

async function callResource(path: string) {
  console.log(`\n📡 Calling ${SERVER_URL}/api/ai/${path}...`);
  
  const url = `${SERVER_URL}/api/ai/${path}`;
  const signer = createEd25519Signer(STELLAR_PRIVATE_KEY, NETWORK);
  const client = new x402Client().register(
    'stellar:*',
    new ExactStellarScheme(signer, { url: STELLAR_RPC_URL }),
  );
  const httpClient = new x402HTTPClient(client);
  
  try {
    const firstTry = await fetch(url);
    console.log(`   Status: ${firstTry.status}`);
    
    if (firstTry.status === 402) {
      const paymentRequired = httpClient.getPaymentRequiredResponse((name) =>
        firstTry.headers.get(name),
      );
      console.log(`   💳 Payment required: ${paymentRequired.maxAmountRequired} ${paymentRequired.asset}`);
      
      let paymentPayload = await client.createPaymentPayload(paymentRequired);
      const networkPassphrase = getNetworkPassphrase(NETWORK);
      const tx = new Transaction(paymentPayload.payload.transaction, networkPassphrase);
      const sorobanData = tx.toEnvelope().v1()?.tx()?.ext()?.sorobanData();
      
      if (sorobanData) {
        paymentPayload = {
          ...paymentPayload,
          payload: {
            ...paymentPayload.payload,
            transaction: TransactionBuilder.cloneFrom(tx, {
              fee: '1',
              sorobanData,
              networkPassphrase,
            })
              .build()
              .toXDR(),
          },
        };
      }
      
      const paymentHeaders = httpClient.encodePaymentSignatureHeader(paymentPayload);
      const paidResponse = await fetch(url, { headers: paymentHeaders });
      
      console.log(`   ✅ Paid! Status: ${paidResponse.status}`);
      if (paidResponse.ok) {
        const data = await paidResponse.json();
        console.log(`   📦 Response: ${data.data.title}`);
      }
    } else if (firstTry.ok) {
      const data = await firstTry.json();
      console.log(`   ✅ Free access: ${data.data.title}`);
    }
  } catch (err) {
    console.error(`   ❌ Error:`, err);
  }
}

async function main() {
  console.log('🧪 Testing x402 autonomous payments...\n');
  console.log(`🤖 Agent: ${STELLAR_PRIVATE_KEY ? 'configured' : 'MISSING KEY'}`);
  
  for (const path of RESOURCE_PATHS) {
    await callResource(path);
  }
  
  console.log('\n✅ All AI resources tested!');
}

main().catch(console.error);