import {
  Keypair,
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  BASE_FEE,
  Memo,
} from '@stellar/stellar-sdk';

const HORIZON_URL = process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org';
const NETWORK_PASSPHRASE = Networks.TESTNET;

export interface X402Invoice {
  sessionId: string;
  service: { id: string; name: string };
  payment: {
    network: string;
    destination: string;
    asset: string;
    amount: number;
    memo: string;
  };
}

export interface X402Result<T = Record<string, unknown>> {
  txHash: string;
  payload: T;
}

/**
 * Minimal x402 client: discovers the payment invoice from an HTTP 402
 * `Payment Required` response, pays on-chain via Stellar, then retries the
 * request with the on-chain payment hash as proof to receive the deliverable.
 */
export class X402Client {
  private server: Horizon.Server;
  private keypair: Keypair;

  constructor(secretKey: string) {
    this.server = new Horizon.Server(HORIZON_URL);
    this.keypair = Keypair.fromSecret(secretKey);
  }

  async getInvoice(serviceUrl: string): Promise<X402Invoice> {
    const res = await fetch(serviceUrl, {
      headers: { Accept: 'application/json' },
    });

    if (res.status !== 402) {
      throw new Error(`Expected HTTP 402 with payment invoice, got ${res.status}`);
    }

    const body = await res.json();
    if (body?.error !== 'payment_required' || !body.payment) {
      throw new Error('Malformed 402 response: missing payment invoice');
    }
    return body as X402Invoice;
  }

  async payForService(
    serviceUrl: string,
    destinationAddress: string,
    amount: string,
    memo: string
  ): Promise<string> {
    const account = await this.server.loadAccount(this.keypair.publicKey());

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
      .addMemo(Memo.text(memo))
      .setTimeout(30)
      .build();

    transaction.sign(this.keypair);

    const result = await this.server.submitTransaction(transaction);
    return result.hash;
  }

  async complete<T = Record<string, unknown>>(
    serviceUrl: string,
    invoice: X402Invoice,
    txHash: string
  ): Promise<X402Result<T>> {
    const res = await fetch(serviceUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: invoice.sessionId,
        txHash,
        payer: this.getPublicKey(),
      }),
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(body?.message || body?.error || `Verification failed (${res.status})`);
    }

    return { txHash, payload: body as T };
  }

  /**
   * Full x402 round-trip: invoice (402) → pay → reclaim deliverable.
   */
  async payAndReceive<T = Record<string, unknown>>(serviceUrl: string): Promise<X402Result<T>> {
    const invoice = await this.getInvoice(serviceUrl);

    if (invoice.payment.asset !== 'XLM') {
      throw new Error(`Unsupported payment asset: ${invoice.payment.asset}`);
    }

    const txHash = await this.payForService(
      serviceUrl,
      invoice.payment.destination,
      invoice.payment.amount.toFixed(7),
      invoice.payment.memo
    );

    return this.complete<T>(serviceUrl, invoice, txHash);
  }

  getPublicKey(): string {
    return this.keypair.publicKey();
  }
}