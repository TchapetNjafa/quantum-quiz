# 🔧 Guide d'Extension - Quantum Quiz PHY321

Guide complet pour étendre et personnaliser la plateforme de quiz.

---

## 📝 Table des Matières

1. [Ajouter de Nouvelles Questions](#ajouter-de-nouvelles-questions)
2. [Créer un Nouveau Type de Question](#créer-un-nouveau-type-de-question)
3. [Ajouter un Nouveau Chapitre](#ajouter-un-nouveau-chapitre)
4. [Personnaliser le Design](#personnaliser-le-design)
5. [Ajouter des Fonctionnalités](#ajouter-des-fonctionnalités)
6. [Intégration avec des Systèmes Externes](#intégration-avec-des-systèmes-externes)

---

## 1. Ajouter de Nouvelles Questions

### Méthode Manuelle

Éditez `data/questions.json` :

```json
{
  "id": "ch1-q101",
  "type": "qcm",
  "difficulty": "medium",
  "question": "Quelle est la signification physique de $|\\psi|^2$ ?",
  "options": [
    "L'énergie de la particule",
    "La densité de probabilité de présence",
    "La vitesse de la particule",
    "Le moment angulaire"
  ],
  "correct_answer": 1,
  "explanation": "Le carré du module de la fonction d'onde $|\\psi(x,t)|^2$ représente la densité de probabilité de trouver la particule en position $x$ à l'instant $t$. C'est un postulat fondamental de la mécanique quantique.",
  "section_ref": "1.2.2",
  "formula": "$P(x) = |\\psi(x)|^2$",
  "tags": ["fonction d'onde", "probabilité", "Born"],
  "time_estimate": 60,
  "points": 1
}
```

### Validation

Après ajout, validez la structure :

```bash
python3 scripts/validate_questions.py
```

### Checklist Qualité

- [ ] ID unique (format `chX-qXXX`)
- [ ] Type valide (`qcm`, `vrai_faux`, `matching`, `numerical`, `interpretation`)
- [ ] Difficulté valide (`easy`, `medium`, `hard`)
- [ ] Question claire et précise (> 10 caractères)
- [ ] Réponses correctes vérifiées
- [ ] Explication pédagogique fournie
- [ ] Référence de section du cours
- [ ] Tags descriptifs (2-4 tags)
- [ ] Formules en LaTeX si applicable
- [ ] Estimation du temps réaliste (30-120s)

---

## 2. Créer un Nouveau Type de Question

### Étape 1 : Définir la Structure

Exemple : Type "Ordonnancement" (ordonner des étapes)

```json
{
  "type": "ordering",
  "items": [
    "Préparation de l'état initial",
    "Application de l'opérateur",
    "Mesure de l'observable",
    "Réduction du paquet d'onde"
  ],
  "correct_order": [0, 1, 2, 3]
}
```

### Étape 2 : Ajouter le Rendu (`question-renderer.js`)

```javascript
const QuestionRenderer = {
    // ... existing code ...

    render(question, container, mode) {
        // ... existing types ...

        if (question.type === 'ordering') {
            return this.renderOrdering(question, container, mode);
        }
    },

    renderOrdering(question, container, mode) {
        const items = question.items;

        let html = `
            <div class="ordering-container">
                <p class="ordering-instructions">
                    Glissez-déposez les éléments dans le bon ordre
                </p>
                <ul class="ordering-list" id="ordering-list">`;

        // Mélange les items si mode quiz
        const shuffled = mode === 'quiz'
            ? this.shuffleArray([...items])
            : items;

        shuffled.forEach((item, index) => {
            html += `
                <li class="ordering-item" draggable="true" data-index="${index}">
                    <span class="drag-handle">⋮⋮</span>
                    <span class="item-text">${item}</span>
                </li>`;
        });

        html += `</ul></div>`;
        container.innerHTML = html;

        // Active drag & drop
        this.setupDragAndDrop();
    },

    setupDragAndDrop() {
        const list = document.getElementById('ordering-list');
        let draggedItem = null;

        list.addEventListener('dragstart', (e) => {
            draggedItem = e.target;
            e.target.classList.add('dragging');
        });

        list.addEventListener('dragend', (e) => {
            e.target.classList.remove('dragging');
        });

        list.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = this.getDragAfterElement(list, e.clientY);
            if (afterElement == null) {
                list.appendChild(draggedItem);
            } else {
                list.insertBefore(draggedItem, afterElement);
            }
        });
    },

    getDragAfterElement(container, y) {
        const draggableElements = [
            ...container.querySelectorAll('.ordering-item:not(.dragging)')
        ];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    },

    getUserAnswer(container, question) {
        if (question.type === 'ordering') {
            const items = container.querySelectorAll('.ordering-item');
            return Array.from(items).map(item => item.textContent.trim());
        }
        // ... existing types ...
    },

    checkAnswer(userAnswer, question) {
        if (question.type === 'ordering') {
            const correctOrder = question.correct_order.map(i => question.items[i]);
            const isCorrect = JSON.stringify(userAnswer) === JSON.stringify(correctOrder);

            return {
                correct: isCorrect,
                message: isCorrect
                    ? 'Excellent ! Ordre correct.'
                    : `Ordre incorrect. L'ordre correct était : ${correctOrder.join(' → ')}`
            };
        }
        // ... existing types ...
    }
};
```

### Étape 3 : Ajouter les Styles (`css/quiz.css`)

```css
.ordering-container {
    padding: var(--space-lg);
}

.ordering-list {
    list-style: none;
    padding: 0;
    margin: var(--space-md) 0;
}

.ordering-item {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md);
    margin: var(--space-sm) 0;
    background: var(--secondary);
    border: 2px solid var(--primary);
    border-radius: 8px;
    cursor: move;
    transition: var(--transition);
}

.ordering-item.dragging {
    opacity: 0.5;
    transform: scale(1.02);
}

.drag-handle {
    color: var(--accent);
    font-size: 1.2rem;
    cursor: grab;
}

.drag-handle:active {
    cursor: grabbing;
}
```

### Étape 4 : Mettre à Jour la Validation

Dans `scripts/validate_questions.py` :

```python
VALID_TYPES = ['qcm', 'vrai_faux', 'matching', 'numerical', 'interpretation', 'ordering']

def validate_ordering(self, question):
    """Valide une question d'ordonnancement"""
    q_id = question.get('id', 'NO_ID')

    if 'items' not in question:
        self.errors.append(f"[{q_id}] Ordering sans items")
        return

    if 'correct_order' not in question:
        self.errors.append(f"[{q_id}] Ordering sans correct_order")
        return

    items = question['items']
    correct_order = question['correct_order']

    if len(items) < 2:
        self.errors.append(f"[{q_id}] Ordering avec moins de 2 items")

    if len(correct_order) != len(items):
        self.errors.append(f"[{q_id}] Ordering: correct_order ne correspond pas aux items")
```

---

## 3. Ajouter un Nouveau Chapitre

### Étape 1 : Données (`data/questions.json`)

```json
{
  "chapters": [
    // ... chapitres existants ...
    {
      "chapter_id": 7,
      "chapter_number": "7",
      "chapter_title": "Spin et Moment Angulaire",
      "chapter_description": "Étude du spin et du moment angulaire en mécanique quantique",
      "section_reference": "Sections 7.1-7.4",
      "key_concepts": [
        "Spin 1/2",
        "Matrices de Pauli",
        "Moment angulaire orbital",
        "Couplage spin-orbite"
      ],
      "questions": [
        // ... vos questions ...
      ]
    }
  ]
}
```

### Étape 2 : Interface (`index.html`)

Ajoutez l'option dans le sélecteur :

```html
<select id="chapter-select" class="config-select">
    <option value="all">Tous les chapitres</option>
    <option value="1">Chapitre 1 : États Quantiques</option>
    <!-- ... chapitres existants ... -->
    <option value="7">Chapitre 7 : Spin et Moment Angulaire</option>
</select>
```

### Étape 3 : Mapping (`js/quiz-engine.js`)

Mettez à jour la fonction `updateQuizHeader()` :

```javascript
const chapterNames = {
    '1': 'Chapitre 1 : États Quantiques',
    // ... existants ...
    '7': 'Chapitre 7 : Spin et Moment Angulaire'
};
```

### Étape 4 : Images

Créez le dossier et ajoutez les images :

```bash
mkdir -p assets/images/ch7
```

Puis référencez dans vos questions :

```json
{
  "image_url": "assets/images/ch7/spin-precession.svg",
  "image_alt": "Précession du spin"
}
```

---

## 4. Personnaliser le Design

### Thème Personnalisé

Créez `css/theme-custom.css` :

```css
:root {
  /* Couleurs personnalisées */
  --primary: #2c3e50;
  --secondary: #34495e;
  --accent: #3498db;
  --success: #27ae60;
  --warning: #f39c12;
  --error: #c0392b;

  /* Polices personnalisées */
  --font-body: 'Roboto', sans-serif;
  --font-heading: 'Montserrat', sans-serif;

  /* Espacements personnalisés */
  --space-base: 8px;
  --space-xs: calc(var(--space-base) * 0.5);
  --space-sm: var(--space-base);
  --space-md: calc(var(--space-base) * 2);
  --space-lg: calc(var(--space-base) * 3);
  --space-xl: calc(var(--space-base) * 4);
}
```

Chargez-le dans vos pages HTML :

```html
<link rel="stylesheet" href="css/main.css">
<link rel="stylesheet" href="css/theme-custom.css">
```

### Mode Sombre/Clair

Ajoutez un toggle dans le HTML :

```html
<button id="theme-toggle" class="btn-icon">
    <span id="theme-icon">🌙</span>
</button>
```

JavaScript (`js/theme.js`) :

```javascript
const ThemeManager = {
    current: 'dark',

    init() {
        const saved = localStorage.getItem('theme') || 'dark';
        this.setTheme(saved);

        document.getElementById('theme-toggle')?.addEventListener('click', () => {
            this.toggle();
        });
    },

    setTheme(theme) {
        this.current = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        const icon = document.getElementById('theme-icon');
        if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    },

    toggle() {
        const newTheme = this.current === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
});
```

CSS :

```css
:root {
    --bg-primary: #1a1a2e;
    --text-primary: #ffffff;
}

[data-theme="light"] {
    --bg-primary: #f8f9fa;
    --text-primary: #212529;
}

body {
    background: var(--bg-primary);
    color: var(--text-primary);
}
```

---

## 5. Ajouter des Fonctionnalités

### 5.1 Système de Favoris

**Storage (`js/favorites.js`) :**

```javascript
const FavoritesManager = {
    add(questionId) {
        const favorites = this.getAll();
        if (!favorites.includes(questionId)) {
            favorites.push(questionId);
            localStorage.setItem('favorites', JSON.stringify(favorites));
        }
    },

    remove(questionId) {
        let favorites = this.getAll();
        favorites = favorites.filter(id => id !== questionId);
        localStorage.setItem('favorites', JSON.stringify(favorites));
    },

    getAll() {
        const stored = localStorage.getItem('favorites');
        return stored ? JSON.parse(stored) : [];
    },

    has(questionId) {
        return this.getAll().includes(questionId);
    }
};
```

**Interface (dans question) :**

```javascript
function renderFavoriteButton(questionId) {
    const isFavorite = FavoritesManager.has(questionId);

    return `
        <button
            class="btn-favorite ${isFavorite ? 'active' : ''}"
            data-question-id="${questionId}"
            onclick="toggleFavorite('${questionId}')"
        >
            ${isFavorite ? '⭐' : '☆'} Favori
        </button>
    `;
}

function toggleFavorite(questionId) {
    if (FavoritesManager.has(questionId)) {
        FavoritesManager.remove(questionId);
    } else {
        FavoritesManager.add(questionId);
    }
    // Mettre à jour l'UI
}
```

### 5.2 Mode Flashcards

**Nouveau fichier `flashcards.html` :**

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Flashcards - PHY321</title>
    <link rel="stylesheet" href="css/main.css">
    <link rel="stylesheet" href="css/flashcards.css">
</head>
<body>
    <div class="flashcard-container">
        <div class="flashcard" id="flashcard">
            <div class="flashcard-front">
                <h3>Question</h3>
                <p id="question-text"></p>
            </div>
            <div class="flashcard-back">
                <h3>Réponse</h3>
                <p id="answer-text"></p>
            </div>
        </div>

        <div class="controls">
            <button id="prev-card">← Précédent</button>
            <button id="flip-card">Retourner</button>
            <button id="next-card">Suivant →</button>
        </div>
    </div>

    <script src="js/flashcards.js"></script>
</body>
</html>
```

**JavaScript (`js/flashcards.js`) :**

```javascript
const FlashcardsApp = {
    questions: [],
    currentIndex: 0,
    flipped: false,

    async init() {
        await this.loadQuestions();
        this.render();
        this.setupControls();
    },

    async loadQuestions() {
        // Charge depuis questions.json
        const response = await fetch('data/questions.json');
        const data = await response.json();

        // Flatten toutes les questions
        this.questions = data.chapters.flatMap(ch => ch.questions);
        this.questions = this.shuffleArray(this.questions);
    },

    render() {
        const question = this.questions[this.currentIndex];
        const card = document.getElementById('flashcard');

        document.getElementById('question-text').textContent = question.question;
        document.getElementById('answer-text').textContent = question.explanation;

        card.classList.toggle('flipped', this.flipped);
    },

    flip() {
        this.flipped = !this.flipped;
        this.render();
    },

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.questions.length;
        this.flipped = false;
        this.render();
    },

    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.questions.length) % this.questions.length;
        this.flipped = false;
        this.render();
    },

    setupControls() {
        document.getElementById('flip-card').addEventListener('click', () => this.flip());
        document.getElementById('next-card').addEventListener('click', () => this.next());
        document.getElementById('prev-card').addEventListener('click', () => this.prev());
    },

    shuffleArray(array) {
        return array.sort(() => Math.random() - 0.5);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    FlashcardsApp.init();
});
```

**CSS (`css/flashcards.css`) :**

```css
.flashcard-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: var(--space-xl);
}

.flashcard {
    width: 600px;
    height: 400px;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.6s;
    cursor: pointer;
}

.flashcard.flipped {
    transform: rotateY(180deg);
}

.flashcard-front,
.flashcard-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: var(--space-xl);
    background: var(--secondary);
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.flashcard-back {
    transform: rotateY(180deg);
    background: var(--primary);
}
```

### 5.3 Système de Niveaux/Badges

**Définition des badges (`js/achievements.js`) :**

```javascript
const Achievements = {
    badges: [
        {
            id: 'first_quiz',
            name: 'Premier Pas',
            description: 'Compléter votre premier quiz',
            icon: '🎯',
            condition: (stats) => stats.totalQuizzes >= 1
        },
        {
            id: 'quiz_master',
            name: 'Maître du Quiz',
            description: 'Compléter 50 quiz',
            icon: '🏆',
            condition: (stats) => stats.totalQuizzes >= 50
        },
        {
            id: 'perfect_score',
            name: 'Perfection',
            description: 'Obtenir 100% à un quiz',
            icon: '⭐',
            condition: (stats) => stats.bestScore === 100
        },
        {
            id: 'quick_thinker',
            name: 'Esprit Vif',
            description: 'Compléter un quiz en moins de 5 minutes',
            icon: '⚡',
            condition: (stats) => stats.fastestTime && stats.fastestTime < 300
        },
        {
            id: 'chapter_expert',
            name: 'Expert de Chapitre',
            description: 'Obtenir 90% ou plus sur tous les chapitres',
            icon: '📚',
            condition: (stats) => {
                const scores = Object.values(stats.scoresByChapter || {});
                return scores.length === 6 && scores.every(s => s >= 90);
            }
        }
    ],

    check(stats) {
        const earned = [];
        const unlocked = this.getUnlocked();

        this.badges.forEach(badge => {
            if (!unlocked.includes(badge.id) && badge.condition(stats)) {
                earned.push(badge);
                this.unlock(badge.id);
            }
        });

        return earned;
    },

    unlock(badgeId) {
        const unlocked = this.getUnlocked();
        if (!unlocked.includes(badgeId)) {
            unlocked.push(badgeId);
            localStorage.setItem('unlocked_badges', JSON.stringify(unlocked));
        }
    },

    getUnlocked() {
        const stored = localStorage.getItem('unlocked_badges');
        return stored ? JSON.parse(stored) : [];
    },

    showNotification(badge) {
        // Afficher une notification animée
        const notif = document.createElement('div');
        notif.className = 'badge-notification';
        notif.innerHTML = `
            <div class="badge-icon">${badge.icon}</div>
            <div class="badge-info">
                <strong>${badge.name}</strong>
                <p>${badge.description}</p>
            </div>
        `;
        document.body.appendChild(notif);

        setTimeout(() => {
            notif.classList.add('show');
        }, 100);

        setTimeout(() => {
            notif.classList.remove('show');
            setTimeout(() => notif.remove(), 300);
        }, 5000);
    }
};
```

**Intégration dans `storage.js` :**

```javascript
updateStats(results) {
    const stats = this.getStats();
    // ... mise à jour des stats ...

    // Vérifier les nouveaux badges
    const newBadges = Achievements.check(stats);
    newBadges.forEach(badge => {
        Achievements.showNotification(badge);
    });
}
```

---

## 6. Intégration avec des Systèmes Externes

### 6.1 API Backend (Node.js/Express)

**Serveur (`server.js`) :**

```javascript
const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

// Endpoint : sauvegarder un résultat
app.post('/api/results', (req, res) => {
    const { userId, quizResults } = req.body;

    // Sauvegarder dans base de données
    // ...

    res.json({ success: true, id: 'result_123' });
});

// Endpoint : récupérer l'historique
app.get('/api/history/:userId', (req, res) => {
    const { userId } = req.params;

    // Récupérer de la base de données
    // ...

    res.json({ history: [...] });
});

app.listen(3000, () => {
    console.log('API running on port 3000');
});
```

**Frontend (`js/api.js`) :**

```javascript
const API = {
    baseURL: 'http://localhost:3000/api',

    async saveResults(userId, results) {
        const response = await fetch(`${this.baseURL}/results`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, quizResults: results })
        });
        return response.json();
    },

    async getHistory(userId) {
        const response = await fetch(`${this.baseURL}/history/${userId}`);
        return response.json();
    }
};
```

### 6.2 Authentification (Firebase)

```javascript
// Configuration Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "quantum-quiz.firebaseapp.com",
    projectId: "quantum-quiz"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Login
async function login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        return { success: true, user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
```

### 6.3 Synchronisation Cloud (Google Drive API)

```javascript
const DriveSync = {
    async saveToCloud(data) {
        const response = await gapi.client.drive.files.create({
            resource: {
                name: 'quantum-quiz-backup.json',
                mimeType: 'application/json'
            },
            media: {
                mimeType: 'application/json',
                body: JSON.stringify(data)
            }
        });
        return response;
    },

    async loadFromCloud() {
        const response = await gapi.client.drive.files.list({
            q: "name='quantum-quiz-backup.json'"
        });
        // Récupérer et parser le fichier
    }
};
```

---

## 📚 Ressources Additionnelles

### Documentation Externe

- [MDN Web Docs](https://developer.mozilla.org/) - Documentation web complète
- [MathJax Documentation](https://docs.mathjax.org/) - LaTeX dans le navigateur
- [Chart.js Documentation](https://www.chartjs.org/docs/) - Graphiques JavaScript
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) - Audio dans le navigateur

### Outils de Développement

- [Visual Studio Code](https://code.visualstudio.com/) - Éditeur recommandé
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/) - Débogage
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance audit
- [ESLint](https://eslint.org/) - Linting JavaScript

### Tests

```bash
# Installer Jest pour tests unitaires
npm install --save-dev jest

# Exemple de test
// __tests__/question-renderer.test.js
describe('QuestionRenderer', () => {
    test('checkAnswer validates QCM correctly', () => {
        const question = {
            type: 'qcm',
            correct_answer: 1,
            options: ['A', 'B', 'C', 'D']
        };

        const result = QuestionRenderer.checkAnswer(1, question);
        expect(result.correct).toBe(true);
    });
});
```

---

## 🎯 Bonnes Pratiques

1. **Toujours valider les données** avant de les ajouter
2. **Tester sur plusieurs navigateurs** (Chrome, Firefox, Safari)
3. **Optimiser les images** (SVG préféré, compression PNG/JPG)
4. **Commenter le code** pour les sections complexes
5. **Versionner avec Git** pour tracer les changements
6. **Faire des backups réguliers** de `questions.json`
7. **Tester en mode mobile** (responsive)
8. **Mesurer les performances** (Lighthouse)

---

**Version** : 1.0
**Dernière mise à jour** : 23 novembre 2025
**Support** : Département de Physique, Université de Yaoundé I
