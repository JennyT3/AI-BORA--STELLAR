import express from 'express';
import cors from 'cors';
import { paymentMiddlewareFromConfig } from '@x402/express';
import { HTTPFacilitatorClient } from '@x402/core/server';
import { ExactStellarScheme } from '@x402/stellar/exact/server';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3002;

const NETWORK = 'stellar:testnet';
const FACILITATOR_URL = 'https://www.x402.org/facilitator';
const PAY_TO = process.env.STELLAR_ADMIN_PUBLIC || 'GBM4USEN622JABS37BVEHK43HASCX7PSRDMB37PKL53R725OFOHNWL3B';
const PAYMENT_SPLITTER = 'CCP4JPWI33BC2XCDOLEDOIURMP7NPBY7I532H4N56ZDBCXX3A6BZNZ3P';

const ROUTE_PATH = '/api/ai';

// Services configuration
const SERVICES = {
  'marketing-plan': { price: 0.01, title: 'Marketing Plan AI' },
  'sales-script': { price: 0.005, title: 'Sales Script AI' },
  'contract-draft': { price: 0.02, title: 'Contract Draft AI' },
};

const app2 = express();
app2.use(express.json());

// CORS
app2.use(cors({
  origin: true, // Refleja el origen de la petición (mejor para CORS)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Payment', 'X-Payment-Tx', 'X-Agent-Id', 'Accept'],
  exposedHeaders: ['PAYMENT-REQUIRED', 'X-Payment-Required', 'Content-Type'],
  credentials: true
}));

// Health check
app2.get('/api/health', (_, res) => {
  res.json({ 
    status: 'ok', 
    x402: 'enabled',
    network: NETWORK,
    payTo: PAY_TO,
    splitter: PAYMENT_SPLITTER,
    services: Object.keys(SERVICES),
    timestamp: new Date().toISOString()
  });
});

// Services list
app2.get('/api/services', (_, res) => {
  res.json({
    services: Object.entries(SERVICES).map(([id, s]) => ({
      id,
      price: s.price,
      title: s.title,
      endpoint: `/api/ai/${id}`,
    })),
    payTo: PAY_TO,
    network: NETWORK,
    splitter: PAYMENT_SPLITTER,
  });
});

// x402 Payment Middleware
app2.use(
  paymentMiddlewareFromConfig(
    {
      [`GET ${ROUTE_PATH}/marketing-plan`]: {
        accepts: {
          scheme: 'exact',
          price: '$0.01',
          network: NETWORK,
          payTo: PAY_TO,
        },
      },
      [`GET ${ROUTE_PATH}/sales-script`]: {
        accepts: {
          scheme: 'exact',
          price: '$0.005',
          network: NETWORK,
          payTo: PAY_TO,
        },
      },
      [`GET ${ROUTE_PATH}/contract-draft`]: {
        accepts: {
          scheme: 'exact',
          price: '$0.02',
          network: NETWORK,
          payTo: PAY_TO,
        },
      },
    },
    new HTTPFacilitatorClient({ url: FACILITATOR_URL }),
    [{ network: NETWORK, server: new ExactStellarScheme() }],
  ),
);

// Helper to format price for display
function formatPrice(stroops: string): string {
  // USDC has 7 decimals, stroops is in base units
  const amount = parseInt(stroops) / 10_000_000;
  return `$${amount.toFixed(3)} USDC`;
}

// Extract payment info from x402 header
function extractPaymentInfo(headerBase64: string): any {
  try {
    const decoded = JSON.parse(Buffer.from(headerBase64, 'base64').toString());
    const accept = decoded.accepts?.[0] || {};
    return {
      scheme: accept.scheme || 'exact',
      network: accept.network || NETWORK,
      amount: accept.amount || '100000',
      asset: accept.asset || 'native',
      payTo: accept.payTo || PAY_TO,
      formattedPrice: formatPrice(accept.amount || '100000'),
    };
  } catch {
    return null;
  }
}

// Service endpoints
app2.get(`${ROUTE_PATH}/marketing-plan`, (req, res) => {
  res.json({
    success: true,
    resource: 'marketing-plan',
    data: {
      title: 'Marketing Plan AI',
      sections: ['Market Analysis', 'Target Audience', 'Channels', 'Budget'],
      content: 'Complete marketing strategy for B2B SaaS...\n\n## 1. Market Analysis\nThe target market consists of...\n\n## 2. Target Audience\nPrimary: Tech-savvy SMB owners...',
    },
  });
});

app2.get(`${ROUTE_PATH}/sales-script`, (req, res) => {
  res.json({
    success: true,
    resource: 'sales-script',
    data: {
      title: 'Sales Script AI',
      sections: ['Intro', 'Value Prop', 'Objection Handling', 'Close'],
      content: 'Professional B2B sales script...\n\n## Introduction\n"Hi, I\'m calling from AI BORA to help you...'
    },
  });
});

app2.get(`${ROUTE_PATH}/contract-draft`, (req, res) => {
  res.json({
    success: true,
    resource: 'contract-draft',
    data: {
      title: 'Contract Draft AI',
      sections: ['Parties', 'Terms', 'Payment', 'Liability'],
      content: 'Legal B2B contract template...\n\n## Parties\nThis Agreement is entered into between...'
    },
  });
});

// Demo endpoint - auto-accepts for testing
app2.get('/api/demo/:service', (req, res) => {
  const { service } = req.params;
  const serviceInfo = SERVICES[service as keyof typeof SERVICES];
  
  if (!serviceInfo) {
    return res.status(404).json({ error: 'Service not found' });
  }

  const txHash = `demo-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  console.log(`\n🎬 DEMO: ${service} - $${serviceInfo.price}`);
  console.log(`   TX: ${txHash}`);
  console.log(`   Split: 70% ($${(serviceInfo.price * 0.7).toFixed(3)}) / 30% ($${(serviceInfo.price * 0.3).toFixed(3)})\n`);

  res.json({
    success: true,
    resource: service,
    data: {
      title: serviceInfo.title,
      sections: ['Section 1', 'Section 2', 'Section 3'],
      content: `Complete ${serviceInfo.title} generated by AI...`,
    },
    demo: true,
    txHash,
    payment: {
      price: serviceInfo.price,
      payTo: PAY_TO,
      network: NETWORK,
    },
    split: {
      total: serviceInfo.price,
      company: Number((serviceInfo.price * 0.7).toFixed(4)),
      collaborator: Number((serviceInfo.price * 0.3).toFixed(4)),
    },
  });
});

// Split endpoint
app2.post('/api/split', (req, res) => {
  const { txHash, amount } = req.body;
  
  const total = parseFloat(amount) || 0.01;
  const company = total * 0.7;
  const collaborator = total * 0.3;
  
  console.log(`\n💰 Payment Split:`);
  console.log(`   Total: $${total.toFixed(4)} USDC`);
  console.log(`   Company (70%): $${company.toFixed(4)}`);
  console.log(`   Collaborator (30%): $${collaborator.toFixed(4)}`);
  console.log(`   TX: ${txHash}\n`);
  
  res.json({
    success: true,
    txHash,
    split: {
      total,
      company,
      collaborator,
    },
    contract: PAYMENT_SPLITTER,
    explorer: `https://stellar.expert/explorer/testnet`,
  });
});

app2.listen(Number(PORT), '0.0.0.0', () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  🤖 AI BORA x402 Server');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log(`  Running at: http://localhost:${PORT}`);
  console.log(`  Network: ${NETWORK}`);
  console.log(`  Vendor: ${PAY_TO.substring(0, 20)}...`);
  console.log(`  Splitter: ${PAYMENT_SPLITTER.substring(0, 20)}...`);
  console.log('');
  console.log('  Services (require USDC payment):');
  Object.entries(SERVICES).forEach(([id, s]) => {
    console.log(`    GET /api/ai/${id.padEnd(15)} - $${s.price}`);
  });
  console.log('');
  console.log('  Demo (auto-accept):');
  console.log('    GET /api/demo/:service');
  console.log('');
  console.log('  Endpoints:');
  console.log('    GET /api/health');
  console.log('    GET /api/services');
  console.log('    POST /api/split');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
});