# Modular LAB25Q Migration Plan

Status: ACTIVE — approved 2026-09-16.

## Why this replaces the prior harness iteration
The 27-image alpha/content audit already established that the existing landscape family is internally inconsistent. The temporary universal viewer did not need to rediscover that fact and is not the production migration baseline.

## Current direction
1. Preserve archived LAB25Q and `assets-original/` unchanged.
2. Extract LAB25Q into inspectable source (`src/legacy/lab25q/`) and recover the actual START RUN path, HUD, player, cloud, renderer, controls, hazards and QA behavior.
3. Rebuild the full QA harness from those recovered systems as modular production-oriented code under `src/`.
4. Keep QA controls isolated from production configuration.
5. Define and validate one unified landscape generation/rendering contract with deliberate overscan/tolerance for generative-image variance.
6. Regenerate all 27 NA/SA/EU FAR/MID/GROUND landscape assets against that contract as the validation batch.
7. Technical-alpha/coverage QA each generated asset, then visual QA each stage in the rebuilt full harness.
8. Use the validated contract for the remaining 36 landscape assets (12 stages × FAR/MID/GROUND).

## Target code structure
```text
src/
  index.html
  css/
    game.css
    qa.css
  js/
    game.js
    renderer.js
    player.js
    hazards.js
    world.js
    progression.js
    hud.js
    controls.js
    qa-harness.js
    config/
      gameplay.js
      worlds.js
      hazards.js
      qa.js
assets/
  characters/
  shared/
  worlds/
qa/
  full-harness/
```

## Migration principle
This is a structural extraction/refactor, not permission to change validated gameplay behavior. Every extracted subsystem is compared against LAB25Q before the legacy implementation is retired.

## Landscape principle
Runtime stage-specific Y/scale/character-grounding corrections are transitional legacy data, not the target architecture. The new landscape family is authored to a shared geometry/alpha/overscan contract so the renderer, player foot anchor, ground baseline and controls remain universal.
