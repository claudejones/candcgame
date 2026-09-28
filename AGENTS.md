# C&C current operating contract

Read docs/CURRENT_STATUS.md before work. GitHub claudejones/candcgame is authoritative.

## Sources
- workbench/dist/workbench-next is the current Design/Game editor and shared runtime source. workbench/dist/src contains its configuration contracts; workbench/authoring contains imports, build tools, tests and configuration snapshots.
- mobile-game is a fixed, independently deployable game package. Preserve its URL and player storage key. Rebuild deliberately from an exported Workbench configuration; editing the editor must not silently change the released game.
- docs/skills contains portable snapshots of the four C&C skill instructions; installed personal skills remain separate. Current status overrides dated checkpoint paths in those snapshots.

## Invariants
Preserve approved original asset bytes, character/hazard state machines, calibration, saved overrides, progression and reward rules. Keep Design and Game as the two editor modes. Avoid Base64 asset embedding. Save all project settings together; separate authoring data from player saves. Do not claim a simulation establishes real-device performance or visual acceptance.

## Verification and release
Use Node 22+, npm ci, and node scripts/check.mjs. CI validates the current Workbench, both characters, normal/secret gameplay, source paths, original asset hashes, mobile plans and menu flows. Development CI must pass before promoting the identical tree to main. Main CI must pass before Pages deploys that exact SHA. Verify the live URLs and relevant file hashes. Never bypass failed checks.

## Publication and cleanup
Use connected GitHub tools without probing shell authentication. Reuse verified binary blobs; do not relay binaries through text. For text changes, verify returned object IDs and the complete resulting tree. Explicitly construct preserved subtrees if a connector fails to apply a base tree. Recheck refs before non-force updates. Preserve concurrent work.
Legacy source, duplicate imports and prototype builds were removed from the active tree with user authorization. They remain in history at 505b764fe73bc505f708d5d026614945b32d3820. Do not restore them to active source merely to satisfy obsolete legacy CI. Do not rewrite history or delete historical branches without separate authorization.
