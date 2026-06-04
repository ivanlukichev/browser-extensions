# HowLoud — Sound Meter (browser extension)

A one-window browser popup that estimates ambient noise level from the
microphone, in real time. Companion to the web tool at
[pickheadphones.com/tools/sound-meter](https://pickheadphones.com/tools/sound-meter/)
and the iOS app **HowLoud — Decibel Meter**.

No audio is recorded, stored, or transmitted — everything runs locally in the
browser. The reading is an approximate estimate, not a certified SPL
measurement (browsers expose no microphone calibration).

## Structure

One self-contained build per store target (same pattern as `calcsprint-extension`):

```
chromium/   → Chrome Web Store
edge/       → Microsoft Edge Add-ons (Partner Center)
firefox/    → Mozilla Add-ons (adds browser_specific_settings.gecko)
opera/      → Opera Add-ons
icon.svg    → source for the icons/*.png (rendered with rsvg-convert)
```

`chromium/`, `edge/` and `opera/` are byte-identical (all Chromium MV3);
`firefox/` differs only by the `gecko` block in `manifest.json`. Shared files:
`popup.html`, `popup.css`,
`popup.js`, `permission.html`, `permission.js`, `icons/`.

The dB math (`MIN_DB`/`MAX_DB`/`CALIBRATION_OFFSET=95`/smoothing) is a direct
port of `assets/js/sound-meter.js` from the pickheadphones site — keep the two
in sync if you retune the calibration.

## Microphone permission (Variant A)

Granting the mic for the *first* time from inside a popup is unreliable — the
popup loses focus when the prompt appears and dismisses it. So:

1. The popup calls `getUserMedia` directly. Once permission is granted it works
   silently on every later open.
2. If the first attempt is blocked (`NotAllowedError`), the popup shows an
   **"Open microphone permission page"** button that opens `permission.html` in
   a normal tab, where the prompt behaves correctly. After allowing once, the
   popup works.

## Load locally (unpacked) for testing

- **Chrome / Edge / Opera:** open the extensions page (`chrome://extensions`,
  `edge://extensions`, or `opera://extensions`) → enable Developer mode → *Load
  unpacked* → select the matching folder (`chromium/`, `edge/`, `opera/`).
- **Firefox:** `about:debugging#/runtime/this-firefox` → *Load Temporary
  Add-on* → select `firefox/manifest.json`.

Click the toolbar icon → **Start** → allow the microphone.

## Regenerate icons

```bash
for s in 16 32 48 64 128; do rsvg-convert -w $s -h $s icon.svg -o chromium/icons/$s.png; done
for t in edge firefox opera; do cp chromium/icons/*.png "$t/icons/"; done
```

## Localization

UI strings live inline in `popup.js` / `permission.js` (`COPY` object), keyed by
the 2-letter `navigator.language`. Currently `en` / `de` / `ru`, matching the
locales already present in the site's `sound-meter.js`. Falls back to `en`.

## Publishing

Build the upload zips with the mono-repo packager (run from the repo root). It
puts `manifest.json` at the archive root — required by every store:

```bash
scripts/package.sh noisemeter        # → dist/noisemeter/noisemeter-<store>.zip
```

Upload those zips directly — do **not** re-zip via Finder "Compress" (it nests
the folder and the stores reject it: "manifest.json was not found" on
Mozilla/Opera, "No persona.ini" on Opera).

`chromium/`, `edge/` and `opera/` are identical, but kept separate so each store
has its own reviewable upload. Opera/AMO "Extension source code URL" → this
folder on GitHub. Store listings should link back to the privacy policy and the
web tool on pickheadphones.com.
