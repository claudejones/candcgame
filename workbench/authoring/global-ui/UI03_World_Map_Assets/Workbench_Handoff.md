# UI03 — World Map, corrected delivery v2

This package replaces the incomplete v1 delivery. It restores the approved head-pin navigation, illustrated stage cards, navigation graphics, stage states and pixel UI treatments. It includes artwork for **all21 stages**, not only the South America mockup. Final components and assembled previews are ready for user review; this is not a runtime deployment.

## What to import

Use `assets/` for integration, `shared/` for the one canonical hearts dependency, `fonts/` for the supplied licensed pixel font. Originals are retained in `originals/`. `asset_manifest.json` maps all atlas crops; `map_layout.json` locates the seven continent groups and21 nodes. `stages.json` maps every stage to its thumbnail and live name.

Standalone PNGs and atlases are alternatives: choose one representation per component at runtime. Do not load duplicate standalone/atlas textures unnecessarily. Originals, previews and the assembly example are not game textures. Retire v1 MAP_PLAYER_* runner files from this screen; use the head pins for both location and travel.

| Family | File / dimensions | Mapping |
|---|---|---|
| Clean geography | MAP_WORLD_BASE.png,2048×683 | Opaque; contain without stretching/cropping. |
| Character-head pins | MAP_HEAD_PINS_ATLAS.png,192×96 | Two96×96 cells: Claude, Constance. Exact tip anchors in manifest. |
| Navigation/action icons | UI_NAV_ICONS_ATLAS.png,192×192 |64×64 cells; rows: Menu/Globe/Trophy; Options/Save/Play; Replay/Lock/Check. |
| Stage nodes | MAP_NODE_STATES_ATLAS.png,240×48 |48×48 cells: Locked, Available, Completed, Visited, CurrentRing. Ring overlays state dot. |
| Continent plates | UI_CONTINENT_PLATES_ATLAS.png,1120×48 |280×48 cells: Normal, Current, Locked, Complete. Add live label and lock/check icon. |
| Stage cards | UI_STAGE_CARDS_ATLAS.png,2048×176 |512×176 cells: Normal, Current, Locked, Complete. Add thumbnail, name, hearts/action. |
| Buttons | UI_BUTTONS_ATLAS.png,1280×56 |320×56 cells: Normal, Focus, Pressed, Disabled. Add live label/action icon. |
| Header and lower shelf | UI_NAV_BAR.png1600×72; UI_STAGE_PANEL.png1600×270 | Reusable blank panel artwork; no baked text. |
| Stage thumbnails | MAP_STAGE_THUMBNAILS_ATLAS.png,960×1680 |3columns×7rows;320×240 cells; rows NA,SA,EU,AF,AS,OC,AN; columns01,02,03. Also21 standalone MAP_THUMB_<ID>.png files. |
| Clouds | MAP_CLOUDS_ATLAS.png,384×80 | Three128×80 cells; place in quiet ocean margins behind UI. |
| Shared hearts/star | shared/UI_REWARD_UTILITIES_ATLAS.png,96×32 | Empty at0, full at32, perfect star at64;32×32 cells. Same canonical bytes as rewards package. Deduplicate existing dependency. |

Atlas rectangles are `[x,y,width,height]` in source pixels; right/bottom bounds exclusive. PNGs use nearest-neighbor scaling. UI frame SVG originals are supplied for native scaling; nine-slice cap12px preserves border geometry. Keep textures separate from live names, counts, statuses and click targets. The supplied Press Start 2P font includes its OFL license.

## Screen states and actions

Entry: New Game/Continue, return from stage or results, map arrival. Inputs: character, difficulty, actual journey stage, inspected continent/stage, eligible best hearts, available stages, assistance, loading and save status. These inputs are runtime data, not values to copy from previews. Continue uses the saved journey. Inspecting a different continent changes cards/selected plate, not the actual head-pin location.

- Locked stage: gray dot, muted card/thumbnail, padlock in card and prerequisite text. Do not put padlocks on individual map dots. Locked continent retains its plate lock.
- Available unfinished: pale outlined dot, Play card. Current journey stage additionally has pulsing gold ring and selected character head pin just above the node; no neighboring dots are hidden.
- Completed: gold dot, earned best hearts, Replay. Current ring remains visible if the current stage also has a completed record. Worse replays never reduce best.
- Completed continent: check on plate. Selected continent: gold plate treatment. `1/3 complete` means eligible completed stages within the inspected continent/difficulty and is not a button.
- Perfect: the same completed dot and three-heart best. Reuse the shared perfect star where reward detail calls for it; do not add map clutter or invent difficulty-specific artwork.
- Assistance: no new trophies, heart improvements, stamps or permanent unlocks; existing legitimate awards remain. Recommended extra VISITED outline distinguishes assisted passage from earned gold. Use live Assisted play text and an explicitly eligible count. Turning assistance off/eligibility recovery remains a global-rule refinement; do not silently restore eligibility mid-attempt.

| Control | Required behavior |
|---|---|
| Main Menu | Return to startup without erasing progress. |
| Achievements | Open UI05 achievements at current difficulty; Back restores map inspection. |
| Options | Open UI05 options; preserve selection. |
| Save | Run local-save operation. Show Saved on this device only on success; show retryable failure otherwise. |
| Continent plate | Inspect its three cards, including locked requirements. Does not bypass entry gating or teleport player. |
| Play | Load available selected stage; start with three hearts; prevent double launches. |
| Replay | Restart completed selected stage with three hearts; preserve best results. Previously completed stages may replay before unrestricted Level Select unlock. |
| Locked card | Explain prerequisite, never launch. Future stages remain gated. |

Eligible Standard completion unlocks Hard and unrestricted ordinary level select. All seven perfect Standard passports separately unlock mystery entry; mystery content/passport remains a different batch. Difficulty achievements are separate, with shared art. Exact new-game/reset/checkpoint and cross-character record policy remain as marked in the global plan.

## Animation and persistence notes

Stationary head pin is a static sprite. Pulse the independent current ring from opacity1 to0.55 to1 over1.2s, looping; reduced motion leaves it steady. Do not flash the whole character or replace the head with a runner.

Recommended travel: move the same head pin between stage centers,0.8s within a continent or1.5s between continents, ease-in-out. A thin temporary route can be drawn beneath it during travel, then removed. No extra travel sprite frames are necessary. Tap skips to the same final destination and consumes the tap; it must not accidentally launch Play. Reduced motion snaps. Arrival updates selection and offers Play; movement itself never awards anything.

Clouds are decorative static images by default. Optional slow8px drift over20s must stay in the prescribed ocean safe areas, behind markers; reduced motion stays static. They need no independently generated animation frames.

UI04 result actions connect to Next Stage / Replay / World Map; third stage offers Next Continent where another exists; final ordinary stage uses world completion. Commit eligible rewards once before reveal/travel. Returning to this map cannot re-award them. Save plus autosave after committed results/settings/map arrival is recommended. On loading failure retain previous state and provide Retry/Back. Disable repeated Play while loading. Optional selection cues obey Sound Effects independently of Music; no audio files are supplied or required by the approved static design.

## Assembly and verification boundary

`map-preview.html`, `map-ui.css` and `map-preview.js` are a presentation reference built from the packaged components. They use fixed illustrative progress and placeholder navigation actions; they are not game/save implementation. Query examples: `?continent=AN&character=CONSTANCE`, `?state=locked`, `?state=perfect`, `?state=assisted`. Workbench connects the real state machine, menus and saves. UI05 panel interiors and UI04 results are separate planned batches; their launch graphics on this map are included.

PNG previews were assembled directly from delivered assets and inspected at1600×900 and844×475. They are asset-composition renders, not browser or game screenshots. JavaScript syntax and local resource completeness were checked. Browser-based playback/layout validation could not run because the browser dependency download was unavailable; no runtime/device pass is claimed. Workbench must test live CSS, safe-area insets, font load, wrapping, tap targets, keyboard focus, animation, saves, all difficulties and assistance.

Map positions are relative to the actual contained artwork, excluding letterboxing/header/cards. On short phones, preserve all seven continents and use the cards for comfortable stage actions; avoid overlapping enlarged targets on tiny dots. Reference phone Play/Replay targets are44px high. Keep live labels legible rather than scaling an entire screenshot. See `Asset_Coverage.md` and `Verification.md` for the completed graphic inventory and checks.

Phone placement correction: use the separate `phone_label_center` and `phone_stage_centers` coordinates in map_layout.json. Africa and Antarctica labels shift sideways on the compact layout so every current-stage pin/ring remains visible. Do not reuse desktop percentages blindly on short phones. The marker/label/ring separation calculation covers all21 possible current stages in both reference sizes; live browser/device confirmation still belongs to Workbench.


## Responsive ocean correction — v3

`assets/MAP_OCEAN_BACKDROP.png` is an opaque ocean-only background; its untouched generated original is included in `originals/`. Set it on the full `.map` region with centered `background-size: cover`, no repeat, and pixelated rendering. Keep the geography and all map overlays together in the existing 2048:683 proportionally fitted `.artbox`. When this leaves horizontal space, apply a 1.5%-wide CSS alpha transition at each side of the geography image only. Do not mask the character pins, labels or nodes. This removes flat cyan side strips without moving markers, stretching continents, or cropping the map. The decorative ocean has no hit targets or animation. No extra state variants are needed.

Generation: built-in image generation, map ocean used as the style reference. Prompt: ocean only; match the reference cyan-blue palette and small stepped pixel-wave ripples; no land, clouds, text or objects; opaque uniform backdrop. The generated dimensions are recorded in the asset manifest.
