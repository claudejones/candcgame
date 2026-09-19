# Decision Log

Append-only record of important locked project decisions. Newer explicit decisions supersede older conflicting decisions, but history remains visible.

## 2026-09-16 — Repository becomes primary source of truth
The `candcgame` repository is the primary persistent authority for production requirements and current status across ChatGPT conversations. AI sessions must begin with `AGENTS.md` and `docs/CURRENT_STATUS.md`, then read task-specific specifications. Conversation memory is secondary when a locked repository specification exists.

## 2026-09-16 — Preserve before migration
LAB25Q and supplied original assets must be preserved before architectural cleanup. Migration from the embedded legacy harness to external assets/modules is incremental, with behavioral comparison against the preserved baseline. No wholesale rewrite is authorized by the migration decision.

## 2026-09-16 — Synthetic world backing removed
World appearance must not depend on a stage/continent synthetic backing color. LAB25Q changed the legacy board backing to transparent and added transient layer-isolation QA. This exposed incomplete authored world coverage that had previously been concealed.

## 2026-09-16 — Landscape responsibility clarified
FAR, MID and GROUND each require sufficient vertical coverage for their own visual responsibility and useful overlap/calibration room. FAR must provide valid scenery behind intentional MID transparency. MID cannot be undersized such that GROUND must be pushed unnaturally upward to hide a gap. GROUND must provide sufficient depth below the running surface. Y calibration positions good artwork; it is not a substitute for repairing deficient artwork.

## Earlier established production geometry — recovered 2026-09-16
The intended production composition established a logical 480x270 viewport, canonical `GROUND_BASELINE_Y = 205`, approximately 65 logical pixels of depth below the running surface, approximately 960-wide repeating DISTANT/MID presentation layers, and approximately 240x65 repeating GROUND tiles. Later LAB integration used a 960x540 QA canvas and 2048x682 authored-world geometry. These must be reconciled deliberately rather than assuming the later QA implementation replaced the earlier production contract.

## Continent production workflow
Complete/approve all assets for all three stages of a continent before continent integration. Then perform full end-to-end QA/calibration. Remaining stages follow: stage spec -> vision mockup -> individual assets under approval gate -> continent integration -> QA.

## Flying flock animation contract
Every constituent bird/creature in a multi-creature flying hazard must visibly animate across the full cycle with stable body anchors and readable independent wing silhouettes. Prefer fewer creatures over accepting a partially static flock member.

## 2026-09-16 — LAB25Q externalization blueprint approved
`docs/LAB25Q_EXTERNALIZATION_BLUEPRINT.md` is the execution authority for the LAB25Q migration. The archived LAB25Q is the sole behavioral/visual source baseline. First prove CSS/JavaScript externalization while retaining the exact embedded image bytes; then build a semantic asset manifest and replace current approved named assets incrementally with explicit geometry classification and parity checks. Positional/occurrence-order asset replacement is rejected. JavaScript modularization occurs only after external-asset parity. CI/deployment success alone is not parity approval.

## 2026-09-17 — Phase 6 production naming and cleanup
Production source must not use LAB25Q as its active application/module identity. LAB25Q is historical reference terminology reserved for the archived harness and migration history. Active runtime names are `game-config.js`, `game-runtime.js`, and `game.css`; the active configuration global is `window.GAME_CONFIG`.

Duplicate/dead migration runtime files and completed one-time migration workflows are removed from the active codebase after their work is complete. Preserved history remains under `archive/` and in Git history. QA builds expose a visible phase identifier so screenshots and regression reports identify the tested build family.

Phase 6 remains behavior-preserving. Landscape regeneration, grounding, hazard sizing/positioning, hitbox calibration, Slide timing reconciliation, and load optimization remain separate follow-on work.

## 2026-09-17 — Phase 7 production authoring architecture
Phase 7 precedes landscape regeneration and establishes the authoring architecture. `docs/PHASE7_AUTHORING_ARCHITECTURE_EXECUTION_SPEC.md` is its step-by-step execution authority.

The canonical runtime coordinate system is 960x540. Device/browser scaling is presentation-only; gameplay geometry remains in canonical coordinates. FAR, MID and GROUND overlap in the same viewport. A single fixed production ground surface is to be locked in Phase 7A and becomes the vertical anchor from which character feet, grounded hazards and finish markers derive.

The production landscape rule is locked in `docs/WORLD_RENDERING_SPEC.md`: FAR normally renders from Y=0 and owns complete skyline/top coverage; FAR/MID/GROUND use deliberate overscan and overlap; source anchors map deterministically into the canonical viewport; offsets calibrate correctly authored artwork rather than conceal missing coverage.

Design, Test and Game modes use the same renderer/configuration but different modular application shells. The packaged production game must exclude Design/Test authoring and QA modules. A development bootstrap may attach those modules; the production bootstrap imports only production runtime/game modules.

Atlas/sprite-sheet assets remain the preferred strategy where related assets or animation frames naturally belong together. The authoring model is SOURCE REGION -> FINE CROP -> SCALE -> POSITION -> COLLISION. Source rectangles are editable/inspectable, including a full-atlas view; crop cannot reveal pixels outside the selected source rectangle. Numeric authoring controls provide direct numeric entry plus increment/decrement stepping for precision.

Phase 6 calibration settings remain evidence until replacement assets are authored. Phase 8 landscape regeneration cannot begin until Phase 7 authoring architecture and the fixed ground-surface contract are accepted.

## 2026-09-17 — Phase 7A canonical coordinate contract
The fixed production logical viewport is 960x540 and the canonical production ground surface is `GROUND_SURFACE_Y = 410`. This is the exact 2x mapping of the recovered original 480x270 composition with `GROUND_BASELINE_Y = 205`, preserving the original vertical composition ratio and 130 logical pixels of terrain depth below the surface.

Legacy stage `seamY` and `groundYOffset` values are calibration evidence, not production gameplay-coordinate authority. In the current Phase 6 renderer their source-anchor terms cancel, so the effective legacy gameplay surface is `seamY + groundYOffset`. The production model separates artwork placement from gameplay anchoring: character feet, grounded hazards, flying clearances and finish markers derive from the fixed Y=410 surface, while landscape source anchors and visual offsets determine artwork placement only.

## 2026-09-17 — Phase 7B canonical configuration schema
The canonical configuration model separates authored production configuration, legacy Phase 6 compatibility calibration, transient runtime state, and development/QA state. The shared visual vocabulary is `SOURCE REGION -> FINE CROP -> SCALE -> POSITION -> GAMEPLAY ANCHOR -> COLLISION`.

Source region is independently editable and is the authority for which atlas pixels belong to an asset. Fine crop is non-negative and can only remove pixels inside that source region; revealing more artwork requires moving or expanding the source region. This preserves atlas strategy and resolves cases such as the Gaudí Mosaic Bench without negative crop or atlas explosion.

Canonical character, hazard and finish gameplay anchors derive from `GROUND_SURFACE_Y = 410`. Legacy seams and landscape offsets remain explicitly representable as compatibility evidence until regenerated landscapes replace them. The Phase 7B adapter must not mutate the live Phase 6 configuration or renderer; visible Phase 6 behavior remains the regression baseline while later Phase 7 gates migrate the renderer and application bootstraps.

## 2026-09-17 — Phase 7C production/development bootstrap boundary
Production and development now have explicit entry boundaries. `src/game.html` is the production GAME entry and may load the production bootstrap/shared runtime only; it must not depend on the development bootstrap, `src/js/dev/**`, or the development mode shell. `src/dev.html` is the development/QA entry and may attach DESIGN / TEST / GAME shell modules around the same mounted shared renderer/configuration instance.

The preserved Phase 6 `src/index.html` remains the shared runtime host during this migration gate so 7C does not duplicate or rewrite gameplay/rendering logic. This is intentionally transitional: remaining legacy QA responsibilities inside that host are extracted by later Phase 7 editor/test/game gates. The final consumer package must still omit development/QA modules, and CI must enforce the production dependency boundary rather than relying on hidden UI.

## 2026-09-18 — Phase 7 animated-hazard authoring feedback correction
In Design mode, a paused animated-hazard preview is locked to the frame explicitly selected in the contextual inspector. Play advances that same deterministic preview; it does not depend on the shared flying-hazard clock. Per-frame Fine Crop remains non-negative and affects visual rendering only, without changing collision geometry. The contextual inspector exposes hazard and character preview-guide toggles and an enlarged cropped-frame preview so source-pixel changes can be inspected before save/export.

## 2026-09-18 — Phase 7 visually accepted; Phase 8 authorized
The user confirmed that the final animated-hazard pause-control correction resolved the observed issue and accepted Phase 7 as complete. Later defects may be handled as they arise, but they do not keep Phase 7 open by default.

Phase 8 landscape work is now authorized to enter pre-production. Authorization does not waive any asset lock or approval gate: the current landscapes are audited before mutation, each proposed repair is approved and produced iteratively, and no new continent is partially integrated. Phase 8 must preserve the accepted Phase 7 renderer, fixed 960x540 viewport, Y=410 ground surface, immutable originals, and GitHub review/CI/deployment workflow.

## 2026-09-18 — Phase 8 regeneration scope corrected
The user reaffirmed the previously accepted 2026-09-16 Phase 8 decision: all 27 existing landscape layers across the nine NA/SA/EU stages are the regeneration validation batch for the standardized landscape contract. The later technical audit's 21 KEEP / 6 REPAIR classifications describe the condition and reusable visual content of the current files; they do not exempt 21 files from standardization and do not supersede the accepted regeneration decision.

The validation sequence remains one complete stage first, with FAR, MID and GROUND generated and approved individually, followed by technical and full-renderer composite QA and any necessary contract refinement. After the pilot is accepted, regenerate the other eight existing stage sets. Only after all 27 validation layers pass may the contract be promoted to the remaining 36 layers for the other 12 stages.

The production objective is one consistent authored geometry and one shared 960x540/Y410 renderer contract without stage-specific world Y/scale or character-grounding compensation. Approved themes, visual identities, references and original files remain preserved; regeneration standardizes geometry and layer responsibility rather than authorizing redesign.

## 2026-09-18 — Phase 8 prompts and source references are Git-tracked
The 27 validation-batch landscape generation jobs are defined in `docs/PHASE8_LANDSCAPE_PROMPT_MANIFEST.md`. Every generation must attach the exact immutable repository source PNG as its primary visual reference; mentioning a path in prompt text alone is insufficient. A shared geometry/layer contract plus a stage- and layer-specific lock preserves approved visual identity while correcting canvas geometry, anchors, coverage, overlap, alpha ownership and repeat seams.

Generated candidates remain outside `assets-original/` and do not replace production assets until technical QA, canonical composite review and explicit user approval. Prompt approval never constitutes image approval.

## 2026-09-18 — P8-NA01-FAR approved
The user approved the final regenerated NA01 Desert FAR asset after visual-direction review and wrap-seam correction. The approved validation asset is `assets/phase8-validation/north-america/NA01_BG_DISTANT_MESAS.png`, SHA-256 `6de84e693faa4e40c039a4ad1b4bdbdb2994ae228dc04ed059abff9042eaf3b1`.

The asset is 2172x724, fully opaque, preserves the approved NA01 American Southwest visual identity, and provides the complete FAR foundation. It remains a validation asset and is not promoted into the production world path until the full NA01 FAR/MID/GROUND set and composite are approved. The next asset gate is `P8-NA01-MID`.

## 2026-09-18 — P8-NA01-MID approved
The user approved the final regenerated NA01 Desert MID asset after isolated-layer, wrap-seam and approved-FAR composite review. The approved validation asset is `assets/phase8-validation/north-america/NA01_BG_MID_DESERT.png`, SHA-256 `e00d7b476dd26d4b7cd34f08b470ec4c8b7b9c57d12c70a82fb88da7e82e41d4`.

The asset is 2172x724 with genuine alpha transparency, preserves the approved NA01 sandstone/cactus/shrub identity, coordinates with the approved FAR, and provides lower overlap without baking in FAR or playable GROUND content. It remains a validation asset pending the full NA01 set and composite gate. The next asset gate is `P8-NA01-GROUND`.

## 2026-09-18 — P8-NA01-GROUND approved; complete pilot enters development QA
The user approved the regenerated NA01 Desert GROUND asset and requested an immediate pause in further generation so the complete FAR/MID/GROUND pilot can be validated in the development app. The approved validation asset is `assets/phase8-validation/north-america/NA01_GROUND_DESERT.png`, SHA-256 `3199a71ece851b5f491e6d21d5c11b1ac56836e252ad56c2eb32e89a25f3e908`.

The asset is 2172x724 with genuine alpha above the terrain silhouette, source-space running surface Y=393, continuous terrain depth through the bottom overscan and a reviewed horizontal wrap. Development-only NA01 integration uses the three approved validation files at their authored 2172-pixel source width and maps the ground anchor to canonical Y=410. Initial composite QA found that FAR scale 1.00 exposed a small void through low MID alpha; the development pilot therefore starts at FAR Y=0 / scale 1.25, which closes the 960x540 composition without modifying the approved file. This calibration is test evidence, not yet a universal-contract decision. Packaged production remains on the preserved legacy NA01 asset set until canonical composite, gameplay and calibration QA receive explicit user acceptance. No later Phase 8 generation proceeds during this pilot gate.

## 2026-09-18 — Successful main CI automatically deploys the exact QA snapshot

The normal GitHub publication path is approval -> exact snapshot on `main` -> successful Production CI for that push SHA -> automatic Pages deployment of the same validated SHA. The Pages workflow is triggered by completion of `Production CI`, filters to successful `push` runs whose head branch is `main`, and explicitly checks out `workflow_run.head_sha`. Development-branch CI, pull-request CI, failed CI and cancelled CI do not deploy.

Manual `workflow_dispatch` remains an emergency/recovery fallback. Rerunning an older workflow is not a substitute because it retains the older run's SHA. This automation removes routine interactive GitHub login from approved QA deployments without changing asset approvals, visual acceptance gates, main-branch control or the requirement to verify the deployed SHA and URL before user testing. Operational details are maintained in `docs/GITHUB_WORKFLOW.md`.

## 2026-09-18 — NA02 tests a stage-level Phase 8 approval gate

After reviewing the completed NA01 pilot, the user authorized an NA02 workflow test that moves the user-facing approval gate from each individual FAR/MID/GROUND generation to the complete integrated stage. NA02 must still be produced sequentially as FAR -> MID -> GROUND, use each immutable repository source as the direct image-generation reference, pass per-layer technical QA, preserve final candidates in Git and pass canonical composite/application QA before presentation.

The assistant may iterate or reject intermediate NA02 candidates without separate user approval. None of the three NA02 layers is individually promoted as user-approved merely because it passes internal QA; the approval decision applies to the complete integrated NA02 stage. Existing asset locks, immutable originals, source-anchored prompts, GitHub CI/deployment and final visual acceptance remain required. Character, hazard, collision and finish-marker calibration may be deferred until landscape generation is complete, as explicitly requested by the user.

## 2026-09-18 — Deterministic horizontal wrap repair authorized

The user authorized a reusable deterministic seam correction when image generation produces an otherwise acceptable landscape whose only remaining defect is a visible left/right edge discontinuity during repetition. This correction exists specifically to ensure continuous backgrounds during endless horizontal scrolling.

The repair is limited to feathering corresponding edge color continuity. It may not redesign or relocate landmarks, change dimensions or alpha ownership, rescale artwork, alter source anchors, or compensate for missing layer coverage. Every corrected candidate must be reviewed in a duplicated wrap preview and remains subject to the applicable technical, composite and final user-acceptance gates.

## 2026-09-18 — NA02 complete candidate set enters integrated-stage QA

Under the authorized stage-level trial, NA02 FAR, MID and GROUND were produced sequentially from their immutable repository references and passed internal dimension, alpha/layer-ownership, lower-depth and wrap/composite checks. The candidate files remain pending user approval as one integrated stage; internal QA does not individually approve them. Development-only integration uses the same 2172-pixel source width, canonical Y=410 surface and pilot FAR scale evidence as NA01. Character, hazard, collision and finish-marker calibration remain intentionally deferred.

## 2026-09-18 — Generated landscape binary integrity is a deployment gate

Phase 8 generated candidates must be browser-decodable before Git preservation and application integration. The initial NA02 deployment passed a dimensions-only check but its large PNGs were truncated by an intermediate Base64/text-output transfer limit. The damaged GitHub copies retained a PNG header and dimensions, yet contained incomplete pixel data: first the runtime preload failed, and a later partial decode rendered only bands of each image.

The local NA02 candidates remained intact. They were losslessly re-encoded while the problem was being isolated, with zero changed pixels, but metadata was not the root cause; the binary transfer path was. Large image files must now use a binary-safe upload path and their committed copies must pass PNG signature, complete chunk boundaries, per-chunk CRC, full IDAT decompression, exact scanline length and filter-byte validation in Production CI. A dimensions-only check is insufficient.

Validation-asset runtime URLs carry a short content-hash version key. When a candidate binary is replaced, its key changes with the documented SHA-256 so Pages and browser caches cannot retain an earlier failed or superseded response under the same path.

## 2026-09-18 — NA02 integrated stage approved; NA03 authorized end to end

After deployed Design and gameplay-run QA, the user approved the complete NA02 FAR, MID and GROUND set as one integrated stage and separately verified the landscape source previews added to the Contextual Inspector. The three NA02 validation assets are therefore visually accepted; deferred character, hazard, collision and finish-marker calibration remains outside this landscape approval.

The successful NA02 stage-level workflow is authorized for NA03. Produce NA03 sequentially as FAR -> MID -> GROUND from the immutable repository references, perform internal per-layer technical and composite QA, preserve the final candidates in Git, integrate the complete stage into the development app, and present one deployed stage-level visual acceptance gate.

## 2026-09-18 — Deterministic candidate recovery authorized

The user authorized a reusable recovery workflow when an internally validated but uncommitted generated candidate is lost during a conversation/workspace handoff while its original generated source survives. Recovery may deterministically reconstruct the required canvas geometry from that surviving source, but it must preserve the source's visual content, repeat all technical and visual QA, record new checksums, and explicitly distinguish reconstructed bytes from the lost candidate. A recorded old hash may not be claimed for a reconstruction unless it actually matches. Git integration and user acceptance gates remain unchanged.

The lost NA03 candidates could not be recovered byte-for-byte from the surviving 2048-pixel generated outputs. The authorized reconstruction uses nearest-neighbor geometry normalization to preserve the pixel-art forms. FAR and MID were normalized to 2172x724. GROUND was normalized to 2172x724 and translated so its first nontransparent row maps exactly to source Y=393; the lower masonry clips through Y=723. The reconstructed candidates passed internal isolated-layer, alpha-bound, duplicated-wrap and source-composite review and remain pending deployed integrated-stage user acceptance.

- `NA03_BG_DISTANT_NYC.png`: SHA-256 `c91146de70b1c9b645ce58ef905e1fa6234100a2cc58fb08488454d036b6e2b8`
- `NA03_BG_MID_CITY.png`: SHA-256 `b1a0be3d2e0589459641e0eda9ac60540792ad88a42c40805f54d9aba9e1dbba`
- `NA03_GROUND_CITY.png`: SHA-256 `e1dd43725810ae44ac5fd9fa47698d90e0a9d8a1d5b3bae696c490ff12e49f3c`

## 2026-09-18 — NA03 proxy-derived recovery superseded by ZIP originals

The first NA03 recovery used copies produced by the chat image-attachment pipeline. Those workspace copies measured 2048 pixels wide even though the user's true files measured 2172x724 for FAR/MID and 2170x725 for GROUND. The user identified that the deployed GROUND was not the intended asset and supplied all three originals inside a ZIP so image-transfer resizing could not alter them.

The proxy-derived NA03 files and their hashes above are superseded and are not approved assets. FAR and MID are restored byte-for-byte from the ZIP originals. GROUND is reconstructed only from the true 2170x725 ZIP original: nearest-neighbor normalization to 2172x724 preserves the pixel-art treatment, followed by a vertical translation that maps the first nontransparent row from Y=233 to the contract surface Y=393 and retains terrain through Y=723. All three remain pending integrated-stage user acceptance.

- `NA03_BG_DISTANT_NYC.png`: SHA-256 `be8f72c6f523624c8022ba14e43715a1aede49b0119e875d8afa504c80333df6`
- `NA03_BG_MID_CITY.png`: SHA-256 `3ea3319ab25c3a00a97c39af04d1cd5323443d6557bdd8d65acd2e759100e18b`
- `NA03_GROUND_CITY.png`: SHA-256 `c91ddde03037a003e4b28d62ffa44c06965d0a3fdbe8de9ff3c304b1e2b1fe25`

## 2026-09-18 — User-approved NA03 GROUND attachment supersedes reconstructed ZIP derivative

The deployed ZIP-derived NA03 GROUND with SHA-256 `c91ddde03037a003e4b28d62ffa44c06965d0a3fdbe8de9ff3c304b1e2b1fe25` did not visually match the GROUND image the user had approved. The user explicitly identified the attached `NA03_GROUND_CITY(9).png` as the approved asset and directed that it replace the deployed derivative.

The ordinary attachment transport exposed only a resized 2048x684 proxy, while the preserved ZIP contains the true 2170x725 source matching the user's approved artwork. The untouched ZIP original is preserved byte-for-byte as `assets/phase8-validation/north-america/NA03_GROUND_CITY.png`: 2170x725 RGBA, SHA-256 `095aa9cb85d4d36a2cb97f9a1d72bca8255c42abda836bfedfa6eeb893293b02`. It must not be resized, translated, regenerated or visually redesigned. Its explicit asset approval does not complete the NA03 stage gate; FAR, MID and GROUND together plus Contextual Inspector previews remain pending deployed user acceptance.

## 2026-09-18 — User-supplied NA03 MID correction bakes tested placement into artwork

Deployed integrated review exposed a small gap between the NA03 MID and GROUND at the standard runtime MID offset `Y=0`. The user verified that a runtime adjustment of approximately `+18` logical pixels closed the gap, resupplied the intended brownstone image and explicitly accepted its foliage and façade details for integration.

The attachment pipeline delivered a `2048x682` proxy. To retain the supplied composition while satisfying the Phase 8 production geometry, it was restored with nearest-neighbor sampling to `2172x724` and translated downward by 41 source pixels, the source-space equivalent of the tested logical adjustment at the `960/2172` runtime scale. This keeps runtime MID offset `Y=0`, avoids a stage-specific calibration nudge and fills the MID-to-GROUND overlap without redesigning the supplied content. The integrated candidate SHA-256 is `97b3a625a3b0bbf887ccd0016242b4b7572e5886a8501eb5b3192da459d8bac9`. NA03 remains pending final deployed FAR/MID/GROUND and Contextual Inspector acceptance.

## 2026-09-18 — Fresh NA03 MID supersedes the translated supplied correction

Deployed comparison at runtime MID offsets `Y=0` and `Y=-18` established that the translated supplied MID could not simultaneously retain the intended restrained bushes/sidewalk relationship and satisfy the universal standard runtime offset `Y=0`. The user authorized a fresh generation against the locked Phase 8 MID contract rather than further translation or optimization of the supplied image.

The first fresh candidate was rejected internally because its lower foliage ended above the sidewalk at `Y=0`. The second closed the gap but was rejected by the user because its nearly continuous oversized shrubs competed with the street trees and overwhelmed the brownstones. The third candidate reduced the shrub mass to intermittent low foundation clusters, restored readable building bases and tree trunks, preserved true transparent sky and horizontal repeat behavior, and retained enough lower-edge coverage for the standard `Y=0` overlap. The user approved this standalone `2172x724` RGBA candidate for integration, SHA-256 `adc6a17a5a40b01ceead9b52219c48f4cfe35d90291a7398a8f1d9d96b0deb8a`. This approval does not complete the NA03 stage gate; the deployed FAR/MID/GROUND stage and Contextual Inspector remain pending user acceptance.

## 2026-09-18 — Alternate NA03 storefront MID direction approved

Deployed testing showed that the preceding MID still exposed a transparent band at standard runtime `Y=0` and required a temporary `Y=16` adjustment. The user approved a clearer alternate neighborhood direction using brownstones, stoops, railings, restrained storefront façades, mature street trees and sparse planters instead of relying on foundation shrubs.

The generated visual direction was preserved while a deterministic lower-overscan correction extended only its existing foundation/frontage pixels below source Y=609 through the bottom edge and normalized its one-pixel width discrepancy. The resulting `2172x724` RGBA candidate has continuous authored coverage across rows Y=610–723, SHA-256 `9a6e14456bc351c18229c503d0827f5bbbf83f521a6f24bce25a2c7a7cf5ef14`, and is integrated for deployed testing at runtime MID offset `Y=0`. NA03 remains pending complete-stage and Contextual Inspector acceptance.

## 2026-09-18 — NA03 and North America Phase 8 landscapes approved

The user accepted the deployed NA03 FAR/MID/GROUND integration at standard runtime MID offset `Y=0`, including gameplay/test presentation, Contextual Inspector previews and horizontal scrolling/repeat behavior. This completes the NA03 stage-level acceptance gate. The accepted NA03 MID is the alternate storefront/brownstone asset with SHA-256 `9a6e14456bc351c18229c503d0827f5bbbf83f521a6f24bce25a2c7a7cf5ef14`; the accepted GROUND remains the untouched user-supplied ZIP original with SHA-256 `095aa9cb85d4d36a2cb97f9a1d72bca8255c42abda836bfedfa6eeb893293b02`.

With NA01, NA02 and NA03 accepted as complete landscape sets, the North America Phase 8 landscape gate is closed. Deferred character grounding, hazard positioning, collision/hitbox calibration and finish-marker calibration remain deferred until landscape generation is complete and are not reopened by this approval. Work pauses before South America pending the user's next question or instruction.

## 2026-09-18 — Integrated-stage workflow becomes the Phase 8 standard

The North America production history established that repeated per-layer user approvals, candidate copying, intermediate deployments and documentation updates did not improve the final decision. The meaningful acceptance test is the deployed integrated FAR/MID/GROUND stage. The successful NA02/NA03 stage-level approach therefore supersedes the older Phase 8 per-layer user-approval and continent-only integration language.

For each remaining stage, the assistant may autonomously generate, reject, replace and regenerate FAR, MID and GROUND against the locked specifications and immutable references. Working files are written directly to their final `assets/phase8-validation/` paths, with Git providing rollback; `assets-original/` remains immutable. Every layer still receives technical QA, and the complete stage must pass isolated, duplicated-wrap and canonical composite review before one integration commit and deployment. The user then gives one deployed integrated-stage APPROVED or REVISE decision. If revision is required, only the responsible layer or configuration is reopened.

Internal iterations do not require permanent status or decision-log updates. Final hashes and status are recorded once at integration and approval. Exact PNG integrity validation, content-addressed cache keys, non-force exact-tree promotion, Production CI and Pages verification remain required because they protect against previously observed binary corruption and stale deployment artifacts. Temporary candidate/review workspaces are implementation detail and are not committed by default.

## 2026-09-18 — Phase 8 stage QA automation established

The one-time workflow-support setup implements the streamlined Phase 8 process without changing approved artwork or gameplay. `config/phase8-landscapes.json` is the machine-readable authority for validation-stage paths, immutable references, expected geometry/layer properties, status and cache keys. The PNG integrity validator now reads that registry instead of maintaining a North America-only file list.

`scripts/phase8-stage-qa.py <stage>` produces technical hashes and alpha/coverage evidence plus isolated-layer, duplicated-wrap and canonical 960x540/Y410 composite previews under the ignored `tmp/phase8-qa/` workspace. Production CI runs the registry-driven PNG and check-only stage validation for all entries marked `integrated` or `approved`. `assets/phase8-candidates/`, `tmp/` and Python cache files are ignored and remain uncommitted. North America was used to validate the automation; no accepted asset bytes or runtime behavior changed.

## 2026-09-18 — Completed next-stage prompt required at closeout

Every Phase 8 stage and continent closeout must give the user the next fully completed, copy-ready conversation prompt. The assistant resolves the next stage ID, continent, asset filenames, repository authority and scope from the current repository and `config/phase8-landscapes.json`. Placeholder templates or instructions requiring the user to fill in fields are not an acceptable handoff.

The Phase 8 workflow-support setup is project-wide and one-time. It already registers the North America, South America and Europe validation stages. It is maintained as stages advance but is not rerun for each stage or continent.

## 2026-09-18 — SA01 Amazon Rainforest Phase 8 landscapes approved

The user accepted the deployed SA01 FAR/MID/GROUND integration after Design/Test/Game, Contextual Inspector and horizontal-scroll/repeat review. The final MID retains the colorful hanging snake, removes the monkey and has SHA-256 `8e5653f5dfc7dea8254521f445e2609eebf3b1e0c683c64e4ffab38755519f03`. FAR remains `cbe232ba047d06634a9949f8498b9546efecb45eccaed548a054b85ca933039a`; GROUND remains `3ca40ce6a3164d1d330fc18d5d56df42488aab0989055c5bf129066fe214a795`.

The acceptance required correcting a development-bootstrap omission that had left SA01 on legacy 2048-wide scaling and nonzero offsets. The approved mapping now matches the canonical Phase 8 pilot contract: source width 2172, FAR/MID/GROUND offset Y=0, FAR scale contract 1.25, MID/GROUND scale contract 1.00 and ground surface Y=410. Production CI now guards SA01's inclusion in that canonical override. SA01 is closed; SA02 is next and must start in a fresh conversation.

## 2026-09-19 — Repository commands and focused context replace repeated workflow setup

The user authorized a reusable command system, targeted context loading and removal of superseded active instructions. `ASSET_COMMAND_WORKFLOW.md` is the single operational runbook; AGENTS routes routine commands to `scripts/assets.mjs`, its command catalog, the focused landscape profile and selected prompt sections. Help lists valid continent/stage/layer keys. Build/generate completes one unapproved stage through deployed review; regenerate/revise explicitly reopens only the selected scope. Publish/resume do not regenerate artwork. Closeout always prints the next fully populated repository command. Other asset families are discoverable but cannot execute until their approved keys/profiles/validation are registered.

NA/SA/EU are the Phase 8 scope. AF/AS/OC/AN identifiers (AU alias for OC) reserve the remaining continents without inventing stage themes or authorizing production. The one-time setup is not repeated for Europe or later continents. Replaced the long current-status troubleshooting narrative and duplicate execution instructions with concise status and links; removed live per-layer approval and pending-pilot wording. Historical decisions and immutable reference areas remain preserved.

The audit found independent hardcoded canonical-stage lists in the host and inner renderer, legacy reset/saved-geometry paths, and offline QA that assumed ideal geometry. The registry now drives active source URLs and geometry in both startup paths; actual Scene drawing and offline QA share the mapping, and tests cover activating any registered stage, resets and saved/imported transforms. Saved-config viewport validation was also corrected to use the schema's exported w/h fields. Pending/packaged legacy assets and unrelated gameplay normalization remain unchanged. Approved PNGs, including NA03's dimension exception and SA01's snake MID, are unchanged.

A compact machine checkpoint records selected scope, file/metadata hashes and recovery/approved revision pointers. Selected work must reach verified Git storage before an interrupted handoff; temporary previews are not durable work and remain uncommitted. Prefer normal authenticated Git; the binary-safe object route is a fallback established once, with no encoded-image chat relay. Existing development/main CI and exact-revision Pages gates remain; report them briefly. One deployed integrated-stage user decision remains the artwork approval gate. No routine prompt/candidate/process pre-approval or speculative extra image optimization is added.

Live setup verification also exposed cached scripts after a successful Pages deployment. Registry sync therefore generates content-versioned script URLs in both entry pages, including the registry and its consumers. CI rejects stale versions. These derived HTML updates are part of the same automatic sync, not additional manual image-production steps.

## 2026-09-19 — SA02 Andes landscape stage approved

The user explicitly approved SA02 after deployed integrated-stage review. Lock the FAR, MID and GROUND bytes from reviewed main revision `29176df173eeb78cd0436bfa98a13f22317bb07d`, with exact hashes and CI/Pages evidence in `docs/SA02_LANDSCAPE_QA.md` and `config/asset-workflow-state.json`. Preserve canonical zero offsets and existing gameplay/calibration. SA02 is closed; SA03 Rio de Janeiro is the next stage.

## 2026-09-19 — Apply SA02 workflow lessons before SA03

SA02 completed generation, deployment and explicit visual approval. Its startup exposed repeated terminal-authentication/transfer investigation and excessive setup output. Routine asset startup now uses the focused command route instead of the cumulative specification list and proceeds to generation; connected GitHub publication is the established route for ChatGPT connector sessions, superseding the earlier normal-Git-first startup advice. The active GitHub workflow records the object-publication and push-CI lookup procedure. The handoff generator now emits only the repository and resolved command; following AGENTS.md is automatic.

Existing development/main CI and Pages gates are preserved. Approval-only commits still trigger automatic checks, but unchanged approved images and geometry do not require a second local artwork/browser review or user acceptance. These are narrow execution corrections, not a claim that the earlier conversation-limit warning has been diagnosed or that context limits cannot recur. SA02 artwork, runtime, approval and SA03 production state are unchanged by this update.

## 2026-09-19 — Remaining-continent full-stage planning authorized

While EU03 proceeds separately, the user requested a mapped production plan for the final four continents: Africa, Asia, Oceania/Australia and Antarctica, three stages each. Each new stage includes FAR/MID/GROUND, two grounded hazards and one flying hazard. `docs/REMAINING_CONTINENTS_PLAN.md` and `config/remaining-continent-proposal.json` record proposed themes, exact file mappings, references, shared atlas/QA requirements and the one-time runtime/command expansion handoff.

Authorization is for planning at this point. Theme/hazard choices and the proposed new-atlas geometry await explicit review; the catalog remains production-disabled and is not wired into the existing runtime/resolver. Existing Phase 8 completion/landscape-contract-promotion and deployed-stage approval gates remain. The plan uses five PNG files per new stage (three landscapes, a two-object ground atlas and one flying atlas), totaling 60 files and 72 logical assets, with one complete-stage acceptance per stage and no repeated continent setup.
