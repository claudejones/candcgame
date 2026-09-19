# Workbench audit

2026-09-19 · baseline main `132955434f7835064e5d28d8761521111ce0dbf5`

Sources: repository specifications, archived LAB25Q, current source, and live interaction with `src/dev.html`. Production artwork and numeric gameplay defaults were not changed. Browser observations use a fresh browser profile, not the user's existing local saves. This is a source/interaction audit, not a completed regression certification of every stage.

## Conclusion

The current workbench has a useful Design / Test / Game structure and real modular authoring features. It still runs the old Lab controller and depends on its hidden HTML controls. The next step is an incremental production-editor migration with explicit feature parity, one draft/configuration pipeline, and a direct runtime API. A visual reskin alone cannot resolve the dependency or consistency problems.

`src/index.html` retains all 175 ID-bearing button/input/select/canvas elements found in archived LAB25Q. `Lab.bindUI()` attaches behavior directly to those nodes. The outer `runtime-host-api.js` calls `.click()` on old controls and reads old labels. The markup is therefore not dead code today. Some legacy pseudo-elements also remain in the live accessibility snapshot (stray plus/minus and hazard-kind text).

## Prioritized findings

Evidence: **UI** = observed in deployed interface; **code** = directly traced in source; **risk** = a consequence needing a targeted runtime test before claiming a reproduced defect.

| ID | Priority | Finding and effect | Evidence / source | Required response |
|---|---|---|---|---|
| E01 | P0 | Character Design has no frame strip, previous/next, play/pause or crop inputs. Preview stays on the editor's selected frame, initially frame 1. `selectFrame()` exists but has no UI caller; `apply()` resets the runtime state without setting its frame. | UI + `character-editor.js`, character branch in `contextual-inspector.js`; explicitly promised in Phase 7 completion plan | Use one sprite-inspection component for characters and hazards; set the exact runtime preview frame through a direct API. |
| E02 | P0 | The runtime API still clicks hidden buttons and reads label text. Lab initialization assumes the old DOM exists. Production also embeds this runtime. | Code: `runtime-host-api.js`, `game-runtime.js: Lab.bindUI`, `game.html` | Extract commands and state from handlers first. Remove live legacy UI only after the runtime boots and passes parity without it. |
| E03 | P0 | Character panel mixes global character edits with stage grounding. SAVE CHARACTER / REVERT act only on globals, while grounding dirties the stage. | Code: `contextual-inspector.js` and `design-draft.js` | Explicit scope labels and a save-changes summary covering both scopes; transactional save/revert. |
| E04 | P0 | Draft application is selection-dependent. Character copies only the selected character/state; finish only applies when selected; hazard sync applies one definition. Import and reload do not centrally apply the entire authored snapshot. Test/Game can therefore consume incompletely applied drafts. | Code + risk: domain editor `apply()` functions, `test-mode.js`, `design-draft.js` | One validated immutable draft snapshot applied atomically to the runtime on ready/import/mode transition. Verify reload and import without visiting every asset. |
| E05 | P0 | Numeric fields can claim changes that runtime ignores. Landscape Offset X and FAR parallax are exposed but never transferred. Flying-hazard source X/Y are editable, but its renderer calculates source from frame width/height and origin zero. Hazard offset X only changes the focused Design placement; course integration is undefined. | Code: `landscape-editor.js`, `hazard-editor.js`, `ObjectQA` / `GameplayDirector` | Every field must have a documented end-to-end effect or be disabled with an explanation. Distinguish preview position from authored course placement. |
| E06 | P0 | Import validation checks only part of the payload. Global character crops/scales are not validated; several transform/source/collision fields bypass full validation. No atomic backup/restore or import diff. | Code: `config-schema.js: validateCanonicalView`, `design-draft.js: importGame` | Schema validation for all fields, bounds, atlas membership and frame counts; preview import diff; reject invalid input before mutation; preserve prior save on failure. |
| E07 | P1 | Stage / Global offers only a canonical-ground note. Many lab controls are absent from the new editor, rather than intentionally classified. | UI + code: inspector fallback; old `bindUI()` | Separate Stage, Gameplay and Shared Effects settings; decide which are production authoring, test overrides or obsolete. Preserve constants until approved. |
| E08 | P1 | First load waits for every registered image. One rejected image aborts Lab construction, and the error is written to `#status`, which hosted CSS hides. No visible progress, retry, or asset health. | Code: `AssetStore.load()`, bottom-level catch, `suppressLegacyChrome()` | Load common + active-stage assets first; cache decoded images; expose ready/error state and retry; defer other stages. |
| E09 | P1 | Previews have no image error UI. A fresh live landing did not show the landscape source preview; navigating away/back did show it. Likely readiness/decoration race, not evidence of a missing PNG. | UI + risk: landscape `decorate()` reads `CC_ASSET_SOURCES`, host/iframe readiness | Deterministic ready event and preview lifecycle. Audit loading/loaded/error for every asset. |
| E10 | P1 | Finish Marker displays an inspector thumbnail; the editor does not establish the promised stationary in-scene finish preview. | Code: `finish-marker-editor.js`; runtime finish drawing occurs in gameplay | Explicit finish-preview state through runtime API; retain actual finish release timing. |
| E11 | P1 | Interaction STEP FRAME invokes the character-only legacy step. It does not deterministically advance a whole character/hazard interaction. PAUSE combines pause-hazard with a character toggle, so repeated calls are not idempotent. | Code: `test-mode.js`, legacy `stepBtn` / `pauseBtn` | Separate sprite frame step from simulation tick; explicit play/pause state and speed labels; deterministic reset. |
| E12 | P1 | Design layer flags can carry into Test/Game because only Design applies them. Cleanup clears some bounds but not every preview setting. UI toggles can also retain active styling after internal flags reset. | Code + risk: mode listeners in landscape/test/hazard modules | Central mode entry/exit policy; fresh runtime session for clean Game preview; authored values survive while diagnostics do not. |
| E13 | P1 | Save is local only, but the UI does not show the Git baseline, local override provenance or changed fields. Export Stage has no matching stage import. No undo/redo or per-field reset; import saves immediately. | UI + code: draft/inspector | Visible dirty scopes, local checkpoint and export separation, undo/redo, reset-to-saved/default, validated stage and full imports, explicit reviewed promotion. |
| E14 | P2 | A tall inspector hides the image preview and save controls below the fold. At the reviewed desktop size there is substantial unused space below the scene while the right panel scrolls. Some +/- accessible names are incorrect or ambiguous. | Live desktop UI + `field()` markup | Fixed workspace with independent panels, persistent actions, collapsible groups, bottom animation dock, proper labels and keyboard focus retention. |
| E15 | P2 | Hazard playback rebuilds the inspector/preview nodes each animation frame and creates new Image objects. Runtime updates hidden legacy labels at 60 Hz; monitor polls while collapsed. | Code: hazard `tick/decorate`, inspector listeners, Lab tick/renderUI, monitor timer | Keep controls mounted; update only canvas/frame labels, use shared asset cache, suspend inactive previews and event-driven diagnostics. No latency claim until measured. |
| E16 | P2 | Current CI has many grep checks for labels/functions but no complete user-flow gate for missing character frame controls. | `.github/workflows/production-ci.yml` | Keep numeric/asset invariants and add focused behavior/round-trip tests plus a visual acceptance matrix. |

The current asset map has **58 image entries**, all resolving to files in this checkout. Their packaged source files total **64,240,172 bytes** (~61.3 MiB), before development Phase 8 substitutions. This is source-file inventory, not a measured network transfer, decode-memory cost, or startup time. No general missing-art claim is justified by the initial preview race.

## Old versus new functionality

| Capability in LAB25Q / requirement | Current new shell | Intended home / decision |
|---|---|---|
| Stage and character selection | Present; separate local selections can diverge across modes | Shared workspace context; Game begins from a clean chosen snapshot |
| Six character states, Next Frame, per-frame crop | Test has state/step; Design lacks the essential frame/crop workflow | Design animation dock; Test uses actual state/physics transitions |
| Stars auto/on/off, size and offset | No equivalent new authoring panel | Shared Effects / Hit preview; clearly separate forced QA visibility from authored FX values |
| Character scale, state offsets, hitbox, per-stage grounding | Largely ported; save scope inconsistent | Character inspector with Global vs This Stage labels |
| Jump launch/gravity and timed Slide | No new settings panel | Advanced Gameplay settings; preserve .75 runtime for now; .70 spec conflict remains an explicit later decision |
| Landscape scale/Y/parallax, layer isolation | Mostly ported; X/FAR parallax currently no-op | Scene inspector, effective-value display and canonical geometry validation |
| Seam / source geometry / global foot offsets | Not all exposed | Legacy seam calibration is compatibility evidence; do not restore it as editable production ground authority |
| Cloud speed/Y/scale/opacity | Visibility only | Shared Effects editor; no forced duplication into every stage |
| Hazard source region, crop, scale, hitbox | Improved atlas/frame workflow; several adapter gaps above | Reuse common sprite tools plus hazard-specific placement/collision |
| HIGH/LOW pass and speed/FPS/travel controls | HIGH/LOW + pass present; some old controls absent | Test overrides for pass speed/travel; authored animation FPS and flight policy in Design |
| Pattern seed/rebuild, duration, lives, phase speeds, altitude mix, finish release | Run/Pause/Reset and Unlimited Lives only | Stage pattern timeline and deterministic Test scenarios; production constants protected until intentionally edited |
| Recovery and invulnerability tuning | Missing from new inspector | Advanced Gameplay; Hit/recovery test scenario |
| Finish transform, bounds, scene preview | Transform + thumbnail only | Finish inspector plus in-scene final-window preview |
| Full QA snapshot/checkpoint and selected-config copies | New local saves and config export, but narrower payload | Separate authored config export, local recovery backup, and diagnostic test report |
| HUD, progress, retry, pause, collision latch | Retained through shared legacy runtime | Preserve verified player behavior; test before any runtime extraction deletion |
| World map, passports, medals, 21 stages | Only nine stages / three continents are active here | Future campaign features, not “lost” lab controls. Registry-driven expansion; no placeholder gameplay or scope expansion during cleanup |

## Cleanup disposition

**Replace incrementally:** hidden control bridge; Lab DOM binding/label polling; duplicated asset maps; inconsistent form widgets; selected-only config synchronization; mode-specific global mutations.

**Remove after parity evidence:** unused live lab markup/styles/handlers, stale visible phase labels, duplicated presentation controls. Historical comments/documents are not runtime dependencies; archive rather than erase decision evidence. Several Phase 7 plans still say ACTIVE despite Current Status recording acceptance—add a document-status index when this track is accepted.

**Preserve:** approved artwork byte-for-byte; `archive/` and `assets-original/`; current production/editor routes; legacy checkpoint data until an explicit migration exists; gameplay constants, anchors, hazard patterns, HUD behavior and CI/Pages approval gates.

**Do not decide silently:** .70s Slide specification versus .75s approved runtime; packaged legacy art versus approved development landscapes; remaining continent integration; Perfect Runs campaign implementation.

## Verification boundary

Observed deployed: Design character/landscape/global panels, Test setup/actions, first-load preview absence followed by successful preview after selection. Source audit covers Game entry, save/import, atlas sourcing, runtime controls, and all legacy control IDs. Repeated-pause, cross-mode contamination, full-course draft application, all nine stage visuals, and fresh/mobile performance remain targeted acceptance tests, not claimed reproduced results. No production values were changed for this audit.
