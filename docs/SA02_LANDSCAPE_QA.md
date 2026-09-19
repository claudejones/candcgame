# SA02 Andes landscape integration QA

Status: integrated; awaiting deployed visual acceptance.

Only the three SA02 validation landscapes and their registry/cache references change. Packaged assets, approved sibling stages, gameplay, character and hazard calibration remain unchanged.

Local checks: PNG integrity/CRC/decompression, exact dimensions, alpha ownership, active host/renderer geometry, complete 960×540 composite, isolated and repeated layer review. FAR/MID/GROUND offsets are zero; scales 1.25/1/1; source anchors MID621/GROUND393.

| Layer | SHA-256 |
| --- | --- |
| FAR | `f43e5e39890fe666d624952b5bc0164157125ccce79f8c2d4fa3aa2c94f7929c` |
| MID | `1d06ee2e304cfb448f961d95335081376ca9c29f7ca9a749d3c3f2f341f96b86` |
| GROUND | `0994eb04706f0fc3c58386c4c087d460f8a722f58a1a245744e58be20f172908` |

Built-in image generation used the immutable SA02 references and focused command packet. FAR preserves the snow-capped panorama; MID preserves the small village and llamas and extends rocky lower overlap; GROUND places the trail at the canonical source anchor and authors terrain through the bottom.

Final acceptance requires deployed Design/Test/Game, Inspector placement and scrolling review. Technical CI success does not approve the artwork.

## Deployed verification

- Reviewed build: `29176df173eeb78cd0436bfa98a13f22317bb07d`.
- Development CI: https://github.com/claudejones/candcgame/actions/runs/35418079717
- Main CI: https://github.com/claudejones/candcgame/actions/runs/35418116771
- Pages: https://github.com/claudejones/candcgame/actions/runs/35418134078
- URL: https://claudejones.github.io/candcgame/src/dev.html
- All three deployed PNG SHA-256 values match the validated local bytes.
- Live Inspector: FAR scale0.5524861878453038; MID/GROUND scale0.4419889502762431; X/Y offsets0 for all three; parallax0/0.2/1.
- Live Design, Test playback/pause/scrolling and Game startup inspected. Artwork remains awaiting user approval.
