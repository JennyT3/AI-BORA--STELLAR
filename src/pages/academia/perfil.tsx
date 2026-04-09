import React, { useState, useEffect } from 'react';
import { Link, Redirect, useLocation } from 'wouter';
import { useAcademiaAuth } from '../../hooks/useAcademiaAuth';
import { updateUsuario, getCertificadosUser, AcademiaCertificado } from '../../services/academiaUserService';
import { AcademiaNavbar } from '../../components/AcademiaNavbar';
import { Footer } from '../../components/Footer';
import { motion } from 'framer-motion';
import { User, Mail, Briefcase, Award, LogOut, Save, X, Camera, ShieldCheck } from 'lucide-react';

const colors = {
  orange: '#ff6f2e',
  magenta: '#cb1a74',
  dark: '#1c1b1b',
  light: '#fcf9f8',
  border: 'rgba(0,0,0,0.06)'
};

const TIPOS_NEGOCIO = [
  { value: 'ecommerce', label: 'E-commerce / Loja Online' },
  { value: 'servicos', label: 'Prestação de Serviços' },
  { value: 'consultoria', label: 'Consultoria' },
  { value: 'restaurante', label: 'Restaurante / Bar' },
  { value: 'salute', label: 'Saúde / Bem-estar' },
  { value: 'educacao', label: 'Educação' },
  { value: 'outro', label: 'Outro' },
];

export default function AcademiaPerfil() {
  const { user, isLoaded, isSignedIn, academiaUser, stats, isLoading, signOut, refetch } = useAcademiaAuth();
  const [, setLocation] = useLocation();
  const [certificados, setCertificados] = useState<AcademiaCertificado[]>([]);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    tipo_negocio: '',
  });
  const [mensagem, setMensagem] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    async function loadCertificados() {
      if (user) {
        const certs = await getCertificadosUser(user.id);
        setCertificados(certs);
      }
    }
    if (isLoaded && user) {
      loadCertificados();
    }
  }, [user, isLoaded]);

  useEffect(() => {
    if (academiaUser) {
      setFormData({
        nome: academiaUser.nome || '',
        tipo_negocio: academiaUser.tipo_negocio || '',
      });
    }
  }, [academiaUser]);

  if (!isLoaded || isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: colors.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: `3px solid ${colors.orange}`, borderTopColor: 'transparent', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#666', fontFamily: 'Montserrat, sans-serif' }}>A carregar perfil...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!isSignedIn) return <Redirect to="/academia/login" />;
  if (!academiaUser?.onboarding_completo) return <Redirect to="/academia/onboarding" />;

  const handleSalvar = async () => {
    if (!user) return;
    setSalvando(true);
    setMensagem(null);
    try {
      await updateUsuario(user.id, {
        nome: formData.nome,
        tipo_negocio: formData.tipo_negocio,
      });
      await refetch();
      setEditando(false);
      setMensagem({ text: 'Perfil atualizado com sucesso! ✨', type: 'success' });
      setTimeout(() => setMensagem(null), 4000);
    } catch (error) {
      setMensagem({ text: 'Erro ao guardar as alterações. Tenta novamente.', type: 'error' });
    } finally {
      setSalvando(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setLocation('/academia/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: colors.light, fontFamily: 'Montserrat, sans-serif' }}>
      <AcademiaNavbar />

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ marginBottom: 48 }}>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ fontSize: 36, fontWeight: 900, color: colors.dark, marginBottom: 12, letterSpacing: '-0.02em' }}
          >
            O Meu <span style={{ color: colors.orange }}>Perfil</span>
          </motion.h1>
          <p style={{ color: '#666', fontSize: 16 }}>
            Gere a tua conta e acompanha o teu progresso na Bora Lá Estudar.
          </p>
        </div>

        {mensagem && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '16px 24px', borderRadius: 16, marginBottom: 32,
              background: mensaje.type === 'success' ? '#d1fae5' : '#fee2e2',
              color: mensaje.type === 'success' ? '#065f46' : '#991b1b',
              fontSize: 14, fontWeight: 700, border: `1px solid ${mensaje.type === 'success' ? '#10b98130' : '#ef444430'}`,
              display: 'flex', alignItems: 'center', gap: 12
            }}
          >
            {mensaje.type === 'success' ? <ShieldCheck size={20} /> : <X size={20} />}
            {mensaje.text}
          </motion.div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 40 }} className="perfil-grid">
          
          {/* Main Info Card */}
          <div style={{ display: 'grid', gap: 32 }}>
            <section style={{ background: '#fff', borderRadius: 32, padding: 40, border: `1px solid ${colors.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      width: 100, height: 100, borderRadius: 32,
                      background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.magenta} 100%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden', boxShadow: '0 10px 25px rgba(255, 111, 46, 0.2)'
                    }}>
                      {user?.imageUrl ? (
                        <img src={user.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ color: '#fff', fontSize: 36, fontWeight: 900 }}>{user?.firstName?.[0] || 'U'}</span>
                      )}
                    </div>
                    <button style={{ position: 'absolute', bottom: -8, right: -8, width: 36, height: 36, borderRadius: 12, background: colors.dark, border: '4px solid #fff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <Camera size={16} />
                    </button>
                  </div>
                  <div>
                    <h2 style={{ fontSize: 24, fontWeight: 900, color: colors.dark, marginBottom: 4 }}>{academiaUser?.nome || 'Explorador'}</h2>
                    <p style={{ fontSize: 14, color: '#999', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Mail size={14} /> {user?.emailAddresses?.[0]?.emailAddress}
                    </p>
                  </div>
                </div>
                {!editando && (
                  <button 
                    onClick={() => setEditando(true)}
                    style={{ padding: '10px 20px', borderRadius: 12, border: '1px solid #eee', background: '#f9f9f9', color: colors.dark, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                  >
                    Editar Perfil
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gap: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#999', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nome Completo</label>
                    <div style={{ position: 'relative' }}>
                      <User size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: editando ? colors.orange : '#ccc' }} />
                      <input
                        type="text"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        disabled={!editando}
                        style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: 16, border: editando ? `2px solid ${colors.orange}` : '1px solid #eee', fontSize: 15, background: editando ? '#fff' : '#f9f9f9', color: colors.dark, fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#999', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tipo de Negócio</label>
                    <div style={{ position: 'relative' }}>
                      <Briefcase size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: editando ? colors.orange : '#ccc' }} />
                      <select
                        value={formData.tipo_negocio}
                        onChange={(e) => setFormData({ ...formData, tipo_negocio: e.target.value })}
                        disabled={!editando}
                        style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: 16, border: editando ? `2px solid ${colors.orange}` : '1px solid #eee', fontSize: 15, background: editando ? '#fff' : '#f9f9f9', color: colors.dark, fontWeight: 600, outline: 'none', cursor: editando ? 'pointer' : 'default', boxSizing: 'border-box', appearance: 'none' }}
                      >
                        <option value="">Seleciona...</option>
                        {TIPOS_NEGOCIO.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {editando && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', gap: 12, marginTop: 16 }}
                  >
                    <button
                      onClick={handleSalvar}
                      disabled={salvando}
                      style={{ flex: 1, padding: '16px', borderRadius: 16, border: 'none', background: colors.dark, color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                    >
                      {salvando ? 'A guardar...' : <><Save size={18} /> Guardar Alterações</>}
                    </button>
                    <button
                      onClick={() => { setEditando(false); setFormData({ nome: academiaUser?.nome || '', tipo_negocio: academiaUser?.tipo_negocio || '' }); }}
                      style={{ padding: '16px 24px', borderRadius: 16, border: '1px solid #eee', background: '#fff', color: '#666', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
                    >
                      Cancelar
                    </button>
                  </motion.div>
                )}
              </div>
            </section>

            {/* Account Security / Actions */}
            <section style={{ background: '#fff', borderRadius: 32, padding: 32, border: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: colors.dark, marginBottom: 4 }}>Sessão e Segurança</h3>
                <p style={{ fontSize: 14, color: '#999', margin: 0 }}>Termina a tua sessão de forma segura.</p>
              </div>
              <button 
                onClick={handleLogout}
                style={{ padding: '14px 28px', borderRadius: 16, border: 'none', background: '#fff5f5', color: '#e74c3c', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
              >
                <LogOut size={18} /> Sair da Conta
              </button>
            </section>
          </div>

          {/* Sidebar: Stats & Achievements */}
          <div style={{ display: 'grid', gap: 32, alignContent: 'start' }}>
            
            {/* Stats Card */}
            <div style={{ background: colors.dark, borderRadius: 32, padding: 32, color: '#fff' }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 24 }}>O Teu Progresso</h3>
              <div style={{ display: 'grid', gap: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.orange }}>
                    <Save size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 900 }}>{stats?.aulas_concluidas || 0}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase' }}>Aulas Concluídas</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.magenta }}>
                    <Award size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 900 }}>{certificados.length}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase' }}>Certificados</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Certificates */}
            <div style={{ background: '#fff', borderRadius: 32, padding: 32, border: `1px solid ${colors.border}` }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: colors.dark, marginBottom: 20 }}>Certificados Recentes</h3>
              {certificados.length > 0 ? (
                <div style={{ display: 'grid', gap: 16 }}>
                  {certificados.slice(0, 2).map((cert, i) => (
                    <Link key={i} href="/academia/certificados">
                      <div style={{ padding: '16px', borderRadius: 16, background: '#f9f9f9', border: '1px solid #eee', cursor: 'pointer' }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: colors.dark, marginBottom: 4 }}>{cert.trilha_nome}</div>
                        <div style={{ fontSize: 11, color: '#999', fontWeight: 600 }}>{new Date(cert.data_conclusao).toLocaleDateString()}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <p style={{ fontSize: 13, color: '#999', lineHeight: 1.5 }}>Ainda não tens certificados. Começa a estudar para os desbloquear!</p>
                </div>
              )}
              <Link href="/academia/certificados">
                <button style={{ width: '100%', marginTop: 20, padding: '12px', background: 'transparent', color: colors.orange, border: `2px solid ${colors.orange}`, borderRadius: 12, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
                  Ver Todos
                </button>
              </Link>
            </div>

          </div>
        </div>
      </main>

      <Footer />
      <style>{`
        @media (max-width: 900px) {
          .perfil-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
