#!/usr/bin/env python3
"""Contrôle des banques du quiz : data/questions.json (français) et data/questions.en.json (anglais).
Pour chaque banque : champs requis par format, identifiants uniques, réponses cohérentes, images présentes,
énoncés non dupliqués, total déclaré exact. Entre les deux langues : mêmes questions dans le même ordre et
mêmes réponses (seuls les textes diffèrent). Code de sortie 1 en cas d'erreur."""
import json, os, re, sys
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


# Champs qui doivent être identiques en français et en anglais (seuls les textes sont traduits).
INVARIANTS = ["id", "type", "difficulty", "section_ref", "points", "correct_answer", "tolerance",
              "correct_hotspot", "correct_matches", "image_url", "image_dimensions", "animation_type"]


def structure(q):
    """Squelette d'une question sans ses textes : ids internes, coordonnées, nombre d'options."""
    sk = {k: q.get(k) for k in INVARIANTS}
    # un schéma traduit vit dans assets/images/en/… : même image d'origine, chemin différent
    if isinstance(sk.get("image_url"), str):
        sk["image_url"] = sk["image_url"].replace("assets/images/en/", "assets/images/", 1)
    sk["n_options"] = len(q.get("options") or [])
    sk["n_pairs"] = len(q.get("pairs") or [])
    sk["items"] = [i.get("id") for i in q.get("draggable_items") or []]
    sk["zones"] = [z.get("id") for z in q.get("drop_zones") or []]
    sk["hotspots"] = [{k: v for k, v in h.items() if not isinstance(v, str) or k == "id"} for h in q.get("hotspots") or []]
    return sk


def valider(chemin, nom):
    data = json.load(open(chemin, encoding="utf-8"))
    questions = [q for c in data["chapters"] for q in c["questions"]]
    errors = [f"{nom} {q.get('id', '?')} : {e}" for q in questions for e in check(q)]
    errors += [f"{nom} identifiant en double : {i}" for i, n in Counter(q.get("id") for q in questions).items() if n > 1]
    # énoncés identiques à la ponctuation et à la casse près (la banque en contenait 415 en 2025)
    norm = lambda q: re.sub(r"[\s.,;:!?'’«»]+", " ", str(q.get("question") or q.get("front") or "")).strip().lower()
    errors += [f"{nom} énoncé en double ({n}×) : {t[:70]}" for t, n in Counter(norm(q) for q in questions).items() if t and n > 1]
    print(f"{nom} : {len(questions)} questions,", dict(Counter(q.get("type") for q in questions)))
    if data.get("metadata", {}).get("total_questions") != len(questions):
        errors.append(f"{nom} metadata.total_questions ne correspond pas au nombre réel de questions")
    return data, questions, errors


def main():
    fr, qfr, errors = valider(os.path.join(ROOT, "data", "questions.json"), "FR")
    chemin_en = os.path.join(ROOT, "data", "questions.en.json")
    if not os.path.exists(chemin_en):
        errors.append("banque anglaise data/questions.en.json absente")
    else:
        en, qen, err_en = valider(chemin_en, "EN")
        errors += err_en
        if len(fr["chapters"]) != len(en["chapters"]):
            errors.append("nombre de chapitres différent entre FR et EN")
        if [q.get("id") for q in qfr] != [q.get("id") for q in qen]:
            errors.append("les questions FR et EN ne sont pas les mêmes ou pas dans le même ordre")
        else:
            for a, b in zip(qfr, qen):
                if structure(a) != structure(b):
                    errors.append(f"{a['id']} : réponse ou structure différente entre FR et EN (traduire seulement les textes)")
    for e in errors:
        print("ERREUR", e)
    print("OK" if not errors else f"{len(errors)} erreur(s)")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
