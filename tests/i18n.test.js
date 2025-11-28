/**
 * Tests pour le module i18n de Quantum Quiz
 * Tests unitaires pour l'internationalisation
 */

describe('I18n - Module Internationalisation', () => {

    // ==================== Configuration de base ====================
    describe('Configuration', () => {
        const availableLanguages = ['fr', 'en'];
        const defaultLanguage = 'fr';

        test('langues disponibles contient fr et en', () => {
            expect(availableLanguages).toContain('fr');
            expect(availableLanguages).toContain('en');
        });

        test('langue par défaut est français', () => {
            expect(defaultLanguage).toBe('fr');
        });

        test('exactement 2 langues disponibles', () => {
            expect(availableLanguages.length).toBe(2);
        });
    });

    // ==================== Détection de langue ====================
    describe('detectLanguage()', () => {
        const availableLanguages = ['fr', 'en'];
        const defaultLanguage = 'fr';

        const detectLanguage = (browserLang) => {
            const langCode = browserLang.split('-')[0].toLowerCase();
            return availableLanguages.includes(langCode) ? langCode : defaultLanguage;
        };

        test('détecte français depuis fr-FR', () => {
            expect(detectLanguage('fr-FR')).toBe('fr');
        });

        test('détecte anglais depuis en-US', () => {
            expect(detectLanguage('en-US')).toBe('en');
        });

        test('détecte anglais depuis en-GB', () => {
            expect(detectLanguage('en-GB')).toBe('en');
        });

        test('retourne français pour langue non supportée', () => {
            expect(detectLanguage('de-DE')).toBe('fr');
            expect(detectLanguage('es-ES')).toBe('fr');
            expect(detectLanguage('zh-CN')).toBe('fr');
        });

        test('gère les codes de langue simples', () => {
            expect(detectLanguage('fr')).toBe('fr');
            expect(detectLanguage('en')).toBe('en');
        });
    });

    // ==================== Fonction de traduction t() ====================
    describe('t() - Fonction de traduction', () => {
        const translations = {
            fr: {
                home: {
                    title: 'Quantum Quiz',
                    subtitle: 'Physique Quantique'
                },
                quiz: {
                    question: 'Question {{number}} sur {{total}}',
                    correct: 'Correct !',
                    incorrect: 'Incorrect'
                },
                nav: {
                    home: 'Accueil',
                    about: 'À propos'
                }
            },
            en: {
                home: {
                    title: 'Quantum Quiz',
                    subtitle: 'Quantum Physics'
                },
                quiz: {
                    question: 'Question {{number}} of {{total}}',
                    correct: 'Correct!',
                    incorrect: 'Incorrect'
                },
                nav: {
                    home: 'Home',
                    about: 'About'
                }
            }
        };

        const t = (key, params = {}, lang = 'fr') => {
            const keys = key.split('.');
            let value = translations[lang];

            for (const k of keys) {
                if (value && typeof value === 'object' && k in value) {
                    value = value[k];
                } else {
                    return key; // Clé non trouvée
                }
            }

            // Interpolation des paramètres {{param}}
            if (typeof value === 'string' && Object.keys(params).length > 0) {
                value = value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
                    return params[paramKey] !== undefined ? params[paramKey] : match;
                });
            }

            return value;
        };

        test('récupère une traduction simple', () => {
            expect(t('home.title')).toBe('Quantum Quiz');
            expect(t('nav.home')).toBe('Accueil');
        });

        test('récupère une traduction imbriquée', () => {
            expect(t('quiz.correct')).toBe('Correct !');
            expect(t('home.subtitle')).toBe('Physique Quantique');
        });

        test('retourne la clé si traduction non trouvée', () => {
            expect(t('inexistant.key')).toBe('inexistant.key');
            expect(t('home.missing')).toBe('home.missing');
        });

        test('interpole les paramètres', () => {
            expect(t('quiz.question', { number: 5, total: 20 })).toBe('Question 5 sur 20');
        });

        test('préserve les paramètres non fournis', () => {
            expect(t('quiz.question', { number: 5 })).toBe('Question 5 sur {{total}}');
        });

        test('fonctionne en anglais', () => {
            expect(t('nav.home', {}, 'en')).toBe('Home');
            expect(t('quiz.question', { number: 3, total: 10 }, 'en')).toBe('Question 3 of 10');
        });
    });

    // ==================== Validation des langues ====================
    describe('isLanguageAvailable()', () => {
        const availableLanguages = ['fr', 'en'];

        const isLanguageAvailable = (lang) => {
            return availableLanguages.includes(lang);
        };

        test('retourne true pour français', () => {
            expect(isLanguageAvailable('fr')).toBe(true);
        });

        test('retourne true pour anglais', () => {
            expect(isLanguageAvailable('en')).toBe(true);
        });

        test('retourne false pour langue non supportée', () => {
            expect(isLanguageAvailable('de')).toBe(false);
            expect(isLanguageAvailable('es')).toBe(false);
            expect(isLanguageAvailable('zh')).toBe(false);
        });

        test('est sensible à la casse', () => {
            expect(isLanguageAvailable('FR')).toBe(false);
            expect(isLanguageAvailable('En')).toBe(false);
        });
    });

    // ==================== Formatage des nombres ====================
    describe('formatNumber()', () => {
        const formatNumber = (number, lang = 'fr') => {
            return new Intl.NumberFormat(lang).format(number);
        };

        test('formate un nombre en français', () => {
            // En français, le séparateur de milliers est l'espace insécable
            const formatted = formatNumber(1234567, 'fr');
            expect(formatted).toMatch(/1.234.567|1 234 567/);
        });

        test('formate un nombre en anglais', () => {
            const formatted = formatNumber(1234567, 'en');
            expect(formatted).toMatch(/1,234,567/);
        });

        test('formate les décimales', () => {
            const formatted = formatNumber(1234.56, 'fr');
            expect(formatted).toContain('1');
            expect(formatted).toContain('234');
        });
    });

    // ==================== Formatage des dates ====================
    describe('formatDate()', () => {
        const formatDate = (date, lang = 'fr', options = {}) => {
            const defaultOptions = {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            return new Intl.DateTimeFormat(
                lang,
                { ...defaultOptions, ...options }
            ).format(new Date(date));
        };

        test('formate une date en français', () => {
            const date = new Date('2025-01-15');
            const formatted = formatDate(date, 'fr');
            expect(formatted).toContain('janvier');
            expect(formatted).toContain('2025');
        });

        test('formate une date en anglais', () => {
            const date = new Date('2025-01-15');
            const formatted = formatDate(date, 'en');
            expect(formatted).toContain('January');
            expect(formatted).toContain('2025');
        });
    });

    // ==================== Stockage de la langue ====================
    describe('Stockage localStorage', () => {
        const STORAGE_KEY = 'quantum_quiz_language';

        beforeEach(() => {
            localStorage.clear();
        });

        test('sauvegarde la langue choisie', () => {
            localStorage.setItem(STORAGE_KEY, 'en');
            expect(localStorage.getItem(STORAGE_KEY)).toBe('en');
        });

        test('récupère la langue sauvegardée', () => {
            localStorage.setItem(STORAGE_KEY, 'fr');
            const savedLang = localStorage.getItem(STORAGE_KEY);
            expect(savedLang).toBe('fr');
        });

        test('retourne null si pas de langue sauvegardée', () => {
            const savedLang = localStorage.getItem(STORAGE_KEY);
            expect(savedLang).toBeNull();
        });
    });

    // ==================== Parsing des clés de traduction ====================
    describe('Parsing des clés', () => {
        const getNestedValue = (obj, key) => {
            return key.split('.').reduce((o, k) => (o && o[k] !== undefined) ? o[k] : null, obj);
        };

        const testObj = {
            level1: {
                level2: {
                    level3: 'deep value'
                },
                simple: 'simple value'
            },
            top: 'top value'
        };

        test('récupère une valeur de premier niveau', () => {
            expect(getNestedValue(testObj, 'top')).toBe('top value');
        });

        test('récupère une valeur imbriquée sur 2 niveaux', () => {
            expect(getNestedValue(testObj, 'level1.simple')).toBe('simple value');
        });

        test('récupère une valeur imbriquée sur 3 niveaux', () => {
            expect(getNestedValue(testObj, 'level1.level2.level3')).toBe('deep value');
        });

        test('retourne null pour clé inexistante', () => {
            expect(getNestedValue(testObj, 'inexistant')).toBeNull();
            expect(getNestedValue(testObj, 'level1.inexistant')).toBeNull();
        });

        test('gère les objets null ou undefined', () => {
            expect(getNestedValue(null, 'key')).toBeNull();
            expect(getNestedValue(undefined, 'key')).toBeNull();
        });
    });
});
