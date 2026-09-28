# Claude & Constance — Global UI integration handoff

Prepared 21 September 2026. Owner-approved assets: UI01 Brand, UI02 Start Screen, all seven continent rewards, UI03 World Map (corrected graphics plus ocean side-fill), UI04 Results/Transitions (finish-flow clarification), UI05 Menus/Achievements. The user's final “perfect” approves UI05; this supersedes pending-review wording within historical package notes. Asset approval does not establish runtime integration, calibration approval or release readiness.

## Read and extract

Use `$candc-workbench` as the primary integration skill. Consult `$candc-global-ui` for presentation rules and decision history. Read current project AGENTS.md and authoring/docs/WORKBENCH_RUNTIME_STATUS.md; inspect current code before applying any dated checkpoint. Existing Workbench already owns the stage assets and calibration. This archive is a global presentation supplement, not a complete game source backup.

Extract each nested ZIP into a separate named directory. Do not flatten: several packages contain identically named notes/manifests. Read this file first, then the per-package handoff, manifests, Asset_Coverage and Verification documents where present. See PACKAGE_INVENTORY.json for exact bytes, hashes and note paths. Original nested ZIPs are byte-preserved.

| Package | Responsibility | First document inside ZIP |
|---|---|---|
| UI01_Brand_Assets.zip | Logo, master icon, favicon/mobile derivatives | UI01_Workbench_Notes.md |
| UI02_Start_Screen_Assets.zip | Approved coastal departure startup and selection presentation | UI02_Workbench_Notes.md |
| RW_All_Continents_Rewards_Assets.zip | All21 trophies,7 passports, shared utilities, originals and atlases | Workbench_Handoff.md |
| UI03_World_Map_Assets.zip | Map/ocean, both head pins,21 thumbnails, nodes/cards/navigation and responsive reference | Workbench_Handoff.md |
| UI04_Results_Transitions_Assets.zip | Results, Game Over, entry/travel/continent/world/unlock presentations | Workbench_Handoff.md |
| UI05_Menus_Achievements_Assets.zip | Achievements, Options, supported pause menu, About, level select and dialogs | Workbench_Handoff.md |

Individual RW continent packages, RW_Shared_Utilities.zip and loose UI01 notes are unnecessary: included by the packages above. Retain fonts/licenses and editable/generated originals in source; only ship runtime-required assets in a final game build. Optional JPG/PNG contact sheets and HTML previews are review material. Shared snapshots across packages must be deduplicated by hash/manifest; do not create competing canonical copies. Use the consolidated reward atlases and canonical96×32 hollow-heart/full-heart/star utility. Never import obsolete four-cell utilities.

## Source precedence and implementation boundaries

Latest explicit user decisions and this reconciliation override conflicting historical notes. UI03 corrected package supersedes its rejected earlier map delivery. UI04 finish-flow clarification and UI05 dedicated Secret Level page supersede older suggestions. The global skill production plan is chronological: later sections override earlier recommendations.

Use delivered artwork, sprites and geometry to reproduce approved compositions with HTML/CSS/Canvas. Preserve live text. Do not regenerate art or extract finished assets from concept screenshots. Reference HTML is an assembly/behavior guide with sample data, not a replacement game or player save. Do not ship fixture controls, sample achievements, review-only labels or example stage backgrounds.

Preserve current Design + Game architecture and shared engine/configuration. Do not restore superseded Test-mode architecture from historical checkpoints. Preserve original21 stage layers, recent MID corrections, character/hazard machines, controls, placements, crops, hitboxes and calibration. Do not overwrite current runtime character assets/calibration with illustrative UI04 crops.

Finish: character crosses existing finish flag -> existing success event commits outcome once -> UI04 overlay on the same live scene. Preserve current camera/player/flag and established celebration/cloud behavior; no new finish detector or duplicate rewards. Game Over uses existing failure hook and approved stunned/stars behavior. Preserve existing direct pause/resume toggle; attach a menu only through supported menu hooks, not by changing that button into a mandatory modal. Back from menus preserves caller and pause state.

## Confirmed rules to implement

- Difficulty labels Easy/Standard/Hard; no extra Explorer/Adventurer axis or World Treasures.
- Every stage and retry starts with3 health hearts. No separate lives/retry stock. Zero hearts ends the attempt.
- Eligible success earns that stage trophy at1–3 hearts. Saved best only improves, separately per difficulty.
- All3 eligible stage completions earn continent passport; all3 best ratings3 make it perfect with shared star. Improved replays can occur separately.
- Completed stages offer Replay before unrestricted Level Select unlock; future stages remain gated.
- Eligible completion of all21 Standard stages unlocks Hard and unrestricted ordinary Level Select. Perfection is not required for these unlocks.
- Unlimited Health prevents depletion and earns no new trophy, rating improvement, passport or permanent unlock. Preserve earlier legitimate rewards; explain exclusion with live text, not an extra disabled-heart icon.
- Map uses approved character-head pin above current stage dot, all3 dots visible per continent, gray locked/gold complete and separate pulsing current ring. Continent locks stay; stage dots do not need individual locks. “1/3 complete” is selected-continent completion status, not a button.
- Achievements uses7 continent pages plus a full Secret Level page8/8; no bottom mystery strip. Gray rewards are inspectable with requirements/progress.
- All7 perfect Standard passports unlock Secret Level entry, NOT its passport. Locked icon -> future actual gray passport after entry unlock -> color only after eligible secret completion.
- Secret Level startup shortcut appears after entry unlock and uses the existing stage-loading flow directly. Until content exists, preserve entitlement and show clear unavailable-content feedback; never launch a nonexistent level.
- Player saves/settings are separate from Design/project configuration. Design/test fixtures must not award real player progress. Result processing and saving must be idempotent; display save success only after a successful write.

## Explicitly deferred and unresolved

Secret Level content, final gray/color passport art and exact entry difficulty/record ownership are deferred to the asset-design conversation. Proposed duration is one3-minute stage, not yet an implemented or final specification. UI05 only includes its real locked icon; future-art slots are review references. Do not invent final art or claim secret gameplay complete.

Optional idle autoplay was not approved. Do not add it in this integration.

Reconcile existing implementation with these open policies, preserving supported existing behavior and asking only if a material decision remains: achievement ownership across characters; New Game reset scope; save/checkpoint model and Continue granularity; assistance activation and eligibility recovery; secret exposure across difficulty tabs. Recommended assistance rule: once used, the attempt remains ineligible until a fresh attempt starts with assistance off. This is a recommendation, not a newly approved rule. Do not delete saved achievements to implement New Game. Work on unaffected integration can proceed while these items are resolved.

## Suggested integration and acceptance sequence

1. Inventory current hooks, assets, saves, approved package coverage and genuine policy gaps; preserve a recoverable baseline.
2. Import originals/derivatives with provenance and shared deduplication. Reproduce startup, map and menu compositions using real data.
3. Wire selection, New Game/Continue, local save/settings and progression with existing architecture; finish/results, Game Over and navigation next; read-only achievements from committed records.
4. Validate both characters, all21 IDs/thumbnails, all difficulties and lock states; completed replay and current-map pin; fit on phone/tablet landscape with safe areas, touch targets and no ocean side gaps.
5. Test1->3 upgrade, lower replay no downgrade, difficulty isolation, continent/perfect thresholds, Standard unlocks, assisted exclusions, fatal-hit/finish ordering, duplicate clicks/events, save/load failure and reload/Continue. Verify pause/back/resume, independent music/SFX, keyboard/focus and reduced motion.
6. Present an integrated review build/status with exactly what was tested, unresolved choices and deferred secret work. Asset assembly checks in these packages were not browser/device gameplay tests. Follow existing publication authorization; this handoff alone does not authorize a new release, migration that deletes data, or independent deployment.

The same Workbench agent should already have its current source and project configuration. If a fresh agent lacks them, recover that existing project using candc-workbench; do not reconstruct the game from these graphics. If the latest calibration only exists in unsaved user edits, obtain the current project export before any operation that could overwrite it.
