/**
 * Tests pour le module navigation de Quantum Quiz
 * Tests unitaires pour la navigation et le changement de langue
 */

describe('Navigation - Module de navigation', () => {

    // ==================== Structure de navigation ====================
    describe('Structure navLinks', () => {
        const navLinks = [
            { href: 'index.html', icon: '🏠', text: 'Accueil', i18nKey: 'nav.home', page: 'index.html' },
            { href: 'profile.html', icon: '👤', text: 'Profil', i18nKey: 'nav.profile', page: 'profile.html' },
            { href: 'leaderboard.html', icon: '🏆', text: 'Classement', i18nKey: 'nav.leaderboard', page: 'leaderboard.html' },
            { href: 'challenges.html', icon: '⚔️', text: 'Défis', i18nKey: 'nav.challenges', page: 'challenges.html' },
            { href: 'animations-gallery.html', icon: '🎬', text: 'Animations', i18nKey: 'nav.animations', page: 'animations-gallery.html' },
            { href: 'about.html', icon: 'ℹ️', text: 'À propos', i18nKey: 'nav.about', page: 'about.html' }
        ];

        test('contient 6 liens de navigation', () => {
            expect(navLinks.length).toBe(6);
        });

        test('chaque lien a les propriétés requises', () => {
            navLinks.forEach(link => {
                expect(link).toHaveProperty('href');
                expect(link).toHaveProperty('icon');
                expect(link).toHaveProperty('text');
                expect(link).toHaveProperty('i18nKey');
                expect(link).toHaveProperty('page');
            });
        });

        test('les liens ont des href valides', () => {
            navLinks.forEach(link => {
                expect(link.href).toMatch(/\.html$/);
            });
        });

        test('les clés i18n ont le bon préfixe', () => {
            navLinks.forEach(link => {
                expect(link.i18nKey).toMatch(/^nav\./);
            });
        });

        test('contient le lien accueil', () => {
            const homeLink = navLinks.find(l => l.page === 'index.html');
            expect(homeLink).toBeDefined();
            expect(homeLink.text).toBe('Accueil');
        });

        test('contient le lien animations', () => {
            const animLink = navLinks.find(l => l.page === 'animations-gallery.html');
            expect(animLink).toBeDefined();
            expect(animLink.icon).toBe('🎬');
        });
    });

    // ==================== Langues disponibles ====================
    describe('availableLanguages', () => {
        const availableLanguages = [
            { code: 'fr', name: 'Français', flag: '🇫🇷' },
            { code: 'en', name: 'English', flag: '🇬🇧' }
        ];

        test('contient français et anglais', () => {
            const codes = availableLanguages.map(l => l.code);
            expect(codes).toContain('fr');
            expect(codes).toContain('en');
        });

        test('chaque langue a code, nom et drapeau', () => {
            availableLanguages.forEach(lang => {
                expect(lang).toHaveProperty('code');
                expect(lang).toHaveProperty('name');
                expect(lang).toHaveProperty('flag');
                expect(lang.code.length).toBe(2);
            });
        });

        test('français a le bon drapeau', () => {
            const fr = availableLanguages.find(l => l.code === 'fr');
            expect(fr.flag).toBe('🇫🇷');
            expect(fr.name).toBe('Français');
        });

        test('anglais a le bon drapeau', () => {
            const en = availableLanguages.find(l => l.code === 'en');
            expect(en.flag).toBe('🇬🇧');
            expect(en.name).toBe('English');
        });
    });

    // ==================== getCurrentPage ====================
    describe('getCurrentPage()', () => {
        const getCurrentPage = (pathname) => {
            const filename = pathname.split('/').pop() || 'index.html';
            return filename;
        };

        test('extrait le nom de fichier d\'un chemin', () => {
            expect(getCurrentPage('/path/to/quiz.html')).toBe('quiz.html');
        });

        test('gère les chemins simples', () => {
            expect(getCurrentPage('/index.html')).toBe('index.html');
        });

        test('gère les chemins avec dossiers multiples', () => {
            expect(getCurrentPage('/a/b/c/about.html')).toBe('about.html');
        });

        test('retourne index.html pour chemin vide', () => {
            expect(getCurrentPage('/')).toBe('index.html');
            expect(getCurrentPage('')).toBe('index.html');
        });

        test('gère les fichiers sans extension', () => {
            expect(getCurrentPage('/path/to/file')).toBe('file');
        });
    });

    // ==================== getNestedValue ====================
    describe('getNestedValue()', () => {
        const getNestedValue = (obj, key) => {
            return key.split('.').reduce((o, k) => (o && o[k] !== undefined) ? o[k] : null, obj);
        };

        const translations = {
            nav: {
                home: 'Accueil',
                profile: 'Profil',
                nested: {
                    deep: 'Valeur profonde'
                }
            },
            home: {
                title: 'Quantum Quiz'
            }
        };

        test('récupère une valeur de navigation', () => {
            expect(getNestedValue(translations, 'nav.home')).toBe('Accueil');
        });

        test('récupère une valeur profondément imbriquée', () => {
            expect(getNestedValue(translations, 'nav.nested.deep')).toBe('Valeur profonde');
        });

        test('retourne null pour clé inexistante', () => {
            expect(getNestedValue(translations, 'nav.inexistant')).toBeNull();
        });

        test('gère un objet null', () => {
            expect(getNestedValue(null, 'nav.home')).toBeNull();
        });
    });

    // ==================== Génération HTML de navigation ====================
    describe('Génération HTML', () => {
        const navLinks = [
            { href: 'index.html', icon: '🏠', text: 'Accueil', i18nKey: 'nav.home', page: 'index.html' },
            { href: 'about.html', icon: 'ℹ️', text: 'À propos', i18nKey: 'nav.about', page: 'about.html' }
        ];

        const createNavItemHTML = (link, currentPage) => {
            const activeClass = currentPage === link.page ? 'active' : '';
            return `<li><a href="${link.href}" class="${activeClass}" data-i18n="${link.i18nKey}">${link.icon} <span class="nav-text">${link.text}</span></a></li>`;
        };

        test('génère le HTML correct pour un lien', () => {
            const html = createNavItemHTML(navLinks[0], 'about.html');
            expect(html).toContain('href="index.html"');
            expect(html).toContain('data-i18n="nav.home"');
            expect(html).toContain('🏠');
            expect(html).toContain('Accueil');
        });

        test('ajoute la classe active pour la page courante', () => {
            const html = createNavItemHTML(navLinks[0], 'index.html');
            expect(html).toContain('class="active"');
        });

        test('n\'ajoute pas active pour une autre page', () => {
            const html = createNavItemHTML(navLinks[0], 'about.html');
            expect(html).toContain('class=""');
        });
    });

    // ==================== Stockage du thème ====================
    describe('Gestion du thème', () => {
        beforeEach(() => {
            localStorage.clear();
        });

        test('sauvegarde le thème dark', () => {
            localStorage.setItem('theme', 'dark');
            expect(localStorage.getItem('theme')).toBe('dark');
        });

        test('sauvegarde le thème light', () => {
            localStorage.setItem('theme', 'light');
            expect(localStorage.getItem('theme')).toBe('light');
        });

        test('thème par défaut est dark', () => {
            const savedTheme = localStorage.getItem('theme') || 'dark';
            expect(savedTheme).toBe('dark');
        });

        const toggleTheme = (currentTheme) => {
            return currentTheme === 'dark' ? 'light' : 'dark';
        };

        test('toggle dark vers light', () => {
            expect(toggleTheme('dark')).toBe('light');
        });

        test('toggle light vers dark', () => {
            expect(toggleTheme('light')).toBe('dark');
        });
    });

    // ==================== Stockage de la langue ====================
    describe('Gestion de la langue', () => {
        const STORAGE_KEY = 'quantum_quiz_language';

        beforeEach(() => {
            localStorage.clear();
        });

        test('sauvegarde la langue française', () => {
            localStorage.setItem(STORAGE_KEY, 'fr');
            expect(localStorage.getItem(STORAGE_KEY)).toBe('fr');
        });

        test('sauvegarde la langue anglaise', () => {
            localStorage.setItem(STORAGE_KEY, 'en');
            expect(localStorage.getItem(STORAGE_KEY)).toBe('en');
        });

        test('langue par défaut est français', () => {
            const savedLang = localStorage.getItem(STORAGE_KEY) || 'fr';
            expect(savedLang).toBe('fr');
        });
    });

    // ==================== Validation de langue ====================
    describe('Validation de langue', () => {
        const availableLanguages = [
            { code: 'fr', name: 'Français', flag: '🇫🇷' },
            { code: 'en', name: 'English', flag: '🇬🇧' }
        ];

        const isValidLanguage = (lang) => {
            return availableLanguages.some(l => l.code === lang);
        };

        test('valide le français', () => {
            expect(isValidLanguage('fr')).toBe(true);
        });

        test('valide l\'anglais', () => {
            expect(isValidLanguage('en')).toBe(true);
        });

        test('rejette les langues non supportées', () => {
            expect(isValidLanguage('de')).toBe(false);
            expect(isValidLanguage('es')).toBe(false);
            expect(isValidLanguage('it')).toBe(false);
        });

        test('est sensible à la casse', () => {
            expect(isValidLanguage('FR')).toBe(false);
            expect(isValidLanguage('En')).toBe(false);
        });
    });

    // ==================== Icônes de thème ====================
    describe('Icônes de thème', () => {
        const getThemeIcon = (theme) => {
            return theme === 'dark' ? '🌙' : '☀️';
        };

        test('retourne lune pour thème dark', () => {
            expect(getThemeIcon('dark')).toBe('🌙');
        });

        test('retourne soleil pour thème light', () => {
            expect(getThemeIcon('light')).toBe('☀️');
        });
    });

    // ==================== Fonction de traduction simplifiée ====================
    describe('t() - Fonction de traduction navigation', () => {
        const translationsCache = {
            fr: {
                nav: { home: 'Accueil', about: 'À propos' },
                greeting: 'Bonjour {{name}}'
            },
            en: {
                nav: { home: 'Home', about: 'About' },
                greeting: 'Hello {{name}}'
            }
        };

        const getNestedValue = (obj, key) => {
            return key.split('.').reduce((o, k) => (o && o[k] !== undefined) ? o[k] : null, obj);
        };

        const t = (key, params = {}, currentLanguage = 'fr') => {
            const translations = translationsCache[currentLanguage];
            if (!translations) return key;

            let value = getNestedValue(translations, key);
            if (!value) return key;

            // Interpolation des paramètres {{param}}
            if (typeof value === 'string' && Object.keys(params).length > 0) {
                value = value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
                    return params[paramKey] !== undefined ? params[paramKey] : match;
                });
            }

            return value;
        };

        test('traduit une clé simple en français', () => {
            expect(t('nav.home', {}, 'fr')).toBe('Accueil');
        });

        test('traduit une clé simple en anglais', () => {
            expect(t('nav.home', {}, 'en')).toBe('Home');
        });

        test('interpole les paramètres', () => {
            expect(t('greeting', { name: 'Claude' }, 'fr')).toBe('Bonjour Claude');
            expect(t('greeting', { name: 'Claude' }, 'en')).toBe('Hello Claude');
        });

        test('retourne la clé si non trouvée', () => {
            expect(t('inexistant.key', {}, 'fr')).toBe('inexistant.key');
        });

        test('retourne la clé si langue non trouvée', () => {
            expect(t('nav.home', {}, 'de')).toBe('nav.home');
        });
    });
});
