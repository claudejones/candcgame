# Current scope — Design and Game

This supersedes the broader proposal below. The user confirmed the existing Design implementation is the foundation. Preserve its movement, geometry, rendering, calibration, sequence generation, previews and saved settings. Remove the separate Test mode. Reuse existing modules and add only the missing Game-session behavior and approved LAB25Q HUD/controls/assets, following Design module and asset-loading conventions. Do not replace the working sequence/difficulty foundation with the legacy director. Remove development notices and audit/roadmap links from the product UI.

Implemented in this update: two visible modes; original sprite hearts, progress path and both avatar markers; centered Slide/Pause/Jump controls; Ready/Start and pause/retry overlays; original finish marker; gameplay pause disables actions and displays Idle. Current checked Design sequences pass by detached snapshot into manual Game runs when stage/profile/settings still match. Without a current matching checked sequence, the existing finite-run scheduler remains in use. Design movement/geometry/preview/optimizer modules are unchanged. A narrow read-only sequence getter is the only addition to its calibration controller.

Remaining: browser/mobile visual confirmation, final global screens/progression integration and independent Build Game delivery. These were not implemented or certified by this update.

---

## Superseded broader proposal (historical reasoning only)

# LAB25Q migration plan — September 21, 2026

## Authority and scope

The user rejected Review26's Test/Game presentation. The approved source is `archive/LAB25Q/CHARACTER_STATE_LAB_25Q_WORLD_VISUAL_OWNERSHIP_QA.html` in `claudejones/candcgame`, verified Git blob `fe4da6ab86218ed363e81f8dbd9a8d9d53482ee9`. Review25/26 are provisional integration work, not the visual or gameplay authority. This is a source-analysis plan, not a completed migration or visual approval.

Read the original HTML's CSS, DOM, CharacterMachine, ObjectQA, GameplayDirector and Lab update/input flow. The archive remains immutable. A readable local analysis copy omits embedded image payloads; that copy is not an asset source. Extract any missing assets from original bytes, once, with dimensions and hashes. Preserve current imported stage images and all calibrated draft/saved settings.

## Findings and extraction map

| Source responsibility | Current destination | Migration treatment |
| --- | --- | --- |
| HUD CSS/DOM and GameplayDirector.drawHUD | play-ui.mjs and scoped CSS | Restore sprite hearts, pulse states, original path art, character markers and stage heading. Separate read-only HUD view data from simulation. |
| Gameplay actions and Lab input handlers | play-ui.mjs input adapter | Restore Slide / centered Pause / Jump on the game surface, pressed/disabled states and safe-area placement. Route keyboard and touch through the same commands. |
| CharacterMachine and ObjectQA geometry | runtime-rules.mjs and scene-model.mjs | Reconcile existing extraction against original animation, slide, crop, collider and grounding behavior. Reuse shared functions; do not install a second character engine. |
| GameplayDirector planning and update | play-runtime.mjs or focused director module | Replace provisional round-robin scheduling with extracted seeded templates, arrival timing, reaction queue and authored stage signatures. Remove DOM access and mutable global CONFIG dependencies. |
| Hit/recovery, invulnerability and stars | shared runtime and scene renderer | Preserve recovery input lock, moving course during nonfatal hits, second-frame stars/blink and character-specific atlas rows. Verify restored atlas against source. |
| finishGeom, failure, retry and completion | runtime, scene renderer and UI | Restore original finish marker and release positioning; reconcile finish timing explicitly. Current completion waits for clearance, whereas LAB25Q completes at stageDuration. |
| Scene and Lab orchestration | existing landscape renderer and mode controller | Retain current artwork/config adapters; isolate time, input, rendering and diagnostic controls. |
| Legacy calibration DOM/global CONFIG | existing Design/project model | Map required fields through a documented snapshot adapter. Do not transplant old controls, globals or default settings over Workbench data. |

Concrete mismatches: the current Pause preserves pose and runtime accepts actions while paused; LAB25Q switches to Idle, blocks avoidance input, then returns to Run. Its gameplay pause is separate from lab frame inspection. The original director defines stage signatures for NA/SA/EU only and falls back to an EU03 sequence; do not silently apply that fallback to the other twelve stages. Enumerate missing signatures as unresolved authoring coverage, separate from runtime migration. Existing difficulty/reaction/capacity settings must be mapped explicitly rather than discarded to match old defaults.

## Four implementation steps

1. **Freeze the reference and specify contracts.** Inventory HUD/FX/finish assets and their hashes, state transitions, event ordering, world/cloud pause behavior, coordinate units and stage coverage. Record keep/replace decisions for each current module. Compare both characters in NA01 at ready, running, jump, slide, hit, paused, failed and finished states. Define configuration mappings and list genuine conflicts. Deliverable: reference fixtures and a behavior/asset mapping before runtime edits.

2. **Extract shared gameplay behavior.** Refactor pure state transitions, seeded planning, arrival timing, hit/recovery and finish geometry into small modules using explicit configuration and runtime state. Reuse existing Design movement/geometry where parity is established. Keep mutable run state outside draft/saved settings. Compare deterministic event traces with the original under identical inputs/configuration; explicitly document timing adaptations needed for fixed-step simulation. Deliverable: one shared engine with NA01 parity for both characters, with Test diagnostics attached externally.

3. **Migrate the approved presentation.** Externalize original embedded HUD/finish art without conversion or resizing; scope the source's styles and DOM to the game surface. Bind the extracted runtime to the original HUD, centered controls, hit effects, failure/retry and finish presentation. Add the user's requested clickable Ready → Start overlay in both Test and Game using the approved visual language; record it as an explicit addition rather than an existing LAB25Q feature. Verify real browser screenshots and interactions at desktop and mobile landscape sizes. Deliverable: matching presentation in both modes, with diagnostics only in Test.

4. **Verify across Workbench and prepare independent packaging.** Check all 21 stage asset/config mappings, both characters and applicable difficulties; expose unresolved signature coverage instead of inventing approved sequences. Exercise Design → Test → Game → Design, unsaved edits, save/import/export, restart, blur/pause, collisions and finish. Verify original image hashes and unchanged configuration exports. Keep pending start/map/trophy screens behind clear integration interfaces. Build Game must consume the same engine plus a fixed configuration/assets snapshot and exclude Workbench UI. Validate a separately hosted mobile web build before calling packaging complete.

## Acceptance and boundaries

- No bulk copy of the monolithic Lab or embedded Base64. Each extracted responsibility has a defined input/output contract and a traceable source counterpart.
- No re-import of legacy stage artwork or resets of positioning, crops, hitboxes, pathway links, difficulty settings or saved data.
- Reference behavior tests and browser comparisons are required. Existing 126 simulation cases and fake-DOM tests do not establish LAB25Q visual or behavioral parity.
- Check heart depletion/pulse, both progress markers at start/end, button positions, paused input blocking, stars/recovery, scrolling separation, failure/retry and finish on the actual rendered surface. Physical-device verification must be reported separately if unavailable.
- New global screens/progression from the user's parallel work require their current delivery contract; do not infer them from obsolete legacy progression rules.
- Implement in reviewable increments, starting with reference/contract inventory and NA01 for both characters. No further independent UI redesign. This planning checkpoint changes no deployed game code.
