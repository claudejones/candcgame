# SA03 Rio landscape QA

2026-09-19 — Integrated for deployed user review; artwork acceptance pending.

Scope: FAR, MID and GROUND at their standard validation paths. Immutable SA03 reference images were used with the locked prompt-manifest directions. Built-in image generation produced the layers; targeted generation edits corrected canvas size and the ground surface. No legacy or approved sibling images changed.

## Local evidence

- All three PNGs pass full integrity, dimensions and transparency checks at 2172×724.
- FAR is opaque. MID has transparent sky openings and continuous lower foliage coverage. GROUND covers source Y=393 and the complete bottom row.
- Active host and inner-renderer geometry uses offsets 0/0/0, multipliers 1.25/1/1 and source anchors MID 621 / GROUND 393; logical running surface is 410.
- Inspected isolated layers, horizontal repeats and 960×540 composite. No uncovered composite pixels. Rio landmarks, palm-lined bay and wave-mosaic promenade are preserved.
- Gameplay, character/hazard calibration and production/development boundaries are unchanged.

| Layer | SHA-256 |
| --- | --- |
| FAR | `c838eea5a5f4f295651a3f5e9ee45091f5850d9c19f7a965508360b730650e02` |
| MID | `9c4e9ed444a920d2bea84d21c3d94912c929b111959fe9d5ae435110c0fb8111` |
| GROUND | `206ed3d821345a852ff5fe3ea873d5c0306cf0f039bdcef07be57202adc9f77a` |

Publication and review evidence is recorded in the active workflow checkpoint. Technical success does not approve the artwork.

## Deployed evidence

- Reviewed main revision: `c1fb39c909d68b87f200c354dc2c966f96a597c1`.
- Development CI: https://github.com/claudejones/candcgame/actions/runs/35420606302 — success.
- Main CI: https://github.com/claudejones/candcgame/actions/runs/35420656908 — success.
- Pages: https://github.com/claudejones/candcgame/actions/runs/35420675177 — success for the reviewed revision.
- Review URL: https://claudejones.github.io/candcgame/src/dev.html — select South America / SA 3 — RIO DE JANEIRO.
- Downloaded deployed FAR/MID/GROUND via their cache-key URLs and verified exact SHA-256 matches. Both entry pages and the runtime registry also match the validated bytes.
- Live Inspector confirmed FAR scale 0.5524861878453038; MID/GROUND scale 0.4419889502762431; all Y offsets zero.
- Inspected Design, Test/Game scrolling and Game mode. Runtime monitor reports canonical Y=410 and rendered 410. No landscape gaps at observed scroll positions; source previews resolve the new cache URLs.
- User artwork approval remains pending. This recovery branch records the exact reviewed deployment without redeploying unchanged artwork.
