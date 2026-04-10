import { sendStellarPayment, eurToUsdc } from '../lib/stellar/x402-client';

const CLIENT_SECRET = process.env.STELLAR_CLIENT_SECRET;
const VENDOR_PUBLIC = process.env.STELLAR_VENDOR_PUBLIC;

if (!CLIENT_SECRET || !VENDOR_PUBLIC) {
  console.error('Missing STELLAR_CLIENT_SECRET or STELLAR_VENDOR_PUBLIC environment variables');
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!CLIENT_SECRET || !VENDOR_PUBLIC) {
    return res.status(500).json({ 
      error: 'Server configuration error: Missing Stellar credentials',
      details: 'Please configure STELLAR_CLIENT_SECRET and STELLAR_VENDOR_PUBLIC in Vercel'
    });
  }

  const { faturaId, amountEur, memo } = req.body;

  if (!faturaId || !amountEur) {
    return res.status(400).json({ error: 'faturaId and amountEur required' });
  }

  const amountUsdc = eurToUsdc(parseFloat(amountEur));

  const result = await sendStellarPayment(
    CLIENT_SECRET,
    VENDOR_PUBLIC,
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
