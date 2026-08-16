# Voiceover Script — Neumann TLM 107 Studio Set

**Reel:** one standalone 88-second vertical reel (1080×1920, 30 fps, 2,640 frames)
**Language:** English only
**Audio slot:** `public/vo/voiceover-reel.mp3` (currently a silent 88.000 s placeholder)

---

## Tone: Precise & Technical-but-Accessible, warmed at both ends

The creative brief's Section 9 offers three personas. This script uses the
**second — Precise and Technical-but-Accessible**, the voice of a confident,
spec-literate working engineer — as its spine, and borrows the **Warm and
Trustworthy** persona's consultative register for the opening and the close.

That blend, rather than either option alone:

- The reel's largest single block (22 of 88 seconds) is the five-pattern
  story, and the two strongest proof points are hard numbers — 141 dB against
  10 dB-A. Those land properly only in a voice that is comfortable being
  exact. Pure *Cinematic and Aspirational* would have to skate over them.
- But the buyer the brief profiles in Section 3 is a project-studio owner or
  independent voice artist weighing a serious purchase, not a spec-sheet
  reader. Opening and closing warm keeps the reel consultative rather than
  clinical, which is also what the fixed-price CTA needs: confident and
  inviting, never a hard sell.

**Delivery notes.** Unhurried but never slow — target **150–158 wpm**; the
script is written to that pace. Let the numbers breathe: land on *141* and
*10* and give each a beat afterwards. No upselling lift at the end of the
price line — state it plainly, as a fact, and let it sit.

---

## Timed script

Timestamps are the reel's own scene boundaries. Total word count **204**,
which at ~152 wpm is ~80 seconds of speech across 88 seconds of picture —
the remaining 8 seconds are deliberate silence at the marked pauses, where the
Layer 2 foley and the product visuals carry the beat alone.

---

### 0:00 – 0:08 · Hook — macro-to-reveal on the headgrille  *(8s · 18 words)*

> This is a Neumann TLM 107 Studio Set.
> *[pause 0.6s]*
> Made in Germany — and built to be the only microphone your session needs.

---

### 0:08 – 0:30 · Five polar patterns  *(22s · 55 words)*

> Most microphones commit to one polar pattern. This one gives you five.
> *[pause 0.5s]*
> Omnidirectional. Wide angle cardioid. Cardioid. Hypercardioid. Figure-8.
> *[pause 0.8s]*
> All of them stepped from a single navigation toggle on the rear — and all of
> them holding a balanced frequency response, so you tune the room out without
> ever changing the character of the source.

---

### 0:30 – 0:45 · Control and build quality  *(15s · 38 words)*

> Pattern, pre-attenuation and low-cut all live under one micro-joystick.
> *[pause 0.4s]*
> Which is how one instrument handles both extremes: a hundred and forty-one
> decibels of sound pressure at the top,
> *[pause 0.5s]*
> and a self-noise floor of just ten dB-A at the bottom.

---

### 0:45 – 1:00 · The Studio Set difference  *(15s · 34 words)*

> The Studio Set adds the EA 4 elastic suspension.
> *[pause 0.5s]*
> Floor vibration and structure-borne rumble are decoupled before they ever
> reach the capsule — so you are properly isolated from the very first take,
> with nothing else to buy.

---

### 1:00 – 1:15 · Heritage  *(15s · 33 words)*

> The tapered headgrille echoes the historic M 49.
> *[pause 0.6s]*
> Underneath it, an edge-terminated dual-diaphragm capsule and transformerless
> circuitry — twenty hertz to twenty kilohertz, in matte nickel or black.
> *[pause 0.4s]*
> The same instrument, either way.

---

### 1:15 – 1:28 · Price, Authorized Partner and website  *(13s · 26 words)*

> Shivansh Electronics, as Neumann's Authorized Partner, offers the TLM 107
> Studio Set at a Market Operating Price of one lakh forty-four thousand nine
> hundred rupees, inclusive of GST.
> *[pause 0.5s]*
> **For the best available price, visit www.shivanshelectronics.in.**

---

## Pronunciation

| Written | Say |
|---|---|
| TLM 107 | "T-L-M one-oh-seven" |
| EA 4 | "E-A four" |
| M 49 | "M forty-nine" |
| 141 dB | "a hundred and forty-one decibels" |
| 10 dB-A | "ten dB-A" (say the letters) |
| Figure-8 | "figure eight" |
| Rs. 1,44,900 | "one lakh forty-four thousand nine hundred rupees" |
| www.shivanshelectronics.in | "double-u double-u double-u dot shivansh electronics dot in" — or simply "shivansh electronics dot in" if the triple-w reads as clutter |

---

## Constraints this script observes

- **No captions.** These words are never rendered as on-screen typography. The
  reel's on-screen text is an independent hierarchy; nothing here is burned in.
- **No competing brand** is named — not another manufacturer, and not another
  microphone in Neumann's own catalogue. The M 49 appears once, as the
  documented design lineage of this instrument's headgrille, which is a
  statement about its own ancestry rather than a comparison with a product a
  viewer could buy instead.
- **No distributor, dealer or reseller language.** Shivansh Electronics is
  named only as Neumann's Authorized Partner.
- **No wooden box** and no packaging language of any kind. The Studio Set's
  confirmed contents are the microphone and the EA 4 shockmount; the brief's
  Section 4 marks the enclosure UNVERIFIED, so it is never mentioned.
- **One price, stated once**, at 1:15 — Rs. 1,44,900, always with the
  inclusive-of-GST qualifier. No rounding, no "starting from", no alternative
  figure, no urgency or discount framing.
- **Every technical figure is VERIFIED** in the brief's Section 4 master table:
  five polar patterns, 141 dB maximum SPL, 10 dB-A self-noise, 20 Hz–20 kHz,
  edge-terminated dual-diaphragm capsule, transformerless circuitry, EA 4
  shockmount, matte nickel and black finishes.
- **www.shivanshelectronics.in is the spoken destination**, matching the reel's
  on-screen emphasis. The long product-page URL is never read aloud.

---

## Recording notes

Replace the silent placeholder at `public/vo/voiceover-reel.mp3` with the
recorded take, then re-render:

```bash
npm run render
```

The take should be **88.000 s or shorter**. The composition is a fixed 2,640
frames and the voiceover track is placed at frame 0, so a longer file is
truncated rather than extending the reel. If a take runs long, trim the marked
pauses first — they are the intended slack.
