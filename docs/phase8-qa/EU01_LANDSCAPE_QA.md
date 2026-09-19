# EU01 Santorini landscape QA

2026-09-19 — Integrated stage; user artwork approval pending.

Scope: FAR, MID and GROUND at their standard Europe validation paths. The immutable EU01 reference PNGs and resolved Phase 8 prompts were supplied directly to built-in image generation. Generation corrections fixed repeat composition, MID sea contamination, exact canvas size and GROUND placement. The existing horizontal-edge repair corrected only FAR background color deltas (192 source pixels); no landmarks, anchors, dimensions or alpha ownership changed.

## Local evidence

- Three 2172×724 PNGs pass full chunk, CRC, decompression, dimensions and transparency checks. FAR is opaque; MID/GROUND have genuine transparent upper space.
- GROUND covers all columns at source Y=393 and through the bottom. MID has continuous authored lower stone/vegetation coverage. The canonical composite has zero uncovered pixels.
- Visually inspected isolated layers, repeated layers and 960×540 composite: caldera/white village, Cycladic terraces and stone promenade preserve the locked direction. FAR has no cloud layer; MID owns no sea or sky.
- Actual host/inner-renderer geometry: offsets 0/0/0, multipliers 1.25/1/1, source anchors MID 621/GROUND 393, logical ground 410.
- Changes are limited to EU01 validation images, its registry activation/cache keys, generated script/page references and workflow/QA status. Approved sibling art, original/archived files, gameplay and character/hazard calibration are preserved.

| Layer | SHA-256 |
| --- | --- |
| FAR | `213eceb527830fd1bc534654da698b166c264d5a4b49ff5080eaa5597720b694` |
| MID | `2ea736336cba3e6c3086a069dd5c031234f5ffd6f7bdfad5f4038cf2430bdfdd` |
| GROUND | `83f9d5b0bc922bf01677736f05ad6307eabdb645540af4a10c74b15d4b4f7619` |

## Deployed evidence

- Reviewed main revision: `8556e5a0312e53cb3843f1b69c61a35e698383ef`.
- Development CI: https://github.com/claudejones/candcgame/actions/runs/35422174526 — success.
- Main CI: https://github.com/claudejones/candcgame/actions/runs/35422237867 — success.
- Pages: https://github.com/claudejones/candcgame/actions/runs/35422258302 — success for the reviewed main revision.
- Review URL: https://claudejones.github.io/candcgame/src/dev.html — select Europe / EU 1 — GREECE / SANTORINI.
- Downloaded all three deployed cache-key PNG URLs and verified exact SHA-256 matches. Both entry pages and the runtime registry also match the validated snapshot.
- Live Inspector confirms FAR scale 0.5524861878453038, MID/GROUND scale 0.4419889502762431, all X/Y offsets zero; source previews resolve the new cache URLs.
- Runtime monitor reports canonical Y=410 and rendered 410. Inspected Design, Test/Game scrolling beyond ground wrap and Game mode; no uncovered landscape gaps at observed positions.
- The existing full local Production CI workflow passes, including 13 command/runtime tests, PNG integrity checks and all integrated composites. Required exact-revision automatic gates passed.
- Durable awaiting-approval checkpoint: `work/assets/eu01`. No artwork acceptance is inferred from these technical checks.
