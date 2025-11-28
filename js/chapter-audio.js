/**
 * QUANTUM QUIZ - Module Audio des Chapitres
 * Lecture des fichiers audio MP3 pré-générés
 * Voix: fr-FR-DeniseNeural (Microsoft Edge TTS)
 * Fallback: Web Speech API si MP3 indisponible
 */

const ChapterAudio = {
    // Élément audio actuel
    currentAudio: null,

    // Chapitre en cours de lecture
    currentChapter: null,

    // État de lecture
    isPlaying: false,

    // Mode de lecture actuel ('mp3' ou 'tts')
    currentMode: null,

    // Chemin vers les fichiers audio
    audioPath: 'assets/audio/chapters/',

    /**
     * Initialisation du module
     */
    init() {
        console.log('🎙️ Module ChapterAudio initialisé');

        // Vérifier si on est en mode file://
        if (window.location.protocol === 'file:') {
            console.warn('⚠️ Mode file:// détecté - les fichiers MP3 pourraient ne pas charger.');
            console.warn('💡 Utilisez un serveur local: python3 -m http.server 8000');
            this.forceUseTTS = true;
        }
    },

    // Forcer l'utilisation de TTS (si file://)
    forceUseTTS: false,

    /**
     * Joue l'audio d'un chapitre
     * @param {number} chapterNumber - Numéro du chapitre (1-6)
     */
    play(chapterNumber) {
        // Arrêter toute lecture en cours
        this.stop();

        // Marquer comme en cours
        this.isPlaying = true;
        this.currentChapter = chapterNumber;
        this.updateButtonState(chapterNumber, true);

        // Si on force TTS (mode file://), utiliser directement la synthèse vocale
        if (this.forceUseTTS) {
            console.log('🎙️ Mode file:// - utilisation directe de la synthèse vocale');
            this.currentMode = 'tts';
            this.playWithSpeechSynthesis(chapterNumber);
            return;
        }

        // Essayer de charger le fichier MP3
        const audioFile = `${this.audioPath}chapter_${chapterNumber}.mp3`;
        console.log(`🔍 Tentative de chargement: ${audioFile}`);

        this.currentAudio = new Audio(audioFile);
        this.currentMode = 'mp3';

        // Timeout pour fallback si le fichier ne charge pas
        const fallbackTimeout = setTimeout(() => {
            if (this.currentMode === 'mp3' && this.currentAudio && this.currentAudio.readyState < 2) {
                console.warn('⏱️ Timeout chargement MP3, fallback vers TTS');
                this.switchToTTS(chapterNumber);
            }
        }, 3000);

        // Quand le fichier est prêt à jouer
        this.currentAudio.addEventListener('canplay', () => {
            clearTimeout(fallbackTimeout);
            console.log(`✅ MP3 prêt: ${audioFile}`);

            if (this.isPlaying && this.currentMode === 'mp3') {
                this.currentAudio.play().catch(err => {
                    console.warn('❌ Erreur lecture MP3:', err);
                    this.switchToTTS(chapterNumber);
                });
            }
        }, { once: true });

        // Quand la lecture se termine
        this.currentAudio.addEventListener('ended', () => {
            console.log(`✅ Fin lecture chapitre ${chapterNumber}`);
            this.isPlaying = false;
            this.currentChapter = null;
            this.currentMode = null;
            this.updateButtonState(chapterNumber, false);
        });

        // En cas d'erreur de chargement
        this.currentAudio.addEventListener('error', (e) => {
            clearTimeout(fallbackTimeout);
            console.warn(`❌ Erreur chargement MP3:`, e);
            this.switchToTTS(chapterNumber);
        }, { once: true });

        // Démarrer le chargement
        this.currentAudio.load();
    },

    /**
     * Bascule vers la synthèse vocale
     * @param {number} chapterNumber - Numéro du chapitre
     */
    switchToTTS(chapterNumber) {
        // Nettoyer l'audio MP3
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.src = '';
            this.currentAudio = null;
        }

        // Si on n'est plus en mode lecture, ne pas démarrer TTS
        if (!this.isPlaying || this.currentChapter !== chapterNumber) {
            return;
        }

        this.currentMode = 'tts';
        this.playWithSpeechSynthesis(chapterNumber);
    },

    /**
     * Utilise la synthèse vocale du navigateur
     * @param {number} chapterNumber - Numéro du chapitre
     */
    playWithSpeechSynthesis(chapterNumber) {
        if (!('speechSynthesis' in window)) {
            console.warn('❌ Synthèse vocale non supportée');
            this.stop();
            return;
        }

        console.log(`🎙️ Démarrage synthèse vocale pour chapitre ${chapterNumber}`);

        const descriptions = {
            1: `Bienvenue dans le chapitre sur les États Quantiques ! Nous explorerons la dualité onde-corpuscule, la superposition d'états, les qubits, et la sphère de Bloch. Nous parlerons du chat de Schrödinger et de la décohérence. Ce chapitre pose les bases de votre voyage quantique.`,
            2: `Bienvenue dans le chapitre sur la Mesure et les Opérateurs ! Vous apprendrez les opérateurs hermitiens, les observables physiques, les matrices de Pauli, et le principe d'incertitude de Heisenberg. L'expérience de Stern-Gerlach illustrera ces concepts.`,
            3: `Bienvenue dans le chapitre sur la Dynamique Quantique ! Découvrez les cinq postulats fondamentaux et l'équation de Schrödinger. Nous étudierons l'hamiltonien, l'évolution temporelle, et la règle de Born.`,
            4: `Bienvenue dans le chapitre sur l'Intrication quantique ! Explorez le produit tensoriel, les états de Bell, le paradoxe E.P.R., et la téléportation quantique. Ce chapitre ouvre la porte aux technologies quantiques du futur.`,
            5: `Bienvenue dans le chapitre sur la Fonction d'État ! Nous passerons à l'espace continu avec les fonctions d'onde, les paquets d'ondes, et la transformée de Fourier.`,
            6: `Bienvenue dans le dernier chapitre sur l'Oscillateur Harmonique Quantique ! Découvrez les opérateurs de création et d'annihilation, les états cohérents et leurs applications. Félicitations pour ce voyage dans le monde quantique !`
        };

        const text = descriptions[chapterNumber] || `Chapitre ${chapterNumber}`;
        const utterance = new SpeechSynthesisUtterance(text);

        // Chercher une voix française
        const voices = speechSynthesis.getVoices();
        const frenchVoice = voices.find(v => v.lang.startsWith('fr'));
        if (frenchVoice) {
            utterance.voice = frenchVoice;
        }

        utterance.rate = 0.9;
        utterance.pitch = 1.1;

        utterance.onend = () => {
            this.isPlaying = false;
            this.currentChapter = null;
            this.currentMode = null;
            this.updateButtonState(chapterNumber, false);
        };

        utterance.onerror = () => {
            this.stop();
        };

        speechSynthesis.speak(utterance);
    },

    /**
     * Arrête toute lecture en cours
     */
    stop() {
        console.log('⏹️ Arrêt de la lecture');

        // Arrêter l'audio MP3
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.src = '';
            this.currentAudio = null;
        }

        // Arrêter la synthèse vocale
        if ('speechSynthesis' in window && speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }

        // Mettre à jour l'UI
        if (this.currentChapter) {
            this.updateButtonState(this.currentChapter, false);
        }

        this.isPlaying = false;
        this.currentChapter = null;
        this.currentMode = null;
    },

    /**
     * Bascule lecture/arrêt
     * @param {number} chapterNumber - Numéro du chapitre
     */
    toggle(chapterNumber) {
        console.log(`🔘 Toggle chapitre ${chapterNumber} (isPlaying: ${this.isPlaying}, currentChapter: ${this.currentChapter})`);

        if (this.isPlaying && this.currentChapter === chapterNumber) {
            this.stop();
        } else {
            this.play(chapterNumber);
        }
    },

    /**
     * Met à jour l'apparence du bouton
     * @param {number} chapterNumber - Numéro du chapitre
     * @param {boolean} isPlaying - État de lecture
     */
    updateButtonState(chapterNumber, isPlaying) {
        const btn = document.querySelector(`[data-chapter-audio="${chapterNumber}"]`);
        if (btn) {
            btn.classList.toggle('playing', isPlaying);
            const icon = btn.querySelector('.audio-icon');
            if (icon) {
                icon.textContent = isPlaying ? '⏹️' : '🔊';
            }
            btn.title = isPlaying ? 'Arrêter la lecture' : 'Écouter le résumé du chapitre';
        }
    }
};

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => ChapterAudio.init());

// Export global
window.ChapterAudio = ChapterAudio;

console.log('✅ chapter-audio.js chargé');
