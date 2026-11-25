import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, F } from "../../theme";
import { clamp, wobble } from "../../lib/anim";
import { Sfx } from "../../lib/sfx";

export type RubberStampProps = {
  text: string;
  /** centre position on the 1920x1080 frame */
  x?: number;
  y?: number;
  /** final rotation, degrees */
  rotate?: number;
  /** frame of impact */
  delay?: number;
  color?: string;
  /** font size, px */
  size?: number;
  /** draw a double border box */
  border?: boolean;
  /** seed for ink grain */
  seed?: number;
  /** clean mode: crisp black plate, cream text, crimson border, no distress filter (legible over art) */
  clean?: boolean;
};

/**
 * Rubber stamp slam: drops from scale 2.4 → 1 in 5 frames, ink grunge mask,
 * faint ink-spread ring on impact.
 */
export const RubberStamp: React.FC<RubberStampProps> = ({
  text,
  x = 960,
  y = 540,
  rotate = -12,
  delay = 0,
  color = C.crimson,
  size = 120,
  border = true,
  seed = 4,
  clean = false,
}) => {
  const frame = useCurrentFrame() - delay;
  // lands at ~frame 5 of the slam; silent unless <Documentary sfx />
  const hit = <Sfx name="stamp" at={delay + 4} />;
  if (frame < 0) return hit;
  const scale = interpolate(frame, [0, 5, 7, 9], [2.4, 0.96, 1.02, 1], clamp);
  const opacity = interpolate(frame, [0, 3], [0, 1], clamp);
  const ring = interpolate(frame, [4, 18], [0, 1], clamp);
  const id = `stamp-${seed}`;
  const w = text.length * size * 0.72 + size * 0.8;
  const h = size * 1.5;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {hit}
      <svg viewBox="0 0 1920 1080" width="100%" height="100%">
        <defs>
          <filter id={id} x="-10%" y="-20%" width="120%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves={4} seed={seed} result="n" />
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  7 0 0 0 -2.6" result="holes" />
            <feComposite in="SourceGraphic" in2="holes" operator="in" result="inked" />
            <feTurbulence type="fractalNoise" baseFrequency="0.3" numOctaves={2} seed={seed + 3} result="n2" />
            <feDisplacementMap in="inked" in2="n2" scale={4} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        {/* ink spread ring */}
        <ellipse cx={x} cy={y} rx={(w / 2) * (1 + ring * 0.25)} ry={(h / 2) * (1 + ring * 0.4)} fill={color} opacity={(1 - ring) * 0.18} transform={`rotate(${rotate} ${x} ${y})`} />
        {clean ? (
          <g transform={`translate(${x},${y}) rotate(${rotate}) scale(${scale})`} opacity={opacity}>
            <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={C.black} stroke={C.crimson} strokeWidth={size * 0.1} rx={size * 0.08} />
            <rect x={-w / 2 + size * 0.16} y={-h / 2 + size * 0.16} width={w - size * 0.32} height={h - size * 0.32} fill="none" stroke={C.cream} strokeWidth={size * 0.03} />
            <text x={0} y={size * 0.36} textAnchor="middle" fontFamily={F.stamp} fontSize={size} fill={C.cream} letterSpacing={size * 0.06}>
              {text}
            </text>
          </g>
        ) : (
        <g transform={`translate(${x},${y}) rotate(${rotate}) scale(${scale})`} opacity={opacity * 0.92} filter={`url(#${id})`}>
          {border ? (
            <>
              <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="none" stroke={color} strokeWidth={size * 0.08} rx={size * 0.08} />
              <rect x={-w / 2 + size * 0.14} y={-h / 2 + size * 0.14} width={w - size * 0.28} height={h - size * 0.28} fill="none" stroke={color} strokeWidth={size * 0.03} />
            </>
          ) : null}
          <text x={0} y={size * 0.36} textAnchor="middle" fontFamily={F.stamp} fontSize={size} fill={color} letterSpacing={size * 0.06}>
            {text}
          </text>
        </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};

/** Impact shake to apply to the shot under a stamp: returns a CSS transform. */
export const useStampShake = (impactFrame: number, strength = 10) => {
  const frame = useCurrentFrame() - impactFrame - 5;
  if (frame < 0 || frame > 10) return "none";
  const k = (1 - frame / 10) * strength;
  return `translate(${wobble("ssx", frame, 0.9) * k}px, ${wobble("ssy", frame, 0.9) * k}px)`;
};
