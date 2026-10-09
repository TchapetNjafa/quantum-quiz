#!/usr/bin/env python3
"""Contrôle de data/questions.json : champs requis par format, identifiants uniques,
réponses cohérentes, images présentes. Code de sortie 1 en cas d'erreur."""
import json, os, sys
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REQUIRED = {
    "qcm": ["question", "options", "correct_answer"],
    "animation": ["question", "options", "correct_answer"],
    "vrai_faux": ["question", "correct_answer"],
    "numerical": ["question", "correct_answer", "tolerance"],
    "matching": ["question", "pairs"],
    "drag_drop": ["question", "draggable_items", "drop_zones", "correct_matches"],
    "hotspot": ["question", "image_url", "image_dimensions", "hotspots", "correct_hotspot"],
    "flashcard": ["front", "back"],
    "interpretation": ["question", "sample_answer"],
}
COMMON = ["id", "type", "difficulty", "section_ref"]


def check(q):
    errs = []
    t = q.get("type")
    if t not in REQUIRED:
        return [f"type inconnu : {t!r}"]
    errs += [f"champ manquant : {k}" for k in COMMON + REQUIRED[t] if q.get(k) in (None, "", [])]
    if q.get("difficulty") not in ("easy", "medium", "hard"):
        errs.append(f"difficulté invalide : {q.get('difficulty')!r}")
    if t in ("qcm", "animation") and not (isinstance(q.get("correct_answer"), int) and 0 <= q["correct_answer"] < len(q.get("options", []))):
        errs.append("correct_answer hors des options")
    if t == "vrai_faux" and not isinstance(q.get("correct_answer"), bool):
        errs.append("correct_answer doit être true ou false")
    if t == "numerical" and not all(isinstance(q.get(k), (int, float)) for k in ("correct_answer", "tolerance")):
        errs.append("correct_answer et tolerance doivent être des nombres")
    if t == "drag_drop":
        items = {i["id"] for i in q.get("draggable_items", [])}
        zones = {z["id"] for z in q.get("drop_zones", [])}
        cm = q.get("correct_matches", {})
        if set(cm) != items or not set(cm.values()) <= zones:
            errs.append("correct_matches incohérent avec les étiquettes ou les cases")
    if t == "hotspot" and q.get("correct_hotspot") not in {h["id"] for h in q.get("hotspots", [])}:
        errs.append("correct_hotspot absent des zones")
    if q.get("image_url") and not os.path.exists(os.path.join(ROOT, q["image_url"])):
        errs.append(f"image introuvable : {q['image_url']}")
    return errs


def main():
    data = json.load(open(os.path.join(ROOT, "data", "questions.json"), encoding="utf-8"))
    questions = [q for c in data["chapters"] for q in c["questions"]]
    errors = [f"{q.get('id', '?')} : {e}" for q in questions for e in check(q)]
    errors += [f"identifiant en double : {i}" for i, n in Counter(q.get("id") for q in questions).items() if n > 1]
    print(f"{len(questions)} questions,", dict(Counter(q.get("type") for q in questions)))
    if data.get("metadata", {}).get("total_questions") != len(questions):
        print("attention : metadata.total_questions ne correspond pas au nombre réel")
    for e in errors:
        print("ERREUR", e)
    print("OK" if not errors else f"{len(errors)} erreur(s)")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
