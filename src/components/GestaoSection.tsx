import { motion } from "motion/react";
import { WHATSAPP_LINK } from "../lib/constants";

const plans = [
  {
    id: "essencial",
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

export default function GestaoSection() {
  return (
    <section style={{ backgroundColor: "#FAFAFA", padding: "48px 16px" }}>
      <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 32px" }}>
        <div style={{ width: 40, height: 3, backgroundColor: "#F25C05", margin: "0 auto 12px", borderRadius: 2 }} />
        <h2 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 900, fontSize: "clamp(22px, 3.5vw, 32px)", color: "#1A1A1A", lineHeight: 1.2, margin: "0 0 8px" }}>
          Conheça os nossos packs mensais
        </h2>
        <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400, fontSize: 13, color: "#4A4A4A", margin: 0, lineHeight: 1.4 }}>
          Escolhe o plano certo. Sem contratos longos. Promoções para novos clientes.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center", maxWidth: 960, margin: "0 auto" }}>
        {plans.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.08 }}
            whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}
            style={{
              flex: "1 1 280px",
              maxWidth: 300,
              backgroundColor: "#ffffff",
              borderRadius: 12,
              padding: "20px 16px",
              boxShadow: plan.highlight ? "0 4px 16px rgba(242,34,131,0.12)" : "0 4px 12px rgba(0,0,0,0.07)",
              border: plan.highlight ? "2px solid #F22283" : "2px solid transparent",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              position: "relative",
            }}
          >
            {plan.highlight && (
              <div style={{ position: "absolute", top: -8, left: 16, backgroundColor: "#F22283", color: "#fff", fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 8, letterSpacing: 1, padding: "2px 8px", borderRadius: 10, textTransform: "uppercase" }}>
                Popular
              </div>
            )}
            <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: 1.5, color: "#F25C05", textTransform: "uppercase" }}>
              {plan.label}
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 900, fontSize: 32, color: "#1A1A1A", lineHeight: 1 }}>{plan.price}€</span>
              <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400, fontSize: 11, color: "#4A4A4A" }}>/mês</span>
            </div>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400, fontSize: 12, color: "#4A4A4A", margin: 0, lineHeight: 1.4 }}>{plan.desc}</p>
            <div style={{ height: 1, backgroundColor: "#eeeeee" }} />
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
              {plan.features.map((f) => (
                <li key={f} style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400, fontSize: 12, color: "#1A1A1A", display: "flex", alignItems: "flex-start", gap: 6 }}>
                  <span style={{ color: "#F22283", fontWeight: 700, flexShrink: 0, fontSize: 10 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
            
            <a
              href={`${WHATSAPP_LINK}?text=Olá, tenho interesse no plano ${plan.label}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginTop: "auto", display: "block", textAlign: "center", padding: "10px 16px", borderRadius: 8, fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 12, textDecoration: "none", backgroundColor: plan.highlight ? "#F22283" : "#1A1A1A", color: "#ffffff" }}
            >
              {plan.cta}
            </a>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
