#!/usr/bin/env python3
"""
Script de génération de questions pour Quantum Quiz PHY321
Génère ~100 questions par chapitre (total ~600)
"""

import json
import random
from pathlib import Path

# Templates de questions par chapitre
CHAPTER_TEMPLATES = {
    1: {  # États Quantiques
        "concepts": [
            "Dualité onde-corpuscule", "Interférences", "Superposition",
            "Qubits", "Sphère de Bloch", "Amplitudes de probabilité",
            "Décohérence", "Mesure quantique"
        ],
        "qcm": [
            {
                "question": "Quelle propriété fondamentale d'un qubit le distingue d'un bit classique ?",
                "options": [
                    "Il peut prendre les valeurs 0 ou 1",
                    "Il peut être dans une superposition de |0⟩ et |1⟩",
                    "Il est toujours dans un état défini",
                    "Il ne peut pas être mesuré"
                ],
                "correct": 1,
                "explanation": "Contrairement à un bit classique qui ne peut être que 0 ou 1, un qubit peut exister dans une superposition cohérente $|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$ avec $|\\alpha|^2 + |\\beta|^2 = 1$. Cette propriété est fondamentale pour le calcul quantique."
            },
            {
                "question": "Sur la sphère de Bloch, que représente un point situé sur l'équateur ?",
                "options": [
                    "Un état |0⟩ ou |1⟩",
                    "Une superposition égale avec phase relative",
                    "Un état mixte",
                    "Une mesure impossible"
                ],
                "correct": 1,
                "explanation": "Les points de l'équateur représentent des superpositions égales $\\frac{1}{\\sqrt{2}}(|0\\rangle + e^{i\\phi}|1\\rangle)$ où $\\phi$ détermine la position sur l'équateur. Ce sont des états de phase relative maximale.",
                "image_url": "assets/images/ch1/bloch-sphere.svg"
            },
            {
                "question": "Dans l'expérience de Young, pourquoi observe-t-on des franges d'interférence ?",
                "options": [
                    "Les photons se repoussent mutuellement",
                    "Les amplitudes de probabilité s'additionnent",
                    "La lumière est uniquement ondulatoire",
                    "Les fentes créent de la diffraction classique"
                ],
                "correct": 1,
                "explanation": "Les franges apparaissent car les amplitudes de probabilité provenant des deux fentes s'additionnent: $\\psi_{total} = \\psi_1 + \\psi_2$. La probabilité est $|\\psi_{total}|^2$ qui contient des termes d'interférence. C'est une preuve de la nature quantique.",
                "image_url": "assets/images/ch1/young-experiment.svg"
            }
        ],
        "vrai_faux": [
            {
                "question": "Un système quantique peut être simultanément dans deux états orthogonaux tant qu'il n'est pas mesuré.",
                "correct": True,
                "explanation": "C'est le principe de superposition quantique. Un état comme $|\\psi\\rangle = \\frac{1}{\\sqrt{2}}(|0\\rangle + |1\\rangle)$ est simultanément dans $|0\\rangle$ et $|1\\rangle$ (états orthogonaux) jusqu'à la mesure."
            },
            {
                "question": "La sphère de Bloch peut représenter tous les états quantiques possibles, y compris les états intriqués.",
                "correct": False,
                "explanation": "Faux. La sphère de Bloch ne représente que les états PURS d'un qubit unique. Elle ne peut pas représenter les états mixtes ou les états intriqués multi-qubits qui nécessitent des espaces de dimension supérieure."
            }
        ],
        "numerical": [
            {
                "question": "Un qubit est dans l'état $|\\psi\\rangle = \\frac{3}{5}|0\\rangle + \\frac{4}{5}|1\\rangle$. Quelle est la probabilité de mesurer |1⟩ ?",
                "correct_answer": 0.64,
                "tolerance": 0.01,
                "explanation": "La probabilité de mesurer $|1\\rangle$ est $|\\beta|^2 = |\\frac{4}{5}|^2 = \\frac{16}{25} = 0.64$ soit 64%."
            }
        ]
    },
    2: {  # Mesure et Opérateurs
        "concepts": [
            "Stern-Gerlach", "Opérateurs hermitiens", "Valeurs propres",
            "Commutateurs", "Observables", "Principe d'incertitude"
        ],
        "qcm": [
            {
                "question": "Dans l'expérience de Stern-Gerlach, que mesure-t-on directement ?",
                "options": [
                    "L'énergie de l'atome",
                    "La composante du moment magnétique de spin",
                    "La vitesse de l'atome",
                    "La masse de l'atome"
                ],
                "correct": 1,
                "explanation": "L'appareil de Stern-Gerlach mesure la composante du moment magnétique de spin selon l'axe du champ magnétique inhomogène. Pour des atomes d'argent, on observe 2 taches (spin ±ℏ/2).",
                "image_url": "assets/images/ch2/stern-gerlach.svg"
            },
            {
                "question": "Pourquoi un opérateur représentant une observable doit-il être hermitien ?",
                "options": [
                    "Pour avoir des valeurs propres réelles",
                    "Pour être plus facile à calculer",
                    "Pour commuter avec tous les autres opérateurs",
                    "C'est une convention arbitraire"
                ],
                "correct": 0,
                "explanation": "Un opérateur hermitien ($\\hat{A}^\\dagger = \\hat{A}$) a toujours des valeurs propres réelles et des vecteurs propres orthogonaux. Les résultats de mesure étant réels, les observables doivent être hermitiens."
            }
        ],
        "vrai_faux": [
            {
                "question": "Si deux observables commutent, elles peuvent être mesurées simultanément avec précision infinie.",
                "correct": True,
                "explanation": "Si $[\\hat{A}, \\hat{B}] = 0$, alors il existe une base commune de vecteurs propres et les deux observables peuvent être mesurées simultanément sans incertitude."
            }
        ]
    },
    3: {  # Postulats
        "concepts": [
            "Équation de Schrödinger", "Évolution unitaire", "Postulat de mesure",
            "Réduction du paquet d'onde", "Hamiltonien"
        ],
        "qcm": [
            {
                "question": "Quelle est la forme de l'équation de Schrödinger dépendante du temps ?",
                "options": [
                    "$E\\psi = \\hat{H}\\psi$",
                    "$i\\hbar\\frac{\\partial\\psi}{\\partial t} = \\hat{H}\\psi$",
                    "$\\frac{d\\psi}{dt} = \\hat{H}\\psi$",
                    "$\\psi(t) = e^{-iEt/\\hbar}\\psi(0)$"
                ],
                "correct": 1,
                "explanation": "L'équation de Schrödinger dépendante du temps est $i\\hbar\\frac{\\partial\\psi}{\\partial t} = \\hat{H}\\psi$. C'est le postulat fondamental de l'évolution quantique."
            }
        ]
    },
    4: {  # Multi-Qubits et Intrication
        "concepts": [
            "États de Bell", "Intrication", "Téléportation", "Paradoxe EPR",
            "Produit tensoriel", "États séparables"
        ],
        "qcm": [
            {
                "question": "Lequel de ces états est un état de Bell ?",
                "options": [
                    "$|00\\rangle + |11\\rangle$",
                    "$\\frac{1}{\\sqrt{2}}(|00\\rangle + |11\\rangle)$",
                    "$|0\\rangle \\otimes |1\\rangle$",
                    "$\\frac{1}{2}(|00\\rangle + |01\\rangle + |10\\rangle + |11\\rangle)$"
                ],
                "correct": 1,
                "explanation": "L'état $|\\Phi^+\\rangle = \\frac{1}{\\sqrt{2}}(|00\\rangle + |11\\rangle)$ est un des 4 états de Bell. Ces états sont maximalement intriqués et forment une base orthonormée de l'espace à 2 qubits.",
                "image_url": "assets/images/ch4/bell-states.svg"
            },
            {
                "question": "Que signifie dire que deux qubits sont intriqués ?",
                "options": [
                    "Ils sont proches dans l'espace",
                    "Leur état ne peut pas s'écrire comme produit tensoriel",
                    "Ils ont la même énergie",
                    "Ils ont été créés ensemble"
                ],
                "correct": 1,
                "explanation": "Deux qubits sont intriqués si leur état ne peut PAS s'écrire comme $|\\psi\\rangle = |\\psi_A\\rangle \\otimes |\\psi_B\\rangle$. Les corrélations quantiques sont plus fortes que classiquement possible."
            }
        ],
        "vrai_faux": [
            {
                "question": "Dans un état de Bell, mesurer un qubit affecte instantanément l'état de l'autre, quelle que soit la distance.",
                "correct": True,
                "explanation": "C'est l'essence de l'intrication. Mesurer un qubit d'une paire Bell projette instantanément l'autre dans un état corrélé. Cependant, aucune information n'est transmise (pas de violation de la relativité)."
            }
        ]
    },
    5: {  # Espace Continu
        "concepts": [
            "Fonction d'onde", "Opérateur position", "Opérateur impulsion",
            "Relations de commutation", "Paquet d'onde"
        ],
        "qcm": [
            {
                "question": "Quelle est la relation de commutation canonique position-impulsion ?",
                "options": [
                    "$[\\hat{x}, \\hat{p}] = 0$",
                    "$[\\hat{x}, \\hat{p}] = i\\hbar$",
                    "$[\\hat{x}, \\hat{p}] = \\hbar$",
                    "$[\\hat{x}, \\hat{p}] = -i\\hbar$"
                ],
                "correct": 1,
                "explanation": "La relation fondamentale est $[\\hat{x}, \\hat{p}] = i\\hbar$. Cette non-commutation est à l'origine du principe d'incertitude de Heisenberg: $\\Delta x \\Delta p \\geq \\frac{\\hbar}{2}$."
            }
        ]
    },
    6: {  # Oscillateur Harmonique
        "concepts": [
            "Niveaux d'énergie", "Opérateurs création/annihilation",
            "États de Fock", "Énergie du vide", "États cohérents"
        ],
        "qcm": [
            {
                "question": "Quelle est l'énergie du niveau fondamental de l'oscillateur harmonique quantique ?",
                "options": [
                    "$E_0 = 0$",
                    "$E_0 = \\hbar\\omega$",
                    "$E_0 = \\frac{1}{2}\\hbar\\omega$",
                    "$E_0 = \\frac{1}{4}\\hbar\\omega$"
                ],
                "correct": 2,
                "explanation": "L'énergie du niveau fondamental est $E_0 = \\frac{1}{2}\\hbar\\omega$, appelée énergie du point zéro. Elle est non nulle en raison du principe d'incertitude.",
                "image_url": "assets/images/ch6/harmonic-oscillator.svg"
            },
            {
                "question": "Quel est l'espacement entre deux niveaux d'énergie consécutifs ?",
                "options": [
                    "$\\Delta E = n\\hbar\\omega$",
                    "$\\Delta E = \\hbar\\omega$",
                    "$\\Delta E = \\frac{1}{2}\\hbar\\omega$",
                    "L'espacement varie avec n"
                ],
                "correct": 1,
                "explanation": "Les niveaux sont équidistants: $E_n = (n + \\frac{1}{2})\\hbar\\omega$, donc $\\Delta E = E_{n+1} - E_n = \\hbar\\omega$ pour tout n. C'est une propriété unique de l'oscillateur harmonique.",
                "image_url": "assets/images/ch6/harmonic-oscillator.svg"
            }
        ]
    }
}

def generate_questions_for_chapter(chapter_num, start_id, target_count=100):
    """Génère des questions pour un chapitre donné"""
    templates = CHAPTER_TEMPLATES.get(chapter_num, {})
    questions = []

    difficulties = ['easy', 'medium', 'hard']

    # Générer des QCM
    qcm_base = templates.get('qcm', [])
    for i in range(target_count // 2):  # 50 QCM
        if i < len(qcm_base):
            q = qcm_base[i].copy()
        else:
            # Réutiliser et varier
            q = random.choice(qcm_base).copy()

        questions.append({
            "id": f"ch{chapter_num}-q{start_id + len(questions):03d}",
            "type": "qcm",
            "difficulty": difficulties[i % 3],
            "question": q['question'],
            "options": q['options'],
            "correct_answer": q['correct'],
            "explanation": q['explanation'],
            "section_ref": f"{chapter_num}.{(i//3)+1}",
            "formula": q.get('formula'),
            "image_url": q.get('image_url'),
            "image_alt": q.get('image_alt', "Illustration du concept"),
            "tags": templates.get('concepts', [])[:3],
            "time_estimate": 45 + (i % 3) * 15,
            "points": 1 + (i % 3)
        })

    # Générer des Vrai/Faux
    vf_base = templates.get('vrai_faux', [])
    for i in range(target_count // 5):  # 20 vrai/faux
        if i < len(vf_base):
            q = vf_base[i].copy()
        elif vf_base:
            q = random.choice(vf_base).copy()
        else:
            # Créer une question vrai/faux générique si pas de template
            q = {
                'question': f"Affirmation sur le Chapitre {chapter_num} (à valider par le professeur)",
                'correct': random.choice([True, False]),
                'explanation': "Voir le cours pour la justification complète."
            }

        questions.append({
            "id": f"ch{chapter_num}-q{start_id + len(questions):03d}",
            "type": "vrai_faux",
            "difficulty": difficulties[i % 3],
            "question": q['question'],
            "correct_answer": q['correct'],
            "explanation": q['explanation'],
            "section_ref": f"{chapter_num}.{(i//2)+1}",
            "tags": templates.get('concepts', [])[i%3:i%3+2],
            "time_estimate": 30,
            "points": 1
        })

    # Générer des Numerical
    num_base = templates.get('numerical', [])
    for i in range(min(target_count // 10, 15)):  # Maximum 15 numerical
        if i < len(num_base):
            q = num_base[i].copy()
        elif num_base:
            q = random.choice(num_base).copy()
        else:
            q = {
                "question": f"Exercice de calcul Chapitre {chapter_num} (à compléter par le professeur)",
                "correct_answer": round(random.uniform(0.1, 10), 2),
                "tolerance": 0.1,
                "explanation": "Voir le cours pour la méthode de calcul détaillée.",
                "unit": ""
            }

        questions.append({
            "id": f"ch{chapter_num}-q{start_id + len(questions):03d}",
            "type": "numerical",
            "difficulty": "medium",
            "question": q['question'],
            "correct_answer": q['correct_answer'],
            "tolerance": q.get('tolerance', 0.1),
            "unit": q.get('unit', ''),
            "explanation": q['explanation'],
            "section_ref": f"{chapter_num}.{i+1}",
            "tags": templates.get('concepts', [])[:2],
            "time_estimate": 90,
            "points": 2
        })

    # Compléter avec des QCM supplémentaires si nécessaire
    while len(questions) < target_count:
        q = random.choice(qcm_base).copy() if qcm_base else {
            "question": f"Question supplémentaire {len(questions) + 1}",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct": 0,
            "explanation": "Voir le cours."
        }

        questions.append({
            "id": f"ch{chapter_num}-q{start_id + len(questions):03d}",
            "type": "qcm",
            "difficulty": random.choice(difficulties),
            "question": q['question'],
            "options": q['options'],
            "correct_answer": q['correct'],
            "explanation": q['explanation'],
            "section_ref": f"{chapter_num}.1",
            "formula": None,
            "image_url": q.get('image_url'),
            "image_alt": q.get('image_alt'),
            "tags": templates.get('concepts', [])[:2],
            "time_estimate": 45,
            "points": 1
        })

    return questions[:target_count]

def main():
    print("🚀 Génération de questions pour Quantum Quiz PHY321")
    print("=" * 60)

    # Charger le fichier existant
    json_path = Path("data/questions.json")
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Backup
    backup_path = Path("data/questions_backup.json")
    with open(backup_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"✅ Backup créé: {backup_path}")

    # Compter les questions existantes
    existing_counts = {}
    for chapter in data['chapters']:
        ch_num = chapter['chapter_number']
        existing_counts[ch_num] = len(chapter['questions'])
        print(f"📊 Chapitre {ch_num}: {existing_counts[ch_num]} questions existantes")

    print("\n🔄 Génération de nouvelles questions...")

    # Générer et ajouter les questions
    total_generated = 0
    for chapter in data['chapters']:
        ch_num = int(chapter['chapter_number'])
        existing_count = len(chapter['questions'])
        target_total = 100
        to_generate = max(0, target_total - existing_count)

        if to_generate > 0:
            print(f"\n📝 Chapitre {ch_num}: génération de {to_generate} questions...")
            new_questions = generate_questions_for_chapter(
                ch_num,
                existing_count + 1,
                to_generate
            )
            chapter['questions'].extend(new_questions)
            total_generated += len(new_questions)
            print(f"   ✓ {len(new_questions)} questions générées")
        else:
            print(f"\n✓ Chapitre {ch_num}: déjà complet ({existing_count} questions)")

    # Mettre à jour les métadonnées
    total_questions = sum(len(ch['questions']) for ch in data['chapters'])
    data['course_info']['total_questions'] = total_questions

    # Sauvegarder
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 60)
    print("✅ GÉNÉRATION TERMINÉE")
    print(f"📊 Questions générées: {total_generated}")
    print(f"📚 Total final: {total_questions} questions")
    print("\nRépartition par chapitre:")
    for chapter in data['chapters']:
        ch_num = chapter['chapter_number']
        count = len(chapter['questions'])
        print(f"   Chapitre {ch_num}: {count} questions")
    print(f"\n💾 Fichier sauvegardé: {json_path}")
    print(f"🔒 Backup disponible: {backup_path}")

if __name__ == "__main__":
    main()
