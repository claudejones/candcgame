# Approved Concept A — component coverage

Every visible family is mapped below. This inventory covers the complete21-stage screen system. No thumbnail, head portrait, icon or graphical treatment is left for Workbench to invent or extract from a screenshot.

| Approved element | Delivered component | State / assembly responsibility |
|---|---|---|
| Seven-continent ocean artwork | MAP_WORLD_BASE.png + original | Contain, preserve aspect. Dynamic overlays remain separate. |
| White ocean clouds | Three MAP_CLOUD PNGs + atlas + original | Position in safe ocean margins; decorative. |
| Claude head location pin | MAP_PIN_CLAUDE.png + head atlas + original | Use approved head-pin motif; no full-body substitution. |
| Constance head location pin | MAP_PIN_CONSTANCE.png + same atlas | Same size and placement; selected character. |
| Gold current-location ring | MAP_CURRENT_RING.png + node atlas | Runtime opacity pulse, independent of completion dot. |
| Locked/available/completed stage dots | MAP_NODE_* PNGs + atlas | Gray / pale outlined / gold; all21 source positions provided. |
| Assisted-visit distinction | MAP_NODE_VISITED.png | Optional recommended outline; never earned gold or a false heart award. |
| Continent label backplates | Four UI_CONTINENT_PLATE states + atlas + SVG originals | Labels are live text. Lock/check supplied. |
| Continent lock/check | UI_ICON_LOCK / CHECK + nav atlas | Plate overlay; not repeated on map dots. |
| Stage-card frames | Four UI_STAGE_CARD states + atlas + SVG originals | Normal/current/locked/complete; live contents. |
| Location artwork for all21 cards |21 MAP_THUMB_<stage>.png files +3×7 atlas | NA01…AN03 explicitly enumerated in stages.json; same art across difficulties. |
| Thumbnail locked treatment | Actual thumbnails + exact CSS filter | Saturation0.6 and opacity0.88; no missing gray artwork to generate. |
| Best-heart row | Canonical shared96×32 heart/star atlas, included once | Three32×32 cropped icons, live best value; do not use assisted hearts. |
| Gold Play and Replay buttons | Four UI_BUTTON states + atlas + SVG originals | Play/replay icon + live text overlay; pressed/focus states included. |
| Play triangle / Replay arrow | UI_ICON_PLAY / REPLAY | Packaged PNGs and exact atlas frames. |
| Header background/border | UI_NAV_BAR.png + SVG | Stretch or nine-slice, preserve edge styling. |
| Main Menu bars | UI_ICON_MENU | Live Main Menu label beside glyph. |
| Globe decorations | UI_ICON_GLOBE | Same asset reused around title. |
| Achievements trophy | UI_ICON_TROPHY | Launches separate UI05 panel. |
| Options gear | UI_ICON_OPTIONS | Launches separate UI05 panel. |
| Save icon / footer icon | UI_ICON_SAVE | Reuse same sprite, live success/error message. |
| Lower shelf / heading area | UI_STAGE_PANEL.png + SVG | Live continent, difficulty and noninteractive completion count. |
| Pixel text styling | PressStart2P-Regular.ttf + OFL license + CSS | All text remains live; font fallback specified. |
| Dividers, focus, spacing, disabled tint | map-ui.css + SVG frame sources | Exact code-native treatments supplied, not unspecified generic UI. |
| Stage selection and travel positions | map_layout.json |21 positions grouped under seven continents; head movement prescribed. |

## Thumbnail provenance

Nineteen thumbnails derive from existing environment artwork, with originals preserved. NA/SA/EU sources were recovered from the earlier LAB25Q original asset archive solely for menu illustration; they are not replacements for the current integrated gameplay layers or calibration. NA02/SA01/AN01/AN02/AN03 combine their existing FAR and MID source art for a readable crop. Remaining AS/OC/AN and AF03 use existing source PNGs. Source copies and crop rectangles are recorded in asset_manifest.json.

AF01 Savannah and AF02 Sossusvlei received new dedicated menu compositions because suitable full-scene source artwork was unavailable in the recovered files. AF02 follows the existing dead-camelthorn/orange-sand/oryx direction; these are menu thumbnails, not gameplay landscape revisions. Their original generated PNGs are preserved. Final new thumbnail art remains subject to this delivery review.

## Shared resources

The canonical reward utilities are included once under shared/ to make this corrected screen package self-contained. Their SHA256 matches the existing reward pack. Importers with that dependency should reuse it and skip this duplicate copy. No continent-specific utilities or difficulty duplicates are generated.

## Scope

All graphics needed for the approved UI03 design are included. The artwork is newly assembled for user review, not automatically user-approved by passing file checks. Runtime/save behavior and the separate UI04/UI05 panel contents remain Workbench/next-batch work as described in the plan. This is not a claim that all global game screens are finished.


## Responsive ocean correction — v3

`assets/MAP_OCEAN_BACKDROP.png` is an opaque ocean-only background; its untouched generated original is included in `originals/`. Set it on the full `.map` region with centered `background-size: cover`, no repeat, and pixelated rendering. Keep the geography and all map overlays together in the existing 2048:683 proportionally fitted `.artbox`. When this leaves horizontal space, apply a 1.5%-wide CSS alpha transition at each side of the geography image only. Do not mask the character pins, labels or nodes. This removes flat cyan side strips without moving markers, stretching continents, or cropping the map. The decorative ocean has no hit targets or animation. No extra state variants are needed.

Generation: built-in image generation, map ocean used as the style reference. Prompt: ocean only; match the reference cyan-blue palette and small stepped pixel-wave ripples; no land, clouds, text or objects; opaque uniform backdrop. The generated dimensions are recorded in the asset manifest.
