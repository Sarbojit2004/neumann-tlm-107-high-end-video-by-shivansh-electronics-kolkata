import {Config} from '@remotion/cli/config';
import {existsSync} from 'node:fs';

// PNG intermediates, not JPEG. JPEG frames make ffmpeg tag the output
// full-range `yuvj420p` even when --pixel-format=yuv420p is passed, which
// shifts levels on players that honour the range flag.
Config.setVideoImageFormat('png');
Config.setOverwriteOutput(true);
Config.setConcurrency(2);
Config.setChromiumOpenGlRenderer('angle');

// This environment blocks the Remotion Chrome Headless Shell download, but
// ships Chromium already. Point Remotion at it when present; elsewhere
// Remotion falls back to its own managed browser as normal.
for (const p of [
  process.env.REMOTION_BROWSER,
  '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
]) {
  if (p && existsSync(p)) {
    Config.setBrowserExecutable(p);
    break;
  }
}
