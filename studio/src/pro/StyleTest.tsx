import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ProIcon} from './ProIcon';
import {Icon} from '../components/Icons';
import {FONT_MONO, FONT_HEAD} from '../theme';

const Label: React.FC<{t: string; c?: string}> = ({t, c = '#8F8A84'}) => <div style={{fontFamily: FONT_MONO, fontWeight: 700, fontSize: 26, letterSpacing: 4, color: c, textAlign: 'center', marginTop: 18}}>{t}</div>;
const Col: React.FC<{children: React.ReactNode; label: string; c?: string}> = ({children, label, c}) => <div style={{width: 400}}>{children}<Label t={label} c={c} /></div>;

export const StyleTest: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #1b1b1b, #070707)', fontFamily: FONT_HEAD}}>
    <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(242,238,230,0.05) 2px, transparent 2px), linear-gradient(90deg, rgba(242,238,230,0.05) 2px, transparent 2px)', backgroundSize: '80px 80px'}} />
    {/* before */}
    <div style={{position: 'absolute', left: 90, top: 70, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, letterSpacing: 5, color: '#8F8A84'}}>BEFORE · flat shapes drawn in code</div>
    <div style={{position: 'absolute', left: 150, top: 130, display: 'flex', gap: 160}}>
      {(['phoneChip', 'whitehouse', 'servers'] as const).map((n) => <div key={n} style={{width: 340, height: 340}}><Icon name={n} main="#F4F1EA" accent="#C8141E" /></div>)}
    </div>
    {/* after */}
    <div style={{position: 'absolute', left: 90, top: 560, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, letterSpacing: 5, color: '#FF4D4D'}}>AFTER · drawn on, off-register print shadow, light sweep, HUD plate</div>
    <div style={{position: 'absolute', left: 150, top: 620, display: 'flex', gap: 160}}>
      {(['cpu', 'landmark', 'server'] as const).map((n, i) => <ProIcon key={n} name={n} size={340} delay={4 + i * 6} seed={i * 2} />)}
    </div>
  </AbsoluteFill>
);
