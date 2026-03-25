import { AbsoluteFill } from "remotion";
import { TerminalContent } from "./TerminalContent";

export const MacTerminal: React.FC = () => {
  return (
    <AbsoluteFill className="p-10">
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: `
            0 32px 64px rgba(242, 34, 131, 0.12),
            0 8px 24px rgba(0,0,0,0.10),
            0 0 0 1px rgba(0,0,0,0.06)
          `,
        }}
      >
        {/* Title bar */}
        <div
          style={{
            height: 52,
            background: "#F5F5F5",
            borderBottom: "1px solid rgba(0,0,0,0.08)",
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
          }}
        >
          {/* Traffic lights */}
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{
              width: 14, height: 14,
              borderRadius: "50%", background: "#FF5F57"
            }} />
            <div style={{
              width: 14, height: 14,
              borderRadius: "50%", background: "#FEBC2E"
            }} />
            <div style={{
              width: 14, height: 14,
              borderRadius: "50%", background: "#28C840"
            }} />
          </div>

          {/* Título centrado */}
          <div style={{ flex: 1, textAlign: "center" }}>
            <span style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: 14,
              fontWeight: 500,
              color: "#666666",
            }}>
              Terminal — AI BORA
            </span>
          </div>

          <div style={{ width: 60 }} />
        </div>

        {/* Conteúdo */}
        <TerminalContent />
      </div>
    </AbsoluteFill>
  );
};
