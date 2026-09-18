# Decision Log

Append-only record of important locked project decisions. Newer explicit decisions supersede older conflicting decisions, but history remains visible.

## 2026-09-16 — Repository becomes primary source of truth
The `candcgame` repository is the primary persistent authority for production requirements and current status across ChatGPT conversations. AI sessions must begin with `AGENTS.md` and `docs/CURRENT_STATUS.md`, then read task-specific specifications. Conversation memory is secondary when a locked repository specification exists.

## 2026-09-16 — Preserve before migration
LAB25Q and supplied original assets must be preserved before architectural cleanup. Migration from the embedded legacy harness to external assets/modules is incremental, with behavioral comparison against the preserved baseline. No wholesale rewrite is authorized by the migration decision.

## 2026-09-16 — Synthetic world backing removed
World appearance must not depend on a stage/continent synthetic backing color. LAB25Q changed the legacy board backing to transparent and added transient layer-isolation QA. This exposed incomplete authored world coverage that had previously been concealed.

## 2026-09-16 — Landscape responsibility clarified
FAR, MID and GROUND each require sufficient vertical coverage for their own visual responsibility and useful overlap/calibration room. FAR must provide valid scenery behind intentional MID transparency. MID cannot be undersized such that GROUND must be pushed unnaturally upward to hide a gap. GROUND must provide sufficient depth below the running surface. Y calibration positions good artwork; it is not a substitute for repairing deficient artwork.

## Earlier established production geometry — recovered 2026-09-16
The intended production composition established a logical 480x270 viewport, canonical `GROUND_BASELINE_Y = 205`, approximately 65 logical pixels of depth below the running surface, approximately 960-wide repeating DISTANT/MID presentation layers, and approximately 240x65 repeating GROUND tiles. Later LAB integration used a 960x540 QA canvas and 2048x682 authored-world geometry. These must be reconciled deliberately rather than assuming the later QA implementation replaced the earlier production contract.

## Continent production workflow
Complete/approve all assets for all three stages of a continent before continent integration. Then perform full end-to-end QA/calibration. Remaining stages follow: stage spec -> vision mockup -> individual assets under approval gate -> continent integration -> QA.

## Flying flock animation contract
Every constituent bird/creature in a multi-creature flying hazard must visibly animate across the full cycle with stable body anchors and readable independent wing silhouettes. Prefer fewer creatures over accepting a partially static flock member.

## 2026-09-16 — LAB25Q externalization blueprint approved
`docs/LAB25Q_EXTERNALIZATION_BLUEPRINT.md` is the execution authority for the LAB25Q migration. The archived LAB25Q is the sole behavioral/visual source baseline. First prove CSS/JavaScript externalization while retaining the exact embedded image bytes; then build a semantic asset manifest and replace current approved named assets incrementally with explicit geometry classification and parity checks. Positional/occurrence-order asset replacement is rejected. JavaScript modularization occurs only after external-asset parity. CI/deployment success alone is not parity approval.

## 2026-09-17 — Phase 6 production naming and cleanup
Production source must not use LAB25Q as its active application/module identity. LAB25Q is historical reference terminology reserved for the archived harness and migration history. Active runtime names are `game-config.js`, `game-runtime.js`, and `game.css`; the active configuration global is `window.GAME_CONFIG`.

Duplicate/dead migration runtime files and completed one-time migration workflows are removed from the active codebase after their work is complete. Preserved history remains under `archive/` and in Git history. QA builds expose a visible phase identifier so screenshots and regression reports identify the tested build family.

Phase 6 remains behavior-preserving. Landscape regeneration, grounding, hazard sizing/positioning, hitbox calibration, Slide timing reconciliation, and load optimization remain separate follow-on work.

## 2026-09-17 — Phase 7 production authoring architecture
Phase 7 precedes landscape regeneration and establishes the authoring architecture. `docs/PHASE7_AUTHORING_ARCHITECTURE_EXECUTION_SPEC.md` is its step-by-step execution authority.

The canonical runtime coordinate system is 960x540. Device/browser scaling is presentation-only; gameplay geometry remains in canonical coordinates. FAR, MID and GROUND overlap in the same viewport. A single fixed production ground surface is to be locked in Phase 7A and becomes the vertical anchor from which character feet, grounded hazards and finish markers derive.

The production landscape rule is locked in `docs/WORLD_RENDERING_SPEC.md`: FAR normally renders from Y=0 and owns complete skyline/top coverage; FAR/MID/GROUND use deliberate overscan and overlap; source anchors map deterministically into the canonical viewport; offsets calibrate correctly authored artwork rather than conceal missing coverage.

Design, Test and Game modes use the same renderer/configuration but different modular application shells. The packaged production game must exclude Design/Test authoring and QA modules. A development bootstrap may attach those modules; the production bootstrap imports only production runtime/game modules.

Atlas/sprite-sheet assets remain the preferred strategy where related assets or animation frames naturally belong together. The authoring model is SOURCE REGION -> FINE CROP -> SCALE -> POSITION -> COLLISION. Source rectangles are editable/inspectable, including a full-atlas view; crop cannot reveal pixels outside the selected source rectangle. Numeric authoring controls provide direct numeric entry plus increment/decrement stepping for precision.

Phase 6 calibration settings remain evidence until replacement assets are authored. Phase 8 landscape regeneration cannot begin until Phase 7 authoring architecture and the fixed ground-surface contract are accepted.

## 2026-09-17 — Phase 7A canonical coordinate contract
The fixed production logical viewport is 960x540 and the canonical production ground surface is `GROUND_SURFACE_Y = 410`. This is the exact 2x mapping of the recovered original 480x270 composition with `GROUND_BASELINE_Y = 205`, preserving the original vertical composition ratio and 130 logical pixels of terrain depth below the surface.

Legacy stage `seamY` and `groundYOffset` values are calibration evidence, not production gameplay-coordinate authority. In the current Phase 6 renderer their source-anchor terms cancel, so the effective legacy gameplay surface is `seamY + groundYOffset`. The production model separates artwork placement from gameplay anchoring: character feet, grounded hazards, flying clearances and finish markers derive from the fixed Y=410 surface, while landscape source anchors and visual offsets determine artwork placement only.

## 2026-09-17 — Phase 7B canonical configuration schema
The canonical configuration model separates authored production configuration, legacy Phase 6 compatibility calibration, transient runtime state, and development/QA state. The shared visual vocabulary is `SOURCE REGION -> FINE CROP -> SCALE -> POSITION -> GAMEPLAY ANCHOR -> COLLISION`.

Source region is independently editable and is the authority for which atlas pixels belong to an asset. Fine crop is non-negative and can only remove pixels inside that source region; revealing more artwork requires moving or expanding the source region. This preserves atlas strategy and resolves cases such as the Gaudí Mosaic Bench without negative crop or atlas explosion.

Canonical character, hazard and finish gameplay anchors derive from `GROUND_SURFACE_Y = 410`. Legacy seams and landscape offsets remain explicitly representable as compatibility evidence until regenerated landscapes replace them. The Phase 7B adapter must not mutate the live Phase 6 configuration or renderer; visible Phase 6 behavior remains the regression baseline while later Phase 7 gates migrate the renderer and application bootstraps.

## 2026-09-17 — Phase 7C production/development bootstrap boundary
Production and development now have explicit entry boundaries. `src/game.html` is the production GAME entry and may load the production bootstrap/shared runtime only; it must not depend on the development bootstrap, `src/js/dev/**`, or the development mode shell. `src/dev.html` is the development/QA entry and may attach DESIGN / TEST / GAME shell modules around the same mounted shared renderer/configuration instance.

The preserved Phase 6 `src/index.html` remains the shared runtime host during this migration gate so 7C does not duplicate or rewrite gameplay/rendering logic. This is intentionally transitional: remaining legacy QA responsibilities inside that host are extracted by later Phase 7 editor/test/game gates. The final consumer package must still omit development/QA modules, and CI must enforce the production dependency boundary rather than relying on hidden UI.

## 2026-09-18 — Phase 7 animated-hazard authoring feedback correction
In Design mode, a paused animated-hazard preview is locked to the frame explicitly selected in the contextual inspector. Play advances that same deterministic preview; it does not depend on the shared flying-hazard clock. Per-frame Fine Crop remains non-negative and affects visual rendering only, without changing collision geometry. The contextual inspector exposes hazard and character preview-guide toggles and an enlarged cropped-frame preview so source-pixel changes can be inspected before save/export.

## 2026-09-18 — Phase 7 visually accepted; Phase 8 authorized
The user confirmed that the final animated-hazard pause-control correction resolved the observed issue and accepted Phase 7 as complete. Later defects may be handled as they arise, but they do not keep Phase 7 open by default.

Phase 8 landscape work is now authorized to enter pre-production. Authorization does not waive any asset lock or approval gate: the current landscapes are audited before mutation, each proposed repair is approved and produced iteratively, and no new continent is partially integrated. Phase 8 must preserve the accepted Phase 7 renderer, fixed 960x540 viewport, Y=410 ground surface, immutable originals, and GitHub review/CI/deployment workflow.
