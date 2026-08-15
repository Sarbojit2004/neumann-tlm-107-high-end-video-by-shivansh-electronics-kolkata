#!/usr/bin/env node
/**
 * Trims the rendered container to exactly 88.000 s.
 *
 * The video track already renders as exactly 2,640 frames. The AAC encoder,
 * however, appends priming/padding samples, which left the container reporting
 * 88.256 s — longer than the picture. This remuxes to a hard 88.000 s cut,
 * copying the video stream bit-for-bit (no re-encode, no quality change) and
 * cutting the audio stream at the same boundary.
 *
 * Usage: node scripts/finalize.mjs [in.mp4] [out.mp4]
 */
import {execFileSync} from 'node:child_process';
import {existsSync, renameSync, unlinkSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SCRATCH = '/tmp/claude-0/-home-user/b7c7b719-b725-5bcc-ae76-95b988bf89e8/scratchpad';

const ffmpeg = [
  process.env.FFMPEG_BIN,
  `${SCRATCH}/node_modules/ffmpeg-static/ffmpeg`,
  '/usr/bin/ffmpeg',
].find((p) => p && existsSync(p)) ?? 'ffmpeg';

const input = process.argv[2] ?? resolve(ROOT, 'out', 'neumann-tlm107-reel.mp4');
const output = process.argv[3] ?? input;
const tmp = input.replace(/\.mp4$/, '.tmp.mp4');

if (!existsSync(input)) {
  console.error(`no such file: ${input}`);
  process.exit(1);
}

execFileSync(
  ffmpeg,
  [
    '-y', '-loglevel', 'error',
    '-i', input,
    '-t', '88.000',
    '-c:v', 'copy',
    '-c:a', 'aac', '-b:a', '192k',
    '-movflags', '+faststart',
    tmp,
  ],
  {stdio: 'inherit'},
);

if (output === input) {
  unlinkSync(input);
  renameSync(tmp, output);
} else {
  renameSync(tmp, output);
}
console.log(`finalized -> ${output.replace(ROOT + '/', '')} (hard 88.000 s cut, video stream copied)`);
