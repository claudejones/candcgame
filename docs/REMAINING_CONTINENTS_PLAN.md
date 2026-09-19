# Remaining continents — stage production proposal

Status: DRAFT FOR USER REVIEW, 2026-09-19. Planning is authorized; these themes, new hazard contracts and expanded production commands are not yet approved or enabled.

## Scope and authority

Complete the campaign's remaining 12 stages: Africa AF01–AF03, Asia AS01–AS03, Oceania OC01–OC03 (AU alias), and Antarctica AN01–AN03. Each stage contains three landscape layers, two distinct grounded hazards and one flying hazard type. This is broader than the current landscape-only Phase 8 work.

Phase 8 remains the existing nine NA/SA/EU stages and 27 landscape images. EU03 and Europe regression continue separately. The existing landscape test contract explicitly requires completion of its validation batch before promotion to the remaining 36 landscapes. Preparing this proposal does not satisfy that gate.

The selected themes, per-layer art briefs, hazard identities, exact proposed filenames, source references and order are stored in [remaining-continent-proposal.json](../config/remaining-continent-proposal.json). That file is a planning catalog, not runtime configuration. Its productionEnabled flag is false; simply changing it is not an activation mechanism. Existing command and runtime registries remain unchanged.

The user reviews the proposed lineup below once. After content approval, agents select and verify references, generate/correct internally, integrate and deploy. The next artwork approval is the complete deployed stage, including its hazards. No new per-image prompt/candidate approval loop is introduced.

## Proposed lineup

These are original design proposals, not recovered prior decisions. Order: Africa, Asia, Oceania, Antarctica; one stage per production conversation.

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

The choices alternate silhouettes, terrain and palettes rather than repeating one visual treatment twelve times. The three Antarctic stages distinguish coast, volcanic terrain and a fictional coastal outpost. All running surfaces remain level; mountains, dunes and cliffs are background scenery.

### User-directed composition, identity and scale requirements

The user confirmed these requirements on 2026-09-19. They constrain revision of the draft lineup; they do not approve its remaining choices or reopen accepted stages.

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

## Proposed new-hazard production contract

This section is a proposed common contract for new assets only. It does not resize or normalize existing approved atlases. Validate it on AF01 before applying it to the other eleven stages.

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
- scripts/assets.mjs and config/asset-commands.json: only landscape generation is enabled; reserved continents are blocked.
- .github/workflows/production-ci.yml: a literal nine-stage expectation.
- Saved/imported/exported authoring configurations and packaged/development bootstraps must tolerate registered additions without losing the existing stages.

After lineup approval, one implementation task should:
1. Introduce a shared stage/asset catalog consumed by the relevant runtime, editor, resolver and validators. Keep content approval, reference readiness, file availability, integration state and user acceptance distinct. Register new stages as pending; no empty or placeholder stage is promoted as playable.
2. Extend the existing landscape contract/registry beyond its Phase 8 name without duplicating the geometry logic or changing accepted file paths. Promote the validated geometry contract only after its existing gate is satisfied.
3. Implement focused hazard packets, atlas/source-region metadata, animation/contact/collision checks and checkpointing. Reuse the existing publisher and resume/rollback mechanism, extending checkpoint scope to all five stage files and hazard configuration.
4. Add a full-stage command that resolves the approved catalog entry. Keep existing landscape-only commands unchanged. Implement the commands listed below before advertising them as runnable.
5. Replace hardcoded stage counts with catalog-based validation while still explicitly protecting all nine accepted stage records and their assets. Exercise stage selection, loading, reset, save/import/export, hazard inspection, source previews and finish behavior. Preserve gameplay constants and the production/development boundary.
6. Supply one working, copy-ready AF01 command once prerequisites are satisfied. Pilot the complete new workflow on AF01, including two ground hazards and the flying animation, before repeating it for AF02–AN03.

Coordinate the shared catalog with the separately active production-editor redesign. Reuse its agreed integration points when available; this plan is not authorization to merge or replace that editor. Recheck live branches before writes and preserve concurrent EU03/editor work.

The historical Slide duration discrepancy (.70s in recovered prose versus .75s current baseline) and deferred character/global calibration are existing separate decisions. Do not silently resolve them while registering new stages. The new hazards' own fit, contacts and collision QA are part of their production task.

## Intended command interface — implementation pending

These examples specify the target interface. They do not claim these future commands currently work.

| User intent | Completed example after enablement |
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

Once the plan and shared implementation are approved and Phase 8 promotion is complete:
1. Resolve one stage and its checkpoint; attach its reference pixels and read only its focused rules.
2. Generate FAR, MID, GROUND, the ground-object atlas and flying atlas. Validate each changed output and correct identified defects internally. Commit/recover selected completed files when interrupted; never silently regenerate missing work.
3. Integrate the stage configuration, cache keys, source regions, anchors and hazards. Inspect the composite and repeat behavior; test both ground objects with both characters and test flying HIGH/LOW, animation loop and collisions using the existing diagnostics.
4. Complete the established development/main CI and Pages process using connected publication. Verify deployed bytes, geometry, Inspector previews and a full scrolling run through the finish. Unlimited Lives may be used transiently for scenery/end-of-stage review; separately demonstrate the new hazards' collision/avoidance behavior.
5. Give the user one deployed complete-stage review. Say what passed: landscape, new-hazard and deployment checks. Do not label it exhaustive verification of every game feature.
6. On explicit approval, preserve the reviewed files/configuration, record acceptance once and supply the next command. Metadata-only closeout does not repeat unchanged artwork/browser review. After the third stage, run the continent regression without reopening accepted artwork.

Do not turn a passing technical check into artistic approval or keep polishing accepted work. Global mechanics remain unchanged. A report should say whether the defect is in an image, configuration, collision, tool access or deployment before changing anything.

## Gate and readiness record

| Requirement | Status at proposal creation |
| --- | --- |
| User authorized planning the remaining continents and 2 ground + 1 flying hazard per stage | Confirmed in this conversation |
| Proposed themes, hazard choices and common new-atlas contract accepted | Pending user review |
| EU03, Europe regression and Phase 8 geometry-contract promotion complete | Check current status; not assumed here |
| Stage-specific visual/species reference packs ready | Pending agent preparation |
| Shared 21-stage/hazard command support implemented and tested | Pending |
| AF01 complete-stage production pilot accepted | Pending |
| Remaining 11 stages produced and accepted | Pending |

Approval of the proposal locks its direction and authorizes the scoped implementation work; it does not pre-approve generated artwork or waive any current release gate. Implementation and reference preparation can proceed while outstanding Phase 8 work finishes. New-landscape production waits for the contract-promotion gate.

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
