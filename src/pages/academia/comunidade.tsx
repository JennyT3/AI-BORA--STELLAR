import { Redirect } from "wouter";
import { useAcademiaAuth } from "../../hooks/useAcademiaAuth";
import { AcademiaNavbar } from "../../components/AcademiaNavbar";
import { Footer } from "../../components/Footer";
import { motion } from "framer-motion";
import { MessageSquare, Users, Hash, ExternalLink, Bell, Star } from "lucide-react";

const colors = {
  orange: '#ff6f2e',
  magenta: '#cb1a74',
  dark: '#1c1b1b',
  light: '#fcf9f8',
};

export default function Comunidade() {
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

  const canais = [
    {
      nome: 'General',
      descricao: 'Open discussion on digital marketing and trends',
      membros: 1247,
      ativo: true,
      icon: MessageSquare,
    },
    {
      nome: 'Technical help',
      descricao: 'Help with tools, platforms and specific techniques',
      membros: 892,
      ativo: true,
      icon: Users,
    },
    {
      nome: 'Digital marketing',
      descricao: 'Strategy, metrics and success stories',
      membroOnline: 156,
      icon: Hash,
    },
    {
      nome: 'Design & creative',
      descricao: 'Share work, feedback and inspiration',
      membros: 634,
      icon: Star,
    },
    {
      nome: 'Offers & collaborations',
      descricao: 'Job opportunities and partnerships between members',
      membros: 421,
      ativo: true,
      icon: ExternalLink,
    },
  ];

  const eventos = [
    { titulo: 'Live: Future of AI in Marketing', data: '15 Apr 2026', horario: '18:00', participantes: 234 },
    { titulo: 'Workshop: SEO for SMBs', data: '18 Apr 2026', horario: '15:00', participantes: 89 },
    { titulo: 'Q&A: Content strategy', data: '22 Apr 2026', horario: '17:00', participantes: 156 },
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
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 42px)', fontWeight: 900, color: colors.dark, marginBottom: 16, letterSpacing: '-0.03em' }}>
            <span style={{ color: colors.orange }}>Slack</span> community
          </h1>
          <p style={{ color: '#666', fontSize: 18, maxWidth: 600 }}>
            Connect with other learners, share wins and learn together.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, marginBottom: 48 }}>
          {canais.map((canal, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              style={{
                background: '#fff',
                borderRadius: 20,
                padding: 28,
                border: '1px solid rgba(0,0,0,0.04)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: `linear-gradient(135deg, ${colors.orange}20 0%, ${colors.magenta}20 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <canal.icon size={22} color={colors.orange} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: colors.dark, marginBottom: 4 }}>
                    {canal.nome}
                  </h3>
                  {canal.ativo && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#10B981', background: '#10B98115', padding: '2px 8px', borderRadius: 4 }}>
                      ● Online
                    </span>
                  )}
                </div>
              </div>
              <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 16 }}>
                {canal.descricao}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#888' }}>
                  {typeof canal.membros === 'number' ? `${canal.membros} members` : ''}
                </span>
                {canal.membroOnline && (
                  <span style={{ fontSize: 13, color: colors.orange, fontWeight: 600 }}>
                    {canal.membroOnline} online
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ marginBottom: 48 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <Bell size={20} color={colors.orange} />
            <h2 style={{ fontSize: 22, fontWeight: 800, color: colors.dark }}>Upcoming events</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {eventos.map((evento, idx) => (
              <div key={idx} style={{
                background: '#fff',
                borderRadius: 16,
                padding: 20,
                border: '1px solid rgba(0,0,0,0.04)',
              }}>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: colors.dark, marginBottom: 8 }}>
                  {evento.titulo}
                </h4>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#888', marginBottom: 8 }}>
                  <span>{evento.data}</span>
                  <span>{evento.horario}</span>
                </div>
                <span style={{ fontSize: 12, color: colors.orange, fontWeight: 600 }}>
                  {evento.participantes} signed up
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{
            background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.magenta} 100%)`,
            borderRadius: 24,
            padding: 32,
            textAlign: 'center',
            color: '#fff',
          }}
        >
          <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Join the community</h3>
          <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 20, maxWidth: 500, margin: '0 auto 20px' }}>
            Questions or something to share? Slack is the best place to connect.
          </p>
          <button style={{
            background: '#fff',
            color: colors.orange,
            border: 'none',
            padding: '14px 32px',
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
          }}>
            Open Slack
          </button>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}