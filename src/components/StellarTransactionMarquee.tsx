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
    type: 'Trustline',
    asset: 'USDC',
    amount: '1,000 USDC',
    time: '5 min ago',
    status: 'Confirmed'
  },
  {
    tx: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    type: 'Payment',
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
    <div className="overflow-hidden bg-slate-900/50 py-6 border-y border-cyan-500/10">
      <motion.div
        className="flex gap-6"
        animate={{
          x: [0, -1000]
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 20,
            ease: "linear"
          }
        }}
      >
        {[...transactions, ...transactions].map((tx, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-80 bg-slate-800/80 backdrop-blur rounded-2xl p-5 border border-cyan-500/20 hover:border-cyan-500/40 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-bold rounded-full">
                {tx.type}
              </span>
              <span className="text-green-400 text-xs font-medium">
                ✅ {tx.status}
              </span>
            </div>
            
            <div className="text-white font-mono text-sm mb-2">
              {tx.amount}
            </div>
            
            <div className="text-gray-500 text-xs font-mono truncate mb-3">
              TX: {tx.tx.slice(0, 24)}...
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs">{tx.time}</span>
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${tx.tx}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 text-xs flex items-center gap-1 hover:underline"
              >
                Explorer <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}