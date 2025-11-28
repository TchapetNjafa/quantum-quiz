/**
 * NAVIGATION MODULE
 *
 * Génère automatiquement une barre de navigation cohérente pour toutes les pages
 * Inclut le support i18n pour la traduction multilingue
 */

(function() {
    'use strict';

    /**
     * Structure de la navigation avec clés i18n
     */
    const navLinks = [
        { href: 'index.html', icon: '🏠', text: 'Accueil', i18nKey: 'nav.home', page: 'index.html' },
        { href: 'profile.html', icon: '👤', text: 'Profil', i18nKey: 'nav.profile', page: 'profile.html' },
        { href: 'leaderboard.html', icon: '🏆', text: 'Classement', i18nKey: 'nav.leaderboard', page: 'leaderboard.html' },
        { href: 'challenges.html', icon: '⚔️', text: 'Défis', i18nKey: 'nav.challenges', page: 'challenges.html' },
        { href: 'exam-mode.html', icon: '🎓', text: 'Examen', i18nKey: 'nav.exam', page: 'exam-mode.html' },
        { href: 'videos.html', icon: '📺', text: 'Vidéos', i18nKey: 'nav.videos', page: 'videos.html' },
        { href: 'flashcards.html', icon: '🗂️', text: 'Flashcards', i18nKey: 'nav.flashcards', page: 'flashcards.html' },
        { href: 'glossary.html', icon: '📖', text: 'Glossaire', i18nKey: 'nav.glossary', page: 'glossary.html' },
        { href: 'animations-gallery.html', icon: '🎬', text: 'Animations', i18nKey: 'nav.animations', page: 'animations-gallery.html' },
        { href: 'about.html', icon: 'ℹ️', text: 'À propos', i18nKey: 'nav.about', page: 'about.html' }
    ];

    /**
     * Langues disponibles
     */
    const availableLanguages = [
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'en', name: 'English', flag: '🇬🇧' }
    ];

    /**
     * Langue actuelle
     */
    let currentLanguage = localStorage.getItem('quantum_quiz_language') || 'fr';

    /**
     * Détermine la page actuelle
     * @returns {string} Le nom du fichier de la page actuelle
     */
    function getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        return filename;
    }

    /**
     * Crée le HTML de la navigation
     * @returns {string} HTML de la navigation
     */
    function createNavigationHTML() {
        const currentPage = getCurrentPage();
        const currentLang = availableLanguages.find(l => l.code === currentLanguage) || availableLanguages[0];

        // Liens principaux (visibles sur desktop)
        const mainLinks = navLinks.slice(0, 5);
        // Liens secondaires (dans le menu "Plus")
        const moreLinks = navLinks.slice(5);

        const mainNavHTML = mainLinks.map(link => {
            const activeClass = currentPage === link.page ? 'active' : '';
            return `<li><a href="${link.href}" class="${activeClass}"><span class="nav-icon">${link.icon}</span><span class="nav-text" data-i18n="${link.i18nKey}">${link.text}</span></a></li>`;
        }).join('');

        const moreNavHTML = moreLinks.map(link => {
            const activeClass = currentPage === link.page ? 'active' : '';
            return `<li><a href="${link.href}" class="${activeClass}"><span class="nav-icon">${link.icon}</span><span class="nav-text" data-i18n="${link.i18nKey}">${link.text}</span></a></li>`;
        }).join('');

        const allNavHTML = navLinks.map(link => {
            const activeClass = currentPage === link.page ? 'active' : '';
            return `<li><a href="${link.href}" class="${activeClass}"><span class="nav-icon">${link.icon}</span><span class="nav-text" data-i18n="${link.i18nKey}">${link.text}</span></a></li>`;
        }).join('');

        const langOptionsHTML = availableLanguages.map(lang => {
            const activeClass = lang.code === currentLanguage ? 'active' : '';
            return `<li data-lang="${lang.code}" class="${activeClass}" role="option" aria-selected="${lang.code === currentLanguage}">
                <span class="lang-flag">${lang.flag}</span>
                <span class="lang-name">${lang.name}</span>
            </li>`;
        }).join('');

        return `
            <header class="main-header nav-responsive">
                <div class="nav-container">
                    <div class="nav-header-content">
                        <div class="logo-section">
                            <img src="assets/icons/UY1_Logo.png" alt="Logo UY1" class="logo">
                            <div class="title-group">
                                <h1 class="site-title" data-i18n="home.title">Quantum Quiz</h1>
                                <p class="course-code">PHY321 - UY1</p>
                            </div>
                        </div>

                        <nav class="main-nav desktop-nav">
                            <ul class="nav-list">
                                ${mainNavHTML}
                                <li class="nav-more-dropdown">
                                    <button class="nav-more-btn" aria-expanded="false">
                                        <span>Plus</span>
                                        <span class="more-arrow">▼</span>
                                    </button>
                                    <ul class="nav-more-menu">
                                        ${moreNavHTML}
                                    </ul>
                                </li>
                            </ul>
                        </nav>

                        <div class="nav-actions">
                            <div class="language-selector-nav">
                                <button class="language-btn-nav" aria-haspopup="listbox" aria-expanded="false" aria-label="Langue">
                                    <span class="lang-flag">${currentLang.flag}</span>
                                    <span class="lang-code">${currentLanguage.toUpperCase()}</span>
                                </button>
                                <ul class="language-dropdown-nav" role="listbox">
                                    ${langOptionsHTML}
                                </ul>
                            </div>
                            <button id="theme-toggle-nav" class="theme-toggle" aria-label="Thème">
                                <span class="icon">🌙</span>
                            </button>
                            <button class="mobile-menu-btn" aria-label="Menu" aria-expanded="false">
                                <span class="hamburger"></span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Menu mobile -->
                <div class="mobile-nav-overlay"></div>
                <nav class="mobile-nav">
                    <ul class="mobile-nav-list">
                        ${allNavHTML}
                    </ul>
                </nav>
            </header>
        `;
    }

    /**
     * Injecte la navigation dans la page
     */
    function injectNavigation() {
        // Vérifier si la page a déjà un header
        const existingHeader = document.querySelector('.main-header');
        if (existingHeader) {
            // Ne pas ajouter de navigation si elle existe déjà
            return;
        }

        // Ne pas injecter sur les pages de quiz (qui ont leur propre header)
        const quizHeader = document.querySelector('.quiz-header');
        if (quizHeader) {
            return;
        }

        // Créer le HTML de navigation
        const navHTML = createNavigationHTML();

        // Insérer au début du body
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = navHTML;
        const header = tempDiv.firstElementChild;

        document.body.insertBefore(header, document.body.firstChild);

        // Initialiser le toggle de thème
        initThemeToggle();

        // Initialiser le sélecteur de langue
        initLanguageSelector();

        // Initialiser le menu responsive
        initResponsiveMenu();

        // Charger et appliquer les traductions
        loadAndApplyTranslations(currentLanguage);
    }

    /**
     * Initialise le bouton de changement de thème
     */
    function initThemeToggle() {
        const toggleBtn = document.getElementById('theme-toggle-nav');
        if (!toggleBtn) return;

        const html = document.documentElement;
        const icon = toggleBtn.querySelector('.icon');

        // Charger le thème sauvegardé
        const savedTheme = localStorage.getItem('theme') || 'dark';
        html.setAttribute('data-theme', savedTheme);
        icon.textContent = savedTheme === 'dark' ? '🌙' : '☀️';

        // Gérer le clic
        toggleBtn.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            icon.textContent = newTheme === 'dark' ? '🌙' : '☀️';
        });
    }

    /**
     * Initialise le sélecteur de langue
     */
    function initLanguageSelector() {
        const btn = document.querySelector('.language-btn-nav');
        const dropdown = document.querySelector('.language-dropdown-nav');

        if (!btn || !dropdown) return;

        // Toggle dropdown
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isExpanded = btn.getAttribute('aria-expanded') === 'true';
            btn.setAttribute('aria-expanded', !isExpanded);
            dropdown.style.display = isExpanded ? 'none' : 'block';
        });

        // Sélection de langue
        dropdown.querySelectorAll('li').forEach(li => {
            li.addEventListener('click', async () => {
                const lang = li.dataset.lang;
                if (lang === currentLanguage) return;

                currentLanguage = lang;
                localStorage.setItem('quantum_quiz_language', lang);

                // Mettre à jour le bouton
                const langData = availableLanguages.find(l => l.code === lang);
                if (langData) {
                    btn.querySelector('.lang-flag').textContent = langData.flag;
                    btn.querySelector('.lang-code').textContent = lang.toUpperCase();
                }

                // Mettre à jour les états actifs
                dropdown.querySelectorAll('li').forEach(item => {
                    item.classList.toggle('active', item.dataset.lang === lang);
                    item.setAttribute('aria-selected', item.dataset.lang === lang);
                });

                // Fermer le dropdown
                dropdown.style.display = 'none';
                btn.setAttribute('aria-expanded', 'false');

                // Charger et appliquer les traductions
                await loadAndApplyTranslations(lang);

                // Émettre un événement
                window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
            });
        });

        // Fermer le dropdown en cliquant ailleurs
        document.addEventListener('click', () => {
            dropdown.style.display = 'none';
            btn.setAttribute('aria-expanded', 'false');
        });
    }

    /**
     * Cache des traductions
     */
    const translationsCache = {};

    /**
     * Charge et applique les traductions
     */
    async function loadAndApplyTranslations(lang) {
        try {
            // Charger les traductions si pas en cache
            if (!translationsCache[lang]) {
                const response = await fetch(`locales/${lang}.json`);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                // eslint-disable-next-line require-atomic-updates
                translationsCache[lang] = data;
            }

            const translations = translationsCache[lang];

            // Appliquer aux éléments avec data-i18n
            document.querySelectorAll('[data-i18n]').forEach(element => {
                const key = element.getAttribute('data-i18n');
                const value = getNestedValue(translations, key);
                if (value && typeof value === 'string') {
                    // Conserver les icônes emoji si présentes (pas les lettres accentuées)
                    // Regex pour détecter les emojis uniquement
                    const emojiRegex = /^([\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}]+\s*)/u;
                    const iconMatch = element.innerHTML.match(emojiRegex);
                    const icon = iconMatch ? iconMatch[0] : '';
                    if (element.querySelector('.nav-text')) {
                        element.querySelector('.nav-text').textContent = value;
                    } else if (icon && icon.trim()) {
                        element.innerHTML = icon + value;
                    } else {
                        element.textContent = value;
                    }
                }
            });

            // Appliquer aux placeholders
            document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
                const key = element.getAttribute('data-i18n-placeholder');
                const value = getNestedValue(translations, key);
                if (value) element.placeholder = value;
            });

            // Appliquer aux titles (tooltips)
            document.querySelectorAll('[data-i18n-title]').forEach(element => {
                const key = element.getAttribute('data-i18n-title');
                const value = getNestedValue(translations, key);
                if (value) element.title = value;
            });

            // Mettre à jour l'attribut lang de la page
            document.documentElement.lang = lang;

            console.log(`🌐 Langue changée: ${lang}`);
            return true;
        } catch (error) {
            console.warn(`Erreur chargement traductions ${lang}:`, error);
            return false;
        }
    }

    /**
     * Récupère une valeur imbriquée dans un objet
     */
    function getNestedValue(obj, key) {
        return key.split('.').reduce((o, k) => (o && o[k] !== undefined) ? o[k] : null, obj);
    }

    /**
     * Fonction globale de traduction
     */
    function t(key, params = {}) {
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
    }

    /**
     * Ajoute le CSS nécessaire pour la navigation
     */
    function injectNavigationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Navigation responsive container */
            .nav-responsive {
                background: var(--bg-card, #1e293b);
                border-bottom: 1px solid var(--border-primary, #334155);
                position: sticky;
                top: 0;
                z-index: 1000;
            }

            .nav-container {
                max-width: 1400px;
                margin: 0 auto;
                padding: 0 1rem;
            }

            .nav-header-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0.75rem 0;
                gap: 1rem;
            }

            .logo-section {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                flex-shrink: 0;
            }

            .logo-section .logo {
                width: 45px;
                height: 45px;
                object-fit: contain;
            }

            .title-group .site-title {
                font-size: 1.25rem;
                margin: 0;
                color: var(--text-primary, #f8fafc);
                font-weight: 700;
            }

            .title-group .course-code {
                font-size: 0.75rem;
                margin: 0;
                color: var(--text-muted, #94a3b8);
            }

            /* Desktop Navigation */
            .desktop-nav {
                flex: 1;
                display: flex;
                justify-content: center;
            }

            .nav-list {
                display: flex;
                align-items: center;
                gap: 0.25rem;
                list-style: none;
                margin: 0;
                padding: 0;
            }

            .nav-list > li > a {
                color: var(--text-primary, #f8fafc);
                text-decoration: none;
                padding: 0.5rem 0.75rem;
                border-radius: 8px;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                gap: 0.4rem;
                font-size: 0.9rem;
                white-space: nowrap;
            }

            .nav-list > li > a:hover {
                background: var(--bg-secondary, #334155);
            }

            .nav-list > li > a.active {
                background: var(--quantum-purple, #7c3aed);
                color: white;
                font-weight: 600;
            }

            .nav-list .nav-icon {
                font-size: 1.1rem;
            }

            .nav-list .nav-text {
                display: inline;
            }

            /* Dropdown "Plus" */
            .nav-more-dropdown {
                position: relative;
            }

            .nav-more-btn {
                background: var(--bg-secondary, #334155);
                border: 1px solid var(--border-primary, #475569);
                color: var(--text-primary, #f8fafc);
                padding: 0.5rem 0.75rem;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.4rem;
                font-size: 0.9rem;
                transition: all 0.3s;
            }

            .nav-more-btn:hover {
                background: var(--bg-tertiary, #475569);
            }

            .nav-more-btn .more-arrow {
                font-size: 0.7rem;
                transition: transform 0.3s;
            }

            .nav-more-btn[aria-expanded="true"] .more-arrow {
                transform: rotate(180deg);
            }

            .nav-more-menu {
                display: none;
                position: absolute;
                top: calc(100% + 0.5rem);
                right: 0;
                background: var(--bg-card, #1e293b);
                border: 1px solid var(--border-primary, #334155);
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                list-style: none;
                margin: 0;
                padding: 0.5rem;
                min-width: 180px;
                z-index: 1001;
            }

            .nav-more-menu.show {
                display: block;
                animation: dropdownFadeIn 0.2s ease;
            }

            @keyframes dropdownFadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .nav-more-menu li a {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.6rem 0.75rem;
                color: var(--text-primary, #f8fafc);
                text-decoration: none;
                border-radius: 8px;
                transition: background 0.2s;
                font-size: 0.9rem;
            }

            .nav-more-menu li a:hover {
                background: var(--bg-secondary, #334155);
            }

            .nav-more-menu li a.active {
                background: var(--quantum-purple, #7c3aed);
                color: white;
            }

            .nav-more-menu .nav-icon {
                font-size: 1.1rem;
            }

            /* Nav Actions (langue, thème, hamburger) */
            .nav-actions {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                flex-shrink: 0;
            }

            /* Sélecteur de langue */
            .language-selector-nav {
                position: relative;
            }

            .language-btn-nav {
                background: var(--bg-secondary, #334155);
                border: 1px solid var(--border-primary, #475569);
                color: var(--text-primary, #f8fafc);
                padding: 0.5rem 0.6rem;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.3rem;
                font-size: 0.9rem;
                transition: all 0.3s;
            }

            .language-btn-nav:hover {
                background: var(--bg-tertiary, #475569);
            }

            .language-dropdown-nav {
                display: none;
                position: absolute;
                top: calc(100% + 0.5rem);
                right: 0;
                background: var(--bg-card, #1e293b);
                border: 1px solid var(--border-primary, #334155);
                border-radius: 8px;
                list-style: none;
                padding: 0.5rem 0;
                min-width: 140px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 1001;
            }

            .language-dropdown-nav li {
                padding: 0.5rem 1rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                transition: background 0.2s;
                color: var(--text-primary, #f8fafc);
            }

            .language-dropdown-nav li:hover {
                background: var(--bg-secondary, #334155);
            }

            .language-dropdown-nav li.active {
                background: var(--quantum-purple, #7c3aed);
                color: white;
            }

            .language-dropdown-nav .lang-flag {
                font-size: 1.1rem;
            }

            .language-dropdown-nav .lang-name {
                font-size: 0.85rem;
            }

            /* Bouton thème */
            .theme-toggle {
                background: var(--bg-secondary, #334155);
                border: 1px solid var(--border-primary, #475569);
                color: var(--text-primary, #f8fafc);
                padding: 0.5rem;
                border-radius: 8px;
                cursor: pointer;
                font-size: 1.1rem;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 40px;
                height: 40px;
            }

            .theme-toggle:hover {
                background: var(--bg-tertiary, #475569);
            }

            /* Bouton hamburger mobile */
            .mobile-menu-btn {
                display: none;
                background: var(--bg-secondary, #334155);
                border: 1px solid var(--border-primary, #475569);
                padding: 0.5rem;
                border-radius: 8px;
                cursor: pointer;
                width: 40px;
                height: 40px;
                align-items: center;
                justify-content: center;
            }

            .hamburger {
                display: block;
                width: 20px;
                height: 2px;
                background: var(--text-primary, #f8fafc);
                position: relative;
                transition: background 0.3s;
            }

            .hamburger::before,
            .hamburger::after {
                content: '';
                position: absolute;
                left: 0;
                width: 100%;
                height: 2px;
                background: var(--text-primary, #f8fafc);
                transition: transform 0.3s;
            }

            .hamburger::before {
                top: -6px;
            }

            .hamburger::after {
                top: 6px;
            }

            .mobile-menu-btn[aria-expanded="true"] .hamburger {
                background: transparent;
            }

            .mobile-menu-btn[aria-expanded="true"] .hamburger::before {
                transform: rotate(45deg) translate(4px, 4px);
            }

            .mobile-menu-btn[aria-expanded="true"] .hamburger::after {
                transform: rotate(-45deg) translate(4px, -4px);
            }

            /* Overlay mobile */
            .mobile-nav-overlay {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 998;
                opacity: 0;
                transition: opacity 0.3s;
            }

            .mobile-nav-overlay.show {
                display: block;
                opacity: 1;
            }

            /* Menu mobile slide-in */
            .mobile-nav {
                display: none;
                position: fixed;
                top: 0;
                right: -300px;
                width: 280px;
                max-width: 85vw;
                height: 100vh;
                background: var(--bg-card, #1e293b);
                z-index: 999;
                padding: 1.5rem 1rem;
                padding-top: 5rem;
                overflow-y: auto;
                transition: right 0.3s ease;
                box-shadow: -5px 0 20px rgba(0, 0, 0, 0.3);
            }

            .mobile-nav.show {
                right: 0;
            }

            .mobile-nav-list {
                list-style: none;
                margin: 0;
                padding: 0;
            }

            .mobile-nav-list li {
                margin-bottom: 0.25rem;
            }

            .mobile-nav-list li a {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.75rem 1rem;
                color: var(--text-primary, #f8fafc);
                text-decoration: none;
                border-radius: 10px;
                transition: background 0.2s;
                font-size: 1rem;
            }

            .mobile-nav-list li a:hover {
                background: var(--bg-secondary, #334155);
            }

            .mobile-nav-list li a.active {
                background: var(--quantum-purple, #7c3aed);
                color: white;
            }

            .mobile-nav-list .nav-icon {
                font-size: 1.2rem;
                width: 1.5rem;
                text-align: center;
            }

            /* Responsive breakpoints */
            @media (max-width: 1200px) {
                .nav-list > li > a {
                    padding: 0.5rem 0.5rem;
                    font-size: 0.85rem;
                }

                .nav-list .nav-text {
                    display: none;
                }

                .nav-more-btn {
                    padding: 0.5rem 0.6rem;
                    font-size: 0.85rem;
                }
            }

            @media (max-width: 900px) {
                .desktop-nav {
                    display: none;
                }

                .mobile-menu-btn {
                    display: flex;
                }

                .mobile-nav {
                    display: block;
                }

                .title-group .site-title {
                    font-size: 1.1rem;
                }

                .title-group .course-code {
                    font-size: 0.7rem;
                }
            }

            @media (max-width: 480px) {
                .nav-header-content {
                    padding: 0.5rem 0;
                }

                .logo-section .logo {
                    width: 35px;
                    height: 35px;
                }

                .title-group .site-title {
                    font-size: 1rem;
                }

                .language-btn-nav .lang-code {
                    display: none;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Initialise les interactions du menu responsive
     */
    function initResponsiveMenu() {
        // Dropdown "Plus"
        const moreBtn = document.querySelector('.nav-more-btn');
        const moreMenu = document.querySelector('.nav-more-menu');

        if (moreBtn && moreMenu) {
            moreBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isExpanded = moreBtn.getAttribute('aria-expanded') === 'true';
                moreBtn.setAttribute('aria-expanded', !isExpanded);
                moreMenu.classList.toggle('show');
            });
        }

        // Menu mobile
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const mobileNav = document.querySelector('.mobile-nav');
        const overlay = document.querySelector('.mobile-nav-overlay');

        if (mobileMenuBtn && mobileNav && overlay) {
            mobileMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
                mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
                mobileNav.classList.toggle('show');
                overlay.classList.toggle('show');
                document.body.style.overflow = isExpanded ? '' : 'hidden';
            });

            overlay.addEventListener('click', () => {
                closeMobileMenu();
            });

            // Fermer le menu mobile quand on clique sur un lien
            mobileNav.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    closeMobileMenu();
                });
            });
        }

        // Fermer les menus en cliquant ailleurs
        document.addEventListener('click', () => {
            // Fermer dropdown "Plus"
            if (moreBtn && moreMenu) {
                moreBtn.setAttribute('aria-expanded', 'false');
                moreMenu.classList.remove('show');
            }
        });

        function closeMobileMenu() {
            if (mobileMenuBtn && mobileNav && overlay) {
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                mobileNav.classList.remove('show');
                overlay.classList.remove('show');
                document.body.style.overflow = '';
            }
        }
    }

    /**
     * Initialisation
     */
    function init() {
        injectNavigationStyles();

        // Ne pas toucher aux pages de quiz
        const quizHeader = document.querySelector('.quiz-header');
        if (quizHeader) {
            // Page de quiz - ne pas modifier la navigation
            return;
        }

        // Vérifier si la page a déjà un header
        const existingHeader = document.querySelector('.main-header');
        if (existingHeader) {
            // Ajouter le sélecteur de langue au header existant
            initLanguageSelectorOnExistingHeader();
        } else {
            // Injecter la navigation complète
            injectNavigation();
        }
    }

    // Toujours attendre que le DOM soit prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else if (document.readyState === 'interactive') {
        // DOM parsé mais ressources en cours de chargement
        setTimeout(init, 0);
    } else {
        // DOM complètement chargé
        init();
    }

    /**
     * Initialise le sélecteur de langue sur les pages avec header existant
     */
    function initLanguageSelectorOnExistingHeader() {
        const existingNav = document.querySelector('.main-nav ul');
        if (!existingNav) return;

        // Vérifier si le sélecteur existe déjà
        if (document.querySelector('.language-selector-nav')) return;

        const currentLang = availableLanguages.find(l => l.code === currentLanguage) || availableLanguages[0];

        const langOptionsHTML = availableLanguages.map(lang => {
            const activeClass = lang.code === currentLanguage ? 'active' : '';
            return `<li data-lang="${lang.code}" class="${activeClass}" role="option" aria-selected="${lang.code === currentLanguage}">
                <span class="lang-flag">${lang.flag}</span>
                <span class="lang-name">${lang.name}</span>
            </li>`;
        }).join('');

        // Créer le conteneur du sélecteur
        const langSelectorLi = document.createElement('li');
        langSelectorLi.className = 'nav-actions';
        langSelectorLi.style.cssText = 'display: flex; gap: 0.5rem; align-items: center;';
        langSelectorLi.innerHTML = `
            <div class="language-selector-nav" style="position: relative;">
                <button class="language-btn-nav" aria-haspopup="listbox" aria-expanded="false" aria-label="Changer la langue" style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.5rem 0.8rem; cursor: pointer; font-size: 1rem; transition: all 0.3s; display: flex; align-items: center; gap: 0.3rem;">
                    <span class="lang-flag">${currentLang.flag}</span>
                    <span class="lang-code">${currentLanguage.toUpperCase()}</span>
                </button>
                <ul class="language-dropdown-nav" role="listbox" style="display: none; position: absolute; top: 100%; right: 0; margin-top: 0.5rem; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; list-style: none; padding: 0.5rem 0; min-width: 150px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); z-index: 1001;">
                    ${langOptionsHTML}
                </ul>
            </div>
        `;

        // Insérer avant le bouton de thème s'il existe
        const themeToggle = existingNav.querySelector('#theme-toggle, .theme-toggle')?.closest('li');
        if (themeToggle) {
            themeToggle.insertAdjacentElement('beforebegin', langSelectorLi);
        } else {
            existingNav.appendChild(langSelectorLi);
        }

        // Initialiser les événements
        initLanguageSelector();

        // Charger et appliquer les traductions
        loadAndApplyTranslations(currentLanguage);
    }

    // Exporter pour usage externe
    window.Navigation = {
        inject: injectNavigation,
        getCurrentPage: getCurrentPage,
        t: t,
        setLanguage: async (lang) => {
            if (availableLanguages.find(l => l.code === lang)) {
                currentLanguage = lang;
                localStorage.setItem('quantum_quiz_language', lang);
                await loadAndApplyTranslations(lang);
                window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
            }
        },
        getCurrentLanguage: () => currentLanguage,
        loadTranslations: loadAndApplyTranslations,
        initOnExistingHeader: initLanguageSelectorOnExistingHeader
    };

    // Alias global pour faciliter l'utilisation
    window.t = t;

})();
