# C&C Audio Manifest

## Music
| Asset | Path | Method | Target | Status |
|---|---|---|---|---|
| C&C Title | `music/title/C_AND_C_TITLE.wav` | Advanced v6 | 1:30–2:00 | PLANNED |
| World Map | `music/world/WORLD_MAP.wav` | Advanced v6 | 1:30–2:00 | PLANNED |
| NA01 | `music/stages/NA01_THEME.wav` | Advanced v6 | ~1:45–2:00 | CREATED |
| NA02 | `music/stages/NA02_THEME.wav` | Advanced v6 | ~1:45–2:00 | NEXT |
| NA03 | `music/stages/NA03_THEME.wav` | Advanced v6 | ~1:45–2:00 | PLANNED |
| SA01–AN03 | `music/stages/{ID}_THEME.wav` | Advanced v6 | ~1:45–2:00 | PLANNED |
| Secret Boss | `music/boss/SECRET_BOSS_THEME.wav` | Advanced v6 | ~2:00+ | PLANNED |
| Game Complete | `music/ending/GAME_COMPLETE.wav` | Advanced v6 | 1:30–2:30 | PLANNED |

## Stingers
| Asset | Path | Method | Target | Status |
|---|---|---|---|---|
| Stage Complete | `stingers/STAGE_COMPLETE.wav` | Sounds One Shot | ~7 sec | CREATED / APPROVED |
| Continent Complete | `stingers/CONTINENT_COMPLETE.wav` | Sounds One Shot/Advanced | ~8–10 sec | PLANNED |
| Boss Complete | `stingers/BOSS_COMPLETE.wav` | Sounds One Shot/Advanced | ~8–12 sec | PLANNED |
| Game Over | `stingers/GAME_OVER.wav` | Sounds One Shot | ~3–5 sec | CONDITIONAL |

## Core player SFX
Jump, land, slide, hit, stunned, recovery/invulnerability, finish crossing, plus only mechanics that truly require feedback.

## UI SFX
Select, back/cancel, confirm, error/locked, character select, stage select, stage unlock, continent unlock, pause, resume, achievement/progression.

## World/travel SFX
Airplane travel/flyby and stage-path movement only where animation benefits from feedback.

## Hazard SFX
Audit actual repository hazards. Prefer sounds for actions (swoop, lunge, impact, splash, activation) rather than every visible hazard.

## Boss SFX
Audit implemented states. Expected candidates: appear, weapon charge, weapon fire, hit, stun, recovery, defeated.

## Ambience
Optional polish. Use subtle stage/environment loops only when they improve atmosphere without masking music/SFX.

## Production order
1. Complete stage themes beginning NA02.
2. Title/world-map/boss/ending music.
3. Global stingers.
4. Core player + UI SFX.
5. Repository-driven hazard + boss SFX audit.
6. Optional ambience.
7. Runtime integration, balancing, QA.
