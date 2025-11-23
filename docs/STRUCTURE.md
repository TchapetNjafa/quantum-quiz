# 📐 Structure Technique - Quantum Quiz PHY321

Documentation technique complète de l'architecture de la plateforme de quiz.

---

## 📂 Architecture des Fichiers

```
quantum-quiz/
├── index.html              # Page d'accueil
├── quiz.html               # Page de quiz interactif
├── results.html            # Page de résultats détaillés
├── about.html              # À propos du cours
│
├── css/
│   ├── main.css            # Styles principaux et variables CSS
│   ├── quiz.css            # Styles spécifiques au quiz
│   ├── modal.css           # Styles des modales et impression
│   └── responsive.css      # Adaptations mobiles/tablettes
│
├── js/
│   ├── app.js              # Logique page d'accueil
│   ├── quiz-engine.js      # Moteur principal du quiz
│   ├── question-renderer.js # Rendu et validation des questions
│   ├── results.js          # Gestion de la page résultats
│   ├── storage.js          # LocalStorage (stats, historique)
│   ├── utils.js            # Fonctions utilitaires
│   ├── particles.js        # Animation de fond
│   ├── audio.js            # Système audio (Web Audio API)
│   ├── statistics.js       # Graphiques (Chart.js)
│   └── mathjax-config.js   # Configuration MathJax
│
├── data/
│   └── questions.json      # Base de données (509 questions)
│
├── assets/
│   └── images/
│       ├── ch1/            # Images Chapitre 1
│       ├── ch2/            # Images Chapitre 2
│       ├── ch4/            # Images Chapitre 4
│       └── ch6/            # Images Chapitre 6
│
├── scripts/
│   ├── generate_questions.py        # Génération automatique
│   ├── remove_generic_questions.py  # Nettoyage
│   └── validate_questions.py        # Validation qualité
│
└── docs/
    ├── STRUCTURE.md        # Ce fichier
    └── EXTENDING.md        # Guide d'extension
```

---

## 🏗️ Architecture Technique

### 1. Frontend - HTML/CSS/JavaScript Vanilla

**Technologies utilisées :**
- HTML5 sémantique
- CSS3 (Grid, Flexbox, Variables CSS, Animations)
- JavaScript ES6+ (Modules, Async/Await, Promises)
- Aucune dépendance de framework (React, Vue, etc.)

**Bibliothèques externes :**
- [MathJax 3](https://www.mathjax.org/) - Rendu LaTeX
- [Chart.js 4](https://www.chartjs.org/) - Graphiques statistiques

### 2. Stockage de Données

#### SessionStorage
Utilisé pour les données temporaires (durée de session) :
```javascript
{
  quiz_config: {
    chapter: "1",
    questionCount: 20,
    difficulties: ["easy", "medium"],
    questionTypes: ["qcm", "vrai_faux"],
    mode: "learning",
    timestamp: "2025-11-23T12:00:00.000Z"
  },
  quiz_results: {
    totalQuestions: 20,
    correctAnswers: 17,
    score: 85,
    timeSpent: 450,  // secondes
    details: [...]   // réponses détaillées
  }
}
```

#### LocalStorage
Utilisé pour les données persistantes :
```javascript
{
  user_stats: {
    totalQuizzes: 15,
    totalQuestions: 300,
    correctAnswers: 240,
    averageScore: 80,
    totalTime: 6750,
    averageTime: 450,
    lastQuizDate: "2025-11-23T12:00:00.000Z",
    scoresByDifficulty: {...},
    scoresByChapter: {...}
  },
  quiz_history: [
    {
      id: "quiz_1732362000000",
      chapter_id: "2",
      score: 85,
      total_questions: 20,
      correct_answers: 17,
      time_spent: 450,
      date: "2025-11-23T12:00:00.000Z"
    },
    ...
  ],
  audio_enabled: true,
  theme: "dark"  // Pour future implémentation
}
```

---

## 🔧 Modules JavaScript

### 1. `app.js` - Page d'Accueil

**Responsabilités :**
- Chargement initial des questions (`loadQuestions()`)
- Configuration du quiz (`startQuiz()`)
- Affichage des statistiques (`displayStats()`)
- Historique des quiz (`displayHistory()`)

**État Global :**
```javascript
const AppState = {
    questionsData: null,  // Données chargées
    isLoading: false      // État de chargement
};
```

### 2. `quiz-engine.js` - Moteur de Quiz

**Objet Principal :**
```javascript
const QuizEngine = {
    config: null,         // Configuration du quiz
    questions: [],        // Questions chargées
    currentIndex: 0,      // Index actuel
    answers: [],          // Réponses de l'utilisateur
    startTime: null,      // Timestamp de début
    timer: null,          // Intervalle du timer

    // Méthodes principales
    init()
    loadQuestions()
    setupUI()
    showQuestion(index)
    nextQuestion()
    previousQuestion()
    saveCurrentAnswer()
    submitQuiz()
    calculateResults()
};
```

**Flux de données :**
```
sessionStorage.quiz_config
    ↓
loadQuestions() → filtre + mélange → this.questions
    ↓
showQuestion(0) → QuestionRenderer.render()
    ↓
Utilisateur répond → saveCurrentAnswer() → this.answers[i]
    ↓
submitQuiz() → calculateResults() → sessionStorage.quiz_results
    ↓
Redirection vers results.html
```

### 3. `question-renderer.js` - Rendu des Questions

**Méthodes principales :**
```javascript
const QuestionRenderer = {
    render(question, container, mode)  // Affiche une question
    checkAnswer(userAnswer, question)  // Vérifie la réponse
    getUserAnswer(container, question) // Récupère la réponse

    // Rendus spécifiques par type
    renderQCM(question, container, mode)
    renderVraiFaux(question, container, mode)
    renderMatching(question, container, mode)
    renderNumerical(question, container, mode)
    renderInterpretation(question, container, mode)
};
```

**Modes de rendu :**
- `quiz` : Mode interactif (utilisateur répond)
- `review` : Mode révision (affiche correction)

### 4. `results.js` - Page de Résultats

**Objet Principal :**
```javascript
const ResultsPage = {
    results: null,
    initialized: false,  // Protection double init

    init()
    displayScore()       // Score principal
    displayStats()       // Statistiques détaillées
    displayReview()      // Révision question par question
    setupButtons()       // Boutons d'action
    shareResults()       // Partage enrichi
};
```

**Fonctionnalités des boutons :**
- Refaire ce quiz (même config)
- Reprendre les erreurs (questions ratées uniquement)
- Nouveau chapitre (retour accueil)
- Exporter PDF (impression propre)
- Partager (copie détaillée dans presse-papier)

### 5. `storage.js` - Gestion LocalStorage

```javascript
const StorageManager = {
    updateStats(results)      // MAJ statistiques globales
    addToHistory(results)     // Ajoute à l'historique
    getStats()                // Récupère stats
    getHistory()              // Récupère historique
    clearHistory()            // Nettoie historique
};
```

### 6. `audio.js` - Système Audio

**Basé sur Web Audio API :**
```javascript
const AudioSystem = {
    context: null,     // AudioContext
    enabled: true,     // État on/off

    init()
    play(frequency, duration, type, volume)

    // Sons prédéfinis
    correct()          // Do-Mi-Sol
    incorrect()        // Bip descendant
    click()            // Clic
    navigate()         // Navigation
    start()            // Démarrage
    success()          // Succès
    warning()          // Avertissement
    notify()           // Notification

    toggle()           // Active/désactive
};
```

---

## 📊 Format des Données

### Structure de `questions.json`

```json
{
  "course_info": {
    "title": "Introduction à la Mécanique Quantique",
    "code": "PHY321",
    "institution": "Université de Yaoundé I",
    "year": "2025-2026",
    "total_chapters": 6,
    "total_questions": 509
  },
  "chapters": [
    {
      "chapter_id": 1,
      "chapter_number": "1",
      "chapter_title": "États Quantiques",
      "chapter_description": "...",
      "section_reference": "Sections 1.1-1.4",
      "key_concepts": [...],
      "questions": [...]
    }
  ]
}
```

### Format d'une Question

**Champs communs (tous types) :**
```json
{
  "id": "ch1-q001",
  "type": "qcm",
  "difficulty": "easy",
  "question": "Quelle est...",
  "explanation": "Parce que...",
  "section_ref": "1.1.1",
  "formula": "$E = mc^2$",
  "image_url": "assets/images/ch1/bloch.svg",
  "image_alt": "Sphère de Bloch",
  "tags": ["superposition", "qubit"],
  "time_estimate": 45,
  "points": 1
}
```

**Type QCM :**
```json
{
  "type": "qcm",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct_answer": 1  // Index (0-3)
}
```

**Type Vrai/Faux :**
```json
{
  "type": "vrai_faux",
  "correct_answer": true  // Boolean
}
```

**Type Matching :**
```json
{
  "type": "matching",
  "pairs": [
    {"left": "Concept A", "right": "Définition A"},
    {"left": "Concept B", "right": "Définition B"}
  ]
}
```

**Type Numerical :**
```json
{
  "type": "numerical",
  "correct_answer": 36,
  "tolerance": 0.1,
  "unit": "%"
}
```

**Type Interpretation :**
```json
{
  "type": "interpretation",
  "key_points": ["Point 1", "Point 2", "Point 3"]
}
```

---

## 🎨 Système de Design

### Variables CSS

```css
:root {
  /* Couleurs */
  --primary: #0f3460;
  --secondary: #16213e;
  --accent: #00d9ff;
  --success: #4caf50;
  --warning: #ff9800;
  --error: #e94560;

  /* Espacements */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;

  /* Typographie */
  --font-body: 'Segoe UI', sans-serif;
  --font-heading: 'Segoe UI', sans-serif;

  /* Animations */
  --transition: 0.3s ease;
}
```

### Breakpoints Responsive

```css
/* Mobile */
@media (max-width: 768px) { ... }

/* Tablette */
@media (min-width: 769px) and (max-width: 1024px) { ... }

/* Desktop */
@media (min-width: 1025px) { ... }
```

---

## 🔄 Flux de Navigation

```
index.html (Accueil)
    |
    | Clic "Démarrer Quiz"
    ↓
quiz.html (Quiz en cours)
    |
    | Soumission quiz
    ↓
results.html (Résultats)
    |
    ├─ Refaire ce quiz ──→ quiz.html
    ├─ Reprendre erreurs ─→ quiz.html (customQuestions)
    ├─ Nouveau chapitre ──→ index.html
    ├─ Export PDF ────────→ window.print()
    └─ Partager ──────────→ clipboard
```

---

## 🔐 Sécurité et Bonnes Pratiques

### Prévention des Erreurs

1. **Validation des données**
   ```javascript
   const configStr = sessionStorage.getItem('quiz_config');
   if (!configStr) {
       showToast('Configuration manquante', 'error');
       return;
   }
   ```

2. **Protection contre doubles clics**
   ```javascript
   button.disabled = true;
   button.textContent = 'Chargement...';
   // Action
   ```

3. **Try/Catch sur actions critiques**
   ```javascript
   try {
       await this.loadQuestions();
   } catch (error) {
       console.error('Erreur:', error);
       showToast('Erreur de chargement', 'error');
   }
   ```

4. **Dédoublonnage des questions**
   ```javascript
   const seenIds = new Set();
   const uniqueQuestions = allQuestions.filter(q => {
       if (seenIds.has(q.id)) return false;
       seenIds.add(q.id);
       return true;
   });
   ```

### Performance

1. **Lazy loading des images**
   ```html
   <img loading="lazy" src="..." alt="...">
   ```

2. **Async/Await pour chargement**
   ```javascript
   async loadQuestions() {
       const response = await fetch('data/questions.json');
       const data = await response.json();
       // Traitement
   }
   ```

3. **Debouncing sur événements fréquents**
   (Non implémenté actuellement, mais recommandé pour search/filter)

---

## 📈 Statistiques et Métriques

### Données Collectées

- Nombre total de quiz effectués
- Questions répondues (total, correctes, incorrectes)
- Score moyen global
- Temps moyen par quiz
- Performance par chapitre
- Performance par difficulté
- Historique des 10 derniers quiz

### Graphiques (Chart.js)

1. **Radar Chart** - Performance par concept
2. **Line Chart** - Progression dans le temps
3. **Bar Chart** - Score par difficulté (potentiel)

---

## 🧪 Scripts de Maintenance

### `generate_questions.py`
Génère automatiquement des questions basées sur des templates.

### `validate_questions.py`
Valide la structure et la qualité de toutes les questions :
- Champs requis présents
- Types et difficultés valides
- Réponses correctes cohérentes
- IDs uniques

### `remove_generic_questions.py`
Nettoie les questions placeholder/génériques.

---

## 🚀 Performances

### Temps de Chargement

- `questions.json` : ~519 KB
- Chargement initial : < 1s (réseau rapide)
- Rendu d'une question : < 100ms
- Navigation entre questions : instantané

### Optimisations Possibles

1. Compression des images SVG
2. Minification JS/CSS en production
3. Service Worker pour mode hors ligne
4. Lazy loading du JSON par chapitre
5. Caching du JSON avec Cache API

---

## 🔮 Améliorations Futures

### Fonctionnalités
- [ ] Mode sombre/clair
- [ ] Sauvegarde cloud (compte utilisateur)
- [ ] Classement entre étudiants
- [ ] Notes personnelles sur questions
- [ ] Favoris/Marque-pages
- [ ] Mode révision flashcards
- [ ] Export notes en Markdown/PDF
- [ ] Synchronisation multi-appareils

### Techniques
- [ ] Progressive Web App (PWA)
- [ ] Mode hors ligne complet
- [ ] Backend API (Node.js/Python)
- [ ] Base de données (PostgreSQL/MongoDB)
- [ ] Authentification (JWT)
- [ ] WebSocket pour quiz en temps réel
- [ ] Tests unitaires (Jest)
- [ ] Tests E2E (Cypress/Playwright)

---

**Version** : 1.0
**Dernière mise à jour** : 23 novembre 2025
**Mainteneur** : Département de Physique, Université de Yaoundé I
