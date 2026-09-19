# AF02 — asset production checkpoint

Status: **source candidates saved; technical cleanup awaiting user authorization**. This is not an asset-ready handoff, artwork acceptance, calibrated stage or playable release.

## Recovered and generated files

All five candidates are native 2172×724 PNGs. FAR and MID were recovered without regeneration. GROUND and FLYING each received one initial generation and one targeted imagegen edit; their strongest exact-canvas candidates are retained. The previous OBJECT_ATLAS candidate had eight attempts recorded before this resume and is preserved for a measured correction.

| Asset | SHA-256 | Current source review |
| --- | --- | --- |
| FAR | `4e4e3fb23ab14da5a2155a15ca033125972ba4cfeff60b2b2815a727e34ef361` | Passed existing isolation, repeat and canonical-size review; preserve bytes. |
| MID | `f3098c22b9583dffc36bcdee7de88c182c72b3b94a1d5f37b99b64a5c2007832` | Recovered oryx/camelthorn composition, genuine transparency, lower overlap and repeat reviewed; preserve bytes. |
| GROUND | `d6e58e046623d036f592ee2b7a0aed13670481cd453f71f1d3d8117a8f607202` | Art/depth present; source surface fails the locked Y=393 ownership requirement. |
| OBJECT_ATLAS | `a07033f27caead5983ec28ea1ec52fb2b23ce371da0680a39074b2e23b629816` | Clay plates and open-Y snag are present; strict contact/gutter validation fails. |
| FLYING | `fcb97b5d07bc46f37b514fdd7c83d976fd447333ddbda70bd0b9f7a941823ad3` | Four distinct right-facing sandgrouse poses with stable body reference; strict any-alpha gutters fail. |

Paths are `assets/worlds/africa/AF02_BG_DISTANT_SOSSUSVLEI.png`, `AF02_BG_MID_SOSSUSVLEI.png`, `AF02_GROUND_SOSSUSVLEI.png`, `AF02_OBJECT_ATLAS.png`, and `AF02_HAZARD_SANDGROUSE.png` in that directory. Photographic references and credits are in `assets/references/africa/af02/REFERENCES.json`.

## Proposed deterministic correction — not applied

The landscape profile allows horizontal-edge repeat repair but requires explicit authorization for other edits outside imagegen. The imagegen skill also defaults to built-in image editing. Targeted imagegen edits have reproduced small canvas/alpha/anchor defects. Ask for approval of these precise operations before using code to change the source pixels:

1. **FLYING:** set alpha=1 pixels to alpha=0 (10,872 pixels, each currently only 1/255 opacity). Preserve all RGB, alpha>1 pixels, anatomy, body placement, frame order and dimensions. The alpha>1 bounds are already inside the required 32-pixel cell gutters.
2. **OBJECT_ATLAS:** remove alpha=1 residue (5,408 pixels), then translate the left cell artwork down 7 source pixels and the right cell artwork up 8. The substantive bounding-box bottoms move from 613/628 to 620/620. Preserve both cell sizes, RGB and substantive alpha values; no interpolation, scale change or redraw.
3. **GROUND:** copy source rows 399–723 to destination rows 393–717 (up 6 source pixels, no interpolation). Make rows 0–392 fully transparent. Copy the original bottom row into destination rows 718–723 and set alpha=255 throughout rows 393–723. Preserve the resulting terrain RGB and the 2172×724 canvas. This produces the required flat source surface and solid bottom overscan; do not rescale or redraw it. Recheck actual row coverage and horizontal repeats afterward.

FAR/MID, approved assets, landscape transforms, character physics and runtime activation remain unchanged. These are source-file corrections; provisional editor grounding, flight heights, collision fairness, action timing and spawn balancing remain separate.

## Pending checks and next operation

After explicit authorization, apply only the three corrections above, rerun PNG/atlas/source coverage checks, inspect the complete prospective 960×540 and mobile composition with both character references and HIGH/LOW starting placements, and finish the v1 `config/asset-handoffs/af02.json`. The flying metadata must retain sourceFacing right, gameplayFacing left and flipX true.

Do not create an asset-ready bundle with false passed checks. No full-stage gameplay simulation, release validation, Production CI or Pages acceptance is claimed by this recovery checkpoint. Once source checks pass, publish the complete handoff through the required development CI → identical main tree → main CI → Pages path and verify the exact durable files. The user then notifies the Workbench agent for import and calibration.

Resume prompt: `In claudejones/candcgame: resume AF02.` A resume alone does not replace the outstanding explicit authorization for deterministic source edits.
