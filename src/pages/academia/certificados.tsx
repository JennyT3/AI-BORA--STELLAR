import React, { useState, useEffect } from 'react';
import { Link, Redirect } from 'wouter';
import { Download, Award, Calendar, ChevronRight, FileText } from 'lucide-react';
import { useAcademiaAuth } from '../../hooks/useAcademiaAuth';
import { getCertificadosUser, AcademiaCertificado } from '../../services/academiaUserService';
import { AcademiaNavbar } from '../../components/AcademiaNavbar';
import { Footer } from '../../components/Footer';

const colors = { orange: '#ff6f2e', magenta: '#cb1a74', dark: '#1c1b1b', light: '#fcf9f8' };

export default function AcademiaCertificados() {
  const { user, isLoaded, isSignedIn, academiaUser, isLoading } = useAcademiaAuth();
  const [certificados, setCertificados] = useState<AcademiaCertificado[]>([]);

  useEffect(() => {
    async function load() {
      if (user) {
        const certs = await getCertificadosUser(user.id);
        setCertificados(certs);
      }
    }
    if (isLoaded && user) load();
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
  if (!academiaUser?.onboarding_completo) return <Redirect to="/academia/onboarding" />;

  const handleDownload = (cert: AcademiaCertificado) => {
    // En produção, isto geraria un PDF real
    alert(`Downloading certificado: ${cert.trilha_nome}\nCódigo: ${cert.codigo_verificacao}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: colors.light, fontFamily: 'Montserrat, sans-serif' }}>
      <AcademiaNavbar />

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px' }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: colors.dark, marginBottom: 8 }}>Os teus certificados</h1>
          <p style={{ color: '#666', fontSize: 16 }}>Guarda e partilha as tuas conquistas</p>
        </div>

        {certificados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 20, border: '1px solid #eee' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Award size={40} color="#ccc" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: colors.dark, marginBottom: 12 }}>Ainda não tens certificados</h2>
            <p style={{ color: '#666', marginBottom: 24 }}>Completa uma trilha para receber o teu certificado</p>
            <Link href="/academia/trilhas" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: colors.orange, color: '#fff', textDecoration: 'none', borderRadius: 12, fontWeight: 700 }}>
              Ver trilhas <ChevronRight size={18} />
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 20 }}>
            {certificados.map((cert, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.magenta} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Award size={32} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: colors.dark, marginBottom: 4 }}>{cert.trilha_nome}</h3>
                  <p style={{ fontSize: 13, color: '#999', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={14} /> Concluído em {new Date(cert.data_conclusao).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p style={{ fontSize: 11, color: '#ccc', marginTop: 4 }}>Código: {cert.codigo_verificacao}</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <Link href={`/academia/verificar/${cert.codigo_verificacao}`} style={{ padding: '12px 20px', background: '#f5f5f5', color: colors.dark, textDecoration: 'none', borderRadius: 10, fontWeight: 600, fontSize: 13 }}>Verificar</Link>
                  <button onClick={() => handleDownload(cert)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', background: colors.orange, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                    <Download size={16} /> PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sección pública de verificación */}
        <div style={{ marginTop: 60, padding: 32, background: '#fff', borderRadius: 20, border: '1px solid #eee', textAlign: 'center' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: colors.dark, marginBottom: 12 }}>Verificar um certificado</h2>
          <p style={{ color: '#666', marginBottom: 20 }}>Insere o código de verificação para confirmar a autenticidade</p>
          <div style={{ display: 'flex', gap: 12, maxWidth: 400, margin: '0 auto' }}>
            <input 
              type="text" 
              placeholder="Código (ex: ABCD-1234-EFGH)" 
              style={{ flex: 1, padding: '14px 16px', borderRadius: 10, border: '2px solid #ddd', fontSize: 14, fontFamily: 'Montserrat, sans-serif', outline: 'none' }}
            />
            <button style={{ padding: '14px 24px', background: colors.dark, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Verificar</button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}