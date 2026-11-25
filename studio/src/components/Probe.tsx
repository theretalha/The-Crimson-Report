import React, {useEffect, useState} from 'react';
import {continueRender, delayRender, useCurrentFrame} from 'remotion';

// QA only (props.probe = true): after the frame has painted, report any text that is clipped by its card
// or cut off by the screen edge. Read the results from the render log ("PROBE_RESULT ...").
export const Probe: React.FC = () => {
  const [h] = useState(() => delayRender('probe'));
  const f = useCurrentFrame();
  useEffect(() => {
    (async () => {
      await document.fonts.ready;
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const W = 1920, H = 1080;
      const out: string[] = [];
      document.querySelectorAll<HTMLElement>('div,span,p').forEach((el) => {
        const own = Array.from(el.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent || '').join('').trim();
        if (!own) return;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || +cs.opacity < 0.05) return;
        const range = document.createRange();
        range.selectNodeContents(el);
        const r = range.getBoundingClientRect();
        if (!r.width) return;
        if (r.left < -1 || r.right > W + 1 || r.top < -1 || r.bottom > H + 1) out.push(`EDGE "${own.slice(0, 40)}" at ${Math.round(r.left)},${Math.round(r.top)}-${Math.round(r.right)},${Math.round(r.bottom)}`);
        let a: HTMLElement | null = el;
        while (a && a !== document.body) {
          const s = getComputedStyle(a);
          if (['hidden', 'clip'].includes(s.overflowX) || ['hidden', 'clip'].includes(s.overflowY)) {
            const ar = a.getBoundingClientRect();
            // display fonts have a content box taller than their letters, so allow up to 0.55em of vertical overshoot
            const tol = 0.55 * (parseFloat(cs.fontSize) || 16);
            if (r.right > ar.right + 2 || r.left < ar.left - 2 || r.bottom > ar.bottom + tol || r.top < ar.top - tol) {
              out.push(`CLIPPED "${own.slice(0, 40)}" (text ${Math.round(r.width)}x${Math.round(r.height)} in box ${Math.round(ar.width)}x${Math.round(ar.height)})`);
              break;
            }
          }
          a = a.parentElement;
        }
      });
      // text sitting on top of other text (a label over a card title, a grid over the caption...)
      const boxes: {el: HTMLElement; own: string; r: DOMRect}[] = [];
      document.querySelectorAll<HTMLElement>('div,span,p').forEach((el) => {
        const own = Array.from(el.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent || '').join('').trim();
        if (!own) return;
        const cs = getComputedStyle(el);
        let op = 1, a: HTMLElement | null = el;
        while (a) { op *= +getComputedStyle(a).opacity; a = a.parentElement; }
        if (op < 0.5 || cs.visibility === 'hidden') return;
        const range = document.createRange();
        range.selectNodeContents(el);
        const rr = range.getBoundingClientRect();
        // shrink to roughly the letters (display fonts have tall boxes)
        const fs = parseFloat(cs.fontSize) || 16;
        const r = new DOMRect(rr.left, rr.top + fs * 0.2, rr.width, Math.max(2, rr.height - fs * 0.45));
        if (r.width > 4) boxes.push({el, own, r});
      });
      for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
        const A = boxes[i], B = boxes[j];
        if (A.el.contains(B.el) || B.el.contains(A.el)) continue;
        const w = Math.min(A.r.right, B.r.right) - Math.max(A.r.left, B.r.left);
        const h = Math.min(A.r.bottom, B.r.bottom) - Math.max(A.r.top, B.r.top);
        if (w > 6 && h > 6 && (w * h) / Math.min(A.r.width * A.r.height, B.r.width * B.r.height) > 0.2) out.push(`OVERLAP "${A.own.slice(0, 26)}" x "${B.own.slice(0, 26)}"`);
      }
      document.querySelectorAll<SVGTextElement>('svg text').forEach((t) => {
        const r = t.getBoundingClientRect();
        if (r.width && (r.left < -1 || r.right > W + 1)) out.push(`EDGE svg "${(t.textContent || '').slice(0, 30)}"`);
      });
      console.log('PROBE_RESULT ' + JSON.stringify({frame: f, issues: out}));
      continueRender(h);
    })();
  }, []);
  return null;
};
