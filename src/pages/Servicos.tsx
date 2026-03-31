import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { CTAFooterSection } from "../components/CTAFooterSection";
import { FloatingWhatsApp } from "../components/FloatingWhatsApp";
import { Footer } from "../components/Footer";
import { WHATSAPP_LINK } from "../lib/constants";

const categorias = [
  {
    nome: "Marketing", icon: "📱",
    desc: "Gestao de redes sociais, criacao de conteudo e estrategia digital para fazer crescer a tua marca online.",
    servicos: ["Gestao de Redes Sociais", "Criacao de Conteudo", "Community Management", "Email Marketing"]
  },
  {
    nome: "Design", icon: "🎨",
    desc: "Identidade visual profissional que diferencia o teu negocio e transmite confianca aos teus clientes.",
    servicos: ["Design de Posts", "Logotipo", "Identidade Corporativa", "Banners e Posters"]
  },
  {
    nome: "Web", icon: "💻",
    desc: "Paginas web rapidas, modernas e otimizadas para converter visitantes em clientes.",
    servicos: ["Landing Page", "Site Catalogo", "Loja Online", "SEO Local"]
  },
  {
    nome: "Multimedia", icon: "🎬",
    desc: "Fotografia e video profissional para destacar o teu negocio nas redes e no mercado.",
    servicos: ["Fotografia Profissional", "Producao de Videos", "Criacao de Reels", "Edicao de Conteudo"]
  },
  {
    nome: "Publicidade", icon: "📢",
    desc: "Campanhas pagas no Google e Meta para atrair os clientes certos no momento certo.",
    servicos: ["Google Ads", "Facebook Ads", "Instagram Ads", "Gestao de Budget"]
  },
  {
    nome: "Automacao", icon: "⚡",
    desc: "Automatiza processos repetitivos e responde a clientes 24/7 com inteligencia artificial.",
    servicos: ["Chatbot WhatsApp", "IA e Automacao", "Respostas Automaticas", "Fluxos de CRM"]
  },
  {
    nome: "Consultoria", icon: "📊",
    desc: "Estrategia digital personalizada para crescer com decisoes baseadas em dados reais.",
    servicos: ["Consultoria Estrategica", "Analise de Concorrentes", "Dashboard Excel", "Plano de Marketing"]
  },
];

const fotos = [
  { src: "/antes.webp", label: "Antes" },
  { src: "/depois.webp", label: "Depois" },
  { src: "/estudio.webp", label: "Estudio" },
  { src: "/foto-criativa.webp", label: "Criativo" },
  { src: "/mopack.webp", label: "Packaging" },
  { src: "/branding.webp", label: "Branding" },
];

export function Servicos() {
  const [selecionados, setSelecionados] = useState<string[]>([]);

  const toggle = (s: string) => setSelecionados(prev =>
    prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
  );

  const msg = selecionados.length > 0
    ? encodeURIComponent("Ola! Tenho interesse nos seguintes servicos: " + selecionados.join(", ") + ". Podem enviar orcamento?")
    : encodeURIComponent("Ola! Gostava de receber informacoes sobre os vossos servicos.");

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main>

        <section style={{ backgroundColor: "#1A1A1A", padding: "120px 16px 80px" }}>
          <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
            <h1 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 900, fontSize: "clamp(28px, 5vw, 48px)", color: "#ffffff", lineHeight: 1.1, margin: "0 0 16px" }}>
              Os nossos servicos
            </h1>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 16, color: "#aaaaaa", margin: 0, lineHeight: 1.5 }}>
              Seleciona os servicos que precisas e pede o teu orcamento sem compromisso
            </p>
          </div>
        </section>

        <section id="simulador" style={{ backgroundColor: "#ffffff", padding: "64px 16px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>

            <div style={{ flex: "1 1 600px" }}>
              <div style={{ marginBottom: 40 }}>
                <div style={{ width: 36, height: 3, backgroundColor: "#F25C05", marginBottom: 16, borderRadius: 2 }} />
                <h2 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 900, fontSize: "clamp(22px, 4vw, 32px)", color: "#1A1A1A", margin: "0 0 8px" }}>
                  O que fazemos
                </h2>
                <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, color: "#4A4A4A", margin: 0 }}>
                  Clica nos servicos para adicionares ao teu orcamento personalizado
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
                {categorias.map((cat) => (
                  <div key={cat.nome} style={{ backgroundColor: "#F5F2F0", borderRadius: 16, padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 24 }}>{cat.icon}</span>
                      <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 800, fontSize: 15, color: "#1A1A1A" }}>{cat.nome}</span>
                    </div>
                    <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, color: "#4A4A4A", margin: 0, lineHeight: 1.5 }}>{cat.desc}</p>
                    <div style={{ height: 1, backgroundColor: "#e0ddd9" }} />
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {cat.servicos.map((s) => {
                        const sel = selecionados.includes(s);
                        return (
                          <button key={s} onClick={() => toggle(s)} style={{ fontFamily: "Montserrat, sans-serif", fontSize: 11, fontWeight: 600, backgroundColor: sel ? "#F22283" : "#ffffff", color: sel ? "#ffffff" : "#1A1A1A", border: sel ? "1px solid #F22283" : "1px solid rgba(0,0,0,0.10)", borderRadius: 20, padding: "5px 12px", cursor: "pointer", transition: "all 0.15s ease" }}>
                            {sel ? "✓ " : ""}{s}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ flex: "0 1 300px", position: "sticky", top: 100 }}>
              <div style={{ backgroundColor: "#F5F2F0", borderRadius: 16, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                <h3 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 16, color: "#1A1A1A", margin: "0 0 16px" }}>
                  📋 O teu orcamento
                </h3>
                {selecionados.length === 0 ? (
                  <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 13, color: "#888", textAlign: "center", padding: "24px 0", margin: 0 }}>
                    Seleciona servicos para criares o teu pacote personalizado
                  </p>
                ) : (
                  <div style={{ marginBottom: 16 }}>
                    {selecionados.map(s => (
                      <div key={s} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e0ddd9" }}>
                        <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, color: "#1A1A1A" }}>{s}</span>
                        <button onClick={() => toggle(s)} style={{ background: "none", border: "none", color: "#F22283", cursor: "pointer", fontSize: 16, padding: "0 4px", lineHeight: 1 }}>x</button>
                      </div>
                    ))}
                    <div style={{ marginTop: 12, padding: "8px 12px", backgroundColor: "#ffffff", borderRadius: 8 }}>
                      <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, fontWeight: 600, color: "#1A1A1A" }}>
                        {selecionados.length} servico{selecionados.length !== 1 ? "s" : ""} selecionado{selecionados.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                )}
                <a href={WHATSAPP_LINK + "?text=" + msg} target="_blank" rel="noopener noreferrer" style={{ display: "block", textAlign: "center", padding: "14px", borderRadius: 10, fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 13, textDecoration: "none", backgroundColor: selecionados.length > 0 ? "#25D366" : "#cccccc", color: "#ffffff", cursor: selecionados.length > 0 ? "pointer" : "not-allowed", transition: "all 0.2s ease" }}>
                  Pedir Orcamento{selecionados.length > 0 ? " (" + selecionados.length + ")" : ""}
                </a>
                {selecionados.length > 0 && (
                  <button onClick={() => setSelecionados([])} style={{ display: "block", width: "100%", marginTop: 10, padding: "10px", borderRadius: 8, fontFamily: "Montserrat, sans-serif", fontSize: 12, border: "1px solid #ddd", backgroundColor: "transparent", color: "#666", cursor: "pointer" }}>
                    Limpar selecao
                  </button>
                )}
                <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 11, color: "#888", textAlign: "center", margin: "12px 0 0", lineHeight: 1.4 }}>
                  Resposta em menos de 24h
                </p>
              </div>
            </div>

          </div>
        </section>

        <section style={{ backgroundColor: "#F5F2F0", padding: "64px 16px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{ width: 36, height: 3, backgroundColor: "#F25C05", margin: "0 auto 16px", borderRadius: 2 }} />
              <h2 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 900, fontSize: "clamp(22px, 4vw, 32px)", color: "#1A1A1A", margin: "0 0 12px" }}>
                Resultados reais. Sempre.
              </h2>
              <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, color: "#4A4A4A", margin: 0 }}>
                Trabalhos reais com clientes reais. Cada projeto com impacto mensuravel.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {fotos.map((foto) => (
                <div key={foto.src} style={{ position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: "1", backgroundColor: "#e0ddd9" }}>
                  <img src={foto.src} alt={foto.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 16px", background: "linear-gradient(transparent, rgba(0,0,0,0.55))" }}>
                    <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 12, color: "#ffffff" }}>{foto.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <CTAFooterSection />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
