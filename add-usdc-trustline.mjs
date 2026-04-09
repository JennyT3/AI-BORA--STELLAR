import pkg from '@stellar/stellar-sdk';
const { Keypair, TransactionBuilder, Networks, Operation, Asset, BASE_FEE, Horizon } = pkg;

const USDC_ISSUER = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const CLIENT_SECRET = 'SC2VZI2O252V733JKQJPLFTGGDF2Z7H6RJJQMMOY3UNRVRSVTRSWZNOK';

async function addTrustline() {
  const server = new Horizon.Server(HORIZON_URL);
  const keypair = Keypair.fromSecret(CLIENT_SECRET);
  const account = await server.loadAccount(keypair.publicKey());
  
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET
  })
  .addOperation(Operation.changeTrust({
    asset: new Asset('USDC', USDC_ISSUER),
  }))
  .setTimeout(30)
  .build();

  tx.sign(keypair);
  const result = await server.submitTransaction(tx);
  console.log('✅ Trustline added! Hash:', result.hash);
}

addTrustline().catch(console.error);
