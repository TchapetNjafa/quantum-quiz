# Architecture WebSocket - Quantum Quiz Multiplayer

## Vue d'ensemble

Cette architecture permet la synchronisation en temps réel des fonctionnalités multi-joueurs du Quantum Quiz, incluant les défis, le classement et les notifications.

## Technologies

- **Backend**: Node.js + Express.js
- **WebSocket**: Socket.IO (pour la compatibilité navigateur et les reconnexions automatiques)
- **Stockage**: En mémoire (Redis recommandé pour la production)
- **Client**: JavaScript vanilla avec Socket.IO client

## Architecture Système

```
┌─────────────────┐         WebSocket (Socket.IO)         ┌──────────────────┐
│                 │◄────────────────────────────────────────┤                  │
│  Client Web     │                                         │  Serveur Node.js │
│  (Browser)      │          HTTP REST API                  │  + Socket.IO     │
│                 │◄────────────────────────────────────────┤                  │
└─────────────────┘                                         └──────────────────┘
        │                                                            │
        │                                                            │
        │ Fallback: localStorage                                    │ Production:
        │ (mode hors ligne)                                         │ Redis/MongoDB
        │                                                            │
        ▼                                                            ▼
┌─────────────────┐                                         ┌──────────────────┐
│  localStorage   │                                         │  Base de données │
│  (local)        │                                         │  (persistante)   │
└─────────────────┘                                         └──────────────────┘
```

## Événements WebSocket

### Client → Serveur

| Événement | Données | Description |
|-----------|---------|-------------|
| `user:connect` | `{ username, userId }` | Connexion initiale d'un utilisateur |
| `challenge:create` | `{ challenge }` | Créer un nouveau défi |
| `challenge:accept` | `{ challengeId, username }` | Accepter un défi existant |
| `challenge:complete` | `{ challengeId, username, score }` | Compléter un défi |
| `leaderboard:request` | `{ filters }` | Demander le classement actualisé |
| `profile:update` | `{ userId, profileData }` | Mise à jour du profil utilisateur |
| `achievement:unlock` | `{ userId, achievementId }` | Déverrouiller un succès |

### Serveur → Client

| Événement | Données | Description |
|-----------|---------|-------------|
| `connection:success` | `{ userId, timestamp }` | Connexion établie avec succès |
| `challenge:new` | `{ challenge }` | Nouveau défi disponible |
| `challenge:accepted` | `{ challengeId, username }` | Un défi a été accepté |
| `challenge:completed` | `{ challengeId, result }` | Un défi a été complété |
| `leaderboard:update` | `{ leaderboard }` | Mise à jour du classement |
| `user:online` | `{ userId, username }` | Un utilisateur est en ligne |
| `user:offline` | `{ userId }` | Un utilisateur s'est déconnecté |
| `notification` | `{ type, message, data }` | Notification générale |

### Broadcast (à tous les clients)

| Événement | Description |
|-----------|-------------|
| `stats:update` | Statistiques globales (quiz complétés, joueurs actifs) |
| `leaderboard:topChange` | Changement dans le top 10 |

## Structure des Données

### Challenge
```javascript
{
  id: String,
  creatorUsername: String,
  creatorUserId: String,
  creatorScore: Number,
  chapter: Number,
  questionCount: Number,
  difficulty: String,
  mode: String,
  createdAt: String (ISO),
  expiresAt: String (ISO),
  participants: [
    { username, userId, score, completedAt }
  ],
  status: 'open' | 'completed' | 'expired'
}
```

### User Profile
```javascript
{
  userId: String (unique),
  username: String,
  avatar: String,
  totalScore: Number,
  quizzesCompleted: Number,
  averageScore: Number,
  bestScore: Number,
  level: Number,
  xp: Number,
  achievements: [String],
  joinDate: String (ISO),
  lastSeen: String (ISO),
  isOnline: Boolean
}
```

### Leaderboard Entry
```javascript
{
  userId: String,
  username: String,
  score: Number,
  chapter: Number,
  questionCount: Number,
  timeSpent: Number,
  date: String (ISO),
  mode: String
}
```

## Flux de Données

### 1. Création de Défi

```
Client A                    Serveur                     Clients B, C, D...
   │                           │                              │
   ├──challenge:create────────>│                              │
   │                           │                              │
   │<──challenge:created───────┤                              │
   │                           │                              │
   │                           ├──challenge:new──────────────>│
   │                           │                              │
```

### 2. Acceptation et Complétion de Défi

```
Client B                    Serveur                     Client A & autres
   │                           │                              │
   ├──challenge:accept────────>│                              │
   │                           │                              │
   │                           ├──challenge:accepted─────────>│
   │                           │                              │
   │  [Joue au quiz...]        │                              │
   │                           │                              │
   ├──challenge:complete──────>│                              │
   │                           │                              │
   │<──challenge:result────────┤                              │
   │                           │                              │
   │                           ├──challenge:completed────────>│
   │                           │                              │
   │                           ├──leaderboard:update─────────>│
   │                           │                              │
```

### 3. Mise à Jour du Classement en Temps Réel

```
Tous les clients            Serveur
   │                           │
   │<──leaderboard:update──────┤  (Diffusion périodique: 30s)
   │                           │
   │                           │  Ou sur événement:
   │<──leaderboard:topChange───┤  (Quand le top 10 change)
   │                           │
```

## Gestion des Connexions

### Reconnexion Automatique
- Socket.IO gère automatiquement les reconnexions
- Le client stocke le `userId` en localStorage
- À la reconnexion, envoie `user:reconnect` avec le `userId`
- Le serveur restaure l'état de session

### Mode Hors Ligne (Fallback)
- Si WebSocket échoue, le système continue en mode local (localStorage)
- Les données sont synchronisées dès que la connexion est rétablie
- Indication visuelle de l'état de connexion dans l'UI

## Sécurité

### Mesures Implémentées
1. **Validation des données**: Toutes les entrées sont validées côté serveur
2. **Rate limiting**: Limiter les requêtes par utilisateur (express-rate-limit)
3. **Authentification de session**: JWT ou tokens de session
4. **CORS**: Configuration stricte des origines autorisées
5. **Sanitization**: Échappement des données utilisateur (prevent XSS)

### À Implémenter pour Production
1. **HTTPS obligatoire** (wss:// au lieu de ws://)
2. **Authentification forte** (intégration avec système SSO UY1)
3. **Logging et monitoring** (Winston + Grafana)
4. **Backup automatique** des données
5. **Load balancing** pour scalabilité

## Scalabilité

### Phase Initiale (< 100 utilisateurs simultanés)
- Serveur Node.js unique
- Données en mémoire
- Déploiement: Heroku / Railway / Render

### Phase de Croissance (100-1000 utilisateurs)
- Redis pour le stockage des sessions et données en temps réel
- MongoDB pour la persistance des profils et historiques
- Clustering Node.js (PM2)

### Production (> 1000 utilisateurs)
- Socket.IO avec Redis adapter (synchronisation multi-serveurs)
- Load balancer (Nginx)
- Base de données répliquée
- CDN pour les assets statiques
- Monitoring: New Relic / Datadog

## Déploiement

### Développement Local
```bash
cd quantum-quiz
npm install
npm run dev
```

### Production
```bash
# Installer les dépendances
npm install --production

# Variables d'environnement
export PORT=3000
export NODE_ENV=production
export REDIS_URL=redis://...

# Démarrer avec PM2
pm2 start server/server.js --name quantum-quiz

# Monitoring
pm2 monit
```

## Monitoring et Logs

### Métriques Clés
- Connexions actives (utilisateurs en ligne)
- Messages par seconde
- Latence moyenne (ping)
- Défis créés/acceptés/complétés
- Erreurs WebSocket
- Taux de reconnexion

### Logs
- Connexions/déconnexions utilisateur
- Création et complétion de défis
- Erreurs et exceptions
- Changements dans le top 10

## Tests

### Tests Unitaires
- Validation des données
- Logique métier (scoring, achievements)
- Gestion des sessions

### Tests d'Intégration
- Flux de création/acceptation de défi
- Synchronisation du leaderboard
- Reconnexion automatique

### Tests de Charge
- Simulation de 100+ connexions simultanées
- Stress test de diffusion (broadcast)
- Test de déconnexion/reconnexion massive

## Roadmap

### Phase 1 (MVP) ✅
- [x] Architecture définie
- [x] Événements WebSocket spécifiés
- [ ] Serveur Node.js + Socket.IO
- [ ] Client WebSocket JS
- [ ] Fonctionnalités de base (défis, leaderboard)

### Phase 2 (Enrichissement)
- [ ] Redis pour cache et sessions
- [ ] MongoDB pour persistance
- [ ] Authentification JWT
- [ ] Notifications push
- [ ] Chat en direct pendant les défis

### Phase 3 (Production)
- [ ] Déploiement sur serveur UY1
- [ ] Monitoring et alertes
- [ ] Backup automatique
- [ ] Interface admin pour modération
- [ ] Analytics et statistiques avancées

## Références

- [Socket.IO Documentation](https://socket.io/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [WebSocket Security](https://owasp.org/www-community/vulnerabilities/WebSocket_Security)
