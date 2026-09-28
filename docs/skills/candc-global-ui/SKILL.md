---
name: candc-global-ui
description: Plan and produce Claude & Constance global screen, brand, world-map and reward assets with behavior specifications for Workbench handoff. Use for start screens, progression, trophies, passports and transitions; stage landscapes and runtime integration have separate workflows.
---

# C&C Global UI and Rewards

Act as the global presentation and asset-production owner for Claude & Constance: Around the World. The Workbench agent owns implementation, imports, player saves, runtime validation and standalone packaging. Do not modify or publish Workbench or game code merely because asset production is authorized.

Read [production-plan.md](references/production-plan.md) when starting or resuming this phase. It is a dated review draft from 21 September 2026, not implemented behavior or blanket approval. Preserve its Confirmed / Recommended / Open distinctions. Incorporate later explicit user decisions and update the durable plan rather than requiring the user to repeat them. When current code or exact stage identity affects a decision, consult the relevant current project source; do not infer deployment or completion from this skill.

## Decision boundaries

- The latest user specifies Easy, Standard and Hard, 21 stage trophies, 7 passport designs and per-difficulty achievements. The seven World Treasures are retired. Plain difficulty names are recommended while the user considers naming; do not introduce an extra Explorer/Adventurer axis.
- Hard and unrestricted ordinary level selection unlock after Standard completion. The special level separately requires all 7 perfect Standard passport stamps. Ordinary completion does not require perfection.
- Stage ratings improve but never decrease. Per-difficulty achievement isolation is confirmed; sharing results across characters is still a recommendation. A continent becomes perfect when its three stage bests are perfect; do not invent an uninterrupted-run requirement.
- Health and lives are the same three-heart meter, not separate counters. Zero hearts means Game Over. Unlimited Health prevents heart depletion, and assisted play earns neither achievements nor permanent unlocks. Do not invent a retry currency. Every stage and retry starts with three hearts (confirmed). Recovery of eligibility after toggling assistance still needs refinement. Three hearts at finish and zero damage are not equivalent if healing exists.
- The mystery passport is an additional reward with hidden/locked placeholder, revealed-gray/unearned design, and earned full-color design. Unlocking entry is not earning the passport. Show unlock requirements and eligible progress through tap-accessible live UI text; do not bake help into atlas artwork. Read production-plan.md section12 for the states and still-proposed completion/difficulty policy.
- Secret Level now has a dedicated eighth achievement page (8/8), replacing the bottom mystery strip. Show locked placeholder → revealed gray passport → earned color passport; unlock is not earning. Add a startup Secret Level shortcut only after unlock, using existing level-entry hooks. The approved three-minute encounter and final asset delivery are recorded in production-plan.md sections26–27; entry-policy details remain subject to Workbench reconciliation.
- Secret Level now has an approved Beneath the Ice underground-lab/conveyor/boss concept. Read production-plan.md sections26–27 for the three-minute containment sequence and complete graphics package. Expanded final assets await review; runtime integration and physics validation remain Workbench responsibilities. Idle autoplay remains optional and unapproved.

## Plan and produce

Use the named batches in production-plan.md section11: UI01 brand, UI02 startup, RW-<continent> rewards, UI03 map, UI04 transitions/results and UI05 supporting menus. Follow brief → generate sequentially → diagnose → correct affected candidates → verify → ZIP and behavior handoff. Continue through an authorized, specified batch without per-image approvals. Code-only batches need no invented image generation.

Resolve only the decisions that affect the requested batch. Continue useful planning while flagging genuine unknowns. Preserve approved character identity by recovering and inspecting original approved character art before using it as a visual reference. Select trophy motifs against exact stage IDs/current names; request or retrieve the catalog when not available.

Use image generation for original pixel-art logo, opening scene, map and reward art; use code for buttons, text, panels, routes, progress, locks and interactions. Reuse approved character selection/running/celebration art where readable. Keep map geography separate from live stage nodes and touch targets. Maintain mobile landscape composition, quiet UI areas and legible small-scale silhouettes. Do not apply the 2172×724 stage canvas or MID/GROUND anchors to global UI assets.

Before generation, define the batch’s subject, native dimensions, transparency, intended display size, states and any animation frame geometry. Approve a representative rewards panel/pilot before expanding all 21 motifs. Preserve originals. Use artistic edits for art defects and deterministic finishing for authorized packing, padding, grayscale derivatives and exact placement; never independently regenerate locked/earned copies of the same reward.

The user requests atlases with on/off states. Pack locked and colored versions with identical anchors and silhouettes. Overlay heart ratings and a shared perfect badge unless baked variants are explicitly selected. Use the locked reward contract in production-plan.md section13: 256×256 cells, seven768×512 trophy sheets, one1792×512 combined passport sheet; shared utilities delivered once in a separate package. Keep all three difficulties on shared art with separate records. Avoid generating 63 trophies or 21 continent stamps just to represent difficulty.

Inspect actual dimensions, alpha, cell gutters, exact crop rectangles and state correspondence. Review at intended mobile display size, including locked/earned/perfect/assisted and representative layout states. For motion, inspect the real frame sequence and document timing/skip behavior. If runtime or final companion assets are unavailable, label previews provisional and state the remaining integration check. Do not claim complete gameplay validation from asset geometry.

## Deliver and resume

Read [handoff-template.md](references/handoff-template.md) for the concrete per-batch contract. Deliver exact original assets plus final integration derivatives in a ZIP and a short behavior description covering states, buttons, animation and when the screen appears. Include a small manifest when atlas coordinates/anchors are needed. Identify current approval state, unresolved rules and the next integration action. Saving assets does not deploy them.

Use the environment’s durable file workflow for deliverables. Update the production-plan reference when the user confirms material decisions, using the personal skill save workflow. Keep recommendation status explicit. A new agent should be able to identify the next requested batch, its approved rules, required references and unresolved issues without replaying completed generation.

## Shared rewards correction

Use only hollow empty heart, red full heart and gold perfect star; never invent an assisted/disabled heart. Unlimited Health awards no new rewards or rating improvements; preserve all previously earned records. Use a live explanatory completion label, not an alternate rating. Read section13 for the three-cell utility mapping and dependency packaging.

## Approved-design completeness gate

Own all graphics and sprites needed to faithfully implement the approved design. Workbench assembles the delivered assets with HTML/CSS/Canvas and implements behavior from the notes; it must not have to invent, extract from a concept screenshot, or regenerate missing artwork. Code-driven controls are not permission to omit their required visual assets or substitute generic styling.

Before production, inventory every visible element of the approved concept: backgrounds, portraits/pins, stage-state icons, nameplates, card treatments, thumbnails, navigation/action icons, hearts, borders, badges and animation frames. Map each element and required state to a supplied asset, an exact verified existing shared dependency, or a precisely specified HTML/CSS/Canvas treatment. For code-rendered treatments provide dimensions, colors, borders, spacing and state changes sufficient to reproduce the approved appearance; generate any graphical detail that these treatments cannot faithfully reproduce. Recover existing art and produce needed thumbnail/crop derivatives; do not leave approved thumbnail areas blank. Keep live text out of artwork.

Deliver all required original graphics and finished sprites/derivatives, exact atlas crops and anchors, and state/animation/assembly notes. Preserve shared-asset packaging rules: explicitly identify and verify reused dependencies, deliver the shared package if unavailable, and do not unnecessarily duplicate it in every batch. A description of missing art is not a delivered asset. Never change an approved visual (for example, a character-head navigation pin to a full-body runner) without user agreement.

Verify completeness against the inventory and assemble a faithful screen preview using the actual deliverable assets. A concept screenshot, simplified wireframe or generic substitute is not evidence of delivery completeness. Check every approved visible component and representative state, including phone composition. Report genuine blockers or missing components explicitly; do not call the batch complete or move to the next batch until they are resolved. Keep graphic verification separate from Workbench's runtime validation.
