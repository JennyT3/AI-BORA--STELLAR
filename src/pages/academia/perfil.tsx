import React, { useState, useEffect } from 'react';
import { Link, Redirect, useLocation } from 'wouter';
import { useAcademiaAuth } from '../../hooks/useAcademiaAuth';
import { updateUsuario, getCertificadosUser, AcademiaCertificado } from '../../services/academiaUserService';
import { AcademiaNavbar } from '../../components/AcademiaNavbar';
import { Footer } from '../../components/Footer';

const colors = {
  orange: '#ff6f2e',
  magenta: '#cb1a74',
  dark: '#1c1b1b',
  light: '#fcf9f8'
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
  const [mensagem, setMensagem] = useState('');

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
          <p style={{ color: '#666', fontFamily: 'Montserrat, sans-serif' }}>A carregar...</p>
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
    setMensagem('');
    
    try {
      await updateUsuario(user.id, {
        nome: formData.nome,
        tipo_negocio: formData.tipo_negocio,
      });
      await refetch();
      setEditando(false);
      setMensagem('Perfil atualizado com sucesso!');
      setTimeout(() => setMensagem(''), 3000);
    } catch (error) {
      setMensagem('Erro ao guardar. Tenta novamente.');
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

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px' }}>
        {/* Título */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: colors.dark, marginBottom: 8 }}>
            O meu perfil
          </h1>
          <p style={{ color: '#666', fontSize: 16 }}>
            Gerencia os teus dados e vê o teu progresso
          </p>
        </div>

        {/* Mensagem de sucesso/erro */}
        {mensagem && (
          <div style={{
            padding: '14px 20px', borderRadius: 12, marginBottom: 24,
            background: mensagem.includes('sucesso') ? '#d1fae5' : '#fee',
            color: mensagem.includes('sucesso') ? '#065f46' : '#991b1b',
            fontSize: 14, fontWeight: 500,
          }}>
            {mensagem}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {/* Coluna esquerda: Dados pessoais */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, border: '1px solid #eee' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.dark, marginBottom: 24 }}>
              Dados Pessoais
            </h2>

            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: colors.orange, overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: '#fff', fontSize: 28, fontWeight: 700 }}>
                    {user?.firstName?.[0] || 'U'}
                  </span>
                )}
              </div>
              <div>
                <p style={{ fontSize: 20, fontWeight: 700, color: colors.dark, marginBottom: 4 }}>
                  {academiaUser?.nome || 'Usuário'}
                </p>
                <p style={{ fontSize: 13, color: '#999' }}>
                  {user?.emailAddresses?.[0]?.emailAddress}
                </p>
              </div>
            </div>

            {/* Form fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 8 }}>
                  Nome completo
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  disabled={!editando}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 10,
                    border: editando ? '2px solid #ddd' : '1px solid #eee',
                    fontSize: 14, background: editando ? '#fff' : '#f9f9f9',
                    fontFamily: 'Montserrat, sans-serif', color: colors.dark,
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 8 }}>
                  Email
                </label>
                <input
                  type="email"
                  value={user?.emailAddresses?.[0]?.emailAddress || ''}
                  disabled
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 10,
                    border: '1px solid #eee', fontSize: 14, background: '#f9f9f9',
                    fontFamily: 'Montserrat, sans-serif', color: '#999',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 8 }}>
                  Tipo de negócio
                </label>
                <select
                  value={formData.tipo_negocio}
                  onChange={(e) => setFormData({ ...formData, tipo_negocio: e.target.value })}
                  disabled={!editando}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 10,
                    border: editando ? '2px solid #ddd' : '1px solid #eee',
                    fontSize: 14, background: editando ? '#fff' : '#f9f9f9',
                    fontFamily: 'Montserrat, sans-serif', color: colors.dark,
                    cursor: editando ? 'pointer' : 'default', boxSizing: 'border-box',
                  }}
                >
                  <option value="">Seleciona...</option>
                  {TIPOS_NEGOCIO.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Botones */}
            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              {!editando ? (
                <button
                  onClick={() => setEditando(true)}
                  style={{
                    padding: '12px 24px', borderRadius: 10, border: 'none',
                    background: colors.orange, color: '#fff', fontWeight: 600,
                    fontSize: 14, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif',
                  }}
                >
                  Editar perfil
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSalvar}
                    disabled={salvando}
                    style={{
                      padding: '12px 24px', borderRadius: 10, border: 'none',
                      background: salvando ? '#ddd' : colors.orange, color: '#fff',
                      fontWeight: 600, fontSize: 14, cursor: salvando ? 'default' : 'pointer',
                      fontFamily: 'Montserrat, sans-serif',
                    }}
                  >
                    {salvando ? 'A guardar...' : 'Guardar'}
                  </button>
                  <button
                    onClick={() => { setEditando(false); setFormData({ nome: academiaUser?.nome || '', tipo_negocio: academiaUser?.tipo_negocio || '' }); }}
                    style={{
                      padding: '12px 24px', borderRadius: 10, border: '1px solid #ddd',
                      background: '#fff', color: '#666', fontWeight: 600,
                      fontSize: 14, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif',
                    }}
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Coluna direita: Estatísticas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Stats */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 28, border: '1px solid #eee' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.dark, marginBottom: 24 }}>
                As tuas estatísticas
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ textAlign: 'center', padding: 20, background: `${colors.orange}10`, borderRadius: 12 }}>
                  <p style={{ fontSize: 32, fontWeight: 800, color: colors.orange, marginBottom: 4 }}>
                    {stats?.aulas_concluidas || 0}
                  </p>
                  <p style={{ fontSize: 12, color: '#666' }}>Aulas concluídas</p>
                </div>
                <div style={{ textAlign: 'center', padding: 20, background: `${colors.magenta}10`, borderRadius: 12 }}>
                  <p style={{ fontSize: 32, fontWeight: 800, color: colors.magenta, marginBottom: 4 }}>
                    {stats?.trilhas_iniciadas || 0}
                  </p>
                  <p style={{ fontSize: 12, color: '#666' }}>Trilhas iniciadas</p>
                </div>
                <div style={{ textAlign: 'center', padding: 20, background: '#10B98115', borderRadius: 12 }}>
                  <p style={{ fontSize: 32, fontWeight: 800, color: '#10B981', marginBottom: 4 }}>
                    {stats?.certificados || 0}
                  </p>
                  <p style={{ fontSize: 12, color: '#666' }}>Certificados</p>
                </div>
                <div style={{ textAlign: 'center', padding: 20, background: '#3B82F615', borderRadius: 12 }}>
                  <p style={{ fontSize: 32, fontWeight: 800, color: '#3B82F6', marginBottom: 4 }}>
                    {stats?.percentual_geral || 0}%
                  </p>
                  <p style={{ fontSize: 12, color: '#666' }}>Progresso geral</p>
                </div>
              </div>
            </div>

            {/* Certificados recentes */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 28, border: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.dark }}>
                  Certificados
                </h2>
                <Link href="/academia/certificados" style={{ color: colors.orange, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                  Ver todos →
                </Link>
              </div>

              {certificados.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {certificados.slice(0, 3).map((cert, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: '#f9f9f9', borderRadius: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: colors.dark }}>{cert.trilha_nome}</p>
                        <p style={{ fontSize: 11, color: '#999' }}>
                          {new Date(cert.data_conclusao).toLocaleDateString('pt-PT')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#999', fontSize: 14, textAlign: 'center', padding: 20 }}>
                  Ainda não tens certificados. Completa uma trilha!
                </p>
              )}
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              style={{
                padding: '14px 24px', borderRadius: 12, border: '1px solid #fee',
                background: '#fff', color: '#ef4444', fontWeight: 600,
                fontSize: 14, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif',
                textAlign: 'center',
              }}
            >
              Sair da minha conta
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}