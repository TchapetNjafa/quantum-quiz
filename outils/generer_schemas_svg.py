#!/usr/bin/env python3
"""Génère les schémas SVG du quiz, en français et en anglais, dans le style du Carnet.

Sorties : assets/images/chN/<nom>.svg (français) et assets/images/en/chN/<nom>.svg (anglais).
Les dimensions et la position des éléments sont fixées par les zones cliquables (hotspots) des questions :
toute modification de géométrie doit être reportée dans data/questions.json ET data/questions.en.json.

Règle pédagogique : un schéma montre ce qu'il faut savoir lire, il n'écrit jamais la réponse d'une question
qui l'utilise (pas de « |0⟩ » au pôle nord, pas de « Écran » sur l'écran, pas de valeur de E₀…).

Usage : python3 outils/generer_schemas_svg.py   (depuis la racine du dépôt quantum-quiz)
"""
import math
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent

# Palette du Carnet (assets/css/carnet.css). Un SVG affiché en <img> n'a pas accès aux polices web de la page :
# on donne des polices de repli proches de Newsreader et IBM Plex Sans.
PAPIER, ENCRE, ENCRE2, GRIS, FILET = "#fffdf8", "#1d1b17", "#45413a", "#776f61", "#d8ceba"
ACCENT, BLEU, BLEU_PALE, LAVIS = "#b0432a", "#2c5a85", "#e1e8ee", "#f3e1d8"
SERIF = "Newsreader, 'Iowan Old Style', Georgia, 'Times New Roman', serif"
SANS = "'IBM Plex Sans', 'Segoe UI', system-ui, sans-serif"

TEXTES = {
    "fr": {"bloch": "Sphère de Bloch", "young": "Expérience des fentes d’Young",
           "sg": "Expérience de Stern et Gerlach (1922)", "bell": "Les quatre états de Bell",
           "bell_mesure": "résultats d’une mesure en base Z", "oh": "Oscillateur harmonique quantique"},
    "en": {"bloch": "Bloch sphere", "young": "Young’s double-slit experiment",
           "sg": "Stern–Gerlach experiment (1922)", "bell": "The four Bell states",
           "bell_mesure": "outcomes of a measurement in the Z basis", "oh": "Quantum harmonic oscillator"},
}


def svg(w, h, corps, titre):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" '
            f'role="img" aria-label="{titre}">\n'
            f'  <rect x="0.5" y="0.5" width="{w - 1}" height="{h - 1}" rx="10" fill="{PAPIER}" stroke="{FILET}"/>\n'
            f'{corps}</svg>\n')


def titre(x, y, texte):
    return f'  <text x="{x}" y="{y}" text-anchor="middle" font-family="{SERIF}" font-size="19" fill="{ENCRE}">{texte}</text>\n'


def lettre(x, y, l, taille=19, couleur=ENCRE, ancre="start"):
    return (f'  <text x="{x:.1f}" y="{y:.1f}" text-anchor="{ancre}" font-family="{SERIF}" font-style="italic" '
            f'font-size="{taille}" fill="{couleur}">{l}</text>\n')


def fleche(x1, y1, x2, y2, couleur=ENCRE2, ep=1.5, tete=7):
    a = math.atan2(y2 - y1, x2 - x1)
    p1 = (x2 - tete * math.cos(a - 0.38), y2 - tete * math.sin(a - 0.38))
    p2 = (x2 - tete * math.cos(a + 0.38), y2 - tete * math.sin(a + 0.38))
    return (f'  <line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{couleur}" stroke-width="{ep}"/>\n'
            f'  <polygon points="{x2:.1f},{y2:.1f} {p1[0]:.1f},{p1[1]:.1f} {p2[0]:.1f},{p2[1]:.1f}" fill="{couleur}"/>\n')


def chemin(points):
    return "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in points)


# ------------------------------------------------------------------------------------------------- Bloch (400×400)
CX, CY, R = 200, 200, 140
# Projection oblique : x vers la droite, z vers le haut, y vers l'observateur (en bas à gauche).
P = lambda X, Y, Z: (CX + R * (X - 0.239 * Y), CY + R * (-Z + 0.319 * Y))


def bloch(t):
    c = titre(200, 388, t["bloch"])
    c += f'  <circle cx="{CX}" cy="{CY}" r="{R}" fill="{BLEU_PALE}" fill-opacity="0.35" stroke="{ENCRE2}" stroke-width="1.4"/>\n'
    # équateur : ellipse passant par ±x et par l'intersection de l'axe y (P(0, 1, 0)), tangente à la silhouette
    ry = 46
    c += f'  <path d="M{CX - R},{CY} A{R},{ry} 0 0 1 {CX + R},{CY}" fill="none" stroke="{GRIS}" stroke-dasharray="4 4"/>\n'
    c += f'  <path d="M{CX - R},{CY} A{R},{ry} 0 0 0 {CX + R},{CY}" fill="none" stroke="{ENCRE2}" stroke-width="1.2"/>\n'
    meridien = [P(0, math.sin(a), math.cos(a)) for a in [i * math.pi / 60 for i in range(121)]]
    c += f'  <path d="{chemin(meridien)}" fill="none" stroke="{FILET}" stroke-dasharray="3 4"/>\n'
    # axes (pointillés dans la sphère, flèches à l'extérieur)
    for (X, Y, Z) in ((0, 0, 1), (0, 0, -1), (1, 0, 0), (-1, 0, 0), (0, 1, 0)):
        x, y = P(X, Y, Z)
        c += f'  <line x1="{CX}" y1="{CY}" x2="{x:.1f}" y2="{y:.1f}" stroke="{GRIS}" stroke-dasharray="3 3"/>\n'
    c += fleche(*P(0, 0, 1), *P(0, 0, 1.2))
    c += fleche(*P(1, 0, 0), *P(1.2, 0, 0))
    c += fleche(*P(0, 1, 0), *P(0, 1.85, 0))
    ly_x, ly_y = P(0, 2.0, 0)
    c += lettre(CX + 10, 40 + 6, "z") + lettre(CX + R + 34, CY + 6, "x") + lettre(ly_x - 12, ly_y + 12, "y")
    # points d'intersection des axes avec la sphère (sans nom d'état : c'est l'objet des questions)
    for (X, Y, Z) in ((0, 0, 1), (0, 0, -1), (1, 0, 0), (-1, 0, 0), (0, 1, 0)):
        x, y = P(X, Y, Z)
        c += f'  <circle cx="{x:.1f}" cy="{y:.1f}" r="4" fill="{PAPIER}" stroke="{ENCRE}" stroke-width="1.5"/>\n'
    # un état quelconque ψ (θ = 50°, φ = 150°), placé loin des zones cliquables des questions
    th, ph = math.radians(50), math.radians(150)
    X, Y, Z = math.sin(th) * math.cos(ph), math.sin(th) * math.sin(ph), math.cos(th)
    px, py = P(X, Y, Z)
    fx, fy = P(X, Y, 0)
    c += f'  <path d="M{px:.1f},{py:.1f} L{fx:.1f},{fy:.1f} L{CX},{CY}" fill="none" stroke="{ACCENT}" stroke-width="1" stroke-dasharray="2 3"/>\n'
    c += fleche(CX, CY, px, py, ACCENT, 2.4, 10)
    c += lettre(px - 6, py - 10, "ψ", 19, ACCENT, "end")
    arc_t = [P(math.sin(a) * math.cos(ph) * 0.3, math.sin(a) * math.sin(ph) * 0.3, math.cos(a) * 0.3) for a in [th * i / 20 for i in range(21)]]
    c += f'  <path d="{chemin(arc_t)}" fill="none" stroke="{ACCENT}" stroke-width="1.2"/>\n'
    tx, ty = P(math.sin(th / 2) * math.cos(ph) * 0.42, math.sin(th / 2) * math.sin(ph) * 0.42, math.cos(th / 2) * 0.42)
    c += lettre(tx - 4, ty, "θ", 16, ACCENT, "middle")
    arc_p = [P(math.cos(a) * 0.32, math.sin(a) * 0.32, 0) for a in [ph * i / 20 for i in range(21)]]
    c += f'  <path d="{chemin(arc_p)}" fill="none" stroke="{ACCENT}" stroke-width="1.2"/>\n'
    fx2, fy2 = P(math.cos(ph / 2) * 0.45, math.sin(ph / 2) * 0.45, 0)
    c += lettre(fx2, fy2 + 14, "φ", 16, ACCENT, "middle")
    return svg(400, 400, c, t["bloch"])


# ------------------------------------------------------------------------------------------------- Young (600×300)
def young(t):
    c = titre(300, 30, t["young"])
    cy = 150
    c += f'  <circle cx="50" cy="{cy}" r="13" fill="{LAVIS}" stroke="{ACCENT}" stroke-width="1.6"/>\n'
    c += f'  <circle cx="50" cy="{cy}" r="4" fill="{ACCENT}"/>\n'
    for r in (36, 60, 84, 108, 132, 156, 180):                     # fronts d'onde de la source
        a = math.asin(min(1, 72 / r))
        x1, y1, y2 = 50 + r * math.cos(a), cy - r * math.sin(a), cy + r * math.sin(a)
        c += f'  <path d="M{x1:.1f},{y1:.1f} A{r},{r} 0 0 1 {x1:.1f},{y2:.1f}" fill="none" stroke="{ACCENT}" stroke-opacity="0.45"/>\n'
    for (y1, y2) in ((60, 119), (131, 169), (181, 240)):            # plaque percée de deux fentes
        c += f'  <rect x="256" y="{y1}" width="8" height="{y2 - y1}" fill="{ENCRE}"/>\n'
    c += '  <clipPath id="zone"><rect x="264" y="58" width="230" height="186"/></clipPath>\n  <g clip-path="url(#zone)">\n'
    for fy in (125, 175):                                           # ondes diffractées
        for r in range(22, 236, 24):
            c += (f'  <path d="M{264 + r * math.cos(1.05):.1f},{fy - r * math.sin(1.05):.1f} A{r},{r} 0 0 1 '
                  f'{264 + r * math.cos(1.05):.1f},{fy + r * math.sin(1.05):.1f}" fill="none" stroke="{BLEU}" stroke-opacity="0.32"/>\n')
    c += '  </g>\n'
    I = lambda y: (math.cos(math.pi * (y - cy) / 26) ** 2) * math.exp(-((y - cy) / 85) ** 2)
    for y in range(62, 240, 2):                                     # franges sur l'écran
        c += f'  <rect x="498" y="{y}" width="14" height="2" fill="{ENCRE}" fill-opacity="{0.06 + 0.86 * I(y):.2f}"/>\n'
    c += f'  <rect x="498" y="62" width="14" height="178" fill="none" stroke="{ENCRE2}"/>\n'
    c += f'  <line x1="522" y1="62" x2="522" y2="240" stroke="{FILET}"/>\n'
    c += f'  <path d="{chemin([(522 + 60 * I(y), y) for y in range(62, 241, 2)])}" fill="none" stroke="{ACCENT}" stroke-width="1.6"/>\n'
    c += lettre(588, 256, "I(y)", 15, GRIS, "end")
    return svg(600, 300, c, t["young"])


# ------------------------------------------------------------------------------------------- Stern-Gerlach (700×300)
def stern_gerlach(t):
    c = titre(350, 30, t["sg"])
    cy = 150
    c += f'  <rect x="30" y="{cy - 28}" width="60" height="56" rx="5" fill="{LAVIS}" stroke="{ENCRE2}" stroke-width="1.4"/>\n'
    for k in range(4):                                              # four chauffé
        c += f'  <path d="M{42 + 12 * k},{cy + 20} q4,-8 0,-16 q-4,-8 0,-16" fill="none" stroke="{ACCENT}" stroke-width="1.2"/>\n'
    c += f'  <rect x="125" y="{cy - 22}" width="6" height="17" fill="{ENCRE}"/>\n'   # fente de collimation
    c += f'  <rect x="125" y="{cy + 5}" width="6" height="17" fill="{ENCRE}"/>\n'
    c += f'  <polygon points="240,58 380,58 380,108 318,128 302,128 240,108" fill="{ENCRE2}"/>\n'   # pôle N en biseau
    c += f'  <rect x="240" y="176" width="140" height="62" fill="{GRIS}"/>\n'                       # pôle S plat
    c += f'  <text x="310" y="92" text-anchor="middle" font-family="{SERIF}" font-size="22" fill="{PAPIER}">N</text>\n'
    c += f'  <text x="310" y="215" text-anchor="middle" font-family="{SERIF}" font-size="22" fill="{PAPIER}">S</text>\n'
    c += f'  <line x1="90" y1="{cy}" x2="250" y2="{cy}" stroke="{ENCRE2}" stroke-width="5" stroke-linecap="round"/>\n'
    c += f'  <path d="M250,{cy} C330,{cy} 420,92 604,90" fill="none" stroke="{ACCENT}" stroke-width="4" stroke-linecap="round"/>\n'
    c += f'  <path d="M250,{cy} C330,{cy} 420,208 604,210" fill="none" stroke="{BLEU}" stroke-width="4" stroke-linecap="round"/>\n'
    c += f'  <rect x="606" y="52" width="10" height="196" fill="{FILET}" stroke="{ENCRE2}"/>\n'       # écran
    c += f'  <ellipse cx="611" cy="90" rx="6" ry="14" fill="{ACCENT}"/>\n'
    c += f'  <ellipse cx="611" cy="210" rx="6" ry="14" fill="{BLEU}"/>\n'
    c += fleche(662, 252, 662, 200)
    c += lettre(670, 206, "z", 18)
    return svg(700, 300, c, t["sg"])


# ------------------------------------------------------------------------------------------- États de Bell (600×500)
def bell(t):
    c = titre(300, 34, t["bell"])
    for (x, y, f, memes) in ((155, 170, "|00⟩ + |11⟩", True), (445, 170, "|00⟩ − |11⟩", True),
                             (155, 380, "|01⟩ + |10⟩", False), (445, 380, "|01⟩ − |10⟩", False)):
        couleur, fond = (ACCENT, LAVIS) if memes else (BLEU, BLEU_PALE)
        c += f'  <rect x="{x - 125}" y="{y - 82}" width="250" height="164" rx="10" fill="{PAPIER}" stroke="{FILET}" stroke-width="1.4"/>\n'
        c += (f'  <text x="{x}" y="{y - 40}" text-anchor="middle" font-family="{SERIF}" font-size="21" fill="{ENCRE}">'
              f'<tspan font-size="16">1/√2</tspan> ( {f} )</text>\n')
        for dx, l in ((-60, "A"), (60, "B")):
            c += f'  <circle cx="{x + dx}" cy="{y + 10}" r="17" fill="{fond}" stroke="{couleur}"/>\n'
            c += lettre(x + dx, y + 16, l, 17, ENCRE, "middle")
        c += f'  <path d="M{x - 42},{y + 10} C{x - 20},{y - 4} {x + 20},{y + 24} {x + 42},{y + 10}" fill="none" stroke="{couleur}" stroke-width="1.6" stroke-dasharray="5 4"/>\n'
        c += f'  <text x="{x}" y="{y + 52}" text-anchor="middle" font-family="{SANS}" font-size="14" fill="{ENCRE2}">{"0·0   ou   1·1" if memes else "0·1   ou   1·0"}</text>\n'
        c += f'  <text x="{x}" y="{y + 70}" text-anchor="middle" font-family="{SANS}" font-size="11" fill="{GRIS}">{t["bell_mesure"]}</text>\n'
    return svg(600, 500, c, t["bell"])


# ---------------------------------------------------------------------------- Oscillateur harmonique (700×400)
def psi(n, u):
    h0, h1 = 1.0, 2 * u
    hn = h0 if n == 0 else h1
    for m in range(1, n):
        h0, h1 = h1, 2 * u * h1 - 2 * m * h0
        hn = h1
    return hn * math.exp(-u * u / 2) / math.sqrt(2 ** n * math.factorial(n) * math.sqrt(math.pi))


def oscillateur(t):
    c = titre(350, 30, t["oh"])
    x0, fond, pas = 350, 350, 60          # ħω = 60 px ; niveau n à y = fond − 30 − 60 n (n = 0 : y = 320)
    k = 290 / 250 ** 2                    # V(x) = k (x − x0)² en pixels
    ell = math.sqrt(30 / k)               # point tournant du fondamental = longueur caractéristique
    c += fleche(70, fond, 650, fond) + fleche(x0, fond + 18, x0, 52)
    c += lettre(656, fond + 5, "x", 18) + lettre(x0 - 22, 66, "E", 18)
    pts = [(x, fond - k * (x - x0) ** 2) for x in range(100, 601, 4) if fond - k * (x - x0) ** 2 >= 58]
    c += f'  <path d="{chemin(pts)}" fill="none" stroke="{ENCRE}" stroke-width="2"/>\n'
    c += lettre(372, 68, "V(x) = ½ mω²x²", 17, ENCRE2)
    for n in range(5):                    # niveaux équidistants, sans valeurs (questions sur E₀ et ΔE)
        y = fond - 30 - pas * n
        w = math.sqrt((30 + pas * n) / k)
        c += f'  <line x1="{x0 - w:.1f}" y1="{y}" x2="{x0 + w:.1f}" y2="{y}" stroke="{ENCRE2}" stroke-width="1.5"/>\n'
        if n < 4:
            courbe = [(x0 + ell * u, y - 18 * psi(n, u) / 0.75) for u in [i / 40 for i in range(-200, 201)] if abs(ell * u) < w + 0.45 * ell]
            c += f'  <path d="{chemin(courbe)}" fill="none" stroke="{BLEU}" stroke-width="1.3"/>\n'
    c += fleche(612, fond - 120, 612, fond - 148, GRIS, 1.2, 6) + fleche(612, fond - 118, 612, fond - 90, GRIS, 1.2, 6)
    c += lettre(620, fond - 113, "ΔE", 16, GRIS)
    return svg(700, 400, c, t["oh"])


SCHEMAS = {"ch1/bloch-sphere.svg": bloch, "ch1/young-experiment.svg": young, "ch2/stern-gerlach.svg": stern_gerlach,
           "ch4/bell-states.svg": bell, "ch6/harmonic-oscillator.svg": oscillateur}


def main():
    for langue, dossier in (("fr", "assets/images"), ("en", "assets/images/en")):
        for nom, fabrique in SCHEMAS.items():
            texte = fabrique(TEXTES[langue])
            if langue == "en":
                texte = texte.replace("   ou   ", "   or   ")
            texte = texte.replace('role="img"', f'lang="{langue}" role="img"', 1)
            sortie = RACINE / dossier / nom
            sortie.parent.mkdir(parents=True, exist_ok=True)
            sortie.write_text(texte, encoding="utf-8")
            print(sortie.relative_to(RACINE))


if __name__ == "__main__":
    main()
