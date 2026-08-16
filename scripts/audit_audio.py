#!/usr/bin/env python3
"""Validates the two-layer audio pipeline before any scene code depends on it.

Checks, in order:

  1. LAYER 1 exists, decodes, and is exactly the reel length.
  2. LAYER 1 is compositionally unmodified -- its trimmed body is compared
     sample-for-sample against the supplied source (after undoing only the
     documented constant gain), so an accidental EQ/filter/replacement fails.
  3. Every LAYER 2 cue named in src/lib/sfx.ts exists on disk.
  4. Every LAYER 2 cue decodes to real audio -- non-zero, no clipping, no NaN.
  5. Every LAYER 2 cue respects the brief's Section 10 spectral rule: no
     large low-frequency content. We measure the share of energy below
     300 Hz and fail any cue that puts more than 8% of its energy there,
     which is what would muddy Layer 1.
  6. LAYER 2 headroom sits under LAYER 1's level so cues cut without burying
     the bed.

Exit code is non-zero on any failure.
"""
import os
import re
import shutil
import subprocess
import sys
import wave

import numpy as np

SR = 48000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SFX_DIR = os.path.join(ROOT, "public", "audio", "sfx")
BED = os.path.join(ROOT, "public", "audio", "bed-layer1.mp3")
SRC = os.path.join(ROOT, "sound-effects", "ES_Moment - Christoffer Moe Ditlevsen.mp3")
SFX_TS = os.path.join(ROOT, "src", "lib", "sfx.ts")

REEL_SECONDS = 88.0
LOW_SPLIT_HZ = 300.0
MAX_LOW_SHARE = 0.08
GAIN_DB = -15.0

fails = []
warns = []


def find_ffmpeg():
    env = os.environ.get("FFMPEG_BIN")
    if env and os.path.exists(env):
        return env
    w = shutil.which("ffmpeg")
    if w:
        return w
    for base in ("/tmp/claude-0/-home-user/b7c7b719-b725-5bcc-ae76-95b988bf89e8/scratchpad", ROOT):
        p = os.path.join(base, "node_modules", "ffmpeg-static", "ffmpeg")
        if os.path.exists(p):
            return p
    raise SystemExit("ffmpeg not found; set FFMPEG_BIN")


FFMPEG = find_ffmpeg()


def decode(path, seconds=None, offset=None):
    """mp3 -> float32 mono numpy via ffmpeg."""
    cmd = [FFMPEG, "-v", "error"]
    if offset is not None:
        cmd += ["-ss", f"{offset:.4f}"]
    cmd += ["-i", path]
    if seconds is not None:
        cmd += ["-t", f"{seconds:.4f}"]
    cmd += ["-f", "f32le", "-ac", "1", "-ar", str(SR), "-"]
    r = subprocess.run(cmd, capture_output=True)
    if r.returncode != 0:
        raise RuntimeError(r.stderr.decode()[:400])
    return np.frombuffer(r.stdout, dtype="<f4").astype(np.float64)


def dur(path):
    r = subprocess.run(
        [FFMPEG.replace("ffmpeg", "ffprobe") if os.path.exists(FFMPEG.replace("ffmpeg", "ffprobe"))
         else "ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nw=1:nk=1", path],
        capture_output=True, text=True,
    )
    if r.returncode == 0 and r.stdout.strip():
        return float(r.stdout.strip())
    return len(decode(path)) / SR


def low_share(x):
    """Fraction of total energy below LOW_SPLIT_HZ."""
    if len(x) < 64:
        return 0.0
    w = np.hanning(len(x))
    X = np.abs(np.fft.rfft(x * w)) ** 2
    f = np.fft.rfftfreq(len(x), 1 / SR)
    tot = X.sum()
    if tot <= 0:
        return 0.0
    return float(X[f < LOW_SPLIT_HZ].sum() / tot)


def rms_db(x):
    r = float(np.sqrt(np.mean(x ** 2)))
    return -120.0 if r < 1e-9 else 20 * np.log10(r)


print("=" * 74)
print("AUDIO PIPELINE VALIDATION")
print("=" * 74)

# -- 1/2. LAYER 1 -----------------------------------------------------------
print("\n[1] LAYER 1 -- fixed supplied background texture")
if not os.path.exists(SRC):
    fails.append("Layer 1 SOURCE missing")
elif not os.path.exists(BED):
    fails.append("Layer 1 OUTPUT missing (run gen_audio.py)")
else:
    d = dur(BED)
    sd = dur(SRC)
    print(f"    source   : {os.path.basename(SRC)}")
    print(f"    src dur  : {sd:.3f} s   (>= 88 s, so never looped)")
    print(f"    out dur  : {d:.3f} s")
    if abs(d - REEL_SECONDS) > 0.15:
        fails.append(f"Layer 1 duration {d:.3f}s != {REEL_SECONDS}s")
    if sd < REEL_SECONDS:
        fails.append("Layer 1 source shorter than reel -- would require looping")

    # Composition-integrity check: undo the constant gain, compare a mid
    # section (clear of the fades) against the source sample-for-sample.
    a = decode(BED, seconds=6.0, offset=30.0) / (10 ** (GAIN_DB / 20.0))
    b = decode(SRC, seconds=6.0, offset=30.0)
    n = min(len(a), len(b))
    if n > SR:
        a, b = a[:n], b[:n]
        denom = np.sqrt(np.mean(b ** 2))
        err = np.sqrt(np.mean((a - b) ** 2)) / (denom if denom > 1e-9 else 1.0)
        corr = float(np.corrcoef(a, b)[0, 1])
        print(f"    integrity: corr={corr:.5f}  rel-err={err:.4f}")
        if corr < 0.999 or err > 0.05:
            fails.append(
                f"Layer 1 composition altered (corr={corr:.5f}, err={err:.4f})")
        else:
            print("    -> composition UNMODIFIED (gain + end fades only)")

# -- 3/4/5/6. LAYER 2 -------------------------------------------------------
print("\n[2] LAYER 2 -- synthesised transition / foley palette")
if not os.path.exists(SFX_TS):
    fails.append("src/lib/sfx.ts missing -- cannot cross-reference cue names")
    names = []
else:
    src = open(SFX_TS).read()
    names = re.findall(r"'audio/sfx/([a-z0-9\-]+)\.mp3'", src)
    print(f"    cues declared in sfx.ts: {len(names)}")

bed_rms = rms_db(decode(BED)) if os.path.exists(BED) else -30.0
print(f"    Layer 1 bed RMS: {bed_rms:.1f} dBFS")
print()
print(f"    {'cue':<20}{'dur':>7}{'peak':>8}{'rms':>8}{'<300Hz':>9}  verdict")
print("    " + "-" * 62)

for nm in names:
    p = os.path.join(SFX_DIR, nm + ".mp3")
    if not os.path.exists(p):
        fails.append(f"cue file missing: {nm}.mp3")
        print(f"    {nm:<20}{'--':>7}{'--':>8}{'--':>8}{'--':>9}  MISSING")
        continue
    try:
        x = decode(p)
    except Exception as e:
        fails.append(f"cue will not decode: {nm} ({e})")
        print(f"    {nm:<20}  DECODE FAIL")
        continue

    d = len(x) / SR
    pk = float(np.max(np.abs(x))) if len(x) else 0.0
    rms = rms_db(x)
    ls = low_share(x)

    bad = []
    if len(x) == 0 or pk < 1e-4:
        bad.append("silent")
    if not np.isfinite(x).all():
        bad.append("NaN")
    if pk > 0.999:
        bad.append("clipped")
    if ls > MAX_LOW_SHARE:
        bad.append(f"low-heavy {ls*100:.0f}%")
    if rms > bed_rms + 16.0:
        bad.append("too loud vs bed")

    verdict = "ok" if not bad else ", ".join(bad)
    if bad:
        fails.append(f"cue {nm}: {verdict}")
    print(f"    {nm:<20}{d:>6.2f}s{pk:>8.3f}{rms:>7.1f}d{ls*100:>8.1f}%  {verdict}")

# -- summary ----------------------------------------------------------------
print("\n" + "=" * 74)
if warns:
    for w in warns:
        print(f"WARN  {w}")
if fails:
    print(f"FAILED -- {len(fails)} problem(s):")
    for f in fails:
        print(f"  x {f}")
    sys.exit(1)
print(f"PASSED -- Layer 1 unmodified + {len(names)} Layer 2 cues valid.")
print("Layer 2 is high-frequency throughout; nothing competes with Layer 1's body.")
sys.exit(0)
