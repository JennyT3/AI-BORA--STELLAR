import { Keypair, Networks, TransactionBuilder, Memo, Operation, Asset, Account } from '@stellar/stellar-sdk';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';

const ADMIN_SECRET = process.env.STELLAR_ADMIN_SECRET || process.env.VENDOR_SECRET;
if (!ADMIN_SECRET) {
  throw new Error('ADMIN_SECRET must be set in environment');
}
const ADMIN_PUBLIC = process.env.STELLAR_ADMIN_PUBLIC || process.env.VENDOR_PUBLIC || 'GDQX74MG4TVG7BBZCLDCOEOQX2PADCTRUIDAWG5KLIQ64LYURC5XC7CN';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { faturaId, amountEur, memo } = req.body;

  if (!faturaId || !amountEur) {
    return res.status(400).json({ error: 'faturaId and amountEur required' });
  }

  try {
    console.log(`[PROCESS-PAYMENT] Processing payment for invoice: ${faturaId}, amount: ${amountEur} EUR`);

    const { getDoc, doc, updateDoc } = await import('firebase/firestore');
    const { db } = await import('./firebase');

    const faturaDoc = await getDoc(doc(db, 'faturas', faturaId));
    if (!faturaDoc.exists()) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const fatura = faturaDoc.data();
    
    const amountXLM = parseFloat(amountEur).toFixed(7);
    
    console.log(`[PROCESS-PAYMENT] Amount in XLM: ${amountXLM}`);

    const adminKeypair = Keypair.fromSecret(ADMIN_SECRET);

    const accountResponse = await fetch(`${HORIZON_URL}/accounts/${adminKeypair.publicKey()}`);
    const accountData = await accountResponse.json();
    const account = new Account(accountData.id, accountData.sequence);

    const feeResponse = await fetch(`${HORIZON_URL}/fee?blob=1`);
    const feeData = await feeResponse.json();
    const fee = feeData.max_fee || 300;

    const transaction = new TransactionBuilder(account, {
      fee,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: ADMIN_PUBLIC,
          asset: Asset.native(),
          amount: amountXLM,
        })
      )
      .addMemo(Memo.text(memo || `AIBORA invoice ${faturaId}`))
      .setTimeout(60)
      .build();

    transaction.sign(adminKeypair);

    const txResponse = await fetch(`${HORIZON_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ tx: transaction.toXDR() }),
    });

    const txResult = await txResponse.json();

    if (txResult.hash) {
      console.log(`[PROCESS-PAYMENT] Payment successful! TX: ${txResult.hash}`);

      await updateDoc(doc(db, 'faturas', faturaId), {
        status: 'paga',
        dataPagamento: new Date().toISOString(),
        txHash: txResult.hash,
        valorPago: parseFloat(amountEur),
        method: 'stellar',
      });

      return res.status(200).json({
        success: true,
        txHash: txResult.hash,
        network: 'testnet',
        explorerUrl: `https://stellar.expert/explorer/testnet/tx/${txResult.hash}`,
        amount: amountXLM,
        memo: memo || `AIBORA invoice ${faturaId}`,
      });
    } else {
      console.error(`[PROCESS-PAYMENT] Transaction failed:`, txResult);
      return res.status(500).json({ 
        error: 'Payment failed', 
        details: txResult.error || 'Unknown error' 
      });
    }
  } catch (err: any) {
    console.error('[PROCESS-PAYMENT] Error:', err);
    return res.status(500).json({ error: err.message || 'Payment processing failed' });
  }
}