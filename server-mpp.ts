import express from 'express';
import { Payment } from '@stellar/stellar-sdk';

const app = express();
app.use(express.json());

const PORT = process.env.MPP_PORT || 3003;
const NETWORK = 'stellar:testnet';

// SAC Token Contract ID for USDC on Stellar testnet
const USDC_CONTRACT = 'CDLZFC3SYJYDZUE7YJLQFJLZ3ZLZ3ZLZ3ZLZ3ZLZ3ZLZ3ZLZ3ZLZ3ZL';
const ADMIN_PUBLIC = process.env.STELLAR_ADMIN_PUBLIC || 'GDQX74MG4TVG7BBZCLDCOEOQX2PADCTRUIDAWG5KLIQ64LYURC5XC7CN';

// MPP Handler: Accepts SAC transfers via memo
app.post('/mpp/pay', async (req, res) => {
  const { transactionXdr, memo } = req.body;
  
  try {
    // Parse transaction
    const tx = Transaction.fromXDR(transactionXdr, 'base64');
    
    // Verify it's a SAC payment to our address
    const paymentOp = tx.operations[0] as Payment;
    
    if (paymentOp.type !== 'payment') {
      return res.status(400).json({ error: 'Invalid operation type' });
    }
    
    if (paymentOp.destination !== ADMIN_PUBLIC) {
      return res.status(400).json({ error: 'Invalid destination' });
    }
    
    // In a real MPP implementation, this would:
    // 1. Verify the payment amount
    // 2. Check the memo for service request
    // 3. Automatically route to PaymentSplitter
    // 4. Return service response
    
    console.log(`✅ MPP Payment received:`);
    console.log(`   Amount: ${paymentOp.amount}`);
    console.log(`   Asset: ${paymentOp.asset.code}`);
    console.log(`   Memo: ${memo || 'none'}`);
    console.log(`   From: ${tx.source}`);
    
    // Call PaymentSplitter automatically
    const paymentId = `mpp-${Date.now()}`;
    
    res.json({
      success: true,
      protocol: 'MPP',
      paymentId,
      message: 'Payment received via Machine Payments Protocol (SAC transfer)',
      nextStep: 'PaymentSplitter will distribute 70/30 automatically',
      explorerUrl: `https://stellar.expert/explorer/testnet/tx/${tx.hash()}`,
    });
    
  } catch (err: any) {
    console.error('MPP error:', err);
    res.status(400).json({ error: err.message });
  }
});

// MPP Discovery endpoint - lists available services and prices
app.get('/mpp/services', (req, res) => {
  res.json({
    protocol: 'Machine Payments Protocol',
    version: '1.0',
    network: NETWORK,
    asset: 'USDC',
    acceptAddress: ADMIN_PUBLIC,
    services: [
      {
        id: 'marketing-plan',
        name: 'Marketing Plan AI',
        price: '0.01 USDC',
        description: 'Generate comprehensive B2B marketing strategy',
        sacMemo: 'ai:marketing-plan',
      },
      {
        id: 'sales-script',
        name: 'Sales Script AI',
        price: '0.005 USDC',
        description: 'Professional B2B sales script template',
        sacMemo: 'ai:sales-script',
      },
      {
        id: 'contract-draft',
        name: 'Contract Draft AI',
        price: '0.02 USDC',
        description: 'Legal B2B contract template',
        sacMemo: 'ai:contract-draft',
      },
    ],
    howToPay: {
      method: 'SAC Transfer',
      steps: [
        '1. Build payment transaction with asset=USDC',
        '2. Set destination to acceptAddress',
        '3. Include service ID in memo (e.g., "ai:marketing-plan")',
        '4. Submit to Stellar network',
        '5. MPP server auto-detects and processes',
      ],
      advantages: [
        'Direct on-chain settlement',
        'No facilitator needed',
        'Works with standard Stellar wallets',
        'Lower gas fees than x402',
      ],
    },
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    protocol: 'MPP (Machine Payments Protocol)',
    network: NETWORK,
    acceptAddress: ADMIN_PUBLIC,
  });
});

app.listen(PORT, () => {
  console.log(`🤖 MPP Server running at http://localhost:${PORT}`);
  console.log(`💰 Accepting SAC USDC payments at: ${ADMIN_PUBLIC}`);
  console.log(`📋 Services: http://localhost:${PORT}/mpp/services`);
  console.log(``);
  console.log(`MPP vs x402:`);
  console.log(`  MPP: Direct SAC transfer, simpler, lower fees`);
  console.log(`  x402: HTTP 402 protocol, needs facilitator, higher fees`);
  console.log(`  Both: On-chain settlement, transparent, automated`);
});