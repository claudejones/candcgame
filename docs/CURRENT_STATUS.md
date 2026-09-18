# Current Status

Last updated: 2026-09-18

## Production baseline
Phase 6 is complete and user-verified. Phase 7 production authoring architecture is complete and was visually accepted by the user on 2026-09-18. Phase 8 landscape production now uses one integrated-stage user approval gate. FAR, MID and GROUND remain sequential internal production units, but their generation and technical iteration do not require separate user approvals when the stage direction and source references are already locked.

Phase 8 validation production is active. North America is complete: the complete NA01, NA02 and NA03 FAR/MID/GROUND sets are approved Phase 8 landscape assets preserved under `assets/phase8-validation/north-america/`. All three stages passed their applicable deployed integrated-stage visual QA, including gameplay/test behavior, horizontal scrolling/repeat review and Contextual Inspector landscape previews. Packaged production remains on the preserved baseline while validation continues.

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
North America Phase 8 landscape validation is complete. NA01, NA02 and NA03 are approved as complete FAR/MID/GROUND stage sets. NA03 passed deployed Design/Test/Game review at standard runtime MID `Y=0`, including Contextual Inspector previews and horizontal scrolling/repeat behavior. Dependent character/hazard grounding and later configuration calibration remain intentionally deferred until landscape generation is complete.

The first NA03 recovery deployment used image-attachment proxy copies that had been resized in transit. The later ZIP correction restored FAR and MID successfully, but its resized-and-translated GROUND derivative did not match the image the user had approved. GROUND now uses the untouched 2170x725 ZIP original that matches the user's approved attachment, SHA-256 `095aa9cb85d4d36a2cb97f9a1d72bca8255c42abda836bfedfa6eeb893293b02`, without resizing, translation or reconstruction. Deployed review proved that the preceding MID still required runtime `Y=16`. The approved replacement uses the alternate storefront/brownstone direction and deterministic lower overscan so authored frontage continues through the final source row at standard runtime `Y=0`. Its SHA-256 is `9a6e14456bc351c18229c503d0827f5bbbf83f521a6f24bce25a2c7a7cf5ef14`. The deployed complete-stage gate is accepted.

The one-time Phase 8 workflow-support setup is complete: temporary candidate/review workspaces are ignored, `config/phase8-landscapes.json` is the machine-readable stage registry, PNG validation is registry-driven, and `scripts/phase8-stage-qa.py` produces compact technical evidence plus isolated, duplicated-wrap and canonical composite previews. Production CI validates every registry stage marked `integrated` or `approved`.

The next production step is SA01 under the integrated-stage workflow in a fresh conversation. SA02 and SA03 follow one stage at a time, with a final South America continent regression after all three stage approvals.

Current pilot QA evidence: NA01's yellow legacy seam, red rendered GROUND surface and cyan rendered MID base coincide at canonical Y=410, so the cyan guide (drawn last) visually covers the other two. This is expected alignment, not a missing ground guide. Legacy NA02 retains separated calibration values, so its three evidence lines remain visibly distinct.

NA02 deployment recovery: the first integrated upload exposed that all three generated NA02 PNGs had been truncated by an intermediate Base64/text-output transfer limit. The intact local files were losslessly re-encoded at zero pixel difference during diagnosis, but metadata was not the root cause. Large assets now require a binary-safe GitHub transfer path, Production CI validates the complete PNG chunk/CRC/decompression/scanline structure, and validation-asset URLs use content-hash version keys so corrected binaries bypass stale browser/CDN responses.

The NA03 corrected-asset deployment also exposed a development-host startup race: the outer mode shell could request legacy-style suppression while the shared-runtime iframe still had a document without a `<head>`, causing an `appendChild` exception and an intermittently unusable QA application. The host now defers that operation until the iframe head exists; the iframe load event then applies it normally.

## Guardrails
- `archive/` and `assets-original/` remain immutable.
- Approved character/hazard/shared assets are not regenerated, resized, normalized, or replaced for convenience.
- Structural changes preserve user-approved Phase 6 behavior unless a separate explicit decision changes gameplay.
- Legacy Phase 6 calibration values remain evidence until replacement assets are authored.
- G1D is Slide, not Duck.
