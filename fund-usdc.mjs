import pkg from '@stellar/stellar-sdk';
const { Keypair, TransactionBuilder, Networks, Operation, Asset, BASE_FEE, Horizon } = pkg;

// Testnet USDC issuer (oficial Circle testnet)
const USDC_ASSET = new Asset('USDC', 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5');
const CLIENT_PUBLIC = 'GBMQWA3M4BLSM6HH4SIPVB4AL4F4LJUWYGS22G3EBUBIZYDY4HNCYGY2';
const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const CLIENT_SECRET = 'SC2VZI2O252V733JKQJPLFTGGDF2Z7H6RJJQMMOY3UNRVRSVTRSWZNOK';

async function checkAndFund() {
  const server = new Horizon.Server(HORIZON_URL);
  const account = await server.loadAccount(CLIENT_PUBLIC);
  
  console.log('Balances:');
  account.balances.forEach(b => {
    const name = b.asset_type === 'native' ? 'XLM' : b.asset_code;
    console.log(`  ${name}: ${b.balance}`);
  });

  // Send 10 USDC from client to itself via DEX path (testnet trick)
  // Actually: use the testnet USDC faucet via xlm402
  console.log('\n👉 Ve a este link en el navegador:');
  console.log('https://stellar.expert/explorer/testnet/account/' + CLIENT_PUBLIC);
  console.log('\n👉 Y para USDC testnet:');
  console.log('https://testanchor.stellar.org');
}

checkAndFund().catch(console.error);
