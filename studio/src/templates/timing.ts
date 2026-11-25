// Seconds (from scene start) at which `word` is spoken, estimated from its position in the caption.
export const wordAt = (s: {caption: string; speak?: number; seconds: number}, word: string | undefined, lead = 0) => {
  if (!word) return lead;
  const i = s.caption.toLowerCase().indexOf(word.toLowerCase());
  const frac = i < 0 ? 0.35 : i / s.caption.length;
  return Math.max(0, frac * (s.speak ?? s.seconds * 0.9) + lead);
};
export const fr = (sec: number) => Math.round(sec * 30);
