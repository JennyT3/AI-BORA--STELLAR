import { useState, useMemo } from 'react';
import { Loader2, X, Send, CheckCircle, ExternalLink, Wallet, ShieldCheck } from 'lucide-react';
import { pollarClient, pollarConfigured, usePollarAuth } from '../services/pollar';
import type { RampQuote } from '@pollar/core';

type QuoteField = RampQuote['requiredFields'][number];

interface PollarPayoutModalProps {
  totalEarned: number;
  collaboratorAddress?: string | null;
  prefillEmail?: string;
  onClose: () => void;
}

const REGIONS: { label: string; country: string; currency: string }[] = [
  { label: 'Kenya', country: 'KE', currency: 'KES' },
  { label: 'Nigeria', country: 'NG', currency: 'NGN' },
  { label: 'Ghana', country: 'GH', currency: 'GHS' },
  { label: 'South Africa', country: 'ZA', currency: 'ZAR' },
  { label: 'Uganda', country: 'UG', currency: 'UGX' },
  { label: 'Tanzania', country: 'TZ', currency: 'TZS' },
  { label: 'Brazil', country: 'BR', currency: 'BRL' },
  { label: 'Mexico', country: 'MX', currency: 'MXN' },
  { label: 'Colombia', country: 'CO', currency: 'COP' },
  { label: 'Argentina', country: 'AR', currency: 'ARS' },
  { label: 'Peru', country: 'PE', currency: 'PEN' },
  { label: 'Chile', country: 'CL', currency: 'CLP' },
];

const AUTH_STEPS: Record<string, string> = {
  creating_session: 'Creating session…',
  entering_email: 'Entering email…',
  sending_email: 'Sending email…',
  entering_code: 'Check your inbox for the 6-digit code',
  verifying_email_code: 'Verifying code…',
  authenticating: 'Authenticating…',
  authenticated: 'Authenticated',
};

function readAmount(record: { balance: string | null; available: string | null } | undefined): string {
  if (!record) return '';
  return record.balance ?? record.available ?? '';
}

export default function PollarPayoutModal({
  totalEarned,
  collaboratorAddress,
  prefillEmail,
  onClose,
}: PollarPayoutModalProps) {
  const auth = usePollarAuth();

  const [email, setEmail] = useState(prefillEmail || '');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [balance, setBalance] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(collaboratorAddress || null);

  const [quotes, setQuotes] = useState<RampQuote[]>([]);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [kycUrl, setKycUrl] = useState<string | null>(null);

  const [country, setCountry] = useState('MX');
  const [currency, setCurrency] = useState('MXN');
  const [amount, setAmount] = useState<string>(totalEarned ? String(totalEarned) : '');

  const region = useMemo(() => REGIONS.find(r => r.country === country), [country]);
  const selectedQuote = useMemo(
    () => quotes.find(q => q.recommended) || quotes[0] || null,
    [quotes],
  );

  const sendEmail = async () => {
    setError(null);
    setStatus('Sending verification email…');
    try {
      await pollarClient!.ready();
      await pollarClient!.login({ provider: 'email', email });
      setStatus('Code sent — check your inbox');
    } catch (err: any) {
      setError(err?.message || 'Failed to send email');
      setStatus(null);
    }
  };

  const verifyCode = async () => {
    setError(null);
    setStatus('Verifying…');
    try {
      await pollarClient!.verifyEmailCode(code);
      await refreshWallet();
    } catch (err: any) {
      setError(err?.message || 'Invalid code');
      setStatus(null);
    }
  };

  const refreshWallet = async () => {
    await pollarClient!.refreshBalance();
    const wallet = pollarClient!.getWallet();
    const state = pollarClient!.getWalletBalanceState();
    const usdc =
      state.step === 'loaded'
        ? state.data.balances.find((b) => b.code === 'USDC') || state.data.balances[0]
        : undefined;
    setWalletAddress(wallet?.address || walletAddress || null);
    setBalance(readAmount(usdc));
    setStatus(null);
  };

  const chooseRegion = (c: string) => {
    setCountry(c);
    const r = REGIONS.find(x => x.country === c);
    if (r) setCurrency(r.currency);
  };

  const getQuote = async () => {
    setError(null);
    setTxId(null);
    setProcessing(true);
    try {
      const res = await pollarClient!.getRampsQuote({
        country,
        amount: Number(amount),
        currency,
        direction: 'offramp',
      });
      setQuotes(res.quotes);
    } catch (err: any) {
      setError(err?.message || 'Could not get a quote');
    } finally {
      setProcessing(false);
    }
  };

  const startOffRamp = async () => {
    if (!selectedQuote) return;
    setError(null);
    setProcessing(true);
    try {
      const body: any = {
        quoteId: selectedQuote.quoteId,
        amount: Number(amount),
        currency,
        country,
        fields,
      };
      if (email) body.email = email;

      const res = await pollarClient!.createOffRamp(body);
      const content: any = (res as any)?.content || res;

      if (content?.pendingSignature) {
        setStatus('SDK action sign required — pending signature');
      }
      if (content?.kycUrl || content?.kycRequired) {
        setKycUrl(content.kycUrl || null);
        if (content.kycUrl) {
          window.open(content.kycUrl, '_blank', 'noopener,noreferrer');
        }
      }
      if (content?.txId) {
        setTxId(content.txId);
        setTxStatus(content.status || 'submitted');
        pollStatus(content.txId);
      }
      if (!content?.txId && !content?.kycRequired) {
        setStatus('Off-ramp created');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to create off-ramp');
    } finally {
      setProcessing(false);
    }
  };

  const pollStatus = async (id: string) => {
    for (let i = 1; i <= 6; i++) {
      await new Promise(r => setTimeout(r, 4000));
      try {
        const s = await pollarClient!.pollRampTransaction(id, { timeoutMs: 30000, intervalMs: 4000 });
        setTxStatus(String((s as any)?.status || s));
        if (['completed', 'failed', 'cancelled', 'expired'].includes(String((s as any)?.status || s))) break;
      } catch {
        break;
      }
    }
  };

  if (!pollarConfigured || !pollarClient) {
    return (
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.card} onClick={e => e.stopPropagation()}>
          <button onClick={onClose} style={styles.closeBtn} aria-label="Close">
            <X size={20} />
          </button>
          <h2 style={styles.title}>Pollar cash out</h2>
          <p style={styles.error}>
            Pollar is not configured on the frontend. Add <code>VITE_POLLAR_PUBLIC_KEY</code> to{' '}
            <code>front/.env</code> to enable payments to local fiat.
          </p>
        </div>
      </div>
    );
  }

  const authenticated = (auth.step as string) === 'authenticated';

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.card} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={styles.closeBtn} aria-label="Close">
          <X size={20} />
        </button>

        <div style={styles.headerRow}>
          <ShieldCheck size={22} color="#F25C05" />
          <h2 style={styles.title}>Cash out with Pollar</h2>
        </div>
        <p style={styles.subtitle}>
          Turn your 30% Stellar payout (USDC) into local money — Mobile Money, PIX, SPEI, PSE, ACH
          or bank transfer.
        </p>

        {!authenticated && auth && (auth.step as string) !== 'authenticated' && (
          <div style={styles.stepBadge}>{AUTH_STEPS[auth.step as string] || (auth.step as string)}</div>
        )}

        {!authenticated && (
          <div style={styles.group}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={auth?.step === 'sending_email' || auth?.step === 'verifying_email_code'}
            />
            {auth?.step === 'entering_code' && (
              <>
                <label style={styles.label}>Verification code</label>
                <input
                  style={styles.input}
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="123456"
                  inputMode="numeric"
                  maxLength={6}
                />
              </>
            )}
            {error && <p style={styles.error}>{error}</p>}
            {status && !error && <p style={styles.status}>{status}</p>}
            {auth?.step === 'entering_code' ? (
              <button onClick={verifyCode} style={styles.btnPrimary} disabled={processing}>
                {processing ? <Loader2 size={16} className="spin" /> : <CheckCircle size={16} />}
                Confirm code
              </button>
            ) : (
              <button onClick={sendEmail} style={styles.btnPrimary} disabled={processing}>
                {processing ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
                Send code
              </button>
            )}
          </div>
        )}

        {authenticated && (
          <div style={styles.group}>
            <div style={styles.walletBox}>
              <Wallet size={18} color="#22c55e" />
              <div>
                <p style={styles.walletLabel}>Connected Pollar wallet</p>
                <p style={styles.walletAddr}>{walletAddress || 'Loading…'}</p>
              </div>
            </div>

            <div style={styles.balanceRow}>
              <span style={styles.balanceLabel}>USDC balance</span>
              <span style={styles.balanceValue}>{balance !== null ? `${balance} USDC` : '…'}</span>
            </div>

            <div style={styles.row}>
              <div style={styles.col}>
                <label style={styles.label}>Destination country</label>
                <select
                  style={styles.input}
                  value={country}
                  onChange={e => chooseRegion(e.target.value)}
                >
                  {REGIONS.map(r => (
                    <option key={r.country} value={r.country}>
                      {r.label} ({r.country})
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.col}>
                <label style={styles.label}>Currency</label>
                <input style={styles.input} value={currency} readOnly />
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.col}>
                <label style={styles.label}>Amount (USDC)</label>
                <input
                  style={styles.input}
                  type="number"
                  min={0}
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
              </div>
              <div style={styles.col}>
                <label style={styles.label}>Rail</label>
                <input style={styles.input} value={region?.country === 'NG' ? 'Mobile Money' : region?.country === 'BR' ? 'PIX' : region?.country === 'MX' ? 'SPEI' : 'ACH'} readOnly />
              </div>
            </div>

            {quotes.length === 0 && (
              <button onClick={getQuote} style={styles.btnPrimary} disabled={processing || !amount}>
                {processing ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
                Get quote
              </button>
            )}

            {selectedQuote && (
              <div style={styles.quoteBox}>
                <div style={styles.balanceRow}>
                  <span style={styles.walletLabel}>{selectedQuote.provider}</span>
                  <span style={styles.balanceValue}>
                    {selectedQuote.fee} {selectedQuote.feeCurrency}
                  </span>
                </div>
                <div style={styles.balanceRow}>
                  <span style={styles.walletLabel}>Rate</span>
                  <span style={styles.balanceValue}>{selectedQuote.rate}</span>
                </div>
                <div style={styles.balanceRow}>
                  <span style={styles.walletLabel}>Processing</span>
                  <span style={styles.balanceValue}>{selectedQuote.estimatedTime}</span>
                </div>

                {selectedQuote.requiredFields?.map((f: QuoteField) => (
                  <div key={f.key} style={{ marginBottom: 10 }}>
                    <label style={styles.label}>
                      {f.label || f.key}
                      {!f.optional && <span style={{ color: '#dc2626' }}> *</span>}
                    </label>
                    {(f.options?.length || 0) > 0 ? (
                      <select
                        style={styles.input}
                        value={fields[f.key] || ''}
                        onChange={e => setFields({ ...fields, [f.key]: e.target.value })}
                      >
                        <option value="">Select…</option>
                        {f.options!.map(o => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        style={styles.input}
                        value={fields[f.key] || ''}
                        onChange={e => setFields({ ...fields, [f.key]: e.target.value })}
                        placeholder={f.placeholder || f.hint || ''}
                      />
                    )}
                  </div>
                ))}

                {error && <p style={styles.error}>{error}</p>}
                {status && !error && <p style={styles.status}>{status}</p>}

                {txId ? (
                  <div style={styles.successBox}>
                    <CheckCircle size={18} color="#22c55e" />
                    <div>
                      <p style={{ margin: 0, fontWeight: 700 }}>Transaction submitted</p>
                      <p style={{ margin: '4px 0 0 0', fontSize: 12, wordBreak: 'break-all' }}>TX: {txId}</p>
                      {txStatus && <p style={{ margin: '4px 0 0 0', fontSize: 12 }}>Status: {txStatus}</p>}
                    </div>
                  </div>
                ) : (
                  <button onClick={startOffRamp} style={styles.btnPrimary} disabled={processing}>
                    {processing ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
                    Send to {currency}
                  </button>
                )}

                {kycUrl && (
                  <a href={kycUrl} target="_blank" rel="noopener noreferrer" style={styles.kycLink}>
                    Complete KYC to receive payment <ExternalLink size={12} />
                  </a>
                )}
              </div>
            )}

            {quotes.length > 0 && !selectedQuote && <p style={styles.error}>No quote available.</p>}
          </div>
        )}

        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    maxWidth: 480,
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto' as const,
    position: 'relative' as const,
    fontFamily: 'Montserrat, sans-serif',
  },
  closeBtn: {
    position: 'absolute' as const,
    top: 16,
    right: 16,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#666',
  },
  headerRow: { display: 'flex' as const, alignItems: 'center', gap: 10 },
  title: { fontWeight: 900, fontSize: 22, color: '#1b1c1b', margin: 0 },
  subtitle: { fontSize: 13, color: '#666', margin: '8px 0 20px 0', lineHeight: 1.5 },
  stepBadge: {
    backgroundColor: '#fff7ed',
    color: '#c2410c',
    padding: '8px 12px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 16,
  },
  group: { display: 'flex', flexDirection: 'column' as const, gap: 10 },
  label: { fontSize: 12, fontWeight: 700, color: '#555' },
  input: {
    padding: '12px 14px',
    border: '1px solid #e5e5e5',
    borderRadius: 10,
    fontSize: 14,
    fontFamily: 'Montserrat, sans-serif',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '14px',
    backgroundColor: '#F25C05',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: 6,
  },
  walletBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 14px',
    backgroundColor: '#f0fdf4',
    borderRadius: 10,
  },
  walletLabel: { fontSize: 11, color: '#555', margin: 0 },
  walletAddr: { fontSize: 12, color: '#166534', margin: '2px 0 0 0', wordBreak: 'break-all' as const },
  balanceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #f0f0f0',
  },
  balanceLabel: { fontSize: 13, color: '#666' },
  balanceValue: { fontSize: 14, fontWeight: 700, color: '#1b1c1b' },
  row: { display: 'flex', gap: 12 },
  col: { flex: 1 },
  quoteBox: {
    backgroundColor: '#f8f7f4',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  successBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '14px',
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    color: '#166534',
    fontSize: 14,
  },
  kycLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    color: '#1d4ed8',
    fontSize: 13,
    fontWeight: 700,
    textDecoration: 'underline',
    marginTop: 10,
  },
  error: { color: '#dc2626', fontSize: 13, margin: '8px 0 0 0' },
  status: { color: '#0f766e', fontSize: 13, margin: '8px 0 0 0' },
};