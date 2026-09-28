# Phase 7 Final Integration Cleanup Plan

Status: ACTIVE EXECUTION PLAN
Date: 2026-09-17

## Purpose
Phase 7 architecture is structurally complete, but the deployed development shell currently embeds the legacy Phase 6/LAB25 QA chrome inside the new DESIGN / TEST / GAME shell. This creates duplicate controls, stale build labels, conflicting collision toggles and an incomplete Game entry experience. This pass completes the integration without changing approved gameplay, art or calibration.

## Code audit findings

### 1. Legacy runtime UI is still the visible iframe document
`src/dev.html` and `src/game.html` both iframe `src/index.html`. `src/index.html` still owns the LAB25 debug box, Control Center / QA Production Config, calibration/status/legend text, tuner tab and old build label. The new Phase 7 shell therefore layers new controls around old QA controls rather than replacing their presentation.

### 2. New development modules still depend on legacy DOM controls
These dependencies prevent simply deleting the old markup:
- Landscape Editor: `stageSelect`, `qaFarToggle`, `qaCloudsToggle`, `qaMidToggle`, `qaGroundToggle`.
- Character Editor: legacy `[data-state]` buttons and `characterBtn`.
- Test Mode: `stageSelect`, `characterBtn`, `runStageBtn`, `resetStageBtn`/`exitRunBtn`, `objectBoundsToggle`, `guidesToggle`.
- Runtime Monitor: reads `characterLabel`, `stateLabel`, `frameLabel`, `worldRenderedSurface`, `scrollLabel`, `objectCollisionState`, `spawnTime`, `spawnPhase`.

Conclusion: hiding legacy chrome is safe only after the new shell can call/read a stable runtime API, or while hidden DOM hooks are deliberately retained. The target is a runtime API so the old QA UI is not an architectural dependency.

### 3. Collision bounds are split across two flags
Hazard/object bounds use `GAME_CONFIG.objectQA.showBounds`; character bounds use `GAME_CONFIG.characterQA.showCollisionBounds`. The current Test button toggles only the legacy object-bound control. In TEST mode one authoritative Collision Bounds control must set both flags together. Design mode may still enable asset-specific bounds contextually.

### 4. Build labels are component-local and stale
Mode shell hard-codes `PHASE 7J–7K • QA`; Runtime Monitor hard-codes `PHASE 7G–7I • QA`; legacy runtime contains historical LAB/Phase labels. Target: one shared development build identity: `PHASE 7 • QA`.

### 5. Game mode lacks an explicit ready/start state
Gameplay already has `GameplayDirector.start()` and the runtime HUD/action controls. The old QA Run button invokes that behavior, but the clean GAME shell has no first-class START affordance. Target: Game mode shows a clean ready overlay with stage/character context and START; START invokes the existing gameplay director without changing its 90-second course behavior.

### 6. Finish Marker has config but no Design visual authoring view
Runtime already loads `NA_STAGE_FINISH_MARKER.png` and renders it during the final release window. The canonical Design inspector exposes scale/X/ground adjustment but selecting Finish Marker does not provide a dedicated visual preview. Target: Design selection renders the approved shared finish-marker asset in an inspector preview and enables a stationary authoring preview in the shared viewport without altering gameplay timing.

### 7. Production isolation remains mandatory
Design/Test modules must remain unreachable from `src/game.html` and production bootstrap. Cleanup must not move development code into production. The production runtime may expose a small generic runtime API because Game needs it, but that API cannot import development modules.

## Target architecture after cleanup

### Shared runtime (`src/index.html` + `game-runtime.js`)
- Renderer, gameplay, HUD and gameplay actions only when hosted by Phase 7.
- Legacy QA DOM may remain temporarily in source for standalone historical compatibility, but is hidden in `?host=phase7-development` and `?host=phase7-production`.
- Exposes `window.CC_RUNTIME_API` with narrowly scoped methods/state required by Phase 7 shells.
- No stale Phase/LAB labels visible in hosted Phase 7 experience.

### DESIGN
- Asset Navigator + Contextual Inspector + Runtime Monitor + viewport.
- No LAB debug box, old Control Center, old calibration instructions, tuner tab or legacy status/legend.
- Landscape, Hazard, Character and Finish Marker editing use runtime API/direct canonical preview state, not visible old controls.

### TEST
- Focused Test controls only.
- Collision Bounds controls character and hazard bounds together.
- Ground Guide remains explicit.
- Runtime Monitor remains observational.
- No Design authoring or old QA chrome.

### GAME
- No Asset Navigator, Inspector, Runtime Monitor, Test controls or legacy QA chrome.
- Clean ready overlay with START.
- START invokes existing 90-second gameplay course.
- Existing HUD, Slide / Pause / Jump, failure/retry and finish behavior preserved.

## Runtime API contract
Expose a frozen `window.CC_RUNTIME_API` after the Lab instance is created. Minimum API:
- `getState()` — stage, character, state/frame, rendered surface, world scroll, hazard/collision, spawn/runtime status.
- `setStage(stageId)` — same reset/synchronization semantics as legacy stage selection.
- `setCharacter(character)` — deterministic Claude/Constance selection.
- `setCharacterState(state, options)` — Design inspection state without relying on `[data-state]` buttons.
- `startRun()` — existing `GameplayDirector.start()` semantics.
- `resetRun()` — existing gameplay reset/clean ready semantics.
- `toggleRunPause()` — existing gameplay pause semantics.
- `setCollisionBounds(enabled)` — sets both hazard and character collision flags.
- `setGroundGuide(enabled)`.
- `setWorldLayers({far,clouds,mid,ground})`.
- `setHazardPreview(stageId,index)` and/or equivalent preview synchronization.
- `redraw()`.

No method may persist configuration or write Git/source.

## Execution blocks

### Block A — Runtime bridge + clean hosted shell
Group together because they remove the root architectural dependency.
1. Add `CC_RUNTIME_API` around the existing Lab instance and preserve gameplay semantics.
2. Add hosted-runtime detection from `host=phase7-development|phase7-production`.
3. Hide legacy QA chrome in hosted Phase 7 runtime while retaining required hidden markup until bridge migration is complete.
4. Migrate Landscape Editor, Character Editor, Test Mode and Runtime Monitor from legacy clickable controls/text labels to `CC_RUNTIME_API` where practical.
5. Replace component build labels with one `PHASE 7 • QA` identity.
6. CI: verify API exists, hosted legacy chrome is suppressed, stale Phase 7G-I/7J-K labels are absent, production dependency isolation remains intact.

Checkpoint A: structural CI + syntax + preserved gameplay constants.

### Block B — Test/Game behavior + Finish Marker
Group together because these are user-visible completion items and can share one visual checkpoint.
1. TEST Collision Bounds toggles hazard + character bounds together through runtime API.
2. GAME ready/start overlay invokes `startRun()`; no hidden old Run button dependency.
3. GAME reset/retry path remains existing gameplay behavior.
4. Add Finish Marker Design preview using approved `../assets/shared/NA_STAGE_FINISH_MARKER.png`.
5. Ensure Finish Marker inspector changes update preview immediately and remain localStorage/export only.
6. Confirm mode transitions clean up mode-specific overlays/bounds/guides.

Checkpoint B: CI + mode-transition regression checks.

### Block C — Final cleanup/deployment
1. Remove any now-unused legacy bridge calls from Phase 7 development modules.
2. Keep legacy QA source only where still required for standalone compatibility; otherwise remove dead hosted presentation safely.
3. Verify one visible build identity only.
4. Verify DESIGN / TEST / GAME presentation boundaries.
5. Verify production entry contains no Design/Test dependencies.
6. Run final Production CI.
7. Deploy exact accepted SHA to Pages and verify deployed SHA marker.
8. Hand Phase 7 URL to user for full visual/functional testing.

Checkpoint C: final CI + Pages deployment.

## Regression invariants
Do not change during this cleanup:
- canvas 960x540
- canonical ground Y=410
- Phase 6 stage calibration evidence
- characterX=220; worldSpeed=120
- Slide runtime 0.75s (spec discrepancy remains deferred)
- hit recovery 1.10s; invulnerability 2.00s
- flying clearances HIGH 68 / LOW 18
- maxVisible=2; reactionLead=2.20
- approved Constance Slide crop frame 2 left=55
- approved assets/atlases and paths
- hazard definitions/signature sequencing
- HUD progress formula and gameplay controls
- localStorage-only authoring saves

## Acceptance criteria
Phase 7 cleanup is complete only when:
1. Hosted DESIGN shows only Phase 7 authoring UI + viewport + Runtime Monitor.
2. Hosted TEST shows only focused Test UI + viewport + Runtime Monitor.
3. Hosted GAME shows clean ready/start/gameplay UI with no QA/editor chrome.
4. One visible build label says `PHASE 7 • QA` in development; no stale LAB/phase labels are visible.
5. Test Collision Bounds toggles both character and hazard collision bounds.
6. Finish Marker has a visible Design preview.
7. New modules no longer require visible legacy QA controls.
8. Production CI passes against exact final SHA.
9. Pages deploys that exact accepted SHA before user testing.

## Sequence after acceptance
Only after this cleanup is visually/functionally accepted does Phase 8 landscape regeneration begin. After each stage landscape is finalized: character grounding -> hazard size/position -> collision/hitbox calibration.
