# Current Status

Last updated: 2026-09-16

## Current reference baseline
`archive/LAB25Q/CHARACTER_STATE_LAB_25Q_WORLD_VISUAL_OWNERSHIP_QA.html`

LAB25Q remains the behavioral reference/test-harness baseline. It is preserved unchanged and is now being structurally extracted into modular code.

## Preservation checkpoint — COMPLETE
- Exact LAB25Q Git blob preserved under `archive/LAB25Q/`.
- Original uploaded assets preserved unchanged under `assets-original/current-generated/`.
- `/incoming` remains intact for provenance.
- Inventory recorded in `docs/ASSET_INVENTORY.md`.
- 63 uploaded files accounted for: 1 LAB25Q HTML + 60 PNG assets + 2 `.DS_Store` files.
- All 27 current NA/SA/EU landscape PNGs are accounted for.

## Landscape analysis checkpoint — COMPLETE
The technical alpha/content audit established that the current landscape family is not internally standardized even where outer PNG dimensions are similar. The previous KEEP/REPAIR disposition was useful diagnostic history but is no longer the production replacement plan.

Explicit decision 2026-09-16: regenerate all 27 existing NA/SA/EU landscape layers against a new unified geometry + alpha + overscan contract, then use that validated contract for the remaining 36 landscape layers.

## Modular extraction checkpoint — IN PROGRESS
- `src/legacy/lab25q/source.inspect.js` now exposes the LAB25Q JavaScript without giant embedded image payloads, making the actual implementation inspectable.
- `src/legacy/lab25q/source.css` preserves extracted LAB25Q styling for migration reference.
- Initial modular configuration has begun under `src/js/config/`.
- `docs/MODULAR_MIGRATION_PLAN.md` is the active migration plan.

Recovered LAB25Q implementation facts include a 960×540 QA canvas, cloud Y=0 / scale=.65 / opacity=.75, source-world contract 2048×682 with MID source baseline 621 and GROUND surface 393, plus historical per-stage world and character-grounding offsets. These are implementation evidence, not the new universal landscape contract.

## Current workstream
Rebuild the full LAB25Q QA harness as modular production-oriented code while preserving validated gameplay behavior. Recover the real START RUN execution path, HUD, controls, player state/rendering, world renderer, cloud behavior, hazards, progression and QA controls rather than approximating them.

In parallel, finalize the unified landscape generation specification. The contract must define not only source dimensions but functional alpha/content geometry, running-surface anchor, required FAR/MID/GROUND coverage, intentional overlap/overscan and technical tolerances suitable for AI-generated artwork.

## Exact next steps
1. Complete LAB25Q source extraction and map the START RUN dependency chain.
2. Extract HUD, controls, player, renderer/world, hazards/progression and QA controls into dedicated modules under `src/js/`.
3. Build `qa/full-harness/` from those real modules and verify parity against archived LAB25Q.
4. Lock the unified landscape pixel/alpha/overscan contract and automated acceptance checks.
5. Regenerate the 27 NA/SA/EU landscape assets as the contract-validation batch, preserving originals under `assets-original/`.
6. Validate each regenerated layer technically, then validate all nine stages in the full harness with one universal world geometry and one character ground anchor.
7. Use the proven contract for the remaining 36 landscape assets.

## Guardrails
- Archived LAB25Q and `assets-original/` remain immutable.
- Structural modularization must preserve gameplay behavior unless a separate explicit decision changes it.
- G1D is Slide, not Duck.
- Do not reintroduce per-stage geometry as the target solution for newly standardized landscapes.
