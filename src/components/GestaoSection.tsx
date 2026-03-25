import { motion } from "motion/react";
import { WHATSAPP_LINK } from "../lib/constants";

const plans = [
  {
    id: "essencial",
    label: "Essencial",
    price: "79",
    desc: "Para negócios que querem começar a marcar presença online com consistência.",
    features: [
      "Meta Business Suite — Facebook e Instagram",
      "Google Business + Google Maps",
      "5 posts mensais",
      "Gestão de mensagens e reviews",
      "Relatório mensal básico",
      "Suporte via E-mail e WhatsApp",
    ],
    cta: "Começar agora",
    highlight: false,
  },
  {
    id: "crescimento",
    label: "Crescimento",
    price: "149",
    desc: "Para negócios que querem crescer com estratégia, conteúdo e resultados reais.",
    features: [
      "Tudo do Essencial, melhorado",
      "12 posts mensais em 2–3 redes",
      "1 Campanha paga (Meta Ads ou Google Ads)",
      "2 designs profissionais / mês",
      "Análise de concorrentes + métricas Excel",
      "E-mail marketing automatizado",
      "Relatório + call mensal de 30 min",
      "Suporte prioritário E-mail e WhatsApp",
    ],
    cta: "Falar connosco",
    highlight: true,
  },
  {
    id: "autoridade",
    label: "Autoridade",
    price: "297",
    desc: "Solução completa para negócios que querem dominar a sua área local.",
    features: [
      "Tudo do Crescimento, ampliado",
      "20+ posts mensais em 3 redes",
      "2–3 campanhas pagas em simultâneo",
      "IA com respostas automáticas inteligentes",
      "Sessão mensal de foto ou vídeo",
      "5 designs profissionais / mês",
      "Consultoria estratégica 2h + plano trimestral",
      "Dashboard avançado + 2 calls mensais",
      "Suporte VIP com resposta imediata",
    ],
    cta: "Quero o Autoridade",
    highlight: false,
  },
];

export default function GestaoSection() {
  return (
    <section style={{ backgroundColor: "#FAFAFA", padding: "80px 24px" }}>
      <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 56px" }}>
        <div style={{ width: 48, height: 3, backgroundColor: "#F25C05", margin: "0 auto 20px", borderRadius: 2 }} />
        <h2 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 900, fontSize: "clamp(28px, 4vw, 40px)", color: "#1A1A1A", lineHeight: 1.2, margin: "0 0 16px" }}>
          Gestão de redes sociais<br />
          <span style={{ color: "#F22283" }}>sem complicações</span>
        </h2>
        <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400, fontSize: 16, color: "#4A4A4A", margin: 0, lineHeight: 1.6 }}>
          Escolhe o plano certo para o teu negócio. Sem contratos longos, sem letra pequena.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center", maxWidth: 1100, margin: "0 auto" }}>
        {plans.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            whileHover={{ y: -6, boxShadow: "0 16px 40px rgba(0,0,0,0.10)" }}
            style={{
              flex: "1 1 300px",
              maxWidth: 340,
              backgroundColor: "#ffffff",
              borderRadius: 16,
              padding: "36px 28px",
              boxShadow: plan.highlight ? "0 4px 24px rgba(242,34,131,0.12)" : "0 4px 20px rgba(0,0,0,0.07)",
              border: plan.highlight ? "2px solid #F22283" : "2px solid transparent",
              display: "flex",
              flexDirection: "column",
              gap: 20,
              position: "relative",
            }}
          >
            {plan.highlight && (
              <div style={{ position: "absolute", top: -13, left: 24, backgroundColor: "#F22283", color: "#fff", fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: 2, padding: "4px 12px", borderRadius: 20, textTransform: "uppercase" }}>
                Mais Popular
              </div>
            )}
            <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: 2, color: "#F25C05", textTransform: "uppercase" }}>
              {plan.label}
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 900, fontSize: 48, color: "#1A1A1A", lineHeight: 1 }}>{plan.price}€</span>
              <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400, fontSize: 13, color: "#4A4A4A" }}>/mês + IVA</span>
            </div>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400, fontSize: 14, color: "#4A4A4A", margin: 0, lineHeight: 1.6 }}>{plan.desc}</p>
            <div style={{ height: 1, backgroundColor: "#eeeeee" }} />
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
              {plan.features.map((f) => (
                <li key={f} style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 400, fontSize: 14, color: "#1A1A1A", display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: "#F22283", fontWeight: 700, flexShrink: 0 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
            
              <a
              href={`${WHATSAPP_LINK}?text=Olá, tenho interesse no plano ${plan.label}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginTop: "auto", display: "block", textAlign: "center", padding: "14px 24px", borderRadius: 8, fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 14, textDecoration: "none", backgroundColor: plan.highlight ? "#F22283" : "#1A1A1A", color: "#ffffff" }}
            >
              {plan.cta}
            </a>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
