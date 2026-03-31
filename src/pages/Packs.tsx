import { Navbar } from '../components/Navbar';
import { motion } from "motion/react";
import { WHATSAPP_LINK } from "../lib/constants";

// Packs de Pagamento Único (Presença Digital)
const packsUnico = [
  {
    id: "essencial",
    label: "Pack Essencial",
    name: "Presença Online",
    price: "49",
    highlight: false,
    domain: false,
    features: [
      "Landing page profissional",
      "Google Business + Google Maps",
      "Integração WhatsApp Business",
      "3 Fotos de produto/serviço",
      "Diagnóstico básico de 1 rede social",
    ],
    cta: "Começar",
  },
  {
    id: "premium",
    label: "Pack Premium",
    name: "Presença Premium",
    price: "148",
    highlight: false,
    domain: false,
    features: [
      "Tudo do Pack Essencial",
      "Página web catálogo até 5 páginas",
      "Integração Meta Business",
      "SEO local + OLX Business",
      "Diagnóstico 3 redes sociais",
      "5 Fotos profissionais + 1 Banner",
    ],
    cta: "Começar",
  },
  {
    id: "completo",
    label: "Pack Completo",
    name: "Presença Completa",
    price: "350",
    highlight: true,
    domain: true,
    features: [
      "Tudo do Pack Premium",
      "Página web até 10 páginas",
      "Domínio próprio incluído",
      "Email profissional com domínio",
      "Google Ads setup + €100 crédito",
      "IA Agents — automação",
      "10 Fotos profissionais + edição",
      "3 Banners + 5 Posters",
      "Dashboard Excel + consultoria",
    ],
    cta: "Começar Agora",
  },
  {
    id: "total",
    label: "Pack Total",
    name: "Presença Total",
    price: "499",
    priceExtra: "+",
    highlight: false,
    domain: true,
    features: [
      "Tudo do Pack Completo",
      "Página web custom + e-commerce",
      "Google + Facebook + Instagram Ads",
      "IA Agents avançados — chatbot",
      "Automação completa de processos",
      "20+ Fotos/vídeos profissionais",
      "Campanha visual completa",
      "Consultoria estratégica 3h + suporte 3 meses",
    ],
    cta: "Começar",
  },
];

// Packs Mensais (Gestão Contínua)
const plansMensais = [
  {
    id: "essencial-mensal",
    label: "Essencial",
    price: "79",
    desc: "Para começar a marcar presença online.",
    features: [
      "Meta Business Suite — Facebook e Instagram",
      "Google Business + Google Maps",
      "5 posts mensais",
      "Gestão de mensagens",
      "Relatório mensal",
      "Suporte via WhatsApp",
    ],
    cta: "Começar",
    highlight: false,
  },
  {
    id: "crescimento",
    label: "Crescimento",
    price: "149",
    desc: "Crescer com estratégia e resultados reais.",
    features: [
      "Tudo do Essencial",
      "12 posts mensais",
      "1 Campanha paga",
      "2 designs / mês",
      "Análise de concorrentes",
      "E-mail marketing",
      "Call mensal 30min",
    ],
    cta: "Falar connosco",
    highlight: true,
  },
  {
    id: "autoridade",
    label: "Autoridade",
    price: "297",
    desc: "Domina a sua área local.",
    features: [
      "Tudo do Crescimento",
      "20+ posts mensais",
      "2–3 campanhas pagas",
      "IA respostas automáticas",
      "Sessão foto/vídeo mensal",
      "5 designs / mês",
      "Consultoria 2h",
      "Suporte VIP",
    ],
    cta: "Quero Autoridade",
    highlight: false,
  },
];

export function Packs() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="pt-28 pb-20">
        
        {/* SECCIÓN 1: PACKS PAGAMENTO ÚNICO */}
        <section style={{ backgroundColor: "#F5F2F0", padding: "64px 16px" }}>
          <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 32px" }}>
            <div style={{ width: 40, height: 3, backgroundColor: "#F25C05", margin: "0 auto 12px", borderRadius: 2 }} />
            <h1 style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 900,
              fontSize: "clamp(24px, 4vw, 36px)",
              color: "#1A1A1A",
              lineHeight: 1.2,
              margin: "0 0 8px"
            }}>
              Packs de Presença Digital
              <br />
              <span style={{ color: "#F22283" }}>Pagamento Único</span>
            </h1>
            <p style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 400,
              fontSize: 14,
              color: "#4A4A4A",
              margin: "0 0 16px",
              lineHeight: 1.5
            }}>
              Investimento <span style={{ textDecoration: "underline", textDecorationColor: "#F25C05" }}>único</span>. Sem mensalidades. Sem surpresas.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
              {["Sem Contratos", "Pagamento Único", "Sem Taxas Ocultas"].map(t => (
                <span key={t} style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 700,
                  fontSize: 10,
                  backgroundColor: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: 14,
                  padding: "4px 10px",
                  color: "#4A4A4A"
                }}>✓ {t}</span>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "center", maxWidth: 1100, margin: "0 auto" }}>
            {packsUnico.map((pack, i) => (
              <motion.div
                key={pack.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                whileHover={{ y: -5, boxShadow: "0 12px 32px rgba(0,0,0,0.12)" }}
                style={{
                  flex: "1 1 250px",
                  maxWidth: 280,
                  backgroundColor: "#ffffff",
                  borderRadius: 16,
                  padding: "24px 20px",
                  boxShadow: pack.highlight ? "0 8px 24px rgba(242,34,131,0.15)" : "0 4px 16px rgba(0,0,0,0.08)",
                  border: pack.highlight ? "2px solid #F22283" : "2px solid transparent",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  position: "relative",
                }}
              >
                {pack.highlight && (
                  <div style={{
                    position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
                    backgroundColor: "#F22283", color: "#fff",
                    fontFamily: "Montserrat, sans-serif", fontWeight: 700,
                    fontSize: 10, letterSpacing: 1, padding: "4px 12px",
                    borderRadius: 12, textTransform: "uppercase",
                    boxShadow: "0 2px 8px rgba(242,34,131,0.3)"
                  }}>
                    Mais Popular
                  </div>
                )}

                <span style={{
                  fontFamily: "Montserrat, sans-serif", fontWeight: 700,
                  fontSize: 11, letterSpacing: 1.5, color: "#F25C05",
                  textTransform: "uppercase"
                }}>
                  {pack.label}
                </span>

                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{
                    fontFamily: "Montserrat, sans-serif", fontWeight: 900,
                    fontSize: 36, color: "#1A1A1A", lineHeight: 1
                  }}>{pack.price}{(pack as any).priceExtra || ""}€</span>
                  <span style={{
                    fontFamily: "Montserrat, sans-serif", fontWeight: 400,
                    fontSize: 12, color: "#4A4A4A"
                  }}>+ IVA</span>
                </div>

                <p style={{
                  fontFamily: "Montserrat, sans-serif", fontWeight: 600,
                  fontSize: 14, color: "#1A1A1A", margin: 0
                }}>{pack.name}</p>

                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 10px", borderRadius: 6,
                  backgroundColor: pack.domain ? "rgba(37,211,102,0.08)" : "rgba(242,92,5,0.08)",
                  border: pack.domain ? "1px solid rgba(37,211,102,0.2)" : "1px solid rgba(242,92,5,0.2)"
                }}>
                  <span style={{ fontSize: 12 }}>{pack.domain ? "✓" : "✗"}</span>
                  <span style={{
                    fontFamily: "Montserrat, sans-serif", fontWeight: 700,
                    fontSize: 11, color: pack.domain ? "#25D366" : "#F25C05"
                  }}>
                    {pack.domain ? "Domínio próprio incluído" : "Sem domínio próprio"}
                  </span>
                </div>

                <div style={{ height: 1, backgroundColor: "#eeeeee", margin: "4px 0" }} />

                <ul style={{
                  listStyle: "none", padding: 0, margin: 0,
                  display: "flex", flexDirection: "column", gap: 6, flex: 1
                }}>
                  {pack.features.map((f) => (
                    <li key={f} style={{
                      fontFamily: "Montserrat, sans-serif", fontWeight: 400,
                      fontSize: 12, color: "#1A1A1A",
                      display: "flex", alignItems: "flex-start", gap: 6,
                      lineHeight: 1.4
                    }}>
                      <span style={{ color: "#F22283", fontWeight: 700, flexShrink: 0, fontSize: 12, marginTop: 2 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href={`${WHATSAPP_LINK}?text=Olá, tenho interesse no ${pack.label} de €${pack.price}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    marginTop: "auto", display: "block", textAlign: "center",
                    padding: "12px 16px", borderRadius: 10,
                    fontFamily: "Montserrat, sans-serif", fontWeight: 700,
                    fontSize: 13, textDecoration: "none",
                    backgroundColor: pack.highlight ? "#F22283" : "#1A1A1A",
                    color: "#ffffff",
                    transition: "all 0.2s ease",
                    boxShadow: pack.highlight ? "0 4px 12px rgba(242,34,131,0.3)" : "none"
                  }}
                >
                  {pack.cta}
                </a>
              </motion.div>
            ))}
          </div>
        </section>

        {/* DIVISOR */}
        <div style={{ height: 80 }} />

        {/* SECCIÓN 2: PACKS MENSAIS */}
        <section style={{ backgroundColor: "#FAFAFA", padding: "64px 16px" }}>
          <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 32px" }}>
            <div style={{ width: 40, height: 3, backgroundColor: "#F25C05", margin: "0 auto 12px", borderRadius: 2 }} />
            <h2 style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 900,
              fontSize: "clamp(24px, 4vw, 36px)",
              color: "#1A1A1A",
              lineHeight: 1.2,
              margin: "0 0 8px"
            }}>
              Packs Mensais
              <br />
              <span style={{ color: "#F22283" }}>Gestão Contínua</span>
            </h2>
            <p style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 400,
              fontSize: 14,
              color: "#4A4A4A",
              margin: 0,
              lineHeight: 1.5
            }}>
              Subscrição mensal. Sem contratos longos. Cancela quando quiseres.
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center", maxWidth: 1000, margin: "0 auto" }}>
            {plansMensais.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                whileHover={{ y: -5, boxShadow: "0 12px 32px rgba(0,0,0,0.12)" }}
                style={{
                  flex: "1 1 300px",
                  maxWidth: 320,
                  backgroundColor: "#ffffff",
                  borderRadius: 16,
                  padding: "28px 24px",
                  boxShadow: plan.highlight ? "0 8px 24px rgba(242,34,131,0.15)" : "0 4px 16px rgba(0,0,0,0.08)",
                  border: plan.highlight ? "2px solid #F22283" : "2px solid transparent",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  position: "relative",
                }}
              >
                {plan.highlight && (
                  <div style={{ 
                    position: "absolute", 
                    top: -10, 
                    left: "50%", 
                    transform: "translateX(-50%)", 
                    backgroundColor: "#F22283", 
                    color: "#fff", 
                    fontFamily: "Montserrat, sans-serif", 
                    fontWeight: 700, 
                    fontSize: 10, 
                    letterSpacing: 1, 
                    padding: "4px 12px", 
                    borderRadius: 12, 
                    textTransform: "uppercase",
                    boxShadow: "0 2px 8px rgba(242,34,131,0.3)"
                  }}>
                    Mais Popular
                  </div>
                )}
                
                <span style={{ 
                  fontFamily: "Montserrat, sans-serif", 
                  fontWeight: 700, 
                  fontSize: 11, 
                  letterSpacing: 1.5, 
                  color: "#F25C05", 
                  textTransform: "uppercase" 
                }}>
                  {plan.label}
                </span>
                
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ 
                    fontFamily: "Montserrat, sans-serif", 
                    fontWeight: 900, 
                    fontSize: 40, 
                    color: "#1A1A1A", 
                    lineHeight: 1 
                  }}>
                    {plan.price}€
                  </span>
                  <span style={{ 
                    fontFamily: "Montserrat, sans-serif", 
                    fontWeight: 400, 
                    fontSize: 14, 
                    color: "#4A4A4A" 
                  }}>
                    /mês
                  </span>
                </div>
                
                <p style={{ 
                  fontFamily: "Montserrat, sans-serif", 
                  fontWeight: 400, 
                  fontSize: 14, 
                  color: "#4A4A4A", 
                  margin: 0, 
                  lineHeight: 1.5,
                  minHeight: 40
                }}>
                  {plan.desc}
                </p>
                
                <div style={{ height: 1, backgroundColor: "#eeeeee", margin: "8px 0" }} />
                
                <ul style={{ 
                  listStyle: "none", 
                  padding: 0, 
                  margin: 0, 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: 10, 
                  flex: 1 
                }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ 
                      fontFamily: "Montserrat, sans-serif", 
                      fontWeight: 400, 
                      fontSize: 14, 
                      color: "#1A1A1A", 
                      display: "flex", 
                      alignItems: "flex-start", 
                      gap: 10,
                      lineHeight: 1.4
                    }}>
                      <span style={{ 
                        color: "#F22283", 
                        fontWeight: 700, 
                        flexShrink: 0, 
                        fontSize: 14,
                        marginTop: 2
                      }}>
                        ✓
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                
                <a
                  href={`${WHATSAPP_LINK}?text=Olá, tenho interesse no plano ${plan.label}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    marginTop: "auto", 
                    display: "block", 
                    textAlign: "center", 
                    padding: "14px 20px", 
                    borderRadius: 10, 
                    fontFamily: "Montserrat, sans-serif", 
                    fontWeight: 700, 
                    fontSize: 14, 
                    textDecoration: "none", 
                    backgroundColor: plan.highlight ? "#F22283" : "#1A1A1A", 
                    color: "#ffffff",
                    transition: "all 0.2s ease",
                    boxShadow: plan.highlight ? "0 4px 12px rgba(242,34,131,0.3)" : "none"
                  }}
                >
                  {plan.cta}
                </a>
              </motion.div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
