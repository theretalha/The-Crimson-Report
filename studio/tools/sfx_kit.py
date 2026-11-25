"""
Crimson sound kit v2: every sound is synthesised from scratch here (no samples, nothing copied).

Design rules (why this sounds different from v1):
  * LAYERS: every hit = transient (click) + body (200-1500 Hz, audible on phone speakers)
            + sub (felt on good speakers) + room tail (reverb). v1 was a single sine.
  * SATURATION adds harmonics, so low hits still "speak" on laptop / phone speakers.
  * TUNED: pitched sounds sit in D minor, the same key as the drone bed.
  * VARIANTS + stereo movement, so repeated sounds never machine-gun.
All sounds return float32 stereo arrays shaped (2, n), peak 1.0. Level is set where they are placed.
"""
import numpy as np
import scipy.signal as ss

SR = 48000


# ------------------------------------------------------------------ helpers
def rng(seed):
    return np.random.default_rng(seed)


def tt(d):
    return np.arange(int(round(d * SR))) / SR


def _sos(kind, f, order):
    return ss.butter(order, f, btype=kind, fs=SR, output="sos")


def lp(x, f, order=3):
    return ss.sosfilt(_sos("low", f, order), x)


def hp(x, f, order=3):
    return ss.sosfilt(_sos("high", f, order), x)


def bp(x, lo, hi, order=2):
    return ss.sosfilt(_sos("band", [lo, hi], order), x)


def decay(n, rate, attack=0.002):
    t = np.arange(n) / SR
    e = np.exp(-rate * t)
    a = int(attack * SR)
    if a > 1:
        e[:a] *= np.linspace(0, 1, a)
    return e


def sat(x, drive=2.0):
    """soft clip: adds harmonics so low sounds are audible on small speakers"""
    return np.tanh(x * drive) / np.tanh(drive)


def norm(x, peak=1.0):
    m = np.max(np.abs(x))
    return x / m * peak if m > 0 else x


def fade(x, ms_in=1.0, ms_out=6.0):
    x = x.copy()
    a, b = int(ms_in / 1000 * SR), int(ms_out / 1000 * SR)
    if a > 1:
        x[..., :a] *= np.linspace(0, 1, a)
    if b > 1:
        x[..., -b:] *= np.linspace(1, 0, b)
    return x


def pan(x, p):
    """mono -> stereo, equal power, p in [-1, 1]; p may be an array (moving sound)"""
    a = (np.asarray(p) + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)])


def _ir(dur, seed, damp):
    r = rng(seed)
    n = int(dur * SR)
    t = np.arange(n) / SR
    ch = []
    for _ in range(2):
        x = r.standard_normal(n) * np.exp(-6.9 * t / dur)
        x = lp(x, damp, 2)
        k = int(0.004 * SR)
        x[:k] *= np.linspace(0, 1, k)
        ch.append(x)
    ir = np.stack(ch)
    return ir / np.sqrt((ir ** 2).sum(axis=1, keepdims=True))


def reverb(x, dur=1.2, wet=0.5, seed=1, damp=5000):
    """convolution reverb with a synthetic room; tail is `wet` times the energy of the dry sound"""
    if x.ndim == 1:
        x = np.stack([x, x])
    ir = _ir(dur, seed, damp)
    w = np.stack([ss.fftconvolve(x[c], ir[c]) for c in range(2)])
    dry = np.pad(x, ((0, 0), (0, w.shape[1] - x.shape[1])))
    return dry + wet * w


def _chunked_noise(d, lo_f, hi_f, seed, width=1.6, chunks=28):
    """noise whose band sweeps from lo_f to hi_f (exponentially), built from overlapping windowed slices"""
    r = rng(seed)
    n = int(round(d * SR))
    out = np.zeros(n)
    hop = n // chunks
    win = np.hanning(hop * 2)
    for i in range(chunks):
        c = lo_f * (hi_f / lo_f) ** (i / (chunks - 1))
        seg = bp(r.standard_normal(hop * 2), max(40, c / width), min(SR / 2 - 100, c * width), 2)
        a = i * hop
        out[a : a + hop * 2] += (seg * win)[: n - a]
    return out


# ------------------------------------------------------------------ the sounds
def impact(seed=1, d=1.8):
    """big hit: pitch-dropping sub + audible body + knock + click + room"""
    t = tt(d)
    n = len(t)
    f = 36 + 100 * np.exp(-t * 13)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * decay(n, 6.0, 0.004)
    body = (np.sin(2 * np.pi * 196 * t) * 0.9 + np.sin(2 * np.pi * 293.66 * t) * 0.7 + np.sin(2 * np.pi * 440 * t) * 0.4 + np.sin(2 * np.pi * 587.33 * t) * 0.25) * decay(n, 9.0, 0.003)
    knock = bp(rng(seed).standard_normal(n), 200, 1800) * decay(n, 24, 0.0005)
    click = hp(rng(seed + 9).standard_normal(n), 2800) * decay(n, 420, 0.0002)
    x = sat(sub * 0.55 + body * 0.95 + knock * 1.1 + click * 0.5, 2.6)
    return norm(fade(reverb(norm(x), 1.5, 0.30, seed, 4500), 1, 30))


def braam(seed=1, d=3.4):
    """chapter / twist hit: detuned stacked saws on D with a fast brass-like bloom"""
    t = tt(d)
    n = len(t)
    x = np.zeros(n)
    for ratio, g in ((1.0, 1.0), (1.5, 0.55), (2.0, 0.7), (3.0, 0.3)):
        for det in (-0.013, 0.0, 0.013):
            f0 = 36.71 * ratio * (1 + det)
            for k in range(1, 26):
                x += g * np.sin(2 * np.pi * f0 * k * t + k * det * 40) / np.sqrt(k)
    bloom = np.minimum(1, t / 0.05) * np.exp(-1.15 * t)
    x = lp(x, 2400, 2) * bloom
    sub = np.sin(2 * np.pi * 36.71 * t) * np.exp(-1.1 * t) * np.minimum(1, t / 0.02)
    x = sat(norm(x) * 1.0 + norm(sub) * 0.3, 2.8)
    return norm(fade(reverb(norm(x), 2.4, 0.30, seed, 4000), 2, 30))


def riser(d=1.4, seed=3):
    """tension build: rising tone stack + sweeping noise; ends abruptly so the hit lands on the cut"""
    t = tt(d)
    u = t / d
    f = 90 * (1500 / 90) ** (u ** 1.4)
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.3 * np.sin(3 * ph)
    nl = _chunked_noise(d, 260, 7500, seed)
    nr = _chunked_noise(d, 260, 7500, seed + 50)
    env = u ** 2.3
    x = np.stack([(norm(tone) * 0.45 + norm(nl) * 0.85) * env, (norm(tone) * 0.45 + norm(nr) * 0.85) * env])
    return norm(fade(sat(x, 1.3), 5, 12))


def whoosh(variant=0):
    """soft swish for visual jumps; 3 variants (rising, falling, wide) that pan across the screen"""
    d = (0.55, 0.7, 0.62)[variant % 3]
    lo, hi = ((420, 3800), (3200, 480), (600, 2400))[variant % 3]
    n = int(round(d * SR))
    base = _chunked_noise(d, lo, hi, 40 + variant, 1.5)
    air = lp(rng(70 + variant).standard_normal(n), 380) * 0.5
    env = np.hanning(n) ** 1.4
    x = norm(base + air) * env
    p = np.linspace(-0.7, 0.7, n) * (1 if variant % 2 == 0 else -1)
    return norm(fade(pan(x, p)))


def tick(freq=880.0):
    """tuned glassy blip for dots, cards, pins; pitch climbs with each item"""
    t = tt(0.22)
    n = len(t)
    x = (np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(2 * np.pi * freq * 2 * t) + 0.12 * np.sin(2 * np.pi * freq * 3.01 * t)) * decay(n, 24, 0.0008)
    x += hp(rng(5).standard_normal(n), 3500) * decay(n, 500, 0.0002) * 0.35
    return norm(fade(reverb(norm(x), 0.45, 0.35, 8, 7000)))


def ping(freq=1318.5):
    """sonar ping for map pins"""
    t = tt(1.1)
    n = len(t)
    x = (np.sin(2 * np.pi * freq * t) + 0.25 * np.sin(2 * np.pi * freq * 2.76 * t)) * decay(n, 5.5, 0.001)
    return norm(fade(reverb(norm(x), 1.0, 0.7, 9, 6000), 1, 40))


def shutter(variant=0):
    """camera shutter for photo cards"""
    r = rng(60 + variant)
    n = int(0.32 * SR)
    x = np.zeros(n)
    for off, g in ((0.0, 1.0), (0.075, 0.7)):
        i = int(off * SR)
        m = int(0.05 * SR)
        click = bp(r.standard_normal(m), 1200, 6500) * decay(m, 120, 0.0003)
        thunk = np.sin(2 * np.pi * 175 * np.arange(m) / SR) * decay(m, 70, 0.0005) * 0.8
        x[i : i + m] += (click + thunk) * g
    return norm(fade(reverb(norm(sat(x, 1.6)), 0.3, 0.3, 11, 6500)))


def paper(variant=0):
    """paper slide / rustle for headline, document and newspaper cards"""
    r = rng(80 + variant)
    d = 0.34
    n = int(d * SR)
    texture = np.abs(lp(r.standard_normal(n), 55, 2))
    texture = texture / texture.max()
    x = hp(r.standard_normal(n), 1600) * (0.25 + 0.75 * texture) * decay(n, 8, 0.012)
    return norm(fade(pan(x, (-0.35, 0.3, 0.0)[variant % 3])))


def marker():
    """pen/marker swipe, plays while the highlight sweeps across a key phrase"""
    d = 0.3
    n = int(d * SR)
    r = rng(90)
    x = bp(r.standard_normal(n), 1400, 5200) * np.linspace(0.3, 1, n) ** 1.6
    x *= 0.7 + 0.3 * np.sin(2 * np.pi * 38 * np.arange(n) / SR)
    return norm(fade(pan(x, 0.0), 6, 40))


def stamp():
    """rubber stamp thud"""
    t = tt(0.55)
    n = len(t)
    body = np.sin(2 * np.pi * (110 * np.exp(-t * 16) + 70) * t) * decay(n, 18, 0.001)
    mid = bp(rng(12).standard_normal(n), 250, 2500) * decay(n, 50, 0.0005)
    slap = hp(rng(13).standard_normal(n), 2000) * decay(n, 160, 0.0003)
    return norm(fade(reverb(norm(sat(body * 0.45 + 1.0 * mid + 0.5 * slap, 2.2)), 0.5, 0.3, 14, 5000)))


def slam():
    """split-card box landing: short low thump + paper slap"""
    t = tt(0.3)
    n = len(t)
    th = np.sin(2 * np.pi * (140 * np.exp(-t * 22) + 90) * t) * decay(n, 24, 0.001)
    sl = bp(rng(21).standard_normal(n), 400, 4000) * decay(n, 70, 0.0004)
    return norm(fade(pan(sat(th * 0.6 + 1.0 * sl, 2.0), 0.0)))


def keys(count=6, seed=4):
    """typewriter keys for the name tag"""
    r = rng(seed)
    n = int((0.07 * count + 0.2) * SR)
    x = np.zeros(n)
    pos = 0.0
    for _ in range(count):
        m = int(0.045 * SR)
        k = hp(r.standard_normal(m), 1500) * decay(m, 130, 0.0002) + 0.4 * np.sin(2 * np.pi * 1800 * np.arange(m) / SR) * decay(m, 90, 0.0005)
        i = int(pos * SR)
        x[i : i + m] += k * (0.6 + 0.4 * r.random())
        pos += 0.05 + r.random() * 0.045
    return norm(fade(pan(x, 0.1)))


def glitch():
    """digital stutter for the glitching title"""
    r = rng(33)
    n = int(0.3 * SR)
    x = np.zeros(n)
    for off in (0.0, 0.035, 0.09, 0.105, 0.17):
        i = int(off * SR)
        m = int(r.uniform(0.012, 0.03) * SR)
        x[i : i + m] += bp(r.standard_normal(m), r.uniform(900, 3000), 9000) * np.hanning(m)
    q = np.round(x * 6) / 6  # bit-crush
    return norm(fade(pan(q, 0.0)))


# ------------------------------------------------------------------ the bed (seamless 64 s loops)
# v3. The v2 bed (ten frozen notes + a heartbeat + a clashing pair) sounded like a fan / factory machine:
# steady tones in 100-450 Hz never change, a pulse every 1.28 s is a "chug", and two notes a semitone apart wobble
# like an idling engine. v3 rules: nothing static, nothing rhythmic, nothing beating, long reverb.
LOOP = 64.0


def _t():
    return np.arange(int(LOOP * SR)) / SR


def _f(f):
    """snap to a multiple of 1/64 Hz so the loop is exactly periodic"""
    return round(f * 64) / 64


def _smooth(x):
    x = np.clip(x, 0, 1)
    return x * x * (3 - 2 * x)


def _chord_env(t, c, atk=4.0, rel=5.0, span=22.0, shift=3.0):
    """chord c fades in, holds, fades out; neighbours overlap 6 s so the harmony glides instead of switching"""
    tw = (t - c * 16.0 + shift) % LOOP
    return _smooth(tw / atk) * _smooth((span - tw) / rel)


def _voice(f, t, phi, detune):
    """one pad voice: 6 partials whose levels drift independently (timbre keeps moving), slight vibrato"""
    f = _f(f)
    out = np.zeros_like(t)
    for k in range(1, 7):
        m = 0.65 + 0.35 * np.sin(2 * np.pi * (3 + k) / 64 * t + phi * k)
        out += k ** -1.5 * m * np.sin(2 * np.pi * (f * k + detune * k) * t + 0.25 * k * np.sin(2 * np.pi * 4 / 64 * t + phi) + 3 * phi * k)
    return out


def _circ_reverb(x, dur=4.0, wet=0.6, seed=1, damp=3500):
    """reverb by circular convolution, so the loop stays seamless"""
    n = x.shape[1]
    ir = _ir(dur, seed, damp)
    y = np.empty_like(x)
    for c in range(2):
        y[c] = np.fft.irfft(np.fft.rfft(x[c]) * np.fft.rfft(ir[c], n), n)
    return (1 - wet) * x + wet * y


# D minor -> Bb -> G minor -> A, 16 s each (root, pad notes)
CHORDS = [
    (36.71, [146.83, 174.61, 220.00, 293.66]),
    (58.27, [116.54, 146.83, 174.61, 233.08]),
    (49.00, [98.00, 116.54, 146.83, 196.00]),
    (55.00, [110.00, 164.81, 220.00, 277.18]),
]


def make_bed():
    """returns the bed as 64 s seamless stereo loops: root (sub notes), pad (slow chords), dark (crimson swells)"""
    t = _t()
    root = np.zeros(len(t))
    padL, padR = np.zeros(len(t)), np.zeros(len(t))
    for c, (r, notes) in enumerate(CHORDS):
        e = _chord_env(t, c)
        root += _chord_env(t, c, 3.0, 4.0) * (np.sin(2 * np.pi * _f(r) * t) + 0.45 * np.sin(2 * np.pi * _f(r) * 2 * t + 0.6))
        for i, nf in enumerate(notes):
            padL += e * _voice(nf, t, c * 1.7 + i * 0.9, +2 / 64) / len(notes)
            padR += e * _voice(nf, t, c * 1.7 + i * 0.9 + 0.4, -2 / 64) / len(notes)
    L = {}
    L["root"] = np.stack([root, root]).astype(np.float32)
    L["pad"] = _circ_reverb(np.stack([padL, padR]), 4.0, 0.6, 21).astype(np.float32)
    # crimson swells: wide tritone voicing (no close intervals = no wobble), two slow swells per loop
    dL, dR = np.zeros(len(t)), np.zeros(len(t))
    for ci, centre in enumerate((14.0, 46.0)):
        s_ = np.clip(((t - centre + 8) % LOOP) / 16.0, 0, 1)
        e = np.sin(np.pi * s_) ** 2
        for i, nf in enumerate((73.42, 103.83, 130.81, 311.13)):
            dL += e * _voice(nf, t, ci * 2.3 + i * 1.1, +3 / 64) / 4
            dR += e * _voice(nf, t, ci * 2.3 + i * 1.1 + 0.5, -3 / 64) / 4
    L["dark"] = _circ_reverb(np.stack([dL, dR]), 4.5, 0.7, 22).astype(np.float32)
    return L
