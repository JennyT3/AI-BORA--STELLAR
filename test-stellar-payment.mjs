import { useFacilitator, STELLAR_NETWORKS, STELLAR_TOKENS } from 'x402-stellar';
import pkg from '@stellar/stellar-sdk';
const { Keypair } = pkg;

const VENDOR_PUBLIC = 'GBM4USEN622JABS37BVEHK43HASCX7PSRDMB37PKL53R725OFOHNWL3B';
const CLIENT_SECRET = 'SC2VZI2O252V733JKQJPLFTGGDF2Z7H6RJJQMMOY3UNRVRSVTRSWZNOK';

const FACILITATOR_URL = 'https://www.x402.org/facilitator';
const HORIZON_URL = 'https://horizon-testnet.stellar.org';

async function testPayment() {
  console.log('🚀 Testing Stellar x402 payment...');

  // 1. Check facilitator
  const { supported } = useFacilitator({ url: FACILITATOR_URL });
  try {
    const kinds = await supported();
    console.log('✅ Facilitator online:', JSON.stringify(kinds));
  } catch (e) {
    console.log('❌ Facilitator offline:', e.message);
  }

  // 2. Check client account
  const clientKeypair = Keypair.fromSecret(CLIENT_SECRET);
  console.log('\n📋 Client:', clientKeypair.publicKey());
  try {
    const res = await fetch(`${HORIZON_URL}/accounts/${clientKeypair.publicKey()}`);
    const account = await res.json();
    console.log('💰 Balances:');
    account.balances?.forEach(b => {
      const name = b.asset_type === 'native' ? 'XLM' : b.asset_code;
      console.log(`   ${name}: ${b.balance}`);
    });
  } catch (e) {
    console.log('❌ Client account error:', e.message);
  }

  // 3. Check vendor account
  console.log('\n📋 Vendor:', VENDOR_PUBLIC);
  try {
    const res = await fetch(`${HORIZON_URL}/accounts/${VENDOR_PUBLIC}`);
    const account = await res.json();
    console.log('💰 Balances:');
    account.balances?.forEach(b => {
      const name = b.asset_type === 'native' ? 'XLM' : b.asset_code;
      console.log(`   ${name}: ${b.balance}`);
    });
  } catch (e) {
    console.log('❌ Vendor account error:', e.message);
  }

  console.log('\n✅ Done!');
}

testPayment().catch(console.error);

async function testFacilitator() {
  const res = await fetch('https://www.x402.org/facilitator/supported');
  const data = await res.json();
  const stellar = data.kinds.find(k => k.network === 'stellar:testnet');
  console.log('✅ Stellar testnet support:', JSON.stringify(stellar, null, 2));
}
testFacilitator().catch(console.error);
