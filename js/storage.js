/**
 * Gestion du stockage local pour Quantum Quiz
 */

const StorageManager = {
    KEYS: {
        USER_STATS: 'quantum_quiz_user_stats',
        QUIZ_HISTORY: 'quantum_quiz_history',
        CURRENT_QUIZ: 'quantum_quiz_current',
        SETTINGS: 'quantum_quiz_settings'
    },

    // Initialise les statistiques utilisateur
    initUserStats() {
        const stats = storage.get(this.KEYS.USER_STATS);
        if (!stats) {
            const defaultStats = {
                totalQuizzes: 0,
                totalQuestions: 0,
                correctAnswers: 0,
                averageScore: 0,
                timeSpent: 0,
                byChapter: {},
                byDifficulty: { easy: 0, medium: 0, hard: 0 },
                lastActivity: new Date().toISOString()
            };
            storage.set(this.KEYS.USER_STATS, defaultStats);
            return defaultStats;
        }
        return stats;
    },

    // Récupère les statistiques
    getUserStats() {
        return storage.get(this.KEYS.USER_STATS) || this.initUserStats();
    },

    // Met à jour les statistiques après un quiz
    updateStats(quizResults) {
        const stats = this.getUserStats();

        stats.totalQuizzes++;
        stats.totalQuestions += quizResults.totalQuestions;
        stats.correctAnswers += quizResults.correctAnswers;
        stats.averageScore = Math.round((stats.correctAnswers / stats.totalQuestions) * 100);
        stats.timeSpent += quizResults.timeSpent || 0;
        stats.lastActivity = new Date().toISOString();

        // Statistiques par chapitre
        const chapterId = quizResults.chapterId || 'all';
        if (!stats.byChapter[chapterId]) {
            stats.byChapter[chapterId] = {
                quizzes: 0,
                questions: 0,
                correct: 0,
                score: 0
            };
        }
        stats.byChapter[chapterId].quizzes++;
        stats.byChapter[chapterId].questions += quizResults.totalQuestions;
        stats.byChapter[chapterId].correct += quizResults.correctAnswers;
        stats.byChapter[chapterId].score = Math.round(
            (stats.byChapter[chapterId].correct / stats.byChapter[chapterId].questions) * 100
        );

        storage.set(this.KEYS.USER_STATS, stats);
        return stats;
    },

    // Sauvegarde l'état actuel du quiz
    saveCurrentQuiz(quizState) {
        storage.set(this.KEYS.CURRENT_QUIZ, quizState);
    },

    // Récupère l'état du quiz en cours
    getCurrentQuiz() {
        return storage.get(this.KEYS.CURRENT_QUIZ);
    },

    // Supprime le quiz en cours
    clearCurrentQuiz() {
        storage.remove(this.KEYS.CURRENT_QUIZ);
    },

    // Ajoute un quiz à l'historique
    addToHistory(quizResults) {
        const history = storage.get(this.KEYS.QUIZ_HISTORY) || [];

        const entry = {
            id: generateId(),
            date: new Date().toISOString(),
            ...quizResults
        };

        history.unshift(entry);

        // Garde seulement les 50 derniers
        if (history.length > 50) {
            history.splice(50);
        }

        storage.set(this.KEYS.QUIZ_HISTORY, history);
        return entry;
    },

    // Récupère l'historique
    getHistory() {
        return storage.get(this.KEYS.QUIZ_HISTORY) || [];
    },

    // Alias pour compatibilité
    getQuizHistory() {
        return this.getHistory();
    },

    // Paramètres utilisateur
    getSettings() {
        return storage.get(this.KEYS.SETTINGS) || {
            theme: 'dark',
            soundEnabled: true,
            showTimer: true,
            showHints: true
        };
    },

    updateSettings(settings) {
        const current = this.getSettings();
        const updated = { ...current, ...settings };
        storage.set(this.KEYS.SETTINGS, updated);
        return updated;
    },

    // Réinitialise toutes les données
    resetAll() {
        Object.values(this.KEYS).forEach(key => storage.remove(key));
        return this.initUserStats();
    }
};

console.log('✅ storage.js chargé');
