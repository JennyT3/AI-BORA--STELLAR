import React from "react";
import { AbsoluteFill, Img, staticFile, spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";

export const LogoReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const appear = spring({ frame, fps, config: { damping: 200, stiffness: 120 } });
  const scale = interpolate(appear, [0, 1], [0.8, 1.0]);
  const opacity = interpolate(appear, [0, 1], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #F22283 0%, #F25C05 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      {/* Logo geométrico */}
      <Img
        src={staticFile("logo.svg")}
        style={{ width: 140, marginBottom: 24 }}
      />

      {/* Nome da agência */}
      <div
        style={{
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 900,
          fontSize: 72,
          color: "#FFFFFF",
          letterSpacing: "-2px",
          textAlign: "center",
        }}
      >
        AI BORA
      </div>

      {/* Tagline */}
      <div
        style={{
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 500,
          fontSize: 28,
          color: "rgba(255,255,255,0.85)",
          marginTop: 16,
          textAlign: "center",
        }}
      >
        Bora meter o seu negócio no mapa?
      </div>
    </AbsoluteFill>
  );
};
