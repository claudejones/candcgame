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
# Current candidate coverage — reviews 06–08.1

This implementation status supplements the original old/new functionality audit below. A completed preview tool does not establish gameplay parity.

| Authoring workflow | Available in candidate | Still required before cutover |
|---|---|---|
| Landscapes | All nine stage sets; scene/layer/source views; FAR/MID/GROUND scale, X/Y, parallax; visibility, guide, repeat scroll; Play/Pause/Restart with runtime-speed cloud drift; synchronized baseline comparison | Runtime adapter parity across Design/Test/Game and full-course/finish behavior |
| Character animation | Both characters, six states, every frame, editable per-frame atlas bounds, crops, atlas/baseline views; shared/state scale and position, stage grounding, collision geometry and animated scene | Full gameplay lifecycle and FX integration |
| Hazard animation | All 27 hazards, frame bounds/crops/atlas/comparison; scene placement, HIGH/LOW clearance, animation FPS, collision geometry and moving pass | Full damage/recovery and production spawn integration |
| FX | Not yet connected | Stun-star frames and attachment/state behavior |
| Finish scene | Not yet connected | Marker artwork, transforms, grounding and end sequence |
| Stage/gameplay settings | Landscape transforms, shared pathway, global difficulty profiles and checked Design sequences | Complete field ownership and runtime-backed settings |
| Draft lifecycle | Whole-project Save all / Export all / Import; field diff, validation, required pre-import recovery, one-step import undo/redo, browser timestamp, v1/v2/v3 recovery and v6 placement/collision/calibration settings, v5/v4 recovery and artwork/source provenance | Production snapshot conversion; future fields join the same complete project |
| Stage navigation | Continent → Stage; available metadata only; remembered stage and asset per continent/stage | Expand with stage catalog; readiness/approval summary |
| Loading | Selected content only; decode-aware count, stale-selection guard, cached reuse, retry | Integrated scene readiness and measured cold-start/stage-switch timings |
| Test / Game | Visible as planned | Actual gameplay connection and full regression gate |

## Review 07 — Design interaction and direct editing

Implemented in the isolated candidate: production-derived movement/intersection adapter; per-step contact checks, latched contact, optional first-contact freeze, complete-pass clear result and Replay; real Jump and timed Slide; explicit Pose loop alternative; click-to-select/Editing target; numeric placement/grounding and hitbox handles with undo; Hand and Space-drag viewport panning. Editing invalidates prior pass results. Existing v5 persistence includes hitbox edits without schema changes. Browser layout/user acceptance remains pending. Test/Game full stage, damage/recovery/invulnerability, FX/finish and production draft adapter remain deferred; this is not replacement approval. Runtime Slide .75 s is preserved, with historical .70 s reconciliation separate.

## Assisted calibration — Review 08

Start with **Calibrate hazards → Optimize stage**. Select a result to see **Before / Proposed** in the Scene and numerical changes in the inspector. **Demo Claude / Demo Constance** automatically times the suggested Jump or Slide; flying hazards support HIGH and LOW. Freeze, Next frame and Replay still work. Mark the proposals you accept as **Reviewed**, then **Apply reviewed stage** or **Apply all reviewed**. A batch is one Undo step. **Save all / Export all / Import** include the complete result.

- **Shared pathway Y** belongs to the selected stage. It begins at the midpoint of the two current character foot references, with zero initial displacement. Moving it moves both characters and hazards with **Follow shared pathway** enabled. Character-only shared/state/stage corrections stay local; changes to either character invalidate the hazard checks. Re-optimize to update collision/clearance suggestions after a reference change. Auto-follow handles position; it does not silently rewrite approved hitboxes.
- Ground proposals use measured visible support from the existing cropped frames, accounting for transparent padding. HIGH flying clearance is derived from both Slide collision envelopes; LOW is placed relative to the shared pathway. Frame-to-frame support variation is flagged. These are reviewable suggestions, not new artwork metadata or image edits. Both characters remain fixed throughout optimization.
- Every manually changed hazard field is locked from optimization. You can toggle each field's lock explicitly. Turning **Follow shared pathway** off freezes the hazard at its current position and preserves its grounding during optimization; switching it back on links future pathway movement without a jump. Stage-specific placement and hitbox overrides remain available.
- The bounded solver checks all hazard starting frames against all Run starting frames for both characters at 60 simulation steps/s using production movement/intersection methods. It searches only plausible collision dimensions/clearances; it does not change artwork scale or character physics. Results report measured input windows and standing contact. **Needs adjustment** means the current target was not established; review can still apply its limited proposal, but it is not marked checked or eligible for a sequence.
- **Difficulty · global** stores editable Easy / Standard / Hard profiles: ground/flying speed, minimum input window, arrival/reaction spacing, count and maximum visible hazards. Easy starts at the proven base speed with a larger timing margin, fewer hazards, longer gaps and one visible hazard. Slowing an obstacle can make it harder to clear during a fixed-duration action, so lower speed alone is not labeled easier. Hard increases speed and density; Jump/Slide physics and hitboxes remain shared.
- **Generate stage sequence** checks the current applied draft, excludes hazards that miss the selected profile (listed by name), respects the per-hazard inclusion toggle, and verifies a complete action schedule for both characters. **Watch checked sequence** demonstrates it with automatic actions; freeze/step remain available. Change the scene character, then Watch again for the other character. A relevant edit, profile change or stage change requires regeneration. This is a deterministic Design demo, not the complete production spawn director or Test/Game mode.
- **Optimize all** visits all 27 currently available hazards across nine stages, with decoded-image reuse, visible progress and cancellation. Nothing is applied automatically. New v6 projects include pathway references, profiles, follow/include settings, locks and check provenance. Real v5 saves retain their existing edits; customized hazard fields migrate as locked. The older browser record is retained. Transient proposals and generated demos are not saved; regenerate them from the saved configuration.
- The compact Hand icon and Space + drag pan the zoomed preview without editing the draft.

Test and Game, damage/recovery, FX/finish authoring and full runtime snapshot conversion remain the next delivery milestones. Production files and the working GitHub Pages editor are unchanged.

## Continuous Scene playback — Review 08.1

**Play scene** now repeats continuously by default. **Loop** repeats the selected hazard pass, proposal action demo or checked stage sequence. Each repeat resets its actor/action schedule and contact result while the landscape and clouds continue on the existing world clock. The preceding result stays visible as **Previous**. This repeats the current scenario; it does not generate a new random course.

**Pause / freeze** retains the exact current time; **Next frame** advances one simulation step while frozen. **Stop** returns the scene to its beginning, frozen, retaining the selected demo/sequence. **Restart** returns to the beginning and plays. Turning Loop off finishes the current pass and stops at its endpoint. **Pause on contact** is an explicit exception: it freezes on the first contact of each pass. Selection, editing focus, project actions and hidden tabs retain their existing pause behavior. Controls wait for scene readiness.

Loop and transport state are preview settings; Save all/Export retain the same v6 project data. Artwork, calibration values, timing-window calculations and production runtime code are unchanged in this update.
