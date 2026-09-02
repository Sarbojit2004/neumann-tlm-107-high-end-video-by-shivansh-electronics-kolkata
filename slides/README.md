# Neumann TLM 107 — 10-slide square campaign

Ten 1:1 slides for the Neumann TLM 107 Studio Set, presented by Shivansh
Electronics, Kolkata — Neumann's Authorized Partner.

| | |
|---|---|
| Canvas | 2160 × 2160 px, tagged 300 DPI (7.2 in square) |
| Format | PNG (crisp logo/type edges, no JPEG ringing) |
| Typefaces | Archivo (300–900) and Fraunces (300–800) — the MOTU M-Series repo's own system |
| Ground | Warm beige stock ruled as a spreadsheet, 54 px cells, heavier rule every 6 |
| Marks | Real logos and real brand-colour icons — nothing recoloured or redrawn |

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

Every slide carries the same block, drawn once by `build/lib/brandblock2.py`:
both logos in their true colours, the authorized-partner line, the primary
URL, the social handles in the fixed order **YouTube, Instagram, Facebook,
LinkedIn**, and all three WhatsApp numbers grouped as one cluster under a
single glyph. Every icon is the client's own asset from `all-icons/` at full
brand colour; only the white carrier plate (logos) or the painted checkerboard
(website icon) is keyed away.

### Contrast

Text tones were measured against the beige ground, not guessed:

| Token | Use | Ratio on beige |
|---|---|---|
| `INK` #1A1815 | headlines, figures | 14.6:1 |
| `INK2` #4A443B | body, secondary | 7.9:1 |
| `MUTED` #6E6659 | small labels | 4.7:1 |
| `RED` #A6272C | accent type | 5.9:1 |
| `ORANGE` #E68B0C | **graphic accent only** — rules and ticks, never text | 2.0:1 |

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
python3 build/lib/prep2.py    # colour logos + colour icons
python3 build/slides2.py      # all ten
```

Fonts are vendored under `build/fonts/` as static instances of the Archivo and
Fraunces variable faces from the MOTU M-Series repository's `_shared/fonts/`.
