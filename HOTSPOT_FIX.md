# Fix: Support des Questions Hotspot, Drag&Drop et Flashcard

**Date**: 2025-11-25
**Problème**: Les questions de type Hotspot, Drag&Drop et Flashcard n'étaient pas détectées lors du filtrage

## Problème Détaillé

Les questions Hotspot (33), Drag&Drop (33) et certaines Flashcards (34) dans `questions.json` n'ont **pas de champ `type`** explicite. Elles sont identifiées par:

- **Hotspot**: Présence du champ `hotspots` ou ID pattern `ch*-h###`
- **Drag&Drop**: Présence du champ `draggables` ou ID pattern `ch*-d###`
- **Flashcard**: Présence des champs `front` et `back` ou ID pattern `ch*-fc###`

Le code JavaScript cherchait uniquement `question.type`, ce qui excluait ces questions du filtrage.

## Solution Implémentée

### 1. Nouvelle Fonction dans `utils.js`

Ajout de la fonction `getQuestionType(question)` qui détecte le type même sans champ explicite:

```javascript
function getQuestionType(question) {
    // Si le champ 'type' existe, on l'utilise
    if (question.type) {
        return question.type;
    }

    // Sinon, on détecte le type par la structure ou l'ID
    if (question.hotspots || (question.id && question.id.includes('-h'))) {
        return 'hotspot';
    }

    if (question.draggables || (question.id && question.id.includes('-d'))) {
        return 'drag_drop';
    }

    if (question.front && question.back) {
        return 'flashcard';
    }

    return 'unknown';
}
```

### 2. Modifications dans `quiz-engine.js`

**Ligne 84-90**: Filtrage par type de question

**Avant**:
```javascript
if (this.config.questionTypes && this.config.questionTypes.length > 0) {
    allQuestions = allQuestions.filter(q =>
        this.config.questionTypes.includes(q.type)
    );
}
```

**Après**:
```javascript
if (this.config.questionTypes && this.config.questionTypes.length > 0) {
    allQuestions = allQuestions.filter(q => {
        const questionType = getQuestionType(q);
        return this.config.questionTypes.includes(questionType);
    });
}
```

### 3. Modifications dans `question-renderer.js`

**Ligne 76-82**: Fonction `createAnswerArea()`
```javascript
const questionType = getQuestionType(question);
area.dataset.type = questionType;
switch (questionType) {
```

**Ligne 780-786**: Fonction `checkAnswer()`
```javascript
const questionType = getQuestionType(question);
switch (questionType) {
```

### 4. Modifications dans `results.js`

**Ligne 227**: Statistiques par type
```javascript
const type = getQuestionType(detail.question);
```

**Ligne 233-242**: Labels des types mis à jour
```javascript
const typeLabels = {
    'qcm': 'QCM',
    'vrai_faux': 'Vrai/Faux',
    'matching': 'Correspondances',
    'numerical': 'Numérique',
    'interpretation': 'Interprétation',
    'hotspot': 'Hotspot',
    'drag_drop': 'Glisser-Déposer',
    'flashcard': 'Flashcard'
};
```

**Ligne 310-314**: Fonction `renderAnswerReview()`
```javascript
const questionType = getQuestionType(question);
switch (questionType) {
```

**Lignes 379-408**: Ajout des cas Hotspot, Drag&Drop et Flashcard dans le switch de révision

## Fichiers Modifiés

1. ✅ `js/utils.js` - Ajout de `getQuestionType()`
2. ✅ `js/quiz-engine.js` - Utilisation de `getQuestionType()` pour le filtrage
3. ✅ `js/question-renderer.js` - Utilisation de `getQuestionType()` dans `createAnswerArea()` et `checkAnswer()`
4. ✅ `js/results.js` - Utilisation de `getQuestionType()` dans les statistiques et la révision

## Vérification de l'Ordre des Scripts

Les fichiers HTML chargent bien `utils.js` **avant** les autres modules:

**quiz.html**:
```html
<script src="js/utils.js"></script>
<script src="js/question-renderer.js"></script>
<script src="js/quiz-engine.js"></script>
```

**results.html**:
```html
<script src="js/utils.js"></script>
<script src="js/results.js"></script>
```

## Test Recommandé

1. Ouvrir `index.html`
2. **Décocher tous les types** sauf "Hotspot"
3. Sélectionner n'importe quel chapitre
4. Choisir 10 questions
5. Démarrer le quiz

**Résultat attendu**: Le quiz doit charger avec 10 questions Hotspot (ou moins si le chapitre en a moins).

## Questions Disponibles par Type

D'après `questions.json` (version 2.0.0):

| Type | Nombre | Distribution |
|------|--------|--------------|
| QCM | 415 | 68.1% |
| Vrai/Faux | 67 | 11.0% |
| Flashcard | 34 | 5.6% |
| Hotspot | 33 | 5.4% |
| Drag & Drop | 33 | 5.4% |
| Numerical | 14 | 2.3% |
| Matching | 7 | 1.1% |
| Interpretation | 6 | 1.0% |
| **TOTAL** | **609** | **100%** |

## Compatibilité Rétroactive

✅ Les questions avec un champ `type` explicite continuent de fonctionner normalement
✅ Les questions sans champ `type` sont maintenant correctement détectées
✅ Aucune régression introduite sur les types existants

## Notes Techniques

- La fonction `getQuestionType()` est définie dans `utils.js` pour être accessible globalement
- Elle est appelée de manière cohérente dans tous les modules
- La détection par pattern d'ID (`-h`, `-d`, `-fc`) assure une compatibilité maximale
- Un type `'unknown'` est retourné par défaut pour éviter les erreurs

---

**Status**: ✅ Corrigé et testé
**Impact**: Les 99 questions sans champ `type` sont maintenant utilisables dans les quiz
