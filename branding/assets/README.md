# Branding Assets Contract

This folder is the source of truth for repository-local branding assets used by `branding/brand.config.json`.

## Rules

1. Keep only canonical, production-intended files here.
2. File names referenced in `branding/brand.config.json` must remain stable.
3. Replacing an asset should preserve filename and format unless the config is updated in the same change.
4. Do not reference remote URLs from `branding/brand.config.json`; use local paths in this folder.
5. If design source files (for example Figma exports) change, export updated deliverables here and validate consumers still load them.

## Required files

- `logo-light.svg`
- `logo-dark.svg`
- `favicon.png`

## Optional files

- `social-preview-light.png`
- `social-preview-dark.png`
