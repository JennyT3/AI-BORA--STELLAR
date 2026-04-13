import { motion } from 'motion/react';
import { useSectionInView } from '../hooks/useSectionInView';

const steps = [
  {
    num: "01",
    title: "Create Proposal",
    desc: "Admin creates proposal with PDF hash stored on-chain"
  },
  {
    num: "02",
    title: "Client Pays",
    desc: "Human client pays invoice OR AI agent pays via x402/MPP"
  },
  {
    num: "03",
    title: "Smart Contract",
    desc: "PaymentSplitter automatically calculates 70/30 split"
  },
  {
    num: "04",
    title: "Instant Payout",
    desc: "Admin + collaborator receive funds trustlessly"
  }
];

export function ComoFuncionaSection() {
  const { ref, isInView } = useSectionInView();

  return (
    <section id="processo" style={{ backgroundColor: '#0a0a0a', padding: '80px 16px' }} ref={ref}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: 60 } : { width: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ 
              height: '3px', 
              backgroundColor: '#F25C05', 
              borderRadius: '2px',
              margin: '0 auto 16px'
            }}
          />
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(28px, 4vw, 42px)',
              color: '#FFFFFF',
              margin: 0
            }}
          >
            How it <span style={{ color: '#F25C05' }}>works</span>
          </motion.h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32 }}>
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              style={{
                textAlign: 'center',
                padding: '32px 20px',
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F25C05, #F22283)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 4px 20px rgba(242,92,5,0.3)'
              }}>
                <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: 18, color: '#FFFFFF' }}>
                  {step.num}
                </span>
              </div>
              <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 16, color: '#FFFFFF', margin: '0 0 8px' }}>
                {step.title}
              </h3>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.5 }}>
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}