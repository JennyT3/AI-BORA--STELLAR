import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { Cursor } from "./Cursor";

// Comando que vai ser digitado
const COMMAND = "bora digitalizar padaria-santos";

// Output que aparece depois — serviços AI BORA reais
const OUTPUT_LINES = [
  "",
  "┌  AI BORA Digital",
  "│",
  "◇  A analisar o negócio...",
  "│",
  "◇  Google Business configurado ✓",
  "│",
  "◇  Site profissional criado ✓",
  "│",
  "◇  WhatsApp Business ativo ✓",
  "│",
  "◇  Email profissional: santos@padaria.pt ✓",
  "│",
  "●  Pack Completo — €350 + IVA",
  "│",
  "│  Entrega em 3 semanas. Sem mensalidades.",
  "│",
  "└  O seu negócio está online! 🚀",
];

export const TerminalContent: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const charsPerSecond = 18;
  const framesPerChar = fps / charsPerSecond;
  const typingEndFrame = COMMAND.length * framesPerChar;
  const outputStartFrame = typingEndFrame + fps * 0.4; // 0.4s delay
  const framesPerLine = fps * 0.06; // 60ms por linha

  const visibleChars = Math.floor(
    interpolate(frame, [0, typingEndFrame], [0, COMMAND.length], {
      extrapolateRight: "clamp",
    })
  );

  const displayedText = COMMAND.slice(0, visibleChars);
  const isTyping = visibleChars < COMMAND.length;
  const showOutput = frame >= outputStartFrame;

  const visibleLines = Math.floor(
    interpolate(
      frame,
      [
        outputStartFrame,
        outputStartFrame + OUTPUT_LINES.length * framesPerLine,
      ],
      [0, OUTPUT_LINES.length],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    )
  );

  return (
    <div
      style={{
        flex: 1,
        background: "#FFFFFF",
        padding: "28px 32px",
        fontFamily: "'Montserrat', monospace",
        fontSize: 28,
        fontWeight: 500,
        overflow: "hidden",
      }}
    >
      {/* Linha do comando */}
      <div style={{ display: "flex", alignItems: "center", color: "#1A1A1A" }}>
        {/* ~ em fucsia */}
        <span style={{ color: "#F22283", fontWeight: 700 }}>~</span>
        {/* $ em laranja */}
        <span style={{ color: "#F25C05", fontWeight: 700, margin: "0 10px" }}>
          $
        </span>
        {/* Comando digitado */}
        <span style={{ color: "#1A1A1A" }}>{displayedText}</span>
        {/* Cursor */}
        {!showOutput && <Cursor blinking={!isTyping} />}
      </div>

      {/* Output com stagger */}
      {showOutput && (
        <div
          style={{
            marginTop: 20,
            fontSize: 22,
            lineHeight: 1.6,
            color: "#333333",
          }}
        >
          {OUTPUT_LINES.slice(0, visibleLines).map((line, i) => {
            // Colorir linhas especiais
            const isCheckmark = line.includes("✓");
            const isFinal = line.includes("online");
            const isPack = line.includes("Pack");

            return (
              <div
                key={i}
                style={{
                  color: isCheckmark
                    ? "#28C840"
                    : isFinal
                    ? "#F22283"
                    : isPack
                    ? "#F25C05"
                    : "#444444",
                  fontWeight: isCheckmark || isFinal || isPack ? 700 : 500,
                  fontFamily: "'Montserrat', monospace",
                }}
              >
                {line}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
