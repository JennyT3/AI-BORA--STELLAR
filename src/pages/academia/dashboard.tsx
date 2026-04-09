import { User as UserIcon, Users as UsersIcon } from "lucide-react";
import React, { useEffect } from 'react';
import { Redirect, useLocation, Link } from 'wouter';
import { useAcademiaAuth } from '../../hooks/useAcademiaAuth';
import { AcademiaNavbar } from '../../components/AcademiaNavbar';
import { Footer } from '../../components/Footer';
import {
  BookOpen,
  Award,
  TrendingUp,
  PlayCircle,
  ChevronRight,
  CheckCircle2,
  Zap,
  Star,
  MessageSquare,
  Flame,
  Lock,
  Trophy
} from 'lucide-react';
import { motion } from 'framer-motion';

const colors = {
  orange: '#ff6f2e',
  magenta: '#cb1a74',
  dark: '#1c1b1b',
  light: '#fcf9f8',
  surface: '#ffffff',
  border: 'rgba(0,0,0,0.06)'
};

export default function AcademiaDashboard() {
  const {
    user,
    isLoaded,
    isSignedIn,
    academiaUser,
    userLoading,
    stats,
    progressos
  } = useAcademiaAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoaded || userLoading) return;
    if (!isSignedIn) {
      setLocation('/academia/login');
      return;
    }
    if (isSignedIn && academiaUser && !academiaUser.onboarding_completo) {
      setLocation('/academia/onboarding');
    }
  }, [isLoaded, isSignedIn, academiaUser, userLoading, setLocation]);

  if (!isLoaded || userLoading) {
    return (
      <div style={{ minHeight: '100vh', background: colors.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            border: `3px solid ${colors.orange}`, borderTopColor: 'transparent',
            animation: 'spin 1s linear infinite', margin: '0 auto'
          }} />
          <p style={{ color: '#666', fontFamily: 'Montserrat, sans-serif', marginTop: 16 }}>A carregar o teu dashboard...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!isSignedIn) return <Redirect to="/academia/login" />;

  const statCards = [
    { label: 'Aulas Concluídas', value: stats?.aulas_concluidas || 0, icon: CheckCircle2, color: '#10B981' },
    { label: 'Trilhas Ativas', value: stats?.trilhas_iniciadas || 0, icon: BookOpen, color: colors.orange },
    { label: 'Certificados', value: stats?.certificados || 0, icon: Award, color: colors.magenta },
    { label: 'Progresso Geral', value: `${stats?.percentual_geral || 0}%`, icon: TrendingUp, color: '#3B82F6' },
  ];

  const firstName = user?.firstName || academiaUser?.nome?.split(' ')[0] || 'Explorador';
  const streakDias = academiaUser?.streak_dias || 0;
  const metaMinutos = academiaUser?.meta_minutos_dia || 60;
  const metaFeita = academiaUser?.minutos_hoje || 0;
  const metaPct = Math.min(100, Math.round((metaFeita / metaMinutos) * 100));

  // Primeira aula em progresso (para o banner "continuar")
  const emProgresso = progressos.find(p => p.percentagem > 0 && p.percentagem < 100);

  // Próximas aulas da trilha (mock se vazio)
  const proximasAulas = progressos.slice(0, 3);

  return (
    <div style={{ minHeight: '100vh', background: colors.light, fontFamily: 'Montserrat, sans-serif' }}>
      <AcademiaNavbar />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* ── Welcome Header ── */}
        <div style={{ marginBottom: 40, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 800, color: colors.magenta, letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              Menos teoria, mais ação
            </span>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: colors.dark, margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.1 }}
            >
              Bora aprender, <span style={{ color: colors.orange }}>{firstName}!</span>
            </motion.h1>
            <p style={{ fontSize: 16, color: '#666', maxWidth: 500, lineHeight: 1.6, margin: 0 }}>
              Faltam apenas <strong style={{ color: colors.dark }}>{Math.max(0, (stats?.total_aulas || 0) - (stats?.aulas_concluidas || 0))} aulas</strong> para completares a tua trilha atual.
            </p>
          </div>

          {/* Streak + Meta widget */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: '#fff', padding: '20px 28px', borderRadius: 24,
              border: `1px solid ${colors.border}`,
              boxShadow: '0 8px 24px rgba(166,59,0,0.06)',
              display: 'flex', alignItems: 'center', gap: 24
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: colors.orange, lineHeight: 1 }}>
                {String(streakDias).padStart(2, '0')}
              </div>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>
                Dias de fogo
              </div>
            </div>
            <div style={{ width: 1, height: 48, background: colors.border }} />
            <div style={{ minWidth: 140 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: colors.dark, marginBottom: 8 }}>Meta Diária</div>
              <div style={{ height: 8, background: '#f0eded', borderRadius: 4, overflow: 'hidden', marginBottom: 6 }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${metaPct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{ height: '100%', background: `linear-gradient(90deg, ${colors.orange}, ${colors.magenta})`, borderRadius: 4 }}
                />
              </div>
              <div style={{ fontSize: 11, color: '#999', fontWeight: 600 }}>{metaFeita}/{metaMinutos} min hoje</div>
            </div>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: `${colors.orange}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Flame size={20} color={colors.orange} />
            </div>
          </motion.div>
        </div>

        {/* ── Stats Grid ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 40
        }}>
          {statCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              style={{
                background: '#fff', padding: 22, borderRadius: 20,
                border: `1px solid ${colors.border}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: `${card.color}12`, color: card.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <card.icon size={24} />
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#aaa', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {card.label}
                  </p>
                  <h3 style={{ fontSize: 26, fontWeight: 900, color: colors.dark, margin: 0 }}>
                    {card.value}
                  </h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Banner: Continuar de onde parou ── */}
        {emProgresso && (
          <Link href={`/academia/aula/${emProgresso.aula_id}`}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              style={{
                background: `linear-gradient(135deg, ${colors.dark} 0%, #2d2c2c 100%)`,
                borderRadius: 28, padding: '36px 40px', marginBottom: 40,
                display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 32,
                cursor: 'pointer', overflow: 'hidden', position: 'relative',
                boxShadow: '0 12px 32px rgba(28,27,27,0.15)'
              }}
            >
              {/* glow */}
              <div style={{
                position: 'absolute', top: -60, right: -60, width: 220, height: 220,
                borderRadius: '50%', background: `${colors.orange}20`, pointerEvents: 'none'
              }} />
              <div style={{ flex: 1, minWidth: 200, position: 'relative', zIndex: 1 }}>
                <span style={{
                  display: 'inline-block', background: `${colors.orange}25`, color: colors.orange,
                  fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
                  padding: '5px 14px', borderRadius: 100, marginBottom: 16
                }}>
                  Continuar de onde parou
                </span>
                <h2 style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 900, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                  {emProgresso.aula_titulo || 'Continuar Aula'}
                </h2>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: '0 0 24px', fontWeight: 500 }}>
                  {emProgresso.trilha_nome || 'Trilha'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                  <div style={{ flex: 1, maxWidth: 240, height: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 5, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${emProgresso.percentagem}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      style={{ height: '100%', background: '#fff', borderRadius: 5 }}
                    />
                  </div>
                  <span style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>{emProgresso.percentagem}%</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    background: '#fff', color: colors.dark,
                    border: 'none', borderRadius: 14, padding: '14px 28px',
                    fontWeight: 800, fontSize: 14, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 10,
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                >
                  <PlayCircle size={18} color={colors.orange} />
                  BORA COMEÇAR
                </motion.button>
              </div>
            </motion.div>
          </Link>
        )}

        {/* ── Main Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32 }} className="dashboard-grid">

          {/* Left: Meus Cursos */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: colors.dark, margin: 0 }}>
                Continuar a Aprender
              </h2>
              <Link href="/academia/trilhas">
                <span style={{ fontSize: 13, fontWeight: 700, color: colors.orange, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  Ver todos <ChevronRight size={14} />
                </span>
              </Link>
            </div>

            {progressos.length > 0 ? (
              <div style={{ display: 'grid', gap: 16 }}>
                {progressos.slice(0, 4).map((p, i) => (
                  <Link key={i} href={`/academia/aula/${p.aula_id}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      whileHover={{ y: -2, boxShadow: '0 10px 28px rgba(0,0,0,0.07)' }}
                      style={{
                        background: '#fff', borderRadius: 20,
                        border: `1px solid ${colors.border}`,
                        cursor: 'pointer', overflow: 'hidden',
                        display: 'flex', alignItems: 'center', gap: 0,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {/* thumbnail placeholder */}
                      <div style={{
                        width: 96, height: 88, flexShrink: 0,
                        background: `linear-gradient(135deg, ${colors.orange}20, ${colors.magenta}20)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <PlayCircle size={32} color={colors.orange} />
                      </div>
                      <div style={{ flex: 1, padding: '18px 20px' }}>
                        <p style={{ fontSize: 10, fontWeight: 800, color: colors.orange, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {p.trilha_nome || 'Trilha'}
                        </p>
                        <h4 style={{ fontSize: 15, fontWeight: 800, color: colors.dark, margin: '0 0 12px' }}>
                          {p.aula_titulo || 'Aula'}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ flex: 1, height: 6, background: '#f0eded', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${p.percentagem}%`, height: '100%', background: `linear-gradient(90deg, ${colors.orange}, ${colors.magenta})` }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 800, color: colors.dark, whiteSpace: 'nowrap' }}>{p.percentagem}%</span>
                        </div>
                      </div>
                      {p.percentagem === 100 && (
                        <div style={{ padding: '0 20px' }}>
                          <CheckCircle2 size={22} color="#10B981" />
                        </div>
                      )}
                    </motion.div>
                  </Link>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  background: '#fff', padding: 60, borderRadius: 28,
                  border: `2px dashed rgba(0,0,0,0.08)`, textAlign: 'center'
                }}
              >
                <div style={{ width: 80, height: 80, background: '#f9f9f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <BookOpen size={36} color="#ddd" />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: colors.dark, marginBottom: 12 }}>Ainda não começaste nenhuma trilha</h3>
                <p style={{ color: '#999', marginBottom: 32, maxWidth: 360, margin: '0 auto 32px', lineHeight: 1.6, fontSize: 15 }}>
                  Escolhe um tema e começa a tua jornada na IA hoje mesmo.
                </p>
                <Link href="/academia/trilhas">
                  <button style={{
                    padding: '14px 40px', background: colors.dark, color: '#fff',
                    borderRadius: 14, fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: 15,
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    Ver Catálogo de Trilhas
                  </button>
                </Link>
              </motion.div>
            )}

            {/* Explorar novos cursos */}
            <Link href="/academia/trilhas">
              <motion.div
                whileHover={{ background: '#f9f9f9' }}
                style={{
                  marginTop: 16, border: `2px dashed rgba(0,0,0,0.08)`, borderRadius: 20,
                  padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 12, cursor: 'pointer', transition: 'background 0.2s'
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: `${colors.orange}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Zap size={18} color={colors.orange} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#888' }}>Explorar novas trilhas</span>
              </motion.div>
            </Link>
          </div>

          {/* Right Sidebar */}
          <div style={{ display: 'grid', gap: 20, alignContent: 'start' }}>

            {/* Trilha progress sidebar */}
            <div style={{ background: '#fff', padding: 28, borderRadius: 24, border: `1px solid ${colors.border}` }}>
              <h3 style={{ fontSize: 17, fontWeight: 900, color: colors.dark, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                <TrendingUp size={18} color={colors.magenta} /> Sua Trilha
              </h3>
              <div style={{ position: 'relative' }}>
                {/* vertical line */}
                <div style={{ position: 'absolute', left: 11, top: 16, bottom: 16, width: 1, background: colors.border }} />

                {/* step atual */}
                <div style={{ position: 'relative', paddingLeft: 40, paddingBottom: 28 }}>
                  <div style={{
                    position: 'absolute', left: 0, top: 4, width: 24, height: 24, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${colors.orange}, ${colors.magenta})`,
                    border: '3px solid #fff', boxShadow: '0 2px 8px rgba(255,111,46,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />
                  </div>
                  <div style={{ background: `${colors.orange}08`, padding: '14px 16px', borderRadius: 16, borderLeft: `3px solid ${colors.orange}` }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: colors.orange, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Atual</span>
                    <h5 style={{ fontSize: 14, fontWeight: 800, color: colors.dark, margin: '4px 0 2px' }}>
                      {emProgresso?.trilha_nome || 'IA Generativa para Criativos'}
                    </h5>
                    <p style={{ fontSize: 12, color: '#999', margin: 0 }}>
                      {emProgresso ? `${emProgresso.percentagem}% completo` : 'Começa quando quiseres'}
                    </p>
                  </div>
                </div>

                {/* próximo */}
                <div style={{ position: 'relative', paddingLeft: 40, paddingBottom: 28 }}>
                  <div style={{
                    position: 'absolute', left: 0, top: 4, width: 24, height: 24, borderRadius: '50%',
                    background: '#f0eded', border: '3px solid #fff'
                  }} />
                  <div style={{ padding: '10px 0' }}>
                    <h5 style={{ fontSize: 13, fontWeight: 700, color: '#aaa', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Lock size={12} /> Workshop: Lançamentos de Alto Impacto
                    </h5>
                    <p style={{ fontSize: 11, color: '#bbb', margin: 0 }}>Bloqueado até completar módulo anterior</p>
                  </div>
                </div>

                {/* recompensa */}
                <div style={{ position: 'relative', paddingLeft: 40 }}>
                  <div style={{
                    position: 'absolute', left: 0, top: 4, width: 24, height: 24, borderRadius: '50%',
                    background: '#f0eded', border: '3px solid #fff'
                  }} />
                  <div style={{ padding: '10px 0' }}>
                    <h5 style={{ fontSize: 13, fontWeight: 700, color: '#aaa', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Trophy size={12} /> Projeto Final + Certificado
                    </h5>
                    <p style={{ fontSize: 11, color: '#bbb', margin: 0 }}>Mentoria individual inclusa</p>
                  </div>
                </div>
              </div>

              {/* reward */}
              <div style={{
                marginTop: 16, background: `${colors.magenta}08`, borderRadius: 16,
                padding: '16px 18px', border: `1px solid ${colors.magenta}15`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Award size={16} color={colors.magenta} />
                  <span style={{ fontSize: 11, fontWeight: 800, color: colors.magenta, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Recompensa</span>
                </div>
                <p style={{ fontSize: 12, color: '#666', lineHeight: 1.6, margin: 0 }}>
                  Complete a trilha esta semana para desbloquear o <strong style={{ color: colors.dark }}>Pack de Prompts Exclusivos</strong>.
                </p>
              </div>
            </div>

            {/* Acesso Rápido */}
            <div style={{ background: colors.dark, padding: 24, borderRadius: 24, color: '#fff' }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, marginBottom: 18, letterSpacing: '-0.02em' }}>Acesso Rápido</h3>
              <div style={{ display: 'grid', gap: 10 }}>
                {[
                  { label: 'Meu Perfil', href: '/academia/perfil', icon: UserIcon },
                  { label: 'Certificados', href: '/academia/certificados', icon: Award },
                  { label: 'Comunidade', href: '/academia/comunidade', icon: UsersIcon },
                  { label: 'Consultoria IA', href: '/academia/consultoria', icon: MessageSquare },
                ].map((item, i) => (
                  <Link key={i} href={item.href}>
                    <motion.div
                      whileHover={{ x: 4, background: 'rgba(255,255,255,0.1)' }}
                      style={{
                        padding: '12px 16px', borderRadius: 12,
                        background: 'rgba(255,255,255,0.05)',
                        display: 'flex', alignItems: 'center', gap: 12,
                        cursor: 'pointer', fontSize: 14, fontWeight: 700,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <item.icon size={16} color={colors.orange} />
                      <span>{item.label}</span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>

            {/* CTA Explorar */}
            <Link href="/academia/trilhas">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.magenta} 100%)`,
                  padding: 24, borderRadius: 24, color: '#fff', cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(255,111,46,0.25)'
                }}
              >
                <h3 style={{ fontSize: 17, fontWeight: 900, marginBottom: 8 }}>Explorar Trilhas</h3>
                <p style={{ fontSize: 13, opacity: 0.85, marginBottom: 20, lineHeight: 1.5, margin: '0 0 20px' }}>
                  Descobre novos conteúdos e avança na tua carreira com IA.
                </p>
                <button style={{
                  width: '100%', padding: '12px', background: '#fff', color: colors.dark,
                  borderRadius: 12, fontWeight: 800, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontFamily: 'Montserrat, sans-serif',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}>
                  <Zap size={14} color={colors.orange} /> Ver Catálogo
                </button>
              </motion.div>
            </Link>

          </div>
        </div>

      </main>

      <Footer />

      <style>{`
        @media (max-width: 900px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}