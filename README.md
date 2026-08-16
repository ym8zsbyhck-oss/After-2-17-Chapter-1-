# AFTER 02:17 — Chapter 1: The Room
## iOS landscape 3D horror prototype v1.0

This build is intended only for iPhone/iPad touch controls in landscape orientation.

### Controls
- Left thumb: virtual movement stick
- Right side drag: camera
- ACTION button: interact
- No keyboard/mouse gameplay controls are included.

### Chapter 1 progression
1. Inspect the room and notice the frozen 02:17 clock.
2. Connect that clue to the four-digit cabinet lock: 0217.
3. Take the fuse and solve the touch electrical-circuit puzzle.
4. Restore power. The Operator can briefly appear.
5. Read the CRT terminal and memorize the symbol sequence.
6. Enter the sequence on the wall panel.
7. Take the metal crank released by the panel.
8. Find the manual wall mechanism and use the crank.
9. Take the key from the opened compartment.
10. The Operator begins pursuing the player.
11. Reach the locked door and escape to complete Chapter 1.

### Chapter 2 structure
The project is deliberately branded as a chapter-based series:
- `AFTER 02:17 — Chapter 1: The Room`
- future: `AFTER 02:17 — Chapter 2: <subtitle>`

The `AFTER 02:17` brand remains constant, while each chapter can use a new location and subtitle.

### Offline assets
Runtime has zero CDN/model/texture dependencies.
See `ASSET_LICENSES.md` for the exact asset sources and licenses.

### Hosting
Use any static host (Cloudflare Pages, Vercel, GitHub Pages, etc.) and open it in Safari on iPhone.
Service Worker caches the runtime files after first hosted load.


## Version 1.0 additions

- Main menu uses the local user-provided `menu_click.mp3` sound for section taps.
- The Operator no longer uses leather as clothing. Its coverall uses Poly Haven Cotton Jersey (CC0), tinted dark workwear green-gray in the material shader.
- The Operator mask keeps the imported rusted metal material and adds procedural CRT flicker/static bands plus a weak white sensor point.
- Runtime remains offline: models, textures and menu audio are stored inside the project.


## Главное меню: звук и музыка

- `menu_click.mp3` — короткий звук выбора/нажатия пункта меню.
- `menu_theme.mp3` — слот фоновой музыки главного меню. Код уже умеет запускать её после первого касания iOS, зацикливать, менять громкость и плавно гасить при входе в игру.
- Если `menu_theme.mp3` отсутствует, игра продолжает работать без фоновой музыки.
- Заголовок и пункты главного меню используют `Rubik Glitch` через Google Fonts с системным fallback.


## GitHub Flat Layout

Эта сборка специально подготовлена без папок: все файлы лежат в корне репозитория. Загружайте содержимое ZIP напрямую в корень GitHub-репозитория. `index.html` должен находиться в корне.


## Main menu audio

- `menu_click.mp3` — short sound when a menu item is touched/selected.
- `menu_theme.mp3` — looping background music for the main menu. On iOS it starts after the first user touch due to Safari autoplay rules and fades out when gameplay begins.
