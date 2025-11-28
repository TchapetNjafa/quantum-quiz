# Quantum Quiz - PHY321

Application interactive de quiz pour le cours **PHY321 : Introduction à la Mécanique Quantique** à l'Université de Yaoundé I, Cameroun.

[![CI](https://github.com/uy1/quantum-quiz/actions/workflows/ci.yml/badge.svg)](https://github.com/uy1/quantum-quiz/actions/workflows/ci.yml)
[![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)](https://github.com/uy1/quantum-quiz)
[![License](https://img.shields.io/badge/license-CC--BY--NC--SA--4.0-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![Tests](https://img.shields.io/badge/tests-73%20passing-success.svg)](tests/)

## Table des Matières

- [Fonctionnalités](#fonctionnalités)
- [Installation](#installation)
- [Utilisation](#utilisation)
- [Architecture](#architecture)
- [Contenu Pédagogique](#contenu-pédagogique)
- [Mode Multi-joueurs](#mode-multi-joueurs)
- [Tests](#tests)
- [Déploiement](#déploiement)
- [API](#api)
- [Contribution](#contribution)
- [Licence](#licence)

---

## Fonctionnalités

### Quiz Interactifs
- **762 questions** couvrant 6 chapitres de mécanique quantique
- **8 types de questions** : QCM, Vrai/Faux, Hotspot, Drag & Drop, Flashcards, Numériques, Matching, Interprétation
- **3 niveaux de difficulté** : Facile, Moyen, Difficile
- **2 modes** : Entraînement (avec aide) et Examen (chronométré)

### Interface Moderne
- Design responsive (mobile-first)
- Thème sombre/clair
- Rendu LaTeX avec MathJax 3
- Animations CSS fluides
- PWA installable (hors-ligne)

### Gamification et Multi-joueurs
- **Système XP et niveaux** : Progressez en complétant des quiz
- **8 succès débloquables** : Premier Pas, Perfection, Marathon, etc.
- **Classement global** : Comparez-vous aux autres étudiants
- **Défis entre pairs** : Créez et acceptez des défis en temps réel
- **Profil utilisateur** : Statistiques détaillées et historique

### Sécurité et Performance
- Rate limiting (API et WebSocket)
- Validation des entrées (express-validator)
- Headers de sécurité (Helmet)
- Base de données SQLite persistante
- Mode WAL pour les performances

---

## Installation

### Mode Local (Sans serveur)

```bash
# Cloner le repository
git clone https://github.com/uy1/quantum-quiz.git
cd quantum-quiz

# Lancer un serveur HTTP local
python3 -m http.server 8000
# ou
npm run serve

# Ouvrir dans le navigateur
open http://localhost:8000
```

### Mode Complet (Avec Multi-joueurs)

```bash
# Installer les dépendances
npm install

# Démarrer le serveur WebSocket + API
npm start

# Mode développement (avec rechargement auto)
npm run dev
```

Le serveur démarre sur `http://localhost:3000` (API) et le frontend sur `http://localhost:8000`.

---

## Utilisation

### Démarrer un Quiz

1. Ouvrez `index.html`
2. Sélectionnez chapitre, nombre de questions, difficulté, mode
3. Cliquez "Démarrer le Quiz"
4. Répondez aux questions
5. Consultez vos résultats détaillés avec graphiques

### Pages Disponibles

| Page | Description |
|------|-------------|
| `index.html` | Page d'accueil et configuration |
| `quiz.html` | Interface du quiz |
| `results.html` | Résultats détaillés avec export PDF |
| `leaderboard.html` | Classement global |
| `challenges.html` | Défis entre joueurs |
| `profile.html` | Profil et statistiques |
| `about.html` | À propos du projet |

---

## Architecture

```
quantum-quiz/
├── index.html, quiz.html, results.html    # Pages principales
├── css/                                    # Styles
│   ├── main.css                           # Styles globaux + thèmes
│   ├── quiz.css                           # Styles du quiz
│   └── responsive.css                     # Media queries
├── js/                                     # JavaScript frontend
│   ├── app.js                             # Point d'entrée
│   ├── quiz-engine.js                     # Logique du quiz
│   ├── question-renderer.js               # Rendu des questions
│   ├── results.js                         # Page résultats
│   ├── statistics.js                      # Graphiques Chart.js
│   ├── storage.js                         # Gestion localStorage
│   └── utils.js                           # Utilitaires
├── server/                                 # Backend Node.js
│   ├── server.js                          # Serveur Express + Socket.IO
│   └── database.js                        # SQLite avec better-sqlite3
├── data/
│   └── questions.json                     # 762 questions
├── tests/                                  # Tests Jest
│   ├── setup.js                           # Configuration Jest
│   ├── utils.test.js                      # Tests utilitaires
│   ├── storage.test.js                    # Tests storage
│   └── quiz-engine.test.js                # Tests quiz engine
└── .github/workflows/                      # CI/CD GitHub Actions
    ├── ci.yml                             # Tests et validation
    └── deploy.yml                         # Déploiement GitHub Pages
```

---

## Contenu Pédagogique

| Chapitre | Titre | Questions |
|----------|-------|-----------|
| **Ch1** | États Quantiques | 132 |
| **Ch2** | Mesures et Opérateurs | 157 |
| **Ch3** | Postulats de la MQ | 100 |
| **Ch4** | Multi-qubits et Intrication | 147 |
| **Ch5** | Fonctions d'État | 120 |
| **Ch6** | Oscillateur Harmonique | 106 |
| **TOTAL** | | **762** |

### Types de Questions

- `qcm` - Questions à choix multiples (415 questions)
- `vrai_faux` - Vrai ou Faux (67 questions)
- `hotspot` - Cliquer sur une zone d'image (33 questions)
- `drag_drop` - Glisser-déposer (33 questions)
- `flashcard` - Cartes recto-verso (34 questions)
- `numerical` - Réponse numérique avec tolérance (14 questions)
- `matching` - Association (7 questions)
- `interpretation` - Réponse libre (6 questions)

---

## Tests

```bash
# Exécuter tous les tests
npm test

# Tests avec watch mode
npm run test:watch

# Tests avec détails
npm run test:verbose

# Valider le JSON des questions
npm run validate
```

**73 tests** couvrant :
- Fonctions utilitaires (shuffleArray, formatTime, etc.)
- Gestion du stockage (localStorage)
- Moteur de quiz (filtrage, scoring, progression)

---

## Déploiement

### GitHub Pages (Statique)

Le déploiement est automatique via GitHub Actions sur push vers `main`.

```bash
git push origin main
# Le workflow deploy.yml s'exécute automatiquement
```

### Serveur de Production

```bash
# Installation production
npm ci --production

# Démarrage avec PM2
pm2 start server/server.js --name quantum-quiz

# Variables d'environnement
export PORT=3000
export DB_PATH=/var/data/quantum-quiz.db
```

### Docker (optionnel)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

---

## API

### REST Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/leaderboard` | Classement (filtrable) |
| POST | `/api/score` | Soumettre un score |
| GET | `/api/challenges` | Liste des défis actifs |
| POST | `/api/challenges` | Créer un défi |
| GET | `/api/user/:id` | Profil utilisateur |

### WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `user:register` | Client → Serveur | Inscription utilisateur |
| `leaderboard:update` | Serveur → Client | Mise à jour classement |
| `challenge:created` | Serveur → Client | Nouveau défi créé |
| `challenge:completed` | Serveur → Client | Défi terminé |

---

## Scripts NPM

```bash
npm start          # Démarrer le serveur
npm run dev        # Mode développement (nodemon)
npm test           # Exécuter les tests
npm run lint       # Vérifier le code (ESLint)
npm run lint:fix   # Corriger automatiquement
npm run validate   # Valider questions.json
npm run serve      # Serveur HTTP Python
```

---

## Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commiter (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Pusher (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

### Ajouter des Questions

Éditez `data/questions.json` en suivant le format :

```json
{
  "id": "ch1-q999",
  "type": "qcm",
  "difficulty": "medium",
  "question": "Question avec $\\LaTeX$",
  "options": ["A", "B", "C", "D"],
  "correct_answer": 0,
  "explanation": "Explication détaillée...",
  "section_ref": "1.2",
  "tags": ["concept1", "concept2"]
}
```

---

## Licence

**CC BY-NC-SA 4.0** - Université de Yaoundé I

Vous êtes autorisé à :
- Partager - copier et redistribuer
- Adapter - remixer, transformer

Sous les conditions :
- Attribution
- Pas d'utilisation commerciale
- Partage dans les mêmes conditions

---

## Contact

- **Issues** : [GitHub Issues](https://github.com/uy1/quantum-quiz/issues)
- **Email** : quantum-quiz@uy1.cm

---

**Fait avec soin pour les étudiants de l'Université de Yaoundé I**

Version 2.1.0 | Mise à jour : 28 Novembre 2025
