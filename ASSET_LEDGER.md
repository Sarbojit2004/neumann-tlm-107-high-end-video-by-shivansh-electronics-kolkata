# Asset Ledger — Neumann TLM 107 Studio Set reel

Every image in this repository, what it actually shows, and where it appears
in the 88-second reel. Generated and enforced by `npm run coverage`, which
fails the build if any image goes unplaced.

---

## 1. Count: 55 images, not 57

The creative brief's Section 11 states "the 57 supplied images". **The
repository contains 55.** Enumerated from the git index — not a paginated web
view — and cross-checked by extension:

```
git ls-files | wc -l                 → 67 tracked files
  55  images   (40 .jpg + 15 .png)
   2  logo files (excluded from the reel by design, exempt from coverage)
   2  brief      (Neumann TLM 107 Video Brief.docx / .pdf)
   6  sound-effects/
   2  README.md, .gitignore
```

This discrepancy is **not silently reconciled**. The reel is built against the
55 files that exist. If two images were intended and never uploaded, they are
genuinely absent from the repository and can be added later.

**No video files** are present, as anticipated.

**Duplicates.** No exact MD5 duplicates. Perceptual hashing found three
same-shot pairs at different resolutions:

| High-res | Low-res twin | Distance |
|---|---|---|
| `NEUMANN TLM 107 IMAGE-1 (22).jpg` | `NEUMANN TLM 107 IMAGE-1 (4).jpg` | 0 |
| `NEUMANN TLM 107 IMAGE-1 (23).jpg` | `NEUMANN TLM 107 IMAGE-1 (5).jpg` | 2 |
| `NEUMANN TLM 107 IMAGE-1 (24).jpg` | `NEUMANN TLM 107 IMAGE-1 (6).jpg` | 0 |

Both copies of each pair still appear, but never adjacently: the high-resolution
copy carries the beat and the low-resolution twin is placed in the S5 montage
strip, where it reads as deliberate repetition rather than a mistake.

Two further pairs the hash flagged are **not** duplicates — they are the
nickel/black **Finish Split** pairs (identical pose, opposite finish), which the
reel uses as an asset: `nickel-front`↔`black-front` and `nickel-tall`↔`black-tall`.

---

## 2. The repository is a mixed Neumann catalogue, not 55 TLM 107 photographs

Every file was opened and inspected rather than classified by filename. The set
splits three ways.

### Tier A — TLM 107 / EA 4 Studio Set (31 images)

Shown as real product content in the primary safe area, with the full camera
language applied. Includes the strongest material in the repository: both rear
navigation interfaces (nickel and black, showing the pad LEDs, the joystick,
the lin/40/100 Hz filter and all five printed pattern icons), the factory-labelled
navigation-switch diagram, a measured polar-response plot, four high-quality
macros, and the EA 4 shockmount alone in both finishes.

### Tier B — a wooden presentation box is visible (5 images)

`1d1485b8…jpg`, `NEUMANN TLM 107 IMAGE-1 (12).jpg`, `bdd21387…jpg`,
`c83d63e9…jpg`, `image_4p3AAAABZ.jpg`.

The Studio Set does not include a wooden box — the brief's Section 4 marks the
enclosure UNVERIFIED and Neumann's own order information lists the Studio Set as
the microphone plus the EA 4. One of these (`c83d63e9…jpg`) is a **closed box
with no microphone in frame at all**.

### Tier C — not a TLM 107 (19 images)

A TLM 103 (body-labelled), U 87 Ai in both finishes, M 149, U 67 with power
supply, NDH headphones ×2, KH monitor speakers ×3, a KH subwoofer, an MCM clip
mic, an MA 1 alignment kit, a miniature hanging mic, and several unidentifiable
frames.

### How Tier B and C are handled

Showing either tier as identified product content would break rules the project
states as non-negotiable: no wooden box anywhere, no comparison against other
microphones **including Neumann's own catalogue**, and no manufactured
multi-SKU or ecosystem narrative.

They are therefore reduced to **ambient texture plates** by
`scripts/prep_media.py`:

1. any wooden-box region is **cropped away first**, before anything else;
2. the frame is defocused twice, desaturated to 10%, and blended 78% into the
   paper ground until no product silhouette survives;
3. the result is composited **only** into the non-critical top (0–250 px) and
   bottom (1580–1920 px) safe-zone bands, scaled far past the band, blurred
   again, masked to a fade, and cross-faded across the scene.

They are never identified, never narrated, never in the primary safe area, and
never carry a product claim. The reel therefore covers all 55 files without
implying a catalogue or an ecosystem.

---

## 3. Treatment distribution

| Treatment | Count | What it is |
|---|---:|---|
| **HERO-REVEAL** | 3 | Full Macro-to-Full-Reveal: extreme macro with simulated shallow DOF, dolly-style pull back as focus expands, resolving to the complete uncropped product, then a slow interactive hold. 35 % macro / 65 % reveal-and-hold per brief Section 6. |
| **INTERFACE** | 2 | Interface Sequence: slow dolly-push toward the chrome ring while glowing highlights step across the microphone's **own printed** pattern icons — Omni → Wide Cardioid → Cardioid → Hypercardioid → Figure-8. |
| **FLEX** | 3 | Suspension Flex: damped rotational pivot around the central axis, drawing attention to the EA 4's elastic bands. |
| **GIMBAL** | 23 | Gimbal Micro-Movement: continuous sub-pixel scale creep plus incommensurate X/Y drift, so static photography feels physically alive. |
| **AMBIENT** | 24 | Dissolved texture plate, non-critical zones only. |

Images receiving the full HERO-REVEAL: `macro-grille` (S1 opening hook),
`macro-xlr` (S3), `macro-badge-lo2` (S6 close).

**The complete product is always shown fully and legibly at some point during
every image's screen time.** Every camera primitive resolves through scale 1.0
with zero offset — no image is ever left permanently cropped or clipped.

---

## 4. Scene-by-scene placement

Timing follows the brief's Section 12 allocation for the 88-second reel exactly.

| Scene | Frames | Time | Images |
|---|---|---|---|
| **S1 Hook** | 0–240 | 0:00–0:08 | `macro-grille` → `nickel-front` |
| **S2 Patterns** | 240–900 | 0:08–0:30 | `rear-nickel`, `polar-diagram`, `rear-black`, `nickel-tall`, `black-front` |
| **S3 Control** | 900–1350 | 0:30–0:45 | `nav-labelled`, `rear-black-ang`, `macro-xlr`, `nickel-swivel`, `nickel-patchbay` |
| **S4 Studio Set** | 1350–1800 | 0:45–1:00 | `ea4-nickel`, `ea4-black`, `ea4-exploded`, `black-ea4-a`, `nickel-stand`, `black-ea4-b`, `black-ea4-sm` |
| **S5 Heritage** | 1800–2250 | 1:00–1:15 | `studio-sepia`, `black-dark`, `room-real`, `macro-badge-blk`, `mesh-abstract`, `nickel-tall`, `black-tall`, `macro-badge-ang`, `macro-badge-lo`, `rear-black-lo`, `rear-black-sm` |
| **S6 CTA** | 2250–2640 | 1:15–1:28 | `macro-badge-lo2`, `nickel-front`, `black-front`, `nickel-angled` |

Ambient plates are distributed four per scene (two top, two bottom),
cross-fading across each scene's duration: 6 × 4 = 24.

---

## 5. Audio

**Layer 1 — fixed, pre-supplied, unmodified.**
`sound-effects/ES_Moment - Christoffer Moe Ditlevsen.mp3`, 252.168 s, 48 kHz
stereo. Only trimmed to 88 s with a constant −15 dB gain and end fades; its
composition is never edited, layered over or replaced. Because the source runs
252 s it is **never looped**. `scripts/audit_audio.py` re-verifies this
numerically on every run by undoing the documented gain and correlating a
mid-section against the source (measured **r = 0.99978**).

The folder also contains four **stems** of that same track and a **1-byte
placeholder** named `sfx music`. The brief describes one pre-supplied file;
the full mix is that file, and the stems are left unused.

**Layer 2 — 13 cues, synthesised from scratch** by `scripts/gen_audio.py` with
numpy/scipy. No ElevenLabs, no external audio service, nothing from the video
toolkit's bundled SFX tooling. Per brief Section 10 the palette is deliberately
narrow and high-frequency; the audit **fails any cue putting more than 8 % of
its energy below 300 Hz**, which is what would muddy Layer 1. Measured: every
cue is at **0.0–1.0 %**.

| Group | Cues |
|---|---|
| Damped mechanical clicks (navigation toggle) | `toggle-click`, `toggle-click-soft`, `led-step` |
| Metallic grille resonances (transitions) | `grille-tap`, `grille-tap-hi`, `grille-tap-lo`, `grille-shimmer` |
| Thick rubber elasticity (EA 4 suspension) | `rubber-stretch`, `rubber-settle` |
| Optical / editorial marks | `focus-settle`, `finish-wipe`, `spec-mark`, `outro-chime` |
