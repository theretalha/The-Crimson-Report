#!/usr/bin/env python3
"""Stage 0 helper: today's date and the next episode number.  python3 tools/next_ep.py
Next number = highest NNN among episodes/NNN-*/ (EP 000 is the pipeline self-test fixture and is ignored) + 1.
Also lists the topics already covered so a pitch never repeats one."""
import datetime, pathlib, re
EP = pathlib.Path(__file__).resolve().parent.parent.parent / 'episodes'
done = sorted((int(m.group(1)), p.name) for p in EP.iterdir() if p.is_dir() and (m := re.match(r'(\d{3})-', p.name)) and int(m.group(1)) > 0)
print('today:', datetime.date.today().isoformat())
print('episodes so far:', ', '.join(n for _, n in done) or 'none')
print('next episode number:', f"{(max(i for i, _ in done) + 1) if done else 1:03d}")
