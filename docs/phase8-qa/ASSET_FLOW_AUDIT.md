# Asset flow audit — 2026-09-20

Scope: AF03 completion plus subsequent expansion-stage generation and Workbench handoff. No new images, artwork acceptance or gameplay calibration performed.

| Boundary | Finding and correction | Verification |
| --- | --- | --- |
| Entry points | finish missing from catalog/general resolver; handoff/help could return resume | Registered finish and routed manifest-backed status/closeout to direct completion |
| Recovery branch | Older AGENTS allowed two workers | Recovery commit b105abf directs AF03 completion to current main, one agent, no worker history |
| Source durability | Two local-only source references | Exact ZIP backup is recorded in manifest; downloaded backup GROUND/FLYING SHA-256 values match originals |
| Source validity | FLYING source is 2170×725, contract 2172×724 | Recorded explicit unresolved geometry task; no false QA pass |
| Future closeout | Execution reference still required coordinator checkpoint/close | Generation may use optional workers; asset-only finish uses one agent, pinned manifest and dedicated branch |
| Post-AF03 advance | AS01 consulted stale coordinator state despite separate asset publication | Verified asset-ready receipt takes precedence; a damaged saved bundle blocks rather than pretending complete |
| Recovered checkout validation | Some resolver calls used tool checkout instead of ASSET_WORKSPACE_ROOT | Pass effective root explicitly to bundle/path validators |
| Prompts | Image task JSON leaked unrelated subjects/scale instructions | All five image templates are scoped; compile tests cover all nine post-Africa stages and retained reference gates |
| Publication | Asset-only vs main release boundaries | Dedicated branch publisher retains byte/tree/non-force checks; runtime/main CI and Pages remain required for software/playable releases |

Local regression suite: 67 passed. Tests exercise missing/changed sources, direct resolver/help/handoff routing, damaged asset receipts, all future prompt sets, reference readiness, publication retry and scope/concurrency protections. Direct AF03 response: 2,862 characters; help response: 5,237 (measured JSON including newline). These are character counts, not app context usage.

AF03 source inventory is not an approved asset set. FAR/MID/OBJECT/GROUND sources have the required dimensions; FLYING does not. Technical finishing and final image/composite/animation evidence remain required. Previously generated alternate stork source was inspected and fails the existing gutter check; it was not silently substituted or declared valid.

AS01 choices/references are still pending; test fixture readiness is not production approval. Improved generation yield, end-to-end completion and absence of the application maximum-length banner remain unproven. The audit verifies the repository paths and recoverable bytes; it does not claim access to application context accounting.
