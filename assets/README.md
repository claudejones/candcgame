# Production Assets

This directory is for validated production-ready assets only.

Planned organization:

```text
assets/
├── characters/
├── shared/
│   ├── clouds/
│   ├── finish/
│   └── ui/
└── worlds/
    ├── north-america/
    │   ├── na01-desert/
    │   ├── na02-pines/
    │   └── na03-city/
    ├── south-america/
    │   ├── sa01-amazon/
    │   ├── sa02-andes/
    │   └── sa03-rio/
    └── europe/
        ├── eu01-greece/
        ├── eu02-paris/
        └── eu03-barcelona/
```

Original uploaded assets are preserved separately under `assets-original/current-generated/` and must not be modified. Production directories are populated only after the relevant asset has been reconciled/validated. Landscape assets additionally require KEEP / REPAIR / REGENERATE classification against `docs/WORLD_RENDERING_SPEC.md` before production placement.
