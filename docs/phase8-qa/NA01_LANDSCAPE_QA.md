# NA01 Phase 8 Landscape QA

Stage: NA01 — Desert  
Pilot status: IN PROGRESS

## P8-NA01-FAR

- Prompt: `P8-NA01-FAR`
- Immutable reference: `assets-original/current-generated/NA-assets/NA01_BG_DISTANT_MESAS.png`
- Approved validation asset: `assets/phase8-validation/north-america/NA01_BG_DISTANT_MESAS.png`
- SHA-256: `6de84e693faa4e40c039a4ad1b4bdbdb2994ae228dc04ed059abff9042eaf3b1`
- Dimensions: PASS — 2172x724
- Alpha/opacity: PASS — fully opaque RGB FAR foundation
- Skyline/top coverage: PASS
- Lower FAR coverage/overscan: PASS
- Shared clouds baked into asset: PASS — none
- Horizontal wrap: PASS — center-offset seam regeneration plus sky-only symmetric boundary match; wrap preview visually reviewed
- Visual identity: APPROVED by user on 2026-09-18
- Production promotion: BLOCKED until NA01 MID, GROUND and full canonical composite are approved

## P8-NA01-MID

- Prompt: `P8-NA01-MID`
- Immutable reference: `assets-original/current-generated/NA-assets/NA01_BG_MID_DESERT.png`
- Approved validation asset: `assets/phase8-validation/north-america/NA01_BG_MID_DESERT.png`
- SHA-256: `e00d7b476dd26d4b7cd34f08b470ec4c8b7b9c57d12c70a82fb88da7e82e41d4`
- Dimensions: PASS — 2172x724
- Alpha: PASS — genuine alpha, mean coverage 0.317834
- FAR content baked into MID: PASS — none
- Lower overlap coverage: PASS
- Horizontal wrap: PASS — center-offset seam regeneration; wrap preview visually reviewed
- FAR+MID composite: PASS for MID approval gate
- Visual identity: APPROVED by user on 2026-09-18
- Production promotion: BLOCKED until NA01 GROUND and full canonical composite are approved

## P8-NA01-GROUND

- Prompt: `P8-NA01-GROUND`
- Immutable reference: `assets-original/current-generated/NA-assets/NA01_GROUND_DESERT.png`
- Approved validation asset: `assets/phase8-validation/north-america/NA01_GROUND_DESERT.png`
- SHA-256: `3199a71ece851b5f491e6d21d5c11b1ac56836e252ad56c2eb32e89a25f3e908`
- Dimensions: PASS — 2172x724
- Alpha: PASS — genuine alpha above the terrain silhouette
- Source surface anchor: PASS — Y=393
- Lower terrain depth: PASS — continuous through source Y=723
- Horizontal wrap: PASS — wrap preview visually reviewed
- FAR+MID+GROUND source composite: PASS for the individual GROUND approval gate
- Visual identity: APPROVED by user on 2026-09-18
- Production promotion: BLOCKED pending canonical development-renderer QA and explicit full-stage acceptance

## Canonical development integration

Status: IN PROGRESS

- Development app uses the three approved validation assets for NA01 only.
- Pilot source width: 2172; source surface anchor: Y=393; canonical runtime surface: Y=410.
- Initial pilot transforms: FAR Y=0 / scale=1.25; MID offset Y=0 / scale=1.00; GROUND offset Y=0 / scale=1.00. FAR 1.00 exposed a small void through low MID alpha; 1.25 closes the canonical 960x540 composite without changing asset pixels and remains subject to user visual acceptance.
- Packaged production Game remains on the preserved 2048x682 NA01 baseline during this gate.
- Required review: Design, Test and development Game modes; scrolling wrap; layer toggles; character grounding; hazards; finish marker; absence of canvas holes.
