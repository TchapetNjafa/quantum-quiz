/**
 * QUANTUM QUIZ - Système de Gamification
 * Badges, XP, Niveaux et Défis Quotidiens
 */

const Gamification = {
    // Configuration XP
    xpConfig: {
        questionCorrect: 10,
        questionIncorrect: 2,
        quizComplete: 50,
        perfectScore: 100,
        dailyQuestion: 25,
        streak3Days: 50,
        streak7Days: 150,
        streak30Days: 500,
        challengeWin: 200
    },

    // Niveaux et XP requis
    levels: [
        { level: 1, xpRequired: 0, title: 'Novice Quantique' },
        { level: 2, xpRequired: 100, title: 'Apprenti Quantique' },
        { level: 3, xpRequired: 300, title: 'Étudiant Quantique' },
        { level: 4, xpRequired: 600, title: 'Observateur Quantique' },
        { level: 5, xpRequired: 1000, title: 'Explorateur Quantique' },
        { level: 6, xpRequired: 1500, title: 'Physicien Junior' },
        { level: 7, xpRequired: 2200, title: 'Physicien' },
        { level: 8, xpRequired: 3000, title: 'Physicien Senior' },
        { level: 9, xpRequired: 4000, title: 'Expert Quantique' },
        { level: 10, xpRequired: 5500, title: 'Maître Quantique' },
        { level: 11, xpRequired: 7500, title: 'Grand Maître' },
        { level: 12, xpRequired: 10000, title: 'Légende Quantique' }
    ],

    // Définition des badges
    badges: {
        // Progression
        first_quiz: {
            id: 'first_quiz',
            name: 'Premier Pas',
            description: 'Complétez votre premier quiz',
            icon: '🎯',
            category: 'progression',
            condition: (stats) => stats.quizzesCompleted >= 1
        },
        quiz_10: {
            id: 'quiz_10',
            name: 'Persévérant',
            description: 'Complétez 10 quiz',
            icon: '🏃',
            category: 'progression',
            condition: (stats) => stats.quizzesCompleted >= 10
        },
        quiz_50: {
            id: 'quiz_50',
            name: 'Marathon',
            description: 'Complétez 50 quiz',
            icon: '🏅',
            category: 'progression',
            condition: (stats) => stats.quizzesCompleted >= 50
        },
        quiz_100: {
            id: 'quiz_100',
            name: 'Centurion',
            description: 'Complétez 100 quiz',
            icon: '🏆',
            category: 'progression',
            condition: (stats) => stats.quizzesCompleted >= 100
        },

        // Performance
        perfect_score: {
            id: 'perfect_score',
            name: 'Perfection',
            description: 'Obtenez 100% sur un quiz',
            icon: '⭐',
            category: 'performance',
            condition: (stats) => stats.perfectScores >= 1
        },
        five_perfect: {
            id: 'five_perfect',
            name: 'Excellence',
            description: 'Obtenez 5 scores parfaits',
            icon: '🌟',
            category: 'performance',
            condition: (stats) => stats.perfectScores >= 5
        },
        speed_demon: {
            id: 'speed_demon',
            name: 'Éclair',
            description: 'Terminez un quiz en moins de 2 minutes',
            icon: '⚡',
            category: 'performance',
            condition: (stats) => stats.fastestQuiz && stats.fastestQuiz < 120
        },
        accuracy_80: {
            id: 'accuracy_80',
            name: 'Précision',
            description: 'Maintenez une moyenne de 80%+',
            icon: '🎯',
            category: 'performance',
            condition: (stats) => stats.averageScore >= 80
        },

        // Streaks
        streak_3: {
            id: 'streak_3',
            name: 'En Série',
            description: '3 jours de suite',
            icon: '🔥',
            category: 'streak',
            condition: (stats) => stats.maxStreak >= 3
        },
        streak_7: {
            id: 'streak_7',
            name: 'Semaine Parfaite',
            description: '7 jours de suite',
            icon: '🔥🔥',
            category: 'streak',
            condition: (stats) => stats.maxStreak >= 7
        },
        streak_30: {
            id: 'streak_30',
            name: 'Mois Quantique',
            description: '30 jours de suite',
            icon: '🔥🔥🔥',
            category: 'streak',
            condition: (stats) => stats.maxStreak >= 30
        },

        // Chapitres
        chapter_master_1: {
            id: 'chapter_master_1',
            name: 'États Maîtrisés',
            description: '90%+ sur le Chapitre 1',
            icon: '📚',
            category: 'chapter',
            condition: (stats) => stats.chapterScores?.[1] >= 90
        },
        chapter_master_2: {
            id: 'chapter_master_2',
            name: 'Mesures Maîtrisées',
            description: '90%+ sur le Chapitre 2',
            icon: '📐',
            category: 'chapter',
            condition: (stats) => stats.chapterScores?.[2] >= 90
        },
        chapter_master_3: {
            id: 'chapter_master_3',
            name: 'Postulats Maîtrisés',
            description: '90%+ sur le Chapitre 3',
            icon: '📜',
            category: 'chapter',
            condition: (stats) => stats.chapterScores?.[3] >= 90
        },
        chapter_master_4: {
            id: 'chapter_master_4',
            name: 'Intrication Maîtrisée',
            description: '90%+ sur le Chapitre 4',
            icon: '🔗',
            category: 'chapter',
            condition: (stats) => stats.chapterScores?.[4] >= 90
        },
        chapter_master_5: {
            id: 'chapter_master_5',
            name: 'Fonctions Maîtrisées',
            description: '90%+ sur le Chapitre 5',
            icon: '📈',
            category: 'chapter',
            condition: (stats) => stats.chapterScores?.[5] >= 90
        },
        chapter_master_6: {
            id: 'chapter_master_6',
            name: 'Oscillateur Maîtrisé',
            description: '90%+ sur le Chapitre 6',
            icon: '🎵',
            category: 'chapter',
            condition: (stats) => stats.chapterScores?.[6] >= 90
        },
        all_chapters: {
            id: 'all_chapters',
            name: 'Érudit',
            description: 'Complétez tous les chapitres',
            icon: '🎓',
            category: 'chapter',
            condition: (stats) => stats.chaptersCompleted >= 6
        },

        // Social
        challenge_win: {
            id: 'challenge_win',
            name: 'Challenger',
            description: 'Gagnez votre premier défi',
            icon: '🏅',
            category: 'social',
            condition: (stats) => stats.challengesWon >= 1
        },
        challenge_5: {
            id: 'challenge_5',
            name: 'Champion',
            description: 'Gagnez 5 défis',
            icon: '🏆',
            category: 'social',
            condition: (stats) => stats.challengesWon >= 5
        },

        // Spéciaux
        night_owl: {
            id: 'night_owl',
            name: 'Noctambule',
            description: 'Quiz après minuit',
            icon: '🦉',
            category: 'special',
            condition: (stats) => stats.nightQuizzes >= 1
        },
        early_bird: {
            id: 'early_bird',
            name: 'Lève-tôt',
            description: 'Quiz avant 7h',
            icon: '🐦',
            category: 'special',
            condition: (stats) => stats.earlyQuizzes >= 1
        },
        weekend_warrior: {
            id: 'weekend_warrior',
            name: 'Guerrier du Weekend',
            description: '10 quiz le weekend',
            icon: '⚔️',
            category: 'special',
            condition: (stats) => stats.weekendQuizzes >= 10
        }
    },

    // Défis quotidiens
    dailyChallenges: [
        { id: 'perfect_3', name: 'Perfectionniste', description: '3 quiz sans erreur', target: 3, type: 'perfect', xp: 150, icon: '⭐' },
        { id: 'questions_50', name: 'Volume', description: 'Répondre à 50 questions', target: 50, type: 'questions', xp: 100, icon: '📊' },
        { id: 'chapter_complete', name: 'Spécialiste', description: 'Quiz de chaque chapitre', target: 6, type: 'chapters', xp: 200, icon: '📚' },
        { id: 'speed_5', name: 'Speedrun', description: '5 quiz en moins de 3 min', target: 5, type: 'speed', xp: 175, icon: '⚡' },
        { id: 'accuracy_90', name: 'Précision', description: 'Moyenne 90%+ sur 5 quiz', target: 5, type: 'accuracy', xp: 150, icon: '🎯' },
        { id: 'hard_mode', name: 'Difficile', description: '3 quiz en difficulté Hard', target: 3, type: 'hard', xp: 200, icon: '💪' }
    ],

    // État utilisateur
    state: {
        xp: 0,
        level: 1,
        unlockedBadges: [],
        dailyProgress: {},
        currentChallenge: null,
        stats: {}
    },

    /**
     * Initialisation
     */
    init() {
        this.loadState();
        this.selectDailyChallenge();
        this.checkBadges();
        console.log('🎮 Gamification initialisée');
    },

    /**
     * Charge l'état depuis localStorage
     */
    loadState() {
        try {
            const saved = localStorage.getItem('gamification_state');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.state = { ...this.state, ...parsed };
            }

            // Charger les stats depuis storage
            const stats = JSON.parse(localStorage.getItem('quiz_stats') || '{}');
            this.state.stats = {
                quizzesCompleted: stats.totalQuizzes || 0,
                questionsAnswered: stats.totalQuestions || 0,
                correctAnswers: stats.correctAnswers || 0,
                perfectScores: stats.perfectScores || 0,
                averageScore: stats.averageScore || 0,
                maxStreak: stats.maxStreak || 0,
                currentStreak: stats.currentStreak || 0,
                fastestQuiz: stats.fastestQuiz || null,
                chapterScores: stats.chapterScores || {},
                chaptersCompleted: Object.keys(stats.chapterScores || {}).length,
                challengesWon: stats.challengesWon || 0,
                nightQuizzes: stats.nightQuizzes || 0,
                earlyQuizzes: stats.earlyQuizzes || 0,
                weekendQuizzes: stats.weekendQuizzes || 0
            };
        } catch (e) {
            console.error('Erreur chargement gamification:', e);
        }
    },

    /**
     * Sauvegarde l'état
     */
    saveState() {
        try {
            localStorage.setItem('gamification_state', JSON.stringify(this.state));
        } catch (e) {
            console.error('Erreur sauvegarde gamification:', e);
        }
    },

    /**
     * Ajoute de l'XP
     */
    addXP(amount, reason = '') {
        const oldLevel = this.state.level;
        this.state.xp += amount;

        // Calculer le nouveau niveau
        this.state.level = this.calculateLevel(this.state.xp);

        this.saveState();

        // Événement pour l'UI
        const event = new CustomEvent('xpGained', {
            detail: { amount, reason, totalXp: this.state.xp, level: this.state.level }
        });
        window.dispatchEvent(event);

        // Level up?
        if (this.state.level > oldLevel) {
            this.onLevelUp(this.state.level);
        }

        console.log(`✨ +${amount} XP (${reason}). Total: ${this.state.xp}`);
        return amount;
    },

    /**
     * Calcule le niveau basé sur l'XP
     */
    calculateLevel(xp) {
        for (let i = this.levels.length - 1; i >= 0; i--) {
            if (xp >= this.levels[i].xpRequired) {
                return this.levels[i].level;
            }
        }
        return 1;
    },

    /**
     * Récupère les infos du niveau actuel
     */
    getCurrentLevelInfo() {
        const currentLevel = this.levels.find(l => l.level === this.state.level);
        const nextLevel = this.levels.find(l => l.level === this.state.level + 1);

        const xpForCurrentLevel = currentLevel.xpRequired;
        const xpForNextLevel = nextLevel ? nextLevel.xpRequired : currentLevel.xpRequired;
        const xpProgress = this.state.xp - xpForCurrentLevel;
        const xpNeeded = xpForNextLevel - xpForCurrentLevel;

        return {
            level: this.state.level,
            title: currentLevel.title,
            xp: this.state.xp,
            xpProgress,
            xpNeeded,
            progressPercent: nextLevel ? Math.round((xpProgress / xpNeeded) * 100) : 100,
            nextLevelTitle: nextLevel ? nextLevel.title : 'Maximum'
        };
    },

    /**
     * Événement de level up
     */
    onLevelUp(newLevel) {
        const levelInfo = this.levels.find(l => l.level === newLevel);

        const event = new CustomEvent('levelUp', {
            detail: { level: newLevel, title: levelInfo.title }
        });
        window.dispatchEvent(event);

        // Notification
        this.showNotification(
            '🎉 Niveau Supérieur!',
            `Vous êtes maintenant ${levelInfo.title}!`,
            'success'
        );

        // Son
        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.success();
        }
    },

    /**
     * Vérifie et débloque les badges
     */
    checkBadges() {
        const newBadges = [];

        Object.values(this.badges).forEach(badge => {
            if (!this.state.unlockedBadges.includes(badge.id)) {
                if (badge.condition(this.state.stats)) {
                    this.state.unlockedBadges.push(badge.id);
                    newBadges.push(badge);
                }
            }
        });

        if (newBadges.length > 0) {
            this.saveState();
            newBadges.forEach(badge => this.onBadgeUnlocked(badge));
        }

        return newBadges;
    },

    /**
     * Événement de badge débloqué
     */
    onBadgeUnlocked(badge) {
        const event = new CustomEvent('badgeUnlocked', { detail: badge });
        window.dispatchEvent(event);

        // Animation de déblocage
        this.showBadgeUnlockAnimation(badge);

        // Son
        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.success();
        }

        // Bonus XP pour badge
        this.addXP(50, `Badge: ${badge.name}`);
    },

    /**
     * Récupère tous les badges avec leur état
     */
    getAllBadges() {
        return Object.values(this.badges).map(badge => ({
            ...badge,
            unlocked: this.state.unlockedBadges.includes(badge.id)
        }));
    },

    /**
     * Sélectionne le défi quotidien
     */
    selectDailyChallenge() {
        const today = new Date().toDateString();
        const savedDate = localStorage.getItem('daily_challenge_date');

        if (savedDate !== today) {
            // Nouveau jour, nouveau défi
            const seed = new Date().getDate() + new Date().getMonth() * 31;
            const index = seed % this.dailyChallenges.length;

            this.state.currentChallenge = {
                ...this.dailyChallenges[index],
                progress: 0,
                completed: false,
                date: today
            };

            localStorage.setItem('daily_challenge_date', today);
            this.saveState();
        } else {
            // Restaurer le défi en cours
            const savedChallenge = localStorage.getItem('daily_challenge_progress');
            if (savedChallenge) {
                this.state.currentChallenge = JSON.parse(savedChallenge);
            }
        }
    },

    /**
     * Met à jour le progrès du défi
     */
    updateChallengeProgress(type, value = 1) {
        if (!this.state.currentChallenge || this.state.currentChallenge.completed) {
            return;
        }

        if (this.state.currentChallenge.type === type) {
            this.state.currentChallenge.progress += value;

            if (this.state.currentChallenge.progress >= this.state.currentChallenge.target) {
                this.completeChallenge();
            }

            localStorage.setItem('daily_challenge_progress', JSON.stringify(this.state.currentChallenge));
            this.saveState();
        }
    },

    /**
     * Complète le défi quotidien
     */
    completeChallenge() {
        if (!this.state.currentChallenge) return;

        this.state.currentChallenge.completed = true;
        this.addXP(this.state.currentChallenge.xp, 'Défi quotidien');

        this.showNotification(
            '🎯 Défi Complété!',
            `${this.state.currentChallenge.name} - +${this.state.currentChallenge.xp} XP`,
            'success'
        );

        this.saveState();
    },

    /**
     * Récupère le défi actuel
     */
    getCurrentChallenge() {
        return this.state.currentChallenge;
    },

    /**
     * Traite les résultats d'un quiz
     */
    processQuizResults(results) {
        const { score, correctAnswers, totalQuestions, timeSpent, chapter, difficulty } = results;

        // XP pour chaque question
        this.addXP(correctAnswers * this.xpConfig.questionCorrect, 'Questions correctes');
        this.addXP((totalQuestions - correctAnswers) * this.xpConfig.questionIncorrect, 'Participation');

        // Bonus quiz complété
        this.addXP(this.xpConfig.quizComplete, 'Quiz terminé');

        // Bonus score parfait
        if (score === 100) {
            this.addXP(this.xpConfig.perfectScore, 'Score parfait!');
        }

        // Mise à jour des stats
        this.updateStats(results);

        // Mise à jour du défi
        this.updateChallengeProgress('questions', totalQuestions);
        if (score === 100) {
            this.updateChallengeProgress('perfect', 1);
        }
        if (timeSpent < 180) { // moins de 3 min
            this.updateChallengeProgress('speed', 1);
        }
        if (difficulty === 'hard') {
            this.updateChallengeProgress('hard', 1);
        }

        // Vérifier les badges
        this.checkBadges();
    },

    /**
     * Met à jour les statistiques
     */
    updateStats(results) {
        const stats = JSON.parse(localStorage.getItem('quiz_stats') || '{}');

        stats.totalQuizzes = (stats.totalQuizzes || 0) + 1;
        stats.totalQuestions = (stats.totalQuestions || 0) + results.totalQuestions;
        stats.correctAnswers = (stats.correctAnswers || 0) + results.correctAnswers;

        if (results.score === 100) {
            stats.perfectScores = (stats.perfectScores || 0) + 1;
        }

        // Moyenne
        const totalScore = (stats.averageScore || 0) * (stats.totalQuizzes - 1) + results.score;
        stats.averageScore = Math.round(totalScore / stats.totalQuizzes);

        // Temps le plus rapide
        if (!stats.fastestQuiz || results.timeSpent < stats.fastestQuiz) {
            stats.fastestQuiz = results.timeSpent;
        }

        // Score par chapitre
        stats.chapterScores = stats.chapterScores || {};
        if (results.chapter) {
            const chapterKey = results.chapter;
            if (!stats.chapterScores[chapterKey] || results.score > stats.chapterScores[chapterKey]) {
                stats.chapterScores[chapterKey] = results.score;
            }
        }

        // Heure du quiz
        const hour = new Date().getHours();
        if (hour >= 0 && hour < 5) {
            stats.nightQuizzes = (stats.nightQuizzes || 0) + 1;
        }
        if (hour >= 5 && hour < 7) {
            stats.earlyQuizzes = (stats.earlyQuizzes || 0) + 1;
        }

        const day = new Date().getDay();
        if (day === 0 || day === 6) {
            stats.weekendQuizzes = (stats.weekendQuizzes || 0) + 1;
        }

        localStorage.setItem('quiz_stats', JSON.stringify(stats));
        this.state.stats = stats;
    },

    /**
     * Affiche une notification
     */
    showNotification(title, message, type = 'info') {
        const container = document.getElementById('notification-container') || this.createNotificationContainer();

        const notification = document.createElement('div');
        notification.className = `gamification-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        `;

        container.appendChild(notification);

        // Animation d'entrée
        setTimeout(() => notification.classList.add('show'), 10);

        // Suppression après 4 secondes
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    },

    /**
     * Crée le conteneur de notifications
     */
    createNotificationContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
        return container;
    },

    /**
     * Affiche le widget XP/Niveau sur une page
     */
    renderLevelWidget(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const info = this.getCurrentLevelInfo();

        container.innerHTML = `
            <div class="level-widget">
                <div class="level-header">
                    <div class="level-badge">
                        <span class="level-number">${info.level}</span>
                    </div>
                    <div class="level-info">
                        <div class="level-title">${info.title}</div>
                        <div class="level-xp">${info.xp} XP</div>
                    </div>
                </div>
                <div class="xp-bar">
                    <div class="xp-progress" style="width: ${info.progressPercent}%"></div>
                </div>
                <div class="xp-label">
                    ${info.xpProgress} / ${info.xpNeeded} XP vers ${info.nextLevelTitle}
                </div>
            </div>
        `;
    },

    /**
     * Affiche la grille de tous les badges
     */
    renderBadgesGrid(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const badges = this.getAllBadges();
        const categories = ['progression', 'performance', 'streak', 'chapter', 'social', 'special'];
        const categoryNames = {
            progression: 'Progression',
            performance: 'Performance',
            streak: 'Séries',
            chapter: 'Chapitres',
            social: 'Social',
            special: 'Spéciaux'
        };

        let html = '<div class="badges-grid-container">';

        categories.forEach(cat => {
            const catBadges = badges.filter(b => b.category === cat);
            if (catBadges.length === 0) return;

            const unlockedCount = catBadges.filter(b => b.unlocked).length;

            html += `
                <div class="badge-category">
                    <div class="badge-category-header">
                        <h4>${categoryNames[cat]}</h4>
                        <span class="badge-count">${unlockedCount}/${catBadges.length}</span>
                    </div>
                    <div class="badges-row">
                        ${catBadges.map(badge => `
                            <div class="badge-item ${badge.unlocked ? 'unlocked' : 'locked'}"
                                 title="${badge.unlocked ? badge.name + ': ' + badge.description : '???'}"
                                 data-badge-id="${badge.id}">
                                <div class="badge-icon">${badge.unlocked ? badge.icon : '🔒'}</div>
                                <div class="badge-name">${badge.unlocked ? badge.name : '???'}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;

        // Stats summary
        const totalBadges = badges.length;
        const unlockedBadges = badges.filter(b => b.unlocked).length;
        const percent = Math.round((unlockedBadges / totalBadges) * 100);

        const summary = document.createElement('div');
        summary.className = 'badges-summary';
        summary.innerHTML = `
            <div class="badges-progress-bar">
                <div class="badges-progress-fill" style="width: ${percent}%"></div>
            </div>
            <div class="badges-progress-text">${unlockedBadges}/${totalBadges} badges débloqués (${percent}%)</div>
        `;
        container.insertBefore(summary, container.firstChild);
    },

    /**
     * Affiche le défi quotidien
     */
    renderDailyChallenge(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const challenge = this.getCurrentChallenge();
        if (!challenge) {
            container.innerHTML = '<p>Aucun défi disponible</p>';
            return;
        }

        const progress = Math.min(challenge.progress, challenge.target);
        const percent = Math.round((progress / challenge.target) * 100);

        container.innerHTML = `
            <div class="daily-challenge-widget ${challenge.completed ? 'completed' : ''}">
                <div class="challenge-header">
                    <span class="challenge-icon">${challenge.icon}</span>
                    <div class="challenge-info">
                        <div class="challenge-name">${challenge.name}</div>
                        <div class="challenge-desc">${challenge.description}</div>
                    </div>
                    <div class="challenge-xp">+${challenge.xp} XP</div>
                </div>
                <div class="challenge-progress-bar">
                    <div class="challenge-progress-fill" style="width: ${percent}%"></div>
                </div>
                <div class="challenge-progress-text">
                    ${challenge.completed ? '✅ Complété!' : `${progress}/${challenge.target}`}
                </div>
            </div>
        `;
    },

    /**
     * Animation de badge débloqué
     */
    showBadgeUnlockAnimation(badge) {
        const overlay = document.createElement('div');
        overlay.className = 'badge-unlock-overlay';
        overlay.innerHTML = `
            <div class="badge-unlock-modal">
                <div class="badge-unlock-icon animate-bounce">${badge.icon}</div>
                <h2 class="badge-unlock-title">Badge Débloqué!</h2>
                <h3 class="badge-unlock-name">${badge.name}</h3>
                <p class="badge-unlock-desc">${badge.description}</p>
                <div class="badge-unlock-xp">+50 XP</div>
                <button class="btn-primary badge-unlock-close">Super!</button>
            </div>
        `;

        document.body.appendChild(overlay);

        // Animation d'entrée
        requestAnimationFrame(() => overlay.classList.add('show'));

        // Fermeture
        overlay.querySelector('.badge-unlock-close').addEventListener('click', () => {
            overlay.classList.remove('show');
            setTimeout(() => overlay.remove(), 300);
        });

        // Fermeture automatique après 5s
        setTimeout(() => {
            if (document.body.contains(overlay)) {
                overlay.classList.remove('show');
                setTimeout(() => overlay.remove(), 300);
            }
        }, 5000);
    }
};

// CSS pour les notifications et badges
const gamificationStyles = document.createElement('style');
gamificationStyles.textContent = `
    .gamification-notification {
        background: var(--bg-card, #1e293b);
        border: 1px solid var(--border-primary, #334155);
        border-radius: 12px;
        padding: 1rem 1.5rem;
        min-width: 280px;
        max-width: 350px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        transform: translateX(120%);
        transition: transform 0.3s ease;
    }

    .gamification-notification.show {
        transform: translateX(0);
    }

    .gamification-notification.success {
        border-color: #10b981;
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), var(--bg-card, #1e293b));
    }

    .gamification-notification.badge {
        border-color: #f59e0b;
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), var(--bg-card, #1e293b));
    }

    .notification-title {
        font-weight: bold;
        font-size: 1rem;
        color: var(--text-primary, #f8fafc);
        margin-bottom: 0.25rem;
    }

    .notification-message {
        font-size: 0.9rem;
        color: var(--text-secondary, #cbd5e1);
    }

    .level-widget {
        background: var(--bg-card, #1e293b);
        border-radius: 16px;
        padding: 1.5rem;
        border: 1px solid var(--border-primary, #334155);
    }

    .level-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .level-badge {
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #7c3aed, #06b6d4);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .level-number {
        font-size: 1.75rem;
        font-weight: bold;
        color: white;
    }

    .level-info {
        flex: 1;
    }

    .level-title {
        font-size: 1.25rem;
        font-weight: bold;
        color: var(--text-primary, #f8fafc);
    }

    .level-xp {
        font-size: 0.9rem;
        color: var(--quantum-cyan, #06b6d4);
    }

    .xp-bar {
        height: 12px;
        background: var(--bg-secondary, #334155);
        border-radius: 6px;
        overflow: hidden;
        margin-bottom: 0.5rem;
    }

    .xp-progress {
        height: 100%;
        background: linear-gradient(90deg, #7c3aed, #06b6d4);
        border-radius: 6px;
        transition: width 0.5s ease;
    }

    .xp-label {
        font-size: 0.85rem;
        color: var(--text-muted, #94a3b8);
        text-align: center;
    }

    /* Badges Grid */
    .badges-grid-container {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .badges-summary {
        margin-bottom: 1rem;
    }

    .badges-progress-bar {
        height: 8px;
        background: var(--bg-secondary, #334155);
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 0.5rem;
    }

    .badges-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #f59e0b, #fbbf24);
        border-radius: 4px;
        transition: width 0.5s ease;
    }

    .badges-progress-text {
        font-size: 0.9rem;
        color: var(--text-secondary, #cbd5e1);
        text-align: center;
    }

    .badge-category {
        background: var(--bg-card, #1e293b);
        border-radius: 12px;
        padding: 1rem;
        border: 1px solid var(--border-primary, #334155);
    }

    .badge-category-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .badge-category-header h4 {
        margin: 0;
        color: var(--text-primary, #f8fafc);
    }

    .badge-count {
        font-size: 0.85rem;
        color: var(--quantum-cyan, #06b6d4);
        background: rgba(6, 182, 212, 0.1);
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
    }

    .badges-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
    }

    .badge-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
        padding: 0.75rem;
        border-radius: 12px;
        min-width: 80px;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .badge-item.unlocked {
        background: rgba(245, 158, 11, 0.1);
        border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .badge-item.unlocked:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 15px rgba(245, 158, 11, 0.2);
    }

    .badge-item.locked {
        background: var(--bg-secondary, #334155);
        border: 1px solid var(--border-primary, #334155);
        opacity: 0.5;
    }

    .badge-icon {
        font-size: 2rem;
    }

    .badge-name {
        font-size: 0.75rem;
        color: var(--text-secondary, #cbd5e1);
        text-align: center;
        max-width: 70px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    /* Daily Challenge */
    .daily-challenge-widget {
        background: var(--bg-card, #1e293b);
        border-radius: 12px;
        padding: 1rem;
        border: 1px solid var(--border-primary, #334155);
    }

    .daily-challenge-widget.completed {
        border-color: #10b981;
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), var(--bg-card, #1e293b));
    }

    .challenge-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .challenge-icon {
        font-size: 2rem;
    }

    .challenge-info {
        flex: 1;
    }

    .challenge-name {
        font-weight: bold;
        color: var(--text-primary, #f8fafc);
    }

    .challenge-desc {
        font-size: 0.85rem;
        color: var(--text-secondary, #cbd5e1);
    }

    .challenge-xp {
        font-weight: bold;
        color: var(--quantum-cyan, #06b6d4);
        background: rgba(6, 182, 212, 0.1);
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
    }

    .challenge-progress-bar {
        height: 8px;
        background: var(--bg-secondary, #334155);
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 0.5rem;
    }

    .challenge-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #7c3aed, #06b6d4);
        border-radius: 4px;
        transition: width 0.3s ease;
    }

    .challenge-progress-text {
        font-size: 0.85rem;
        color: var(--text-secondary, #cbd5e1);
        text-align: center;
    }

    /* Badge Unlock Animation */
    .badge-unlock-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .badge-unlock-overlay.show {
        opacity: 1;
    }

    .badge-unlock-modal {
        background: var(--bg-card, #1e293b);
        border: 2px solid #f59e0b;
        border-radius: 24px;
        padding: 2rem 3rem;
        text-align: center;
        transform: scale(0.8);
        transition: transform 0.3s ease;
    }

    .badge-unlock-overlay.show .badge-unlock-modal {
        transform: scale(1);
    }

    .badge-unlock-icon {
        font-size: 5rem;
        margin-bottom: 1rem;
    }

    .badge-unlock-icon.animate-bounce {
        animation: badge-bounce 0.6s ease-in-out;
    }

    @keyframes badge-bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
    }

    .badge-unlock-title {
        color: #f59e0b;
        margin: 0 0 0.5rem 0;
        font-size: 1.5rem;
    }

    .badge-unlock-name {
        color: var(--text-primary, #f8fafc);
        margin: 0 0 0.5rem 0;
    }

    .badge-unlock-desc {
        color: var(--text-secondary, #cbd5e1);
        margin: 0 0 1rem 0;
    }

    .badge-unlock-xp {
        color: var(--quantum-cyan, #06b6d4);
        font-weight: bold;
        margin-bottom: 1.5rem;
    }

    .badge-unlock-close {
        padding: 0.75rem 2rem;
        font-size: 1rem;
    }
`;
document.head.appendChild(gamificationStyles);

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => Gamification.init());

// Export global
window.Gamification = Gamification;

console.log('✅ gamification.js chargé');
