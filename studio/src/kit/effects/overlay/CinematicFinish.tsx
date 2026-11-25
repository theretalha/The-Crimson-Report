import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { prog, rnd, stepped } from "../../lib/anim";
import { C } from "../../theme";
import { grainTile } from "./shared";

const TILE = grainTile(0.9, 320);

/**
 * The house "finish" wrapped around every documentary shot — kept cheap:
 * one cached grain tile shifted per frame, a CSS vignette and optional
 * letterbox bars. No SVG filters, no re-rendered children.
 */
export const CinematicFinish: React.FC<{
  children: React.ReactNode;
  /** 0..1 grain opacity (default 0.35) */
  grain?: number;
  /** 0..1 vignette darkness (default 0.55) */
  vignette?: number;
  /** false = none, true = 2.39:1, or a custom aspect ratio number */
  letterbox?: boolean | number;
  /** animate letterbox bars sliding in over N frames (0 = static) */
  letterboxIn?: number;
  /** subtle colour grade: lift blacks, warm highlights */
  grade?: boolean;
}> = ({ children, grain = 0.35, vignette = 0.55, letterbox = false, letterboxIn = 0, grade = true }) => {
  const frame = useCurrentFrame();
  const f = stepped(frame, 2);
  const aspect = letterbox === true ? 2.39 : typeof letterbox === "number" ? letterbox : 0;
  const barH = aspect ? Math.max(0, (1080 - 1920 / aspect) / 2) : 0;
  const barP = letterboxIn > 0 ? prog(frame, 0, letterboxIn) : 1;
  return (
    <AbsoluteFill style={{ backgroundColor: C.black, overflow: "hidden" }}>
      <AbsoluteFill style={grade ? { filter: "contrast(1.06) saturate(0.92) sepia(0.06)" } : undefined}>
        {children}
      </AbsoluteFill>
      {vignette > 0 ? (
        <AbsoluteFill
          style={{
            pointerEvents: "none",
            background: `radial-gradient(ellipse at center, rgba(10,10,10,0) 50%, rgba(10,10,10,${vignette}) 100%)`,
          }}
        />
      ) : null}
      {grain > 0 ? (
        <AbsoluteFill
          style={{
            pointerEvents: "none",
            backgroundImage: TILE,
            backgroundPosition: `${Math.floor(rnd(`cf${f}`) * 320)}px ${Math.floor(rnd(`cg${f}`) * 320)}px`,
            mixBlendMode: "overlay",
            opacity: grain,
          }}
        />
      ) : null}
      {barH > 0 ? (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: barH * barP, backgroundColor: C.black }} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: barH * barP, backgroundColor: C.black }} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};
