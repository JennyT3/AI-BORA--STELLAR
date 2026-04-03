import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { getProposal, isProposalValid } from "../services/firebase";
import { WHATSAPP_LINK, EMAIL } from "../lib/constants";

export function PropostaPage() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [proposal, setProposal] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProposal() {
      try {
        const id = params.id;
        
        if (!id) {
          setError("Proposta não encontrada");
          setLoading(false);
          return;
        }

        const data = await getProposal(id);
        
        if (!data) {
          setError("Proposta não encontrada");
        } else if (!isProposalValid(data)) {
          setError("Esta proposta expirou (válida por 10 dias)");
        } else {
          setProposal(data);
        }
      } catch (err: any) {
        setError("Erro ao carregar proposta: " + err.message);
      }
      setLoading(false);
    }

    loadProposal();
  }, [params.id]);

  // Dynamic title
  useEffect(() => {
    if (proposal?.cliente) {
      document.title = `Proposta para ${proposal.cliente} — AI BORA`;
    }
  }, [proposal]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #333', borderTop: '3px solid #F25C05', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ fontFamily: 'Montserrat, sans-serif', color: '#888', fontSize: 14 }}>Carregando proposta...</p>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>😕</div>
          <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: 24, color: '#ffffff', marginBottom: 12 }}>
            {error}
          </h1>
          <p style={{ fontFamily: 'Montserrat, sans-serif', color: '#888', marginBottom: 24 }}>
            A proposta pode ter expirado ou não existe.
          </p>
          <button 
            onClick={() => setLocation('/')}
            style={{ fontFamily: 'Montserrat, sans-serif', backgroundColor: '#F22283', color: '#fff', padding: '14px 32px', borderRadius: 100, border: 'none', fontWeight: 700, cursor: 'pointer' }}
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  // Calculate correct values - use valor - desconto as total, then calculate por marca
  const numMarcas = proposal.marcas || 1;
  const valorTotal = (proposal.valor || 0) - (proposal.desconto || 0);
  const subtotal = valorTotal / 1.23;
  const iva = valorTotal - subtotal;
  const valorPorMarca = numMarcas > 1 ? subtotal / numMarcas : subtotal;

  return (
    <div style={{ minHeight: '100vh', background: '#1A1A1A', color: '#ffffff', fontFamily: 'Montserrat, sans-serif' }}>
      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px', background: 'linear-gradient(135deg, #1A1A1A 0%, #2a1a0a 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(242,92,5,0.18) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <img src="/logo.png" alt="AI BORA" style={{ width: 50, height: 50, borderRadius: 10 }} />
          <div style={{ fontSize: 20, fontWeight: 900, color: '#ffffff' }}>AI <span style={{ color: '#F25C05' }}>BORA</span></div>
        </div>
        
        <p style={{ fontSize: 11, fontWeight: 700, color: '#F25C05', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
          Proposta exclusiva para
        </p>
        <p style={{ fontSize: 18, fontWeight: 600, color: '#ffffff', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
          {proposal.cliente}
        </p>
        
        <h1 style={{ fontSize: 26, fontWeight: 900, lineHeight: 1.2, marginBottom: 16, color: '#ffffff', maxWidth: 450 }}>
          Marketing digital para o teu negócio <span style={{ color: '#F25C05' }}>crescer.</span>
        </h1>
        
        <p style={{ fontSize: 14, color: '#cccccc', maxWidth: 400, lineHeight: 1.5, marginBottom: 20 }}>
          Propomos uma presença digital forte para o teu sucesso.
        </p>
        
        {/* Valor Box */}
        <div style={{ background: 'rgba(242,92,5,0.15)', border: '2px solid #F25C05', borderRadius: 16, padding: '20px 32px', marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#ffffff', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
            VALOR POR MARCA (SEM IVA)
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, color: '#F25C05' }}>
            {valorPorMarca.toFixed(2)} €
          </div>
          {proposal.desconto > 0 && (
            <div style={{ fontSize: 11, color: '#10B981', marginTop: 6 }}>
              Desconto: -{proposal.desconto.toFixed(2)} €
            </div>
          )}
          <div style={{ fontSize: 13, color: '#cccccc', marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            Total com IVA: {valorTotal.toFixed(2)} €
          </div>
        </div>
        
        <p style={{ fontSize: 13, color: '#aaaaaa', marginBottom: 16 }}>
          Vamos trabalhar juntas?
        </p>
        
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button 
            onClick={() => alert('✅ Obrigada! A sua proposta foi confirmada. Vamos entrar em contacto em breve!')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 12, fontWeight: 600, padding: '10px 20px', borderRadius: 50, textDecoration: 'none', border: '2px solid rgba(255,255,255,0.3)', cursor: 'pointer' }}
          >
            ✅ Confirmo esta proposta
          </button>
          
          <a href="WHATSAPP_LINK" target="_blank" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#25D366', color: '#fff', fontSize: 13, fontWeight: 700, padding: '12px 24px', borderRadius: 50, textDecoration: 'none', boxShadow: '0 4px 15px rgba(37,211,102,0.3)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
            WhatsApp
          </a>
        </div>
      </section>

      {/* QUEM SOMOS */}
      <section style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, lineHeight: 1.15, marginBottom: 16, color: '#ffffff' }}>
              Marketing digital <span style={{ color: '#F25C05' }}>que realmente funciona.</span>
            </h2>
            <p style={{ fontSize: 16, color: '#cccccc', lineHeight: 1.8, maxWidth: 500, marginBottom: 32 }}>
              A AI BORA é uma empresa especializada em ajudar negócios locais a crescer na internet. Somos o teu parceiro digital — com foco em resultados concretos e atenção prioritária.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 32 }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>💪</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>Proximidade</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📈</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>Crescimento</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🎯</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>Prioridade</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>❤️</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>Satisfação</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="https://i.imgur.com/FL1CGDf.png" alt="AI BORA Studio" style={{ width: '100%', maxWidth: 500, borderRadius: 20, objectFit: 'cover', minHeight: 400 }} />
          </div>
        </div>
      </section>

      {/* DIVISOR */}
      <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, rgba(242,92,5,0.5), transparent)', margin: '0 24px' }}></div>

      {/* SERVIÇOS */}
      <section style={{ background: 'rgba(255,255,255,0.02)', padding: '60px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#F25C05', marginBottom: 8 }}>O que fazemos</p>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, marginBottom: 16, color: '#ffffff' }}>
            Serviços <span style={{ color: '#F25C05' }}>exclusivos</span>
          </h2>
          <p style={{ fontSize: 16, color: '#cccccc', maxWidth: 500, margin: '0 auto 60px' }}>
            Tudo o que o teu negócio precisa para ter uma presença digital forte e profissional.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {[
              { icon: "📱", title: "Marketing Digital", desc: "Gestão completa das tuas redes sociais com conteúdo de qualidade e estratégia definida.", tags: ["Instagram", "Facebook", "LinkedIn"], highlight: proposal?.servicos?.some((s: string) => s.includes('Redes') || s.includes('Marketing') || s.includes('Gestão')) },
              { icon: "📊", title: "Consultoria", desc: "Estratégia digital personalizada para o teu negócio crescer.", tags: ["Análise", "Planeamento", "Relatórios"], highlight: proposal?.servicos?.some((s: string) => s.includes('Consultoria') || s.includes('Análise') || s.includes('Estratégica')) },
              { icon: "🎨", title: "Design & Identidade", desc: "Identidade visual profissional que representa a tua marca com credibilidade.", tags: ["Logótipo", "Posts", "Banners"], highlight: proposal?.servicos?.some((s: string) => s.includes('Design') || s.includes('Logotipo') || s.includes('Identidade')) },
              { icon: "💻", title: "Website", desc: "Site moderno, rápido e otimizado para aparecer no Google e converter visitantes.", tags: ["Landing Page", "SEO", "Mobile"], highlight: proposal?.servicos?.some((s: string) => s.includes('Web') || s.includes('Landing') || s.includes('Site')) },
              { icon: "🎬", title: "Multimédia", desc: "Fotografia e vídeo profissional que mostra o melhor do teu negócio.", tags: ["Fotografia", "Reels", "Edição"], highlight: proposal?.servicos?.some((s: string) => s.includes('Video') || s.includes('Foto') || s.includes('Multimédia')) },
              { icon: "📢", title: "Publicidade Paga", desc: "Campanhas pagas geridas por especialistas para maximizar o teu investimento.", tags: ["Google Ads", "Meta Ads"], highlight: proposal?.servicos?.some((s: string) => s.includes('Ads') || s.includes('Google') || s.includes('Publicidade')) },
              { icon: "⚡", title: "Automação & IA", desc: "Automatiza processos repetitivos e responde aos clientes 24/7 com inteligência artificial.", tags: ["Chatbot", "WhatsApp Auto", "CRM"], highlight: proposal?.servicos?.some((s: string) => s.includes('Chatbot') || s.includes('Automação') || s.includes('IA')) },
            ].map((servico, index) => (
              <div key={index} style={{ 
                background: servico.highlight ? 'rgba(242,92,5,0.1)' : 'rgba(255,255,255,0.04)', 
                border: servico.highlight ? '2px solid #F25C05' : '1px solid rgba(255,255,255,0.08)', 
                borderRadius: 20, 
                padding: 28, 
                transition: 'all 0.3s',
                textAlign: 'left'
              }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{servico.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: '#ffffff' }}>{servico.title}</div>
                <div style={{ fontSize: 13, color: '#cccccc', lineHeight: 1.6, marginBottom: 16 }}>{servico.desc}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {servico.tags.map((tag, i) => (
                    <span key={i} style={{ 
                      fontSize: 11, 
                      fontWeight: 600, 
                      color: servico.highlight ? '#F25C05' : 'rgba(255,255,255,0.5)', 
                      background: servico.highlight ? 'rgba(242,92,5,0.2)' : 'rgba(255,255,255,0.08)', 
                      border: `1px solid ${servico.highlight ? 'rgba(242,92,5,0.4)' : 'rgba(255,255,255,0.1)'}`, 
                      borderRadius: 20, 
                      padding: '4px 12px' 
                    }}>{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PORTFÓLIO */}
      <section style={{ padding: '60px 24px', maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#F25C05', marginBottom: 8 }}>Portfólio</p>
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, marginBottom: 16, color: '#ffffff' }}>
          O nosso <span style={{ color: '#F25C05' }}>trabalho</span>
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginTop: 24 }}>
          {[
            { src: '/branding.webp', tag: 'Branding' },
            { src: '/mopack.webp', tag: 'Packaging' },
            { src: '/foto-criativa.webp', tag: 'Fotografia' },
            { src: '/antes.webp', tag: 'Posição Local' },
            { src: '/depois.webp', tag: 'Produtos' },
            { src: '/estudio.webp', tag: 'Design' },
          ].map((item, i) => (
            <div key={i} style={{ borderRadius: 16, overflow: 'hidden', position: 'relative', aspectRatio: '4/3', background: 'rgba(255,255,255,0.05)' }}>
              <img src={item.src} alt={item.tag} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(26,26,26,0.9), transparent)', padding: '20px' }}>
                <span style={{ background: '#F25C05', color: '#fff', fontSize: 11, fontWeight: 800, padding: '6px 14px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: 1 }}>{item.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: '60px 24px', textAlign: 'center', background: 'linear-gradient(135deg, #1A1A1A 0%, #2a1a0a 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: -100, left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(242,92,5,0.15) 0%, transparent 70%)' }}></div>
        
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 24, color: '#ffffff' }}>
          Pronto para começar, <span style={{ color: '#F25C05' }}>{proposal.cliente}?</span>
        </h2>
        
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="WHATSAPP_LINK" target="_blank" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#25D366', color: '#fff', fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 14, padding: '14px 32px', borderRadius: 50, textDecoration: 'none', boxShadow: '0 8px 32px rgba(37,211,102,0.4)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
            WhatsApp
          </a>
          <a href="mailto:EMAIL" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'transparent', color: '#fff', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 14, padding: '14px 32px', borderRadius: 50, textDecoration: 'none', border: '2px solid rgba(255,255,255,0.3)' }}>
            ✉️ Email
          </a>
        </div>
      </section>

      {/* RODAPÉ */}
      <footer style={{ background: '#111', padding: '40px 24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
          <img src="/logo.png" alt="AI BORA" style={{ width: 60, height: 60, borderRadius: 12, marginBottom: 12 }} />
          <div style={{ fontSize: 18, fontWeight: 900, color: '#ffffff' }}>
            AI <span style={{ color: '#F25C05' }}>BORA</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
          <a href="https://instagram.com/aibora.pt" target="_blank" style={{ width: 40, height: 40, borderRadius: '50%', background: '#E1306C', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </a>
          <a href="https://www.facebook.com/aibora.pt/" target="_blank" style={{ width: 40, height: 40, borderRadius: '50%', background: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <a href="https://x.com/boraweb3" target="_blank" style={{ width: 40, height: 40, borderRadius: '50%', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', border: '1px solid #333' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
        </div>
        
        <div style={{ fontSize: 13, color: '#aaaaaa', lineHeight: 2 }}>
          <div>EMAIL</div>
          <div>+351 936 021 747</div>
          <div>www.aibora.pt</div>
        </div>
        {proposal.createdAt && (
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: 12, color: '#888888' }}>
            Esta proposta foi preparada exclusivamente para {proposal.cliente} a {new Date(proposal.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })} e tem validade de 10 dias.
          </div>
        )}
      </footer>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}