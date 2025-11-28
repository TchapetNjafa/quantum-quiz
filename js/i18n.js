/**
 * QUANTUM QUIZ - MODULE INTERNATIONALISATION (i18n)
 * Gestion du support multilingue
 * Université de Yaoundé I - PHY321
 */

const I18n = {
    // Langues disponibles
    availableLanguages: ['fr', 'en'],

    // Langue par défaut
    defaultLanguage: 'fr',

    // Langue actuelle
    currentLanguage: 'fr',

    // Traductions chargées
    translations: {},

    // Clé de stockage
    STORAGE_KEY: 'quantum_quiz_language',

    /**
     * Initialisation du module i18n
     */
    async init() {
        // Charger la langue sauvegardée ou détecter
        this.currentLanguage = this.getSavedLanguage() || this.detectLanguage();

        // Charger les traductions
        await this.loadTranslations(this.currentLanguage);

        // Appliquer les traductions au DOM
        this.translatePage();

        // Ne pas créer le sélecteur de langue si navigation.js l'a déjà fait
        if (!document.querySelector('.language-selector-nav')) {
            this.createLanguageSelector();
        }

        console.log(`🌐 i18n initialisé (${this.currentLanguage})`);
    },

    /**
     * Détecter la langue du navigateur
     */
    detectLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        const langCode = browserLang.split('-')[0].toLowerCase();

        return this.availableLanguages.includes(langCode) ? langCode : this.defaultLanguage;
    },

    /**
     * Récupérer la langue sauvegardée
     */
    getSavedLanguage() {
        try {
            return localStorage.getItem(this.STORAGE_KEY);
        } catch (e) {
            return null;
        }
    },

    /**
     * Sauvegarder la langue choisie
     */
    saveLanguage(lang) {
        try {
            localStorage.setItem(this.STORAGE_KEY, lang);
        } catch (e) {
            console.warn('i18n: Impossible de sauvegarder la langue');
        }
    },

    /**
     * Charger les traductions pour une langue
     */
    async loadTranslations(lang) {
        try {
            const response = await fetch(`locales/${lang}.json`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            this.translations[lang] = await response.json();
            return true;
        } catch (error) {
            console.warn(`i18n: Erreur chargement ${lang}.json`, error);

            // Fallback vers la langue par défaut
            if (lang !== this.defaultLanguage) {
                return this.loadTranslations(this.defaultLanguage);
            }
            return false;
        }
    },

    /**
     * Obtenir une traduction par clé
     * @param {string} key - Clé de traduction (ex: "home.title")
     * @param {object} params - Paramètres pour interpolation
     * @returns {string} Texte traduit
     */
    t(key, params = {}) {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                // Clé non trouvée, retourner la clé elle-même
                console.warn(`i18n: Traduction manquante pour "${key}"`);
                return key;
            }
        }

        // Interpolation des paramètres {{param}}
        if (typeof value === 'string' && Object.keys(params).length > 0) {
            value = value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
                return params[paramKey] !== undefined ? params[paramKey] : match;
            });
        }

        return value;
    },

    /**
     * Changer de langue
     */
    async setLanguage(lang) {
        if (!this.availableLanguages.includes(lang)) {
            console.warn(`i18n: Langue "${lang}" non disponible`);
            return false;
        }

        // Charger les traductions si nécessaire
        if (!this.translations[lang]) {
            await this.loadTranslations(lang);
        }

        this.currentLanguage = lang;
        this.saveLanguage(lang);

        // Mettre à jour le DOM
        this.translatePage();

        // Mettre à jour l'attribut lang de la page
        document.documentElement.lang = lang;

        // Émettre un événement personnalisé
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));

        console.log(`🌐 Langue changée: ${lang}`);
        return true;
    },

    /**
     * Traduire tous les éléments de la page avec data-i18n
     */
    translatePage() {
        // Éléments avec data-i18n pour le contenu texte
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);

            if (translation !== key) {
                element.textContent = translation;
            }
        });

        // Éléments avec data-i18n-placeholder pour les placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = this.t(key);

            if (translation !== key) {
                element.placeholder = translation;
            }
        });

        // Éléments avec data-i18n-title pour les tooltips
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            const translation = this.t(key);

            if (translation !== key) {
                element.title = translation;
            }
        });

        // Éléments avec data-i18n-aria pour l'accessibilité
        document.querySelectorAll('[data-i18n-aria]').forEach(element => {
            const key = element.getAttribute('data-i18n-aria');
            const translation = this.t(key);

            if (translation !== key) {
                element.setAttribute('aria-label', translation);
            }
        });
    },

    /**
     * Créer le sélecteur de langue dans la navbar
     */
    createLanguageSelector() {
        // Chercher un conteneur existant ou la navbar
        let container = document.querySelector('.language-selector-container');

        if (!container) {
            // Chercher la navbar pour y ajouter le sélecteur
            const navbar = document.querySelector('.navbar-actions') ||
                          document.querySelector('.nav-actions') ||
                          document.querySelector('nav');

            if (!navbar) return;

            container = document.createElement('div');
            container.className = 'language-selector-container';
            navbar.appendChild(container);
        }

        // Créer le sélecteur
        const currentLangData = this.translations[this.currentLanguage]?.meta || {};

        container.innerHTML = `
            <div class="language-selector" role="listbox" aria-label="Sélection de langue">
                <button class="language-btn" aria-haspopup="listbox" aria-expanded="false">
                    <span class="lang-flag">${currentLangData.flag || '🌐'}</span>
                    <span class="lang-code">${this.currentLanguage.toUpperCase()}</span>
                </button>
                <ul class="language-dropdown" role="listbox">
                    ${this.availableLanguages.map(lang => {
        const langData = this.translations[lang]?.meta || { name: lang, flag: '🌐' };
        const isActive = lang === this.currentLanguage;
        return `
                            <li role="option"
                                data-lang="${lang}"
                                class="${isActive ? 'active' : ''}"
                                aria-selected="${isActive}">
                                <span class="lang-flag">${langData.flag}</span>
                                <span class="lang-name">${langData.name}</span>
                            </li>
                        `;
    }).join('')}
                </ul>
            </div>
        `;

        // Event listeners
        const btn = container.querySelector('.language-btn');
        const dropdown = container.querySelector('.language-dropdown');

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isExpanded = btn.getAttribute('aria-expanded') === 'true';
            btn.setAttribute('aria-expanded', !isExpanded);
            dropdown.classList.toggle('show');
        });

        dropdown.querySelectorAll('li').forEach(li => {
            li.addEventListener('click', async () => {
                const lang = li.dataset.lang;
                await this.setLanguage(lang);
                dropdown.classList.remove('show');
                btn.setAttribute('aria-expanded', 'false');

                // Mettre à jour le bouton
                const langData = this.translations[lang]?.meta || {};
                btn.querySelector('.lang-flag').textContent = langData.flag || '🌐';
                btn.querySelector('.lang-code').textContent = lang.toUpperCase();

                // Mettre à jour les états actifs
                dropdown.querySelectorAll('li').forEach(item => {
                    item.classList.toggle('active', item.dataset.lang === lang);
                    item.setAttribute('aria-selected', item.dataset.lang === lang);
                });
            });
        });

        // Fermer le dropdown en cliquant ailleurs
        document.addEventListener('click', () => {
            dropdown.classList.remove('show');
            btn.setAttribute('aria-expanded', 'false');
        });
    },

    /**
     * Obtenir la liste des langues disponibles
     */
    getAvailableLanguages() {
        return this.availableLanguages.map(lang => ({
            code: lang,
            ...this.translations[lang]?.meta
        }));
    },

    /**
     * Vérifier si une langue est disponible
     */
    isLanguageAvailable(lang) {
        return this.availableLanguages.includes(lang);
    },

    /**
     * Formater un nombre selon la locale
     */
    formatNumber(number) {
        return new Intl.NumberFormat(this.currentLanguage).format(number);
    },

    /**
     * Formater une date selon la locale
     */
    formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return new Intl.DateTimeFormat(
            this.currentLanguage,
            { ...defaultOptions, ...options }
        ).format(new Date(date));
    },

    /**
     * Formater une durée en texte lisible
     */
    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        const parts = [];
        if (hours > 0) parts.push(`${hours} ${this.t('time.hours')}`);
        if (minutes > 0) parts.push(`${minutes} ${this.t('time.minutes')}`);
        if (secs > 0 || parts.length === 0) parts.push(`${secs} ${this.t('time.seconds')}`);

        return parts.join(' ');
    }
};

// Alias global pour faciliter l'utilisation
window.t = (key, params) => I18n.t(key, params);

// Initialisation automatique
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => I18n.init());
} else {
    I18n.init();
}

// Export global
window.I18n = I18n;
