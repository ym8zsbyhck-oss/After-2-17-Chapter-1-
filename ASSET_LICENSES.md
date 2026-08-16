# AFTER 02:17 — Chapter 1 v4 — Assets and licenses

## Rule for this build

There are **no hand-drawn / AI-generated bitmap material textures** in the 3D environment.
All bitmap material textures shipped in `` are optimized local copies of CC0 materials sourced from Poly Haven.
Some small shader/model details use plain material colors; those are not bitmap textures.

## Poly Haven CC0 textures included locally

- `wall.webp` — Painted Plaster Wall — https://polyhaven.com/a/painted_plaster_wall
- `floor.webp` — Concrete Floor 02 — https://polyhaven.com/a/concrete_floor_02
- `wood.webp` — Wood Table 001 — https://polyhaven.com/a/wood_table_001
- `metal.webp` — Green Metal Rust — https://polyhaven.com/a/green_metal_rust
- `leather.webp` — Brown Leather — https://polyhaven.com/a/brown_leather
- `carpet.webp` — Dirty Carpet — https://polyhaven.com/a/dirty_carpet

Poly Haven publishes its assets under CC0.

## Kenney Furniture Kit — CC0 models included locally

Official asset page:
https://kenney.nl/assets/furniture-kit

The following source OBJ files are physically included in:
``

- chair.obj
- desk.obj
- computerScreen.obj
- bookcaseOpen.obj
- radio.obj
- computerKeyboard.obj
- computerMouse.obj
- lampRoundFloor.obj

The project also contains `kenney_meshes.js`, generated directly from those bundled OBJ files so the custom WebGL renderer can use the meshes without an external loader/CDN.

The OBJ copies used during assembly came from a public GitHub mirror of Kenney's kit:
https://github.com/ETdoFresh/kenney.nl/tree/master/furniturekit_updated/Models/OBJ%20format

## Original geometry

The interactable puzzle hardware and the Chapter 1 creature **The Operator / Оператор** are original compound geometry made for this prototype. Their visible surface bitmap textures use the imported Poly Haven materials above.

No external network asset is required while playing.


## Operator workwear fabric
- Asset: **Cotton Jersey**
- Source: Poly Haven (`cotton_jersey`)
- License: **CC0**
- Local optimized file: `fabric.webp`
- Use: Operator work coverall (tinted by the WebGL material color; source bitmap is not redrawn).

## Main-menu UI audio
- Local file: `menu_click.mp3`
- Source: audio file supplied directly by the user for this project.
- Use: section/button taps in the main menu and return buttons to the main menu.


## Main-menu font

- Rubik Glitch — Google Fonts / open-source font. Loaded as a webfont; the font binary is not bundled in this project archive.

## Main-menu music

- `menu_theme.mp3` is not bundled in this archive. The project only contains the playback slot/logic. Add only an audio file you have permission to use/distribute.
