import { motion } from 'motion/react';
import { ExternalLink } from 'lucide-react';

const transactions = [
  {
    tx: '227828308b72a57f6df4ab4346ad7f9811a682bc3eee7cfc30c1011fe89de549',
    type: 'Payment',
    amount: '10,000 XLM',
    from: 'GDG...',
    to: 'GAZJ...',
    time: '2 min ago',
    status: 'Confirmed'
  },
  {
    tx: '5a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a',
    type: 'Payment',
    asset: 'USDC',
    amount: '1,000 USDC',
    time: '5 min ago',
    status: 'Confirmed'
  },
  {
    tx: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    type: 'Split',
    amount: '50 XLM',
    from: 'GAZJ...',
    to: 'GDG...',
    time: '10 min ago',
    status: 'Confirmed'
  },
  {
    tx: '2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
    type: 'Payment',
    amount: '25 USDC',
    from: 'GDG...',
    to: 'GAZJ...',
    time: '15 min ago',
    status: 'Confirmed'
  }
];

export function StellarTransactionMarquee() {
  return (
    <div style={{ 
      overflow: 'hidden', 
      backgroundColor: '#0a0a0a', 
      padding: '32px 0',
      borderBottom: '1px solid rgba(34, 197, 94, 0.2)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e', boxShadow: '0 0 12px #22c55e' }} />
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 700, color: '#22c55e', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Live on Stellar Testnet
          </span>
        </div>
        <a 
          href="https://stellar.expert/explorer/testnet"
          target="_blank"
          rel="noopener noreferrer"
          style={{ 
            fontFamily: 'monospace', 
            fontSize: 11, 
            color: 'rgba(255,255,255,0.5)', 
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          View all transactions →
          <ExternalLink size={12} color="rgba(255,255,255,0.5)" />
        </a>
      </div>

      <motion.div
        style={{ display: 'flex', gap: 24 }}
        animate={{ x: [0, -1500] }}
        transition={{ x: { repeat: Infinity, repeatType: 'loop', duration: 30, ease: 'linear' } }}
      >
        {[...transactions, ...transactions, ...transactions].map((tx, i) => (
          <div
            key={i}
            style={{
              flexShrink: 0,
              width: 320,
              backgroundColor: 'rgba(34, 197, 94, 0.08)',
              borderRadius: 12,
              padding: '16px 20px',
              border: '1px solid rgba(34, 197, 94, 0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ 
                padding: '4px 10px', 
                backgroundColor: 'rgba(34, 197, 94, 0.2)', 
                color: '#22c55e', 
                fontSize: 11, 
                fontWeight: 700, 
                borderRadius: 20,
                fontFamily: 'Montserrat, sans-serif'
              }}>
                {tx.type}
              </span>
              <span style={{ color: '#22c55e', fontSize: 12, fontWeight: 500 }}>
                ✓ {tx.status}
              </span>
            </div>
            
            <div style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              {tx.amount}
            </div>
            
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'monospace', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              TX: {tx.tx.slice(0, 28)}...
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{tx.time}</span>
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${tx.tx}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#22c55e', fontSize: 11, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                Explorer <ExternalLink size={10} />
              </a>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}