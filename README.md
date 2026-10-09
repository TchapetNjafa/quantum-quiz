# Quiz PHY321

Questions de révision du cours PHY321, *Introduction à la mécanique quantique*,
Département de Physique, Faculté des Sciences, Université de Yaoundé I.

En ligne : <https://tchapetnjafa.github.io/quantum-quiz/>
Site compagnon, le Carnet : <https://tchapetnjafa.github.io/quantum-workbook/>

## Ce que fait le site

- 247 questions sur les six chapitres du cours, en huit formats : QCM, vrai ou faux,
  calcul, associations, classement, schéma à annoter, fiche, interprétation.
- Mode entraînement (correction et explication après chaque réponse) et mode examen
  (chronomètre, correction à la fin).
- Chaque correction renvoie à la section du polycopié et à la section du Carnet.
- `?chapitre=N` présélectionne un chapitre : c'est le lien utilisé par le Carnet.
- Fiches recto-verso, glossaire, ressources vérifiées.
- Aucun compte. Statistiques et préférences restent dans le navigateur (`localStorage`).
  Après une première visite, le site fonctionne hors connexion (service worker).

## Lancer en local

Le site est statique. Il faut seulement un serveur HTTP (les pages chargent
`data/questions.json`, ce qui ne marche pas en `file://`) :

```bash
python3 -m http.server 8000
```

puis ouvrir <http://localhost:8000/>.

## Structure

```
index.html          accueil : réglages d'une série, question du jour, statistiques
quiz.html           déroulement d'une série
results.html        score et corrigé
flashcards.html     fiches recto-verso
glossary.html       glossaire
resources.html      liens externes (vérifiés en octobre 2026)
about.html          le cours, les auteurs
offline.html        page affichée hors connexion
css/carnet.css      système visuel commun avec le Carnet (copie à garder synchrone)
css/quiz.css        composants propres au quiz
js/common.js        thème, stockage local, chargement de la banque, configuration par URL
js/questions.js     affichage et correction des huit formats
js/quiz.js          déroulement d'une série
js/home.js          accueil
js/results.js       résultats
js/flashcards.js    fiches
data/questions.json banque de questions
scripts/valider_questions.py   contrôle de la banque avant publication
service-worker.js   mode hors connexion (changer VERSION à chaque mise en ligne)
```

## Ajouter ou corriger une question

1. Modifier `data/questions.json` (chapitre, puis tableau `questions`).
2. Lancer `python3 scripts/valider_questions.py` : il vérifie les champs de chaque format.
3. Changer `VERSION` dans `service-worker.js` pour que les appareils récupèrent la nouvelle banque.

## Auteurs

S. G. Nana Engo, J.-P. Tchapet Njafa, C. Tchodimou.

## Licence

Contenu sous licence [Creative Commons BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.fr).
