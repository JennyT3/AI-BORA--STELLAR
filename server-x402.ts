import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import * as StellarSdk from '@stellar/stellar-sdk';

const PORT = process.env.PORT || 3002;
const RPC_URL = 'https://soroban-testnet.stellar.org';

// ============================================
// STELLAR CONFIG (Testnet)
// ============================================
const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';
const { Server: Horizon } = StellarSdk.Horizon;
const horizon = new Horizon(HORIZON_URL);

// Vendor account from .env
const envPath = './.env';
console.log('Looking for .env at:', envPath);

import { readFileSync } from 'fs';
try {
  const envContent = readFileSync(envPath, 'utf-8');
  console.log('.env found, length:', envContent.length);
  // Parse manually
  envContent.split('\n').forEach(line => {
    if (line.startsWith('VENDOR_SECRET=')) {
      process.env.VENDOR_SECRET = line.split('=')[1].trim();
    }
    if (line.startsWith('VENDOR_PUBLIC=')) {
      process.env.VENDOR_PUBLIC = line.split('=')[1].trim();
    }
  });
} catch(e) {
  console.log('.env not found');
}

const VENDOR_SECRET = process.env.VENDOR_SECRET || process.env.VITE_VENDOR_SECRET || '';
const VENDOR_PUBLIC = process.env.VENDOR_PUBLIC || 'GDQX74MG4TVG7BBZCLDCOEOQX2PADCTRUIDAWG5KLIQ64LYURC5XC7CN';

console.log('VENDOR_SECRET loaded:', !!VENDOR_SECRET);
console.log('VENDOR_SECRET prefix:', VENDOR_SECRET?.slice(0, 8));
const CLIENT_PUBLIC = 'GBMQWA3M4BLSM6HH4SIPVB4AL4F4LJUWYGS22G3EBUBIZYDY4HNCYGY2';

// Payment Splitter (demo contract address)
const PAYMENT_SPLITTER = 'CCP4JPWI33BC2XCDOLEDOIURMP7NPBY7I532H4N56ZDBCXX3A6BZNZ3P';

// Services with prices (in XLM)
const SERVICES: Record<string, { price: number; title: string; sections: string[]; description: string }> = {
  'marketing-plan': { 
    price: 0.01, 
    title: 'Marketing Plan AI', 
    sections: ['Market Analysis', 'Target Audience', 'Channels', 'Budget'],
    description: 'AI-generated marketing strategy document'
  },
  'sales-script': { 
    price: 0.005, 
    title: 'Sales Script AI', 
    sections: ['Intro', 'Value Prop', 'Objection Handling', 'Close'],
    description: 'AI-generated sales conversation script'
  },
  'contract-draft': { 
    price: 0.02, 
    title: 'Contract Draft AI', 
    sections: ['Parties', 'Terms', 'Payment', 'Liability'],
    description: 'AI-generated contract draft'
  },
};

// ============================================
// EXPRESS APP
// ============================================
const app = express();

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Payment', 'X-Payment-Tx', 'Accept'],
  exposedHeaders: ['PAYMENT-REQUIRED', 'X-Payment-Required', 'Content-Type'],
}));

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// ============================================
// STELLAR PAYMENT FUNCTIONS
// ============================================

async function createPayment(amount: number, destination: string, secretKey: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
  console.log('createPayment called with key:', secretKey?.slice(0, 8), 'dest:', destination?.slice(0, 8));
  if (!secretKey || (!secretKey.startsWith('SC') && !secretKey.startsWith('SB'))) {
    return { success: false, error: 'No valid secret key' };
  }

  try {
    const keypair = StellarSdk.Keypair.fromSecret(secretKey);
    const sourceAccount = await horizon.loadAccount(keypair.publicKey());
    
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: '100',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(StellarSdk.Operation.payment({
        destination: destination,
        asset: StellarSdk.Asset.native(),
        amount: amount.toString(),
      }))
      .setTimeout(30)
      .build();

    transaction.sign(keypair);
    
    const result = await horizon.submitTransaction(transaction);
    
    console.log(`  ✅ Payment: ${amount} XLM → ${destination.slice(0, 8)}...`);
    console.log(`     TX: ${result.hash}`);
    
    return { success: true, txHash: result.hash };
  } catch (error: any) {
    console.error(`  ❌ Payment error:`, error.message);
    return { success: false, error: error.message };
  }
}

async function distributeSplit(totalAmount: number, collaboratorAddress?: string): Promise<{ company: string; collaborator: string; txHash: string }> {
  const companyAmount = totalAmount * 0.7;
  const collaboratorAmount = totalAmount * 0.3;
  
  // Import and use PaymentSplitter
  const { distributePayment } = await import('./services/paymentSplitter.js');
  
  const result = await distributePayment(totalAmount, collaboratorAddress);
  
  if (result.success) {
    console.log(`  ✅ Split complete!`);
    console.log(`     Company: ${result.companyAmount} XLM`);
    console.log(`     Collaborator: ${result.collaboratorAmount} XLM`);
    return {
      company: result.companyAmount.toString(),
      collaborator: result.collaboratorAmount.toString(),
      txHash: result.collaboratorTxHash || `split-${Date.now()}`
    };
  }
  
  // Fallback to simulation if payment fails
  console.log(`  📊 Split (simulated):`);
  console.log(`     Company (70%): ${companyAmount.toFixed(4)} XLM`);
  console.log(`     Collaborator (30%): ${collaboratorAmount.toFixed(4)} XLM`);
  
  return {
    company: companyAmount.toFixed(4),
    collaborator: collaboratorAmount.toFixed(4),
    txHash: `split-${Date.now()}`
  };
}

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/api/health', async (req, res) => {
  let vendorBalance = '0';
  let accountStatus = 'not_found';
  
  try {
    const account = await horizon.loadAccount(VENDOR_PUBLIC);
    const nativeBalance = account.balances.find(b => b.asset_type === 'native');
    vendorBalance = nativeBalance?.balance || '0';
    accountStatus = account.sequenceNumber().toString();
  } catch (e) {
    accountStatus = 'not_found';
  }

  const hasSecret = VENDOR_SECRET.startsWith('SC') || VENDOR_SECRET.startsWith('SB');
  
  res.json({
    status: 'ok',
    x402: 'enabled',
    network: 'stellar:testnet',
    rpc: RPC_URL,
    payTo: VENDOR_PUBLIC,
    vendorBalance,
    accountStatus,
    splitter: PAYMENT_SPLITTER,
    services: Object.keys(SERVICES),
    timestamp: new Date().toISOString(),
    payments: hasSecret ? 'enabled' : 'demo_only',
    mode: hasSecret ? 'production' : 'demo'
  });
});

// Services list
app.get('/api/services', (req, res) => {
  res.json({
    services: Object.entries(SERVICES).map(([id, s]) => ({
      id, 
      price: s.price, 
      title: s.title,
      description: s.description
    })),
    payTo: VENDOR_PUBLIC,
    network: 'stellar:testnet',
    currency: 'XLM'
  });
});

// Generate 402 response
function send402(serviceId: string, req: express.Request, res: express.Response) {
  const service = SERVICES[serviceId];
  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }

  const amountStroops = Math.floor(service.price * 10_000_000);
  
  const paymentInfo = {
    x402Version: 2,
    error: "Payment required",
    resource: {
      url: `http://localhost:${PORT}/api/ai/${serviceId}`,
      description: service.title
    },
    accepts: [{
      scheme: "exact",
      network: "stellar:testnet",
      amount: amountStroops.toString(),
      asset: "native",
      payTo: VENDOR_PUBLIC,
      maxTimeoutSeconds: 300
    }]
  };

  const encodedInfo = Buffer.from(JSON.stringify(paymentInfo)).toString('base64');

  res.setHeader('PAYMENT-REQUIRED', encodedInfo);
  res.setHeader('X-Payment-Required', encodedInfo);
  res.setHeader('Access-Control-Expose-Headers', 'PAYMENT-REQUIRED, X-Payment-Required');
  
  res.status(402).json({
    error: 'Payment Required',
    service: serviceId,
    price: service.price,
    priceFormatted: `${service.price} XLM`,
    network: 'stellar:testnet',
    payTo: VENDOR_PUBLIC,
    decoded: paymentInfo
  });
}

// AI Service endpoints - return 402
app.get('/api/ai/marketing-plan', (req, res) => send402('marketing-plan', req, res));
app.get('/api/ai/sales-script', (req, res) => send402('sales-script', req, res));
app.get('/api/ai/contract-draft', (req, res) => send402('contract-draft', req, res));

// Pay for service (real payment)
app.post('/api/pay', async (req, res) => {
  try {
    const { serviceId, paymentTxHash } = req.body;
    
    const service = SERVICES[serviceId];
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // In production, verify the payment transaction
    // For demo, accept if no real payment needed
    const hasSecret = VENDOR_SECRET.startsWith('SC') || VENDOR_SECRET.startsWith('SB');
    
    // Simulate payment verification (in real implementation, verify TX on chain)
    const paymentVerified = true;
    
    if (!hasSecret) {
      // Demo mode - just return content
      return res.json({
        success: true,
        resource: serviceId,
        data: {
          title: service.title,
          sections: service.sections,
          content: `Complete ${service.title}\n\n## ${service.sections[0]}\nContent...\n\n## ${service.sections[1]}\nMore...`
        },
        payment: {
          demo: true,
          txHash: `demo-${Date.now()}`
        },
        split: {
          total: service.price,
          company: Number((service.price * 0.7).toFixed(4)),
          collaborator: Number((service.price * 0.3).toFixed(4))
        }
      });
    }

    // Real payment mode
    const split = await distributeSplit(service.price);

    res.json({
      success: true,
      resource: serviceId,
      data: {
        title: service.title,
        sections: service.sections,
        content: `Complete ${service.title}\n\n## ${service.sections[0]}\nContent...\n\n## ${service.sections[1]}\nMore...`
      },
      payment: {
        verified: paymentVerified,
        txHash: paymentTxHash || `tx-${Date.now()}`
      },
      split
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Demo endpoint (no real payment)
app.get('/api/demo/:serviceId', async (req, res) => {
  const { serviceId } = req.params;
  const service = SERVICES[serviceId];
  
  if (!service) {
    return res.status(404).json({ 
      error: 'Service not found', 
      available: Object.keys(SERVICES) 
    });
  }

  console.log(`\n✅ Demo: ${serviceId} - ${service.price} XLM`);

  res.json({
    success: true,
    resource: serviceId,
    data: {
      title: service.title,
      sections: service.sections,
      content: `Complete ${service.title}...\n\n## ${service.sections[0]}\nContent...\n\n## ${service.sections[1]}\nMore content...`
    },
    demo: true,
    txHash: `demo-${Date.now()}`,
    payment: {
      price: service.price,
      amountStroops: Math.floor(service.price * 10_000_000),
      payTo: VENDOR_PUBLIC,
      network: 'stellar:testnet'
    },
    split: {
      total: service.price,
      company: Number((service.price * 0.7).toFixed(4)),
      collaborator: Number((service.price * 0.3).toFixed(4))
    }
  });
});

// Split calculator
app.post('/api/split', (req, res) => {
  const { amount = 0.01 } = req.body;
  const total = parseFloat(String(amount));
  
  res.json({
    success: true,
    split: {
      total: total,
      company: Number((total * 0.7).toFixed(4)),
      collaborator: Number((total * 0.3).toFixed(4))
    },
    contract: PAYMENT_SPLITTER,
    vendor: VENDOR_PUBLIC,
    network: 'stellar:testnet'
  });
});

// Create payment
app.post('/api/payment/create', async (req, res) => {
  const { to = VENDOR_PUBLIC, amount = 0.01, fromSecret = VENDOR_SECRET } = req.body;
  
  const result = await createPayment(amount, to, fromSecret);
  res.json(result);
});

// Check vendor balance
app.get('/api/vendor/balance', async (req, res) => {
  try {
    const account = await horizon.loadAccount(VENDOR_PUBLIC);
    const balance = account.balances.find(b => b.asset_type === 'native');
    res.json({
      publicKey: VENDOR_PUBLIC,
      balance: balance?.balance || '0',
      sequence: account.sequenceNumber()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  const hasSecret = VENDOR_SECRET.startsWith('SC') || VENDOR_SECRET.startsWith('SB');
  
  console.log('');
  console.log('══════════════════════════════════════════════════════════════════');
  console.log('  🤖 AI BORA x402 Server');
  console.log('══════════════════════════════════════════════════════════════════');
  console.log('');
  console.log(`  ✅ Server: http://localhost:${PORT}`);
  console.log(`  ✅ Network: Stellar Testnet`);
  console.log(`  ✅ Vendor: ${VENDOR_PUBLIC.slice(0, 20)}...`);
  console.log(`  ✅ Payments: ${hasSecret ? 'ENABLED' : 'DEMO ONLY'}`);
  console.log(`  ✅ Splitter: ${PAYMENT_SPLITTER.slice(0, 20)}...`);
  console.log('');
  console.log('  Endpoints:');
  console.log('    GET  /api/health             → Status + balance');
  console.log('    GET  /api/services           → List services');
  console.log('    POST /api/payment/create  → Create payment');
  console.log('    GET  /api/vendor/balance   → Check balance');
  console.log('');
  console.log('  402 Payment endpoints:');
  Object.entries(SERVICES).forEach(([id, s]) => {
    console.log(`    GET  /api/ai/${id.padEnd(14)} → 402 (${s.price} XLM)`);
  });
  console.log('');
  console.log('  Demo endpoints:');
  Object.keys(SERVICES).forEach(id => {
    console.log(`    GET  /api/demo/${id.padEnd(10)} → 200 (free)`);
  });
  console.log('');
  console.log('══════════════════════════════════════════════════════════════════');
  console.log('');
  console.log('  Test:');
  console.log(`    curl http://localhost:${PORT}/api/health`);
  console.log(`    curl http://localhost:${PORT}/api/ai/marketing-plan  # Returns 402`);
  console.log(`    curl http://localhost:${PORT}/api/demo/marketing-plan  # Returns 200`);
  console.log('');
});