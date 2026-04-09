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
          setError("Proposta não encontrada");
          setLoading(false);
          return;
        }

        let data = null;
        
        // Primeiro tenta buscar por token (novo sistema seguro)
        const tokenData = await getProposalByToken(id);
        if (tokenData) {
          data = tokenData;
        } else {
          // Fallback: busca por ID (sistema antigo para compatibilidade)
          data = await getProposal(id);
        }
        
        if (!data) {
          setError("Proposta não encontrada");
        } else if (!data.accessToken && !data.clienteId) {
          // Proposta antiga sem token - verificar validade
          const aindaValida = await isProposalValid(id);
          if (!aindaValida) {
            setError("Esta proposta expirou (válida por 10 dias)");
          } else {
            setProposal(data);
          }
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

  const handleResposta = async (tipo: "sim" | "nao" | "reagendar") => {
    if (!proposal || respondendo) return;
    
    if (tipo === 'sim' && !confirm("Confirmas a aceitação desta proposta?")) return;
    
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
              "Gestão de Redes Sociais": ["Planeamento mensal de conteúdo", "Scheduler de publicações", "Relatórios de métricas", "Estratégia de crescimento", "Suporte e engajamento diário"],
              "Criação de Conteúdo": ["Textos para posts", "Legendas criativas", "Copywriting persuasivo", "Conteúdo para blog", "Newsletters"],
              "Design de Posts": ["Posts gráficos personalizados", "Carrosséis informativos", "Stories e Reels", "Banners e covers", "Templates de marca"],
              "Community Management": ["Resposta a comentários", "Mensagens diretas", "Moderação", "Gestão de reviews", "Relatórios de engagement"],
              "Design de Logotipo": ["3 propostas iniciais", "Revisões ilimitadas", "Múltiplos formatos", "Manual de marca básico", "Uso comercial"],
              "Identidade Corporativa": ["Logotipo + variações", "Paleta de cores", "Tipografia", "Cartão de visita", "Pasta corporativa"],
              "Produção de Vídeos": ["Roteiro e storyboard", "Filmagem profissional", "Edição e pós-produção", "Motion graphics", "Entrega em 4K"],
              "Criação de Reels": ["Conceito criativo", "Roteiro corto", "Edição dinâmica", "Trendy sounds", "Otimização para reach"],
              "Página Web/Landing": ["Design responsivo", "Otimizado para SEO", "Formulários de contacto", "Integração analytics", "SSL incluído"],
              "Loja Online": ["Gestão de produtos", "Pagamentos seguros", "Shipping integrado", "Painel administrativo", "Template profissional"],
              "SEO Local": ["Perfil de negócio otimizado", "Palavras-chave locais", "Backlinks locais", "Gestão de avaliações", "Relatórios mensais"],
              "Facebook/Instagram Ads": ["Segmentação avançada", "Criação de creatives", "A/B testing", "Pixel setup", "Relatórios de resultados"],
              "Email Marketing": ["Design de templates", "Automação de emails", "Segmentação de listas", "A/B testing", "Relatórios de abertura"],
              "Chatbot WhatsApp": ["Respostas automáticas", "Menu interativo", "Agendamento de reuniões", "Integração com CRM", "Chatbot com IA"],
              "IA & Automação": ["Automação de tarefas", "Integração de apps", "Workflows personalizados", "Relatórios automáticos", "Assistente virtual"],
              "Fotografia Profissional": ["Sessão de 2h", "20 fotos editadas", "Uso comercial", "Diferentes cenários", "Alta resolução"],
              "Consultoria Estratégica": ["Análise do negócio", "Estratégia digital", "Plano de ação", "Reuniões mensais", "Suporte prioritário"],
            };
            const detalhes = DETALHAMENTO[nomeServico] || [];
            await createTarea({
              titulo: nomeServico,
              servicoNome: nomeServico,
              descricao: detalhes.length > 0 ? "O que está incluído:\n• " + detalhes.join("\n• ") : '',
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
        const motivo = prompt('Pode-nos dizer porquê? (opcional)');
        
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
      console.error("Erro ao registar resposta:", err);
      alert("Erro ao registar resposta. Tenta novamente.");
    }
    
    setRespondendo(false);
  };

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
          <p style={{ fontFamily: 'Montserrat, sans-serif', color: '#cccccc', fontSize: 14 }}>Carregando proposta...</p>
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

  if (respostaEnviada) {
    const mensagens = {
      sim: {
        titulo: "Ótimo! Proposta confirmada.",
        subtitulo: "Bem-vindo à família AI BORA! Entraremos em contacto nas próximas horas.",
        cor: "#10B981",
        emoji: "🎉"
      },
      reagendar: {
        titulo: "Sem problema!",
        subtitulo: "Vamos rever a proposta e ajustá-la às tuas necessidades. Entraremos em contacto em breve.",
        cor: "#F25C05",
        emoji: "↩️"
      },
      nao: {
        titulo: "Obrigado pelo teu tempo.",
        subtitulo: "Se mudares de ideias, estaremos aqui. Boa sorte no teu negócio!",
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
              Falar pelo WhatsApp
            </a>
          )}
          {respostaEnviada !== "sim" && (
            <a
              href="/"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#aaaaaa', fontSize: 13, textDecoration: 'none' }}
            >
              ← Voltar ao início
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
            Proposta Personalizada
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 24, letterSpacing: -2, color: '#ffffff' }}>
            Olá, {proposal.cliente}.<br />
            Vamos elevar o teu negócio?
          </h1>
          <p style={{ fontSize: 18, color: '#cccccc', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
            Analisámos o teu perfil e preparámos uma estratégia focada em resultados reais para a <span style={{ color: '#fff', fontWeight: 700 }}>{proposal.empresa || 'tua empresa'}</span>.
          </p>
        </section>

        {/* Serviços Selecionados */}
        <section style={{ marginBottom: 100 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12, color: '#ffffff' }}>Serviços Propostos</h2>
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
                    Solução completa e personalizada para garantir o melhor desempenho do teu negócio nesta área.
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Porquê nós? */}
        <section style={{ background: '#fff', color: '#1A1A1A', borderRadius: 40, padding: '80px 40px', marginBottom: 100, textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 20 }}>Porquê a AI BORA?</h2>
          <p style={{ fontSize: 16, color: '#666', maxWidth: 500, margin: '0 auto 60px' }}>
            Tudo o que o teu negócio precisa para ter uma presença digital forte e profissional.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {[
              { icon: "📱", title: "Marketing Digital", desc: "Gestão completa das tuas redes sociais com conteúdo de qualidade e estratégia definida.", tags: ["Instagram", "Facebook", "LinkedIn"], highlight: proposal?.servicos?.some((s: string) => s.includes('Redes') || s.includes('Marketing') || s.includes('Gestão')) },
              { icon: "📊", title: "Consultoria", desc: "Estratégia digital personalizada para o teu negócio crescer.", tags: ["Análise", "Planeamento", "Relatórios"], highlight: proposal?.servicos?.some((s: string) => s.includes('Consultoria') || s.includes('Análise') || s.includes('Estratégica')) },
              { icon: "🎨", title: "Design & Identidade", desc: "Identidade visual profissional que representa a tua marca com credibilidade.", tags: ["Logótipo", "Posts", "Banners"], highlight: proposal?.servicos?.some((s: string) => s.includes('Design') || s.includes('Logotipo') || s.includes('Identidade')) },
              { icon: "💻", title: "Website", desc: "Site moderno, rápido e otimizado para motores de busca e converter visitantes.", tags: ["Landing Page", "SEO", "Mobile"], highlight: proposal?.servicos?.some((s: string) => s.includes('Web') || s.includes('Landing') || s.includes('Site')) },
              { icon: "📢", title: "Publicidade Paga", desc: "Campanhas pagas geridas por especialistas para maximizar o teu investimento.", tags: ["Meta Ads"], highlight: proposal?.servicos?.some((s: string) => s.includes('Ads') || s.includes('Publicidade')) },
              { icon: "⚡", title: "Automação & IA", desc: "Automatiza processos repetitivos e responde aos clientes 24/7 con inteligência artificial.", tags: ["Chatbot", "WhatsApp Auto", "CRM"], highlight: proposal?.servicos?.some((s: string) => s.includes('Chatbot') || s.includes('Automação') || s.includes('IA')) },
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
          <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 40, color: '#ffffff' }}>O teu Investimento</h2>
          <div style={{ background: 'linear-gradient(135deg, #F25C05 0%, #F22283 100%)', borderRadius: 32, padding: '60px 40px', display: 'inline-block', minWidth: 320 }}>
            <p style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16, opacity: 0.9 }}>Valor Total do Projeto</p>
            <div style={{ fontSize: 'clamp(40px, 8vw, 64px)', fontWeight: 900, marginBottom: 8, letterSpacing: -2 }}>
              {Number(proposal.valor || proposal.total || 0).toLocaleString('pt-PT', { minimumFractionDigits: 2 })}€
            </div>
            <p style={{ fontSize: 14, opacity: 0.8 }}>+ IVA à taxa legal em vigor</p>
          </div>
        </section>

        {/* CTA / Resposta */}
        <section style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: isMobile ? 24 : 40, padding: isMobile ? '40px 20px' : '80px 40px' }}>
          <h2 style={{ fontSize: isMobile ? 24 : 32, fontWeight: 900, marginBottom: 16, color: '#ffffff' }}>Pronto para começar?</h2>
          <p style={{ color: '#cccccc', marginBottom: 48 }}>Escolha uma das opções abaixo para prosseguirmos.</p>
          
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'center', gap: 16 }}>
            <button 
              onClick={() => handleResposta('sim')}
              disabled={respondendo}
              style={{ width: isMobile ? '100%' : 'auto', background: '#F25C05', color: '#fff', border: 'none', padding: '18px 40px', borderRadius: 16, fontSize: 16, fontWeight: 800, cursor: 'pointer', transition: 'transform 0.2s' }}
            >
              {respondendo ? 'A processar...' : 'Sim, aceito a proposta! ✅'}
            </button>
            <button 
              onClick={() => handleResposta('reagendar')}
              disabled={respondendo}
              style={{ width: isMobile ? '100%' : 'auto', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '18px 40px', borderRadius: 16, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}
            >
              Quero ajustar detalhes 📝
            </button>
            <button 
              onClick={() => { if (confirm('Tens a certeza que não tens interesse?')) handleResposta('nao'); }}
              disabled={respondendo}
              style={{ width: isMobile ? '100%' : 'auto', background: 'transparent', color: '#555', border: '1px solid #333', padding: '18px 40px', borderRadius: 16, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              Não tenho interesse
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
        © {new Date().getFullYear()} AI BORA · Marketing Digital de Resultados
      </footer>
    </div>
  );
}
