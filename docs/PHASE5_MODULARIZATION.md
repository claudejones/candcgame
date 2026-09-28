# Phase 5 Modularization Checkpoint

Phase 5 begins from user-verified Phase 4 commit `86353bf6cc66c85147db5a226354adbed6ea6e1f`.

Increment 1 extracts the complete `CONFIG` object into `src/js/lab25q-config.js`. The runtime remains otherwise source-identical and receives that same object through one explicit `window.LAB25Q_CONFIG` bridge. Automated QA reconstructs the original Phase 4 runtime from the two outputs and fails if any runtime source changed beyond that bridge.

No gameplay values, rendering behavior, timing, collision logic, grounding, hazard calibration, or asset references are changed. Known landscape, character-grounding, hazard sizing/positioning, and hitbox calibration issues remain deferred until landscape geometry is finalized.
