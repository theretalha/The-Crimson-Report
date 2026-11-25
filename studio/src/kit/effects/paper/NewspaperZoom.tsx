import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, F } from "../../theme";
import { clamp, EASE, prog } from "../../lib/anim";
import { PaperTexture } from "../../lib/textures";

const PAGE_W = 1500;
const PAGE_H = 2000;

const FILLER = [
  "Officials declined to comment on the figures, which were circulated among senior ministers earlier this week.",
  "Analysts say the shift had been visible for months to anyone reading the shipping and credit data closely.",
  "Markets reacted calmly at first, before a late sell-off erased the gains of the previous three sessions.",
  "The report warns that contingency plans drafted a decade ago no longer match the scale of the risk.",
  "Several governments have quietly begun stockpiling critical components, according to people familiar with the matter.",
];

const Column: React.FC<{ seedOffset: number; paragraphs?: number; fontSize?: number }> = ({
  seedOffset,
  paragraphs = 5,
  fontSize = 21,
}) => (
  <div style={{ fontFamily: F.serif, fontSize, lineHeight: 1.45, color: "#2a2723", textAlign: "justify" }}>
    {Array.from({ length: paragraphs }, (_, i) => (
      <p key={i} style={{ margin: "0 0 12px", textIndent: 20 }}>
        {FILLER[(i + seedOffset) % FILLER.length]} {FILLER[(i + seedOffset + 2) % FILLER.length]}
      </p>
    ))}
  </div>
);

export type NewspaperPageProps = {
  /** fictional masthead — never use a real publication name */
  masthead?: string;
  dateline?: string;
  headline?: string;
  subhead?: string;
  /** image for the lead story (any node) */
  image?: React.ReactNode;
  /** headline of the boxed article the camera zooms into */
  articleHeadline?: string;
  articleBody?: string;
  /** 0..1 — draws the crimson box around the target article */
  highlight?: number;
};

/** A full fictional broadsheet page (1500×2000). The target article sits bottom-right. */
export const NewspaperPage: React.FC<NewspaperPageProps> = ({
  masthead = "THE EVENING CIPHER",
  dateline = "VOL. CXII · NO. 2027 · LATE EDITION",
  headline = "WORLD BRACES FOR THE GREAT SQUEEZE",
  subhead = "Energy, chips and labour markets face simultaneous shocks, internal briefing warns",
  image,
  articleHeadline = "Leaked memo sets 2027 deadline",
  articleBody = "A confidential assessment seen by this newspaper sets out, in unusually blunt language, how a single maritime closure could ripple through food prices within a fortnight.",
  highlight = 0,
}) => {
  return (
    <div style={{ position: "relative", width: PAGE_W, height: PAGE_H, overflow: "hidden" }}>
      <PaperTexture color={C.cream2} seed={12} />
      <div style={{ position: "absolute", inset: 0, padding: "60px 70px", boxSizing: "border-box" }}>
        <div style={{ textAlign: "center", fontFamily: F.serif, fontWeight: 600, fontSize: 118, letterSpacing: 2, color: C.black, lineHeight: 1 }}>
          {masthead}
        </div>
        <div style={{ borderTop: `4px solid ${C.black}`, borderBottom: `1px solid ${C.black}`, margin: "18px 0 26px", padding: "8px 0", textAlign: "center", fontFamily: F.head, fontSize: 22, letterSpacing: 4, color: C.black }}>
          {dateline}
        </div>
        <div style={{ fontFamily: F.display, fontSize: 150, lineHeight: 0.92, color: C.black, textAlign: "center" }}>{headline}</div>
        <div style={{ fontFamily: F.serif, fontStyle: "italic", fontSize: 36, color: "#3a3631", textAlign: "center", margin: "16px 60px 26px" }}>
          {subhead}
        </div>
        <div style={{ display: "flex", gap: 34 }}>
          <div style={{ width: 860 }}>
            <div style={{ width: 860, height: 520, position: "relative", overflow: "hidden", filter: "grayscale(1) contrast(1.15)" }}>
              {image}
            </div>
            <div style={{ fontFamily: F.serif, fontSize: 18, color: "#555", margin: "8px 0 18px" }}>Illustration: archive</div>
            <div style={{ display: "flex", gap: 28 }}>
              <Column seedOffset={0} />
              <Column seedOffset={1} />
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ fontFamily: F.head, fontWeight: 700, fontSize: 38, lineHeight: 1.05, color: C.black }}>Markets shrug, then stumble</div>
            <Column seedOffset={2} paragraphs={3} />
            {/* target article */}
            <div style={{ position: "relative", padding: 22, backgroundColor: "rgba(255,255,255,0.25)", border: `1px solid #999` }}>
              <div style={{ fontFamily: F.head, fontWeight: 700, fontSize: 44, lineHeight: 1.02, color: C.black }}>{articleHeadline}</div>
              <div style={{ fontFamily: F.serif, fontSize: 23, lineHeight: 1.45, color: "#2a2723", marginTop: 12 }}>{articleBody}</div>
              <svg style={{ position: "absolute", left: -14, top: -14, width: "calc(100% + 28px)", height: "calc(100% + 28px)", overflow: "visible" }}>
                <rect
                  x={0}
                  y={0}
                  width="100%"
                  height="100%"
                  fill="none"
                  stroke={C.crimson}
                  strokeWidth={8}
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - highlight}
                />
              </svg>
            </div>
            <Column seedOffset={3} paragraphs={2} />
          </div>
        </div>
      </div>
    </div>
  );
};

export type NewspaperZoomProps = NewspaperPageProps & {
  delay?: number;
  /** frames for the push-in to the article */
  duration?: number;
  /** classic spinning-newspaper entrance before the zoom */
  spinIn?: boolean;
  /** final zoom, as a multiple of the full-page fit */
  zoomTo?: number;
};

/**
 * Newspaper / article zoom-in: (optional spin-in), page rests on dark desk,
 * then camera pushes into the target article and boxes it in crimson.
 */
export const NewspaperZoom: React.FC<NewspaperZoomProps> = ({
  delay = 0,
  duration = 60,
  spinIn = true,
  zoomTo = 2.6,
  ...page
}) => {
  const frame = useCurrentFrame();
  const spinDur = spinIn ? 26 : 0;
  const spin = spinIn ? prog(frame, delay, spinDur, EASE.out) : 1;
  const zoom = prog(frame, delay + spinDur + 8, duration, EASE.inOut);
  const hl = prog(frame, delay + spinDur + 8 + duration * 0.7, 20, EASE.out);
  // page centred: fit height 1080 → base scale
  const base = 1000 / PAGE_H;
  // target article centre in page coords (approx)
  const target = { x: 1170, y: 1480 };
  const s = base * interpolate(zoom, [0, 1], [1, zoomTo]);
  const cx = interpolate(zoom, [0, 1], [PAGE_W / 2, target.x]);
  const cy = interpolate(zoom, [0, 1], [PAGE_H / 2, target.y]);
  const rot = interpolate(spin, [0, 1], [-720, -2]) + interpolate(zoom, [0, 1], [0, 2]);
  const spinScale = interpolate(spin, [0, 1], [0.02, 1], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: C.black, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, ${C.black3} 0%, ${C.black} 75%)` }} />
      <div
        style={{
          position: "absolute",
          left: 960,
          top: 540,
          width: PAGE_W,
          height: PAGE_H,
          transformOrigin: `${cx}px ${cy}px`,
          transform: `translate(${-cx}px, ${-cy}px) rotate(${rot}deg) scale(${s * spinScale})`,
          boxShadow: "0 40px 120px rgba(0,0,0,0.7)",
        }}
      >
        <NewspaperPage {...page} highlight={hl} />
      </div>
    </AbsoluteFill>
  );
};
