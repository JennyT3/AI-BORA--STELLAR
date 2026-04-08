import React, { useState, useEffect } from 'react';
import { Link, Redirect } from 'wouter';
import { useAcademiaAuth } from '../../hooks/useAcademiaAuth';
import { getProgressoTrilha, AcademiaProgresso } from '../../services/academiaUserService';
import { AcademiaNavbar } from '../../components/AcademiaNavbar';
import { Footer } from '../../components/Footer';

const colors = {
  orange: '#ff6f2e',
  magenta: '#cb1a74',
  dark: '#1c1b1b',
  light: '#fcf9f8'
};

// Dados mock das trilhas (em produção, viriam do Firebase)
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
    descricao: 'Organiza o teu dia, agenda e tarefas com assistentes virtuais.',
    icone: '⏱️',
    total_aulas: 6,
    tempo_total: '1h 30min',
    nivel: 'Iniciante',
    cor: '#3B82F6',
  },
];

export default function AcademiaTrilhas() {
  const { user, isLoaded, isSignedIn, academiaUser, progressos, isLoading } = useAcademiaAuth();
  const [trilhaProgressos, setTrilhaProgressos] = useState<Record<string, AcademiaProgresso[]>>({});
  const [filtro, setFiltro] = useState<'todas' | 'andamento' | 'concluidas'>('todas');

  // Carregar progresso de cada trilha
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
          <p style={{ color: '#666', fontFamily: 'Montserrat, sans-serif' }}>A carregar...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!isSignedIn) return <Redirect to="/academia/login" />;

  // Se não completou onboarding, redirecionar
  if (!academiaUser?.onboarding_completo) {
    return <Redirect to="/academia/onboarding" />;
  }

  // Calcular status de cada trilha
  const getTrilhaStatus = (trilhaId: string) => {
    const progresses = trilhaProgressos[trilhaId] || [];
    const concluidas = progresses.filter(p => p.concluida).length;
    const total = trilhasMock.find(t => t.id === trilhaId)?.total_aulas || 1;
    
    if (concluidas === 0) return { status: 'nao_iniciada', percent: 0, concluidas: 0, total };
    if (concluidas >= total) return { status: 'concluida', percent: 100, concluidas: total, total };
    return { status: 'andamento', percent: Math.round((concluidas / total) * 100), concluidas, total };
  };

  // Filtrar trilhas
  const trilhasFiltradas = trilhasMock.filter(trilha => {
    const { status } = getTrilhaStatus(trilha.id);
    if (filtro === 'andamento') return status === 'andamento';
    if (filtro === 'concluidas') return status === 'concluida';
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', background: colors.light, fontFamily: 'Montserrat, sans-serif' }}>
      <AcademiaNavbar />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 32px' }}>
        {/* Título */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: colors.dark, marginBottom: 8 }}>
            Trilhas de Aprendizagem
          </h1>
          <p style={{ color: '#666', fontSize: 16 }}>
            Escolhe uma trilha para começar ou continuar a tua formação
          </p>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
          {(['todas', 'andamento', 'concluidas'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              style={{
                padding: '10px 20px', borderRadius: 20, border: 'none',
                background: filtro === f ? colors.orange : '#fff',
                color: filtro === f ? '#fff' : '#666',
                fontWeight: 600, fontSize: 13, cursor: 'pointer',
                fontFamily: 'Montserrat, sans-serif',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              {f === 'todas' ? 'Todas' : f === 'andamento' ? 'Em Andamento' : 'Concluídas'}
            </button>
          ))}
        </div>

        {/* Grid de trilhas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {trilhasFiltradas.map((trilha) => {
            const { status, percent, concluidas, total } = getTrilhaStatus(trilha.id);
            
            return (
              <Link key={trilha.id} href={`/academia/trilha/${trilha.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: '#fff', borderRadius: 16, padding: 24,
                  border: '1px solid #eee', cursor: 'pointer',
                  transition: 'all 0.2s ease', height: '100%',
                  display: 'flex', flexDirection: 'column',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {/* Icone + Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: 14,
                      background: `${trilha.cor}15`, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: 28,
                    }}>
                      {trilha.icone}
                    </div>
                    <span style={{
                      padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: status === 'concluida' ? '#10B981' : status === 'andamento' ? `${colors.orange}15` : '#f5f5f5',
                      color: status === 'concluida' ? '#fff' : status === 'andamento' ? colors.orange : '#999',
                    }}>
                      {status === 'concluida' ? 'Concluída' : status === 'andamento' ? 'Em Andamento' : 'Não Iniciada'}
                    </span>
                  </div>

                  {/* Título + Descrição */}
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: colors.dark, marginBottom: 8 }}>
                    {trilha.nome}
                  </h3>
                  <p style={{ color: '#666', fontSize: 13, lineHeight: 1.5, marginBottom: 16, flex: 1 }}>
                    {trilha.descricao}
                  </p>

                  {/* Info */}
                  <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: 12, color: '#999' }}>
                    <span>{trilha.total_aulas} aulas</span>
                    <span>•</span>
                    <span>{trilha.tempo_total}</span>
                    <span>•</span>
                    <span>{trilha.nivel}</span>
                  </div>

                  {/* Progresso */}
                  {status !== 'nao_iniciada' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                        <span style={{ color: '#666' }}>Progresso</span>
                        <span style={{ color: colors.orange, fontWeight: 600 }}>{percent}%</span>
                      </div>
                      <div style={{ height: 6, background: '#eee', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${percent}%`, background: status === 'concluida' ? '#10B981' : colors.orange, borderRadius: 3 }} />
                      </div>
                    </div>
                  )}

                  {/* Botão CTA */}
                  <button style={{
                    width: '100%', marginTop: 20, padding: '14px',
                    background: colors.orange, color: '#fff', border: 'none',
                    borderRadius: 10, fontWeight: 700, fontSize: 14,
                    cursor: 'pointer', fontFamily: 'Montserrat, sans-serif',
                  }}>
                    {status === 'nao_iniciada' ? 'Começar' : status === 'concluida' ? 'Revisar' : 'Continuar'}
                  </button>
                </div>
              </Link>
            );
          })}
        </div>

        {trilhasFiltradas.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ color: '#999', fontSize: 16 }}>Nenhuma trilha encontrada com este filtro.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}