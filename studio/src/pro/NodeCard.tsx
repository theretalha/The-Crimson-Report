import React from 'react';
import {Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Mood} from '../theme';
import {FONT_BODY, FONT_HEAD} from '../theme';
import {ProIcon} from './ProIcon';
import {pal} from './palette';

// A person / company / money card used by the connected entity map. Pops in when `delay` is reached.
type P = {x: number; y: number; w?: number; h?: number; title: string; sub?: string; photo?: string; icon?: string; delay: number; dim?: boolean; focus?: boolean; mood: Mood};
export const NodeCard: React.FC<P> = ({x, y, w = 340, h = 180, title, sub, photo, icon, delay, dim, focus, mood}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const c = pal(mood);
  const s = spring({frame: f - delay, fps, config: {damping: 13, mass: 0.8}});
  if (f < delay) return null;
  const pic = h - 60;
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, boxSizing: 'border-box', borderRadius: 14, padding: 18,
      background: c.glass, border: `2px solid ${focus ? c.hot : c.border}`, overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 16,
      boxShadow: focus ? `0 0 0 3px ${c.hot}55, 0 0 46px ${c.hot}66, 0 14px 30px rgba(0,0,0,0.35)` : '0 14px 30px rgba(0,0,0,0.3)',
      opacity: (dim ? 0.42 : 1) * Math.min(1, s * 2), transform: `translateY(${(1 - s) * 34}px) scale(${(dim ? 0.97 : 1) * interpolate(s, [0, 1], [0.86, 1])})`}}>
      <div style={{position: 'absolute', left: 0, top: 0, right: 0, height: 6, background: c.accent}} />
      <div style={{width: pic, height: pic, flex: `0 0 ${pic}px`, borderRadius: 10, overflow: 'hidden', background: mood === 'facts' ? 'rgba(14,14,14,0.06)' : 'rgba(255,255,255,0.06)', position: 'relative'}}>
        {photo ? <Img src={staticFile(photo)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 18%', filter: photo.endsWith('.svg') ? 'none' : 'grayscale(0.55) contrast(1.06)'}} />
          : icon ? <div style={{position: 'absolute', left: 8, top: 8}}><ProIcon name={icon} size={pic - 16} plate={false} delay={delay + 4} main={c.iconMain} accent={c.iconAccent} light={c.light} /></div> : null}
      </div>
      <div style={{minWidth: 0, flex: 1}}>
        <div style={{fontFamily: FONT_HEAD, fontSize: title.length > 10 ? 26 : 30, lineHeight: 1.02, letterSpacing: 0.5, color: c.fg, overflowWrap: 'anywhere'}}>{title}</div>
        {sub && <div style={{fontFamily: FONT_BODY, fontWeight: 600, fontSize: 19, lineHeight: 1.15, color: c.muted, marginTop: 6}}>{sub}</div>}
      </div>
    </div>
  );
};
