# Neumann TLM 107 — 10-slide square campaign

Ten ultra-premium 1:1 posters for the Neumann TLM 107 Studio Set, presented by
Shivansh Electronics, Kolkata.

| | |
|---|---|
| Canvas | 2160 × 2160 px, tagged 300 DPI (7.2 in square) |
| Format | PNG |
| Ground | Obsidian, lit with a sapphire fill and a gold key, plus light beams |

## The ten

| # | File | Concept |
|---|---|---|
| 01 | `01_hero.png` | Opening — the name at display scale, product cutting through it |
| 02 | `02_two_finishes.png` | Nickel and black, side by side |
| 03 | `03_made_in_germany.png` | Provenance — the badge macro |
| 04 | `04_five_patterns.png` | The five polar patterns, printed on the ring |
| 05 | `05_dynamic_range.png` | Full-bleed grille macro, everything set on top |
| 06 | `06_build.png` | The connector, serial and engraved ring |
| 07 | `07_in_the_studio.png` | The microphone at the console |
| 08 | `08_studio_set.png` | What's included: microphone and EA 4 |
| 09 | `09_specification.png` | The verified figures |
| 10 | `10_enquire.png` | Close — contact foregrounded |

## Type

| Role | Face |
|---|---|
| Display | Barlow Condensed ExtraBold (from the MOTU M-Series repo) |
| Subheading | Pinyon Script — Title Case, two colours per pair |
| Supporting line | Fraunces Italic 600, set large enough to cross the product |
| Contact + labels | Archivo (from the MOTU M-Series repo) |

`SpaceGrotesk.ttf` is vendored as the stand-in for **Agrandir Tight**, which is
a commercial Pangram Pangram face and is not bundled here. Drop a licensed
Agrandir into `build/fonts/` and change the family name in `spec_line()` to
swap it in.

## Contact block

Drawn once by `build/lib/frame.py` and identical on every slide: the primary
URL, the four social handles in the fixed order **YouTube, Instagram, Facebook,
LinkedIn**, and all three WhatsApp numbers grouped under a single glyph. Every
icon is the client's own asset from `all-icons/` at full brand colour; only the
website glyph is tinted white, because its artwork is black and would vanish on
the dark bar.

Sizes are the largest that keep every line unwrapped in its column — website 58,
handles 46 (bold), numbers 42 — measured rather than estimated.

**The two logo areas are intentionally left blank** (`marks=False`), reserved at
fixed positions so branding can be added downstream without moving the contact
block.

## Content discipline

Every technical figure is VERIFIED in `src/lib/copy.ts` against the brief's
Section 4 master table. No wooden presentation box, no other microphone, and no
price appears anywhere.

## Rebuild

```bash
pip install Pillow numpy scipy fonttools brotli
python3 build/lib/prep2.py    # colour logos + colour icons
python3 build/build.py        # all ten
python3 build/build.py 5      # a single slide
```

### One implementation note

Cutouts are trimmed to their alpha bounding box, so opaque pixels touch every
edge. Blurring a shadow inside a sprite-sized layer makes PIL edge-extend and
then clip the falloff at the layer boundary, painting a hard rectangle the width
of the sprite. `gx._blurred_alpha()` pads the canvas by 3× the blur radius so
the falloff completes inside the layer.
