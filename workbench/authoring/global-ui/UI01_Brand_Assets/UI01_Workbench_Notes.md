# UI01 — Brand handoff

Status: generated and visually reviewed; user artwork acceptance and runtime integration pending. Direction approved: warm classic pixel adventure, gold/cream title and globe, character portrait app icon. Built-in image generation used for original artwork and one focused logo correction.

## Files

- assets/BRAND_GAME_LOGO.png —1536×1024 RGBA, transparent. Exact visible title: Claude & Constance / AROUND THE WORLD. Use alt text “Claude & Constance: Around the World”. Preserve aspect ratio; reviewed at320 and480px widths. Prefer480px when space allows. Do not use as tiny favicon.
- assets/BRAND_APP_ICON_MASTER.png —1024×1024 RGB opaque. Derived from preserved1254×1254 square source.
- assets/BRAND_FAVICON_16.png and BRAND_FAVICON_32.png —16×16 and32×32 RGB.
- assets/BRAND_APPLE_TOUCH_ICON.png —180×180 RGB.
- assets/BRAND_PWA_ICON_192.png and BRAND_PWA_ICON_512.png —192×192 and512×512 RGB.
- originals/ —selected generation source bytes, including corrected logo and1254px icon. Do not substitute review previews for assets.
- asset-manifest.json —actual dimensions, modes, hashes and derivative method.

## Behavior

Logo appears on the startup screen and may be reused on About and completion screens. Static artwork; no buttons, selected/disabled states, sprite frames or baked animations. Startup controls are a later UI02 batch. Optional runtime fade is not supplied or required. No save, achievement or unlock side effects. No audio.

App icon is for browser/app identity, not an in-game control. Keep the square source; platform controls corner masking. Rounded-square previews were inspected. These icons are not certified as maskable-purpose icons: register ordinary purpose only unless Workbench separately validates the maskable safe zone. PWA-named files supply image sizes only; they do not establish installability or offline support.

Use exact delivered bytes, nearest-neighbor display where suitable, preserve logo alpha, and do not stretch. Final responsive startup composition remains for UI02/Workbench. Brand files do not change game calibration or progression.

## QA and limitations

The first logo had diffuse edge glow. One focused image edit removed it; the corrected logo was reviewed composited over cream, navy, blue and green backgrounds. Title spelling, ribbon text and complete silhouette pass. Genuine transparency measured. Both original character-selection atlas and character-baseline.jpeg were inspected and attached to icon generation as identity references. Claude's bald head/goatee and Constance's hair/headband/earrings remain recognizable.

Icon derivatives were produced directly from the square source using uniform nearest-neighbor downscaling. No independently generated small icons. Inspected all5 target sizes and rounded-square crops. At16px identity is conveyed by paired silhouettes and color, not detailed facial features;32px is the preferred browser favicon. Fine border and face details necessarily simplify at16px. No real-device home-screen installation test performed.

PNG decoding, required dimensions, alpha mode, ZIP CRC and original-byte identity checked. Artwork acceptance remains pending.

## Generation brief record

Logo: transparent pixel-art title “Claude & Constance” in two stacked lines, smaller “AROUND THE WORLD” ribbon, gold/cream letters with navy outlines, blue/olive globe, short gold dotted route, no characters, crisp square pixels. Correction: preserve exact artwork and text, remove diffuse glow/background wash, retain hard pixel outlines and transparent gaps.

Icon: opaque square; Claude left and Constance right, heads/shoulders with approved warm brown skin, Claude bald/goatee, Constance textured updo, tan headband and gold hoops, cream/olive adventure clothing, small blue/olive globe, ocean-blue background, navy border and restrained gold corners, no words. Approved original character references supplied directly.
