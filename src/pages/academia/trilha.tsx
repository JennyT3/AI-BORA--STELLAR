import React, { useState, useEffect } from 'react';
import { useRoute, Link, Redirect, useLocation } from 'wouter';
import { Play, Clock, Check, ArrowRight } from 'lucide-react';
import { useAcademiaAuth } from '../../hooks/useAcademiaAuth';
import { getProgressoTrilha } from '../../services/academiaUserService';
import { AcademiaNavbar } from '../../components/AcademiaNavbar';
import { Footer } from '../../components/Footer';
import { TRILHAS_MOCK } from '../../data/trilhasMock';

const colors = {
  orange: '#ff6f2e',
  magenta: '#cb1a74',
  dark: '#1c1b1b',
  light: '#fcf9f8'
};

export default function AcademiaTrilha() {
  const [match, params] = useRoute('/academia/trilha/:id');
  const { user, isLoaded, isSignedIn, academiaUser, isLoading } = useAcademiaAuth();
  const [, setLocation] = useLocation();

  const trilhaId = params?.id || '';
  const trilha = TRILHAS_MOCK.find(t => t.id === trilhaId);
  const [progressos, setProgressos] = useState<any[]>([]);

  useEffect(() => {
    async function loadProgresso() {
      if (user && trilhaId) {
        const prog = await getProgressoTrilha(user.id, trilhaId);
        setProgressos(prog);
      }
    }
    if (isLoaded && user) loadProgresso();
  }, [user, trilhaId, isLoaded]);

  if (!isLoaded || isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: colors.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: `3px solid ${colors.orange}`, borderTopColor: 'transparent', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#666', fontFamily: 'Montserrat, sans-serif' }}>Loading…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!isSignedIn) return <Redirect to="/academia/login" />;
  if (!academiaUser?.onboarding_completo) return <Redirect to="/academia/onboarding" />;

  if (!trilha) {
    return (
      <div style={{ minHeight: '100vh', background: colors.light, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Montserrat, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: colors.dark, marginBottom: 16 }}>Path not found</h1>
          <Link href="/academia/trilhas" style={{ color: colors.orange, fontWeight: 600 }}>Back to learning paths</Link>
        </div>
      </div>
    );
  }

  const aulasConcluidas = progressos.filter(p => p.concluida).length;
  const progressoPercent = Math.round((aulasConcluidas / trilha.aulas.length) * 100);
  const proximaAulaIndex = trilha.aulas.findIndex(aula => !progressos.some(p => p.aula_id === aula.id && p.concluida));
  const primeiraAula = proximaAulaIndex >= 0 ? proximaAulaIndex : 0;

  const handleIniciar = () => {
    setLocation(`/academia/aula/${trilhaId}-aula-${primeiraAula + 1}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: colors.light, fontFamily: 'Montserrat, sans-serif' }}>
      <AcademiaNavbar />

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px' }}>
        <Link href="/academia/trilhas" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#666', textDecoration: 'none', fontSize: 14, marginBottom: 24 }}>
          ← Back to all paths
        </Link>

        {/* Path overview */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 32, marginBottom: 32, border: '1px solid #eee' }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            <div style={{ width: 80, height: 80, borderRadius: 20, background: `${colors.orange}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, flexShrink: 0 }}>
              {trilha.icone}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                <span style={{ background: colors.orange, color: '#fff', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{trilha.nivel}</span>
                <span style={{ background: '#f5f5f5', color: '#666', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{trilha.tempo_total}</span>
                <span style={{ background: '#f5f5f5', color: '#666', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{trilha.aulas.length} lessons</span>
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.dark, marginBottom: 12 }}>{trilha.nome}</h1>
              <p style={{ fontSize: 15, color: '#666', lineHeight: 1.6 }}>{trilha.descricao}</p>
            </div>
          </div>

          {/* Progress */}
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #eee' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: colors.dark }}>Your progress</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: colors.orange }}>{progressoPercent}%</span>
            </div>
            <div style={{ height: 8, background: '#eee', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressoPercent}%`, background: colors.orange, borderRadius: 4, transition: 'width 0.5s ease' }} />
            </div>
            <p style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
              {aulasConcluidas} of {trilha.aulas.length} lessons completed
            </p>
          </div>

          <button
            onClick={handleIniciar}
            style={{
              width: '100%', marginTop: 24, padding: '18px',
              background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.magenta} 100%)`,
              border: 'none', borderRadius: 14, color: '#fff',
              fontSize: 16, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              fontFamily: 'Montserrat, sans-serif', boxShadow: '0 8px 24px rgba(255,111,46,0.3)',
            }}
          >
            <Play size={20} fill="white" />
            {aulasConcluidas === 0 ? 'Start path' : aulasConcluidas >= trilha.aulas.length ? 'Review path' : 'Continue where you left off'}
          </button>
        </div>

        {/* Lesson list */}
        <h2 style={{ fontSize: 20, fontWeight: 700, color: colors.dark, marginBottom: 20 }}>Path content</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {trilha.aulas.map((aula, index) => {
            const aulaConcluida = progressos.some(p => p.aula_id === aula.id && p.concluida);
            const isProxima = index === proximaAulaIndex;

            return (
              <div
                key={aula.id}
                onClick={() => setLocation(`/academia/aula/${trilhaId}-aula-${index + 1}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: 20, background: '#fff', borderRadius: 14,
                  border: isProxima ? `2px solid ${colors.orange}` : '1px solid #eee',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateX(4px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateX(0)')}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: aulaConcluida ? colors.orange : isProxima ? `${colors.orange}15` : '#f5f5f5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {aulaConcluida
                    ? <Check size={22} color="white" />
                    : <span style={{ fontSize: 16, fontWeight: 700, color: isProxima ? colors.orange : '#999' }}>{index + 1}</span>
                  }
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: colors.dark, margin: 0 }}>{aula.titulo}</p>
                    {aulaConcluida && (
                      <span style={{ background: '#10B98120', color: '#10B981', padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>Done</span>
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: '#999', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {aula.descricao}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#999', fontSize: 13 }}>
                    <Clock size={14} /> {aula.duracao}
                  </div>
                  <ArrowRight size={18} color={isProxima ? colors.orange : '#ccc'} />
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}