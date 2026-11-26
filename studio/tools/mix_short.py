#!/usr/bin/env python3
"""Mix one Short: approved narration lines (cut from the long-video voice) + bed + sound events -> mastered WAV.
  python3 tools/mix_short.py --shorts out/shorts.json --id s0-teaser --voice public/audio/ep003.wav --timing src/data/ep003-timing.json --out out/shorts/s0.wav
"""
import argparse, json, subprocess, sys
import numpy as np
import scipy.io.wavfile as wf
import sfx_kit as K

SR = K.SR
ap = argparse.ArgumentParser()
ap.add_argument('--shorts', required=True); ap.add_argument('--id', required=True); ap.add_argument('--voice', required=True)
ap.add_argument('--timing', required=True); ap.add_argument('--out', required=True)
a = ap.parse_args()
sp = next(s for s in json.load(open(a.shorts)) if s['id'] == a.id)
T = json.load(open(a.timing))
sr, v = wf.read(a.voice); assert sr == SR, sr
v = v.astype(np.float32) / (32768.0 if v.dtype == np.int16 else 1.0)
N = int((sp['total'] + 0.3) * SR)
voice = np.zeros(N, np.float32)
for item in sp['voice']:
    t = T[item['line']]
    seg = v[int(max(0, t['start'] - 0.03) * SR): int((t['speechEnd'] + 0.12) * SR)].copy()
    n = int(0.015 * SR); seg[:n] *= np.linspace(0, 1, n); seg[-n:] *= np.linspace(1, 0, n)
    i0 = int(item['at'] * SR); voice[i0:i0 + len(seg)] += seg[:max(0, N - i0)]
act = np.abs(voice) > 0.01
Vdb = 20 * np.log10(np.sqrt(np.mean(voice[act] ** 2)) + 1e-9)
# bed: slow dark drone, calibrated under the voice, ducked while speaking
L = K.make_bed()
def loop(x, n): return np.tile(x, (1, int(np.ceil(n / x.shape[1]))))[:, :n]
def rms(x): return np.sqrt(np.mean(x ** 2)) + 1e-9
root, pad = loop(L['root'], N), loop(L['pad'], N)
g_root = 10 ** ((Vdb - 17) / 20) / rms(root); g_pad = 10 ** ((Vdb - 19) / 20) / rms(pad)
env = np.convolve(np.abs(voice), np.ones(int(0.12 * SR)) / int(0.12 * SR), 'same')
duck = 1 - 0.45 * np.clip(env / 0.04, 0, 1)
duck = np.convolve(duck, np.ones(int(0.25 * SR)) / int(0.25 * SR), 'same')
bed = (root * g_root + pad * g_pad) * duck
fade = np.minimum(1, np.arange(N) / (0.5 * SR)) * np.minimum(1, (N - np.arange(N)) / (0.8 * SR))
bed *= fade
# sound effects (peak dBFS as declared by the scene events)
cache = {}
def snd(e):
    k = (e['kind'], e.get('f'), e.get('v', 0) % 3, e.get('count'))
    if k in cache: return cache[k]
    kind = e['kind']
    if kind == 'impact': x = K.impact(1 + e.get('v', 0) % 2)
    elif kind == 'whoosh': x = K.whoosh(e.get('v', 0))
    elif kind == 'tick': x = K.tick(e.get('f', 880.0))
    elif kind == 'ping': x = K.ping(e.get('f', 1318.5))
    elif kind == 'paper': x = K.paper(e.get('v', 0))
    elif kind == 'marker': x = K.marker()
    elif kind == 'stamp': x = K.stamp()
    elif kind == 'slam': x = K.slam()
    elif kind == 'keys': x = K.keys(e.get('count', 6), 4)
    elif kind == 'shutter': x = K.shutter(e.get('v', 0))
    elif kind == 'braam': x = K.braam()
    else: return None
    x = np.asarray(x, np.float32)
    if x.ndim == 1: x = np.stack([x, x])
    cache[k] = x / (np.max(np.abs(x)) + 1e-9)
    return cache[k]
sfx = np.zeros((2, N), np.float32); last = {}
thin = {'paper': 0.5, 'tick': 0.35, 'ping': 0.5, 'marker': 0.7}
for e in sorted(sp['events'], key=lambda e: e['t']):
    g = thin.get(e['kind'])
    if g and e['t'] - last.get(e['kind'], -9) < g: continue
    if g: last[e['kind']] = e['t']
    x = snd(e)
    if x is None: continue
    i0 = int(e['t'] * SR)
    if i0 >= N: continue
    n = min(x.shape[1], N - i0)
    sfx[:, i0:i0 + n] += x[:, :n] * 10 ** ((e.get('db', -18) - (2 if e['kind'] in ('paper', 'tick') else 0)) / 20)
out = np.stack([voice, voice]) * 1.0 + bed + sfx
out = np.tanh(out * 1.1) / 1.1
wf.write(a.out + '.pre.wav', SR, (out.T * 32767).astype(np.int16))
# master to -14 LUFS (two pass)
m = subprocess.run(['ffmpeg', '-hide_banner', '-i', a.out + '.pre.wav', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
j = json.loads(m[m.rindex('{'):m.rindex('}') + 1])
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', a.out + '.pre.wav', '-af', f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true", '-ar', '48000', a.out], check=True)
print(f"{a.id}: {sp['total']:.1f} s, voice {Vdb:.1f} dBFS, {len(sp['events'])} events -> {a.out}")
