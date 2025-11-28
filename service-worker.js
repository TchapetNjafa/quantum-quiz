/**
 * Service Worker pour Quantum Quiz
 * PWA avec support offline complet
 * Version: 2.3.0
 */

const CACHE_NAME = 'quantum-quiz-v3.6';
const CACHE_VERSION = '3.6.0';

// Fichiers essentiels à mettre en cache lors de l'installation
const CORE_ASSETS = [
    './',
    './index.html',
    './quiz.html',
    './results.html',
    './offline.html',

    // CSS
    './css/main.css',
    './css/quiz.css',
    './css/modal.css',
    './css/responsive.css',
    './css/mobile-enhanced.css',
    './css/animations.css',

    // JavaScript Core
    './js/app.js',
    './js/config.js',
    './js/utils.js',
    './js/storage.js',
    './js/quiz-engine.js',
    './js/question-renderer.js',
    './js/results.js',
    './js/mathjax-config.js',
    './js/particles.js',
    './js/audio.js',
    './js/navigation.js',
    './js/i18n.js',

    // Locales
    './locales/fr.json',
    './locales/en.json',

    // PWA Assets
    './manifest.json',
    './assets/icons/icon-192x192.png',
    './assets/icons/icon-512x512.png',
    './assets/icons/UY1_Logo.png',

    // Data - Questions (essentiel pour le mode offline)
    './data/questions.json'
];

// Pages additionnelles à mettre en cache après l'installation
const SECONDARY_ASSETS = [
    './about.html',
    './leaderboard.html',
    './challenges.html',
    './profile.html',
    './resources.html',
    './animations-gallery.html',
    './exam-mode.html',
    './videos.html',
    './flashcards.html',
    './glossary.html',

    // Animation pages
    './animation-bloch-sphere.html',
    './animation-stern-gerlach.html',
    './animation-measurement.html',
    './animation-rabi-oscillations.html',
    './animation-time-evolution.html',
    './animation-entanglement.html',
    './animation-teleportation.html',
    './animation-wave-packet.html',
    './animation-young-interference.html',
    './animation-fourier-transform.html',
    './animation-tunneling.html',
    './animation-potential-well.html',
    './animation-harmonic-oscillator.html',

    // JavaScript additionnel
    './js/statistics.js',
    './js/analytics.js',
    './js/adaptive-difficulty.js',
    './js/lms-integration.js',
    './js/quantum-animations.js',
    './js/quantum-animations-extended.js',
    './js/touch-interactions.js',
    './js/profile-guard.js',
    './js/chapter-audio.js',
    './js/exam-mode.js',
    './js/daily-question.js',
    './js/gamification.js',
    './js/flashcards.js',
    './js/accessibility.js',
    './js/pomodoro.js',
    './js/favorites.js',
    './js/pdf-export.js',
    './js/targeted-review.js',
    './js/animation-linker.js',
    './js/multiplayer.js',
    './js/websocket-client.js',

    // Audio des chapitres
    './assets/audio/chapters/chapter_1.mp3',
    './assets/audio/chapters/chapter_2.mp3',
    './assets/audio/chapters/chapter_3.mp3',
    './assets/audio/chapters/chapter_4.mp3',
    './assets/audio/chapters/chapter_5.mp3',
    './assets/audio/chapters/chapter_6.mp3'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
    console.log('[SW] Installation v' + CACHE_VERSION);

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(async (cache) => {
                console.log('[SW] Mise en cache des ressources essentielles');

                // Mettre en cache les ressources essentielles
                try {
                    await cache.addAll(CORE_ASSETS);
                    console.log('[SW] Ressources essentielles mises en cache');
                } catch (err) {
                    console.warn('[SW] Erreur cache essentiels:', err);
                    // Essayer un par un si le batch échoue
                    for (const asset of CORE_ASSETS) {
                        try {
                            await cache.add(asset);
                        } catch (e) {
                            console.warn('[SW] Impossible de mettre en cache:', asset);
                        }
                    }
                }

                // Mettre en cache les ressources secondaires (non-bloquant)
                setTimeout(async () => {
                    for (const asset of SECONDARY_ASSETS) {
                        try {
                            await cache.add(asset);
                        } catch (e) {
                            // Ignorer les erreurs pour les ressources secondaires
                        }
                    }
                    console.log('[SW] Ressources secondaires mises en cache');
                }, 1000);

                return self.skipWaiting();
            })
            .catch((err) => {
                console.error('[SW] Erreur installation:', err);
            })
    );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
    console.log('[SW] Activation v' + CACHE_VERSION);

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName.startsWith('quantum-quiz')) {
                        console.log('[SW] Suppression ancien cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[SW] Activation réussie');
            return self.clients.claim();
        })
    );
});

// Interception des requêtes réseau
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignorer les requêtes non-GET
    if (request.method !== 'GET') {
        return;
    }

    // Ignorer les requêtes vers des domaines externes (CDN, etc.)
    if (url.origin !== self.location.origin) {
        // Pour MathJax et autres CDN, essayer le réseau d'abord
        if (url.hostname.includes('cdn.jsdelivr.net') ||
            url.hostname.includes('cdnjs.cloudflare.com')) {
            event.respondWith(
                fetch(request)
                    .catch(() => caches.match(request))
            );
        }
        return;
    }

    // Stratégie: Stale-While-Revalidate pour les fichiers statiques
    // Cache First pour les données JSON, Network First pour HTML
    event.respondWith(
        (async () => {
            const cache = await caches.open(CACHE_NAME);

            // Pour les fichiers JSON (questions), utiliser Cache First
            if (url.pathname.endsWith('.json')) {
                const cachedResponse = await cache.match(request);
                if (cachedResponse) {
                    // Mettre à jour en arrière-plan
                    fetch(request).then(response => {
                        if (response && response.status === 200) {
                            cache.put(request, response.clone());
                        }
                    }).catch(() => {});
                    return cachedResponse;
                }
            }

            // Pour les pages HTML, essayer le réseau d'abord
            if (request.headers.get('accept')?.includes('text/html')) {
                try {
                    const networkResponse = await fetch(request);
                    if (networkResponse && networkResponse.status === 200) {
                        cache.put(request, networkResponse.clone());
                    }
                    return networkResponse;
                } catch (err) {
                    const cachedResponse = await cache.match(request);
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // Fallback vers la page offline
                    return cache.match('./offline.html');
                }
            }

            // Pour les autres ressources (CSS, JS, images), Cache First
            const cachedResponse = await cache.match(request);
            if (cachedResponse) {
                return cachedResponse;
            }

            try {
                const networkResponse = await fetch(request);
                if (networkResponse && networkResponse.status === 200) {
                    // Mettre en cache les ressources statiques
                    if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|webp|woff2?)$/)) {
                        cache.put(request, networkResponse.clone());
                    }
                }
                return networkResponse;
            } catch (err) {
                console.warn('[SW] Ressource non disponible:', url.pathname);
                return new Response('Resource not available offline', {
                    status: 503,
                    statusText: 'Service Unavailable'
                });
            }
        })()
    );
});

// Gestion des messages
self.addEventListener('message', (event) => {
    if (event.data) {
        switch (event.data.action) {
            case 'clearCache':
                event.waitUntil(
                    caches.keys().then((cacheNames) => {
                        return Promise.all(
                            cacheNames.map((cacheName) => caches.delete(cacheName))
                        );
                    }).then(() => {
                        console.log('[SW] Cache vidé');
                        if (event.ports[0]) {
                            event.ports[0].postMessage({ status: 'cleared' });
                        }
                    })
                );
                break;

            case 'skipWaiting':
                self.skipWaiting();
                break;

            case 'getVersion':
                if (event.ports[0]) {
                    event.ports[0].postMessage({ version: CACHE_VERSION });
                }
                break;
        }
    }
});

// Synchronisation en arrière-plan (si supporté)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-stats') {
        console.log('[SW] Synchronisation des statistiques');
        // Implémenter la synchronisation si nécessaire
    }
});

console.log('[SW] Script chargé v' + CACHE_VERSION);
