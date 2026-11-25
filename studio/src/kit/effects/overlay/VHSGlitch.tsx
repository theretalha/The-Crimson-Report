import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { rnd } from "../../lib/anim";
import { grainTile, scanlines, useSafeId } from "./shared";

const NOISE = grainTile(1.4, 200);

/**
 * VHS / CRT wrapper: constant RGB split + scanlines, with bursts of
 * horizontal slice tearing on "glitch frames".
 */
export const VHSGlitch: React.FC<{
  children: React.ReactNode;
  /** 0..2 overall strength */
  intensity?: number;
  /** probability (0..1) that any frame is a glitch frame */
  glitchRate?: number;
  /** force glitch frames in [start, end) ranges (frames) */
  bursts?: [number, number][];
  scanlinesOn?: boolean;
  seed?: string;
}> = ({ children, intensity = 1, glitchRate = 0.12, bursts = [], scanlinesOn = true, seed = "vhs" }) => {
  const frame = useCurrentFrame();
  const id = useSafeId("rgb");
  const inBurst = bursts.some(([a, b]) => frame >= a && frame < b);
  const glitch = inBurst || rnd(`${seed}g${frame}`) < glitchRate * intensity;
  const split = (glitch ? 8 + rnd(`${seed}s${frame}`) * 14 : 3) * intensity;
  const slices = glitch ? 3 + Math.floor(rnd(`${seed}n${frame}`) * 4) : 0;
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
          <feOffset in="r" dx={split} dy={0} result="ro" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
          <feOffset in="b" dx={-split} dy={0} result="bo" />
          <feComposite in="ro" in2="g" operator="arithmetic" k2={1} k3={1} result="rg" />
          <feComposite in="rg" in2="bo" operator="arithmetic" k2={1} k3={1} />
        </filter>
      </svg>
      <AbsoluteFill style={{ filter: `url(#${id}) saturate(1.15) contrast(1.05)` }}>{children}</AbsoluteFill>
      {Array.from({ length: slices }, (_, i) => {
        const top = rnd(`${seed}t${frame}-${i}`) * 100;
        const h = 1 + rnd(`${seed}h${frame}-${i}`) * 9;
        const dx = (rnd(`${seed}x${frame}-${i}`) - 0.5) * 160 * intensity;
        return (
          <AbsoluteFill
            key={i}
            style={{
              clipPath: `inset(${top}% 0 ${Math.max(0, 100 - top - h)}% 0)`,
              transform: `translateX(${dx}px)`,
              filter: `url(#${id}) hue-rotate(${i * 40}deg)`,
            }}
          >
            {children}
          </AbsoluteFill>
        );
      })}
      {glitch ? (
        <AbsoluteFill
          style={{
            backgroundImage: NOISE,
            backgroundPosition: `${Math.floor(rnd(`${seed}p${frame}`) * 200)}px 0`,
            mixBlendMode: "screen",
            opacity: 0.18 * intensity,
            clipPath: `inset(${rnd(`${seed}band${frame}`) * 85}% 0 ${0}% 0)`,
          }}
        />
      ) : null}
      {scanlinesOn ? (
        <AbsoluteFill style={{ backgroundImage: scanlines(4, 0.28), opacity: Math.min(1, intensity) }} />
      ) : null}
      {/* CRT tube darkening at the corners */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 60%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Scanlines only, as an overlay layer. */
export const CRTScanlines: React.FC<{ gap?: number; alpha?: number; roll?: boolean }> = ({
  gap = 4,
  alpha = 0.25,
  roll = true,
}) => {
  const frame = useCurrentFrame();
  const bandY = ((frame * 7) % 1300) - 200;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ backgroundImage: scanlines(gap, alpha) }} />
      {roll ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: bandY,
            height: 160,
            background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0) 100%)",
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
