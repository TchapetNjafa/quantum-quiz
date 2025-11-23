#!/usr/bin/env python3
"""
Script de validation de qualité pour toutes les questions
"""

import json
import sys
from pathlib import Path
from collections import defaultdict

# Types de questions valides
VALID_TYPES = ['qcm', 'vrai_faux', 'matching', 'numerical', 'interpretation']

# Niveaux de difficulté valides
VALID_DIFFICULTIES = ['easy', 'medium', 'hard']

# Champs requis pour tous les types
REQUIRED_FIELDS = ['id', 'type', 'question', 'difficulty']

class QuestionValidator:
    def __init__(self):
        self.errors = []
        self.warnings = []
        self.stats = defaultdict(int)
        self.duplicate_ids = set()
        self.all_ids = set()

    def validate_structure(self, question, chapter_id):
        """Valide la structure de base de la question"""
        q_id = question.get('id', 'NO_ID')

        # Vérifie les champs requis
        for field in REQUIRED_FIELDS:
            if field not in question:
                self.errors.append(f"[{q_id}] Champ manquant: {field}")
                return False

        # Vérifie le type
        if question['type'] not in VALID_TYPES:
            self.errors.append(f"[{q_id}] Type invalide: {question['type']}")

        # Vérifie la difficulté
        if question['difficulty'] not in VALID_DIFFICULTIES:
            self.errors.append(f"[{q_id}] Difficulté invalide: {question['difficulty']}")

        # Vérifie que la question n'est pas vide
        if len(question['question'].strip()) < 10:
            self.warnings.append(f"[{q_id}] Question trop courte: '{question['question']}'")

        # Vérifie les IDs dupliqués
        if q_id in self.all_ids:
            self.duplicate_ids.add(q_id)
            self.errors.append(f"[{q_id}] ID dupliqué!")
        else:
            self.all_ids.add(q_id)

        return True

    def validate_qcm(self, question):
        """Valide une question QCM"""
        q_id = question.get('id', 'NO_ID')

        if 'options' not in question:
            self.errors.append(f"[{q_id}] QCM sans options")
            return

        if 'correct_answer' not in question:
            self.errors.append(f"[{q_id}] QCM sans correct_answer")
            return

        options = question['options']
        if len(options) < 2:
            self.errors.append(f"[{q_id}] QCM avec moins de 2 options")

        # Vérifie que la réponse correcte est un index valide
        correct = question['correct_answer']
        if not isinstance(correct, int):
            self.errors.append(f"[{q_id}] correct_answer doit être un entier (index), pas '{type(correct).__name__}'")
        elif correct < 0 or correct >= len(options):
            self.errors.append(f"[{q_id}] correct_answer index {correct} invalide (options: {len(options)})")

    def validate_vrai_faux(self, question):
        """Valide une question Vrai/Faux"""
        q_id = question.get('id', 'NO_ID')

        if 'correct_answer' not in question:
            self.errors.append(f"[{q_id}] Vrai/Faux sans correct_answer")
            return

        if not isinstance(question['correct_answer'], bool):
            self.errors.append(f"[{q_id}] Vrai/Faux: correct_answer doit être boolean")

    def validate_matching(self, question):
        """Valide une question de correspondance"""
        q_id = question.get('id', 'NO_ID')

        if 'pairs' not in question:
            self.errors.append(f"[{q_id}] Matching sans pairs")
            return

        pairs = question['pairs']
        if len(pairs) < 2:
            self.errors.append(f"[{q_id}] Matching avec moins de 2 paires")

        # Vérifie la structure des paires
        for i, pair in enumerate(pairs):
            if 'left' not in pair or 'right' not in pair:
                self.errors.append(f"[{q_id}] Paire {i} incomplète (manque left ou right)")

    def validate_numerical(self, question):
        """Valide une question numérique"""
        q_id = question.get('id', 'NO_ID')

        if 'correct_answer' not in question:
            self.errors.append(f"[{q_id}] Numerical sans correct_answer")
            return

        if not isinstance(question['correct_answer'], (int, float)):
            self.errors.append(f"[{q_id}] Numerical: correct_answer doit être un nombre")

        if 'tolerance' in question and not isinstance(question['tolerance'], (int, float)):
            self.errors.append(f"[{q_id}] Numerical: tolerance doit être un nombre")

    def validate_interpretation(self, question):
        """Valide une question d'interprétation"""
        q_id = question.get('id', 'NO_ID')

        if 'key_points' not in question:
            self.warnings.append(f"[{q_id}] Interpretation sans key_points")

    def validate_content(self, question):
        """Valide le contenu spécifique selon le type"""
        q_type = question.get('type')

        if q_type == 'qcm':
            self.validate_qcm(question)
        elif q_type == 'vrai_faux':
            self.validate_vrai_faux(question)
        elif q_type == 'matching':
            self.validate_matching(question)
        elif q_type == 'numerical':
            self.validate_numerical(question)
        elif q_type == 'interpretation':
            self.validate_interpretation(question)

    def validate_quality(self, question):
        """Vérifie la qualité du contenu"""
        q_id = question.get('id', 'NO_ID')

        # Vérifie la présence d'une explication
        if 'explanation' not in question or not question['explanation']:
            self.warnings.append(f"[{q_id}] Pas d'explication")

        # Vérifie la référence à la section du cours
        if 'section_ref' not in question or not question['section_ref']:
            self.warnings.append(f"[{q_id}] Pas de référence de section")

        # Vérifie les tags
        if 'tags' not in question or not question['tags'] or len(question['tags']) == 0:
            self.warnings.append(f"[{q_id}] Pas de tags associés")

    def validate_question(self, question, chapter_id):
        """Valide complètement une question"""
        if not self.validate_structure(question, chapter_id):
            return

        self.validate_content(question)
        self.validate_quality(question)

        # Stats
        self.stats['total'] += 1
        self.stats[f"type_{question['type']}"] += 1
        self.stats[f"diff_{question['difficulty']}"] += 1

    def print_report(self):
        """Affiche le rapport de validation"""
        print("\n" + "=" * 70)
        print("📊 RAPPORT DE VALIDATION")
        print("=" * 70)

        print(f"\n✅ Questions validées: {self.stats['total']}")
        print(f"\n📝 Par type:")
        for q_type in VALID_TYPES:
            count = self.stats.get(f"type_{q_type}", 0)
            if count > 0:
                print(f"  • {q_type.upper()}: {count}")

        print(f"\n🎯 Par difficulté:")
        for diff in VALID_DIFFICULTIES:
            count = self.stats.get(f"diff_{diff}", 0)
            if count > 0:
                emoji = "🟢" if diff == "easy" else "🟡" if diff == "medium" else "🔴"
                print(f"  {emoji} {diff.capitalize()}: {count}")

        # Erreurs
        if self.errors:
            print(f"\n❌ ERREURS CRITIQUES ({len(self.errors)}):")
            print("━" * 70)
            for error in self.errors[:20]:  # Limite à 20 pour lisibilité
                print(f"  {error}")
            if len(self.errors) > 20:
                print(f"  ... et {len(self.errors) - 20} autres erreurs")
        else:
            print(f"\n✅ Aucune erreur critique")

        # Avertissements
        if self.warnings:
            print(f"\n⚠️  AVERTISSEMENTS ({len(self.warnings)}):")
            print("━" * 70)
            for warning in self.warnings[:20]:
                print(f"  {warning}")
            if len(self.warnings) > 20:
                print(f"  ... et {len(self.warnings) - 20} autres avertissements")
        else:
            print(f"\n✅ Aucun avertissement")

        # IDs dupliqués
        if self.duplicate_ids:
            print(f"\n🔴 IDs DUPLIQUÉS ({len(self.duplicate_ids)}):")
            print("━" * 70)
            for dup_id in sorted(self.duplicate_ids):
                print(f"  {dup_id}")

        print("\n" + "=" * 70)

        # Verdict final
        if not self.errors:
            print("✨ VALIDATION RÉUSSIE - Toutes les questions sont valides!")
        else:
            print(f"⚠️  VALIDATION ÉCHOUÉE - {len(self.errors)} erreurs à corriger")

        print("=" * 70 + "\n")

        return len(self.errors) == 0

def validate_questions_file(file_path):
    """Valide toutes les questions du fichier"""
    print(f"📖 Lecture du fichier: {file_path}")

    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    validator = QuestionValidator()

    print(f"🔍 Validation en cours...")
    for chapter in data['chapters']:
        chapter_id = chapter['chapter_id']
        chapter_title = chapter['chapter_title']

        print(f"  📚 Chapitre {chapter_id}: {chapter_title} ({len(chapter['questions'])} questions)")

        for question in chapter['questions']:
            validator.validate_question(question, chapter_id)

    success = validator.print_report()

    return success

if __name__ == "__main__":
    # Chemin vers le fichier questions.json
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    questions_file = project_dir / "data" / "questions.json"

    if not questions_file.exists():
        print(f"❌ Erreur: Fichier non trouvé: {questions_file}")
        sys.exit(1)

    print("🔍 VALIDATION DE LA QUALITÉ DES QUESTIONS")
    print("=" * 70)
    print()

    success = validate_questions_file(questions_file)

    sys.exit(0 if success else 1)
