import React, { useState, useEffect } from 'react';
import { Link, Redirect } from 'wouter';
import { Download, Award, Calendar, ChevronRight, Search, ShieldCheck, ExternalLink, Zap, Mail, Share2 } from 'lucide-react';
import { useAcademiaAuth } from '../../hooks/useAcademiaAuth';
import { getCertificadosUser, AcademiaCertificado } from '../../services/academiaUserService';
import { AcademiaNavbar } from '../../components/AcademiaNavbar';
import { Footer } from '../../components/Footer';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';

const colors = { 
  orange: '#ff6f2e', 
  magenta: '#cb1a74', 
  dark: '#1c1b1b', 
  light: '#fcf9f8',
  border: 'rgba(0,0,0,0.06)'
};

export default function AcademiaCertificados() {
  const { user, isLoaded, isSignedIn, academiaUser, isLoading } = useAcademiaAuth();
  const [certificados, setCertificados] = useState<AcademiaCertificado[]>([]);
  const [verifyCode, setVerifyCode] = useState('');

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
          <p style={{ color: '#666', fontFamily: 'Montserrat, sans-serif' }}>Loading certificates…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!isSignedIn) return <Redirect to="/academia/login" />;
  if (!academiaUser?.onboarding_completo) return <Redirect to="/academia/onboarding" />;

  const handleDownload = (cert: AcademiaCertificado) => {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    const width = 297;
    const height = 210;
    
    pdf.setFillColor(250, 250, 250);
    pdf.rect(0, 0, width, height, 'F');
    
    pdf.setDrawColor(255, 111, 46);
    pdf.setLineWidth(1.5);
    pdf.rect(15, 15, width - 30, height - 30);
    
    pdf.setDrawColor(203, 26, 116);
    pdf.setLineWidth(0.5);
    pdf.rect(20, 20, width - 40, height - 40);
    
    pdf.setFontSize(32);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(28, 27, 27);
    pdf.text('CERTIFICADO', width / 2, 50, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text('This certifies that', width / 2, 70, { align: 'center' });
    
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(28, 27, 27);
    const nome = academiaUser?.nome || 'Learner';
    pdf.text(nome, width / 2, 90, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text('successfully completed the learning path', width / 2, 110, { align: 'center' });
    
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 111, 46);
    pdf.text(cert.trilha_nome, width / 2, 130, { align: 'center' });
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(150, 150, 150);
    const data = new Date(cert.data_conclusao).toLocaleDateString('en-GB', { 
      day: 'numeric', month: 'long', year: 'numeric' 
    });
    pdf.text(`Issued on ${data}`, width / 2, 155, { align: 'center' });
    
    pdf.setFontSize(8);
    pdf.setTextColor(180, 180, 180);
    pdf.text(`Verification code: ${cert.codigo_verificacao}`, width / 2, 180, { align: 'center' });
    
    pdf.save(`certificate-${cert.trilha_nome.replace(/\s+/g, '-')}.pdf`);
  };

  const handleEnviarEmail = async (cert: AcademiaCertificado) => {
    if (!academiaUser?.email) {
      alert('No email address on your profile.');
      return;
    }
    
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: academiaUser.email,
          templateId: 'certificado-emitido',
          templateData: {
            nomeEstudante: academiaUser.nome,
            nomeTrilha: cert.trilha_nome,
            dataConclusao: new Date(cert.data_conclusao).toLocaleDateString('en-GB'),
            codigoVerificacao: cert.codigo_verificacao,
            linkVerificacao: `https://aibora.pt/academia/verificar/${cert.codigo_verificacao}`
          }
        })
      });
      
      if (response.ok) {
        alert('Certificate sent to your email.');
      } else {
        alert('Could not send email. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Could not send email. Please try again.');
    }
  };

  const handleShareLinkedIn = (cert: AcademiaCertificado) => {
    const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(cert.trilha_nome)}&organizationName=AI%20BORA%20Academy&issueYear=${new Date(cert.data_conclusao).getFullYear()}&issueMonth=${new Date(cert.data_conclusao).getMonth() + 1}&certUrl=${encodeURIComponent(`https://aibora.pt/academia/verificar/${cert.codigo_verificacao}`)}&certId=${encodeURIComponent(cert.codigo_verificacao)}`;
    window.open(linkedInUrl, '_blank');
  };

  return (
    <div style={{ minHeight: '100vh', background: colors.light, fontFamily: 'Montserrat, sans-serif' }}>
      <AcademiaNavbar />

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ marginBottom: 48, textAlign: 'center' }}>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: 'clamp(32px, 5vw, 42px)', fontWeight: 900, color: colors.dark, marginBottom: 16, letterSpacing: '-0.03em' }}
          >
            Your <span style={{ color: colors.magenta }}>achievements</span>
          </motion.h1>
          <p style={{ color: '#666', fontSize: 18, maxWidth: 600, margin: '0 auto' }}>
            Official Bora Lá certificates. Prove your skills in the market.
          </p>
        </div>

        {certificados.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center', padding: '80px 40px', background: '#fff', borderRadius: 32, border: `1px solid ${colors.border}`, boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}
          >
            <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
              <Award size={48} color="#ccc" />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: colors.dark, marginBottom: 16 }}>No certificates yet</h2>
            <p style={{ color: '#666', marginBottom: 32, maxWidth: 400, margin: '0 auto 32px', lineHeight: 1.6 }}>
              Complete a learning path to unlock your first official certificate.
            </p>
            <Link href="/academia/trilhas">
              <button style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 36px', background: colors.dark, color: '#fff', border: 'none', borderRadius: 16, fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
                Browse paths <Zap size={18} fill="white" />
              </button>
            </Link>
          </motion.div>
        ) : (
          <div style={{ display: 'grid', gap: 24 }}>
            {certificados.map((cert, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{ background: '#fff', borderRadius: 24, padding: 32, border: `1px solid ${colors.border}`, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}
              >
                <div style={{ width: 80, height: 80, borderRadius: 20, background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.magenta} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 8px 20px rgba(255, 111, 46, 0.2)' }}>
                  <Award size={40} color="white" />
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 900, color: colors.dark, marginBottom: 8, letterSpacing: '-0.01em' }}>{cert.trilha_nome}</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
                    <p style={{ fontSize: 13, color: '#888', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                      <Calendar size={14} /> {new Date(cert.data_conclusao).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p style={{ fontSize: 12, color: colors.magenta, fontWeight: 700, background: `${colors.magenta}10`, padding: '4px 10px', borderRadius: 6, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ShieldCheck size={14} /> Verified
                    </p>
                  </div>
                  <p style={{ fontSize: 11, color: '#bbb', marginTop: 12, fontFamily: 'monospace', letterSpacing: '0.05em' }}>ID: {cert.codigo_verificacao}</p>
                </div>
                <div style={{ display: 'flex', gap: 12, width: '100%', flexWrap: 'wrap' }}>
                  <Link href={`/academia/verificar/${cert.codigo_verificacao}`}>
                    <button style={{ padding: '12px 20px', background: '#f9f9f9', color: colors.dark, border: '1px solid #eee', borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ExternalLink size={14} /> Validate
                    </button>
                  </Link>
                  <button onClick={() => handleDownload(cert)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', background: colors.dark, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                    <Download size={14} /> Download PDF
                  </button>
                  <button onClick={() => handleEnviarEmail(cert)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', background: 'transparent', color: colors.orange, border: `1px solid ${colors.orange}`, borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                    <Mail size={14} /> Email me
                  </button>
                  <button onClick={() => handleShareLinkedIn(cert)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', background: '#0077b5', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                    <Share2 size={14} /> LinkedIn
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Public Verification Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginTop: 80, padding: 48, background: colors.dark, borderRadius: 32, color: '#fff', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 12, letterSpacing: '-0.02em' }}>Verify authenticity</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
              Anyone can validate a Bora Lá certificate using its unique code.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, maxWidth: 500, margin: '0 auto', justifyContent: 'center' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
                <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                <input 
                  type="text" 
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  placeholder="Verification code" 
                  style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: 16, border: 'none', fontSize: 15, fontFamily: 'Montserrat, sans-serif', outline: 'none', background: '#fff', color: colors.dark, boxSizing: 'border-box' }}
                />
              </div>
              <Link href={`/academia/verificar/${verifyCode}`}>
                <button disabled={!verifyCode} style={{ padding: '16px 32px', background: colors.orange, color: '#fff', border: 'none', borderRadius: 16, fontWeight: 800, fontSize: 15, cursor: verifyCode ? 'pointer' : 'not-allowed', opacity: verifyCode ? 1 : 0.5 }}>
                  Verify now
                </button>
              </Link>
            </div>
          </div>
          <div style={{ position: 'absolute', left: -40, bottom: -40, opacity: 0.05 }}>
            <Award size={200} />
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
