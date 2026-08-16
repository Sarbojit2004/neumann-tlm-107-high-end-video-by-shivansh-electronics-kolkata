#!/usr/bin/env python3
"""Builds ONE 298.000 s audio file containing ONLY the long-form's Layer 2
transition SFX, each at the exact frame position it plays at in the rendered
video, with the Layer 1 background bed silenced entirely.

Same approach as the reel's build_transition_timeline.py, and for the same
reason: individual clips cannot realistically be lined up against picture by
hand, but a single full-length stem drops onto the timeline at 0:00 and locks.

The cue table below is copied verbatim from src/Longform.tsx's <AudioBed>,
which is the source of truth for what plays when in the actual render. Chapter
start frames come from src/lib/lf-theme.ts's CHAPTERS table. Each cue's
absolute frame is converted to a sample offset at 48 kHz / 30 fps and mixed in
additively at the SAME relative volume it plays at in the composition, so the
balance between cues matches the video exactly.

Nothing is loudness-normalised: peaks are left where they fall, leaving full
headroom to raise the whole stem against a voiceover.

Run:  python3 scripts/build_transition_timeline_lf.py
Out:  out/neumann-tlm107-longform-transition-sfx-timeline.mp3
"""
import os
import subprocess
import sys
import wave

import numpy as np

SR = 48000
FPS = 30
TOTAL_SECONDS = 298.0
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SFX_DIR = os.path.join(ROOT, "public", "audio", "sfx")
OUT_DIR = os.path.join(ROOT, "out")
os.makedirs(OUT_DIR, exist_ok=True)

# from src/lib/lf-theme.ts CHAPTERS
CH = {"C1": 0, "C2": 750, "C3": 2250, "C4": 3600, "C5": 4800, "C6": 6300, "C7": 7800}


def find_ffmpeg() -> str:
    env = os.environ.get("FFMPEG_BIN")
    if env and os.path.exists(env):
        return env
    for base in ("/tmp/claude-0/-home-user/b7c7b719-b725-5bcc-ae76-95b988bf89e8/scratchpad", ROOT):
        p = os.path.join(base, "node_modules", "ffmpeg-static", "ffmpeg")
        if os.path.exists(p):
            return p
    import shutil
    w = shutil.which("ffmpeg")
    if w:
        return w
    raise SystemExit("ffmpeg not found; set FFMPEG_BIN")


FFMPEG = find_ffmpeg()


def decode(path: str) -> np.ndarray:
    cmd = [FFMPEG, "-v", "error", "-i", path, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"]
    r = subprocess.run(cmd, capture_output=True)
    if r.returncode != 0:
        raise RuntimeError(r.stderr.decode()[:400])
    return np.frombuffer(r.stdout, dtype="<f4").astype(np.float64).reshape(-1, 2)


def steps(name, ch, start, step, count, vol):
    return [(name, ch, start + i * step, vol) for i in range(count)]


# ---------------------------------------------------------------------------
# CUE TABLE -- copied verbatim from src/Longform.tsx <AudioBed>.
# (name, chapter, frame-offset-within-chapter, volume)
# ---------------------------------------------------------------------------
CUES = [
    # C1  the problem
    ("grille-tap", "C1", 3, 0.50),
    ("focus-settle", "C1", 118, 0.44),
    ("chapter-mark", "C1", 180, 0.34),
    ("grille-tap-soft", "C1", 360, 0.40),
    ("panel-slide", "C1", 372, 0.36),
    ("grille-tap-mid", "C1", 555, 0.38),
    ("air-lift", "C1", 566, 0.32),

    # C2  capsule and the five patterns
    ("chapter-mark", "C2", -6, 0.40),
    ("grille-tap", "C2", 4, 0.36),
    ("grille-shimmer", "C2", 200, 0.32),
    *steps("toggle-click", "C2", 214, 46, 5, 0.46),
    *steps("led-step", "C2", 222, 46, 5, 0.28),
    ("pattern-morph", "C2", 452, 0.30),
    *steps("toggle-click-soft", "C2", 456, 140, 5, 0.42),
    *steps("spec-tick", "C2", 470, 140, 5, 0.26),
    ("grille-tap-lo", "C2", 1150, 0.36),
    ("air-lift", "C2", 1160, 0.30),

    # C3  engineering and interface
    ("chapter-mark", "C3", -6, 0.40),
    ("focus-settle", "C3", 140, 0.36),
    ("grille-tap-mid", "C3", 270, 0.36),
    *steps("spec-mark", "C3", 292, 40, 3, 0.40),
    ("grille-tap", "C3", 600, 0.34),
    ("toggle-click-hard", "C3", 620, 0.50),
    ("panel-slide", "C3", 900, 0.34),
    *steps("toggle-click-soft", "C3", 916, 28, 3, 0.42),
    *steps("toggle-click-soft", "C3", 948, 28, 3, 0.42),
    ("grille-tap-soft", "C3", 1140, 0.36),
    ("led-step", "C3", 1250, 0.30),

    # C4  the Studio Set / EA 4
    ("chapter-mark", "C4", -6, 0.40),
    ("rubber-stretch", "C4", 30, 0.50),
    ("rubber-settle", "C4", 150, 0.38),
    ("grille-tap-mid", "C4", 270, 0.34),
    ("rubber-stretch", "C4", 300, 0.46),
    ("rubber-short", "C4", 430, 0.38),
    ("rubber-settle", "C4", 520, 0.34),
    ("grille-tap-soft", "C4", 570, 0.34),
    ("rubber-short", "C4", 700, 0.36),
    ("panel-slide", "C4", 840, 0.34),
    *steps("spec-tick", "C4", 856, 26, 3, 0.28),

    # C5  heritage and finish
    ("chapter-mark", "C5", -6, 0.40),
    ("air-lift", "C5", 40, 0.32),
    ("grille-tap-lo", "C5", 330, 0.34),
    ("focus-settle", "C5", 360, 0.34),
    ("grille-tap", "C5", 630, 0.34),
    ("finish-wipe", "C5", 716, 0.44),
    ("grille-tap-hi", "C5", 856, 0.30),
    ("panel-slide", "C5", 1050, 0.32),
    ("grille-tap-soft", "C5", 1064, 0.34),

    # C6  transformation and proof
    ("chapter-mark", "C6", -6, 0.40),
    ("grille-tap-mid", "C6", 8, 0.34),
    ("panel-slide", "C6", 300, 0.34),
    *steps("grille-tap-soft", "C6", 316, 62, 3, 0.32),
    ("grille-tap", "C6", 720, 0.34),
    *steps("spec-mark", "C6", 742, 36, 4, 0.38),
    ("air-lift", "C6", 1078, 0.30),
    *steps("spec-tick", "C6", 1096, 13, 12, 0.20),

    # C7  price and CTA
    ("chapter-mark", "C7", -8, 0.42),
    ("grille-tap", "C7", 6, 0.36),
    ("focus-settle", "C7", 230, 0.40),
    ("grille-tap-hi", "C7", 250, 0.30),
    ("panel-slide", "C7", 366, 0.36),
    ("spec-mark", "C7", 400, 0.44),
    ("air-lift", "C7", 686, 0.32),
    ("outro-chime", "C7", 706, 0.46),
]


def main() -> int:
    n_samples = int(round(TOTAL_SECONDS * SR))
    timeline = np.zeros((n_samples, 2), dtype=np.float64)
    cache: dict[str, np.ndarray] = {}
    placed = 0

    for name, ch, off, vol in CUES:
        if name not in cache:
            cache[name] = decode(os.path.join(SFX_DIR, name + ".mp3"))
        clip = cache[name]
        start = int(round((CH[ch] + off) / FPS * SR))
        if start < 0:
            clip = clip[-start:]
            start = 0
        end = min(n_samples, start + len(clip))
        if end <= start:
            continue
        timeline[start:end] += clip[: end - start] * vol
        placed += 1

    peak = float(np.max(np.abs(timeline)))
    print(f"Placed {placed} cue instances ({len(cache)} unique sounds).")
    print(f"Timeline peak: {peak:.4f}")

    # Cues are short and sparse, so this stays well under 1.0. If overlaps ever
    # pushed it over, scale down UNIFORMLY -- never per-cue -- so the relative
    # balance the video actually uses is preserved, which is the point.
    if peak > 0.98:
        g = 0.95 / peak
        timeline *= g
        print(f"Applied a uniform {20*np.log10(g):.2f} dB safety trim.")

    timeline = np.clip(timeline, -1.0, 1.0)
    wav_path = os.path.join(OUT_DIR, "_lf_transition_timeline.wav")
    with wave.open(wav_path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((timeline * 32767).astype("<i2").tobytes())

    out_path = os.path.join(OUT_DIR, "neumann-tlm107-longform-transition-sfx-timeline.mp3")
    subprocess.run(
        [FFMPEG, "-y", "-loglevel", "error", "-i", wav_path,
         "-codec:a", "libmp3lame", "-b:a", "256k", "-ar", str(SR), out_path],
        check=True,
    )
    os.remove(wav_path)
    print(f"\nWrote {out_path}")
    print(f"  duration: {len(timeline) / SR:.3f} s")
    return 0


if __name__ == "__main__":
    sys.exit(main())
