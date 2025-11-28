/**
 * QUANTUM QUIZ - Système de liaison Animations-Questions
 * Associe les animations interactives aux questions pertinentes
 */

const AnimationLinker = {
    // Mapping des animations par chapitre et par tags
    animations: {
        // Chapitre 1 : États Quantiques
        'bloch-sphere': {
            file: 'animation-bloch-sphere.html',
            title: 'Sphère de Bloch',
            icon: '🔮',
            chapter: 1,
            tags: ['qubit', 'état', 'superposition', 'bloch', 'spin', 'ket', 'bra'],
            description: 'Visualisez la représentation géométrique d\'un qubit'
        },

        // Chapitre 2 : Mesure et Opérateurs
        'stern-gerlach': {
            file: 'animation-stern-gerlach.html',
            title: 'Expérience de Stern-Gerlach',
            icon: '🧲',
            chapter: 2,
            tags: ['mesure', 'spin', 'stern-gerlach', 'opérateur', 'observable', 'eigenstate'],
            description: 'Observez la mesure du spin d\'une particule'
        },
        'measurement': {
            file: 'animation-measurement.html',
            title: 'Processus de Mesure',
            icon: '📏',
            chapter: 2,
            tags: ['mesure', 'collapse', 'effondrement', 'projection', 'probabilité'],
            description: 'Comprenez l\'effondrement de la fonction d\'onde'
        },

        // Chapitre 3 : Dynamique Quantique
        'rabi-oscillations': {
            file: 'animation-rabi-oscillations.html',
            title: 'Oscillations de Rabi',
            icon: '📡',
            chapter: 3,
            tags: ['rabi', 'oscillation', 'évolution', 'hamiltonien', 'champ', 'résonance'],
            description: 'Observez les oscillations entre états quantiques'
        },
        'time-evolution': {
            file: 'animation-time-evolution.html',
            title: 'Évolution Temporelle',
            icon: '⏱️',
            chapter: 3,
            tags: ['évolution', 'temps', 'schrödinger', 'hamiltonien', 'unitaire', 'dynamique'],
            description: 'Visualisez l\'évolution d\'un état quantique dans le temps'
        },

        // Chapitre 4 : Intrication
        'entanglement': {
            file: 'animation-entanglement.html',
            title: 'Intrication Quantique',
            icon: '🔗',
            chapter: 4,
            tags: ['intrication', 'bell', 'epr', 'corrélation', 'non-local', 'entanglement', 'paire'],
            description: 'Explorez les corrélations quantiques non-locales'
        },
        'teleportation': {
            file: 'animation-teleportation.html',
            title: 'Téléportation Quantique',
            icon: '✨',
            chapter: 4,
            tags: ['téléportation', 'intrication', 'bell', 'protocole', 'information'],
            description: 'Découvrez le protocole de téléportation quantique'
        },

        // Chapitre 5 : Fonction d'État et Espace Continu
        'wave-packet': {
            file: 'animation-wave-packet.html',
            title: 'Paquet d\'Ondes',
            icon: '🌊',
            chapter: 5,
            tags: ['onde', 'paquet', 'dispersion', 'groupe', 'phase', 'vitesse'],
            description: 'Observez la propagation et dispersion d\'un paquet d\'ondes'
        },
        'fourier-transform': {
            file: 'animation-fourier-transform.html',
            title: 'Transformée de Fourier',
            icon: '📊',
            chapter: 5,
            tags: ['fourier', 'impulsion', 'position', 'momentum', 'espace', 'dual'],
            description: 'Visualisez la relation position-impulsion'
        },
        'young-interference': {
            file: 'animation-young-interference.html',
            title: 'Interférences de Young',
            icon: '🎯',
            chapter: 5,
            tags: ['interférence', 'young', 'fentes', 'diffraction', 'onde', 'particule'],
            description: 'Explorez la dualité onde-particule'
        },

        // Chapitre 6 : Oscillateur Harmonique
        'potential-well': {
            file: 'animation-potential-well.html',
            title: 'Puits de Potentiel',
            icon: '🕳️',
            chapter: 6,
            tags: ['puits', 'potentiel', 'confinement', 'énergie', 'niveau', 'quantification'],
            description: 'Étudiez les états liés dans un puits de potentiel'
        },
        'harmonic-oscillator': {
            file: 'animation-harmonic-oscillator.html',
            title: 'Oscillateur Harmonique',
            icon: '🎸',
            chapter: 6,
            tags: ['oscillateur', 'harmonique', 'création', 'annihilation', 'fock', 'nombre'],
            description: 'Visualisez les états de l\'oscillateur harmonique'
        },
        'tunneling': {
            file: 'animation-tunneling.html',
            title: 'Effet Tunnel',
            icon: '🚇',
            chapter: 6,
            tags: ['tunnel', 'barrière', 'transmission', 'réflexion', 'probabilité'],
            description: 'Observez la traversée d\'une barrière de potentiel'
        }
    },

    /**
     * Trouve les animations pertinentes pour une question
     * @param {Object} question - L'objet question
     * @returns {Array} Liste des animations pertinentes
     */
    findRelevantAnimations(question) {
        const relevant = [];
        const questionTags = question.tags || [];
        const questionText = (question.question || '').toLowerCase();
        const chapterId = question.chapter_id;

        for (const [key, anim] of Object.entries(this.animations)) {
            let score = 0;

            // Bonus si même chapitre
            if (anim.chapter === chapterId) {
                score += 2;
            }

            // Vérifier les tags correspondants
            for (const tag of anim.tags) {
                if (questionTags.some(qt => qt.toLowerCase().includes(tag) || tag.includes(qt.toLowerCase()))) {
                    score += 3;
                }
                // Vérifier aussi dans le texte de la question
                if (questionText.includes(tag)) {
                    score += 1;
                }
            }

            if (score > 0) {
                relevant.push({ ...anim, key, score });
            }
        }

        // Trier par score décroissant et limiter à 3
        return relevant.sort((a, b) => b.score - a.score).slice(0, 3);
    },

    /**
     * Retourne les animations pour un chapitre donné
     * @param {number} chapterId - ID du chapitre
     * @returns {Array} Liste des animations du chapitre
     */
    getAnimationsForChapter(chapterId) {
        return Object.entries(this.animations)
            .filter(([, anim]) => anim.chapter === chapterId)
            .map(([key, anim]) => ({ ...anim, key }));
    },

    /**
     * Génère le HTML pour afficher les animations liées
     * @param {Array} animations - Liste des animations
     * @returns {string} HTML des liens d'animation
     */
    generateAnimationLinks(animations) {
        if (!animations || animations.length === 0) return '';

        const links = animations.map(anim => `
            <a href="${anim.file}" class="animation-link" target="_blank" title="${anim.description}">
                <span class="anim-icon">${anim.icon}</span>
                <span class="anim-title">${anim.title}</span>
            </a>
        `).join('');

        return `
            <div class="related-animations">
                <div class="animations-header">
                    <span class="animations-icon">🎬</span>
                    <span class="animations-label">Animations liées</span>
                </div>
                <div class="animations-list">
                    ${links}
                </div>
            </div>
        `;
    },

    /**
     * Ajoute les animations liées à l'explication d'une question
     * @param {HTMLElement} container - Conteneur de l'explication
     * @param {Object} question - La question
     */
    appendToExplanation(container, question) {
        if (!container || !question) return;

        const animations = this.findRelevantAnimations(question);
        if (animations.length === 0) return;

        const html = this.generateAnimationLinks(animations);
        const wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        container.appendChild(wrapper.firstElementChild);
    }
};

// Initialisation
console.log('🎬 Animation Linker chargé -', Object.keys(AnimationLinker.animations).length, 'animations disponibles');
