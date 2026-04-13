# AI BORA - The Agentic Web's Sales Engine

[![Stellar](https://img.shields.io/badge/Stellar-Soroban%20Smart%20Contracts-orange)](https://stellar.org)
[![x402](https://img.shields.io/badge/x402-Autonomous%20Agent%20Payments-blue)](https://x402.org)
[![MPP](https://img.shields.io/badge/MPP-Machine%20Payments%20Protocol-green)](https://stellar.org/developers-blog/machine-payments-protocol)

**AI BORA: The Agentic Web's Sales Engine. On-Chain Proposals, Autonomous AI Payments, Instant 70/30 Profit Sharing on Stellar.**

Built for **Stellar Hacks: Agents hackathon (April 2026)**.

---

## The Problem

Traditional B2B commerce suffers from:
- **3-7 day payment delays** - Freelancers wait for payouts
- **High intermediary fees** - Platform cuts, processing delays
- **Zero infrastructure for AI agents** - No way for autonomous agents to pay or get paid
- **Manual profit splitting** - Accounting disputes, delayed collaborator payments

## The Solution

AI BORA is a blockchain-native B2B sales platform that automates the complete commercial transaction cycle using **Stellar**. It enables **three independent payment flows**:

| Flow | User Type | Negotiation | Settlement |
|------|-----------|-------------|------------|
| **UI Traditional** | Human (B2B) | Manual review | USDC instant |
| **x402 Protocol** | AI Agent | Auto-decide via HTTP 402 | USDC instant |
| **MPP Protocol** | AI Agent | None (fixed price) | XLM direct |

All payments trigger the **PaymentSplitter smart contract** → **70% to company, 30% to collaborator** automatically.

---

## How It Works (Three Payment Scenarios)

### SCENARIO 1: Traditional B2B (Human Flow)

```
Admin creates proposal → PDF + SHA-256 hash stored on-chain
Client receives link → Reviews & accepts
Collaborator assigned → Completes work
Client pays USDC → PaymentSplitter executes split (70/30)
All parties receive instant payment
```

**Use when:** You're a company selling B2B services to human clients.

### SCENARIO 2: AI Agents with Price Negotiation (x402)

```
External AI Agent → Discovers your services
Your API → Responds HTTP 402 + price header
Agent → Reads price, decides if acceptable
If YES → Agent pays via x402, signs transaction
Your Server → Verifies signature, delivers content
PaymentSplitter → Auto-executes 70/30 split
```

**Use when:** You want AI agents to negotiate prices before paying.

### SCENARIO 3: AI Agents Pay Directly (MPP)

```
AI Agent → Queries your service list
Your Server → Returns fixed prices
Agent → Pays directly on Stellar blockchain (XLM)
Your Server → Detects payment via memo, delivers content
PaymentSplitter → Auto-executes 70/30 split
```

**Use when:** You want zero intermediaries, lowest fees, direct on-chain settlement.

---

## Which Mode to Use?

```
Who is paying?
│
├── Human with browser?────► Use UI Traditional (/pagamento)
│
├── AI Agent with x402?────► Use x402 (server-x402.ts)
│
└── AI Agent without x402?──► Use MPP (server-mpp.ts)
```

---

## Smart Contracts (Stellar Testnet)

### ProposalRegistry
`CBUTZRV7YSJAYQTVSP3NSEDW3URRVCH3WDJQOXYASYQRNZFSLSIGROU5`

- Store proposal PDF hashes on-chain (SHA-256)
- Track status: pending → accepted → paid
- Verify document integrity
- **Deployed & verified** on Stellar Expert

### PaymentSplitter  
`CCP4JPWI33BC2XCDOLEDOIURMP7NPBY7I532H4N56ZDBCXX3A6BZNZ3P`

- Triggers on every payment
- Calculates 70% admin, 30% collaborator
- Auto-distributes trustlessly
- **Used in ALL 3 payment scenarios**

### AgentRegistry
`CCXDYLNIWJJB7VNTUWBWJOH26LUZOXKE24JWOPE7Y2E3MOTX2TC66T7M`

- Register AI agent identities
- Track earnings per agent
- Enable multi-agent coordination

---

## Real Transactions (Stellar Testnet)

All payments verified on Stellar Expert:

| Service | Amount | TX Hash |
|---------|--------|---------|
| marketing-plan | 0.05 XLM | `23a21e6010b3b0ccee675790c8f4c009ae621dd873dcdcaea58d3e1b1ddc4b11` |
| sales-script | 0.03 XLM | `bafeb88b5f3b4bbc6b700accc02700c0c9b9198eeda427b2587d8c1ff82254ae` |
| contract-draft | 0.10 XLM | `e48aef0e9b1735f4673b063c44dbb4979b86f0b48310a2e6893527509f5a36e0` |

**Verify:** https://stellar.expert/explorer/testnet

---

## Quick Start

```bash
# 1. Setup environment
cp .env.example .env
# Edit .env with your Stellar testnet keys

# 2. Run setup
chmod +x setup.sh && ./setup.sh

# 3. Start servers
npm run dev           # Frontend (port 3000)
npx tsx server-x402.ts # x402 server (port 3002)
npx tsx server-mpp.ts  # MPP server (port 3003)
```

---

## Architecture

### Flow A: Human Client (UI Traditional)

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌────────────┐
│  ADMIN   │     │  CLIENT  │     │COLLABOR- │     │  STELLAR   │
│ (Human)  │     │ (Human)  │     │  ATOR    │     │ Blockchain │
└────┬─────┘     └────┬─────┘     └────┬─────┘    └─────┬──────┘
     │                │                │                 │
     │ /admin/        │                │                 │
     │ orcamento      │                │                 │
     │                │                │                 │
     │ PDF + SHA-256 ─┼────────────────┼────────────────►│ store_proposal()
     │                │                │                 │
     └──────────────► /proposal/:id    │                 │
                      │                │                 │
                      │ Accept         │                 │
                      └───────────────►│ Assign tasks    │
                                       │                 │
                                       │ Complete tasks  │
                      /pagamento/:id ◄───────────────────┤
                      │                                    │
                      │ Pay USDC ──────────────────────────►│
                      │                                    │
                      │              PaymentSplitter.execute_split()
                      │                    │               │
                      │              70% → Admin          │
                      │              30% → Collaborator    │
                      │                                    │
                      └────────────────────────────────────┘
```

### Flow B: AI Agent (x402 Protocol)

```
┌─────────────┐                    ┌─────────────┐
│  AI AGENT   │                    │ X402 SERVER │
│ (Autonomous)│                    │ (Port 3002) │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       │ 1. GET /api/ai/marketing-plan    │
       │─────────────────────────────────►│
       │                                  │
       │ 2. 402 Payment Required          │
       │    { amount: "0.01 USDC" }        │
       │◄─────────────────────────────────│
       │                                  │
       │ 3. Decision: Price OK?           │
       │    threshold = $0.05             │
       │    0.01 < 0.05? → YES            │
       │                                  │
       │ 4. Signs transaction             │
       │ 5. GET + X-Payment-Signature     │
       │─────────────────────────────────►│
       │                                  │
       │ 6. 200 OK + content               │
       │◄─────────────────────────────────│
       │                                  │
       │ 7. PaymentSplitter (70/30)       │
       │──────────────────────────────────►│
       │                                  │
       └───────────────────────────────────┘
```

### Flow C: AI Agent (MPP Protocol)

```
┌─────────────┐                    ┌─────────────┐
│  AI AGENT   │                    │ MPP SERVER  │
│ (Autonomous)│                    │ (Port 3003) │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       │ 1. GET /mpp/services             │
       │◄─────────────────────────────────│
       │    { marketing-plan: $0.05 }     │
       │                                  │
       │ 2. Build Stellar transaction     │
       │    - to: ADMIN_PUBLIC             │
       │    - amount: 0.05 XLM             │
       │    - memo: "ai:marketing-plan"    │
       │                                  │
       │ 3. Submit to Stellar Network ────┼───► STELLAR
       │                                  │
       │ 4. MPP detects memo              │
       │    & delivers content            │
       │◄─────────────────────────────────│
       │                                  │
       │ 5. PaymentSplitter (70/30)       │
       │    70% → Admin                   │
       │    30% → Collaborator            │
       │                                  │
       └───────────────────────────────────┘
```

---

## Key Technologies

| Technology | Purpose |
|------------|---------|
| **Soroban Smart Contracts** | 3 contracts fully deployed on Stellar testnet |
| **x402 Protocol** | HTTP 402 standard for autonomous agent price negotiation |
| **MPP (Machine Payments Protocol)** | Direct Stellar blockchain settlement |
| **SHA-256 On-Chain Hashing** | Every proposal PDF hash stored on-chain |
| **USDC/XLM Payments** | Circle testnet stablecoin + native XLM settlement |
| **WebAuthn Authentication** | Passwordless login (fingerprint/Face ID) |
| **Zero Intermediaries** | Direct wallet-to-wallet transfers |

---

## Payment Flow Comparison

| Feature | UI Traditional | x402 | MPP |
|---------|----------------|------|-----|
| **User** | Human | AI Agent | AI Agent |
| **Interface** | Web browser | HTTP API | Stellar blockchain |
| **Price Discovery** | Manual review | HTTP 402 header | Service list |
| **Negotiation** | Manual | Automatic (agent decides) | None (fixed price) |
| **Payment Method** | Click button | Agent signs + pays | Direct Stellar transfer |
| **Settlement Time** | Instant | Instant | Instant |
| **Fees** | Base fee (~0.00001 XLM) | Higher (signature verification) | Lower (direct payment) |
| **Best For** | B2B sales | Dynamic APIs | Micro-transactions |

---

## What Makes AI BORA Unique

1. **Soroban smart contracts for B2B automation** - Complete workflow automation (proposal, status tracking, profit distribution)

2. **Autonomous AI agents as customers** - Both humans AND robots can buy your services

3. **Price negotiation for agents (x402)** - Agents see price BEFORE paying. Dynamic pricing for APIs.

4. **Direct on-chain settlement (MPP)** - No intermediaries. Zero fees except Stellar base fee.

5. **On-chain document verification** - SHA-256 proofs prevent disputes

6. **Automatic trustless profit splitting** - 70/30 split instant, every time

7. **Production-ready with real deployments** - All contracts verified and invoked on testnet

---

## Test the Autonomous Agent

```bash
# Run the agent that pays automatically
npx tsx agent-x402-direct.ts
```

**Output:**
```
✅ marketing-plan: 0.05 XLM
   TX: 23a21e6010b3b0ccee67...
✅ sales-script: 0.03 XLM
   TX: bafeb88b5f3b4bbc6b70...
✅ contract-draft: 0.10 XLM
   TX: e48aef0e9b1735f4673b...
Total paid: 0.18 XLM
```

---

## Smart Contract Tests

```bash
cargo test --all
```

Tests include:
- store_proposal with PDF hash
- update_status transitions  
- verify_hash consistency
- create_payment with 70/30 split
- execute_split returns correct amounts
- register_agent with service rates
- record_payment updates earnings

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite + Tailwind + TypeScript |
| Smart Contracts | Soroban (Rust) - 3 contracts deployed |
| Blockchain | Stellar testnet via Soroban SDK |
| Auth | WebAuthn Passkey |
| Database | Firebase Firestore |
| Payment Protocols | x402 + MPP |

---

## Security

- `require_auth()` on all state-changing functions
- Admin-only operations
- No unprotected external calls
- CSP configured for necessary domains
- WebAuthn passwordless authentication

---

## Live Demo

- **App**: https://ai-bora-stellar.vercel.app
- **Source**: https://github.com/JennyT3/AI-BORA--STELLAR
- **Explorer**: https://stellar.expert/explorer/testnet

---

## Hackathon Achievement

- Soroban Excellence: 3 fully functional contracts
- Autonomous Agents: x402 + MPP protocols implemented
- On-Chain Verification: SHA-256 proposal hashing
- Real Integration: Frontend + Backend + Contracts + Blockchain
- Production Code: TypeScript + Rust with proper testing
- Clean Git History: Meaningful commits

---

**Built for Stellar Hacks: Agents hackathon (April 2026)**

*AI BORA solves the core problem of B2B commerce: slow payments, high fees, and no infrastructure for AI agents. On-chain proposals. Autonomous AI payments. Instant 70/30 profit sharing. Built on Stellar with Soroban smart contracts. Deployed and live.*