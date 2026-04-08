import React, { useState } from 'react';
import { Link, Redirect } from 'wouter';
import { useAcademiaAuth } from '../../hooks/useAcademiaAuth';
import { AcademiaNavbar } from '../../components/AcademiaNavbar';
import { Footer } from '../../components/Footer';
import { ChevronDown, Mail, MessageSquare, Users, Zap } from 'lucide-react';

const colors = { 
  orange: '#ff6f2e', 
  magenta: '#cb1a74', 
  dark: '#1c1b1b', 
  light: '#fcf9f8',
  border: 'rgba(0,0,0,0.06)'
};

export default function AcademiaConsultoria() {
  const { isLoaded, isSignedIn, academiaUser, isLoading } = useAcademiaAuth();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

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

  return (
    <div style={{ minHeight: '100vh', background: colors.light, fontFamily: 'Montserrat, sans-serif' }}>
      <AcademiaNavbar />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 32px' }}>
        
        {/* Hero Section */}
        <div style={{ marginBottom: 60, textAlign: 'center' }}>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: colors.dark, marginBottom: 16 }}>Centro de Consultoria</h1>
          <p style={{ fontSize: 18, color: '#666', maxWidth: 600, margin: '0 auto' }}>Suporte, formação e serviços premium para potenciar o teu negócio com IA</p>
        </div>

        {/* FAQ Académico */}
        <section style={{ marginBottom: 60, background: '#fff', padding: 40, borderRadius: 20, border: `1px solid ${colors.border}` }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: colors.dark, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
            <MessageSquare size={28} style={{ color: colors.orange }} />
            FAQ Académico
          </h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {[
              { pergunta: 'Como funciona a plataforma Bora Lá?', resposta: 'A plataforma oferece trilhas de aprendizagem estruturadas em vídeos curtos (10-20min), resumos, recursos e quizzes. Completa cada aula, passa no quiz e recebe certificados.' },
              { pergunta: 'Como recupero a minha senha?', resposta: 'Clica em "Esqueceu a senha?" na página de login. Receberás um email com instruções para resetar a tua senha em poucos minutos.' },
              { pergunta: 'Como contacto o suporte técnico?', resposta: 'Podes usar o formulário de reporte nesta página ou enviar um email para suporte@aibora.pt. Respondemos em até 24 horas.' },
              { pergunta: 'Posso descarregar os vídeos das aulas?', resposta: 'Os vídeos estão otimizados para streaming. Podes descarregar os recursos (PDFs, templates) associados a cada aula.' },
            ].map((item, i) => (
              <div key={i} style={{ border: `1px solid ${colors.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i.toString() ? null : i.toString())}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    background: expandedFaq === i.toString() ? `${colors.orange}10` : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: 15,
                    fontWeight: 600,
                    color: colors.dark,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {item.pergunta}
                  <ChevronDown size={20} style={{ transform: expandedFaq === i.toString() ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
                </button>
                {expandedFaq === i.toString() && (
                  <div style={{ padding: '16px 20px', background: `${colors.orange}05`, borderTop: `1px solid ${colors.border}`, color: '#666', fontSize: 14, lineHeight: 1.6 }}>
                    {item.resposta}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Quero ser Professor */}
        <section style={{ marginBottom: 60, background: `linear-gradient(135deg, ${colors.orange}15 0%, ${colors.magenta}15 100%)`, padding: 40, borderRadius: 20, border: `1px solid ${colors.border}` }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: colors.dark, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Users size={28} style={{ color: colors.magenta }} />
            Quero ser Professor
          </h2>
          <p style={{ color: '#666', marginBottom: 24, fontSize: 15 }}>Tens expertise em IA, automação ou comunicação? Junta-te à nossa equipa de professores e partilha o teu conhecimento.</p>
          <div style={{ background: '#fff', padding: 32, borderRadius: 16, border: `1px solid ${colors.border}` }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: colors.dark, marginBottom: 16 }}>Formulário de Candidatura</h3>
            <form style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: colors.dark, marginBottom: 8 }}>Nome Completo</label>
                <input type="text" placeholder="Ex: João Silva" style={{ width: '100%', padding: '12px 16px', border: `1px solid ${colors.border}`, borderRadius: 8, fontSize: 14, fontFamily: 'Montserrat, sans-serif' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: colors.dark, marginBottom: 8 }}>Email</label>
                <input type="email" placeholder="teu@email.com" style={{ width: '100%', padding: '12px 16px', border: `1px solid ${colors.border}`, borderRadius: 8, fontSize: 14, fontFamily: 'Montserrat, sans-serif' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: colors.dark, marginBottom: 8 }}>Área de Expertise</label>
                <select style={{ width: '100%', padding: '12px 16px', border: `1px solid ${colors.border}`, borderRadius: 8, fontSize: 14, fontFamily: 'Montserrat, sans-serif' }}>
                  <option>Seleciona uma opção</option>
                  <option>IA & Prompts</option>
                  <option>Automação</option>
                  <option>Comunicação Digital</option>
                  <option>Produtividade</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: colors.dark, marginBottom: 8 }}>Mensagem</label>
                <textarea placeholder="Conta-nos sobre a tua experiência..." style={{ width: '100%', padding: '12px 16px', border: `1px solid ${colors.border}`, borderRadius: 8, fontSize: 14, fontFamily: 'Montserrat, sans-serif', minHeight: 120, resize: 'vertical' }} />
              </div>
              <button type="submit" style={{ padding: '14px 24px', background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.magenta} 100%)`, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'transform 0.2s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Enviar Candidatura
              </button>
            </form>
          </div>
        </section>

        {/* Reporte de Bugs */}
        <section style={{ marginBottom: 60, background: '#fff', padding: 40, borderRadius: 20, border: `1px solid ${colors.border}` }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: colors.dark, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Zap size={28} style={{ color: '#e74c3c' }} />
            Encontraste um Erro?
          </h2>
          <p style={{ color: '#666', marginBottom: 24, fontSize: 15 }}>Ajuda-nos a melhorar reportando bugs ou problemas técnicos que encontres.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            <div style={{ padding: 24, background: `${colors.orange}10`, borderRadius: 12, textAlign: 'center' }}>
              <Mail size={32} style={{ color: colors.orange, margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: colors.dark, marginBottom: 8 }}>Email de Suporte</h3>
              <p style={{ color: '#666', fontSize: 14, marginBottom: 12 }}>Envia um email detalhado com o problema</p>
              <a href="mailto:suporte@aibora.pt" style={{ color: colors.orange, fontWeight: 700, textDecoration: 'none' }}>suporte@aibora.pt</a>
            </div>
            <div style={{ padding: 24, background: `${colors.magenta}10`, borderRadius: 12, textAlign: 'center' }}>
              <MessageSquare size={32} style={{ color: colors.magenta, margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: colors.dark, marginBottom: 8 }}>WhatsApp</h3>
              <p style={{ color: '#666', fontSize: 14, marginBottom: 12 }}>Chat rápido com o nosso suporte</p>
              <a href="https://wa.me/351XXXXXXXXX" target="_blank" rel="noopener noreferrer" style={{ color: colors.magenta, fontWeight: 700, textDecoration: 'none' }}>Abrir WhatsApp</a>
            </div>
          </div>
        </section>

        {/* Aulas Personalizadas */}
        <section style={{ marginBottom: 60 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: colors.dark, marginBottom: 32, textAlign: 'center' }}>Aulas Personalizadas (Serviço Premium)</h2>
          <div style={{ background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.magenta} 100%)`, padding: 40, borderRadius: 20, color: '#fff', textAlign: 'center' }}>
            <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>Consultoria 1-on-1</h3>
            <p style={{ fontSize: 16, marginBottom: 24, maxWidth: 500, margin: '0 auto 24px', lineHeight: 1.6 }}>Recebe orientação personalizada de um especialista em IA. Ideal para implementar estratégias no teu negócio.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
              <div>
                <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>€297</div>
                <div style={{ fontSize: 14, opacity: 0.9 }}>Sessão de 90min</div>
              </div>
              <div>
                <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>€797</div>
                <div style={{ fontSize: 14, opacity: 0.9 }}>Pack de 4 sessões</div>
              </div>
            </div>
            <Link href="/orcamento">
              <button style={{ padding: '16px 40px', background: '#fff', color: colors.orange, border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 16, cursor: 'pointer', transition: 'transform 0.2s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Solicitar Orçamento
              </button>
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
