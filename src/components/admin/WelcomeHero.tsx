interface WelcomeHeroProps {
  titulo?: string;
  descricao?: string;
  badgeText?: string;
  isMobile?: boolean;
}

export function WelcomeHero({ 
  descricao = "Your ecosystem is processing requests. All systems operational.",
  badgeText = "⚡ LIVE SYSTEM",
  isMobile 
}: WelcomeHeroProps) {
  return (
    <div style={{
      position: "relative",
      overflow: "hidden",
      background: "#f6f3f1",
      padding: isMobile ? "40px 24px" : "60px 48px",
      borderRadius: 24,
      minHeight: 240,
      display: "flex",
      alignItems: "center",
      marginBottom: 40,
      fontFamily: 'Montserrat, sans-serif',
    }}>
      {/* Geometric Pattern */}
      <div style={{
        position: "absolute",
        right: 0,
        top: 0,
        width: "50%",
        height: "100%",
        opacity: 0.05,
        pointerEvents: "none",
      }}>
        <svg width="100%" height="100%" viewBox="0 0 400 400">
          <path d="M400,0 L0,400 L400,400 Z" fill="#F25C05"></path>
          <circle cx="350" cy="50" fill="#F22283" r="100"></circle>
        </svg>
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 10, maxWidth: 600 }}>
        <span style={{
          fontSize: 11,
          fontWeight: 900,
          color: "#F25C05",
          letterSpacing: "2px",
          textTransform: "uppercase",
          marginBottom: 16,
          display: "block",
        }}>
          {badgeText}
        </span>
        <h1 style={{
          fontSize: isMobile ? 36 : 52,
          fontWeight: 900,
          color: "#1b1c1b",
          letterSpacing: "-2px",
          lineHeight: 1.1,
          marginBottom: 16,
        }}>
          Welcome back,<br />
          <span 
            style={{
              background: "linear-gradient(135deg, #F25C05 0%, #F22283 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            AI BORA Admin.
          </span>
        </h1>
        <p style={{
          color: "#64748b",
          fontWeight: 500,
          maxWidth: 450,
          fontSize: 15,
          lineHeight: 1.6,
        }}>
          {descricao}
        </p>
      </div>
    </div>
  );
}
