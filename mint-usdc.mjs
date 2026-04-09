import pkg from '@stellar/stellar-sdk';
const { Keypair, TransactionBuilder, Networks, Operation, Asset, BASE_FEE, Horizon } = pkg;

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const CLIENT_PUBLIC = 'GBMQWA3M4BLSM6HH4SIPVB4AL4F4LJUWYGS22G3EBUBIZYDY4HNCYGY2';

async function mintUSDC() {
  // Use the official Stellar testnet USDC faucet endpoint
  const res = await fetch('https://testanchor.stellar.org/friendbot/usdc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ addr: CLIENT_PUBLIC })
  });
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', text.slice(0, 300));
}

mintUSDC().catch(console.error);
