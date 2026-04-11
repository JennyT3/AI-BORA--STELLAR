import { useState, useEffect } from 'react';

// Simple test page to debug connection
export default function TestConnection() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [response, setResponse] = useState<string>('');
  const [error, setError] = useState<string>('');

  const testConnection = async () => {
    setStatus('checking');
    setError('');
    setResponse('');

    console.log('Testing connection to /api/health...');

    try {
      const res = await fetch('/api/health', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('Response status:', res.status);
      console.log('Response headers:', Object.fromEntries(res.headers.entries()));

      const data = await res.json();
      console.log('Response data:', data);

      setStatus('online');
      setResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      console.error('Error:', err);
      setStatus('offline');
      setError(err.message || 'Unknown error');
    }
  };

  const testDemo = async () => {
    setError('');
    setResponse('');

    console.log('Testing demo endpoint...');

    try {
      const res = await fetch('/api/demo/marketing-plan');
      console.log('Demo response status:', res.status);

      const data = await res.json();
      console.log('Demo data:', data);

      setResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      console.error('Demo error:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div style={{ padding: 40, fontFamily: 'monospace', maxWidth: 800, margin: '0 auto' }}>
      <h1>Connection Test</h1>
      
      <div style={{ marginBottom: 20 }}>
        <span style={{ 
          padding: '8px 16px', 
          borderRadius: 20, 
          backgroundColor: status === 'online' ? '#22c55e' : status === 'offline' ? '#dc2626' : '#f59e0b',
          color: '#fff',
          fontWeight: 700
        }}>
          {status === 'checking' ? 'Checking...' : status === 'online' ? 'Online' : 'Offline'}
        </span>
      </div>

      <div style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
        <button 
          onClick={testConnection}
          style={{ padding: '10px 20px', cursor: 'pointer' }}
        >
          Test Health
        </button>
        <button 
          onClick={testDemo}
          style={{ padding: '10px 20px', cursor: 'pointer' }}
        >
          Test Demo Endpoint
        </button>
      </div>

      {error && (
        <div style={{ padding: 16, backgroundColor: '#fef2f2', borderRadius: 8, marginBottom: 20, border: '1px solid #dc2626' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div style={{ padding: 16, backgroundColor: '#f0fdf4', borderRadius: 8, border: '1px solid #22c55e' }}>
          <strong>Response:</strong>
          <pre style={{ margin: 0, overflow: 'auto', whiteSpace: 'pre-wrap' }}>{response}</pre>
        </div>
      )}

      <div style={{ marginTop: 40, padding: 16, backgroundColor: '#f8f7f4', borderRadius: 8 }}>
        <h3>Debug Info:</h3>
        <ul style={{ fontSize: 14 }}>
          <li>Frontend URL: {window.location.origin}</li>
          <li>Backend URL: /api (proxied to http://localhost:3002)</li>
          <li>User Agent: {navigator.userAgent}</li>
        </ul>
      </div>

      <div style={{ marginTop: 20, fontSize: 14 }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Make sure server is running: <code>npx tsx server-x402-simple.ts</code></li>
          <li>Check browser console for errors (F12)</li>
          <li>Verify no other process is using port 3002</li>
        </ol>
      </div>
    </div>
  );
}