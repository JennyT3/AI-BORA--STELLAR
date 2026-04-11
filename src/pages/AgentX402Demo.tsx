import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { Bot, Zap, CheckCircle, ExternalLink, Terminal } from 'lucide-react';
import { Link } from 'wouter';

const VENDOR_PUBLIC = 'GDQX74MG4TVG7BBZCLDCOEOQX2PADCTRUIDAWG5KLIQ64LYURC5XC7CN';
const PAYMENT_SPLITTER = 'CCP4JPWI33BC2XCDOLEDOIURMP7NPBY7I532H4N56ZDBCXX3A6BZNZ3P';

const SERVICES = [
  { id: 'marketing-plan', price: 0.01, icon: '📊', title: 'Marketing Plan AI' },
  { id: 'sales-script', price: 0.005, icon: '📝', title: 'Sales Script AI' },
  { id: 'contract-draft', price: 0.02, icon: '📋', title: 'Contract Draft AI' },
];

interface TerminalLine {
  text: string;
  type: 'input' | 'output' | 'error' | 'success' | 'info';
}

interface PaymentInfo {
  scheme: string;
  network: string;
  amount: string;
  payTo: string;
  price: number;
}

export default function AgentX402Demo() {
  const [, setLocation] = useLocation();
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [payments, setPayments] = useState<PaymentInfo[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);

  const addLine = useCallback((text: string, type: TerminalLine['type'] = 'output') => {
    setTerminalLines(prev => [...prev.slice(-100), { text, type }]);
  }, []);

  const checkServer = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setServerStatus('online');
        addLine(`✓ Server online: ${data.network || 'stellar:testnet'}`, 'success');
        addLine(`  Vendor: ${data.payTo?.substring(0, 30) || VENDOR_PUBLIC.substring(0, 30)}...`, 'output');
        addLine(`  Services: ${(data.services || Object.keys(SERVICES)).join(', ')}`, 'output');
        return true;
      }
    } catch (error) {
      addLine(`✗ Cannot connect to server`, 'error');
      addLine(`  Start server with: npx tsx server-x402-simple.ts`, 'info');
    }
    setServerStatus('offline');
    return false;
  }, [addLine]);

  const decodePaymentHeader = (headerBase64: string): PaymentInfo | null => {
    try {
      const decoded = JSON.parse(atob(headerBase64));
      const accept = decoded.accepts?.[0] || {};
      const amountStroops = parseInt(accept.amount || '100000');
      const price = amountStroops / 10_000_000;
      
      return {
        scheme: accept.scheme || 'exact',
        network: accept.network || 'stellar:testnet',
        amount: accept.amount || '100000',
        payTo: accept.payTo || VENDOR_PUBLIC,
        price,
      };
    } catch {
      return null;
    }
  };

  const callService = useCallback(async (serviceId: string) => {
    const url = `/api/ai/${serviceId}`;
    const demoUrl = `/api/demo/${serviceId}`;
    
    addLine(``, 'output');
    addLine(`$ curl ${url}`, 'input');
    
    try {
      const res = await fetch(url);
      addLine(`Status: ${res.status} ${res.statusText}`, res.status === 402 ? 'info' : res.ok ? 'success' : 'error');
      
      let body;
      try {
        body = await res.json();
      } catch {
        body = {};
      }
      
      if (res.status === 402) {
        const paymentInfo = body.decoded || decodePaymentHeader(res.headers.get('PAYMENT-REQUIRED') || '');
        
        if (paymentInfo) {
          addLine(``, 'output');
          addLine(`📡 PAYMENT REQUIRED (402)`, 'info');
          addLine(`─────────────────────────────────`, 'output');
          addLine(`Service: ${serviceId}`, 'output');
          addLine(`Price: $${paymentInfo.price || body.price} USDC`, 'success');
          addLine(`Network: ${paymentInfo.network || 'stellar:testnet'}`, 'output');
          addLine(`Pay to: ${(paymentInfo.payTo || body.payTo || VENDOR_PUBLIC).substring(0, 30)}...`, 'output');
          addLine(``, 'output');
          addLine(`Agent decision: ACCEPT (price below threshold)`, 'success');
          addLine(``, 'output');
          addLine(`Simulating payment...`, 'info');
          
          setPayments(prev => [...prev, paymentInfo]);
          setTotalSpent(prev => prev + (paymentInfo.price || body.price || 0.01));
        }
        
        addLine(`$ curl ${demoUrl}  # Using demo endpoint`, 'input');
        
        try {
          const demoRes = await fetch(demoUrl);
          if (demoRes.ok) {
            const demoData = await demoRes.json();
            addLine(`Status: 200 OK`, 'success');
            addLine(`Resource: ${demoData.resource}`, 'output');
            addLine(``, 'output');
            addLine(`Content delivered:`, 'info');
            addLine(`  Title: ${demoData.data?.title}`, 'output');
            addLine(`  Sections: ${(demoData.data?.sections || []).join(', ')}`, 'output');
            addLine(``, 'output');
            addLine(`Split executed:`, 'info');
            addLine(`  Company (70%): $${demoData.split?.company}`, 'output');
            addLine(`  Collaborator (30%): $${demoData.split?.collaborator}`, 'output');
            
            return { success: true, payment: paymentInfo, data: demoData };
          }
        } catch (demoErr) {
          addLine(`Demo endpoint also failed`, 'error');
        }
        
        return { success: false };
      }
      
      if (res.ok) {
        addLine(`Resource delivered: ${body.resource || serviceId}`, 'success');
        return { success: true, data: body };
      }
      
      addLine(`Error: ${res.status}`, 'error');
      return { success: false };
      
    } catch (err: any) {
      addLine(`Network error: ${err.message}`, 'error');
      addLine(`Server may not be running. Start with: npx tsx server-x402-simple.ts`, 'info');
      return { success: false };
    }
  }, [addLine]);

  const runDemo = useCallback(async () => {
    addLine(`═`.repeat(60), 'output');
    addLine(`  AI BORA - Autonomous Agent x402 Demo`, 'info');
    addLine(`═`.repeat(60), 'output');
    addLine(``, 'output');
    
    setCurrentStep(1);
    addLine(`[1/6] Checking server...`, 'input');
    await checkServer();
    await new Promise(r => setTimeout(r, 500));
    
    setCurrentStep(2);
    addLine(``, 'output');
    addLine(`[2/6] Admin creates proposal`, 'success');
    addLine(`  └─ Client receives secure link`, 'output');
    await new Promise(r => setTimeout(r, 600));
    
    setCurrentStep(3);
    addLine(`[3/6] Client accepts proposal`, 'success');
    addLine(`  └─ ${SERVICES.length} tasks created`, 'output');
    await new Promise(r => setTimeout(r, 600));
    
    setCurrentStep(4);
    addLine(``, 'output');
    addLine(`[4/6] Agent discovers and pays for services`, 'info');
    addLine(`═`.repeat(40), 'output');
    
    for (const service of SERVICES) {
      await callService(service.id);
      await new Promise(r => setTimeout(r, 1000));
    }
    
    setCurrentStep(5);
    addLine(``, 'output');
    addLine(`[5/6] Client pays invoice`, 'success');
    addLine(`  └─ Total: $${totalSpent.toFixed(3)} USDC on Stellar`, 'output');
    await new Promise(r => setTimeout(r, 600));
    
    setCurrentStep(6);
    addLine(``, 'output');
    addLine(`[6/6] PaymentSplitter distributes on-chain`, 'success');
    addLine(`═`.repeat(40), 'output');
    addLine(``, 'output');
    addLine(`Payment Distribution:`, 'info');
    addLine(``, 'output');
    
    const total = totalSpent || 0.035;
    addLine(`  💼 Company (70%):       $${(total * 0.7).toFixed(4)} USDC`, 'success');
    addLine(`  👤 Collaborator (30%): $${(total * 0.3).toFixed(4)} USDC`, 'success');
    addLine(``, 'output');
    addLine(`Contract: ${PAYMENT_SPLITTER.substring(0, 30)}...`, 'output');
    
    addLine(``, 'output');
    addLine(`═`.repeat(60), 'output');
    addLine(`  ✓ DEMO COMPLETE`, 'success');
    addLine(`═`.repeat(60), 'output');
    addLine(``, 'output');
    addLine(`View transactions on Stellar:`, 'info');
    addLine(`  https://stellar.expert/explorer/testnet`, 'output');
    
  }, [addLine, checkServer, callService, totalSpent]);

  useEffect(() => {
    const timer = setTimeout(runDemo, 500);
    return () => clearTimeout(timer);
  }, [runDemo]);

  useEffect(() => {
    const terminal = document.getElementById('terminal-scroll');
    if (terminal) terminal.scrollTop = terminal.scrollHeight;
  }, [terminalLines]);

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'input': return '#F25C05';
      case 'success': return '#22c55e';
      case 'error': return '#dc2626';
      case 'info': return '#3b82f6';
      default: return '#888';
    }
  };

  const steps = [
    { id: 1, title: 'Server Check', icon: '🔍' },
    { id: 2, title: 'Admin Creates', icon: '👤' },
    { id: 3, title: 'Client Accepts', icon: '✉️' },
    { id: 4, title: 'Agent Pays', icon: '🤖' },
    { id: 5, title: 'Client Pays', icon: '💳' },
    { id: 6, title: 'Split 70/30', icon: '📊' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', fontFamily: 'Montserrat, sans-serif' }}>
      {/* Header */}
      <header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '16px 24px', 
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        backgroundColor: '#0a0a0a'
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <img src="/logo.png" alt="" style={{ height: 28, width: 'auto' }} />
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: 12, color: '#F25C05', letterSpacing: '0.2em' }}>
            AI BORA
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            backgroundColor: '#1a1a1a',
            borderRadius: 100
          }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: serverStatus === 'online' ? '#22c55e' : serverStatus === 'offline' ? '#dc2626' : '#f59e0b'
            }} />
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 600, color: '#fff' }}>
              {serverStatus === 'checking' ? 'Connecting...' : serverStatus === 'online' ? 'Online' : 'Offline'}
            </span>
          </div>
          <Link href="/" style={{ 
            padding: '8px 16px', 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            color: '#fff', 
            borderRadius: 8, 
            textDecoration: 'none',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 12,
            fontWeight: 600,
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: 16, padding: 16, minHeight: 'calc(100vh - 80px)' }}>
        
        {/* Terminal */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: '#111',
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8, 
            padding: '12px 16px',
            backgroundColor: '#1a1a1a',
            borderBottom: '1px solid rgba(255,255,255,0.08)'
          }}>
            <Terminal size={14} color="#22c55e" />
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 600, color: '#fff' }}>
              Terminal - Autonomous Agent
            </span>
          </div>
          <div id="terminal-scroll" style={{ flex: 1, padding: 16, overflowY: 'auto', backgroundColor: '#0d0d0d' }}>
            {terminalLines.map((line, i) => (
              <div key={i} style={{ 
                color: getLineColor(line.type), 
                fontFamily: 'JetBrains Mono, Consolas, monospace', 
                fontSize: 12, 
                lineHeight: 1.5 
              }}>
                {line.text}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Payment Flow */}
          <div style={{ 
            backgroundColor: '#111', 
            borderRadius: 12, 
            padding: 20,
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 16px 0' }}>
              Payment Flow
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {steps.map(step => (
                <div key={step.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 8,
                  backgroundColor: currentStep >= step.id ? '#1a1a1a' : 'transparent',
                  borderLeft: currentStep === step.id ? '3px solid #F25C05' : '3px solid transparent',
                  opacity: currentStep >= step.id ? 1 : 0.5,
                }}>
                  <span style={{ fontSize: 16 }}>{step.icon}</span>
                  <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 600, color: '#fff', flex: 1 }}>
                    {step.title}
                  </span>
                  {currentStep > step.id && <span style={{ color: '#22c55e', fontSize: 14 }}>✓</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          {totalSpent > 0 && (
            <div style={{ 
              backgroundColor: '#111', 
              borderRadius: 12, 
              padding: 20,
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 700, color: '#fff', margin: '0 0 12px 0' }}>
                Payment Summary
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, color: '#888' }}>Total:</span>
                <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 700, color: '#F25C05' }}>
                  ${totalSpent.toFixed(3)} USDC
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, color: '#888' }}>Company (70%):</span>
                <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 700, color: '#fff' }}>
                  ${(totalSpent * 0.7).toFixed(4)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, color: '#888' }}>Collaborator (30%):</span>
                <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 700, color: '#22c55e' }}>
                  ${(totalSpent * 0.3).toFixed(4)}
                </span>
              </div>
            </div>
          )}

          {/* Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <a 
              href={`https://stellar.expert/explorer/testnet/account/${VENDOR_PUBLIC}`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8, 
                padding: '10px 14px',
                backgroundColor: '#1a1a1a',
                borderRadius: 8,
                textDecoration: 'none',
                color: '#888',
                fontSize: 12,
                fontFamily: 'Montserrat, sans-serif'
              }}
            >
              <ExternalLink size={14} /> Vendor Account
            </a>
            <Link 
              href="/onboarding" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 8, 
                padding: '12px 16px',
                backgroundColor: '#F25C05',
                borderRadius: 8,
                border: 'none',
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'Montserrat, sans-serif',
                cursor: 'pointer',
                textDecoration: 'none'
              }}
            >
              AI BORA Agent →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}