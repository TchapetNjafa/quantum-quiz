# Quiz Mécanique Quantique 🌌

Application web interactive de quiz en **Mécanique Quantique** (niveau universitaire), générée à partir d'un cours PDF. L'application permet de tester ses connaissances avec plus de 200 questions variées sous forme de QCM et de flashcards.

![Quantum Quiz](https://img.shields.io/badge/Quiz-Quantique-8B5CF6?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## 📋 Fonctionnalités principales

### 🎯 Types de questions
- **60% QCM** : Questions à choix multiples avec 4 options
- **40% Flashcards** : Cartes concept/définition avec système de révision

### 🎨 Interface utilisateur
- **Design thématique "Quantique"** : Fond avec particules animées, palette bleu/violet/cyan
- **Animation de la barre de progression** : Gradient animé
- **Support LaTeX/MathJax** : Rendu parfait des formules mathématiques
- **Animations 3D** : Flip animation pour les flashcards
- **Design responsive** : Mobile-first, adapté à tous les écrans

### 📊 Système de progression
- **Historique des quiz** : Sauvegarde dans localStorage
- **Statistiques détaillées** : Graphiques par catégorie, temps moyen par question
- **Badges déblocables** :
  - 🌟 Premier pas quantique (1er quiz complété)
  - 🎯 Cohérence (3 quiz >80%)
  - ⭐ Opérateur hermitien (100% à un quiz)
  - 🏃 Marathonien (10 quiz complétés)
  - 💎 Perfectionniste (5 quiz >90%)

### ⚙️ Options avancées
- **Sélection du nombre de questions** : Slider de 10 à 50 questions
- **Choix du mode** : QCM uniquement, Flashcards uniquement, ou Mixte
- **Filtrage par catégorie** : États quantiques, Mesure et opérateurs, etc.
- **Filtrage par difficulté** : Facile, Moyen, Difficile
- **Timer optionnel** : Compte à rebours ou chronomètre
- **Système audio** : Sons de feedback (activables/désactivables)

### ⌨️ Raccourcis clavier
- **1, 2, 3, 4** : Sélectionner une option QCM
- **Espace** : Question suivante
- **F** : Retourner la flashcard
- **P** : Pause
- **Échap** : Menu pause/abandon

### 📈 Écran des résultats
- **Animation d'apparition** : Confettis pour scores >80%
- **Score global** : Cercle de progression animé avec pourcentage et note/20
- **Message personnalisé** selon performance
- **Statistiques détaillées** : Graphiques par catégorie (radar chart)
- **Revue complète** : Toutes les questions avec explications
- **Actions finales** :
  - Recommencer avec nouvelles questions
  - Refaire les questions ratées
  - Télécharger les résultats (PDF) - *À implémenter*
  - Partager le score - *À implémenter*
  - Mode révision (flashcards ratées)

## 🗂️ Structure du projet

```
quantum-quiz/
├── index.html              # Page principale
├── css/
│   ├── style.css           # Styles principaux
│   └── themes.css          # Thèmes (clair/sombre)
├── js/
│   ├── app.js              # Contrôleur principal
│   ├── quiz-logic.js       # Moteur de quiz
│   ├── storage.js          # Gestion localStorage
│   └── particles.js        # Effet de particules
├── data/
│   └── questions.json      # Base de données de questions (200+)
├── assets/
│   ├── sounds/             # Sons (optionnel)
│   │   ├── correct.mp3
│   │   ├── incorrect.mp3
│   │   ├── click.mp3
│   │   └── complete.mp3
│   └── images/
│       └── badges/          # Images de badges (optionnel)
├── README.md
└── LICENSE
```

## 🚀 Installation et utilisation locale

### Prérequis
- Un navigateur web moderne (Chrome, Firefox, Safari, Edge)
- Un serveur web local (optionnel, mais recommandé pour éviter les problèmes CORS)

### Démarrage rapide

1. **Clonez ou téléchargez** ce repository :
```bash
git clone <url-du-repo>
cd quantum-quiz
```

2. **Ouvrez** `index.html` dans votre navigateur, ou utilisez un serveur local :

**Avec Python :**
```bash
python3 -m http.server 8000
```
Puis ouvrez `http://localhost:8000` dans votre navigateur.

**Avec Node.js (http-server) :**
```bash
npx http-server
```

**Avec PHP :**
```bash
php -S localhost:8000
```

## 📤 Déploiement sur GitHub Pages

### Méthode 1 : Interface GitHub (Recommandée pour débutants)

1. **Créez un nouveau repository** sur GitHub :
   - Nom suggéré : `quantum-quiz` ou `quiz-mecanique-quantique`
   - Visibilité : **Public** (pour GitHub Pages gratuit)
   - ✅ Cochez "Initialize with README" (optionnel)

2. **Uploadez vos fichiers** :
   - Cliquez sur "Add file" > "Upload files"
   - Glissez-déposez tous les fichiers du projet (sauf le PDF du cours)
   - Commit message : "Initial commit - Quiz Mécanique Quantique"
   - Cliquez sur "Commit changes"

3. **Activez GitHub Pages** :
   - Allez dans **Settings** du repository
   - Dans le menu de gauche, cliquez sur **Pages**
   - Sous "Source", sélectionnez la branche **main** (ou **master**)
   - Cliquez sur **Save**
   - Notez l'URL fournie : `https://[votre-username].github.io/[nom-du-repo]`

4. **Vérifiez le déploiement** :
   - Attendez 1-2 minutes
   - Visitez l'URL fournie
   - Votre quiz devrait être accessible !

### Méthode 2 : Ligne de commande Git (Pour utilisateurs avancés)

1. **Initialisez le repository Git** :
```bash
cd quantum-quiz
git init
git add .
git commit -m "Initial commit - Quiz Mécanique Quantique"
```

2. **Créez le repository sur GitHub** :
   - Allez sur https://github.com/new
   - Créez un nouveau repository (ne cochez PAS "Initialize with README")

3. **Liez et pushez** :
```bash
git remote add origin https://github.com/[votre-username]/[nom-du-repo].git
git branch -M main
git push -u origin main
```

4. **Activez GitHub Pages** (comme dans Méthode 1, étape 3)

### Mises à jour futures

Pour modifier les questions ou le code :

1. **Modifiez les fichiers localement**

2. **Commitez et pushez** :
```bash
git add .
git commit -m "Description des modifications"
git push
```

3. **GitHub Pages se met à jour automatiquement** (délai : 1-2 minutes)

## 🎓 Contenu des questions

Les questions couvrent :

- **Chapitre 1 - États quantiques** :
  - Interférences à une particule (fentes d'Young, Mach-Zehnder)
  - Amplitude de probabilité et règle de Born
  - Superposition quantique
  - Qubits et sphère de Bloch

- **Chapitre 2 - Mesure et opérateurs** :
  - Expérience de Stern-Gerlach
  - Opérateurs Hermitiens
  - Incompatibilité et principe d'indétermination
  - Algèbre des opérateurs

- **Chapitre 3 - Dynamique quantique** :
  - Postulats de la mécanique quantique
  - Équation de Schrödinger
  - Oscillations de Rabi

Et plus encore !

## 🛠️ Technologies utilisées

- **HTML5** : Structure sémantique
- **CSS3** : Animations, gradients, glass morphism
- **JavaScript (Vanilla)** : Pas de framework, performance optimale
- **MathJax** : Rendu des formules LaTeX
- **Chart.js** : Graphiques statistiques
- **LocalStorage** : Persistance des données

## 📝 Personnalisation

### Ajouter des questions

Modifiez `data/questions.json` et ajoutez des objets question :

```json
{
  "id": 201,
  "type": "qcm",
  "category": "États quantiques",
  "difficulty": "medium",
  "question": "Votre question ici ?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct_index": 1,
  "explanation": "Explication détaillée...",
  "formula": "E = mc²"
}
```

### Modifier les couleurs

Éditez `css/style.css` et modifiez les variables CSS :

```css
:root {
    --color-bg-dark: #0A192F;
    --color-quantum-purple: #8B5CF6;
    --color-cyan: #22D3EE;
}
```

### Ajouter des sons

Placez vos fichiers audio dans `assets/sounds/` :
- `correct.mp3` : Son pour bonne réponse
- `incorrect.mp3` : Son pour mauvaise réponse
- `click.mp3` : Son pour clic
- `complete.mp3` : Son pour quiz terminé

## 🐛 Dépannage

### Les questions ne se chargent pas
- **Important** : Pour des raisons de sécurité (CORS), le fichier doit être ouvert via un serveur web local, pas directement en double-cliquant sur `index.html`
- Utilisez un serveur local (voir section "Installation")
- Vérifiez que `data/questions.json` existe et est valide JSON
- Ouvrez la console du navigateur (F12) pour voir les erreurs

### L'application ne fonctionne pas en ouvrant directement index.html
- C'est normal ! Les navigateurs bloquent le chargement de fichiers locaux (JSON) pour des raisons de sécurité
- **Vous devez utiliser un serveur web local** (voir section "Installation")
- Les sons fonctionnent maintenant même sans serveur grâce à Web Audio API

### MathJax ne s'affiche pas
- Vérifiez votre connexion internet (MathJax est chargé depuis CDN)
- Videz le cache du navigateur

### Les statistiques ne se sauvegardent pas
- Vérifiez que localStorage est activé dans votre navigateur
- Les données sont stockées localement (non synchronisées entre appareils)

### Les flashcards ne s'affichent pas correctement
- Vérifiez que vous utilisez un navigateur récent (Chrome, Firefox, Safari, Edge)
- Les animations 3D nécessitent le support CSS transform 3D
- Si le problème persiste, videz le cache du navigateur

## 📄 Licence

MIT License - Libre d'utilisation et de modification

## 👤 Auteur

**Dr. TCHAPET NJAFA**  
Département de Physique - UY1-FS

Ce projet a été développé à partir d'un cours de Mécanique Quantique (PHY321).  
Le rendu final a été obtenu avec l'assistance de **Cursor Agent** (IA de développement).

## 🙏 Remerciements

- **Cours source** : PHY321 - Mécanique Quantique (UY1-FS)
- **Bibliothèques** : MathJax, Chart.js
- **Polices** : Google Fonts (Poppins, Inter)

## 📞 Support

Pour toute question ou problème :
1. Vérifiez ce README
2. Consultez la console du navigateur (F12)
3. Ouvrez une issue sur GitHub (si le repo est public)

---

**Prêt à explorer le monde quantique ?** 🌌 Commencez votre premier quiz !
