# Remaining continents — stage production proposal

Status: DIRECTION AND WORKFLOW APPROVED, 2026-09-19. The user approved this plan and the bounded parallel workflow. Implementation may proceed. Unresolved replacement selections, visual references, calibration/contract promotion and runtime integration remain explicit readiness items; no generated artwork is pre-approved.

## Scope and authority

Complete the campaign's remaining 12 stages: Africa AF01–AF03, Asia AS01–AS03, Oceania OC01–OC03 (AU alias), and Antarctica AN01–AN03. Each stage contains three landscape layers, two distinct grounded hazards and one flying hazard type. This is broader than the current landscape-only Phase 8 work.

Phase 8 remains the existing nine NA/SA/EU stages and 27 landscape images. All nine landscape sets and all three landscape regression gates have passed. The existing landscape test contract explicitly requires completion of its validation batch before promotion to the remaining 36 landscapes. Required dependent calibration and formal contract promotion remain pending; this approval does not claim those checks passed.

The selected themes, per-layer art briefs, hazard identities, exact proposed filenames, source references and order are stored in [remaining-continent-proposal.json](../config/remaining-continent-proposal.json). That file supplies focused command/readiness packets, not playable runtime configuration. Its productionEnabled flag remains false; changing it alone cannot activate production. Approval, selection/reference readiness, runtime registration and generated-artwork acceptance are separate fields. Existing approved runtime records remain unchanged.

The user has approved the stage themes, production scope and workflow direction. The flagged duplicate/replacement selections below still need concrete resolution and review; this approval does not silently accept an unknown replacement. Agents prepare those choices and references without asking the user to fill in filenames or research fields. Once the selected content and existing readiness gates are satisfied, agents generate/correct internally, integrate and deploy. The next artwork approval is the complete deployed stage, including its hazards. No new per-image prompt/candidate approval loop is introduced.

## Proposed lineup

Themes are approved. Hazard entries are the original proposals with selection issues listed in the catalog; they must not be read as an accepted final hazard lineup. Order: Africa, Asia, Oceania, Antarctica; one stage per production conversation.

| Key | Theme | Ground hazard 1 | Ground hazard 2 | Flying hazard |
| --- | --- | --- | --- | --- |
| AF01 | Tanzania — Serengeti savannah | Termite mound | Fallen acacia log | Lilac-breasted roller |
| AF02 | Namibia — Sossusvlei dunes | Weathered sandstone block | Dry branch snag | Pale chanting goshawk |
| AF03 | Morocco — Marrakesh medina | Terracotta storage jar | Produce crate | Replacement pending; pigeons excluded |
| AS01 | Japan — Kyoto bamboo foothills | Bamboo bundle | Mossy stone | Japanese white-eye |
| AS02 | China — Zhangjiajie stone forest | Rock outcrop | Weathered stump | Red-billed blue magpie |
| AS03 | Thailand — Bangkok riverfront | Market basket | Parked handcart | House swift |
| OC01 | Australia — Uluru red desert | Spinifex tussock | Sandstone block | Galah |
| OC02 | Australia — Queensland tropical coast | Driftwood stump | Coconut crate | Rainbow lorikeet |
| OC03 | New Zealand — Fiordland | Mossy boulder | Fallen beech log | Kea |
| AN01 | Antarctic Peninsula — icy coast | Blue ice chunk | Snow-covered rock | Antarctic tern |
| AN02 | Ross Island — volcanic shore | Basalt boulder | Wind-carved ice ridge | South polar skua |
| AN03 | East Antarctica — coastal research outpost | Cargo crate | Equipment sled | Snow petrel |

The goal is distinct silhouettes, terrain and palettes across the twelve stages; the initial hazard lineup still needs the duplicate review below. The three Antarctic stages distinguish coast, volcanic terrain and a fictional coastal outpost. All running surfaces remain level; mountains, dunes and cliffs are background scenery.

### User-directed composition, identity and scale requirements

The user confirmed these requirements on 2026-09-19. They constrain all remaining-stage production and the unresolved selection revisions; accepted stages remain closed.

- **FAR needs a focal point.** Specify one recognizable, locally appropriate landmark or dominant natural formation, comparable in compositional importance to the Paris landmark. A generic skyline or an incidental tiny roof is insufficient. Keep its silhouette readable behind MID, at the canonical runtime scale and during scrolling; place it clear of repeat joins. Do not duplicate the feature within a tile merely to fill space.
- **MID needs a sign of life.** Specify a restrained, scene-specific detail: characteristic settlement/frontage, signs of everyday use, or locally appropriate background wildlife. The village and Amazon snake are examples of the principle, not motifs to copy into new stages. Decorative wildlife is static, noninteractive scenery, separated visually from the playable route and hazard silhouettes. No people, new animation system or gameplay obstacles are implied.
- **Every selected element must belong to its setting.** Verify the particular location, habitat and appearance before generation. Regionally fitting does not require a species to be endemic, but a familiar generic prop is not enough to establish stage identity.
- **Do not repeat distinctive elements or hazards across the campaign.** Compare proposed identities and visible silhouettes with all nine existing stages and the other new proposals. Renaming a pigeon species, recoloring an existing object or changing a log's wood species does not create a new hazard. Shared background materials remain possible; focal points, life details and hazard designs must be distinct.
- **Choose for believable scale and readability.** Review the actual 960×540 composite and normal mobile presentation with the characters, nearby architecture and other objects visible. Large features must retain their apparent mass at their intended depth; small creatures must not disappear or become implausibly giant to function as hazards. Frame/canvas dimensions alone are not visible subject size. Prefer a more suitable subject if it cannot read at a credible scale. Keep canonical landscape transforms and gameplay physics unchanged.
- **Resolve these choices in the focused stage brief.** Record the FAR focal point, MID life detail, local reference, comparison against existing/proposed elements and intended relative size before generation. Carry these fields into the future command packet; check their appearance in the existing composite review. This is agent work within the planned content review and single deployed-stage approval, not an extra user approval gate or another general-purpose QA document.

The initial catalog has not passed that comparison. NA03 already uses pigeons; AF03's rock pigeon is rejected and removed as a generation choice. Its reserved flying filename is now species-neutral until the agent resolves a distinct, suitable replacement. Repeated logs, stones/outcrops and crates/baskets across the initial proposal and existing NA02/SA01/SA02/EU01 hazards need replacement or a demonstrably different design; a local material or color change is insufficient. Also compare swift versus existing swallows, parrot-family choices versus existing macaws/parakeets, and small birds such as the white-eye for credible gameplay scale. These are unresolved selection risks, not claims that those designs passed. Do not generate from the initial lineup unchanged.

## Deliverables and filenames

| Deliverable | Per stage | Total | Proposed packaging |
| --- | ---: | ---: | --- |
| FAR, MID, GROUND | 3 images | 36 images | Separate PNG layers |
| Ground hazards | 2 designs | 24 designs | One two-cell OBJECT_ATLAS per stage |
| Flying hazard | 1 design | 12 designs | One four-frame animation atlas per stage |
| Complete set | 6 logical assets | 72 logical assets | 5 PNG files per stage; 60 files total |

Every filename is already resolved in the proposal catalog; the user never supplies filenames. New files use assets/worlds/africa, assets/worlds/asia, assets/worlds/oceania and assets/worlds/antarctica. These are proposed final directories for new content, avoiding another phase-numbered image directory. Existing Phase 8 asset paths and immutable originals are preserved.

Reuse existing approved characters, finish marker and shared cloud assets. World-map art, passports/medals, audio, bonus-level art, new mechanics and new character outfits are separate scopes. New stages still need ordinary stage/finish/pacing configuration in addition to images.

## References and generation rules

Use the existing landscape operational profile and source specifications; do not copy entire historical prompts into each task. A future stage packet needs only the shared contract, the selected catalog entry, actual attached references and the selected output scope.

The catalog pins accepted NA/SA/EU style-reference stages to the reviewed repository revision. They establish pixel treatment, geometry and presentation, not the new location's geography. Resolve their actual paths from that revision's registry and inspect/attach those pixels. Do not paste source scenes into a different continent or treat an old location reference as the new theme.

Before generating a stage, the agent prepares a small reference set: appropriate approved game art plus reliable location/species images. Record source URLs and selected reference paths once in that stage's checkpoint. The research links below support the proposed geographic basis, but are not a complete generation-ready visual reference pack. Several bird species and site-specific details still need local-range/appearance confirmation, explicitly noted per entry. Do not claim a scientific check has passed merely because a thematic proposal was approved. A contradiction requires a narrow correction or user direction; routine reference selection does not require another approval.

Preserve the current 2172×724 landscape contract, logical viewport 960×540, surface Y=410, FAR/MID/GROUND offsets zero, multipliers 1.25/1/1, and MID/GROUND source anchors 621/393 after Phase 8 contract promotion. FAR is opaque; MID/GROUND have genuine alpha and authored overlap/depth. No hazards, people, playable obstacles, HUD, text, shared clouds or finish markers baked into scenery.

No generated image is accepted on dimensions alone. Inspect ownership, repeat seams, useful lower coverage and composition against the real runtime, including saved-state/reset behavior. Approved exceptions on existing stages remain untouched.

## New-hazard pilot contract

This common direction is approved for the new-asset pilot only. It does not resize or normalize existing approved atlases. Its measured scale/contact/collision results remain unverified until AF01; validate that pilot before applying the contract to the other eleven stages.

Ground atlas:
- 2172×724 RGBA PNG, two side-by-side 1086×724 cells. GROUND1 occupies the left cell, GROUND2 the right.
- Two stationary objects initially; a parked cart or sled does not introduce independent movement or extra animation.
- Clear shape contrast within the pair: generally one lower/wider object and one more compact/upright object, both avoidable with the established controls.
- At least 32 source pixels of clear gutter inside each cell. No scenery, labels, cast backdrop or neighboring-object contamination.
- Proposed authored foot anchor Y=620 in each cell. This is a sprite anchor, separate from landscape GROUND's Y=393 source anchor. Derive the runtime transform so the visible contact point meets the common Y=410 surface. Do not import a legacy stage's corrective grounding offset.
- Source rectangles, fine crop, scale, foot anchor and collision geometry are separate metadata. Collision follows the readable solid obstacle, excluding decorative leaves, straps, tails or transparent margins.
- A single-object revision must preserve the accepted sibling's pixels and metadata. If the generation tool cannot reliably do that in a combined atlas, resolve lossless cell assembly in the one-time tooling implementation; do not silently accept a redrawn sibling.

Flying atlas:
- 2172×724 RGBA PNG, four 543×724 cells in one horizontal row, one creature per frame for the proposed initial set.
- Face right consistently with the established flying-reference convention. Fixed body anchor proposed at cell X=271, Y=362; stable body size, head position and aggregate collision footprint.
- Explicit loop: upstroke apex → descending wings forward → downstroke apex → rising wings swept back → first frame. Four visibly different wing poses; avoid duplicate middle frames and a snapping loop.
- Keep all wings/tails inside the cell gutters. Use existing HIGH/LOW flight placement derived from the canonical ground surface; calibrate the new sprite to current controls without changing global clearances, speed or physics to rescue it.
- If a later approved choice uses a flock, every constituent creature must animate independently, remain visible and keep stable body anchors. A single flying hazard type does not require multiple creatures.
- Inspect white birds/ice objects against Antarctic scenery and dark birds against forests at actual gameplay size. Contrast is functional.

Final per-object scale, fine crop, contact and collision values are measured during integration and recorded with the approved asset. The proposal intentionally does not present untested collision numbers as calibrated facts. Landscape offsets remain zero; sprite-anchor-derived placement is a different contract.

## One-time implementation handoff

The current application supports nine stages in more places than the landscape registry. Verified extension points include:
- src/js/config-schema.js: literal STAGE_IDS and canonical/configuration validation.
- src/js/game-config.js: world profiles, hazard definitions and finish/stage settings.
- src/js/dev/asset-navigator.js and src/index.html: continent/stage options.
- src/js/dev/hazard-editor.js: atlas-path lookup.
- src/js/game-runtime.js: stage seeds, titles, source loading and legacy reset defaults.
- scripts/assets.mjs and config/asset-commands.json: existing landscape execution remains available; full-stage and hazard packets report readiness and remain blocked until their prerequisites pass.
- .github/workflows/production-ci.yml: a literal nine-stage expectation.
- Saved/imported/exported authoring configurations and packaged/development bootstraps must tolerate registered additions without losing the existing stages.

The approved implementation scope is below. Workflow V3 implements bounded delegation, per-file recovery and focused readiness packets. Runtime/editor expansion and hazard validation remain work to complete before new-stage generation:
1. Introduce a shared stage/asset catalog consumed by the relevant runtime, editor, resolver and validators. Keep content approval, reference readiness, file availability, integration state and user acceptance distinct. Register new stages as pending; no empty or placeholder stage is promoted as playable.
2. Extend the existing landscape contract/registry beyond its Phase 8 name without duplicating the geometry logic or changing accepted file paths. Promote the validated geometry contract only after its existing gate is satisfied.
3. Focused full-stage/hazard packets and per-file checkpoints are implemented in Workflow V3. Complete atlas/source-region metadata and animation/contact/collision validators before enabling new hazards; retain the existing publisher and whole-stage review.
4. Full-stage command resolution is implemented. Complete the production integration path before marking the packet ready; a resolved command is not evidence that generation, hazard QA or the 21-stage runtime is enabled. Keep existing landscape-only commands unchanged.
5. Replace hardcoded stage counts with catalog-based validation while still explicitly protecting all nine accepted stage records and their assets. Exercise stage selection, loading, reset, save/import/export, hazard inspection, source previews and finish behavior. Preserve gameplay constants and the production/development boundary.
6. Supply one working, copy-ready AF01 command once prerequisites are satisfied. Pilot the complete new workflow on AF01, including two ground hazards and the flying animation, before repeating it for AF02–AN03.

Coordinate the shared catalog with the separately active production-editor redesign. Reuse its agreed integration points when available; this plan is not authorization to merge or replace that editor. Recheck live branches before writes and preserve approved EU03 and concurrent editor work.

The historical Slide duration discrepancy (.70s in recovered prose versus .75s current baseline) and deferred character/global calibration are existing separate decisions. Do not silently resolve them while registering new stages. The new hazards' own fit, contacts and collision QA are part of their production task.

## Command interface — readiness aware

The resolver accepts the following stage keys and scopes. Status/help report the mapped files and remaining blockers; production operations stay blocked while prerequisites are pending. Command recognition does not imply a playable stage or completed hazard validators.

| User intent | Command; production requires readiness |
| --- | --- |
| See available commands/readiness | In claudejones/candcgame: help. |
| Produce all five AF01 image files and integrate the full stage | In claudejones/candcgame: build stage AF01. |
| Replace only a landscape layer | In claudejones/candcgame: regenerate landscape AF01 MID. |
| Replace only the first grounded hazard | In claudejones/candcgame: regenerate hazard AF01 GROUND1. |
| Revise only the flying hazard | In claudejones/candcgame: revise hazard AF01 FLYING: make the wing poses more distinct. |
| Recover the full unfinished stage | In claudejones/candcgame: resume AF01. |
| Accept the reviewed complete stage | In claudejones/candcgame: approve AF01. |

GROUND1/GROUND2/FLYING are hazard selectors; GROUND alone is the landscape layer. The resolver must explain invalid/ambiguous input and keep edits scoped to the selected asset. The user supplies no filenames, continent fields, hashes or additional setup prompt. At every closeout, the agent prints the actual next completed command automatically.

## Repeatable production and acceptance

Once the remaining readiness items and Phase 8 contract promotion are complete:
1. Resolve one stage and its checkpoint; attach its reference pixels and read only its focused rules.
2. Generate FAR, MID, GROUND, the ground-object atlas and flying atlas. Validate each changed output and correct identified defects internally. Commit/recover selected completed files when interrupted; never silently regenerate missing work.
3. Integrate the stage configuration, cache keys, source regions, anchors and hazards. Inspect the composite and repeat behavior; test both ground objects with both characters and test flying HIGH/LOW, animation loop and collisions using the existing diagnostics.
4. Complete the established development/main CI and Pages process using connected publication. Verify deployed bytes, geometry, Inspector previews and a full scrolling run through the finish. Unlimited Lives may be used transiently for scenery/end-of-stage review; separately demonstrate the new hazards' collision/avoidance behavior.
5. Give the user one deployed complete-stage review. Say what passed: landscape, new-hazard and deployment checks. Do not label it exhaustive verification of every game feature.
6. On explicit approval, preserve the reviewed files/configuration, record acceptance once and supply the next command. Metadata-only closeout does not repeat unchanged artwork/browser review. After the third stage, run the continent regression without reopening accepted artwork.

Do not turn a passing technical check into artistic approval or keep polishing accepted work. Global mechanics remain unchanged. A report should say whether the defect is in an image, configuration, collision, tool access or deployment before changing anything.

## Bounded parallel execution

Use the single operational procedure in `ASSET_COMMAND_WORKFLOW.md`. One coordinator owns one active stage, shared configuration, the job checkpoint, integration and publication. Start with at most two workers and no nested delegation: one keeps the three landscape layers coherent; the other owns the two ground hazards in their shared atlas and the complete flying atlas. A physical output file is the checkpoint/retry unit; do not split atlas cells or animation frames across workers. Brief preparation or diagnostic support can use a lighter worker within the same limit.

The coordinator resolves and pins shared art direction, actual reference pixels and source revisions once. Each worker gets only its assigned file packet and permitted output paths, uses an isolated working directory/worktree, and returns a small manifest with hashes, evidence and exceptions. Workers never write the shared registry/state or move shared branch refs. The coordinator verifies results and durable recovery objects before assembling the complete stage. Resume reuses verified files and identifies missing or stale work; it never treats a remembered worker conversation as saved assets.

Use existing image generation and the established connected publisher. There is no new image API runner, copied skill, per-continent setup or user-facing agent-management command. Concurrent image throughput is unmeasured; serialize image calls if necessary while independent preparation/checks overlap. Do not promise a subscription usage percentage. For AF01 record elapsed time, image attempts, repeated setup/context volume and reported usage when available; use the result to decide whether more concurrency helps. Keep summaries short and stop optional optimization after acceptance.

## Gate and readiness record

| Requirement | Current status |
| --- | --- |
| Remaining 12 themes, five-file stage scope, visual rules and bounded parallel workflow direction | User approved on 2026-09-19 |
| New-atlas direction | Approved for AF01 pilot; measured integration still required |
| Flagged hazard replacements/duplicates and detailed local scene choices | Resolve and review concrete selections; recorded per stage |
| All 27 NA/SA/EU landscapes and three continent landscape regressions | Approved/passed |
| Dependent calibration and formal landscape-contract promotion | Pending |
| Actual stage-specific visual/species reference packs | Pending agent preparation |
| Workflow V3 job checkpoints and focused stage/hazard readiness packets | Implemented; tested separately from image production |
| Shared 21-stage runtime/editor integration and hazard validators | Pending; generation blocked |
| AF01 complete-stage production pilot | Pending |
| Remaining 11 stage sets | Follow a successful AF01 pilot |

Approval authorizes implementation of the scoped plan. It does not pre-approve generated artwork or waive a release gate. The next production step is to resolve the reported prerequisites, not to repeat plan approval or regenerate accepted landscapes. The coordinator supplies one concrete next prompt and any genuinely unresolved content choices; the user supplies no technical checkpoint fields.

## Research basis

Sources below informed geography and selected wildlife. Scenery composition, objects, proposed palettes and game hazard pairings are design choices. The catalog identifies which source applies to each stage and which details remain to verify. Reading one source does not validate every species or exact landmark in that stage.

- [UNESCO — Serengeti National Park](https://whc.unesco.org/en/list/156/)
- [UNESCO — Namib Sand Sea](https://whc.unesco.org/en/list/1430/)
- [UNESCO — Medina of Marrakesh](https://whc.unesco.org/en/list/331/)
- [UNESCO — Historic Monuments of Ancient Kyoto](https://whc.unesco.org/en/list/688/)
- [UNESCO — Wulingyuan Scenic and Historic Interest Area](https://whc.unesco.org/en/list/640/)
- [Tourism Authority of Thailand — Bangkok](https://www.tourismthailand.org/Destinations/Provinces/Bangkok/219)
- [UNESCO — Uluru-Kata Tjuta National Park](https://whc.unesco.org/en/list/447/)
- [UNESCO — Wet Tropics of Queensland](https://whc.unesco.org/en/list/486/)
- [UNESCO — Te Wahipounamu](https://whc.unesco.org/en/list/551/)
- [New Zealand DOC — Kea](https://www.doc.govt.nz/nature/native-animals/birds/birds-a-z/kea/)
- [Australian Antarctic Program — Antarctic geography](https://www.antarctica.gov.au/about-antarctica/geography-and-geology/geography/)
- [Australian Antarctic Program — Antarctic tern](https://www.antarctica.gov.au/about-antarctica/animals/flying-birds/antarctic-tern/)
- [Australian Antarctic Program — South polar skua](https://www.antarctica.gov.au/about-antarctica/animals/flying-birds/south-polar-skua/)
- [Australian Antarctic Program — Petrels and shearwaters](https://www.antarctica.gov.au/about-antarctica/animals/flying-birds/petrels-and-shearwaters/)
- [Australian Antarctic Program — Casey research station](https://www.antarctica.gov.au/antarctic-operations/stations-and-field-locations/casey/)
