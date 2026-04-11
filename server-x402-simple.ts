import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3002;

// Config
const VENDOR_PUBLIC = 'GBM4USEN622JABS37BVEHK43HASCX7PSRDMB37PKL53R725OFOHNWL3B';
const PAYMENT_SPLITTER = 'CCP4JPWI33BC2XCDOLEDOIURMP7NPBY7I532H4N56ZDBCXX3A6BZNZ3P';
const NETWORK = 'stellar:testnet';

const SERVICES = {
  'marketing-plan': { price: 0.01, title: 'Marketing Plan AI', sections: ['Market Analysis', 'Target Audience', 'Channels', 'Budget'] },
  'sales-script': { price: 0.005, title: 'Sales Script AI', sections: ['Intro', 'Value Prop', 'Objection Handling', 'Close'] },
  'contract-draft': { price: 0.02, title: 'Contract Draft AI', sections: ['Parties', 'Terms', 'Payment', 'Liability'] },
};

// CORS FIRST - must be before all other middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Payment', 'X-Payment-Tx', 'Accept'],
  exposedHeaders: ['PAYMENT-REQUIRED', 'X-Payment-Required', 'Content-Type'],
}));

app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    x402: 'enabled',
    network: NETWORK,
    payTo: VENDOR_PUBLIC,
    splitter: PAYMENT_SPLITTER,
    services: Object.keys(SERVICES),
    timestamp: new Date().toISOString()
  });
});

// Services list
app.get('/api/services', (req, res) => {
  res.json({
    services: Object.entries(SERVICES).map(([id, s]) => ({
      id, price: s.price, title: s.title
    })),
    payTo: VENDOR_PUBLIC,
    network: NETWORK,
  });
});

// Create 402 response with proper x402v2 format
function send402(serviceId: string, req: express.Request, res: express.Response) {
  const service = SERVICES[serviceId as keyof typeof SERVICES];
  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }

  const amountStroops = Math.floor(service.price * 10_000_000);
  
  // x402v2 format
  const paymentInfo = {
    x402Version: 2,
    error: "Payment required",
    resource: {
      url: `http://localhost:${PORT}/api/ai/${serviceId}`,
      description: service.title
    },
    accepts: [{
      scheme: "exact",
      network: NETWORK,
      amount: amountStroops.toString(),
      asset: "native",
      payTo: VENDOR_PUBLIC,
      maxTimeoutSeconds: 300
    }]
  };

  const encodedInfo = Buffer.from(JSON.stringify(paymentInfo)).toString('base64');

  // Set headers
  res.setHeader('PAYMENT-REQUIRED', encodedInfo);
  res.setHeader('X-Payment-Required', encodedInfo);
  res.setHeader('Access-Control-Expose-Headers', 'PAYMENT-REQUIRED, X-Payment-Required');
  
  res.status(402).json({
    error: 'Payment Required',
    service: serviceId,
    price: service.price,
    priceFormatted: `$${service.price.toFixed(3)} USDC`,
    network: NETWORK,
    payTo: VENDOR_PUBLIC,
    decoded: paymentInfo,
    note: 'For demo, use /api/demo/' + serviceId
  });
}

// AI endpoints - return 402
app.get('/api/ai/marketing-plan', (req, res) => send402('marketing-plan', req, res));
app.get('/api/ai/sales-script', (req, res) => send402('sales-script', req, res));
app.get('/api/ai/contract-draft', (req, res) => send402('contract-draft', req, res));

// Demo endpoints - return success for testing
app.get('/api/demo/:serviceId', (req, res) => {
  const { serviceId } = req.params;
  const service = SERVICES[serviceId as keyof typeof SERVICES];
  
  if (!service) {
    return res.status(404).json({ error: 'Service not found', available: Object.keys(SERVICES) });
  }

  const txHash = `demo-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  console.log(`\n✅ DEMO: ${serviceId} - $${service.price}`);
  console.log(`   TX: ${txHash}`);
  console.log(`   Split: $${(service.price * 0.7).toFixed(4)} / $${(service.price * 0.3).toFixed(4)}\n`);

  res.json({
    success: true,
    resource: serviceId,
    data: {
      title: service.title,
      sections: service.sections,
      content: `Complete ${service.title}...\n\n## ${service.sections[0]}\nContent...\n\n## ${service.sections[1]}\nMore content...`
    },
    demo: true,
    txHash,
    payment: {
      price: service.price,
      amountStroops: Math.floor(service.price * 10_000_000),
      payTo: VENDOR_PUBLIC,
      network: NETWORK
    },
    split: {
      total: service.price,
      company: Number((service.price * 0.7).toFixed(4)),
      collaborator: Number((service.price * 0.3).toFixed(4))
    }
  });
});

// Split endpoint
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
    vendor: VENDOR_PUBLIC
  });
});

// Start
app.listen(PORT, () => {
  console.log('');
  console.log('══════════════════════════════════════════════════════════════════');
  console.log('  🤖 AI BORA x402 Server (Simple Demo Mode)');
  console.log('══════════════════════════════════════════════════════════════════');
  console.log('');
  console.log(`  ✅ Running on: http://localhost:${PORT}`);
  console.log(`  ✅ CORS: Enabled (all origins)`);
  console.log(`  ✅ Vendor: ${VENDOR_PUBLIC.substring(0, 30)}...`);
  console.log('');
  console.log('  Endpoints:');
  console.log('    GET /api/health         → Server status');
  console.log('    GET /api/services       → List services');
  console.log('');
  console.log('  AI Services (402 Payment Required):');
  Object.entries(SERVICES).forEach(([id, s]) => {
    console.log(`    GET /api/ai/${id.padEnd(14)} → 402 ($${s.price})`);
  });
  console.log('');
  console.log('  Demo Endpoints (Auto-accept, no payment):');
  console.log('    GET /api/demo/marketing-plan  → 200');
  console.log('    GET /api/demo/sales-script    → 200');
  console.log('    GET /api/demo/contract-draft  → 200');
  console.log('');
  console.log('══════════════════════════════════════════════════════════════════');
  console.log('');
  console.log('  Test with:');
  console.log(`    curl http://localhost:${PORT}/api/health`);
  console.log(`    curl http://localhost:${PORT}/api/ai/marketing-plan  # Returns 402`);
  console.log(`    curl http://localhost:${PORT}/api/demo/marketing-plan  # Returns 200`);
  console.log('');
});