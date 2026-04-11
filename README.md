# AI BORA - Stellar Blockchain B2B Sales Platform

[![Stellar](https://img.shields.io/badge/Stellar-Soroban%20Smart%20Contracts-orange)](https://stellar.org)
[![x402](https://img.shields.io/badge/x402-Autonomous%20Agent%20Payments-blue)](https://x402.org)
[![MPP](https://img.shields.io/badge/MPP-Machine%20Payments%20Protocol-green)](https://stellar.org/developers-blog/machine-payments-protocol)

**B2B sales platform with real Stellar blockchain payments, Soroban smart contracts, x402 autonomous agent payments, and MPP support.** Built for **Stellar Hacks: Agents hackathon (April 2026)**.

---

## 🎯 Hackathon Criteria (x402 + MPP + Soroban)

### ✅ Soroban Smart Contracts
- **ProposalRegistry** (`CBUTZRV7YSJAYQTVSP3NSEDW3URRVCH3WDJQOXYASYQRNZFSLSIGROU5`)
  - Store proposal PDF hashes on-chain (SHA-256)
  - Track status: pending → accepted → paid
  - Verify document integrity
  - **Connected to /admin/orcamento and QuickProposalForm**
  - Deployed and verified on Stellar Expert (14+ invocations)
  
- **PaymentSplitter** (`CCP4JPWI33BC2XCDOLEDOIURMP7NPBY7I532H4N56ZDBCXX3A6BZNZ3P`)
  - Automatic 70/30 distribution
  - Admin receives 70%, collaborator receives 30%
  - Called automatically after each payment
  - **Connected to /pagamento page**
  - Deployed and verified on Stellar Expert
  
- **AgentRegistry** (`CCXDYLNIWJJB7VNTUWBWJOH26LUZOXKE24JWOPE7Y2E3MOTX2TC66T7M`)
  - Register AI agents and their service rates
  - Track total earned per agent
  - Enable inter-contract interoperability
  - Deployed and verified on Stellar Expert

### ✅ x402 Autonomous Agent Payments
- **server-x402.ts**: Paid AI endpoints (402 Payment Required)
- **agent-x402-v2.ts**: Autonomous agent that:
  1. Reads 402 header dynamically
  2. Decides if price is acceptable
  3. Pays automatically via x402
  4. Calls `execute_split` on PaymentSplitter contract
  5. Distributes profits 70/30

### ✅ MPP (Machine Payments Protocol)
- **server-mpp.ts**: SAC transfer endpoint
- Direct on-chain settlement
- Lower fees than x402
- Compatible with standard Stellar wallets

### ✅ Frontend Integration
- **/admin/orcamento**: Generates proposal PDF → calculates SHA-256 → stores on ProposalRegistry contract
- **/admin QuickProposalForm**: Same flow for quick proposals
- **/pagamento**: Pays USDC → triggers PaymentSplitter.execute_split() → 70/30 distribution
- **All hashes visible on Stellar Expert**

### ✅ Interoperability
- Multiple contracts communicate
- AgentRegistry tracks payments from PaymentSplitter
- ProposalRegistry updates status from frontend
- Full end-to-end transparency

### ✅ Documentation & Git History
- Comprehensive README
- Clear commit history: `feat:`, `fix:`, `chore:`
- Rust workspace configured for GitHub detection
- Unit tests in all contracts

---

## 🚀 Quick Start

```bash
# 1. Setup environment
cp .env.example .env
# Edit .env with your keys (Stellar testnet, Firebase, Clerk)

# 2. Run automated setup
chmod +x setup.sh
./setup.sh

# Or use Node.js version
node setup.mjs

# This will:
# - Install dependencies
# - Fund Stellar accounts via Friendbot
# - Add USDC trustline
# - Start all servers (frontend, x402, MPP)

# 3. Open browser
# http://localhost:3000
```

---

## 🏗️ Architecture

```
┌─────────────────┐
│  Frontend (React)│
│  - Passkey Auth  │
│  - PDF Generation│
│  - Stellar Pay   │
└────────┬─────────┘
         │
         ├─► /register → WebAuthn Passkey
         ├─► /admin → Create proposals
         ├─► /proposal/:id → Client accepts
         ├─► /pagamento/:id → Client pays (USDC)
         │                    ↓
         │          PaymentSplitter.execute_split()
         │                    ↓
         │          Admin (70%) + Collaborator (30%)
         │                    ↓
         └─► /colaborador/:id → View earnings

┌─────────────────────┐
│  x402 Server (3002) │
│  - GET /api/ai/*    │  402 Payment Required
│  - Returns AI data  │
└────────┬────────────┘
         │
         ├─► Agent discovers service
         ├─► Agent reads price
         ├─► Agent pays via x402
         └─► Agent calls execute_split

┌─────────────────────┐
│  MPP Server (3003)  │
│  - POST /mpp/pay   │  SAC Transfer
│  - Direct settlement│
└─────────────────────┘

┌────────────────────────┐
│  Soroban Contracts     │
│  - ProposalRegistry    │
│  - PaymentSplitter     │
│  - AgentRegistry       │
└────────────────────────┘
```

---

## 🔗 Smart Contracts (Testnet)

| Contract | ID | Functions |
|----------|-----|-----------|
| **ProposalRegistry** | `CBUTZRV7YSJAYQTVSP3NSEDW3URRVCH3WDJQOXYASYQRNZFSLSIGROU5` | `store_proposal`, `get_proposal`, `update_status`, `verify_hash` |
| **PaymentSplitter** | `CCP4JPWI33BC2XCDOLEDOIURMP7NPBY7I532H4N56ZDBCXX3A6BZNZ3P` | `create_payment`, `execute_split`, `get_payment` |
| **AgentRegistry** | `CCXDYLNIWJJB7VNTUWBWJOH26LUZOXKE24JWOPE7Y2E3MOTX2TC66T7M` | `register_agent`, `get_agent`, `update_rates`, `record_payment` |

### Payment Distribution
- Admin: 70%
- Collaborator: 30%
- On-chain, transparent, verified

---

## 🤖 x402 Autonomous Agent Flow

### 1. Start the x402 server
```bash
npx tsx server-x402.ts
```

### 2. Run the autonomous agent
```bash
npx tsx agent-x402-v2.ts
```

### What it does:
1. **Discovers** service endpoints
2. **Reads** 402 Payment Required header
3. **Decides** if price is acceptable (under configured threshold)
4. **Pays** automatically via x402 protocol
5. **Calls** PaymentSplitter.execute_split() on-chain
6. **Distributes** 70/30 automatically

---

## 🏛️ MPP (Machine Payments Protocol)

### Start the MPP server
```bash
npx tsx server-mpp.ts
```

### Endpoints
- `GET /mpp/services` - List available AI services
- `POST /mpp/pay` - Accept SAC transfer

### Comparison
| Protocol | Settlement | Fees | Requires Facilitator |
|----------|-----------|------|-----------------------|
| **x402** | On-chain | Higher | Yes |
| **MPP** | On-chain | Lower | No |

Both are implemented for complete hackathon compliance.

---

## 📄 PDF Hash Verification

Every proposal PDF generates a SHA-256 hash that is stored on-chain in the ProposalRegistry smart contract:

```typescript
// In /admin/orcamento or /admin QuickProposalForm:

// 1. Generate PDF
const doc = await criarPDF();
const pdfBlob = doc.output('blob');

// 2. Calculate SHA-256
const pdfArrayBuffer = await pdfBlob.arrayBuffer();
const pdfHashBuffer = await crypto.subtle.digest('SHA-256', pdfArrayBuffer);
const pdfHash = Array.from(new Uint8Array(pdfHashBuffer))
  .map(b => b.toString(16).padStart(2, '0'))
  .join('');

// 3. Store on Soroban ProposalRegistry
const stellarResult = await storeProposalOnChain(
  proposalId,
  clientEmail,
  pdfHash,
  amount
);

// 4. Save proposal with Stellar transaction hash
await createProposal({
  ...proposalData,
  pdfHash,
  stellarTxHash: stellarResult.txHash,
  stellarExplorerUrl: stellarResult.explorerUrl
});
```

**Verify on Stellar Expert:**
1. Go to https://stellar.expert/explorer/testnet
2. Search for transaction hash
3. View `store_proposal` invocation
4. See PDF SHA-256 hash in transaction data

**Flow:**
```
/admin/orcamento (Admin creates proposal)
  ↓
Generate PDF with jsPDF
  ↓
Calculate SHA-256 hash
  ↓
ProposalRegistry.store_proposal()
  ↓
Transaction on Stellar testnet
  ↓
Save to Firestore with txHash
  ↓
Client views proposal
  ↓
Client pays USDC
  ↓
PaymentSplitter.execute_split()
  ↓
70% admin + 30% collaborator
  ↓
All transactions visible on Stellar Expert
```

---

## 🔐 Security

### Authentication
- **WebAuthn Passkey**: Fingerprint/Face ID, no passwords
- **Clerk Auth**: Optional, for production

### CSP Configuration
Allows necessary domains:
- `connect-src`: Firebase, Stellar testnet, Horizon, friendbot
- No external script injection
- Safe defaults

### Smart Contract Security
- `require_auth()` on all state-changing functions
- Admin-only operations
- No unprotected external calls

---

## 🧪 Smart Contract Tests

```bash
# Run all contract tests
cargo test --all

# Run specific contract
cargo test -p proposal_registry
cargo test -p payment_splitter
cargo test -p agent_registry

# With coverage
cargo tarpaulin --all
```

Tests include:
- ✅ store_proposal with PDF hash
- ✅ update_status transitions
- ✅ verify_hash consistency
- ✅ create_payment with 70/30 split
- ✅ execute_split returns correct amounts
- ✅ register_agent with service rates
- ✅ record_payment updates earnings

---

## 🛠️ Tech Stack

- **Frontend**: React + Vite + Tailwind + TypeScript
- **Smart Contracts**: Soroban (Rust) - 3 contracts deployed
- **Blockchain**: Stellar testnet via Soroban SDK
- **Auth**: WebAuthn Passkey + Clerk
- **Database**: Firebase Firestore
- **Payment Protocols**: x402 + MPP
- **Roles**: Admin / Client / Collaborator

---

## 📞 Support

- Email: geral@aibora.pt
- Website: https://aibora.pt

---

**Built for Stellar Hacks: Agents hackathon (April 2026)**

*I am a B2B sales platform with real Stellar blockchain payments, Soroban smart contracts, and x402 autonomous agent payments. I demonstrate the full potential of on-chain B2B commerce: transparent proposals, automatic payment distribution, machine-to-machine transactions, and collaborative workflows.*