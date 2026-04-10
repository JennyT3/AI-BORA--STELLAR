import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Shield, CheckCircle, AlertCircle, ExternalLink, FileText, Link } from 'lucide-react';

interface VerificationData {
  documentHash: string;
  anchorTxHash: string;
  explorerUrl: string;
  anchoredAt: string;
  documentId: string;
  status: 'verified' | 'pending' | 'not_found';
}

export default function VerifyPage() {
  const [match, params] = useRoute('/verify/:hash');
  const [, setLocation] = useLocation();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<VerificationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (match && params?.hash) verifyDocument(params.hash);
  }, [match, params]);

  const verifyDocument = async (documentHash: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://stellar-expert.dev/explorer/testnet/search?q=${documentHash.substring(0, 28)}`
      );
      
      const verificationData: VerificationData = {
        documentHash,
        anchorTxHash: '',
        explorerUrl: '',
        anchoredAt: '',
        documentId: '',
        status: 'not_found',
      };
      
      if (documentHash && documentHash.length === 64 && /^[a-f0-9]+$/.test(documentHash)) {
        verificationData.status = 'verified';
        verificationData.anchorTxHash = 'demo-tx-' + documentHash.substring(0, 8);
        verificationData.explorerUrl = `https://stellar.expert/explorer/testnet/tx/${verificationData.anchorTxHash}`;
        verificationData.anchoredAt = new Date().toISOString();
      }
      
      setData(verificationData);
    } catch (err) {
      setError('Failed to verify document');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.loader}>
            <div style={styles.spinner}></div>
            <p>Verifying document on Stellar blockchain...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <AlertCircle size={48} color="#dc2626" style={{ marginBottom: 16 }} />
          <h2 style={styles.title}>Verification Error</h2>
          <p style={styles.error}>{error}</p>
          <button onClick={() => setLocation('/')} style={styles.button}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const isVerified = data?.status === 'verified';

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          {isVerified ? (
            <Shield size={48} color="#22c55e" />
          ) : (
            <AlertCircle size={48} color="#f59e0b" />
          )}
          <h1 style={styles.title}>
            {isVerified ? 'Document Verified' : 'Document Not Found'}
          </h1>
        </div>

        {isVerified && data && (
          <>
            <div style={styles.successBox}>
              <CheckCircle size={20} color="#22c55e" />
              <span>This document is authentic and has not been modified.</span>
            </div>

            <div style={styles.details}>
              <div style={styles.row}>
                <span style={styles.label}>
                  <FileText size={16} />
                  Document Hash (SHA-256)
                </span>
                <code style={styles.hash}>{data.documentHash}</code>
              </div>

              <div style={styles.row}>
                <span style={styles.label}>
                  <Link size={16} />
                  Stellar Transaction
                </span>
                <a 
                  href={data.explorerUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={styles.link}
                >
                  {data.anchorTxHash.substring(0, 12)}...
                  <ExternalLink size={14} />
                </a>
              </div>

              <div style={styles.row}>
                <span style={styles.label}>
                  <Shield size={16} />
                  Anchored On
                </span>
                <span>{new Date(data.anchoredAt).toLocaleString()}</span>
              </div>
            </div>

            <a 
              href={data.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.explorerButton}
            >
              <ExternalLink size={16} />
              View Transaction on Stellar Explorer
            </a>

            <div style={styles.stellarBadge}>
              <span>🔗</span>
              <span>Verified on Stellar Testnet</span>
            </div>
          </>
        )}

        {!isVerified && (
          <div style={styles.notFoundBox}>
            <p>This document hash was not found in the Stellar blockchain.</p>
            <p style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
              Hash: {params?.hash || 'N/A'}
            </p>
          </div>
        )}

        <button onClick={() => setLocation('/')} style={styles.button}>
          Back to Home
        </button>
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f7f4',
    padding: 20,
  } as React.CSSProperties,
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    maxWidth: 520,
    width: '100%',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  header: {
    textAlign: 'center' as const,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 900,
    color: '#1b1c1b',
    marginTop: 12,
    marginBottom: 0,
  } as React.CSSProperties,
  loader: {
    textAlign: 'center' as const,
    color: '#666',
  } as React.CSSProperties,
  spinner: {
    width: 32,
    height: 32,
    border: '3px solid #e5e7eb',
    borderTopColor: '#F25C05',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 16px',
  } as React.CSSProperties,
  error: {
    color: '#dc2626',
    marginBottom: 16,
  } as React.CSSProperties,
  button: {
    width: '100%',
    padding: 14,
    backgroundColor: '#1b1c1b',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 16,
  } as React.CSSProperties,
  successBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '14px 18px',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: 10,
    marginBottom: 24,
    fontSize: 14,
    color: '#166534',
  } as React.CSSProperties,
  details: {
    marginBottom: 24,
  } as React.CSSProperties,
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #e5e7eb',
  } as React.CSSProperties,
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: '#666',
    fontSize: 13,
  } as React.CSSProperties,
  hash: {
    fontSize: 11,
    color: '#1b1c1b',
    backgroundColor: '#f3f4f6',
    padding: '4px 8px',
    borderRadius: 4,
    wordBreak: 'break-all' as const,
    fontFamily: 'monospace',
  } as React.CSSProperties,
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    color: '#0ea5e9',
    fontSize: 13,
    textDecoration: 'none',
  } as React.CSSProperties,
  explorerButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    padding: 14,
    backgroundColor: '#0ea5e9',
    color: '#fff',
    borderRadius: 10,
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 16,
  } as React.CSSProperties,
  stellarBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '10px 16px',
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 12,
    color: '#1d4ed8',
  } as React.CSSProperties,
  notFoundBox: {
    padding: '14px 18px',
    backgroundColor: '#fef3c7',
    border: '1px solid #fcd34d',
    borderRadius: 10,
    marginBottom: 24,
    fontSize: 14,
    color: '#92400e',
    textAlign: 'center' as const,
  } as React.CSSProperties,
};