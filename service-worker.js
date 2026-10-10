/* Service worker du Quiz PHY321 : utilisable hors connexion après une première visite.
   Pages HTML et banque de questions : réseau d'abord (contenu à jour), cache en secours.
   Autres ressources (CSS, JS, images, polices, MathJax) : cache d'abord. */
const VERSION = 'quiz-2026-10-10-schemas';
const CORE = [
  './', './index.html', './quiz.html', './results.html', './flashcards.html', './glossary.html',
  './resources.html', './about.html', './offline.html', './manifest.json', './manifest.en.json', './data/questions.json',
  './css/carnet.css', './css/quiz.css',
  './js/common.js', './js/questions.js', './js/quiz.js', './js/results.js', './js/home.js',
  './js/flashcards.js', './js/mathjax-config.js', './assets/icons/favicon.svg', './assets/icons/icon-192x192.png',
  './en/', './en/index.html', './en/quiz.html', './en/results.html', './en/flashcards.html', './en/glossary.html',
  './en/resources.html', './en/about.html', './en/offline.html', './data/questions.en.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const cacheable = url.origin === location.origin ||
    /^(cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(url.hostname);
  if (!cacheable) return;

  const put = res => {
    if (res && (res.ok || res.type === 'opaque')) {
      const copy = res.clone();
      caches.open(VERSION).then(c => c.put(req, copy));
    }
    return res;
  };
  const fresh = req.mode === 'navigate' || /\/questions(\.en)?\.json$/.test(url.pathname);
  if (fresh) {
    e.respondWith(fetch(req).then(put).catch(() =>
      caches.match(req, { ignoreSearch: true })
        .then(r => r || (req.mode === 'navigate' ? caches.match(url.pathname.includes('/en/') ? './en/offline.html' : './offline.html') : Response.error()))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(put)));
});
