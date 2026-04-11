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
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
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
            Two Ways to <span style={{ color: '#F25C05' }}>Get Paid</span>
          </h2>
          <p style={{ color: '#888', fontSize: 16, maxWidth: 600, margin: '0 auto' }}>
            AI BORA handles payments automatically via Stellar blockchain
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {/* FLOW 1: B2B */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #0f172a 100%)',
              borderRadius: 20,
              padding: 32,
              border: '1px solid rgba(34, 197, 94, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', top: 0, right: 0, width: 100, height: 100, background: 'radial-gradient(circle at center, rgba(34,197,94,0.2) 0%, transparent 70%)' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Receipt size={24} color="white" />
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#22c55e' }}>FLOW 1</div>
                <div style={{ fontSize: 13, color: '#666' }}>B2B Payments</div>
              </div>
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 16 }}>
              Client Invoice + Split
            </h3>
            
            <ol style={{ color: '#aaa', fontSize: 13, lineHeight: 2, paddingLeft: 20, marginBottom: 24 }}>
              <li> Company creates proposal → PDF with hash</li>
              <li> Client receives link → accepts</li>
              <li> Collaborator does the work</li>
              <li> Admin approves → invoice sent</li>
              <li style={{ color: '#22c55e', fontWeight: 600 }}>Client pays invoice (here)</li>
              <li> 70/30 split automatic</li>
            </ol>

            <div style={{ padding: '12px 16px', background: 'rgba(34,197,94,0.1)', borderRadius: 12, border: '1px solid rgba(34,197,94,0.2)' }}>
              <div style={{ fontSize: 12, color: '#22c55e', fontWeight: 600, marginBottom: 4 }}>💰 Your main income</div>
              <div style={{ fontSize: 11, color: '#666' }}>Client pays after work is done</div>
            </div>

            <Link href="/admin/orcamento">
              <button style={{ 
                marginTop: 20, width: '100%', padding: '14px 20px', 
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', 
                border: 'none', borderRadius: 12, color: 'white', fontWeight: 700, fontSize: 14,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}>
                Try B2B Flow <ArrowRight size={16} />
              </button>
            </Link>
          </motion.div>

          {/* FLOW 2: AI Agents */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #0f172a 100%)',
              borderRadius: 20,
              padding: 32,
              border: '1px solid rgba(242, 92, 5, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', top: 0, right: 0, width: 100, height: 100, background: 'radial-gradient(circle at center, rgba(242,92,5,0.2) 0%, transparent 70%)' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #F25C05 0%, #F22283 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={24} color="white" />
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#F25C05' }}>FLOW 2</div>
                <div style={{ fontSize: 13, color: '#666' }}>AI Agent Micropayments</div>
              </div>
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 16 }}>
              x402 Protocol
            </h3>
            
            <ol style={{ color: '#aaa', fontSize: 13, lineHeight: 2, paddingLeft: 20, marginBottom: 24 }}>
              <li> Your API responds 402</li>
              <li> Payment info in header</li>
              <li> AI Agent decides to pay</li>
              <li> Pays automatically in USDC</li>
              <li style={{ color: '#F25C05', fontWeight: 600 }}>Split 70/30 instant</li>
              <li> No manual invoicing</li>
            </ol>

            <div style={{ padding: '12px 16px', background: 'rgba(242,92,5,0.1)', borderRadius: 12, border: '1px solid rgba(242,92,5,0.2)' }}>
              <div style={{ fontSize: 12, color: '#F25C05', fontWeight: 600, marginBottom: 4 }}>🤖 Extra income</div>
              <div style={{ fontSize: 11, color: '#666' }}>Earn from your API</div>
            </div>

            <Link href="/agent-x402-demo">
              <button style={{ 
                marginTop: 20, width: '100%', padding: '14px 20px', 
                background: 'linear-gradient(135deg, #F25C05 0%, #F22283 100%)', 
                border: 'none', borderRadius: 12, color: 'white', fontWeight: 700, fontSize: 14,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}>
                See AI Agent Demo <ArrowRight size={16} />
              </button>
            </Link>
          </motion.div>
        </div>

        {/* CONTRACTS INFO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          style={{ marginTop: 48, padding: 24, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <DollarSign size={18} color="#F25C05" />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Smart Contracts on Stellar</span>
          </div>
          <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6, marginBottom: 12 }}>
            Payments are handled by the <strong>PaymentSplitter</strong> smart contract. When payments arrive, 
            it automatically splits: <strong style={{ color: '#22c55e' }}>70% to company</strong> and <strong style={{ color: '#F25C05' }}>30% to collaborator</strong>.
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