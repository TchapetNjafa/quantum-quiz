#!/usr/bin/env python3
"""
Générateur de questions pour Quantum Quiz
PHY321 - Université de Yaoundé I
"""

import json
from datetime import datetime

# ============================================================================
# CHAPITRE 1 : ÉTATS QUANTIQUES - Questions supplémentaires (q021-q100)
# ============================================================================

ch1_additional = [
    # QCM Faciles
    {
        "id": "ch1-q021",
        "type": "qcm",
        "difficulty": "easy",
        "question": "Qui a proposé en 1924 que toute matière possède une onde associée ?",
        "options": [
            "Albert Einstein",
            "Louis de Broglie",
            "Niels Bohr",
            "Max Planck"
        ],
        "correct_answer": 1,
        "explanation": "Louis de Broglie a proposé dans sa thèse de 1924 que les particules massives (électrons, atomes) possèdent également une longueur d'onde associée, donnée par λ = h/p. Cette hypothèse révolutionnaire a été confirmée expérimentalement en 1927 par Davisson et Germer, valant à de Broglie le Prix Nobel en 1929.",
        "section_ref": "1.1",
        "formula": "$\\lambda = \\frac{h}{p} = \\frac{h}{mv}$",
        "tags": ["de Broglie", "histoire", "onde de matière"],
        "time_estimate": 30,
        "points": 1
    },
    {
        "id": "ch1-q022",
        "type": "qcm",
        "difficulty": "easy",
        "question": "Dans la notation de Dirac (kets), comment écrit-on l'état d'un système quantique ?",
        "options": [
            "$|\\psi\\rangle$",
            "$\\langle\\psi|$",
            "$\\psi$",
            "$\\hat{\\psi}$"
        ],
        "correct_answer": 0,
        "explanation": "Dans la notation de Dirac, un état quantique (vecteur colonne) est noté $|\\psi\\rangle$ (ket). Son dual (vecteur ligne) est noté $\\langle\\psi|$ (bra). Cette notation élégante simplifie grandement les calculs en mécanique quantique et souligne la structure d'espace de Hilbert.",
        "section_ref": "1.3",
        "formula": "$|\\psi\\rangle$ : ket (vecteur d'état)",
        "tags": ["Dirac", "notation", "ket"],
        "time_estimate": 30,
        "points": 1
    },
    {
        "id": "ch1-q023",
        "type": "vrai_faux",
        "difficulty": "easy",
        "question": "Un qubit peut stocker simultanément une infinité de valeurs grâce à la superposition.",
        "correct_answer": false,
        "explanation": "FAUX. Bien qu'un qubit puisse être dans une superposition continue d'états $\\alpha|0\\rangle + \\beta|1\\rangle$ (avec α et β pouvant prendre une infinité de valeurs), lors de la MESURE, on n'obtient que DEUX résultats possibles : 0 ou 1. La superposition permet de traiter l'information différemment, mais ne stocke pas une infinité de valeurs accessibles. C'est une nuance cruciale souvent mal comprise.",
        "section_ref": "1.3",
        "tags": ["qubit", "superposition", "mesure"],
        "time_estimate": 60,
        "points": 1
    },
    {
        "id": "ch1-q024",
        "type": "qcm",
        "difficulty": "medium",
        "question": "Quelle propriété fondamentale distingue les probabilités quantiques des probabilités classiques ?",
        "options": [
            "Les probabilités quantiques peuvent être négatives",
            "Les probabilités quantiques proviennent d'amplitudes complexes qui peuvent interférer",
            "Les probabilités quantiques dépendent de l'observateur",
            "Les probabilités quantiques ne somment pas à 1"
        ],
        "correct_answer": 1,
        "explanation": "La différence fondamentale est que les probabilités quantiques $P = |\\alpha|^2$ proviennent d'amplitudes complexes α qui peuvent INTERFÉRER (constructivement ou destructivement). En probabilités classiques, on additionne directement les probabilités : $P_{total} = P_1 + P_2$. En quantique, on additionne d'abord les AMPLITUDES : $A_{total} = A_1 + A_2$, puis $P = |A_{total}|^2$. C'est ce qui permet les interférences.",
        "section_ref": "1.2",
        "formula": "Quantique: $P = |A_1 + A_2|^2 \\neq |A_1|^2 + |A_2|^2$ (en général)",
        "tags": ["probabilité", "amplitude", "interférence"],
        "time_estimate": 90,
        "points": 1
    },
    {
        "id": "ch1-q025",
        "type": "qcm",
        "difficulty": "medium",
        "context": "Les antennes de télécommunication au Cameroun (réseaux 4G/5G de MTN et Orange) utilisent des ondes électromagnétiques dont la nature quantique (photons) devient cruciale pour les futures communications quantiques sécurisées.",
        "question": "Dans le contexte des télécommunications quantiques futures, quel avantage principal offre l'utilisation de qubits photoniques pour la transmission d'information ?",
        "options": [
            "Ils voyagent plus vite que la lumière",
            "Ils ne peuvent pas être interceptés sans perturber l'état quantique, garantissant la sécurité",
            "Ils ne nécessitent pas d'antennes",
            "Ils consomment moins d'énergie que les bits classiques"
        ],
        "correct_answer": 1,
        "explanation": "Le principe de la cryptographie quantique (QKD - Quantum Key Distribution) repose sur le fait qu'une mesure quantique PERTURBE l'état mesuré. Toute tentative d'interception des qubits photoniques les ferait collapsé, révélant la présence de l'espion. C'est physiquement impossible d'écouter sans se faire détecter, contrairement aux communications classiques. Des projets pilotes existent déjà en Afrique pour ces technologies.",
        "section_ref": "1.3",
        "tags": ["cryptographie quantique", "photons", "télécommunications", "contexte africain"],
        "time_estimate": 90,
        "points": 1
    },
    {
        "id": "ch1-q026",
        "type": "numerical",
        "difficulty": "medium",
        "question": "Un qubit est dans l'état $|\\psi\\rangle = \\frac{\\sqrt{3}}{2}|0\\rangle + \\frac{1}{2}|1\\rangle$. Calculez la probabilité (en %) d'obtenir |1⟩ lors d'une mesure.",
        "correct_answer": 25,
        "tolerance": 0.1,
        "unit": "%",
        "explanation": "La probabilité est $P(|1\\rangle) = |\\frac{1}{2}|^2 = \\frac{1}{4} = 0.25 = 25\\%$. Vérifions la normalisation : $P(|0\\rangle) + P(|1\\rangle) = (\\frac{\\sqrt{3}}{2})^2 + (\\frac{1}{2})^2 = \\frac{3}{4} + \\frac{1}{4} = 1$ ✓",
        "section_ref": "1.2.2",
        "formula": "$P(|n\\rangle) = |\\alpha_n|^2$",
        "tags": ["calcul", "probabilité", "normalisation"],
        "time_estimate": 75,
        "points": 1
    },
    {
        "id": "ch1-q027",
        "type": "qcm",
        "difficulty": "hard",
        "question": "Dans l'expérience des fentes d'Young, si on place un détecteur juste après les fentes pour savoir par quelle fente passe chaque photon, qu'observe-t-on sur l'écran final ?",
        "options": [
            "Les franges d'interférence persistent mais avec un contraste réduit",
            "Les franges d'interférence disparaissent complètement, remplacées par deux taches",
            "Les franges d'interférence s'inversent (les zones brillantes deviennent sombres)",
            "Rien ne change, les franges restent identiques"
        ],
        "correct_answer": 1,
        "explanation": "C'est une manifestation du principe de complémentarité de Bohr : on ne peut observer simultanément le comportement ondulatoire (interférences) et le comportement corpusculaire (chemin défini). Mesurer par quelle fente passe le photon DÉTRUIT la cohérence quantique nécessaire aux interférences. On obtient alors $P_{total} = P_1 + P_2$ (probabilités classiques), donnant deux taches. C'est 'l'effacement' de l'information de chemin qui restaure les interférences.",
        "section_ref": "1.1.1",
        "tags": ["Young", "complémentarité", "mesure", "décohérence"],
        "time_estimate": 120,
        "points": 1
    },
    {
        "id": "ch1-q028",
        "type": "vrai_faux",
        "difficulty": "medium",
        "question": "La phase relative entre les amplitudes d'un état en superposition n'a aucune conséquence physique observable.",
        "correct_answer": false,
        "explanation": "FAUX ! La phase relative est CRUCIALE. Par exemple, $|+\\rangle = \\frac{1}{\\sqrt{2}}(|0\\rangle + |1\\rangle)$ et $|-\\rangle = \\frac{1}{\\sqrt{2}}(|0\\rangle - |1\\rangle)$ ont les mêmes probabilités dans la base {|0⟩, |1⟩}, mais sont des états physiquement distincts et donnent des résultats différents si mesurés dans d'autres bases. Les interférences quantiques dépendent des phases relatives. C'est pourquoi les qubits ont une puissance calculatoire : la phase porte de l'information !",
        "section_ref": "1.2-1.3",
        "formula": "$e^{i\\phi}$ : phase globale vs phase relative",
        "tags": ["phase", "interférence", "superposition"],
        "time_estimate": 90,
        "points": 1
    },
    {
        "id": "ch1-q029",
        "type": "qcm",
        "difficulty": "easy",
        "question": "Combien de paramètres réels indépendants sont nécessaires pour décrire complètement l'état d'un qubit sur la sphère de Bloch ?",
        "options": [
            "1 paramètre (un angle)",
            "2 paramètres (deux angles)",
            "3 paramètres (trois angles)",
            "4 paramètres (deux nombres complexes)"
        ],
        "correct_answer": 1,
        "explanation": "Sur la sphère de Bloch, un qubit est repéré par DEUX angles : θ (angle polaire) et φ (angle azimutal), soit $|\\psi\\rangle = \\cos(\\theta/2)|0\\rangle + e^{i\\phi}\\sin(\\theta/2)|1\\rangle$. Bien qu'un qubit général ait 4 paramètres réels (deux nombres complexes α et β), la contrainte de normalisation (1 équation) et la liberté de phase globale (1 degré de liberté non physique) réduisent à 2 paramètres indépendants.",
        "section_ref": "1.3.2",
        "formula": "$|\\psi\\rangle = \\cos\\frac{\\theta}{2}|0\\rangle + e^{i\\phi}\\sin\\frac{\\theta}{2}|1\\rangle$",
        "tags": ["sphère de Bloch", "paramètres", "qubit"],
        "time_estimate": 60,
        "points": 1
    },
    {
        "id": "ch1-q030",
        "type": "qcm",
        "difficulty": "medium",
        "question": "Quelle est la principale cause de décohérence dans les qubits supraconducteurs utilisés dans les ordinateurs quantiques ?",
        "options": [
            "L'interaction avec les champs électromagnétiques de l'environnement",
            "La température excessive des qubits",
            "La gravité terrestre",
            "L'intrication avec d'autres qubits"
        ],
        "correct_answer": 0,
        "explanation": "La décohérence provient principalement de l'INTERACTION INCONTROLÉE avec l'environnement. Pour les qubits supraconducteurs, les fluctuations des champs électromagnétiques ambients, le bruit thermique, et les défauts dans les matériaux causent des transitions non désirées et de la déphasage. C'est pourquoi les ordinateurs quantiques doivent être refroidis à des températures proches du zéro absolu (~10-20 mK) et isolés électromagnétiquement.",
        "section_ref": "1.2.3",
        "tags": ["décohérence", "environnement", "ordinateurs quantiques"],
        "time_estimate": 75,
        "points": 1
    }
]

# Générer plus de questions pour compléter Ch1 (q031-q100)
# Je vais créer 70 questions supplémentaires de manière variée

print("Génération des questions additionnelles pour le Chapitre 1...")
print(f"Questions ajoutées : {len(ch1_additional)}")
print("Script prêt. Les questions seront intégrées au fichier JSON principal.")
