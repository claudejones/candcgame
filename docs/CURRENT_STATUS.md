# Current Status

Last updated: 2026-09-16

## Current reference baseline
`archive/LAB25Q/CHARACTER_STATE_LAB_25Q_WORLD_VISUAL_OWNERSHIP_QA.html`

LAB25Q remains the behavioral reference/test-harness baseline. It is preserved unchanged and is now being structurally extracted into modular code.

## Preservation checkpoint — COMPLETE
- Exact LAB25Q Git blob preserved under `archive/LAB25Q/`.
- Original uploaded assets preserved unchanged under `assets-original/current-generated/`.
- `/incoming` remains intact for provenance.
- All 27 current NA/SA/EU landscape PNGs remain preserved.

## Landscape replacement decision — LOCKED
Explicit decision 2026-09-16: regenerate all 27 existing NA/SA/EU landscape layers against a unified geometry + alpha + overscan contract, then use the validated contract for the remaining 36 landscape layers. Historical KEEP/REPAIR classifications remain diagnostic history, not the replacement plan.

`docs/LANDSCAPE_GENERATION_CONTRACT_V1.md` is now the test contract. Its 2172×724 source geometry and GROUND source anchor Y=393 are validation values, not final production authority until the rebuilt full harness proves them.

## Modular extraction checkpoint — PHASE 1 COMPLETE / PARITY IN PROGRESS
Created the production-oriented module skeleton:
- `src/index.html`
- `src/css/game.css`
- `src/css/qa.css`
- `src/js/main.js`
- `src/js/game.js`
- `src/js/renderer.js`
- `src/js/world.js`
- `src/js/player.js`
- `src/js/hud.js`
- `src/js/controls.js`
- `src/js/progression.js`
- `src/js/qa-harness.js`
- `src/js/config/gameplay.js`
- `src/js/config/worlds.js`
- `src/js/config/hazards.js`
- `src/js/config/qa.js`
- `qa/full-harness/index.html`

`src/legacy/lab25q/source.inspect.js` remains the inspectable behavioral source. The new shell intentionally does not re-embed LAB25Q base64 assets.

Important: the new modular shell is NOT yet declared LAB25Q-parity-complete. Player sprite rendering, exact HUD DOM/CSS/assets, external asset registry, hazard/spawn execution, finish behavior, full QA controls/checkpoint/export, and exact START RUN dependency parity still require extraction/verification.

## Recovered implementation evidence
LAB25Q uses a 960×540 QA canvas, cloud Y=0 / scale=.65 / opacity=.75, source-world contract 2048×682 with MID source baseline 621 and GROUND surface 393, historical per-stage world offsets, historical character-grounding overrides, and the established hazard/collision configuration. These remain parity evidence rather than the new standardized landscape target.

## Exact next steps
1. Externalize the preserved character/shared/hazard assets into `assets/` without altering `assets-original/`.
2. Extract exact LAB25Q player sprite renderer/frame/crop/anchor behavior and wire it to `player.js`/`renderer.js`.
3. Extract exact HUD markup/CSS/assets and control presentation rather than using the current structural shell placeholders.
4. Extract spawn director, collision, finish marker and persistent-red QA behavior into modules.
5. Restore the remaining LAB25Q QA controls in `qa/full-harness/`, keeping QA state isolated from production config.
6. Run parity QA against archived LAB25Q.
7. Once the full shell is trustworthy, generate the first complete replacement landscape stage FAR -> MID -> GROUND under `LANDSCAPE_GENERATION_CONTRACT_V1.md`, technical-QA it, and use that result to prove/refine the universal geometry before generating the other 24 validation images.

## Guardrails
- Archived LAB25Q and `assets-original/` remain immutable.
- Structural modularization must preserve gameplay behavior unless a separate explicit decision changes it.
- G1D is Slide, not Duck; production lock is 0.70s even though LAB25Q contains a historical 0.75s implementation value. Reconcile deliberately rather than silently inheriting it.
- Do not reintroduce per-stage geometry as the target solution for newly standardized landscapes.
