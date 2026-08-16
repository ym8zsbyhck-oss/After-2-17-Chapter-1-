# AFTER 02:17 — Chapter 1: The Room — v1.2

Flat GitHub Pages build for iPhone/iPad landscape. No folders are required.

## What v1.2 fixes

- Fixed the real camera inversion bug: the view matrix and movement now use the same yaw direction.
- Replaced raw iOS touch deltas with pointer-captured, normalized camera control plus light smoothing.
- Added a joystick dead-zone so the player does not drift from tiny thumb movement.
- Story props are now physical 3D objects rather than proxy blocks: wall clock, maintenance locker/keypad, fuse, fusebox/breakers, symbol panel/tray, crank, archive shutter/compartment, key and industrial service door.
- The clock face is modeled with 12 tick marks and hands physically set to **02:17**.
- Entering 0217 now opens the locker; the fuse remains visible in the locker until the player picks it up.
- The fuse must then be physically installed in the fusebox before the circuit puzzle starts.
- Solving the symbol panel physically extends a tray containing the crank.
- Using the crank opens a visible metal archive compartment containing the key.
- Added dedicated local CC0 materials for weathered archive wood and the rusty archive shutter.
- All existing room/furniture collision remains enabled.

## iOS controls

- Left side: floating joystick. A small dead-zone prevents accidental movement.
- Right side: drag to look. Right = right, left = left, up = up, down = down.
- Camera input is normalized to screen size and lightly smoothed.
- `ДЕЙСТВИЕ`: interact with the object under the reticle.

## Story path

Clock 02:17 → code 0217 → locker opens → physically pick up fuse → physically install fuse → circuit → CRT → symbol panel → tray/crank → archive mechanism → compartment opens → key → Operator chase → service door.

## GitHub Pages

Upload every file from the ZIP directly into the repository root. Set Pages to `main` + `/ (root)`.
