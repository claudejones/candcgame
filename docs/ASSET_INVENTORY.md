# Asset Inventory

Inventory date: 2026-09-16
Source commit: `efebb4647ee1cf6fcd8e3788bade1dc21dd60c1e`

## Preservation status
- LAB25Q reference HTML preserved at `archive/LAB25Q/CHARACTER_STATE_LAB_25Q_WORLD_VISUAL_OWNERSHIP_QA.html` using the exact original Git blob.
- Entire uploaded source asset tree preserved unchanged at `assets-original/current-generated/` using the exact original Git tree/blob objects.
- `incoming/` remains as the original ingestion area for provenance. It may be removed later only after the migration checkpoint is explicitly approved.

## Uploaded collection summary
63 uploaded files total:
- 1 LAB25Q HTML reference build
- 60 PNG game assets
- 2 macOS `.DS_Store` metadata files

The `.DS_Store` files are preserved with the source collection for exact archival fidelity but are not production assets.

## PNG inventory by system

### Europe — 16
EU01 Greece / Santorini (6):
- `EU01_BG_DISTANT_GREECE.png`
- `EU01_BG_MID_GREECE.png`
- `EU01_GROUND_GREECE.png`
- `EU01_HAZARD_AEGEAN_GULLS.png`
- `EU01_HAZARD_ROLLING_BARREL.png`
- `EU01_OBJECT_ATLAS_CRATE.png`

EU02 Paris (5):
- `EU02_BG_DISTANT_PARIS.png`
- `EU02_BG_MID_PARIS.png`
- `EU02_GROUND_PARIS.png`
- `EU02_HAZARD_SWALLOWS.png`
- `EU02_OBJECT_ATLAS.png`

EU03 Barcelona (5):
- `EU03_BG_DISTANT_BARCELONA.png`
- `EU03_BG_MID_BARCELONA.png`
- `EU03_GROUND_BARCELONA.png`
- `EU03_HAZARD_BATS.png`
- `EU03_OBJECT_ATLAS.png`

### North America — 17
NA01 Desert (5): DISTANT, MID, GROUND, hazard atlas, vulture.
NA02 Pines / Mountains / Stream (5): DISTANT, MID, GROUND, hazard atlas, eagle.
NA03 City / New York (5): DISTANT, MID, GROUND, hazard atlas, pigeons.
Shared North America-origin assets (2):
- `NA_CLOUD_LAYER.png`
- `NA_STAGE_FINISH_MARKER.png`

### South America — 15
SA01 Amazon (5): DISTANT, MID, GROUND, macaws, object atlas.
SA02 Andes (5): DISTANT, MID, GROUND, Andean flamingo, object atlas.
SA03 Rio (5): DISTANT, MID, GROUND, tropical parakeets, object atlas.

### Character gameplay / FX — 8
- `G1A_RUN_CYCLE_ATLAS.png`
- `G1B_IDLE_ATLAS.png`
- `G1C_JUMP_ATLAS.png`
- `G1D_DUCK_ATLAS.png` — historical/superseded candidate; preserve, do not use as production Slide without explicit reconciliation.
- `G1D_SLIDE_ATLAS.png` — current approved state family identifies G1D as Slide.
- `G1E_HIT_ATLAS.png`
- `G1F_CELEBRATE_ATLAS.png`
- `FX_STUN_STARS_ATLAS.png`

### Character select — 1
- `G1B_CHARACTER_SELECT_ATLAS.png`

### HUD — 3
- `UI_LIFE_HEART.png`
- `UI_STAGE_PROGRESS_CLAUDE_CONSTANCE.png`
- `UI_STAGE_PROGRESS_PATH.png`

## Landscape audit set — 27
Exactly 27 current landscape PNGs are present: FAR/DISTANT + MID + GROUND for each of NA01–NA03, SA01–SA03, EU01–EU03.

These are the next visual/technical audit set under `WORLD_RENDERING_SPEC.md`. No KEEP / REPAIR / REGENERATE classification is assigned in this inventory document; classification requires actual asset-level inspection against the reconciled contract.

## Notable reconciliation flags
1. Both `G1D_DUCK_ATLAS.png` and `G1D_SLIDE_ATLAS.png` are present. Current locked specification says G1D is Slide; Duck is retained only as historical source unless evidence explicitly changes that status.
2. Shared clouds and finish marker retain `NA_` filenames because that is their source provenance. Their production destination should be `assets/shared/`, without modifying the originals.
3. The uploaded folder names contain legacy spelling/organization (`advanture-game assets`, `characer-states`). Preserve those exact paths under `assets-original`; use corrected semantic paths only for future production copies.
4. Europe landscape assets are present as current uploaded PNGs; previous normalization history must not be inferred solely from filenames. Audit the actual files against the current contract before repair/regeneration.

## Planned production destinations
Production copies/validated derivatives will ultimately map to:
- `assets/characters/`
- `assets/shared/clouds/`
- `assets/shared/finish/`
- `assets/shared/ui/`
- `assets/worlds/north-america/na01-desert/` etc.
- `assets/worlds/south-america/sa01-amazon/` etc.
- `assets/worlds/europe/eu01-greece/` etc.

Do not populate these production paths by blindly copying every archived asset. First reconcile status, naming, and the landscape audit so production contains only validated assets.
