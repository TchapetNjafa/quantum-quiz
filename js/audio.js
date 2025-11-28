/**
 * Système audio pour les effets sonores du quiz
 * Utilise l'API Web Audio pour générer des sons
 */

const AudioSystem = {
    context: null,
    enabled: true,

    // Initialise le contexte audio
    init() {
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            const savedPref = localStorage.getItem('audio_enabled');
            this.enabled = savedPref !== null ? savedPref === 'true' : true;
            console.log('✅ Système audio initialisé');
        } catch (error) {
            console.warn('Audio non supporté:', error);
            this.enabled = false;
        }
    },

    // Active/désactive le son
    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('audio_enabled', this.enabled.toString());
        return this.enabled;
    },

    // Reprend le contexte audio si suspendu (autoplay policy)
    async resumeContext() {
        if (this.context && this.context.state === 'suspended') {
            try {
                await this.context.resume();
                console.log('✅ Contexte audio repris');
            } catch (error) {
                console.warn('Erreur lors de la reprise du contexte audio:', error);
            }
        }
    },

    // Joue un son (fréquence, durée, type)
    async play(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.enabled || !this.context) return;

        // Reprendre le contexte si nécessaire (autoplay policy)
        await this.resumeContext();

        try {
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.context.destination);

            oscillator.type = type;
            oscillator.frequency.value = frequency;

            gainNode.gain.setValueAtTime(volume, this.context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

            oscillator.start(this.context.currentTime);
            oscillator.stop(this.context.currentTime + duration);
        } catch (error) {
            console.warn('Erreur lors de la lecture du son:', error);
        }
    },

    // Son de réponse correcte
    correct() {
        if (!this.enabled || !this.context) return;

        // Mélodie ascendante joyeuse (do-mi-sol)
        this.play(523.25, 0.1, 'sine', 0.2);  // Do
        setTimeout(() => this.play(659.25, 0.1, 'sine', 0.2), 100);  // Mi
        setTimeout(() => this.play(783.99, 0.15, 'sine', 0.2), 200); // Sol
    },

    // Son de réponse incorrecte
    incorrect() {
        if (!this.enabled || !this.context) return;

        // Bip descendant
        this.play(300, 0.15, 'square', 0.15);
        setTimeout(() => this.play(200, 0.2, 'square', 0.15), 150);
    },

    // Son de clic/sélection
    click() {
        if (!this.enabled || !this.context) return;
        this.play(800, 0.05, 'sine', 0.1);
    },

    // Son de navigation
    navigate() {
        if (!this.enabled || !this.context) return;
        this.play(600, 0.08, 'sine', 0.15);
    },

    // Son de début de quiz
    start() {
        if (!this.enabled || !this.context) return;

        // Fanfare de début
        this.play(392, 0.1, 'sine', 0.2);  // Sol
        setTimeout(() => this.play(523.25, 0.1, 'sine', 0.2), 100);  // Do
        setTimeout(() => this.play(659.25, 0.15, 'sine', 0.2), 200); // Mi
        setTimeout(() => this.play(783.99, 0.2, 'sine', 0.25), 300); // Sol
    },

    // Son de fin de quiz (succès)
    success() {
        if (!this.enabled || !this.context) return;

        // Mélodie de victoire
        this.play(523.25, 0.15, 'sine', 0.2);  // Do
        setTimeout(() => this.play(659.25, 0.15, 'sine', 0.2), 150);  // Mi
        setTimeout(() => this.play(783.99, 0.15, 'sine', 0.2), 300);  // Sol
        setTimeout(() => this.play(1046.50, 0.3, 'sine', 0.25), 450); // Do aigu
    },

    // Son d'avertissement
    warning() {
        if (!this.enabled || !this.context) return;
        this.play(440, 0.1, 'triangle', 0.2);
        setTimeout(() => this.play(440, 0.1, 'triangle', 0.2), 150);
    },

    // Son de tick (chronomètre)
    tick() {
        if (!this.enabled || !this.context) return;
        this.play(1000, 0.02, 'sine', 0.05);
    },

    // Son d'erreur système
    error() {
        if (!this.enabled || !this.context) return;
        this.play(200, 0.3, 'sawtooth', 0.2);
    },

    // Son de notification
    notify() {
        if (!this.enabled || !this.context) return;
        this.play(880, 0.1, 'sine', 0.15);
        setTimeout(() => this.play(1046.50, 0.15, 'sine', 0.15), 120);
    }
};

// Initialise au chargement
if (typeof window !== 'undefined') {
    // Initialiser immédiatement si DOM déjà prêt, sinon attendre
    const initAudio = () => {
        if (!AudioSystem.context) {
            AudioSystem.init();
        }
    };

    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', initAudio);
    } else {
        initAudio();
    }

    // Reprendre le contexte audio lors de la première interaction utilisateur
    const resumeOnInteraction = async () => {
        // S'assurer que le contexte est initialisé
        if (!AudioSystem.context) {
            AudioSystem.init();
        }

        await AudioSystem.resumeContext();

        // Un petit son de test silencieux pour "débloquer" l'audio
        if (AudioSystem.context && AudioSystem.context.state === 'running') {
            console.log('✅ Audio débloqué par interaction utilisateur');
        }

        // Retirer les listeners après la première interaction réussie
        document.removeEventListener('click', resumeOnInteraction);
        document.removeEventListener('touchstart', resumeOnInteraction);
        document.removeEventListener('keydown', resumeOnInteraction);
    };

    document.addEventListener('click', resumeOnInteraction);
    document.addEventListener('touchstart', resumeOnInteraction);
    document.addEventListener('keydown', resumeOnInteraction);
}

console.log('✅ audio.js chargé');
