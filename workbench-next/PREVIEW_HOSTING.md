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

Run `node workbench-next/build-preview.mjs /absolute/path/to/separate-preview-checkout` from the candidate repository. Review 03 copies the candidate UI, four read-only configuration/landscape dependencies and 53 PNGs covering 39 sprite/state selections, 27 landscape layers and shared clouds. It preserves source paths, cache revisions and PNG bytes; it excludes the old runtime and game routes. Packaging assets does not preload them: the browser requests only the selected content.

The separate checkout's `.openai/hosting.json` contains the exact `project_id` above and `static: {"directory":"dist"}`. Commit/push that checkout to the Site's source repository, package static output with the hosting helper, save the exact pushed revision, and deploy privately. Renew credentials for the same project when needed; never record tokens here or in Git.

Publication confirmed successful on 2026-09-19. Version 1 uses Site source commit `95d78b7ef1df0e2d786b55261d4593eccf2f7375`; deployment ID `appgdep_6aadfaedb0148191ac7bc000a21c35a2`. The live URL above comes from the successful native deployment response and replaces the provisional origin supplied during registration. For later updates, confirm the new deployment succeeds before claiming the updated preview is live.

## Review scope

Review 02 publication succeeded on 2026-09-19 at the same live URL. Site source commit: `1e6655173838bfb95fa0c2fd007f12d312777ca8`; saved version: 2; deployment ID: `appgdep_6aae03d0994c819181298034305f7c0c`. Canonical editor implementation commit: `0441baf3ef56aeed19d7de19651a741c025ba40f` on `editor-next`.

Landscape scene/layer/source views, layer transforms and scroll/parallax, six states for both characters, stage hazards, frame playback/stepping, full-atlas view, comparison, per-frame edits, unified undo/redo, separate browser saves and candidate export. A visible loading count covers image download/decode until the selected scene/frame is drawn. Test/Game, gameplay entities and finish editing are later milestones.

The static preview does not have a compatible managed development server. Automated browser visual QA is still pending; do not use a cloud browser on the live Sites URL. User visual review can proceed once publication succeeds.
