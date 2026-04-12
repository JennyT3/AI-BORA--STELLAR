# AI BORA - Stellar Blockchain B2B Sales Platform

[![Stellar](https://img.shields.io/badge/Stellar-Soroban%20Smart%20Contracts-orange)](https://stellar.org)
[![x402](https://img.shields.io/badge/x402-Autonomous%20Agent%20Payments-blue)](https://x402.org)
[![MPP](https://img.shields.io/badge/MPP-Machine%20Payments%20Protocol-green)](https://stellar.org/developers-blog/machine-payments-protocol)

**B2B sales platform with real Stellar blockchain payments, Soroban smart contracts, x402 autonomous agent payments, and MPP support.** Built for **Stellar Hacks: Agents hackathon (April 2026)**.

---

## ⚠️ IMPORTANTE: Tres Modos de Pago Independientes

**Cada transacción usa UNO y solo UNO de estos modos. No son etapas de un flujo combinado.**

| Modo | Usuario | Interfaz | Protocolo | Negociación |
|------|---------|----------|-------------|-------------|
| **UI Tradicional** | Humano | Web (`/pagamento`) | USDC directo | Manual (acepta propuesta) |
| **x402** | Agente IA | API | x402 protocol | Automática (threshold configurable) |
| **MPP** | Agente IA | API | Stellar SAC | Ninguna (precio fijo) |

---

## 🤔 ¿Qué Modo Usar?

```
┌─────────────────────────────────────────────────────────────────┐
│                    ¿QUIÉN INICIA EL PAGO?                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────────┐                                           │
│   │   ¿Es humano?   │                                           │
│   └────────┬────────┘                                           │
│            │                                                     │
│     ┌──────┴──────┐                                              │
│     │             │                                              │
│    SÍ           NO                                               │
│     │             │                                              │
│     ▼             ▼                                              │
│  ┌──────────┐  ┌─────────────────┐                              │
│  │  Modo UI │  │ ¿Tiene soporte  │                              │
│  │Tradicional│  │    x402?        │                              │
│  └──────────┘  └────────┬────────┘                              │
│                         │                                        │
│                  ┌──────┴──────┐                                 │
│                  │             │                                 │
│                 SÍ           NO                                  │
│                  │             │                                 │
│                  ▼             ▼                                 │
│            ┌─────────┐   ┌─────────┐                            │
│            │  Modo   │   │  Modo   │                            │
│            │  x402   │   │   MPP   │                            │
│            └─────────┘   └─────────┘                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Arquitectura: Tres Flujos Separados

### Diagrama A: Flujo Cliente Humano (UI Tradicional)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FLUJO A: CLIENTE HUMANO                                   │
│                    Interfaz Web + Pago Manual                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   ADMIN     │    │   CLIENTE   │    │  COLABORADOR │    │  STELLAR    │  │
│  │  (Humano)   │    │  (Humano)   │    │  (Humano)    │    │  Blockchain │  │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘  │
│         │                  │                  │                  │         │
│         │                  │                  │                  │         │
│         ▼                  │                  │                  │         │
│  ┌─────────────┐           │                  │                  │         │
│  │ /admin/     │           │                  │                  │         │
│  │ orcamento   │           │                  │                  │         │
│  │             │           │                  │                  │         │
│  │ 1. Crea     │           │                  │                  │         │
│  │    propuesta│           │                  │                  │         │
│  │ 2. Genera   │           │                  │                  │         │
│  │    PDF      │           │                  │                  │         │
│  │ 3. Calcula  │           │                  │                  │         │
│  │    SHA-256  │           │                  │                  │         │
│  └──────┬──────┘           │                  │                  │         │
│         │                  │                  │                  │         │
│         │    ┌─────────────┴─────────────┐    │                  │         │
│         │    │                           │    │                  │         │
│         └───►│  ProposalRegistry         │◄───┤                  │         │
│              │  .store_proposal()        │    │                  │         │
│              │                           │    │                  │         │
│              │  TX Hash → Stellar        │────┼──────────────────►│         │
│              └───────────────────────────┘    │                  │         │
│                                              │                  │         │
│         Link ──────────────────────────────►│                  │         │
│                                              │                  │         │
│                                     ┌────────┴────────┐        │         │
│                                     │ /proposal/:id    │        │         │
│                                     │                  │        │         │
│                                     │ 2. Cliente      │        │         │
│                                     │    acepta       │        │         │
│                                     └────────┬────────┘        │         │
│                                              │                  │         │
│                                     ┌────────┴────────┐        │         │
│                                     │ Tareas asignadas │        │         │
│                                     │ al colaborador   │        │         │
│                                     └────────┬────────┘        │         │
│                                              │                  │         │
│                                     ┌────────┴────────┐        │         │
│                                     │ /colaborador/:id │        │         │
│                                     │                  │        │         │
│                                     │ 3. Completa      │        │         │
│                                     │    tareas        │        │         │
│                                     └────────┬────────┘        │         │
│                                              │                  │         │
│                                     ┌────────┴────────┐        │         │
│                                     │ Admin aprueba    │        │         │
│                                     └────────┬────────┘        │         │
│                                              │                  │         │
│                                     ┌────────┴────────┐        │         │
│                                     │ /pagamento/:id  │        │         │
│                                     │                  │        │         │
│                                     │ 4. Cliente paga  │        │         │
│                                     │    USDC          │        │         │
│                                     └────────┬────────┘        │         │
│                                              │                  │         │
│                                              │                  │         │
│                                     ┌────────┴───────────────────────┐    │
│                                     │    PaymentSplitter             │    │
│                                     │    .execute_split()            │    │
│                                     │                                │    │
│                                     │    ┌──────────┐  ┌──────────┐  │    │
│                                     │    │  70%     │  │   30%    │  │    │
│                                     │    │ Vendedor │  │ Colabor  │  │    │
│                                     │    └──────────┘  └──────────┘  │    │
│                                     └────────────────────────────────┘    │
│                                              │                  │         │
│                                              └─────────────────►│         │
│                                                                 │         │
│                                     TX Hash visible en:          │         │
│                                     stellar.expert/explorer      │         │
│                                                                 │         │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Endpoints usados:**
- `/admin/orcamento` - Crear propuesta
- `/proposal/:id` - Cliente acepta
- `/colaborador/:id` - Colaborador completa
- `/pagamento/:id` - Cliente paga USDC

---

### Diagrama B: Flujo Agente IA (x402 Protocol)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FLUJO B: AGENTE IA x402                                   │
│                    HTTP 402 Payment Required                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐                         ┌─────────────────┐           │
│  │   AI AGENT      │                         │  X402 SERVER    │           │
│  │  (Autónomo)     │                         │  (Port 3002)    │           │
│  └────────┬────────┘                         └────────┬────────┘           │
│           │                                           │                    │
│           │  1. GET /api/ai/marketing-plan             │                    │
│           │────────────────────────────────────────────►│                    │
│           │                                           │                    │
│           │  2. 402 Payment Required                  │                    │
│           │    Header: PAYMENT-REQUIRED: base64(...)    │                    │
│           │    Body: { accepts: [{ amount: "100000",  │                    │
│           │                         asset: "native",    │                    │
│           │                         payTo: "GDQX..." }] }│                    │
│           │◄────────────────────────────────────────────│                    │
│           │                                           │                    │
│           │  ┌───────────────────────────────────┐     │                    │
│           │  │ 3. ¿Precio < threshold?           │     │                    │
│           │  │    threshold = MAX_PRICES[service]│     │                    │
│           │  │    (0.05 USDC para marketing-plan) │     │                    │
│           │  └──────────────┬────────────────────┘     │                    │
│           │                 │                          │                    │
│           │         ┌───────┴───────┐                  │                    │
│           │         │               │                  │                    │
│           │        SÍ             NO                   │                    │
│           │         │               │                  │                    │
│           │         ▼               ▼                  │                    │
│           │   [CONTINUAR]    [RECHAZAR]               │                    │
│           │         │                                │                    │
│           │         │  4. Firma transacción Stellar   │                    │
│           │         │     clave: CLIENT_SECRET        │                    │
│           │         │                                │                    │
│           │         │  5. GET /api/ai/marketing-plan  │                    │
│           │         │     Header: X-Payment-Signature│                    │
│           │         ──────────────────────────────────►                    │
│           │         │                                │                    │
│           │         │  6. 200 OK + contenido         │                    │
│           │         │    { data: { title, sections }}│                    │
│           │         │◄────────────────────────────────│                    │
│           │         │                                │                    │
│           │         │  7. Opcional: Llamar split     │                    │
│           │         │     PaymentSplitter.execute_split()                  │
│           │         │                                │                    │
│           │         └────────────────────────────────┼────────────────────►│
│           │                                          │                    │
│           │                                   ┌──────┴──────┐              │
│           │                                   │ STELLAR     │              │
│           │                                   │ BLOCKCHAIN  │              │
│           │                                   │             │              │
│           │                                   │ TX Visible: │              │
│           │                                   │ stellar.expert              │
│           │                                   └─────────────┘              │
│           │                                                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Componentes:**
- `agent-x402-v2.ts` - Agente autónomo que descubre y paga servicios
- `server-x402.ts` - Servidor que retorna 402 y entrega contenido tras pago

**Endpoints usados:**
- `GET /api/ai/marketing-plan` - Retorna 402 si no hay pago
- `GET /api/ai/sales-script` - Retorna 402 si no hay pago
- `GET /api/ai/contract-draft` - Retorna 402 si no hay pago

**Ejecutar:**
```bash
# Terminal 1: Servidor x402
npx tsx server-x402.ts

# Terminal 2: Agente autónomo
npx tsx agent-x402-v2.ts
```

---

### Diagrama C: Flujo Agente IA (MPP - Machine Payments Protocol)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FLUJO C: AGENTE IA MPP                                    │
│                    Direct SAC Transfer                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐                         ┌─────────────────┐           │
│  │   AI AGENT      │                         │  MPP SERVER     │           │
│  │  (Autónomo)     │                         │  (Port 3003)    │           │
│  └────────┬────────┘                         └────────┬────────┘           │
│           │                                           │                    │
│           │  1. GET /mpp/services                     │                    │
│           │────────────────────────────────────────────►                    │
│           │                                           │                    │
│           │  2. Lista de servicios:                    │                    │
│           │    [                                       │                    │
│           │      { id: "marketing-plan",              │                    │
│           │        price: "0.01 USDC",                │                    │
│           │        sacMemo: "ai:marketing-plan" },    │                    │
│           │      { id: "sales-script",                │                    │
│           │        price: "0.005 USDC",               │                    │
│           │        sacMemo: "ai:sales-script" },       │                    │
│           │      ...                                   │                    │
│           │    ]                                       │                    │
│           │◄────────────────────────────────────────────│                    │
│           │                                           │                    │
│           │  3. Agente construye transacción:          │                    │
│           │     - destination: ADMIN_PUBLIC           │                    │
│           │     - amount: 0.01 USDC                    │                    │
│           │     - memo: "ai:marketing-plan"            │                    │
│           │                                           │                    │
│           │  4. Envía transacción a Stellar Network     │                    │
│           │     ────────────────────────────────────────────────────────►   │
│           │                                           │                    │
│           │                              ┌────────────┴────────────┐       │
│           │                              │ STELLAR BLOCKCHAIN       │       │
│           │                              │                          │       │
│           │                              │ 5. MPP Server detecta    │       │
│           │                              │    transacción por memo   │       │
│           │                              │    "ai:marketing-plan"    │       │
│           │                              │                          │       │
│           │                              │ 6. Procesa y entrega     │       │
│           │                              │    contenido             │       │
│           │                              └────────────┬────────────┘       │
│           │                                           │                    │
│           │  7. Contenido entregado                    │                    │
│           │◄────────────────────────────────────────────│                    │
│           │                                           │                    │
│           │  8. PaymentSplitter ejecuta automáticamente│                    │
│           │     ──────────────────────────────────────┼───────────────────►│
│           │                                           │                    │
│           │                              ┌────────────┴────────────┐       │
│           │                              │ PaymentSplitter          │       │
│           │                              │ .execute_split()         │       │
│           │                              │                          │       │
│           │                              │  70% → Vendedor          │       │
│           │                              │  30% → Colaborador       │       │
│           │                              └──────────────────────────┘       │
│           │                                                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Componentes:**
- `server-mpp.ts` - Servidor que acepta SAC transfers
- Cualquier wallet Stellar puede pagar directamente

**Endpoints usados:**
- `GET /mpp/services` - Lista servicios y precios
- `POST /mpp/pay` - Recibe transacción firmada

**Ejecutar:**
```bash
# Terminal: Servidor MPP
npx tsx server-mpp.ts
```

---

## 📊 Comparación de Protocolos

| Característica | UI Tradicional | x402 Protocol | MPP Protocol |
|---------------|----------------|---------------|---------------|
| **Usuario** | Humano con navegador | Agente IA autónomo | Agente IA o wallet |
| **Interfaz** | Web (`/pagamento`) | API REST | API REST / Wallet |
| **Protocolo** | USDC directo | HTTP 402 | Stellar SAC |
| **Negociación** | Manual (acepta propuesta) | Automática (threshold) | Sin negociación |
| **Facilitador** | No requiere | Sí (server-x402) | No |
| **Fees** | Estándar Stellar | Mayores (402 overhead) | Menores (directo) |
| **Complejidad** | Baja | Media | Baja |
| **Uso ideal** | B2B tradicional | APIs dinámicas | Pagos simples |

**⚠️ Cada transacción usa UNO y solo UNO de estos modos. No son etapas de un flujo combinado.**

---

## 📖 Ejemplos Detallados

### Ejemplo A: María (Cliente Humano)

```
┌─────────────────────────────────────────────────────────────────┐
│ EJEMPLO A: FLUJO CLIENTE HUMANO                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ María (admin) crea propuesta en /admin/orcamento               │
│                                                                 │
│ 1. María llena:                                                 │
│    - Cliente: João da Silva                                     │
│    - Servicios: Marketing Plan - €1500                          │
│    - Colaborador: Ana (30%)                                     │
│                                                                 │
│ 2. Sistema genera PDF con hash SHA-256                          │
│    → store_proposal() en ProposalRegistry                       │
│    → TX: https://stellar.expert/.../tx/abc123                   │
│                                                                 │
│ 3. Link enviado: https://ai-bora.com/proposal/xYz               │
│                                                                 │
│ 4. João (cliente) accede y acepta                               │
│    → Tareas asignadas a Ana                                      │
│                                                                 │
│ 5. Ana completa tareas                                          │
│    → María aprueba                                               │
│                                                                 │
│ 6. João paga en /pagamento/xYz                                  │
│    → USDC enviado a PaymentSplitter                              │
│    → execute_split() distribuye:                                 │
│       • 70% (€1050) → María                                      │
│       • 30% (€450) → Ana                                         │
│                                                                 │
│ RESULTADO: Transacción única on-chain                           │
│ Verificable en Stellar Expert                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Ejemplo B: Bot-A (Agente IA con x402)

```
┌─────────────────────────────────────────────────────────────────┐
│ EJEMPLO B: FLUJO AGENTE IA x402                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Bot-A (agente IA) necesita un marketing plan                   │
│                                                                 │
│ 1. Bot-A descubre servicio:                                     │
│    GET http://localhost:3002/api/ai/marketing-plan              │
│                                                                 │
│ 2. Server responde 402:                                         │
│    PAYMENT-REQUIRED: eyJ4ND...                                  │
│    { accepts: [{ amount: "100000",         // 0.01 USDC        │
│                  asset: "native",                               │
│                  payTo: "GDQX74MG4..." }] }                     │
│                                                                 │
│ 3. Bot-A decide:                                                │
│    MAX_PRICE["marketing-plan"] = 0.05 USDC                     │
│    0.01 USDC < 0.05 USDC? → SÍ, ACEPTA                          │
│                                                                 │
│ 4. Bot-A firma transacción con CLIENT_SECRET                    │
│    → Crea payment payload para x402                             │
│                                                                 │
│ 5. Bot-A reenvía request con header:                            │
│    X-Payment-Signature: base64(...)                             │
│    GET /api/ai/marketing-plan                                    │
│                                                                 │
│ 6. Server verifica firma y entrega:                            │
│    200 OK                                                       │
│    { data: { title: "Marketing Plan",                           │
│              sections: [...] } }                                │
│                                                                 │
│ 7. Opcional: PaymentSplitter.execute_split()                    │
│    → 70% Vendedor, 30% Colaborador                              │
│                                                                 │
│ RESULTADO: Agente autónomo pagó y recibió contenido             │
│ Sin intervención humana                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Ejemplo C: Bot-C (Agente IA con MPP)

```
┌─────────────────────────────────────────────────────────────────┐
│ EJEMPLO C: FLUJO AGENTE IA MPP                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Bot-C (agente IA) quiere contenido sin negociar                │
│                                                                 │
│ 1. Bot-C consulta servicios:                                    │
│    GET http://localhost:3003/mpp/services                       │
│                                                                 │
│ 2. Recibe lista:                                                │
│    [ marketing-plan: 0.01 USDC,                                │
│      sales-script: 0.005 USDC,                                 │
│      contract-draft: 0.02 USDC ]                                │
│                                                                 │
│ 3. Bot-C construye transacción Stellar:                         │
│    - destination: GDQX74MG4TVG7BBZCLDCOEOQ...                   │
│    - amount: 0.01 USDC                                          │
│    - memo: "ai:marketing-plan"                                   │
│    - Firma con su clave privada                                 │
│                                                                 │
│ 4. Bot-C envía a Stellar Network                                │
│    → Transacción incluida en bloque                             │
│                                                                 │
│ 5. MPP Server detecta transacción por memo                      │
│    → Procesa "ai:marketing-plan"                                │
│    → Entrega contenido                                          │
│                                                                 │
│ 6. PaymentSplitter ejecuta automáticamente                      │
│    → 70% Vendedor, 30% Colaborador                              │
│                                                                 │
│ RESULTADO: Pago directo sin facilitador                        │
│ Menor fee, más simple                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

```bash
# 1. Setup environment
cp .env.example .env
# Edit .env with your keys (Stellar testnet, Firebase, Clerk)

# 2. Run frontend
npm run dev

# 3. Run x402 server (para agentes IA)
npx tsx server-x402.ts

# 4. Run MPP server (para pagos directos)
npx tsx server-mpp.ts

# 5. Open browser
# http://localhost:3000
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