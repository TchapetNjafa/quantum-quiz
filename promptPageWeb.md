---

## Mission principale

Créer une application web de quiz interactive en **Mécanique Quantique** (niveau universitaire), hébergeable sur GitHub Pages. L'application doit générer des questions à partir d'un PDF de cours que je fournirai.

---

## 📋 Spécifications techniques détaillées

### 1. Génération des questions (PRIORITAIRE)

**À partir du PDF fourni, tu dois :**
- Extraire et analyser le contenu du cours de mécanique quantique
- **Générer au minimum 200 questions variées** couvrant l'ensemble du programme
- Assurer une distribution équilibrée :
  - 60% QCM (4 options par question)
  - 40% Flashcards (concept/définition)
- Couvrir tous les chapitres/sections du cours de manière proportionnelle

**Types de questions à créer :**
- Définitions de concepts (principe d'incertitude, dualité onde-corpuscule, etc.)
- Équations fondamentales (équation de Schrödinger, relations de commutation, etc.)
- Applications numériques simples
- Interprétations physiques
- Histoire et figures importantes (Heisenberg, Dirac, etc.)
- Comparaisons entre concepts

**Niveaux de difficulté :**
- 40% faciles (rappels, définitions basiques)
- 40% moyennes (applications, compréhension)
- 20% difficiles (synthèse, cas complexes)

**Format JSON structuré :**
```json
{
  "course_title": "Introduction à la Mécanique Quantique",
  "total_questions": 200,
  "questions": [
    {
      "id": 1,
      "type": "qcm",
      "category": "Fondements",
      "difficulty": "easy",
      "question": "Quel principe affirme qu'on ne peut connaître simultanément la position et la quantité de mouvement d'une particule avec précision ?",
      "options": [
        "Principe de superposition",
        "Principe d'incertitude de Heisenberg",
        "Principe d'exclusion de Pauli",
        "Principe de correspondance"
      ],
      "correct_index": 1,
      "explanation": "Le principe d'incertitude de Heisenberg établit que Δx·Δp ≥ ℏ/2, limitant la précision simultanée des mesures.",
      "formula": "Δx·Δp ≥ ℏ/2"
    },
    {
      "id": 2,
      "type": "flashcard",
      "category": "Mathématiques quantiques",
      "difficulty": "medium",
      "front": "Quelle est l'équation de Schrödinger dépendante du temps ?",
      "back": "iℏ ∂ψ/∂t = Ĥψ\n\nOù ψ est la fonction d'onde, Ĥ l'opérateur hamiltonien, et ℏ la constante de Planck réduite.",
      "formula": "iℏ ∂ψ/∂t = Ĥψ"
    }
  ],
  "categories": [
    "Fondements",
    "Formalisme mathématique",
    "Atome d'hydrogène",
    "Spin et moment angulaire",
    "Perturbations"
  ]
}
```

### 2. Interface utilisateur - Écran d'accueil

**Design thématique "Quantique" :**
- Fond avec effet de particules/ondes animées (particules.js ou Canvas)
- Palette de couleurs : bleus profonds, violets, touches de cyan (évoquant l'aspect ondulatoire)
- Titre avec effet néon ou glow : "Quiz Mécanique Quantique"
- Animation subtile de l'équation de Schrödinger en arrière-plan

**Éléments interactifs :**
- **Sélecteur de nombre de questions :**
  - Slider élégant (20 → 50) avec affichage en temps réel
  - Durée estimée affichée (ex: "~25 minutes")
  
- **Choix du mode :**
  - Boutons stylisés : "QCM", "Flashcards", "Mixte (recommandé)"
  - Icons pertinents pour chaque mode
  
- **Options avancées (menu déroulant) :**
  - Filtrer par catégorie/chapitre
  - Choisir le niveau de difficulté
  - Activer/désactiver le timer
  - Activer/désactiver les sons

- **Bouton de démarrage proéminent** avec animation hover
- **Statistiques personnelles** : "Vous avez complété X quiz avec Y% de moyenne"

### 3. Interface - Pendant le quiz

**Affichage de la question :**
- **En-tête fixe :**
  - Barre de progression visuelle (gradient animé)
  - Compteur : "Question 12/30"
  - Timer optionnel (compte à rebours ou chronomètre)
  - Score actuel en temps réel (optionnel)
  - Bouton "Pause" et "Abandonner"

**Pour les QCM :**
- Question affichée clairement avec support LaTeX/MathJax pour les formules
- 4 options dans des cartes élégantes avec :
  - Effet hover (scale, glow)
  - Animation au clic
  - Feedback immédiat : vert (correct), rouge (incorrect)
  - Affichage de l'explication après réponse
  - Formule associée si pertinente

**Pour les Flashcards :**
- Carte 3D retournable (flip animation)
- Recto : Question/Concept avec fond dégradé
- Verso : Réponse complète avec formules
- Boutons "Je maîtrise ✓" / "À revoir ✗"
- Option "Révéler progressivement" (clic multiple)

**Interactions clavier :**
- 1, 2, 3, 4 : sélectionner une option QCM
- Espace : question suivante
- F : retourner la flashcard
- P : pause
- Échap : menu pause

**Raccourcis visuels :**
- Double-clic sur une formule : agrandissement
- Hover sur termes techniques : définition rapide (tooltip)

### 4. Interface - Écran des résultats

**Analyse du score :**
- **Animation d'apparition spectaculaire** (confettis pour >80%, encouragement pour <50%)
- **Score global :** cercle de progression animé (pourcentage + note/20)
- **Message personnalisé** selon performance :
  - 90-100% : "Superposition d'excellence ! 🌟"
  - 70-89% : "Bon niveau quantique ! 🎯"
  - 50-69% : "État intermédiaire, à consolider 📚"
  - <50% : "L'effondrement de la fonction d'onde... Révisions nécessaires ! 💪"

**Statistiques détaillées :**
- Graphique par catégorie (radar chart)
- Temps moyen par question
- Taux de réussite par difficulté
- Comparaison avec les tentatives précédentes

**Revue complète des questions :**
- Liste scrollable avec accordéon
- Code couleur : vert (correct), rouge (incorrect), orange (flashcard "à revoir")
- Pour chaque question :
  - Énoncé
  - Votre réponse (surlignée)
  - Bonne réponse
  - Explication détaillée
  - Formule avec rendu LaTeX
  - Lien vers section du cours (si disponible)

**Actions finales :**
- "Recommencer avec nouvelles questions"
- "Refaire les questions ratées"
- "Télécharger les résultats (PDF)"
- "Partager mon score" (génère une image)
- "Mode révision" (accès rapide aux flashcards ratées)

### 5. Système audio (sons libres de droits)

**Sources recommandées :**
- Freesound.org
- Zapsplat.com
- Pixabay Audio

**Sons à intégrer :**
1. **Ambiance :**
   - Musique de fond douce, scientifique/électronique (15-30 sec en loop)
   - Volume ajustable, désactivable
   
2. **Feedback interactif :**
   - Clic doux (sélection option)
   - "Ding" aigu (bonne réponse) - style cristallin
   - "Buzz" grave (mauvaise réponse) - non agressif
   - Swoosh (transition de question)
   - Flip sonore (retournement flashcard)
   
3. **Événements spéciaux :**
   - Fanfare courte (quiz terminé)
   - Applaudissements (score >85%)
   - Son "power-up" (série de bonnes réponses)
   
4. **Contrôles :**
   - Icône haut-parleur avec toggle ON/OFF
   - Slider de volume dans les paramètres

### 6. Fonctionnalités avancées

**Système de progression :**
- Historique des quiz dans localStorage
- Graphique d'évolution des scores
- "Carnet de notes" : concepts à revoir identifiés automatiquement
- Badges déblocables :
  - "Premier pas quantique" (1er quiz complété)
  - "Cohérence" (3 quiz >80%)
  - "Opérateur hermitien" (100% à un quiz)
  - "Marathonien" (10 quiz complétés)
  - "Perfectionniste" (5 quiz >90%)

**Mode révision intelligente :**
- Algorithme de répétition espacée (Spaced Repetition)
- Priorité aux questions ratées ou marquées "À revoir"
- Suggestions de révision après chaque quiz

**Accessibilité :**
- Support lecteur d'écran (ARIA labels)
- Mode contraste élevé
- Taille de police ajustable
- Thème clair/sombre avec toggle

**Fonctions sociales :**
- Génération d'image de score (Canvas → PNG)
- QR code du lien (pour partage facile)
- Message de partage pré-rempli

**Options pédagogiques :**
- Mode "Examen blanc" : pas d'explications immédiates
- Mode "Apprentissage" : explications détaillées après chaque question
- Glossaire intégré (popup avec définitions)
- Références bibliographiques pour approfondir

### 7. Design et expérience utilisateur

**Identité visuelle "Quantique" :**
- **Palette principale :**
  - Bleu nuit : #0A192F
  - Violet quantique : #8B5CF6
  - Cyan lumineux : #22D3EE
  - Blanc/gris clairs pour textes
  
- **Effets visuels :**
  - Particules flottantes en arrière-plan (Canvas)
  - Gradient animés sur boutons
  - Glow/neon sur éléments interactifs
  - Animations fluides (ease-in-out)
  - Glass morphism pour les cartes

**Typographie :**
- Titres : Police moderne (Poppins, Space Grotesk)
- Corps : Police lisible (Inter, Roboto)
- Formules : MathJax ou KaTeX pour rendu LaTeX

**Responsive design :**
- Mobile first approach
- Breakpoints : 640px, 768px, 1024px, 1280px
- Menu hamburger sur mobile
- Cartes empilées verticalement sur petit écran

**Animations :**
- Framer Motion ou GSAP pour animations complexes
- Transitions CSS pour interactions simples
- Pas de lag, 60fps minimum
- Réduction des animations si préférence utilisateur (prefers-reduced-motion)

### 8. Architecture technique

**Stack recommandée :**
- HTML5 sémantique
- CSS3 (Tailwind CSS recommandé pour rapidité)
- JavaScript Vanilla ou React (selon complexité)
- MathJax/KaTeX pour rendu des formules
- Chart.js ou Recharts pour graphiques
- LocalStorage pour persistance

**Structure des fichiers :**
```
quantum-quiz/
├── index.html
├── css/
│   ├── style.css
│   └── themes.css
├── js/
│   ├── app.js
│   ├── quiz-logic.js
│   ├── storage.js
│   └── particles.js
├── data/
│   └── questions.json (200+ questions)
├── assets/
│   ├── sounds/
│   │   ├── correct.mp3
│   │   ├── incorrect.mp3
│   │   ├── click.mp3
│   │   └── complete.mp3
│   └── images/
│       ├── logo.svg
│       └── badges/
├── README.md
└── LICENSE
```

**Optimisations :**
- Questions chargées de façon asynchrone
- Lazy loading des images
- Minification CSS/JS pour production
- Compression des sons (format .mp3 ou .ogg)
- Service Worker pour mode hors-ligne (bonus)

### 9. Instructions de déploiement GitHub Pages

**Fournis-moi un guide étape par étape :**

1. **Création du repository :**
   - Nom suggéré du repo
   - Configuration recommandée (public/private)
   - Initialisation avec README

2. **Upload des fichiers :**
   - Commandes Git à exécuter
   - Structure à respecter
   - Fichiers à exclure (.gitignore)

3. **Activation de GitHub Pages :**
   - Paramètres → Pages
   - Source branch (main ou gh-pages)
   - Configuration custom domain (si souhaité)

4. **Obtention du lien public :**
   - Format : `https://[username].github.io/[repo-name]`
   - Délai de déploiement
   - Vérification du déploiement

5. **Mises à jour futures :**
   - Comment modifier les questions
   - Comment push des modifications
   - Versioning recommandé

6. **Partage et distribution :**
   - QR code du lien
   - Short URL (bit.ly, tinyurl)
   - Intégration iframe (si besoin)

### 10. Documentation à inclure

**README.md complet avec :**
- Description du projet
- Screenshot/GIF de démo
- Fonctionnalités principales
- Technologies utilisées
- Instructions d'utilisation
- Crédits (sons, bibliothèques)
- License (MIT recommandée)
- Contact/contribution

**Guide utilisateur (optionnel - page `/help`) :**
- Raccourcis clavier
- Système de badges
- FAQ
- Tips pour mieux réviser

---

## 🎯 Livrables attendus

1. ✅ Code HTML/CSS/JS complet et commenté
2. ✅ Fichier `questions.json` avec minimum 200 questions générées depuis le PDF
3. ✅ Assets (sons, images) avec sources
4. ✅ Guide de déploiement GitHub Pages détaillé
5. ✅ README.md professionnel
6. ✅ Instructions pour personnaliser/modifier
7. ✅ (Bonus) Version démo en ligne que tu héberges temporairement

---

## 📚 Spécificités Mécanique Quantique

**Assure-toi que les questions couvrent :**
- Fondements historiques (Planck, Bohr, de Broglie)
- Formalisme mathématique (espaces de Hilbert, opérateurs)
- Équation de Schrödinger (temps-dépendant et indépendant)
- Principes fondamentaux (superposition, intrication, mesure)
- Potentiels simples (puits, barrière, oscillateur harmonique)
- Moment angulaire et spin
- Atome d'hydrogène
- Méthodes d'approximation (perturbations, variations)
- Interprétations (Copenhague, Everett, etc.)

**Notation mathématique :**
- Utilise la notation de Dirac : |ψ⟩, ⟨ψ|
- Intègre les symboles courants : ℏ, Ĥ, ψ, ∇², etc.
- MathJax doit rendre parfaitement toutes les équations

---

## ✨ Mes suggestions supplémentaires bonus

1. **Mode "Duel quantique"** : deux joueurs sur même appareil, tour par tour
2. **Visualisations interactives** : animations de fonctions d'onde, niveaux d'énergie
3. **"Lab virtuel"** : mini-simulations (interférences, effet tunnel)
4. **Easter eggs** : citations de physiciens célèbres aléatoires
5. **Chatbot assistant** : réponse aux questions sur concepts (si possible)
6. **Export Anki** : possibilité d'exporter les flashcards vers Anki
7. **Mode nuit "espace"** : thème sombre avec étoiles/galaxies
8. **Chronomètre compétitif** : classement basé sur vitesse + précision

---

**Note importante :** Le PDF du cours sera fourni immédiatement après validation de ce prompt. Analyse-le en profondeur pour extraire questions pertinentes, formules clés, et concepts essentiels.

---
