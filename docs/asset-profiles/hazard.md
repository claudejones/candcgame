# New-stage hazard profile

Applies only to new AF/AS/OC/AN files. Existing accepted atlases and calibrations stay unchanged. Source: HAZARD_SPEC and REMAINING_CONTINENTS_PLAN.

- Two distinct static grounded hazards in one 2172×724 RGBA atlas: two 1086×724 cells, left GROUND1 / right GROUND2. Source contact (543,620), at least 32px clear cell gutters. No scenery or labels.
- One flying creature in four horizontal 543×724 cells on a 2172×724 RGBA canvas. Source body anchor (271,362). Right-facing, stable core anatomy, four visibly distinct wing poses and continuous loop. Every creature in a flock must animate.
- World ground stays Y=410. Ground placement is `410 + adjustment - (sourceAnchorY - cropTop) × scale`. Flying placement uses the existing HIGH/LOW clearance and its source body anchor. Crop must retain the anchor; changing crop must not move the contact/body point.
- Judge visible animal/object size relative to the actual character at 960×540 and mobile display. Do not enlarge a small species to disguise poor readability. No new speed/physics or independent ground movement.
- Measure scale, crop and collision on the generated pixels. Collision encloses the solid readable obstacle; decorative wings/tails/leaves are not automatically solid. Inspect both characters, Jump/Slide, HIGH/LOW and finish behavior.
- Run `node scripts/validate-stage-assets.cjs AF01` (resolved stage), inspect atlas/animation and contacts. Structural alpha/distinct-frame checks do not prove wing poses, anatomical stability or collision fairness.
- Coordinator supplies measured release metadata to `scripts/integrate-stage.mjs`; each check is recorded only after it was performed on the same hashes. A complete five-file stage is integrated together. User acceptance occurs after deployment.
- A GROUND1/GROUND2 revision must preserve the sibling cell pixels and metadata exactly. Recover its original bytes from Git; compare the sibling RGBA pixels after assembly. Never regenerate an accepted sibling silently.
