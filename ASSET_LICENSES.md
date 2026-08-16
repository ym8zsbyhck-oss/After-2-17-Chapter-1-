# AFTER 02:17 — Chapter 1 v1.1 — Assets and licenses

## Material rule for v1.1

Every visible 3D surface category uses a local bitmap material texture. The project does not use hand-drawn or AI-generated bitmap material textures for the room. Small CRT scanlines/light fluctuations are procedural shader effects layered over textured surfaces.

All new environment textures below are local, mobile-optimized copies of CC0 assets from Poly Haven.

## Poly Haven CC0 textures included locally

- `wall_yellow.webp` — Yellow Plaster — https://polyhaven.com/a/yellow_plaster — worn warm wall plaster.
- `ceiling.webp` — Grey Plaster — https://polyhaven.com/a/grey_plaster — ceiling/plaster surfaces.
- `tiles.webp` — Interior Tiles — https://polyhaven.com/a/interior_tiles — main room floor.
- `metal_grid.webp` — Rusty Metal Grid — https://polyhaven.com/a/rusty_metal_grid — turquoise industrial wainscot, service panels and CRT shell.
- `metal_yellow.webp` — Rusty Metal 03 — https://polyhaven.com/a/rusty_metal_03 — yellow safety metal / lamp / trim.
- `metal_red.webp` — Rusty Painted Metal — https://polyhaven.com/a/rusty_painted_metal — red safety accents / radio casing.
- `cardboard.webp` — Cardboard Box 01 diffuse — https://polyhaven.com/a/cardboard_box_01 — storage boxes.
- `rubber.webp` — Rubber Tiles — https://polyhaven.com/a/rubber_tiles — dark rubber/plastic-like small hardware, keyboard/mouse and screen backing.
- `wood.webp` — Wood Table 001 — https://polyhaven.com/a/wood_table_001 — desk, chair, archive shelf and door.
- `metal.webp` — Green Metal Rust — https://polyhaven.com/a/green_metal_rust — Operator mask / general aged metal.
- `leather.webp` — Brown Leather — https://polyhaven.com/a/brown_leather — sofa upholstery.
- `fabric.webp` — Cotton Jersey — https://polyhaven.com/a/cotton_jersey — Operator work coverall.
- `carpet.webp` — Dirty Carpet — https://polyhaven.com/a/dirty_carpet — waiting-area rug.

Legacy `wall.webp` and `floor.webp` remain in the flat package for save/cache compatibility, but v1.1's main room surfaces use the new material set above.

## Kenney Furniture Kit — CC0 models included locally

Official asset page: https://kenney.nl/assets/furniture-kit

Local OBJ sources included in the flat project:
- `chair.obj`
- `desk.obj`
- `computerScreen.obj`
- `bookcaseOpen.obj`
- `radio.obj`
- `computerKeyboard.obj`
- `computerMouse.obj`
- `lampRoundFloor.obj`

`kenney_meshes.js` contains WebGL-ready mesh data generated from those bundled OBJ files.

## Original geometry

Puzzle hardware and the creature **The Operator / Оператор** are original compound geometry for AFTER 02:17. Their visible surfaces use the CC0 texture library above.

## Audio

- `menu_click.mp3` — file supplied directly by the user; menu selection/tap sound.
- `menu_theme.mp3` — file supplied directly by the user; looping main-menu theme. Rights/redistribution responsibility remains with the file owner.

## Main-menu font

Rubik Glitch is loaded from Google Fonts as a webfont. No font binary is bundled in the project archive.
