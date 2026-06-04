# browser-extensions

Public source for browser extensions published to the Chrome Web Store,
Microsoft Edge Add-ons, Mozilla Add-ons (AMO), and Opera Add-ons.

This repository is **public on purpose**: extension code ships unmodified to
every user inside the store `.zip`, there are no secrets, and there is no build
or minification step — so the source here is exactly what runs in the browser.
That also satisfies Opera's "Extension source code URL" requirement and AMO's
readable-source policy.

## Layout

One self-contained folder per extension. Inside each, one folder per store
target (all Chromium MV3 except Firefox, which adds a `gecko` block):

```
<extension>/
├── chromium/   → Chrome Web Store
├── edge/       → Microsoft Edge Add-ons
├── firefox/    → Mozilla Add-ons (browser_specific_settings.gecko)
├── opera/      → Opera Add-ons
├── store-assets/    rendered promo images + SVG sources
├── scripts/         per-extension generators (icons, store assets)
├── STORE_LISTING.md ready-to-paste store copy (EN / RU / DE …)
└── README.md
```

### Extensions

| Folder | Name | Stores |
|---|---|---|
| [`noisemeter/`](noisemeter/) | HowLoud — Sound Meter | Chrome · Edge · Firefox · Opera |

## Build store packages

```bash
scripts/package.sh noisemeter        # → dist/noisemeter/noisemeter-<store>.zip
```

Each zip has `manifest.json` at the **root** (not nested in a folder) — uploading
a Finder "Compress" archive nests the folder and the stores reject it with
"manifest.json was not found" (Mozilla/Opera) or "No persona.ini" (Opera).
Always upload the zips this script produces.

## Store source URL (Opera / AMO moderators)

Point the "Extension source code URL" field at the extension's subfolder:

```
https://github.com/ivanlukichev/browser-extensions/tree/main/<extension>
```

## Adding a new extension

1. `mkdir <extension>` and add `chromium/ edge/ firefox/ opera/` (copy an
   existing one as a starting point — `chromium`/`edge`/`opera` are identical).
2. Add `STORE_LISTING.md` and a `README.md`.
3. `scripts/package.sh <extension>` to produce upload zips.

## License

[MIT](LICENSE) © Ivan Lukichev. Applies to all extensions in this repository.
