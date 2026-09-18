# LAB25Q Confirmed Asset Mapping — Phase 4 Authority

Status: LOCKED FOR PHASE 4 EXTERNALIZATION

User visual verification completed 2026-09-16 using the side-by-side LAB25Q asset comparison page.

## Migration rule

For Phase 4, the embedded LAB25Q payload is the proven source image. Extract its bytes exactly, save those bytes at the confirmed semantic path below, and replace only the matching `data:image` reference with that external path. Do not resize, crop, repack, rescale, regenerate, or alter renderer/gameplay/calibration metadata during externalization.

`IMG-48` is shadowed/dead and must not be promoted to a runtime asset. It may be removed only when its dead property is cleaned up; it is not one of the 61 live external assets.

Landscape FAR/MID/GROUND regeneration is a separate later production phase and is not part of Phase 4.

## Confirmed mapping

| Ref | Semantic role | External path |
|---|---|---|
| IMG-00 | HUD heart | `assets/hud/UI_LIFE_HEART.png` |
| IMG-01 | HUD progress character | `assets/hud/UI_STAGE_PROGRESS_CLAUDE_CONSTANCE.png` |
| IMG-02 | HUD progress path | `assets/hud/UI_STAGE_PROGRESS_PATH.png` |
| IMG-03 | EU01 FAR | `assets/worlds/europe/EU01_BG_DISTANT_GREECE.png` |
| IMG-04 | EU01 MID | `assets/worlds/europe/EU01_BG_MID_GREECE.png` |
| IMG-05 | EU01 GROUND | `assets/worlds/europe/EU01_GROUND_GREECE.png` |
| IMG-06 | EU01 objects | `assets/worlds/europe/EU01_OBJECT_ATLAS_CRATE.png` |
| IMG-07 | EU01 barrel | `assets/worlds/europe/EU01_HAZARD_ROLLING_BARREL.png` |
| IMG-08 | EU01 bird | `assets/worlds/europe/EU01_HAZARD_AEGEAN_GULLS.png` |
| IMG-09 | EU02 FAR | `assets/worlds/europe/EU02_BG_DISTANT_PARIS.png` |
| IMG-10 | EU02 MID | `assets/worlds/europe/EU02_BG_MID_PARIS.png` |
| IMG-11 | EU02 GROUND | `assets/worlds/europe/EU02_GROUND_PARIS.png` |
| IMG-12 | EU02 objects | `assets/worlds/europe/EU02_OBJECT_ATLAS.png` |
| IMG-13 | EU02 bird | `assets/worlds/europe/EU02_HAZARD_SWALLOWS.png` |
| IMG-14 | EU03 FAR | `assets/worlds/europe/EU03_BG_DISTANT_BARCELONA.png` |
| IMG-15 | EU03 MID | `assets/worlds/europe/EU03_BG_MID_BARCELONA.png` |
| IMG-16 | EU03 GROUND | `assets/worlds/europe/EU03_GROUND_BARCELONA.png` |
| IMG-17 | EU03 objects | `assets/worlds/europe/EU03_OBJECT_ATLAS.png` |
| IMG-18 | EU03 bird | `assets/worlds/europe/EU03_HAZARD_BATS.png` |
| IMG-19 | SA01 FAR | `assets/worlds/south-america/SA01_BG_DISTANT_AMAZON.png` |
| IMG-20 | SA01 MID | `assets/worlds/south-america/SA01_BG_MID_AMAZON.png` |
| IMG-21 | SA01 GROUND | `assets/worlds/south-america/SA01_GROUND_AMAZON.png` |
| IMG-22 | SA01 objects | `assets/worlds/south-america/SA01_OBJECT_ATLAS.png` |
| IMG-23 | SA01 bird | `assets/worlds/south-america/SA01_HAZARD_MACAWS.png` |
| IMG-24 | SA02 FAR | `assets/worlds/south-america/SA02_BG_DISTANT_ANDES.png` |
| IMG-25 | SA02 MID | `assets/worlds/south-america/SA02_BG_MID_ANDES.png` |
| IMG-26 | SA02 GROUND | `assets/worlds/south-america/SA02_GROUND_ANDES.png` |
| IMG-27 | SA02 objects | `assets/worlds/south-america/SA02_OBJECT_ATLAS.png` |
| IMG-28 | SA02 bird | `assets/worlds/south-america/SA02_HAZARD_ANDEAN_FLAMINGO.png` |
| IMG-29 | SA03 FAR | `assets/worlds/south-america/SA03_BG_DISTANT_RIO.png` |
| IMG-30 | SA03 MID | `assets/worlds/south-america/SA03_BG_MID_RIO.png` |
| IMG-31 | SA03 GROUND | `assets/worlds/south-america/SA03_GROUND_RIO.png` |
| IMG-32 | SA03 objects | `assets/worlds/south-america/SA03_OBJECT_ATLAS.png` |
| IMG-33 | SA03 bird | `assets/worlds/south-america/SA03_HAZARD_TROPICAL_PARAKEETS.png` |
| IMG-34 | finish marker | `assets/shared/NA_STAGE_FINISH_MARKER.png` |
| IMG-35 | NA01 hazards | `assets/worlds/north-america/NA01_HAZARD_ATLAS.png` |
| IMG-36 | NA01 bird | `assets/worlds/north-america/NA01_HAZARD_VULTURE.png` |
| IMG-37 | NA02 hazards | `assets/worlds/north-america/NA02_HAZARD_ATLAS.png` |
| IMG-38 | NA02 bird | `assets/worlds/north-america/NA02_HAZARD_EAGLE.png` |
| IMG-39 | NA03 hazards | `assets/worlds/north-america/NA03_HAZARD_ATLAS.png` |
| IMG-40 | NA03 bird | `assets/worlds/north-america/NA03_HAZARD_PIGEONS.png` |
| IMG-41 | Run | `assets/characters/G1A_RUN_CYCLE_ATLAS.png` |
| IMG-42 | Idle | `assets/characters/G1B_IDLE_ATLAS.png` |
| IMG-43 | Jump | `assets/characters/G1C_JUMP_ATLAS.png` |
| IMG-44 | Slide | `assets/characters/G1D_SLIDE_ATLAS.png` |
| IMG-45 | Hit | `assets/characters/G1E_HIT_ATLAS.png` |
| IMG-46 | Celebrate | `assets/characters/G1F_CELEBRATE_ATLAS.png` |
| IMG-47 | stun stars | `assets/characters/FX_STUN_STARS_ATLAS.png` |
| IMG-48 | shadowed/dead duplicate FAR | — |
| IMG-49 | NA01 MID | `assets/worlds/north-america/NA01_BG_MID_DESERT.png` |
| IMG-50 | NA01 GROUND | `assets/worlds/north-america/NA01_GROUND_DESERT.png` |
| IMG-51 | NA02 FAR | `assets/worlds/north-america/NA02_BG_DISTANT_MOUNTAINS.png` |
| IMG-52 | NA02 MID | `assets/worlds/north-america/NA02_BG_MID_PINES.png` |
| IMG-53 | NA02 GROUND | `assets/worlds/north-america/NA02_GROUND_TRAIL.png` |
| IMG-54 | NA03 FAR | `assets/worlds/north-america/NA03_BG_DISTANT_NYC.png` |
| IMG-55 | NA03 MID | `assets/worlds/north-america/NA03_BG_MID_CITY.png` |
| IMG-56 | NA03 GROUND | `assets/worlds/north-america/NA03_GROUND_CITY.png` |
| IMG-57 | NA01 FAR live | `assets/worlds/north-america/NA01_BG_DISTANT_MESAS.png` |
| IMG-58 | clouds | `assets/shared/NA_CLOUD_LAYER.png` |
| IMG-59 | NA01 objects | `assets/worlds/north-america/NA01_OBJECT_ATLAS.png` |
| IMG-60 | NA02 objects | `assets/worlds/north-america/NA02_OBJECT_ATLAS.png` |
| IMG-61 | NA03 objects | `assets/worlds/north-america/NA03_OBJECT_ATLAS.png` |

## Phase 4 order

HUD → Run → Idle → Jump → Slide → Hit → Celebrate → FX → North America → South America → Europe → Shared/final cleanup.

Each gate extracts exact LAB25Q bytes, substitutes only that system's references, validates that no unintended source changes occurred, deploys, and requires parity verification before advancing when visual review is material.
