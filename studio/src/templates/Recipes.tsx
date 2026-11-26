import React from 'react';
import {AbsoluteFill, Img, staticFile, useVideoConfig} from 'remotion';
import {TapedCard} from '../kit/effects/paper/TapeAndNotes';
import {RubberStamp, useStampShake} from '../kit/effects/text/Stamp';
import {HandArrow} from '../kit/effects/text/HandDrawn';
import {Typewriter} from '../kit/effects/text/Typewriter';
import {C as KC, F as KF} from '../kit/theme';
import {EVERYDAY} from './Everyday';
import {COMPOSE} from '../props/Compose';

// "Recipes": hand-composed scenes built from the Remotion kit effects, timed to the narrated words.
// Each recipe exports its sound events too, so the audio mix lands on the same moments.

export type Ev = {t: number; kind: string; db?: number; f?: number};
type RScene = {caption: string; speak?: number; seconds: number; [k: string]: any};

// seconds (from scene start) at which `word` is spoken, estimated from its position in the caption
const at = (s: RScene, word: string, lead = 0) => {
  const i = s.caption.toLowerCase().indexOf(word.toLowerCase());
  const frac = i < 0 ? 0.5 : i / s.caption.length;
  return Math.max(0, frac * (s.speak ?? s.seconds * 0.9) + lead);
};
const FPS = 30;
const fr = (sec: number) => Math.round(sec * FPS);

// ------------------------------------------------------------------ THE BAN
const banTimes = (s: RScene) => {
  const china = at(s, 'China');
  return {gov: at(s, 'government'), chip: at(s, 'Nvidia'), arrow: at(s, 'selling'), china, stamp: china + 0.3};
};
const ban: {Comp: React.FC<{scene: RScene}>; events: (s: RScene) => Ev[]} = {
  events: (s) => {
    const t = banTimes(s);
    return [
      {t: t.gov + 0.05, kind: 'paper', db: -16}, {t: t.chip + 0.05, kind: 'paper', db: -16},
      {t: t.arrow, kind: 'marker', db: -22}, {t: t.china + 0.05, kind: 'paper', db: -16}, {t: t.stamp, kind: 'stamp', db: -7},
    ];
  },
  Comp: ({scene}) => {
    const {fps} = useVideoConfig();
    const t = banTimes(scene);
    const shake = useStampShake(fr(t.stamp), 14);
    const label = (txt: string, sub?: string) => (
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, background: KC.black, padding: '10px 14px', textAlign: 'center'}}>
        <div style={{fontFamily: KF.head, fontWeight: 700, fontSize: 34, letterSpacing: 2, color: KC.cream}}>{txt}</div>
        {sub && <div style={{fontFamily: KF.mono, fontSize: 17, color: KC.ash, marginTop: 2}}>{sub}</div>}
      </div>
    );
    return (
      <AbsoluteFill style={{transform: shake}}>
        {/* US government */}
        <TapedCard x={300} y={575} width={300} height={380} rotate={-4} delay={fr(t.gov)}>
          <div style={{position: 'absolute', inset: 0, background: KC.cream2}}>
            <Img src={staticFile('flags/flag-us.svg')} style={{position: 'absolute', left: 0, top: 50, width: '100%', height: 200, objectFit: 'cover'}} />
            {label('US GOVERNMENT', 'Dept. of Commerce')}
          </div>
        </TapedCard>
        {/* the chip */}
        <TapedCard x={870} y={560} width={660} height={372} rotate={2.2} delay={fr(t.chip)}>
          <div style={{position: 'absolute', inset: 0, background: KC.black}}>
            <Img src={staticFile('photos/h100-card.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.08) saturate(0.9)'}} />
            <div style={{position: 'absolute', left: 0, bottom: 0, background: KC.crimson, padding: '8px 18px'}}>
              <Typewriter text="NVIDIA H100 · AI CHIP" delay={fr(t.chip) + 14} charsPerFrame={0.7} fontSize={28} fontFamily={KF.type} color={KC.cream} caret={false} />
            </div>
          </div>
        </TapedCard>
        {/* the blocked route */}
        <HandArrow from={[1236, 575]} to={[1440, 575]} delay={fr(t.arrow)} duration={Math.max(10, fr(t.china - t.arrow))} color={KC.crimson} strokeWidth={11} />
        {/* China */}
        <TapedCard x={1620} y={575} width={300} height={380} rotate={4} delay={fr(t.china)}>
          <div style={{position: 'absolute', inset: 0, background: KC.cream2}}>
            <Img src={staticFile('flags/flag-china.svg')} style={{position: 'absolute', left: 0, top: 50, width: '100%', height: 200, objectFit: 'cover'}} />
            {label('CHINA')}
          </div>
        </TapedCard>
        <RubberStamp text="BANNED" x={1262} y={600} rotate={-8} delay={fr(t.stamp)} size={132} color={KC.crimson} clean />
      </AbsoluteFill>
    );
  },
};

export const RECIPES: Record<string, typeof ban> = {ban, ...(EVERYDAY as any), compose: COMPOSE as any};
export const RecipeT: React.FC<{scene: any}> = ({scene}) => {
  const R = RECIPES[scene.recipe];
  return R ? <R.Comp scene={scene} /> : null;
};
