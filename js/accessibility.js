/**
 * QUANTUM QUIZ - Module d'Accessibilité
 * Gestion du contraste, taille de police et autres paramètres
 */

const Accessibility = {
    // Configuration par défaut
    defaults: {
        fontSize: 'medium', // small, medium, large, xlarge
        contrast: 'normal', // normal, high
        reducedMotion: false,
        dyslexiaFont: false
    },

    // État actuel
    settings: {},

    // Tailles de police
    fontSizes: {
        small: { base: '14px', scale: 0.875 },
        medium: { base: '16px', scale: 1 },
        large: { base: '18px', scale: 1.125 },
        xlarge: { base: '20px', scale: 1.25 }
    },

    /**
     * Initialisation
     */
    init() {
        this.loadSettings();
        this.applySettings();
        this.createAccessibilityPanel();
        this.setupKeyboardShortcuts();
        console.log('♿ Accessibilité initialisée');
    },

    /**
     * Charge les paramètres depuis localStorage
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem('accessibility_settings');
            if (saved) {
                this.settings = { ...this.defaults, ...JSON.parse(saved) };
            } else {
                this.settings = { ...this.defaults };
            }

            // Vérifier les préférences système
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                this.settings.reducedMotion = true;
            }
            if (window.matchMedia('(prefers-contrast: more)').matches) {
                this.settings.contrast = 'high';
            }
        } catch (e) {
            this.settings = { ...this.defaults };
        }
    },

    /**
     * Sauvegarde les paramètres
     */
    saveSettings() {
        try {
            localStorage.setItem('accessibility_settings', JSON.stringify(this.settings));
        } catch (e) {
            console.error('Erreur sauvegarde accessibilité:', e);
        }
    },

    /**
     * Applique les paramètres
     */
    applySettings() {
        const html = document.documentElement;

        // Taille de police
        const fontSize = this.fontSizes[this.settings.fontSize];
        html.style.setProperty('--base-font-size', fontSize.base);
        html.style.setProperty('--font-scale', fontSize.scale);
        html.setAttribute('data-font-size', this.settings.fontSize);

        // Contraste élevé
        html.setAttribute('data-contrast', this.settings.contrast);

        // Mouvement réduit
        if (this.settings.reducedMotion) {
            html.classList.add('reduced-motion');
        } else {
            html.classList.remove('reduced-motion');
        }

        // Police dyslexie
        if (this.settings.dyslexiaFont) {
            html.classList.add('dyslexia-font');
        } else {
            html.classList.remove('dyslexia-font');
        }
    },

    /**
     * Change la taille de police
     */
    setFontSize(size) {
        if (this.fontSizes[size]) {
            this.settings.fontSize = size;
            this.applySettings();
            this.saveSettings();
            this.updatePanelUI();
        }
    },

    /**
     * Change le contraste
     */
    setContrast(mode) {
        this.settings.contrast = mode;
        this.applySettings();
        this.saveSettings();
        this.updatePanelUI();
    },

    /**
     * Toggle mouvement réduit
     */
    toggleReducedMotion() {
        this.settings.reducedMotion = !this.settings.reducedMotion;
        this.applySettings();
        this.saveSettings();
        this.updatePanelUI();
    },

    /**
     * Toggle police dyslexie
     */
    toggleDyslexiaFont() {
        this.settings.dyslexiaFont = !this.settings.dyslexiaFont;
        this.applySettings();
        this.saveSettings();
        this.updatePanelUI();
    },

    /**
     * Réinitialise les paramètres
     */
    reset() {
        this.settings = { ...this.defaults };
        this.applySettings();
        this.saveSettings();
        this.updatePanelUI();
    },

    /**
     * Crée le panneau d'accessibilité
     */
    createAccessibilityPanel() {
        // Bouton flottant
        const button = document.createElement('button');
        button.id = 'accessibility-toggle';
        button.className = 'accessibility-toggle';
        button.innerHTML = '♿';
        button.setAttribute('aria-label', 'Paramètres d\'accessibilité');
        button.onclick = () => this.togglePanel();
        document.body.appendChild(button);

        // Panneau
        const panel = document.createElement('div');
        panel.id = 'accessibility-panel';
        panel.className = 'accessibility-panel hidden';
        panel.innerHTML = `
            <div class="a11y-header">
                <h3>♿ Accessibilité</h3>
                <button class="a11y-close" onclick="Accessibility.togglePanel()">×</button>
            </div>

            <div class="a11y-section">
                <label>Taille du texte</label>
                <div class="a11y-options font-size-options">
                    <button data-size="small" onclick="Accessibility.setFontSize('small')">A</button>
                    <button data-size="medium" onclick="Accessibility.setFontSize('medium')">A</button>
                    <button data-size="large" onclick="Accessibility.setFontSize('large')">A</button>
                    <button data-size="xlarge" onclick="Accessibility.setFontSize('xlarge')">A</button>
                </div>
            </div>

            <div class="a11y-section">
                <label>Contraste</label>
                <div class="a11y-options contrast-options">
                    <button data-contrast="normal" onclick="Accessibility.setContrast('normal')">Normal</button>
                    <button data-contrast="high" onclick="Accessibility.setContrast('high')">Élevé</button>
                </div>
            </div>

            <div class="a11y-section">
                <label class="a11y-toggle-label">
                    <input type="checkbox" id="reduced-motion" onchange="Accessibility.toggleReducedMotion()">
                    <span>Réduire les animations</span>
                </label>
            </div>

            <div class="a11y-section">
                <label class="a11y-toggle-label">
                    <input type="checkbox" id="dyslexia-font" onchange="Accessibility.toggleDyslexiaFont()">
                    <span>Police adaptée dyslexie</span>
                </label>
            </div>

            <div class="a11y-section">
                <button class="a11y-reset" onclick="Accessibility.reset()">
                    🔄 Réinitialiser
                </button>
            </div>

            <div class="a11y-shortcuts">
                <p>Raccourcis clavier:</p>
                <ul>
                    <li><kbd>Alt</kbd>+<kbd>+</kbd> Agrandir</li>
                    <li><kbd>Alt</kbd>+<kbd>-</kbd> Réduire</li>
                    <li><kbd>Alt</kbd>+<kbd>C</kbd> Contraste</li>
                </ul>
            </div>
        `;
        document.body.appendChild(panel);

        this.updatePanelUI();
    },

    /**
     * Met à jour l'UI du panneau
     */
    updatePanelUI() {
        // Taille de police
        document.querySelectorAll('.font-size-options button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.size === this.settings.fontSize);
        });

        // Contraste
        document.querySelectorAll('.contrast-options button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.contrast === this.settings.contrast);
        });

        // Checkboxes
        const reducedMotion = document.getElementById('reduced-motion');
        if (reducedMotion) reducedMotion.checked = this.settings.reducedMotion;

        const dyslexiaFont = document.getElementById('dyslexia-font');
        if (dyslexiaFont) dyslexiaFont.checked = this.settings.dyslexiaFont;
    },

    /**
     * Toggle le panneau
     */
    togglePanel() {
        const panel = document.getElementById('accessibility-panel');
        if (panel) {
            panel.classList.toggle('hidden');
        }
    },

    /**
     * Configure les raccourcis clavier
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Alt + raccourci
            if (e.altKey) {
                switch (e.key) {
                    case '+':
                    case '=':
                        e.preventDefault();
                        this.increaseFontSize();
                        break;
                    case '-':
                        e.preventDefault();
                        this.decreaseFontSize();
                        break;
                    case 'c':
                    case 'C':
                        e.preventDefault();
                        this.toggleContrast();
                        break;
                }
            }
        });
    },

    /**
     * Augmente la taille de police
     */
    increaseFontSize() {
        const sizes = Object.keys(this.fontSizes);
        const current = sizes.indexOf(this.settings.fontSize);
        if (current < sizes.length - 1) {
            this.setFontSize(sizes[current + 1]);
        }
    },

    /**
     * Diminue la taille de police
     */
    decreaseFontSize() {
        const sizes = Object.keys(this.fontSizes);
        const current = sizes.indexOf(this.settings.fontSize);
        if (current > 0) {
            this.setFontSize(sizes[current - 1]);
        }
    },

    /**
     * Toggle le contraste
     */
    toggleContrast() {
        this.setContrast(this.settings.contrast === 'normal' ? 'high' : 'normal');
    }
};

// CSS pour l'accessibilité
const accessibilityStyles = document.createElement('style');
accessibilityStyles.textContent = `
    /* Bouton d'accessibilité flottant */
    .accessibility-toggle {
        position: fixed;
        bottom: 20px;
        left: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--quantum-purple, #7c3aed);
        color: white;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        z-index: 9999;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        transition: all 0.3s;
    }

    .accessibility-toggle:hover {
        transform: scale(1.1);
        background: var(--quantum-cyan, #06b6d4);
    }

    /* Panneau d'accessibilité */
    .accessibility-panel {
        position: fixed;
        bottom: 80px;
        left: 20px;
        width: 300px;
        background: var(--bg-card, #1e293b);
        border-radius: 16px;
        border: 1px solid var(--border-primary, #334155);
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        z-index: 9999;
        padding: 1.5rem;
        transition: all 0.3s;
    }

    .accessibility-panel.hidden {
        opacity: 0;
        transform: translateY(20px);
        pointer-events: none;
    }

    .a11y-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--border-primary, #334155);
    }

    .a11y-header h3 {
        margin: 0;
        font-size: 1.1rem;
        color: var(--text-primary, #f8fafc);
    }

    .a11y-close {
        background: none;
        border: none;
        color: var(--text-muted, #94a3b8);
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    }

    .a11y-close:hover {
        color: var(--text-primary, #f8fafc);
    }

    .a11y-section {
        margin-bottom: 1.25rem;
    }

    .a11y-section > label {
        display: block;
        font-size: 0.9rem;
        color: var(--text-secondary, #cbd5e1);
        margin-bottom: 0.5rem;
    }

    .a11y-options {
        display: flex;
        gap: 0.5rem;
    }

    .a11y-options button {
        flex: 1;
        padding: 0.5rem;
        border: 1px solid var(--border-primary, #334155);
        background: var(--bg-secondary, #334155);
        color: var(--text-primary, #f8fafc);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
    }

    .a11y-options button:hover {
        border-color: var(--quantum-purple, #7c3aed);
    }

    .a11y-options button.active {
        background: var(--quantum-purple, #7c3aed);
        border-color: var(--quantum-purple, #7c3aed);
    }

    .font-size-options button:nth-child(1) { font-size: 0.75rem; }
    .font-size-options button:nth-child(2) { font-size: 0.9rem; }
    .font-size-options button:nth-child(3) { font-size: 1.1rem; }
    .font-size-options button:nth-child(4) { font-size: 1.3rem; }

    .a11y-toggle-label {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        cursor: pointer;
        color: var(--text-primary, #f8fafc);
    }

    .a11y-toggle-label input[type="checkbox"] {
        width: 20px;
        height: 20px;
        accent-color: var(--quantum-purple, #7c3aed);
    }

    .a11y-reset {
        width: 100%;
        padding: 0.75rem;
        background: var(--bg-secondary, #334155);
        border: 1px solid var(--border-primary, #334155);
        color: var(--text-secondary, #cbd5e1);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
    }

    .a11y-reset:hover {
        background: var(--bg-tertiary, #475569);
        color: var(--text-primary, #f8fafc);
    }

    .a11y-shortcuts {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid var(--border-primary, #334155);
        font-size: 0.8rem;
        color: var(--text-muted, #94a3b8);
    }

    .a11y-shortcuts p {
        margin: 0 0 0.5rem 0;
    }

    .a11y-shortcuts ul {
        margin: 0;
        padding-left: 1rem;
    }

    .a11y-shortcuts li {
        margin: 0.25rem 0;
    }

    .a11y-shortcuts kbd {
        background: var(--bg-tertiary, #475569);
        padding: 0.1rem 0.3rem;
        border-radius: 3px;
        font-family: monospace;
        font-size: 0.75rem;
    }

    /* Styles de contraste élevé */
    [data-contrast="high"] {
        --text-primary: #ffffff;
        --text-secondary: #e5e5e5;
        --text-muted: #cccccc;
        --bg-primary: #000000;
        --bg-secondary: #1a1a1a;
        --bg-card: #0d0d0d;
        --border-primary: #666666;
    }

    [data-contrast="high"] .accessibility-panel {
        border-width: 2px;
    }

    /* Mouvement réduit */
    .reduced-motion * {
        animation: none !important;
        transition: none !important;
    }

    /* Police dyslexie */
    .dyslexia-font {
        font-family: 'OpenDyslexic', 'Comic Sans MS', cursive, sans-serif !important;
        letter-spacing: 0.05em;
        word-spacing: 0.1em;
        line-height: 1.8 !important;
    }

    /* Adaptation de la taille de police globale */
    [data-font-size="small"] { font-size: 14px; }
    [data-font-size="medium"] { font-size: 16px; }
    [data-font-size="large"] { font-size: 18px; }
    [data-font-size="xlarge"] { font-size: 20px; }

    @media (max-width: 768px) {
        .accessibility-panel {
            left: 10px;
            right: 10px;
            width: auto;
        }

        .accessibility-toggle {
            bottom: 10px;
            left: 10px;
            width: 45px;
            height: 45px;
        }
    }
`;
document.head.appendChild(accessibilityStyles);

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => Accessibility.init());

// Export global
window.Accessibility = Accessibility;

console.log('✅ accessibility.js chargé');
