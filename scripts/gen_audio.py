#!/usr/bin/env python3
"""Builds the reel's two-layer audio bed.

LAYER 1 -- the fixed background texture.
    `sound-effects/ES_Moment - Christoffer Moe Ditlevsen.mp3` is a finished
    creative input supplied with the project. It is used UNMODIFIED in
    composition: this script only trims it to the reel length, applies a
    fade in/out at the extreme ends and a single constant gain so it sits
    under the voiceover. No EQ, no compression, no layering, no substitution,
    no edit to its musical content. The source is 252.168 s, comfortably
    longer than the 88 s reel, so it is never looped either.

LAYER 2 -- the synthesised transition / foley palette.
    Every cue below is generated from scratch here with numpy/scipy (biquad
    filters, envelopes, modal resonator banks, comb reverb) and encoded with
    ffmpeg. Nothing calls ElevenLabs or any other external audio service, and
    nothing is taken from the video toolkit's bundled SFX tooling.

    Per the creative brief's Section 10 the palette is deliberately narrow and
    HIGH-FREQUENCY. Large cinematic low-frequency whooshes are excluded by
    design -- they would muddy Layer 1. Everything here is a precise physical
    sound: damped mechanical clicks, thin metallic grille resonances, and the
    tight creak of stretched rubber.

Run before any scene code references a cue name:

    python3 scripts/gen_audio.py && python3 scripts/audit_audio.py
"""
import math
import os
import shutil
import subprocess
import sys
import wave

import numpy as np
from scipy.signal import lfilter

SR = 48000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRATCH = os.environ.get("TLM107_WAV_DIR", os.path.join("/tmp", "tlm107_wav"))
os.makedirs(SCRATCH, exist_ok=True)

SFX_DIR = os.path.join(ROOT, "public", "audio", "sfx")
BED_DIR = os.path.join(ROOT, "public", "audio")
VO_DIR = os.path.join(ROOT, "public", "vo")
for d in (SFX_DIR, BED_DIR, VO_DIR):
    os.makedirs(d, exist_ok=True)

# The one pre-supplied file. Layer 1. Never regenerated, never replaced.
LAYER1_SRC = os.path.join(ROOT, "sound-effects", "ES_Moment - Christoffer Moe Ditlevsen.mp3")

FPS = 30
TOTAL_FRAMES = 2640
REEL_SECONDS = TOTAL_FRAMES / FPS  # 88.0
LONGFORM_FRAMES = 8940
LONGFORM_SECONDS = LONGFORM_FRAMES / FPS  # 298.0

rng = np.random.default_rng(107)


def find_ffmpeg() -> str:
    env = os.environ.get("FFMPEG_BIN")
    if env and os.path.exists(env):
        return env
    which = shutil.which("ffmpeg")
    if which:
        return which
    for base in (
        "/tmp/claude-0/-home-user/b7c7b719-b725-5bcc-ae76-95b988bf89e8/scratchpad",
        ROOT,
    ):
        for cand in (
            os.path.join(base, "node_modules", "ffmpeg-static", "ffmpeg"),
            os.path.join(base, "node_modules", "@ffmpeg-installer", "linux-x64", "ffmpeg"),
        ):
            if os.path.exists(cand):
                return cand
    raise SystemExit("ffmpeg not found; set FFMPEG_BIN")


FFMPEG = find_ffmpeg()


# ---------------------------------------------------------------------------
# DSP helpers
# ---------------------------------------------------------------------------
def t(n):
    return np.arange(n) / SR


def noise(n):
    return rng.standard_normal(n)


def _bq(fc, q, kind):
    """Single biquad -> (b, a)."""
    fc = float(np.clip(fc, 20.0, SR / 2 * 0.97))
    w = 2 * math.pi * fc / SR
    al = math.sin(w) / (2 * q)
    c = math.cos(w)
    if kind == "lp":
        b = [(1 - c) / 2, 1 - c, (1 - c) / 2]
    elif kind == "hp":
        b = [(1 + c) / 2, -(1 + c), (1 + c) / 2]
    elif kind == "bp":
        b = [al, 0.0, -al]
    else:
        raise ValueError(kind)
    a = [1 + al, -2 * c, 1 - al]
    return np.array(b) / a[0], np.array(a) / a[0]


def filt(x, fc, q=0.707, kind="lp"):
    b, a = _bq(fc, q, kind)
    return lfilter(b, a, x)


def env_ad(n, attack, decay, curve=2.2):
    """Percussive attack/decay envelope, times in seconds."""
    a = max(1, int(attack * SR))
    d = max(1, int(decay * SR))
    e = np.zeros(n)
    a = min(a, n)
    e[:a] = np.linspace(0.0, 1.0, a) ** 0.6
    rest = n - a
    if rest > 0:
        d = min(d, rest)
        e[a : a + d] = np.linspace(1.0, 0.0, d) ** curve
    return e


def modal(n, freqs, decays, amps, excite=None):
    """Bank of exponentially-decaying sine partials -- a struck rigid body."""
    tt = t(n)
    out = np.zeros(n)
    for f, d, a in zip(freqs, decays, amps):
        ph = rng.uniform(0, 2 * math.pi)
        out += a * np.sin(2 * math.pi * f * tt + ph) * np.exp(-tt / d)
    if excite is not None:
        out = out + excite
    return out


def comb_verb(x, delays_ms=(11.3, 17.7, 23.1), fb=0.32, mix=0.18):
    """Tiny room -- just enough to seat a cue in space. No long tail."""
    out = x.copy()
    for dm in delays_ms:
        d = int(dm * SR / 1000)
        buf = np.zeros(len(x))
        if d < len(x):
            buf[d:] = x[:-d]
            fbuf = buf.copy()
            for _ in range(3):
                nb = np.zeros(len(x))
                nb[d:] = fbuf[:-d] * fb
                fbuf = nb
                out = out + nb * mix
            out = out + buf * mix
    return out


def norm(x, peak=0.89):
    m = np.max(np.abs(x))
    return x if m < 1e-9 else x * (peak / m)


def stereo(x, width=0.16):
    """Cheap Haas-ish widening. Kept subtle so cues stay centred and precise."""
    d = int(width * 0.001 * SR) + 1
    l = x.copy()
    r = np.zeros(len(x))
    r[d:] = x[:-d]
    r = r * 0.985 + x * 0.015
    return np.stack([l, r], axis=1)


def write_wav(name, x, fade=0.004):
    """x: mono 1-D or stereo (n,2)."""
    if x.ndim == 1:
        x = stereo(x)
    n = len(x)
    f = max(1, int(fade * SR))
    f = min(f, n // 2)
    ramp = np.ones(n)
    ramp[:f] = np.linspace(0, 1, f)
    ramp[-f:] = np.linspace(1, 0, f)
    x = x * ramp[:, None]
    x = np.clip(x, -1.0, 1.0)
    path = os.path.join(SCRATCH, name + ".wav")
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype("<i2").tobytes())
    return path


def encode(wav_path, out_name, bitrate="192k"):
    out = os.path.join(SFX_DIR, out_name + ".mp3")
    subprocess.run(
        [FFMPEG, "-y", "-loglevel", "error", "-i", wav_path, "-codec:a", "libmp3lame",
         "-b:a", bitrate, "-ar", str(SR), out],
        check=True,
    )
    return out


# ---------------------------------------------------------------------------
# LAYER 2 CUES -- brief Section 10
# ---------------------------------------------------------------------------

def cue_toggle_click():
    """Soft, damped mechanical click -- the rear navigation micro-joystick.

    A detented switch inside a milled metal body: a very short broadband
    contact transient, a small damped body 'tock', and essentially no ring.
    """
    n = int(0.085 * SR)
    tt = t(n)
    # contact transient -- filtered noise burst, very fast
    burst = noise(n) * env_ad(n, 0.0004, 0.010, 3.4)
    burst = filt(burst, 3800, 0.9, "hp")
    burst = filt(burst, 9000, 0.7, "lp")
    # damped body -- machined aluminium, tight
    body = modal(
        n,
        freqs=[1420, 2180, 3260],
        decays=[0.016, 0.011, 0.007],
        amps=[0.55, 0.32, 0.18],
    )
    body *= env_ad(n, 0.0006, 0.045, 2.6)
    # tiny low 'seat' so it feels physical, but kept above the mud zone
    seat = np.sin(2 * math.pi * 320 * tt) * env_ad(n, 0.001, 0.020, 3.0) * 0.16
    x = burst * 0.72 + body * 0.62 + seat
    x = filt(x, 180, 0.7, "hp")          # keep Layer 1's low end clear
    return norm(comb_verb(x, fb=0.18, mix=0.08), 0.80)


def cue_toggle_click_soft():
    """Quieter sibling of the above, for rapid multi-step LED stepping."""
    n = int(0.062 * SR)
    burst = noise(n) * env_ad(n, 0.0004, 0.007, 3.6)
    burst = filt(burst, 4600, 0.9, "hp")
    burst = filt(burst, 10500, 0.7, "lp")
    body = modal(n, [1680, 2560], [0.011, 0.008], [0.42, 0.24])
    body *= env_ad(n, 0.0006, 0.030, 2.8)
    x = burst * 0.60 + body * 0.50
    x = filt(x, 220, 0.7, "hp")
    return norm(comb_verb(x, fb=0.15, mix=0.06), 0.62)


def cue_grille_tap(seed_shift=0.0, bright=1.0, length=0.34, peak=0.72):
    """Gentle finger-tap on a rigid woven mesh grille -- the transition sound.

    High, thin, slightly inharmonic metal partials over a fast noise chiff.
    Deliberately small: it should cut through, not sweep.
    """
    n = int(length * SR)
    base = 2740 * (1.0 + seed_shift)
    # inharmonic ratios -- a woven mesh is not a tuned bar
    ratios = [1.0, 1.51, 2.13, 2.87, 3.94, 5.21]
    amps = [1.0, 0.58, 0.40, 0.27, 0.17, 0.10]
    decays = [0.115, 0.088, 0.069, 0.052, 0.038, 0.027]
    body = modal(
        n,
        freqs=[base * r * bright for r in ratios],
        decays=decays,
        amps=amps,
    )
    body *= env_ad(n, 0.0008, length * 0.92, 1.9)
    chiff = noise(n) * env_ad(n, 0.0003, 0.008, 4.0)
    chiff = filt(chiff, 5200, 0.8, "hp")
    x = body * 0.66 + chiff * 0.30
    x = filt(x, 900, 0.7, "hp")          # nothing below ~900 Hz at all
    return norm(comb_verb(x, delays_ms=(7.9, 13.1, 19.3), fb=0.30, mix=0.20), peak)


def cue_grille_tap_hi():
    # shorter + brighter cues concentrate their energy, so they need a lower
    # ceiling to land at the same perceived level against the bed
    return cue_grille_tap(seed_shift=0.22, bright=1.18, length=0.28, peak=0.42)


def cue_grille_tap_lo():
    return cue_grille_tap(seed_shift=-0.18, bright=0.86, length=0.42)


def cue_grille_shimmer():
    """Several mesh taps smeared into a soft metallic wash for scene changes.

    Still band-limited well above Layer 1's musical body.
    """
    n = int(0.85 * SR)
    x = np.zeros(n)
    for k in range(7):
        s = cue_grille_tap(seed_shift=rng.uniform(-0.3, 0.35),
                           bright=rng.uniform(0.9, 1.25), length=0.40)
        s = s[:, 0] if s.ndim > 1 else s
        off = int(rng.uniform(0.0, 0.34) * SR)
        seg = min(len(s), n - off)
        if seg > 0:
            x[off : off + seg] += s[:seg] * rng.uniform(0.30, 0.62)
    x = filt(x, 1200, 0.7, "hp")
    x *= env_ad(n, 0.010, 0.80, 1.5)
    return norm(comb_verb(x, delays_ms=(9.7, 15.3, 22.9), fb=0.34, mix=0.24), 0.66)


def cue_rubber_stretch():
    """Thick rubber elasticity stretching -- the EA 4 suspension bands.

    Rubber under tension creates stick-slip: a dense train of micro-events
    whose rate and filter frequency rise as the band tightens. Tight, faint,
    and short -- never a groan.
    """
    n = int(0.62 * SR)
    tt = t(n)
    tension = np.clip(tt / (n / SR), 0, 1) ** 0.75
    # stick-slip micro-impulses, accelerating
    imp = np.zeros(n)
    pos = 0.0
    while pos < n:
        i = int(pos)
        if i < n:
            imp[i] += rng.uniform(0.45, 1.0)
        rate = 190.0 + 700.0 * (pos / n) ** 0.9
        pos += SR / rate
    # resonant band that climbs with tension -> the 'creak' pitch rising
    seg = 1024
    out = np.zeros(n)
    for s0 in range(0, n, seg):
        s1 = min(n, s0 + seg)
        fc = 620 + 1500 * tension[s0]
        out[s0:s1] = filt(imp[s0:s1], fc, 5.5, "bp")
    # breathy air from the band surface
    air = filt(noise(n), 3200, 0.8, "hp") * 0.10 * tension
    x = out * 0.85 + air
    x *= env_ad(n, 0.035, 0.52, 1.5)
    x = filt(x, 300, 0.7, "hp")
    return norm(comb_verb(x, fb=0.22, mix=0.12), 0.38)


def cue_rubber_settle():
    """The band releasing and settling -- reverse-ish of the stretch, shorter."""
    n = int(0.40 * SR)
    tt = t(n)
    relax = 1.0 - np.clip(tt / (n / SR), 0, 1) ** 0.8
    imp = np.zeros(n)
    pos = 0.0
    while pos < n:
        i = int(pos)
        if i < n:
            imp[i] += rng.uniform(0.35, 0.9)
        rate = 620.0 - 400.0 * (pos / n)
        pos += SR / max(60.0, rate)
    seg = 1024
    out = np.zeros(n)
    for s0 in range(0, n, seg):
        s1 = min(n, s0 + seg)
        fc = 480 + 900 * relax[s0]
        out[s0:s1] = filt(imp[s0:s1], fc, 5.0, "bp")
    x = out * env_ad(n, 0.006, 0.36, 2.0)
    x = filt(x, 280, 0.7, "hp")
    return norm(comb_verb(x, fb=0.20, mix=0.10), 0.36)


def cue_led_step():
    """Tiny high tick marking one LED advancing on the pattern ring."""
    n = int(0.045 * SR)
    tt = t(n)
    tone = (np.sin(2 * math.pi * 5200 * tt) * 0.6
            + np.sin(2 * math.pi * 7900 * tt) * 0.3)
    tone *= env_ad(n, 0.0004, 0.026, 3.2)
    chiff = filt(noise(n), 6500, 0.9, "hp") * env_ad(n, 0.0002, 0.005, 4.0) * 0.35
    x = tone + chiff
    x = filt(x, 1500, 0.7, "hp")
    return norm(x, 0.52)


def cue_focus_settle():
    """Airy 'lock' at the end of a macro-to-reveal pull-back.

    A short filtered-noise breath that resolves onto a faint high partial --
    reads as focus arriving, without any low-frequency whoosh content.
    """
    n = int(0.70 * SR)
    tt = t(n)
    sweep = np.exp(np.linspace(math.log(1800), math.log(6400), n))
    ph = np.cumsum(2 * math.pi * sweep / SR)
    air = filt(noise(n), 2400, 0.7, "hp")
    air *= env_ad(n, 0.10, 0.58, 1.4) * 0.34
    tone = np.sin(ph) * env_ad(n, 0.14, 0.52, 2.0) * 0.16
    tail = (np.sin(2 * math.pi * 4180 * tt) * 0.5
            + np.sin(2 * math.pi * 6270 * tt) * 0.24)
    tail *= env_ad(n, 0.30, 0.36, 2.2) * 0.20
    x = air + tone + tail
    x = filt(x, 1100, 0.7, "hp")
    return norm(comb_verb(x, fb=0.30, mix=0.20), 0.42)


def cue_finish_wipe():
    """Nickel<->black finish split. A thin metallic edge passing the frame.

    Band-limited noise sweeping UP through the treble only -- explicitly not
    a cinematic whoosh; there is no energy below ~1.2 kHz.
    """
    n = int(0.50 * SR)
    x = filt(noise(n), 1400, 0.8, "hp")
    seg = 512
    out = np.zeros(n)
    for s0 in range(0, n, seg):
        s1 = min(n, s0 + seg)
        p = s0 / n
        fc = 2200 + 7000 * (p ** 1.3)
        out[s0:s1] = filt(x[s0:s1], fc, 3.2, "bp")
    out *= env_ad(n, 0.06, 0.40, 1.6)
    edge = modal(n, [3300, 4950], [0.05, 0.035], [0.35, 0.20])
    edge *= env_ad(n, 0.16, 0.24, 2.4)
    y = out * 0.8 + edge * 0.5
    y = filt(y, 1200, 0.7, "hp")
    return norm(comb_verb(y, fb=0.26, mix=0.16), 0.44)


def cue_spec_mark():
    """Precise marker under a hard verified figure appearing (141 dB / 10 dB-A)."""
    n = int(0.22 * SR)
    tt = t(n)
    tone = (np.sin(2 * math.pi * 3140 * tt) * 0.55
            + np.sin(2 * math.pi * 4710 * tt) * 0.26
            + np.sin(2 * math.pi * 6280 * tt) * 0.12)
    tone *= env_ad(n, 0.0012, 0.19, 2.6)
    tick = filt(noise(n), 7000, 0.9, "hp") * env_ad(n, 0.0002, 0.004, 4.0) * 0.30
    x = tone + tick
    x = filt(x, 1400, 0.7, "hp")
    return norm(comb_verb(x, fb=0.24, mix=0.14), 0.50)


def cue_outro_chime():
    """Closing mark over the CTA. Bright, brief, unhurried -- no low swell."""
    n = int(1.30 * SR)
    tt = t(n)
    parts = [(2093, 0.62, 0.50), (2637, 0.54, 0.30), (3136, 0.46, 0.20),
             (4186, 0.38, 0.12), (5274, 0.30, 0.07)]
    x = np.zeros(n)
    for f, d, a in parts:
        x += a * np.sin(2 * math.pi * f * tt + rng.uniform(0, 6.28)) * np.exp(-tt / d)
    x *= env_ad(n, 0.006, 1.24, 1.25)
    air = filt(noise(n), 5000, 0.8, "hp") * env_ad(n, 0.004, 0.10, 3.0) * 0.13
    y = x + air
    y = filt(y, 1000, 0.7, "hp")
    return norm(comb_verb(y, delays_ms=(13.1, 21.7, 29.3), fb=0.36, mix=0.26), 0.62)


# ---------------------------------------------------------------------------
# LONG-FORM EXTENSIONS
#
# The 88 s reel could carry its whole transition load on 13 cues. The 298 s
# long-form video is three and a half times longer with far more chapter
# breaks, so the same 13 would become audibly repetitive. These nine add
# variation within the SAME physical vocabulary the brief specifies -- damped
# mechanical clicks, thin metallic grille resonances, rubber elasticity -- and
# obey the same rule: no large low-frequency whooshes, nothing that muddies
# Layer 1.
# ---------------------------------------------------------------------------

def cue_grille_tap_mid():
    """A fourth grille-tap pitch, sitting between -lo and -hi."""
    return cue_grille_tap(seed_shift=0.08, bright=1.02, length=0.36, peak=0.60)


def cue_grille_tap_soft():
    """A gentler tap for chapter breaks that should not punctuate hard."""
    return cue_grille_tap(seed_shift=-0.06, bright=0.94, length=0.30, peak=0.34)


def cue_toggle_click_hard():
    """A firmer detent -- the toggle reaching an end stop."""
    n = int(0.10 * SR)
    tt = t(n)
    burst = noise(n) * env_ad(n, 0.0003, 0.012, 3.2)
    burst = filt(burst, 3200, 0.9, "hp")
    burst = filt(burst, 8200, 0.7, "lp")
    body = modal(n, [1180, 1870, 2940, 4100], [0.020, 0.014, 0.009, 0.006],
                 [0.60, 0.34, 0.20, 0.11])
    body *= env_ad(n, 0.0006, 0.055, 2.4)
    seat = np.sin(2 * math.pi * 360 * tt) * env_ad(n, 0.001, 0.024, 3.0) * 0.18
    x = burst * 0.78 + body * 0.66 + seat
    x = filt(x, 180, 0.7, "hp")
    return norm(comb_verb(x, fb=0.18, mix=0.08), 0.72)


def cue_chapter_mark():
    """Marks a chapter change. Two clean high partials, a fifth apart.

    Deliberately tonal rather than percussive so it reads as punctuation in a
    long-form structure without ever sounding like a notification chime.
    """
    n = int(0.90 * SR)
    tt = t(n)
    x = (np.sin(2 * math.pi * 1568 * tt) * 0.5 * np.exp(-tt / 0.42)
         + np.sin(2 * math.pi * 2349 * tt) * 0.30 * np.exp(-tt / 0.34)
         + np.sin(2 * math.pi * 3136 * tt) * 0.16 * np.exp(-tt / 0.26))
    x *= env_ad(n, 0.004, 0.86, 1.4)
    air = filt(noise(n), 4800, 0.8, "hp") * env_ad(n, 0.003, 0.07, 3.2) * 0.11
    y = filt(x + air, 900, 0.7, "hp")
    return norm(comb_verb(y, delays_ms=(11.7, 18.3, 26.1), fb=0.32, mix=0.22), 0.46)


def cue_spec_tick():
    """A smaller sibling of spec-mark, for figures appearing in a run."""
    n = int(0.14 * SR)
    tt = t(n)
    tone = (np.sin(2 * math.pi * 3730 * tt) * 0.5
            + np.sin(2 * math.pi * 5590 * tt) * 0.2)
    tone *= env_ad(n, 0.0010, 0.12, 2.8)
    tick = filt(noise(n), 7600, 0.9, "hp") * env_ad(n, 0.0002, 0.003, 4.0) * 0.24
    return norm(filt(tone + tick, 1500, 0.7, "hp"), 0.38)


def cue_rubber_short():
    """A brief band flex -- the mount settling rather than being stretched."""
    n = int(0.30 * SR)
    tt = t(n)
    tension = np.clip(tt / (n / SR), 0, 1) ** 0.8
    imp = np.zeros(n)
    pos = 0.0
    while pos < n:
        i = int(pos)
        if i < n:
            imp[i] += rng.uniform(0.4, 0.95)
        pos += SR / (240.0 + 520.0 * (pos / n))
    seg = 512
    out = np.zeros(n)
    for s0 in range(0, n, seg):
        s1 = min(n, s0 + seg)
        out[s0:s1] = filt(imp[s0:s1], 700 + 1100 * tension[s0], 5.0, "bp")
    x = out * env_ad(n, 0.020, 0.26, 1.6)
    return norm(comb_verb(filt(x, 300, 0.7, "hp"), fb=0.20, mix=0.10), 0.34)


def cue_air_lift():
    """A rising airy breath for a reveal. Treble only -- explicitly not a whoosh."""
    n = int(0.85 * SR)
    x = filt(noise(n), 2000, 0.8, "hp")
    seg = 512
    out = np.zeros(n)
    for s0 in range(0, n, seg):
        s1 = min(n, s0 + seg)
        p = s0 / n
        out[s0:s1] = filt(x[s0:s1], 2600 + 6200 * (p ** 1.2), 2.4, "bp")
    out *= env_ad(n, 0.18, 0.64, 1.5)
    y = filt(out, 1400, 0.7, "hp")
    return norm(comb_verb(y, fb=0.30, mix=0.20), 0.38)


def cue_panel_slide():
    """A card/plate arriving. A short filtered brush, no low content."""
    n = int(0.34 * SR)
    x = filt(noise(n), 1800, 0.8, "hp")
    seg = 256
    out = np.zeros(n)
    for s0 in range(0, n, seg):
        s1 = min(n, s0 + seg)
        p = s0 / n
        out[s0:s1] = filt(x[s0:s1], 5200 - 2400 * p, 1.9, "bp")
    out *= env_ad(n, 0.010, 0.30, 2.0)
    return norm(filt(out, 1300, 0.7, "hp"), 0.34)


def cue_pattern_morph():
    """Under the morphing polar diagram. A slow two-tone glide, thin and high."""
    n = int(1.10 * SR)
    tt = t(n)
    g = np.linspace(0, 1, n)
    f1 = 1400 + 700 * g
    f2 = 2100 + 950 * g
    ph1 = np.cumsum(2 * math.pi * f1 / SR)
    ph2 = np.cumsum(2 * math.pi * f2 / SR)
    x = np.sin(ph1) * 0.30 + np.sin(ph2) * 0.16
    x *= env_ad(n, 0.22, 0.86, 1.3)
    air = filt(noise(n), 5200, 0.8, "hp") * env_ad(n, 0.20, 0.80, 1.4) * 0.07
    y = filt(x + air, 1100, 0.7, "hp")
    return norm(comb_verb(y, fb=0.28, mix=0.18), 0.32)


CUES = {
    # -- shared with the reel -------------------------------------------
    "toggle-click": cue_toggle_click,
    "toggle-click-soft": cue_toggle_click_soft,
    "led-step": cue_led_step,
    "grille-tap": cue_grille_tap,
    "grille-tap-hi": cue_grille_tap_hi,
    "grille-tap-lo": cue_grille_tap_lo,
    "grille-shimmer": cue_grille_shimmer,
    "rubber-stretch": cue_rubber_stretch,
    "rubber-settle": cue_rubber_settle,
    "focus-settle": cue_focus_settle,
    "finish-wipe": cue_finish_wipe,
    "spec-mark": cue_spec_mark,
    "outro-chime": cue_outro_chime,
    # -- long-form additions --------------------------------------------
    "grille-tap-mid": cue_grille_tap_mid,
    "grille-tap-soft": cue_grille_tap_soft,
    "toggle-click-hard": cue_toggle_click_hard,
    "chapter-mark": cue_chapter_mark,
    "spec-tick": cue_spec_tick,
    "rubber-short": cue_rubber_short,
    "air-lift": cue_air_lift,
    "panel-slide": cue_panel_slide,
    "pattern-morph": cue_pattern_morph,
}


# ---------------------------------------------------------------------------
# LAYER 1 -- trim the supplied track. Composition untouched.
# ---------------------------------------------------------------------------
def build_layer1():
    if not os.path.exists(LAYER1_SRC):
        raise SystemExit(f"Layer 1 source missing: {LAYER1_SRC}")
    out = os.path.join(BED_DIR, "bed-layer1.mp3")
    # Trim to 88 s + short musical fades at the extreme ends, and one constant
    # -15 dB gain so it sits beneath narration. Nothing else is applied.
    subprocess.run(
        [FFMPEG, "-y", "-loglevel", "error",
         "-i", LAYER1_SRC,
         "-t", f"{REEL_SECONDS:.3f}",
         "-af", f"volume=-15dB,afade=t=in:st=0:d=1.2,"
                f"afade=t=out:st={REEL_SECONDS - 2.4:.3f}:d=2.4",
         "-codec:a", "libmp3lame", "-b:a", "224k", "-ar", str(SR),
         out],
        check=True,
    )
    return out


def build_layer1_longform():
    """Layer 1 for the 298 s long-form video -- the same supplied track, LOOPED.

    This is the one place the two deliverables genuinely differ. The source
    runs 252.168 s, which comfortably covers the 88 s reel outright but falls
    45.8 s short of 298 s, so the long-form bed has to loop.

    A butt-joined loop would put an audible seam right in the middle of the
    video, so the join is a 3 s equal-power CROSSFADE instead: the track plays
    from 0 to 250 s, then crossfades into the same track again from 150 s and
    runs 51 s more. 250 + 51 - 3 = 298.000 s exactly.

    This is still not a modification of the composition -- no EQ, no
    compression, no layering, no substitution. The only operations are a cut,
    a crossfade between two passages of the same recording, one constant gain
    and end fades. audit_audio.py verifies the first pass sample-for-sample
    against the source.
    """
    if not os.path.exists(LAYER1_SRC):
        raise SystemExit(f"Layer 1 source missing: {LAYER1_SRC}")
    out = os.path.join(BED_DIR, "bed-layer1-longform.mp3")

    head_end = 250.0     # end of the first pass
    tail_start = 150.0   # where the second pass is picked up
    xfade = 3.0
    tail_len = LONGFORM_SECONDS - head_end + xfade  # 51.0

    filt_graph = (
        f"[0:a]atrim=0:{head_end},asetpts=PTS-STARTPTS[a];"
        f"[1:a]atrim={tail_start}:{tail_start + tail_len},asetpts=PTS-STARTPTS[b];"
        f"[a][b]acrossfade=d={xfade}:c1=tri:c2=tri[x];"
        f"[x]volume=-15dB,"
        f"afade=t=in:st=0:d=1.5,"
        f"afade=t=out:st={LONGFORM_SECONDS - 3.0:.3f}:d=3.0[out]"
    )
    subprocess.run(
        [FFMPEG, "-y", "-loglevel", "error",
         "-i", LAYER1_SRC, "-i", LAYER1_SRC,
         "-filter_complex", filt_graph, "-map", "[out]",
         "-t", f"{LONGFORM_SECONDS:.3f}",
         "-codec:a", "libmp3lame", "-b:a", "224k", "-ar", str(SR),
         out],
        check=True,
    )
    return out


def build_silent_vo():
    """Silent placeholders so both compositions render before VO is recorded."""
    made = []
    for name, seconds in (
        ("voiceover-reel.mp3", REEL_SECONDS),
        ("voiceover-longform.mp3", LONGFORM_SECONDS),
    ):
        out = os.path.join(VO_DIR, name)
        made.append(out)
        if os.path.exists(out):
            continue
        subprocess.run(
            [FFMPEG, "-y", "-loglevel", "error",
             "-f", "lavfi", "-i", f"anullsrc=r={SR}:cl=stereo",
             "-t", f"{seconds:.3f}",
             "-codec:a", "libmp3lame", "-b:a", "96k", out],
            check=True,
        )
    return made


def main():
    print(f"ffmpeg: {FFMPEG}")
    print("\n-- LAYER 1 (supplied, unmodified composition) --")
    p = build_layer1()
    print(f"   {os.path.relpath(p, ROOT):<44} 88.000 s  (no loop needed)")
    p2 = build_layer1_longform()
    print(f"   {os.path.relpath(p2, ROOT):<44} 298.000 s (3 s crossfade loop)")

    print("\n-- LAYER 2 (synthesised here, numpy/scipy) --")
    for name, fn in CUES.items():
        x = fn()
        wav = write_wav(name, x)
        mp3 = encode(wav, name)
        kb = os.path.getsize(mp3) // 1024
        print(f"   {name:<20} {kb:>4} KB")

    print("\n-- VO placeholders --")
    for v in build_silent_vo():
        print(f"   {os.path.relpath(v, ROOT)}")
    print(f"\nDone. {len(CUES)} Layer 2 cues.")


if __name__ == "__main__":
    sys.exit(main())
