/**
 * Tests pour StorageManager
 * Gestion du stockage local pour Quantum Quiz
 */

describe('StorageManager - Gestion du stockage', () => {

    // Implémentation locale pour les tests
    const KEYS = {
        USER_STATS: 'quantum_quiz_user_stats',
        QUIZ_HISTORY: 'quantum_quiz_history',
        CURRENT_QUIZ: 'quantum_quiz_current',
        SETTINGS: 'quantum_quiz_settings'
    };

    const StorageManager = {
        KEYS,

        initUserStats() {
            const stored = localStorage.getItem(this.KEYS.USER_STATS);
            if (stored) {
                return JSON.parse(stored);
            }
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
            localStorage.setItem(this.KEYS.USER_STATS, JSON.stringify(defaultStats));
            return defaultStats;
        },

        getUserStats() {
            const stored = localStorage.getItem(this.KEYS.USER_STATS);
            return stored ? JSON.parse(stored) : this.initUserStats();
        },

        updateStats(quizResults) {
            const stats = this.getUserStats();
            stats.totalQuizzes++;
            stats.totalQuestions += quizResults.totalQuestions;
            stats.correctAnswers += quizResults.correctAnswers;
            stats.averageScore = Math.round((stats.correctAnswers / stats.totalQuestions) * 100);
            stats.timeSpent += quizResults.timeSpent || 0;
            stats.lastActivity = new Date().toISOString();

            const chapterId = quizResults.chapterId || 'all';
            if (!stats.byChapter[chapterId]) {
                stats.byChapter[chapterId] = { quizzes: 0, questions: 0, correct: 0, score: 0 };
            }
            stats.byChapter[chapterId].quizzes++;
            stats.byChapter[chapterId].questions += quizResults.totalQuestions;
            stats.byChapter[chapterId].correct += quizResults.correctAnswers;
            stats.byChapter[chapterId].score = Math.round(
                (stats.byChapter[chapterId].correct / stats.byChapter[chapterId].questions) * 100
            );

            localStorage.setItem(this.KEYS.USER_STATS, JSON.stringify(stats));
            return stats;
        },

        saveCurrentQuiz(quizState) {
            localStorage.setItem(this.KEYS.CURRENT_QUIZ, JSON.stringify(quizState));
        },

        getCurrentQuiz() {
            const stored = localStorage.getItem(this.KEYS.CURRENT_QUIZ);
            return stored ? JSON.parse(stored) : null;
        },

        clearCurrentQuiz() {
            localStorage.removeItem(this.KEYS.CURRENT_QUIZ);
        },

        addToHistory(quizResults) {
            const stored = localStorage.getItem(this.KEYS.QUIZ_HISTORY);
            const history = stored ? JSON.parse(stored) : [];
            const entry = {
                id: Date.now().toString(36),
                date: new Date().toISOString(),
                ...quizResults
            };
            history.unshift(entry);
            if (history.length > 50) history.splice(50);
            localStorage.setItem(this.KEYS.QUIZ_HISTORY, JSON.stringify(history));
            return entry;
        },

        getHistory() {
            const stored = localStorage.getItem(this.KEYS.QUIZ_HISTORY);
            return stored ? JSON.parse(stored) : [];
        },

        getQuizHistory() {
            return this.getHistory();
        },

        getSettings() {
            const stored = localStorage.getItem(this.KEYS.SETTINGS);
            return stored ? JSON.parse(stored) : {
                theme: 'dark',
                soundEnabled: true,
                showTimer: true,
                showHints: true
            };
        },

        updateSettings(settings) {
            const current = this.getSettings();
            const updated = { ...current, ...settings };
            localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(updated));
            return updated;
        },

        resetAll() {
            Object.values(this.KEYS).forEach(key => localStorage.removeItem(key));
            return this.initUserStats();
        }
    };

    beforeEach(() => {
        localStorage.clear();
    });

    describe('KEYS', () => {
        test('définit les clés de stockage', () => {
            expect(StorageManager.KEYS.USER_STATS).toBeDefined();
            expect(StorageManager.KEYS.QUIZ_HISTORY).toBeDefined();
            expect(StorageManager.KEYS.CURRENT_QUIZ).toBeDefined();
            expect(StorageManager.KEYS.SETTINGS).toBeDefined();
        });
    });

    describe('initUserStats()', () => {
        test('crée des stats par défaut si inexistantes', () => {
            const stats = StorageManager.initUserStats();
            expect(stats).toBeDefined();
            expect(stats.totalQuizzes).toBe(0);
            expect(stats.totalQuestions).toBe(0);
            expect(stats.correctAnswers).toBe(0);
            expect(stats.averageScore).toBe(0);
        });

        test('retourne les stats existantes', () => {
            const existingStats = {
                totalQuizzes: 5,
                totalQuestions: 50,
                correctAnswers: 40,
                averageScore: 80
            };
            localStorage.setItem(KEYS.USER_STATS, JSON.stringify(existingStats));
            const stats = StorageManager.initUserStats();
            expect(stats.totalQuizzes).toBe(5);
        });
    });

    describe('getUserStats()', () => {
        test('retourne les stats utilisateur', () => {
            const stats = StorageManager.getUserStats();
            expect(stats).toBeDefined();
            expect(typeof stats.totalQuizzes).toBe('number');
        });

        test('initialise si aucune stat', () => {
            localStorage.clear();
            const stats = StorageManager.getUserStats();
            expect(stats.totalQuizzes).toBe(0);
        });
    });

    describe('updateStats()', () => {
        test('met à jour les statistiques après un quiz', () => {
            const quizResults = {
                totalQuestions: 10,
                correctAnswers: 8,
                timeSpent: 120,
                chapterId: '1'
            };
            const stats = StorageManager.updateStats(quizResults);
            expect(stats.totalQuizzes).toBe(1);
            expect(stats.totalQuestions).toBe(10);
            expect(stats.correctAnswers).toBe(8);
            expect(stats.averageScore).toBe(80);
        });

        test('accumule les statistiques', () => {
            StorageManager.updateStats({ totalQuestions: 10, correctAnswers: 5, timeSpent: 60 });
            const stats = StorageManager.updateStats({ totalQuestions: 10, correctAnswers: 10, timeSpent: 60 });
            expect(stats.totalQuizzes).toBe(2);
            expect(stats.totalQuestions).toBe(20);
            expect(stats.correctAnswers).toBe(15);
            expect(stats.averageScore).toBe(75);
        });

        test('met à jour les stats par chapitre', () => {
            const stats = StorageManager.updateStats({
                totalQuestions: 10,
                correctAnswers: 8,
                chapterId: '2'
            });
            expect(stats.byChapter['2']).toBeDefined();
            expect(stats.byChapter['2'].quizzes).toBe(1);
            expect(stats.byChapter['2'].score).toBe(80);
        });
    });

    describe('saveCurrentQuiz() / getCurrentQuiz()', () => {
        test('sauvegarde et récupère un quiz en cours', () => {
            const quizState = { currentQuestion: 5, answers: [1, 2, 0, 3, 1], timeRemaining: 300 };
            StorageManager.saveCurrentQuiz(quizState);
            const retrieved = StorageManager.getCurrentQuiz();
            expect(retrieved).toEqual(quizState);
        });

        test('retourne null si pas de quiz en cours', () => {
            expect(StorageManager.getCurrentQuiz()).toBeNull();
        });
    });

    describe('clearCurrentQuiz()', () => {
        test('supprime le quiz en cours', () => {
            StorageManager.saveCurrentQuiz({ test: true });
            StorageManager.clearCurrentQuiz();
            expect(StorageManager.getCurrentQuiz()).toBeNull();
        });
    });

    describe('addToHistory() / getHistory()', () => {
        test('ajoute un quiz à l\'historique', () => {
            const entry = StorageManager.addToHistory({ score: 85, totalQuestions: 10 });
            expect(entry.id).toBeDefined();
            expect(entry.date).toBeDefined();
            expect(entry.score).toBe(85);
        });

        test('récupère l\'historique', () => {
            StorageManager.addToHistory({ score: 80 });
            StorageManager.addToHistory({ score: 90 });
            const history = StorageManager.getHistory();
            expect(history.length).toBe(2);
            expect(history[0].score).toBe(90);
        });

        test('limite l\'historique à 50 entrées', () => {
            for (let i = 0; i < 55; i++) {
                StorageManager.addToHistory({ score: i });
            }
            expect(StorageManager.getHistory().length).toBe(50);
        });

        test('getQuizHistory() est un alias de getHistory()', () => {
            StorageManager.addToHistory({ score: 75 });
            expect(StorageManager.getHistory()).toEqual(StorageManager.getQuizHistory());
        });
    });

    describe('getSettings() / updateSettings()', () => {
        test('retourne les paramètres par défaut', () => {
            const settings = StorageManager.getSettings();
            expect(settings.theme).toBe('dark');
            expect(settings.soundEnabled).toBe(true);
            expect(settings.showTimer).toBe(true);
        });

        test('met à jour les paramètres', () => {
            const updated = StorageManager.updateSettings({ theme: 'light', soundEnabled: false });
            expect(updated.theme).toBe('light');
            expect(updated.soundEnabled).toBe(false);
            expect(updated.showTimer).toBe(true);
        });

        test('persiste les paramètres', () => {
            StorageManager.updateSettings({ theme: 'light' });
            expect(StorageManager.getSettings().theme).toBe('light');
        });
    });

    describe('resetAll()', () => {
        test('réinitialise toutes les données', () => {
            StorageManager.updateStats({ totalQuestions: 10, correctAnswers: 8 });
            StorageManager.addToHistory({ score: 80 });
            StorageManager.updateSettings({ theme: 'light' });

            const stats = StorageManager.resetAll();
            expect(stats.totalQuizzes).toBe(0);
            expect(StorageManager.getHistory().length).toBe(0);
        });
    });
});
