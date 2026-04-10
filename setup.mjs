// AI BORA Setup Script (Node.js version)
// Run with: node setup.mjs

import { exec } from 'child_process';
import { promisify } from 'util';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 AI BORA Setup Script (Node.js)');
console.log('===================================\n');

async function main() {
  // Step 1: Check .env
  console.log('📦 Step 1: Checking environment...\n');
  
  if (!fs.existsSync('.env')) {
    console.log('❌ .env not found. Copying from .env.example...\n');
    fs.copyFileSync('.env.example', '.env');
    console.log('⚠️  Please edit .env with your keys:');
    console.log('   - VENDOR_SECRET (Stellar testnet secret)');
    console.log('   - CLIENT_SECRET (Stellar testnet secret)');
    console.log('   - VITE_FIREBASE_API_KEY');
    console.log('   - VITE_CLERK_PUBLISHABLE_KEY\n');
    console.log('Run this script again after adding keys.\n');
    process.exit(1);
  }
  
  console.log('✅ .env found\n');
  
  // Step 2: Install dependencies
  console.log('📦 Step 2: Installing dependencies...\n');
  await execAsync('npm install');
  console.log('✅ Dependencies installed\n');
  
  // Step 3: Load env and fund accounts
  console.log('💰 Step 3: Funding Stellar accounts...\n');
  const envContent = fs.readFileSync('.env', 'utf-8');
  const envLines = envContent.split('\n').filter(line => line.includes('=') && !line.startsWith('#'));
  const env = {};
  envLines.forEach(line => {
    const [key, ...values] = line.split('=');
    env[key] = values.join('=');
  });
  
  const accounts = [
    { name: 'VENDOR', key: env.VENDOR_PUBLIC },
    { name: 'CLIENT', key: env.CLIENT_PUBLIC },
    { name: 'ADMIN', key: env.STELLAR_ADMIN_PUBLIC || env.VENDOR_PUBLIC },
  ];
  
  for (const account of accounts) {
    if (account.key) {
      console.log(`Funding ${account.name}: ${account.key}`);
      try {
        const response = await fetch(`https://friendbot.stellar.org/?addr=${account.key}`);
        if (response.ok) {
          console.log(`✅ ${account.name} account funded\n`);
        } else {
          console.log(`⚠️  ${account.name} may already be funded\n`);
        }
      } catch (err) {
        console.log(`⚠️  Error funding ${account.name}: ${err.message}\n`);
      }
    } else {
      console.log(`⚠️  ${account.name}_PUBLIC not set\n`);
    }
  }
  
  // Step 4: Add USDC trustline
  console.log('🏦 Step 4: Setting up USDC trustline...\n');
  try {
    await execAsync('node add-usdc-trustline.mjs');
    console.log('✅ USDC trustline added\n');
  } catch (err) {
    console.log('⚠️  Trustline setup may have issues (this is OK if already added)\n');
  }
  
  // Step 5: Start servers
  console.log('🚀 Step 5: Starting servers...\n');
  
  // Kill existing processes
  try {
    await execAsync('lsof -ti:3000 | xargs kill -9 2>/dev/null || true');
    await execAsync('lsof -ti:3002 | xargs kill -9 2>/dev/null || true');
    await execAsync('lsof -ti:3003 | xargs kill -9 2>/dev/null || true');
  } catch (err) {
    // Ignore errors
  }
  
  // Start servers
  const servers = [
    { name: 'Frontend', cmd: 'npm run dev', port: 3000 },
    { name: 'x402 Server', cmd: 'npx tsx server-x402.ts', port: 3002 },
    { name: 'MPP Server', cmd: 'npx tsx server-mpp.ts', port: 3003 },
  ];
  
  const processes = [];
  
  for (const server of servers) {
    console.log(`Starting ${server.name} on port ${server.port}...`);
    const child = exec(server.cmd, { cwd: __dirname });
    processes.push(child);
    console.log(`✅ ${server.name} started\n`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('========================================');
  console.log('✅ Setup Complete!\n');
  console.log('🎉 Services running:');
  console.log('  • Frontend:     http://localhost:3000');
  console.log('  • x402 Server:  http://localhost:3002');
  console.log('  • MPP Server:   http://localhost:3003\n');
  
  console.log('📋 Test flows:');
  console.log('  1. Open http://localhost:3000');
  console.log('  2. Click "Get Started" → Register with Passkey');
  console.log('  3. Create proposal → View PDF hash on Stellar');
  console.log('  4. Test payment → See 70/30 split on-chain');
  console.log('  5. Run: npx tsx agent-x402-v2.ts');
  console.log('     (Agent discovers service, pays, triggers split)\n');
  
  console.log('🔗 View transactions:');
  console.log('  • https://stellar.expert/explorer/testnet');
  console.log('  • ProposalRegistry: CBUTZRV7YSJAYQTVSP3NSEDW3URRVCH3WDJQOXYASYQRNZFSLSIGROU5');
  console.log('  • PaymentSplitter: CCP4JPWI33BC2XCDOLEDOIURMP7NPBY7I532H4N56ZDBCXX3A6BZNZ3P\n');
  
  console.log('Press Ctrl+C to stop all servers...');
  
  // Keep running
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Stopping all servers...');
    processes.forEach(p => p.kill());
    process.exit(0);
  });
  
  // Wait indefinitely
  await new Promise(() => {});
}

main().catch(err => {
  console.error('❌ Setup failed:', err);
  process.exit(1);
});