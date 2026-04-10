# AI BORA - Stellar Blockchain B2B Sales Platform

B2B sales platform with **real Stellar blockchain payments**. Built for Stellar Hacks: Agents hackathon (April 2026).

## 🚀 Quick Start

```bash
npm install
npm run dev
```

## 🎯 Flow

1. **Home** → Click "Get Started"
2. **Register** → Create account with Passkey (fingerprint/Face ID)
3. **Selection** → Choose: Company / Request Service / Work
4. **Admin** → Create proposal → Generates PDF + Stellar TX hash
5. **Client** → Receives email → Views proposal → Pays with Stellar
6. **Payment** → Real transaction on Stellar testnet → Auto-distribute to team

## 🏗️ Architecture

- **Frontend**: React + Vite + Tailwind
- **Auth**: WebAuthn Passkey (no password)
- **Database**: Firebase Firestore
- **Payments**: Stellar blockchain (testnet)
- **Roles**: Admin / Client / Collaborator

## 🔗 Key Features

- ✅ Passkey authentication (WebAuthn)
- ✅ PDF generation with hash stored on Stellar
- ✅ Real Stellar transactions on testnet
- ✅ Auto-distribution payments to team
- ✅ Multi-language (EN/PT)

## 📦 Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Firebase (Auth + Firestore)
- Stellar SDK
- jsPDF

## ⚠️ Setup

Copy `.env.example` to `.env.local` and add your keys:

```
VENDOR_SECRET=your_stellar_secret
VITE_FIREBASE_API_KEY=your_firebase_key
```

## 📄 License

MIT