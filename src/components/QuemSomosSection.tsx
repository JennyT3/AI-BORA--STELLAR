import { motion } from 'motion/react';

const TEAM = [
  {
    name: "Jenny Tejedor",
    role: "Founder & Technical Lead",
    desc: "Creator of AI BORA",
    image: "/jenny-photo.jpg",
    hasImage: true
  },
  {
    name: "Bora AI",
    role: "AI Payment Agent",
    desc: "Autonomous x402 engine",
    hasImage: false,
    emoji: "🤖"
  },
  {
    name: "Stellar Network",
    role: "Blockchain Infrastructure",
    desc: "Fast, low-cost transactions",
    image: "/stellar-logo.png",
    hasImage: true,
    isStellar: true
  }
];

export function QuemSomosSection() {
  return (
    <section style={{ backgroundColor: '#F8F7F4', padding: '80px 16px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 60 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ height: '3px', backgroundColor: '#F25C05', borderRadius: '2px', margin: '0 auto 16px' }}
          />
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: 'clamp(28px, 4vw, 42px)', color: '#1A1A1A', margin: '0 0 12px' }}
          >
            Who we <span style={{ color: '#F25C05' }}>are</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 16, color: '#666', margin: 0, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}
          >
            The team building autonomous B2B payments
          </motion.p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {TEAM.map((member, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                padding: '32px 24px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <div style={{
                width: 100,
                height: 100,
                borderRadius: member.isStellar ? 16 : '50%',
                backgroundColor: member.hasImage ? '#f0f0f0' : `linear-gradient(135deg, ${i === 0 ? '#F25C05' : i === 1 ? '#F22283' : '#14b8a6'}, ${i === 0 ? '#F22283' : i === 1 ? '#22c55e' : '#0ea5e9'})`,
                margin: '0 auto 20px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 40,
                border: member.isStellar ? '2px solid #14b8a6' : 'none'
              }}>
                {member.hasImage ? (
                  <img 
                    src={member.image} 
                    alt={member.name}
                    style={{ 
                      width: member.isStellar ? 60 : '100%', 
                      height: member.isStellar ? 60 : '100%', 
                      objectFit: member.isStellar ? 'contain' : 'cover' 
                    }}
                    onError={(e) => { 
                      (e.target as HTMLImageElement).style.display = 'none';
                      if ((e.target as HTMLImageElement).parentElement) {
                        (e.target as HTMLImageElement).parentElement!.innerHTML = `<span style="font-size: 36px;">${member.emoji || member.name.charAt(0)}</span>`;
                      }
                    }}
                  />
                ) : (
                  <span style={{ fontSize: 40 }}>{member.emoji}</span>
                )}
              </div>
              <h4 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 18, color: '#1A1A1A', margin: '0 0 4px' }}>
                {member.name}
              </h4>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, color: '#F25C05', margin: '0 0 8px', fontWeight: 600 }}>
                {member.role}
              </p>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, color: '#888', margin: 0 }}>
                {member.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}