import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Curio, walkPose, talkPose, INK, type Pose} from './Curio';

const Label: React.FC<{x: number; y: number; t: string}> = ({x, y, t}) => <text x={x} y={y} textAnchor="middle" fontFamily="Special Elite, monospace" fontSize={30} fill={INK}>{t}</text>;
export const CurioTest: React.FC = () => {
  const poses: {t: string; pose: Pose; look?: any}[] = [
    {t: 'STAND', pose: {}},
    {t: 'WALK 0', pose: walkPose(0)}, {t: 'WALK .25', pose: walkPose(0.25)}, {t: 'WALK .5', pose: walkPose(0.5)}, {t: 'WALK .75', pose: walkPose(0.75)},
    {t: 'TALK', pose: talkPose(0.3)},
    {t: 'SURPRISED', pose: {mouth: 'o', eyes: 'wide', brows: 'up', lArm: 40, lElbow: -30, rArm: -40, rElbow: -30}},
    {t: 'WORRIED', pose: {mouth: 'frown', eyes: 'tired', brows: 'worried', lean: -4, head: 8}},
    {t: 'ANGRY', pose: {mouth: 'frown', eyes: 'squint', brows: 'angry', lArm: 20, lElbow: 70, rArm: -20, rElbow: 70}},
    {t: 'LAUGH', pose: {mouth: 'grin', eyes: 'closed', brows: 'up', lean: -8, head: -6, rArm: -50, rElbow: -20}},
  ];
  return (
    <AbsoluteFill style={{background: '#EFE6D0'}}>
      <svg width={1920} height={1080}>
        {poses.map((p, i) => {
          const cx = 190 + (i % 5) * 385, hipY = i < 5 ? 268 : 790;
          return <g key={p.t}><Curio id={`c${i}`} x={cx} y={hipY} pose={p.pose} look={{costume: 'none', scale: 0.8}} t={i * 0.4} /><Label x={cx} y={hipY + 245} t={p.t} /></g>;
        })}
      </svg>
    </AbsoluteFill>
  );
};
export const CurioTest2: React.FC = () => (
  <AbsoluteFill style={{background: '#E9DFC6'}}>
    <svg width={1920} height={1080}>
      <Curio id="a" x={380} y={400} pose={walkPose(0.1)} look={{costume: 'tunic', hair: 'messy', dirt: true, scale: 1.25}} t={1} />
      <Curio id="b" x={960} y={400} pose={{mouth: 'o', eyes: 'wide', brows: 'up', lArm: 40, lElbow: -30, rArm: -40, rElbow: -30}} look={{costume: 'tunic', hair: 'messy', scale: 1.25}} t={2} />
      <Curio id="c" x={1540} y={400} pose={{...talkPose(0.2), wind: 0.8}} look={{costume: 'tunic', tunic: '#8A5A3A', scale: 1.25, flip: true}} t={3} />
      <Label x={380} y={1020} t="ANCIENT: tunic + messy hair" /><Label x={960} y={1020} t="SURPRISED" /><Label x={1540} y={1020} t="TALKING, WIND, FLIPPED" />
    </svg>
  </AbsoluteFill>
);
