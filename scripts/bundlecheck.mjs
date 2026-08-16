#!/usr/bin/env node
/**
 * Bundles the project exactly as the renderer will, and confirms the
 * composition list resolves with the expected geometry and length.
 *
 * Catches import cycles, missing static assets and composition-registration
 * mistakes before a 2,640-frame render is attempted.
 */
import {bundle} from '@remotion/bundler';
import {getCompositions} from '@remotion/renderer';
import {existsSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const browser = [
  process.env.REMOTION_BROWSER,
  '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
].find((p) => p && existsSync(p));

console.log('Bundling ...');
const t0 = Date.now();
const serveUrl = await bundle({
  entryPoint: resolve(ROOT, 'src', 'index.ts'),
  onProgress: () => {},
});
console.log(`  bundled in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

const comps = await getCompositions(serveUrl, {
  browserExecutable: browser,
});

console.log('\nCompositions:');
for (const c of comps) {
  console.log(
    `  ${c.id.padEnd(12)} ${c.width}x${c.height}  ${String(c.durationInFrames).padStart(5)}f  @${c.fps}fps` +
      `  (${(c.durationInFrames / c.fps).toFixed(3)}s)`,
  );
}

const reel = comps.find((c) => c.id === 'Reel');
const fails = [];
if (!reel) fails.push('composition "Reel" not registered');
else {
  if (reel.width !== 1080 || reel.height !== 1920) fails.push(`Reel is ${reel.width}x${reel.height}, expected 1080x1920`);
  if (reel.fps !== 30) fails.push(`Reel is ${reel.fps} fps, expected 30`);
  if (reel.durationInFrames !== 2640) fails.push(`Reel is ${reel.durationInFrames} frames, expected 2640`);
}
const thumb = comps.find((c) => c.id === 'Thumbnail');
if (!thumb) fails.push('composition "Thumbnail" not registered');
else if (thumb.width !== 1080 || thumb.height !== 1920) {
  fails.push(`Thumbnail is ${thumb.width}x${thumb.height}, expected 1080x1920`);
}

if (fails.length) {
  console.log('\nFAILED:');
  for (const f of fails) console.log(`  x ${f}`);
  process.exit(1);
}
console.log('\nPASSED — bundle clean, Reel is 1080x1920 @30fps, 2640 frames (88.000 s).');
