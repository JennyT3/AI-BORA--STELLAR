import { motion } from 'motion/react';
import { Bot, FileText, BarChart3, Users } from 'lucide-react';

const SERVICES = [
  {
    icon: Bot,
    title: 'AI Agents',
    desc: 'Autonomous agents that discover services, negotiate, and pay automatically.',
    color: '#F25C05'
  },
  {
    icon: FileText,
    title: 'PDF Proposals',
    desc: 'Professional proposals with blockchain verification for B2B clients.',
    color: '#F22283'
  },
  {
    icon: BarChart3,
    title: '70/30 Split',
    desc: 'On-chain payment distribution via Soroban smart contract.',
    color: '#22c55e'
  },
  {
    icon: Users,
    title: 'Collaborators',
    desc: 'Invite collaborators who get paid automatically via smart contract.',
    color: '#8b5cf6'
  }
];

export function ServicesSection() {
  return (
    <section style={{ backgroundColor: '#FFFFFF', padding: '80px 16px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 60 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ height: '3px', backgroundColor: '#F22283', borderRadius: '2px', margin: '0 auto 16px' }}
          />
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: 'clamp(28px, 4vw, 42px)', color: '#1A1A1A', margin: '0 0 12px' }}
          >
            Platform <span style={{ color: '#F25C05' }}>Services</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 16, color: '#666', margin: 0, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}
          >
            Everything you need for B2B sales with autonomous payments
          </motion.p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {SERVICES.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                style={{
                  backgroundColor: '#F8F7F4',
                  borderRadius: 16,
                  padding: '28px 24px',
                  border: '2px solid transparent',
                  transition: 'border-color 0.2s ease',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = service.color}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
              >
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: `${service.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16
                }}>
                  <Icon size={24} color={service.color} />
                </div>
                <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 16, color: '#1A1A1A', margin: '0 0 8px' }}>
                  {service.title}
                </h3>
                <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, color: '#666', margin: 0, lineHeight: 1.5 }}>
                  {service.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}