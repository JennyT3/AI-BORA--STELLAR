import { sendStellarPayment, eurToUsdc, stellarConfig } from '../lib/stellar/x402-client';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { faturaId, amountEur, memo } = req.body;

  if (!faturaId || !amountEur) {
    return res.status(400).json({ error: 'faturaId and amountEur required' });
  }

  const amountUsdc = eurToUsdc(parseFloat(amountEur));

  const result = await sendStellarPayment(
    stellarConfig.clientSecretKey,
    stellarConfig.vendorPublicKey,
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
}
