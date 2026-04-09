import React, { useState, useEffect } from 'react';
import { Link, Redirect } from 'wouter';
import { useAcademiaAuth } from '../../hooks/useAcademiaAuth';
import { getProgressoTrilha, AcademiaProgresso } from '../../services/academiaUserService';
import { AcademiaNavbar } from '../../components/AcademiaNavbar';
import { Footer } from '../../components/Footer';
import { TRILHAS_MOCK } from '../../data/trilhasMock'; // FIXED: DRY - import shared data
import { motion } from 'framer-motion';
import { Zap, Clock, BarChart, Play, CheckCircle, BookOpen } from 'lucide-react';

const colors = {
  orange: '#ff6f2e',
  magenta: '#cb1a74',
  dark: '#1c1b1b',
  light: '#fcf9f8',
  border: 'rgba(0,0,0,0.06)'
};

// FIXED: Removed local trilhasMock - now using TRILHAS_MOCK from shared file

export default function AcademiaTrilhas() {
  const { user, isLoaded, isSignedIn, academiaUser, isLoading } = useAcademiaAuth();
  const [trilhaProgressos, setTrilhaProgressos] = useState<Record<string, AcademiaProgresso[]>>({});
  const [filtro, setFiltro] = useState<'todas' | 'andamento' | 'concluidas'>('todas');

  useEffect(() => {
    async function loadProgressos() {
      if (!user) return;
      const progressosMap: Record<string, AcademiaProgresso[]> = {};
      for (const trilha of TRILHAS_MOCK) { // FIXED: Use TRILHAS_MOCK
        const progresso = await getProgressoTrilha(user.id, trilha.id);
        progressosMap[trilha.id] = progresso;
      }
      setTrilhaProgressos(progressosMap);
    }
    if (isLoaded && user) {
      loadProgressos();
    }
  }, [user, isLoaded]);

  if (!isLoaded || isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: colors.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: `3px solid ${colors.orange}`, borderTopColor: 'transparent', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#666', fontFamily: 'Montserrat, sans-serif' }}>A carregar trilhas...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!isSignedIn) return <Redirect to="/academia/login" />;
  if (!academiaUser?.onboarding_completo) return <Redirect to="/academia/onboarding" />;

  const getTrilhaStatus = (trilhaId: string) => {
    const progresses = trilhaProgressos[trilhaId] || [];
    const concluidas = progresses.filter(p => p.concluida).length;
    const total = TRILHAS_MOCK.find(t => t.id === trilhaId)?.total_aulas || 1; // FIXED: Use TRILHAS_MOCK
    if (concluidas === 0) return { status: 'nao_iniciada', percent: 0, concluidas: 0, total };
    if (concluidas >= total) return { status: 'concluida', percent: 100, concluidas: total, total };
    return { status: 'andamento', percent: Math.round((concluidas / total) * 100), concluidas, total };
  };

  const trilhasFiltradas = TRILHAS_MOCK.filter(trilha => { // FIXED: Use TRILHAS_MOCK
    const status = getTrilhaStatus(trilha.id);
    if (filtro === 'andamento') return status.status === 'andamento';
    if (filtro === 'concluidas') return status.status === 'concluida';
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', background: colors.light, fontFamily: 'Montserrat, sans-serif' }}>
      <AcademiaNavbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 42px)', fontWeight: 900, color: colors.dark, marginBottom: 16, letterSpacing: '-0.03em' }}>
            Trilhas de <span style={{ color: colors.orange }}>Aprendizagem</span>
          </h1>
          <p style={{ color: '#666', fontSize: 18 }}>Escolhe uma trilha e começa a aprender.</p>
        </motion.div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
          {(['todas', 'andamento', 'concluidas'] as const).map(f => (
            <button key={f} onClick={() => setFiltro(f)} style={{ padding: '10px 20px', borderRadius: 100, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, background: filtro === f ? colors.dark : '#f0f0f0', color: filtro === f ? '#fff' : '#666' }}>
              {f === 'todas' ? 'Todas' : f === 'andamento' ? 'Em Andamento' : 'Concluídas'}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {trilhasFiltradas.map((trilha, idx) => { // FIXED: Use TRILHAS_MOCK
            const status = getTrilhaStatus(trilha.id);
            return (
              <motion.div key={trilha.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                <Link href={`/academia/trilha/${trilha.id}`}>
                  <div style={{ background: '#fff', borderRadius: 24, padding: 28, border: `1px solid ${colors.border}`, boxShadow: '0 8px 30px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'transform 0.2s', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                      <div style={{ width: 56, height: 56, borderRadius: 16, background: `${trilha.cor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>{trilha.icone}</div>
                      {status.status === 'concluida' && <CheckCircle size={24} color={colors.orange} />}
                      {status.status === 'andamento' && <div style={{ width: 24, height: 24, borderRadius: '50%', background: colors.orange, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} /></div>}
                    </div>
                    <h3 style={{ fontSize: 20, fontWeight: 800, color: colors.dark, marginBottom: 8 }}>{trilha.nome}</h3>
                    <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 20, flex: 1 }}>{trilha.descricao}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: '#888', marginBottom: 20 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><BookOpen size={14} /> {trilha.total_aulas} aulas</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> {trilha.tempo_total}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 100, background: `${trilha.cor}15`, color: trilha.cor }}>{trilha.nivel}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 100, height: 6, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${status.percent}%`, height: '100%', background: status.status === 'concluida' ? colors.orange : '#f0f0f0', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#888' }}>{status.percent}%</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}