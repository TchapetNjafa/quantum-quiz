#!/usr/bin/env python3
"""
Script d'intégration des questions générées dans questions.json
"""

import json
from datetime import datetime
from collections import Counter

# Import the questions from the generation script
import sys
sys.path.append('.')
from generate_all_chapters import ch2_questions, ch3_questions, ch4_questions, ch5_questions, ch6_questions

# Load existing questions.json
with open('data/questions.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Define chapter information for new chapters
chapters_info = {
    2: {
        "chapter_id": 2,
        "chapter_number": "2",
        "chapter_title": "Mesure et Opérateurs",
        "chapter_description": "Expérience de Stern-Gerlach, quantification du spin, opérateurs hermitiens, valeurs propres et commutateurs",
        "section_reference": "Sections 2.1-2.3",
        "key_concepts": [
            "Stern-Gerlach",
            "Quantification du spin",
            "Opérateurs hermitiens",
            "Valeurs propres et vecteurs propres",
            "Commutateurs",
            "Matrices de Pauli",
            "Principe d'incertitude généralisé",
            "Mesures successives"
        ]
    },
    3: {
        "chapter_id": 3,
        "chapter_number": "3",
        "chapter_title": "Postulats de la Mécanique Quantique",
        "chapter_description": "Les six postulats fondamentaux, règle de Born, projection, évolution unitaire et équation de Schrödinger",
        "section_reference": "Sections 3.1-3.3",
        "key_concepts": [
            "Six postulats",
            "Espace de Hilbert",
            "Règle de Born",
            "Projection du vecteur d'état",
            "Équation de Schrödinger",
            "Évolution unitaire",
            "États stationnaires",
            "Constantes de mouvement",
            "Oscillations de Rabi"
        ]
    },
    4: {
        "chapter_id": 4,
        "chapter_number": "4",
        "chapter_title": "Systèmes Multi-Qubits et Intrication",
        "chapter_description": "Produit tensoriel, états intriqués, états de Bell, téléportation quantique et non-localité",
        "section_reference": "Sections 4.1-4.3",
        "key_concepts": [
            "Produit tensoriel",
            "Intrication quantique",
            "États de Bell",
            "Non-localité",
            "Paradoxe EPR",
            "Théorème de non-clonage",
            "Téléportation quantique",
            "Cryptographie quantique",
            "Matrice densité",
            "États mixtes"
        ]
    },
    5: {
        "chapter_id": 5,
        "chapter_number": "5",
        "chapter_title": "Espace Continu et Fonctions d'Onde",
        "chapter_description": "Fonction d'onde, relation de de Broglie, transformée de Fourier, paquets d'ondes et principe d'incertitude",
        "section_reference": "Sections 5.1-5.3",
        "key_concepts": [
            "Fonction d'onde",
            "Densité de probabilité",
            "Relation de de Broglie",
            "Transformée de Fourier",
            "Représentation position/impulsion",
            "Paquet d'ondes",
            "Vitesse de groupe",
            "Étalement du paquet d'ondes",
            "Principe d'incertitude de Heisenberg"
        ]
    },
    6: {
        "chapter_id": 6,
        "chapter_number": "6",
        "chapter_title": "Oscillateur Harmonique Quantique",
        "chapter_description": "Quantification de l'énergie, opérateurs création/annihilation, états de Fock et états cohérents",
        "section_reference": "Sections 6.1-6.3",
        "key_concepts": [
            "Quantification de l'énergie",
            "Énergie de point zéro",
            "Opérateurs échelle",
            "Opérateurs création/annihilation",
            "États de Fock",
            "États cohérents",
            "États comprimés",
            "Phonons",
            "Photons",
            "Effet Casimir"
        ]
    }
}

# Add new chapters with their questions
all_new_questions = {
    2: ch2_questions,
    3: ch3_questions,
    4: ch4_questions,
    5: ch5_questions,
    6: ch6_questions
}

# Add new chapters to the data structure
for chapter_num in [2, 3, 4, 5, 6]:
    chapter_data = chapters_info[chapter_num].copy()
    chapter_data["questions"] = all_new_questions[chapter_num]
    data["chapters"].append(chapter_data)

# Calculate new metadata
total_questions = sum(len(ch["questions"]) for ch in data["chapters"])

# Count by difficulty
all_difficulties = []
all_types = []
for chapter in data["chapters"]:
    for q in chapter["questions"]:
        all_difficulties.append(q["difficulty"])
        all_types.append(q["type"])

difficulty_dist = dict(Counter(all_difficulties))
type_dist = dict(Counter(all_types))

# Update metadata
data["metadata"] = {
    "version": "1.1.0",
    "generated_date": datetime.now().strftime("%Y-%m-%d"),
    "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    "total_questions": total_questions,
    "questions_by_chapter": {f"chapter_{ch['chapter_id']}": len(ch["questions"]) for ch in data["chapters"]},
    "difficulty_distribution": difficulty_dist,
    "question_types": type_dist
}

# Update course_info
data["course_info"]["total_questions"] = total_questions

# Write back to questions.json with proper formatting
with open('data/questions.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("=" * 70)
print("✅ INTÉGRATION RÉUSSIE!")
print("=" * 70)
print(f"\n📊 STATISTIQUES FINALES:")
print(f"   • Total questions : {total_questions}")
print(f"\n   • Par chapitre :")
for ch in data["chapters"]:
    print(f"      - Chapitre {ch['chapter_id']} : {len(ch['questions'])} questions")
print(f"\n   • Par difficulté :")
for diff, count in sorted(difficulty_dist.items()):
    percentage = (count / total_questions) * 100
    print(f"      - {diff:8s} : {count:3d} questions ({percentage:5.1f}%)")
print(f"\n   • Par type :")
for qtype, count in sorted(type_dist.items(), key=lambda x: -x[1]):
    percentage = (count / total_questions) * 100
    print(f"      - {qtype:15s} : {count:3d} questions ({percentage:5.1f}%)")
print("\n" + "=" * 70)
print("✅ Fichier data/questions.json mis à jour avec succès!")
print("=" * 70)
