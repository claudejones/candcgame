# EU03 Barcelona landscape QA

2026-09-19 — Integrated and deployed for review. User artwork acceptance pending.

Scope: EU03 FAR/MID/GROUND, their registry/cache references, and workflow/QA records. Recovered all three images from the interrupted matching ready-to-publish checkpoint. No artwork regenerated. Approved sibling stages, gameplay, character/hazard calibration, packaged production assets and archives are unchanged.

## Local evidence

- All three 2172×724 PNGs pass integrity, dimensions and alpha/coverage checks. FAR is opaque; MID/GROUND preserve real transparency.
- Source running surface Y=393 and continuous terrain depth pass; the 960×540 composite has zero uncovered pixels.
- Inspected the complete composite and all repeated layers: coastal skyline/Sagrada Família, Park Güell garden architecture and mosaic terrace retain the approved Barcelona direction, with continuous coverage at repeat joins.
- `node scripts/assets.mjs check EU03` passes against active host/inner-renderer geometry: all landscape offsets zero, multipliers 1.25/1/1, MID/GROUND anchors 621/393, logical running surface 410.

| Layer | SHA-256 |
| --- | --- |
| FAR | `fb3ae5964f53f73d761872fad20dee8e98afc4696966f6879dd5ea2845757f09` |
| MID | `0fd183d36bc48ca61a5cabce90c7874e36332c22e4bbcc548a8b3e3fee15421c` |
| GROUND | `45916a46209dd8b5ede78c6e1f41fc9af641ee5155177c7be18296fda37745ff` |

- Full local Production CI workflow passes, including command/runtime tests, all integrated PNGs and composites.

## Deployed evidence

- Reviewed deployed artwork revision: `94f94669bd2773b2ef9881c59e4adb710aeced60`.
- Development CI: https://github.com/claudejones/candcgame/actions/runs/35428163510 — success.
- Main CI: https://github.com/claudejones/candcgame/actions/runs/35428215455 — success.
- Pages: https://github.com/claudejones/candcgame/actions/runs/35428236249 — success for the same main revision.
- Review URL: https://claudejones.github.io/candcgame/src/dev.html — select Europe / EU 3 — SPAIN / BARCELONA.
- All three deployed cache-key image URLs, both entry pages and the generated registry match the validated local bytes.
- Live Inspector: FAR scale 0.5524861878453038; MID/GROUND scale 0.4419889502762431; all X/Y offsets zero; MID/GROUND parallax 0.2/1. Runtime monitor confirms canonical Y=410 and rendered 410.
- Design composite, source previews and Game-mode startup/rendering inspected. Test gameplay scrolls through repeated layer boundaries without uncovered scenery gaps. Shared cloud behavior remains intact.
- These technical checks do not approve the artwork. EU03 remains `integrated` and `awaiting-approval`.
