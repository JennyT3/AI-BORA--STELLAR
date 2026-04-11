import dotenv from 'dotenv';
import { Transaction, TransactionBuilder } from '@stellar/stellar-sdk';
import { x402Client, x402HTTPClient } from '@x402/fetch';
import { createEd25519Signer, getNetworkPassphrase } from '@x402/stellar';
import { ExactStellarScheme } from '@x402/stellar/exact/client';

dotenv.config({ path: '.env' });

const NETWORK = 'stellar:testnet';
const STELLAR_RPC_URL = 'https://soroban-testnet.stellar.org';
const PAYMENT_SPLITTER_ID = 'CCP4JPWI33BC2XCDOLEDOIURMP7NPBY7I532H4N56ZDBCXX3A6BZNZ3P';

// Define acceptable price thresholds (in USDC)
const MAX_PRICES: Record<string, number> = {
  'marketing-plan': 0.05,
  'sales-script': 0.03,
  'contract-draft': 0.10,
};

async function getPaymentSplitterContract() {
  const { Contract, SorobanRpc } = await import('@stellar/stellar-sdk');
  return new Contract(PAYMENT_SPLITTER_ID);
}

async function callExecuteSplit(
  signer: any,
  paymentId: string
): Promise<{ success: boolean; txHash?: string; adminAmount?: string; collaboratorAmount?: string }> {
  try {
    console.log(`\n🔗 Calling PaymentSplitter.execute_split on-chain...`);
    
    const { Keypair, SorobanRpc } = await import('@stellar/stellar-sdk');
    const server = new SorobanRpc.Server('https://soroban-testnet.stellar.org', { allowHttp: true });
    
    const publicKey = signer.publicKey();
    const account = await server.getAccount(publicKey);
    
    const contract = await getPaymentSplitterContract();
    
    const tx = new TransactionBuilder(account, {
      fee: '100000',
      networkPassphrase: getNetworkPassphrase(NETWORK),
    })
      .addOperation(contract.call('execute_split', publicKey, paymentId))
      .setTimeout(60)
      .build();
    
    // Sign with the signer
    const signedTxXdr = await signer.sign(tx.toXDR());
    
    const result = await server.sendTransaction(new Transaction(signedTxXdr, getNetworkPassphrase(NETWORK)));
    
    if (result.status === 'ERROR') {
      console.error('❌ Split failed:', result.errorResult);
      return { success: false };
    }
    
    if (result.status === 'PENDING') {
      const txResult = await server.getTransaction(result.hash);
      console.log(`✅ Split executed on-chain!`);
      console.log(`   TX: https://stellar.expert/explorer/testnet/tx/${result.hash}`);
      return { success: true, txHash: result.hash };
    }
    
    return { success: true, txHash: result.hash };
    
  } catch (err) {
    console.error('❌ Error calling execute_split:', err);
    return { success: false };
  }
}

async function callResource(path: string) {
  const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3002';
  const STELLAR_PRIVATE_KEY = process.env.CLIENT_SECRET || process.env.STELLAR_CLIENT_SECRET;
  
  if (!STELLAR_PRIVATE_KEY) {
    console.error('❌ Missing CLIENT_SECRET or STELLAR_CLIENT_SECRET in .env');
    return;
  }
  
  console.log(`\n📡 Autonomous Agent calling ${SERVER_URL}/api/ai/${path}...`);
  
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
      // Decode payment header manually (server sends as PAYMENT-REQUIRED)
      const rawHeader = firstTry.headers.get('payment-required') 
        || firstTry.headers.get('PAYMENT-REQUIRED')
        || firstTry.headers.get('x-payment-required');
      
      if (!rawHeader) {
        console.log("   ❌ No payment header found");
        return { success: false };
      }

      const decoded = JSON.parse(Buffer.from(rawHeader, "base64").toString("utf8"));
      const accept = decoded.accepts?.[0];
      const amountRaw = parseInt(accept?.amount || "0");
      const price = amountRaw / 10_000_000;
      
      console.log(`   💳 Payment required: $${price} USDC`);
      console.log(`   📬 Pay to: ${accept?.payTo}`);

      const paymentRequired = httpClient.getPaymentRequiredResponse((name) =>
        firstTry.headers.get(name) || firstTry.headers.get(name.toUpperCase()),
      );
      
      const priceMatch = ["ok"];
      
      // DECISION: Is the price acceptable?
      const maxPrice = MAX_PRICES[path] || 0.50; // Default max 50 cents
      if (price > maxPrice) {
        console.log(`   ⚠️ Price $${price} exceeds limit $${maxPrice}. Skipping.`);
        return { success: false, reason: 'price_too_high' };
      }
      
      console.log(`   🤖 Agent decision: Price acceptable. Proceeding with payment...`);
      
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
        console.log(`   📦 Resource: ${data.data.title}`);
        
        // AFTER PAYMENT: Call execute_split on PaymentSplitter contract
        // This demonstrates end-to-end autonomous agent flow:
        // 1. Discover service (402 header)
        // 2. Decide if price is acceptable
        // 3. Pay automatically
        // 4. Trigger profit distribution on-chain
        
        const paymentId = `agent-${Date.now()}-${path}`;
        const splitResult = await callExecuteSplit(signer, paymentId);
        
        if (splitResult.success) {
          console.log(`   🎉 Complete: Agent paid → Split executed on-chain`);
        }
        
        return { success: true, data, splitResult };
      }
    } else if (firstTry.ok) {
      const data = await firstTry.json();
      console.log(`   ✅ Free access: ${data.data.title}`);
      return { success: true, data };
    } else {
      console.log(`   ❌ Unexpected status: ${firstTry.status}`);
      return { success: false };
    }
  } catch (err) {
    console.error(`   ❌ Error:`, err);
    return { success: false, error: err };
  }
}

async function main() {
  console.log('🤖 AI BORA Autonomous Agent v2.0');
  console.log('========================================');
  console.log('This agent demonstrates full autonomy:');
  console.log('  1. Reads 402 Payment Required header');
  console.log('  2. Decides if price is acceptable');
  console.log('  3. Pays automatically via x402');
  console.log('  4. Calls PaymentSplitter.execute_split');
  console.log('  5. Distributes profits on-chain 70/30');
  console.log('');
  
  const STELLAR_PRIVATE_KEY = process.env.CLIENT_SECRET || process.env.STELLAR_CLIENT_SECRET;
  console.log(`🔑 Agent: ${STELLAR_PRIVATE_KEY ? 'configured' : 'MISSING KEY'}`);
  
  if (!STELLAR_PRIVATE_KEY) {
    console.error('\n❌ Please set CLIENT_SECRET or STELLAR_CLIENT_SECRET in .env');
    console.log('Tip: Get testnet keys from https://laboratory.stellar.org/#account-creator');
    console.log('Then fund with: curl "https://friendbot.stellar.org/?addr=YOUR_PUBLIC_KEY"');
    process.exit(1);
  }
  
  const RESOURCE_PATHS = ['marketing-plan', 'sales-script', 'contract-draft'];
  
  for (const path of RESOURCE_PATHS) {
    await callResource(path);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit
  }
  
  console.log('\n✅ All AI resources tested!');
  console.log('🔗 Check transactions on: https://stellar.expert/explorer/testnet');
}

main().catch(console.error);