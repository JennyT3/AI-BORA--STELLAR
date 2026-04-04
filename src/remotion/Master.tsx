import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
  staticFile,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";

const { fontFamily } = loadFont();

const FUCHSIA = "#F22283";
const ORANGE = "#F25C05";
const WHITE = "#FFFFFF";
const BLACK = "#0A0A0A";

const COMMAND = "bora digitalizar pastelaria-santos";
const OUTPUT_LINES = [
  { text: "A analisar presença digital...", color: "#888888" },
  { text: "Google Maps configurado ✓", color: "#28C840" },
  { text: "Website profissional criado ✓", color: "#28C840" },
  { text: "WhatsApp Business activo ✓", color: "#28C840" },
  { text: "Redes sociais activadas ✓", color: "#28C840" },
  { text: "Email profissional criado ✓", color: "#28C840" },
  { text: "+12 novos clientes este mês", color: ORANGE },
  { text: "ROI: 340% 🚀", color: FUCHSIA },
];

function Cursor({ frame, show }: { frame: number; show: boolean }) {
  if (!show) return null;
  const opacity = Math.floor(frame / 15) % 2 === 0 ? 1 : 0;
  return (
    <span style={{
      display: "inline-block",
      width: 14,
      height: 28,
      background: FUCHSIA,
      marginLeft: 4,
      borderRadius: 2,
      opacity,
      verticalAlign: "middle",
    }} />
  );
}

function Terminal({ frame, fps }: { frame: number; fps: number }) {
  const charsPerSec = 14;
  const framesPerChar = fps / charsPerSec;
  const typingEnd = COMMAND.length * framesPerChar;
  const outputStart = typingEnd + fps * 0.3;
  const framesPerLine = fps * 0.12;

  const visibleChars = Math.min(
    Math.floor(frame / framesPerChar),
    COMMAND.length
  );
  const isTyping = visibleChars < COMMAND.length;
  const showOutput = frame >= outputStart;

  const visibleLines = showOutput
    ? Math.min(
        Math.floor((frame - outputStart) / framesPerLine),
        OUTPUT_LINES.length
      )
    : 0;

  return (
    <AbsoluteFill style={{ padding: 40 }}>
      <div style={{
        width: "100%",
        height: "100%",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08)",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Barra do terminal */}
        <div style={{
          height: 48,
          background: "#1C1C1E",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", gap: 8 }}>
            {["#FF5F57","#FEBC2E","#28C840"].map((c, i) => (
              <div key={i} style={{ width: 13, height: 13, borderRadius: "50%", background: c }} />
            ))}
          </div>
          <div style={{ flex: 1, textAlign: "center" }}>
            <span style={{ fontFamily, fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.45)" }}>
              Terminal — AI BORA
            </span>
          </div>
          <div style={{ width: 60 }} />
        </div>

        {/* Conteúdo */}
        <div style={{
          flex: 1,
          background: "#0D0D0D",
          padding: "28px 32px",
          fontFamily,
          fontSize: 22,
          overflow: "hidden",
        }}>
          {/* Linha de comando */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ color: FUCHSIA, fontWeight: 700 }}>~</span>
            <span style={{ color: ORANGE, fontWeight: 700, margin: "0 10px" }}>$</span>
            <span style={{ color: WHITE, fontWeight: 500 }}>
              {COMMAND.slice(0, visibleChars)}
            </span>
            <Cursor frame={frame} show={!showOutput} />
          </div>

          {/* Output */}
          {showOutput && (
            <div style={{ marginTop: 20, fontSize: 19, lineHeight: 1.8 }}>
              {OUTPUT_LINES.slice(0, visibleLines).map((line, i) => (
                <div key={i} style={{
                  color: line.color,
                  fontWeight: line.color === FUCHSIA || line.color === ORANGE ? 700 : 500,
                  fontFamily,
                }}>
                  {line.text}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
}

function SocialIcon({ emoji, delay, frame, fps, x, y }: {
  emoji: string; delay: number; frame: number; fps: number; x: number; y: number;
}) {
  const localFrame = Math.max(0, frame - delay);
  const appear = spring({ frame: localFrame, fps, config: { damping: 180, stiffness: 120 } });
  const float = Math.sin((frame + delay) / 20) * 6;

  return (
    <div style={{
      position: "absolute",
      left: x,
      top: y + float,
      width: 60,
      height: 60,
      borderRadius: "50%",
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.12)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 28,
      opacity: interpolate(appear, [0, 1], [0, 1]),
      transform: `scale(${interpolate(appear, [0, 1], [0.5, 1])})`,
    }}>
      {emoji}
    </div>
  );
}

function Abertura({ frame, fps }: { frame: number; fps: number }) {
  const logoSpring = spring({ frame, fps, config: { damping: 180, stiffness: 200 } });
  const logoScale = interpolate(logoSpring, [0, 1], [0, 1]);
  const taglineOpacity = interpolate(frame, [20, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const taglineY = interpolate(frame, [20, 45], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      background: BLACK,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{ transform: `scale(${logoScale})`, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Img src={staticFile("logo.png")} style={{ width: 120, marginBottom: 24 }} />
        <div style={{
          fontFamily,
          fontWeight: 900,
          fontSize: 72,
          letterSpacing: "-2px",
          color: WHITE,
          textAlign: "center",
        }}>
          <span style={{ color: FUCHSIA }}>AI</span>
          {" "}
          <span>BORA</span>
        </div>
      </div>
      <div style={{
        opacity: taglineOpacity,
        transform: `translateY(${taglineY}px)`,
        fontFamily,
        fontWeight: 500,
        fontSize: 26,
        color: "rgba(255,255,255,0.65)",
        marginTop: 20,
        textAlign: "center",
      }}>
        Bora meter o seu negócio no mapa?
      </div>
    </AbsoluteFill>
  );
}

function TerminalScene({ frame, fps }: { frame: number; fps: number }) {
  const slideIn = spring({ frame, fps, config: { damping: 200, stiffness: 100 } });
  const translateY = interpolate(slideIn, [0, 1], [700, 0]);
  const rotateY = interpolate(frame, [0, 270], [10, -10]);
  const scale = interpolate(frame, [0, 20], [0.85, 1.0], { extrapolateRight: "clamp" });

  const showSocials = frame >= fps * 3;

  return (
    <AbsoluteFill style={{ background: BLACK, perspective: 1000 }}>
      {showSocials && (
        <>
          <SocialIcon emoji="📷" delay={0}  frame={frame - fps * 3} fps={fps} x={30}  y={200} />
          <SocialIcon emoji="👍" delay={10} frame={frame - fps * 3} fps={fps} x={30}  y={380} />
          <SocialIcon emoji="🔍" delay={20} frame={frame - fps * 3} fps={fps} x={30}  y={500} />
          <SocialIcon emoji="✉️" delay={5}  frame={frame - fps * 3} fps={fps} x={990} y={200} />
          <SocialIcon emoji="📊" delay={15} frame={frame - fps * 3} fps={fps} x={990} y={380} />
        </>
      )}
      <div style={{
        transform: `translateY(${translateY}px) rotateX(18deg) rotateY(${rotateY}deg) scale(${scale})`,
        width: "100%",
        height: "100%",
        transformOrigin: "center center",
      }}>
        <Terminal frame={frame} fps={fps} />
      </div>
    </AbsoluteFill>
  );
}

function FinalReveal({ frame, fps }: { frame: number; fps: number }) {
  const appear = spring({ frame, fps, config: { damping: 160, stiffness: 140 } });
  const scale = interpolate(appear, [0, 0.7, 1], [0.8, 1.1, 1.0]);
  const opacity = interpolate(appear, [0, 0.3], [0, 1]);
  const taglineDelay = Math.max(0, frame - 15);
  const taglineAppear = spring({ frame: taglineDelay, fps, config: { damping: 200, stiffness: 120 } });

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(135deg, ${FUCHSIA} 0%, ${ORANGE} 100%)`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{ opacity, transform: `scale(${scale})`, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Img src={staticFile("logo.png")} style={{ width: 110, marginBottom: 20, filter: "brightness(0) invert(1)" }} />
        <div style={{
          fontFamily,
          fontWeight: 900,
          fontSize: 80,
          color: WHITE,
          letterSpacing: "-3px",
          textAlign: "center",
        }}>
          AI BORA
        </div>
      </div>
      <div style={{
        opacity: interpolate(taglineAppear, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(taglineAppear, [0, 1], [20, 0])}px)`,
        fontFamily,
        fontWeight: 500,
        fontSize: 24,
        color: "rgba(255,255,255,0.88)",
        marginTop: 20,
        textAlign: "center",
        lineHeight: 1.5,
      }}>
        Bora meter o seu negócio no mapa?<br />
        <span style={{ fontSize: 18, opacity: 0.7 }}>aibora.pt</span>
      </div>
    </AbsoluteFill>
  );
}

export const Master: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* Abertura: 0-2s (frames 0-59) */}
      <Sequence durationInFrames={60}>
        <Abertura frame={frame} fps={fps} />
      </Sequence>

      {/* Terminal: 2s-10s (frames 60-299) */}
      <Sequence from={60} durationInFrames={240}>
        <TerminalScene frame={frame - 60} fps={fps} />
      </Sequence>

      {/* Final: 10s-12s (frames 300-359) */}
      <Sequence from={300} durationInFrames={60}>
        <FinalReveal frame={frame - 300} fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
