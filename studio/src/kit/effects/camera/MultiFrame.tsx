import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, F } from "../../theme";
import { EASE, prog } from "../../lib/anim";

type Rect = { x: number; y: number; w: number; h: number };

export type MultiFrameLayout = "split2" | "split3" | "grid4" | "pip" | "triptych";

const G = 24; // gutter
const LAYOUTS: Record<MultiFrameLayout, Rect[]> = {
  split2: [
    { x: G, y: G, w: 960 - 1.5 * G, h: 1080 - 2 * G },
    { x: 960 + G / 2, y: G, w: 960 - 1.5 * G, h: 1080 - 2 * G },
  ],
  split3: [
    { x: G, y: G, w: 1100, h: 1080 - 2 * G },
    { x: 1100 + 2 * G, y: G, w: 1920 - 1100 - 3 * G, h: (1080 - 3 * G) / 2 },
    { x: 1100 + 2 * G, y: G + (1080 - 3 * G) / 2 + G, w: 1920 - 1100 - 3 * G, h: (1080 - 3 * G) / 2 },
  ],
  grid4: [0, 1, 2, 3].map((i) => ({
    x: G + (i % 2) * ((1920 - G) / 2),
    y: G + Math.floor(i / 2) * ((1080 - G) / 2),
    w: (1920 - 3 * G) / 2,
    h: (1080 - 3 * G) / 2,
  })),
  triptych: [0, 1, 2].map((i) => ({ x: G + i * ((1920 - G) / 3), y: 140, w: (1920 - 4 * G) / 3, h: 800 })),
  pip: [
    { x: 0, y: 0, w: 1920, h: 1080 },
    { x: 1920 - 640 - 60, y: 1080 - 360 - 60, w: 640, h: 360 },
  ],
};

/** Renders a 1920x1080 shot "cover"-fitted inside a panel */
const Fit: React.FC<{ r: Rect; children: React.ReactNode }> = ({ r, children }) => {
  const s = Math.max(r.w / 1920, r.h / 1080);
  return (
    <div
      style={{
        position: "absolute",
        width: 1920,
        height: 1080,
        left: (r.w - 1920 * s) / 2,
        top: (r.h - 1080 * s) / 2,
        transform: `scale(${s})`,
        transformOrigin: "0 0",
      }}
    >
      {children}
    </div>
  );
};

/**
 * Picture-in-picture / split screen / multi-frame grid. Panels wipe in with a
 * stagger and thin cream borders; each item is a full 1920x1080 shot scaled to fit.
 */
export const MultiFrame: React.FC<{
  items: React.ReactNode[];
  layout?: MultiFrameLayout;
  delay?: number;
  /** frames between panels */
  stagger?: number;
  /** frames each panel takes to reveal */
  reveal?: number;
  border?: string;
  background?: string;
  /** optional small caption per panel */
  labels?: string[];
}> = ({ items, layout = "split2", delay = 0, stagger = 8, reveal = 18, border = C.cream, background = C.black, labels }) => {
  const f = useCurrentFrame();
  const rects = LAYOUTS[layout];
  return (
    <AbsoluteFill style={{ backgroundColor: background }}>
      {rects.map((r, i) => {
        if (!items[i]) return null;
        const isPip = layout === "pip";
        const isBase = isPip && i === 0;
        const p = isBase ? 1 : prog(f, delay + i * stagger, reveal, EASE.out);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: r.x,
              top: r.y,
              width: r.w,
              height: r.h,
              overflow: "hidden",
              clipPath: isPip ? undefined : `inset(0 ${(1 - p) * 100}% 0 0)`,
              opacity: isPip && !isBase ? p : 1,
              transform: isPip && !isBase ? `scale(${0.6 + 0.4 * p})` : undefined,
              transformOrigin: "100% 100%",
              outline: isBase ? undefined : `4px solid ${border}`,
              outlineOffset: -4,
              boxShadow: isBase ? undefined : "0 20px 60px rgba(0,0,0,0.6)",
            }}
          >
            <Fit r={r}>{items[i]}</Fit>
            {labels?.[i] ? (
              <div
                style={{
                  position: "absolute",
                  left: 18,
                  bottom: 14,
                  fontFamily: F.mono,
                  fontSize: 22,
                  letterSpacing: 3,
                  color: C.cream,
                  background: "rgba(10,10,10,0.75)",
                  padding: "4px 10px",
                }}
              >
                {labels[i]}
              </div>
            ) : null}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
