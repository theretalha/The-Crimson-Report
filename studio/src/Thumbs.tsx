import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, F} from './kit/theme';
import {Crates} from './props/art2';

// YouTube thumbnails (rendered at 1920x1080, then scaled to 1280x720). Rules: <= 4 big words, one face or one object, huge contrast,
// readable on a phone. Allegations stay questions ("SPY OR WEAPON?"), never statements.
const Base: React.FC<{children: React.ReactNode; glow?: string}> = ({children, glow = 'rgba(196,21,28,0.55)'}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at 70% 40%, ${glow} 0%, #1a0405 45%, #0A0A0A 100%)`, overflow: 'hidden'}}>
    <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '64px 64px'}} />
    {children}
    <div style={{position: 'absolute', left: 48, top: 40, display: 'flex', alignItems: 'center', gap: 14}}>
      <div style={{width: 22, height: 22, background: C.crimson}} />
      <div style={{fontFamily: F.mono.toString(), fontWeight: 700, fontSize: 34, letterSpacing: 6, color: C.cream}}>THE CRIMSON FORECAST</div>
    </div>
  </AbsoluteFill>
);
const Big: React.FC<{t: string; size: number; color?: string; x: number; y: number; rot?: number; shadow?: boolean}> = ({t, size, color = C.cream, x, y, rot = 0, shadow = true}) => (
  <div style={{position: 'absolute', left: x, top: y, fontFamily: F.display, fontSize: size, lineHeight: 0.86, color, transform: `rotate(${rot}deg)`, whiteSpace: 'nowrap',
    textShadow: shadow ? '8px 8px 0 rgba(0,0,0,0.65)' : 'none', letterSpacing: 2}}>{t}</div>
);
const Photo: React.FC<{src: string; x: number; y: number; w: number; h: number; rot?: number; bw?: boolean; tint?: boolean; pin?: boolean}> = ({src, x, y, w, h, rot = 0, bw = true, tint = true, pin}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `rotate(${rot}deg)`, background: C.cream, padding: 14, boxShadow: '14px 16px 0 rgba(0,0,0,0.55)'}}>
    <div style={{position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#000'}}>
      <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: bw ? 'grayscale(1) contrast(1.25) brightness(1.02)' : 'contrast(1.1)'}} />
      {tint && <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(196,21,28,0) 55%, rgba(196,21,28,0.55) 100%)', mixBlendMode: 'multiply'}} />}
    </div>
    {pin && <div style={{position: 'absolute', left: w / 2 - 20, top: -18, width: 40, height: 40, borderRadius: 20, background: C.crimson, border: '5px solid #0A0A0A'}} />}
  </div>
);
const Stamp: React.FC<{t: string; x: number; y: number; size: number; rot?: number}> = ({t, x, y, size, rot = -8}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg)`, border: `${size / 9}px solid ${C.crimson}`, padding: `${size / 12}px ${size / 5}px`,
    fontFamily: F.stamp, fontSize: size, color: C.crimson, background: 'rgba(10,10,10,0.82)', letterSpacing: 4, whiteSpace: 'nowrap'}}>{t}</div>
);

// A: the object. Curiosity gap: sealed boxes + "what was inside?"
export const ThumbA: React.FC = () => (
  <Base>
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
      <g transform="translate(520 980) scale(1.75)"><Crates f={999} t0={0} n={6} sealed /></g>
    </svg>
    <Big t="STILL" size={300} x={1020} y={200} />
    <Big t="SEALED." size={345} x={1010} y={450} color={C.crimson} />
    <div style={{position: 'absolute', right: 56, bottom: 54, fontFamily: F.head, fontWeight: 700, fontSize: 64, letterSpacing: 5, color: C.cream, background: C.black, padding: '8px 28px'}}>NVIDIA · MALAYSIA</div>
  </Base>
);

// B: the number + the face. Strong CTR pattern: big contrast words, one face.
export const ThumbB: React.FC = () => (
  <Base>
    <Photo src="photos/jensen-huang.jpg" x={1120} y={150} w={690} h={800} rot={3} />
    <Big t="FIRED." size={330} x={50} y={150} />
    <Big t="REHIRED." size={330} x={50} y={440} color={C.crimson} />
    <div style={{position: 'absolute', left: 60, bottom: 60, fontFamily: F.head, fontWeight: 700, fontSize: 92, letterSpacing: 6, color: C.black, background: C.cream, padding: '6px 34px', transform: 'rotate(-2deg)'}}>IN 10 DAYS</div>
  </Base>
);

// C: the twist as a question. Two faces joined by red string, UNPROVEN stamp.
export const ThumbC: React.FC = () => (
  <Base glow="rgba(196,21,28,0.4)">
    <Big t="SPY OR WEAPON?" size={290} x={120} y={130} />
    <Photo src="photos/jensen-huang.jpg" x={170} y={470} w={500} h={540} rot={-4} pin />
    <Photo src="photos/alice-huang.jpg" x={1250} y={470} w={500} h={540} rot={4} pin />
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
      <path d="M 420 480 Q 960 700 1500 480" fill="none" stroke={C.crimson} strokeWidth={12} strokeLinecap="round" />
    </svg>
    <Stamp t="UNPROVEN" x={960} y={800} size={118} />
  </Base>
);

// B2: same as B plus a big question mark on the photo (curiosity without accusing anyone)
export const ThumbB2: React.FC = () => (
  <Base>
    <Photo src="photos/jensen-huang.jpg" x={1120} y={150} w={690} h={800} rot={3} />
    <div style={{position: 'absolute', left: 1600, top: 120, fontFamily: F.display, fontSize: 560, lineHeight: 1, color: C.crimson, textShadow: '10px 10px 0 rgba(0,0,0,0.75), -4px -4px 0 #F4F1EA', transform: 'rotate(8deg)'}}>?</div>
    <Big t="FIRED." size={330} x={50} y={150} />
    <Big t="REHIRED." size={330} x={50} y={440} color={C.crimson} />
    <div style={{position: 'absolute', left: 60, bottom: 60, fontFamily: F.head, fontWeight: 700, fontSize: 92, letterSpacing: 6, color: C.black, background: C.cream, padding: '6px 34px', transform: 'rotate(-2deg)'}}>IN 10 DAYS</div>
  </Base>
);
