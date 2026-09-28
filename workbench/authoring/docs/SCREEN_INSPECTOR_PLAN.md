# Design Screens inspector — implemented September 21, 2026

Design studio has full-width vertical Stages, Characters and Screens navigation. Existing stage/character editing and calibration remain in place. Screens uses the central preview and right inspector, with its scenario selector in the navigator.

## Shared presentation and isolation

`setupGlobalGame` accepts an optional preview PlayerStore and exposes its explicit scenario renderer only to that caller. Normal Game continues using its real player store. Screen fixtures, memory storage and runtime instances are detached from player saves and Design drafts. The inspector uses the real global screen functions, shared PlayRuntime/drawRuntime, and shared paintGameHud. HUD markup is cloned from the approved Game DOM and stripped of IDs. Map travel uses the same interpolation helper in Game and scrubbable preview.

`screen-scenarios.mjs` supplies 22 scenarios: startup/new/save, map/travel, failure, first/improved/retained/assisted completion, passports/perfect/world/secret rewards, achievements/secret page, options/about/menu/confirmation, save/image errors and loading. Stage, character, difficulty, hearts and reward history are selectable. Existing screen buttons operate on preview memory. Result queue stepping, animation pause/frame-step/reset, travel scrubbing and preview width controls are available. Preview widths scale the surface to fit; they are not a full device emulator (outer viewport media queries still apply).

## Validation and remaining work

924 scenario renders across all stages and both characters passed with real localStorage inaccessible. Continue/Retry Save use preview memory. Existing Game event tests passed, including immediate Play/Continue, pause/resume, results and unchanged draft return. These are Node event/rendering tests, not browser layout approval.

The loading/image/save error scenarios inspect their presentation without deliberately interrupting real requests or damaging storage. Layout editing/export is not added; use this inspector to identify adjustments. Browser/mobile visual review, detailed viewport emulation, and final standalone game packaging remain pending.
