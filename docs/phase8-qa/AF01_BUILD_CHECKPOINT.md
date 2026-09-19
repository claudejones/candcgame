# AF01 — working production checkpoint

2026-09-19. Original command: `In claudejones/candcgame: build stage AF01.`
Recovery branch: `work/assets/af01`. AF01 is **not integrated, deployed, approved, or ready to test**.

## Completed work

- Started from `bafef40d77c7069e819c10689a5ac49efaa7b28b` in isolated coordinator/landscape/hazard worktrees.
- Resolved the eligible five-file packet and inspected the selected locked reference pixels.
- Built-in image generation produced the source artwork. FAR is the only production-qualified file so far: exact 2172×724 RGB, opaque; integrity and repeat inspections passed.
- Selected source images are stored unchanged in `assets-original/africa/af01/`. These are immutable recovery sources, not production PNGs. Preserve them and make technical derivatives only under the registered `assets/worlds/africa/` paths.
- Shared config, runtime, accepted NA/SA/EU assets, the eleven calibration comparison candidates, and editor-next work are unchanged. No incomplete stage was activated.

## Concrete remaining corrections

| Output | Selected source | Required finishing |
| --- | --- | --- |
| FAR | `assets/worlds/africa/AF01_BG_DISTANT_SERENGETI.png` | None identified; preserve bytes and assess complete composite later. |
| MID | `assets-original/africa/af01/AF01_BG_MID_SERENGETI_SOURCE.png` | Remove opaque white backdrop, preserving artwork and continuous lower coverage. Source has exact dimensions. |
| GROUND | `assets-original/africa/af01/AF01_GROUND_SERENGETI_SOURCE.png` | Remove white backdrop; align level running surface to source Y=393 while retaining full authored terrain depth. Source is exact 2172×724 RGB, but first fully non-white row is Y=408. |
| OBJECT_ATLAS | `assets-original/africa/af01/AF01_OBJECT_ATLAS_SOURCE.png` | Remove faint stray alpha and colored boundary residue; position each unchanged subject within its cell with measured contact at Y=620 and >=32px gutters. |
| FLYING | `assets-original/africa/af01/AF01_HAZARD_ROLLER_SOURCE.png` | Pack four poses into exact 543×724 cells on 2172×724; clean stray alpha; size/align consistently to body anchor (271,362) and >=32px gutters. Source is 2170×725. |

MID source is the final opaque attempt with a continuous authored grass/earth base. Earlier disconnected-island sources were rejected: the canonical FAR ends at runtime Y=400 and GROUND starts at Y=410, so a fully transparent center-bottom of MID would leave a gap. Preserve the final continuous base and open upper center for the kopje.

The object source has substantive-alpha bottoms around Y=631 in both cells, with faint alpha farther below. Cleaning and measuring actual visible contacts must precede translation. Do not shift according to contaminated bounds. The roller has four visibly distinct ordered wing poses; precise anchors, final scale, and collisions remain unverified.

## Why finishing paused

The built-in image generator repeatedly failed exact canvas/contact/alpha requirements. Imagegen instructions require the built-in tool for image edits unless the user explicitly authorizes another method. No code-based transparency removal, scaling, pixel translation, or recoloring was performed. Obtain the user's specific authorization for deterministic transparency cleanup, exact canvas/atlas sizing, and source-anchor alignment of these new AF01 assets before doing that work. This is separate from later deployed artwork acceptance.

Do not repeat the failed image-generation loops. Do not loosen the PNG/anchor/alpha validators or change landscape transforms to disguise the defects. Any structural artwork issue that remains after authorized technical finishing still requires proper image generation.

## Resume procedure

1. Fetch `work/assets/af01` even when main says there is no active work. Read `config/asset-workflow-state.json`, this report, and its selected source hashes.
2. Recover byte-identical selected sources and completed FAR. Reconcile newer shared main/development changes before integration; do not overwrite the concurrent editor/calibration stream.
3. Read the user's answer about deterministic technical finishing. Pending jobs are paused unfinished jobs, not permission to regenerate saved sources. Start the appropriate pinned job before producing its final output; coordinator imports only one output at a time.
4. Once technically finished, inspect isolated/repeat/composite art; measure all three hazards with both characters, timed Jump/Slide and all configured speeds/flight phases. Preserve current physics and character settings.
5. Supply measured release metadata, run integration plus targeted/full required tests, then development CI → identical main tree → main CI → Pages → deployed browser review. Source artwork is not evidence that these checks passed.

## Trial evidence

This is AF01, first checkpoint of the AF01–AF03 trial. Generation logs are under `docs/phase8-qa/af01-production/`. They distinguish rejected source attempts from chosen bytes. The saved selected set required 25 calls: FAR 2, MID 12, GROUND 2, OBJECT_ATLAS 7, FLYING 2. Subscription-usage percentage is unavailable. The trial has not reached a deployed acceptance checkpoint, so no throughput/efficiency improvement is claimed.

Copy-ready continuation: `In claudejones/candcgame: resume AF01.`
