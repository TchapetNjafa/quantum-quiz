#!/usr/bin/env python3
"""
Script pour supprimer les questions génériques/placeholder du fichier questions.json
"""

import json
import sys
from pathlib import Path

# Patterns à rechercher pour identifier les questions génériques
GENERIC_PATTERNS = [
    "à compléter par le professeur",
    "à valider par le professeur",
    "TODO",
    "FIXME",
    "placeholder"
]

def is_generic_question(question):
    """Vérifie si une question est générique/placeholder"""
    question_text = question.get("question", "").lower()

    for pattern in GENERIC_PATTERNS:
        if pattern.lower() in question_text:
            return True

    return False

def clean_questions(input_file, output_file=None):
    """Supprime les questions génériques du fichier JSON"""

    # Si pas de fichier de sortie spécifié, écrase l'original
    if output_file is None:
        output_file = input_file

    print(f"📖 Lecture du fichier: {input_file}")

    # Charge le fichier JSON
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    total_removed = 0
    stats_by_chapter = {}

    # Parcourt chaque chapitre
    for chapter in data['chapters']:
        chapter_id = chapter['chapter_id']
        chapter_title = chapter['chapter_title']

        initial_count = len(chapter['questions'])

        # Filtre les questions non-génériques
        cleaned_questions = [
            q for q in chapter['questions']
            if not is_generic_question(q)
        ]

        removed_count = initial_count - len(cleaned_questions)

        if removed_count > 0:
            chapter['questions'] = cleaned_questions
            stats_by_chapter[chapter_id] = {
                'title': chapter_title,
                'removed': removed_count,
                'remaining': len(cleaned_questions)
            }
            total_removed += removed_count

            print(f"  📚 Chapitre {chapter_id}: {removed_count} questions supprimées ({len(cleaned_questions)} restantes)")

    # Sauvegarde le fichier nettoyé
    print(f"\n💾 Sauvegarde dans: {output_file}")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    # Affiche le résumé
    print(f"\n✅ NETTOYAGE TERMINÉ")
    print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"🗑️  Questions génériques supprimées: {total_removed}")

    # Calcule le total final
    total_questions = sum(len(ch['questions']) for ch in data['chapters'])
    print(f"📊 Total final: {total_questions} questions")
    print(f"")

    # Affiche le détail par chapitre
    if stats_by_chapter:
        print("📋 Détail par chapitre:")
        for ch_id in sorted(stats_by_chapter.keys()):
            info = stats_by_chapter[ch_id]
            print(f"  • Ch{ch_id} ({info['title']}): {info['remaining']} questions (-{info['removed']})")

    return total_removed, stats_by_chapter

if __name__ == "__main__":
    # Chemin vers le fichier questions.json
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    questions_file = project_dir / "data" / "questions.json"

    if not questions_file.exists():
        print(f"❌ Erreur: Fichier non trouvé: {questions_file}")
        sys.exit(1)

    print("🧹 NETTOYAGE DES QUESTIONS GÉNÉRIQUES")
    print("=" * 50)
    print()

    # Nettoie le fichier
    removed, stats = clean_questions(questions_file)

    if removed == 0:
        print("✨ Aucune question générique trouvée!")
    else:
        print(f"\n✨ {removed} questions génériques ont été supprimées avec succès!")

    print()
