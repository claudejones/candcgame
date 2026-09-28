# Current decisions

2026-09-28: User requested consolidation of the current Workbench, complete mobile game and required agent/specification/skill files into claudejones/candcgame; removal of superseded active code and duplicate imports. Preserve recoverability through Git history, not a history rewrite. Keep the mobile game independently deployable. Preserve original assets by reusing identical Git blobs. Publish Workbench at /workbench/ with assets relative to that app, while preserving /mobile-game/play/ and its storage key.

Earlier implementation decisions, asset contracts and migration evidence are retained in workbench/authoring/docs and docs/skills. Those dated records are context; AGENTS.md and CURRENT_STATUS.md define current paths and operating scope.
