#!/usr/bin/env python3
"""
Script pour retirer les points des flashcards (auto-évaluation)
"""

import json
from pathlib import Path

def main():
    json_path = Path(__file__).parent.parent / "data" / "questions.json"

    print("🔧 Suppression des points des flashcards...")

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    count = 0
    for chapter in data['chapters']:
        for q in chapter['questions']:
            if q.get('type') == 'flashcard' and 'points' in q:
                del q['points']
                count += 1

    print(f"✅ {count} flashcards mises à jour")

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("💾 Fichier sauvegardé")

if __name__ == "__main__":
    main()
