import { motion } from 'motion/react';
import { Link } from 'wouter';
import { ArrowRight, FileText, Rocket } from 'lucide-react';

export function HeroSection() {
  return (
    <section 
      style={{ 
        backgroundColor: '#0a0a0a',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }} 
      className="w-full"
    >
      <div className="max-w-4xl mx-auto px-6 text-center">
        
        {/* Logo/Brand */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: 40 }}
        >
          <span style={{ 
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 900,
            fontSize: 14,
            color: '#F25C05',
            letterSpacing: '0.3em',
            textTransform: 'uppercase'
          }}>
            AI BORA
          </span>
        </motion.div>

        {/* Main Title - VERY EYE CATCHING */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            color: '#FFFFFF',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            lineHeight: 1.1,
            marginBottom: 24
          }}
        >
          PAY WITH
          <br />
          <span style={{ color: '#F25C05' }}>STELLAR</span>
        </motion.h1>

        {/* Subtitle - EXPLAINS WHAT IT DOES */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            color: 'rgba(255,255,255,0.7)',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 400,
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            lineHeight: 1.6,
            maxWidth: '600px',
            margin: '0 auto 48px'
          }}
        >
          B2B Sales Platform with <strong style={{ color: '#fff' }}>REAL Stellar blockchain payments</strong>. 
          Create proposals, send to clients, accept with fingerprint, pay on-chain. 
          <span style={{ color: '#22c55e' }}> Verified. Instant. Free.</span>
        </motion.p>

        {/* Two Simple Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          {/* GET STARTED - Goes to Register with Passkey */}
          <Link href="/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                backgroundColor: '#F25C05',
                color: '#FFFFFF',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                fontSize: '1.1rem',
                padding: '18px 36px',
                borderRadius: 50,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: '0 4px 20px rgba(242,92,5,0.4)'
              }}
            >
              <Rocket size={20} />
              Get Started
              <ArrowRight size={18} />
            </motion.button>
          </Link>

          {/* DOCS - Goes to documentation */}
          <Link href="/verify/test">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                backgroundColor: 'transparent',
                color: '#FFFFFF',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                fontSize: '1.1rem',
                padding: '18px 36px',
                borderRadius: 50,
                border: '2px solid rgba(255,255,255,0.3)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}
            >
              <FileText size={20} />
              Docs
            </motion.button>
          </Link>
        </motion.div>

        {/* Flow Diagram - Shows the steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{ marginTop: 60 }}
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 8, 
            flexWrap: 'wrap',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '0.85rem',
            color: 'rgba(255,255,255,0.5)'
          }}>
            <span style={{ color: '#F25C05', fontWeight: 600 }}>1.</span>
            <span>Admin creates proposal</span>
            
            <span style={{ color: '#F25C05', fontWeight: 600, marginLeft: 16 }}>→</span>
            
            <span style={{ color: '#F25C05', fontWeight: 600 }}>2.</span>
            <span>Client receives link</span>
            
            <span style={{ color: '#F25C05', fontWeight: 600, marginLeft: 16 }}>→</span>
            
            <span style={{ color: '#F25C05', fontWeight: 600 }}>3.</span>
            <span>Client accepts</span>
            
            <span style={{ color: '#F25C05', fontWeight: 600, marginLeft: 16 }}>→</span>
            
            <span style={{ color: '#22c55e', fontWeight: 600 }}>4.</span>
            <span style={{ color: '#22c55e' }}>Pay with Stellar</span>
            
            <span style={{ color: '#F25C05', fontWeight: 600, marginLeft: 16 }}>→</span>
            
            <span style={{ color: '#22c55e', fontWeight: 600 }}>5.</span>
            <span style={{ color: '#22c55e' }}>Auto-distribute to team</span>
          </div>
        </motion.div>

        {/* TX Hash Demo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          style={{ marginTop: 40, padding: '16px 24px', backgroundColor: 'rgba(34,197,94,0.1)', borderRadius: 12, display: 'inline-block' }}
        >
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', color: '#22c55e', marginBottom: 8 }}>
            ✅ Real Stellar Testnet Transaction
          </p>
          <a 
            href="https://stellar.expert/explorer/testnet/tx/227828308b72a57f6df4ab4346ad7f9811a682bc3eee7cfc30c1011fe89de549"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}
          >
            TX: 227828308b72a57f6df4ab4346ad7f9811a682bc3eee7cfc30c1011fe89de549 ↗
          </a>
        </motion.div>

      </div>
    </section>
  );
}