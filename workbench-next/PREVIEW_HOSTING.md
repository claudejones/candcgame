# Separate private preview

Authorized 2026-09-19 after the user requested proceeding with a clickable interface preview.

- Site project ID: `appgprj_6aadf9bb7cf08191b8dce9d7ada54bba`
- Site title: C&C Workbench — Design Preview
- Live URL: https://candc-workbench-next.claudejones.chatgpt.site
- GitHub source authority: `claudejones/candcgame`, branch `editor-next`.
- Existing GitHub Pages workbench/game remain untouched. Site deployment is publication of this review increment only; it is not editor cutover approval.
- Final approved delivery is this GitHub repository and its GitHub Pages site. This Site is a temporary review host; the editor uses portable static files and relative asset paths.

## Reproduce / update

Use the Sites hosting skill and reuse the exact Site project ID above. Never create a replacement Site to recover a missing scratch checkout.

Run `node workbench-next/build-preview.mjs /absolute/path/to/separate-preview-checkout` from the candidate repository. The helper copies candidate UI, its two read-only configuration dependencies and only the 25 images used by the 39 character-state/hazard selections. It preserves source paths and source PNG bytes; it does not include the old runtime, game routes or unused landscapes.

The separate checkout's `.openai/hosting.json` contains the exact `project_id` above and `static: {"directory":"dist"}`. Commit/push that checkout to the Site's source repository, package static output with the hosting helper, save the exact pushed revision, and deploy privately. Renew credentials for the same project when needed; never record tokens here or in Git.

Publication confirmed successful on 2026-09-19. Version 1 uses Site source commit `95d78b7ef1df0e2d786b55261d4593eccf2f7375`; deployment ID `appgdep_6aadfaedb0148191ac7bc000a21c35a2`. The live URL above comes from the successful native deployment response and replaces the provisional origin supplied during registration. For later updates, confirm the new deployment succeeds before claiming the updated preview is live.

## Review scope

Sprite navigation, six states for both characters, stage hazards, frame playback/stepping, full-atlas view, crop comparison, per-frame edits, undo/redo, separate local saves and candidate export. A visible spinner covers image download/decode until the selected frame is drawn. Test/Game and in-scene editing are later milestones.

The static preview does not have a compatible managed development server. Automated browser visual QA is still pending; do not use a cloud browser on the live Sites URL. User visual review can proceed once publication succeeds.
