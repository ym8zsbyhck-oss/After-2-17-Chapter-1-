# Room layout — v1.1

The room is intentionally designed as one believable employee-security room rather than a random prop field.

## North wall (exit / first clue)
- Center: locked service door.
- Left of door: wall clock stopped at 02:17.
- Right corner: coded maintenance locker.

## East wall (maintenance)
- Fuse box.
- Emergency symbol panel.
- Service tray that releases the crank after the symbol puzzle.

## South-west (security workstation)
- Wooden desk against the wall.
- CRT security terminal on the desk.
- Keyboard and mouse on the desk.
- Chair in front of the workstation; it moves after the CRT event.

## West wall (archive)
- Bookcase/archive shelf.
- Radio located on the shelf side.
- Manual crank socket farther toward the exit side.
- Hidden key compartment revealed after using the crank.

## South-east (waiting area)
- Sofa against the wall.
- Floor lamp beside it.
- Dirty rug beneath the seating zone.

## North-east (storage)
- Cardboard box stack separated from the main walking route.

## Collision design

The player has a collision radius and cannot pass through:
- walls;
- desk;
- chair (including its moved position);
- sofa;
- archive bookcase;
- maintenance locker;
- box stack;
- floor lamp.

The Operator uses the same collision field and tries alternate steering angles when furniture blocks the direct route.
