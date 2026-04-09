import { Navbar } from '../components/Navbar';
import { motion } from "motion/react";
import { WHATSAPP_LINK } from "../lib/constants";
import { packs } from "../data/packs";

// Monthly packs (ongoing management)
const plansMensais = [
  {
    id: "essencial-mensal",
    label: "Essential",
    price: "79",
    desc: "Start building your online presence.",
    features: [
      "Meta Business Suite — Facebook and Instagram",
      "Optimised business profile",
      "5 posts per month",
      "Message management",
      "Monthly report",
      "Support via WhatsApp",
    ],
    cta: "Get started",
    highlight: false,
  },
  {
    id: "crescimento",
    label: "Growth",
    price: "149",
    desc: "Grow with strategy and real results.",
    features: [
      "Everything in Essential",
      "12 posts per month",
      "1 paid campaign",
      "2 designs / month",
      "Competitor analysis",
      "Email marketing",
      "30-minute monthly call",
    ],
    cta: "Talk to us",
    highlight: true,
  },
  {
    id: "autoridade",
    label: "Authority",
    price: "297",
    desc: "Lead your local market.",
    features: [
      "Everything in Growth",
      "20+ posts per month",
      "2–3 paid campaigns",
      "AI-powered auto replies",
      "Monthly photo/video session",
      "5 designs / month",
      "2h consulting",
      "VIP support",
    ],
    cta: "I want Authority",
    highlight: false,
  },
];

export function Packs() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="pt-28 pb-20">

        {/* Section 1: one-off packs */}
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
              Digital presence packs
              <br />
              <span style={{ color: "#F22283" }}>One-time payment</span>
            </h1>
            <p style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 400,
              fontSize: 14,
              color: "#4A4A4A",
              margin: "0 0 16px",
              lineHeight: 1.5
            }}>
              <span style={{ textDecoration: "underline", textDecorationColor: "#F25C05" }}>One-time</span> investment. No monthly fees. No surprises.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
              {["No long contracts", "One-time payment", "No hidden fees"].map(t => (
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
            {packs.map((pack, i) => (
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
                    Most popular
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
                  }}>+ VAT</span>
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
                    {pack.domain ? "Custom domain included" : "No custom domain"}
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
                  href={`${WHATSAPP_LINK}?text=Hi, I'm interested in the ${pack.label} pack at €${pack.price}.`}
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

        <div style={{ height: 80 }} />

        {/* Section 2: monthly packs */}
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
              Monthly packs
              <br />
              <span style={{ color: "#F22283" }}>Ongoing management</span>
            </h2>
            <p style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 400,
              fontSize: 14,
              color: "#4A4A4A",
              margin: 0,
              lineHeight: 1.5
            }}>
              Monthly subscription. No long contracts. Cancel anytime.
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
                    Most popular
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
                    /mo
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
                  href={`${WHATSAPP_LINK}?text=Hi, I'm interested in the ${plan.label} monthly plan`}
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
