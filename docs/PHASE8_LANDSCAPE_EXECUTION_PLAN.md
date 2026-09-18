# Phase 8 Landscape Execution Plan

Status: DRAFT FOR USER APPROVAL  
Date: 2026-09-18

## Purpose

Phase 8 brings the world landscapes into the accepted Phase 7 renderer and universal production geometry without redesigning approved systems or discarding usable art. This plan consolidates the existing landscape specifications into an executable sequence. It does not itself authorize an asset edit.

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

## Current landscape scope

The landscape audit classifies the 27 layers for the nine existing stages as follows:

- KEEP: 21 layers, including all nine FAR layers.
- REPAIR: six layers: NA-02 MID/GROUND, EU-01 MID/GROUND and EU-02 MID/GROUND.
- REGENERATE: none currently justified.

This evidence supersedes any earlier blanket assumption that all 27 existing layers must be regenerated. A KEEP classification is preserved unless the accepted renderer reveals concrete contrary evidence.

The remaining 12 stages and their 36 landscape layers are later Phase 8 production scope. Their exact themes and specifications must be recovered or explicitly approved; they must not be invented from assumptions.

## Execution sequence and approval gates

### 8A — Plan and composition baseline

1. Approve this execution plan.
2. Capture all nine existing stage composites in the accepted Phase 7 Design renderer at 960x540/Y410.
3. Inspect FAR, MID and GROUND both composited and isolated, with synthetic backing disabled.
4. Record seams, transparency holes, anchor alignment, repeat behavior, overscan and lower-depth coverage.
5. Confirm the source-space ground-anchor value through the pilot evidence; do not resolve legacy 393-versus-near-400 evidence by assumption.
6. Select one of the three repair stages as the validation pilot and approve its repair brief.

Gate 8A: no image editing or generation begins until the user approves the plan and pilot repair brief.

### 8B — One complete validation pilot

1. Preserve the pilot FAR layer as the visual foundation unless new evidence explicitly reclassifies it.
2. Repair the MID layer and present it for visual approval.
3. Repair the GROUND layer and present it for visual approval.
4. Run technical QA on dimensions, transparency, repeat behavior, source anchor, overscan and file integrity.
5. Run the complete FAR/MID/GROUND composite through Design, Test and Game modes.
6. Calibrate in order: character grounding, hazard visual size/position, collision/hitboxes and finish-marker placement.
7. Refine and lock the production landscape contract from observed results.

Gate 8B: each repaired layer is reviewed individually. The full pilot stage must be visually accepted before the repair method is applied elsewhere.

### 8C — Existing nine-stage set

1. Validate the nine KEEP stage sets in the production logical renderer.
2. Preserve all KEEP layers that pass; do not recreate them for visual uniformity or convenience.
3. Repair the remaining four audited MID/GROUND layers one at a time using the accepted pilot method.
4. Apply the same post-landscape calibration order to every corrected stage.
5. Group production integration by continent only after all three stages for that continent satisfy their asset gates.
6. Run continent-level and full nine-stage end-to-end QA.

Gate 8C: Phase 8 does not advance to new stages until all nine existing stage composites and their dependent calibration are accepted.

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

Every new or repaired landscape asset follows this loop:

1. Evidence and written repair/generation brief.
2. User approval of the brief and references.
3. One image edit/generation attempt.
4. Technical inspection in isolation.
5. Composite inspection in the canonical renderer.
6. User accept/revise decision.
7. Repeat only as directed; commit the approved result through GitHub.

No batch generation bypasses this loop.

## Phase 8 completion criteria

Phase 8 is complete only when:

- all 21 stage landscapes pass the universal rendering contract;
- every continent has completed its three-stage asset approval and integration gate;
- no synthetic backing is required to conceal world holes;
- character feet, grounded hazards and finish markers resolve from Y=410;
- hazard placement and collision geometry have been calibrated after final landscape placement;
- Design, Test, development Game and packaged production Game agree visually and geometrically;
- CI, deployment and user visual acceptance are complete for the exact production commit.

Slide timing reconciliation and cold first-load optimization remain separate decisions unless explicitly brought into Phase 8.
