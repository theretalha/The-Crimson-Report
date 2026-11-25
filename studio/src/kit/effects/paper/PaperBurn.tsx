import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../../theme";
import { EASE, prog, wobble } from "../../lib/anim";
import { Pt } from "../../lib/types";
import { BurnFilter, EMBER_GRADIENT, useUid } from "./shared";

/** maps 0..1 progress onto the burn threshold range (fully intact → fully gone) */
export const burnThreshold = (p: number) => -0.12 + p * 1.12;

/** Edge band widths (in burn-value units) */
const CHAR = 0.03;
const EMBER = 0.055;

/**
 * Layers that burn `children` away. Used by <PaperBurn> and the paperBurn()
 * transition.
 * mode "away": children visible where v > t (they burn off).
 * mode "reveal": children visible where v < t (they appear through the hole).
 */
export const BurnLayers: React.FC<{
  children: React.ReactNode;
  progress: number;
  mode: "away" | "reveal";
  origin: Pt;
  width: number;
  height: number;
  seed?: number;
}> = ({ children, progress, mode, origin, width, height, seed = 4 }) => {
  const uid = useUid("burn");
  const frame = useCurrentFrame();
  const t = burnThreshold(progress);
  const flicker = 1 + wobble(`${uid}-fl`, frame, 0.35) * 0.25;
  const away = mode === "away";
  // band thresholds, ordered so that ember sits next to the hole and char next to the paper
  const tPaper = t;
  const tChar = away ? t - CHAR : t + EMBER + CHAR;
  const tEmber = away ? t - CHAR - EMBER * flicker : t + EMBER * flicker;
  const ids = { paper: `${uid}-p`, char: `${uid}-c`, ember: `${uid}-e` };
  const active = progress > 0 && progress < 1;
  const common = { origin, width, height, seed, invert: !away };
  const layer: React.CSSProperties = { width, height };
  if (progress <= 0) return away ? <AbsoluteFill>{children}</AbsoluteFill> : null;
  if (progress >= 1) return away ? null : <AbsoluteFill>{children}</AbsoluteFill>;

  const ember = (
    <AbsoluteFill key="e" style={{ ...layer, filter: `url(#${ids.ember}) blur(1.5px)` }}>
      <AbsoluteFill style={{ background: EMBER_GRADIENT(C.highlight, C.crimson2, C.crimsonDeep) }} />
    </AbsoluteFill>
  );
  const char = (
    <AbsoluteFill key="c" style={{ ...layer, filter: `url(#${ids.char})` }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle, #2a1608 0%, ${C.black} 70%)` }} />
    </AbsoluteFill>
  );
  const paper = (
    <AbsoluteFill key="p" style={{ ...layer, filter: `url(#${ids.paper})` }}>
      {children}
      {/* scorch: subtle brown tint near the burn front */}
    </AbsoluteFill>
  );

  return (
    <AbsoluteFill>
      {active ? (
        <>
          <BurnFilter id={ids.paper} threshold={tPaper} {...common} />
          <BurnFilter id={ids.char} threshold={tChar} {...common} slope={26} />
          <BurnFilter id={ids.ember} threshold={tEmber} {...common} slope={20} />
        </>
      ) : null}
      {/* away: ember (widest) at bottom → char → paper on top.
          reveal: char (widest) at bottom → ember → new paper on top. */}
      {/* warm glow that spills off the burn front (sits under everything) */}
      <AbsoluteFill
        style={{
          ...layer,
          filter: `url(#${ids.ember}) blur(18px)`,
          opacity: 0.8 * Math.min(1, Math.sin(Math.PI * progress) * 3),
          mixBlendMode: "screen",
        }}
      >
        <AbsoluteFill style={{ backgroundColor: C.crimson2 }} />
      </AbsoluteFill>
      {away ? [ember, char, paper] : [char, ember, paper]}
    </AbsoluteFill>
  );
};

export type PaperBurnProps = {
  children: React.ReactNode;
  /** frames before the burn starts */
  delay?: number;
  /** frames for the full burn */
  duration?: number;
  /** where the fire starts, in px (default: lower-right) */
  origin?: Pt;
  width?: number;
  height?: number;
  seed?: number;
};

/** Burns `children` away (with char + glowing ember edge), revealing whatever is behind. */
export const PaperBurn: React.FC<PaperBurnProps> = ({
  children,
  delay = 0,
  duration = 60,
  origin = [1500, 820],
  width = 1920,
  height = 1080,
  seed = 4,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, duration, EASE.inOut);
  return (
    <BurnLayers progress={p} mode="away" origin={origin} width={width} height={height} seed={seed}>
      {children}
    </BurnLayers>
  );
};
