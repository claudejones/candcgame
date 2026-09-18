# Phase 8 Landscape Execution Plan

Status: ACTIVE — integrated-stage approval workflow
Date: 2026-09-18

## Purpose

Phase 8 standardizes landscape geometry for the accepted Phase 7 renderer without redesigning approved locations or systems. This plan is the active execution and approval authority for the remaining validation stages and supersedes the earlier per-layer user-approval and continent-only integration process.

## Locked authority

- GitHub is the primary source of truth and Git history is the rollback mechanism.
- The renderer uses a 960x540 logical viewport and `GROUND_SURFACE_Y = 410`.
- FAR, MID and GROUND overlap and retain their responsibilities from `WORLD_RENDERING_SPEC.md`.
- `archive/` and `assets-original/` are immutable.
- Approved character, hazard and shared assets remain locked unless explicitly reopened.
- Each image-generation job attaches its exact immutable repository reference.
- Technical QA, exact PNG integrity validation and final deployed visual acceptance remain mandatory.

## Approval model

The user approves one deployed integrated stage, not each intermediate FAR, MID or GROUND candidate.

When the stage specification, references and prompts are already locked, the assistant is authorized to:

- generate FAR, MID and GROUND sequentially;
- replace working files directly under `assets/phase8-validation/`;
- reject and regenerate defective attempts;
- apply corrections already authorized by specification, such as the constrained horizontal wrap repair;
- run technical, isolated-layer, wrap and composite QA;
- select the internally accepted set for one integration deployment.

Ask the user before integration only when a material visual direction is absent or conflicting, a required reference is missing or unreliable, or the proposed correction falls outside existing authority. Do not ask for routine prompt, candidate or technical-QA approval.

## Stage workflow

### 1. Startup

1. Read `AGENTS.md`, `CURRENT_STATUS.md` and the required world/asset/stage specifications once.
2. Confirm the stage's FAR/MID/GROUND reference paths, prompts, target paths and current known-good Git baseline.
3. Use one deterministic temporary workspace for generated previews and reports. Temporary/rejected artifacts are not committed.

### 2. Internal production

1. Generate FAR from its exact reference, place it at its validation path and run layer QA.
2. Generate MID from its exact reference, place it at its validation path and run layer QA.
3. Generate GROUND from its exact reference, place it at its validation path and run layer QA.
4. A failed layer may be replaced directly; restore the prior Git version if abandoning the attempt.

Generation remains one layer per image-generation call. Sequential production does not imply separate user approval.

### 3. Internal QA

Before publication, require:

- complete PNG signature/chunk/CRC/IDAT/scanline validation;
- expected dimensions, bit depth, RGBA/opacity and alpha ownership;
- FAR top/skyline and lower-foundation coverage;
- MID transparency, lower overscan and MID-to-GROUND transition coverage;
- GROUND source surface, playable edge and bottom depth;
- duplicated horizontal-wrap inspection for all repeating layers;
- canonical 960x540/Y410 FAR+MID+GROUND composite inspection;
- no synthetic backing, unintended void, extreme offset or layer-responsibility violation;
- no regression to locked gameplay/runtime behavior.

Automated checks establish technical readiness. The assistant must also inspect the rendered composite because dimensions and alpha statistics cannot establish visual quality.

### 4. Stop rule

Stop generating when all technical checks pass, the integrated stage has no identified visual defect and the locked visual identity is preserved. Do not continue optimizing acceptable artwork merely because another variation might exist.

Use the narrowest correction:

- structural, ownership, anchor or coverage failure: regenerate or repair the responsible layer under existing authority;
- horizontal-seam-only failure: use the authorized deterministic wrap correction and repeat QA;
- acceptable isolated layer but failed composite: revise only the responsible layer;
- accepted deployed layer: do not reopen it without a concrete defect or explicit user direction.

### 5. Integration and publication

1. Produce one compact stage QA record with final paths, hashes and pass/fail evidence.
2. Commit only the final three assets, required runtime/configuration/cache-key changes and compact QA evidence to `modular-parity-validation`.
3. Require Production CI success for the exact development SHA.
4. Promote the identical tree to `main` without force.
5. Require main Production CI and automatic Pages deployment for that exact SHA.
6. Verify deployed asset hashes/cache keys and the live Design/Test/Game build.

No intermediate candidate is deployed merely for isolated approval.

### 6. User gate

Present the deployed stage for one decision covering:

- FAR/MID/GROUND together;
- gameplay/test presentation;
- Contextual Inspector previews;
- horizontal scrolling and repeat behavior.

`APPROVED` closes the stage and records final status/hashes once. `REVISE` reopens only the named defect and returns it to internal production and QA.

### 7. Continent closeout

After all three stages are approved, run one continent-level regression. Do not reopen approved assets unless the regression identifies a concrete defect. Record the continent decision once.

## Workspace and documentation rules

- `assets-original/`: immutable references.
- `assets/phase8-validation/`: current working and accepted validation assets; direct replacement is permitted before approval because Git provides rollback.
- `assets/phase8-candidates/` and `tmp/`: temporary only, ignored and uncommitted by default.
- `CURRENT_STATUS.md`: concise active checkpoint; update at meaningful integration/approval gates, not every attempt.
- `DECISION_LOG.md`: append only durable decisions, not routine replacements.
- Prompt manifest: record final integrated hashes and approval state, not every rejected candidate.

## Conversation discipline

- Prefer one conversation per stage and a fresh conversation after each deployed approval gate.
- Do not reread or print unchanged full documents repeatedly within the same stage.
- Keep command, connector and CI output targeted and concise.
- A handoff should identify only the current stage, exact Git baseline, final/working paths, unresolved defect and next operation.

## Validation sequence

- North America: complete and accepted.
- South America: SA01, SA02 and SA03 one stage at a time, followed by one continent regression.
- Europe: EU01, EU02 and EU03 under the same workflow after South America.
- Remaining continents: use the same stage workflow after their specifications and references are approved.

## Phase 8 completion criteria

Phase 8 completes only when all required landscapes satisfy the universal rendering contract, every stage and continent gate is accepted, no synthetic backing hides world holes, dependent gameplay calibration is complete, Design/Test/Game agree, and CI/deployment/user acceptance correspond to the exact production commits.

Slide timing reconciliation and cold first-load optimization remain separate unless explicitly brought into Phase 8.
