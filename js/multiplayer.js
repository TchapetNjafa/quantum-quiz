/**
 * MULTIPLAYER.JS
 * Système de défis et classement multi-joueurs (version locale)
 * Quantum Quiz - PHY321
 */

const MultiplayerSystem = {
    // ============================================================================
    // CONSTANTES
    // ============================================================================

    STORAGE_KEYS: {
        LEADERBOARD: 'quantum_quiz_leaderboard',
        USER_PROFILE: 'quantum_quiz_user_profile',
        CHALLENGES: 'quantum_quiz_challenges',
        ACHIEVEMENTS: 'quantum_quiz_achievements'
    },

    // ============================================================================
    // PROFIL UTILISATEUR
    // ============================================================================

    getUserProfile() {
        const stored = localStorage.getItem(this.STORAGE_KEYS.USER_PROFILE);
        if (stored) {
            return JSON.parse(stored);
        }

        // Profil par défaut - SAUVEGARDÉ AUTOMATIQUEMENT
        const defaultProfile = {
            username: 'Étudiant' + Math.floor(Math.random() * 10000),
            totalScore: 0,
            quizzesCompleted: 0,
            averageScore: 0,
            bestScore: 0,
            level: 1,
            xp: 0,
            avatar: '👤',
            joinDate: new Date().toISOString(),
            achievements: []
        };

        // Sauvegarder immédiatement le profil par défaut
        this.saveUserProfile(defaultProfile);
        console.log('✅ Profil par défaut créé et sauvegardé:', defaultProfile.username);

        return defaultProfile;
    },

    saveUserProfile(profile) {
        localStorage.setItem(this.STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    },

    updateUserProfile(quizResult) {
        const profile = this.getUserProfile();

        profile.quizzesCompleted++;
        profile.totalScore += quizResult.score;
        profile.averageScore = Math.round(profile.totalScore / profile.quizzesCompleted);
        profile.bestScore = Math.max(profile.bestScore, quizResult.score);

        // Système XP et niveaux
        const xpGained = quizResult.score * 10;
        profile.xp += xpGained;
        profile.level = Math.floor(1 + Math.sqrt(profile.xp / 100));

        // Vérifier achievements
        this.checkAchievements(profile, quizResult);

        this.saveUserProfile(profile);
        return profile;
    },

    // ============================================================================
    // LEADERBOARD (CLASSEMENT)
    // ============================================================================

    getLeaderboard() {
        const stored = localStorage.getItem(this.STORAGE_KEYS.LEADERBOARD);
        if (stored) {
            return JSON.parse(stored);
        }
        return [];
    },

    addToLeaderboard(entry) {
        let leaderboard = this.getLeaderboard();

        // Ajouter la nouvelle entrée
        leaderboard.push({
            username: entry.username,
            score: entry.score,
            chapter: entry.chapter,
            questionCount: entry.questionCount,
            timeSpent: entry.timeSpent,
            date: new Date().toISOString(),
            mode: entry.mode || 'learning'
        });

        // Trier par score décroissant
        leaderboard.sort((a, b) => b.score - a.score);

        // Garder top 100
        leaderboard = leaderboard.slice(0, 100);

        localStorage.setItem(this.STORAGE_KEYS.LEADERBOARD, JSON.stringify(leaderboard));
        return leaderboard;
    },

    getTopScores(limit = 10, filters = {}) {
        let leaderboard = this.getLeaderboard();

        // Filtres optionnels
        if (filters.chapter) {
            leaderboard = leaderboard.filter(entry => entry.chapter === filters.chapter);
        }
        if (filters.mode) {
            leaderboard = leaderboard.filter(entry => entry.mode === filters.mode);
        }

        return leaderboard.slice(0, limit);
    },

    getUserRank(username) {
        const leaderboard = this.getLeaderboard();
        const index = leaderboard.findIndex(entry => entry.username === username);
        return index >= 0 ? index + 1 : null;
    },

    // ============================================================================
    // SYSTÈME DE DÉFIS
    // ============================================================================

    createChallenge(config) {
        const challenge = {
            id: 'challenge_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            creatorUsername: config.creatorUsername,
            creatorScore: config.creatorScore || 0,
            chapter: config.chapter,
            questionCount: config.questionCount,
            difficulty: config.difficulty,
            mode: config.mode || 'exam',
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 jours
            participants: [
                {
                    username: config.creatorUsername,
                    score: config.creatorScore,
                    completedAt: new Date().toISOString()
                }
            ],
            status: 'open'
        };

        // Sauvegarder
        const challenges = this.getChallenges();
        challenges.push(challenge);
        localStorage.setItem(this.STORAGE_KEYS.CHALLENGES, JSON.stringify(challenges));

        return challenge;
    },

    getChallenges() {
        const stored = localStorage.getItem(this.STORAGE_KEYS.CHALLENGES);
        if (stored) {
            const challenges = JSON.parse(stored);
            // Filtrer les challenges expirés
            return challenges.filter(c => new Date(c.expiresAt) > new Date());
        }
        return [];
    },

    getChallenge(challengeId) {
        const challenges = this.getChallenges();
        return challenges.find(c => c.id === challengeId);
    },

    acceptChallenge(challengeId, username) {
        const challenges = this.getChallenges();
        const challenge = challenges.find(c => c.id === challengeId);

        if (!challenge) {
            throw new Error('Défi introuvable');
        }

        // Sauvegarder la config du quiz pour cet utilisateur
        const quizConfig = {
            chapter: challenge.chapter,
            questionCount: challenge.questionCount,
            difficulty: challenge.difficulty,
            mode: challenge.mode,
            challengeId: challengeId,
            challengeMode: true
        };

        sessionStorage.setItem('quiz_config', JSON.stringify(quizConfig));
        return challenge;
    },

    completeChallenge(challengeId, username, score) {
        const challenges = this.getChallenges();
        const challengeIndex = challenges.findIndex(c => c.id === challengeId);

        if (challengeIndex < 0) {
            throw new Error('Défi introuvable');
        }

        // Ajouter le participant
        challenges[challengeIndex].participants.push({
            username: username,
            score: score,
            completedAt: new Date().toISOString()
        });

        // Mettre à jour le statut
        challenges[challengeIndex].status = 'completed';

        localStorage.setItem(this.STORAGE_KEYS.CHALLENGES, JSON.stringify(challenges));

        // Déterminer le vainqueur
        const participants = challenges[challengeIndex].participants;
        const winner = participants.reduce((best, curr) =>
            curr.score > best.score ? curr : best
        );

        return {
            challenge: challenges[challengeIndex],
            winner: winner,
            isUserWinner: winner.username === username
        };
    },

    // ============================================================================
    // ACHIEVEMENTS (SUCCÈS)
    // ============================================================================

    ACHIEVEMENTS_LIST: [
        { id: 'first_quiz', name: 'Premier Pas', description: 'Complétez votre premier quiz', icon: '🎯', condition: (p) => p.quizzesCompleted >= 1 },
        { id: 'perfect_score', name: 'Perfection', description: 'Obtenez 100% à un quiz', icon: '⭐', condition: (p, r) => r && r.score === 100 },
        { id: 'marathon', name: 'Marathon', description: 'Complétez 10 quiz', icon: '🏃', condition: (p) => p.quizzesCompleted >= 10 },
        { id: 'master', name: 'Maître Quantique', description: 'Obtenez une moyenne de 80%+', icon: '🎓', condition: (p) => p.averageScore >= 80 && p.quizzesCompleted >= 5 },
        { id: 'speed', name: 'Éclair', description: 'Complétez un quiz en moins de 5 minutes', icon: '⚡', condition: (p, r) => r && r.timeSpent < 300 },
        { id: 'challenger', name: 'Challenger', description: 'Créez votre premier défi', icon: '🎲', condition: (p) => false }, // Vérifié ailleurs
        { id: 'champion', name: 'Champion', description: 'Gagnez 3 défis', icon: '🏆', condition: (p) => p.challengesWon >= 3 },
        { id: 'level_10', name: 'Niveau 10', description: 'Atteignez le niveau 10', icon: '💯', condition: (p) => p.level >= 10 }
    ],

    checkAchievements(profile, quizResult) {
        const newAchievements = [];

        for (const achievement of this.ACHIEVEMENTS_LIST) {
            // Vérifier si déjà débloqué
            if (profile.achievements.includes(achievement.id)) {
                continue;
            }

            // Vérifier la condition
            if (achievement.condition(profile, quizResult)) {
                profile.achievements.push(achievement.id);
                newAchievements.push(achievement);
            }
        }

        return newAchievements;
    },

    getAchievements(profile) {
        return this.ACHIEVEMENTS_LIST.map(a => ({
            ...a,
            unlocked: profile.achievements.includes(a.id)
        }));
    },

    // ============================================================================
    // COMPARAISON ET STATISTIQUES
    // ============================================================================

    compareWith(otherUsername) {
        const myProfile = this.getUserProfile();
        const leaderboard = this.getLeaderboard();

        // Trouver les scores de l'autre utilisateur
        const otherScores = leaderboard.filter(entry => entry.username === otherUsername);

        if (otherScores.length === 0) {
            return null;
        }

        // Calculer les statistiques comparatives
        const otherProfile = {
            username: otherUsername,
            quizzesCompleted: otherScores.length,
            averageScore: Math.round(otherScores.reduce((sum, s) => sum + s.score, 0) / otherScores.length),
            bestScore: Math.max(...otherScores.map(s => s.score))
        };

        return {
            my: myProfile,
            other: otherProfile,
            comparison: {
                quizzesCompleted: myProfile.quizzesCompleted - otherProfile.quizzesCompleted,
                averageScore: myProfile.averageScore - otherProfile.averageScore,
                bestScore: myProfile.bestScore - otherProfile.bestScore
            }
        };
    },

    // ============================================================================
    // UTILITAIRES
    // ============================================================================

    clearAllData() {
        Object.values(this.STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    },

    exportData() {
        const data = {};
        Object.entries(this.STORAGE_KEYS).forEach(([name, key]) => {
            data[name] = localStorage.getItem(key);
        });
        return JSON.stringify(data, null, 2);
    },

    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            Object.entries(this.STORAGE_KEYS).forEach(([name, key]) => {
                if (data[name]) {
                    localStorage.setItem(key, data[name]);
                }
            });
            return true;
        } catch (e) {
            console.error('Import failed:', e);
            return false;
        }
    }
};

// Export global
window.MultiplayerSystem = MultiplayerSystem;

console.log('🎮 Multiplayer System Module Loaded');
