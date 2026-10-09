# Glowdown — Animated Clocks Edition

A beautiful, **single-file countdown timer** with 20 themes, working 3D split-flap animation and timer-only fullscreen mode. Free to publish using GitHub Pages.

## Highlights

- **Classic Flip really flips:** every changing digit animates in two parts — the old top card folds away and the new bottom card folds into place in about 0.58 seconds. The card returns to its resting state after the animation. The animation honors your browser's reduced-motion setting.
- **20 themes:** Editorial, Classic Flip, Paper, Matcha, Blush, Lilac, Aurora, Ocean, Sunset, Noir, Citrus, Chrome, Stopwatch, Old Clock, Pocket Watch, Retro Alarm, Retro LED, Neon Glow, Marble Gold, and Hourglass.
- **Only the time appears on the clock face:** no titles, logos, unit labels, quotes, or controls. Decorative watch bezels are part of the stopwatch/clock themes.
- **Format follows the duration unit:** 10 seconds -> `10`, 30 minutes -> `30:00`, 24 hours -> `24:00:00`, 48 hours -> `48:00:00`, two days -> `2:00:00:00`. The Classic Flip theme pads the leading seconds/days card to two digits.
- Custom days/hours/minutes/seconds and optional clock-format override.
- Countdown presets, pause/resume/reset, sound, desktop notifications, screen wake lock (where browser supported), precise deadline-based timing, saved settings, and responsive fullscreen focus mode.
- No external fonts, JavaScript libraries, user accounts, backend or trackers.

## How to install on GitHub Pages

1. Unzip the download.
2. Open your existing `glowdown` repository on GitHub.
3. Replace its **root-level** `index.html` with this updated `index.html` and commit changes.
4. Check **Settings -> Pages**: `Deploy from a branch`, `main`, `/(root)`.
5. Open `https://YOUR-USERNAME.github.io/glowdown/` when publishing is complete.

This edition is a **self-contained HTML file**; there is no need for separate `style.css` or `script.js`. If you deployed the original version with `service-worker.js`, remove it from the repository and unregister its old service worker in Chrome DevTools > Application > Service Workers if an older cached design keeps appearing. A hard refresh (Ctrl+Shift+R) also helps with ordinary browser caching.

## Use locally / copy-paste

Open `index.html` in your browser, or open it in any code editor and copy the entire contents into your GitHub repository's `index.html`.

## Keyboard controls

- `Space`: start/pause/resume
- `R`: reset
- `F`: fullscreen timer
- `Esc` or click the fullscreen clock: leave fullscreen

## Motion, timer accuracy, and privacy

CSS split-flap motion works in modern browsers. Browser-level 'Reduce motion' disables flipping and displays digits instantly. Remaining time is calculated against an absolute deadline to avoid accumulating setInterval drift; background tab throttling may delay display updates but the remaining time catches up when the tab becomes active. Sound requires a supported audio device and browser permission to play, and notifications/wake locks are subject to browser permissions. Preferences live in the browser's local storage.
