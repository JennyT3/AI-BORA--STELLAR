# AI BORA - Stellar Blockchain B2B Sales Platform

B2B sales platform with **real Stellar blockchain payments** and **Soroban smart contracts**. Built for Stellar Hacks: Agents hackathon (April 2026).

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

## 🏗️ Architecture

- **Frontend**: React + Vite + Tailwind + TypeScript
- **Smart Contracts**: Soroban (Rust) - 2 contracts deployed on testnet
- **Blockchain**: Stellar testnet via Soroban SDK
- **Auth**: WebAuthn Passkey (no passwords)
- **Database**: Firebase Firestore
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