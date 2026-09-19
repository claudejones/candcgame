# Dependent gameplay calibration — review increment

Status: implementation prepared for deployed user review; not accepted and not formal landscape-contract promotion. User authorization covers completing the outstanding prerequisites. No Africa artwork has been generated.

## Scope

- Preserve all accepted NA/SA/EU landscape and hazard PNG bytes. AF01's six research photos are new reference material only; source/credit/hash records are in `assets/references/africa/af01/REFERENCES.json`.
- Keep both characters' established scale, colliders, crop and grounding, Jump -402/825, Slide .75s, world speed 120, HIGH/LOW clearances 68/18 and existing spawn timing. The historical .70/.75 Slide wording is deferred.
- Fix gameplay surface Y=410 for active canonical landscapes. A visual GROUND adjustment no longer moves character feet, hazard altitude/contact or finish contact. Explicit object/character contact adjustments remain; legacy packaged rendering retains its previous surface fallback.
- Correct six flying hazard scales and five ground hazard scales/contact offsets. Collider proportions and image bytes are unchanged. Ground offsets preserve the measured solid artwork's existing foot position.

## Evidence and limits

`scripts/tests/gameplay-calibration.test.cjs` executes the actual CharacterMachine, ObjectQA and GameplayDirector code for complete hazard crossings, including the collision-before-draw ordering. It covers the original 27 hazards, both characters, all initial atlas phases, configured flying speeds 150/170/210 and sampling at 60/120 Hz. Running must actually collide; ground/LOW hazards need a timed Jump window and HIGH flyers a timed .75s Slide window. The minimum 60ms sampled input span is a regression threshold, not a user-approved difficulty target or a guarantee for every frame rate. Apex-only checks or indefinite slide poses are insufficient.

`scripts/tests/gameplay-anchors.test.cjs` verifies the real character/finish draw paths and hazard surface: changing the visual seam/offset to render at Y=550 still leaves canonical gameplay anchored at 410, while packaged legacy stays at 550. Command tests reject zero-byte reference files.

Internal composites use actual runtime geometry and accepted source pixels at 960×540. The reduced silhouettes remain identifiable, but the Paris café and bicycle are visibly small relative to the characters; their acceptability is unresolved. Do not equate numeric avoidance with visual approval or shrink them further automatically. The established character reference is preserved; historical character-size wording has not been silently rescaled or rewritten.

Baseline live checks covered Design/Inspector, both character poses, SA03 Test contact and a full 90-second SA03 course reaching the finish/Celebrate state with Unlimited Lives. Unlimited Lives verified scrolling/finish only; it did not prove avoidance. Revised deployed checks and exact publication revisions are reported with the review handoff and recoverable from GitHub Actions.

The complete local Production CI command passed: 32 runtime/command tests, JavaScript/schema checks, registered stage validation and all accepted landscape PNG/composite checks. `git diff --check` passed. No accepted image paths occur in the change set.

## Measured changes

Input spans below are the shared collision-free interval across the tested frame rates, speeds and initial phases, sampled every 10ms. They are measured endpoint spans, not sample counts.

| Hazard | Scale before → after | Ground adjustment after | Claude / Constance span |
|---|---|---|---|
| NA02 Fallen Log | 0.22 → 0.215 | 35.697238 | 80 / 80 ms |
| SA02 Andean Flamingo | 0.34 → 0.33 | — | 90 / 60 ms |
| NA01 Vulture | 0.34 → 0.285 | — | 220 / 170 ms |
| NA02 Eagle | 0.34 → 0.31 | — | 180 / 120 ms |
| NA03 Pigeons | 0.32 → 0.265 | — | 170 / 130 ms |
| SA01 Macaws | 0.3 → 0.265 | — | 240 / 170 ms |
| EU03 Mediterranean Bats | 0.3 → 0.23 | — | 270 / 230 ms |
| EU01 Market Crates & Baskets | 0.18 → 0.118 | 32.218785 | 100 / 80 ms |
| EU02 Paris Café Table & Chairs | 0.2 → 0.14 | 33.761326 | 110 / 100 ms |
| EU02 Paris Bicycle | 0.2 → 0.15 | 33.248619 | 70 / 70 ms |
| EU03 Gaudí Mosaic Bench | 0.2 → 0.175 | 33.116022 | 90 / 80 ms |

## Deployed review

Open [the workbench](https://claudejones.github.io/candcgame/src/dev.html?mode=design). In Test, compare Claude and Constance for:

1. HIGH/Slide: NA01 vulture, NA02 eagle, NA03 pigeons, SA01 macaws and EU03 bats.
2. Ground/Jump and believable size/contact: EU01 crates, EU02 café and bicycle, EU03 bench. Also spot-check NA02 fallen log and SA02 LOW flamingo; their small reductions address narrow jump windows.
3. Established character grounding and finish contact, with landscape offsets zero.

Approve the calibration or identify adjustments. Only after explicit acceptance should the agent record calibration acceptance, promote the shared landscape contract and enable eligible AF01 production. The following command then begins the AF01–AF03 trial at its first stage:

`In claudejones/candcgame: build stage AF01.`

AF02/AF03 reference packs are prepared by the agent before their respective stages. Each complete deployed stage retains its own user approval, followed by the next filled command.
