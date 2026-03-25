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
      "Google Business otimizado + Google Maps",
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
      "Tudo do Pack Essencial, melhorado",
      "Página web catálogo até 5 páginas",
      "Integração Meta Business",
      "SEO local + OLX Business setup",
      "Diagnóstico completo de 3 redes sociais",
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
      "Tudo do Pack Premium, expandido",
      "Página web profissional até 10 páginas",
      "Domínio próprio incluído",
      "Email profissional com domínio",
      "Google Ads setup + €100 crédito incluído",
      "IA Agents — automação de respostas",
      "10 Fotos profissionais + edição",
      "3 Banners + 5 Posters",
      "Dashboard Excel de métricas + consultoria inicial",
    ],
    cta: "Começar Agora",
  },
  {
    id: "total",
    label: "Pack Total",
    name: "Presença Total",
    price: "499+",
    highlight: false,
    domain: true,
    features: [
      "Tudo do Pack Completo, expandido",
      "Página web custom + e-commerce",
      "Google + Facebook + Instagram Ads setup",
      "IA Agents avançados — chatbot integrado",
      "Automação completa de processos",
      "20+ Fotos/vídeos profissionais",
      "Campanha visual completa",
      "Consultoria estratégica 3h + suporte técnico 3 meses",
    ],
    cta: "Começar",
  },
];

export function ServicosSection() {
  return (
    <section style={{ backgroundColor: "#F5F2F0", padding: "80px 24px" }}>
      <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 56px" }}>
        <div style={{ width: 48, height: 3, backgroundColor: "#F25C05", margin: "0 auto 20px", borderRadius: 2 }} />
        <h2 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 900, fontSize: "clamp(28px, 4vw, 40px)", color: "#1A1A1A", lineHeight: 1.2, margin: "0 0 16px" }}>
          Packs de presença digital
          <br />
          <span style={{ color: "#F22283" }}>pagamento único</span>
        </h2>
        <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400, fontSize: 16, color: "#4A4A4A", margin: "0 0 24px", lineHeight: 1.6 }}>
          Investimento <span style={{ textDecoration: "underline", textDecorationColor: "#F25C05" }}>único</span>. Sem mensalidades. Sem surpresas.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
          {["Sem Contratos", "Pagamento Único", "Sem Taxas Ocultas"].map(t => (
            <span key={t} style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 12, backgroundColor: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 20, padding: "4px 14px", color: "#4A4A4A" }}>✓ {t}</span>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center", maxWidth: 1300, margin: "0 auto" }}>
        {packs.map((pack, i) => (
          <motion.div
            key={pack.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            whileHover={{ y: -6, boxShadow: "0 16px 40px rgba(0,0,0,0.10)" }}
            style={{
              flex: "1 1 260px",
              maxWidth: 300,
              backgroundColor: "#ffffff",
              borderRadius: 16,
              padding: "36px 28px",
              boxShadow: pack.highlight ? "0 4px 24px rgba(242,34,131,0.12)" : "0 4px 20px rgba(0,0,0,0.07)",
              border: pack.highlight ? "2px solid #F22283" : "2px solid transparent",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              position: "relative",
            }}
          >
            {pack.highlight && (
              <div style={{ position: "absolute", top: -13, left: 24, backgroundColor: "#F22283", color: "#fff", fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: 2, padding: "4px 12px", borderRadius: 20, textTransform: "uppercase" }}>
                Mais Procurado
              </div>
            )}

            <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: 2, color: "#4A4A4A", textTransform: "uppercase", backgroundColor: "#F5F2F0", padding: "3px 10px", borderRadius: 20, alignSelf: "flex-start" }}>
              Pagamento único
            </span>

            <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: 2, color: "#F25C05", textTransform: "uppercase" }}>
              {pack.label}
            </span>

            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 900, fontSize: 48, color: "#1A1A1A", lineHeight: 1 }}>{pack.price}€</span>
              <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400, fontSize: 13, color: "#4A4A4A" }}>+ IVA</span>
            </div>

            <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 15, color: "#1A1A1A", margin: 0 }}>{pack.name}</p>

            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 8, backgroundColor: pack.domain ? "rgba(37,211,102,0.08)" : "rgba(242,92,5,0.08)", border: pack.domain ? "1px solid rgba(37,211,102,0.2)" : "1px solid rgba(242,92,5,0.2)" }}>
              <span style={{ fontSize: 14 }}>{pack.domain ? "✓" : "✗"}</span>
              <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 12, color: pack.domain ? "#25D366" : "#F25C05" }}>
                {pack.domain ? "Domínio próprio incluído" : "Sem domínio próprio"}
              </span>
            </div>

            <div style={{ height: 1, backgroundColor: "#eeeeee" }} />

            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
              {pack.features.map((f) => (
                <li key={f} style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400, fontSize: 13, color: "#1A1A1A", display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: "#F22283", fontWeight: 700, flexShrink: 0 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <a
              href={`${WHATSAPP_LINK}?text=Olá, tenho interesse no ${pack.label} de €${pack.price}.`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginTop: "auto", display: "block", textAlign: "center", padding: "14px 24px", borderRadius: 8, fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 14, textDecoration: "none", backgroundColor: pack.highlight ? "#F22283" : "#1A1A1A", color: "#ffffff" }}
            >
              {pack.cta}
            </a>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
