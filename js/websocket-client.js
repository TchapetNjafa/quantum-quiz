/**
 * WEBSOCKET CLIENT - Quantum Quiz
 * Client WebSocket utilisant Socket.IO pour la synchronisation en temps réel
 * Université de Yaoundé I - PHY321
 */

const WebSocketClient = {
    // Configuration
    serverURL: 'http://localhost:3000',
    socket: null,
    isConnected: false,
    userId: null,
    username: null,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,

    // Event listeners personnalisés
    eventListeners: new Map(),

    // ========================================================================
    // INITIALISATION
    // ========================================================================

    init(options = {}) {
        this.serverURL = options.serverURL || this.serverURL;
        this.userId = options.userId || localStorage.getItem('quantum_quiz_user_id');
        this.username = options.username || localStorage.getItem('quantum_quiz_username') || 'Étudiant';

        // Charger Socket.IO depuis CDN si pas déjà chargé
        if (typeof io === 'undefined') {
            this.loadSocketIO(() => {
                this.connect();
            });
        } else {
            this.connect();
        }
    },

    loadSocketIO(callback) {
        const script = document.createElement('script');
        script.src = 'https://cdn.socket.io/4.6.1/socket.io.min.js';
        script.onload = callback;
        script.onerror = () => {
            console.error('❌ Échec du chargement de Socket.IO');
            this.fallbackToLocalMode();
        };
        document.head.appendChild(script);
    },

    // ========================================================================
    // CONNEXION
    // ========================================================================

    connect() {
        if (typeof io === 'undefined') {
            console.warn('⚠️ Socket.IO non disponible - Mode local uniquement');
            this.fallbackToLocalMode();
            return;
        }

        try {
            this.socket = io(this.serverURL, {
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: this.maxReconnectAttempts,
                timeout: 10000
            });

            this.setupEventHandlers();
            console.log('🔌 Connexion au serveur WebSocket en cours...');
        } catch (error) {
            console.error('❌ Erreur de connexion WebSocket:', error);
            this.fallbackToLocalMode();
        }
    },

    setupEventHandlers() {
        // Connexion réussie
        this.socket.on('connect', () => {
            console.log('✅ Connecté au serveur WebSocket');
            this.isConnected = true;
            this.reconnectAttempts = 0;

            // S'authentifier
            this.socket.emit('user:connect', {
                userId: this.userId,
                username: this.username
            });

            // Afficher l'indicateur de connexion
            this.updateConnectionStatus(true);

            // Trigger custom event
            this.trigger('connected');
        });

        // Confirmation de connexion
        this.socket.on('connection:success', (data) => {
            this.userId = data.userId;
            this.username = data.username;

            // Sauvegarder dans localStorage
            localStorage.setItem('quantum_quiz_user_id', this.userId);
            localStorage.setItem('quantum_quiz_username', this.username);

            console.log(`👤 Authentifié: ${this.username} (${this.userId})`);
            this.trigger('authenticated', data);
        });

        // Déconnexion
        this.socket.on('disconnect', (reason) => {
            console.log('❌ Déconnecté du serveur:', reason);
            this.isConnected = false;
            this.updateConnectionStatus(false);
            this.trigger('disconnected', { reason });
        });

        // Erreur de connexion
        this.socket.on('connect_error', (error) => {
            console.error('❌ Erreur de connexion:', error.message);
            this.reconnectAttempts++;

            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.warn('⚠️ Nombre maximum de tentatives de reconnexion atteint');
                this.fallbackToLocalMode();
            }
        });

        // Reconnexion
        this.socket.on('reconnect', (attemptNumber) => {
            console.log(`🔄 Reconnecté après ${attemptNumber} tentative(s)`);
            this.isConnected = true;
            this.updateConnectionStatus(true);
            this.trigger('reconnected', { attemptNumber });
        });

        // ====================================================================
        // ÉVÉNEMENTS SERVEUR
        // ====================================================================

        // Nouveau défi disponible
        this.socket.on('challenge:new', (data) => {
            console.log('🎲 Nouveau défi disponible:', data.challenge.id);
            this.trigger('challenge:new', data);
        });

        // Défi accepté par quelqu'un
        this.socket.on('challenge:participant', (data) => {
            console.log(`✓ ${data.username} a accepté le défi ${data.challengeId}`);
            this.trigger('challenge:participant', data);
        });

        // Défi complété
        this.socket.on('challenge:completed', (data) => {
            console.log(`🏆 Défi complété: ${data.challengeId} - Vainqueur: ${data.winner.username}`);
            this.trigger('challenge:completed', data);
        });

        // Résultat de défi
        this.socket.on('challenge:result', (data) => {
            console.log('🎯 Résultat du défi reçu');
            this.trigger('challenge:result', data);
        });

        // Mise à jour du leaderboard
        this.socket.on('leaderboard:update', (data) => {
            console.log('📊 Classement mis à jour');
            this.trigger('leaderboard:update', data);
        });

        // Changement dans le top 10
        this.socket.on('leaderboard:topChange', (data) => {
            console.log('🔥 Le top 10 a changé !');
            this.trigger('leaderboard:topChange', data);
        });

        // Utilisateur en ligne
        this.socket.on('user:online', (data) => {
            console.log(`👋 ${data.username} est en ligne`);
            this.trigger('user:online', data);
        });

        // Utilisateur hors ligne
        this.socket.on('user:offline', (data) => {
            console.log('👋 Un utilisateur s\'est déconnecté');
            this.trigger('user:offline', data);
        });

        // Succès débloqué
        this.socket.on('achievement:unlocked', (data) => {
            console.log(`🏅 Succès débloqué: ${data.achievementId}`);
            this.trigger('achievement:unlocked', data);
        });

        // Notification générale
        this.socket.on('notification', (data) => {
            console.log(`📬 Notification: ${data.message}`);
            this.trigger('notification', data);
        });

        // Mise à jour des stats globales
        this.socket.on('stats:update', (data) => {
            this.trigger('stats:update', data);
        });

        // Erreur serveur
        this.socket.on('error', (data) => {
            console.error('❌ Erreur serveur:', data.message);
            this.trigger('error', data);
        });
    },

    // ========================================================================
    // MÉTHODES D'ÉMISSION
    // ========================================================================

    // Créer un défi
    createChallenge(challengeData) {
        if (!this.isConnected) {
            console.warn('⚠️ Non connecté - utilisation du mode local');
            return this.fallbackCreateChallenge(challengeData);
        }

        this.socket.emit('challenge:create', challengeData);
    },

    // Accepter un défi
    acceptChallenge(challengeId) {
        if (!this.isConnected) {
            console.warn('⚠️ Non connecté - utilisation du mode local');
            return this.fallbackAcceptChallenge(challengeId);
        }

        this.socket.emit('challenge:accept', { challengeId });
    },

    // Compléter un défi
    completeChallenge(challengeId, score) {
        if (!this.isConnected) {
            console.warn('⚠️ Non connecté - utilisation du mode local');
            return this.fallbackCompleteChallenge(challengeId, score);
        }

        this.socket.emit('challenge:complete', { challengeId, score });
    },

    // Soumettre un score au leaderboard
    submitScore(scoreData) {
        if (!this.isConnected) {
            console.warn('⚠️ Non connecté - utilisation du mode local');
            return this.fallbackSubmitScore(scoreData);
        }

        this.socket.emit('leaderboard:submit', scoreData);
    },

    // Demander le leaderboard
    requestLeaderboard(filters = {}, limit = 10) {
        if (!this.isConnected) {
            console.warn('⚠️ Non connecté - utilisation du mode local');
            return;
        }

        this.socket.emit('leaderboard:request', { filters, limit });
    },

    // Mettre à jour le profil
    updateProfile(profileData) {
        if (!this.isConnected) {
            console.warn('⚠️ Non connecté - utilisation du mode local');
            return;
        }

        this.socket.emit('profile:update', profileData);
    },

    // Débloquer un succès
    unlockAchievement(achievementId) {
        if (!this.isConnected) {
            console.warn('⚠️ Non connecté - utilisation du mode local');
            return;
        }

        this.socket.emit('achievement:unlock', { achievementId });
    },

    // ========================================================================
    // EVENT LISTENERS PERSONNALISÉS
    // ========================================================================

    on(eventName, callback) {
        if (!this.eventListeners.has(eventName)) {
            this.eventListeners.set(eventName, []);
        }
        this.eventListeners.get(eventName).push(callback);
    },

    off(eventName, callback) {
        if (!this.eventListeners.has(eventName)) return;

        const listeners = this.eventListeners.get(eventName);
        const index = listeners.indexOf(callback);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    },

    trigger(eventName, data) {
        if (!this.eventListeners.has(eventName)) return;

        const listeners = this.eventListeners.get(eventName);
        listeners.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Erreur dans le listener ${eventName}:`, error);
            }
        });
    },

    // ========================================================================
    // FALLBACK MODE LOCAL
    // ========================================================================

    fallbackToLocalMode() {
        console.log('🔧 Basculement en mode local (localStorage uniquement)');
        this.isConnected = false;
        this.updateConnectionStatus(false);
        this.trigger('fallback:local');
    },

    fallbackCreateChallenge(challengeData) {
        // Utiliser le système multiplayer local
        if (window.MultiplayerSystem) {
            const profile = window.MultiplayerSystem.getUserProfile();
            return window.MultiplayerSystem.createChallenge({
                ...challengeData,
                creatorUsername: profile.username
            });
        }
    },

    fallbackAcceptChallenge(challengeId) {
        if (window.MultiplayerSystem) {
            const profile = window.MultiplayerSystem.getUserProfile();
            return window.MultiplayerSystem.acceptChallenge(challengeId, profile.username);
        }
    },

    fallbackCompleteChallenge(challengeId, score) {
        if (window.MultiplayerSystem) {
            const profile = window.MultiplayerSystem.getUserProfile();
            return window.MultiplayerSystem.completeChallenge(challengeId, profile.username, score);
        }
    },

    fallbackSubmitScore(scoreData) {
        if (window.MultiplayerSystem) {
            const profile = window.MultiplayerSystem.getUserProfile();
            window.MultiplayerSystem.addToLeaderboard({
                ...scoreData,
                username: profile.username
            });
        }
    },

    // ========================================================================
    // UI HELPERS
    // ========================================================================

    updateConnectionStatus(connected) {
        // Créer ou mettre à jour l'indicateur de connexion
        let indicator = document.getElementById('ws-connection-indicator');

        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'ws-connection-indicator';
            indicator.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 0.5rem 1rem;
                border-radius: 8px;
                font-size: 0.9rem;
                font-weight: 600;
                z-index: 9999;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                transition: all 0.3s;
            `;
            document.body.appendChild(indicator);
        }

        if (connected) {
            indicator.innerHTML = '🟢 En ligne';
            indicator.style.background = 'rgba(34, 197, 94, 0.2)';
            indicator.style.border = '1px solid #22c55e';
            indicator.style.color = '#22c55e';
        } else {
            indicator.innerHTML = '🔴 Hors ligne';
            indicator.style.background = 'rgba(239, 68, 68, 0.2)';
            indicator.style.border = '1px solid #ef4444';
            indicator.style.color = '#ef4444';
        }

        // Masquer après 5 secondes si connecté
        if (connected) {
            setTimeout(() => {
                indicator.style.opacity = '0';
                setTimeout(() => {
                    indicator.style.display = 'none';
                }, 300);
            }, 5000);
        } else {
            indicator.style.opacity = '1';
            indicator.style.display = 'flex';
        }
    },

    // ========================================================================
    // DÉCONNEXION
    // ========================================================================

    disconnect() {
        if (this.socket && this.isConnected) {
            this.socket.disconnect();
            console.log('🔌 Déconnecté du serveur WebSocket');
        }
    }
};

// Export global
window.WebSocketClient = WebSocketClient;

console.log('✅ WebSocket Client chargé');
