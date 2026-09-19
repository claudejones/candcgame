# AF01 — Serengeti complete-stage QA

2026-09-19. User-requested facing correction completed locally; revised deployment pending. Artwork is not approved.

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
| Roller HIGH / Slide | 270 ms | 230 ms |
| Roller LOW / Jump | 320 ms | 320 ms |

All four complete 90-second simulations finish with zero hits across 21 planned hazards and enter Celebrate. These are deterministic timed inputs, not a claim about human play difficulty. The five-event 75.3–83.4s signature and finish release are preserved. The unchanged shared finish art has measured visible contact Y=410 and pole X=220 at completion.

## Validation and review gate

Targeted AF01 asset/runtime/composite checks pass. The complete local suite identified a stale pending-AF01 fixture; it now explicitly creates a pending catalog fixture, and the focused rerun passes. All existing NA/SA/EU registry values and `game-config.js` bytes are unchanged. The eleven calibration candidates and their retained evidence/tests are preserved. Production CI passed on development and main for the identical validated tree. Pages deployed the exact validated commit. Live browser review confirmed AF01 selection in Design/Test/Game, canonical scenery coverage, all three named hazards, roller HIGH/LOW controls, both character choices and the Game start flow. Sampled browser errors came from the browser extension, with no application errors observed. All five deployed PNG bytes match the release SHA-256 hashes. These checks do not grant user acceptance.

## Facing revision requested during user review

The user identified that the porcupine and roller face away from the player. The original live review missed this requirement. Their source art faces right; runtime now mirrors only these two hazards to face left. No image regeneration or PNG edits. Shared `drawSprite` and anchor placement support the optional `flipX` flag; preview and gameplay collision X offsets mirror with the art. Source crop, animation frame order, scale, Y placement, speed and physics are unchanged. Full-atlas preview intentionally shows source pixels; cropped and scene previews show gameplay facing. Old saved designs and QA snapshots missing the flag inherit the release default while retaining other edits and explicit facing choices.

`node --test scripts/tests/hazard-facing.test.cjs` checks all four frames and HIGH/LOW modes, preview/game parity, fixed-anchor geometry, reflected colliders, canvas-state restoration, default scope and saved-config migration. The refreshed gameplay measurements above reproduce four full zero-hit courses with mirrored geometry. Revised CI/Pages and live facing inspection are pending. Previous publication evidence below identifies the superseded review build.

## Previous publication evidence

- Reviewed main/development commit: `9f0b5e381667c89d714f72a859adc435920bea4a`. Validated tree: `02c9508754be58aed0188899e01f24a799a86ef2`.
- Development Production CI: https://github.com/claudejones/candcgame/actions/runs/35461377682 — success.
- Main Production CI: https://github.com/claudejones/candcgame/actions/runs/35461473998 — success.
- Pages: https://github.com/claudejones/candcgame/actions/runs/35461507306 — success, same commit.
- Review URL: https://claudejones.github.io/candcgame/src/dev.html. Select Africa → Tanzania — Serengeti savannah. No pilot flag required.
- Scope: all three scenery layers, termite mound, crested porcupine, four-frame roller at HIGH/LOW, stage signature and finish. Review scenery in Design, isolated hazards in Test and the complete stage in Game.
- Approval prompt after review: `In claudejones/candcgame: approve AF01.` Do not start AF02 before acceptance.

## Africa trial

AF01 is the first AF01–AF03 checkpoint. Original generation used 25 calls (FAR 2, MID 12, GROUND 2, OBJECT_ATLAS 7, FLYING 2); this resume used zero image-generation calls. Technical finishing used two focused workers plus coordinator review, which rejected and corrected two MID issues. Subscription usage percentage is unavailable. No measured throughput improvement is claimed before the full trial is complete.
