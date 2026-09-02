"""
Neumann TLM 107 x Shivansh Electronics — the ten campaign slides.

Every technical figure below is drawn from the repository's own verified
content: src/lib/copy.ts records each one as VERIFIED against the brief's
Section 4 master table, and the pad values, filter values and the five polar
pattern icons are independently corroborated by the control-panel photography
in the repo. Nothing is invented.

Two content rules the repo states as non-negotiable are honoured throughout:
no wooden presentation box is shown or implied (the Studio Set enclosure is
UNVERIFIED), and no other microphone — including Neumann's own catalogue — is
shown or compared against.
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'lib'))
from PIL import Image, ImageFilter, ImageDraw
import numpy as np
import ds, brandblock
from ds import (S, MARGIN, CONTENT, INK, INK2, INK3, LINE, LINE_HI, PAPER,
                SOFT, DIM, FAINT, BRASS, BRASS_D, F, text, tw, rule, vrule,
                eyebrow, ground, load, fit, place, shadow, scrim, crop_cover,
                framed, duotone, tint_mask, hairgrid, para)

OUT = "/home/user/slides-build/out"
os.makedirs(OUT, exist_ok=True)

# ---- verified content (mirrors src/lib/copy.ts) ---------------------------
PATTERNS = ["Omnidirectional", "Wide Angle Cardioid", "Cardioid",
            "Hypercardioid", "Figure-8"]
PRICE = "Rs. 1,44,900"

def A(name): return load(name)

def index(img, n, label):
    """The recurring slide index — top-left on every slide."""
    eyebrow(img, (MARGIN, 196), f"{n:02d}", BRASS, 27, 7.0)
    x = tw(f"{n:02d}", F("JBM-600",27), 7.0)
    rule(img, MARGIN + x + 22, 186, MARGIN + x + 70, LINE_HI, 2, 1.0)
    eyebrow(img, (MARGIN + x + 92, 196), label, DIM, 27, 7.0)

def finish(img, name):
    brandblock.draw(img)
    img.convert('RGB').save(f"{OUT}/{name}.png")
    print(f"  ✓ {name}.png")

# =========================================================== 01 · HERO
def s01():
    """Opening statement. The product is the entire argument: a single
    dominant cutout lit from behind, the name at display scale, nothing else."""
    img = ground(seed=11, glow=(0.60, 0.42, 0.85), glow_r=1.15, vignette=0.82)
    mic = A("cut_set_black_34.png")
    mic = fit(mic, h=1210)
    x = S - MARGIN - mic.width + 150      # bleeds off the right edge
    place(img, mic, (x, 300), blur=110, opacity=0.62, dy=58, spread=1.06)

    index(img, 1, "STUDIO CONDENSER")
    text(img, (MARGIN, 690), "TLM", F("Inter-800", 300), PAPER, -12, "ls")
    text(img, (MARGIN, 960), "107", F("Inter-800", 300), PAPER, -12, "ls")
    rule(img, MARGIN, 1046, MARGIN + 210, BRASS, 5)
    para(img, (MARGIN, 1152),
         ["Large-diaphragm", "studio condenser."], F("Inter-300", 60),
         SOFT, 76, 0.2)
    eyebrow(img, (MARGIN, 1392), "MADE IN GERMANY", FAINT, 26, 7.5)
    finish(img, "01_hero_launch")

# =========================================================== 02 · FINISHES
def s02():
    """Editorial diptych. Two elevations, one grid — the set's most symmetrical
    layout, deliberately placed early so later asymmetry reads as a shift."""
    img = ground(seed=23, glow=(0.5, 0.40, 0.62), glow_r=0.85, vignette=0.86)
    # a slightly raised panel behind the left half sets the two finishes apart
    lay = Image.new('RGBA', (S, S), (0,0,0,0))
    ImageDraw.Draw(lay).rectangle([0, 0, S//2, ds.FOOT_TOP-58], fill=INK2+(150,))
    img.alpha_composite(lay)
    vrule(img, S//2 - 1, 250, ds.FOOT_TOP - 90, LINE, 2, 0.9)

    for i, (key, h, label) in enumerate((("cut_front_nickel.png", 1000, "NICKEL"),
                                         ("cut_front_black.png",  1000, "BLACK"))):
        m = fit(A(key), h=h)
        cx = S*(0.25 + 0.5*i)
        place(img, m, (cx - m.width/2, 470), blur=84, opacity=0.50, dy=44)
        eyebrow(img, (cx, 1560), label, PAPER if i else BRASS, 30, 9.0, "ms")
        rule(img, cx-34, 1592, cx+34, LINE_HI, 2)

    index(img, 2, "FINISH")
    text(img, (S/2, 330), "ONE MICROPHONE.", F("Inter-700", 96), PAPER, -1.5, "ms")
    text(img, (S/2, 430), "TWO FINISHES.",   F("Inter-700", 96), BRASS, -1.5, "ms")
    finish(img, "02_form_two_finishes")

# =========================================================== 03 · PROVENANCE
def s03():
    """The most restrained slide in the set: one photograph, full bleed, and
    four words. The badge macro is the strongest frame in the repository and is
    given the whole canvas to carry."""
    img = ground(seed=31, vignette=1.0)
    ph = crop_cover(A("macro_badge.png"), S, ds.FOOT_TOP + 40, 0.46, 0.42)
    img.alpha_composite(ph, (0, 0))
    scrim(img, (0, 0, S, ds.FOOT_TOP+40), 'b', 0.97, 0.55)
    scrim(img, (0, 0, S, 620), 't', 0.80, 0.90)

    index(img, 3, "PROVENANCE")
    text(img, (MARGIN, 1260), "MADE IN", F("Inter-800", 168), PAPER, -6, "ls")
    text(img, (MARGIN, 1410), "GERMANY", F("Inter-800", 168), PAPER, -6, "ls")
    rule(img, MARGIN, 1478, MARGIN + 168, BRASS, 5)
    text(img, (MARGIN, 1568), "Engraved on the ring. Not printed on a label.",
         F("Inter-300", 46), SOFT, 0.4, "ls")
    finish(img, "03_made_in_germany")

# =========================================================== 04 · PATTERNS
def s04():
    """Technical slide. The five patterns are printed on the microphone's own
    ring, so the photograph is the evidence and the list is only the caption.

    Uses the matted cutout rather than a framed crop: the source is shot on a
    white sweep, and at this canvas size the file is too small to full-bleed
    without magnifying past its resolution. Contained and keyed, it stays sharp
    and the ring reads complete — all five icons visible.
    """
    img = ground(seed=43, glow=(0.30, 0.56, 0.80), glow_r=1.05, vignette=0.86)
    hairgrid(img, 0.45)

    index(img, 4, "DIRECTIVITY")
    text(img, (MARGIN, 372), "FIVE POLAR", F("Inter-700", 106), PAPER, -2.5, "ls")
    text(img, (MARGIN, 484), "PATTERNS",   F("Inter-700", 106), BRASS, -2.5, "ls")
    rule(img, MARGIN, 552, MARGIN + 176, BRASS, 4)

    panel = fit(A("cut_panel_black.png"), w=1016)
    place(img, panel, (MARGIN - 6, 700), blur=76, opacity=0.58, dy=46)

    x = MARGIN + 1090
    rule(img, x, 690, S - MARGIN, LINE_HI, 2, 0.9)
    for i, p in enumerate(PATTERNS):
        y = 774 + i*128
        text(img, (x, y), f"{i+1:02d}", F("JBM-700", 29), BRASS_D, 4.5, "ls")
        text(img, (x + 88, y), p, F("Inter-500", 46), PAPER, -0.2, "ls")
        rule(img, x, y + 46, S - MARGIN, LINE, 2, 0.65)
    text(img, (x, 1472), "Selected on the microphone body.",
         F("Inter-300", 35), DIM, 0.3, "ls")
    text(img, (x, 1524), "No menu. No software.",
         F("Inter-300", 35), FAINT, 0.3, "ls")
    finish(img, "04_five_patterns")

# =========================================================== 05 · RANGE
def s05():
    """Typographic slide — the two figures carry it, the grille macro is only
    the ground. Both figures are VERIFIED in the repo's copy.ts spec table."""
    img = ground(seed=57, vignette=0.94)
    H = ds.FOOT_TOP + 40
    tex = crop_cover(A("tex_grille.png"), S, H, 0.5, 0.5)
    img.alpha_composite(tex, (0, 0))
    scrim(img, (0, 0, S, H), 'b', 0.97, 0.60)
    scrim(img, (0, 0, S, H), 't', 0.95, 0.34)

    index(img, 5, "DYNAMIC RANGE")
    text(img, (MARGIN, 452), "HEADROOM AT",  F("Inter-700", 100), PAPER, -2.2, "ls")
    text(img, (MARGIN, 560), "BOTH ENDS",    F("Inter-700", 100), BRASS, -2.2, "ls")

    colx = (MARGIN, MARGIN + 960)
    figs = (("10", "dB-A", "SELF-NOISE"), ("141", "dB", "MAXIMUM SPL"))
    for (x, (v, u, k)) in zip(colx, figs):
        rule(img, x, 900, x + 760, LINE_HI, 2, 0.85)
        w = text(img, (x, 1132), v, F("Inter-800", 232), PAPER, -9, "ls")
        text(img, (x + w + 26, 1132), u, F("Inter-300", 66), BRASS, 0.5, "ls")
        eyebrow(img, (x, 1216), k, DIM, 28, 7.5)
    text(img, (MARGIN, 1382), "153 dB with the \u221212 dB pad engaged.",
         F("Inter-300", 44), SOFT, 0.3, "ls")
    text(img, (MARGIN, 1470), "Frequency range 20 Hz \u2013 20 kHz.",
         F("Inter-300", 44), FAINT, 0.3, "ls")
    finish(img, "05_headroom_and_silence")

# =========================================================== 06 · BUILD
def s06():
    """Build-quality macro. The photograph carries the argument — gold-plated
    pins, the engraved ring, a stamped serial — so the copy stays out of its way."""
    img = ground(seed=61, glow=(0.72, 0.52, 0.75), glow_r=1.0, vignette=0.84)
    m = fit(A("cut_xlr_base.png"), w=1150)
    place(img, m, (S - MARGIN - m.width + 70, 548), blur=88, opacity=0.58, dy=48)

    index(img, 6, "BUILD")
    text(img, (MARGIN, 400), "PRECISION,",  F("Inter-700", 104), PAPER, -2.4, "ls")
    text(img, (MARGIN, 512), "TO THE PIN",  F("Inter-700", 104), BRASS, -2.4, "ls")
    rule(img, MARGIN, 580, MARGIN + 176, BRASS, 4)

    rows = (("WEIGHT", "445 g"), ("DIAMETER \u00d7 LENGTH", "64 \u00d7 145 mm"),
            ("PHANTOM POWER", "48 V"), ("SENSITIVITY", "11 mV/Pa"))
    for i, (k, v) in enumerate(rows):
        y = 760 + i*146
        eyebrow(img, (MARGIN, y), k, DIM, 25, 6.5)
        text(img, (MARGIN, y + 76), v, F("Inter-500", 60), PAPER, -0.4, "ls")
        rule(img, MARGIN, y + 106, MARGIN + 640, LINE, 2, 0.6)
    finish(img, "06_engineered_detail")

# =========================================================== 07 · IN USE
def s07():
    """Context slide. The only frame in the repository that shows the
    microphone in a working room — full bleed, scrimmed, four words."""
    img = ground(seed=71, vignette=1.0)
    ph = crop_cover(A("ctx_console.png"), S, ds.FOOT_TOP + 40, 0.52, 0.40)
    img.alpha_composite(ph, (0, 0))
    scrim(img, (0, 0, S, ds.FOOT_TOP+40), 'b', 0.97, 0.52)
    scrim(img, (0, 0, S, 560), 't', 0.86, 0.92)

    index(img, 7, "IN USE")
    text(img, (MARGIN, 1298), "WHERE IT",  F("Inter-800", 158), PAPER, -5.5, "ls")
    text(img, (MARGIN, 1440), "BELONGS",   F("Inter-800", 158), PAPER, -5.5, "ls")
    rule(img, MARGIN, 1506, MARGIN + 168, BRASS, 5)
    text(img, (MARGIN, 1592), "Tracking. Broadcast. Post.",
         F("Inter-300", 46), SOFT, 0.4, "ls")
    finish(img, "07_in_the_studio")

# =========================================================== 08 · STUDIO SET
def s08():
    """What is in the box, stated exactly and no further. The repo marks the
    Studio Set enclosure UNVERIFIED, so no case or box appears here — the two
    confirmed contents are shown as a pair and nothing else is implied."""
    img = ground(seed=83, glow=(0.5, 0.42, 0.62), glow_r=1.25, vignette=0.86)
    hairgrid(img, 0.4)

    index(img, 8, "THE STUDIO SET")
    text(img, (MARGIN, 392), "MICROPHONE",   F("Inter-700", 104), PAPER, -2.4, "ls")
    text(img, (MARGIN, 504), "AND EA 4",     F("Inter-700", 104), BRASS, -2.4, "ls")
    rule(img, MARGIN, 572, MARGIN + 176, BRASS, 4)

    mic = fit(A("cut_front_nickel.png"), h=772)
    ea4 = fit(A("cut_ea4_nickel.png"),   h=548)
    ea4 = Image.blend(Image.new('RGBA', ea4.size, (0,0,0,0)), ea4, 0.90)
    place(img, mic, (MARGIN + 110, 630), blur=76, opacity=0.52, dy=42)
    place(img, ea4, (S - MARGIN - ea4.width - 70, 756), blur=76, opacity=0.52, dy=42)

    for x, num, name, sub in ((MARGIN + 60, "01", "TLM 107", "Studio condenser"),
                              (S - MARGIN - 580, "02", "EA 4", "Elastic suspension")):
        rule(img, x, 1452, x + 520, LINE_HI, 2, 0.75)
        text(img, (x, 1518), num, F("JBM-700", 29), BRASS_D, 4.5, "ls")
        text(img, (x + 88, 1518), name, F("Inter-600", 52), PAPER, -0.6, "ls")
        text(img, (x + 88, 1574), sub,  F("Inter-300", 34), DIM, 0.3, "ls")
    finish(img, "08_the_studio_set")

# =========================================================== 09 · SPEC
def s09():
    """The data slide. Every figure is VERIFIED in copy.ts against the brief's
    Section 4 master table; nothing here is inferred or rounded."""
    img = ground(seed=97, glow=(0.80, 0.30, 0.55), glow_r=0.95, vignette=0.88)
    mic = fit(A("cut_front_black_sq.png"), h=980)
    place(img, mic, (S - MARGIN - mic.width + 40, 560), blur=90, opacity=0.50, dy=44)

    index(img, 9, "SPECIFICATION")
    text(img, (MARGIN, 392), "THE", F("Inter-700", 104), PAPER, -2.4, "ls")
    text(img, (MARGIN, 504), "NUMBERS", F("Inter-700", 104), BRASS, -2.4, "ls")
    rule(img, MARGIN, 572, MARGIN + 176, BRASS, 4)

    rows = (("Maximum SPL", "141 dB"), ("With \u221212 dB pad", "153 dB"),
            ("Self-noise", "10 dB-A"), ("Frequency range", "20 Hz \u2013 20 kHz"),
            ("Polar patterns", "5"), ("Pre-attenuation", "0 / \u22126 / \u221212 dB"),
            ("Low-cut filter", "Linear / 40 / 100 Hz"), ("Phantom power", "48 V"),
            ("Sensitivity", "11 mV/Pa"), ("Weight", "445 g"),
            ("Diameter \u00d7 length", "64 \u00d7 145 mm"))
    x, w = MARGIN, 1010
    for i, (k, v) in enumerate(rows):
        y = 700 + i*84
        text(img, (x, y), k, F("Inter-300", 40), DIM, 0.2, "ls")
        text(img, (x + w, y), v, F("JBM-500", 40), PAPER, 0.2, "rs")
        rule(img, x, y + 26, x + w, LINE, 2, 0.5)
    finish(img, "09_specification")

# =========================================================== 10 · ENQUIRE
def s10():
    """Closing slide. The contact block is the subject here, not the footnote:
    the product steps back, the partner line and the channels step forward."""
    img = ground(seed=101, glow=(0.30, 0.40, 0.95), glow_r=1.05, vignette=0.80)
    mic = fit(A("cut_set_black_front.png"), h=960)
    mic = Image.blend(Image.new('RGBA', mic.size, (0,0,0,0)), mic, 0.86)
    place(img, mic, (S - MARGIN - mic.width + 250, 470), blur=105, opacity=0.50,
          dy=54, spread=1.05)

    index(img, 10, "ENQUIRE")
    text(img, (MARGIN, 560), "AVAILABLE",  F("Inter-800", 150), PAPER, -5, "ls")
    text(img, (MARGIN, 700), "NOW",        F("Inter-800", 150), PAPER, -5, "ls")
    rule(img, MARGIN, 768, MARGIN + 210, BRASS, 5)

    para(img, (MARGIN, 880),
         ["The Neumann TLM 107 Studio Set,", "at Shivansh Electronics, Kolkata."],
         F("Inter-300", 54), SOFT, 70, 0.2)

    eyebrow(img, (MARGIN, 1112), "TALK TO US ON WHATSAPP", BRASS, 27, 7.0)
    g = brandblock.icon('whatsapp', 66, PAPER)
    img.alpha_composite(g, (MARGIN, int(1274 - g.height/2)))
    for i, n in enumerate(brandblock.WA):
        text(img, (MARGIN + g.width + 36, 1212 + i*62), n,
             F("JBM-600", 46), PAPER, 0.6, "lm")
    rule(img, MARGIN, 1420, MARGIN + 900, LINE_HI, 2, 0.8)
    text(img, (MARGIN, 1516), "www.shivanshelectronics.in",
         F("Inter-500", 54), PAPER, 0.2, "ls")
    text(img, (MARGIN, 1584), "Enquiries welcome \u2014 trade and studio.",
         F("Inter-300", 38), DIM, 0.3, "ls")
    finish(img, "10_enquire")

if __name__ == "__main__":
    import sys
    which = sys.argv[1:] or [str(i) for i in range(1,11)]
    for w in which: globals()[f"s{int(w):02d}"]()
