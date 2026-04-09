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

  // FIXED: Añadido guard de autenticación
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
      titulo: 'Consultoria IA paraPMEs',
      descricao: 'Implementação de soluções de IA no teu negócio com acompanhamento personalizado.',
      preco: '299€/mês',
      funcionalidades: ['Análise do negócio', '2 sessões/mês', 'Relatórios mensais', 'Suporte prioritário'],
      popular: true,
    },
    {
      titulo: 'Audit Marketing Digital',
      descricao: 'Análise completa da tua presença digital com plano de ação personalizado.',
      preco: '499€',
      funcionalidades: ['Análise completa', 'Relatório detalhado', 'Plano de ação', 'Reunião de apresentação'],
    },
    {
      titulo: 'Mentoria Intensiva',
      descricao: 'Programa de 3 meses com acompanhamento diário para escalar o teu negócio.',
      preco: '1.499€',
      funcionalidades: ['12 sessões', 'AcessoSlack', 'Recursos exclusivos', 'Certificado'],
    },
  ];

  const faqs = [
    {
      pergunta: 'Como funciona a consultoria?',
      resposta: 'Depois de escolheres o plano, agendamos uma chamada inicial para entender o teu negócio. A partir daí, definimos objetivos e marcamos as sessões regulares.',
    },
    {
      pergunta: 'Posso cancelar a qualquer momento?',
      resposta: 'Sim, podes cancelar com 30 dias de antecedência. Não há penalties nem taxas adicionais.',
    },
    {
      pergunta: 'As sessões são online ou presenciais?',
      resposta: 'Todas as sessões são online via Zoom, gravadas para que possas rever quando quiseres.',
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
              AI BORA Consultoria
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: colors.dark, marginBottom: 16, letterSpacing: '-0.03em' }}>
            Transforma o teu negócio com <span style={{ color: colors.orange }}>Inteligência Artificial</span>
          </h1>
          <p style={{ color: '#666', fontSize: 18, maxWidth: 600 }}>
            Sessions de consultoria personalizadas para PMEs que querem inovar e escalar com IA.
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
                  Mais Popular
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
                Solicitar Orçamento
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
          <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>Precisas de ajuda imediata?</h2>
          <p style={{ fontSize: 16, opacity: 0.8, marginBottom: 24, maxWidth: 500, margin: '0 auto 24px' }}>
            Agenda uma chamada gratuita de 30 minutos para discutires as tuas necessidades.
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
              Agendar Chamada
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
              Contactar por Email
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 style={{ fontSize: 24, fontWeight: 800, color: colors.dark, marginBottom: 24 }}>Perguntas Frequentes</h2>
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