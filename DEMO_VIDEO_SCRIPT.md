# 🎬 DEMO_VIDEO_SCRIPT.md
## AI BORA - Stellar Hacks Presentation (3 minutes)

**Total time: 3:00**
**Platform: AI BORA - B2B Sales with Blockchain Payments**

---

## Pre-Demo Setup (Do this BEFORE recording)

### 1. Environment Setup (5 minutes)
```bash
# Terminal 1: Setup
./setup.sh

# This will:
# ✅ Fund Stellar accounts via Friendbot
# ✅ Add USDC trustline
# ✅ Start frontend (port 3000)
# ✅ Start x402 server (port 3002)
# ✅ Start MPP server (port 3003)

# Verify all servers are running:
# http://localhost:3000 (frontend)
# http://localhost:3002/api/health (x402)
# http://localhost:3003/health (MPP)
```

### 2. Browser Tabs (Have these open):

1. **Tab 1**: http://localhost:3000 (AI BORA home)
2. **Tab 2**: https://stellar.expert/explorer/testnet (Stellar Explorer)
3. **Tab 3**: https://stellar.expert/explorer/testnet/contract/CBUTZRV7YSJAYQTVSP3NSEDW3URRVCH3WDJQOXYASYQRNZFSLSIGROU5 (ProposalRegistry)
4. **Tab 4**: https://stellar.expert/explorer/testnet/contract/CCP4JPWI33BC2XCDOLEDOIURMP7NPBY7I532H4N56ZDBCXX3A6BZNZ3P (PaymentSplitter)
5. **Tab 5**: Terminal (run autonomous agent)

### 3. Test Accounts Created:
- [ ] Created empresa (company) account with Passkey
- [ ] Created client account
- [ ] Sample proposal created
- [ ] Client accepted proposal

---

## 📹 VIDEO SCRIPT

### Scene 1: Platform Overview (15 seconds)
**[SHOW]: Browser tab 1 - AI BORA home page**

**SCRIPT:**
"AI BORA is a B2B sales platform that uses Stellar blockchain for proposals, payments, and automatic distribution. Companies create proposals with PDFs stored on-chain, clients pay with USDC, and the PaymentSplitter contract distributes 70/30 automatically."

**[ACTION]:**
- Hover over "Get Started" button
- Don't click yet

---

### Scene 2: Passkey Registration (30 seconds)
**[SHOW]: Browser tab 1 → Click "Get Started" → /register page**

**SCRIPT:**
"Authentication uses WebAuthn Passkey - fingerprint or Face ID, no passwords. Let me create an account."

**[ACTION]:**
1. Click "Create Account with Passkey"
2. Use fingerprint/Face ID
3. See redirect to /selection
4. Show "Welcome to AI BORA!"

**[SHOW]: Terminal - Show localStorage**

**NOTE:** No password stored, only Passkey credential ID

---

### Scene 3: Proposal Creation (30 seconds)
**[SHOW]: Browser tab 1 → /admin → "New Quick Proposal"**

**SCRIPT:**
"As an empresa (company), I create a proposal. The system generates a PDF with jsPDF, calculates its SHA-256 hash, and stores it on the ProposalRegistry smart contract on Stellar testnet."

**[ACTION]:**
1. Click "New Quick Proposal"
2. Fill form:
   - Name: "Demo Client"
   - Email: test@example.com
   - Service: "Marketing Analysis"
3. Submit
4. **[SHOW]: Terminal log - "PDF hash stored on-chain"**

**[SHOW]: Browser tab 2 - Stellar Explorer**
- Paste transaction hash
- Show `store_proposal` invocation
- Show hex hash in transaction data

**SCRIPT:**
"Here's the transaction on Stellar Expert. You can see the PDF hash stored on-chain in the ProposalRegistry contract, making it tamper-proof and verifiable."

---

### Scene 4: Client Accepts Proposal (30 seconds)
**[SHOW]: Browser tab 1 → Open `/proposal/{id}` in new tab**

**SCRIPT:**
"The client receives an email with a link. They view the proposal and can accept, request changes, or decline."

**[ACTION]:**
1. Click "Yes, I accept the proposal ✅"
2. Confirm dialog
3. See "Great! Proposal confirmed." message

**[SHOW]: Browser tab 2 - Stellar Explorer**
- Paste transaction hash
- Show `update_status` invocation
- Status changed from "pending" to "accepted"

**SCRIPT:**
"The status updates on-chain. The client's acceptance is recorded in the ProposalRegistry contract."

---

### Scene 5: Payment & 70/30 Split (45 seconds)
**[SHOW]: Browser tab 1 → `/pagamento/{id}`**

**SCRIPT:**
"Now the client pays. The payment is in USDC on Stellar testnet. When they click Pay, two things happen: the x402 protocol handles the payment, and then the PaymentSplitter contract automatically distributes 70% to the admin and 30% to the collaborator."

**[ACTION]:**
1. Click "Pay 1.00 USDC (70/30 auto-split)"
2. Wait for processing

**[SHOW]: Browser tab 2 - Stellar Explorer (2 transactions)**

**Transaction 1: Payment**
- Show USDC transfer
- Show amount: 1.00 USDC
- Show memo: "AIBORA invoice"

**Transaction 2: Split**
- Show `execute_split` invocation
- Show admin amount: 0.70 USDC
- Show collaborator amount: 0.30 USDC

**SCRIPT:**
"Two transactions on-chain. First the payment, second the split. The PaymentSplitter contract ensures the collaborator always gets their fair 30% share, transparently."

---

### Scene 6: Autonomous Agent (30 seconds)
**[SHOW]: Terminal tab 5**

**SCRIPT:**
"Now let me show something unique - an autonomous AI agent that discovers services, reads the price from the 402 header, decides if it's acceptable, pays automatically, and then calls the PaymentSplitter contract to distribute profits."

**[ACTION]:**
1. Clear terminal
2. Type: `npx tsx agent-x402-v2.ts`
3. Press Enter

**[SHOW]: Terminal output**

Expected output:
```
🤖 AI BORA Autonomous Agent v2.0
========================================
This agent demonstrates full autonomy:  1. Reads 402 Payment Required header
  2. Decides if price is acceptable
  3. Pays automatically via x402
  4. Calls PaymentSplitter.execute_split
  5. Distributes profits on-chain 70/30

📡 Autonomous Agent calling http://localhost:3002/api/ai/marketing-plan...
   Status: 402
   💳 Payment required: $0.01 USDC
   🤖 Agent decision: Price acceptable. Proceeding with payment...
   ✅ Paid! Status: 200   📦 Resource: Marketing Plan AI
🔗 Calling PaymentSplitter.execute_split on-chain...✅ Split executed on-chain!
   TX: https://stellar.expert/explorer/testnet/tx/{hash}
   🎉 Complete: Agent paid → Split executed on-chain
```

**[SHOW]: Browser tab 2 - Stellar Explorer**
- Paste transaction hash
- Show `execute_split` call
- Show amounts

**SCRIPT:**
"The agent read the 402 header, saw the price was $0.01, decided it was acceptable, paid automatically, and then triggered the PaymentSplitter to distribute profits. All without human intervention."

---

### Scene 7: Collaborator Panel (30 seconds)
**[SHOW]: Browser tab 1 → `/colaborador/{id}`**

**SCRIPT:**
"Collaborators see their assigned tasks and earnings. After each job completes, they receive their 30% portion automatically. The on-chain distribution ensures transparency."

**[SHOW]: UI elements**
- "Ganado este mes: €850"
- "Tu 30%: €150" (per task)
- Tasks with statuses: disponible, en_progreso, en_revision

**SCRIPT:**
"The 70/30 split is enforced by the PaymentSplitter smart contract. No manual calculations, no delays, no disputes. On-chain, verifiable by anyone."

---

### Scene 8: Smart Contract Addresses (10 seconds)
**[SHOW]: Browser tabs 3 & 4**

**[TAB 3 - ProposalRegistry]:**
- Contract ID: `CBUTZRV7YSJAYQTVSP3NSEDW3URRVCH3WDJQOXYASYQRNZFSLSIGROU5`
- Functions: store_proposal, get_proposal, update_status, verify_hash

**[TAB 4 - PaymentSplitter]:**
- Contract ID: `CCP4JPWI33BC2XCDOLEDOIURMP7NPBY7I532H4N56ZDBCXX3A6BZNZ3P`
- Functions: create_payment, execute_split, get_payment

**SCRIPT:**
"Three Soroban contracts deployed on Stellar testnet. ProposalRegistry for document integrity, PaymentSplitter for automatic distribution, and AgentRegistry for service discovery. The agent registry allows contracts to communicate and track AI agent earnings."

---

### Scene 9: Wrap-up (10 seconds)
**[SHOW]: Browser tab 1 - AI BORA home**

**SCRIPT:**
"AI BORA demonstrates the full potential of blockchain for B2B commerce: tamper-proof proposals, transparent payments, automatic distribution, and autonomous agents. Built for Stellar Hacks."

**[SHOW]**
- MPP server badge
- x402 protocol badge
- Soroban smart contracts badge

---

## 🎬 POST-RECORDING

### Export As:
- Format: MP4, 1080p
- Filename: `AI_BORA_Demo_Stellar_Hacks_2026.mp4`
- Duration: 2:45 - 3:00

### Upload To:
- YouTube (unlisted)
- Stellar Hacks submission form

### Include in Description:
```
AI BORA - B2B Sales Platform with Stellar Blockchain

Features:
✅ Soroban Smart Contracts (ProposalRegistry + PaymentSplitter + AgentRegistry)
✅ x402 Autonomous Agent Payments
✅ MPP (Machine Payments Protocol)
✅ WebAuthn Passkey Authentication
✅ PDF Hash on-chain Verification
✅ 70/30 Automatic Distribution

Contract Addresses:
- ProposalRegistry: CBUTZRV7YSJAYQTVSP3NSEDW3URRVCH3WDJQOXYASYQRNZFSLSIGROU5
- PaymentSplitter: CCP4JPWI33BC2XCDOLEDOIURMP7NPBY7I532H4N56ZDBCXX3A6BZNZ3P
- AgentRegistry: (deployed on testnet)

GitHub: [YOUR_REPO_URL]
Stellar Hacks: April 2026
```

---

## ⚠️ TROUBLESHOOTING

### If x402 server fails to start:
```bash
# Check port 3002 is not in use
lsof -ti:3002 | xargs kill -9

# Restart
npx tsx server-x402.ts
```

### If payment fails:
1. Verify USDC trustline exists
2. Verify accounts are funded
3. Check console for errors

### If agent fails:
```bash
# Ensure CLIENT_SECRET is set in .env
echo "CLIENT_SECRET=..." >> .env

# Re-run
npx tsx agent-x402-v2.ts
```

### If contracts not found:
1. Verify contract IDs in `src/services/soroban.ts`
2. Check Stellar Expert for deployment status

---

## 📋 FINAL CHECKLIST (Before Recording)

- [ ] Setup script ran successfully
- [ ] All 5 servers running (frontend, x402, MPP, terminal, explorer)
- [ ] Test accounts created
- [ ] Sample proposal ready
- [ ] Browser tabs arranged for quick switching
- [ ] Terminal cleared, ready to run agent
- [ ] Screen recording software configured
- [ ] Microphone tested
- [ ] 3-minute timer visible

---

## 🎯 KEY TALKING POINTS

1. **"Tamper-proof"** - PDF hash on-chain
2. **"Automatic"** - PaymentSplitter runs without intervention
3. **"Transparent"** - All transactions visible on Stellar Expert
4. **"Autonomous"** - AI agent reads, decides, pays
5. **"Interoperable"** - Multiple contracts communicate
6. **"On-chain"** - Everything is verifiable

---

**Recording Time: ~10 minutes**
**Editing Time: ~5 minutes**
**Total: ~15 minutes end-to-end**

Good luck! 🚀