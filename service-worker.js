/* Service worker du Quiz PHY321 : utilisable hors connexion après une première visite.
   Pages HTML et banque de questions : réseau d'abord (contenu à jour), cache en secours.
   Autres ressources (CSS, JS, images, polices, MathJax) : cache d'abord. */
const VERSION = 'quiz-2026-10-23-enseignant';
const CORE = [
  './', './index.html', './quiz.html', './results.html', './flashcards.html', './glossary.html',
  './resources.html', './about.html', './offline.html', './manifest.json', './manifest.en.json', './data/questions.json',
  './css/carnet.css', './css/quiz.css',
  './js/common.js', './js/questions.js', './js/quiz.js', './js/results.js', './js/home.js',
  './js/flashcards.js', './js/mathjax-config.js', './assets/icons/favicon.svg', './assets/icons/icon-192x192.png',
  './en/', './en/index.html', './en/quiz.html', './en/results.html', './en/flashcards.html', './en/glossary.html',
  './en/resources.html', './en/about.html', './en/offline.html', './data/questions.en.json'
];

/* Mise à jour par différence (Vercel) : `versions.json` donne l'empreinte de chaque fichier du quiz ; la nouvelle version recopie localement
   les fichiers inchangés et ne télécharge que les nouveaux ou modifiés. Sans `versions.json` (GitHub Pages) : noyau retéléchargé, comme avant. */
const PREFIX = 'quiz-';
const portee = new URL(self.registration.scope);
const cle = u => { let p = new URL(u, portee).pathname.slice(portee.pathname.length); if (p === '' || p.endsWith('/')) p += 'index.html'; return p; };

async function installerParDifference() {
  const nouveau = await caches.open(VERSION);
  let manifeste = null;
  try { const r = await fetch('./versions.json', { cache: 'no-store' }); if (r.ok) manifeste = await r.json(); } catch { /* GitHub Pages, ou hors connexion */ }
  const anciens = (await caches.keys()).filter(k => k.startsWith(PREFIX) && k !== VERSION).sort();
  const ancien = anciens.length ? await caches.open(anciens[anciens.length - 1]) : null;
  const rm = ancien && manifeste ? await ancien.match('./versions.json') : null;
  const ancienManifeste = rm ? await rm.json().catch(() => null) : null;
  const demandes = new Map(CORE.map(u => [new URL(u, portee).href, true]));
  if (ancien && manifeste) {
    for (const r of await ancien.keys()) {
      const u = new URL(r.url), k = cle(r.url);
      if (u.origin === location.origin && k !== 'versions.json' && !k.startsWith('__') && manifeste[k] !== undefined) demandes.set(r.url, false);
    }
  }
  let copies = 0, telecharges = 0;
  for (const [href, essentiel] of demandes) {
    const k = cle(href);
    if (ancien && ancienManifeste && manifeste && ancienManifeste[k] !== undefined && ancienManifeste[k] === manifeste[k]) {
      const hit = await ancien.match(href);
      if (hit) { await nouveau.put(href, hit); copies++; continue; }
    }
    try {
      const res = await fetch(href, { cache: 'reload' });
      if (!res.ok) throw new Error(String(res.status));
      await nouveau.put(href, res); telecharges++;
    } catch (err) { if (essentiel) throw err; }
  }
  // Ressources d'autres sites (MathJax, polices) : absentes du manifeste, recopiées telles quelles pour rester disponibles hors connexion.
  if (ancien) for (const r of await ancien.keys()) {
    if (new URL(r.url).origin === location.origin) continue;
    const hit = await ancien.match(r); if (hit) { await nouveau.put(r.url, hit); copies++; }
  }
  if (manifeste) await nouveau.put('./versions.json', new Response(JSON.stringify(manifeste), { headers: { 'Content-Type': 'application/json' } }));
  await nouveau.put('./__bilan__', new Response(JSON.stringify({ version: VERSION, copies, telecharges, par_difference: !!(ancienManifeste && manifeste) }), { headers: { 'Content-Type': 'application/json' } }));
}

self.addEventListener('install', e => {
  e.waitUntil(installerParDifference().then(() => self.skipWaiting()));
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
  // Sur Vercel, le quiz vit sous /quiz/ : l'API (/api/) et les fichiers du Carnet (/assets/...) ne sont pas à mettre en cache ici.
  if (url.origin === location.origin && (url.pathname.startsWith('/api/') || url.pathname.startsWith('/assets/'))) return;
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
