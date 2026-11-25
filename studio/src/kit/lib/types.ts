import React from "react";

/**
 * EFFECT CONTRACT (all files under effects/ and transitions/ follow this)
 * - Canvas 1920x1080 @30fps. Every animation is driven by useCurrentFrame()
 *   relative to the enclosing <Sequence> — no CSS animations, no Math.random
 *   (use rnd()/wobble() from lib/anim).
 * - Timing props are in frames: `delay` (default 0) and, where useful, `duration`.
 * - "Wrapper" effects take `children` and transform them (KenBurns, Shake, Magnifier…).
 * - "Overlay" effects render a full-frame AbsoluteFill layer on top of a shot.
 * - Colours/fonts come only from theme.ts (C / F).
 * - Transitions are TransitionPresentation factories for <TransitionSeries>.
 */

export type Demo = {
  /** e.g. "Paper Burn Transition" — shown as label in the showcase */
  name: string;
  category: "Paper & Tactile" | "Text & Document" | "Photo & Camera" | "Map & Data" | "Overlay & Retro";
  durationInFrames: number;
  component: React.FC;
};

export type Pt = [number, number];
