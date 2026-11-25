import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Probe} from './Probe';
// A scene with three deliberate mistakes, to prove the checker catches them: overlap, clipping, off-screen text.
export const ProbeSelfTest: React.FC<{probe?: boolean}> = () => (
  <AbsoluteFill style={{background: '#222', color: '#fff', fontFamily: 'Arial'}}>
    <Probe />
    <div style={{position: 'absolute', left: 100, top: 100, fontSize: 60}}>HELLO WORLD</div>
    <div style={{position: 'absolute', left: 140, top: 110, fontSize: 60}}>OVERLAPPING</div>
    <div style={{position: 'absolute', left: 100, top: 400, width: 100, height: 40, overflow: 'hidden', fontSize: 50, whiteSpace: 'nowrap'}}>CLIPPED TEXT HERE</div>
    <div style={{position: 'absolute', left: 1750, top: 600, fontSize: 60, whiteSpace: 'nowrap'}}>OFF EDGE TEXT</div>
    <div style={{position: 'absolute', left: 100, top: 800, fontSize: 40}}>CLEAN LINE (should not be reported)</div>
  </AbsoluteFill>
);
