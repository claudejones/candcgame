# Asset Production Specification

## General
- Mobile-first landscape game.
- Preserve the approved Claude/Constance pixel-art visual baseline and stable palette/proportions.
- Final production assets are external files; do not embed new production assets as base64 in the final application architecture.
- Original generated/approved files are preserved under `assets-original/`; production-ready validated derivatives belong under `assets/`.
- Never modify an original merely to make integration easier.

## Approval workflow
For each remaining stage:
1. Research and approve stage specification.
2. Generate and approve stage vision mockup.
3. Generate individual final assets one at a time under the approval gate.
4. Technical QA each generated asset before visual lock.
5. Complete all three stages for a continent.
6. Integrate the entire continent.
7. Run end-to-end QA/calibration.

Do not integrate partially completed continents unless an explicit decision changes this workflow.

## World assets
Read `WORLD_RENDERING_SPEC.md` before producing or repairing any landscape.

Critical principles:
- FAR, MID and GROUND are coordinated parts of one stage composition.
- Each layer needs sufficient vertical coverage for its responsibility and reasonable independent Y calibration.
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
