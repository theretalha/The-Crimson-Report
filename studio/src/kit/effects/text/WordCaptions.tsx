import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../../theme";
import { clamp } from "../../lib/anim";

/** Same shape as src/stickman/transcript.json words — times in SECONDS */
export type CaptionWord = { w: string; s: number; e: number };

type Phrase = { words: CaptionWord[]; s: number; e: number };

/** Group words into short one-line phrases (break on gaps, punctuation, length). */
export const buildPhrases = (words: CaptionWord[], maxChars = 38, gapBreak = 0.6): Phrase[] => {
  const out: Phrase[] = [];
  let cur: CaptionWord[] = [];
  const flush = () => {
    if (cur.length) out.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e });
    cur = [];
  };
  words.forEach((w, i) => {
    const gap = i > 0 ? w.s - words[i - 1].e : 0;
    if (gap > gapBreak) flush();
    cur.push(w);
    const chars = cur.map((x) => x.w).join(" ").length;
    if (/[.!?,;:]$/.test(w.w) && cur.length >= 3) flush();
    else if (chars > maxChars) flush();
  });
  flush();
  return out;
};

export type WordCaptionsProps = {
  words: CaptionWord[];
  /** shift all word times, seconds (e.g. if audio starts later) */
  offsetSeconds?: number;
  maxChars?: number;
  /** px from bottom of frame */
  bottom?: number;
  fontSize?: number;
  /** "pop": active word turns crimson & scales. "karaoke": crimson pill behind active word */
  variant?: "pop" | "karaoke";
  uppercase?: boolean;
  highlightColor?: string;
  activeTextColor?: string;
};

/** Phrase-grouped subtitles synced to word timings; active word highlighted crimson. */
export const WordCaptions: React.FC<WordCaptionsProps> = ({
  words,
  offsetSeconds = 0,
  maxChars = 38,
  bottom = 110,
  fontSize = 54,
  variant = "pop",
  uppercase = false,
  highlightColor,
  activeTextColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps - offsetSeconds;
  const phrases = useMemo(() => buildPhrases(words, maxChars), [words, maxChars]);
  const p = phrases.find((ph) => t >= ph.s - 0.05 && t <= ph.e + 0.35);
  if (!p) return null;
  const inF = Math.round((t - (p.s - 0.05)) * fps);
  const outF = Math.round((p.e + 0.35 - t) * fps);
  const enter = spring({ frame: inF, fps, config: { damping: 14, stiffness: 200 } });
  const exit = interpolate(outF, [0, 5], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: bottom, pointerEvents: "none" }}>
      <div
        style={{
          fontFamily: F.head,
          fontWeight: 500,
          fontSize,
          lineHeight: 1.2,
          color: C.cream,
          textTransform: uppercase ? "uppercase" : "none",
          letterSpacing: uppercase ? 2 : 0.5,
          textShadow: "0 3px 10px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.9)",
          whiteSpace: "nowrap",
          // soft plate keeps captions legible over busy / light shots
          backgroundColor: "rgba(10,10,10,0.55)",
          padding: "4px 26px 8px",
          borderRadius: 4,
          opacity: exit,
          transform: `translateY(${(1 - enter) * 26}px) scale(${0.94 + enter * 0.06})`,
        }}
      >
        {p.words.map((w, i) => {
          // exactly one active word: it stays lit until the next word starts
          const next = p.words[i + 1];
          const active = t >= w.s && t < (next ? next.s : w.e + 0.3);
          const spoken = t >= w.s;
          const k = spring({ frame: Math.round((t - w.s) * fps), fps, config: { damping: 12, stiffness: 260 } });
          if (variant === "karaoke") {
            const bg = highlightColor ?? C.crimson;
            const textCol = active ? (activeTextColor ?? C.cream) : spoken ? C.cream : "rgba(244,241,234,0.55)";
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  padding: "0 0.22em",
                  margin: "0 0.05em",
                  borderRadius: 3,
                  backgroundColor: active ? bg : "transparent",
                  color: textCol,
                  fontWeight: active ? 700 : 500,
                  textShadow: active && activeTextColor ? "none" : active ? "none" : undefined,
                }}
              >
                {w.w}
              </span>
            );
          }
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                margin: "0 0.13em",
                color: active ? C.crimson2 : spoken ? C.cream : "rgba(244,241,234,0.55)",
                // dark outline keeps crimson legible over light (cream) shots
                WebkitTextStroke: active ? `0.06em ${C.black}` : undefined,
                paintOrder: "stroke fill",
                transform: active ? `scale(${1 + 0.12 * k}) translateY(${-4 * k}px)` : "none",
              }}
            >
              {w.w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
