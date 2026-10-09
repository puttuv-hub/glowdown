# Glowdown ✦ — Beautiful Fullscreen Countdown Timer

A vibrant, responsive countdown timer that runs entirely in your browser. **No build tools, no account, no API keys, no hosting cost.** Ideal for studying, exercise, breaks, work and events.

## Features

- **16 one-tap presets:** 10 sec, 20 sec, 30 sec, 1 min, 5 min, 10 min, 15 min, 30 min, 1 hour, 2 hours, 6 hours, 12 hours, 1 day, 2 days, 24 hours and 48 hours.
- **Any custom duration:** days, hours, minutes and seconds, plus an optional session name.
- **Fullscreen focus mode:** works with browsers supporting the Fullscreen API and falls back to an immersive page view.
- **Start, pause, resume and restart**, with visual progress and estimated finish time.
- **5 color themes:** Aurora, Sunset, Ocean, Citrus, **Classic Flip** (cream background, black split-flap cards; fullscreen style based on the supplied reference).
- Optional **completion chime**, **desktop notifications** and **keep-screen-awake** (on supported devices).
- **Remembers running countdowns across page refreshes**, using a real end timestamp (so switching tabs or sleeping a device will not slow the timer).
- Can work **offline** after your first visit thanks to service-worker caching when hosted via HTTPS.
- Responsive on desktop and mobile, keyboard shortcuts and reduced-motion accessibility support.

## Run locally

Open `index.html` in your browser. For offline caching, notification permissions and some fullscreen features, run it from localhost or HTTPS instead of `file://`.

For example, with Python installed:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Publish to GitHub Pages (free)

1. Make a new **public** GitHub repository, e.g. `glowdown`.
2. Upload **all project files** to the repository root (or unzip this package and upload its contents). Commit the changes.
3. Open **Settings → Pages** in the repository.
4. Under **Build and deployment**, select **Deploy from a branch**. Set branch to **main** and folder to **/(root)**, then **Save**.
5. Once deployment completes, open your website at:

   `https://YOUR-USERNAME.github.io/glowdown/`

If your repository has another name, replace `glowdown` in the URL with that repository name. You can bookmark the URL, open it in Chrome, or add it to your phone home screen.

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| Space | Start, pause or resume (when not using an input or button) |
| R | Reset the current timer |
| F | Enter or exit fullscreen focus mode |
| Esc | Exit focus mode |

## How timers behave

- Choosing a new preset or submitting custom settings **resets** the timer to that duration. Then press **Start timer**.
- **Restart** resets the selected timer without starting it.
- If the page is closed and later reopened, a **running** countdown catches up using the clock. A **paused** countdown stays paused.
- If you reopen a completed countdown, the completed state is displayed without an unexpected sound.
- Browser audio restrictions require interacting with the page before sounds can play; notifications require permission. The page must remain open for a completion alert to be delivered reliably. Some browsers do not support wake lock or notifications.
- Offline access requires a successfully loaded first visit over localhost/HTTPS. The site does **not** need a server while the timer is in use.

## Files

- `index.html` — page structure and settings
- `style.css` — colorful responsive theme + fullscreen view
- `script.js` — accurate timer, persistence, sounds, controls
- `service-worker.js` — offline cache
- `manifest.webmanifest` — installable web-app metadata
- `favicon.svg` — site icon

### Customization

To use the new theme, open **Make it yours → Classic Flip** and optionally click **Focus mode**. Short timers show only two split cards, while longer durations automatically add minutes, hours, and days. Your selected theme persists across visits.

Change the default timer in `script.js` (`defaultState.duration`, `defaultState.remainingMs`, `defaultState.label`) or edit `.preset` buttons in `index.html`. The full palette is defined near the top of `style.css`.

MIT license — free to use and modify.
