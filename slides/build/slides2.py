"""
Neumann TLM 107 x Shivansh Electronics — ten square slides, light ground.

Type is the MOTU M-Series repository's own Archivo/Fraunces system. The ground
is warm beige stock ruled as a spreadsheet. Product photography is mounted as
plates: dark plates where the finish needs a dark ground to read (nickel), the
beige itself where the product is black and already contrasts.

Every technical figure is VERIFIED in the Neumann repo's src/lib/copy.ts
against the brief's Section 4 master table. No wooden box, no other
microphone, no price.
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'lib'))
from PIL import Image, ImageDraw
import ds2, brandblock2
from ds2 import (S, MARGIN, CONTENT, CELL, PAPER, PAPER_HI, PAPER_LO, GRID_MAJ,
                 HAIR, INK, INK2, MUTED, RED, ORANGE, PLATE_BG, PLATE_IN,
                 F, text, tw, rule, vrule, para, ground, load, fit, place,
                 crop_cover, plate, scrim, headline, subhead, spec, micro,
                 editorial, snap)

OUT = "/home/user/slides-v2/out"
os.makedirs(OUT, exist_ok=True)

PATTERNS = ["Omnidirectional", "Wide Angle Cardioid", "Cardioid",
            "Hypercardioid", "Figure-8"]

def A(n): return load(n)

def index(img, n, label, on_dark=False):
    """Recurring slide index, top-left, snapped to the grid."""
    c1 = RED if not on_dark else (214, 92, 88)
    c2 = MUTED if not on_dark else (176, 168, 156)
    x = micro(img, (MARGIN, 198), f"{n:02d}", 27, c1, 700, 0.16)
    rule(img, MARGIN + x + 24, 188, MARGIN + x + 74, ORANGE, 3, 1.0)
    micro(img, (MARGIN + x + 96, 198), label, 27, c2, 600, 0.16)

def finish(img, name):
    brandblock2.draw(img)
    img.convert('RGB').save(f"{OUT}/{name}.png", dpi=(300,300), optimize=True)
    print(f"  ✓ {name}.png")

# ============================================================ 01 · HERO
def s01():
    """Opening statement. Black product straight onto the beige stock — the
    finish already carries the contrast, so the page stays open."""
    img = ground(seed=11)
    mic = fit(A("cut_set_black_34.png"), h=1160)
    place(img, mic, (S - MARGIN - mic.width + 130, 300),
          blur=62, opacity=0.30, dy=30)

    index(img, 1, "STUDIO CONDENSER")
    headline(img, (MARGIN, 700), "TLM", 268, INK, 900)
    headline(img, (MARGIN, 940), "107", 268, INK, 900)
    rule(img, MARGIN, 1010, MARGIN + 216, RED, 6)
    editorial(img, (MARGIN, 1150), "Large-diaphragm", 74, INK2, 500)
    editorial(img, (MARGIN, 1240), "studio condenser.", 74, INK2, 500)
    micro(img, (MARGIN, 1392), "MADE IN GERMANY", 27, MUTED, 600, 0.18)
    finish(img, "01_hero_launch")

# ============================================================ 02 · FINISHES
def s02():
    """Each finish shown on the ground that flatters it — nickel on a dark
    plate, black on the bare stock. The split is the idea, not decoration."""
    img = ground(seed=23)
    plate(img, (0, 0, S//2 - 2, ds2.FOOT_TOP - 74), None, dark=True)

    nk = fit(A("cut_front_nickel.png"), h=880)
    img.alpha_composite(nk, (int(S*0.25 - nk.width/2), 560))
    bk = fit(A("cut_front_black.png"), h=880)
    place(img, bk, (int(S*0.75 - bk.width/2), 560), blur=58, opacity=0.28, dy=28)

    index(img, 2, "FINISH", on_dark=True)
    headline(img, (MARGIN, 372), "ONE",  96, PLATE_IN, 800)
    headline(img, (MARGIN, 476), "MICROPHONE", 96, PLATE_IN, 800)
    headline(img, (S - MARGIN, 372), "TWO", 96, INK, 800, "rs")
    headline(img, (S - MARGIN, 476), "FINISHES", 96, RED, 800, "rs")

    micro(img, (S*0.25, 1546), "NICKEL", 30, (206,198,186), 700, 0.22, "ms")
    micro(img, (S*0.75, 1546), "BLACK",  30, INK, 700, 0.22, "ms")
    finish(img, "02_form_two_finishes")

# ============================================================ 03 · PROVENANCE
def s03():
    """One photograph, mounted large. The badge macro is the strongest frame
    in the repository; the sheet gives it a margin and gets out of the way."""
    img = ground(seed=31)
    plate(img, (MARGIN, 300, S - MARGIN, 1180), A("macro_badge.png"), 0.46, 0.44)

    index(img, 3, "PROVENANCE")
    headline(img, (MARGIN, 1352), "MADE IN GERMANY", 118, INK, 800)
    rule(img, MARGIN, 1408, MARGIN + 216, RED, 6)
    editorial(img, (MARGIN, 1524), "Engraved on the ring. Not printed on a label.",
              50, INK2, 400)
    finish(img, "03_made_in_germany")

# ============================================================ 04 · PATTERNS
def s04():
    """The five patterns are printed on the microphone's own ring, so the
    photograph is the evidence and the ruled list is the caption."""
    img = ground(seed=43)
    panel = fit(A("cut_panel_black.png"), w=980)
    place(img, panel, (MARGIN, 690), blur=58, opacity=0.28, dy=28)

    index(img, 4, "DIRECTIVITY")
    headline(img, (MARGIN, 372), "FIVE POLAR", 104, INK, 800)
    headline(img, (MARGIN, 486), "PATTERNS",   104, RED, 800)
    rule(img, MARGIN, 546, MARGIN + 216, ORANGE, 5)

    x = MARGIN + 1074
    rule(img, x, 682, S - MARGIN, HAIR, 2, 0.9)
    for i, p in enumerate(PATTERNS):
        y = 764 + i*128
        spec(img, (x, y), f"{i+1:02d}", 29, RED, 700, 0.10)
        text(img, (x + 92, y), p, F("Archivo-500", 46), INK, -0.4, "ls")
        rule(img, x, y + 46, S - MARGIN, HAIR, 2, 0.5)
    micro(img, (x, 1462), "SELECTED ON THE BODY", 25, MUTED, 600, 0.16)
    micro(img, (x, 1512), "NO MENU  ·  NO SOFTWARE", 25, MUTED, 600, 0.16)
    finish(img, "04_five_patterns")

# ============================================================ 05 · RANGE
def s05():
    """Typographic slide. Two verified figures at display scale, with the
    grille macro as a narrow dark rule between them and the sheet."""
    img = ground(seed=57)
    plate(img, (MARGIN, 292, S - MARGIN, 792), A("tex_grille.png"), 0.5, 0.5)

    index(img, 5, "DYNAMIC RANGE")
    headline(img, (MARGIN, 942), "HEADROOM AT BOTH ENDS", 92, INK, 800)
    rule(img, MARGIN, 996, MARGIN + 216, RED, 6)

    for x, v, u, k in ((MARGIN, "10", "dB-A", "SELF-NOISE"),
                       (MARGIN + 960, "141", "dB", "MAXIMUM SPL")):
        w = headline(img, (x, 1258), v, 210, INK, 900)
        text(img, (x + w + 26, 1258), u, F("Archivo-400", 62), RED, 0.4, "ls")
        micro(img, (x, 1330), k, 28, MUTED, 600, 0.18)
        rule(img, x, 1368, x + 760, HAIR, 2, 0.8)
    editorial(img, (MARGIN, 1470), "153 dB with the −12 dB pad engaged.", 44, INK2, 400)
    editorial(img, (MARGIN, 1544), "Frequency range 20 Hz – 20 kHz.", 44, MUTED, 400)
    finish(img, "05_headroom_and_silence")

# ============================================================ 06 · BUILD
def s06():
    """Build macro. The nickel body needs a dark ground to read, so it is
    mounted as a plate; the specification sits on the bare sheet beside it."""
    img = ground(seed=61)
    plate(img, (S - MARGIN - 1020, 300, S - MARGIN, 1490),
          A("cut_xlr_base.png"), 0.52, 0.5, pad=64)

    index(img, 6, "BUILD")
    headline(img, (MARGIN, 396), "PRECISION,", 100, INK, 800)
    headline(img, (MARGIN, 506), "TO THE PIN", 100, RED, 800)
    rule(img, MARGIN, 566, MARGIN + 216, ORANGE, 5)

    for i, (k, v) in enumerate((("WEIGHT", "445 g"),
                                ("DIAMETER × LENGTH", "64 × 145 mm"),
                                ("PHANTOM POWER", "48 V"),
                                ("SENSITIVITY", "11 mV/Pa"))):
        y = 736 + i*182
        micro(img, (MARGIN, y), k, 25, MUTED, 600, 0.16)
        text(img, (MARGIN, y + 82), v, F("Archivo-600", 62), INK, -0.6, "ls")
        rule(img, MARGIN, y + 118, MARGIN + 860, HAIR, 2, 0.55)
    finish(img, "06_engineered_detail")

# ============================================================ 07 · IN USE
def s07():
    """The only frame in the repository showing the microphone in a working
    room. Mounted nearly full-bleed, with the caption on the sheet below."""
    img = ground(seed=71)
    plate(img, (MARGIN, 292, S - MARGIN, 1270), A("ctx_console.png"), 0.52, 0.40)

    index(img, 7, "IN USE")
    headline(img, (MARGIN, 1436), "WHERE IT BELONGS", 116, INK, 800)
    rule(img, MARGIN, 1492, MARGIN + 216, RED, 6)
    editorial(img, (MARGIN, 1596), "Tracking. Broadcast. Post.", 50, INK2, 400)
    finish(img, "07_in_the_studio")

# ============================================================ 08 · STUDIO SET
def s08():
    """What is in the box, stated exactly and no further. The repo marks the
    Studio Set enclosure UNVERIFIED, so no case appears — the two confirmed
    contents are shown as a numbered pair."""
    img = ground(seed=83)
    index(img, 8, "THE STUDIO SET")
    headline(img, (MARGIN, 392), "MICROPHONE", 100, INK, 800)
    headline(img, (MARGIN, 502), "AND EA 4",   100, RED, 800)
    rule(img, MARGIN, 562, MARGIN + 216, ORANGE, 5)

    mic = fit(A("cut_front_black.png"), h=740)
    place(img, mic, (MARGIN + 130, 660), blur=56, opacity=0.28, dy=26)
    plate(img, (S - MARGIN - 790, 700, S - MARGIN, 1310),
          A("cut_ea4_nickel.png"), 0.5, 0.5, pad=72)

    for x, num, name, sub in ((MARGIN, "01", "TLM 107", "Studio condenser"),
                              (S - MARGIN - 790, "02", "EA 4", "Elastic suspension")):
        rule(img, x, 1400, x + 620, HAIR, 2, 0.85)
        spec(img, (x, 1470), num, 29, RED, 700, 0.10)
        text(img, (x + 92, 1470), name, F("Archivo-700", 52), INK, -0.8, "ls")
        micro(img, (x + 92, 1528), sub, 25, MUTED, 600, 0.14)
    finish(img, "08_the_studio_set")

# ============================================================ 09 · SPEC
def s09():
    """The data slide — the sheet doing what the sheet is for. Every figure is
    VERIFIED in copy.ts; nothing is inferred or rounded."""
    img = ground(seed=97)
    mic = fit(A("cut_front_black_sq.png"), h=940)
    place(img, mic, (S - MARGIN - mic.width + 60, 588), blur=58, opacity=0.26, dy=26)

    index(img, 9, "SPECIFICATION")
    headline(img, (MARGIN, 392), "THE NUMBERS", 100, INK, 800)
    rule(img, MARGIN, 452, MARGIN + 216, RED, 6)

    rows = (("Maximum SPL", "141 dB"), ("With −12 dB pad", "153 dB"),
            ("Self-noise", "10 dB-A"), ("Frequency range", "20 Hz – 20 kHz"),
            ("Polar patterns", "5"), ("Pre-attenuation", "0 / −6 / −12 dB"),
            ("Low-cut filter", "Linear / 40 / 100 Hz"), ("Phantom power", "48 V"),
            ("Sensitivity", "11 mV/Pa"), ("Weight", "445 g"),
            ("Diameter × length", "64 × 145 mm"))
    x, w = MARGIN, 1000
    for i, (k, v) in enumerate(rows):
        y = 606 + i*88
        text(img, (x, y), k, F("Archivo-400", 40), INK2, 0.2, "ls")
        text(img, (x + w, y), v, F("Archivo-600", 40), INK, 0.8, "rs")
        rule(img, x, y + 28, x + w, HAIR, 2, 0.45)
    finish(img, "09_specification")

# ============================================================ 10 · ENQUIRE
def s10():
    """Closing slide. The contact block is the subject, so the product steps
    back and the type carries the page."""
    img = ground(seed=101)
    mic = fit(A("cut_set_black_front.png"), h=920)
    place(img, mic, (S - MARGIN - mic.width + 210, 470), blur=64, opacity=0.24, dy=28)

    index(img, 10, "ENQUIRE")
    headline(img, (MARGIN, 560), "AVAILABLE", 138, INK, 900)
    headline(img, (MARGIN, 692), "NOW",       138, INK, 900)
    rule(img, MARGIN, 758, MARGIN + 216, RED, 6)
    editorial(img, (MARGIN, 876), "The Neumann TLM 107 Studio Set,", 52, INK2, 400)
    editorial(img, (MARGIN, 946), "at Shivansh Electronics, Kolkata.", 52, INK2, 400)

    micro(img, (MARGIN, 1102), "TALK TO US ON WHATSAPP", 27, RED, 700, 0.18)
    g = brandblock2.icon('whatsapp', 68)
    img.alpha_composite(g, (MARGIN, int(1266 - g.height/2)))
    for i, n in enumerate(brandblock2.WA):
        text(img, (MARGIN + g.width + 36, 1204 + i*62), n,
             F("Archivo-700", 46), INK, 1.4, "lm")
    rule(img, MARGIN, 1414, MARGIN + 900, HAIR, 2, 0.85)
    text(img, (MARGIN, 1504), "www.shivanshelectronics.in",
         F("Archivo-600", 54), INK, 0.2, "ls")
    micro(img, (MARGIN, 1566), "ENQUIRIES WELCOME — TRADE AND STUDIO", 25, MUTED, 600, 0.14)
    finish(img, "10_enquire")

if __name__ == "__main__":
    which = sys.argv[1:] or [str(i) for i in range(1, 11)]
    for w in which: globals()[f"s{int(w):02d}"]()
