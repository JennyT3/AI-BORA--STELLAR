/**
 * API Endpoint: Paid AI service with an HTTP 402 (x402-style) handshake.
 *
 * Flow:
 *   1. `GET /api/agent-service?service=<id>` respond `402 Payment Required`
 *      with payment requirements (destination, amount, memo, network, session).
 *   2. The AI agent pays on Stellar (XLM) to the vendor with the required memo.
 *   3. `POST /api/agent-service` with `{ sessionId, txHash }` verifies the
 *      payment on-chain via Horizon and returns the service deliverable.
 *
 * This makes the autonomous AI agent (`ai/agent.ts`) pay for a real service
 * instead of just emitting a random payment transaction.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as StellarSdk from '@stellar/stellar-sdk';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;

const VENDOR_PUBLIC = process.env.VENDOR_PUBLIC || 'GDQX74MG4TVG7BBZCLDCOEOQX2PADCTRUIDAWG5KLIQ64LYURC5XC7CN';

interface ServiceDef {
  id: string;
  name: string;
  priceXlm: number;
}

const SERVICES: Record<string, ServiceDef> = {
  'marketing-plan': {
    id: 'marketing-plan',
    name: 'AI BORA Marketing Plan',
    priceXlm: 0.05,
  },
  'sales-script': {
    id: 'sales-script',
    name: 'AI BORA Sales Script',
    priceXlm: 0.03,
  },
  'contract-draft': {
    id: 'contract-draft',
    name: 'AI BORA Contract Draft',
    priceXlm: 0.1,
  },
};

const SESSION_TTL_MS = 30 * 60 * 1000;
const sessions = new Map<
  string,
  {
    serviceId: string;
    memo: string;
    destination: string;
    priceXlm: number;
    createdAt: number;
  }
>();

function makeSessionId(): string {
  return 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function cleanupSessions(): void {
  const now = Date.now();
  for (const [id, s] of sessions) {
    if (now - s.createdAt > SESSION_TTL_MS) sessions.delete(id);
  }
}

function buildDeliverable(serviceId: string, txHash: string): Record<string, unknown> {
  const base = {
    service: serviceId,
    paid: true,
    paidAt: new Date().toISOString(),
    txHash,
    explorerUrl: `https://stellar.expert/explorer/testnet/tx/${txHash}`,
  };

  if (serviceId === 'marketing-plan') {
    return {
      ...base,
      title: 'AI BORA Marketing Plan',
      summary:
        'A 90-day plan to move your B2B sales to on-chain proposals and instant settlements.',
      deliverables: [
        'Landing page A/B test variants (hero copy + CTA)',
        'LinkedIn outreach sequence for decision makers',
        'On-chain proposal explainer video script',
      ],
      nextSteps: ['Launch week 1 campaign', 'Track proposal conversions on Stellar', 'Retarget warm leads'],
    };
  }
  if (serviceId === 'sales-script') {
    return {
      ...base,
      title: 'AI BORA Sales Script',
      summary: 'A consultative sales script for first discovery calls.',
      script: [
        'Open: confirm pain around slow invoicing / settlement',
        'Uncover: ask about current proposal turnaround',
        'Present: on-chain proposals + 70/30 auto-split',
        'Close: book qualification call and send proposal link',
      ],
    };
  }
  return {
    ...base,
    title: 'AI BORA Contract Draft',
    summary: 'Draft scope + commercial terms skeleton for a services agreement.',
    sections: ['Scope of work', 'Payment & split terms', 'Deliverables & timeline', 'IP & liability'],
    disclaimer: 'Generated template - have a lawyer review before signing.',
  };
}

// Detect payment on-chain: a successful XLM payment to VENDOR_PUBLIC carrying the
// session memo, submitted by the caller within the session TTL.
async function verifyPayment(
  txHash: string,
  expectedMemo: string,
  minAmountXlm: number,
  payer: string
): Promise<boolean> {
  const horizon = new StellarSdk.Horizon.Server(HORIZON_URL);

  let txn: StellarSdk.Horizon.ServerApi.TransactionRecord;
  try {
    const query = await horizon.transactions().transaction(txHash).call();
    txn = query as StellarSdk.Horizon.ServerApi.TransactionRecord;
  } catch {
    return false;
  }

  // Memo from the submitted tx
  if (txn.memo_type === 'text' && txn.memo !== expectedMemo) return false;

  // The payer should be the source account of the tx
  if (payer && txn.source_account !== payer) return false;

  // Look for a payment op to the vendor for at least the required amount
  let ops: StellarSdk.Horizon.ServerApi.PaymentOperationRecord[] = [];
  try {
    const opsResult = await horizon.operations().forTransaction(txHash).call();
    ops = opsResult.records.filter((r) => r.type === 'payment') as StellarSdk.Horizon.ServerApi.PaymentOperationRecord[];
  } catch {
    return false;
  }

  return ops.some((op) => {
    const isVendor = op.to === VENDOR_PUBLIC;
    const amount = parseFloat(op.amount || '0');
    return isVendor && amount >= minAmountXlm;
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin;
  res.setHeader('Access-Control-Allow-Origin', origin || '');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  cleanupSessions();

  try {
    if (req.method === 'GET') {
      const serviceId = (req.query.service as string) || 'marketing-plan';
      const service = SERVICES[serviceId];
      if (!service) {
        return res.status(400).json({ error: 'Unknown service', supported: Object.keys(SERVICES) });
      }

      const destination = StellarSdk.StrKey.isValidEd25519PublicKey(VENDOR_PUBLIC)
        ? VENDOR_PUBLIC
        : (process.env.STELLAR_ADMIN_PUBLIC as string);
      const sessionId = makeSessionId();
      const memo = `AI-BORA:${service.id}:${sessionId.slice(-10)}`;

      sessions.set(sessionId, {
        serviceId: service.id,
        memo,
        destination,
        priceXlm: service.priceXlm,
        createdAt: Date.now(),
      });

      return res.status(402).json({
        error: 'payment_required',
        sessionId,
        service: {
          id: service.id,
          name: service.name,
        },
        payment: {
          network: 'testnet',
          destination,
          asset: 'XLM',
          amount: service.priceXlm,
          memo,
        },
      });
    }

    if (req.method === 'POST') {
      const { sessionId, txHash, payer } = req.body || {};
      if (!sessionId || !txHash) {
        return res.status(400).json({ error: 'sessionId and txHash are required' });
      }

      const session = sessions.get(String(sessionId));
      if (!session) {
        return res.status(404).json({ error: 'Session not found or expired' });
      }
      if (Date.now() - session.createdAt > SESSION_TTL_MS) {
        sessions.delete(String(sessionId));
        return res.status(410).json({ error: 'Session expired - request a new invoice' });
      }

      const verified = await verifyPayment(String(txHash), session.memo, session.priceXlm, String(payer || ''));
      if (!verified) {
        return res.status(409).json({
          error: 'payment_not_found',
          message:
            'No matching on-chain payment found. Send XLM to the vendor with the exact memo, then retry.',
        });
      }

      sessions.delete(String(sessionId));

      return res.status(200).json({
        success: true,
        ...buildDeliverable(session.serviceId, String(txHash)),
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Agent service error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}