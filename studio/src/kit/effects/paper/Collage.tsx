import React from "react";
import { useCurrentFrame } from "remotion";
import { C, F } from "../../theme";
import { pop, rnd, stepped } from "../../lib/anim";
import { RoughEdgeFilter } from "../../lib/textures";
import { useUid } from "./shared";

export type CutoutProps = {
  children: React.ReactNode;
  /** centre position in px */
  x: number;
  y: number;
  width: number;
  height: number;
  /** resting rotation in degrees */
  rotate?: number;
  delay?: number;
  /** white scissor-cut border thickness */
  border?: number;
  borderColor?: string;
  /** hold every N frames (stop-motion pop) — 1 = smooth */
  stepEvery?: number;
  seed?: number;
};

/** A single paper cut-out that pops onto the board with overshoot, rough scissor edge and lift shadow. */
export const Cutout: React.FC<CutoutProps> = ({
  children,
  x,
  y,
  width,
  height,
  rotate = 0,
  delay = 0,
  border = 14,
  borderColor = C.cream,
  stepEvery = 2,
  seed = 1,
}) => {
  const uid = useUid("cut");
  const frame = stepped(useCurrentFrame(), stepEvery);
  const s = pop(frame, delay, 9, 170);
  if (frame < delay) return null;
  const lift = Math.max(0, 1 - s) + Math.abs(1 - s) * 0.5;
  return (
    <div
      style={{
        position: "absolute",
        left: x - width / 2,
        top: y - height / 2,
        width,
        height,
        transform: `scale(${s}) rotate(${rotate + (1 - s) * -18}deg)`,
        filter: `drop-shadow(${6 + lift * 20}px ${10 + lift * 30}px ${8 + lift * 20}px rgba(0,0,0,0.45))`,
      }}
    >
      <RoughEdgeFilter uid={uid} scale={6} freq={0.06} seed={seed} />
      <div style={{ position: "absolute", inset: -border, backgroundColor: borderColor, filter: `url(#rough-edge-${uid})` }} />
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>{children}</div>
    </div>
  );
};

export type CollageItem = Omit<CutoutProps, "delay" | "seed"> & { key?: string };

export type CollagePopProps = {
  items: CollageItem[];
  /** frames before first piece */
  delay?: number;
  /** frames between pieces */
  stagger?: number;
};

/** Pops a set of cut-outs onto the frame one after another. */
export const CollagePop: React.FC<CollagePopProps> = ({ items, delay = 0, stagger = 6 }) => (
  <>
    {items.map((it, i) => (
      <Cutout key={it.key ?? i} {...it} delay={delay + i * stagger} seed={i + 1} />
    ))}
  </>
);

export type RansomTextProps = {
  text: string;
  x: number;
  y: number;
  /** letter height in px */
  size?: number;
  delay?: number;
  /** frames between letters */
  stagger?: number;
  seed?: string;
};

/** Ransom-note headline: each letter cut from a different scrap of paper, popping in. */
export const RansomText: React.FC<RansomTextProps> = ({ text, x, y, size = 120, delay = 0, stagger = 2, seed = "ransom" }) => {
  const frame = stepped(useCurrentFrame(), 2);
  const fonts = [F.display, F.serif, F.stamp, F.type, F.head];
  const papers = [
    { bg: C.cream, fg: C.black },
    { bg: C.black, fg: C.cream },
    { bg: C.crimson, fg: C.cream },
    { bg: C.cream2, fg: C.crimson },
  ];
  const chars = text.split("");
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
        display: "flex",
        gap: size * 0.08,
        alignItems: "center",
      }}
    >
      {chars.map((ch, i) => {
        if (ch === " ") return <div key={i} style={{ width: size * 0.35 }} />;
        const r = (n: string) => rnd(`${seed}-${i}-${n}`);
        const paper = papers[Math.floor(r("p") * papers.length)];
        const font = fonts[Math.floor(r("f") * fonts.length)];
        const s = pop(frame, delay + i * stagger, 10, 200);
        return (
          <div
            key={i}
            style={{
              fontFamily: font,
              fontSize: size * (0.8 + r("s") * 0.35),
              lineHeight: 1,
              color: paper.fg,
              backgroundColor: paper.bg,
              padding: `${size * 0.06}px ${size * 0.1}px`,
              transform: `rotate(${(r("r") - 0.5) * 14}deg) translateY(${(r("y") - 0.5) * size * 0.18}px) scale(${s})`,
              boxShadow: "4px 6px 10px rgba(0,0,0,0.4)",
              clipPath: `polygon(${r("a") * 6}% 0%, 100% ${r("b") * 8}%, ${100 - r("c") * 6}% 100%, 0% ${100 - r("d") * 8}%)`,
            }}
          >
            {ch}
          </div>
        );
      })}
    </div>
  );
};
