import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Bot, Receipt, ArrowRight, DollarSign, ExternalLink } from 'lucide-react';

export function PaymentFlowsSection() {
  return (
    <section style={{ 
      padding: '80px 24px', 
      background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 100%)',
      borderTop: '1px solid rgba(255,255,255,0.05)'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 48 }}
        >
          <h2 style={{ 
            fontSize: 'clamp(28px, 5vw, 42px)', 
            fontWeight: 900, 
            color: '#fff',
            fontFamily: 'Montserrat, sans-serif',
            marginBottom: 16
          }}>
            Three Ways to <span style={{ color: '#F25C05' }}>Get Paid</span>
          </h2>
          <p style={{ color: '#888', fontSize: 16, maxWidth: 600, margin: '0 auto' }}>
            AI BORA supports human clients, AI agents with negotiation, and direct blockchain payments
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {/* FLOW 1: B2B */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #0f172a 100%)',
              borderRadius: 20,
              padding: 28,
              border: '1px solid rgba(34, 197, 94, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', top: 0, right: 0, width: 100, height: 100, background: 'radial-gradient(circle at center, rgba(34,197,94,0.2) 0%, transparent 70%)' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Receipt size={22} color="white" />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#22c55e' }}>FLOW 1</div>
                <div style={{ fontSize: 12, color: '#666' }}>Human Clients (B2B)</div>
              </div>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 12 }}>
              Traditional Invoice Flow
            </h3>
            
            <ol style={{ color: '#aaa', fontSize: 12, lineHeight: 1.8, paddingLeft: 18, marginBottom: 16 }}>
              <li> Company creates proposal → PDF + hash</li>
              <li> Client accepts via web</li>
              <li> Collaborator completes work</li>
              <li> Client pays USDC invoice</li>
              <li style={{ color: '#22c55e', fontWeight: 600 }}> 70/30 split automatic</li>
            </ol>

            <div style={{ padding: '10px 14px', background: 'rgba(34,197,94,0.1)', borderRadius: 10, border: '1px solid rgba(34,197,94,0.2)' }}>
              <div style={{ fontSize: 11, color: '#22c55e', fontWeight: 600, marginBottom: 2 }}>👥 For human clients</div>
              <div style={{ fontSize: 10, color: '#666' }}>Web interface, PDF proposals</div>
            </div>

            <Link href="/admin/orcamento">
              <button style={{ 
                marginTop: 16, width: '100%', padding: '12px 16px', 
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', 
                border: 'none', borderRadius: 10, color: 'white', fontWeight: 700, fontSize: 13,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
              }}>
                Try B2B Flow <ArrowRight size={14} />
              </button>
            </Link>
          </motion.div>

          {/* FLOW 2: x402 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #0f172a 100%)',
              borderRadius: 20,
              padding: 28,
              border: '1px solid rgba(242, 92, 5, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', top: 0, right: 0, width: 100, height: 100, background: 'radial-gradient(circle at center, rgba(242,92,5,0.2) 0%, transparent 70%)' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #F25C05 0%, #F22283 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={22} color="white" />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#F25C05' }}>FLOW 2</div>
                <div style={{ fontSize: 12, color: '#666' }}>AI Agents (x402)</div>
              </div>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 12 }}>
              HTTP 402 Price Negotiation
            </h3>
            
            <ol style={{ color: '#aaa', fontSize: 12, lineHeight: 1.8, paddingLeft: 18, marginBottom: 16 }}>
              <li> Agent calls your API</li>
              <li> Server responds 402 + price</li>
              <li style={{ color: '#F25C05', fontWeight: 600 }}> Agent decides: pay or reject</li>
              <li> If OK → signs & pays USDC</li>
              <li> 70/30 split instant</li>
            </ol>

            <div style={{ padding: '10px 14px', background: 'rgba(242,92,5,0.1)', borderRadius: 10, border: '1px solid rgba(242,92,5,0.2)' }}>
              <div style={{ fontSize: 11, color: '#F25C05', fontWeight: 600, marginBottom: 2 }}>🤖 Dynamic pricing</div>
              <div style={{ fontSize: 10, color: '#666' }}>Agents negotiate before paying</div>
            </div>

            <Link href="/agent-x402-demo">
              <button style={{ 
                marginTop: 16, width: '100%', padding: '12px 16px', 
                background: 'linear-gradient(135deg, #F25C05 0%, #F22283 100%)', 
                border: 'none', borderRadius: 10, color: 'white', fontWeight: 700, fontSize: 13,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
              }}>
                See Agent Demo <ArrowRight size={14} />
              </button>
            </Link>
          </motion.div>

          {/* FLOW 3: MPP */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #0f172a 100%)',
              borderRadius: 20,
              padding: 28,
              border: '1px solid rgba(139, 92, 246, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', top: 0, right: 0, width: 100, height: 100, background: 'radial-gradient(circle at center, rgba(139,92,246,0.2) 0%, transparent 70%)' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={22} color="white" />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#8b5cf6' }}>FLOW 3</div>
                <div style={{ fontSize: 12, color: '#666' }}>Direct Payment (MPP)</div>
              </div>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 12 }}>
              Direct Blockchain Settlement
            </h3>
            
            <ol style={{ color: '#aaa', fontSize: 12, lineHeight: 1.8, paddingLeft: 18, marginBottom: 16 }}>
              <li> Agent queries service list</li>
              <li> Gets fixed prices</li>
              <li style={{ color: '#8b5cf6', fontWeight: 600 }}> Pays XLM directly on-chain</li>
              <li> Server detects memo</li>
              <li> 70/30 split + content delivery</li>
            </ol>

            <div style={{ padding: '10px 14px', background: 'rgba(139,92,246,0.1)', borderRadius: 10, border: '1px solid rgba(139,92,246,0.2)' }}>
              <div style={{ fontSize: 11, color: '#8b5cf6', fontWeight: 600, marginBottom: 2 }}>⚡ Lowest fees</div>
              <div style={{ fontSize: 10, color: '#666' }}>No intermediaries, instant settlement</div>
            </div>

            <a href="https://stellar.expert/explorer/testnet" target="_blank" rel="noopener noreferrer">
              <button style={{ 
                marginTop: 16, width: '100%', padding: '12px 16px', 
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', 
                border: 'none', borderRadius: 10, color: 'white', fontWeight: 700, fontSize: 13,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
              }}>
                View Transactions <ExternalLink size={14} />
              </button>
            </a>
          </motion.div>
        </div>

        {/* CONTRACTS INFO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          style={{ marginTop: 40, padding: 24, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <DollarSign size={18} color="#F25C05" />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Smart Contracts on Stellar</span>
          </div>
          <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6, marginBottom: 12 }}>
            All payments flow through <strong>PaymentSplitter</strong> smart contract. 
            <strong style={{ color: '#22c55e' }}> 70% to company</strong>, <strong style={{ color: '#F25C05' }}>30% to collaborator</strong>.
            Instant, trustless, on-chain.
          </p>
          <a 
            href="https://stellar.expert/explorer/testnet" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ fontSize: 12, color: '#F25C05', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
          >
            View on Stellar Explorer <ExternalLink size={12} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}