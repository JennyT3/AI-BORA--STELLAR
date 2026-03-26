import { useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────
//  DESIGN TOKEN — The Prismatic Editorial
// ─────────────────────────────────────────────
const C = {
  fuchsia: "#cb1a74",
  fuchsiaNeon: "#FF00FF",
  orange: "#ff6f2e",
  orangeDeep: "#FD8B00",
  red: "#fb4a50",
  green: "#79FF5B",
  bg: "#FFFFFF",
  surface: "#F9F9F9",
  surfaceLow: "#F3F3F4",
  text: "#1A1C1C",
  textMuted: "#564052",
  ghostBorder: "rgba(203,26,116,0.15)",
};

// ─────────────────────────────────────────────
//  DATA
// ─────────────────────────────────────────────
const SERVICES = [
  {
    id: "ia",
    icon: "✦",
    label: "IA & Automação",
    color: C.fuchsia,
    accent: C.fuchsiaNeon,
    desc: "Sistemas inteligentes que evoluem com o seu negócio.",
    col: 2,
    row: 1,
  },
  {
    id: "social",
    icon: "◈",
    label: "Gestão de Redes Sociais",
    color: C.orange,
    accent: C.orangeDeep,
    desc: "Presença consistente e estratégica em todos os canais.",
    col: 1,
    row: 1,
  },
  {
    id: "presenca",
    icon: "◉",
    label: "Presença Digital",
    color: C.green,
    accent: "#106E00",
    desc: "Identidade digital que domina os motores de busca.",
    col: 3,
    row: 1,
  },
  {
    id: "pub",
    icon: "▲",
    label: "Publicidade Paga",
    color: C.fuchsia,
    accent: C.orange,
    desc: "Campanhas de ROI maximizado, zero desperdício.",
    col: 1,
    row: 2,
  },
  {
    id: "conteudo",
    icon: "⬡",
    label: "Conteúdo Visual",
    color: C.red,
    accent: C.orange,
    desc: "Activos visuais premium que param o scroll.",
    col: 3,
    row: 2,
  },
  {
    id: "estrategia",
    icon: "◆",
    label: "Estratégia & Análise",
    color: C.orange,
    accent: C.fuchsia,
    desc: "Dados transformados em decisões de negócio.",
    col: 2,
    row: 2,
  },
];

// ─────────────────────────────────────────────
//  3D LOGO SVG  (modular cube / arrow form — fuchsia→orange)
// ─────────────────────────────────────────────
function Logo3D({ size = 120 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: "drop-shadow(0 20px 40px rgba(203,26,116,0.35))" }}
    >
      <defs>
        <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#cb1a74" />
          <stop offset="50%" stopColor="#e8483a" />
          <stop offset="100%" stopColor="#ff6f2e" />
        </linearGradient>
        <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a8005f" />
          <stop offset="100%" stopColor="#cc4a00" />
        </linearGradient>
        <linearGradient id="g3" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff9050" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#e0306a" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* Top-left cube */}
      <rect x="20" y="20" width="68" height="68" rx="8" fill="url(#g1)" />
      <rect x="20" y="20" width="68" height="68" rx="8" fill="url(#g2)" opacity="0.25" />

      {/* Diagonal bar */}
      <path
        d="M72 72 L160 20 L180 40 L92 92 Z"
        fill="url(#g1)"
      />
      <path
        d="M72 112 L160 160 L140 180 L52 132 Z"
        fill="url(#g1)"
      />

      {/* Center cut-out window (glass) */}
      <rect
        x="88"
        y="88"
        width="44"
        height="44"
        rx="6"
        fill="white"
        opacity="0.22"
        style={{ backdropFilter: "blur(8px)" }}
      />

      {/* Bottom-right cube */}
      <rect x="112" y="112" width="68" height="68" rx="8" fill="url(#g1)" />
      <rect x="112" y="112" width="68" height="68" rx="8" fill="url(#g3)" opacity="0.3" />

      {/* Edge highlights */}
      <rect x="20" y="20" width="68" height="4" rx="2" fill="white" opacity="0.4" />
      <rect x="20" y="20" width="4" height="68" rx="2" fill="white" opacity="0.3" />
      <rect x="112" y="176" width="68" height="4" rx="2" fill="white" opacity="0.2" />
    </svg>
  );
}

// ─────────────────────────────────────────────
//  SERVICE CARD
// ─────────────────────────────────────────────
function ServiceCard({
  service,
  index,
  active,
  onHover,
}: {
  service: (typeof SERVICES)[0];
  index: number;
  active: number | null;
  onHover: (i: number | null) => void;
}) {
  const isActive = active === index;
  const isDimmed = active !== null && !isActive;

  return (
    <div
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      style={{
        position: "relative",
        padding: "28px 24px",
        borderRadius: "20px",
        background: isActive
          ? `linear-gradient(135deg, ${service.color}12, ${service.accent}08)`
          : "rgba(255,255,255,0.72)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: `1px solid ${isActive ? service.color + "40" : C.ghostBorder}`,
        boxShadow: isActive
          ? `0 24px 64px ${service.color}22, 0 0 0 1px ${service.color}20`
          : "0 8px 40px rgba(26,28,28,0.06)",
        cursor: "pointer",
        transition: "all 0.4s cubic-bezier(0.23,1,0.32,1)",
        transform: isActive
          ? "translateY(-6px) scale(1.02)"
          : isDimmed
          ? "scale(0.97)"
          : "translateY(0) scale(1)",
        opacity: isDimmed ? 0.5 : 1,
        animationDelay: `${index * 80}ms`,
        animation: "fadeUp 0.6s ease both",
      }}
    >
      {/* Glow orb behind card when active */}
      {isActive && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: service.color,
            opacity: 0.07,
            filter: "blur(60px)",
            transform: "translate(-50%,-50%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      )}

      {/* Icon */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: isActive
            ? `linear-gradient(135deg, ${service.color}, ${service.accent})`
            : `${service.color}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          color: isActive ? "white" : service.color,
          marginBottom: 16,
          transition: "all 0.4s ease",
          position: "relative",
          zIndex: 1,
          boxShadow: isActive ? `0 8px 20px ${service.color}40` : "none",
        }}
      >
        {service.icon}
      </div>

      {/* Label */}
      <div
        style={{
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 700,
          fontSize: "0.95rem",
          color: C.text,
          marginBottom: 8,
          lineHeight: 1.3,
          position: "relative",
          zIndex: 1,
          letterSpacing: "-0.01em",
        }}
      >
        {service.label}
      </div>

      {/* Desc — only shows on hover */}
      <div
        style={{
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 400,
          fontSize: "0.8rem",
          color: C.textMuted,
          lineHeight: 1.5,
          position: "relative",
          zIndex: 1,
          maxHeight: isActive ? 60 : 0,
          overflow: "hidden",
          opacity: isActive ? 1 : 0,
          transition: "all 0.35s ease",
        }}
      >
        {service.desc}
      </div>

      {/* Active accent line */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "20%",
          width: "60%",
          height: 2,
          borderRadius: "0 0 2px 2px",
          background: `linear-gradient(90deg, ${service.color}, ${service.accent})`,
          opacity: isActive ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────
export function Servicos3D() {
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const parallaxLogo = scrollY * 0.18;
  const parallaxGlow = scrollY * 0.08;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatLogo {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50%       { transform: translateY(-18px) rotate(2deg); }
        }
        @keyframes rotateSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.06; transform: scale(1); }
          50%       { opacity: 0.12; transform: scale(1.08); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .hero-title-word {
          display: inline-block;
          animation: fadeUp 0.7s cubic-bezier(0.23,1,0.32,1) both;
        }
        .hero-title-word:nth-child(1) { animation-delay: 0.1s; }
        .hero-title-word:nth-child(2) { animation-delay: 0.22s; }
        .hero-title-word:nth-child(3) { animation-delay: 0.34s; }
      `}</style>

      {/* ── HERO SECTION ── */}
      <section
        ref={heroRef}
        style={{
          position: "relative",
          minHeight: "100vh",
          background: C.bg,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Background Dichroic glow blobs */}
        <div
          style={{
            position: "absolute",
            top: "8%",
            right: "-10%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${C.fuchsia}18 0%, transparent 70%)`,
            animation: "pulseGlow 6s ease-in-out infinite",
            transform: `translateY(${-parallaxGlow}px)`,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "15%",
            left: "-8%",
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${C.orange}14 0%, transparent 70%)`,
            animation: "pulseGlow 8s ease-in-out infinite 2s",
            pointerEvents: "none",
          }}
        />

        {/* Subtle grid texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(circle, ${C.text}08 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
            pointerEvents: "none",
            opacity: 0.5,
          }}
        />

        {/* ── NAVBAR ── */}
        <nav
          style={{
            width: "100%",
            maxWidth: 1280,
            padding: "28px 48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            zIndex: 10,
            animation: "fadeUp 0.5s ease both",
          }}
        >
          <div
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 900,
              fontSize: "1.1rem",
              color: C.text,
              letterSpacing: "-0.02em",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Logo3D size={32} />
            The Prismatic Editorial
          </div>

          <div
            style={{
              display: "flex",
              gap: 36,
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 500,
              fontSize: "0.88rem",
              color: C.textMuted,
            }}
          >
            {["Serviços", "Projetos", "Sobre", "Contacto"].map((item, i) => (
              <span
                key={item}
                style={{
                  cursor: "pointer",
                  color: i === 0 ? C.fuchsia : C.textMuted,
                  borderBottom: i === 0 ? `1.5px solid ${C.fuchsia}` : "none",
                  paddingBottom: i === 0 ? 2 : 0,
                  transition: "color 0.2s",
                }}
              >
                {item}
              </span>
            ))}
          </div>

          <button
            style={{
              background: `linear-gradient(135deg, ${C.fuchsia}, ${C.orange})`,
              color: "white",
              border: "none",
              borderRadius: 100,
              padding: "12px 28px",
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
              letterSpacing: "0.02em",
              boxShadow: `0 8px 24px ${C.fuchsia}30`,
              transition: "all 0.3s ease",
            }}
          >
            Consultoria →
          </button>
        </nav>

        {/* ── HERO CONTENT ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "0 48px 80px",
            maxWidth: 900,
            position: "relative",
            zIndex: 5,
          }}
        >
          {/* Eyebrow */}
          <div
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              fontSize: "0.72rem",
              letterSpacing: "0.22em",
              color: C.fuchsia,
              marginBottom: 28,
              textTransform: "uppercase",
              animation: "fadeUp 0.5s ease both 0.05s",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span
              style={{
                width: 24,
                height: 1,
                background: `linear-gradient(90deg, ${C.fuchsia}, ${C.orange})`,
                display: "inline-block",
              }}
            />
            Engenharia de Impacto
            <span
              style={{
                width: 24,
                height: 1,
                background: `linear-gradient(90deg, ${C.orange}, ${C.fuchsia})`,
                display: "inline-block",
              }}
            />
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(3rem, 7vw, 5.5rem)",
              lineHeight: 1.0,
              letterSpacing: "-0.04em",
              color: C.text,
              margin: "0 0 12px",
            }}
          >
            <span className="hero-title-word">Serviços&nbsp;</span>
            <span
              className="hero-title-word"
              style={{
                background: `linear-gradient(135deg, ${C.fuchsia} 0%, ${C.orange} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              que&nbsp;
            </span>
            <span className="hero-title-word">Transformam.</span>
          </h1>

          <p
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 400,
              fontSize: "1.05rem",
              color: C.textMuted,
              maxWidth: 540,
              lineHeight: 1.65,
              margin: "24px 0 48px",
              animation: "fadeUp 0.7s ease both 0.4s",
            }}
          >
            Transformamos marcas através de experiências digitais imersivas e
            estratégias orientadas a dados.
          </p>

          {/* CTAs */}
          <div
            style={{
              display: "flex",
              gap: 16,
              animation: "fadeUp 0.7s ease both 0.55s",
            }}
          >
            <button
              style={{
                background: `linear-gradient(135deg, ${C.fuchsia}, ${C.orange})`,
                color: "white",
                border: "none",
                borderRadius: 100,
                padding: "16px 36px",
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: "pointer",
                letterSpacing: "0.01em",
                boxShadow: `0 12px 32px ${C.fuchsia}35`,
              }}
            >
              Iniciar Projeto
            </button>
            <button
              style={{
                background: "transparent",
                color: C.text,
                border: `1.5px solid ${C.ghostBorder}`,
                borderRadius: 100,
                padding: "16px 36px",
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: "pointer",
                backdropFilter: "blur(12px)",
              }}
            >
              Ver Casos de Estudo
            </button>
          </div>
        </div>

        {/* ── FLOATING 3D LOGO — center piece ── */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, calc(-50% + ${parallaxLogo}px))`,
            pointerEvents: "none",
            zIndex: 2,
            animation: "floatLogo 7s ease-in-out infinite",
            opacity: 0.12,
          }}
        >
          <Logo3D size={340} />
        </div>
      </section>

      {/* ── SERVICES GRID SECTION ── */}
      <section
        style={{
          background: C.surfaceLow,
          padding: "100px 48px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Section glow */}
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 800,
            height: 400,
            borderRadius: "50%",
            background: `radial-gradient(ellipse, ${C.fuchsia}0A 0%, transparent 70%)`,
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative" }}>
          {/* Section header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: 72,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  letterSpacing: "0.2em",
                  color: C.orange,
                  textTransform: "uppercase",
                  marginBottom: 16,
                }}
              >
                O que fazemos
              </div>
              <h2
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 900,
                  fontSize: "clamp(2rem, 4vw, 3.2rem)",
                  letterSpacing: "-0.03em",
                  color: C.text,
                  lineHeight: 1.1,
                  margin: 0,
                }}
              >
                Seis pilares.
                <br />
                <span
                  style={{
                    background: `linear-gradient(135deg, ${C.fuchsia}, ${C.orange})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Impacto infinito.
                </span>
              </h2>
            </div>

            <div
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 500,
                fontSize: "0.85rem",
                color: C.textMuted,
                maxWidth: 260,
                textAlign: "right",
                lineHeight: 1.6,
              }}
            >
              Cada serviço é uma alavanca de crescimento para o seu negócio
              digital.
            </div>
          </div>

          {/* Cards grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
            }}
          >
            {SERVICES.map((service, i) => (
              <ServiceCard
                key={service.id}
                service={service}
                index={i}
                active={activeCard}
                onHover={setActiveCard}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW WE WORK SECTION ── */}
      <section
        style={{
          background: C.bg,
          padding: "120px 48px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Big ghost word */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: -40,
            transform: "translateY(-50%)",
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 900,
            fontSize: "18vw",
            color: C.fuchsia,
            opacity: 0.025,
            letterSpacing: "-0.06em",
            userSelect: "none",
            pointerEvents: "none",
            lineHeight: 1,
          }}
        >
          LABS
        </div>

        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 80,
            alignItems: "center",
          }}
        >
          {/* Left copy */}
          <div>
            <div
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontSize: "0.7rem",
                letterSpacing: "0.2em",
                color: C.fuchsia,
                textTransform: "uppercase",
                marginBottom: 24,
              }}
            >
              Como trabalhamos
            </div>
            <h2
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 900,
                fontSize: "clamp(2rem, 3.5vw, 3rem)",
                letterSpacing: "-0.03em",
                color: C.text,
                lineHeight: 1.1,
                margin: "0 0 28px",
              }}
            >
              Design centrado
              <br />
              no amanhã.
            </h2>
            <p
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 400,
                fontSize: "1rem",
                color: C.textMuted,
                lineHeight: 1.7,
                marginBottom: 44,
              }}
            >
              A nossa abordagem funde a estética editorial clássica com as
              tecnologias mais disruptivas. Não entregamos apenas activos;
              construímos ecossistemas digitais que respiram a sua identidade.
            </p>
            <div style={{ display: "flex", gap: 14 }}>
              <button
                style={{
                  background: `linear-gradient(135deg, ${C.fuchsia}, ${C.orange})`,
                  color: "white",
                  border: "none",
                  borderRadius: 100,
                  padding: "14px 32px",
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  boxShadow: `0 8px 24px ${C.fuchsia}30`,
                }}
              >
                Iniciar Projeto
              </button>
              <button
                style={{
                  background: "transparent",
                  color: C.text,
                  border: `1.5px solid ${C.ghostBorder}`,
                  borderRadius: 100,
                  padding: "14px 32px",
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  cursor: "pointer",
                }}
              >
                Ver Case Study
              </button>
            </div>
          </div>

          {/* Right — glass card feature */}
          <div style={{ position: "relative" }}>
            {/* Glow behind */}
            <div
              style={{
                position: "absolute",
                inset: -40,
                borderRadius: "50%",
                background: `radial-gradient(ellipse, ${C.fuchsia}12 0%, transparent 65%)`,
                filter: "blur(40px)",
                pointerEvents: "none",
              }}
            />

            {/* Main glass card */}
            <div
              style={{
                borderRadius: 28,
                background: "rgba(255,255,255,0.75)",
                backdropFilter: "blur(32px)",
                WebkitBackdropFilter: "blur(32px)",
                border: `1px solid ${C.ghostBorder}`,
                boxShadow: "0 32px 80px rgba(26,28,28,0.08)",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* Header bar */}
              <div
                style={{
                  padding: "20px 24px",
                  borderBottom: `1px solid ${C.ghostBorder}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                {[C.red, C.orange, C.green].map((c, i) => (
                  <div
                    key={i}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: c,
                      opacity: 0.7,
                    }}
                  />
                ))}
                <div
                  style={{
                    flex: 1,
                    height: 8,
                    borderRadius: 4,
                    background: C.surfaceLow,
                    marginLeft: 8,
                  }}
                />
              </div>

              {/* Content area */}
              <div style={{ padding: "32px 28px" }}>
                {/* Logo centered */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: 28,
                    animation: "floatLogo 6s ease-in-out infinite",
                  }}
                >
                  <Logo3D size={100} />
                </div>

                {/* Metric chips */}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {[
                    { label: "ROI Médio", val: "+340%", color: C.green },
                    { label: "Clientes Ativos", val: "127", color: C.fuchsia },
                    { label: "Projectos", val: "400+", color: C.orange },
                  ].map((m) => (
                    <div
                      key={m.label}
                      style={{
                        flex: 1,
                        background: `${m.color}0E`,
                        border: `1px solid ${m.color}25`,
                        borderRadius: 14,
                        padding: "14px 16px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: 800,
                          fontSize: "1.4rem",
                          color: m.color,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {m.val}
                      </div>
                      <div
                        style={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: 500,
                          fontSize: "0.7rem",
                          color: C.textMuted,
                          marginTop: 2,
                          letterSpacing: "0.03em",
                        }}
                      >
                        {m.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          background: C.surfaceLow,
          padding: "32px 48px",
          borderTop: `1px solid ${C.ghostBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 800,
            fontSize: "0.9rem",
            color: C.text,
            letterSpacing: "-0.01em",
          }}
        >
          The Prismatic Editorial
        </div>
        <div
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 400,
            fontSize: "0.78rem",
            color: C.textMuted,
          }}
        >
          © 2025 The Prismatic Editorial. High-End Digital Solutions.
        </div>
        <div
          style={{
            display: "flex",
            gap: 24,
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 500,
            fontSize: "0.78rem",
            color: C.textMuted,
          }}
        >
          {["Privacidade", "Termos", "Instagram", "LinkedIn"].map((l) => (
            <span key={l} style={{ cursor: "pointer" }}>
              {l}
            </span>
          ))}
        </div>
      </footer>
    </>
  );
}
