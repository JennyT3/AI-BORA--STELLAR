# AI BORA - The Agentic Web's Sales Engine

[![Stellar](https://img.shields.io/badge/Stellar-Soroban%20Smart%20Contracts-orange)](https://stellar.org)

**On-chain proposals, autonomous AI payments, and instant 70/30 profit sharing on Stellar.**

Built for **Stellar Hacks: Agents hackathon (April 2026)**.

---

## Overview

AI BORA is a blockchain-native B2B sales platform that automates the full commercial cycle on Stellar:

- **Proposals** are generated as PDFs and anchored on-chain by SHA-256 hash.
- **Clients** review and accept proposals through a link, with magic-link authentication.
- **Collaborators** pick up tasks and get paid automatically.
- **Payments** settle on Stellar and trigger the **PaymentSplitter** contract → **70% company / 30% collaborator**.

Autonomous AI agents can pay for services directly from `ai/agent.ts`.

---

## Repository Structure

```
.
├── front/       React + Vite + TypeScript web app (Vercel)
├── back/        Serverless API routes (Vercel Functions) + Firestore rules
├── contracts/   Soroban smart contracts (Rust)
└── ai/          Autonomous payment agent + x402 client
```

Each package manages its own dependencies; there are no npm workspaces.

| Package | Stack | Key commands |
|---------|-------|--------------|
| `front` | React 19, Vite 6, Tailwind 4 | `npm --prefix front run dev` / `build` / `lint` |
| `back` | Vercel Functions, firebase-admin, Resend | `npm --prefix back run lint` |
| `contracts` | Soroban SDK (Rust) | `cargo test --workspace --manifest-path contracts/Cargo.toml` |
| `ai` | TypeScript, Stellar SDK | `npm --prefix ai start` / `lint` |

---

## Payment Flows

### 1. Human client (web)

```
Admin creates proposal → PDF + SHA-256 anchored on-chain
Client opens proposal link → accepts
Collaborator completes tasks
Client pays → /api/stellar-pay (USDC) → PaymentSplitter executes 70/30
```

### 2. Autonomous AI agent

```
ai/agent.ts loads a funded Stellar account
Builds a payment transaction (memo: AI-BORA:<service>)
Submits to Horizon → service is paid on-chain
```

`ai/x402.ts` provides an x402 payment client for HTTP 402 based flows.

---

## API Routes (`back/api`)

| Route | Purpose |
|-------|---------|
| `client-magic-link.ts` | Issues a client login magic link by email |
| `client-login-validate.ts` | Validates a magic-link token |
| `stellar-pay.ts` | Sends a USDC payment on Stellar |
| `sign-and-submit.ts` | Simulates, signs and submits a Soroban contract call |
| `send-email.ts` | Sends transactional email via Resend |
| `pollar-register.ts` | Registers a Pollar user + custodial wallet (server-side) |
| `pollar-verify.ts` | Verifies a Pollar SDK token server-side |

The frontend calls `/api/*`. In production, the root `vercel.json` rewrites these requests to the `aibora-api` Vercel project (and `front/vercel.json` is used by the `front` deployment).

---

## Smart Contracts (Stellar Testnet)

| Contract | Address |
|----------|---------|
| **ProposalRegistry** | `CBUTZRV7YSJAYQTVSP3NSEDW3URRVCH3WDJQOXYASYQRNZFSLSIGROU5` |
| **PaymentSplitter** | `CCP4JPWI33BC2XCDOLEDOIURMP7NPBY7I532H4N56ZDBCXX3A6BZNZ3P` |
| **AgentRegistry** | `CCXDYLNIWJJB7VNTUWBWJOH26LUZOXKE24JWOPE7Y2E3MOTX2TC66T7M` |

- **ProposalRegistry** stores proposal PDF hashes and tracks status (`pending → accepted → paid`).
- **PaymentSplitter** calculates and distributes the 70/30 split on every payment.
- **AgentRegistry** registers AI agent identities and tracks per-agent earnings.

---

## Quick Start

```bash
# 1. Install dependencies
npm --prefix front install
npm --prefix back install
npm --prefix ai install

# 2. Configure environment
cp front/.env.example front/.env.local
cp back/.env.example back/.env.local
cp ai/.env.example ai/.env

# 3. Run the web app
npm run dev            # front on http://localhost:3000

# 4. Run the backend locally
npx vercel dev --cwd back --listen 3001

# 5. Run the autonomous agent
npm --prefix ai start
```

---

## Verification

```bash
npm run lint             # tsc --noEmit for front, back and ai
npm run build            # production build of front
npm run test:contracts   # cargo test for all Soroban contracts
```

---

## Security

- `require_auth()` on all state-changing contract functions.
- Admin-only operations on privileged endpoints.
- Firebase admin credentials and Stellar secrets stay server-side only (`back/`).
- Client magic-link tokens are single-use and validated server-side.
- `cliente_logins` collection is admin-only in `firestore.rules`.

See `SECURITY_NOTES.md` for details.

---

## Pollar Integration

AI BORA uses **Pollar** (docs.pollar.xyz) to move the collaborator's 30% share from Stellar USDC
into **local fiat across Africa ↔ LatAm** (Mobile Money, PIX, SPEI, PSE, ACH, bank transfer) through
SEP-24 ramps.

### Flow

```
Client pays on-chain USDC → PaymentSplitter 70/30
Collaborator 30% lands on a Pollar custodial Stellar wallet (server-side /api/pollar-register)
Collaborator opens "Cash out with Pollar" in the dashboard
Browser SDK (@pollar/core, publishable key) → email OTP login
getRampsQuote({ country, amount, currency, direction: 'offramp' }) → pick quote
createOffRamp({ quoteId, amount, currency, country, requiredFields }) → SEP-24
USDC → Mobile Money / PIX / SPEI / PSE / ACH / bank
```

### Keys split (never mix)

| Key | Where | Env var |
|-----|-------|---------|
| **Secret** (`sec_…`) | Server only — `back/` | `POLLAR_SECRET_KEY` |
| **Publishable** (`pk_…`) | Browser only — `front/` | `VITE_POLLAR_PUBLIC_KEY` |

Get both at https://dashboard.pollar.xyz (Build → API Keys). The secret key must **never** be added
to `front/` or commit (see `back/.env.example` / `SECURITY_NOTES.md`).

### Server API (used by backend)

- `POST /v1/users/with-wallet` — register a collaborator and provision their custodial Stellar wallet
- `POST /v1/tokens/verify` — validate a browser SDK token (authorizes off-ramps)
- `POST /v1/wallets/fund` — on-chain fund a custodial wallet (deferred funding)

All requests use the header `x-pollar-api-key: <secret>` against `https://server.api.pollar.xyz/v1`.
Client-side flows never use the secret key.

---

## Links

- **Live App**: https://ai-bora-stellar.vercel.app
- **Source Code**: https://github.com/JennyT3/AI-BORA--STELLAR
- **Stellar Explorer**: https://stellar.expert/explorer/testnet
- **Pollar Docs**: https://docs.pollar.xyz
- **Pollar Dashboard**: https://dashboard.pollar.xyz

---

**Built for Stellar Hacks: Agents hackathon (April 2026)**
