#!/usr/bin/env python3
"""Builds ONE 88.000 s audio file containing ONLY the Layer 2 transition SFX,
each placed at the exact frame position it sits at in the actual reel, with
the Layer 1 background bed silenced entirely.

This is not a re-derivation -- the cue table below is copied verbatim from
src/Reel.tsx's <AudioBed>, which is the single source of truth for what plays
when in the finished render. Scene start frames come from src/lib/theme.ts's
SCENES table (S1=0, S2=240, S3=900, S4=1350, S5=1800, S6=2250). Each cue's
absolute frame is converted to a sample offset at 48 kHz / 30 fps and the cue
audio is additively mixed there at the SAME relative volume it plays at in the
composition -- so the balance between cues (a soft toggle-click next to a
louder spec-mark) is preserved exactly, and the whole file drops onto the
video with the SFX landing in perfect sync. Nothing is loudness-normalized
away: peaks are left as they fall, so the user has full headroom to raise
levels against their own voiceover.

Run:  python3 scripts/build_transition_timeline.py
Out:  out/neumann-tlm107-transition-sfx-timeline.mp3  (88.000s, silent bed)
"""
import os
import subprocess
import sys
import wave

import numpy as np

SR = 48000
FPS = 30
TOTAL_SECONDS = 88.0
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SFX_DIR = os.path.join(ROOT, "public", "audio", "sfx")
OUT_DIR = os.path.join(ROOT, "out")
os.makedirs(OUT_DIR, exist_ok=True)

SCENE_START = {"S1": 0, "S2": 240, "S3": 900, "S4": 1350, "S5": 1800, "S6": 2250}


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
    """mp3 -> float32 stereo (n, 2), native sample rate 48k."""
    cmd = [FFMPEG, "-v", "error", "-i", path, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"]
    r = subprocess.run(cmd, capture_output=True)
    if r.returncode != 0:
        raise RuntimeError(r.stderr.decode()[:400])
    x = np.frombuffer(r.stdout, dtype="<f4").astype(np.float64)
    return x.reshape(-1, 2)


# ---------------------------------------------------------------------------
# THE CUE TABLE -- copied verbatim from src/Reel.tsx <AudioBed>.
# (name, scene, frame-offset-within-scene, volume)
# CueSteps entries are expanded into their individual (from + i*step) frames.
# ---------------------------------------------------------------------------
CUES = [
    # S1 — the macro pulls back and focus arrives
    ("grille-tap", "S1", 2, 0.50),
    ("focus-settle", "S1", 92, 0.46),
    ("grille-tap-hi", "S1", 108, 0.34),

    # S2 — the interface stepping, five LED advances per movement
    ("grille-shimmer", "S2", -6, 0.34),
    *[("toggle-click", "S2", 4 + i * 40, 0.46) for i in range(5)],
    *[("led-step", "S2", 10 + i * 40, 0.30) for i in range(5)],
    ("grille-tap-lo", "S2", 200, 0.38),
    *[("led-step", "S2", 226 + i * 62, 0.26) for i in range(5)],
    ("grille-tap", "S2", 470, 0.36),
    *[("toggle-click-soft", "S2", 482 + i * 30, 0.40) for i in range(4)],
    ("finish-wipe", "S2", 568, 0.34),

    # S3 — tactile control: pad and filter selections, then the figures
    ("grille-shimmer", "S3", -6, 0.32),
    ("toggle-click", "S3", 20, 0.52),
    *[("toggle-click-soft", "S3", 128 + i * 26, 0.44) for i in range(3)],
    *[("toggle-click-soft", "S3", 232 + i * 26, 0.44) for i in range(3)],
    ("spec-mark", "S3", 318, 0.42),
    ("spec-mark", "S3", 356, 0.42),
    ("grille-tap-hi", "S3", 404, 0.30),

    # S4 — the EA 4 suspension flexes
    ("grille-shimmer", "S4", -6, 0.32),
    ("rubber-stretch", "S4", 26, 0.50),
    ("rubber-settle", "S4", 108, 0.40),
    ("rubber-stretch", "S4", 210, 0.42),
    ("rubber-settle", "S4", 286, 0.36),
    ("focus-settle", "S4", 350, 0.34),

    # S5 — heritage, slower and airier
    ("grille-tap-lo", "S5", -4, 0.34),
    ("focus-settle", "S5", 60, 0.36),
    ("grille-tap", "S5", 196, 0.30),
    ("finish-wipe", "S5", 268, 0.40),
    ("grille-tap-hi", "S5", 380, 0.28),

    # S6 — the close
    ("grille-shimmer", "S6", -8, 0.36),
    ("focus-settle", "S6", 40, 0.38),
    ("spec-mark", "S6", 150, 0.44),
    ("outro-chime", "S6", 236, 0.44),
]


def main() -> int:
    n_samples = int(round(TOTAL_SECONDS * SR))
    timeline = np.zeros((n_samples, 2), dtype=np.float64)

    cache: dict[str, np.ndarray] = {}
    placed = 0
    clipped_at_placement = []

    for name, scene, off, vol in CUES:
        if name not in cache:
            cache[name] = decode(os.path.join(SFX_DIR, name + ".mp3"))
        clip = cache[name]

        abs_frame = SCENE_START[scene] + off
        start = int(round(abs_frame / FPS * SR))
        # a cue placed slightly before its scene's frame 0 (a lead-in tap) is
        # legitimate -- Remotion just starts playing it a touch early -- so
        # only clamp genuinely negative absolute timeline positions
        if start < 0:
            clip = clip[-start:]
            start = 0
        end = min(n_samples, start + len(clip) * 1)
        seg = clip[: end - start] * vol
        timeline[start:end] += seg
        placed += 1

    peak = float(np.max(np.abs(timeline)))
    print(f"Placed {placed} cue instances ({len(cache)} unique sounds).")
    print(f"Timeline peak before headroom check: {peak:.4f}")

    # Cues are short, sparse, and rarely overlap, so this stays well under 1.0
    # in practice. If overlaps ever did push it over, scale down UNIFORMLY
    # (never per-cue) so the relative balance the reel actually uses is
    # preserved exactly -- the whole point of this file.
    if peak > 0.98:
        g = 0.95 / peak
        timeline *= g
        print(f"Applied a uniform {20*np.log10(g):.2f} dB safety trim (relative balance unchanged).")

    timeline = np.clip(timeline, -1.0, 1.0)

    wav_path = os.path.join(OUT_DIR, "_transition_timeline.wav")
    with wave.open(wav_path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((timeline * 32767).astype("<i2").tobytes())

    out_path = os.path.join(OUT_DIR, "neumann-tlm107-transition-sfx-timeline.mp3")
    subprocess.run(
        [FFMPEG, "-y", "-loglevel", "error", "-i", wav_path,
         "-codec:a", "libmp3lame", "-b:a", "256k", "-ar", str(SR), out_path],
        check=True,
    )
    os.remove(wav_path)

    dur = len(timeline) / SR
    print(f"\nWrote {out_path}")
    print(f"  duration: {dur:.3f} s")
    print(f"  final peak: {float(np.max(np.abs(timeline))):.4f}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
