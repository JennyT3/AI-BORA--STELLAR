import React, { useState, useEffect } from 'react';
import { useRoute, Link, Redirect, useLocation } from 'wouter';
import { Play, Clock, Check, Lock, FileText, ArrowRight } from 'lucide-react';
import { useAcademiaAuth } from '../../hooks/useAcademiaAuth';
import { getProgressoTrilha, saveProgresso } from '../../services/academiaUserService';

const colors = {
  orange: '#ff6f2e',
  magenta: '#cb1a74',
  dark: '#1c1b1b',
  light: '#fcf9f8'
};

// Datos de las trilhas (en producción, virían del Firebase)
const trilhasData: Record<string, {
  nome: string;
  descricao: string;
  icone: string;
  nivel: string;
  tempo_total: string;
  aulas: { id: string; titulo: string; duracao: string; descricao: string }[];
}> = {
  'ia-negocios': {
    nome: 'IA para Negócios Locais',
    descricao: 'Aprende a usar inteligência artificial para aumentar vendas e clientes no teu negócio. Desde atendimento automatizado até criação de conteúdo, esta trilha cobre tudo.',
    icone: '🤖',
    nivel: 'Iniciante',
    tempo_total: '3h 20min',
    aulas: [
      { id: 'aula-1', titulo: 'Introdução à IA para Negócios', duracao: '12:30', descricao: 'Entende o básico de IA e como pode ajudar o teu negócio.' },
      { id: 'aula-2', titulo: 'ChatGPT para Atendimento', duracao: '18:45', descricao: 'Como usar ChatGPT para atender clientes automaticamente.' },
      { id: 'aula-3', titulo: 'Criação de Conteúdo com IA', duracao: '22:10', descricao: 'Gera textos, legendas e posts em segundos.' },
      { id: 'aula-4', titulo: 'Análise de Dados Simples', duracao: '15:20', descricao: 'Usa IA para analisar métricas do teu negócio.' },
      { id: 'aula-5', titulo: 'Automação de Redes Sociais', duracao: '25:00', descricao: 'Agenda posts automaticamente com IA.' },
      { id: 'aula-6', titulo: 'E-mail Marketing Inteligente', duracao: '20:15', descricao: 'Cria campanhas de email que convertem.' },
    ]
  },
  'automacao': {
    nome: 'Automação sem Código',
    descricao: 'Automatiza tarefas repetitivas com ferramentas sem programação. Zapier, Make e muito mais.',
    icone: '⚡',
    nivel: 'Intermédio',
    tempo_total: '2h 45min',
    aulas: [
      { id: 'aula-1', titulo: 'Introdução à Automação', duracao: '10:00', descricao: 'O que é automação e por que precisas dela.' },
      { id: 'aula-2', titulo: 'Primeiro Zap: Gmail + Spreadsheet', duracao: '28:30', descricao: 'Cria o teu primeiro fluxo automatizado.' },
      { id: 'aula-3', titulo: 'Webhooks e Integrações', duracao: '24:00', descricao: 'Liga diferentes apps entre si.' },
      { id: 'aula-4', titulo: 'Automatização de CRM', duracao: '18:20', descricao: 'Mantém o teu CRM atualizado automaticamente.' },
    ]
  },
  'comunicacao': {
    nome: 'Comunicação Digital',
    descricao: 'Cria conteúdo, copy e campanhas que convertem para redes sociais.',
    icone: '📢',
    nivel: 'Iniciante',
    tempo_total: '2h 10min',
    aulas: [
      { id: 'aula-1', titulo: 'Copywriting com IA', duracao: '15:00', descricao: 'Escreve textos que vendem usando inteligência artificial.' },
      { id: 'aula-2', titulo: 'Conteúdo para Instagram', duracao: '20:45', descricao: 'Cria posts e stories que engajam.' },
      { id: 'aula-3', titulo: 'Vídeos Curtos com IA', duracao: '25:30', descricao: 'Produz vídeos rápidos para redes sociais.' },
    ]
  },
  'produtividade': {
    nome: 'Produtividade com IA',
    descricao: 'Organiza o teu dia, agenda e tarefas com assistentes virtuais.',
    icone: '⏱️',
    nivel: 'Iniciante',
    tempo_total: '1h 30min',
    aulas: [
      { id: 'aula-1', titulo: 'Assistentes Pessoais de IA', duracao: '12:00', descricao: 'Como usar IA como teu assistente pessoal.' },
      { id: 'aula-2', titulo: 'Gestão de Tempo Inteligente', duracao: '16:30', descricao: 'Organiza tua agenda com sugestões de IA.' },
    ]
  }
};

export default function AcademiaTrilha() {
  const [match, params] = useRoute('/academia/trilha/:id');
  const { user, isLoaded, isSignedIn, academiaUser, isLoading } = useAcademiaAuth();
  const [, setLocation] = useLocation();
  
  const trilhaId = params?.id || '';
  const trilha = trilhasData[trilhaId];
  const [progressos, setProgressos] = useState<any[]>([]);
  const [salvando, setSalvando] = useState<string | null>(null);

  // Cargar progresso
  useEffect(() => {
    async function loadProgresso() {
      if (user && trilhaId) {
        const prog = await getProgressoTrilha(user.id, trilhaId);
        setProgressos(prog);
      }
    }
    if (isLoaded && user) {
      loadProgresso();
    }
  }, [user, trilhaId, isLoaded]);

  // Loading
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
  if (!trilha) {
    return (
      <div style={{ minHeight: '100vh', background: colors.light, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Montserrat, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: colors.dark, marginBottom: 16 }}>Trilha não encontrada</h1>
          <Link href="/academia/trilhas" style={{ color: colors.orange, fontWeight: 600 }}>Voltar às trilhas</Link>
        </div>
      </div>
    );
  }

  // Calcular estatísticas
  const aulasConcluidas = progressos.filter(p => p.concluida).length;
  const progressoPercent = Math.round((aulasConcluidas / trilha.aulas.length) * 100);
  
  // Encontrar próxima aula não concluída
  const proximaAulaIndex = trilha.aulas.findIndex(aula => !progressos.some(p => p.aula_id === aula.id && p.concluida));
  const primeiraAula = proximaAulaIndex >= 0 ? proximaAulaIndex : 0;

  // Iniciar/marcar primeira aula
  const handleIniciar = () => {
    setLocation(`/academia/aula/${trilhaId}-aula-${primeiraAula + 1}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: colors.light, fontFamily: 'Montserrat, sans-serif' }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '16px 32px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
            <Link href="/academia/trilhas" style={{ color: colors.orange, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>Trilhas</Link>
            <Link href="/academia/perfil" style={{ color: '#666', textDecoration: 'none', fontWeight: 500, fontSize: 14 }}>Perfil</Link>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px' }}>
        {/* Voltar */}
        <Link href="/academia/trilhas" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#666', textDecoration: 'none', fontSize: 14, marginBottom: 24 }}>
          ← Voltar a todas as trilhas
        </Link>

        {/* Info da trilha */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 32, marginBottom: 32, border: '1px solid #eee' }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            <div style={{ width: 80, height: 80, borderRadius: 20, background: `${colors.orange}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, flexShrink: 0 }}>
              {trilha.icone}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                <span style={{ background: colors.orange, color: '#fff', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                  {trilha.nivel}
                </span>
                <span style={{ background: '#f5f5f5', color: '#666', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                  {trilha.tempo_total}
                </span>
                <span style={{ background: '#f5f5f5', color: '#666', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                  {trilha.aulas.length} aulas
                </span>
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.dark, marginBottom: 12 }}>
                {trilha.nome}
              </h1>
              <p style={{ fontSize: 15, color: '#666', lineHeight: 1.6 }}>
                {trilha.descricao}
              </p>
            </div>
          </div>

          {/* Progresso */}
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #eee' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: colors.dark }}>Teu progresso</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: colors.orange }}>{progressoPercent}%</span>
            </div>
            <div style={{ height: 8, background: '#eee', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressoPercent}%`, background: colors.orange, borderRadius: 4 }} />
            </div>
            <p style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
              {aulasConcluidas} de {trilha.aulas.length} aulas concluídas
            </p>
          </div>

          {/* Botão de ação principal */}
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
            {aulasConcluidas === 0 ? 'Começar Trilha' : aulasConcluidas >= trilha.aulas.length ? 'Revisar Trilha' : 'Continuar de onde paraste'}
          </button>
        </div>

        {/* Lista de aulas */}
        <h2 style={{ fontSize: 20, fontWeight: 700, color: colors.dark, marginBottom: 20 }}>
          Conteúdo da Trilha
        </h2>

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
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
              >
                {/* Número / Check */}
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: aulaConcluida ? colors.orange : isProxima ? `${colors.orange}15` : '#f5f5f5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {aulaConcluida ? (
                    <Check size={22} color="white" />
                  ) : (
                    <span style={{ fontSize: 16, fontWeight: 700, color: isProxima ? colors.orange : '#999' }}>
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: colors.dark }}>
                      {aula.titulo}
                    </p>
                    {aulaConcluida && (
                      <span style={{ background: '#10B98120', color: '#10B981', padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>
                        Concluída
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: '#999', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {aula.descricao}
                  </p>
                </div>

                {/* Duração + seta */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#999', fontSize: 13 }}>
                    <Clock size={14} />
                    {aula.duracao}
                  </div>
                  <ArrowRight size={18} color={isProxima ? colors.orange : '#ccc'} />
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}