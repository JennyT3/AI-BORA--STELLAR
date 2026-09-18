# SECURITY NOTES — AI BORA (STELLAR)

> Status: generated during the Phase 1 audit. Action required by the team before any deployment.

## 🔴 GIT-LEAKED PRIVATE KEYS (ROTATE NOW)

Several Stellar secret keys appear in the repository git history (`git log --all -p`).
They are permanently compromised and **must be revoked/rotated immediately**, even
if you already rotated some of them. Testnet keys were leaked — the impact is
limited to testnet funds, but the process window is closed: treat them as public.

### Rotation steps (testnet)
1. Generate new accounts: `stellar keys generate aibora-vendor --fund --network testnet` (Stellar CLI).
2. Move any balance from the compromised accounts to the new ones.
3. Update `.env` / Vercel / Firebase secrets with the new keys. NEVER commit a `.env`.
4. Blocklist the leaked keys in secret scanning rules (gitleaks / trufflehog CI).
5. Rewriting history does NOT un-leak what was already public. Rotation is the
   real fix; history cleanup is hygiene for going forward.

## 🔴 REPLACED / NO LONGER SAFE ENDPOINTS
- `api/sign-and-submit.ts` — no longer signs arbitrary client XDR. It only builds
  `store_proposal` with validated parameters, requires `x-api-key`
  (`INTERNAL_API_KEY`) and uses restricted CORS.
- Browser-side transaction signing with `VITE_*SECRET` — removed.

## 🔴 CHANGES COMPLETED (Phase 1)
- `api/sign-and-submit.ts`: blind XDR signing removed; `INTERNAL_API_KEY` required; restricted CORS.
- `src/pages/Pagamento.tsx` / `src/pages/PaymentFlow.tsx`: removed `import.meta.env.VENDOR_SECRET`
  usage in the client; on-chain split is server-side only.
- `src/services/stellar.ts` / `src/services/soroban.ts`: removed fallbacks to
  `VITE_STELLAR_ADMIN_SECRET` / `VITE_VENDOR_SECRET`.
- `src/pages/StellarPay.tsx`: wallet secret no longer persisted to `localStorage`
  (in-memory for the session only).
- `firestore.rules`: all app collections covered (default deny).

## ⏳ PENDING FOR THE TEAM
- [ ] Rotate the 5 leaked testnet keys.
- [ ] Set the repository to PRIVATE until the secret scan is verified clean; only
      then make it public again.
- [ ] Configure `INTERNAL_API_KEY` in production (Vercel env) or disable the endpoint.
- [ ] Remove `server-x402-simple.ts` from the `server` script in `package.json` (Phase 2).
- [ ] Decide the real on-chain signing model (server-side or Freighter) for the `PaymentSplitter` (Phase 3).
- [ ] Enable GitHub Secret Scanning (advanced) + gitleaks as pre-commit/CI gate.