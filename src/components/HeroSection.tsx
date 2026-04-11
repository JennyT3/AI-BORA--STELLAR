import { motion } from 'motion/react';
import { Link } from 'wouter';
import { ArrowRight, Bot, Zap, Users, DollarSign, ExternalLink, FileText } from 'lucide-react';

export function HeroSection() {
  return (
    <section style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
        
        {/* Logo + Brand */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}
        >
          <img src="/logo.png" alt="" style={{ height: 32, width: 'auto' }} />
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: 14, color: '#F25C05', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
            AI BORA
          </span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            color: '#FFFFFF',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
            lineHeight: 1.2,
            marginBottom: 20
          }}
        >
          AI Agents That Pay
          <br />
          <span style={{ color: '#F25C05' }}>Each Other</span> Automatically
        </motion.h1>

        {/* What is x402 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ marginBottom: 24 }}
        >
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 8, 
            backgroundColor: 'rgba(34, 197, 94, 0.1)', 
            padding: '8px 16px', 
            borderRadius: 100,
            border: '1px solid rgba(34, 197, 94, 0.3)'
          }}>
            <FileText size={14} color="#22c55e" />
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 600, color: '#22c55e' }}>
              x402 = HTTP 402 Payment Required for AI Agents
            </span>
          </div>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          style={{
            color: 'rgba(255,255,255,0.8)',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 500,
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            lineHeight: 1.6,
            maxWidth: '700px',
            margin: '0 auto 32px'
          }}
        >
          When an AI agent encounters a <span style={{ color: '#F25C05', fontWeight: 600 }}>402 Payment Required</span> response,
          it reads the price, decides if acceptable, and pays automatically via Stellar USDC.
          <span style={{ color: '#22c55e', fontWeight: 600 }}> No human intervention needed.</span>
        </motion.p>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}
        >
          {[
            { icon: Bot, label: 'AI pays AI', desc: 'Machine-to-machine payments' },
            { icon: Zap, label: 'x402 Protocol', desc: 'HTTP 402 for AI agents' },
            { icon: DollarSign, label: '70/30 Split', desc: 'On-chain distribution' },
            { icon: Users, label: 'Collaborators', desc: 'Automatic payouts' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 16,
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                <Icon size={22} color="#F25C05" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>
                    {item.label}
                  </div>
                  <div style={{ fontFamily: 'Montserrat,sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>
                    {item.desc}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}
        >
          <Link href="/agent-x402-demo">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                backgroundColor: '#F25C05',
                color: '#FFFFFF',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                fontSize: '1rem',
                padding: '14px 28px',
                borderRadius: 50,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 20px rgba(242,92,5,0.4)'
              }}
            >
              <Bot size={18} />
              Watch AI Pay AI
              <ArrowRight size={16} />
            </motion.button>
          </Link>

          <Link href="/admin">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                backgroundColor: 'transparent',
                color: '#FFFFFF',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                fontSize: '0.95rem',
                padding: '14px 28px',
                borderRadius: 50,
                border: '2px solid rgba(255,255,255,0.3)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              Try B2B Flow
            </motion.button>
          </Link>

          <a href="https://github.com/JennyT3/AI-BORA--STELLAR" target="_blank" rel="noopener noreferrer">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: '#FFFFFF',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                fontSize: '0.95rem',
                padding: '14px 28px',
                borderRadius: 50,
                border: '2px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <FileText size={16} />
              Docs
              <ExternalLink size={14} />
            </motion.button>
          </a>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          style={{ marginTop: 40 }}
        >
          <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            How It Works
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap', fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
            {[
              { num: '1', text: 'Agent discovers service', color: '#F25C05' },
              { num: '2', text: 'Reads 402 header', color: '#F25C05' },
              { num: '3', text: 'Pays via x402', color: '#F22283' },
              { num: '4', text: 'Split 70/30 on-chain', color: '#22c55e' },
            ].map((step, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: step.color, fontWeight: 700 }}>{step.num}.</span>
                <span>{step.text}</span>
                {i < 3 && <span style={{ marginLeft: 8, marginRight: 8, opacity: 0.3 }}>→</span>}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          style={{ marginTop: 32 }}
        >
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', fontFamily: 'Montserrat, sans-serif', fontSize: '0.75rem' }}>
            <Link to="/onboarding" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>
              Agent Onboarding
            </Link>
            <Link to="/collaborator/demo" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>
              Collaborator Panel
            </Link>
            <Link to="/payment-flow/demo" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>
              Payment Demo
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  );
}