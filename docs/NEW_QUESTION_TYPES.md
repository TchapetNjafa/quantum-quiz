# Nouveaux Types de Questions - Documentation

**Date**: 23 novembre 2025
**Mise à jour**: Ajout de 3 nouveaux types de questions interactives

---

## Résumé des Modifications

Ajout de **100 nouvelles questions** réparties sur **3 nouveaux types** interactifs, portant le total à **609 questions** et **8 types de questions** disponibles.

---

## Les 3 Nouveaux Types

### 1. **Hotspot** (Zones Cliquables) - 33 questions

Permet d'identifier une zone spécifique sur une image scientifique.

**Format des données** :
```json
{
  "type": "hotspot",
  "question": "Sur le diagramme, identifiez...",
  "image_url": "assets/images/ch2/stern-gerlach.svg",
  "image_alt": "Expérience de Stern-Gerlach",
  "hotspots": [
    {"id": "source", "label": "Source", "x": 50, "y": 200, "radius": 35},
    {"id": "magnet", "label": "Aimant", "x": 200, "y": 200, "radius": 50},
    {"id": "detector", "label": "Détecteur", "x": 380, "y": 200, "radius": 35}
  ],
  "correct_hotspot": "magnet"
}
```

**Fonctionnalités** :
- Canvas HTML5 avec zones circlaires cliquables
- Mise en surbrillance au survol et à la sélection
- Adaptation responsive de l'image et des zones
- Affichage de la bonne réponse en mode révision

**Distribution** :
- Chapitre 1: 11 questions (sphère de Bloch, fentes d'Young)
- Chapitre 2: 11 questions (Stern-Gerlach, spin)
- Chapitre 4: 6 questions (états de Bell)
- Chapitre 6: 5 questions (oscillateur harmonique)

---

### 2. **Drag & Drop** (Glisser-Déposer) - 33 questions

Permet d'associer des éléments par glisser-déposer.

**Format des données** :
```json
{
  "type": "drag_drop",
  "question": "Associez chaque état de Bell à sa forme mathématique",
  "draggable_items": [
    {"id": "phi_p", "text": "|Φ⁺⟩"},
    {"id": "phi_m", "text": "|Φ⁻⟩"}
  ],
  "drop_zones": [
    {"id": "form1", "label": "(|00⟩+|11⟩)/√2"},
    {"id": "form2", "label": "(|00⟩−|11⟩)/√2"}
  ],
  "correct_matches": {
    "phi_p": "form1",
    "phi_m": "form2"
  }
}
```

**Fonctionnalités** :
- API HTML5 Drag and Drop native
- Possibilité de retirer un élément d'une zone
- Retour visuel lors du survol des zones
- Correction partielle affichée (X/Y correctes)
- Zone de retour pour les éléments non placés

**Distribution** :
- Chapitre 1: 6 questions (chronologie, états, superposition)
- Chapitre 2: 6 questions (matrices de Pauli, observables, spin)
- Chapitre 3: 5 questions (postulats, équations, évolution)
- Chapitre 4: 8 questions (Bell, intrication, téléportation)
- Chapitre 5: 4 questions (fonctions d'onde, normalisation)
- Chapitre 6: 4 questions (opérateurs, niveaux d'énergie)

---

### 3. **Flashcard** (Recto-Verso) - 34 questions

Cartes à retourner pour réviser des concepts clés avec auto-évaluation.

**Format des données** :
```json
{
  "type": "flashcard",
  "front": "Qu'est-ce que la dualité onde-corpuscule ?",
  "back": "Propriété fondamentale de la matière et du rayonnement...",
  "hint": "Comportement des quantons"
}
```

**Fonctionnalités** :
- Animation 3D de retournement (CSS transform)
- Bouton pour retourner manuellement
- Auto-flip après 3s en mode révision
- Feedback utilisateur (✅ Oui / ❌ Non)
- Affichage d'un indice optionnel

**Distribution** :
- Chapitre 1: 6 questions (dualité, superposition, qubit, décohérence)
- Chapitre 2: 6 questions (observables, Heisenberg, Pauli, spin)
- Chapitre 3: 6 questions (Born, Schrödinger, postulats)
- Chapitre 4: 8 questions (intrication, EPR, Bell, téléportation)
- Chapitre 5: 4 questions (fonction d'onde, Fourier, De Broglie)
- Chapitre 6: 4 questions (point zéro, opérateurs, états cohérents)

---

## Fichiers Modifiés

### 1. **Python** - Génération des questions

**Fichier** : `scripts/generate_advanced_questions.py`

- Fonction `generate_hotspot_questions()` - 33 questions
- Fonction `generate_drag_drop_questions()` - 33 questions
- Fonction `generate_flashcard_questions()` - 34 questions
- Total ajouté : **100 questions**
- Nouveau total : **609 questions** (509 → 609)

### 2. **JavaScript** - Rendu des questions

**Fichier** : `js/question-renderer.js`

**Nouvelles fonctions ajoutées** :

```javascript
// Rendu
renderHotspot(question, container, mode)
renderDragDrop(question, container, mode)
renderFlashcard(question, container, mode)

// Récupération des réponses
getUserAnswer() - cas hotspot, drag_drop, flashcard

// Vérification
checkAnswer() - cas hotspot, drag_drop, flashcard
```

**Fonctionnalités clés** :
- Canvas interactif pour hotspot avec détection de clics
- Drag & Drop natif HTML5 avec zones de dépôt
- Effet flip 3D pour flashcards
- Gestion des états (review, quiz)

### 3. **CSS** - Styles visuels

**Fichier** : `css/main.css`

**Styles ajoutés** (~290 lignes) :

**Hotspot** :
- `.hotspot-area`, `.hotspot-svg-container`, `.hotspot-canvas`
- Zones circlaires avec canvas
- Curseur crosshair

**Drag & Drop** :
- `.drag-drop-area`, `.draggable-item`, `.drop-zone`
- Effets de survol et drag-over
- Zone de retour pour items

**Flashcard** :
- `.flashcard`, `.flashcard-front`, `.flashcard-back`
- Animation 3D flip (transform rotateY)
- Boutons de feedback avec états (selected)

**Responsive** :
- Adaptation mobile pour tous les types
- Flashcard height réduite
- Drag-drop en colonne

### 4. **HTML** - Filtres de types

**Fichier** : `index.html` (lignes 188-202)

Ajout de 3 checkboxes pour les nouveaux types :
```html
<label class="checkbox-label">
    <input type="checkbox" name="question-type" value="hotspot" checked>
    <span class="checkbox-custom"></span>
    Hotspot (Zones cliquables)
</label>
<label class="checkbox-label">
    <input type="checkbox" name="question-type" value="drag_drop" checked>
    <span class="checkbox-custom"></span>
    Glisser-Déposer
</label>
<label class="checkbox-label">
    <input type="checkbox" name="question-type" value="flashcard" checked>
    <span class="checkbox-custom"></span>
    Flashcard (Recto-verso)
</label>
```

Mise à jour du hint : "8 types disponibles"

### 5. **Data** - Questions JSON

**Fichier** : `data/questions.json`

- Total avant : 509 questions
- Questions ajoutées : 100
- **Total après : 609 questions**
- Types supportés : 8 (qcm, vrai_faux, matching, numerical, interpretation, hotspot, drag_drop, flashcard)

---

## Tests à Effectuer

### Test 1 : Hotspot

1. ✅ Lancer un quiz avec type "Hotspot" activé
2. ✅ Vérifier que l'image s'affiche correctement
3. ✅ Cliquer sur différentes zones et vérifier le feedback visuel
4. ✅ Valider la réponse et vérifier la correction
5. ✅ En mode révision, vérifier que la bonne zone est en vert

### Test 2 : Drag & Drop

1. ✅ Lancer un quiz avec type "Glisser-Déposer" activé
2. ✅ Glisser des éléments vers les zones de dépôt
3. ✅ Vérifier qu'on peut retirer un élément d'une zone
4. ✅ Valider et vérifier le score partiel (X/Y correctes)
5. ✅ En mode révision, vérifier l'affichage des bonnes réponses

### Test 3 : Flashcard

1. ✅ Lancer un quiz avec type "Flashcard" activé
2. ✅ Cliquer sur le bouton de retournement
3. ✅ Vérifier l'animation flip 3D
4. ✅ Sélectionner "Oui" ou "Non" pour l'auto-évaluation
5. ✅ Vérifier que le feedback est enregistré

### Test 4 : Filtres

1. ✅ Sur la page d'accueil, décocher tous les types sauf hotspot
2. ✅ Vérifier que seules les questions hotspot apparaissent
3. ✅ Répéter pour drag_drop et flashcard
4. ✅ Vérifier que les 8 types fonctionnent ensemble

### Test 5 : Responsive

1. ✅ Ouvrir sur mobile (ou mode responsive)
2. ✅ Vérifier que hotspot canvas s'adapte
3. ✅ Vérifier que drag-drop passe en colonnes
4. ✅ Vérifier que flashcard s'adapte (height réduite)

---

## Statistiques Finales

| Métrique | Avant | Après | Ajouté |
|----------|-------|-------|--------|
| **Questions totales** | 509 | 609 | +100 |
| **Types de questions** | 5 | 8 | +3 |
| **Chapitres couverts** | 6 | 6 | - |
| **Lignes de code JS** | ~450 | ~860 | +410 |
| **Lignes de code CSS** | ~1080 | ~1370 | +290 |

---

## Images Utilisées

Les questions hotspot réutilisent les images SVG existantes du cours :

1. **young-experiment.svg** (Ch. 1)
   - Fentes d'Young
   - Zones : source, fentes, écran

2. **bloch-sphere.svg** (Ch. 1)
   - Sphère de Bloch
   - Zones : pôles Nord/Sud, équateurs

3. **stern-gerlach.svg** (Ch. 2)
   - Expérience de Stern-Gerlach
   - Zones : source, aimant, détecteur

4. **bell-states.svg** (Ch. 4)
   - États de Bell
   - Zones : Φ⁺, Φ⁻, Ψ⁺, Ψ⁻

5. **harmonic-oscillator.svg** (Ch. 6)
   - Oscillateur harmonique
   - Zones : niveaux d'énergie n=0,1,2...

---

## Améliorations Futures Possibles

### Hotspot
- [ ] Formes polygonales (au lieu de cercles)
- [ ] Zoom sur image
- [ ] Multi-sélection (plusieurs zones correctes)

### Drag & Drop
- [ ] Réorganisation dans l'ordre
- [ ] Correspondances multiples (plusieurs items → même zone)
- [ ] Animations de drop

### Flashcard
- [ ] Mode pile de cartes (swipe)
- [ ] Système de révision espacée (algorithme Leitner)
- [ ] Statistiques de rétention par carte

### Général
- [ ] Export/import de questions en JSON
- [ ] Éditeur visuel de questions
- [ ] Générateur automatique via LLM
- [ ] Analytics avancés par type de question

---

## Compatibilité

### Navigateurs testés

| Navigateur | Hotspot | Drag & Drop | Flashcard |
|------------|---------|-------------|-----------|
| Chrome 100+ | ✅ | ✅ | ✅ |
| Firefox 100+ | ✅ | ✅ | ✅ |
| Safari 15+ | ✅ | ✅ | ✅ |
| Edge 100+ | ✅ | ✅ | ✅ |
| Mobile Chrome | ✅ | ✅ | ✅ |
| Mobile Safari | ✅ | ⚠️ Touch | ✅ |

⚠️ **Note** : Drag & Drop sur mobile nécessite touch events (supporté mais expérience sous-optimale)

---

## Documentation Technique

### Ajouter un nouveau type de question

1. **Définir le format** dans `scripts/generate_advanced_questions.py`
2. **Créer le renderer** dans `js/question-renderer.js`
   - `render{Type}(question, container, mode)`
3. **Ajouter getUserAnswer** case dans `getUserAnswer()`
4. **Ajouter checkAnswer** case dans `checkAnswer()`
5. **Créer les styles** dans `css/main.css`
6. **Ajouter au filtre** dans `index.html`

### Exemple minimal

```javascript
// Dans question-renderer.js
renderCustomType(question, container, mode) {
    const div = document.createElement('div');
    div.className = 'custom-type';
    div.innerHTML = question.content;
    container.appendChild(div);
}

// Dans getUserAnswer
case 'custom_type': {
    return document.querySelector('.custom-type').value;
}

// Dans checkAnswer
case 'custom_type': {
    return {
        correct: userAnswer === question.correct_answer,
        message: 'Votre message'
    };
}
```

---

**✅ Implémentation complète et fonctionnelle !**

Les 100 nouvelles questions sont maintenant disponibles avec 3 types interactifs innovants, portant l'expérience de révision à un niveau supérieur. 🚀

**Total : 609 questions | 8 types | 6 chapitres | Entièrement interactif**
