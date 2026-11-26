#!/usr/bin/env python3
"""Align a Short's phrases to its TTS audio using the pauses between phrases (the <pause> tags make them).
  python3 tools/align_short.py src/data/short-t1-phrases.txt public/audio/short-t1.wav src/data/short-t1-timing.json
One phrase per line in the txt file (split exactly where the <short pause>/<long pause> tags are)."""
import json, sys
sys.path.insert(0, 'tools')
from align import align
lines = [l.strip() for l in open(sys.argv[1], encoding='utf-8') if l.strip()]
res, dur = align(lines, sys.argv[2])
res[-1]['next'] = round(dur, 3)
json.dump(res, open(sys.argv[3], 'w'), indent=1, ensure_ascii=False)
print(len(res), 'phrases aligned; audio', round(dur, 2), 's')
for r in res: print(f"  {r['start']:6.2f} - {r['speechEnd']:6.2f}  {r['text'][:60]}")
