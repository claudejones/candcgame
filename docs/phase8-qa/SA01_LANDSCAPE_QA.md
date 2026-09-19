# SA01 Phase 8 Landscape QA

Stage: SA01 — Amazon Rainforest
Status: INTEGRATED — deployed-stage approval pending

## Final assets

| Layer | Path | SHA-256 | Technical result |
|---|---|---|---|
| FAR | `assets/phase8-validation/south-america/SA01_BG_DISTANT_AMAZON.png` | `cbe232ba047d06634a9949f8498b9546efecb45eccaed548a054b85ca933039a` | PASS — 2172x724, fully opaque foundation |
| MID | `assets/phase8-validation/south-america/SA01_BG_MID_AMAZON.png` | `253ec4cd9beec3e6f6ea6fcdaa417fc3afbc8a2474d11668535b3bab39d773ab` | PASS — 2172x724 RGBA with genuine transparency and lower overlap |
| GROUND | `assets/phase8-validation/south-america/SA01_GROUND_AMAZON.png` | `3ca40ce6a3164d1d330fc18d5d56df42488aab0989055c5bf129066fe214a795` | PASS — 2172x724 RGBA, source surface Y=393, full bottom coverage |

## Integrated review

- Registry-driven PNG integrity, CRC, decompression, dimensions and alpha checks: PASS.
- Isolated FAR/MID/GROUND review: PASS.
- Duplicated horizontal wraps: PASS after the authorized FAR sky-edge feather correction; MID and GROUND required no correction.
- Canonical 960x540 composite at runtime ground Y=410: PASS, zero uncovered pixels.
- Locked Amazon visual identity: PASS — layered basin/river depth, dense rainforest silhouette and jungle trail remain coordinated without clouds or unrelated content.
- Development Design/Test/Game source mapping: Phase 8 validation assets with immutable cache keys; packaged production fallback remains preserved.
- User gate: PENDING explicit `APPROVED` after deployed gameplay/test, Contextual Inspector and horizontal-scroll review.
