# EU02 Paris landscape QA

2026-09-19 — Explicitly approved by the user.

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

- Reviewed main revision: `961d3911c756c9084114ab95255a4a06cfe489c0`.
- Development CI: https://github.com/claudejones/candcgame/actions/runs/35426209008 — success.
- Main CI: https://github.com/claudejones/candcgame/actions/runs/35426252658 — success.
- Pages: https://github.com/claudejones/candcgame/actions/runs/35426273472 — success for the reviewed revision.
- Review URL: https://claudejones.github.io/candcgame/src/dev.html — select Europe / EU 2 — FRANCE / PARIS.
- Downloaded all three deployed cache-key image URLs; exact SHA-256 values match the recovered validated files. Both entry pages and the generated runtime registry also match.
- Live Inspector: FAR scale 0.5524861878453038; MID/GROUND scale 0.4419889502762431; all X/Y offsets zero; MID/GROUND parallax 0.2/1. Runtime monitor confirms canonical Y=410 and rendered 410.
- Live Design composite, Test gameplay with scrolling beyond repeated layer boundaries, and Game start/rendering inspected. No uncovered scenery gaps observed. Existing cloud behavior and deferred character/hazard calibration are preserved.
- Full local Production CI workflow passed, including all 13 existing command/runtime tests, PNG integrity and integrated composites. Exact-revision automatic gates passed.
- User explicitly approved the reviewed deployed artwork on 2026-09-19. Approval preserves all three image hashes and canonical geometry; the active checkpoint is closed. EU03 has not started.

- Unlimited-lives Test run completed the full course: 0:00, FINISH RELEASE, no active hazards, 21 cleared, character in CELEBRATE. Finish-marker view and final landscape continuity inspected.

- Next authorized production command: `In claudejones/candcgame: build landscape EU03.`
