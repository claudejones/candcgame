# EU03 Barcelona landscape QA

2026-09-19 — Integrated; publication and deployed review in progress. User acceptance pending.

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

Pending exact-revision development CI, main CI, automatic Pages and live Design/Test/Game/Inspector/scrolling verification. These technical checks do not approve the artwork.
