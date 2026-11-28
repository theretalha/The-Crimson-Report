#!/usr/bin/env python3
"""Cached segment render (rule: never re-render the whole video for a small change).

  python3 tools/render_segments.py [--comp EP003-Nvidia] [--audio out/ep003-master.wav] [--out out/EP003-Nvidia-Spy-Scandal.mp4] [--force]

Splits the video into chapters (frame ranges from out/ep003-cues.json), renders each chapter with `remotion render --frames=a-b --muted`,
and caches it under out/seg/<hash>.mp4. The hash covers that chapter's scene data + all rendering code (src/props, templates, kit, components, pro),
so a data-only change re-renders only the chapters you touched; a code change re-renders everything (use --force to be safe after editing a prop).
Then the segments are joined (ffmpeg concat, no re-encode) and the mastered audio is attached.
"""
import os as _os, sys as _sys
if _os.name == 'nt' and not _sys.flags.utf8_mode and __name__ == '__main__':   # Windows: default encoding is cp1252, our files are UTF-8
    _sys.exit(__import__('subprocess').call([_sys.executable, '-X', 'utf8', *_sys.argv]))
import argparse, hashlib, json, os, pathlib, subprocess, sys

FPS = 30
ap = argparse.ArgumentParser()
ap.add_argument('--comp', default='EP003-Nvidia'); ap.add_argument('--cues', default='out/ep003-cues.json')
ap.add_argument('--audio', default='out/ep003-master.wav'); ap.add_argument('--out', default='out/EP003-Nvidia-Spy-Scandal.mp4')
ap.add_argument('--scenes-json', default='out/ep003-scenes.json'); ap.add_argument('--force', action='store_true')
ap.add_argument('--ep', help='new episodes: NNN (exports cues+scenes with tools/export-ep.ts instead of the EP003 exporter)')
a = ap.parse_args()
env = dict(os.environ)
if os.path.exists('/opt/pw-browsers'): env.setdefault('CRIMSON_BROWSER', '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell')
env['PYTHONUTF8'] = '1'
NPX = 'npx.cmd' if os.name == 'nt' else 'npx'

# 1. scene data (full props, so any visual change changes the hash)
if a.ep: subprocess.run([NPX, 'tsx', 'tools/export-ep.ts', a.ep, a.cues, a.scenes_json], check=True, env=env)
else: subprocess.run([NPX, 'tsx', 'tools/export-scenes.ts', a.scenes_json], check=True, env=env)
scenes = json.load(open(a.scenes_json))
cues = json.load(open(a.cues))['cues']
assert len(scenes) == len(cues), (len(scenes), len(cues))

# 2. code hash (everything that draws pixels)
h = hashlib.sha256()
for d in ('src/props', 'src/templates', 'src/kit', 'src/components', 'src/pro', 'src/Episode.tsx', 'src/theme.ts', 'src/types.ts'):
    p = pathlib.Path(d)
    for f in sorted([p] if p.is_file() else p.rglob('*')):
        if f.is_file(): h.update(f.read_bytes())
code_hash = h.hexdigest()[:10]

# 3. chapters -> frame ranges
chapters = []
for i, c in enumerate(cues):
    if not chapters or chapters[-1]['chapter'] != c['chapter']:
        chapters.append({'chapter': c['chapter'], 'idx': []})
    chapters[-1]['idx'].append(i)
pathlib.Path('out/seg').mkdir(parents=True, exist_ok=True)
total_frames = round(sum(c['dur'] for c in cues) * FPS)
files = []; start_frame = 0; rendered = 0
for k, ch in enumerate(chapters):
    i0, i1 = ch['idx'][0], ch['idx'][-1]
    f0 = round(cues[i0]['start'] * FPS)
    f1 = (round(cues[i1 + 1]['start'] * FPS) if i1 + 1 < len(cues) else total_frames) - 1
    sh = hashlib.sha256(json.dumps([scenes[i] for i in ch['idx']], sort_keys=True).encode() + code_hash.encode() + f'{f0}-{f1}'.encode()).hexdigest()[:12]
    seg = pathlib.Path(f'out/seg/{k:02d}-{sh}.mp4')
    if a.force or not seg.exists():
        for old in pathlib.Path('out/seg').glob(f'{k:02d}-*.mp4'): old.unlink()
        print(f'render chapter {k} {ch["chapter"]} frames {f0}-{f1}', flush=True)
        subprocess.run([NPX, 'remotion', 'render', 'src/index.ts', a.comp, str(seg), f'--frames={f0}-{f1}', '--muted', '--crf=20', '--log=error'], check=True, env=env)
        rendered += 1
    else:
        print(f'cached chapter {k} {ch["chapter"]}', flush=True)
    files.append(seg)

# 4. join + audio
lst = pathlib.Path('out/seg/list.txt'); lst.write_text(''.join(f"file '{f.resolve()}'\n" for f in files))
joined = 'out/seg/_joined.mp4'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(lst), '-c', 'copy', joined], check=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', joined, '-i', a.audio, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', a.out], check=True)
print(f'DONE: {rendered} of {len(chapters)} chapters rendered -> {a.out}')
