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

## Europe — landscape sets approved; legacy hazards integrated for QA
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
Four continents / 12 stages remain planned for future production. Their direction, workflow and themes are approved as the planning baseline; exact replacement hazard choices/references and production readiness gates remain pending. Do not generate them until those gates are complete.

Command keys reserve AF01–AF03 (Africa), AS01–AS03 (Asia), OC01–OC03 (Oceania/Australia; AU alias), and AN01–AN03 (Antarctica). The approved theme mappings are in the remaining-continent plan; keys alone do not authorize generation before readiness passes. `config/asset-commands.json` is the key catalog; `help keys` lists it. Phase 8 remains NA/SA/EU only.

Planning authorized on 2026-09-19: [REMAINING_CONTINENTS_PLAN.md](REMAINING_CONTINENTS_PLAN.md) and `config/remaining-continent-proposal.json` define the approved planning direction, workflow and 12 themes, with three landscapes, two ground hazards and one flying hazard per stage. Replacement hazard selections/references and production gates remain pending. The catalog has exact proposed paths and focused stage briefs but is not loaded by the runtime or enabled gameplay/production commands. Preserve the existing Phase 8 promotion and user-review gates.

## Current landscape audit scope
27 landscape assets across NA01–NA03, SA01–SA03 and EU01–EU03: FAR/DISTANT + MID + GROUND for each stage.

All 27 are the approved Phase 8 landscape set governed by `LANDSCAPE_GENERATION_CONTRACT_V1.md`. The completed KEEP / REPAIR / REGENERATE audit remains technical and visual-reference evidence; dependent calibration and contract promotion remain separate gates.

## Phase 8 landscape acceptance

All nine FAR/MID/GROUND sets in North America (NA01–NA03), South America (SA01–SA03) and Europe (EU01–EU03) are explicitly approved. All three continent landscape regression gates have passed; Europe closed on 2026-09-19 following EU03 approval. EU03's exact reviewed artwork revision is `94f94669bd2773b2ef9881c59e4adb710aeced60`. Exact hashes and approval pointers are in `config/asset-workflow-state.json`; Europe regression evidence is in `docs/phase8-qa/EU03_LANDSCAPE_QA.md`.

Approved validation assets remain under `assets/phase8-validation/`. Legacy packaged assets and required dependent character/hazard calibration remain separate. Full Phase 8 contract promotion is not claimed by landscape acceptance; additional continent production still requires approved scope, themes and references.
