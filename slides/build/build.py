"""
Neumann TLM 107 x Shivansh Electronics — ten ultra-premium square posters.

One system: obsidian ground lit with sapphire fill and a gold key, an
oversized condensed display word the product cuts through, a sideways edge
word, rim-lit cutouts, and a rich contact bar. Type is Barlow Condensed
ExtraBold for display and Archivo for everything else, both from the MOTU
M-Series repository.

Every technical figure is VERIFIED in the Neumann repo's src/lib/copy.ts
against the brief's Section 4 master table. No wooden box, no other
microphone, no price.
"""
import sys, os
sys.path.insert(0, "/home/user/slides-v3/lib")
from PIL import Image, ImageDraw, ImageFilter
import gx, frame
from gx import (S, F, text, tw, grad_text, outline_text, vertical_text, load,
                fit, ground, ellipse_pool, beam, rim_light, drop,
                floor_reflection, rounded)
from gx import (OBSIDIAN, GOLD, GOLD_HI, GOLD_DP, WHITE, PAPER, SOFT, DIMTX, RED)
from frame import M, BAR_TOP, finish

os.makedirs("/home/user/slides-v3/out", exist_ok=True)
SAPPHIRE = (26, 44, 82)
BRIGHT   = (255, 255, 255)      # cursive line 1
CHAMP_HI = (247, 199, 104)      # cursive line 2 — clearly distinct from line 1's white
SPECTXT  = (240, 236, 228)      # spec line — near-white, not the old muted grey
PATTERNS = ["Omnidirectional", "Wide Angle Cardioid", "Cardioid",
            "Hypercardioid", "Figure-8"]

def A(n): return load(n)

def cover(im, w, h, fx=0.5, fy=0.5):
    s = max(w/im.width, h/im.height)
    im = im.resize((max(w,int(im.width*s)), max(h,int(im.height*s))), Image.LANCZOS)
    x = int((im.width-w)*fx); y = int((im.height-h)*fy)
    return im.crop((x, y, x+w, y+h))

def base(seed=3, sapph=(0.02,0.26,1.02,1.15,0.95), gold=(1.02,0.42,1.30,1.35,1.15)):
    img = ground(OBSIDIAN)
    ellipse_pool(img, sapph[0], sapph[1], sapph[2], sapph[3], SAPPHIRE, sapph[4], 1.5)
    ellipse_pool(img, gold[0], gold[1], gold[2], gold[3], (120,78,20), gold[4], 1.4)
    ellipse_pool(img, 0.60, 0.94, 0.85, 0.30, (128,86,26), 0.70, 1.8)
    beam(img, 0.40, -0.12, 0.78, 0.58, 0.13, (70,50,20), 0.55, 180)
    beam(img, 0.20, -0.12, 0.44, 0.70, 0.05, (40,58,96), 0.45, 150)
    lay = Image.new('RGBA', (S,S), (0,0,0,0)); d = ImageDraw.Draw(lay)
    for i in range(0, S, 108):
        d.line([(i,0),(i,S)], fill=(255,255,255,6)); d.line([(0,i),(S,i)], fill=(255,255,255,6))
    img.alpha_composite(lay)
    return img

def edge(img, word, size=156, y=300, op=0.18):
    vertical_text(img, (8, y), word, F("BarlowC-800", size), GOLD, 18, op, 4, True)

def spec_line(img, xy, s, size=74):
    """Fraunces Italic, set large enough to run across the product. A soft dark
    shadow keeps it legible where it crosses bright chrome."""
    from gx import text_mask
    m, _ = text_mask(img.size, xy, s, F("FrauncesIt-600", size), 0.4)
    sh = Image.new('RGBA', img.size, (0,0,0,0))
    sh.putalpha(m.filter(ImageFilter.GaussianBlur(9)).point(lambda v: int(v*0.72)))
    img.alpha_composite(sh)
    text(img, xy, s, F("FrauncesIt-600", size), SPECTXT, 0.4)

def kicker(img, y, a, b, sub=None, cur=108, lead=106, subsz=38, subdy=82):
    """Subheading in Pinyon Script — the cursive the brief asks for — with the
    spec line in Space Grotesk, the closest free stand-in for Agrandir Tight."""
    rounded(img, [M, y, M+214, y+8], 4, fill=(198,42,46,255))
    text(img, (M, y+118), a, F("PinyonScript", cur), BRIGHT, 0)
    text(img, (M, y+118+lead), b, F("PinyonScript", cur), CHAMP_HI, 0)
    if sub:
        spec_line(img, (M, y+118+lead+subdy), sub, subsz)

def photo_panel(img, box, im, fx=0.5, fy=0.5, scrim_dir=None):
    x0,y0,x1,y1 = box
    c = cover(im.convert('RGBA'), x1-x0, y1-y0, fx, fy)
    img.alpha_composite(c, (x0,y0))
    if scrim_dir:
        import numpy as np
        w,h = x1-x0, y1-y0
        t = np.linspace(0,1,h if scrim_dir in 'tb' else w, dtype=np.float32)
        r = np.clip((t-0.35)/0.65,0,1)**1.4*0.92
        g = np.repeat(r[:,None],w,1) if scrim_dir=='b' else np.repeat(r[::-1][:,None],w,1)
        lay = Image.fromarray(np.dstack([np.full((h,w),6,np.uint8),np.full((h,w),6,np.uint8),
              np.full((h,w),8,np.uint8),(g*255).astype(np.uint8)]),'RGBA')
        img.alpha_composite(lay,(x0,y0))
    ImageDraw.Draw(img).rectangle([x0,y0,x1-1,y1-1], outline=(214,168,92,120), width=3)

# ===================================================================== 01
def s01():
    img = base()
    edge(img, "NEUMANN")
    grad_text(img, (M-18, 786), "TLM", F("BarlowC-800", 520), GOLD_HI, GOLD_DP,
              26, shadow=((0,0,0),44,20,0.55))
    outline_text(img, (M-18, 786), "TLM", F("BarlowC-800", 520), GOLD_HI, 3, 26, "ls", 0.34)
    NX, NF = (M-18, 1300), F("BarlowC-800", 780)
    grad_text(img, NX, "107", NF, WHITE, (150,142,130), 52, shadow=((0,0,0),44,22,0.55))
    mic = fit(A("cut_set_black_34.png"), h=1352)
    mx, my = S-M-mic.width+150, 250
    floor_reflection(img, mic, (mx,my), 0.34, 0.16, 16)
    drop(img, mic, (mx,my), blur=104, opacity=0.82, dy=58, spread=1.04)
    img.alpha_composite(rim_light(mic, GOLD_HI, 6, 0.66, 6), (mx,my))
    over = Image.new('RGBA',(S,S),(0,0,0,0))
    grad_text(over, NX, "107", NF, WHITE, (170,162,150), 52)
    img.alpha_composite(Image.blend(Image.new('RGBA',(S,S),(0,0,0,0)), over, 0.30))
    kicker(img, 1318, "Large-Diaphragm", "Studio Condenser",
           "Made in Germany  ·  Five polar patterns  ·  141 dB SPL",
           cur=112, lead=108, subsz=74, subdy=100)
    finish(img, "01_hero", marks=False)

# ===================================================================== 02
def s02():
    """Each finish on the ground that flatters it — the split is the idea."""
    img = base(gold=(1.02,0.42,1.20,1.30,1.05))
    edge(img, "FINISH")
    grad_text(img, (M-18, 700), "TWO", F("BarlowC-800", 470), GOLD_HI, GOLD_DP, 22,
              shadow=((0,0,0),40,18,0.5))
    NX, NF = (M-18, 1130), F("BarlowC-800", 470)
    grad_text(img, NX, "FINISHES", NF, WHITE, (150,142,130), 4, shadow=((0,0,0),40,18,0.5))
    for key, cx, lbl, col in (("cut_front_nickel.png", 0.36, "NICKEL", GOLD_HI),
                              ("cut_front_black.png",  0.74, "BLACK",  WHITE)):
        m = fit(A(key), h=1010)
        px, py = int(S*cx - m.width/2), 300
        drop(img, m, (px,py), blur=86, opacity=0.72, dy=46, spread=1.03)
        img.alpha_composite(rim_light(m, GOLD_HI, 5, 0.58, 5), (px,py))
        text(img, (S*cx, 1416), lbl, F("Archivo-800", 40), col, 9.0, "ms")
    over = Image.new('RGBA',(S,S),(0,0,0,0))
    grad_text(over, NX, "FINISHES", NF, WHITE, (170,162,150), 4)
    img.alpha_composite(Image.blend(Image.new('RGBA',(S,S),(0,0,0,0)), over, 0.26))
    kicker(img, 1428, "One Microphone,", "Two Characters.", cur=104, lead=100)
    spec_line(img, (960, 1600), "Nickel or Black  ·  Made in Germany", 62)
    finish(img, "02_two_finishes", marks=False)

# ===================================================================== 03
def s03():
    img = base(sapph=(0.02,0.20,0.90,1.05,0.75))
    edge(img, "PROVENANCE")
    photo_panel(img, (M, 240, S-M, 1040), A("macro_badge.png"), 0.46, 0.44, 'b')
    grad_text(img, (M-18, 1236), "MADE IN GERMANY", F("BarlowC-800", 218), GOLD_HI,
              GOLD_DP, 8, shadow=((0,0,0),38,17,0.5))
    text(img, (M, 1372), "Engraved On The Ring,", F("PinyonScript", 96), BRIGHT, 0)
    text(img, (M, 1464), "Not Printed On A Label.", F("PinyonScript", 96), CHAMP_HI, 0)
    spec_line(img, (M, 1600), "Neumann  ·  Berlin  ·  Made in Germany", 62)
    finish(img, "03_made_in_germany", marks=False)

# ===================================================================== 04
def s04():
    img = base(gold=(1.02,0.30,1.25,1.30,1.10))
    edge(img, "DIRECTIVITY")
    grad_text(img, (M-40, 1046), "5", F("BarlowC-800", 1000), GOLD_HI, GOLD_DP, 0,
              shadow=((0,0,0),50,24,0.5))
    outline_text(img, (M-40, 1046), "5", F("BarlowC-800", 1000), GOLD_HI, 4, 0, "ls", 0.22)
    panel = fit(A("cut_panel_black.png"), w=980)
    px, py = S-M-panel.width, 300
    drop(img, panel, (px,py), blur=88, opacity=0.76, dy=48, spread=1.03)
    img.alpha_composite(rim_light(panel, GOLD_HI, 5, 0.55, 5), (px,py))
    text(img, (M, 1196), "Five Polar Patterns,", F("PinyonScript", 96), BRIGHT, 0)
    text(img, (M, 1288), "One Microphone.", F("PinyonScript", 96), CHAMP_HI, 0)
    spec_line(img, (M, 1608), "Selected On The Body  ·  No Menu  ·  No Software", 58)
    x = S - M - 860
    for i, p in enumerate(PATTERNS):
        y = 1146 + i*84
        text(img, (x, y), f"{i+1:02d}", F("Archivo-800", 26), CHAMP_HI, 4.0)
        text(img, (x+80, y), p, F("Archivo-600", 42), BRIGHT, -0.3)
        ImageDraw.Draw(img).rectangle([x, y+26, S-M, y+27], fill=(255,255,255,46))
    finish(img, "04_five_patterns", marks=False)

# ===================================================================== 05
def s05():
    """The grille macro carries the whole frame as the background, with every
    element set on top of it. Scrims keep the type legible over the texture."""
    import numpy as np
    img = ground(OBSIDIAN)
    H = 1690                                   # texture runs to the contact bar
    tex = cover(A("tex_grille.png").convert('RGBA'), S, H, 0.5, 0.5)
    img.alpha_composite(tex, (0, 0))

    # left-weighted scrim for the copy, plus a soft floor and a top wash
    for direction, strength, extent in (('l', 0.86, 0.72), ('b', 0.70, 0.45), ('t', 0.60, 0.30)):
        t = np.linspace(0, 1, H if direction in 'tb' else S, dtype=np.float32)
        r = np.clip((t-(1-extent))/extent, 0, 1)**1.4 * strength
        if   direction == 'b': g = np.repeat(r[:, None], S, 1)
        elif direction == 't': g = np.repeat(r[::-1][:, None], S, 1)
        elif direction == 'l': g = np.repeat(r[::-1][None, :], H, 0)
        else:                  g = np.repeat(r[None, :], H, 0)
        lay = Image.fromarray(np.dstack([
            np.full((H, S), 6, np.uint8), np.full((H, S), 6, np.uint8),
            np.full((H, S), 9, np.uint8), (g*255).astype(np.uint8)]), 'RGBA')
        img.alpha_composite(lay, (0, 0))
    # a breath of gold so the frame is not flat black
    ellipse_pool(img, 0.82, 0.30, 0.80, 0.80, (72, 48, 14), 0.85, 1.7)

    edge(img, "RANGE", op=0.14)
    text(img, (M, 748), "Headroom At", F("PinyonScript", 116), BRIGHT, 0)
    text(img, (M, 862), "Both Ends.", F("PinyonScript", 116), CHAMP_HI, 0)

    for i, (v, u, k, c0, c1) in enumerate((("10", "dB-A", "SELF-NOISE", GOLD_HI, GOLD_DP),
                                           ("141", "dB", "MAXIMUM SPL", WHITE, (150,142,130)))):
        bx = M + i*964
        ImageDraw.Draw(img).rectangle([bx, 962, bx+760, 964], fill=(255,255,255,70))
        w = grad_text(img, (bx, 1330), v, F("BarlowC-800", 400), c0, c1, 6,
                      shadow=((0,0,0), 40, 18, 0.65))
        text(img, (bx+w+22, 1330), u, F("Archivo-500", 60), CHAMP_HI, 0.4)
        text(img, (bx+4, 1404), k, F("Archivo-800", 27), BRIGHT, 6.0)

    spec_line(img, (M, 1570), "153 dB With The −12 dB Pad  ·  20 Hz – 20 kHz", 62)
    finish(img, "05_dynamic_range", marks=False)

# ===================================================================== 06
def s06():
    img = base(gold=(1.02,0.46,1.25,1.32,1.12))
    edge(img, "BUILD")
    NX, NF = (M-18, 620), F("BarlowC-800", 330)
    grad_text(img, NX, "PRECISION", NF, GOLD_HI, GOLD_DP, 8, shadow=((0,0,0),40,18,0.5))
    m = fit(A("cut_xlr_base.png"), w=1140)
    px, py = S-M-m.width+130, 300
    drop(img, m, (px,py), blur=92, opacity=0.78, dy=50, spread=1.03)
    img.alpha_composite(rim_light(m, GOLD_HI, 6, 0.60, 6), (px,py))
    over = Image.new('RGBA',(S,S),(0,0,0,0))
    grad_text(over, NX, "PRECISION", NF, GOLD_HI, GOLD_DP, 8)
    img.alpha_composite(Image.blend(Image.new('RGBA',(S,S),(0,0,0,0)), over, 0.24))
    text(img, (M, 760), "To The Pin.", F("PinyonScript", 104), CHAMP_HI, 0)
    for i, (k, v) in enumerate((("WEIGHT","445 g"), ("DIAMETER × LENGTH","64 × 145 mm"),
                                ("PHANTOM POWER","48 V"), ("SENSITIVITY","11 mV/Pa"))):
        y = 940 + i*146
        text(img, (M, y), k, F("Archivo-800", 25), CHAMP_HI, 5.4)
        text(img, (M, y+74), v, F("Archivo-800", 56), BRIGHT, -0.4)
        ImageDraw.Draw(img).rectangle([M, y+102, M+740, y+103], fill=(255,255,255,46))
    spec_line(img, (M, 1620), "Made in Germany  ·  Gold-Plated Pins", 62)
    finish(img, "06_build", marks=False)

# ===================================================================== 07
def s07():
    img = base()
    edge(img, "IN USE")
    photo_panel(img, (M, 240, S-M, 1150), A("ctx_console.png"), 0.52, 0.40, 'b')
    grad_text(img, (M-18, 1352), "WHERE IT BELONGS", F("BarlowC-800", 206), GOLD_HI,
              GOLD_DP, 8, shadow=((0,0,0),34,15,0.5))
    text(img, (M, 1490), "In The Room That Matters.", F("PinyonScript", 96), BRIGHT, 0)
    spec_line(img, (M, 1620), "Tracking  ·  Broadcast  ·  Post", 62)
    finish(img, "07_in_the_studio", marks=False)

# ===================================================================== 08
def s08():
    img = base(gold=(1.02,0.38,1.22,1.30,1.08))
    edge(img, "INCLUDED")
    grad_text(img, (M-18, 560), "STUDIO SET", F("BarlowC-800", 300), GOLD_HI, GOLD_DP, 10,
              shadow=((0,0,0),40,18,0.5))
    text(img, (M, 690), "Microphone And EA 4.", F("PinyonScript", 92), CHAMP_HI, 0)
    mic = fit(A("cut_front_black.png"), h=670)
    px, py = int(S*0.30-mic.width/2), 776
    drop(img, mic, (px,py), blur=84, opacity=0.74, dy=44, spread=1.03)
    img.alpha_composite(rim_light(mic, GOLD_HI, 5, 0.56, 5), (px,py))
    ea = fit(A("cut_ea4_nickel.png"), h=470)
    qx, qy = int(S*0.72-ea.width/2), 900
    drop(img, ea, (qx,qy), blur=84, opacity=0.74, dy=44, spread=1.03)
    img.alpha_composite(rim_light(ea, GOLD_HI, 5, 0.56, 5), (qx,qy))
    for cx, num, nm in ((0.30,"01","TLM 107"), (0.72,"02","EA 4")):
        text(img, (S*cx, 1524), num, F("Archivo-800", 26), CHAMP_HI, 4.0, "ms")
        text(img, (S*cx, 1586), nm, F("Archivo-800", 50), BRIGHT, 1.0, "ms")
    spec_line(img, (M, 1664), "Microphone  ·  EA 4 Elastic Suspension", 54)
    finish(img, "08_studio_set", marks=False)

# ===================================================================== 09
def s09():
    img = base(gold=(1.05,0.50,1.20,1.28,1.05))
    edge(img, "SPEC")
    grad_text(img, (M-18, 500), "THE NUMBERS", F("BarlowC-800", 290), GOLD_HI, GOLD_DP, 8,
              shadow=((0,0,0),38,17,0.5))
    text(img, (M, 626), "Every Figure Verified.", F("PinyonScript", 92), CHAMP_HI, 0)
    mic = fit(A("cut_front_black_sq.png"), h=900)
    px, py = S-M-mic.width+70, 660
    drop(img, mic, (px,py), blur=90, opacity=0.70, dy=46, spread=1.03)
    img.alpha_composite(rim_light(mic, GOLD_HI, 5, 0.52, 5), (px,py))
    rows = (("Maximum SPL","141 dB"), ("With −12 dB pad","153 dB"), ("Self-noise","10 dB-A"),
            ("Frequency range","20 Hz – 20 kHz"), ("Polar patterns","5"),
            ("Pre-attenuation","0 / −6 / −12 dB"), ("Low-cut filter","Linear / 40 / 100 Hz"),
            ("Phantom power","48 V"), ("Sensitivity","11 mV/Pa"), ("Weight","445 g"),
            ("Diameter × length","64 × 145 mm"))
    w = 980
    for i,(k,v) in enumerate(rows):
        y = 760 + i*80
        text(img, (M, y), k, F("Archivo-500", 36), (226,222,214), 0.2)
        text(img, (M+w, y), v, F("Archivo-800", 36), BRIGHT, 0.6, "rs")
        ImageDraw.Draw(img).rectangle([M, y+24, M+w, y+25], fill=(255,255,255,40))
    finish(img, "09_specification", marks=False)

# ===================================================================== 10
def s10():
    img = base(sapph=(0.02,0.34,1.00,1.12,0.90))
    edge(img, "ENQUIRE")
    NX, NF = (M-18, 760), F("BarlowC-800", 400)
    grad_text(img, NX, "AVAILABLE", NF, GOLD_HI, GOLD_DP, 8, shadow=((0,0,0),42,20,0.55))
    grad_text(img, (M-18, 1100), "NOW", F("BarlowC-800", 400), WHITE, (150,142,130), 8,
              shadow=((0,0,0),42,20,0.55))
    mic = fit(A("cut_set_black_front.png"), h=1060)
    px, py = S-M-mic.width+230, 340
    drop(img, mic, (px,py), blur=100, opacity=0.72, dy=52, spread=1.04)
    img.alpha_composite(rim_light(mic, GOLD_HI, 6, 0.58, 6), (px,py))
    over = Image.new('RGBA',(S,S),(0,0,0,0))
    grad_text(over, NX, "AVAILABLE", NF, GOLD_HI, GOLD_DP, 8)
    img.alpha_composite(Image.blend(Image.new('RGBA',(S,S),(0,0,0,0)), over, 0.22))
    kicker(img, 1180, "The Neumann TLM 107", "Studio Set.",
           "Order Now From Shivansh Electronics, Kolkata.",
           cur=100, lead=98, subsz=62, subdy=96)
    finish(img, "10_enquire", marks=False)

if __name__ == "__main__":
    which = sys.argv[1:] or [str(i) for i in range(1,11)]
    for w in which: globals()[f"s{int(w):02d}"]()
