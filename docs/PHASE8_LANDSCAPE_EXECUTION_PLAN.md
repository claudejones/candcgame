# Phase 8 Landscape Execution Plan

Status: DRAFT FOR USER APPROVAL  
Date: 2026-09-18

## Purpose

Phase 8 regenerates the world landscapes for the accepted Phase 7 renderer and universal production geometry without redesigning approved systems or discarding approved visual direction. This plan consolidates the existing landscape specifications into an executable sequence. It does not itself authorize an asset generation.

## Locked authority

- GitHub remains the primary source of truth.
- The accepted renderer uses a 960x540 logical viewport and `GROUND_SURFACE_Y = 410`.
- FAR, MID and GROUND overlap; they do not occupy three non-overlapping horizontal bands.
- FAR owns complete skyline/top coverage and provides valid scenery behind intentional MID transparency.
- GROUND aligns its authored running surface to Y=410 and provides adequate depth below it.
- Positioning correct artwork must not be used to conceal missing artwork.
- `archive/` and `assets-original/` remain immutable.
- Approved character, hazard and shared assets remain locked unless a later explicit decision opens them.
- Image generation/editing remains iterative and asset-by-asset, with explicit approval gates.
- All three stages of a continent are completed and approved before that continent is integrated and subjected to end-to-end QA.

## Landscape scope

The nine existing NA/SA/EU stages contain 27 landscape layers: nine FAR, nine MID and nine GROUND. All 27 form the standardized-contract validation batch and will be regenerated.

The earlier technical audit classified their current condition as 21 KEEP and six REPAIR. Those labels remain useful evidence about visual content and failure severity, but they do not define Phase 8 scope. KEEP means preserve the approved visual identity and use the source as a reference; it does not mean preserve legacy canvas geometry.

Regeneration is required because the current sources and compatibility configuration encode inconsistent dimensions, internal horizons, alpha boundaries, source anchors, layer coverage and vertical compensation. The accepted target is one authored geometry contract, one Y=410 running surface and no stage-specific world Y/scale or character-grounding correction as the normal solution.

The remaining 12 stages and their 36 landscape layers are later Phase 8 production scope. Their exact themes and specifications must be recovered or explicitly approved; they must not be invented from assumptions.

## Execution sequence and approval gates

### 8A — Plan and composition baseline

1. Approve this execution plan.
2. Capture all nine existing stage composites in the accepted Phase 7 Design renderer at 960x540/Y410.
3. Inspect FAR, MID and GROUND both composited and isolated, with synthetic backing disabled.
4. Record seams, transparency holes, anchor alignment, repeat behavior, overscan and lower-depth coverage.
5. Confirm the standard source-space ground-anchor value through the pilot evidence; do not resolve legacy 393-versus-near-400 evidence by assumption.
6. Select one complete stage as the validation pilot and approve its FAR, MID and GROUND briefs.

Gate 8A: no image generation begins until the user approves the plan and the pilot FAR, MID and GROUND briefs.

### 8B — One complete validation pilot

1. Regenerate the FAR layer from its approved reference and present it for visual approval.
2. Regenerate the MID layer from its approved reference and present it for visual approval.
3. Regenerate the GROUND layer from its approved reference and present it for visual approval.
4. Run technical QA on dimensions, transparency, repeat behavior, source anchor, overscan and file integrity.
5. Run the complete FAR/MID/GROUND composite through Design, Test and Game modes.
6. Calibrate in order: character grounding, hazard visual size/position, collision/hitboxes and finish-marker placement.
7. Refine and lock the production landscape contract from observed results.

Gate 8B: each regenerated layer is reviewed individually. The full pilot stage must be visually accepted before the standardized method is applied elsewhere.

### 8C — Existing nine-stage set

1. Regenerate the remaining eight existing stage sets using the accepted pilot contract.
2. Produce every FAR, MID and GROUND layer one at a time under its individual approval gate.
3. Preserve each stage's approved theme, landmarks, palette and visual identity while standardizing canvas geometry and layer responsibility.
4. Apply the same post-landscape calibration order to every regenerated stage.
5. Group production integration by continent only after all three stages for that continent satisfy their asset gates.
6. Run continent-level and full nine-stage end-to-end QA.

Gate 8C: Phase 8 does not advance to the remaining 12 stages until all 27 regenerated validation layers, all nine composites and their dependent calibration are accepted.

#### Authorized NA02 workflow trial

NA02 is an explicit trial of a stage-level user approval gate. FAR, MID and GROUND are still generated sequentially and each must pass internal technical QA before the next layer begins. The assistant may iterate intermediate candidates without a separate user accept/revise decision, then preserves the final candidates, integrates the complete stage and presents the canonical composite/application result for one user approval decision. This scoped trial does not waive immutable-source references, layer responsibility, technical QA, Git preservation, CI/deployment or final visual acceptance. Its outcome determines whether the same streamlined gate is adopted for later stages.

### 8D — Remaining continents and stages

For each remaining continent:

1. Approve all three stage specifications.
2. Approve the visual direction/mockups.
3. Produce FAR, MID and GROUND assets individually under the established approval gate.
4. Complete technical QA for every asset.
5. Integrate only after all assets for all three stages are approved.
6. Complete continent end-to-end gameplay and visual QA.

This sequence repeats continent by continent until the remaining 12 stages are complete.

## Asset iteration loop

Every regenerated or new landscape asset follows this loop:

1. Evidence and written generation brief.
2. User approval of the brief and references.
3. One image edit/generation attempt.
4. Technical inspection in isolation.
5. Composite inspection in the canonical renderer.
6. User accept/revise decision.
7. Repeat only as directed; commit the approved result through GitHub.

No batch generation bypasses this loop.

If an otherwise acceptable generated candidate fails only at its horizontal repeat boundary, the approved deterministic repeat-edge correction in `ASSET_PRODUCTION_SPEC.md` may be applied before repeating technical and wrap-preview QA. This is a technical seam repair, not a substitute for regeneration when composition, coverage, layer ownership or anchors are defective.

## Phase 8 completion criteria

Phase 8 is complete only when:

- all 63 landscape layers across 21 stages pass the universal rendering contract;
- every continent has completed its three-stage asset approval and integration gate;
- no synthetic backing is required to conceal world holes;
- character feet, grounded hazards and finish markers resolve from Y=410;
- hazard placement and collision geometry have been calibrated after final landscape placement;
- Design, Test, development Game and packaged production Game agree visually and geometrically;
- CI, deployment and user visual acceptance are complete for the exact production commit.

Slide timing reconciliation and cold first-load optimization remain separate decisions unless explicitly brought into Phase 8.
