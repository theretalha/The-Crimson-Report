import React from "react";
import { useCurrentFrame } from "remotion";
import { EASE, prog } from "../../lib/anim";

export type PaperFoldProps = {
  children: React.ReactNode;
  /** "unfold" opens the sheet, "fold" closes it */
  mode?: "unfold" | "fold";
  /** number of accordion panels */
  panels?: number;
  /** "vertical" folds along horizontal creases (like a letter); "horizontal" like a map */
  axis?: "vertical" | "horizontal";
  delay?: number;
  duration?: number;
  /** size of the sheet in px */
  width?: number;
  height?: number;
  /** strength of crease shading 0..1 */
  shading?: number;
};

/**
 * Accordion paper fold/unfold. Each panel shows its slice of `children` and
 * hinges on the previous one, with crease shading on alternate slopes.
 * Position it yourself (it renders a width×height box).
 */
export const PaperFold: React.FC<PaperFoldProps> = ({
  children,
  mode = "unfold",
  panels = 4,
  axis = "vertical",
  delay = 0,
  duration = 45,
  width = 1100,
  height = 1400,
  shading = 0.6,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, duration, EASE.inOut);
  const open = mode === "unfold" ? p : 1 - p;
  const theta = (1 - open) * 88; // degrees
  const vertical = axis === "vertical";
  const seg = (vertical ? height : width) / panels;
  const rot = vertical ? "rotateX" : "rotateY";
  // the visual sheet shrinks as panels tilt; keep it centred
  const visible = seg * panels * Math.cos((theta * Math.PI) / 180);
  const centreShift = ((vertical ? height : width) - visible) / 2;

  const panel = (i: number): React.ReactNode => {
    if (i >= panels) return null;
    // first panel tilts by theta, subsequent ones alternate ±2θ relative to parent
    const angle = i === 0 ? theta : (i % 2 === 1 ? -2 : 2) * theta;
    const sign = vertical ? 1 : -1;
    const facingAway = i % 2 === 1;
    const shade = Math.sin((theta * Math.PI) / 180) * shading * (facingAway ? 1 : 0.35);
    const box: React.CSSProperties = vertical
      ? { left: 0, top: i === 0 ? 0 : seg, width, height: seg }
      : { top: 0, left: i === 0 ? 0 : seg, width: seg, height };
    return (
      <div
        style={{
          position: "absolute",
          ...box,
          transformStyle: "preserve-3d",
          transformOrigin: vertical ? "50% 0%" : "0% 50%",
          transform: `${rot}(${angle * sign}deg)`,
        }}
      >
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", backfaceVisibility: "visible" }}>
          <div
            style={{
              position: "absolute",
              width,
              height,
              left: vertical ? 0 : -i * seg,
              top: vertical ? -i * seg : 0,
            }}
          >
            {children}
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(${vertical ? "180deg" : "90deg"}, rgba(0,0,0,${shade * 0.6}), rgba(0,0,0,${shade}))`,
            }}
          />
          {/* crease highlight */}
          {i > 0 ? (
            <div
              style={{
                position: "absolute",
                ...(vertical ? { left: 0, right: 0, top: 0, height: 3 } : { top: 0, bottom: 0, left: 0, width: 3 }),
                background: "rgba(255,255,255,0.35)",
                opacity: 1 - open * 0.7,
              }}
            />
          ) : null}
        </div>
        {panel(i + 1)}
      </div>
    );
  };

  return (
    <div style={{ position: "relative", width, height, perspective: 2600 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          transform: vertical ? `translateY(${centreShift}px)` : `translateX(${centreShift}px)`,
          opacity: open < 0.02 ? 0 : 1,
        }}
      >
        {panel(0)}
      </div>
    </div>
  );
};
