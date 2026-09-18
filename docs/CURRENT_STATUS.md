# Current Status

Last updated: 2026-09-18

## Production baseline
Phase 6 is complete and user-verified. Phase 7 production authoring architecture is complete and was visually accepted by the user on 2026-09-18. Phase 8 landscape pre-production is now authorized, subject to its existing asset-by-asset approval gates.

Phase 8 validation production is active. The complete NA01 and NA02 FAR/MID/GROUND sets are approved regenerated landscape assets preserved under `assets/phase8-validation/north-america/`. NA02 passed deployed Design, gameplay-run and integrated-stage visual QA, including the new Contextual Inspector landscape previews. Packaged production remains on the preserved baseline while validation continues.

Approved QA snapshots now follow the automated GitHub path documented in `docs/GITHUB_WORKFLOW.md`: commit the exact accepted snapshot to `main`, require successful Production CI for that push SHA, then automatically deploy that same validated SHA to Pages. Development-branch and pull-request CI do not deploy. Manual Pages dispatch remains a recovery fallback only.

Active shared runtime remains `src/index.html`, `src/css/game.css`, `src/js/game-config.js`, `src/js/game-runtime.js`, with semantic assets under `assets/`. Production remains `src/game.html` with production bootstrap only.

## Migration status
- Phase 0–6: COMPLETE / user verified where applicable
- Phase 7A coordinate and viewport contract: COMPLETE
- Phase 7B canonical configuration schema: COMPLETE / CI accepted
- Phase 7C modular application shell/bootstrap split: COMPLETE / CI accepted
- Phase 7D Design Asset Navigator: COMPLETE / CI accepted
- Phase 7E Contextual Inspector: COMPLETE / CI accepted (run #78)
- Phase 7F Landscape editor: COMPLETE / CI accepted (run #98)
- Phase 7G Hazard/atlas editor: COMPLETE / CI accepted (run #122)
- Phase 7H Character editor: COMPLETE / CI accepted (run #122)
- Phase 7I Runtime Monitor: COMPLETE / CI accepted (run #122)
- Phase 7J Test mode: COMPLETE / CI accepted (run #134)
- Phase 7K Game mode: COMPLETE / CI accepted (run #134)
- Phase 7L persistence/import/export finalization: COMPLETE / user accepted
- Phase 7M final regression/CI/deployment: COMPLETE / user accepted

The final Phase 7 acceptance correction added Design-mode hazard/character guide toggles, clamped Fine Crop inputs to non-negative values, locked paused animated-hazard previews to the explicitly selected frame, added an enlarged live cropped-frame preview, and made the animated-preview controls respond before their frame refresh could replace the clicked button. User testing confirmed that the pause-control issue was resolved. This correction did not alter approved assets, collision geometry or gameplay constants.

## Coordinate/config authority
Canonical logical viewport: `960 x 540`. Canonical production ground surface: `GROUND_SURFACE_Y = 410`. Canonical asset vocabulary: `SOURCE REGION -> FINE CROP -> SCALE -> POSITION -> GAMEPLAY ANCHOR -> COLLISION`.

Legacy stage `seamY` and landscape offsets remain compatibility/calibration evidence only and are not canonical gameplay-coordinate authority.

## Design persistence / portability
All Design saves remain browser-local only under `cc-world-design-config-v1`; browser authoring never writes Git or production source. SAVE STAGE and SAVE CHARACTER remain scoped actions, and SAVE ALL LOCAL persists the complete current authoring draft.

EXPORT STAGE remains available. EXPORT GAME CONFIG creates the complete portable canonical authoring payload. IMPORT GAME CONFIG validates schema version, 960x540 viewport, ground Y=410, all nine current stages and canonical schema invariants before replacing and persisting the local draft. Invalid/incompatible imports are rejected rather than partially applied.

## Mode architecture
DESIGN contains authoring tools. TEST exposes focused stage/character/run/reset/unlimited-lives/collision/ground-guide validation controls. Development GAME hides Design/Test authoring panels around the same renderer. Production `src/game.html` has GAME as its only mode and cannot reference development modules under CI guards.

## Final Phase 7 regression guard
Production CI checks the production/development dependency boundary, syntax for every runtime/dev module, no Base64 runtime assets, canonical 960x540/Y410 authority, all nine stage compatibility mappings, hazard counts, non-negative crop, Gaudí bench source-region baseline, approved Constance Slide crop and preserved Phase 6 gameplay constants (Slide .75, recovery 1.10, invulnerability 2.00, flying 68/18, maxVisible 2, reactionLead 2.20, characterX 220, worldSpeed 120).

## Known deferred calibration/content work
- Phase 8 regeneration of the 27 existing FAR/MID/GROUND layers as the universal-contract validation batch, followed by the remaining 36 layers after the contract passes
- final character grounding after each corrected landscape
- hazard visual size/position after each corrected landscape
- collision/hitbox calibration after each corrected landscape
- historical Slide 0.75s versus production-spec 0.70s reconciliation
- cold first-load optimization / staged asset loading

## Next production step
NA01 and NA02 landscape sets are approved. Dependent character/hazard grounding and later configuration calibration remain intentionally deferred until landscape generation is complete. The NA03 FAR/MID/GROUND set has completed internal reconstruction, PNG-integrity, geometry, wrap and source-composite QA and is pending complete-stage Git integration, deployed Design/Test/Game QA and one final user acceptance gate. It is not user-approved yet.

The original NA03 generation outputs survived a conversation/workspace handoff, but the first normalized local candidates did not. The user explicitly authorized deterministic recovery from those surviving outputs. The reconstructed 2172x724 candidates now carry new documented hashes; the earlier uncommitted hashes remain historical evidence and must not be represented as the recovered bytes.

Current pilot QA evidence: NA01's yellow legacy seam, red rendered GROUND surface and cyan rendered MID base coincide at canonical Y=410, so the cyan guide (drawn last) visually covers the other two. This is expected alignment, not a missing ground guide. Legacy NA02 retains separated calibration values, so its three evidence lines remain visibly distinct.

NA02 deployment recovery: the first integrated upload exposed that all three generated NA02 PNGs had been truncated by an intermediate Base64/text-output transfer limit. The intact local files were losslessly re-encoded at zero pixel difference during diagnosis, but metadata was not the root cause. Large assets now require a binary-safe GitHub transfer path, Production CI validates the complete PNG chunk/CRC/decompression/scanline structure, and validation-asset URLs use content-hash version keys so corrected binaries bypass stale browser/CDN responses.

## Guardrails
- `archive/` and `assets-original/` remain immutable.
- Approved character/hazard/shared assets are not regenerated, resized, normalized, or replaced for convenience.
- Structural changes preserve user-approved Phase 6 behavior unless a separate explicit decision changes gameplay.
- Legacy Phase 6 calibration values remain evidence until replacement assets are authored.
- G1D is Slide, not Duck.
