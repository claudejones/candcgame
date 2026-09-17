# LAB25Q Externalization Blueprint

Status: APPROVED / EXECUTION AUTHORITY
Approved: 2026-09-16

## Objective
Create the new maintainable version of LAB25Q without redesigning or reconstructing it. The immutable source and behavioral/visual reference is:

`archive/LAB25Q/CHARACTER_STATE_LAB_25Q_WORLD_VISUAL_OWNERSHIP_QA.html`

The transformation contract is:

- HTML structure -> SAME HTML/DOM structure
- inline `<style>` -> external CSS, same rules/order/cascade
- inline `<script>` -> external JavaScript, initially same code/order/execution behavior
- embedded `data:image/...` -> semantically matched current named assets under `assets/`
- constants/configuration -> SAME LAB25Q implementation values during parity extraction unless a separately documented production lock explicitly requires later reconciliation

This is an extraction and externalization task, not a rewrite.

## Non-negotiable preservation rules
- `archive/` is immutable.
- `assets-original/` is immutable.
- Current approved named assets under `assets/` are the runtime asset authority.
- Do not resize, crop, regenerate, normalize, or otherwise modify an approved asset merely to make integration easier.
- Do not redesign LAB25Q DOM, CSS, HUD, controls, QA panels, canvas layout, startup state, gameplay, or renderer during externalization.
- Do not use positional/occurrence-order image substitution as semantic proof.
- Do not declare success merely because files build, tests execute, or GitHub Pages deploys.

## Phase 0 — Exact source inventory
Before creating the replacement runtime, inventory LAB25Q itself:

1. DOM structure and IDs/classes.
2. Every inline CSS block and its source position/order.
3. Every inline JavaScript block and its source position/order.
4. Every embedded image payload.
5. The JavaScript/HTML/CSS semantic role that owns or consumes each embedded image.
6. Embedded image dimensions and relevant atlas/frame geometry.
7. Renderer assumptions associated with each image: cell dimensions, frame count, row, crop/source rectangle, anchor, scale, offsets, collision geometry where relevant.
8. Configuration constants and initialization order.

Output: a source manifest that identifies assets by semantic role, not by occurrence number.

## Phase 1 — Prove code externalization independently of asset replacement
Create a controlled verification build directly from LAB25Q:

- Preserve the LAB25Q DOM.
- Externalize CSS without changing rule content/order/cascade.
- Externalize JavaScript without rewriting logic or changing execution order.
- KEEP the exact LAB25Q embedded image bytes during this phase.
- KEEP LAB25Q implementation configuration values during this phase.

Acceptance gate: the externalized-code build must render and behave equivalently to archived LAB25Q before any current named asset is substituted.

If this gate fails, fix the extraction mechanism. Do not proceed to asset replacement.

## Phase 2 — Build the semantic asset manifest
For every embedded LAB25Q image, identify its current named asset by code/runtime role.

For each mapping record:

- LAB25Q semantic role/reference
- embedded image identity/dimensions
- current named asset path
- current asset dimensions
- embedded atlas/frame geometry where applicable
- current atlas/frame geometry where applicable
- renderer dependency/metadata
- classification/result

No asset may be mapped solely because it is the Nth embedded image in the document.

## Phase 3 — Classify every asset replacement
Each mapping must be classified before substitution.

### A — Direct replacement
The current named asset is geometrically compatible with LAB25Q's renderer assumptions. Replace only the image source/path.

### B — Approved asset with changed geometry
The current approved asset differs from the historical embedded image in geometry/layout. Use the current approved asset and explicitly identify the minimal integration metadata required by its real geometry, such as cell dimensions, frame count, row, crop inset/source rectangle, anchor, scale, or offset.

Only asset-integration metadata may change at this stage. Do not alter unrelated gameplay or UI behavior.

### C — Mapping uncertain
Stop that asset. Do not substitute it until its semantic correspondence is proven.

## Phase 4 — Replace assets incrementally by system
Do not replace all embedded images in one operation.

Recommended verification sequence:

1. HUD/shared UI imagery
2. Character Run
3. Character Idle
4. Character Jump
5. Character Slide
6. Character Hit
7. Character Celebrate
8. Character FX/stars
9. North America assets
10. South America assets
11. Europe assets
12. Shared world/finish/cloud assets

After each system replacement, verify rendering and behavior against the known-good Phase 1 build. If a regression appears, stop at that system and diagnose the exact mapping/geometry difference before continuing.

## Phase 5 — Modularize JavaScript only after external-asset parity
Once all approved named assets are external and the application is parity-verified, split the known-good JavaScript into sensible modules incrementally.

Potential boundaries include:

- configuration
- asset registry/loading
- player
- world
- hazards/director
- HUD/progression
- controls
- QA harness
- initialization/main

Module extraction must not rewrite behavior. Verify after each meaningful extraction step.

## Phase 6 — Final acceptance criteria

### Structural
- zero runtime `data:image` payloads
- CSS external
- JavaScript external and maintainably organized
- runtime imagery references named files under `assets/`
- no anonymous/unmatched fallback assets
- no obsolete experimental QA applications
- `archive/` and `assets-original/` untouched

### Behavioral
At the same configuration/state, preserve LAB25Q behavior for:

- startup and initial UI state
- controls and QA panel behavior
- player animation states
- movement/physics
- hazard director/timing/signatures
- collision behavior
- pause behavior
- hit/recovery/invulnerability
- HUD/progress/lives
- world rendering and calibration
- finish behavior

Any later production-spec reconciliation (for example an explicitly locked production value that differs from historical LAB25Q implementation) must be a separate documented change after extraction parity, not silently folded into this migration.

### Visual
At the same viewport/state, the externalized version must be visually equivalent to LAB25Q except for intentional use of a newer approved asset. Any intentional visible difference must be traceable to that approved asset and its documented integration metadata.

### Performance
Measure initial load and runtime asset loading. The externalized application must not introduce the severe loading regression seen in the rejected migration attempts.

## Required validation discipline
A green CI/build/deployment means only that the artifact was generated/deployed. It is not visual or behavioral parity approval.

Parity requires explicit comparison against archived LAB25Q at meaningful checkpoints. Validation should isolate one class of change at a time so failures have a known cause.

## Execution sequence summary

`LAB25Q immutable source -> exact inventory -> externalize CSS/JS while retaining embedded image bytes -> parity gate -> semantic asset manifest -> classify each asset -> incremental asset substitution + verification -> all assets external -> incremental JS modularization -> final structural/behavioral/visual/performance QA -> production baseline`
