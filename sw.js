// Service worker بسيط: الصفحة تتحمل من النت أولاً (عشان التحديثات تظهر فوراً)، وتترجع من الكاش لو النت ضعيف.
const CACHE = 'drremon-v1';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './doctor.jpeg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // طلبات الشيت (Apps Script) والخطوط والصور الخارجية: مفيش تدخل
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
