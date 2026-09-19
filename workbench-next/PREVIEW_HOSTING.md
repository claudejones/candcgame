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

Run `node workbench-next/build-preview.mjs /absolute/path/to/separate-preview-checkout` from the candidate repository. Review 05 copies the candidate UI, four read-only configuration/landscape dependencies and 53 PNGs covering 39 sprite/state selections, 27 landscape layers and shared clouds. It preserves source paths, cache revisions, provenance and PNG bytes; it excludes the old runtime and game routes. Packaging assets does not preload them: the browser requests only the selected content.

The separate checkout's `.openai/hosting.json` contains the exact `project_id` above and `static: {"directory":"dist"}`. Commit/push that checkout to the Site's source repository, package static output with the hosting helper, save the exact pushed revision, and deploy privately. Renew credentials for the same project when needed; never record tokens here or in Git.

Publication confirmed successful on 2026-09-19. Version 1 uses Site source commit `95d78b7ef1df0e2d786b55261d4593eccf2f7375`; deployment ID `appgdep_6aadfaedb0148191ac7bc000a21c35a2`. The live URL above comes from the successful native deployment response and replaces the provisional origin supplied during registration. For later updates, confirm the new deployment succeeds before claiming the updated preview is live.

## Review scope

Review 05.1 publication succeeded on 2026-09-19 at the same URL (saved version 6). Site source: `ff7d4bd38a3a2fd17ce30c2eb5766e6fae7bc8a3`; deployment: `appgdep_6aae224b39dc81918a94526f9a5728ce`; canonical implementation: `d338d0ab311e511a6ba7f44770df201fd6820ad3`. Approved main `b469182…` is now incorporated, including EU01/SA03 landscapes. The 72-file archive has 53 PNGs with matching source hashes and excludes superseded legacy landscape copies. Bounded prior-draft migration preserves edits and archives the old saved record before Save all replaces it. Native deployment status: `succeeded`.

Review 05 publication succeeded on 2026-09-19 at the same URL. Site source commit: `ef7b2f606962fe21f9a0265a11983fa0f225ba39`; saved version: 5; deployment ID: `appgdep_6aae1f4eb83c8191a5615b0403db4aa5`. Canonical implementation: `6e81660ea95efb55be8ab1bf7f69a85d40e61e36`, with successful Production CI for that exact SHA. The archive contains 72 files, including 53 byte-identical PNGs; native deployment status is `succeeded`. Browser/user acceptance of the new import flow remains pending.

Review 04 publication succeeded on 2026-09-19 at the same URL. Site source commit: `3a70a9bee0dacf1ff3fafea1d69f24b314fa2a1e`; saved version: 4; deployment ID: `appgdep_6aae1633fce48191a0665232b63bfda6`. Canonical implementation: `398ce53d656b048fc7ca307696cba92d7b328264`. The validated static archive contains 70 files, including 53 unchanged source PNGs; SHA-256: `1207d6a1bcad289b587def99f6068299fcef72f4a359bf53b45a7f3069ba9487`. Native deployment status is `succeeded`; browser/user visual acceptance remains pending.

Review 03 publication succeeded on 2026-09-19 at the same URL. Site source commit: `71654c35c4b6b0107ff7004be80098c16a9593aa`; saved version: 3; deployment ID: `appgdep_6aae0e2868f48191998e59ff3e0723a8`. Canonical implementation: `1a8fb2e2cc803f82ae384553677cc1a4a9ef778c`, incorporating main `723a42b…`. All 53 packaged PNGs match repository source bytes.

Review 02 publication succeeded on 2026-09-19 at the same live URL. Site source commit: `1e6655173838bfb95fa0c2fd007f12d312777ca8`; saved version: 2; deployment ID: `appgdep_6aae03d0994c819181298034305f7c0c`. Canonical editor implementation commit: `0441baf3ef56aeed19d7de19651a741c025ba40f` on `editor-next`.

Continent → Stage navigation, landscape scene/layer/source views, layer transforms and scroll/parallax, six states for both characters, stage hazards, frame playback/stepping, full-atlas view, comparison, per-frame source boundaries and crops, fitted/focus layout, collapsible panels, unified undo/redo, whole-project browser save/export/import with change review and pre-import recovery. A visible loading count covers image download/decode until the selected scene/frame is drawn. Test/Game, gameplay entities and finish editing remain required later milestones.

The static preview does not have a compatible managed development server. Automated browser visual QA is still pending; do not use a cloud browser on the live Sites URL. User visual review can proceed once publication succeeds.
