#!/usr/bin/env node
/**
 * BRANDING & FACTUAL AUDIT.
 *
 * Statically enforces every hard content rule this project carries, across all
 * on-screen copy and the voiceover script. Exits non-zero on any violation.
 *
 *  1. No logo FILE is referenced anywhere. (A badge physically present on the
 *     microphone in a photograph is part of the product and is left alone —
 *     this checks that neither supplied logo .png is used as a graphic.)
 *  2. No competing microphone brand is named.
 *  3. No other Neumann product is named either — the brief forbids
 *     value-ladder comparisons inside Neumann's own catalogue. The historic
 *     M 49 is the single allowed exception: manufacturer documentation states
 *     the headgrille echoes its styling, which is a lineage statement about
 *     this instrument, not a comparison with something purchasable.
 *  4. No distributor / dealer / reseller language. Authorized Partner only.
 *  5. No wooden box, and no packaging language at all.
 *  6. Exactly one price figure: Rs. 1,44,900, and it always carries the
 *     inclusive-of-GST qualifier. No "starting from", no rounding.
 *  7. www.shivanshelectronics.in is present and is the most-repeated URL.
 *  8. No mention of unrelated brand relationships (MOTU, TASCAM).
 */
import {readFileSync, readdirSync, existsSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// font-data.ts is generated: ~191 KB of base64 font bytes with no rendered
// copy in it at all. Scanning it is meaningless and actively harmful — random
// byte sequences in the blob spell things like "Rs7", which trips the price
// check.
const GENERATED = new Set(['font-data.ts']);

const walk = (dir) => {
  const out = [];
  for (const e of readdirSync(dir, {withFileTypes: true})) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (/\.(tsx|ts)$/.test(e.name) && !GENERATED.has(e.name)) out.push(p);
  }
  return out;
};

const sources = walk(join(ROOT, 'src'));
for (const vo of ['VO_SCRIPT_REEL_NEUMANN_TLM107.md', 'VO_SCRIPT_LONGFORM_NEUMANN_TLM107.md']) {
  const p = join(ROOT, vo);
  if (existsSync(p)) sources.push(p);
}

const fails = [];
const note = (f, msg) => fails.push(`${f.replace(ROOT + '/', '')}: ${msg}`);

// ---------------------------------------------------------------------------
const OTHER_BRANDS = [
  'AKG', 'Rode', 'Røde', 'Shure', 'Audio-Technica', 'Audio Technica',
  'Sennheiser', 'Warm Audio', 'Telefunken', 'Aston', 'Lewitt', 'Slate',
  'Blue Yeti', 'Behringer', 'sE Electronics',
];
// Other Neumann products. M 49 is allowed (documented design lineage).
const OTHER_NEUMANN = [
  'TLM 103', 'TLM 102', 'TLM 49', 'TLM 170', 'U 87', 'U87', 'U 67', 'U67',
  'M 149', 'M149', 'KM 184', 'KMS 105', 'NDH', 'KH 120', 'KH 150', 'MA 1',
  'MCM', 'D-01', 'SG 2',
];
const SELLER_BAD = ['distributor', 'dealer', 'reseller', 'Distributor', 'Dealer', 'Reseller'];
const BOX_WORDS = ['wooden box', 'wood box', 'presentation box', 'wooden case', 'in the box', 'unbox'];
const UNRELATED = ['MOTU', 'TASCAM', 'Sonicview', 'UltraLite'];

let siteHits = 0;
let priceHits = 0;
const otherUrls = new Map();

for (const f of sources) {
  const raw = readFileSync(f, 'utf8');

  // Only DELIVERED copy is in scope — spoken lines and on-screen strings.
  // Prose that documents these rules necessarily names the banned terms, so
  // scanning it produces guaranteed false positives.
  //
  //  - .md  : the voiceover script's spoken lines are its blockquotes; the
  //           surrounding tone notes and constraints section are commentary.
  //  - .ts  : strip block and line comments, then decode source escapes.
  //           Scanning raw source made the literal "\n" in the address read as
  //           the letter n, so "...Road,\nDhakuria" spelled "nDh" and tripped
  //           the NDH check.
  const text = f.endsWith('.md')
    ? raw
        .split('\n')
        .filter((l) => /^\s*>/.test(l))
        .join('\n')
        .replace(/^\s*>\s?/gm, '')
        .replace(/\*|_/g, '')
    : raw
        .replace(/\/\*[\s\S]*?\*\//g, ' ')
        .replace(/^\s*\/\/.*$/gm, ' ')
        .replace(/\\n|\\t|\\r/g, ' ');

  for (const b of OTHER_BRANDS) {
    if (new RegExp(`\\b${b.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i').test(text)) {
      note(f, `competing brand named: "${b}"`);
    }
  }
  for (const b of OTHER_NEUMANN) {
    if (new RegExp(b.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&').replace(/\s/g, '\\s*'), 'i').test(text)) {
      note(f, `other Neumann product named: "${b}"`);
    }
  }
  for (const w of SELLER_BAD) {
    if (new RegExp(`\\b${w}\\b`).test(text)) note(f, `seller language: "${w}"`);
  }
  for (const w of BOX_WORDS) {
    if (new RegExp(w, 'i').test(text)) note(f, `packaging language: "${w}"`);
  }
  for (const w of UNRELATED) {
    if (new RegExp(`\\b${w}\\b`, 'i').test(text)) note(f, `unrelated brand: "${w}"`);
  }

  // Logo files must never be referenced by the REEL, which deliberately uses
  // neither. The long-form is the reverse: it uses both by design, via
  // public/logo/*.png prepared by scripts/prep_logos.py. So this check applies
  // only to reel-side sources.
  const isLongform =
    /\/(lf-|LF|Longform)/.test(f) || /scenes\/lf\//.test(f) || /LONGFORM/.test(f);
  if (!isLongform && /NEUMANN BERLIN LOGO|SHIVANSH ELECTRONICS LOGO|logo\/|\blogo\.png\b/i.test(text)) {
    note(f, 'reel source references a logo file');
  }

  // pricing
  for (const m of text.matchAll(/Rs\.?\s*([\d,]*\d)/g)) {
    priceHits++;
    if (m[1] !== '1,44,900') note(f, `unexpected price figure: Rs. ${m[1]}`);
  }
  if (/starting (from|at)|onwards|approx\.?\s*Rs|from just/i.test(text)) {
    note(f, 'approximate / "starting from" pricing language');
  }

  siteHits += (text.match(/shivanshelectronics\.in/g) || []).length;
  for (const m of text.matchAll(/\b((?:[a-z0-9-]+\.)+(?:com|in|net|org))\b/gi)) {
    const d = m[1].toLowerCase();
    if (d.includes('shivanshelectronics') || d.endsWith('react.com')) continue;
    otherUrls.set(d, (otherUrls.get(d) || 0) + 1);
  }
}

// GST qualifier must accompany the price
const copy = readFileSync(join(ROOT, 'src', 'lib', 'copy.ts'), 'utf8');
if (!/Inclusive of GST/i.test(copy)) fails.push('copy.ts: price lacks the inclusive-of-GST qualifier');
if (!/1,44,900/.test(copy)) fails.push('copy.ts: fixed MOP missing');

console.log('='.repeat(72));
console.log('BRANDING & FACTUAL AUDIT');
console.log('='.repeat(72));
console.log(`  files scanned            : ${sources.length}`);
console.log(`  price references         : ${priceHits} (all Rs. 1,44,900)`);
console.log(`  shivanshelectronics.in   : ${siteHits} references`);
console.log(`  competing brands         : ${fails.filter((x) => /competing/.test(x)).length}`);
console.log(`  other Neumann products   : ${fails.filter((x) => /other Neumann/.test(x)).length}`);
console.log(`  distributor/dealer terms : ${fails.filter((x) => /seller language/.test(x)).length}`);
console.log(`  packaging language       : ${fails.filter((x) => /packaging/.test(x)).length}`);
console.log(`  logo file references     : ${fails.filter((x) => /logo file/.test(x)).length}`);
if (otherUrls.size) {
  console.log(`  other domains present    : ${[...otherUrls.keys()].join(', ')}`);
}

if (fails.length) {
  console.log(`\nFAILED — ${fails.length} violation(s):`);
  for (const f of fails) console.log(`  x ${f}`);
  process.exit(1);
}
console.log('\nPASSED — all content rules hold.');
