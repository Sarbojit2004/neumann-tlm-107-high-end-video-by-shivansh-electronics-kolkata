# Neumann TLM 107 — 10-slide square campaign

Ten 1:1 slides for the Neumann TLM 107 Studio Set, presented by Shivansh
Electronics, Kolkata — Neumann's Authorized Partner.

| | |
|---|---|
| Canvas | 2160 × 2160 px, tagged 300 DPI (7.2 in square) |
| Format | PNG (crisp logo/type edges, no JPEG ringing) |
| Typefaces | Inter (200–900) and JetBrains Mono (400–800) — two families total |
| Palette | Sampled from the product photography, not invented |

## The ten

| # | File | Concept |
|---|---|---|
| 01 | `01_hero_launch.png` | Opening statement — the name at display scale |
| 02 | `02_form_two_finishes.png` | Nickel and black elevations as a diptych |
| 03 | `03_made_in_germany.png` | Provenance — the badge macro, full bleed |
| 04 | `04_five_patterns.png` | The five polar patterns, printed on the ring |
| 05 | `05_headroom_and_silence.png` | Dynamic range — 10 dB-A and 141 dB |
| 06 | `06_engineered_detail.png` | Build — the connector, serial, engraved ring |
| 07 | `07_in_the_studio.png` | Context — the microphone at the console |
| 08 | `08_the_studio_set.png` | What's included: microphone and EA 4 |
| 09 | `09_specification.png` | The verified figures, as a table |
| 10 | `10_enquire.png` | Close — contact foregrounded |

## Branding block

Every slide carries the same block, drawn once by `build/lib/brandblock.py`:
both logos, the authorized-partner line, the primary URL, the Facebook,
Instagram and YouTube handles, and all three WhatsApp numbers grouped as one
cluster under a single glyph. Social icons are the client's own supplied
assets from `all-icons/`, reduced to single-tone glyphs in the palette rather
than their multicolour brand versions.

## Content discipline

Every technical figure is VERIFIED in `src/lib/copy.ts` against the brief's
Section 4 master table, and the pad values, filter values and five pattern
icons are independently corroborated by the control-panel photography. Two
repo rules are honoured throughout: no wooden presentation box is shown or
implied (the Studio Set enclosure is marked UNVERIFIED), and no other
microphone — including Neumann's own catalogue — appears. No price is shown.

## Rebuild

```bash
pip install Pillow numpy scipy fonttools brotli
python3 build/lib/prep.py     # icon glyphs + reversed logos
python3 build/slides.py       # all ten
```
