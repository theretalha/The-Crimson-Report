#!/usr/bin/env python3
"""Pipeline driver for NEW episodes (AGENTS.md). Run from studio/.  EP 003 and Curio are not touched by any of this.

  python3 tools/stage.py audio  004      stage 2: align + join voice, fetch assets, draft mix (-14 LUFS, chapter hits only)
  python3 tools/stage.py remix  004      audio only: re-mix with the REAL scene cues (after the scenes exist) -> final -14 LUFS master
  python3 tools/stage.py check  004      stage 3 gates: custom props coded, director --strict, probe.ts, asset placeholders, no risers
  python3 tools/stage.py stills 004      stage 3: check + keyframe stills for the owner, then STOP (writes out/ep004/AWAITING-APPROVAL)
  python3 tools/stage.py approve 004     the owner said "approved": unlocks the heavy renders
  python3 tools/stage.py ship   004      render_segments.py (+ shorts listed in out/ep004/shorts.json). Refuses without approval.
Add --dry-run to print the commands without running them.

Conventions for epNNN: episodes/NNN-slug/ (docs) · src/data/epNNN.ts exporting build(): Scene[] · composition id EPNNN in src/Root.tsx
· src/props/custom/epNNN/ (custom props) · public/assets/epNNN/ (fetched assets) · audio-in/epNNN/ch00.wav ... (one WAV per chapter).
"""
import argparse, glob, json, os, pathlib, re, shutil, subprocess, sys

HERE = pathlib.Path(__file__).resolve().parent; STUDIO = HERE.parent; REPO = STUDIO.parent
os.chdir(STUDIO)
DRY = False
env = dict(os.environ)
if pathlib.Path('/opt/pw-browsers').exists():   # cloud container; on the laptop Remotion downloads its own browser
    env.setdefault('CRIMSON_BROWSER', '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell')
NPX = 'npx.cmd' if os.name == 'nt' else 'npx'


def sh(*cmd, check=True, capture=False):
    print('$', ' '.join(str(c) for c in cmd), flush=True)
    if DRY: return subprocess.CompletedProcess(cmd, 0, '', '')
    return subprocess.run([str(c) for c in cmd], check=check, env=env, capture_output=capture, text=True)


def ep_dir(n):
    d = sorted((REPO / 'episodes').glob(f'{n}-*'))
    if not d: sys.exit(f'ERROR: no episodes/{n}-* folder. Create it in stage 1.')
    return d[0]


def need(path, why):
    if not pathlib.Path(path).exists(): sys.exit(f'ERROR: {path} is missing: {why}')


# ------------------------------------------------------------------ stage 2
def skeleton_cues(n):
    """Chapter-level cues from the timing, so the voice track can be mixed (bed + chapter hits) before any scene exists."""
    D = json.load(open(f'src/data/ep{n}-timing.json'))
    import importlib.util
    spec = importlib.util.spec_from_file_location('director', HERE / 'director.py'); M = importlib.util.module_from_spec(spec); spec.loader.exec_module(M)
    lines = M.load_lines(str(ep_dir(n) / 'narration-tts.txt'))
    cues, last, t_end = [], None, D[-1]['next']
    for i, (ln, tm) in enumerate(zip(lines, D)):
        if ln['chapter'] != last:
            cues.append({'i': len(cues), 'start': tm['start'], 'dur': 0, 'template': 'title', 'mood': 'context', 'chapter': ln['chapter'], 'fx': None, 'line': i, 'part': 0, 'n': 0, 'glitch': False, 'events': []})
            last = ln['chapter']
    for k, c in enumerate(cues): c['dur'] = round((cues[k + 1]['start'] if k + 1 < len(cues) else t_end) - c['start'], 3)
    pathlib.Path(f'out/ep{n}').mkdir(parents=True, exist_ok=True)
    json.dump({'total': t_end, 'cues': cues}, open(f'out/ep{n}/skeleton-cues.json', 'w'))
    return f'out/ep{n}/skeleton-cues.json'


def mix(n, cues):
    pathlib.Path(f'out/ep{n}').mkdir(parents=True, exist_ok=True)
    sh('python3', 'tools/mix_audio.py', '--voice', f'public/audio/ep{n}.wav', '--cues', cues, '--timing', f'src/data/ep{n}-timing.json', '--out', f'out/ep{n}/mix.wav')
    if DRY: return
    probe = subprocess.run(['ffmpeg', '-hide_banner', '-i', f'out/ep{n}/mix.wav', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
    m = json.loads(re.search(r'\{[^{}]*"input_i"[^{}]*\}', probe, re.S).group(0))
    sh('ffmpeg', '-v', 'error', '-y', '-i', f'out/ep{n}/mix.wav', '-af',
       f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true",
       '-ar', '48000', f'out/ep{n}/master.wav')
    shutil.copyfile(f'out/ep{n}/mix.wav', f'public/audio/ep{n}-mix.wav')
    print(f'master -> out/ep{n}/master.wav (-14 LUFS, TP -1.5)')


def stage_audio(n):
    ep_dir(n); need(f'audio-in/ep{n}', 'put one WAV per chapter here (ch00.wav, ch01.wav ...) from Google AI Studio')
    sh('python3', 'tools/align_ep.py', n)
    todo = ep_dir(n) / 'assets-todo.md'
    sh('python3', 'tools/fetch_assets.py', '--ep', n, '--todo', todo if todo.exists() else 'ASSETS-TODO.md', check=False)  # never blocks: placeholders cover misses
    mix(n, skeleton_cues(n) if not DRY else 'out/skeleton.json')
    print(f'\nSTAGE 2 DONE. Voice, timing, assets and a draft master are ready. Next: say "render" (stage 3).')


def stage_remix(n):
    need(f'out/ep{n}-cues.json', f'run: npx tsx tools/export-ep.ts {n} out/ep{n}-cues.json out/ep{n}-scenes.json')
    mix(n, f'out/ep{n}-cues.json')


# ------------------------------------------------------------------ stage 3
def stage_check(n):
    d = ep_dir(n); bad = []
    need(f'src/data/ep{n}.ts', 'stage 3 writes the scene data file (export const build = (): Scene[] => ...)')
    sh(NPX, 'tsx', 'tools/export-ep.ts', n, f'out/ep{n}-cues.json', f'out/ep{n}-scenes.json')
    cf = json.load(open(d / 'episode.json')).get('custom_folder') if (d / 'episode.json').exists() else None   # fixtures only; real episodes use ep<NNN>
    r = sh('python3', 'tools/director.py', '--narration', d / 'narration-tts.txt', '--timing', f'src/data/ep{n}-timing.json', '--cues', f'out/ep{n}-cues.json',
           '--ep', n, *(['--custom-folder', cf] if cf else []), '--shotlist', d / 'shot-list.md', '--out', f'out/ep{n}/director.json', '--md', d / 'director-analysis.md', '--strict', check=False)
    if r.returncode: bad.append('director.py --strict has violations (see output / director-analysis.md)')
    if not DRY:
        mp = pathlib.Path(f'public/assets/ep{n}/manifest.json')
        if mp.exists():
            pend = [m for m in json.load(open(mp)) if m['status'] != 'ok' and m['dest'] != 'footage']
            if pend: bad.append(f'{len(pend)} photo/flag assets are still PLACEHOLDERS: run tools/fetch_assets.py --ep {n} on the laptop (' + ', '.join(m['save_as'] for m in pend[:6]) + ')')
        cues = json.load(open(f'out/ep{n}-cues.json'))['cues']
        if any(e.get('kind') == 'riser' for c in cues for e in c.get('events', [])): bad.append('a scene declares a riser sound (banned)')
        frames = [c['keyframe'] for c in cues]
        pathlib.Path('out/probe-frames.txt').write_text('\n'.join(map(str, frames)))
    sh(NPX, 'remotion', 'bundle', 'src/index.ts', '--out-dir=out/_bundle', '--log=error')
    sh(NPX, 'tsx', 'tools/probe.ts', 'out/probe-frames.txt', f'EP{n}')
    if not DRY and pathlib.Path('out/probe-report.json').exists() and json.load(open('out/probe-report.json')): bad.append('probe.ts found clipped or overlapping text (out/probe-report.json)')
    if bad:
        print('\nGATES FAILED:'); [print(' -', b) for b in bad]; sys.exit(1)
    print('\nall gates passed')


def stage_stills(n):
    stage_check(n)
    out = f'out/ep{n}/stills'
    shutil.rmtree(out, ignore_errors=True) if not DRY else None
    sh(NPX, 'tsx', 'tools/stills.ts', f'EP{n}', f'out/ep{n}-cues.json', out)
    if not DRY:
        pathlib.Path(f'out/ep{n}/APPROVED').unlink(missing_ok=True)
        pathlib.Path(f'out/ep{n}/AWAITING-APPROVAL').write_text('stills rendered; waiting for the owner\n')
    print(f'\nSTOP. Keyframe stills are in studio/{out}/ (INDEX.md lists them). Show them to the owner.')
    print(f'Nothing heavy has been rendered. When the owner approves, run: python3 tools/stage.py approve {n}  then  ship')


def stage_approve(n):
    need(f'out/ep{n}/AWAITING-APPROVAL', 'run stills first')
    pathlib.Path(f'out/ep{n}/APPROVED').write_text('approved by the owner\n'); pathlib.Path(f'out/ep{n}/AWAITING-APPROVAL').unlink()
    print(f'approved. Now: python3 tools/stage.py ship {n}')


def stage_ship(n):
    if not DRY and not pathlib.Path(f'out/ep{n}/APPROVED').exists(): sys.exit('REFUSED: the owner has not approved the stills yet (out/ep%s/APPROVED missing). Run stills, show them, wait.' % n)
    need(f'out/ep{n}/master.wav', f'run: python3 tools/stage.py remix {n}')
    print('NOTE: a full render takes a long time. The owner approved it, so go.')
    sh('python3', 'tools/render_segments.py', '--ep', n, '--comp', f'EP{n}', '--cues', f'out/ep{n}-cues.json', '--scenes-json', f'out/ep{n}-scenes.json', '--audio', f'out/ep{n}/master.wav', '--out', f'out/ep{n}/EP{n}.mp4')
    sj = pathlib.Path(f'out/ep{n}/shorts.json')
    for s in (json.load(open(sj)) if sj.exists() else []):
        pathlib.Path(s['out']).parent.mkdir(parents=True, exist_ok=True)
        sil = s['out'].replace('.mp4', '-silent.mp4')
        sh(NPX, 'remotion', 'render', 'src/index.ts', s['comp'], sil, '--muted', '--crf=20', '--log=error')
        sh('ffmpeg', '-v', 'error', '-y', '-i', sil, '-i', s['wav'], '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', s['out'])
    print(f'\nDONE: out/ep{n}/EP{n}.mp4')


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('stage', choices=['audio', 'remix', 'check', 'stills', 'approve', 'ship']); ap.add_argument('ep'); ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()
    if not re.fullmatch(r'\d{3}', a.ep): ap.error('episode must be three digits, e.g. 004')
    if a.ep in ('003',) and not a.dry_run: sys.exit('EP 003 is frozen: this driver is for new episodes only.')
    DRY = a.dry_run
    {'audio': stage_audio, 'remix': stage_remix, 'check': stage_check, 'stills': stage_stills, 'approve': stage_approve, 'ship': stage_ship}[a.stage](a.ep)
