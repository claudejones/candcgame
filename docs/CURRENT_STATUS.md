# Current status — September 28, 2026

Consolidation candidate: current Workbench and its build/import/calibration tools are under workbench/, with all original assets. The standalone mobile package remains under mobile-game/ with its URL and save key unchanged. Four portable C&C skill snapshots live under docs/skills; personal installed skills are not automatically changed by this copy.

The active tree removes legacy src/, assets/, assets-original/, incoming/, archive/, qa/, config/ and tools/ roots, old scripts and stale legacy CI. Recovery checkpoint: 505b764fe73bc505f708d5d026614945b32d3820. Current implementation replaces legacy string-matching checks with the current simulation/UI/asset checks in scripts/check.mjs. Git history and branches are preserved.

Mobile configuration: workbench/authoring/hazard-upgrade/checked-project.json, SHA256 df2aede6fd88182b53b4b6bfeeda70fe0f8f5f6d0484d07820d20cd9f90135ca. Latest browser-only overrides still require Export All. Retain source-config, crop/placement migrations and checked plans.

Recent fixes: phone typography/controls; fresh title hides Continue; title-first loading and prefetched title audio; world asset decode gate; rotate logo; favicon; iOS long-press selection protection. Physical-device visual, heat and battery acceptance remain pending.

Publication is complete only when exact-SHA development CI, main CI and Pages runs pass and both live entry points are checked. See GitHub Actions for the current commit's result rather than treating this document as a deployment receipt.

Mobile control follow-up: double-tap zoom suppressed across the mobile shell, gameplay keeps exclusive touch handling, thumb targets extend beyond button artwork, and held Slide intent survives landing/recovery but clears on release or pause. Both characters and normal/secret runtimes have regression coverage. Physical iPhone touch acceptance still pending.
