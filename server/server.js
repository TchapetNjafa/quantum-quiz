/**
 * QUANTUM QUIZ - SERVEUR WEBSOCKET
 * Serveur Node.js + Socket.IO pour le mode multi-joueurs en temps réel
 * Avec persistance SQLite et sécurité renforcée
 * Université de Yaoundé I - PHY321
 */

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, query, param, validationResult } = require('express-validator');

// Module base de données
const db = require('./database');

// Configuration
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:8000';

// Initialisation Express + Socket.IO
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: CORS_ORIGIN.split(','),
        methods: ['GET', 'POST'],
        credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
});

// ============================================================================
// MIDDLEWARE DE SÉCURITÉ
// ============================================================================

// Helmet pour les en-têtes de sécurité
app.use(helmet({
    contentSecurityPolicy: false, // Désactivé pour permettre MathJax
    crossOriginEmbedderPolicy: false
}));

// CORS
app.use(cors({
    origin: CORS_ORIGIN.split(','),
    credentials: true
}));

// Parsing JSON avec limite de taille
app.use(express.json({ limit: '1mb' }));

// Rate limiting global
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requêtes par fenêtre
    message: { error: 'Trop de requêtes, réessayez plus tard' },
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api/', globalLimiter);

// Rate limiting strict pour la soumission de scores
const submitLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 soumissions par minute max
    message: { error: 'Trop de soumissions, attendez un moment' }
});

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, '..')));

// ============================================================================
// STOCKAGE EN MÉMOIRE POUR LES SESSIONS ACTIVES
// ============================================================================

const sessions = new Map();  // socketId -> userId
const onlineUsers = new Set(); // Set of online userIds

// ============================================================================
// UTILITAIRES
// ============================================================================

function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function sanitizeString(str, maxLength = 50) {
    if (typeof str !== 'string') return '';
    return str.trim().substring(0, maxLength).replace(/[<>"']/g, '');
}

function validateScore(score) {
    const num = parseInt(score);
    return !isNaN(num) && num >= 0 && num <= 100;
}

// Middleware de validation des erreurs
function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

// ============================================================================
// ROUTES REST API
// ============================================================================

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        onlineUsers: onlineUsers.size,
        challenges: db.getActiveChallengesCount(),
        leaderboardSize: db.getLeaderboardCount(),
        database: 'SQLite'
    });
});

// Get leaderboard avec validation
app.get('/api/leaderboard',
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('chapter').optional().isString(),
    query('mode').optional().isIn(['learning', 'exam']),
    handleValidationErrors,
    (req, res) => {
        const limit = parseInt(req.query.limit) || 10;
        const filters = {};
        if (req.query.chapter) filters.chapter = req.query.chapter;
        if (req.query.mode) filters.mode = req.query.mode;

        const leaderboard = db.getTopScores(limit, filters);
        res.json({ leaderboard });
    }
);

// Get challenges
app.get('/api/challenges', (req, res) => {
    const challenges = db.getActiveChallenges();
    res.json({ challenges });
});

// Get user profile avec validation
app.get('/api/users/:userId',
    param('userId').isString().isLength({ min: 1, max: 100 }),
    handleValidationErrors,
    (req, res) => {
        const user = db.getUser(req.params.userId);
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        // Ne pas exposer certaines données sensibles
        const safeUser = {
            userId: user.user_id,
            username: user.username,
            avatar: user.avatar,
            level: user.level,
            xp: user.xp,
            quizzesCompleted: user.quizzes_completed,
            averageScore: user.average_score,
            bestScore: user.best_score,
            achievements: user.achievements,
            joinDate: user.join_date
        };
        res.json({ user: safeUser });
    }
);

// Get user quiz history
app.get('/api/users/:userId/history',
    param('userId').isString().isLength({ min: 1, max: 100 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    handleValidationErrors,
    (req, res) => {
        const limit = parseInt(req.query.limit) || 50;
        const history = db.getUserQuizHistory(req.params.userId, limit);
        res.json({ history });
    }
);

// Submit score (API REST alternative au WebSocket)
app.post('/api/leaderboard',
    submitLimiter,
    body('userId').isString().isLength({ min: 1, max: 100 }),
    body('username').isString().isLength({ min: 1, max: 50 }),
    body('score').isInt({ min: 0, max: 100 }),
    body('chapter').optional().isString(),
    body('questionCount').optional().isInt({ min: 1, max: 100 }),
    body('timeSpent').optional().isInt({ min: 0 }),
    body('mode').optional().isIn(['learning', 'exam']),
    handleValidationErrors,
    (req, res) => {
        const { userId, username, score, chapter, questionCount, timeSpent, mode } = req.body;

        // Vérifier/créer l'utilisateur
        let user = db.getUser(userId);
        if (!user) {
            user = db.createUser(userId, sanitizeString(username));
        }

        // Ajouter au leaderboard
        const entry = {
            userId,
            username: sanitizeString(username),
            score,
            chapter,
            questionCount,
            timeSpent,
            mode: mode || 'learning',
            date: new Date().toISOString()
        };

        const rank = db.addLeaderboardEntry(entry);

        // Mettre à jour les stats utilisateur
        user.quizzes_completed = (user.quizzes_completed || 0) + 1;
        user.total_score = (user.total_score || 0) + score;
        user.average_score = Math.round(user.total_score / user.quizzes_completed);
        user.best_score = Math.max(user.best_score || 0, score);
        user.xp = (user.xp || 0) + score * 10;
        user.level = Math.floor(1 + Math.sqrt(user.xp / 100));
        db.updateUser(user);

        res.json({ success: true, rank });
    }
);

// Get stats
app.get('/api/stats', (req, res) => {
    res.json({
        onlineUsers: onlineUsers.size,
        totalUsers: db.getOnlineUsersCount(),
        activeChallenges: db.getActiveChallengesCount(),
        leaderboardSize: db.getLeaderboardCount()
    });
});

// ============================================================================
// WEBSOCKET EVENT HANDLERS
// ============================================================================

// Rate limiting pour WebSocket
const socketRateLimits = new Map();

function checkSocketRateLimit(socketId, event, maxPerMinute = 30) {
    const key = `${socketId}:${event}`;
    const now = Date.now();
    const windowMs = 60000;

    if (!socketRateLimits.has(key)) {
        socketRateLimits.set(key, { count: 1, resetAt: now + windowMs });
        return true;
    }

    const limit = socketRateLimits.get(key);
    if (now > limit.resetAt) {
        limit.count = 1;
        limit.resetAt = now + windowMs;
        return true;
    }

    if (limit.count >= maxPerMinute) {
        return false;
    }

    limit.count++;
    return true;
}

io.on('connection', (socket) => {
    console.log(`🔌 Nouvelle connexion: ${socket.id}`);

    // ========================================================================
    // USER CONNECTION
    // ========================================================================

    socket.on('user:connect', (data) => {
        if (!checkSocketRateLimit(socket.id, 'user:connect', 5)) {
            return socket.emit('error', { message: 'Rate limit exceeded' });
        }

        const username = sanitizeString(data.username || '', 30);
        const userId = sanitizeString(data.userId || generateId('user'), 50);

        // Créer ou récupérer le profil utilisateur
        let user = db.getUser(userId);
        if (!user) {
            user = db.createUser(userId, username || `Étudiant${Math.floor(Math.random() * 10000)}`);
        }

        // Marquer comme en ligne
        db.setUserOnline(userId, true);
        sessions.set(socket.id, userId);
        onlineUsers.add(userId);

        // Confirmer la connexion
        socket.emit('connection:success', {
            userId: user.user_id,
            username: user.username,
            level: user.level,
            xp: user.xp,
            timestamp: new Date().toISOString()
        });

        // Notifier les autres utilisateurs
        socket.broadcast.emit('user:online', {
            userId: user.user_id,
            username: user.username
        });

        console.log(`✅ Utilisateur connecté: ${user.username} (${user.user_id})`);

        // Envoyer les stats globales
        io.emit('stats:update', {
            onlineUsers: onlineUsers.size,
            activeChallenges: db.getActiveChallengesCount()
        });
    });

    // ========================================================================
    // CHALLENGES
    // ========================================================================

    socket.on('challenge:create', (data) => {
        if (!checkSocketRateLimit(socket.id, 'challenge:create', 5)) {
            return socket.emit('error', { message: 'Rate limit exceeded' });
        }

        const userId = sessions.get(socket.id);
        const user = db.getUser(userId);

        if (!user) {
            return socket.emit('error', { message: 'User not authenticated' });
        }

        if (!validateScore(data.creatorScore)) {
            return socket.emit('error', { message: 'Invalid score' });
        }

        const challenge = {
            id: generateId('challenge'),
            creatorUsername: user.username,
            creatorUserId: userId,
            creatorScore: parseInt(data.creatorScore) || 0,
            chapter: sanitizeString(data.chapter || '', 20),
            questionCount: Math.min(parseInt(data.questionCount) || 10, 50),
            difficulty: sanitizeString(data.difficulty || 'medium', 20),
            mode: data.mode === 'exam' ? 'exam' : 'learning',
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'open'
        };

        db.createChallenge(challenge);

        // Confirmer au créateur
        socket.emit('challenge:created', { challenge });

        // Notifier tous les autres utilisateurs
        socket.broadcast.emit('challenge:new', { challenge });

        console.log(`🎲 Nouveau défi créé: ${challenge.id} par ${user.username}`);
    });

    socket.on('challenge:accept', (data) => {
        if (!checkSocketRateLimit(socket.id, 'challenge:accept', 10)) {
            return socket.emit('error', { message: 'Rate limit exceeded' });
        }

        const challengeId = sanitizeString(data.challengeId || '', 50);
        const userId = sessions.get(socket.id);
        const user = db.getUser(userId);

        if (!user) {
            return socket.emit('error', { message: 'User not authenticated' });
        }

        const challenge = db.getChallenge(challengeId);
        if (!challenge) {
            return socket.emit('error', { message: 'Challenge not found' });
        }

        // Confirmer l'acceptation
        socket.emit('challenge:accepted', { challengeId });

        // Notifier le créateur et les participants
        io.emit('challenge:participant', {
            challengeId,
            username: user.username,
            userId: userId
        });

        console.log(`✓ Défi accepté: ${challengeId} par ${user.username}`);
    });

    socket.on('challenge:complete', (data) => {
        if (!checkSocketRateLimit(socket.id, 'challenge:complete', 10)) {
            return socket.emit('error', { message: 'Rate limit exceeded' });
        }

        const challengeId = sanitizeString(data.challengeId || '', 50);
        const score = parseInt(data.score);
        const userId = sessions.get(socket.id);
        const user = db.getUser(userId);

        if (!user) {
            return socket.emit('error', { message: 'User not authenticated' });
        }

        if (!validateScore(score)) {
            return socket.emit('error', { message: 'Invalid score' });
        }

        const challenge = db.getChallenge(challengeId);
        if (!challenge) {
            return socket.emit('error', { message: 'Challenge not found' });
        }

        // Ajouter le participant
        db.addChallengeParticipant(challengeId, userId, user.username, score);

        // Récupérer tous les participants
        const updatedChallenge = db.getChallenge(challengeId);
        const participants = updatedChallenge.participants || [];

        // Déterminer le vainqueur
        const winner = participants.reduce((best, curr) =>
            (curr.score > best.score) ? curr : best
        , { score: -1 });

        const result = {
            challenge: updatedChallenge,
            winner,
            isUserWinner: winner.user_id === userId
        };

        // Marquer comme complété
        db.completeChallenge(challengeId);

        // Envoyer le résultat au joueur
        socket.emit('challenge:result', result);

        // Notifier tous les utilisateurs
        io.emit('challenge:completed', {
            challengeId,
            winner,
            participantCount: participants.length
        });

        console.log(`🏆 Défi complété: ${challengeId} - Vainqueur: ${winner.username}`);
    });

    // ========================================================================
    // LEADERBOARD
    // ========================================================================

    socket.on('leaderboard:submit', (data) => {
        if (!checkSocketRateLimit(socket.id, 'leaderboard:submit', 10)) {
            return socket.emit('error', { message: 'Rate limit exceeded' });
        }

        const userId = sessions.get(socket.id);
        const user = db.getUser(userId);

        if (!user) {
            return socket.emit('error', { message: 'User not authenticated' });
        }

        if (!validateScore(data.score)) {
            return socket.emit('error', { message: 'Invalid score' });
        }

        const entry = {
            userId: userId,
            username: user.username,
            score: parseInt(data.score),
            chapter: sanitizeString(data.chapter || '', 20),
            questionCount: Math.min(parseInt(data.questionCount) || 0, 100),
            timeSpent: Math.min(parseInt(data.timeSpent) || 0, 86400),
            mode: data.mode === 'exam' ? 'exam' : 'learning',
            date: new Date().toISOString()
        };

        const rank = db.addLeaderboardEntry(entry);

        // Ajouter à l'historique
        db.addQuizHistory({
            userId,
            chapter: entry.chapter,
            score: entry.score,
            correctAnswers: Math.round(entry.score * entry.questionCount / 100),
            totalQuestions: entry.questionCount,
            timeSpent: entry.timeSpent,
            mode: entry.mode
        });

        // Mettre à jour le profil utilisateur
        user.quizzes_completed = (user.quizzes_completed || 0) + 1;
        user.total_score = (user.total_score || 0) + entry.score;
        user.average_score = Math.round(user.total_score / user.quizzes_completed);
        user.best_score = Math.max(user.best_score || 0, entry.score);
        user.xp = (user.xp || 0) + entry.score * 10;
        user.level = Math.floor(1 + Math.sqrt(user.xp / 100));
        db.updateUser(user);

        // Envoyer le nouveau classement
        const newTop10 = db.getTopScores(10);
        io.emit('leaderboard:update', { leaderboard: newTop10 });

        socket.emit('leaderboard:submitted', {
            success: true,
            rank
        });

        console.log(`📊 Score soumis: ${user.username} - ${entry.score}% (Ch${entry.chapter})`);
    });

    socket.on('leaderboard:request', (data) => {
        if (!checkSocketRateLimit(socket.id, 'leaderboard:request', 30)) {
            return socket.emit('error', { message: 'Rate limit exceeded' });
        }

        const filters = {};
        if (data.filters?.chapter) filters.chapter = sanitizeString(data.filters.chapter, 20);
        if (data.filters?.mode) filters.mode = data.filters.mode === 'exam' ? 'exam' : 'learning';
        const limit = Math.min(parseInt(data.limit) || 10, 100);

        const leaderboard = db.getTopScores(limit, filters);
        socket.emit('leaderboard:update', { leaderboard });
    });

    // ========================================================================
    // PROFILE
    // ========================================================================

    socket.on('profile:update', (data) => {
        if (!checkSocketRateLimit(socket.id, 'profile:update', 5)) {
            return socket.emit('error', { message: 'Rate limit exceeded' });
        }

        const userId = sessions.get(socket.id);
        const user = db.getUser(userId);

        if (!user) {
            return socket.emit('error', { message: 'User not authenticated' });
        }

        // Mettre à jour les champs autorisés
        if (data.username) user.username = sanitizeString(data.username, 30);
        if (data.avatar) user.avatar = sanitizeString(data.avatar, 10);

        db.updateUser(user);

        socket.emit('profile:updated', { user });

        console.log(`👤 Profil mis à jour: ${user.username}`);
    });

    // ========================================================================
    // ACHIEVEMENTS
    // ========================================================================

    socket.on('achievement:unlock', (data) => {
        if (!checkSocketRateLimit(socket.id, 'achievement:unlock', 20)) {
            return socket.emit('error', { message: 'Rate limit exceeded' });
        }

        const userId = sessions.get(socket.id);
        const user = db.getUser(userId);

        if (!user) {
            return socket.emit('error', { message: 'User not authenticated' });
        }

        const achievementId = sanitizeString(data.achievementId || '', 50);
        const achievements = user.achievements || [];

        if (!achievements.includes(achievementId)) {
            achievements.push(achievementId);
            user.achievements = achievements;
            db.updateUser(user);

            socket.emit('achievement:unlocked', {
                achievementId,
                timestamp: new Date().toISOString()
            });

            // Notification aux autres
            socket.broadcast.emit('notification', {
                type: 'achievement',
                message: `${user.username} a débloqué un succès !`,
                data: { achievementId }
            });

            console.log(`🏅 Succès débloqué: ${user.username} - ${achievementId}`);
        }
    });

    // ========================================================================
    // DISCONNECTION
    // ========================================================================

    socket.on('disconnect', () => {
        const userId = sessions.get(socket.id);

        if (userId) {
            db.setUserOnline(userId, false);
            onlineUsers.delete(userId);
            sessions.delete(socket.id);

            // Notifier les autres utilisateurs
            socket.broadcast.emit('user:offline', { userId });

            // Mise à jour des stats
            io.emit('stats:update', {
                onlineUsers: onlineUsers.size,
                activeChallenges: db.getActiveChallengesCount()
            });

            const user = db.getUser(userId);
            console.log(`❌ Utilisateur déconnecté: ${user?.username || userId}`);
        }

        // Nettoyer le rate limit
        for (const key of socketRateLimits.keys()) {
            if (key.startsWith(socket.id)) {
                socketRateLimits.delete(key);
            }
        }

        console.log(`🔌 Déconnexion: ${socket.id}`);
    });
});

// ============================================================================
// DIFFUSIONS PÉRIODIQUES
// ============================================================================

// Mise à jour périodique du leaderboard (toutes les 30 secondes)
setInterval(() => {
    if (onlineUsers.size > 0) {
        const leaderboard = db.getTopScores(10);
        io.emit('leaderboard:update', { leaderboard });
    }
}, 30 * 1000);

// Stats globales (toutes les minutes)
setInterval(() => {
    if (onlineUsers.size > 0) {
        io.emit('stats:update', {
            onlineUsers: onlineUsers.size,
            activeChallenges: db.getActiveChallengesCount()
        });
    }
}, 60 * 1000);

// Nettoyage du rate limit (toutes les 5 minutes)
setInterval(() => {
    const now = Date.now();
    for (const [key, limit] of socketRateLimits.entries()) {
        if (now > limit.resetAt) {
            socketRateLimits.delete(key);
        }
    }
}, 5 * 60 * 1000);

// ============================================================================
// DÉMARRAGE DU SERVEUR
// ============================================================================

server.listen(PORT, () => {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  🎓 QUANTUM QUIZ - Serveur WebSocket');
    console.log('  Université de Yaoundé I - PHY321');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`  🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`  🌍 Environnement: ${NODE_ENV}`);
    console.log(`  🔗 URL: http://localhost:${PORT}`);
    console.log(`  📡 WebSocket: ws://localhost:${PORT}`);
    console.log('  💾 Base de données: SQLite');
    console.log('  🔒 Sécurité: Helmet + Rate Limiting + Validation');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
});

// Gestion propre de l'arrêt
process.on('SIGTERM', () => {
    console.log('🛑 Signal SIGTERM reçu. Arrêt propre du serveur...');
    server.close(() => {
        db.db.close();
        console.log('✅ Serveur arrêté proprement.');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n🛑 Signal SIGINT reçu. Arrêt propre du serveur...');
    server.close(() => {
        db.db.close();
        console.log('✅ Serveur arrêté proprement.');
        process.exit(0);
    });
});
