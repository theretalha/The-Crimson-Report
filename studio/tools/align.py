"""Align script lines to TTS audio using the pauses between lines.

Usage: python3 tools/align.py <narration.txt> <out.json> <part1.wav> [<part2.wav> ...]
Text parts in narration.txt are split at lines starting with '[PART' or use the
split marker given by --split "<first line of part 2>".
"""
import json, re, subprocess, sys

def silences(wav, d=0.28, db=-35):
    out = subprocess.run(['ffmpeg', '-hide_banner', '-i', wav, '-af', f'silencedetect=noise={db}dB:d={d}', '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', out)]
    en = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', out)]
    dur = float(re.search(r'Duration: (\d+):(\d+):([\d.]+)', out).group(3)) + 60 * int(re.search(r'Duration: (\d+):(\d+)', out).group(2))
    return list(zip(st, en)), dur

def align(lines, wav):
    sil, dur = silences(wav)
    speech_start = sil[0][1] if sil and sil[0][0] < 0.05 else 0.0
    speech_end = sil[-1][0] if sil and sil[-1][1] > dur - 0.05 else dur
    inner = [(a, b) for a, b in sil if a > speech_start + 0.1 and b < speech_end - 0.1]
    w = [len(l) + 12 for l in lines]  # +12: each line also costs a pause
    tot = sum(w)
    exp, c = [], 0
    for x in w[:-1]:
        c += x
        exp.append(speech_start + (speech_end - speech_start) * c / tot)
    N, M = len(exp), len(inner)
    assert M >= N, f'only {M} pauses for {N} boundaries'
    INF = float('inf')
    # dp[i][j]: best cost placing first i boundaries using candidates < j
    dp = [[INF] * (M + 1) for _ in range(N + 1)]
    bk = [[False] * (M + 1) for _ in range(N + 1)]
    for j in range(M + 1): dp[0][j] = 0
    for i in range(1, N + 1):
        for j in range(i, M + 1):
            a, b = inner[j - 1]
            mid = (a + b) / 2
            take = dp[i - 1][j - 1] + (mid - exp[i - 1]) ** 2 - 4.0 * min(b - a, 1.0)
            skip = dp[i][j - 1]
            if take < skip: dp[i][j], bk[i][j] = take, True
            else: dp[i][j] = skip
    picks, i, j = [], N, M
    while i > 0:
        if bk[i][j]: picks.append(inner[j - 1]); i -= 1
        j -= 1
    picks.reverse()
    # Fix lines that came out impossibly fast (a mid-line pause, e.g. after a colon, was taken
    # as the line end): push the boundary to the next pause if the next line can absorb it.
    rate = lambda txt, a, b: len(txt) / max(b - a, 0.05)
    for k in range(N):
        prev_end = picks[k - 1][1] if k else speech_start
        if rate(lines[k], prev_end, picks[k][0]) > 26:
            nxt_end = picks[k + 1][0] if k + 1 < N else speech_end
            for a, b in inner:
                if a > picks[k][0] and b < nxt_end and rate(lines[k], prev_end, a) <= 26 and rate(lines[k + 1], b, nxt_end) <= 22:
                    picks[k] = (a, b)
                    break
    res, start = [], speech_start
    for k, line in enumerate(lines):
        end = picks[k][0] if k < N else speech_end
        nxt = picks[k][1] if k < N else dur
        res.append({'text': line, 'start': round(start, 3), 'speechEnd': round(end, 3), 'next': round(nxt, 3)})
        start = nxt
    return res, dur

if __name__ == '__main__':
    txt, out, wavs = sys.argv[1], sys.argv[2], sys.argv[3:]
    body = open(txt, encoding='utf-8').read().split('=====================================================================')[-1]
    lines = [l.strip() for l in body.splitlines() if l.strip() and not l.strip().startswith('[CHAPTER')]
    split = lines.index('But the story didn\'t end there.')
    parts = [lines[:split], lines[split:]]
    allres, offset, GAP = [], 0.0, 0.6
    for p, wav in zip(parts, wavs):
        res, dur = align(p, wav)
        for r in res:
            for k in ('start', 'speechEnd', 'next'): r[k] = round(r[k] + offset, 3)
        allres += res
        offset += dur + GAP
    allres[-1]['next'] = round(offset - GAP, 3)
    json.dump(allres, open(out, 'w'), indent=1, ensure_ascii=False)
    print(len(allres), 'lines aligned; total', round(offset - GAP, 2), 's')
