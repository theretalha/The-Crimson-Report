import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { rnd, stepped, wobble } from "../../lib/anim";
import { C } from "../../theme";
import { grainTile } from "./shared";

const TILE = grainTile(0.85);

/**
 * Old film grain, dust specks, vertical scratches and exposure flicker.
 * Grain changes every `every` frames (2 = 15fps grain, feels like 35mm).
 */
export const FilmGrain: React.FC<{
  /** 0..2 overall strength (default 1) */
  intensity?: number;
  /** grain refresh rate in frames */
  every?: number;
  dust?: boolean;
  scratches?: boolean;
  flicker?: boolean;
  seed?: string;
}> = ({ intensity = 1, every = 2, dust = true, scratches = true, flicker = true, seed = "grain" }) => {
  const frame = useCurrentFrame();
  const f = stepped(frame, every);
  const ox = Math.floor(rnd(`${seed}x${f}`) * 320);
  const oy = Math.floor(rnd(`${seed}y${f}`) * 320);
  const nDust = dust ? Math.floor(rnd(`${seed}n${f}`) * 7 * intensity) : 0;
  const scratchOn = scratches && rnd(`${seed}s${f}`) < 0.35 * intensity;
  const flick = flicker ? 0.035 * intensity * (0.5 + 0.5 * wobble(seed, frame, 0.9)) : 0;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          backgroundImage: TILE,
          backgroundPosition: `${ox}px ${oy}px`,
          mixBlendMode: "overlay",
          opacity: Math.min(1, 0.55 * intensity),
        }}
      />
      {flick > 0 ? <AbsoluteFill style={{ backgroundColor: C.black, opacity: flick }} /> : null}
      <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: nDust }, (_, i) => {
          const x = rnd(`${seed}dx${f}-${i}`) * 1920;
          const y = rnd(`${seed}dy${f}-${i}`) * 1080;
          const r = 1 + rnd(`${seed}dr${f}-${i}`) * 3.5;
          const light = rnd(`${seed}dl${f}-${i}`) > 0.5;
          const hair = rnd(`${seed}dh${f}-${i}`) > 0.8;
          return hair ? (
            <path
              key={i}
              d={`M${x},${y} q${12 + r * 6},${-10} ${24 + r * 8},${6}`}
              stroke={light ? C.cream : C.black}
              strokeWidth={1.4}
              fill="none"
              opacity={0.55}
            />
          ) : (
            <circle key={i} cx={x} cy={y} r={r} fill={light ? C.cream : C.black} opacity={0.6} />
          );
        })}
        {scratchOn ? (
          <line
            x1={rnd(`${seed}sx${f}`) * 1920}
            y1={0}
            x2={rnd(`${seed}sx${f}`) * 1920 + (rnd(`${seed}sk${f}`) - 0.5) * 30}
            y2={1080}
            stroke={rnd(`${seed}sc${f}`) > 0.5 ? C.cream : C.black}
            strokeWidth={1 + rnd(`${seed}sw${f}`) * 1.5}
            opacity={0.35}
          />
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};

/** Projector gate weave — tiny stepped jitter of the whole picture. */
export const GateWeave: React.FC<{ children: React.ReactNode; amount?: number; every?: number }> = ({
  children,
  amount = 2,
  every = 2,
}) => {
  const f = stepped(useCurrentFrame(), every);
  const x = wobble("weave-x", f, 0.3) * amount;
  const y = wobble("weave-y", f, 0.3) * amount * 1.4;
  return (
    <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) scale(1.006)` }}>{children}</AbsoluteFill>
  );
};
