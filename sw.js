const CACHE='after0217-ch1-v1-2-physical-props';
const ASSETS=["./", "index.html", "styles.css", "engine.js", "models.js", "kenney_meshes.js", "wall.webp", "floor.webp", "wood.webp", "metal.webp", "leather.webp", "fabric.webp", "carpet.webp", "tiles.webp", "wall_yellow.webp", "ceiling.webp", "metal_yellow.webp", "metal_grid.webp", "metal_red.webp", "cardboard.webp", "rubber.webp", "old_wood.webp", "shutter.webp", "menu_click.mp3", "menu_theme.mp3", "icon-192.png", "icon-512.png", "apple-touch-icon.png", "manifest.webmanifest"];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x))))));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
