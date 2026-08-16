# Neumann TLM 107 Studio Set — 88-second reel

A single standalone vertical reel for the Neumann TLM 107 Studio Set, built
with Remotion. **1080×1920, 30 fps, exactly 2,640 frames (88.000 s).**

Presented by **Shivansh Electronics — Neumann's Authorized Partner**, Kolkata.

| Deliverable | Path |
|---|---|
| Final render | `out/neumann-tlm107-reel.mp4` |
| Portrait thumbnail | `thumbnails/thumbnail-neumann-tlm107-reel.png` |
| Voiceover script | `VO_SCRIPT_REEL_NEUMANN_TLM107.md` |
| Asset ledger (all 55 images) | `ASSET_LEDGER.md` |
| Reproducible project zip | `neumann-tlm107-reel-project.zip` |

---

## Reproduce the render

Requires **Node 18+**, **Python 3.9+** and **ffmpeg** on `PATH`.

```bash
npm install
pip install numpy scipy Pillow

npm run bootstrap      # prepare all 55 images + build the two-layer audio bed
npm run render         # → out/neumann-tlm107-reel.mp4
node scripts/finalize.mjs   # hard-trim the container to exactly 88.000 s
```

`npm run bootstrap` is `prep_media.py` followed by `gen_audio.py` +
`audit_audio.py`. Both write into `public/`, which is gitignored — the pipeline
is fully reproducible from the repository's source images and the supplied
audio file.

Preview interactively with `npm run studio`.

### Environments without a downloadable Chrome

`remotion.config.ts` points Remotion at a system Chromium when one is present
(this repo was built in an environment where Remotion's own Chrome Headless
Shell download is blocked). Override with `REMOTION_BROWSER=/path/to/chrome`.
Everywhere else Remotion uses its managed browser as normal.

---

## Validation

Every check below is a script, and every one is expected to pass.

```bash
npm run typecheck     # tsc --noEmit
npm run bundlecheck   # bundles + asserts 1080x1920 @30fps, 2640 frames
npm run media         # re-prepares images, asserts all 55 accounted for
npm run audio         # rebuilds + audits the two audio layers
npm run coverage      # asserts all 55 images reach the reel; reports treatment
npm run branding      # asserts every content rule holds
npm run stills        # renders checkpoint frames to stills/ for visual review
npm run verify        # probes the finished MP4 on disk
```

**`npm run coverage`** maps each of the 55 images to the scene it appears in and
the camera treatment it received, and fails if anything is unplaced.

**`npm run branding`** statically enforces: no logo file referenced anywhere; no
competing microphone brand; no other Neumann product (the historic M 49 is the
one allowed exception — documented design lineage, not a purchasable
comparison); no distributor/dealer/reseller language; no wooden box and no
packaging language at all; exactly one price figure, always carrying the
inclusive-of-GST qualifier.

**`npm run audio`** confirms Layer 1 is compositionally unmodified (by undoing
the documented gain and correlating against the source) and that every Layer 2
cue decodes, is unclipped, and keeps ≤ 8 % of its energy below 300 Hz.

---

## How it is built

```
src/
  Root.tsx            compositions: Reel (2640f) + Thumbnail (1f)
  Reel.tsx            scene assembly + the whole audio bed
  Thumbnail.tsx       1080x1920 portrait thumbnail
  scenes/             S1Hook · S2Patterns · S3Control · S4StudioSet · S5Heritage · S6Cta
  components/
    Stage.tsx         light ground, safe-zone Bands, ambient plate bands, grid
    Media.tsx         Shot / GimbalShot / RevealShot / FlexShot
    Diagram.tsx       polar diagram, LED ring overlay, nav toggle, heritage motif
    Type.tsx          Display · Kicker · Sub · Body · Spec · Micro · KineticLine
    Cue.tsx           Layer 2 cue placement
  lib/
    theme.ts          palette, safe-zone geometry, layout bands, scene table
    anim.ts           the four camera primitives + crossfade helpers
    images.ts         the 31 product frames and 24 ambient plates
    copy.ts           every on-screen string
    sfx.ts            the 13 synthesised cues + the fixed bed
    fonts.ts          base64-inlined face registration
scripts/
  prep_media.py       classifies + prepares all 55 images
  gen_audio.py        trims Layer 1; synthesises all of Layer 2
  audit_audio.py      validates the two-layer pipeline
  embed_fonts.py      regenerates src/lib/font-data.ts
  coverage.mjs        asset-coverage ledger
  branding_audit.mjs  content-rule enforcement
  bundlecheck.mjs     bundler + composition check
  stills.mjs          checkpoint still renders
  verify_render.mjs   probes the finished MP4
  finalize.mjs        hard-trims the container to 88.000 s
```

### Format

Light background throughout all 88 seconds, with Instagram safe-zone geometry:

| Zone | Pixels | Rule |
|---|---|---|
| Top | 0–250 | ambient only |
| **Primary safe area** | **250–1580** | all headlines, hero, specs, CTA |
| Bottom | 1580–1920 | ambient only |
| Side margins | 72 px each | nothing critical outside |

Scenes compose out of explicit, non-overlapping **layout bands** declared once
in `theme.ts`. That is deliberate: the first layout pass positioned headlines
relative to the bottom of the safe area while placing media relative to its
top, and dark type landed on dark photographs in three scenes. Canvas-absolute
bands make that class of collision impossible.

### Typography

Ported structurally from the completed TASCAM Sonicview reel project (itself
inherited from the MOTU UltraLite-mk5 / 828 reel): **Barlow Condensed
600/700/800** for display, **Inter** variable for UI and body, **JetBrains
Mono** variable for technical figures. The woff2 files are copied verbatim.
Only the colour values are re-derived — the source projects were light-on-dark,
this is dark-on-light.

Every text token's contrast against the paper ground was computed, not
estimated (WCAG AA floor 4.5:1):

| Token | Hex | Ratio |
|---|---|---|
| `ink` (headlines) | `#0B1016` | 17.33:1 |
| `inkSoft` (body) | `#2C3947` | 10.69:1 |
| `inkDim` (micro) | `#4E5C6E` | 6.19:1 |
| `accent` (crimson) | `#9C1218` | 7.58:1 |
| `steel` (interface) | `#0D4A72` | 8.51:1 |

### Camera language

Four primitives in `lib/anim.ts`, per the brief's Section 7 — Gimbal
Micro-Movement, Interface Sequence, Suspension Flex, and Macro-to-Full-Reveal,
plus the Finish Split wipe. All resolve through scale 1.0, so the complete
product is always shown fully and legibly during every image's screen time.

### Sound

Two strictly separated layers. Layer 1 is the supplied background texture, used
unmodified. Layer 2 is 13 cues synthesised from scratch with numpy/scipy —
damped mechanical clicks, thin metallic grille resonances, and tight rubber
elasticity — deliberately high-frequency so nothing competes with Layer 1.
See `ASSET_LEDGER.md` §5.

`public/vo/voiceover-reel.mp3` is a **silent 88.000 s placeholder**. Drop the
recorded narration in at that path and re-render.

---

## Content rules

Enforced by `npm run branding`, not just by convention:

- **One price, stated plainly:** Market Operating Price **Rs. 1,44,900,
  inclusive of GST**. No rounding, no "starting from", no second figure, no
  urgency or discount framing — paired with an invitation to the website for
  the best available price.
- **www.shivanshelectronics.in** is the primary, most-repeated on-screen URL.
  The long product-page URL appears once as a supporting line and is never read
  aloud.
- **Shivansh Electronics is Neumann's Authorized Partner.** The words
  distributor, dealer and reseller appear nowhere.
- **No logos in the reel.** Both logo files are in the repository and are
  deliberately unused — they are added by hand afterwards. Badges physically
  present on the microphone in a photograph are part of the product and are
  left untouched.
- **No wooden box, and no packaging language at all.** The brief's Section 4
  marks the Studio Set enclosure UNVERIFIED; its confirmed contents are the
  microphone and the EA 4 shockmount.
- **No comparisons** with any other microphone brand, or with any other
  microphone in Neumann's own catalogue. The historic M 49 appears once, as the
  documented design lineage of this instrument's headgrille.
- **Every technical figure is VERIFIED** in the brief's Section 4 master table.
