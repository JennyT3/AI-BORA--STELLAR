import React, { useState, useEffect } from 'react';
import { Link, Redirect } from 'wouter';
import { useAcademiaAuth } from '../../hooks/useAcademiaAuth';
import { getProgressoTrilha, AcademiaProgresso } from '../../services/academiaUserService';
import { AcademiaNavbar } from '../../components/AcademiaNavbar';
import { Footer } from '../../components/Footer';
import { motion } from 'framer-motion';
import { Zap, Clock, BarChart, Play, CheckCircle } from 'lucide-react';

const colors = {
  orange: '#ff6f2e',
  magenta: '#cb1a74',
  dark: '#1c1b1b',
  light: '#fcf9f8',
  border: 'rgba(0,0,0,0.06)'
};

const trilhasMock = [
  {
    id: 'ia-negocios',
    nome: 'IA para Negócios Locais',
    descricao: 'Aprende a usar inteligência artificial para aumentar vendas e clientes no teu negócio.',
    icone: '🤖',
    total_aulas: 12,
    tempo_total: '3h 20min',
    nivel: 'Iniciante',
    cor: colors.orange,
  },
  {
    id: 'automacao',
    nome: 'Automação sem Código',
    descricao: 'Automatiza tarefas repetitivas com Zapier, Make e ferramentas sem programação.',
    icone: '⚡',
    total_aulas: 8,
    tempo_total: '2h 45min',
    nivel: 'Intermédio',
    cor: colors.magenta,
  },
  {
    id: 'comunicacao',
    nome: 'Comunicação Digital',
    descricao: 'Cria conteúdo, copy e campanhas que convertem para redes sociais.',
    icone: '📢',
    total_aulas: 10,
    tempo_total: '2h 10min',
    nivel: 'Iniciante',
    cor: '#10B981',
  },
  {
    id: 'produtividade',
    nome: 'Produtividade com IA',
    descricao: 'Organiza o teu dia, agenda e tarefas con assistentes virtuais.',
    icone: '⏱️',
    total_aulas: 6,
    tempo_total: '1h 30min',
    nivel: 'Iniciante',
    cor: '#3B82F6',
  },
];

export default function AcademiaTrilhas() {
  const { user, isLoaded, isSignedIn, academiaUser, isLoading } = useAcademiaAuth();
  const [trilhaProgressos, setTrilhaProgressos] = useState<Record<string, AcademiaProgresso[]>>({});
  const [filtro, setFiltro] = useState<'todas' | 'andamento' | 'concluidas'>('todas');

  useEffect(() => {
    async function loadProgressos() {
      if (!user) return;
      const progressosMap: Record<string, AcademiaProgresso[]> = {};
      for (const trilha of trilhasMock) {
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
    const total = trilhasMock.find(t => t.id === trilhaId)?.total_aulas || 1;
    if (concluidas === 0) return { status: 'nao_iniciada', percent: 0, concluidas: 0, total };
    if (concluidas >= total) return { status: 'concluida', percent: 100, concluidas: total, total };
    return { status: 'andamento', percent: Math.round((concluidas / total) * 100), concluidas, total };
  };

  const trilhasFiltradas = trilhasMock.filter(trilha => {
    const { status } = getTrilhaStatus(trilha.id);
    if (filtro === 'andamento') return status === 'andamento';
    if (filtro === 'concluidas') return status === 'concluida';
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', background: colors.light, fontFamily: 'Montserrat, sans-serif' }}>
      <AcademiaNavbar />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ marginBottom: 48, textAlign: 'center' }}>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: colors.dark, marginBottom: 16, letterSpacing: '-0.03em' }}
          >
            Trilhas de <span style={{ color: colors.orange }}>Aprendizagem</span>
          </motion.h1>
          <p style={{ color: '#666', fontSize: 18, maxWidth: 600, margin: '0 auto' }}>
            Domina as ferramentas do futuro com os nossos percursos guiados.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 48 }}>
          {(['todas', 'andamento', 'concluidas'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              style={{
                padding: '12px 24px', borderRadius: 100, border: 'none',
                background: filtro === f ? colors.dark : '#fff',
                color: filtro === f ? '#fff' : '#666',
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                transition: 'all 0.2s ease'
              }}
            >
              {f === 'todas' ? 'Todas' : f === 'andamento' ? 'Em Andamento' : 'Concluídas'}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 32 }}>
          {trilhasFiltradas.map((trilha, idx) => {
            const { status, percent, concluidas, total } = getTrilhaStatus(trilha.id);
            const isConcluida = status === 'concluida';
            
            return (
              <Link key={trilha.id} href={`/academia/trilha/${trilha.id}`}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
                  style={{
                    background: '#fff', borderRadius: 32, padding: 32,
                    border: `1px solid ${colors.border}`, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', height: '100%',
                    position: 'relative', overflow: 'hidden'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: 20,
                      background: `${trilha.cor}10`, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: 32,
                    }}>
                      {trilha.icone}
                    </div>
                    <div style={{
                      padding: '6px 14px', borderRadius: 100, fontSize: 11, fontWeight: 800,
                      background: isConcluida ? '#10B981' : status === 'andamento' ? `${colors.orange}15` : '#f5f5f5',
                      color: isConcluida ? '#fff' : status === 'andamento' ? colors.orange : '#999',
                      textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>
                      {status === 'concluida' ? 'Concluída' : status === 'andamento' ? 'Em Andamento' : 'Não Iniciada'}
                    </div>
                  </div>

                  <h3 style={{ fontSize: 22, fontWeight: 900, color: colors.dark, marginBottom: 12, letterSpacing: '-0.02em' }}>
                    {trilha.nome}
                  </h3>
                  <p style={{ color: '#666', fontSize: 15, lineHeight: 1.6, marginBottom: 24, flex: 1 }}>
                    {trilha.descricao}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#888', fontWeight: 600 }}>
                      <Play size={14} /> {trilha.total_aulas} aulas
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#888', fontWeight: 600 }}>
                      <Clock size={14} /> {trilha.tempo_total}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#888', fontWeight: 600 }}>
                      <BarChart size={14} /> {trilha.nivel}
                    </div>
                  </div>

                  {status !== 'nao_iniciada' && (
                    <div style={{ marginBottom: 24 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13, fontWeight: 700 }}>
                        <span style={{ color: '#999' }}>Progresso</span>
                        <span style={{ color: isConcluida ? '#10B981' : colors.orange }}>{percent}%</span>
                      </div>
                      <div style={{ height: 10, background: '#f0f0f0', borderRadius: 5, overflow: 'hidden' }}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          style={{ height: '100%', background: isConcluida ? '#10B981' : `linear-gradient(90deg, ${colors.orange}, ${colors.magenta})`, borderRadius: 5 }} 
                        />
                      </div>
                    </div>
                  )}

                  <button style={{
                    width: '100%', padding: '16px',
                    background: isConcluida ? '#f5f5f5' : colors.dark, 
                    color: isConcluida ? colors.dark : '#fff', 
                    border: 'none', borderRadius: 16, fontWeight: 800, fontSize: 15,
                    cursor: 'pointer', transition: 'all 0.2s ease',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                  }}>
                    {status === 'nao_iniciada' ? 'Começar Agora' : isConcluida ? 'Revisar Conteúdo' : 'Continuar Estudo'}
                    {!isConcluida && <Zap size={16} fill="white" />}
                  </button>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
