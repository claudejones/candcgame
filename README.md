# Claude & Constance — Around the World

- [Play the mobile game](https://claudejones.github.io/candcgame/mobile-game/play/)
- [Open the Workbench](https://claudejones.github.io/candcgame/workbench/)

Current source and authoring tools: `workbench/`. Independent release: `mobile-game/`. Agent instructions: `AGENTS.md`; status and test instructions: `docs/`.

## Local development

Use Node 22 or later, then run `npm ci` and `node scripts/check.mjs` from the repository root. To serve both apps locally, run `python3 -m http.server 8000`; open `/mobile-game/play/` or `/workbench/dist/workbench-next/`.

To build a new standalone package, use `node workbench/authoring/mobile-game/build.mjs --source workbench --config /absolute/path/to/your-export.json --out /absolute/path/to/new-build`. Inspect and verify that output before replacing `mobile-game/`.

Workbench configuration saved in your browser must be exported and imported when moving between hosts. Browser saves do not migrate with code. The mobile testing release uses the checked configuration identified in its build-report.json, not a claim to contain later browser-only overrides.

Legacy prototypes remain recoverable from Git history, outside the active tree. No history rewrite was performed. The old ChatGPT Site remains available as a fallback; GitHub is now the source for ongoing development.
