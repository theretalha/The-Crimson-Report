#!/usr/bin/env python3
"""
Crimson mixer: voice + sound design -> one stereo WAV, built offline (renders in seconds, no video render needed).

  npx tsx tools/export-cues.ts out/ep003-cues.json
  python3 tools/mix_audio.py --voice public/audio/ep003.wav --cues out/ep003-cues.json \
      --timing src/data/ep003-timing.json --out public/audio/ep003-mix.wav

What it does (and why):
  BED     a continuous dark drone that never leaves, even in pauses. Sub (felt) + body (150-450 Hz, what phone
          speakers actually play) + breathing air. Mood changes the colour: black = drone, crimson = adds a
          heartbeat and a clashing note, cream = lighter with a glassy pad.
  DUCK    the bed sinks under the narrator (measured from the voice itself) and swells back in pauses.
  HITS    sized by importance, not one-per-cut:
            chapter start      riser -> drop-out -> braam
            big reveal / twist riser -> drop-out -> impact (+ braam), and the bed swells
            mood turns crimson impact
            photo card         shutter + typewriter name tag     news clip   paper + marker swipe
            dots / cards / pins  tuned ticks that climb in pitch (D minor)
            visual jump        soft panning whoosh (only when the picture type changes)
          Every sound is placed on the frame where the visual LANDS, not where the scene starts.
"""
import argparse
import json
from collections import Counter

import numpy as np
import scipy.io.wavfile as wf
import scipy.signal as ss
from scipy.ndimage import binary_closing, gaussian_filter1d

import sfx_kit as K

SR = K.SR
CR = 200  # control rate for gain curves (Hz)
FPS = 30
FAMILY = {"title": "text", "stat": "text", "split": "text", "cards": "text", "icon": "icon", "photos": "photo",
          "headline": "clip", "document": "clip", "newspaper": "clip", "tweet": "clip", "map": "map", "timeline": "tl"}
PENT = [587.33, 698.46, 880.0, 1046.5, 1174.66]  # D5 F5 A5 C6 D6


def band_env(x, lo, hi, hop_s=0.02):
    y = ss.sosfilt(ss.butter(4, [lo, hi], btype="band", fs=SR, output="sos"), x)
    hop = int(hop_s * SR)
    n = len(y) // hop
    return np.sqrt((y[: n * hop].reshape(n, hop) ** 2).mean(1)) + 1e-9


def mean_db(e):
    return 20 * np.log10(e.mean())


def load_voice(path):
    sr, x = wf.read(path)
    x = x.astype(np.float32) / (32768.0 if x.dtype == np.int16 else 1.0)
    if x.ndim > 1:
        x = x.mean(1)
    if sr != SR:
        x = ss.resample_poly(x, SR, sr).astype(np.float32)
    return x


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", required=True)
    ap.add_argument("--cues", required=True)
    ap.add_argument("--timing", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--bed-offset", type=float, default=0.0, help="dB; raise (+) or lower (-) the bed. 0 = default (sub -15 dB, low -18 dB under the voice)")
    ap.add_argument("--stems", default=None, help="folder: also write bed.wav and sfx.wav so each part can be heard alone")
    ap.add_argument("--hits-offset", type=float, default=0.0, help="dB added to every sound effect")
    a = ap.parse_args()

    voice = load_voice(a.voice) * 0.72  # headroom for the hits; the final loudness step brings the whole mix back up
    cues = json.load(open(a.cues))["cues"]
    lines = json.load(open(a.timing))
    total = len(voice) / SR
    N = len(voice) + SR // 2

    # ---------------------------------------------------------------- voice analysis
    ve = band_env(voice, 500, 3500, 0.005)  # 5 ms hop = control rate
    hop20 = band_env(voice, 500, 3500, 0.02)
    V_db = mean_db(hop20[hop20 > np.quantile(hop20, 0.5)])  # same yardstick used on the reference
    thr = 10 ** ((V_db - 22) / 20)
    mask = ve > thr
    mask = binary_closing(mask, structure=np.ones(int(0.5 * CR)))  # bridge gaps up to 0.5 s: duck per sentence, not per word
    mask = np.roll(mask, -int(0.10 * CR))  # look-ahead: start easing down before the sentence starts
    D = np.zeros(len(mask))  # duck amount 0..1, fast attack, slow release
    cur = 0.0
    ka, kr = 1 - np.exp(-1 / (0.08 * CR)), 1 - np.exp(-1 / (0.8 * CR))  # slow attack and release: no audible pumping
    for i, m in enumerate(mask):
        cur += ((ka if m > cur else kr)) * (float(m) - cur)
        D[i] = cur
    tc = np.arange(len(D)) / CR

    # ---------------------------------------------------------------- mood curves for the bed
    def mood_curve(name):
        arr = np.zeros(len(D))
        for k, c in enumerate(cues):
            end = cues[k + 1]["start"] if k + 1 < len(cues) else total + 1
            arr[int(c["start"] * CR) : int(end * CR)] = 1.0 if c["mood"] == name else 0.0
        return gaussian_filter1d(arr, 0.7 * CR, mode="nearest")

    M = {n: mood_curve(n) for n in ("context", "danger", "facts")}

    # ---------------------------------------------------------------- events
    def gap_before(c):
        if c["part"] != 0 or c["line"] == 0:
            return 0.0 if c["part"] != 0 else 9.0
        return max(0.0, lines[c["line"]]["start"] - lines[c["line"] - 1]["speechEnd"])

    def land(c):
        """time the visual actually lands (animation frame offsets, same as the Remotion templates)"""
        T, n, tp = c["start"], c["n"], c["template"]
        off = {"title": 1, "stat": 6 + 14 * max(0, n - 1), "photos": 5, "headline": 3, "split": 4, "cards": 4, "map": 2, "timeline": 6, "icon": 4}.get(tp, 2)
        return T + off / FPS

    ev = []  # (time, kind, peak_db, params)
    dips, swells = [], []
    last_whoosh = -9.0
    cnt = Counter()
    imp_var = 0

    def add(t, kind, db, **p):
        ev.append((t, kind, db + a.hits_offset, p))
        cnt[kind] += 1

    for k, c in enumerate(cues):
        T, n, tp, prev = c["start"], c["n"], c["template"], (cues[k - 1] if k else None)
        gap = gap_before(c)
        h = land(c)
        big = False
        new_chapter = prev is None or prev["chapter"] != c["chapter"]

        if prev is None:  # cold open: sub-bass bloom
            add(0.0, "impact", -10)
            big = True
        elif new_chapter:
            L = min(1.6, gap + 0.25)
            if gap >= 0.45:
                add(h - L, "riser", -17, d=L)
                dips.append(h)
            add(h - 0.03, "braam", -8)
            swells.append(h)
            big = True
        if c["fx"]:
            L = min(1.4, gap + 0.3 + (h - T))
            if L >= 0.5 and not (new_chapter and prev):
                add(h - L, "riser", -16, d=L)
                dips.append(h)
            add(h - 0.02, "impact", -7, v=imp_var)
            imp_var += 1
            if c["fx"] == "twist":
                add(h - 0.02, "braam", -10)
            swells.append(h)
            big = True
        elif prev and prev["mood"] != c["mood"] and c["mood"] == "danger":
            add(h - 0.02, "impact", -11, v=imp_var)
            imp_var += 1
            swells.append(h)
            big = True

        # per-template sounds, placed on the animation frames
        if tp == "title":
            if not big and c["mood"] == "danger":
                add(h, "impact", -13, v=imp_var)
                imp_var += 1
            elif not big and c["dur"] >= 1.4 and not (prev and prev["template"] == "title"):
                add(h, "slam", -20)
            if c["glitch"]:
                add(T + 0.04, "glitch", -17)
        elif tp == "photos":
            for i in range(n):
                add(T + (4 + 9 * i) / FPS, "shutter", -14, v=i)
                add(T + (16 + 9 * i) / FPS, "keys", -25, count=5 + 2 * i, seed=k * 7 + i)
        elif tp in ("headline", "document", "newspaper", "tweet"):
            add(T + 2 / FPS, "paper", -18, v=k)
            add(T + 18 / FPS, "marker", -25)
        elif tp == "stat":
            for i in range(n):
                at = T + (6 + 14 * i) / FPS
                if i < n - 1:
                    add(at, "tick", -19, f=PENT[i % 5])
                elif not big:
                    add(at, "impact", -11, v=imp_var)
                    imp_var += 1
        elif tp == "cards":
            for i in range(n):
                add(T + (round(i / n * c["dur"] * FPS * 0.8) + 4) / FPS, "tick", -20, f=PENT[min(i, 4)])
        elif tp == "timeline":
            for i in range(n):
                durf = c["dur"] * FPS
                add(T + (6 + round(i / max(1, n) * min(durf * 0.7, n * 18))) / FPS, "tick", -20, f=PENT[i % 5])
        elif tp == "map":
            for i in range(n):
                add(T + (8 + 10 * i) / FPS, "ping", -23, f=[1318.5, 1568.0, 1760.0, 2093.0][i % 4])
        elif tp == "split":
            add(T + 4 / FPS, "slam", -15)
            add(T + 12 / FPS, "slam", -15)
            add(T + 22 / FPS, "tick", -19, f=1174.66)

        # visual jump -> soft whoosh (only when the picture type changes, never on top of a big hit)
        if (prev and not big and c["part"] == 0 and tp not in ("title", "icon") and FAMILY[tp] != FAMILY[prev["template"]]
                and prev["dur"] >= 1.5 and h - last_whoosh > 2.0):
            add(h - 0.275, "whoosh", -21 if gap > 0.25 else -26, v=k)
            last_whoosh = h

    add(cues[-1]["start"] + 0.1, "stamp", -11)  # FILE CLOSED

    # ---------------------------------------------------------------- sound effects (rendered first)
    cache = {}

    def snd(kind, p):
        key = (kind, p.get("v", 0) % 3 if kind in ("whoosh", "paper") else p.get("v", 0) % 2 if kind in ("impact", "shutter") else p.get("f"), round(p.get("d", 0), 2), p.get("count"), p.get("seed"))
        if key in cache:
            return cache[key]
        if kind == "impact": x = K.impact(1 + p.get("v", 0) % 2)
        elif kind == "braam": x = K.braam()
        elif kind == "riser": x = K.riser(p["d"], 3 + int(p["d"] * 10))
        elif kind == "whoosh": x = K.whoosh(p.get("v", 0))
        elif kind == "tick": x = K.tick(p["f"])
        elif kind == "ping": x = K.ping(p["f"])
        elif kind == "shutter": x = K.shutter(p.get("v", 0))
        elif kind == "paper": x = K.paper(p.get("v", 0))
        elif kind == "marker": x = K.marker()
        elif kind == "stamp": x = K.stamp()
        elif kind == "slam": x = K.slam()
        elif kind == "keys": x = K.keys(p.get("count", 6), p.get("seed", 4))
        elif kind == "glitch": x = K.glitch()
        else: raise ValueError(kind)
        cache[key] = x.astype(np.float32)
        return cache[key]

    sfx = np.zeros((2, N), np.float32)
    for t, kind, db, p in sorted(ev, key=lambda e: e[0]):
        x = snd(kind, p) * (10 ** (db / 20))
        i = int(round(t * SR))
        if i < 0:
            x, i = x[:, -i:], 0
        m = min(x.shape[1], N - i)
        if m > 0:
            sfx[:, i : i + m] += x[:, :m]

    vv = np.zeros((2, N), np.float32)
    vv[:, : len(voice)] = voice

    # ---------------------------------------------------------------- bed
    import os
    cache_p = os.path.join(os.path.dirname(os.path.abspath(a.out)), ".bed_v3.npz")
    if os.path.exists(cache_p):
        L = dict(np.load(cache_p))
    else:
        L = K.make_bed()
        np.savez(cache_p, **L)
    rms = lambda x: float(np.sqrt((x ** 2).mean()))

    def loop_band_db(x, lo, hi):
        return mean_db(band_env(x[0], lo, hi))

    s_sub = 10 ** ((V_db + (-15.0 + a.bed_offset) - loop_band_db(L["root"], 30, 120)) / 20)
    s_body = 10 ** ((V_db + (-18.0 + a.bed_offset) - loop_band_db(L["pad"], 120, 350)) / 20)

    # event curves: drop-out before a big hit, swell after it
    evc = np.ones(len(D))
    for h in dips:
        i0, i1 = int((h - 0.32) * CR), int((h - 0.03) * CR)
        evc[i0:i1] = np.minimum(evc[i0:i1], 1 - 0.9 * (0.5 - 0.5 * np.cos(np.linspace(0, np.pi, max(1, i1 - i0)))))
        evc[i1 : int(h * CR)] = np.minimum(evc[i1 : int(h * CR)], 0.1)
    for h in swells:
        i = int(h * CR)
        j = min(len(evc), i + int(1.0 * CR))
        evc[i:j] = np.maximum(evc[i:j], 1 + 0.4 * np.exp(-np.arange(j - i) / (0.4 * CR)))
    fadein = np.clip(tc / 2.0, 0, 1) ** 2
    fadeout = np.clip((total - tc) / 3.0, 0, 1)
    glob = evc * fadein * fadeout

    # a slow, irregular level drift (17-40 s waves) so the bed is never a constant sound
    rs = np.random.default_rng(11)
    drift = gaussian_filter1d(rs.standard_normal(len(D)), 7 * CR, mode="wrap")
    drift = (drift - drift.min()) / (drift.max() - drift.min())
    glob = glob * (0.4 + 0.6 * drift)
    G = {
        "root": (0.9 * M["context"] + 1.1 * M["danger"] + 0.3 * M["facts"]) * (1 - 0.05 * D),
        "pad": (1.0 * M["context"] + 0.7 * M["danger"] + 0.55 * M["facts"]) * (1 - 0.35 * D),
        "dark": M["danger"] * (1 - 0.30 * D),
    }
    ts = np.arange(N) / SR
    G_audio = {n: (np.interp(ts, tc, g * glob).astype(np.float32)) for n, g in G.items()}
    reps = int(np.ceil(N / L["root"].shape[1]))
    tiled = {n: np.tile(L[n], (1, reps))[:, :N] for n in G}

    def scales(ss_, sb):
        return {"root": ss_, "pad": sb, "dark": 0.8 * rms(L["pad"]) * sb / rms(L["dark"])}

    def build(ss_, sb):
        sc = scales(ss_, sb)
        b = np.zeros((2, N), np.float32)
        for n in G:
            b += tiled[n] * (G_audio[n] * sc[n])
        return b

    def yardstick(o):
        mono = o.mean(0)
        sub, low, vo = band_env(mono, 30, 120), band_env(mono, 120, 350), band_env(mono, 500, 3500)
        pause, speech = vo < np.quantile(vo, 0.15), vo > np.quantile(vo, 0.5)
        return mean_db(sub[pause]) - mean_db(vo[speech]), mean_db(low[pause]) - mean_db(vo[speech])

    want_sub, want_low = -15.0 + a.bed_offset, -18.0 + a.bed_offset
    for it in range(3):  # calibrate: measure the real mix (ducking, moods, hits included), correct, repeat
        bed = build(s_sub, s_body)
        m_sub, m_low = yardstick(vv + bed + sfx)
        print(f"  calibration pass {it + 1}: sub {m_sub:+.1f} (want {want_sub:+.1f})  low {m_low:+.1f} (want {want_low:+.1f})")
        if abs(m_sub - want_sub) < 0.6 and abs(m_low - want_low) < 0.6:
            break
        s_sub *= 10 ** ((want_sub - m_sub) / 20)
        s_body *= 10 ** ((want_low - m_low) / 20)
    out = vv + bed + sfx
    if a.stems:
        import os
        os.makedirs(a.stems, exist_ok=True)
        for nm, arr in (('bed', bed), ('sfx', sfx)):
            wf.write(os.path.join(a.stems, nm + '.wav'), SR, (np.clip(arr, -1, 1).T * 32767).astype('<i2'))

    # look-ahead peak limiter (5 ms look-ahead, 120 ms release): no clipping, no global turn-down
    blk = int(0.001 * SR)
    nb = out.shape[1] // blk
    bp_ = np.abs(out[:, : nb * blk]).max(0).reshape(nb, blk).max(1)
    gt = np.minimum(1.0, 0.95 / (bp_ + 1e-9))
    from scipy.ndimage import minimum_filter1d
    gt = minimum_filter1d(gt, 11)
    g = np.empty_like(gt)
    cur = 1.0
    rel = 1 - np.exp(-1 / 120.0)
    for i, v in enumerate(gt):
        cur = v if v < cur else cur + rel * (1.0 - cur)
        g[i] = min(cur, v) if v < cur else cur
    g = gaussian_filter1d(g, 2.0)
    peak = float(np.abs(out).max())
    gain = np.interp(np.arange(out.shape[1]) / SR, (np.arange(nb) + 0.5) * blk / SR, g)
    out = out * gain.astype(np.float32)
    wf.write(a.out, SR, (np.clip(out, -1, 1).T * 32767).astype("<i2"))

    # ---------------------------------------------------------------- report (same yardstick as the reference analysis)
    mono = out.mean(0)
    sub = band_env(mono, 30, 120)
    low = band_env(mono, 120, 350)
    vo = band_env(mono, 500, 3500)
    pause, speech = vo < np.quantile(vo, 0.15), vo > np.quantile(vo, 0.5)
    print(f"voice speech level {V_db:.1f} dBFS | peak before limiter {peak:.2f} -> after {float(np.abs(out).max()):.2f}")
    print(f"bed vs voice  sub {mean_db(sub[pause]) - mean_db(vo[speech]):+.1f} dB   low {mean_db(low[pause]) - mean_db(vo[speech]):+.1f} dB   (reference: -1.2 / -2.7 | old mix: -20.2 / -33.5)")
    print("events:", dict(cnt), "| total", sum(cnt.values()), f"= one every {total / sum(cnt.values()):.1f}s")
    print(f"big moments (riser->drop->hit): {len(dips)} | bed swells: {len(swells)}")
    print("->", a.out)


if __name__ == "__main__":
    main()
