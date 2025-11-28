/**
 * QUANTUM QUIZ - MODULE ANALYTICS
 * Suivi des statistiques d'utilisation et de performance
 * Université de Yaoundé I - PHY321
 */

const Analytics = {
    // Clé de stockage
    STORAGE_KEY: 'quantum_quiz_analytics',

    // Données collectées
    data: {
        sessions: [],
        pageViews: {},
        quizStats: {
            totalStarted: 0,
            totalCompleted: 0,
            totalAbandoned: 0,
            averageScore: 0,
            averageTime: 0,
            byChapter: {},
            byDifficulty: {},
            byQuestionType: {}
        },
        questionStats: {},
        userBehavior: {
            avgTimePerQuestion: 0,
            hintUsage: 0,
            skipRate: 0
        },
        errors: []
    },

    // Session actuelle
    currentSession: null,

    /**
     * Initialisation du module Analytics
     */
    init() {
        this.loadData();
        this.startSession();
        this.trackPageView();
        this.setupEventListeners();

        console.log('📊 Analytics initialisé');
    },

    /**
     * Charger les données depuis localStorage
     */
    loadData() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                this.data = { ...this.data, ...parsed };
            }
        } catch (err) {
            console.warn('Analytics: Erreur chargement données', err);
        }
    },

    /**
     * Sauvegarder les données
     */
    saveData() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
        } catch (err) {
            console.warn('Analytics: Erreur sauvegarde', err);
        }
    },

    /**
     * Démarrer une nouvelle session
     */
    startSession() {
        this.currentSession = {
            id: this.generateId(),
            startTime: Date.now(),
            endTime: null,
            pages: [],
            events: [],
            quizzes: []
        };
    },

    /**
     * Terminer la session actuelle
     */
    endSession() {
        if (this.currentSession) {
            this.currentSession.endTime = Date.now();
            this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;

            // Limiter l'historique des sessions à 100
            this.data.sessions.unshift(this.currentSession);
            if (this.data.sessions.length > 100) {
                this.data.sessions = this.data.sessions.slice(0, 100);
            }

            this.saveData();
        }
    },

    /**
     * Suivre une vue de page
     */
    trackPageView(page = null) {
        const pageName = page || window.location.pathname.split('/').pop() || 'index.html';

        // Incrémenter le compteur
        this.data.pageViews[pageName] = (this.data.pageViews[pageName] || 0) + 1;

        // Ajouter à la session
        if (this.currentSession) {
            this.currentSession.pages.push({
                page: pageName,
                timestamp: Date.now()
            });
        }

        this.saveData();
    },

    /**
     * Suivre le début d'un quiz
     */
    trackQuizStart(config) {
        this.data.quizStats.totalStarted++;

        const quizSession = {
            id: this.generateId(),
            startTime: Date.now(),
            config: {
                chapter: config.chapter,
                questionCount: config.questionCount,
                difficulties: config.difficulties,
                mode: config.mode
            },
            completed: false
        };

        if (this.currentSession) {
            this.currentSession.quizzes.push(quizSession);
        }

        // Stats par chapitre
        const chapter = config.chapter || 'all';
        if (!this.data.quizStats.byChapter[chapter]) {
            this.data.quizStats.byChapter[chapter] = { started: 0, completed: 0, avgScore: 0, scores: [] };
        }
        this.data.quizStats.byChapter[chapter].started++;

        this.saveData();
        return quizSession.id;
    },

    /**
     * Suivre la fin d'un quiz
     */
    trackQuizComplete(results) {
        this.data.quizStats.totalCompleted++;

        // Mise à jour moyenne
        const scores = this.data.sessions
            .flatMap(s => s.quizzes.filter(q => q.completed).map(q => q.score))
            .filter(s => s !== undefined);
        scores.push(results.score);
        this.data.quizStats.averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

        // Temps moyen
        const times = this.data.sessions
            .flatMap(s => s.quizzes.filter(q => q.completed).map(q => q.timeSpent))
            .filter(t => t !== undefined);
        times.push(results.timeSpent);
        this.data.quizStats.averageTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);

        // Stats par chapitre
        const chapter = results.config?.chapter || 'all';
        if (this.data.quizStats.byChapter[chapter]) {
            this.data.quizStats.byChapter[chapter].completed++;
            this.data.quizStats.byChapter[chapter].scores.push(results.score);
            const chapterScores = this.data.quizStats.byChapter[chapter].scores;
            this.data.quizStats.byChapter[chapter].avgScore =
                Math.round(chapterScores.reduce((a, b) => a + b, 0) / chapterScores.length);
        }

        // Stats par difficulté
        if (results.config?.difficulties) {
            results.config.difficulties.forEach(diff => {
                if (!this.data.quizStats.byDifficulty[diff]) {
                    this.data.quizStats.byDifficulty[diff] = { count: 0, avgScore: 0, scores: [] };
                }
                this.data.quizStats.byDifficulty[diff].count++;
                this.data.quizStats.byDifficulty[diff].scores.push(results.score);
            });
        }

        // Marquer le quiz comme terminé dans la session
        if (this.currentSession && this.currentSession.quizzes.length > 0) {
            const lastQuiz = this.currentSession.quizzes[this.currentSession.quizzes.length - 1];
            lastQuiz.completed = true;
            lastQuiz.score = results.score;
            lastQuiz.timeSpent = results.timeSpent;
            lastQuiz.correctAnswers = results.correctAnswers;
            lastQuiz.totalQuestions = results.totalQuestions;
        }

        this.saveData();
    },

    /**
     * Suivre l'abandon d'un quiz
     */
    trackQuizAbandon(progress) {
        this.data.quizStats.totalAbandoned++;

        if (this.currentSession && this.currentSession.quizzes.length > 0) {
            const lastQuiz = this.currentSession.quizzes[this.currentSession.quizzes.length - 1];
            lastQuiz.abandoned = true;
            lastQuiz.abandonedAt = progress;
        }

        this.saveData();
    },

    /**
     * Suivre la performance sur une question
     */
    trackQuestionAnswer(questionId, isCorrect, timeSpent, usedHint = false) {
        if (!this.data.questionStats[questionId]) {
            this.data.questionStats[questionId] = {
                attempts: 0,
                correct: 0,
                avgTime: 0,
                times: [],
                hintUsage: 0
            };
        }

        const stats = this.data.questionStats[questionId];
        stats.attempts++;
        if (isCorrect) stats.correct++;
        if (usedHint) stats.hintUsage++;

        stats.times.push(timeSpent);
        // Garder seulement les 100 derniers temps
        if (stats.times.length > 100) stats.times = stats.times.slice(-100);
        stats.avgTime = Math.round(stats.times.reduce((a, b) => a + b, 0) / stats.times.length);

        // Calculer le taux de succès
        stats.successRate = Math.round((stats.correct / stats.attempts) * 100);

        this.saveData();
    },

    /**
     * Suivre un événement personnalisé
     */
    trackEvent(category, action, label = null, value = null) {
        const event = {
            timestamp: Date.now(),
            category,
            action,
            label,
            value
        };

        if (this.currentSession) {
            this.currentSession.events.push(event);
        }

        // Log en mode dev
        if (window.location.hostname === 'localhost') {
            console.log('📊 Event:', category, action, label, value);
        }
    },

    /**
     * Suivre une erreur
     */
    trackError(error, context = null) {
        this.data.errors.push({
            timestamp: Date.now(),
            message: error.message || String(error),
            stack: error.stack,
            context,
            page: window.location.pathname
        });

        // Limiter à 50 erreurs
        if (this.data.errors.length > 50) {
            this.data.errors = this.data.errors.slice(-50);
        }

        this.saveData();
    },

    /**
     * Obtenir les statistiques globales
     */
    getStats() {
        const completionRate = this.data.quizStats.totalStarted > 0
            ? Math.round((this.data.quizStats.totalCompleted / this.data.quizStats.totalStarted) * 100)
            : 0;

        // Questions les plus difficiles
        const difficultQuestions = Object.entries(this.data.questionStats)
            .filter(([_, stats]) => stats.attempts >= 5)
            .map(([id, stats]) => ({ id, ...stats }))
            .sort((a, b) => a.successRate - b.successRate)
            .slice(0, 10);

        // Questions les plus faciles
        const easyQuestions = Object.entries(this.data.questionStats)
            .filter(([_, stats]) => stats.attempts >= 5)
            .map(([id, stats]) => ({ id, ...stats }))
            .sort((a, b) => b.successRate - a.successRate)
            .slice(0, 10);

        return {
            summary: {
                totalSessions: this.data.sessions.length,
                totalQuizzes: this.data.quizStats.totalStarted,
                completedQuizzes: this.data.quizStats.totalCompleted,
                abandonedQuizzes: this.data.quizStats.totalAbandoned,
                completionRate,
                averageScore: this.data.quizStats.averageScore,
                averageTime: this.data.quizStats.averageTime
            },
            byChapter: this.data.quizStats.byChapter,
            byDifficulty: this.data.quizStats.byDifficulty,
            pageViews: this.data.pageViews,
            difficultQuestions,
            easyQuestions,
            recentErrors: this.data.errors.slice(-10)
        };
    },

    /**
     * Exporter les données analytics
     */
    exportData() {
        return {
            exportDate: new Date().toISOString(),
            stats: this.getStats(),
            rawData: this.data
        };
    },

    /**
     * Réinitialiser les analytics
     */
    reset() {
        this.data = {
            sessions: [],
            pageViews: {},
            quizStats: {
                totalStarted: 0,
                totalCompleted: 0,
                totalAbandoned: 0,
                averageScore: 0,
                averageTime: 0,
                byChapter: {},
                byDifficulty: {},
                byQuestionType: {}
            },
            questionStats: {},
            userBehavior: {
                avgTimePerQuestion: 0,
                hintUsage: 0,
                skipRate: 0
            },
            errors: []
        };
        this.saveData();
        console.log('📊 Analytics réinitialisé');
    },

    /**
     * Configuration des écouteurs d'événements
     */
    setupEventListeners() {
        // Suivre la fermeture de page
        window.addEventListener('beforeunload', () => {
            this.endSession();
        });

        // Suivre les erreurs JS
        window.addEventListener('error', (event) => {
            this.trackError(event.error || event.message, 'window.onerror');
        });

        // Suivre les promesses rejetées
        window.addEventListener('unhandledrejection', (event) => {
            this.trackError(event.reason, 'unhandledrejection');
        });

        // Suivre la visibilité de la page
        document.addEventListener('visibilitychange', () => {
            this.trackEvent('page', 'visibility', document.visibilityState);
        });
    },

    /**
     * Générer un ID unique
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};

// Initialisation automatique si DOM prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Analytics.init());
} else {
    Analytics.init();
}

// Export pour utilisation globale
window.Analytics = Analytics;
