# Claude & Constance Around the World

Mobile-first landscape side-scrolling world-travel game.

## Asset commands

Tell the agent `help`, `build landscape SA02`, or `regenerate landscape NA01 FAR`. It resolves the rules, references and filenames from GitHub. See [commands and all continent keys](docs/ASSET_COMMAND_WORKFLOW.md). No per-continent setup or user-filled template is required.

Local lookup: `node scripts/assets.mjs help`. This resolves the agent's task; generation/publication use the agent's connected tools.

## Project state
The project is currently migrating from a large self-contained QA/test-harness HTML build to a maintainable web application with external assets, source modules, configuration and repository-based production specifications.

Current reference baseline: **LAB25Q — World Visual Ownership QA**.

## Source of truth
AI/developer sessions must start with [`AGENTS.md`](AGENTS.md) and [`docs/CURRENT_STATUS.md`](docs/CURRENT_STATUS.md). Do not infer production requirements from the legacy harness when a repository specification exists.

## Planned structure
- `archive/` — immutable historical QA/reference builds
- `assets-original/` — immutable original generated/approved source assets
- `assets/` — validated production-ready assets
- `docs/` — product/design/production/QA specifications and status
- `src/` — production application code and configuration

## Migration principle
Preserve first, inventory second, specify third, migrate incrementally. The legacy harness remains a behavioral reference until extracted systems have been verified against it.
