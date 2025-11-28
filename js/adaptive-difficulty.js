/**
 * QUANTUM QUIZ - MODULE DIFFICULTÉ ADAPTATIVE
 * Algorithme intelligent d'ajustement de difficulté
 * Basé sur les principes de l'Item Response Theory (IRT)
 * Université de Yaoundé I - PHY321
 */

const AdaptiveDifficulty = {
    // Configuration
    config: {
        // Taille de la fenêtre glissante pour évaluer la performance
        windowSize: 5,

        // Seuils de performance pour ajuster la difficulté
        thresholds: {
            increaseIfAbove: 0.8,  // Augmenter si > 80% correct
            decreaseIfBelow: 0.4   // Diminuer si < 40% correct
        },

        // Poids pour chaque niveau de difficulté (utilisé dans le calcul du score adaptatif)
        difficultyWeights: {
            easy: 1.0,
            medium: 1.5,
            hard: 2.0
        },

        // Probabilité de sélection par défaut pour chaque niveau
        defaultProbabilities: {
            easy: 0.33,
            medium: 0.34,
            hard: 0.33
        },

        // Facteur d'apprentissage (vitesse d'adaptation)
        learningRate: 0.15,

        // Estimation initiale du niveau de l'étudiant (0 à 1)
        initialAbility: 0.5
    },

    // État de l'adaptateur
    state: {
        // Historique des réponses récentes (fenêtre glissante)
        recentAnswers: [],

        // Niveau estimé de l'étudiant (theta dans IRT)
        estimatedAbility: 0.5,

        // Probabilités actuelles de sélection par difficulté
        selectionProbabilities: {
            easy: 0.33,
            medium: 0.34,
            hard: 0.33
        },

        // Performance par difficulté
        performanceByDifficulty: {
            easy: { correct: 0, total: 0 },
            medium: { correct: 0, total: 0 },
            hard: { correct: 0, total: 0 }
        },

        // Performance par chapitre
        performanceByChapter: {},

        // Mode adaptatif activé
        enabled: false
    },

    // Clé de stockage
    STORAGE_KEY: 'quantum_quiz_adaptive',

    /**
     * Initialisation du module
     */
    init() {
        this.loadState();
        console.log('🧠 Difficulté adaptative initialisée');
    },

    /**
     * Activer/désactiver le mode adaptatif
     */
    setEnabled(enabled) {
        this.state.enabled = enabled;
        this.saveState();
    },

    /**
     * Vérifier si le mode adaptatif est activé
     */
    isEnabled() {
        return this.state.enabled;
    },

    /**
     * Charger l'état depuis localStorage
     */
    loadState() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                this.state = { ...this.state, ...parsed };
            }
        } catch (err) {
            console.warn('AdaptiveDifficulty: Erreur chargement état', err);
        }
    },

    /**
     * Sauvegarder l'état
     */
    saveState() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
        } catch (err) {
            console.warn('AdaptiveDifficulty: Erreur sauvegarde', err);
        }
    },

    /**
     * Enregistrer une réponse et mettre à jour le modèle
     * @param {object} response - { questionId, difficulty, isCorrect, timeSpent, chapter }
     */
    recordAnswer(response) {
        const { difficulty, isCorrect, chapter } = response;

        // Ajouter à l'historique récent
        this.state.recentAnswers.push({
            difficulty,
            isCorrect,
            timestamp: Date.now()
        });

        // Garder seulement la fenêtre glissante
        if (this.state.recentAnswers.length > this.config.windowSize * 2) {
            this.state.recentAnswers = this.state.recentAnswers.slice(-this.config.windowSize * 2);
        }

        // Mettre à jour les statistiques par difficulté
        if (this.state.performanceByDifficulty[difficulty]) {
            this.state.performanceByDifficulty[difficulty].total++;
            if (isCorrect) {
                this.state.performanceByDifficulty[difficulty].correct++;
            }
        }

        // Mettre à jour les statistiques par chapitre
        if (chapter) {
            if (!this.state.performanceByChapter[chapter]) {
                this.state.performanceByChapter[chapter] = { correct: 0, total: 0 };
            }
            this.state.performanceByChapter[chapter].total++;
            if (isCorrect) {
                this.state.performanceByChapter[chapter].correct++;
            }
        }

        // Recalculer le niveau estimé
        this.updateAbilityEstimate();

        // Recalculer les probabilités de sélection
        this.updateSelectionProbabilities();

        this.saveState();
    },

    /**
     * Mettre à jour l'estimation du niveau de l'étudiant
     * Utilise une approche simplifiée de l'IRT
     */
    updateAbilityEstimate() {
        const recent = this.state.recentAnswers.slice(-this.config.windowSize);
        if (recent.length === 0) return;

        // Calculer le score pondéré par difficulté
        let weightedScore = 0;
        let totalWeight = 0;

        recent.forEach(answer => {
            const weight = this.config.difficultyWeights[answer.difficulty] || 1;
            totalWeight += weight;
            if (answer.isCorrect) {
                weightedScore += weight;
            }
        });

        const recentPerformance = totalWeight > 0 ? weightedScore / totalWeight : 0.5;

        // Mise à jour avec lissage exponentiel
        this.state.estimatedAbility =
            this.state.estimatedAbility * (1 - this.config.learningRate) +
            recentPerformance * this.config.learningRate;

        // Borner entre 0.1 et 0.9
        this.state.estimatedAbility = Math.max(0.1, Math.min(0.9, this.state.estimatedAbility));
    },

    /**
     * Mettre à jour les probabilités de sélection des difficultés
     */
    updateSelectionProbabilities() {
        const ability = this.state.estimatedAbility;
        const recent = this.state.recentAnswers.slice(-this.config.windowSize);

        if (recent.length < 3) {
            // Pas assez de données, utiliser les probabilités par défaut
            this.state.selectionProbabilities = { ...this.config.defaultProbabilities };
            return;
        }

        // Calculer le taux de réussite récent
        const correctCount = recent.filter(a => a.isCorrect).length;
        const successRate = correctCount / recent.length;

        let probabilities = { easy: 0, medium: 0, hard: 0 };

        if (successRate >= this.config.thresholds.increaseIfAbove) {
            // L'étudiant réussit bien, augmenter la difficulté
            probabilities = {
                easy: 0.1,
                medium: 0.3,
                hard: 0.6
            };
        } else if (successRate <= this.config.thresholds.decreaseIfBelow) {
            // L'étudiant a des difficultés, diminuer la difficulté
            probabilities = {
                easy: 0.6,
                medium: 0.3,
                hard: 0.1
            };
        } else {
            // Performance moyenne, distribution équilibrée basée sur le niveau estimé
            probabilities = {
                easy: Math.max(0.1, 0.4 - ability * 0.3),
                medium: 0.4,
                hard: Math.max(0.1, 0.2 + ability * 0.3)
            };
        }

        // Normaliser pour que la somme soit 1
        const sum = probabilities.easy + probabilities.medium + probabilities.hard;
        probabilities.easy /= sum;
        probabilities.medium /= sum;
        probabilities.hard /= sum;

        this.state.selectionProbabilities = probabilities;
    },

    /**
     * Sélectionner la difficulté pour la prochaine question
     * @returns {string} 'easy', 'medium', ou 'hard'
     */
    selectDifficulty() {
        if (!this.state.enabled) {
            // Mode non adaptatif: distribution uniforme
            const rand = Math.random();
            if (rand < 0.33) return 'easy';
            if (rand < 0.66) return 'medium';
            return 'hard';
        }

        const probs = this.state.selectionProbabilities;
        const rand = Math.random();

        if (rand < probs.easy) {
            return 'easy';
        } else if (rand < probs.easy + probs.medium) {
            return 'medium';
        } else {
            return 'hard';
        }
    },

    /**
     * Filtrer et trier les questions selon le mode adaptatif
     * @param {array} questions - Liste de questions disponibles
     * @param {number} count - Nombre de questions à sélectionner
     * @returns {array} Questions sélectionnées
     */
    selectQuestions(questions, count) {
        if (!this.state.enabled || questions.length <= count) {
            // Mode non adaptatif ou pas assez de questions
            return this.shuffleArray(questions).slice(0, count);
        }

        const selected = [];
        const availableByDifficulty = {
            easy: questions.filter(q => q.difficulty === 'easy'),
            medium: questions.filter(q => q.difficulty === 'medium'),
            hard: questions.filter(q => q.difficulty === 'hard')
        };

        // Mélanger chaque groupe
        Object.keys(availableByDifficulty).forEach(diff => {
            availableByDifficulty[diff] = this.shuffleArray(availableByDifficulty[diff]);
        });

        // Sélectionner les questions selon les probabilités
        for (let i = 0; i < count; i++) {
            const targetDifficulty = this.selectDifficulty();

            // Essayer d'abord la difficulté cible
            if (availableByDifficulty[targetDifficulty].length > 0) {
                selected.push(availableByDifficulty[targetDifficulty].shift());
            } else {
                // Fallback: prendre une question d'une autre difficulté
                const fallbackOrder = ['medium', 'easy', 'hard'];
                for (const diff of fallbackOrder) {
                    if (availableByDifficulty[diff].length > 0) {
                        selected.push(availableByDifficulty[diff].shift());
                        break;
                    }
                }
            }
        }

        // Mélanger l'ordre final
        return this.shuffleArray(selected);
    },

    /**
     * Obtenir les statistiques adaptatives
     */
    getStats() {
        const recent = this.state.recentAnswers.slice(-this.config.windowSize);
        const correctCount = recent.filter(a => a.isCorrect).length;

        return {
            enabled: this.state.enabled,
            estimatedAbility: Math.round(this.state.estimatedAbility * 100),
            recentSuccessRate: recent.length > 0 ? Math.round((correctCount / recent.length) * 100) : 0,
            selectionProbabilities: {
                easy: Math.round(this.state.selectionProbabilities.easy * 100),
                medium: Math.round(this.state.selectionProbabilities.medium * 100),
                hard: Math.round(this.state.selectionProbabilities.hard * 100)
            },
            performanceByDifficulty: Object.entries(this.state.performanceByDifficulty).reduce((acc, [diff, data]) => {
                acc[diff] = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                return acc;
            }, {}),
            totalAnswers: this.state.recentAnswers.length
        };
    },

    /**
     * Obtenir une recommandation de niveau pour l'étudiant
     */
    getRecommendation() {
        const ability = this.state.estimatedAbility;
        const stats = this.getStats();

        const recommendation = {
            level: 'medium',
            message: '',
            suggestion: ''
        };

        if (ability >= 0.7) {
            recommendation.level = 'advanced';
            recommendation.message = 'Excellent niveau ! Vous maîtrisez bien les concepts.';
            recommendation.suggestion = 'Essayez les questions difficiles pour vous challenger.';
        } else if (ability >= 0.5) {
            recommendation.level = 'intermediate';
            recommendation.message = 'Bon niveau ! Continuez à progresser.';
            recommendation.suggestion = 'Mélangez les difficultés pour consolider vos acquis.';
        } else if (ability >= 0.3) {
            recommendation.level = 'beginner';
            recommendation.message = 'Vous progressez ! Persévérez.';
            recommendation.suggestion = 'Concentrez-vous sur les questions faciles et moyennes.';
        } else {
            recommendation.level = 'review';
            recommendation.message = 'Des révisions seraient bénéfiques.';
            recommendation.suggestion = 'Relisez le cours et commencez par les questions faciles.';
        }

        return recommendation;
    },

    /**
     * Réinitialiser l'état adaptatif
     */
    reset() {
        this.state = {
            recentAnswers: [],
            estimatedAbility: this.config.initialAbility,
            selectionProbabilities: { ...this.config.defaultProbabilities },
            performanceByDifficulty: {
                easy: { correct: 0, total: 0 },
                medium: { correct: 0, total: 0 },
                hard: { correct: 0, total: 0 }
            },
            performanceByChapter: {},
            enabled: this.state.enabled
        };
        this.saveState();
        console.log('🧠 Difficulté adaptative réinitialisée');
    },

    /**
     * Mélanger un tableau (Fisher-Yates)
     */
    shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
};

// Initialisation automatique
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AdaptiveDifficulty.init());
} else {
    AdaptiveDifficulty.init();
}

// Export global
window.AdaptiveDifficulty = AdaptiveDifficulty;
