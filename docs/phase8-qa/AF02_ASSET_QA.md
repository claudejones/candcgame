# AF02 — asset-ready QA

Status: **five source assets validated; ready for publication and Workbench calibration**. Artwork acceptance, calibration and playable release remain pending.

## Exact reviewed files

| Asset | SHA-256 |
| --- | --- |
| FAR | `4e4e3fb23ab14da5a2155a15ca033125972ba4cfeff60b2b2815a727e34ef361` |
| MID | `f3098c22b9583dffc36bcdee7de88c182c72b3b94a1d5f37b99b64a5c2007832` |
| GROUND | `073c4d0fb661690744843ed91553c639a877ff824c8d86aac794d451b35b8c6b` |
| OBJECT_ATLAS | `aafdac8b0f9749e1f6c8225b32d09758bb1ea5e5c4b8c43d4a3854e4705c2cca` |
| FLYING | `c40d17b7ed969661048a0ba701fc1c74cac192b059a6e649b946bfa173f32085` |

## Checks performed on these bytes

- All five images: native 2172×724 PNG, integrity/chunk/CRC/decompression checks passed; required RGB/RGBA formats retained.
- Ground: rows 0–392 fully transparent; rows 393–723 fully opaque, including the bottom overscan. Both ground-hazard substantive bounds end at source Y=620. Ground contact and all cell gutter checks passed.
- Flying: four distinct frames, fixed body reference and readable upstroke/descending/downstroke/rising poses inspected. A common union crop retains all four silhouettes and gives provisional body bounds a stable reference. Source-facing right is preserved; gameplay-facing left uses flipX=true.
- Canonical prospective scenery reviewed at scroll offsets 0, 480 and 955, plus the isolated repeat join. No fully transparent coverage holes. Preserved MID alpha makes the minimum composite alpha 252/255 in part of the overlap; fully opaque ground owns the lower band.
- Basic rendering reviewed with Claude and Constance at 960×540 and 640×360, including both shared HIGH/LOW starting placements and all four bird frames. Scales/body bounds are usable provisional metadata, not calibrated collision or action windows.
- Complete dune/oryx/camelthorn composition and layer repeat continuity passed source review. FAR and MID bytes remain unchanged.

## Authorized source cleanup

The user explicitly approved the measured AF02-only deterministic cleanup. Built-in imagegen produced the artwork; this correction did not regenerate it. Flying alpha=1 residue was removed. Object alpha=1 residue was removed and the two cells were translated +7/−8 source pixels. Ground source rows 399–723 were copied to destination 393–717; the bottom row was copied through 723; the upper band was made transparent and the terrain band fully opaque. Canvas dimensions and substantive terrain/hazard RGB were preserved without interpolation.

The pre-cleanup checkpoint, generation prompts/attempts and before/after hashes are in `AF02_SOURCE_CHECKPOINT.json`. References/credits remain in `assets/references/africa/af02/REFERENCES.json`. This permission applies to these three corrections only; it does not change the general asset-editing rules.

## Handoff and limits

`config/asset-handoffs/af02.json` is the v1 Workbench handoff. The landscape transforms remain canonical (all offsets zero); source regions, crops, anchors, scale/body bounds, facing and 8 FPS animation metadata are provided. The bird uses the shared HIGH/LOW placement with zero additional offset. The source body rectangles are provisional and should be calibrated in editor-next.

No production stage-release or landscape activation is changed. No contact/collision fairness, action-window, difficulty, spawn-spacing, finish, zero-hit gameplay or playable-release pass is claimed. The user notifies the Workbench agent to import this bundle, then calibrates and saves. Later playable release keeps its existing strict validation gates.

## Publication

Publish through development Production CI, identical validated tree on main, main Production CI and automatic Pages. Verify the five remote hashes and bundle before closing the asset run. Recovery and publication commit evidence is tracked in `config/asset-workflow-state.json`.
