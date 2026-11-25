import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { clamp, EASE, prog, stepped } from "../../lib/anim";
import { useUid } from "./shared";

export type PaperCrumpleProps = {
  children: React.ReactNode;
  /** "crumple" scrunches the content into a ball; "uncrumple" smooths it out */
  mode?: "crumple" | "uncrumple";
  delay?: number;
  duration?: number;
  /** final scale of the paper ball */
  ballScale?: number;
  /** throw the ball off-frame after crumpling (crumple mode only) */
  toss?: boolean;
  /** hold every N frames for a stop-motion feel (1 = smooth) */
  stepEvery?: number;
  seed?: number;
};

/**
 * Crumples / uncrumples whatever it wraps: creased displacement, faceted
 * crease lighting, shrink + spin. Wrap a full-frame shot or any element.
 */
export const PaperCrumple: React.FC<PaperCrumpleProps> = ({
  children,
  mode = "crumple",
  delay = 0,
  duration = 40,
  ballScale = 0.32,
  toss = false,
  stepEvery = 2,
  seed = 7,
}) => {
  const uid = useUid("crumple");
  const raw = useCurrentFrame();
  const frame = stepped(raw, stepEvery);
  const p0 = prog(frame, delay, duration, EASE.inOut);
  const c = mode === "crumple" ? p0 : 1 - p0; // crumple amount 0..1
  const disp = interpolate(c, [0, 1], [0, 230]);
  const scale = interpolate(c, [0, 0.4, 1], [1, 0.82, ballScale]);
  const spin = interpolate(c, [0, 1], [0, mode === "crumple" ? -24 : 18]);
  const creases = interpolate(c, [0, 0.25, 1], [0, 0.7, 1], clamp);
  const ballRound = interpolate(c, [0.6, 1], [0, 50], clamp);
  const tossP = toss && mode === "crumple" ? prog(raw, delay + duration + 4, 18, EASE.in) : 0;
  // shifting turbulence seed per step makes creases "boil" while moving
  const liveSeed = seed + (c > 0 && c < 1 ? Math.floor(frame / 4) % 3 : 0);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id={`${uid}-d`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="turbulence" baseFrequency={0.0045} numOctaves={2} seed={liveSeed} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={disp} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id={`${uid}-l`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="turbulence" baseFrequency={0.0055} numOctaves={3} seed={liveSeed} result="n" />
          <feDiffuseLighting in="n" surfaceScale={4} diffuseConstant={1.1} lightingColor="#fff" result="lit">
            <feDistantLight azimuth={225} elevation={42} />
          </feDiffuseLighting>
          <feComposite in="lit" in2="SourceAlpha" operator="in" />
        </filter>
      </svg>
      <AbsoluteFill
        style={{
          transform: `translate(${tossP * 1400}px, ${-tossP * 300 + tossP * tossP * 900}px) scale(${scale}) rotate(${spin + tossP * 240}deg)`,
          filter: `url(#${uid}-d) drop-shadow(0 ${20 * c}px ${30 * c}px rgba(0,0,0,0.5))`,
          borderRadius: `${ballRound}%`,
          overflow: "hidden",
        }}
      >
        {children}
        {creases > 0 ? (
          <AbsoluteFill
            style={{
              filter: `url(#${uid}-l)`,
              backgroundColor: "#fff",
              mixBlendMode: "multiply",
              opacity: creases,
            }}
          />
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
