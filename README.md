# AI BORA - Stellar Blockchain B2B Sales Platform

[![Stellar](https://img.shields.io/badge/Stellar-Soroban%20Smart%20Contracts-orange)](https://stellar.org)
[![x402](https://img.shields.io/badge/x402-Autonomous%20Agent%20Payments-blue)](https://x402.org)
[![MPP](https://img.shields.io/badge/MPP-Machine%20Payments%20Protocol-green)](https://stellar.org/developers-blog/machine-payments-protocol)

**B2B sales platform with real Stellar blockchain payments, Soroban smart contracts, x402 autonomous agent payments, and MPP support.** Built for **Stellar Hacks: Agents hackathon (April 2026)**.

---

## 🎯 Hackathon Criteria (x402 + MPP + Soroban)

### ✅ Soroban Smart Contracts
- **ProposalRegistry** (`CBUTZRV7YSJAYQTVSP3NSEDW3URRVCH3WDJQOXYASYQRNZFSLSIGROU5`)
  - Store proposal PDF hashes on-chain
  - Track status: pending → accepted → paid
  - Verify document integrity
  
- **PaymentSplitter** (`CCP4JPWI33BC2XCDOLEDOIURMP7NPBY7I532H4N56ZDBCXX3A6BZNZ3P`)
  - Automatic 70/30 distribution
  - Admin receives 70%, collaborator receives 30%
  - Called automatically after each payment
  
- **AgentRegistry** (NEW)
  - Register AI agents and their service rates
  - Track total earned per agent
  - Enable inter-contract interoperability

### ✅ x402 Autonomous Agent Payments
- **server-x402.ts**: Paid AI endpoints (402 Payment Required)
- **agent-x402-v2.ts**: Autonomous agent that:
  1. Reads 402 header dynamically
  2. Decides if price is acceptable
  3. Pays automatically via x402
  4. Calls `execute_split` on PaymentSplitter contract
  5. Distributes profits 70/30 on-chain

### ✅ MPP (Machine Payments Protocol)
- **server-mpp.ts**: SAC transfer endpoint
- Direct on-chain settlement
- Lower fees than x402
- Compatible with standard Stellar wallets

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
| **AgentRegistry** | *(to be deployed)* | `register_agent`, `get_agent`, `update_rates`, `record_payment` |

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

Every proposal PDF generates a SHA-256 hash that is stored on-chain:

```bash
# Generate PDF
jsPDF → PDF file

# Calculate hash
const hash = await crypto.subtle.digest('SHA-256', pdfBuffer);
const hexHash = Array.from(new Uint8Array(hash))
  .map(b => b.toString(16).padStart(2, '0'))
  .join('');

# Store on-chain
await storeProposalOnChain(proposalId, clientEmail, hexHash, amount);
```

**Verify on Stellar Expert:**
1. Go to https://stellar.expert/explorer/testnet
2. Search for transaction
3. View `store_proposal` invocation
4. Hex hash is visible in transaction data

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

## 📊 Complete Test Flow

### End-to-End Demo

```bash
# 1. Setup everything
./setup.sh

# 2. Register as empresa (company)
# http://localhost:3000/register
# → Create passkey
# → Select "Empresa"

# 3. Create proposal
# /admin → "New Quick Proposal"
# → Fill form
# → Generate PDF
# → Hash stored on-chain
# → Check: stellar.expert/explorer/testnet/tx/{txHash}

# 4. Client receives email, accepts proposal
# /proposal/{id}
# → Client clicks "Accept"
# → Status updates in ProposalRegistry

# 5. Cliente pays with USDC
# /pagamento/{id}
# → Pay button
# → x402 payment
# → PaymentSplitter.execute_split() called
# → 70% to admin, 30% to collaborator
# → Both transactions visible on Stellar Expert

# 6. Collaborator views earnings
# /colaborador/{id}
# → See pending tasks
# → See completed payments
# → See 30% commission from each job

# 7. Run autonomous agent
npx tsx agent-x402-v2.ts
# → Discovers AI service
# → Reads 402 header
# → Decides price acceptable
# → Pays automatically
# → Calls execute_split on-chain
# → Check transaction on Stellar Expert
```

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

## 📺 Demo Video (3 minutes)

**Key scenes:**

1. **Platform Overview** (15s)
   - Show home page
   - Click "Get Started"
   
2. **Passkey Registration** (30s)
   - Create account with fingerprint
   - No password needed
   
3. **Proposal Creation** (30s)
   - Admin creates proposal
   - PDF generated
   - Hash stored on-chain
   - Show transaction on Stellar Expert
   
4. **Client Flow** (30s)
   - Client receives email
   - Opens proposal
   - Accepts
   
5. **Payment & Split** (45s)
   - Client pays USDC
   - PaymentSplitter auto-distributes 70/30
   - Show both transactions on Stellar Expert
   
6. **Autonomous Agent** (30s)
   - Run `npx tsx agent-x402-v2.ts`
   - Show agent discovering service
   - Paying automatically
   - Calling execute_split

7. **Wrap-up** (10s)
   - Show collaborator panel
   - MPP endpoint
   - Smart contract addresses

---

## 🛠️ Tech Stack

- **Frontend**: React + Vite + Tailwind + TypeScript
- **Smart Contracts**: Soroban (Rust) - 3 contracts deployed
- **Blockchain**: Stellar testnet via Soroban SDK
- **Auth**: WebAuthn Passkey + Clerk (optional)
- **Database**: Firebase Firestore
- **Payment Protocols**: x402 + MPP
- **Roles**: Admin / Client / Collaborator

---

## ⚠️ Setup Checklist

Before demo:

- [ ] Stellar accounts funded via Friendbot
- [ ] USDC trustline added (Circle testnet)
- [ ] `.env` configured with real Firebase/Stellar keys
- [ ] All servers running (frontend + x402 + MPP)
- [ ] Test account created with Passkey
- [ ] Sample proposal created
- [ ] Zoom/Screen recording ready
- [ ] Stellar Expert tabs open for live viewing

---

## 📄 License

MIT

---

## 🙏 Acknowledgments

- Stellar Foundation for Soroban
- x402 Protocol for HTTP 402 machine payments
- Circle for USDC testnet issuer
- Firebase for real-time database
- Clerk for authentication

---

## 📞 Support

- GitHub Issues: https://github.com/your-repo/aibora/issues
- Discord: #stellar-hacks
- Email: support@aibora.pt

---

**Built for Stellar Hacks: Agents hackathon (April 2026)**

*I am a B2B sales platform with real Stellar blockchain payments, Soroban smart contracts, and x402 autonomous agent payments. I demonstrate the full potential of on-chain B2B commerce: transparent proposals, automatic payment distribution, machine-to-machine transactions, and collaborative workflows.*