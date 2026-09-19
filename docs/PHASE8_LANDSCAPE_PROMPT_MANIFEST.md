# Phase 8 Landscape Prompt Manifest

Status: PRODUCTION PROMPT SET — North America complete; integrated-stage approval workflow active
Date: 2026-09-18  
Scope: 27 validation-batch images for NA01–NA03, SA01–SA03 and EU01–EU03

## How to execute a prompt

Resolve ordinary commands with `scripts/assets.mjs`; it reads only the selected job sections into the task packet. Workflow steps are maintained in `ASSET_COMMAND_WORKFLOW.md`. This document owns art direction, not a second publication process. Runtime geometry is confirmed by the active registry/shared renderer contract.

For each job, the image-generation call must:

1. Attach the exact `Reference` PNG through the image tool's referenced-image mechanism. A path written in prompt text is not a substitute for attaching the pixels.
2. Use the complete Shared Contract below followed by the job's Stage Lock and Layer Prompt.
3. Generate only the single requested layer. Do not generate a three-layer composite or contact sheet.
4. Write the working result to its final `assets/phase8-validation/` path. Git preserves the prior known-good version for rollback; never overwrite `assets-original/`.
5. Inspect the layer in isolation, in a duplicated horizontal wrap and in the canonical FAR+MID+GROUND composite. The assistant may reject or regenerate it internally.
6. Publish only after the complete stage passes internal technical and composite QA. User approval applies to the deployed integrated stage, not to each intermediate layer.

The immutable source image is the mandatory visual-identity authority. The prompt may correct geometry, coverage, alpha ownership, overscan and seams; it may not reinterpret the location, palette, landmarks or approved pixel-art language.

## Shared Contract — prepend to every job

```text
Using the attached repository PNG as the mandatory primary visual reference, regenerate one production landscape layer for Claude & Constance Around the World. Preserve the reference's recognizable location, approved landmark choices, palette, lighting, atmosphere, pixel density, edge treatment and polished 8-bit/pixel-art visual language. This is controlled geometric standardization, not a redesign.

Output exactly one 2172 x 724 PNG. Preserve crisp intentional pixel-art forms: no photorealism, painterly blur, vector-flat redesign, smooth 3D rendering, new art style, text, labels, UI, HUD, characters, hazards, finish marker, controls, transparency checkerboard or unrelated objects. Do not bake in the renderer-owned shared cloud layer.

The image must horizontally continue cleanly for scrolling/repetition, with compatible left and right edge color, height and visual rhythm. Do not place a unique landmark so it is visibly cut or duplicated at the repeat seam. Supply genuine alpha only when the layer contract calls for it.

Author deliberate vertical overscan and coordinated overlap for a 960 x 540 logical viewport with the canonical running surface at Y=410. Do not reproduce legacy blank padding, inconsistent source anchors or stage-specific positional compensation merely because it exists in the reference.

Follow the requested layer responsibility exactly. FAR, MID and GROUND are separate overlapping assets and must not absorb content owned by another layer. Return only the requested PNG with no caption, border, mockup or alternate version.
```

## Layer directives

### FAR directive

```text
Create the FAR foundation layer. It must be fully opaque across the entire 2172 x 724 canvas, normally render from source top at logical Y=0, cover the complete skyline/top responsibility, and extend useful scenery through the lower presentation region so intended MID transparency never exposes a void. Preserve atmospheric depth. Exclude foreground terrain, playable surfaces, close architecture/vegetation and shared clouds.
```

### MID directive

```text
Create the MID parallax layer on a transparent 2172 x 724 canvas. Preserve the reference's middle-distance silhouettes and landmark language. Use genuine alpha wherever FAR should show through. Provide substantial visual coverage and authored overscan down into the GROUND transition so the layer never requires an extreme runtime Y offset or an upward-displaced GROUND to hide a blank band. Exclude the playable running surface and deep terrain body.
```

### GROUND directive

```text
Create the GROUND gameplay layer on a transparent 2172 x 724 canvas. Author one continuous playable surface at the confirmed source anchor Y=393. Preserve the reference's terrain/walkway material and decorative edge language. Provide substantial continuous terrain depth from the surface through the bottom overscan; never end early or expose empty backing below. Keep the region above the surface transparent except for approved low vegetation, props or edge details that belong to the ground silhouette. Exclude characters, hazards and finish marker.
```

## North America

Continent status: COMPLETE — NA01, NA02 and NA03 FAR/MID/GROUND stage sets passed their applicable deployed visual-acceptance gates on 2026-09-18.

### P8-NA01-FAR — Desert mesas

- Reference: `assets-original/current-generated/NA-assets/NA01_BG_DISTANT_MESAS.png`
- Candidate: `assets/phase8-validation/north-america/NA01_BG_DISTANT_MESAS.png`
- Status: APPROVED 2026-09-18
- Approved SHA-256: `6de84e693faa4e40c039a4ad1b4bdbdb2994ae228dc04ed059abff9042eaf3b1`
- Layer directive: FAR
- Stage lock: Preserve the expansive saturated-blue desert sky, layered red-orange mesas and buttes, purple-blue atmospheric distance and warm arid plain. Keep the broad open American Southwest vista and horizon rhythm; do not add cities, close cacti, structures or clouds.

### P8-NA01-MID — Desert formations

- Reference: `assets-original/current-generated/NA-assets/NA01_BG_MID_DESERT.png`
- Candidate: `assets/phase8-validation/north-america/NA01_BG_MID_DESERT.png`
- Status: APPROVED 2026-09-18
- Approved SHA-256: `e00d7b476dd26d4b7cd34f08b470ec4c8b7b9c57d12c70a82fb88da7e82e41d4`
- Layer directive: MID
- Stage lock: Preserve the red sandstone buttes, smaller rock towers, scattered upright cacti, dry shrubs and warm orange-red desert palette. Retain the approved alternating tall/low silhouette and transparent sky openings; do not add a sky or distant horizon.

### P8-NA01-GROUND — Desert trail

- Reference: `assets-original/current-generated/NA-assets/NA01_GROUND_DESERT.png`
- Candidate: `assets/phase8-validation/north-america/NA01_GROUND_DESERT.png`
- Status: APPROVED 2026-09-18
- Approved SHA-256: `3199a71ece851b5f491e6d21d5c11b1ac56836e252ad56c2eb32e89a25f3e908`
- Layer directive: GROUND
- Stage lock: Preserve the flat reddish desert running surface, rounded red stone strata, sparse tufts, succulents and small dry plants. Maintain a readable level gameplay edge and dense rocky depth beneath it; do not introduce dunes, pavement or green forest terrain.

### P8-NA02-FAR — Mountain range

- Reference: `assets-original/current-generated/NA-assets/NA02_BG_DISTANT_MOUNTAINS.png`
- Candidate: `assets/phase8-validation/north-america/NA02_BG_DISTANT_MOUNTAINS.png`
- Status: APPROVED 2026-09-18 — integrated-stage acceptance
- Approved SHA-256: `259b8f38845a39ed81b77f711facab528bc09eb7900bb62c9346f52a33d00b58`
- Layer directive: FAR
- Stage lock: Preserve the bright blue sky, long snow-capped mountain chain, layered blue ridges and dark evergreen foothills. Retain the crisp alpine panorama and cool palette; do not add close trees, rocks, buildings or clouds.

### P8-NA02-MID — Pines and boulders

- Reference: `assets-original/current-generated/NA-assets/NA02_BG_MID_PINES.png`
- Candidate: `assets/phase8-validation/north-america/NA02_BG_MID_PINES.png`
- Status: APPROVED 2026-09-18 — integrated-stage acceptance
- Approved SHA-256: `cc4a6f43442963115f8b8c8bff73ce8dc2cfaab9428e9a16c49243d6876f5fd3`
- Layer directive: MID
- Stage lock: Preserve the irregular evergreen forest silhouette, varied pine heights, gray boulder clusters and low green shrubs. Increase coordinated lower coverage and overlap while retaining transparent openings; do not add mountains, sky, trail surface or stream water.

### P8-NA02-GROUND — Forest trail

- Reference: `assets-original/current-generated/NA-assets/NA02_GROUND_TRAIL.png`
- Candidate: `assets/phase8-validation/north-america/NA02_GROUND_TRAIL.png`
- Status: APPROVED 2026-09-18 — integrated-stage acceptance
- Approved SHA-256: `f6ada52c153667a5d7d8466c07da3e55d4d271faa1bf46dc5e0f46d732dfdc81`
- Layer directive: GROUND
- Stage lock: Preserve the compact brown dirt trail, exposed gray stones, darker soil body, mossy grass and low forest plants. Extend dependable terrain depth to the bottom and create compatible repeat edges. Do not include the separate gap-water asset or paint a permanent stream into this continuous ground layer.

### P8-NA03-FAR — New York skyline

- Reference: `assets-original/current-generated/NA-assets/NA03_BG_DISTANT_NYC.png`
- Candidate: `assets/phase8-validation/north-america/NA03_BG_DISTANT_NYC.png`
- Status: APPROVED 2026-09-18 — deployed integrated-stage acceptance
- Candidate SHA-256: `be8f72c6f523624c8022ba14e43715a1aede49b0119e875d8afa504c80333df6`
- Layer directive: FAR
- Stage lock: Preserve the blue-sky Manhattan waterfront panorama, recognizable Empire State Building emphasis, varied distant skyscrapers and blue water band. Retain the approved skyline density and scale; do not add close brownstones, street furniture, clouds or gameplay pavement.

### P8-NA03-MID — Brownstone neighborhood

- Reference: `assets-original/current-generated/NA-assets/NA03_BG_MID_CITY.png`
- Candidate: `assets/phase8-validation/north-america/NA03_BG_MID_CITY.png`
- Status: APPROVED 2026-09-18 — deployed integrated-stage acceptance at runtime MID Y=0
- Candidate SHA-256: `9a6e14456bc351c18229c503d0827f5bbbf83f521a6f24bce25a2c7a7cf5ef14`
- Source treatment: regenerated in the user-approved alternate neighborhood direction with brownstones, stoops, railings, restrained storefronts, mature trees and sparse planters. A deterministic lower-overscan correction preserves the approved composition through source Y=609, extends only its existing foundation/frontage pixels through Y=723, and normalizes the generated one-pixel width discrepancy to the required `2172x724` RGBA canvas. Rows Y=610–723 contain continuous authored MID coverage across the full width so runtime MID offset remains `Y=0`.
- Layer directive: MID
- Stage lock: Preserve the row of varied brick brownstones and apartment buildings, rooftop water tanks/chimneys, street trees and warm urban palette. Keep the recognizable neighborhood silhouette and transparent sky; do not include the distant skyline, playable sidewalk or hazards.

### P8-NA03-GROUND — City sidewalk

- Reference: `assets-original/current-generated/NA-assets/NA03_GROUND_CITY.png`
- Candidate: `assets/phase8-validation/north-america/NA03_GROUND_CITY.png`
- Status: APPROVED 2026-09-18 — deployed integrated-stage acceptance
- Candidate SHA-256: `095aa9cb85d4d36a2cb97f9a1d72bca8255c42abda836bfedfa6eeb893293b02`
- Source dimensions: `2170x725` RGBA; preserved byte-for-byte from the ZIP original matching the user's approved attachment, without resizing, translation or reconstruction.
- Layer directive: GROUND
- Stage lock: Preserve the level gray sidewalk slabs, curb edge, dark masonry/substructure and occasional restrained weeds. Maintain a clean urban running surface and continuous depth; do not add buildings, road traffic, street props or hazards.

## South America

### P8-SA01-FAR — Amazon basin

- Reference: `assets-original/current-generated/SA-assets/SA01_BG_DISTANT_AMAZON.png`
- Candidate: `assets/phase8-validation/south-america/SA01_BG_DISTANT_AMAZON.png`
- Status: APPROVED 2026-09-18 — deployed integrated-stage acceptance
- Candidate SHA-256: `cbe232ba047d06634a9949f8498b9546efecb45eccaed548a054b85ca933039a`
- Layer directive: FAR
- Stage lock: Preserve the vast layered Amazon canopy, winding pale-blue river channels, humid blue-green distant hills and atmospheric jungle depth. Retain the dense emerald palette and tiny distant bird accents only if they remain subtle background detail; do not add close trunks, vines or gameplay terrain.

### P8-SA01-MID — Dense rainforest

- Reference: `assets-original/current-generated/SA-assets/SA01_BG_MID_AMAZON.png`
- Candidate: `assets/phase8-validation/south-america/SA01_BG_MID_AMAZON.png`
- Status: APPROVED 2026-09-18 — deployed integrated-stage acceptance
- Candidate SHA-256: `8e5653f5dfc7dea8254521f445e2609eebf3b1e0c683c64e4ffab38755519f03`
- Layer directive: MID
- Stage lock: Preserve the tall tropical trees, hanging vines, palms, broad leaves, red floral accents, layered undergrowth and dense dark-green jungle silhouette. Retain controlled transparent canopy openings; do not add distant hills, sky, river or the running trail.

### P8-SA01-GROUND — Jungle trail

- Reference: `assets-original/current-generated/SA-assets/SA01_GROUND_AMAZON.png`
- Candidate: `assets/phase8-validation/south-america/SA01_GROUND_AMAZON.png`
- Status: APPROVED 2026-09-18 — deployed integrated-stage acceptance
- Candidate SHA-256: `3ca40ce6a3164d1d330fc18d5d56df42488aab0989055c5bf129066fe214a795`
- Layer directive: GROUND
- Stage lock: Preserve the dark jungle-soil running edge, tangled roots, rounded stones, vines, ferns and tropical ground plants. Keep rich continuous earthy depth below the surface without swallowing the MID foliage; do not add tree canopies or water.

### P8-SA02-FAR — Andes panorama

- Reference: `assets-original/current-generated/SA-assets/SA02_BG_DISTANT_ANDES.png`
- Candidate: `assets/phase8-validation/south-america/SA02_BG_DISTANT_ANDES.png`
- Layer directive: FAR
- Stage lock: Preserve the sweeping snow-capped Andes range, overlapping blue-gray peaks, sunlit green foothills and clear blue high-altitude sky. Keep the long mountainous rhythm and cool natural palette; do not add village buildings, close rocks or clouds.

### P8-SA02-MID — Highland village

- Reference: `assets-original/current-generated/SA-assets/SA02_BG_MID_ANDES.png`
- Candidate: `assets/phase8-validation/south-america/SA02_BG_MID_ANDES.png`
- Layer directive: MID
- Stage lock: Preserve the approved low Andean village, small warm-roofed white buildings, terraced gray-green rocks, highland shrubs and open transparent sky. Keep the restrained village scale and asymmetric rocky silhouette; do not reintroduce distant mountains into this layer or create a playable surface.

### P8-SA02-GROUND — Rocky highland trail

- Reference: `assets-original/current-generated/SA-assets/SA02_GROUND_ANDES.png`
- Candidate: `assets/phase8-validation/south-america/SA02_GROUND_ANDES.png`
- Layer directive: GROUND
- Stage lock: Preserve the level ochre-brown trail edge, large rounded gray boulders, mossy green caps and sparse high-altitude grasses. Extend stable rock-and-earth depth to the bottom and ensure seamless repetition; do not add buildings or mountain silhouettes.

### P8-SA03-FAR — Rio panorama

- Reference: `assets-original/current-generated/SA-assets/SA03_BG_DISTANT_RIO.png`
- Candidate: `assets/phase8-validation/south-america/SA03_BG_DISTANT_RIO.png`
- Layer directive: FAR
- Stage lock: Preserve Rio's blue bay, Sugarloaf Mountain, Corcovado with Christ the Redeemer, layered green peaks, beachfront city and saturated blue sky/water. Retain the approved landmark relationships and panoramic coastal identity; do not add close palms, promenade elements or clouds.

### P8-SA03-MID — Rio waterfront

- Reference: `assets-original/current-generated/SA-assets/SA03_BG_MID_RIO.png`
- Candidate: `assets/phase8-validation/south-america/SA03_BG_MID_RIO.png`
- Layer directive: MID
- Stage lock: Preserve the palm-lined coastal promenade, green mountains, curved bay, distant beachfront buildings and layered tropical landscaping. Keep transparent sky/water openings and the approved bright coastal palette; do not add the playable patterned pavement or duplicate the FAR landmark composition.

### P8-SA03-GROUND — Copacabana promenade

- Reference: `assets-original/current-generated/SA-assets/SA03_GROUND_RIO.png`
- Candidate: `assets/phase8-validation/south-america/SA03_GROUND_RIO.png`
- Layer directive: GROUND
- Stage lock: Preserve the light stone promenade with dark wave-like mosaic pattern, sandy tan lower edge and layered masonry depth. Keep a clean level gameplay surface and continuous repeat; do not add palms, buildings, vendors or beach hazards.

## Europe

### P8-EU01-FAR — Santorini caldera

- Reference: `assets-original/current-generated/EU-assets/EU01_BG_DISTANT_GREECE.png`
- Candidate: `assets/phase8-validation/europe/EU01_BG_DISTANT_GREECE.png`
- Status: APPROVED 2026-09-19 — deployed integrated-stage acceptance
- Layer directive: FAR
- Stage lock: Preserve the Santorini caldera's intensely blue Aegean water, distant volcanic island, white cliffside village, blue domes, warm sunlit rock and small sailboats. Retain the crisp white/blue/pink Mediterranean palette; do not add close terraces, foreground flowers or clouds.

### P8-EU01-MID — Cycladic village terraces

- Reference: `assets-original/current-generated/EU-assets/EU01_BG_MID_GREECE.png`
- Candidate: `assets/phase8-validation/europe/EU01_BG_MID_GREECE.png`
- Status: APPROVED 2026-09-19 — deployed integrated-stage acceptance
- Layer directive: MID
- Stage lock: Preserve the stepped white Cycladic buildings, blue domes and doors, cypress trees, stone arches, pergolas and vivid magenta bougainvillea. Keep intentional openings that reveal the caldera FAR, but correct unintended window/arch voids and provide adequate lower overlap. Do not create the playable promenade.

### P8-EU01-GROUND — Santorini promenade

- Reference: `assets-original/current-generated/EU-assets/EU01_GROUND_GREECE.png`
- Candidate: `assets/phase8-validation/europe/EU01_GROUND_GREECE.png`
- Status: APPROVED 2026-09-19 — deployed integrated-stage acceptance
- Layer directive: GROUND
- Stage lock: Preserve the pale stone promenade, warm stone retaining wall, blue wooden rail accents, flower pots, bougainvillea and small Mediterranean plants. Extend continuous stone depth through the bottom overscan while keeping a level readable surface; do not add buildings or sea.

### P8-EU02-FAR — Paris skyline and Seine

- Reference: `assets-original/current-generated/EU-assets/EU02_BG_DISTANT_PARIS.png`
- Candidate: `assets/phase8-validation/europe/EU02_BG_DISTANT_PARIS.png`
- Status: APPROVED 2026-09-19 — deployed integrated-stage acceptance
- Layer directive: FAR
- Stage lock: Preserve the Eiffel Tower focal point, Seine, arched bridges, classical Paris skyline, domes and bright blue sky. Retain the approved warm stone, green tree and blue-water balance; do not add close Haussmann façades, lamps, café objects or clouds.

### P8-EU02-MID — Paris riverfront

- Reference: `assets-original/current-generated/EU-assets/EU02_BG_MID_PARIS.png`
- Candidate: `assets/phase8-validation/europe/EU02_BG_MID_PARIS.png`
- Status: APPROVED 2026-09-19 — deployed integrated-stage acceptance
- Layer directive: MID
- Stage lock: Preserve the close Haussmann buildings, mansard roofs, leafy trees, bridge arches, stone embankment and warm Parisian streetscape. Extend useful lower ownership and overlap beyond the legacy cutoff while retaining transparent sky openings; do not add the Eiffel Tower or playable promenade surface.

### P8-EU02-GROUND — Seine promenade

- Reference: `assets-original/current-generated/EU-assets/EU02_GROUND_PARIS.png`
- Candidate: `assets/phase8-validation/europe/EU02_GROUND_PARIS.png`
- Status: APPROVED 2026-09-19 — deployed integrated-stage acceptance
- Layer directive: GROUND
- Stage lock: Preserve the gray-brown stone riverside pavement, dark railing, classic black lamps and red flower planters. Extend dependable masonry/terrain depth to the bottom with a clean level gameplay edge; do not add café furniture, bicycles, buildings or water.

### P8-EU03-FAR — Barcelona panorama

- Reference: `assets-original/current-generated/EU-assets/EU03_BG_DISTANT_BARCELONA.png`
- Candidate: `assets/phase8-validation/europe/EU03_BG_DISTANT_BARCELONA.png`
- Layer directive: FAR
- Stage lock: Preserve Barcelona's coastal skyline, Sagrada Família emphasis, blue Mediterranean water, layered city roofs, green hills and saturated blue sky. Retain the approved warm terracotta/blue/green identity; do not add close Park Güell architecture, palms or clouds.

### P8-EU03-MID — Park Güell

- Reference: `assets-original/current-generated/EU-assets/EU03_BG_MID_BARCELONA.png`
- Candidate: `assets/phase8-validation/europe/EU03_BG_MID_BARCELONA.png`
- Layer directive: MID
- Stage lock: Preserve the Park Güell-inspired gingerbread buildings, palms, Mediterranean greenery, warm stone, flowering shrubs and colorful mosaic wall/rail language. Keep transparent sky openings and the asymmetric garden-city silhouette; do not add the distant Sagrada Família panorama or playable walkway.

### P8-EU03-GROUND — Mosaic terrace

- Reference: `assets-original/current-generated/EU-assets/EU03_GROUND_BARCELONA.png`
- Candidate: `assets/phase8-validation/europe/EU03_GROUND_BARCELONA.png`
- Layer directive: GROUND
- Stage lock: Preserve the warm stone terrace, colorful undulating Gaudí-style mosaic balustrade, flower clusters, small pillars, vines and block-stone depth. Maintain a level playable edge and continuous bottom coverage; do not add buildings, palms, bench hazards or fountains.

## Mandatory QA record per stage

Before a complete stage can be published for user review, record:

- all three prompt IDs and source Git commit;
- all three attached immutable reference paths;
- final validation paths, SHA-256 values and Git blob SHAs;
- expected dimensions, bit depth, color type and alpha bounds per layer;
- FAR opacity or MID/GROUND intentional transparency;
- GROUND surface evidence at confirmed source Y=393;
- bottom coverage and transition-row coverage;
- horizontal repeat/seam inspection;
- isolated-layer and duplicated-wrap previews;
- canonical composite screenshot at 960x540/Y410;
- internal disposition: READY TO DEPLOY or REVISE;
- deployed user disposition: APPROVED or REVISE.

Locked prompts and references authorize internal production but do not approve the resulting artwork. Final approval remains specific to the deployed integrated stage.
