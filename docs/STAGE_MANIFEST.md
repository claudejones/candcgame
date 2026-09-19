# Stage Manifest

Total campaign scope: 7 continents x 3 stages = 21 stages.

## North America — integrated legacy baseline
- NA01 — Desert
- NA02 — Pines / Mountains / Stream
- NA03 — City / New York

Known landscape families:
- NA01: DISTANT mesas; MID desert; GROUND desert
- NA02: DISTANT mountains; MID pines; GROUND trail; gap water/stream assets
- NA03: DISTANT NYC; MID city; GROUND city

## South America — integrated legacy baseline
- SA01 — Amazon Rainforest
- SA02 — Andes Mountains
- SA03 — Rio de Janeiro

Known approved hazards include macaws, Andean flamingo, and tropical parakeets. SA02 village/mid correction and ground seam correction were incorporated during QA.

## Europe — assets produced and integrated for QA
- EU01 — Greece / Santorini
  - DISTANT Greece
  - MID Greece
  - GROUND Greece
  - market crate/basket obstacle
  - rolling barrel
  - Aegean gulls
- EU02 — France / Paris
  - DISTANT Paris
  - MID Paris
  - GROUND Paris
  - cafe table/chairs
  - bicycle
  - European swallows
- EU03 — Spain / Barcelona
  - DISTANT Barcelona
  - MID Barcelona
  - GROUND Barcelona
  - mosaic bench
  - cast-iron drinking fountain
  - Mediterranean bats

## Remaining continents
Four continents / 12 stages remain to be specified and produced. Their exact stage identities/themes must be taken from an approved product/stage specification once recovered or explicitly approved; do not invent them from memory.

Command keys reserve AF01–AF03 (Africa), AS01–AS03 (Asia), OC01–OC03 (Oceania/Australia; AU alias), and AN01–AN03 (Antarctica). These are identifiers, not approved themes or generation authorization. `config/asset-commands.json` is the key catalog; `help keys` lists it. Phase 8 remains NA/SA/EU only.

## Current landscape audit scope
27 landscape assets across NA01–NA03, SA01–SA03 and EU01–EU03: FAR/DISTANT + MID + GROUND for each stage.

All 27 are the Phase 8 regeneration validation batch under `LANDSCAPE_GENERATION_CONTRACT_V1.md`. The completed KEEP / REPAIR / REGENERATE audit remains technical and visual-reference evidence; it does not exempt a layer from standardized regeneration.

## Phase 8 landscape acceptance

North America (NA01–NA03) and South America (SA01–SA03) are approved complete FAR/MID/GROUND sets. South America regression passed on 2026-09-19. SA03's reviewed revision is `c1fb39c909d68b87f200c354dc2c966f96a597c1`; exact layer hashes and approval pointers are in `config/asset-workflow-state.json`. EU01 — Greece / Santorini was explicitly approved on 2026-09-19 at reviewed revision `8556e5a0312e53cb3843f1b69c61a35e698383ef`, preserving its exact images and canonical geometry. EU02 — France / Paris is next; EU03 and Europe regression follow. Legacy packaged assets and deferred character/hazard calibration remain separate.
