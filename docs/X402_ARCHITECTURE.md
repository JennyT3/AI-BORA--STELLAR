# AI BORA - Arquitectura x402 para Pagos Autónomos de Agentes IA

## Resumen Ejecutivo

AI BORA implementa **pagos máquina-a-máquina (M2M)** donde agentes de IA pueden descubrir, evaluar, comprar y consumir servicios de otros agentes de IA sin intervención humana. Todo el flujo de pago se ejecuta en **Stellar blockchain** con distribución automática **70/30** mediante un contrato inteligente Soroban.

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FLUJO DE PAGO x402                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  AGENTE CLIENTE                    SERVIDOR x402                            │
│  ──────────────                    ─────────────                            │
│                                                                              │
│  1. GET /api/ai/marketing-plan ───────────────────>                          │
│                                                                              │
│  2. <─── 402 Payment Required ─────────────────────                         │
│        Header: PAYMENT-REQUIRED (base64)                                    │
│        Body: {price, asset, payTo, network}                                │
│                                                                              │
│  3. Agente evalúa:                                                          │
│     └─¿price <= threshold?──> ACCEPT                                        │
│     └─¿budget >= price?──────> ACCEPT                                       │
│     └─¿vendor trusted?───────> ACCEPT                                       │
│                                                                              │
│  4. Agente firma transacción Stellar ──────────────────────>                │
│     └─ Stellar Testnet                                                      │
│     └─ Destination: PaymentSplitter Contract                                │
│     └─ Amount: $0.01 USDC                                                   │
│                                                                              │
│  5. GET /api/ai/marketing-plan ───────────────────>                         │
│     Header: X-Payment-Tx: abc123...                                         │
│     Header: X-Agent-ID: GXXXXXXXXX...                                        │
│                                                                              │
│  6. Servidor verifica:                                                       │
│     └─¿Tx existe en Stellar?────> RPC call                                  │
│     └─¿Status = COMMITTED?───────> OK                                        │
│     └─¿Amount correcto?──────────> OK                                        │
│     └─¿Destination = splitter?──> OK                                        │
│     └─¿No usado antes?───────────> OK (anti-replay)                         │
│                                                                              │
│  7. <─── 200 OK ─────────────────────────────────────                       │
│        Body: {marketingPlan: "...", metadata: {...}}                        │
│                                                                              │
│  8. PaymentSplitter.execute_split() ──────────────────>                     │
│     └─ 70% ─> Vendor Wallet                                                 │
│     └─ 30% ─> BORA Company                                                  │
│     └─ Todo on-chain, atómico                                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Endpoints Disponibles

### Servicios de IA (requieren pago)

| Endpoint | Precio | Descripción |
|----------|--------|-------------|
| `GET /api/ai/marketing-plan` | $0.01 USDC | Plan de marketing completo |
| `GET /api/ai/sales-script` | $0.005 USDC | Script de ventas |
| `GET /api/ai/contract-draft` | $0.02 USDC | Borrador de contrato |

### Endpoints de Sistema

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/health` | GET | Estado del servidor |
| `/api/services` | GET | Lista de servicios disponibles |

---

## Integración para Agentes IA

### Python

```python
import requests
import base64
import json
from stellar_sdk import Server, Keypair, TransactionBuilder, Network, Asset

class BoraAgentClient:
    def __init__(self, secret_key, server_url="http://localhost:3002"):
        self.keypair = Keypair.from_secret(secret_key)
        self.server = Server("https://horizon-testnet.stellar.org")
        self.session = requests.Session()
        self.base_url = server_url
    
    def call_service(self, endpoint: str) -> dict:
        """Llama a un servicio de IA con pago automático."""
        
        url = f"{self.base_url}/api/ai/{endpoint}"
        
        # Intento 1: Sin pago
        response = self.session.get(url)
        
        if response.status_code == 200:
            return response.json()
        
        if response.status_code == 402:
            # Decodificar header de pago
            payment_header = response.headers.get('PAYMENT-REQUIRED')
            payment_info = json.loads(base64.b64decode(payment_header))
            
            # Decisión de negocio
            if not self._should_pay(payment_info):
                raise Exception(f"Price ${payment_info['price']} rejected")
            
            # Ejecutar pago
            tx_hash = self._pay(payment_info)
            
            # Reintentar con comprobante
            response = self.session.get(url, headers={
                'X-Payment-Tx': tx_hash,
                'X-Agent-ID': self.keypair.public_key
            })
            
            return response.json()
        
        raise Exception(f"Unexpected status: {response.status_code}")
    
    def _should_pay(self, payment_info: dict) -> bool:
        """Lógica de decisión del agente."""
        price = float(payment_info['price'])
        
        # Reglas de negocio
        if price > 0.10:  # Máximo $0.10
            return False
        if price < 0.05:  # Auto-aceptar si es barato
            return True
        
        return True  # Aceptar por defecto
    
    def _pay(self, payment_info: dict) -> str:
        """Ejecuta pago en Stellar."""
        
        account = self.server.load_account(self.keypair.public_key)
        
        tx = (
            TransactionBuilder(account, network_passphrase=Network.TESTNET_NETWORK_PASSPHRASE)
            .append_payment_op(
                destination=payment_info['payTo'],
                amount=payment_info['price'],
                asset=Asset.native()
            )
            .set_timeout(30)
            .build()
        )
        
        tx.sign(self.keypair)
        result = self.server.submit_transaction(tx)
        
        return result['hash']

# Uso:
agent = BoraAgentClient("SXXXXXXXX...")
plan = agent.call_service("marketing-plan")
print(plan['marketingPlan'])
```

### JavaScript/TypeScript

```typescript
import { Keypair, Server, TransactionBuilder, Networks, Asset } from 'stellar-sdk';

interface PaymentInfo {
  price: string;
  asset: string;
  payTo: string;
  network: string;
}

class BoraAgent {
  private keypair: Keypair;
  private server: Server;
  private session: { get: (url: string, options?: { headers: Record<string, string> }) => Promise<Response> };
  
  constructor(secretKey: string, baseUrl = 'http://localhost:3002') {
    this.keypair = Keypair.fromSecret(secretKey);
    this.server = new Server('https://horizon-testnet.stellar.org');
    this.session = { get: (url, opts) => fetch(url, opts) };
  }
  
  async callService(endpoint: string): Promise<unknown> {
    const url = `${this.baseUrl}/api/ai/${endpoint}`;
    
    // Intento 1: Sin pago
    let response = await this.session.get(url);
    
    if (response.ok) {
      return response.json();
    }
    
    if (response.status === 402) {
      // Decodificar header
      const paymentHeader = response.headers.get('PAYMENT-REQUIRED');
      const paymentInfo = JSON.parse(atob(paymentHeader!)) as PaymentInfo;
      
      // Decisión
      if (!this.shouldPay(paymentInfo)) {
        throw new Error(`Price ${paymentInfo.price} rejected`);
      }
      
      // Pagar
      const txHash = await this.pay(paymentInfo);
      
      // Reintentar
      response = await this.session.get(url, {
        headers: {
          'X-Payment-Tx': txHash,
          'X-Agent-ID': this.keypair.publicKey()
        }
      });
      
      return response.json();
    }
    
    throw new Error(`Unexpected status: ${response.status}`);
  }
  
  private shouldPay(info: PaymentInfo): boolean {
    const price = parseFloat(info.price);
    return price <= 0.10 && price >= 0;
  }
  
  private async pay(info: PaymentInfo): Promise<string> {
    const account = await this.server.loadAccount(this.keypair.publicKey());
    
    const tx = new TransactionBuilder(account, {
      fee: '100',
      networkPassphrase: Networks.TESTNET
    })
      .addOperation({
        type: 'payment',
        destination: info.payTo,
        amount: info.price,
        asset: Asset.native()
      })
      .setTimeout(30)
      .build();
    
    tx.sign(this.keypair);
    const result = await this.server.submitTransaction(tx);
    
    return result.hash;
  }
}
```

---

## Contratos Inteligentes

### PaymentSplitter (Soroban)

**Address:** `CCP4JPWI33BC2XCDOLEDOIURMP7NPBY7I532H4N56ZDBCXX3A6BZNZ3P`

```rust
// Interface
fn create_payment(payer: Address, payment_id: String, amount: i128);
fn execute_split(payment_id: String) -> (i128, i128); // Returns (admin, collaborator)
fn get_payment(payment_id: String) -> PaymentInfo;

// Uso
let contract = Contract::new(PAYMENT_SPLITTER_ID);
let (admin_amount, collab_amount) = contract.execute_split(payment_id);
// admin_amount = total * 0.70
// collab_amount = total * 0.30
```

---

## Seguridad

### Anti-Replay

Cada transacción incluye un memo único:
```
BORA:{agent_public_key}:{timestamp}:{nonce}
```

El servidor mantiene un registro de txHash usados y rechaza duplicados.

### Validación de Transacción

```typescript
async function verifyPayment(txHash: string, expectedAmount: number, expectedDestination: string): Promise<boolean> {
  const tx = await server.getTransaction(txHash);
  
  // Verificar status
  if (tx.status !== 'COMMITTED') return false;
  
  // Verificar monto
  const paymentOp = tx.operations.find(op => op.type === 'payment');
  if (parseFloat(paymentOp.amount) < expectedAmount) return false;
  
  // Verificar destinatario
  if (paymentOp.destination !== expectedDestination) return false;
  
  // Verificar no usado antes
  if (await isTxHashUsed(txHash)) return false;
  
  // Marcar como usado
  await markTxHashAsUsed(txHash);
  
  return true;
}
```

---

## Endpoints de Producción

| Entorno | URL |
|---------|-----|
| Testnet | `http://localhost:3002` |
| Staging | `https://api-staging.aibora.pt` |
| Production | `https://api.aibora.pt` |

---

## Direcciones Stellar

| Propósito | Address |
|-----------|---------|
| Vendor (70%) | `GBM4USEN622JABS37BVEHK43HASCX7PSRDMB37PKL53R725OFOHNWL3B` |
| PaymentSplitter | `CCP4JPWI33BC2XCDOLEDOIURMP7NPBY7I532H4N56ZDBCXX3A6BZNZ3P` |

---

## Enlaces

- [Stellar Explorer - Testnet](https://stellar.expert/explorer/testnet)
- [Stellar Laboratory](https://laboratory.stellar.org)
- [x402 Protocol](https://x402.org)

---

## Ejecutar Demo

```bash
# Terminal 1: Servidor x402
npx tsx server-x402.ts

# Terminal 2: Frontend
npm run dev

# Abrir: http://localhost:3000/agent-x402-demo
```

El demo se ejecuta automáticamente al cargar la página, mostrando el flujo completo de descubrimiento, pago y entrega del servicio.