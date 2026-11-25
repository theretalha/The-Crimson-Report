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
LOOP = 64.0


def _t():
    return np.arange(int(LOOP * SR)) / SR


def _f(f):
    """snap to a multiple of 1/64 Hz so the loop is exactly periodic"""
    return round(f * 64) / 64


def _partials(spec, breathe_hz=1 / 16, depth=0.22, detune=3 / 64):
    t = _t()
    L = np.zeros(len(t))
    R = np.zeros(len(t))
    for i, (f, g) in enumerate(spec):
        f = _f(f)
        b = 1 - depth + depth * np.sin(2 * np.pi * breathe_hz * t + i * 0.9)
        L += g * b * np.sin(2 * np.pi * (f - detune) * t + i)
        R += g * b * np.sin(2 * np.pi * (f + detune) * t + i * 1.3)
    return np.stack([L, R]).astype(np.float32)


def _loopify(x, xf=4.0):
    """make a longer noise take seamless by folding its tail into its head"""
    n = int(LOOP * SR)
    k = int(xf * SR)
    body = x[:, :n].copy()
    ramp = np.linspace(0, 1, k)
    body[:, :k] = body[:, :k] * ramp + x[:, n : n + k] * (1 - ramp)
    return body


def make_bed():
    """returns the bed layers as 64 s seamless stereo loops"""
    t = _t()
    L = {}
    # sub drone: D1 / A1 / D2 (felt)
    L["sub"] = _partials([(36.71, 1.0), (55.0, 0.55), (73.42, 0.5)])
    # body: harmonics up to ~300 Hz (this is what small speakers actually reproduce)
    L["body"] = _partials([(87.31, 0.2), (110.0, 0.4), (146.83, 0.45), (174.61, 0.5), (220.0, 0.65), (293.66, 0.55), (349.23, 0.3), (440.0, 0.14)])
    # air: breathing band noise
    r = rng(5)
    nz = np.stack([bp(r.standard_normal(int((LOOP + 4) * SR)), 150, 900, 2) for _ in range(2)])
    nz = _loopify(nz)
    breath = 0.35 + 0.65 * (0.5 + 0.5 * np.sin(2 * np.pi * t / 8)) ** 2
    L["air"] = (nz / np.max(np.abs(nz)) * breath).astype(np.float32)
    # danger: D1 against Eb1 (2.2 Hz beating = uneasy) + tritone + low overtones
    L["danger"] = _partials([(38.89, 1.0), (36.71, 0.55), (77.78, 0.6), (103.83, 0.35), (155.56, 0.22)], depth=0.3)
    # heartbeat: lub-dub every 1.28 s (50 beats per loop), saturated so it is audible on small speakers
    hb = np.zeros(len(t))
    k = np.arange(int(0.4 * SR)) / SR
    thump = np.sin(2 * np.pi * (62 * np.exp(-k * 10) + 42) * k) * np.exp(-k * 13)
    for beat in range(50):
        for off, g in ((0.0, 1.0), (0.27, 0.62)):
            i = int((beat * 1.28 + off) * SR)
            j = min(len(hb), i + len(thump))
            hb[i:j] += thump[: j - i] * g
    hb = sat(hb / np.max(np.abs(hb)), 2.4)
    L["heart"] = np.stack([hb, hb]).astype(np.float32)
    # pad for fact scenes: open D-A-E, glassy and calm
    pad = _partials([(293.66, 0.5), (440.0, 0.4), (329.63, 0.3), (587.33, 0.14)], breathe_hz=1 / 8, depth=0.4)
    n = pad.shape[1]
    tri = np.concatenate([pad, pad, pad], axis=1)  # filter a 3x copy and keep the middle: no click at the loop seam
    L["pad"] = np.stack([lp(tri[0], 1800, 2)[n : 2 * n], lp(tri[1], 1800, 2)[n : 2 * n]]).astype(np.float32)
    return L
