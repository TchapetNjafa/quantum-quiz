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

    // Joue un son (fréquence, durée, type)
    play(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.enabled || !this.context) return;

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
    window.addEventListener('DOMContentLoaded', () => {
        AudioSystem.init();
    });
}

console.log('✅ audio.js chargé');
