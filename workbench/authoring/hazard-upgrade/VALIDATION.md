# Package validation

- 27 unique approved hazard IDs in 18 atlases.
- Each replacement PNG retains its original filename, dimensions and RGBA format.
- Every final modified slot matches its approved review artwork pixel for pixel, including changes approved in earlier batches.
- Every pixel outside the union of modified regions matches the original source atlas.
- Rejected concepts and superseded atlas versions are excluded from the import folder.
- SHA-256 originals and replacements are listed in ATLAS_MANIFEST.json.
- Review previews used the existing Workbench renderer and v9 fixture, both characters and three background positions. Final sign/case previews used the documented revised crops.
- No live gameplay, collision, physical phone or integration certification is claimed. Those checks belong to Workbench after import.

Source snapshot: 96fc87cbeee130d281c6ce8a711fd552aa428182. Original source assets were read from dist/assets/worlds in the captured Workbench checkout. Resolve the current source-of-truth asset directory before import.
