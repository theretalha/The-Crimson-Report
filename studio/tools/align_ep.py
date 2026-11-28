#!/usr/bin/env python3
"""Generic aligner for NEW episodes (align.py is EP003-specific: it splits at a hard-coded line). One WAV per [CHAPTER] of the narration
(AI Studio is run one chapter at a time, see the narration header).

  python3 tools/align_ep.py 004 [--wav-dir audio-in/ep004]

Reads ../episodes/004-*/narration-tts.txt and audio-in/ep004/*.wav (sorted by name, one per chapter), writes
  src/data/ep004-timing.json   (start / speechEnd / next per narration line, <tags> stripped)
  public/audio/ep004.wav       (all chapters joined with a 0.6 s gap; gitignored)
"""
import os as _os, sys as _sys
if _os.name == 'nt' and not _sys.flags.utf8_mode and __name__ == '__main__':   # Windows: default encoding is cp1252, our files are UTF-8
    _sys.exit(__import__('subprocess').call([_sys.executable, '-X', 'utf8', *_sys.argv]))
import argparse, collections, importlib.util, json, pathlib, subprocess, sys

HERE = pathlib.Path(__file__).resolve().parent; STUDIO = HERE.parent
sys.path.insert(0, str(HERE))
import align as A   # reuses the pause-based aligner (its __main__ is not run)
spec = importlib.util.spec_from_file_location('director', HERE / 'director.py'); D = importlib.util.module_from_spec(spec); spec.loader.exec_module(D)

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('ep'); ap.add_argument('--wav-dir')
    a = ap.parse_args()
    eps = sorted((STUDIO.parent / 'episodes').glob(f'{a.ep}-*'))
    if not eps: sys.exit(f'no episodes/{a.ep}-* folder')
    narr = eps[0] / 'narration-tts.txt'
    lines = D.load_lines(str(narr))
    chapters = collections.OrderedDict()
    for ln in lines: chapters.setdefault(ln['chapter'], []).append(ln['text'])
    wavdir = pathlib.Path(a.wav_dir or STUDIO / 'audio-in' / f'ep{a.ep}')
    wavs = sorted(wavdir.glob('*.wav'))
    if len(wavs) != len(chapters): sys.exit(f'{len(chapters)} chapters in the script but {len(wavs)} WAV files in {wavdir} (one per chapter, sorted by name: ch00.wav, ch01.wav ...)')
    res, offset, GAP = [], 0.0, 0.6
    for (name, txt), wav in zip(chapters.items(), wavs):
        part, dur = A.align(txt, str(wav))
        for r in part:
            for k in ('start', 'speechEnd', 'next'): r[k] = round(r[k] + offset, 3)
        res += part; offset += dur + GAP
        print(f'  {name}: {len(txt)} lines, {dur:.1f} s  ({wav.name})')
    res[-1]['next'] = round(offset - GAP, 3)
    out = STUDIO / 'src' / 'data' / f'ep{a.ep}-timing.json'
    out.write_text(json.dumps(res, indent=1, ensure_ascii=False), encoding='utf-8')
    audio = STUDIO / 'public' / 'audio' / f'ep{a.ep}.wav'; audio.parent.mkdir(parents=True, exist_ok=True)
    cmd = ['ffmpeg', '-v', 'error', '-y']
    for w in wavs: cmd += ['-i', str(w)]
    n = len(wavs)
    fc = ''.join(f'[{i}:a]aresample=48000,apad=pad_dur=0.6[a{i}];' if i < n - 1 else f'[{i}:a]aresample=48000[a{i}];' for i in range(n))
    fc += ''.join(f'[a{i}]' for i in range(n)) + f'concat=n={n}:v=0:a=1[out]'
    subprocess.run(cmd + ['-filter_complex', fc, '-map', '[out]', str(audio)], check=True)
    print(f'{len(res)} lines aligned, {offset - GAP:.1f} s -> {out.relative_to(STUDIO)} and {audio.relative_to(STUDIO)}')

if __name__ == '__main__': main()
