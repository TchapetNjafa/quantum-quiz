#!/usr/bin/env python3
"""Produit les versions anglaises des schémas du quiz (assets/images/en/…) : images matricielles et SVG.

Pour chaque étiquette française : on efface les pixels du texte (remplissage par la médiane des pixels
voisins non masqués, adapté aux fonds unis des figures LaTeX), puis on écrit le texte anglais avec la
police Latin Modern Roman (celle des figures d'origine). Les dimensions de l'image ne changent pas :
les zones cliquables (hotspots) restent valides.

Les SVG (assets/images/chN/*.svg) sont traduits par simple remplacement des textes (table SVG_EN).

Usage : python3 outils/traduire_schemas.py   (depuis la racine du dépôt quantum-quiz)
Dépendances : Pillow, numpy, police Latin Modern (paquet TeX « lm »).
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

RACINE = Path(__file__).resolve().parent.parent
POLICE = "/usr/share/texmf/fonts/opentype/public/lm/lmroman10-regular.otf"   # figures LaTeX
TIMES = "/usr/share/fonts/truetype/msttcorefonts/Times_New_Roman.ttf"         # figures en Times

# Pour chaque image : liste d'étiquettes.
#   boite   : (x0, y0, x1, y1) zone du texte français à effacer
#   garde   : fonction (x, y) -> True si le pixel appartient au dessin (à ne pas effacer), facultatif
#   texte   : texte anglais ; x, base : position (gauche, ligne de base) ; taille : corps en pixels
#   ancre   : 'ls' (gauche/base), 'ms' (centre/base) ou 'rs' (droite/base) ; police : fichier de police (défaut Latin Modern)
SCHEMAS = {
    "SternGerlachExper.png": [
        dict(boite=(58, 60, 426, 101), garde=lambda x, y: y > 0.465 * (x - 5) + 57,
             texte="Classical prediction", x=66, base=91, taille=39),
        dict(boite=(1112, 27, 1448, 76), texte="Beam of Ag atoms", x=1115, base=63, taille=39),
        dict(boite=(384, 548, 967, 599), texte="Inhomogeneous magnetic field", x=387, base=588, taille=39),
    ],
    # le ket |±⟩ᵢ qui suit chaque légende est conservé ; le texte anglais s'aligne à droite contre lui
    "SGsplitterFiltre.png": [
        dict(boite=(708, 290, 1222, 337), texte="Filter passing only", x=1216, base=323, taille=39, ancre="rs"),
        dict(boite=(1475, 290, 1990, 337), texte="Filter passing only", x=1984, base=323, taille=39, ancre="rs"),
    ],
    "ReflPqtOnde.png": [
        dict(boite=(728, 365, 893, 415), texte="Region I", x=731, base=401, taille=49, police=TIMES),
        dict(boite=(1453, 312, 1640, 361), texte="Region II", x=1456, base=347, taille=49, police=TIMES),
        dict(boite=(211, 647, 652, 696), texte="reflected wave packet", x=431, base=682, taille=49, police=TIMES, ancre="ms"),
        dict(boite=(1078, 644, 1534, 693), texte="transmitted wave packet", x=1306, base=679, taille=49, police=TIMES, ancre="ms"),
    ],
    "TransPaqOnde.png": [
        dict(boite=(708, 536, 873, 585), texte="Region I", x=711, base=571, taille=49, police=TIMES),
        dict(boite=(1274, 523, 1454, 573), texte="Region II", x=1277, base=559, taille=49, police=TIMES),
    ],
}


# SVG : texte français exact (entre balises) → texte anglais. Les textes absents de la table restent tels quels
# (symboles, formules, noms propres).
SVG_EN = {
    "Sphère de Bloch": "Bloch sphere",
    "Représentation géométrique d'un qubit pur": "Geometric representation of a pure qubit",
    "Écran": "Screen",
    "Expérience de Young": "Young's double-slit experiment",
    "Figure d'interférence → Preuve de la dualité onde-corpuscule": "Interference pattern → evidence of wave–particle duality",
    "Four": "Oven",
    "Expérience de Stern-Gerlach": "Stern–Gerlach experiment",
    "Champ magnétique": "Inhomogeneous",
    "inhomogène": "magnetic field",
    "|↑⟩ ou |+½⟩": "|↑⟩ or |+½⟩",
    "|↓⟩ ou |-½⟩": "|↓⟩ or |-½⟩",
    "Quantification du moment magnétique (1922)": "Quantisation of the magnetic moment (1922)",
    "Les 4 États de Bell": "The four Bell states",
    "États maximalement intriqués à 2 qubits": "Maximally entangled two-qubit states",
    "Identiques en Z, phase +": "Same in Z, phase +",
    "Identiques en Z, phase −": "Same in Z, phase −",
    "Opposés en Z, phase +": "Opposite in Z, phase +",
    "Opposés en Z · singulet": "Opposite in Z · singlet",
    "Base maximale d'intrication - Utilisés en cryptographie et téléportation quantique":
        "Maximally entangled basis — used in quantum cryptography and teleportation",
    "Oscillateur Harmonique Quantique": "Quantum harmonic oscillator",
    "Propriétés clés": "Key properties",
    "• Niveaux équidistants": "• Equally spaced levels",
    "• E₀ ≠ 0 (énergie de point zéro)": "• E₀ ≠ 0 (zero-point energy)",
    "• n nœuds pour |ψₙ⟩": "• n nodes for |ψₙ⟩",
    "• Parité définie": "• Definite parity",
    "Système quantique fondamental - Applications: vibrations moléculaires, photons":
        "A fundamental quantum system — applications: molecular vibrations, photons",
}


def traduire_svg():
    """Écrit assets/images/en/chN/*.svg ; signale tout texte contenant encore des lettres accentuées."""
    import re
    for src in sorted((RACINE / "assets/images").glob("ch*/*.svg")):
        texte = src.read_text(encoding="utf-8")
        texte = re.sub(r">([^<>]+)<", lambda m: ">" + SVG_EN.get(m.group(1), m.group(1)) + "<", texte)
        texte = texte.replace('lang="fr"', 'lang="en"')
        restes = [t for t in re.findall(r">([^<>]+)<", texte) if re.search(r"[éèàùçêâîôûÉ]", t)]
        if restes:
            raise SystemExit(f"{src.name} : texte non traduit {restes}")
        dest = RACINE / "assets/images/en" / src.relative_to(RACINE / "assets/images")
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(texte, encoding="utf-8")
        print(dest.relative_to(RACINE))


def effacer(arr, boite, garde=None, seuil=235):
    """Remplace les pixels sombres de la boîte par la médiane de leurs voisins clairs."""
    x0, y0, x1, y1 = boite
    gris = arr[..., :3].mean(axis=2)
    masque = np.zeros(gris.shape, bool)
    masque[y0:y1, x0:x1] = gris[y0:y1, x0:x1] < seuil
    if garde:
        for y in range(y0, y1):
            for x in range(x0, x1):
                if masque[y, x] and garde(x, y):
                    masque[y, x] = False
    # dilatation de 2 px pour emporter l'anticrénelage
    for _ in range(2):
        m = masque.copy()
        m[1:, :] |= masque[:-1, :]; m[:-1, :] |= masque[1:, :]
        m[:, 1:] |= masque[:, :-1]; m[:, :-1] |= masque[:, 1:]
        if garde:
            for y, x in zip(*np.nonzero(m & ~masque)):
                if garde(x, y):
                    m[y, x] = False
        masque = m
    r = 6
    restants = list(zip(*np.nonzero(masque)))
    while restants:
        suivants = []
        for y, x in restants:
            ya, yb, xa, xb = max(0, y - r), y + r + 1, max(0, x - r), x + r + 1
            fenetre = arr[ya:yb, xa:xb]
            libres = ~masque[ya:yb, xa:xb]
            if libres.sum() >= 4:
                arr[y, x] = np.median(fenetre[libres], axis=0)
            else:
                suivants.append((y, x))
        faits = set(restants) - set(suivants)
        for y, x in faits:
            masque[y, x] = False
        if len(suivants) == len(restants):
            r += 4
        restants = suivants


def main():
    sortie = RACINE / "assets/images/en"
    sortie.mkdir(parents=True, exist_ok=True)
    for nom, etiquettes in SCHEMAS.items():
        img = Image.open(RACINE / "assets/images" / nom).convert("RGB")
        arr = np.array(img)
        for e in etiquettes:
            effacer(arr, e["boite"], e.get("garde"), e.get("seuil", 235))
        img = Image.fromarray(arr)
        dessin = ImageDraw.Draw(img)
        for e in etiquettes:
            police = ImageFont.truetype(e.get("police", POLICE), e["taille"])
            dessin.text((e["x"], e["base"]), e["texte"], font=police, fill=(0, 0, 0), anchor=e.get("ancre", "ls"))
        img.save(sortie / nom, optimize=True)
        print(sortie.relative_to(RACINE) / nom, img.size)
    traduire_svg()


if __name__ == "__main__":
    main()
