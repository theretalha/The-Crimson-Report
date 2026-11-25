#!/usr/bin/env bash
# Generates the channel's original sound effects into public/sfx (no copyright issues).
set -e
cd "$(dirname "$0")/../public/sfx" 2>/dev/null || { mkdir -p "$(dirname "$0")/../public/sfx"; cd "$(dirname "$0")/../public/sfx"; }
F="ffmpeg -v error -y"
$F -f lavfi -i "anoisesrc=d=0.55:c=pink:a=0.9" -af "highpass=f=300,lowpass=f=4500,afade=t=in:d=0.28:curve=qsin,afade=t=out:st=0.28:d=0.27:curve=qsin,volume=1.4" -ar 48000 whoosh.wav
$F -f lavfi -i "sine=f=52:d=1.1" -f lavfi -i "anoisesrc=d=0.12:c=brown:a=1" -filter_complex "[0]volume=2.2,afade=t=out:st=0.05:d=1.05:curve=exp[a];[1]lowpass=f=1200,afade=t=out:d=0.12[b];[a][b]amix=inputs=2:normalize=0,alimiter=limit=0.95" -ar 48000 impact.wav
$F -f lavfi -i "sine=f=2200:d=0.045" -af "afade=t=out:d=0.045:curve=exp,volume=0.8" -ar 48000 tick.wav
$F -f lavfi -i "anoisesrc=d=0.035:c=white:a=1" -af "highpass=f=1500,afade=t=out:d=0.035,apad=pad_dur=0.06" -ar 48000 c1.wav
$F -i c1.wav -i c1.wav -filter_complex "[0][1]concat=n=2:v=0:a=1,volume=0.9" -ar 48000 shutter.wav && rm c1.wav
$F -f lavfi -i "anoisesrc=d=0.025:c=white:a=1" -af "bandpass=f=2500:w=1800,afade=t=out:d=0.025" -ar 48000 k.wav
for g in 0.07 0.05 0.09 0.06 0.08 0.05 0.07; do $F -i k.wav -af "apad=pad_dur=$g" -ar 48000 "k_$g.wav" 2>/dev/null || true; done
ls k_*.wav | sed 's/^/file /' > list.txt && $F -f concat -safe 0 -i list.txt -af volume=0.7 typewriter.wav && rm -f k*.wav list.txt
$F -f lavfi -i "anoisesrc=d=0.35:c=white:a=0.7" -af "highpass=f=2500,lowpass=f=9000,afade=t=in:d=0.06,afade=t=out:st=0.08:d=0.27:curve=exp" -ar 48000 paper.wav
$F -f lavfi -i "sine=f=55:d=30" -f lavfi -i "sine=f=82.4:d=30" -f lavfi -i "sine=f=110.3:d=30" -f lavfi -i "anoisesrc=d=30:c=brown:a=0.3" -filter_complex "[0]volume=0.6[a];[1]volume=0.35,tremolo=f=0.15:d=0.5[b];[2]volume=0.18,tremolo=f=0.23:d=0.6[c];[3]lowpass=f=300,volume=0.4[d];[a][b][c][d]amix=inputs=4:normalize=0,afade=t=in:d=2,afade=t=out:st=28:d=2" -ar 48000 drone.wav
echo "SFX ready in public/sfx"
