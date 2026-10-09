# Glowdown — Countdown Studio

A clean, self-contained countdown website for GitHub Pages. No build tools, libraries, accounts, API keys, or subscriptions are needed.

## What's included

- Responsive dashboard with a dark / light mode button (the choice is remembered)
- 20 timer faces: Editorial, Classic Flip, Paper, Matcha, Blush, Lilac, Aurora, Ocean, Sunset, Noir, Citrus, Chrome, Stopwatch, Old Clock, Pocket Watch, Retro Alarm, Retro LED, Neon Glow, Marble Gold, and Hourglass
- Animated Classic Flip digits, and a distraction-free fullscreen timer
- Ready-to-use presets (10 seconds through 7 days) and custom durations
- Explicit display unit selection: seconds, minutes:seconds, hours:minutes:seconds, or days:hours:minutes:seconds
- Start, pause, reset; adjust remaining time by -1/+1/+5 minutes
- Save up to 12 frequently used timers on this device
- Three alarm sounds with configurable volume and a Test Sound button
- Optional desktop notifications, screen wake lock, auto-start, and 3-second auto-repeat
- Optional session name, progress bar, accurate countdown after a backgrounded tab
- Preferences and timer state preserved locally between reloads

**Important:** The dashboard dark/light switch changes the *website interface*, not the individual creative clock designs. Select the **Noir**, **Neon Glow**, **Retro LED**, or **Aurora** theme for a dark clock face.

## Publish on GitHub Pages

1. Create or open a public GitHub repository (for example `glowdown`).
2. Upload **`index.html`** to the repository root. If you're updating your existing site, replace its existing `index.html`.
3. Commit the file.
4. Open **Settings → Pages**. Set **Source** to **Deploy from a branch**; set branch to **main** and directory to **/(root)**, then Save.
5. After GitHub finishes publishing, open `https://YOUR-USERNAME.github.io/glowdown/`.
6. If you see an old copy, press **Ctrl+Shift+R** to hard refresh.

You may also open `index.html` directly in a browser. Some browser-only capabilities (e.g. notifications and wake lock) work best on the secure GitHub Pages address.

## Shortcuts

- **Space** — start/pause
- **R** — reset
- **F** — fullscreen timer-only mode
- **Esc** — exit fullscreen

Shortcuts are ignored while typing in a form field. In fullscreen, tapping the timer exits focus mode.

## Notes

The timer calculates time remaining against a real clock deadline rather than subtracting a fixed second each tick. Saved timers and preferences use browser-local storage, so they do not sync between devices. Keep the tab open for alarm sounds; browsers can mute or suspend audio in the background. Notifications need permission and a compatible browser. Screen wake lock also depends on device and browser support. All presets and styles work without an internet connection after downloading this file.
