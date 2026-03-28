import { motion } from "motion/react";
import { WHATSAPP_LINK } from "../lib/constants";
 
const packs = [
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
 
export function ServicosSection() {
  return (
    <section style={{ backgroundColor: "#F5F2F0", padding: "48px 16px" }}>
      <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto 28px" }}>
        <div style={{ width: 36, height: 3, backgroundColor: "#F25C05", margin: "0 auto 10px", borderRadius: 2 }} />
        <h2 style={{
          fontFamily: "Montserrat, sans-serif",
          fontWeight: 900,
          fontSize: "clamp(20px, 3vw, 28px)",
          color: "#1A1A1A",
          lineHeight: 1.2,
          margin: "0 0 8px"
        }}>
          Packs de presença digital
          <br />
          <span style={{ color: "#F22283" }}>pagamento único</span>
        </h2>
        <p style={{
          fontFamily: "Montserrat, sans-serif",
          fontWeight: 400,
          fontSize: 12,
          color: "#4A4A4A",
          margin: "0 0 12px",
          lineHeight: 1.4
        }}>
          Investimento <span style={{ textDecoration: "underline", textDecorationColor: "#F25C05" }}>único</span>. Sem mensalidades. Sem surpresas.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6 }}>
          {["Sem Contratos", "Pagamento Único", "Sem Taxas Ocultas"].map(t => (
            <span key={t} style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 700,
              fontSize: 9,
              backgroundColor: "#ffffff",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 14,
              padding: "2px 8px",
              color: "#4A4A4A"
            }}>✓ {t}</span>
          ))}
        </div>
      </div>
 
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center", maxWidth: 1000, margin: "0 auto" }}>
        {packs.map((pack, i) => (
          <motion.div
            key={pack.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.08 }}
            whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}
            style={{
              flex: "1 1 220px",
              maxWidth: 255,
              backgroundColor: "#ffffff",
              borderRadius: 12,
              padding: "20px 16px",
              boxShadow: pack.highlight ? "0 4px 16px rgba(242,34,131,0.12)" : "0 4px 12px rgba(0,0,0,0.07)",
              border: pack.highlight ? "2px solid #F22283" : "2px solid transparent",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              position: "relative",
            }}
          >
            {pack.highlight && (
              <div style={{
                position: "absolute", top: -8, left: 16,
                backgroundColor: "#F22283", color: "#fff",
                fontFamily: "Montserrat, sans-serif", fontWeight: 700,
                fontSize: 8, letterSpacing: 1, padding: "2px 8px",
                borderRadius: 10, textTransform: "uppercase"
              }}>
                Popular
              </div>
            )}
 
            {/* SEM o label "Pagamento único" no card — já está no cabeçalho */}
 
            <span style={{
              fontFamily: "Montserrat, sans-serif", fontWeight: 700,
              fontSize: 9, letterSpacing: 1.5, color: "#F25C05",
              textTransform: "uppercase"
            }}>
              {pack.label}
            </span>
 
            <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
              <span style={{
                fontFamily: "Montserrat, sans-serif", fontWeight: 900,
                fontSize: 34, color: "#1A1A1A", lineHeight: 1
              }}>{pack.price}{(pack as any).priceExtra || ""}€</span>
              <span style={{
                fontFamily: "Montserrat, sans-serif", fontWeight: 400,
                fontSize: 11, color: "#4A4A4A"
              }}>+ IVA</span>
            </div>
 
            <p style={{
              fontFamily: "Montserrat, sans-serif", fontWeight: 600,
              fontSize: 12, color: "#1A1A1A", margin: 0
            }}>{pack.name}</p>
 
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "5px 9px", borderRadius: 6,
              backgroundColor: pack.domain ? "rgba(37,211,102,0.08)" : "rgba(242,92,5,0.08)",
              border: pack.domain ? "1px solid rgba(37,211,102,0.2)" : "1px solid rgba(242,92,5,0.2)"
            }}>
              <span style={{ fontSize: 11 }}>{pack.domain ? "✓" : "✗"}</span>
              <span style={{
                fontFamily: "Montserrat, sans-serif", fontWeight: 700,
                fontSize: 10, color: pack.domain ? "#25D366" : "#F25C05"
              }}>
                {pack.domain ? "Domínio próprio" : "Sem domínio próprio"}
              </span>
            </div>
 
            <div style={{ height: 1, backgroundColor: "#eeeeee" }} />
 
            <ul style={{
              listStyle: "none", padding: 0, margin: 0,
              display: "flex", flexDirection: "column", gap: 5, flex: 1
            }}>
              {pack.features.map((f) => (
                <li key={f} style={{
                  fontFamily: "Montserrat, sans-serif", fontWeight: 400,
                  fontSize: 11, color: "#1A1A1A",
                  display: "flex", alignItems: "flex-start", gap: 5
                }}>
                  <span style={{ color: "#F22283", fontWeight: 700, flexShrink: 0, fontSize: 10 }}>✓</span>
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
                padding: "9px 14px", borderRadius: 8,
                fontFamily: "Montserrat, sans-serif", fontWeight: 700,
                fontSize: 12, textDecoration: "none",
                backgroundColor: pack.highlight ? "#F22283" : "#1A1A1A",
                color: "#ffffff"
              }}
            >
              {pack.cta}
            </a>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
