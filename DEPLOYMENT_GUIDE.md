# 🚀 Guide de Déploiement - Quantum Quiz

Ce guide détaille les étapes pour déployer Quantum Quiz en production.

---

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Déploiement Local (Développement)](#déploiement-local-développement)
3. [Déploiement sur GitHub Pages](#déploiement-sur-github-pages)
4. [Déploiement sur Railway](#déploiement-sur-railway)
5. [Déploiement sur Serveur UY1](#déploiement-sur-serveur-uy1)
6. [Configuration HTTPS](#configuration-https)
7. [Monitoring et Logs](#monitoring-et-logs)
8. [Backup et Restauration](#backup-et-restauration)
9. [Troubleshooting](#troubleshooting)

---

## Prérequis

### Serveur de Production
- **OS**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **RAM**: Minimum 512 MB (recommandé 1 GB+)
- **Espace Disque**: 500 MB minimum
- **CPU**: 1 vCPU minimum

### Logiciels Requis
- **Node.js**: 16.x ou supérieur
- **npm**: 8.x ou supérieur
- **Git**: 2.x+
- **PM2**: Pour gestion des processus
- **Nginx**: Pour reverse proxy (optionnel mais recommandé)

### Compétences
- Ligne de commande Linux de base
- Connaissance de SSH
- Notions de DNS et HTTP

---

## Déploiement Local (Développement)

### 1. Installation

\`\`\`bash
# Cloner le repository
git clone https://github.com/uy1/quantum-quiz.git
cd quantum-quiz

# Installer les dépendances
npm install

# Copier la configuration
cp .env.example .env
nano .env  # Éditer si nécessaire
\`\`\`

### 2. Démarrage Rapide

**Option A : Script automatique**
\`\`\`bash
./start.sh
# Choisir le mode (1: Local, 2: Complet)
\`\`\`

**Option B : Manuel**
\`\`\`bash
# Terminal 1 : Serveur WebSocket
npm start

# Terminal 2 : Serveur HTTP Frontend
python3 -m http.server 8000
\`\`\`

### 3. Vérification

Ouvrir dans le navigateur :
- Frontend : http://localhost:8000
- Backend API : http://localhost:3000/api/health

---

## Déploiement sur GitHub Pages

**Idéal pour** : Hébergement statique gratuit (mode local uniquement, sans WebSocket)

### Étapes

\`\`\`bash
# 1. Créer un repository GitHub
git remote add origin https://github.com/votre-username/quantum-quiz.git

# 2. Pousser le code
git add .
git commit -m "Initial commit"
git push -u origin main

# 3. Activer GitHub Pages
# Sur GitHub.com : Settings → Pages → Source: main branch → Save

# 4. Visiter votre site
# https://votre-username.github.io/quantum-quiz/
\`\`\`

### Configuration

**Aucune configuration requise** - L'application fonctionne directement en mode local.

### Limitations

- ❌ Pas de WebSocket (mode multi-joueurs limité au local)
- ✅ Mode hors ligne fonctionne
- ✅ Toutes les fonctionnalités de quiz fonctionnent

---

## Déploiement sur Railway

**Idéal pour** : Déploiement complet gratuit avec WebSocket (limites généreuses)

### Étapes

#### 1. Créer un Compte Railway

Visiter [railway.app](https://railway.app) et créer un compte (GitHub OAuth recommandé).

#### 2. Installer Railway CLI

\`\`\`bash
npm install -g @railway/cli
railway login
\`\`\`

#### 3. Initialiser le Projet

\`\`\`bash
cd quantum-quiz
railway init

# Suivre les instructions
# Nom du projet: quantum-quiz-uy1
\`\`\`

#### 4. Configurer les Variables

\`\`\`bash
railway variables set PORT=3000
railway variables set NODE_ENV=production
railway variables set CORS_ORIGIN=https://votre-domaine.com
\`\`\`

#### 5. Déployer

\`\`\`bash
railway up
\`\`\`

#### 6. Obtenir l'URL

\`\`\`bash
railway domain
# Exemple: quantum-quiz-uy1.up.railway.app
\`\`\`

### Configuration Frontend

Mettre à jour le frontend pour utiliser l'URL Railway :

Dans chaque page multiplayer (leaderboard.html, challenges.html, profile.html), ajouter :

\`\`\`html
<script src="js/websocket-client.js"></script>
<script>
  WebSocketClient.init({
    serverURL: 'https://quantum-quiz-uy1.up.railway.app'
  });
</script>
\`\`\`

### Limites Gratuites Railway

- ✅ 500 heures/mois
- ✅ Jusqu'à 8 GB RAM
- ✅ WebSocket supporté
- ⚠ Le service "dort" après 10 min d'inactivité (réveil automatique à la requête)

---

## Déploiement sur Serveur UY1

**Idéal pour** : Production complète avec contrôle total

### Prérequis Serveur

\`\`\`bash
# SSH vers le serveur
ssh admin@server.uy1.cm

# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Node.js 16+
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# Vérifier les versions
node --version  # v16.x+
npm --version   # 8.x+
\`\`\`

### Étape 1 : Cloner le Projet

\`\`\`bash
cd /var/www
sudo mkdir quantum-quiz
sudo chown $USER:$USER quantum-quiz
cd quantum-quiz

git clone https://github.com/uy1/quantum-quiz.git .
\`\`\`

### Étape 2 : Configuration

\`\`\`bash
# Installer les dépendances
npm install --production

# Configurer l'environnement
cp .env.example .env
nano .env
\`\`\`

**Fichier .env pour production** :
\`\`\`bash
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://quantum-quiz.uy1.cm
LOG_LEVEL=info
\`\`\`

### Étape 3 : Installer PM2

\`\`\`bash
# Installer PM2 globalement
sudo npm install -g pm2

# Démarrer l'application
pm2 start server/server.js --name quantum-quiz

# Sauvegarder la configuration
pm2 save

# Configurer le démarrage automatique
pm2 startup
# Copier et exécuter la commande affichée

# Vérifier le statut
pm2 status
pm2 logs quantum-quiz
\`\`\`

### Étape 4 : Configurer Nginx

#### 4.1 Installer Nginx

\`\`\`bash
sudo apt install -y nginx
\`\`\`

#### 4.2 Créer la Configuration

\`\`\`bash
sudo nano /etc/nginx/sites-available/quantum-quiz
\`\`\`

**Contenu** :
\`\`\`nginx
server {
    listen 80;
    server_name quantum-quiz.uy1.cm;

    # Logs
    access_log /var/log/nginx/quantum-quiz-access.log;
    error_log /var/log/nginx/quantum-quiz-error.log;

    # Frontend (fichiers statiques)
    location / {
        root /var/www/quantum-quiz;
        index index.html;
        try_files $uri $uri/ =404;

        # Cache statique
        location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 7d;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # Timeouts pour WebSocket
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }
}
\`\`\`

#### 4.3 Activer le Site

\`\`\`bash
# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/quantum-quiz /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx

# Vérifier le statut
sudo systemctl status nginx
\`\`\`

### Étape 5 : Configuration DNS

Chez votre fournisseur DNS (généralement l'hébergeur du domaine uy1.cm) :

\`\`\`
Type: A
Host: quantum-quiz
Value: <IP_DU_SERVEUR>
TTL: 3600
\`\`\`

Attendre la propagation DNS (1-24 heures).

### Étape 6 : Vérification

\`\`\`bash
# Vérifier que le site est accessible
curl http://quantum-quiz.uy1.cm

# Vérifier l'API
curl http://quantum-quiz.uy1.cm/api/health

# Logs PM2
pm2 logs quantum-quiz --lines 50

# Logs Nginx
sudo tail -f /var/log/nginx/quantum-quiz-access.log
\`\`\`

---

## Configuration HTTPS

**Obligatoire pour WebSocket en production** (wss:// au lieu de ws://)

### Option 1 : Let's Encrypt (Gratuit)

\`\`\`bash
# Installer Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtenir le certificat SSL
sudo certbot --nginx -d quantum-quiz.uy1.cm

# Suivre les instructions
# Choisir : Redirect (HTTP → HTTPS automatique)

# Vérifier le renouvellement automatique
sudo certbot renew --dry-run
\`\`\`

Certbot modifie automatiquement la config Nginx pour activer HTTPS.

### Option 2 : Certificat UY1 Existant

Si UY1 a déjà un certificat wildcard (*.uy1.cm) :

\`\`\`nginx
server {
    listen 443 ssl http2;
    server_name quantum-quiz.uy1.cm;

    ssl_certificate /etc/ssl/certs/uy1.crt;
    ssl_certificate_key /etc/ssl/private/uy1.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # ... reste de la config
}

# Redirection HTTP → HTTPS
server {
    listen 80;
    server_name quantum-quiz.uy1.cm;
    return 301 https://$server_name$request_uri;
}
\`\`\`

### Mettre à Jour le Frontend

Dans les pages multiplayer, changer http:// en https:// :

\`\`\`javascript
WebSocketClient.init({
  serverURL: 'https://quantum-quiz.uy1.cm'
});
\`\`\`

---

## Monitoring et Logs

### PM2 Monitoring

\`\`\`bash
# Dashboard en temps réel
pm2 monit

# Logs en direct
pm2 logs quantum-quiz

# Logs des 100 dernières lignes
pm2 logs quantum-quiz --lines 100

# Statistiques
pm2 show quantum-quiz
\`\`\`

### Nginx Logs

\`\`\`bash
# Logs d'accès
sudo tail -f /var/log/nginx/quantum-quiz-access.log

# Logs d'erreurs
sudo tail -f /var/log/nginx/quantum-quiz-error.log

# Analyser les logs avec GoAccess (optionnel)
sudo apt install goaccess
goaccess /var/log/nginx/quantum-quiz-access.log --log-format=COMBINED
\`\`\`

### Monitoring Avancé (Optionnel)

**PM2 Plus** (gratuit pour 1 serveur) :
\`\`\`bash
pm2 link <secret_key> <public_key>
# Créer un compte sur pm2.io
\`\`\`

**New Relic / Datadog** (payant) :
Suivre les instructions du fournisseur pour intégration Node.js.

---

## Backup et Restauration

### Sauvegarder les Données

\`\`\`bash
# Script de backup
#!/bin/bash
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_DIR="/backups/quantum-quiz"

mkdir -p $BACKUP_DIR

# Backup du code
tar -czf $BACKUP_DIR/code-$DATE.tar.gz /var/www/quantum-quiz

# Backup de la base de données (si MongoDB/Redis utilisés)
# mongodump --out $BACKUP_DIR/mongo-$DATE
# redis-cli --rdb $BACKUP_DIR/redis-$DATE.rdb

echo "Backup complété: $DATE"
\`\`\`

### Automatiser avec Cron

\`\`\`bash
# Éditer crontab
crontab -e

# Ajouter : Backup quotidien à 2h du matin
0 2 * * * /path/to/backup.sh
\`\`\`

### Restaurer

\`\`\`bash
# Restaurer le code
cd /var/www
sudo rm -rf quantum-quiz
sudo tar -xzf /backups/quantum-quiz/code-2025-11-26.tar.gz

# Relancer l'application
pm2 restart quantum-quiz
\`\`\`

---

## Troubleshooting

### Problème : Serveur ne démarre pas

**Diagnostic** :
\`\`\`bash
pm2 logs quantum-quiz --err
\`\`\`

**Solutions** :
- Vérifier que le port 3000 n'est pas déjà utilisé : `sudo lsof -i :3000`
- Vérifier les permissions : `ls -la server/server.js`
- Vérifier les dépendances : `npm install`

### Problème : WebSocket ne se connecte pas

**Diagnostic** :
- Console navigateur : Ouvrir DevTools → Console, chercher erreurs WebSocket
- Test direct : `curl http://localhost:3000/api/health`

**Solutions** :
- Vérifier CORS dans `.env` : `CORS_ORIGIN` doit matcher l'URL du frontend
- Vérifier Nginx config pour `/socket.io/`
- Tester sans Nginx : Accéder directement à `http://server:3000`

### Problème : Questions ne se chargent pas

**Diagnostic** :
- Console navigateur : Erreur 404 sur `data/questions.json` ?
- Vérifier chemin : `ls -la data/questions.json`

**Solutions** :
- Vérifier permissions : `chmod 644 data/questions.json`
- Vérifier JSON valide : `python3 -c "import json; json.load(open('data/questions.json'))"`

### Problème : Mémoire insuffisante

**Diagnostic** :
\`\`\`bash
pm2 monit  # Voir l'utilisation mémoire
free -h     # Mémoire système
\`\`\`

**Solutions** :
- Augmenter la RAM du serveur
- Limiter la mémoire Node : `pm2 start server/server.js --max-memory-restart 500M`
- Ajouter swap : `sudo dd if=/dev/zero of=/swapfile bs=1M count=1024 && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile`

### Problème : Site lent

**Diagnostic** :
- Chrome DevTools → Network : Temps de chargement ?
- `pm2 monit` : CPU élevé ?

**Solutions** :
- Activer compression gzip Nginx : `gzip on; gzip_types text/plain text/css application/json;`
- Mettre en cache les assets statiques (déjà dans la config Nginx ci-dessus)
- Utiliser CDN pour MathJax (déjà le cas)

---

## Checklist de Déploiement

### Avant de Déployer
- [ ] Code testé localement
- [ ] Variables d'environnement configurées
- [ ] Backup de la version précédente
- [ ] DNS configuré

### Déploiement
- [ ] Code déployé sur le serveur
- [ ] Dépendances installées (`npm install --production`)
- [ ] PM2 démarré et configuré
- [ ] Nginx configuré et rechargé
- [ ] HTTPS activé (Let's Encrypt)

### Après Déploiement
- [ ] Site accessible : https://quantum-quiz.uy1.cm
- [ ] API fonctionne : /api/health
- [ ] WebSocket connecté (indicateur 🟢 dans l'app)
- [ ] Logs propres (pas d'erreurs)
- [ ] Backup automatique configuré
- [ ] Monitoring actif

---

## Support

En cas de problème, consulter :
- **Logs** : `pm2 logs quantum-quiz`
- **Documentation** : `/docs` du projet
- **Issues GitHub** : https://github.com/uy1/quantum-quiz/issues

---

**Dernière mise à jour** : 26 Novembre 2025
**Version** : 2.0.0
