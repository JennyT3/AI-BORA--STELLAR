# AI BORA - Stellar Blockchain B2B Sales Platform

B2B sales platform with **real Stellar blockchain payments**, **Soroban smart contracts**, and **x402 autonomous agent payments**. Built for Stellar Hacks: Agents hackathon (April 2026).

## 🚀 Quick Start

```bash
npm install
npm run dev
```

## 🎯 Flow

1. **Home** → Click "Get Started"
2. **Register** → Create account with Passkey (fingerprint/Face ID)
3. **Selection** → Choose: Company / Request Service / Work
4. **Admin** → Create proposal → Generates PDF + stores hash on Stellar blockchain
5. **Client** → Receives email → Views proposal → Pays with Stellar
6. **Payment** → Real transaction on Stellar testnet → Auto-distribute to team

## 🤖 x402 Autonomous Agent Payments

AI agents can autonomously pay for API services using the x402 protocol:

```bash
# Start x402 server (paid AI endpoints)
npx tsx server-x402.ts

# Run autonomous agent
npx tsx agent-x402.ts
```

### x402 Protected Endpoints
- `GET /api/ai/marketing-plan` - $0.01 USDC
- `GET /api/ai/sales-script` - $0.005 USDC  
- `GET /api/ai/contract-draft` - $0.02 USDC

The agent automatically handles 402 Payment Required responses and signs payments with Soroban auth entries.

## 🏗️ Architecture

- **Frontend**: React + Vite + Tailwind + TypeScript
- **Smart Contracts**: Soroban (Rust) - 2 contracts deployed on testnet
- **Blockchain**: Stellar testnet via Soroban SDK
- **Auth**: WebAuthn Passkey (no passwords)
- **Database**: Firebase Firestore
- **Payment Protocol**: x402 (HTTP 402 for machine payments)
- **Roles**: Admin / Client / Collaborator

## 🔗 Smart Contracts (Testnet)

| Contract | ID | Functions |
|----------|-----|-----------|
| **ProposalRegistry** | `CBUTZRV7YSJAYQTVSP3NSEDW3URRVCH3WDJQOXYASYQRNZFSLSIGROU5` | store_proposal, get_proposal, update_status |
| **PaymentSplitter** | `CCP4JPWI33BC2XCDOLEDOIURMP7NPBY7I532H4N56ZDBCXX3A6BZNZ3P` | create_payment, execute_split, get_payment |

### Payment Distribution
- Admin: 70%
- Collaborator: 30%

## ⚠️ Setup

Copy `.env.example` to `.env.local` and add your keys:

```
VENDOR_SECRET=your_stellar_secret
VITE_FIREBASE_API_KEY=your_firebase_key
```

## 📄 License

MIT