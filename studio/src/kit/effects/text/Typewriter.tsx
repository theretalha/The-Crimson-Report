import React from "react";
import { useCurrentFrame } from "remotion";
import { C, F } from "../../theme";
import { rnd } from "../../lib/anim";
import { Sfx } from "../../lib/sfx";

/** frames in public/audio/sfx/typewriter.wav (2.4 s at 30 fps) */
const BURST = 72;

export type TypewriterProps = {
  /** text; use "\n" for new lines */
  text: string;
  /** frames before typing starts */
  delay?: number;
  /** characters typed per frame (ignored if `duration` set) */
  charsPerFrame?: number;
  /** total frames to type the whole text (overrides charsPerFrame) */
  duration?: number;
  /** extra pause (frames) after punctuation . , : ; */
  punctuationPause?: number;
  caret?: boolean;
  /** per-character baseline/ink jitter, px */
  jitter?: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  /** colour of the caret block */
  caretColor?: string;
  style?: React.CSSProperties;
};

/** Precompute the frame each char appears at (supports punctuation pauses). */
const charTimes = (text: string, cpf: number, pause: number) => {
  const times: number[] = [];
  let t = 0;
  for (const ch of text) {
    times.push(t);
    t += 1 / cpf;
    if (/[.,:;!?]/.test(ch)) t += pause;
  }
  return { times, total: t };
};

/** Typewriter reveal with blinking caret and per-character ink jitter. */
export const Typewriter: React.FC<TypewriterProps> = ({
  text,
  delay = 0,
  charsPerFrame = 0.9,
  duration,
  punctuationPause = 4,
  caret = true,
  jitter = 1.4,
  fontSize = 48,
  fontFamily = F.type,
  color = C.cream,
  caretColor = C.crimson,
  style,
}) => {
  const frame = useCurrentFrame() - delay;
  let cpf = charsPerFrame;
  if (duration) {
    const base = charTimes(text, 1, punctuationPause);
    // solve so that total ≈ duration
    const punct = base.total - text.length;
    cpf = text.length / Math.max(1, duration - punct);
  }
  const { times, total } = charTimes(text, cpf, punctuationPause);
  const chars = Array.from(text);
  const typing = frame >= 0 && frame < total;
  const caretOn = typing || Math.floor(frame / 15) % 2 === 0;
  const shown = times.filter((t) => t <= frame).length;
  return (
    <div style={{ fontFamily, fontSize, color, lineHeight: 1.45, whiteSpace: "pre-wrap", ...style }}>
      {chars.map((ch, i) => {
        if (i >= shown) return null;
        const age = frame - times[i];
        const dy = (rnd(`ty${i}`) - 0.5) * 2 * jitter;
        const dx = (rnd(`tx${i}`) - 0.5) * jitter;
        const ink = 0.78 + rnd(`ti${i}`) * 0.22;
        const strike = age < 2 ? 1.08 : 1;
        if (ch === "\n") return <br key={i} />;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              whiteSpace: "pre",
              opacity: ink,
              transform: `translate(${dx}px, ${dy}px) scale(${strike})`,
            }}
          >
            {ch}
          </span>
        );
      })}
      {/* key clacks for exactly the typing time (2.4 s bursts, chained); silent unless <Documentary sfx /> */}
      {Array.from({ length: Math.min(10, Math.ceil(total / BURST)) }, (_, k) => (
        <Sfx key={`sfx${k}`} name="typewriter" at={delay + k * BURST} duration={Math.min(BURST, total - k * BURST)} />
      ))}
      {caret && frame >= 0 ? (
        <span
          style={{
            display: "inline-block",
            width: fontSize * 0.55,
            height: fontSize * 0.9,
            marginLeft: 4,
            verticalAlign: "text-bottom",
            backgroundColor: caretColor,
            opacity: caretOn ? 1 : 0,
          }}
        />
      ) : null}
    </div>
  );
};
