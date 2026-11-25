import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, F } from "../../theme";
import { clamp, EASE, pop, prog, rnd } from "../../lib/anim";

/** zig-zag torn ends for tape */
const tapeClip = (seed: string) => {
  const n = 7;
  const left = Array.from({ length: n + 1 }, (_, i) => `${(rnd(`${seed}l${i}`) * 4).toFixed(1)}% ${((i / n) * 100).toFixed(1)}%`);
  const right = Array.from({ length: n + 1 }, (_, i) => `${(100 - rnd(`${seed}r${i}`) * 4).toFixed(1)}% ${(100 - (i / n) * 100).toFixed(1)}%`);
  return `polygon(${[...left, ...right].join(",")})`;
};

export type TapeStripProps = {
  /** centre position in px (relative to positioned parent) */
  x: number;
  y: number;
  length?: number;
  thickness?: number;
  rotate?: number;
  delay?: number;
  color?: string;
  seed?: string;
};

/** A strip of translucent masking tape that slaps down (scale + settle). */
export const TapeStrip: React.FC<TapeStripProps> = ({
  x,
  y,
  length = 220,
  thickness = 62,
  rotate = -35,
  delay = 0,
  color = "rgba(232,228,218,0.82)",
  seed = "tape",
}) => {
  const frame = useCurrentFrame();
  if (frame < delay) return null;
  const s = pop(frame, delay, 14, 260);
  const press = interpolate(s, [0, 1], [1.25, 1]);
  return (
    <div
      style={{
        position: "absolute",
        left: x - length / 2,
        top: y - thickness / 2,
        width: length,
        height: thickness,
        transform: `rotate(${rotate}deg) scale(${press})`,
        opacity: Math.min(1, s * 1.5),
        background: `linear-gradient(180deg, ${color}, rgba(207,201,187,0.78))`,
        clipPath: tapeClip(seed),
        boxShadow: "0 2px 4px rgba(0,0,0,0.25)",
        mixBlendMode: "normal",
      }}
    >
      {/* subtle fibre stripes */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "repeating-linear-gradient(90deg, rgba(255,255,255,0.12) 0 3px, rgba(0,0,0,0.03) 3px 7px)",
        }}
      />
    </div>
  );
};

export type TapedCardProps = {
  children: React.ReactNode;
  /** centre position in px */
  x: number;
  y: number;
  width: number;
  height: number;
  rotate?: number;
  delay?: number;
  /** which corners get tape */
  tape?: "corners" | "top" | "sides";
  /** white photo border */
  border?: number;
};

/**
 * A card/photo that drops onto the board from slightly above (shadow tightens
 * on impact), then gets taped down.
 */
export const TapedCard: React.FC<TapedCardProps> = ({
  children,
  x,
  y,
  width,
  height,
  rotate = -3,
  delay = 0,
  tape = "corners",
  border = 16,
}) => {
  const frame = useCurrentFrame();
  if (frame < delay) return null;
  const land = prog(frame, delay, 12, EASE.in);
  const settle = pop(frame, delay + 10, 10, 220);
  const z = 1 - land; // height above board
  const scale = 1 + z * 0.12 + (1 - settle) * -0.015;
  const tapeDelay = delay + 14;
  const W = width + border * 2;
  const H = height + border * 2;
  const tapes: TapeStripProps[] =
    tape === "top"
      ? [{ x: W / 2, y: 0, rotate: -2, length: 260 }]
      : tape === "sides"
        ? [
            { x: 0, y: H / 2, rotate: 88, length: 180 },
            { x: W, y: H / 2, rotate: 92, length: 180 },
          ]
        : [
            { x: 0, y: 0, rotate: -40 },
            { x: W, y: 0, rotate: 40 },
            { x: W, y: H, rotate: -40 },
            { x: 0, y: H, rotate: 40 },
          ];
  return (
    <div
      style={{
        position: "absolute",
        left: x - W / 2,
        top: y - H / 2,
        width: W,
        height: H,
        transform: `scale(${scale}) rotate(${rotate + z * 6}deg)`,
        opacity: interpolate(land, [0, 0.3], [0, 1], clamp),
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: C.cream,
          padding: border,
          boxSizing: "border-box",
          boxShadow: `${8 + z * 30}px ${12 + z * 50}px ${10 + z * 40}px rgba(0,0,0,${0.45 - z * 0.15})`,
        }}
      >
        <div style={{ position: "relative", width, height, overflow: "hidden" }}>{children}</div>
      </div>
      {tapes.map((t, i) => (
        <TapeStrip key={i} {...t} delay={tapeDelay + i * 4} seed={`tc${i}`} />
      ))}
    </div>
  );
};

export type StickyNoteProps = {
  text: string;
  /** centre position in px */
  x: number;
  y: number;
  size?: number;
  rotate?: number;
  delay?: number;
  color?: "crimson" | "cream";
  /** frames the handwriting takes to appear */
  writeDuration?: number;
};

/** Sticky note that peels/flaps onto the board, then text is hand-written onto it. */
export const StickyNote: React.FC<StickyNoteProps> = ({
  text,
  x,
  y,
  size = 360,
  rotate = 4,
  delay = 0,
  color = "cream",
  writeDuration = 24,
}) => {
  const frame = useCurrentFrame();
  if (frame < delay) return null;
  const s = pop(frame, delay, 11, 180);
  const flap = interpolate(s, [0, 1], [70, 0]); // top-hinged flap-in
  const write = prog(frame, delay + 10, writeDuration, (t) => t);
  const shown = Math.round(text.length * write);
  const bg = color === "crimson" ? C.crimson : "#EFE6C8";
  const fg = color === "crimson" ? C.cream : C.black;
  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        perspective: 1200,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: "50% 0%",
          transform: `rotate(${rotate}deg) rotateX(${flap}deg)`,
          background: `linear-gradient(170deg, ${bg} 70%, rgba(0,0,0,0.12) 100%), ${bg}`,
          boxShadow: "6px 14px 18px rgba(0,0,0,0.4)",
          clipPath: "polygon(0 0, 100% 0, 100% 88%, 90% 100%, 0 100%)",
          padding: size * 0.11,
          boxSizing: "border-box",
          fontFamily: F.hand,
          fontSize: size * 0.13,
          lineHeight: 1.2,
          color: fg,
        }}
      >
        {/* adhesive strip shading */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: size * 0.14, background: "rgba(0,0,0,0.06)" }} />
        {text.slice(0, shown)}
      </div>
      {/* curled corner */}
      <div
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          width: size * 0.1,
          height: size * 0.12,
          transform: `rotate(${rotate}deg)`,
          background: `linear-gradient(135deg, rgba(0,0,0,0.25), ${bg} 60%)`,
          clipPath: "polygon(0 0, 100% 0, 0 100%)",
          opacity: Math.min(1, s),
        }}
      />
    </div>
  );
};
