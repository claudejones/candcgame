# Dependent calibration — retained evidence and comparison candidates

Status: editor-next is the intended calibration interface. Existing calibration review and adjustments belong to that workstream. Pause independent hazard tuning in the legacy prototype. Retain this report, its measurements and the supporting regression tests. Preserve the eleven settings below as documented comparison candidates: they are already deployed but are not recorded as visually accepted or selected final settings. Do not silently promote, overwrite or revert them.

The user authorized Africa production to proceed independently. That sequencing decision does not approve these settings or waive artwork, contract or complete-stage acceptance gates. The new tool itself satisfies none of those gates; editor-next will compare approaches and incorporate useful runtime checks before choosing final settings through the applicable review.

Evidence baseline: `57d6ca4e6932cc0ee5f6d05597245c1c17a74e85`. [Development CI](https://github.com/claudejones/candcgame/actions/runs/35456071828), [main CI](https://github.com/claudejones/candcgame/actions/runs/35456119553) and [Pages](https://github.com/claudejones/candcgame/actions/runs/35456144739) passed. Those results establish technical publication, not calibration acceptance.

## 1. Runtime correctness fixes and tests to retain

- Active canonical stages derive gameplay anchors from fixed Y=410. Moving the visual GROUND seam no longer moves character feet, hazard surface/altitude or finish contact. Explicit character/object contact adjustments remain. Packaged legacy stages retain their previous rendered-surface fallback.
- `scripts/tests/gameplay-anchors.test.cjs` exercises real CharacterMachine drawing, ObjectQA surface resolution and GameplayDirector finish geometry. With the visual seam/offset rendering at Y=550, canonical gameplay remains at 410 and legacy gameplay remains at 550.
- `scripts/tests/gameplay-calibration.test.cjs` exercises actual CharacterMachine update/draw, ObjectQA collision and GameplayDirector geometry through complete timed passes. Retain its checks for real Run collisions, both characters, ground/LOW Jump, HIGH timed Slide, all initial hazard animation phases, configured flying speeds 150/170/210 and 60/120 Hz. Collision reads the previous draw's character box, matching runtime ordering. The nine baseline stages are selected explicitly so new stages do not break the 27-hazard coverage assertion.
- The current test requires a sampled avoidance span of at least 60ms. Retain that regression evidence; it is not an approved difficulty target or proof of visual quality, combined-spawn fairness, or every possible frame rate. The editor-next work should compare proposed calibration approaches without weakening checks merely to pass a candidate.
- Preserve established character scale/colliders/crops/grounding and recorded movement/altitude constants unless an explicit approved calibration decision changes them. The evidence uses Jump -402/825, Slide .75s, world speed 120 and HIGH/LOW 68/18. Historical .70/.75 Slide wording remains unresolved.

The baseline full local workflow passed 32 tests plus JavaScript/schema, stage, PNG and landscape-composite checks. Live inspection confirmed the updated script versions, Vulture .285, Paris café .14/contact 33.761326 and canonical/rendered Y=410. Earlier live checks included Design/Inspector, both character poses, SA03 contact and a full 90-second finish/Celebrate run with Unlimited Lives. That last check proves scrolling/finish behavior only, not successful avoidance.

## 2. Proposed scale/contact settings awaiting review

These eleven values are deployed comparison candidates, not automatic recommendations for editor-next. All existing artwork, character collision proportions and physics were preserved. The table's spans come from the separate **10ms input-lead audit**, not the committed 20ms regression test.

| Hazard | Scale before → candidate | Ground adjustment before → candidate | Measured action | Claude / Constance span |
|---|---|---|---|---|
| NA02 Fallen Log | 0.22 → 0.215 | 36 → 35.697238 | Ground / Jump | 80 / 80 ms |
| SA02 Andean Flamingo | 0.34 → 0.33 | — | LOW / Jump | 90 / 60 ms |
| NA01 Vulture | 0.34 → 0.285 | — | HIGH / Slide | 220 / 170 ms |
| NA02 Eagle | 0.34 → 0.31 | — | HIGH / Slide | 180 / 120 ms |
| NA03 Pigeons | 0.32 → 0.265 | — | HIGH / Slide | 170 / 130 ms |
| SA01 Macaws | 0.3 → 0.265 | — | HIGH / Slide | 240 / 170 ms |
| EU03 Mediterranean Bats | 0.3 → 0.23 | — | HIGH / Slide | 270 / 230 ms |
| EU01 Market Crates & Baskets | 0.18 → 0.118 | 34 → 32.218785 | Ground / Jump | 100 / 80 ms |
| EU02 Paris Café Table & Chairs | 0.2 → 0.14 | 34 → 33.761326 | Ground / Jump | 110 / 100 ms |
| EU02 Paris Bicycle | 0.2 → 0.15 | 34 → 33.248619 | Ground / Jump | 70 / 70 ms |
| EU03 Gaudí Mosaic Bench | 0.2 → 0.175 | 34 → 33.116022 | Ground / Jump | 90 / 80 ms |

### Sampling and reproduction

Input-lead sampling is separate from simulation frame rate:

| Method | Input lead grid | Simulated crossing | Runtime rates | Purpose |
|---|---|---|---|---|
| Historical measurement audit | 0.05–1.60s, every **10ms** | -1.9 to +1.9s | 60 and 120 Hz | Table values and before/candidate comparison |
| Committed regression test | 0.06–1.20s, every **20ms** | -1.5 to +1.5s | 60 and 120 Hz | Bounded pass/fail protection for all 27 baseline hazards |

Both intersect passing inputs across configured speeds and initial animation phases. A reported span is `last passing lead - first passing lead` for the longest consecutive passing interval; do not add an extra sample interval. These two grids and simulation start phases need not return identical endpoints. The reported span is sampled evidence, not an analytically proven continuous interval. A lead is the action's time before the hazard's modeled x=220 crossing; it is not the player's reaction time after first seeing the hazard.

`DEPENDENT_CALIBRATION_MEASUREMENTS.json` retains the historical before/candidate endpoints, widths, minimum vertical gaps, original contact worksheet and exact runtime-input hashes. `scripts/audit-dependent-calibration.cjs` is a read-only reproduction: it compares those fixed candidates in memory, never searches for settings or writes runtime configuration, and fails if input hashes or recorded measurements differ. All eleven before/candidate comparisons were reproduced against the pinned runtime. This is not an additional per-stage production gate.

From a checkout containing the audit script, if the historical input files are unchanged:

```sh
node scripts/audit-dependent-calibration.cjs
node --test scripts/tests/gameplay-anchors.test.cjs scripts/tests/gameplay-calibration.test.cjs
```

After runtime/editor code changes, use the historical commit without reverting current work (fetch repository history first if needed):

```sh
git worktree add --detach tmp/calibration-evidence 57d6ca4e6932cc0ee5f6d05597245c1c17a74e85
node scripts/audit-dependent-calibration.cjs --root tmp/calibration-evidence
node --test tmp/calibration-evidence/scripts/tests/gameplay-anchors.test.cjs tmp/calibration-evidence/scripts/tests/gameplay-calibration.test.cjs
```

Keep the audit script in the current checkout: it did not exist at the historical commit. Its `--root` selects only the pinned runtime inputs. Run current-runtime comparisons separately and label their input revision/method; do not overwrite the historical measurements to make a new implementation match.

## 3. Unresolved visual findings

- **Paris café and bicycle size:** both remain identifiable in the internal 960×540 composite, but look small relative to the characters. Numeric avoidance is not visual acceptance. Compare alternatives in editor-next; do not shrink them further merely to widen a timing window.
- **Ground-contact worksheet mismatch:** the recorded offset calculation used base scale `960/2172`; historical hazard drawing/geometry actually use `960/2048`. The proposed offsets therefore do not preserve the old foot pixel exactly. The calculated unrounded bottom shifts are approximately +0.018px (log), +0.108px (crates), +0.014px (café), +0.046px (bicycle) and +0.053px (bench). Pixel rounding and actual scene contact still need editor-next review. Keep the recorded values unchanged for comparison; the 10ms audit reproduces their actual runtime behavior and does not validate the worksheet assumption.
- **Relative size and contact:** inspect all eleven candidates with Claude and Constance, particularly the reduced Europe props and HIGH flyers. Timing spans alone cannot select a believable size or visually aligned solid collider. Use complete actions, not a clear jump apex or indefinitely held Slide pose.
- **Historical character-size wording:** the established deployed character reference was preserved. Conflicting older size wording has not been silently rewritten or used to rescale characters. Resolve through the intended calibration interface and explicit decisions.

The next calibration review belongs in **editor-next**, not another independent legacy tuning pass. Use this document and the regression checks as inputs to that review. Existing artwork and contract-acceptance gates remain explicit. AF01 generation remains authorized under its own ready packet, with complete new-stage collision/integration checks and deployed user approval still required.
