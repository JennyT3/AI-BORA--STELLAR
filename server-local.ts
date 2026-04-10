import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Keypair, Networks, TransactionBuilder, Memo, Operation, Asset } from '@stellar/stellar-sdk';

dotenv.config({ path: '.env' });

const VENDOR_SECRET = process.env.STELLAR_VENDOR_SECRET || process.env.VENDOR_SECRET || 'SCNAYRZDW6DCNHNJTH6XGDXATRGJKDYXL5AWCKWRMDTWM5VXUCSMFH3R';
const VENDOR_PUBLIC = process.env.VENDOR_PUBLIC || 'GBM4USEN622JABS37BVEHK43HASCX7PSRDMB37PKL53R725OFOHNWL3B';
const HORIZON_URL = 'https://horizon-testnet.stellar.org';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/stellar-pay', async (req, res) => {
  const { faturaId, amountEur, memo } = req.body;

  if (!faturaId || !amountEur) {
    return res.status(400).json({ error: 'faturaId and amountEur required' });
  }

  try {
    const { sendStellarPayment, eurToUsdc, stellarConfig } = await import('./lib/stellar/x402-client.js');
    
    const amountUsdc = eurToUsdc(parseFloat(amountEur));
    
    const clientSecret = process.env.CLIENT_SECRET || process.env.STELLAR_CLIENT_SECRET;
    const vendorPublic = process.env.VENDOR_PUBLIC || process.env.STELLAR_VENDOR_PUBLIC;

    if (!clientSecret || !vendorPublic) {
      return res.status(500).json({ error: 'Missing Stellar credentials' });
    }
    
    const result = await sendStellarPayment(
      clientSecret,
      vendorPublic,
      amountUsdc,
      memo || `AIBORA invoice ${faturaId}`
    );

    if (result.success) {
      return res.status(200).json({
        success: true,
        txHash: result.txHash,
        network: result.network,
        explorerUrl: `https://stellar.expert/explorer/testnet/tx/${result.txHash}`,
      });
    } else {
      return res.status(500).json({ success: false, error: result.error });
    }
  } catch (err: any) {
    console.error('Payment error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Payment failed' });
  }
});

app.post('/anchor-document', async (req, res) => {
  const { documentHash, documentId } = req.body;

  if (!documentHash || !documentId) {
    return res.status(400).json({ error: 'documentHash and documentId required' });
  }

  if (!VENDOR_SECRET) {
    return res.status(500).json({ error: 'STELLAR_VENDOR_SECRET not configured' });
  }

  try {
    const memoText = documentHash.substring(0, 28);
    console.log(`[ANCHOR] Anchoring document: ${documentId}`);
    console.log(`[ANCHOR] Hash: ${documentHash}`);
    console.log(`[ANCHOR] Memo: ${memoText}`);

    const keypair = Keypair.fromSecret(VENDOR_SECRET);
    
    const accountResponse = await fetch(`${HORIZON_URL}/accounts/${keypair.publicKey()}`);
    const accountData = await accountResponse.json();
    
    const account = new Account(accountData.id, accountData.sequence);

    const feeResponse = await fetch(`${HORIZON_URL}/fee?blob=1`);
    const feeData = await feeResponse.json();
    const fee = feeData.max_fee || 200;

    const transaction = new TransactionBuilder(account, {
      fee,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: VENDOR_PUBLIC,
          asset: Asset.native(),
          amount: '0.0000001',
        })
      )
      .addMemo(Memo.text(memoText))
      .setTimeout(60)
      .build();

    transaction.sign(keypair);

    const txResponse = await fetch(`${HORIZON_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ tx: transaction.toXDR() }),
    });

    const txResult = await txResponse.json();

    if (txResult.hash) {
      console.log(`[ANCHOR] Success! TX: ${txResult.hash}`);
      return res.status(200).json({
        success: true,
        documentHash,
        anchorTxHash: txResult.hash,
        explorerUrl: `https://stellar.expert/explorer/testnet/tx/${txResult.hash}`,
        anchoredAt: new Date().toISOString(),
      });
    } else {
      console.error('[ANCHOR] Failed:', txResult);
      return res.status(500).json({ error: 'Transaction failed', details: txResult });
    }
  } catch (err: any) {
    console.error('[ANCHOR] Error:', err);
    return res.status(500).json({ error: err.message || 'Anchor failed' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 API server running at http://localhost:${PORT}`);
  console.log(`📋 Endpoints (Vite proxy at /api/*):`);
  console.log(`   - POST /stellar-pay`);
  console.log(`   - POST /anchor-document`);
  console.log(`   - POST /process-payment`);
});