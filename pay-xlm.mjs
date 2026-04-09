import pkg from '@stellar/stellar-sdk';
const { Keypair, TransactionBuilder, Networks, Operation, Asset, BASE_FEE, Horizon, Memo } = pkg;

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const VENDOR_PUBLIC = 'GBM4USEN622JABS37BVEHK43HASCX7PSRDMB37PKL53R725OFOHNWL3B';
const CLIENT_SECRET = 'SC2VZI2O252V733JKQJPLFTGGDF2Z7H6RJJQMMOY3UNRVRSVTRSWZNOK';

async function payXLM() {
  const server = new Horizon.Server(HORIZON_URL);
  const keypair = Keypair.fromSecret(CLIENT_SECRET);
  const account = await server.loadAccount(keypair.publicKey());

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET
  })
  .addOperation(Operation.payment({
    destination: VENDOR_PUBLIC,
    asset: Asset.native(),
    amount: '1.00'
  }))
  .addMemo(Memo.text('AIBORA invoice test'))
  .setTimeout(30)
  .build();

  tx.sign(keypair);
  const result = await server.submitTransaction(tx);
  console.log('✅ PAYMENT SUCCESS!');
  console.log('TX Hash:', result.hash);
  console.log('Explorer:', `https://stellar.expert/explorer/testnet/tx/${result.hash}`);
}

payXLM().catch(e => console.error('❌', e.message));
