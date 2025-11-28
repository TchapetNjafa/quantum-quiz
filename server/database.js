/**
 * QUANTUM QUIZ - MODULE BASE DE DONNÉES
 * Gestion de la persistance avec SQLite
 * Université de Yaoundé I - PHY321
 */

const Database = require('better-sqlite3');
const path = require('path');

// Chemin de la base de données
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'quantum-quiz.db');

// Initialisation de la base de données
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL'); // Mode Write-Ahead Logging pour de meilleures performances

// ============================================================================
// CRÉATION DES TABLES
// ============================================================================

function initDatabase() {
    console.log('📦 Initialisation de la base de données...');

    // Table des utilisateurs
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            username TEXT NOT NULL,
            avatar TEXT DEFAULT '👤',
            total_score INTEGER DEFAULT 0,
            quizzes_completed INTEGER DEFAULT 0,
            average_score INTEGER DEFAULT 0,
            best_score INTEGER DEFAULT 0,
            level INTEGER DEFAULT 1,
            xp INTEGER DEFAULT 0,
            achievements TEXT DEFAULT '[]',
            join_date TEXT NOT NULL,
            last_seen TEXT NOT NULL,
            is_online INTEGER DEFAULT 0
        )
    `);

    // Table du leaderboard
    db.exec(`
        CREATE TABLE IF NOT EXISTS leaderboard (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            username TEXT NOT NULL,
            score INTEGER NOT NULL,
            chapter TEXT,
            question_count INTEGER,
            time_spent INTEGER,
            mode TEXT DEFAULT 'learning',
            date TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    `);

    // Table des challenges
    db.exec(`
        CREATE TABLE IF NOT EXISTS challenges (
            challenge_id TEXT PRIMARY KEY,
            creator_user_id TEXT NOT NULL,
            creator_username TEXT NOT NULL,
            creator_score INTEGER DEFAULT 0,
            chapter TEXT,
            question_count INTEGER,
            difficulty TEXT,
            mode TEXT DEFAULT 'exam',
            created_at TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            status TEXT DEFAULT 'open',
            FOREIGN KEY (creator_user_id) REFERENCES users(user_id)
        )
    `);

    // Table des participants aux challenges
    db.exec(`
        CREATE TABLE IF NOT EXISTS challenge_participants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            challenge_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            username TEXT NOT NULL,
            score INTEGER NOT NULL,
            completed_at TEXT NOT NULL,
            FOREIGN KEY (challenge_id) REFERENCES challenges(challenge_id),
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    `);

    // Table de l'historique des quiz (par utilisateur)
    db.exec(`
        CREATE TABLE IF NOT EXISTS quiz_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            chapter TEXT,
            score INTEGER NOT NULL,
            correct_answers INTEGER NOT NULL,
            total_questions INTEGER NOT NULL,
            time_spent INTEGER,
            mode TEXT DEFAULT 'learning',
            difficulties TEXT,
            question_types TEXT,
            date TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    `);

    // Index pour les performances
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(score DESC);
        CREATE INDEX IF NOT EXISTS idx_leaderboard_date ON leaderboard(date DESC);
        CREATE INDEX IF NOT EXISTS idx_leaderboard_chapter ON leaderboard(chapter);
        CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);
        CREATE INDEX IF NOT EXISTS idx_challenges_expires ON challenges(expires_at);
        CREATE INDEX IF NOT EXISTS idx_quiz_history_user ON quiz_history(user_id);
        CREATE INDEX IF NOT EXISTS idx_quiz_history_date ON quiz_history(date DESC);
    `);

    console.log('✅ Base de données initialisée');
}

// ============================================================================
// OPÉRATIONS UTILISATEURS
// ============================================================================

const userQueries = {
    getById: db.prepare('SELECT * FROM users WHERE user_id = ?'),
    getByUsername: db.prepare('SELECT * FROM users WHERE username = ?'),
    insert: db.prepare(`
        INSERT INTO users (user_id, username, avatar, join_date, last_seen)
        VALUES (?, ?, ?, ?, ?)
    `),
    update: db.prepare(`
        UPDATE users SET
            username = ?,
            avatar = ?,
            total_score = ?,
            quizzes_completed = ?,
            average_score = ?,
            best_score = ?,
            level = ?,
            xp = ?,
            achievements = ?,
            last_seen = ?,
            is_online = ?
        WHERE user_id = ?
    `),
    setOnline: db.prepare('UPDATE users SET is_online = ?, last_seen = ? WHERE user_id = ?'),
    getOnlineCount: db.prepare('SELECT COUNT(*) as count FROM users WHERE is_online = 1'),
    getAll: db.prepare('SELECT * FROM users ORDER BY total_score DESC LIMIT ?')
};

function getUser(userId) {
    const row = userQueries.getById.get(userId);
    if (row) {
        row.achievements = JSON.parse(row.achievements || '[]');
        row.isOnline = row.is_online === 1;
    }
    return row || null;
}

function createUser(userId, username, avatar = '👤') {
    const now = new Date().toISOString();
    userQueries.insert.run(userId, username, avatar, now, now);
    return getUser(userId);
}

function updateUser(user) {
    userQueries.update.run(
        user.username,
        user.avatar,
        user.total_score || user.totalScore || 0,
        user.quizzes_completed || user.quizzesCompleted || 0,
        user.average_score || user.averageScore || 0,
        user.best_score || user.bestScore || 0,
        user.level || 1,
        user.xp || 0,
        JSON.stringify(user.achievements || []),
        new Date().toISOString(),
        user.is_online || user.isOnline ? 1 : 0,
        user.user_id || user.userId
    );
    return getUser(user.user_id || user.userId);
}

function setUserOnline(userId, isOnline) {
    userQueries.setOnline.run(isOnline ? 1 : 0, new Date().toISOString(), userId);
}

function getOnlineUsersCount() {
    return userQueries.getOnlineCount.get().count;
}

// ============================================================================
// OPÉRATIONS LEADERBOARD
// ============================================================================

const leaderboardQueries = {
    insert: db.prepare(`
        INSERT INTO leaderboard (user_id, username, score, chapter, question_count, time_spent, mode, date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `),
    getTop: db.prepare(`
        SELECT * FROM leaderboard
        ORDER BY score DESC, date DESC
        LIMIT ?
    `),
    getTopByChapter: db.prepare(`
        SELECT * FROM leaderboard
        WHERE chapter = ?
        ORDER BY score DESC, date DESC
        LIMIT ?
    `),
    getTopByMode: db.prepare(`
        SELECT * FROM leaderboard
        WHERE mode = ?
        ORDER BY score DESC, date DESC
        LIMIT ?
    `),
    getTopByChapterAndMode: db.prepare(`
        SELECT * FROM leaderboard
        WHERE chapter = ? AND mode = ?
        ORDER BY score DESC, date DESC
        LIMIT ?
    `),
    getUserRank: db.prepare(`
        SELECT COUNT(*) + 1 as rank FROM leaderboard WHERE score > ?
    `),
    getCount: db.prepare('SELECT COUNT(*) as count FROM leaderboard')
};

function addLeaderboardEntry(entry) {
    leaderboardQueries.insert.run(
        entry.userId,
        entry.username,
        entry.score,
        entry.chapter,
        entry.questionCount,
        entry.timeSpent,
        entry.mode || 'learning',
        entry.date || new Date().toISOString()
    );
    return leaderboardQueries.getUserRank.get(entry.score).rank;
}

function getTopScores(limit = 10, filters = {}) {
    if (filters.chapter && filters.mode) {
        return leaderboardQueries.getTopByChapterAndMode.all(filters.chapter, filters.mode, limit);
    } else if (filters.chapter) {
        return leaderboardQueries.getTopByChapter.all(filters.chapter, limit);
    } else if (filters.mode) {
        return leaderboardQueries.getTopByMode.all(filters.mode, limit);
    }
    return leaderboardQueries.getTop.all(limit);
}

function getLeaderboardCount() {
    return leaderboardQueries.getCount.get().count;
}

// ============================================================================
// OPÉRATIONS CHALLENGES
// ============================================================================

const challengeQueries = {
    insert: db.prepare(`
        INSERT INTO challenges (challenge_id, creator_user_id, creator_username, creator_score,
            chapter, question_count, difficulty, mode, created_at, expires_at, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    getById: db.prepare('SELECT * FROM challenges WHERE challenge_id = ?'),
    getActive: db.prepare(`
        SELECT * FROM challenges
        WHERE status = 'open' AND expires_at > datetime('now')
        ORDER BY created_at DESC
    `),
    updateStatus: db.prepare('UPDATE challenges SET status = ? WHERE challenge_id = ?'),
    deleteExpired: db.prepare('DELETE FROM challenges WHERE expires_at < datetime(\'now\')'),
    getCount: db.prepare('SELECT COUNT(*) as count FROM challenges WHERE status = \'open\''),
    addParticipant: db.prepare(`
        INSERT INTO challenge_participants (challenge_id, user_id, username, score, completed_at)
        VALUES (?, ?, ?, ?, ?)
    `),
    getParticipants: db.prepare(`
        SELECT * FROM challenge_participants WHERE challenge_id = ? ORDER BY score DESC
    `)
};

function createChallenge(challenge) {
    challengeQueries.insert.run(
        challenge.id,
        challenge.creatorUserId,
        challenge.creatorUsername,
        challenge.creatorScore || 0,
        challenge.chapter,
        challenge.questionCount,
        challenge.difficulty,
        challenge.mode || 'exam',
        challenge.createdAt,
        challenge.expiresAt,
        challenge.status || 'open'
    );

    // Ajouter le créateur comme premier participant
    challengeQueries.addParticipant.run(
        challenge.id,
        challenge.creatorUserId,
        challenge.creatorUsername,
        challenge.creatorScore || 0,
        challenge.createdAt
    );

    return getChallenge(challenge.id);
}

function getChallenge(challengeId) {
    const challenge = challengeQueries.getById.get(challengeId);
    if (challenge) {
        challenge.participants = challengeQueries.getParticipants.all(challengeId);
    }
    return challenge || null;
}

function getActiveChallenges() {
    const challenges = challengeQueries.getActive.all();
    return challenges.map(c => {
        c.participants = challengeQueries.getParticipants.all(c.challenge_id);
        return c;
    });
}

function addChallengeParticipant(challengeId, userId, username, score) {
    challengeQueries.addParticipant.run(
        challengeId,
        userId,
        username,
        score,
        new Date().toISOString()
    );
}

function completeChallenge(challengeId) {
    challengeQueries.updateStatus.run('completed', challengeId);
}

function cleanExpiredChallenges() {
    const result = challengeQueries.deleteExpired.run();
    if (result.changes > 0) {
        console.log(`🗑️  ${result.changes} challenges expirés supprimés`);
    }
    return result.changes;
}

function getActiveChallengesCount() {
    return challengeQueries.getCount.get().count;
}

// ============================================================================
// OPÉRATIONS HISTORIQUE QUIZ
// ============================================================================

const historyQueries = {
    insert: db.prepare(`
        INSERT INTO quiz_history (user_id, chapter, score, correct_answers, total_questions,
            time_spent, mode, difficulties, question_types, date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    getByUser: db.prepare(`
        SELECT * FROM quiz_history WHERE user_id = ? ORDER BY date DESC LIMIT ?
    `),
    getStats: db.prepare(`
        SELECT
            COUNT(*) as total_quizzes,
            AVG(score) as avg_score,
            MAX(score) as best_score,
            SUM(time_spent) as total_time,
            SUM(correct_answers) as total_correct,
            SUM(total_questions) as total_questions
        FROM quiz_history WHERE user_id = ?
    `)
};

function addQuizHistory(entry) {
    historyQueries.insert.run(
        entry.userId,
        entry.chapter,
        entry.score,
        entry.correctAnswers,
        entry.totalQuestions,
        entry.timeSpent,
        entry.mode || 'learning',
        JSON.stringify(entry.difficulties || []),
        JSON.stringify(entry.questionTypes || []),
        entry.date || new Date().toISOString()
    );
}

function getUserQuizHistory(userId, limit = 50) {
    const history = historyQueries.getByUser.all(userId, limit);
    return history.map(h => ({
        ...h,
        difficulties: JSON.parse(h.difficulties || '[]'),
        questionTypes: JSON.parse(h.question_types || '[]')
    }));
}

function getUserStats(userId) {
    return historyQueries.getStats.get(userId);
}

// ============================================================================
// INITIALISATION
// ============================================================================

initDatabase();

// Nettoyage périodique des challenges expirés
setInterval(cleanExpiredChallenges, 10 * 60 * 1000);

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    db,
    // Users
    getUser,
    createUser,
    updateUser,
    setUserOnline,
    getOnlineUsersCount,
    // Leaderboard
    addLeaderboardEntry,
    getTopScores,
    getLeaderboardCount,
    // Challenges
    createChallenge,
    getChallenge,
    getActiveChallenges,
    addChallengeParticipant,
    completeChallenge,
    cleanExpiredChallenges,
    getActiveChallengesCount,
    // Quiz History
    addQuizHistory,
    getUserQuizHistory,
    getUserStats
};
