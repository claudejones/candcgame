# Current Status

Last updated: 2026-09-17

## Production baseline
Phase 6 is complete and user-verified. Phase 7 establishes the production authoring architecture before Phase 8 landscape regeneration.

Active shared Phase 6 runtime source:
- `src/index.html`
- `src/css/game.css`
- `src/js/game-config.js`
- `src/js/game-runtime.js`
- external semantic assets under `assets/`

Phase 7 development architecture now includes:
- `src/game.html` — production GAME entry
- `src/dev.html` — development/QA DESIGN / TEST / GAME entry
- `src/js/bootstrap/production-bootstrap.js`
- `src/js/bootstrap/development-bootstrap.js`
- `src/js/dev/mode-shell.js`
- `src/js/dev/asset-navigator.js`
- `src/js/dev/design-draft.js`
- `src/js/dev/contextual-inspector.js`
- `src/js/config-schema.js`

## Migration status
- Phase 0 inventory: COMPLETE
- Phase 1 HTML/CSS/JS extraction: COMPLETE / user verified
- Phase 2 semantic asset mapping: COMPLETE
- Phase 3 asset classification: COMPLETE
- Phase 4 external asset migration: COMPLETE / user verified across all 9 current stages
- Phase 5 configuration extraction: COMPLETE / user verified
- Phase 6 production naming/cleanup: COMPLETE / user verified
- Phase 7A coordinate and viewport contract: COMPLETE
- Phase 7B canonical configuration schema: COMPLETE / CI accepted
- Phase 7C modular application shell/bootstrap split: COMPLETE / CI accepted
- Phase 7D Design Asset Navigator: COMPLETE / CI accepted
- Phase 7E Contextual Inspector framework: IMPLEMENTED / CI acceptance pending
- Phase 7F Landscape editor: NEXT after 7E acceptance

## Coordinate/config authority
Canonical logical viewport: `960 x 540`.
Canonical production ground surface: `GROUND_SURFACE_Y = 410`.
Canonical asset vocabulary: `SOURCE REGION -> FINE CROP -> SCALE -> POSITION -> GAMEPLAY ANCHOR -> COLLISION`.

Legacy stage `seamY` and landscape offsets remain compatibility/calibration evidence only and are not canonical gameplay-coordinate authority.

## Phase 7C application boundary
`src/game.html` is the production entry and loads the production bootstrap only. `src/dev.html` is the development/QA entry and loads development-only modules. Both mount the same preserved runtime host. Production CI prevents the production entry/bootstrap from referencing development modules.

## Phase 7D Design Asset Navigator
DESIGN mode provides continent/stage navigation and Landscape FAR/MID/GROUND, individual Hazards, Character, Finish Marker and Stage/Global selection. Selection lives in `window.CC_DESIGN_SELECTION`, separate from gameplay and saved configuration.

## Phase 7E Contextual Inspector
DESIGN mode now has a right-side Contextual Inspector driven by the Asset Navigator selection. Numeric authoring controls use a directly editable number field plus minus/plus step buttons for precision.

Hazard inspection explicitly separates atlas SOURCE REGION (X/Y/W/H) from FINE CROP (L/R/T/B), followed by transform and collision controls. Atlases remain the production strategy; 7E does not split atlases into individual image files.

`window.CC_DESIGN_DRAFT` creates an isolated canonical draft from the Phase 7B compatibility view. Inspector edits change only that draft: they do not mutate `GAME_CONFIG`, the shared Phase 6 runtime, or gameplay state. Dirty state is tracked per stage. REVERT restores the last saved draft state, SAVE STAGE accepts the current in-browser draft as its new saved baseline, and EXPORT downloads the exact stage draft as JSON.

SAVE STAGE in 7E is intentionally an in-browser authoring action, not a Git write. Persisting approved authored values into repository production configuration is a later explicit integration step. Live viewport application of draft values begins with the specialized editors starting in 7F.

## Known deferred calibration/content work
- landscape FAR/MID/GROUND geometry/alignment regeneration
- final character grounding/positioning after landscape correction
- hazard visual size/position calibration after landscape correction
- hazard/player collision hitbox calibration after landscape correction
- historical LAB25Q Slide 0.75s versus production-spec 0.70s reconciliation
- cold first-load optimization / staged asset loading

## Next production step
After 7E CI acceptance, proceed to Phase 7F: Landscape editor with FAR/MID/GROUND visibility, guides, source/transform controls and live design-preview application against the shared renderer.

Do not begin Phase 8 landscape regeneration until Phase 7 is accepted.

## Guardrails
- `archive/` and `assets-original/` remain immutable.
- Approved character/hazard/shared assets are not regenerated, resized, normalized, or replaced for convenience.
- Structural changes preserve the user-approved Phase 6 behavior unless a separate explicit decision changes gameplay.
- Legacy Phase 6 calibration values remain evidence until replacement assets are authored.
- G1D is Slide, not Duck.
