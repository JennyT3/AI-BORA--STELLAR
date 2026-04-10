import express from 'express';
import { paymentMiddlewareFromConfig } from '@x402/express';
import { HTTPFacilitatorClient } from '@x402/core/server';
import { ExactStellarScheme } from '@x402/stellar/exact/server';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3002;

const NETWORK = 'stellar:testnet';
const FACILITATOR_URL = 'https://www.x402.org/facilitator';
const PAY_TO = process.env.STELLAR_ADMIN_PUBLIC || 'GBM4USEN622JABS37BVEHK43HASCX7PSRDMB37PKL53R725OFOHNWL3B';

const PRICE = '0.01';
const ROUTE_PATH = '/api/ai';

const app2 = express();
app2.use(express.json());

app2.use(
  paymentMiddlewareFromConfig(
    {
      [`GET ${ROUTE_PATH}/marketing-plan`]: {
        accepts: {
          scheme: 'exact',
          price: '$0.01',
          network: NETWORK,
          payTo: PAY_TO,
        },
      },
      [`GET ${ROUTE_PATH}/sales-script`]: {
        accepts: {
          scheme: 'exact',
          price: '$0.005',
          network: NETWORK,
          payTo: PAY_TO,
        },
      },
      [`GET ${ROUTE_PATH}/contract-draft`]: {
        accepts: {
          scheme: 'exact',
          price: '$0.02',
          network: NETWORK,
          payTo: PAY_TO,
        },
      },
    },
    new HTTPFacilitatorClient({ url: FACILITATOR_URL }),
    [{ network: NETWORK, server: new ExactStellarScheme() }],
  ),
);

app2.get(`${ROUTE_PATH}/marketing-plan`, (_, res) => {
  res.json({
    success: true,
    resource: 'marketing-plan',
    data: {
      title: 'Marketing Plan AI',
      sections: ['Market Analysis', 'Target Audience', 'Channels', 'Budget'],
      content: 'Complete marketing strategy for B2B SaaS...',
    },
  });
});

app2.get(`${ROUTE_PATH}/sales-script`, (_, res) => {
  res.json({
    success: true,
    resource: 'sales-script',
    data: {
      title: 'Sales Script AI',
      sections: ['Intro', 'Value Prop', 'Objection Handling', 'Close'],
      content: 'Professional B2B sales script...',
    },
  });
});

app2.get(`${ROUTE_PATH}/contract-draft`, (_, res) => {
  res.json({
    success: true,
    resource: 'contract-draft',
    data: {
      title: 'Contract Draft AI',
      sections: ['Parties', 'Terms', 'Payment', 'Liability'],
      content: 'Legal B2B contract template...',
    },
  });
});

app2.get('/api/health', (_, res) => {
  res.json({ status: 'ok', x402: 'enabled' });
});

app2.listen(PORT, () => {
  console.log(`🤖 AI Agent API running at http://localhost:${PORT}`);
  console.log(`💰 x402 payment protocol enabled`);
  console.log(`   GET ${ROUTE_PATH}/marketing-plan - $0.01`);
  console.log(`   GET ${ROUTE_PATH}/sales-script - $0.005`);
  console.log(`   GET ${ROUTE_PATH}/contract-draft - $0.02`);
});