import pkg from '@stellar/stellar-sdk';
const { Keypair, TransactionBuilder, Networks, Operation, Asset, BASE_FEE, Horizon } = pkg;

const USDC_ISSUER_SECRET = 'SCZANGBA5YELQI6LHHPM5ETYHZ7KEQW57SCXQY2CKJBWVPBZXM3BQZL';
const CLIENT_PUBLIC = 'GBMQWA3M4BLSM6HH4SIPVB4AL4F4LJUWYGS22G3EBUBIZYDY4HNCYGY2';
const HORIZON_URL = 'https://horizon-testnet.stellar.org';

async function sendUSDC() {
  const server = new Horizon.Server(HORIZON_URL);
  
  // Use the testnet USDC faucet via friendbot
  const res = await fetch(
    `https://friendbot.stellar.org?addr=${CLIENT_PUBLIC}`
  );
  const data = await res.json();
  console.log('Friendbot result:', JSON.stringify(data).slice(0, 200));
}

sendUSDC().catch(console.error);
