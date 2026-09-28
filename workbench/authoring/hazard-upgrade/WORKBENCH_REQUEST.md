# Workbench request: integrate approved ground-hazard upgrade

Claude has approved all 27 final hazard revisions in this package. Use these final PNGs as the artwork authority. Earlier review ZIPs and rejected concepts are superseded. No further image generation is requested.

## Scope and files

Import the 18 PNGs under assets/worlds, preserving their existing relative continent paths, exact filenames, dimensions and atlas frame slots. These are complete cumulative atlases, including unchanged neighbors. Keep existing HAZARD versus OBJECT naming and the EU01_OBJECT_ATLAS_CRATE.png filename exactly as supplied.

HAZARD_MAPPING.md gives the 27 old-to-new subject mappings. HAZARD_MAPPING.json includes stable IDs, frame coordinates, original and target crops, artwork bounds, grounding rows, reference placement and final atlas hashes. ATLAS_MANIFEST.json gives original snapshot hashes and replacement hashes. APPROVAL_TRACKER.json records the final approvals. VALIDATION.md states the checks and their limits.

## Implementation

1. Read the current project's AGENTS.md and required status/specification documents. Locate the current authoritative asset and shared configuration directories. The reference checkout used dist/assets/worlds; do not assume that generated dist files are the only source to update.
2. Make a rollback checkpoint of current assets and affected configuration. Compare current files with the original hashes in ATLAS_MANIFEST.json. If files have changed since the supplied source snapshot, reconcile those differences so unrelated newer artwork is preserved. Do not replace a newer atlas blindly.
3. Import the package PNGs to the corresponding current source paths. Update generated copies through the normal project build workflow. Maintain stable hazard IDs and frame boundaries. Update display labels to the final names in HAZARD_MAPPING.md.
4. Apply the two required frame-local crop changes: hazard:oc01:1 = l342/r342/t36/b99; hazard:an02:0 = l295/r313/t339/b99. These wider crops reveal the kangaroo sign and equipment case. Other crops keep their reviewed reference values unless the current configuration requires reconciliation. Do not apply the entire older placement reference over newer saved calibration.
5. Keep hazards aligned to each stage's shared pathway Y through the existing grounding controls. Verify actual feet/soles/base contact rather than relying on transparent canvas edges. Retain current scale where appropriate; the approved preview used existing scale and ground offsets. Make any necessary grounding adjustment through the shared inspector/configuration.
6. Re-fit collision bounds for all 27 changed silhouettes. Existing bounds describe the previous artwork and are not approved for the replacements. Pay particular attention to tortoise, vizcacha, beaver, perentie, boogie boards, chestnut stand, boots, sign and equipment case. Avoid oversized invisible hit areas around narrow legs or long tails. Use the existing game's collision conventions.
7. Refresh asset catalog/cache keys and any required source references so Design, Test and Game modes all load the same revised assets. Preserve difficulty, pacing, controls, flying hazards, backgrounds, characters and other game behavior.

## Review and verification

- Verify all 18 imported atlas hashes against the package, unless a documented reconciliation was necessary.
- Inspect all 27 hazards at actual game scale with both Claude and Constance, across beginning/middle/end landscape positions.
- Verify no crop clipping, wrong facing, floating feet, buried bases or adjacent-slot bleed. Confirm the approved perentie shares OC01 with the new sign, and the approved anchor shares AN02 with the new case.
- Check the sign symbol and case remain recognizable with the widened crops; check the boots against the gray OC03 path.
- Test collisions and jump/slide encounters through the existing Test/Game workflow, including hit/stun behavior and a representative mobile landscape viewport.
- Check unaffected neighboring hazards, all 21 stage loads, cache refresh and saved configuration persistence. Run required repository gates; avoid unrelated changes.

Return a concise integration report listing files/configuration changed, any reconciliation or calibration adjustments, test results, a review link and clear steps for Claude to inspect the update. Artwork approval is complete; integrated gameplay review is still required. Follow the project's existing publication process.

## Rollback

Restore the pre-import checkpoint for the 18 atlases and affected crop/label/collision/cache configuration together, then rebuild and refresh cache references. Do not roll back unrelated work.
