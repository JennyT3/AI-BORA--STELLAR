import React from 'react';
import { Link, Redirect } from 'wouter';
import { useAcademiaAuth } from '../../hooks/useAcademiaAuth';

const colors = { orange: '#ff6f2e', magenta: '#cb1a74', dark: '#1c1b1b', light: '#fcf9f8' };

export default function AcademiaComunidade() {
  const { isLoaded, isSignedIn, academiaUser, isLoading } = useAcademiaAuth();

  if (!isLoaded || isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: colors.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: `3px solid ${colors.orange}`, borderTopColor: 'transparent', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#666', fontFamily: 'Montserrat, sans-serif' }}>A carregar...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!isSignedIn) return <Redirect to="/academia/login" />;
  if (!academiaUser?.onboarding_completo) return <Redirect to="/academia/onboarding" />;

  const canais = [
    { nome: '#introducoes', descricao: 'Apresenta-te aos outros membros', icone: '👋' },
    { nome: '#duvidas-tecnicas', descricao: 'Tira dúvidas sobre as ferramentas', icone: '❓' },
    { nome: '#compartilha-vitorias', descricao: 'Celebra as tuas conquistas', icone: '🎉' },
    { nome: '#networking', descricao: 'Conecta-te com outros profissionais', icone: '🤝' },
    { nome: '#marketing-digital', descricao: 'Discussões sobre estratégias', icone: '📢' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: colors.light, fontFamily: 'Montserrat, sans-serif' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '16px 32px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/academia/dashboard">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.magenta} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <span style={{ fontSize: 18, fontWeight: 700, color: colors.dark }}>Academia <span style={{ color: colors.orange }}>Bora Lá</span></span>
            </div>
          </Link>
          <nav style={{ display: 'flex', gap: 24 }}>
            <Link href="/academia/dashboard" style={{ color: '#666', textDecoration: 'none', fontWeight: 500, fontSize: 14 }}>Dashboard</Link>
            <Link href="/academia/trilhas" style={{ color: '#666', textDecoration: 'none', fontWeight: 500, fontSize: 14 }}>Trilhas</Link>
            <Link href="/academia/comunidade" style={{ color: colors.orange, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>Comunidade</Link>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '60px 32px', textAlign: 'center' }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ width: 80, height: 80, borderRadius: 20, background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.magenta} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="white"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: colors.dark, marginBottom: 12 }}>Comunidade Bora Lá</h1>
          <p style={{ fontSize: 16, color: '#666', maxWidth: 500, margin: '0 auto' }}>Conecta-te com outros profissionais, partilha experiências e aprende em conjunto.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 40 }}>
          {canais.map((canal, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #eee', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 24 }}>{canal.icone}</span>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: colors.dark }}>{canal.nome}</h3>
              </div>
              <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>{canal.descricao}</p>
              <button style={{ width: '100%', padding: '12px', background: colors.orange, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Entrar no canal</button>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', borderRadius: 16, padding: 32, border: '1px solid #eee' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.dark, marginBottom: 16 }}>Junta-te à nossa comunidade</h2>
          <p style={{ color: '#666', marginBottom: 20 }}>Aceder ao Slack para acesso completo a todos os canais</p>
          <a href="https://join.slack.com/t/bora-la/shared_invite" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '14px 32px', background: colors.dark, color: '#fff', textDecoration: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14 }}>Entrar no Slack →</a>
        </div>
      </main>
    </div>
  );
}