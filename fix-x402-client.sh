#!/bin/bash

# Navegar al archivo
cd /Users/jennytejedor/Desktop/AIBORA_PUBLIC

# Crear backup
cp lib/stellar/x402-client.ts lib/stellar/x402-client.ts.backup

# Arreglar imports no usados
sed -i '' 's/^import {$/import {/g' lib/stellar/x402-client.ts

# El archivo tiene problemas, mejor lo simplificamos
cat > lib/stellar/x402-client.ts << 'ENDFILE'
import {
  Keypair,
  Server,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  BASE_FEE,
} from '@stellar/stellar-sdk';

// Configuración
const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const NETWORK_PASSPHRASE = Networks.TESTNET;

export interface PaymentRequest {
  asset: string;
  signedTxXdr: string;
  sourceAccount: string;
  amount: string;
  destination: string;
  validUntilLedger: number;
  nonce: string;
}

export class X402Client {
  private server: Server;
  private keypair: Keypair;

  constructor(secretKey: string) {
    this.server = new Server(HORIZON_URL);
    this.keypair = Keypair.fromSecret(secretKey);
  }

  async payForService(
    serviceUrl: string,
    destinationAddress: string,
    amount: string
  ): Promise<string> {
    try {
      // Cargar cuenta
      const account = await this.server.loadAccount(this.keypair.publicKey());
      
      // Construir transacción
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(
          Operation.payment({
            destination: destinationAddress,
            asset: Asset.native(),
            amount: amount,
          })
        )
        .setTimeout(30)
        .build();

      // Firmar
      transaction.sign(this.keypair);

      // Enviar
      const result = await this.server.submitTransaction(transaction);
      return result.hash;
    } catch (error) {
      console.error('Payment failed:', error);
      throw error;
    }
  }

  getPublicKey(): string {
    return this.keypair.publicKey();
  }
}
ENDFILE

echo "✅ x402-client.ts arreglado"
