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

Publication and deployed review evidence will be recorded in the durable EU01 checkpoint on `work/assets/eu01`. Artwork acceptance remains pending.
