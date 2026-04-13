// Add USDC Trustline to Vendor Account
// Run: npx tsx add-usdc-trustline.ts

import StellarSdk from '@stellar/stellar-sdk';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';

// USDC on Stellar Testnet
const USDC_ISSUER = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3Q3SRFL2AYKSMXJSIYGLFP7QALX';
const USDC_CODE = 'USDC';

// Vendor account
const VENDOR_SECRET = process.env.VENDOR_SECRET;
if (!VENDOR_SECRET) {
  throw new Error('VENDOR_SECRET must be set in environment');
}
const VENDOR_PUBLIC = 'GDQX74MG4TVG7BBZCLDCOEOQX2PADCTRUIDAWG5KLIQ64LYURC5XC7CN';

async function addUSDCTrustline() {
  console.log('🔐 Adding USDC Trustline to Vendor Account');
  console.log('==========================================');
  console.log('');
  console.log('Vendor:', VENDOR_PUBLIC);
  console.log('USDC Issuer:', USDC_ISSUER);
  console.log('');

  try {
    // Create keypair
    const keypair = StellarSdk.Keypair.fromSecret(VENDOR_SECRET);
    console.log('✅ Keypair created');

    // Load account
    const server = new StellarSdk.Horizon.Server(HORIZON_URL);
    const account = await server.loadAccount(keypair.publicKey());
    console.log('✅ Account loaded, sequence:', account.sequenceNumber());

    // Check current balances
    console.log('');
    console.log('📊 Current balances:');
    account.balances.forEach((b: any) => {
      if (b.asset_type === 'native') {
        console.log(`   XLM: ${b.balance}`);
      } else {
        console.log(`   ${b.asset_code}: ${b.balance}`);
      }
    });

    // Check if trustline already exists
    const hasUSDCTrustline = account.balances.some(
      (b: any) => b.asset_code === USDC_CODE && b.asset_issuer === USDC_ISSUER
    );

    if (hasUSDCTrustline) {
      console.log('');
      console.log('✅ USDC trustline already exists!');
      return;
    }

    console.log('');
    console.log('➕ Adding USDC trustline...');

    // Create USDC asset
    const usdcAsset = new StellarSdk.Asset(USDC_CODE, USDC_ISSUER);

    // Build transaction
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: '100',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(StellarSdk.Operation.changeTrust({
        asset: usdcAsset,
        limit: '1000000', // Max 1M USDC
      }))
      .setTimeout(30)
      .build();

    // Sign
    transaction.sign(keypair);
    console.log('✅ Transaction signed');

    // Submit
    console.log('');
    console.log('📡 Submitting to Stellar...');
    const result = await server.submitTransaction(transaction);

    console.log('');
    console.log('🎉 SUCCESS! Trustline added!');
    console.log('');
    console.log('📋 Transaction Details:');
    console.log('   Hash:', result.hash);
    console.log('   Explorer:', `https://stellar.expert/explorer/testnet/tx/${result.hash}`);
    console.log('');
    console.log('✅ The vendor account can now receive USDC!');
    console.log('');

    // Verify new balance
    const updatedAccount = await server.loadAccount(keypair.publicKey());
    console.log('📊 Updated balances:');
    updatedAccount.balances.forEach((b: any) => {
      if (b.asset_type === 'native') {
        console.log(`   XLM: ${b.balance}`);
      } else {
        console.log(`   ${b.asset_code}: ${b.balance}`);
      }
    });

  } catch (error: any) {
    console.error('');
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('trustline entry is missing')) {
      console.error('');
      console.error('This should not happen - we are adding the trustline!');
      console.error('The error may be coming from the x402 payment attempt.');
    }
    
    if (error.response?.data?.extras?.result_codes) {
      console.error('Result codes:', error.response.data.extras.result_codes);
    }
    
    process.exit(1);
  }
}

addUSDCTrustline();