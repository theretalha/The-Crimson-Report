import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { rnd, stepped } from "../../lib/anim";
import { C, F, VIDEO } from "../../theme";
import { grainTile, scanlines } from "./shared";

const NOISE = grainTile(1.1, 240);

const pad = (n: number) => String(n).padStart(2, "0");

/** Corner bracket (L shape) */
const Corner: React.FC<{ x: number; y: number; sx: 1 | -1; sy: 1 | -1 }> = ({ x, y, sx, sy }) => (
  <path d={`M${x},${y + sy * 70} L${x},${y} L${x + sx * 70},${y}`} stroke={C.cream} strokeWidth={5} fill="none" />
);

/**
 * Security-camera look: monochrome footage, choppy frame rate, REC dot,
 * running timestamp, camera label, scanlines and corner brackets.
 */
export const CCTV: React.FC<{
  children: React.ReactNode;
  camLabel?: string;
  location?: string;
  /** wall-clock start "HH:MM:SS" */
  startTime?: string;
  date?: string;
  /** footage refresh every N frames (choppy CCTV) */
  every?: number;
}> = ({ children, camLabel = "CAM 04", location = "PORT TERMINAL — SECTOR B", startTime = "02:17:44", date = "2027-03-14", every = 3 }) => {
  const frame = useCurrentFrame();
  const [h, m, s] = startTime.split(":").map(Number);
  const total = h * 3600 + m * 60 + s + Math.floor(frame / VIDEO.fps);
  const clock = `${pad(Math.floor(total / 3600) % 24)}:${pad(Math.floor(total / 60) % 60)}:${pad(total % 60)}`;
  const ff = pad(frame % VIDEO.fps);
  const recOn = Math.floor(frame / 15) % 2 === 0;
  const f = stepped(frame, every);
  return (
    <AbsoluteFill style={{ backgroundColor: C.black, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          filter: "grayscale(1) contrast(1.35) brightness(0.88) blur(0.6px)",
          transform: "scale(1.04)",
        }}
      >
        {children}
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          backgroundImage: NOISE,
          backgroundPosition: `${Math.floor(rnd(`cc${f}`) * 240)}px ${Math.floor(rnd(`cy${f}`) * 240)}px`,
          mixBlendMode: "overlay",
          opacity: 0.5,
        }}
      />
      <AbsoluteFill style={{ backgroundImage: scanlines(3, 0.3) }} />
      <AbsoluteFill
        style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.75) 100%)" }}
      />
      <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <Corner x={60} y={60} sx={1} sy={1} />
        <Corner x={1860} y={60} sx={-1} sy={1} />
        <Corner x={60} y={1020} sx={1} sy={-1} />
        <Corner x={1860} y={1020} sx={-1} sy={-1} />
        <g stroke={C.cream} strokeWidth={2} opacity={0.5}>
          <line x1={940} y1={540} x2={980} y2={540} />
          <line x1={960} y1={520} x2={960} y2={560} />
        </g>
      </svg>
      <div style={{ position: "absolute", left: 110, top: 96, fontFamily: F.mono, fontSize: 38, color: C.cream, display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: C.crimson, opacity: recOn ? 1 : 0.15 }} />
        REC
      </div>
      <div style={{ position: "absolute", right: 110, top: 96, fontFamily: F.mono, fontSize: 38, color: C.cream, textAlign: "right" }}>
        {camLabel}
      </div>
      <div style={{ position: "absolute", left: 110, bottom: 96, fontFamily: F.mono, fontSize: 30, color: C.cream, opacity: 0.85 }}>
        {location}
      </div>
      <div style={{ position: "absolute", right: 110, bottom: 96, fontFamily: F.mono, fontSize: 38, color: C.cream, textAlign: "right" }}>
        {date} {clock}:{ff}
      </div>
    </AbsoluteFill>
  );
};
