import { User as UserIcon, Users as UsersIcon } from "lucide-react";
import React, { useEffect } from 'react';
import { Redirect, useLocation, Link } from 'wouter';
import { useAcademiaAuth } from '../../hooks/useAcademiaAuth';
import { AcademiaNavbar } from '../../components/AcademiaNavbar';
import { Footer } from '../../components/Footer';
import { 
  BookOpen, 
  Award, 
  Users, 
  TrendingUp, 
  PlayCircle, 
  ChevronRight,
  Clock,
  CheckCircle2,
  Zap,
  Star,
  MessageSquare
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
            animation: 'spin 1s linear infinite' 
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

  return (
    <div style={{ minHeight: '100vh', background: colors.light, fontFamily: 'Montserrat, sans-serif' }}>
      <AcademiaNavbar />
      
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 60px' }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: 48, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 900, color: colors.dark, marginBottom: 12, letterSpacing: '-0.03em' }}
            >
              Olá, {user?.firstName || 'Explorador'}! 👋
            </motion.h1>
            <p style={{ fontSize: 16, color: '#666', maxWidth: 500, lineHeight: 1.6 }}>
              Bem-vindo de volta à <span style={{ fontWeight: 800, color: colors.orange }}>Bora Lá Estudar</span>. 
              Pronto para dominar a IA hoje?
            </p>
          </div>
          
          <Link href="/academia/trilhas">
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(255, 111, 46, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              style={{ 
                padding: '16px 32px', 
                background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.magenta} 100%)`, 
                color: '#fff', 
                borderRadius: 16, 
                fontWeight: 800, 
                fontSize: 16, 
                border: 'none',
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12,
                boxShadow: '0 6px 15px rgba(255, 111, 46, 0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Zap size={20} fill="white" />
              EXPLORAR TRILHAS
              <ChevronRight size={20} />
              <motion.div 
                animate={{ x: ['-100%', '200%'] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                style={{
                  position: 'absolute', top: 0, left: 0, width: '50%', height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  transform: 'skewX(-20deg)'
                }}
              />
            </motion.button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: 20, 
          marginBottom: 48 
        }}>
          {statCards.map((card, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{ 
                background: '#fff', padding: 24, borderRadius: 24, 
                border: `1px solid ${colors.border}`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ 
                  width: 52, height: 52, borderRadius: 14, 
                  background: `${card.color}10`, color: card.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <card.icon size={26} />
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#999', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32 }} className="dashboard-grid">
          
          {/* Main Content: Recent Activity */}
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: colors.dark, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
              <PlayCircle size={24} color={colors.orange} /> Continuar a Aprender
            </h2>
            
            {progressos.length > 0 ? (
              <div style={{ display: 'grid', gap: 16 }}>
                {progressos.slice(0, 3).map((p, i) => (
                  <Link key={i} href={`/academia/aula/${p.aula_id}`}>
                    <motion.div 
                      whileHover={{ x: 8, background: '#fff' }}
                      style={{ 
                        background: 'rgba(255,255,255,0.6)', padding: 20, borderRadius: 20, 
                        border: `1px solid ${colors.border}`, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 20,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ 
                        width: 64, height: 64, borderRadius: 14, background: '#f5f5f5',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        <PlayCircle size={32} color={colors.orange} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 11, fontWeight: 800, color: colors.orange, margin: '0 0 4px', textTransform: 'uppercase' }}>
                          {p.trilha_nome || 'Trilha'}
                        </p>
                        <h4 style={{ fontSize: 17, fontWeight: 800, color: colors.dark, margin: 0 }}>
                          {p.aula_titulo || 'Aula'}
                        </h4>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: colors.dark, marginBottom: 6 }}>{p.percentagem}%</div>
                        <div style={{ width: 100, height: 8, background: '#eee', borderRadius: 4, overflow: 'hidden' }}>
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${p.percentagem}%` }}
                            style={{ height: '100%', background: `linear-gradient(90deg, ${colors.orange}, ${colors.magenta})` }} 
                          />
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ 
                background: '#fff', padding: 60, borderRadius: 32, 
                border: `2px dashed ${colors.border}`, textAlign: 'center' 
              }}>
                <div style={{ width: 80, height: 80, background: '#f9f9f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <BookOpen size={40} color="#ccc" />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: colors.dark, marginBottom: 12 }}>Ainda não começaste nenhuma trilha</h3>
                <p style={{ color: '#666', marginBottom: 32, maxWidth: 400, margin: '0 auto 32px', lineHeight: 1.6 }}>
                  Escolhe um tema e começa a tua jornada na IA hoje mesmo. O futuro não espera!
                </p>
                <Link href="/academia/trilhas">
                  <button style={{ 
                    padding: '14px 40px', background: colors.dark, color: '#fff', 
                    borderRadius: 14, fontWeight: 800, border: 'none', cursor: 'pointer',
                    fontSize: 15
                  }}>
                    Ver Catálogo de Trilhas
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar: Quick Actions & Collaboration */}
          <div style={{ display: 'grid', gap: 24 }}>
            
            {/* Quick Actions */}
            <div style={{ background: colors.dark, padding: 28, borderRadius: 32, color: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: 19, fontWeight: 900, marginBottom: 24, letterSpacing: '-0.02em' }}>Acesso Rápido</h3>
              <div style={{ display: 'grid', gap: 12 }}>
                {[
                  { label: 'Meu Perfil', href: '/academia/perfil', icon: UserIcon },
                  { label: 'Certificados', href: '/academia/certificados', icon: Award },
                  { label: 'Comunidade Slack', href: '/academia/comunidade', icon: UsersIcon },
                  { label: 'Consultoria IA', href: '/academia/consultoria', icon: MessageSquare },
                ].map((item, i) => (
                  <Link key={i} href={item.href}>
                    <motion.div 
                      whileHover={{ x: 5, background: 'rgba(255,255,255,0.1)' }}
                      style={{ 
                        padding: '14px 18px', borderRadius: 14, background: 'rgba(255,255,255,0.05)',
                        display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
                        fontSize: 14, fontWeight: 700, transition: 'all 0.2s ease'
                      }}
                    >
                      <item.icon size={18} color={colors.orange} /> <span>{item.label}</span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Collaboration Card */}
            <div style={{ 
              background: '#fff', padding: 28, borderRadius: 32, 
              border: `1px solid ${colors.border}`, position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ 
                  width: 44, height: 44, borderRadius: 12, background: `${colors.magenta}10`, 
                  color: colors.magenta, display: 'flex', alignItems: 'center', 
                  justifyContent: 'center', marginBottom: 20 
                }}>
                  <Star size={22} fill={colors.magenta} />
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 900, color: colors.dark, marginBottom: 12 }}>Queres ser Professor?</h3>
                <p style={{ fontSize: 14, color: '#666', marginBottom: 24, lineHeight: 1.6 }}>
                  Partilha o teu conhecimento com a nossa comunidade e ajuda a moldar o futuro da IA.
                </p>
                <Link href="/academia/consultoria">
                  <button style={{ 
                    width: '100%', padding: '14px', background: colors.dark, color: '#fff', 
                    borderRadius: 14, fontWeight: 800, border: 'none', cursor: 'pointer',
                    fontSize: 14
                  }}>
                    Candidatar-me 🚀
                  </button>
                </Link>
              </div>
            </div>

            {/* Support Card */}
            <div style={{ 
              background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.magenta} 100%)`, 
              padding: 28, borderRadius: 32, color: '#fff', position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h3 style={{ fontSize: 19, fontWeight: 900, marginBottom: 10 }}>Precisas de ajuda?</h3>
                <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 24, lineHeight: 1.6 }}>
                  A nossa equipa está disponível para te ajudar com qualquer dúvida técnica ou estratégica.
                </p>
                <Link href="/academia/consultoria">
                  <button style={{ 
                    width: '100%', padding: '14px', background: '#fff', color: colors.dark, 
                    borderRadius: 14, fontWeight: 800, border: 'none', cursor: 'pointer',
                    fontSize: 14
                  }}>
                    Agendar Consultoria
                  </button>
                </Link>
              </div>
              <div style={{ 
                position: 'absolute', right: -20, bottom: -20, opacity: 0.15 
              }}>
                <Users size={140} />
              </div>
            </div>

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
      `}</style>
    </div>
  );
}
