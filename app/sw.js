// Service worker: la app abre sin conexión (los datos vienen de la última copia guardada).
const VERSION = 'gilvault-v17';
const ARCHIVOS = ['./', 'index.html', 'style.css?v=17', 'app.js?v=17', 'sprites.js?v=17', 'demo.js?v=17', 'gato.js?v=17', 'aventura.js?v=17', 'manifest.webmanifest', 'heroe/idle.png?v=17', 'heroe/caminata.png?v=17', 'heroe/vuelta.png?v=17', 'heroe/cansado.png?v=17', 'heroe/fogata.png?v=17', 'heroe/hechizo.png?v=17',
  'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return; // la API (POST) siempre va a la red
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    // Red primero (revalidando la caché HTTP) para tener siempre la última versión; caché si no hay conexión.
    e.respondWith(fetch(req, { cache: 'no-cache' }).then(r => {
      const copia = r.clone(); caches.open(VERSION).then(c => c.put(req, copia)); return r;
    }).catch(() => caches.match(req).then(r => r || caches.match('index.html'))));
  } else if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    // Fuentes: caché primero.
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => {
      const copia = res.clone(); caches.open(VERSION).then(c => c.put(req, copia)); return res;
    })));
  }
});
