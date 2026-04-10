import { Keypair, Networks, TransactionBuilder, Memo, Operation, Asset } from '@stellar/stellar-sdk';

const VENDOR_SECRET = process.env.STELLAR_VENDOR_SECRET || 'SCNAYRZDW6DCNHNJTH6XGDXATRGJKDYXL5AWCKWRMDTWM5VXUCSMFH3R';
const VENDOR_PUBLIC = 'GBM4USEN622JABS37BVEHK43HASCX7PSRDMB37PKL53R725OFOHNWL3B';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { documentHash, documentId } = req.body;

  if (!documentHash || !documentId) {
    return res.status(400).json({ error: 'documentHash and documentId required' });
  }

  if (!VENDOR_SECRET) {
    return res.status(500).json({ error: 'STELLAR_VENDOR_SECRET not configured' });
  }

  try {
    const memoText = documentHash.substring(0, 28);

    const keypair = Keypair.fromSecret(VENDOR_SECRET);
    
    const response = await fetch(`${HORIZON_URL}/accounts/${keypair.publicKey()}`);
    const accountData = await response.json();
    
    const account = new (await import('@stellar/stellar-sdk')).Account(
      accountData.id,
      accountData.sequence
    );

    const feeResponse = await fetch(`${HORIZON_URL}/fee?blob=1`);
    const feeData = await feeResponse.json();
    const fee = feeData.max_fee || 100;

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
      body: new URLSearchParams({
        tx: transaction.toXDR(),
      }),
    });

    const txResult = await txResponse.json();

    if (txResult.hash) {
      return res.status(200).json({
        success: true,
        documentHash,
        anchorTxHash: txResult.hash,
        explorerUrl: `https://stellar.expert/explorer/testnet/tx/${txResult.hash}`,
        anchoredAt: new Date().toISOString(),
      });
    } else {
      return res.status(500).json({ 
        error: 'Transaction failed', 
        details: txResult 
      });
    }
  } catch (err: any) {
    console.error('Anchor error:', err);
    return res.status(500).json({ error: err.message || 'Anchor failed' });
  }
}