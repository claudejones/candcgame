# Asset Production Specification

## General
- Mobile-first landscape game.
- Preserve the approved Claude/Constance pixel-art visual baseline and stable palette/proportions.
- Final production assets are external files; do not embed new production assets as base64 in the final application architecture.
- Original generated/approved files are preserved under `assets-original/`; production-ready validated derivatives belong under `assets/`.
- Never modify an original merely to make integration easier.

## Approval workflow
Use `ASSET_COMMAND_WORKFLOW.md` for command execution and `PHASE8_LANDSCAPE_EXECUTION_PLAN.md` for Phase 8 scope/gates. Locked directions authorize internal generation, correction, direct replacement and deployment testing. One deployed integrated-stage visual acceptance closes the stage; no routine candidate/prompt pre-approval. Stop when the specified result passes. A requested revision changes only the affected layer/configuration.

Working Phase 8 validation assets may be replaced directly under `assets/phase8-validation/`; Git history is the rollback mechanism. `assets-original/` remains immutable. Rejected candidates and review renders are temporary working material and are not committed by default.

For new full-stage production from AF02 onward, completion means validated artwork and the versioned asset-ready handoff, followed by editor-next import and user calibration/save. Artwork review remains explicit; asset readiness is neither calibrated gameplay nor release approval. Asset agents inspect composition, source metadata and basic rendering, but do not iterate flight placement, hitbox fairness, action windows or spawn difficulty. The complete gameplay release gate applies after calibration. Existing approved stages and their evidence remain unchanged.

## World assets
For routine registered landscape commands, use `asset-profiles/landscape.md` and the resolver's selected prompt sections. Read `WORLD_RENDERING_SPEC.md` when changing its rules or diagnosing a conflict. Keep the focused profile synchronized with the source specifications.

Critical principles:
- FAR, MID and GROUND are coordinated parts of one stage composition.
- Each layer needs sufficient vertical coverage at its specified placement. Adopted canonical landscapes use FAR/MID/GROUND Y=0; do not use offsets to compensate for deficient art.
- FAR must exist behind intentional MID transparency.
- MID must not depend on excessive GROUND displacement to hide insufficient coverage.
- GROUND must contain sufficient terrain depth beneath the running surface.
- Horizontal seams must be clean for repeating layers/tiles.
- Calibration must not compensate for defective artwork.

Technical QA is mandatory: dimensions/presentation ratio, alpha behavior, seams, anchors/baselines, coverage, overlap, visual scale, and layer responsibility.

### Deterministic repeat-edge correction

Image generation remains the primary authoring method. When an otherwise acceptable generated landscape fails only because corresponding left/right edge colors produce a visible vertical line during horizontal repetition, a deterministic edge correction is authorized. The correction may feather edge color continuity so the repeated background scrolls continuously, but it must not redesign landmarks, change canvas dimensions or alpha ownership, rescale the composition, move anchors, or conceal a broader structural defect. The corrected file must pass a duplicated wrap preview and retain the generated candidate as its visual source.

## Character atlases
- Do not resize the approved source gameplay atlas itself as a content edit; the renderer reads real frame dimensions and scales selected frames into the world.
- Target normal standing/running visible character height is approximately 58–66 logical pixels in the intended 480x270 presentation.
- Claude and Constance retain natural proportional differences; gameplay fairness comes from tuned collision geometry rather than forcing identical visible dimensions.
- Stable frame boxes/anchors and clean transparent gutters are required.
- Claude top row, Constance bottom row for character atlases unless a locked asset-specific specification states otherwise.

## Flying flock hazards
For every multi-creature flock atlas:
- Every constituent bird/creature must visibly change wing pose across the full cycle.
- Define per-frame pose requirements for each creature, not only a flock-level instruction.
- Keep each body anchor stable while changing wing geometry.
- Maintain enough separation for every wing silhouette to remain readable.
- Preserve a stable aggregate collision footprint across frames.
- Prefer a two-creature flock over a three-creature flock if three cannot animate independently without excessive overlap.

## Hazard assets
Do not pre-normalize hazard sprite sheets merely because source canvases differ. Hazards are calibrated through scale, ground offset, crop/frame geometry and collision geometry. Repair/regenerate only when the source itself has a structural defect such as contaminated gutters, unstable anchors, unusable crop, or incomplete animation.

## Transparency
Use genuine alpha transparency where the asset contract requires it. Never bake a checkerboard transparency pattern into an asset.
