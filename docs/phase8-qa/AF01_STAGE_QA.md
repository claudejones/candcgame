# AF01 — Serengeti complete-stage QA

2026-09-19. Locally integrated; publication and deployed review pending. Artwork is not approved.

## Scope and source preservation

Recovered the exact five selected images from `work/assets/af01`. The user explicitly answered **yes** to code-based transparency cleanup, exact canvas/atlas sizing and ground/sprite alignment, followed by integration, testing and deployment. Original sources under `assets-original/africa/af01/` and the qualified FAR are unchanged.

- MID: remove white matte; decontaminate only the boundary; translate upper art 12 source pixels upward and remap the already-opaque bottom terrain to retain full depth. This closes the measured 50-pixel hole at runtime rows 400–401 without a backing fill or runtime landscape offset.
- GROUND: remove white matte; map the full running surface from source 408 to required 393, preserving the final authored terrain row.
- OBJECT_ATLAS: discard alpha 1–4 contamination; translate unchanged subjects to substantive contact Y=620 and centered X=543. The mound and porcupine retain their original scale in their cells.
- FLYING: four ordered poses, one uniform 0.84 nearest-neighbor scale, aligned measured torso references at (271,362), clean gutters. Four distinct wing poses were visually inspected at runtime scale.

All five PNGs pass integrity/dimension checks; transparent assets are 2172×724 RGBA. The canonical 960×540 composite has zero uncovered pixels and opaque coverage throughout. Isolated and repeated layers were inspected. FAR/MID/GROUND offsets remain zero; scale multipliers 1.25/1/1 and source anchors 621/393 remain unchanged.

## New-stage runtime findings and corrections

The small roller's HIGH body initially passed above a running player. Its measured per-mode placement correction is `flightOffsetY: {high:22, low:0}` logical pixels. It moves the rendered bird and its solid-body collider together. The canonical flight anchor remains `410 - clearance`; the explicit species adjustment is added afterward. The source body anchor and global 68/18 clearances, speeds, characters and physics remain fixed. Compatibility exports preserve the optional adjustment. Existing hazards have no adjustment and retain their exact geometry.

Full-course simulation exposed two delayed ground hazards behind faster flying events. Expansion stages now dispatch each event at its own off-screen travel deadline while retaining authored arrival order. Existing nine-stage dispatch behavior and signatures remain unchanged. A targeted regression covers this mixed-speed case.

## Measured gameplay

Reproduce: `node scripts/audit-stage-gameplay.cjs AF01`.

Exact inputs, asset hashes, geometry and results: `AF01_GAMEPLAY_MEASUREMENTS.json`. Lead sampling is 10 ms; physics/collision simulation is 60 and 120 Hz and includes the renderer's one-frame collision lag. Every flying starting phase and configured 150/170/210 px/s speed is covered; ground speed is 120 px/s. Both characters collide when simply running and have timed avoidance windows:

| Hazard / response | Claude | Constance |
| --- | ---: | ---: |
| Termite mound / Jump | 140 ms | 130 ms |
| Porcupine / Jump | 130 ms | 110 ms |
| Roller HIGH / Slide | 320 ms | 260 ms |
| Roller LOW / Jump | 320 ms | 310 ms |

All four complete 90-second simulations finish with zero hits across 21 planned hazards and enter Celebrate. These are deterministic timed inputs, not a claim about human play difficulty. The five-event 75.3–83.4s signature and finish release are preserved. The unchanged shared finish art has measured visible contact Y=410 and pole X=220 at completion.

## Validation and review gate

Targeted AF01 asset/runtime/composite checks pass. The complete local suite identified a stale pending-AF01 fixture; it now explicitly creates a pending catalog fixture, and the focused rerun passes. All existing NA/SA/EU registry values and `game-config.js` bytes are unchanged. The eleven calibration candidates and their retained evidence/tests are preserved. Production CI, identical-tree main promotion, Pages and deployed browser review remain required before requesting acceptance.

## Africa trial

AF01 is the first AF01–AF03 checkpoint. Original generation used 25 calls (FAR 2, MID 12, GROUND 2, OBJECT_ATLAS 7, FLYING 2); this resume used zero image-generation calls. Technical finishing used two focused workers plus coordinator review, which rejected and corrected two MID issues. Subscription usage percentage is unavailable. No measured throughput improvement is claimed before the full trial is complete.
