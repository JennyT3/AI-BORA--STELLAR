import { Redirect } from "wouter";
import { useAcademiaAuth } from "../../hooks/useAcademiaAuth";
import { AcademiaNavbar } from "../../components/AcademiaNavbar";
import { Footer } from "../../components/Footer";
import { motion } from "framer-motion";
import { Bot, Sparkles, ArrowRight, Check, Mail, Calendar, Clock } from "lucide-react";

const colors = {
  orange: '#ff6f2e',
  magenta: '#cb1a74',
  dark: '#1c1b1b',
  light: '#fcf9f8',
};

export default function Consultoria() {
  const { isLoaded, isSignedIn, academiaUser } = useAcademiaAuth();

  // Auth guard
  if (!isLoaded) {
    return (
      <div style={{ minHeight: '100vh', background: colors.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: `3px solid ${colors.orange}`, borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isSignedIn) return <Redirect href="/academia/login" />;
  if (!academiaUser?.onboarding_completo) return <Redirect href="/academia/onboarding" />;

  const servicos = [
    {
      titulo: 'AI consulting for SMBs',
      descricao: 'Hands-on AI implementation in your business with personalised support.',
      preco: '299€/mês',
      funcionalidades: ['Business analysis', '2 sessions/month', 'Monthly reports', 'Priority support'],
      popular: true,
    },
    {
      titulo: 'Digital marketing audit',
      descricao: 'Full review of your digital presence with a tailored action plan.',
      preco: '499€',
      funcionalidades: ['Full analysis', 'Detailed report', 'Action plan', 'Presentation call'],
    },
    {
      titulo: 'Intensive mentorship',
      descricao: 'A 3-month programme with close support to scale your business.',
      preco: '1.499€',
      funcionalidades: ['12 sessions', 'Slack access', 'Exclusive resources', 'Certificate'],
    },
  ];

  const faqs = [
    {
      pergunta: 'How does consulting work?',
      resposta: 'After you choose a plan, we schedule an intro call to understand your business. Then we set goals and book regular sessions.',
    },
    {
      pergunta: 'Can I cancel anytime?',
      resposta: 'Yes. Cancel with 30 days notice. No penalties or extra fees.',
    },
    {
      pergunta: 'Are sessions online or in person?',
      resposta: 'All sessions are online via Zoom and recorded so you can rewatch anytime.',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: colors.light, fontFamily: 'Montserrat, sans-serif' }}>
      <AcademiaNavbar />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 48 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Sparkles size={24} color={colors.orange} />
            <span style={{ fontSize: 12, fontWeight: 800, color: colors.orange, textTransform: 'uppercase', letterSpacing: 2 }}>
              AI BORA consulting
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: colors.dark, marginBottom: 16, letterSpacing: '-0.03em' }}>
            Grow your business with <span style={{ color: colors.orange }}>artificial intelligence</span>
          </h1>
          <p style={{ color: '#666', fontSize: 18, maxWidth: 600 }}>
            Personalised consulting for SMBs that want to innovate and scale with AI.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 64 }}>
          {servicos.map((servico, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              style={{
                background: servico.popular ? `linear-gradient(135deg, ${colors.orange}15 0%, ${colors.magenta}10 100%)` : '#fff',
                borderRadius: 24,
                padding: 32,
                border: servico.popular ? `2px solid ${colors.orange}` : '1px solid rgba(0,0,0,0.04)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.05)',
                position: 'relative',
              }}
            >
              {servico.popular && (
                <div style={{
                  position: 'absolute',
                  top: -12,
                  left: 24,
                  background: colors.orange,
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '6px 14px',
                  borderRadius: 100,
                  textTransform: 'uppercase',
                }}>
                  Most popular
                </div>
              )}
              <h3 style={{ fontSize: 20, fontWeight: 800, color: colors.dark, marginBottom: 8 }}>
                {servico.titulo}
              </h3>
              <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 20 }}>
                {servico.descricao}
              </p>
              <div style={{ fontSize: 32, fontWeight: 900, color: colors.orange, marginBottom: 24 }}>
                {servico.preco}
              </div>
              <ul style={{ marginBottom: 24, padding: 0, listStyle: 'none' }}>
                {servico.funcionalidades.map((func, fidx) => (
                  <li key={fidx} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#444', marginBottom: 10 }}>
                    <Check size={16} color={colors.orange} />
                    {func}
                  </li>
                ))}
              </ul>
              <button style={{
                width: '100%',
                background: servico.popular ? colors.orange : colors.dark,
                color: '#fff',
                border: 'none',
                padding: '14px',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
              }}>
                Request a quote
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            background: '#1a1a1a',
            borderRadius: 32,
            padding: 48,
            textAlign: 'center',
            color: '#fff',
            marginBottom: 48,
          }}
        >
          <Bot size={48} style={{ marginBottom: 20 }} />
          <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>Need help right away?</h2>
          <p style={{ fontSize: 16, opacity: 0.8, marginBottom: 24, maxWidth: 500, margin: '0 auto 24px' }}>
            Book a free 30-minute call to talk through your needs.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: colors.orange,
              color: '#fff',
              border: 'none',
              padding: '14px 28px',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
            }}>
              <Calendar size={18} />
              Book a call
            </button>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'transparent',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '14px 28px',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
            }}>
              <Mail size={18} />
              Email us
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 style={{ fontSize: 24, fontWeight: 800, color: colors.dark, marginBottom: 24 }}>FAQ</h2>
          <div style={{ display: 'grid', gap: 16 }}>
            {faqs.map((faq, idx) => (
              <div key={idx} style={{
                background: '#fff',
                borderRadius: 16,
                padding: 24,
                border: '1px solid rgba(0,0,0,0.04)',
              }}>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: colors.dark, marginBottom: 8 }}>
                  {faq.pergunta}
                </h4>
                <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>
                  {faq.resposta}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}