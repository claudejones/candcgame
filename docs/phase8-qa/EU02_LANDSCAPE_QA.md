# EU02 Paris landscape QA

2026-09-19 — Complete recovered stage; publication and deployed review pending.

Scope: only EU02 FAR, MID and GROUND at their standard Europe validation paths, registry activation/cache keys, generated entry-page references, and workflow/QA records. No images were regenerated during recovery. The three recovered SHA-256 values match the interrupted ready-to-publish checkpoint. Approved sibling stages, original/archived files, gameplay and character/hazard calibration are unchanged.

## Local evidence

- Three 2172×724 RGBA PNGs pass complete PNG integrity, dimensions and coverage checks. FAR is fully opaque; MID/GROUND retain real transparent upper space.
- GROUND has continuous coverage at source Y=393 through the bottom. The canonical composite has zero uncovered pixels. MID lower arches remain behind the foreground promenade.
- Visually inspected FAR isolation, all three repeated layers and the complete 960×540 composite. Eiffel Tower/Seine skyline, Haussmann riverfront and lamp/planter promenade retain the Paris direction; repeated layers show no uncovered seams.
- Active host/inner-renderer checks pass with offsets 0/0/0, multipliers 1.25/1/1, source anchors MID 621/GROUND 393 and logical ground 410.

| Layer | SHA-256 |
| --- | --- |
| FAR | `dc76bae1b14faa2878143bad449df64d89a46c1e8c08fdc26447bce79bab39dc` |
| MID | `9919b9dd8da7fc468b3a3c8552cb58418e752f476844720f59be2bd145570b4e` |
| GROUND | `52f12eebaee2665dbf418b845a732c05e843c2526e291a6454bc96abfc8ce6b5` |

## Deployed evidence

Pending exact-revision CI, Pages, deployed byte checks and live Design/Test/Game review. Technical success does not approve artwork.
