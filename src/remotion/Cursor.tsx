import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";

interface CursorProps {
  blinking: boolean;
}

export const Cursor: React.FC<CursorProps> = ({ blinking }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Pisca a cada 0.5s quando não está a digitar
  const blinkCycle = fps * 0.5;
  const opacity = blinking
    ? interpolate(frame % blinkCycle, [0, blinkCycle / 2, blinkCycle], [1, 0, 1])
    : 1;

  return (
    <span
      style={{
        display: "inline-block",
        width: 16,
        height: 32,
        background: "#F22283", // cursor fucsia, não preto
        marginLeft: 4,
        borderRadius: 2,
        opacity,
      }}
    />
  );
};
