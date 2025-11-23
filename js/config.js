/**
 * Configuration globale de l'application
 */

const APP_CONFIG = {
    // Mode debug (désactiver en production pour meilleures performances)
    DEBUG_MODE: false,

    // Performance
    ENABLE_PARTICLES: true,
    PARTICLE_FPS: 30,
    CACHE_MATHJAX: true,

    // Logs
    LOG_LEVEL: 'error' // 'none', 'error', 'warn', 'info', 'debug'
};

// Console wrapper pour respecter le niveau de log
const logger = {
    debug: (...args) => {
        if (APP_CONFIG.DEBUG_MODE || APP_CONFIG.LOG_LEVEL === 'debug') {
            console.log('[DEBUG]', ...args);
        }
    },
    info: (...args) => {
        if (APP_CONFIG.DEBUG_MODE || ['info', 'debug'].includes(APP_CONFIG.LOG_LEVEL)) {
            console.log('[INFO]', ...args);
        }
    },
    warn: (...args) => {
        if (APP_CONFIG.LOG_LEVEL !== 'none') {
            console.warn('[WARN]', ...args);
        }
    },
    error: (...args) => {
        if (APP_CONFIG.LOG_LEVEL !== 'none') {
            console.error('[ERROR]', ...args);
        }
    }
};

// MathJax cache pour éviter les re-renders
const MathJaxCache = {
    cache: new Map(),
    
    async typeset(element) {
        if (!APP_CONFIG.CACHE_MATHJAX) {
            if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
                return await MathJax.typesetPromise([element]);
            }
            return;
        }

        const html = element.innerHTML;
        const cacheKey = html;

        if (this.cache.has(cacheKey)) {
            // Déjà rendu, ne rien faire
            return;
        }

        if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
            await MathJax.typesetPromise([element]);
            this.cache.set(cacheKey, true);
        }
    },

    clear() {
        this.cache.clear();
    }
};
