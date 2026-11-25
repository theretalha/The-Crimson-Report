import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { lerp, wobble } from "../../lib/anim";

const BLOBS = [
  { c: "255,120,40", r: 900, x: 0.15, y: 0.3 },
  { c: "196,21,28", r: 1100, x: 0.85, y: 0.65 },
  { c: "255,190,90", r: 650, x: 0.55, y: 0.15 },
  { c: "211,47,47", r: 800, x: 0.3, y: 0.9 },
];

/** Raw leak layer at a given strength (0..1+). Used by LightLeak, FilmBurn and the transition. */
export const LeakLayer: React.FC<{ strength: number; seed?: string; frame: number; burn?: number }> = ({
  strength,
  seed = "leak",
  frame,
  burn = 0,
}) => {
  if (strength <= 0.001 && burn <= 0.001) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ mixBlendMode: "screen", opacity: Math.min(1, strength) }}>
        {BLOBS.map((b, i) => {
          const x = (b.x + wobble(`${seed}x${i}`, frame, 0.012) * 0.25) * 1920;
          const y = (b.y + wobble(`${seed}y${i}`, frame, 0.012) * 0.25) * 1080;
          const r = b.r * (1 + 0.25 * wobble(`${seed}r${i}`, frame, 0.02));
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x - r,
                top: y - r,
                width: r * 2,
                height: r * 2,
                borderRadius: "50%",
                background: `radial-gradient(circle, rgba(${b.c},0.85) 0%, rgba(${b.c},0.35) 35%, rgba(${b.c},0) 70%)`,
              }}
            />
          );
        })}
      </AbsoluteFill>
      {burn > 0 ? (
        <AbsoluteFill
          style={{
            background: "radial-gradient(circle at 50% 50%, #FFF6E0 0%, #FFB347 35%, #C4151C 75%, #3A0306 100%)",
            mixBlendMode: "screen",
            opacity: Math.min(1, burn),
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

/**
 * Drifting warm light leak. Fades in over `fade` frames after `delay`, out at the end.
 */
export const LightLeak: React.FC<{ delay?: number; fade?: number; intensity?: number; seed?: string }> = ({
  delay = 0,
  fade = 20,
  intensity = 0.7,
  seed = "leak",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const a = lerp(frame, [delay, delay + fade, durationInFrames - fade, durationInFrames], [0, 1, 1, 0]);
  return <LeakLayer strength={a * intensity} seed={seed} frame={frame} />;
};

/**
 * Film burn flash: leak swells to a hot amber whiteout and back.
 * `peak` = frame of maximum burn (relative to Sequence), `length` = total frames.
 */
export const FilmBurn: React.FC<{ peak?: number; length?: number; seed?: string }> = ({
  peak = 30,
  length = 40,
  seed = "burn",
}) => {
  const frame = useCurrentFrame();
  const half = length / 2;
  const s = lerp(frame, [peak - half, peak, peak + half], [0, 1, 0]);
  return <LeakLayer strength={s * 1.3} burn={Math.pow(s, 2.2)} seed={seed} frame={frame} />;
};
