/**
 * Pollar integration — server-side.
 *
 * Uses the Pollar SERVER API (https://server.api.pollar.xyz/v1) with the app's
 * SECRET key. Never call these endpoints from client-side code; the browser
 * flow (@pollar/core in `front/`) uses the publishable key.
 *
 * Purpose for AI BORA: after the on-chain 70/30 PaymentSplitter settles, the
 * collaborator's 30% lives as USDC on a Stellar wallet. Server-side we keep a
 * Pollar custodial wallet registered for each collaborator (so they can receive
 * the split) and we validate SDK access tokens so the frontend off-ramp
 * (SEP-24, `createOffRamp`) is authorized on our backend too.
 */

const POLLAR_SERVER_URL = 'https://server.api.pollar.xyz/v1';

const POLLAR_SECRET_KEY = process.env.POLLAR_SECRET_KEY;

export function isPollarConfigured(): boolean {
  return !!POLLAR_SECRET_KEY && POLLAR_SECRET_KEY.startsWith('sec_');
}

function poliarApiError(status: number, body: { code?: string; message?: string }): Error {
  const err = new Error(body?.code || `Pollar server API error (${status})`) as Error & { status: number; code?: string };
  err.status = status;
  err.code = body?.code;
  (err as any).message = body?.message || body?.code || err.message;
  return err;
}

async function serverFetch<T>(path: string, body?: unknown): Promise<T> {
  if (!isPollarConfigured()) {
    throw new Error('Pollar server key not configured (POLLAR_SECRET_KEY)');
  }

  const res = await fetch(`${POLLAR_SERVER_URL}${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      'x-pollar-api-key': POLLAR_SECRET_KEY as string,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw poliarApiError(res.status, json);
  }

  return (json as { content: T }).content;
}

export interface RegisterPollarUserInput {
  externalId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  withWallet?: boolean;
}

export interface PollarUserResponse {
  userId?: string;
  externalId?: string;
  walletAddress?: string;
  funded?: boolean;
}

/**
 * Registers an AI BORA user (collaborator / vendor) on Pollar and, by default,
 * provisions a custodial Stellar wallet that can receive the 30% split.
 */
export async function registerPollarUser(input: RegisterPollarUserInput): Promise<PollarUserResponse> {
  const path = input.withWallet === false ? '/users' : '/users/with-wallet';
  return serverFetch<PollarUserResponse>(path, {
    externalId: input.externalId,
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    avatar: input.avatar,
  });
}

/**
 * Funds a custodial wallet on-chain (CAP-33 sponsored createAccount). Used in
 * Deferred funding mode once a business event happens (first payout, KYC done).
 */
export async function fundPollarWallet(publicKey: string): Promise<{ publicKey: string; startingBalance: string }> {
  return serverFetch<{ publicKey: string; startingBalance: string }>('/wallets/fund', { publicKey });
}

export interface VerifyPollarTokenResult {
  userId: string;
  applicationId: string;
  expiresAt?: string;
  network?: string;
  chromeMobile?: never;
  wallet?: {
    type?: string;
    address?: string;
    chain?: string;
    network?: string;
    fundingMode?: string;
    existsOnStellar?: boolean;
  };
  profile?: {
    mail?: string;
    first_name?: string;
    last_name?: string;
    avatar?: string;
    providers?: Record<string, unknown>;
  };
  authProvider?: string;
}

/**
 * Validates an SDK access token minted client-side in the browser. Lets our
 * backend authorize a collaborator's Pollar session (wallet address, KYC state)
 * before it accepts an off-ramp request.
 */
export async function verifyPollarToken(token: string): Promise<VerifyPollarTokenResult> {
  return serverFetch<VerifyPollarTokenResult>('/tokens/verify', { token });
}