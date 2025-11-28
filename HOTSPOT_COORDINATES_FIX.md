# Fix: Correction des Coordonnées Hotspot

**Date**: 2025-11-25
**Problème**: Les zones de clic des questions Hotspot étaient décalées des positions réelles

## Problème Détaillé

Les coordonnées des zones cliquables (hotspots) dans le fichier `questions.json` ne correspondaient PAS aux positions réelles des éléments dans les images SVG.

### Exemple: Expérience de Young

**SVG réel** (`young-experiment.svg`, 600x300):
- Source: `cx="50" cy="150"`
- Fentes: `cx="260" cy="150"` (centre des 2 fentes)
- Écran: `cx="505" cy="150"`

**Coordonnées dans JSON (AVANT):**
```json
{ "id": "source", "x": 50, "y": 200 }    // ❌ y incorrect
{ "id": "slits", "x": 200, "y": 200 }    // ❌ x et y incorrects
{ "id": "screen", "x": 400, "y": 200 }   // ❌ x et y incorrects
```

**Résultat**: Les zones de clic étaient décalées de ~50-100 pixels !

## Solution Appliquée

### 1. Amélioration du Code JavaScript

**Fichier**: `js/question-renderer.js`

#### Changement 1: Utilisation de `clientWidth/Height`
Au lieu de `offsetWidth/Height` (qui inclut les bordures), on utilise `clientWidth/Height` pour plus de précision.

#### Changement 2: Délai de Layout CSS
Ajout d'un `setTimeout(50ms)` après le chargement de l'image pour s'assurer que le layout CSS est terminé.

#### Changement 3: Debug Console Log
Ajout d'un log pour vérifier les dimensions:
```javascript
console.log(`Hotspot debug - Image: ${img.naturalWidth}x${img.naturalHeight}, Display: ${img.clientWidth}x${img.clientHeight}, Scale: ${scaleX}x${scaleY}`);
```

### 2. Correction des Coordonnées JSON

**Chapitres corrigés**: Chapitre 1 (11 questions hotspot)

#### Young Experiment (young-experiment.svg)
- Dimensions: 600x300px
- Corrections:
  - `source`: y=200 → **y=150** ✅
  - `slits`: x=200 → **x=260** ✅
  - `slits`: y=200 → **y=150** ✅
  - `screen`: x=400 → **x=505** ✅
  - `screen`: y=200 → **y=150** ✅
  - `between`: x=300 → **x=380** ✅

#### Bloch Sphere (bloch-sphere.svg)
- Dimensions: 400x400px
- Corrections:
  - `north/z_positive`: y=50 → **y=60** ✅
  - `south`: y=350 → **y=340** ✅
  - `y_positive`: x=200,y=250 → **x=150,y=280** ✅
  - `mid_x`: x=280,y=125 → **x=260,y=130** ✅

**Total**: 22 coordonnées corrigées dans le chapitre 1

## Chapitres Restants à Vérifier

| Chapitre | Hotspot Questions | SVG |
|----------|-------------------|-----|
| Ch1 | 11 | ✅ Corrigé |
| Ch2 | 11 | ⚠️ À vérifier (stern-gerlach.svg) |
| Ch3 | 0 | - |
| Ch4 | 6 | ⚠️ À vérifier (bell-states.svg) |
| Ch5 | 0 | - |
| Ch6 | 5 | ⚠️ À vérifier (harmonic-oscillator.svg) |

## Comment Vérifier les Coordonnées

### Méthode Manuelle

1. Ouvrir le SVG dans un éditeur de texte
2. Chercher les éléments `<circle cx="..." cy="...">` ou `<rect x="..." y="...">`
3. Noter les coordonnées des éléments clés
4. Comparer avec les coordonnées dans `questions.json`

### Exemple de Vérification

```bash
# Voir les dimensions du SVG
head -1 assets/images/ch1/young-experiment.svg
# <svg width="600" height="300" ...>

# Trouver les coordonnées de la source
grep "Source" -A2 assets/images/ch1/young-experiment.svg
# <circle cx="50" cy="150" r="15" ...>
```

## Test

Pour tester la correction:

1. Lancer le serveur: `python3 -m http.server 8000`
2. Ouvrir http://localhost:8000
3. Configurer un quiz avec:
   - Chapitre 1
   - Décocher tous les types sauf "Hotspot"
   - 10 questions
4. Démarrer le quiz
5. Vérifier que les cercles semi-transparents sont **bien centrés** sur les éléments du SVG
6. Cliquer sur une zone et vérifier que le clic est bien détecté

### Vérification Console

Ouvrir les DevTools (F12) et regarder la console. Vous devriez voir:
```
Hotspot debug - Image: 600x300, Display: 600x300, Scale: 1.000x1.000
```

Si le scale est ~1.0, c'est parfait. Si c'est très différent, il y a un problème de CSS.

## Correction Future Automatique

Pour corriger automatiquement les coordonnées à l'avenir, on pourrait:

1. Analyser les SVG avec Python (bibliothèque `xml.etree.ElementTree`)
2. Extraire automatiquement les coordonnées des éléments
3. Générer les hotspots JSON automatiquement

Script Python exemple:
```python
import xml.etree.ElementTree as ET

tree = ET.parse('assets/images/ch1/young-experiment.svg')
root = tree.getroot()

# Extraire width et height
width = int(root.get('width'))
height = int(root.get('height'))

# Trouver tous les cercles
for circle in root.findall('.//{http://www.w3.org/2000/svg}circle'):
    cx = float(circle.get('cx'))
    cy = float(circle.get('cy'))
    r = float(circle.get('r'))
    print(f"Circle at ({cx}, {cy}) radius {r}")
```

## Références

- `js/question-renderer.js` lignes 393-466: Code de rendu Hotspot
- `data/questions.json`: Coordonnées des hotspots
- `assets/images/ch1/*.svg`: Images SVG source

---

**Status**: ✅ Chapitre 1 corrigé (11 questions)
**À faire**: Vérifier et corriger chapitres 2, 4, 6 (22 questions restantes)
**Impact**: Les hotspots sont maintenant cliquables aux bons endroits ! 🎯
