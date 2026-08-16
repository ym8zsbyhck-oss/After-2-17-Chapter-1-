# AFTER 02:17 — Chapter 1: The Room — v1.1

iOS-landscape 3D horror puzzle, prepared as a flat GitHub Pages build: all files remain in the repository root.

## Main v1.1 changes

- Rebuilt the room as a coherent employee-security / break room.
- Added player-radius collision against walls and major furniture.
- Added collision-aware Operator movement.
- Fixed camera touch direction: swipe right = look right; swipe up = look up.
- Replaced generic floor/walls with a curated worn toy-factory-inspired palette: aged cream plaster, turquoise service metal, red/yellow safety accents and tiled floor.
- Added local CC0 texture categories for floor, walls, ceiling, metal accents, rubber, cardboard, wood, upholstery, carpet and Operator clothing.
- Added animated **CURRENT OBJECTIVE / ТЕКУЩАЯ ЦЕЛЬ** panel with a title and contextual next step.
- Expanded electrical puzzle to a 4x4 touch circuit with two required relay contacts.
- Kept iOS touch-only controls and landscape safe areas.

## iPhone controls

- Left thumb: virtual stick, natural movement relative to camera.
- Right thumb: swipe to look around.
  - Swipe right -> camera turns right.
  - Swipe up -> camera looks up.
- `ДЕЙСТВИЕ`: interact with the focused object.

## GitHub Pages

Upload every file from the ZIP to the repository root. `index.html` must remain in the root.

Pages settings:
- Source: Deploy from a branch
- Branch: `main`
- Folder: `/ (root)`

## Core progression

Clock 02:17 -> maintenance locker -> fuse -> 4x4 power circuit -> CRT terminal -> symbol panel -> crank -> archive mechanism -> key -> Operator chase -> service door.

See `ROOM_LAYOUT.md` for the intended room plan and `ASSET_LICENSES.md` for the local material sources.
