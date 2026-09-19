# Separate private preview

Authorized 2026-09-19 after the user requested proceeding with a clickable interface preview.

- Site project ID: `appgprj_6aadf9bb7cf08191b8dce9d7ada54bba`
- Site title: C&C Workbench — Design Preview
- Reserved origin: `https://candc-workbench-next.fancy-dune-7826.chatgpt.site`
- GitHub source authority: `claudejones/candcgame`, branch `editor-next`.
- Existing GitHub Pages workbench/game remain untouched. Site deployment is publication of this review increment only; it is not editor cutover approval.

## Reproduce / update

Use the Sites hosting skill and reuse the exact Site project ID above. Never create a replacement Site to recover a missing scratch checkout.

Run `node workbench-next/build-preview.mjs /absolute/path/to/separate-preview-checkout` from the candidate repository. The helper copies candidate UI, its two read-only configuration dependencies and only the 25 images used by the 39 character-state/hazard selections. It preserves source paths and source PNG bytes; it does not include the old runtime, game routes or unused landscapes.

The separate checkout's `.openai/hosting.json` contains the exact `project_id` above and `static: {"directory":"dist"}`. Commit/push that checkout to the Site's source repository, package static output with the hosting helper, save the exact pushed revision, and deploy privately. Renew credentials for the same project when needed; never record tokens here or in Git.

The reserved origin is not evidence of successful publication. Confirm a native Sites deployment response reports success and its URL before handing the preview to the user.

## Review scope

Sprite navigation, six states for both characters, stage hazards, frame playback/stepping, full-atlas view, crop comparison, per-frame edits, undo/redo, separate local saves and candidate export. A visible spinner covers image download/decode until the selected frame is drawn. Test/Game and in-scene editing are later milestones.

The static preview does not have a compatible managed development server. Automated browser visual QA is still pending; do not use a cloud browser on the live Sites URL. User visual review can proceed once publication succeeds.
