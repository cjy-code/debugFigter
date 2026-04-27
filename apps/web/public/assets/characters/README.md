# Character Asset Resource Guide

This directory stores runtime-ready character assets for `Debug Fighter`.

## Directory

- `_reference`: concept board and source references
- `warrior`: backend class assets
- `mage`: AI class assets
- `archer`: frontend class assets
- `shared`: shared effects (hit, glitch, etc.)

## Naming

- `class_state_v01.png`
- `class_part_name_v01.png`
- `fx_name_v01.png`

## Runtime Contract

- Update `manifest.json` with actual file paths
- Keep frame size fixed per sheet (`96x96`)
- Default idle clip uses `8` frames and `8fps`

## Current Extraction Status

- Assets were generated from a single concept board image.
- Some part and FX crops can contain neighboring pixels due source layout.
- Replace with clean transparent originals for production quality.
