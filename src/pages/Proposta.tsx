import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { getProposal, isProposalValid, updateProposal, updateCliente, createTarea, getProposalByToken, getCliente } from "../services/firebase";
import { sendEmail } from "../services/emailService";
import { WHATSAPP_LINK, EMAIL } from "../lib/constants";

export function PropostaPage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [proposal, setProposal] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [respondendo, setRespondendo] = useState(false);
  const [respostaEnviada, setRespostaEnviada] = useState<"sim" | "nao" | "reagendar" | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    async function loadProposal() {
      try {
        const id = params.id;
        
        if (!id) {
          setError("Proposal not found");
          setLoading(false);
          return;
        }

        let data = null;
        
        // Try secure token lookup first
        const tokenData = await getProposalByToken(id);
        if (tokenData) {
          data = tokenData;
        } else {
          // Fallback: lookup by ID (legacy compatibility)
          data = await getProposal(id);
        }
        
        if (!data) {
          setError("Proposal not found");
        } else if (!data.accessToken && !data.clienteId) {
          // Legacy proposal without token — check validity
          const aindaValida = await isProposalValid(id);
          if (!aindaValida) {
            setError("This proposal has expired (valid for 10 days)");
          } else {
            setProposal(data);
          }
        } else {
          setProposal(data);
        }
      } catch (err: any) {
        setError("Error loading proposal: " + err.message);
      }
      setLoading(false);
    }

    loadProposal();
  }, [params.id]);

  const handleResposta = async (tipo: "sim" | "nao" | "reagendar") => {
    if (!proposal || respondendo) return;
    
    if (tipo === 'sim' && !confirm("Do you accept this proposal?")) return;
    
    setRespondendo(true);
    
    try {
      await updateProposal(params.id, {
        resposta: tipo === 'reagendar' ? 'reagendar' : tipo,
        dataResposta: new Date().toISOString(),
        status: tipo === 'sim' ? 'aceita' : (tipo === 'nao' ? 'recusada' : 'pendente')
      });

      if (proposal.email) {
        const emailResposta = tipo === 'reagendar' ? 'Requisitou ajustes' : (tipo === 'sim' ? 'Aceitou' : 'Recusou');
        sendEmail(proposal.email, 'confirmacao-resposta-proposta', {
          clienteNome: proposal.cliente,
          resposta: emailResposta,
          fichaUrl: tipo === 'sim' ? `${window.location.origin}/c/${proposal.clienteId}` : '',
        }).catch(() => {});
        
        if (tipo === 'sim') {
          sendEmail(proposal.email, 'boas-vindas-cliente', {
            clienteNome: proposal.cliente,
            linkFicha: `${window.location.origin}/c/${proposal.clienteId}`,
          }).catch(() => {});
        }
      }

      if (tipo === "sim" && proposal.clienteId) {
        await updateCliente(proposal.clienteId, {
          categoria: "cliente",
          processo: "iniciado",
          dataResposta: new Date().toISOString(),
          resposta: "sim",
          fichaUrl: `${window.location.origin}/c/${proposal.clienteId}`
        });

        if (proposal.servicos && proposal.servicos.length > 0) {
          for (const servico of proposal.servicos) {
            const nomeServico = typeof servico === 'string' ? servico : (servico.nome || servico);
            const DETALHAMENTO: Record<string, string[]> = {
              "Gestão de Redes Sociais": ["Monthly content planning", "Publication scheduling", "Metric reports", "Growth strategy", "Daily support and engagement"],
              "Criação de Conteúdo": ["Post copy", "Creative captions", "Persuasive copywriting", "Blog content", "Newsletters"],
              "Design de Posts": ["Custom graphic posts", "Informative carousels", "Stories and Reels", "Banners and covers", "Brand templates"],
              "Community Management": ["Comment replies", "Direct messages", "Moderation", "Review management", "Engagement reports"],
              "Design de Logotipo": ["3 initial concepts", "Unlimited revisions", "Multiple formats", "Basic brand manual", "Commercial use"],
              "Identidade Corporativa": ["Logo + variations", "Colour palette", "Typography", "Business card", "Corporate folder"],
              "Produção de Vídeos": ["Script and storyboard", "Professional filming", "Editing and post-production", "Motion graphics", "4K delivery"],
              "Criação de Reels": ["Creative concept", "Short script", "Dynamic editing", "Trending audio", "Reach optimisation"],
              "Página Web/Landing": ["Responsive design", "SEO optimisation", "Contact forms", "Analytics integration", "SSL included"],
              "Loja Online": ["Product management", "Secure payments", "Integrated shipping", "Admin panel", "Professional template"],
              "SEO Local": ["Optimised business profile", "Local keywords", "Local backlinks", "Review management", "Monthly reports"],
              "Facebook/Instagram Ads": ["Advanced targeting", "Creative production", "A/B testing", "Pixel setup", "Performance reports"],
              "Email Marketing": ["Template design", "Email automation", "List segmentation", "A/B testing", "Open-rate reports"],
              "Chatbot WhatsApp": ["Automatic replies", "Interactive menu", "Meeting booking", "CRM integration", "AI chatbot"],
              "IA & Automação": ["Task automation", "App integration", "Custom workflows", "Automatic reports", "Virtual assistant"],
              "Fotografia Profissional": ["2h session", "20 edited photos", "Commercial use", "Multiple setups", "High resolution"],
              "Consultoria Estratégica": ["Business analysis", "Digital strategy", "Action plan", "Monthly meetings", "Priority support"],
            };
            const detalhes = DETALHAMENTO[nomeServico] || [];
            await createTarea({
              titulo: nomeServico,
              servicoNome: nomeServico,
              descricao: detalhes.length > 0 ? "What's included:\n• " + detalhes.join("\n• ") : '',
              clienteId: proposal.clienteId,
              clienteNome: proposal.cliente,
              clienteEmail: proposal.email || '',
              estado: "disponivel",
              periodicidade: "pontual",
            });
          }
        }
      }

      if (tipo === "reagendar" && proposal.clienteId) {
        await updateCliente(proposal.clienteId, {
          resposta: "reagendar",
          dataResposta: new Date().toISOString(),
        });
        
        if (proposal.email) {
          sendEmail(proposal.email, 'proposta-rejeitada', {
            clienteNome: proposal.cliente,
          }).catch(() => {});
        }
        
        if (proposal.vendedorId) {
          const { getVendedor } = await import('../services/vendedores');
          if (getVendedor) {
            const vendedor = await getVendedor(proposal.vendedorId);
            if (vendedor?.email) {
              sendEmail(vendedor.email, 'pedido-cambios', {
                clienteNome: proposal.cliente,
                empresa: proposal.empresa,
                propostaId: params.id,
                linkProposta: `${window.location.origin}/admin/orcamento?edit=${params.id}`,
              }).catch(() => {});
            }
          }
        }
      }

      if (tipo === "nao" && proposal.clienteId) {
        const motivo = prompt('Could you tell us why? (optional)');
        
        await updateCliente(proposal.clienteId, {
          categoria: "arquivo",
          resposta: "nao",
          dataResposta: new Date().toISOString(),
          naoInteressado: true,
          motivoNaoInteresse: motivo || '',
          tags: ['nao_interessado']
        });
      }

      setRespostaEnviada(tipo);
    } catch (err: any) {
      console.error("Error saving response:", err);
      alert("Could not save your response. Please try again.");
    }
    
    setRespondendo(false);
  };

  // Dynamic title
  useEffect(() => {
    if (proposal?.cliente) {
      document.title = `Proposal for ${proposal.cliente} — AI BORA`;
    }
  }, [proposal]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #333', borderTop: '3px solid #F25C05', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ fontFamily: 'Montserrat, sans-serif', color: '#cccccc', fontSize: 14 }}>Loading proposal...</p>
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
          <p style={{ fontFamily: 'Montserrat, sans-serif', color: '#cccccc', marginBottom: 24 }}>
            The proposal may have expired or does not exist.
          </p>
          <button 
            onClick={() => setLocation('/')}
            style={{ fontFamily: 'Montserrat, sans-serif', backgroundColor: '#F22283', color: '#fff', padding: '14px 32px', borderRadius: 100, border: 'none', fontWeight: 700, cursor: 'pointer' }}
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  if (respostaEnviada) {
    const mensagens = {
      sim: {
        titulo: "Great! Proposal confirmed.",
        subtitulo: "Welcome to the AI BORA family! We will be in touch within the next few hours.",
        cor: "#10B981",
        emoji: "🎉"
      },
      reagendar: {
        titulo: "No problem!",
        subtitulo: "We will review the proposal and adjust it to your needs. We will be in touch shortly.",
        cor: "#F25C05",
        emoji: "↩️"
      },
      nao: {
        titulo: "Thanks for your time.",
        subtitulo: "If you change your mind, we will be here. Good luck with your business!",
        cor: "#6B7280",
        emoji: "👋"
      }
    };
    
    const msg = mensagens[respostaEnviada];
    
    return (
      <div style={{ minHeight: '100vh', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Montserrat, sans-serif' }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>{msg.emoji}</div>
          <div style={{ width: 60, height: 4, backgroundColor: msg.cor, borderRadius: 2, margin: '0 auto 24px' }} />
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#ffffff', marginBottom: 16, lineHeight: 1.2 }}>
            {msg.titulo}
          </h1>
          <p style={{ fontSize: 16, color: '#cccccc', lineHeight: 1.6, marginBottom: 32 }}>
            {msg.subtitulo}
          </p>
          {respostaEnviada === "sim" && (
            <a
              href={`https://wa.me/${WHATSAPP_LINK.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#25D366', color: '#fff', fontWeight: 700, fontSize: 14, padding: '14px 28px', borderRadius: 50, textDecoration: 'none' }}
            >
              Chat on WhatsApp
            </a>
          )}
          {respostaEnviada !== "sim" && (
            <a
              href="/"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#aaaaaa', fontSize: 13, textDecoration: 'none' }}
            >
              ← Back to home
            </a>
          )}
        </div>
      </div>
    );
  }
  return (
    <div style={{ minHeight: '100vh', background: '#1A1A1A', color: '#fff', fontFamily: 'Montserrat, sans-serif', paddingBottom: 100 }}>
      {/* Header / Logo */}
      <header style={{ padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <img src="/logo.png" alt="AI BORA" style={{ height: 40 }} />
        </div>
      </header>

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '60px 24px' }}>
        {/* Hero Section */}
        <section style={{ textAlign: 'center', marginBottom: 80 }}>
          <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(242,92,5,0.1)', color: '#F25C05', borderRadius: 100, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 24 }}>
            Tailored proposal
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 24, letterSpacing: -2, color: '#ffffff' }}>
            Hi, {proposal.cliente}.<br />
            Ready to grow your business?
          </h1>
          <p style={{ fontSize: 18, color: '#cccccc', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
            We reviewed your profile and prepared a strategy focused on real results for <span style={{ color: '#fff', fontWeight: 700 }}>{proposal.empresa || 'your business'}</span>.
          </p>
        </section>

        {/* Proposed services */}
        <section style={{ marginBottom: 100 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12, color: '#ffffff' }}>Proposed services</h2>
            <div style={{ width: 40, height: 4, background: '#F25C05', margin: '0 auto' }}></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {proposal.servicos?.map((servico: any, idx: number) => {
              const nome = typeof servico === 'string' ? servico : (servico.nome || servico);
              return (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 32, transition: 'transform 0.3s' }}>
                  <div style={{ width: 48, height: 48, background: '#F25C05', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 24 }}>
                    ✨
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#ffffff' }}>{nome}</h3>
                  <p style={{ color: '#cccccc', fontSize: 14, lineHeight: 1.6 }}>
                    A complete, tailored solution to help your business perform at its best in this area.
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Why us */}
        <section style={{ background: '#fff', color: '#1A1A1A', borderRadius: 40, padding: '80px 40px', marginBottom: 100, textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 20 }}>Why AI BORA?</h2>
          <p style={{ fontSize: 16, color: '#666', maxWidth: 500, margin: '0 auto 60px' }}>
            Everything your business needs for a strong, professional digital presence.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {[
              { icon: "📱", title: "Digital marketing", desc: "Full management of your social channels with quality content and a clear strategy.", tags: ["Instagram", "Facebook", "LinkedIn"], highlight: proposal?.servicos?.some((s: string) => s.includes('Redes') || s.includes('Marketing') || s.includes('Gestão')) },
              { icon: "📊", title: "Consulting", desc: "Personalised digital strategy to help your business grow.", tags: ["Analysis", "Planning", "Reports"], highlight: proposal?.servicos?.some((s: string) => s.includes('Consultoria') || s.includes('Análise') || s.includes('Estratégica')) },
              { icon: "🎨", title: "Design & identity", desc: "Professional visual identity that represents your brand with credibility.", tags: ["Logo", "Posts", "Banners"], highlight: proposal?.servicos?.some((s: string) => s.includes('Design') || s.includes('Logotipo') || s.includes('Identidade')) },
              { icon: "💻", title: "Website", desc: "A modern, fast site optimised for search and conversions.", tags: ["Landing Page", "SEO", "Mobile"], highlight: proposal?.servicos?.some((s: string) => s.includes('Web') || s.includes('Landing') || s.includes('Site')) },
              { icon: "📢", title: "Paid ads", desc: "Paid campaigns managed by specialists to maximise your investment.", tags: ["Meta Ads"], highlight: proposal?.servicos?.some((s: string) => s.includes('Ads') || s.includes('Publicidade')) },
              { icon: "⚡", title: "Automation & AI", desc: "Automate repetitive work and respond to customers 24/7 with AI.", tags: ["Chatbot", "WhatsApp Auto", "CRM"], highlight: proposal?.servicos?.some((s: string) => s.includes('Chatbot') || s.includes('Automação') || s.includes('IA')) },
            ].map((servico, index) => (
              <div key={index} style={{ 
                background: servico.highlight ? 'rgba(242,92,5,0.1)' : 'rgba(255,255,255,0.04)', 
                border: servico.highlight ? '2px solid #F25C05' : '1px solid rgba(255,255,255,0.08)', 
                borderRadius: 20, 
                padding: 28, 
                transition: 'all 0.3s',
                textAlign: 'left'
              }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{servico.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: '#1A1A1A' }}>{servico.title}</h3>
                <p style={{ fontSize: 14, color: '#666', lineHeight: 1.5, marginBottom: 16 }}>{servico.desc}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {servico.tags.map(tag => (
                    <span key={tag} style={{ fontSize: 10, fontWeight: 700, padding: '4px 8px', background: '#f0f0f0', borderRadius: 4, color: '#888' }}>{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Investimento */}
        <section style={{ textAlign: 'center', marginBottom: 100 }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 40, color: '#ffffff' }}>Your investment</h2>
          <div style={{ background: 'linear-gradient(135deg, #F25C05 0%, #F22283 100%)', borderRadius: 32, padding: '60px 40px', display: 'inline-block', minWidth: 320 }}>
            <p style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16, opacity: 0.9 }}>Total project value</p>
            <div style={{ fontSize: 'clamp(40px, 8vw, 64px)', fontWeight: 900, marginBottom: 8, letterSpacing: -2 }}>
              {Number(proposal.valor || proposal.total || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}€
            </div>
            <p style={{ fontSize: 14, opacity: 0.8 }}>+ VAT at the applicable legal rate</p>
          </div>
        </section>

        {/* CTA / Resposta */}
        <section style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: isMobile ? 24 : 40, padding: isMobile ? '40px 20px' : '80px 40px' }}>
          <h2 style={{ fontSize: isMobile ? 24 : 32, fontWeight: 900, marginBottom: 16, color: '#ffffff' }}>Ready to get started?</h2>
          <p style={{ color: '#cccccc', marginBottom: 48 }}>Choose one of the options below to continue.</p>
          
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'center', gap: 16 }}>
            <button 
              onClick={() => handleResposta('sim')}
              disabled={respondendo}
              style={{ width: isMobile ? '100%' : 'auto', background: '#F25C05', color: '#fff', border: 'none', padding: '18px 40px', borderRadius: 16, fontSize: 16, fontWeight: 800, cursor: 'pointer', transition: 'transform 0.2s' }}
            >
              {respondendo ? 'Processing...' : 'Yes, I accept the proposal ✅'}
            </button>
            <button 
              onClick={() => handleResposta('reagendar')}
              disabled={respondendo}
              style={{ width: isMobile ? '100%' : 'auto', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '18px 40px', borderRadius: 16, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}
            >
              I want to adjust details 📝
            </button>
            <button 
              onClick={() => { if (confirm('Are you sure you are not interested?')) handleResposta('nao'); }}
              disabled={respondendo}
              style={{ width: isMobile ? '100%' : 'auto', background: 'transparent', color: '#555', border: '1px solid #333', padding: '18px 40px', borderRadius: 16, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              Not interested
            </button>
          </div>
        </section>

        {/* CONTACT FLOATING BAR - RESPONSIVE & ACTIVE */}
        <div style={{ 
          position: 'fixed', 
          bottom: isMobile ? 16 : 24, 
          left: '50%', 
          transform: 'translateX(-50%)', 
          width: isMobile ? '95%' : '90%', 
          maxWidth: 450, 
          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
          backdropFilter: 'blur(10px)',
          borderRadius: 24, 
          padding: isMobile ? '10px 16px' : '12px 24px', 
          display: 'flex', 
          justifyContent: 'space-around', 
          alignItems: 'center', 
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)', 
          zIndex: 100,
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <a href={`https://wa.me/${WHATSAPP_LINK.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ color: '#1b1c1b', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: isMobile ? 4 : 8, textDecoration: 'none', fontWeight: 800, fontSize: isMobile ? 10 : 13 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </div>
            {!isMobile && "WhatsApp"}
          </a>
          <a href={`mailto:${EMAIL}`} style={{ color: '#1b1c1b', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: isMobile ? 4 : 8, textDecoration: 'none', fontWeight: 800, fontSize: isMobile ? 10 : 13 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#F25C05', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>
            {!isMobile && "Email"}
          </a>
          <a href="https://www.facebook.com/aibora.ptt" target="_blank" rel="noreferrer" style={{ color: '#1b1c1b', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: isMobile ? 4 : 8, textDecoration: 'none', fontWeight: 800, fontSize: isMobile ? 10 : 13 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </div>
            {!isMobile && "Facebook"}
          </a>
        </div>
      </main>

      <footer style={{ padding: '40px 24px', textAlign: 'center', color: '#666666', fontSize: 12 }}>
        © {new Date().getFullYear()} AI BORA · Results-driven digital marketing
      </footer>
    </div>
  );
}
