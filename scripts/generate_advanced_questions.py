#!/usr/bin/env python3
"""
Script pour générer 100 questions des 3 nouveaux types :
- Hotspot (identifier une zone d'une image) - 33 questions
- Drag & Drop (glisser-déposer) - 33 questions
- Flashcard (recto-verso) - 34 questions
"""

import json
from pathlib import Path

def generate_hotspot_questions():
    """Génère 33 questions Hotspot"""
    questions = []

    # Template de base pour générer des variantes
    hotspot_templates = [
        # Chapitre 1 - 11 questions
        {
            "id": "ch1-h001", "difficulty": "easy",
            "question": "Sur le diagramme de l'expérience des fentes d'Young, identifiez la zone où se forment les franges d'interférence",
            "image_url": "assets/images/ch1/young-experiment.svg", "image_alt": "Expérience des fentes d'Young",
            "hotspots": [
                {"id": "source", "label": "Source", "x": 50, "y": 200, "radius": 40},
                {"id": "slits", "label": "Fentes", "x": 200, "y": 200, "radius": 40},
                {"id": "screen", "label": "Écran (franges)", "x": 400, "y": 200, "radius": 50}
            ],
            "correct_hotspot": "screen",
            "explanation": "Les franges d'interférence se forment sur l'écran de détection, résultat de la superposition des ondes provenant des deux fentes.",
            "section_ref": "1.1.1", "tags": ["Young", "interférences", "hotspot"], "time_estimate": 45, "points": 1
        },
        {
            "id": "ch1-h002", "difficulty": "medium",
            "question": "Sur la sphère de Bloch, identifiez la position représentant l'état |0⟩",
            "image_url": "assets/images/ch1/bloch-sphere.svg", "image_alt": "Sphère de Bloch",
            "hotspots": [
                {"id": "north", "label": "Pôle Nord", "x": 200, "y": 50, "radius": 30},
                {"id": "south", "label": "Pôle Sud", "x": 200, "y": 350, "radius": 30},
                {"id": "equator", "label": "Équateur", "x": 300, "y": 200, "radius": 30}
            ],
            "correct_hotspot": "north",
            "explanation": "L'état |0⟩ est représenté au pôle Nord de la sphère de Bloch, tandis que |1⟩ est au pôle Sud.",
            "section_ref": "1.3", "tags": ["Bloch", "qubit", "hotspot"], "time_estimate": 60, "points": 2
        },
        {
            "id": "ch1-h003", "difficulty": "medium",
            "question": "Sur la sphère de Bloch, où se situe l'état |+⟩ = (|0⟩ + |1⟩)/√2 ?",
            "image_url": "assets/images/ch1/bloch-sphere.svg", "image_alt": "Sphère de Bloch",
            "hotspots": [
                {"id": "north", "label": "Pôle Nord", "x": 200, "y": 50, "radius": 30},
                {"id": "x_positive", "label": "Axe +x", "x": 320, "y": 200, "radius": 30},
                {"id": "y_positive", "label": "Axe +y", "x": 200, "y": 250, "radius": 30}
            ],
            "correct_hotspot": "x_positive",
            "explanation": "L'état |+⟩ est une superposition équiprobable de |0⟩ et |1⟩, situé sur l'équateur à +x de la sphère de Bloch.",
            "section_ref": "1.3", "tags": ["Bloch", "superposition", "hotspot"], "time_estimate": 60, "points": 2
        },
        {
            "id": "ch1-h004", "difficulty": "medium",
            "question": "Sur la sphère de Bloch, où se situe l'état |−⟩ = (|0⟩ − |1⟩)/√2 ?",
            "image_url": "assets/images/ch1/bloch-sphere.svg", "image_alt": "Sphère de Bloch",
            "hotspots": [
                {"id": "x_negative", "label": "Axe −x", "x": 80, "y": 200, "radius": 30},
                {"id": "x_positive", "label": "Axe +x", "x": 320, "y": 200, "radius": 30},
                {"id": "north", "label": "Pôle Nord", "x": 200, "y": 50, "radius": 30}
            ],
            "correct_hotspot": "x_negative",
            "explanation": "L'état |−⟩ est situé sur l'équateur à −x, opposé à |+⟩.",
            "section_ref": "1.3", "tags": ["Bloch", "états", "hotspot"], "time_estimate": 60, "points": 2
        },
        {
            "id": "ch1-h005", "difficulty": "hard",
            "question": "Sur la sphère de Bloch, où se situe l'état |1⟩ ?",
            "image_url": "assets/images/ch1/bloch-sphere.svg", "image_alt": "Sphère de Bloch",
            "hotspots": [
                {"id": "south", "label": "Pôle Sud", "x": 200, "y": 350, "radius": 30},
                {"id": "north", "label": "Pôle Nord", "x": 200, "y": 50, "radius": 30},
                {"id": "equator", "label": "Équateur", "x": 300, "y": 200, "radius": 30}
            ],
            "correct_hotspot": "south",
            "explanation": "L'état |1⟩ est représenté au pôle Sud de la sphère de Bloch.",
            "section_ref": "1.3", "tags": ["Bloch", "qubit", "hotspot"], "time_estimate": 45, "points": 2
        },
        {
            "id": "ch1-h006", "difficulty": "easy",
            "question": "Dans l'expérience des fentes d'Young, où sont placées les deux fentes ?",
            "image_url": "assets/images/ch1/young-experiment.svg", "image_alt": "Expérience des fentes d'Young",
            "hotspots": [
                {"id": "source", "label": "À la source", "x": 50, "y": 200, "radius": 40},
                {"id": "slits", "label": "Position des fentes", "x": 200, "y": 200, "radius": 40},
                {"id": "screen", "label": "À l'écran", "x": 400, "y": 200, "radius": 50}
            ],
            "correct_hotspot": "slits",
            "explanation": "Les deux fentes sont placées entre la source et l'écran, permettant la diffraction et l'interférence.",
            "section_ref": "1.1.1", "tags": ["Young", "fentes", "hotspot"], "time_estimate": 45, "points": 1
        },
        {
            "id": "ch1-h007", "difficulty": "hard",
            "question": "Sur l'expérience des fentes d'Young, identifiez où se trouve la source cohérente",
            "image_url": "assets/images/ch1/young-experiment.svg", "image_alt": "Expérience des fentes d'Young",
            "hotspots": [
                {"id": "source", "label": "Source", "x": 50, "y": 200, "radius": 40},
                {"id": "slits", "label": "Fentes", "x": 200, "y": 200, "radius": 40},
                {"id": "screen", "label": "Écran", "x": 400, "y": 200, "radius": 50}
            ],
            "correct_hotspot": "source",
            "explanation": "La source cohérente émet les quantons qui traversent ensuite les fentes.",
            "section_ref": "1.1.1", "tags": ["Young", "source", "hotspot"], "time_estimate": 60, "points": 2
        },
        {
            "id": "ch1-h008", "difficulty": "medium",
            "question": "Sur la sphère de Bloch, identifiez l'axe des états de phase |i⟩",
            "image_url": "assets/images/ch1/bloch-sphere.svg", "image_alt": "Sphère de Bloch",
            "hotspots": [
                {"id": "y_positive", "label": "Axe +y", "x": 200, "y": 250, "radius": 30},
                {"id": "x_positive", "label": "Axe +x", "x": 320, "y": 200, "radius": 30},
                {"id": "z_positive", "label": "Axe +z", "x": 200, "y": 50, "radius": 30}
            ],
            "correct_hotspot": "y_positive",
            "explanation": "Les états avec phase imaginaire comme |i⟩ = (|0⟩ + i|1⟩)/√2 sont sur l'axe y.",
            "section_ref": "1.3", "tags": ["Bloch", "phase", "hotspot"], "time_estimate": 75, "points": 2
        },
        {
            "id": "ch1-h009", "difficulty": "hard",
            "question": "Sur la sphère de Bloch, où se trouve un état avec θ=π/4 et φ=0 ?",
            "image_url": "assets/images/ch1/bloch-sphere.svg", "image_alt": "Sphère de Bloch",
            "hotspots": [
                {"id": "mid_x", "label": "Entre pôle et équateur +x", "x": 280, "y": 125, "radius": 35},
                {"id": "equator_x", "label": "Équateur +x", "x": 320, "y": 200, "radius": 30},
                {"id": "north", "label": "Pôle Nord", "x": 200, "y": 50, "radius": 30}
            ],
            "correct_hotspot": "mid_x",
            "explanation": "θ=π/4 place l'état entre le pôle Nord et l'équateur, φ=0 signifie sur le méridien +x.",
            "section_ref": "1.3", "tags": ["Bloch", "coordonnées", "hotspot"], "time_estimate": 90, "points": 3
        },
        {
            "id": "ch1-h010", "difficulty": "easy",
            "question": "Dans l'expérience des fentes d'Young, où observe-t-on les interférences ?",
            "image_url": "assets/images/ch1/young-experiment.svg", "image_alt": "Expérience des fentes d'Young",
            "hotspots": [
                {"id": "screen", "label": "Sur l'écran", "x": 400, "y": 200, "radius": 50},
                {"id": "slits", "label": "Aux fentes", "x": 200, "y": 200, "radius": 40},
                {"id": "between", "label": "Entre fentes et écran", "x": 300, "y": 200, "radius": 40}
            ],
            "correct_hotspot": "screen",
            "explanation": "Les interférences sont observées sur l'écran de détection sous forme de franges alternées.",
            "section_ref": "1.1.1", "tags": ["Young", "interférences", "hotspot"], "time_estimate": 45, "points": 1
        },
        {
            "id": "ch1-h011", "difficulty": "medium",
            "question": "Sur la sphère de Bloch, où sont les états maximalement orthogonaux à |0⟩ ?",
            "image_url": "assets/images/ch1/bloch-sphere.svg", "image_alt": "Sphère de Bloch",
            "hotspots": [
                {"id": "south", "label": "Pôle Sud", "x": 200, "y": 350, "radius": 30},
                {"id": "equator", "label": "Sur l'équateur", "x": 300, "y": 200, "radius": 30},
                {"id": "north", "label": "Pôle Nord", "x": 200, "y": 50, "radius": 30}
            ],
            "correct_hotspot": "south",
            "explanation": "L'état |1⟩ au pôle Sud est maximalement orthogonal à |0⟩ : ⟨0|1⟩ = 0.",
            "section_ref": "1.3", "tags": ["Bloch", "orthogonalité", "hotspot"], "time_estimate": 60, "points": 2
        },

        # Chapitre 2 - 11 questions
        {
            "id": "ch2-h001", "difficulty": "medium",
            "question": "Sur le dispositif de Stern-Gerlach, identifiez le gradient de champ magnétique",
            "image_url": "assets/images/ch2/stern-gerlach.svg", "image_alt": "Expérience de Stern-Gerlach",
            "hotspots": [
                {"id": "source", "label": "Source atomique", "x": 50, "y": 200, "radius": 35},
                {"id": "magnet", "label": "Aimant inhomogène", "x": 200, "y": 200, "radius": 50},
                {"id": "detector", "label": "Détecteur", "x": 380, "y": 200, "radius": 35}
            ],
            "correct_hotspot": "magnet",
            "explanation": "Le gradient de champ magnétique inhomogène sépare les états de spin en fonction de leur projection sur l'axe z.",
            "section_ref": "2.3", "tags": ["Stern-Gerlach", "spin", "mesure", "hotspot"], "time_estimate": 60, "points": 2
        },
        {
            "id": "ch2-h002", "difficulty": "easy",
            "question": "Dans l'expérience de Stern-Gerlach, où observe-t-on la séparation des faisceaux ?",
            "image_url": "assets/images/ch2/stern-gerlach.svg", "image_alt": "Expérience de Stern-Gerlach",
            "hotspots": [
                {"id": "source", "label": "À la source", "x": 50, "y": 200, "radius": 35},
                {"id": "detector", "label": "Au détecteur", "x": 380, "y": 200, "radius": 35},
                {"id": "magnet", "label": "Dans l'aimant", "x": 200, "y": 200, "radius": 50}
            ],
            "correct_hotspot": "detector",
            "explanation": "La séparation complète des faisceaux (spin up et spin down) est observée au niveau du détecteur.",
            "section_ref": "2.3", "tags": ["Stern-Gerlach", "mesure", "hotspot"], "time_estimate": 45, "points": 1
        },
        {
            "id": "ch2-h003", "difficulty": "easy",
            "question": "Dans Stern-Gerlach, où sont produits les atomes de spin non polarisé ?",
            "image_url": "assets/images/ch2/stern-gerlach.svg", "image_alt": "Expérience de Stern-Gerlach",
            "hotspots": [
                {"id": "source", "label": "Four atomique", "x": 50, "y": 200, "radius": 35},
                {"id": "magnet", "label": "Aimant", "x": 200, "y": 200, "radius": 50},
                {"id": "detector", "label": "Détecteur", "x": 380, "y": 200, "radius": 35}
            ],
            "correct_hotspot": "source",
            "explanation": "Le four atomique produit un faisceau d'atomes dans un état de spin non polarisé.",
            "section_ref": "2.3", "tags": ["Stern-Gerlach", "source", "hotspot"], "time_estimate": 45, "points": 1
        },
        {
            "id": "ch2-h004", "difficulty": "medium",
            "question": "Dans Stern-Gerlach, identifiez la zone de mesure du spin",
            "image_url": "assets/images/ch2/stern-gerlach.svg", "image_alt": "Expérience de Stern-Gerlach",
            "hotspots": [
                {"id": "magnet", "label": "Zone de champ B", "x": 200, "y": 200, "radius": 50},
                {"id": "source", "label": "Avant l'aimant", "x": 50, "y": 200, "radius": 35},
                {"id": "detector", "label": "Après l'aimant", "x": 380, "y": 200, "radius": 35}
            ],
            "correct_hotspot": "magnet",
            "explanation": "La mesure du spin se produit dans la zone du gradient de champ magnétique.",
            "section_ref": "2.3", "tags": ["Stern-Gerlach", "mesure", "hotspot"], "time_estimate": 60, "points": 2
        },
        {
            "id": "ch2-h005", "difficulty": "hard",
            "question": "Dans Stern-Gerlach orienté selon z, où arriverait un état |↑⟩_z ?",
            "image_url": "assets/images/ch2/stern-gerlach.svg", "image_alt": "Expérience de Stern-Gerlach",
            "hotspots": [
                {"id": "up", "label": "Détecteur haut", "x": 380, "y": 120, "radius": 35},
                {"id": "down", "label": "Détecteur bas", "x": 380, "y": 280, "radius": 35},
                {"id": "center", "label": "Détecteur centre", "x": 380, "y": 200, "radius": 35}
            ],
            "correct_hotspot": "up",
            "explanation": "Un état |↑⟩_z (spin up selon z) est dévié vers le haut par le gradient de champ.",
            "section_ref": "2.3", "tags": ["Stern-Gerlach", "spin-up", "hotspot"], "time_estimate": 75, "points": 2
        },
        {
            "id": "ch2-h006", "difficulty": "hard",
            "question": "Dans Stern-Gerlach orienté selon z, où arriverait un état |↓⟩_z ?",
            "image_url": "assets/images/ch2/stern-gerlach.svg", "image_alt": "Expérience de Stern-Gerlach",
            "hotspots": [
                {"id": "down", "label": "Détecteur bas", "x": 380, "y": 280, "radius": 35},
                {"id": "up", "label": "Détecteur haut", "x": 380, "y": 120, "radius": 35},
                {"id": "center", "label": "Détecteur centre", "x": 380, "y": 200, "radius": 35}
            ],
            "correct_hotspot": "down",
            "explanation": "Un état |↓⟩_z (spin down selon z) est dévié vers le bas par le gradient de champ.",
            "section_ref": "2.3", "tags": ["Stern-Gerlach", "spin-down", "hotspot"], "time_estimate": 75, "points": 2
        },
        {
            "id": "ch2-h007", "difficulty": "medium",
            "question": "Dans Stern-Gerlach, où les trajectoires commencent-elles à diverger ?",
            "image_url": "assets/images/ch2/stern-gerlach.svg", "image_alt": "Expérience de Stern-Gerlach",
            "hotspots": [
                {"id": "magnet", "label": "Dans le champ B", "x": 200, "y": 200, "radius": 50},
                {"id": "after", "label": "Après l'aimant", "x": 300, "y": 200, "radius": 40},
                {"id": "source", "label": "À la source", "x": 50, "y": 200, "radius": 35}
            ],
            "correct_hotspot": "magnet",
            "explanation": "Les trajectoires divergent dès l'entrée dans le champ magnétique inhomogène.",
            "section_ref": "2.3", "tags": ["Stern-Gerlach", "trajectoire", "hotspot"], "time_estimate": 60, "points": 2
        },
        {
            "id": "ch2-h008", "difficulty": "easy",
            "question": "Dans Stern-Gerlach, identifiez où on détecte les particules",
            "image_url": "assets/images/ch2/stern-gerlach.svg", "image_alt": "Expérience de Stern-Gerlach",
            "hotspots": [
                {"id": "detector", "label": "Écran/détecteur", "x": 380, "y": 200, "radius": 35},
                {"id": "magnet", "label": "Dans l'aimant", "x": 200, "y": 200, "radius": 50},
                {"id": "source", "label": "À la source", "x": 50, "y": 200, "radius": 35}
            ],
            "correct_hotspot": "detector",
            "explanation": "Les particules sont détectées sur un écran ou détecteur après avoir traversé le champ.",
            "section_ref": "2.3", "tags": ["Stern-Gerlach", "détection", "hotspot"], "time_estimate": 45, "points": 1
        },
        {
            "id": "ch2-h009", "difficulty": "hard",
            "question": "Dans deux Stern-Gerlach successifs (z puis x), où placer le second ?",
            "image_url": "assets/images/ch2/stern-gerlach.svg", "image_alt": "Expérience de Stern-Gerlach",
            "hotspots": [
                {"id": "after", "label": "Après le premier détecteur", "x": 380, "y": 200, "radius": 35},
                {"id": "magnet", "label": "Dans le premier aimant", "x": 200, "y": 200, "radius": 50},
                {"id": "before", "label": "Avant le premier", "x": 50, "y": 200, "radius": 35}
            ],
            "correct_hotspot": "after",
            "explanation": "Le second Stern-Gerlach est placé après le premier pour mesurer une autre composante du spin.",
            "section_ref": "2.3", "tags": ["Stern-Gerlach", "mesures successives", "hotspot"], "time_estimate": 90, "points": 3
        },
        {
            "id": "ch2-h010", "difficulty": "medium",
            "question": "Dans Stern-Gerlach, identifiez la zone d'interaction spin-champ",
            "image_url": "assets/images/ch2/stern-gerlach.svg", "image_alt": "Expérience de Stern-Gerlach",
            "hotspots": [
                {"id": "magnet", "label": "Région de l'aimant", "x": 200, "y": 200, "radius": 50},
                {"id": "between", "label": "Entre aimant et détecteur", "x": 290, "y": 200, "radius": 40},
                {"id": "detector", "label": "Au détecteur", "x": 380, "y": 200, "radius": 35}
            ],
            "correct_hotspot": "magnet",
            "explanation": "L'interaction spin-champ magnétique se produit dans la région de gradient de champ.",
            "section_ref": "2.3", "tags": ["Stern-Gerlach", "interaction", "hotspot"], "time_estimate": 60, "points": 2
        },
        {
            "id": "ch2-h011", "difficulty": "medium",
            "question": "Dans Stern-Gerlach, où le faisceau est-il encore non séparé ?",
            "image_url": "assets/images/ch2/stern-gerlach.svg", "image_alt": "Expérience de Stern-Gerlach",
            "hotspots": [
                {"id": "source", "label": "Avant l'aimant", "x": 50, "y": 200, "radius": 35},
                {"id": "magnet", "label": "Dans l'aimant", "x": 200, "y": 200, "radius": 50},
                {"id": "detector", "label": "Au détecteur", "x": 380, "y": 200, "radius": 35}
            ],
            "correct_hotspot": "source",
            "explanation": "Avant d'entrer dans le champ magnétique, le faisceau est encore non séparé.",
            "section_ref": "2.3", "tags": ["Stern-Gerlach", "faisceau", "hotspot"], "time_estimate": 60, "points": 2
        },

        # Chapitre 4 - 6 questions
        {
            "id": "ch4-h001", "difficulty": "medium",
            "question": "Sur le diagramme des états de Bell, identifiez l'état Φ⁺ = (|00⟩ + |11⟩)/√2",
            "image_url": "assets/images/ch4/bell-states.svg", "image_alt": "États de Bell",
            "hotspots": [
                {"id": "phi_plus", "label": "Φ⁺", "x": 100, "y": 100, "radius": 40},
                {"id": "phi_minus", "label": "Φ⁻", "x": 300, "y": 100, "radius": 40},
                {"id": "psi_plus", "label": "Ψ⁺", "x": 100, "y": 300, "radius": 40}
            ],
            "correct_hotspot": "phi_plus",
            "explanation": "L'état Φ⁺ est l'un des quatre états de Bell maximalement intriqués.",
            "section_ref": "4.2", "tags": ["Bell", "intrication", "hotspot"], "time_estimate": 60, "points": 2
        },
        {
            "id": "ch4-h002", "difficulty": "medium",
            "question": "Sur le diagramme, identifiez l'état Φ⁻ = (|00⟩ − |11⟩)/√2",
            "image_url": "assets/images/ch4/bell-states.svg", "image_alt": "États de Bell",
            "hotspots": [
                {"id": "phi_minus", "label": "Φ⁻", "x": 300, "y": 100, "radius": 40},
                {"id": "phi_plus", "label": "Φ⁺", "x": 100, "y": 100, "radius": 40},
                {"id": "psi_minus", "label": "Ψ⁻", "x": 300, "y": 300, "radius": 40}
            ],
            "correct_hotspot": "phi_minus",
            "explanation": "Φ⁻ diffère de Φ⁺ par le signe de la superposition.",
            "section_ref": "4.2", "tags": ["Bell", "intrication", "hotspot"], "time_estimate": 60, "points": 2
        },
        {
            "id": "ch4-h003", "difficulty": "medium",
            "question": "Sur le diagramme, identifiez l'état Ψ⁺ = (|01⟩ + |10⟩)/√2",
            "image_url": "assets/images/ch4/bell-states.svg", "image_alt": "États de Bell",
            "hotspots": [
                {"id": "psi_plus", "label": "Ψ⁺", "x": 100, "y": 300, "radius": 40},
                {"id": "phi_plus", "label": "Φ⁺", "x": 100, "y": 100, "radius": 40},
                {"id": "psi_minus", "label": "Ψ⁻", "x": 300, "y": 300, "radius": 40}
            ],
            "correct_hotspot": "psi_plus",
            "explanation": "Ψ⁺ est la superposition de |01⟩ et |10⟩, états de qubits différents.",
            "section_ref": "4.2", "tags": ["Bell", "intrication", "hotspot"], "time_estimate": 60, "points": 2
        },
        {
            "id": "ch4-h004", "difficulty": "medium",
            "question": "Sur le diagramme, identifiez l'état Ψ⁻ = (|01⟩ − |10⟩)/√2 (état singulet)",
            "image_url": "assets/images/ch4/bell-states.svg", "image_alt": "États de Bell",
            "hotspots": [
                {"id": "psi_minus", "label": "Ψ⁻", "x": 300, "y": 300, "radius": 40},
                {"id": "psi_plus", "label": "Ψ⁺", "x": 100, "y": 300, "radius": 40},
                {"id": "phi_minus", "label": "Φ⁻", "x": 300, "y": 100, "radius": 40}
            ],
            "correct_hotspot": "psi_minus",
            "explanation": "Ψ⁻ est l'état singulet, antisymétrique sous échange de particules.",
            "section_ref": "4.2", "tags": ["Bell", "singulet", "hotspot"], "time_estimate": 60, "points": 2
        },
        {
            "id": "ch4-h005", "difficulty": "hard",
            "question": "Identifiez l'état de Bell qui viole maximalement les inégalités CHSH",
            "image_url": "assets/images/ch4/bell-states.svg", "image_alt": "États de Bell",
            "hotspots": [
                {"id": "all", "label": "Tous les 4", "x": 200, "y": 200, "radius": 60},
                {"id": "phi_plus", "label": "Seulement Φ⁺", "x": 100, "y": 100, "radius": 40},
                {"id": "psi_minus", "label": "Seulement Ψ⁻", "x": 300, "y": 300, "radius": 40}
            ],
            "correct_hotspot": "all",
            "explanation": "Les 4 états de Bell violent maximalement les inégalités de Bell (valeur 2√2).",
            "section_ref": "4.3", "tags": ["Bell", "CHSH", "non-localité", "hotspot"], "time_estimate": 90, "points": 3
        },
        {
            "id": "ch4-h006", "difficulty": "easy",
            "question": "Combien d'états de Bell orthogonaux sont représentés ?",
            "image_url": "assets/images/ch4/bell-states.svg", "image_alt": "États de Bell",
            "hotspots": [
                {"id": "four", "label": "Quatre états", "x": 200, "y": 200, "radius": 60},
                {"id": "two", "label": "Deux états", "x": 200, "y": 100, "radius": 50},
                {"id": "one", "label": "Un état", "x": 100, "y": 100, "radius": 40}
            ],
            "correct_hotspot": "four",
            "explanation": "Il existe exactement 4 états de Bell qui forment une base orthonormée de l'espace à 2 qubits.",
            "section_ref": "4.2", "tags": ["Bell", "base", "hotspot"], "time_estimate": 45, "points": 1
        },

        # Chapitre 6 - 5 questions
        {
            "id": "ch6-h001", "difficulty": "medium",
            "question": "Sur le diagramme des niveaux d'énergie, identifiez le niveau fondamental n=0",
            "image_url": "assets/images/ch6/harmonic-oscillator.svg", "image_alt": "Oscillateur harmonique",
            "hotspots": [
                {"id": "n0", "label": "n=0", "x": 100, "y": 350, "radius": 40},
                {"id": "n1", "label": "n=1", "x": 100, "y": 280, "radius": 40},
                {"id": "n2", "label": "n=2", "x": 100, "y": 210, "radius": 40}
            ],
            "correct_hotspot": "n0",
            "explanation": "Le niveau fondamental n=0 a l'énergie la plus basse E₀ = ℏω/2.",
            "section_ref": "6.2", "tags": ["oscillateur", "énergie", "hotspot"], "time_estimate": 60, "points": 2
        },
        {
            "id": "ch6-h002", "difficulty": "easy",
            "question": "Sur le diagramme, identifiez le premier niveau excité n=1",
            "image_url": "assets/images/ch6/harmonic-oscillator.svg", "image_alt": "Oscillateur harmonique",
            "hotspots": [
                {"id": "n1", "label": "n=1", "x": 100, "y": 280, "radius": 40},
                {"id": "n0", "label": "n=0", "x": 100, "y": 350, "radius": 40},
                {"id": "n2", "label": "n=2", "x": 100, "y": 210, "radius": 40}
            ],
            "correct_hotspot": "n1",
            "explanation": "Le premier niveau excité n=1 a l'énergie E₁ = (3/2)ℏω.",
            "section_ref": "6.2", "tags": ["oscillateur", "excité", "hotspot"], "time_estimate": 45, "points": 1
        },
        {
            "id": "ch6-h003", "difficulty": "medium",
            "question": "Sur le diagramme, identifiez le niveau n=2",
            "image_url": "assets/images/ch6/harmonic-oscillator.svg", "image_alt": "Oscillateur harmonique",
            "hotspots": [
                {"id": "n2", "label": "n=2", "x": 100, "y": 210, "radius": 40},
                {"id": "n1", "label": "n=1", "x": 100, "y": 280, "radius": 40},
                {"id": "n3", "label": "n=3", "x": 100, "y": 140, "radius": 40}
            ],
            "correct_hotspot": "n2",
            "explanation": "Le niveau n=2 a l'énergie E₂ = (5/2)ℏω.",
            "section_ref": "6.2", "tags": ["oscillateur", "niveaux", "hotspot"], "time_estimate": 60, "points": 2
        },
        {
            "id": "ch6-h004", "difficulty": "hard",
            "question": "Identifiez la région où la probabilité de présence classique est maximale",
            "image_url": "assets/images/ch6/harmonic-oscillator.svg", "image_alt": "Oscillateur harmonique",
            "hotspots": [
                {"id": "edges", "label": "Points de retour", "x": 300, "y": 200, "radius": 50},
                {"id": "center", "label": "Au centre x=0", "x": 100, "y": 200, "radius": 40},
                {"id": "far", "label": "Loin du centre", "x": 350, "y": 200, "radius": 40}
            ],
            "correct_hotspot": "edges",
            "explanation": "Classiquement, la particule passe plus de temps aux points de retour où v→0.",
            "section_ref": "6.1", "tags": ["oscillateur", "classique", "hotspot"], "time_estimate": 75, "points": 3
        },
        {
            "id": "ch6-h005", "difficulty": "medium",
            "question": "Sur le diagramme, où l'écart entre niveaux est-il constant ?",
            "image_url": "assets/images/ch6/harmonic-oscillator.svg", "image_alt": "Oscillateur harmonique",
            "hotspots": [
                {"id": "all", "label": "Partout (ΔE=ℏω)", "x": 100, "y": 250, "radius": 60},
                {"id": "bottom", "label": "Seulement en bas", "x": 100, "y": 330, "radius": 40},
                {"id": "top", "label": "Seulement en haut", "x": 100, "y": 100, "radius": 40}
            ],
            "correct_hotspot": "all",
            "explanation": "L'oscillateur harmonique a des niveaux équidistants : Eₙ₊₁ − Eₙ = ℏω pour tout n.",
            "section_ref": "6.2", "tags": ["oscillateur", "équidistance", "hotspot"], "time_estimate": 60, "points": 2
        }
    ]

    questions.extend(hotspot_templates)
    return questions

def generate_drag_drop_questions():
    """Génère 33 questions Drag & Drop"""
    questions = []

    drag_drop_all = [
        # Chapitre 1 - 6 questions
        {
            "id": "ch1-dd001", "type": "drag_drop", "difficulty": "easy",
            "question": "Classez ces expériences selon leur époque",
            "draggable_items": [
                {"id": "young", "text": "Fentes d'Young"},
                {"id": "debroglie", "text": "Hypothèse de De Broglie"},
                {"id": "schrodinger", "text": "Chat de Schrödinger"},
                {"id": "bell", "text": "Inégalités de Bell"}
            ],
            "drop_zones": [
                {"id": "1800s", "label": "XIXe siècle"},
                {"id": "1920s", "label": "Années 1920"},
                {"id": "1930s", "label": "Années 1930"},
                {"id": "1960s", "label": "Années 1960"}
            ],
            "correct_matches": {
                "young": "1800s", "debroglie": "1920s",
                "schrodinger": "1930s", "bell": "1960s"
            },
            "explanation": "Chronologie : Young (1801), De Broglie (1924), Schrödinger (1935), Bell (1964).",
            "section_ref": "1.1", "tags": ["histoire", "chronologie", "drag-drop"],
            "time_estimate": 90, "points": 2
        },
        {
            "id": "ch1-dd002", "type": "drag_drop", "difficulty": "medium",
            "question": "Associez chaque état quantique à sa position sur la sphère de Bloch",
            "draggable_items": [
                {"id": "ket0", "text": "|0⟩"},
                {"id": "ket1", "text": "|1⟩"},
                {"id": "plus", "text": "|+⟩"},
                {"id": "minus", "text": "|−⟩"}
            ],
            "drop_zones": [
                {"id": "north", "label": "Pôle Nord"},
                {"id": "south", "label": "Pôle Sud"},
                {"id": "x_pos", "label": "Équateur +x"},
                {"id": "x_neg", "label": "Équateur −x"}
            ],
            "correct_matches": {
                "ket0": "north", "ket1": "south",
                "plus": "x_pos", "minus": "x_neg"
            },
            "explanation": "|0⟩ au Nord, |1⟩ au Sud, |+⟩ à +x, |−⟩ à −x.",
            "section_ref": "1.3", "tags": ["Bloch", "états", "drag-drop"],
            "time_estimate": 90, "points": 2
        },
        {
            "id": "ch1-dd003", "type": "drag_drop", "difficulty": "easy",
            "question": "Associez chaque propriété quantique à sa description",
            "draggable_items": [
                {"id": "superpos", "text": "Superposition"},
                {"id": "interference", "text": "Interférence"},
                {"id": "duality", "text": "Dualité"},
                {"id": "decoherence", "text": "Décohérence"}
            ],
            "drop_zones": [
                {"id": "desc1", "label": "Onde + Corpuscule"},
                {"id": "desc2", "label": "Combinaison linéaire"},
                {"id": "desc3", "label": "Franges lumière/obscurité"},
                {"id": "desc4", "label": "Perte cohérence"}
            ],
            "correct_matches": {
                "duality": "desc1", "superpos": "desc2",
                "interference": "desc3", "decoherence": "desc4"
            },
            "explanation": "Propriétés fondamentales de la mécanique quantique.",
            "section_ref": "1.1-1.4", "tags": ["propriétés", "concepts", "drag-drop"],
            "time_estimate": 75, "points": 2
        },
        {
            "id": "ch1-dd004", "type": "drag_drop", "difficulty": "medium",
            "question": "Placez ces coefficients selon leur signification dans |ψ⟩ = α|0⟩ + β|1⟩",
            "draggable_items": [
                {"id": "alpha2", "text": "|α|²"},
                {"id": "beta2", "text": "|β|²"},
                {"id": "norm", "text": "|α|²+|β|²"},
                {"id": "phase", "text": "arg(α/β)"}
            ],
            "drop_zones": [
                {"id": "prob0", "label": "P(mesurer |0⟩)"},
                {"id": "prob1", "label": "P(mesurer |1⟩)"},
                {"id": "total", "label": "Normalisation"},
                {"id": "rel_phase", "label": "Phase relative"}
            ],
            "correct_matches": {
                "alpha2": "prob0", "beta2": "prob1",
                "norm": "total", "phase": "rel_phase"
            },
            "explanation": "|α|² et |β|² sont les probabilités, leur somme vaut 1, arg(α/β) est la phase relative.",
            "section_ref": "1.2", "tags": ["superposition", "probabilités", "drag-drop"],
            "time_estimate": 90, "points": 2
        },
        {
            "id": "ch1-dd005", "type": "drag_drop", "difficulty": "hard",
            "question": "Associez chaque paramètre de la sphère de Bloch à sa signification",
            "draggable_items": [
                {"id": "theta", "text": "θ"},
                {"id": "phi", "text": "φ"},
                {"id": "r", "text": "r"}
            ],
            "drop_zones": [
                {"id": "colatitude", "label": "Angle polaire (0 à π)"},
                {"id": "azimuth", "label": "Angle azimutal (0 à 2π)"},
                {"id": "purity", "label": "Pureté de l'état"}
            ],
            "correct_matches": {
                "theta": "colatitude", "phi": "azimuth", "r": "purity"
            },
            "explanation": "θ: colatitude (|0⟩↔|1⟩), φ: azimut (phase), r: pureté (r=1 pour états purs).",
            "section_ref": "1.3", "tags": ["Bloch", "paramètres", "drag-drop"],
            "time_estimate": 120, "points": 3
        },
        {
            "id": "ch1-dd006", "type": "drag_drop", "difficulty": "medium",
            "question": "Classez ces états selon leur degré de superposition",
            "draggable_items": [
                {"id": "pure0", "text": "|0⟩"},
                {"id": "plus", "text": "|+⟩"},
                {"id": "general", "text": "0.6|0⟩+0.8|1⟩"},
                {"id": "pure1", "text": "|1⟩"}
            ],
            "drop_zones": [
                {"id": "no_super", "label": "Pas de superposition"},
                {"id": "max_super", "label": "Superposition maximale"},
                {"id": "partial", "label": "Superposition partielle"}
            ],
            "correct_matches": {
                "pure0": "no_super", "pure1": "no_super",
                "plus": "max_super", "general": "partial"
            },
            "explanation": "|0⟩ et |1⟩: états de base purs. |+⟩: superposition 50-50 maximale. Autres: partielles.",
            "section_ref": "1.2", "tags": ["superposition", "états", "drag-drop"],
            "time_estimate": 90, "points": 2
        },

        # Chapitre 2 - 6 questions
        {
            "id": "ch2-dd001", "type": "drag_drop", "difficulty": "medium",
            "question": "Placez les matrices de Pauli avec leurs représentations correctes",
            "draggable_items": [
                {"id": "sx", "text": "σₓ"},
                {"id": "sy", "text": "σᵧ"},
                {"id": "sz", "text": "σ_z"}
            ],
            "drop_zones": [
                {"id": "mat1", "label": "[[0,1],[1,0]]"},
                {"id": "mat2", "label": "[[0,-i],[i,0]]"},
                {"id": "mat3", "label": "[[1,0],[0,-1]]"}
            ],
            "correct_matches": {
                "sx": "mat1", "sy": "mat2", "sz": "mat3"
            },
            "explanation": "σₓ flip, σᵧ flip+phase, σ_z diagonal.",
            "section_ref": "2.2", "tags": ["Pauli", "matrices", "drag-drop"],
            "time_estimate": 90, "points": 2
        },
        {
            "id": "ch2-dd002", "type": "drag_drop", "difficulty": "easy",
            "question": "Classez ces observables selon leur spectre",
            "draggable_items": [
                {"id": "pos", "text": "Position x̂"},
                {"id": "mom", "text": "Impulsion p̂"},
                {"id": "spin", "text": "Spin Ŝ"},
                {"id": "energy", "text": "Hamiltonien Ĥ (lié)"}
            ],
            "drop_zones": [
                {"id": "continuous", "label": "Spectre continu"},
                {"id": "discrete", "label": "Spectre discret"}
            ],
            "correct_matches": {
                "pos": "continuous", "mom": "continuous",
                "spin": "discrete", "energy": "discrete"
            },
            "explanation": "Position et impulsion: continus. Spin et énergie (systèmes liés): discrets.",
            "section_ref": "2.1", "tags": ["observables", "spectre", "drag-drop"],
            "time_estimate": 75, "points": 2
        },
        {
            "id": "ch2-dd003", "type": "drag_drop", "difficulty": "medium",
            "question": "Associez chaque opérateur de spin à ses valeurs propres",
            "draggable_items": [
                {"id": "sx", "text": "Ŝₓ"},
                {"id": "sy", "text": "Ŝᵧ"},
                {"id": "sz", "text": "Ŝ_z"},
                {"id": "s2", "text": "Ŝ²"}
            ],
            "drop_zones": [
                {"id": "pm_half", "label": "±ℏ/2"},
                {"id": "three_four", "label": "(3/4)ℏ²"}
            ],
            "correct_matches": {
                "sx": "pm_half", "sy": "pm_half",
                "sz": "pm_half", "s2": "three_four"
            },
            "explanation": "Composantes de spin: ±ℏ/2. Spin total carré: s(s+1)ℏ² = (3/4)ℏ² pour s=1/2.",
            "section_ref": "2.2", "tags": ["spin", "valeurs propres", "drag-drop"],
            "time_estimate": 90, "points": 2
        },
        {
            "id": "ch2-dd004", "type": "drag_drop", "difficulty": "hard",
            "question": "Associez chaque paire d'observables à leur relation de commutation",
            "draggable_items": [
                {"id": "xp", "text": "[x̂,p̂]"},
                {"id": "sxsy", "text": "[Ŝₓ,Ŝᵧ]"},
                {"id": "xh", "text": "[x̂,Ĥ]"},
                {"id": "s2sz", "text": "[Ŝ²,Ŝ_z]"}
            ],
            "drop_zones": [
                {"id": "ihbar", "label": "iℏ"},
                {"id": "ihbar_sz", "label": "iℏŜ_z"},
                {"id": "zero", "label": "0"},
                {"id": "complex", "label": "Dépend de Ĥ"}
            ],
            "correct_matches": {
                "xp": "ihbar", "sxsy": "ihbar_sz",
                "s2sz": "zero", "xh": "complex"
            },
            "explanation": "[x,p]=iℏ (Heisenberg), [Sₓ,Sᵧ]=iℏS_z, [S²,S_z]=0 (compatible), [x,H] dépend du système.",
            "section_ref": "2.4", "tags": ["commutateurs", "Heisenberg", "drag-drop"],
            "time_estimate": 120, "points": 3
        },
        {
            "id": "ch2-dd005", "type": "drag_drop", "difficulty": "medium",
            "question": "Associez chaque propriété d'opérateur à sa signification physique",
            "draggable_items": [
                {"id": "hermit", "text": "Hermitien"},
                {"id": "unitary", "text": "Unitaire"},
                {"id": "projection", "text": "Projecteur"},
                {"id": "positive", "text": "Positif"}
            ],
            "drop_zones": [
                {"id": "obs", "label": "Observable mesurable"},
                {"id": "evol", "label": "Évolution réversible"},
                {"id": "measure", "label": "Mesure projective"},
                {"id": "prob", "label": "Opérateur densité"}
            ],
            "correct_matches": {
                "hermit": "obs", "unitary": "evol",
                "projection": "measure", "positive": "prob"
            },
            "explanation": "Hermitien→observable, Unitaire→évolution, Projecteur→mesure, Positif→densité.",
            "section_ref": "2.1-2.3", "tags": ["opérateurs", "propriétés", "drag-drop"],
            "time_estimate": 90, "points": 2
        },
        {
            "id": "ch2-dd006", "type": "drag_drop", "difficulty": "easy",
            "question": "Associez chaque résultat de Stern-Gerlach à l'état de spin correspondant",
            "draggable_items": [
                {"id": "up", "text": "Déviation vers le haut"},
                {"id": "down", "text": "Déviation vers le bas"},
                {"id": "both", "text": "Deux taches"}
            ],
            "drop_zones": [
                {"id": "spin_up", "label": "|↑⟩_z"},
                {"id": "spin_down", "label": "|↓⟩_z"},
                {"id": "superpos", "label": "Superposition"}
            ],
            "correct_matches": {
                "up": "spin_up", "down": "spin_down", "both": "superpos"
            },
            "explanation": "Déviation haut→spin up, bas→spin down, deux taches→superposition.",
            "section_ref": "2.3", "tags": ["Stern-Gerlach", "spin", "drag-drop"],
            "time_estimate": 75, "points": 2
        },

        # Chapitre 3 - 5 questions
        {
            "id": "ch3-dd001", "type": "drag_drop", "difficulty": "medium",
            "question": "Associez chaque postulat à son contenu",
            "draggable_items": [
                {"id": "p1", "text": "Postulat 1"},
                {"id": "p2", "text": "Postulat 2"},
                {"id": "p3", "text": "Postulat 3"},
                {"id": "p5", "text": "Postulat 5"}
            ],
            "drop_zones": [
                {"id": "state", "label": "États dans Hilbert"},
                {"id": "obs", "label": "Observables hermitiens"},
                {"id": "meas", "label": "Règle de Born"},
                {"id": "evol", "label": "Équation de Schrödinger"}
            ],
            "correct_matches": {
                "p1": "state", "p2": "obs", "p3": "meas", "p5": "evol"
            },
            "explanation": "P1: États, P2: Observables, P3: Mesure, P5: Évolution.",
            "section_ref": "3.1", "tags": ["postulats", "fondements", "drag-drop"],
            "time_estimate": 90, "points": 2
        },
        {
            "id": "ch3-dd002", "type": "drag_drop", "difficulty": "easy",
            "question": "Associez chaque équation à sa description",
            "draggable_items": [
                {"id": "schrod_t", "text": "iℏ∂ψ/∂t = Ĥψ"},
                {"id": "schrod_i", "text": "Ĥψ = Eψ"},
                {"id": "born", "text": "P = |⟨φ|ψ⟩|²"},
                {"id": "heisen", "text": "ΔxΔp ≥ ℏ/2"}
            ],
            "drop_zones": [
                {"id": "time_evol", "label": "Évolution temporelle"},
                {"id": "eigenval", "label": "États propres"},
                {"id": "prob", "label": "Probabilité de mesure"},
                {"id": "uncert", "label": "Incertitude"}
            ],
            "correct_matches": {
                "schrod_t": "time_evol", "schrod_i": "eigenval",
                "born": "prob", "heisen": "uncert"
            },
            "explanation": "Schrödinger dépendant du temps, indépendant du temps, règle de Born, incertitude.",
            "section_ref": "3.2-3.5", "tags": ["équations", "MQ", "drag-drop"],
            "time_estimate": 90, "points": 2
        },
        {
            "id": "ch3-dd003", "type": "drag_drop", "difficulty": "medium",
            "question": "Classez ces processus selon leur nature en MQ",
            "draggable_items": [
                {"id": "unitary", "text": "Évolution libre"},
                {"id": "collapse", "text": "Mesure"},
                {"id": "mixing", "text": "Décohérence"},
                {"id": "interaction", "text": "Couplage système"}
            ],
            "drop_zones": [
                {"id": "reversible", "label": "Réversible/Unitaire"},
                {"id": "irreversible", "label": "Irréversible"}
            ],
            "correct_matches": {
                "unitary": "reversible", "interaction": "reversible",
                "collapse": "irreversible", "mixing": "irreversible"
            },
            "explanation": "Évolution unitaire: réversible. Mesure et décohérence: irréversibles.",
            "section_ref": "3.4-3.6", "tags": ["évolution", "mesure", "drag-drop"],
            "time_estimate": 90, "points": 2
        },
        {
            "id": "ch3-dd004", "type": "drag_drop", "difficulty": "hard",
            "question": "Associez chaque type d'état à son comportement temporel",
            "draggable_items": [
                {"id": "stationary", "text": "État stationnaire"},
                {"id": "coherent", "text": "Superposition cohérente"},
                {"id": "mixed", "text": "État mixte"},
                {"id": "ground", "text": "État fondamental"}
            ],
            "drop_zones": [
                {"id": "phase_only", "label": "Phase e^(-iEt/ℏ) seulement"},
                {"id": "oscillate", "label": "Oscillations observables"},
                {"id": "decay", "label": "Décroissance cohérence"},
                {"id": "stable", "label": "Stable (E minimale)"}
            ],
            "correct_matches": {
                "stationary": "phase_only", "coherent": "oscillate",
                "mixed": "decay", "ground": "stable"
            },
            "explanation": "Stationnaire: phase pure. Superposition: oscillations. Mixte: décohérence. Fondamental: stable.",
            "section_ref": "3.5-3.6", "tags": ["états", "dynamique", "drag-drop"],
            "time_estimate": 120, "points": 3
        },
        {
            "id": "ch3-dd005", "type": "drag_drop", "difficulty": "medium",
            "question": "Associez chaque quantité à sa conservation dans l'évolution unitaire",
            "draggable_items": [
                {"id": "norm", "text": "Norme ⟨ψ|ψ⟩"},
                {"id": "energy_avg", "text": "⟨Ĥ⟩ (si [Ĥ,∂Ĥ/∂t]=0)"},
                {"id": "coherence", "text": "Cohérence"},
                {"id": "prob_sum", "text": "Σᵢ Pᵢ"}
            ],
            "drop_zones": [
                {"id": "always", "label": "Toujours conservée"},
                {"id": "conditional", "label": "Conservée si Ĥ indép. temps"},
                {"id": "lost_measure", "label": "Perdue à la mesure"}
            ],
            "correct_matches": {
                "norm": "always", "prob_sum": "always",
                "energy_avg": "conditional", "coherence": "lost_measure"
            },
            "explanation": "Norme et probabilités totales toujours conservées. Énergie si Ĥ(t) constant. Cohérence perdue.",
            "section_ref": "3.4", "tags": ["conservation", "évolution", "drag-drop"],
            "time_estimate": 90, "points": 2
        },

        # Chapitre 4 - 8 questions
        {
            "id": "ch4-dd001", "type": "drag_drop", "difficulty": "hard",
            "question": "Associez chaque état de Bell à sa forme mathématique",
            "draggable_items": [
                {"id": "phi_p", "text": "|Φ⁺⟩"},
                {"id": "phi_m", "text": "|Φ⁻⟩"},
                {"id": "psi_p", "text": "|Ψ⁺⟩"},
                {"id": "psi_m", "text": "|Ψ⁻⟩"}
            ],
            "drop_zones": [
                {"id": "form1", "label": "(|00⟩+|11⟩)/√2"},
                {"id": "form2", "label": "(|00⟩−|11⟩)/√2"},
                {"id": "form3", "label": "(|01⟩+|10⟩)/√2"},
                {"id": "form4", "label": "(|01⟩−|10⟩)/√2"}
            ],
            "correct_matches": {
                "phi_p": "form1", "phi_m": "form2",
                "psi_p": "form3", "psi_m": "form4"
            },
            "explanation": "Les 4 états de Bell maximalement intriqués.",
            "section_ref": "4.2", "tags": ["Bell", "intrication", "drag-drop"],
            "time_estimate": 120, "points": 3
        },
        {
            "id": "ch4-dd002", "type": "drag_drop", "difficulty": "medium",
            "question": "Classez ces états à 2 qubits selon leur intrication",
            "draggable_items": [
                {"id": "bell", "text": "|Φ⁺⟩"},
                {"id": "product", "text": "|0⟩⊗|1⟩"},
                {"id": "partial", "text": "(√3|00⟩+|11⟩)/2"},
                {"id": "separable", "text": "|+⟩⊗|+⟩"}
            ],
            "drop_zones": [
                {"id": "max_entangled", "label": "Maximalement intriqué"},
                {"id": "not_entangled", "label": "Séparable (pas intriqué)"},
                {"id": "partially", "label": "Partiellement intriqué"}
            ],
            "correct_matches": {
                "bell": "max_entangled",
                "product": "not_entangled", "separable": "not_entangled",
                "partial": "partially"
            },
            "explanation": "Bell: max. Produits: séparables. (√3|00⟩+|11⟩)/2: intriqué non maximal.",
            "section_ref": "4.1", "tags": ["intrication", "séparabilité", "drag-drop"],
            "time_estimate": 90, "points": 2
        },
        {
            "id": "ch4-dd003", "type": "drag_drop", "difficulty": "easy",
            "question": "Associez chaque opération quantique à son utilisation",
            "draggable_items": [
                {"id": "tensor", "text": "Produit tensoriel ⊗"},
                {"id": "cnot", "text": "CNOT"},
                {"id": "hadamard", "text": "Hadamard H"},
                {"id": "bell_meas", "text": "Mesure de Bell"}
            ],
            "drop_zones": [
                {"id": "combine", "label": "Combiner systèmes"},
                {"id": "entangle", "label": "Créer intrication"},
                {"id": "superpos", "label": "Créer superposition"},
                {"id": "teleport", "label": "Téléportation"}
            ],
            "correct_matches": {
                "tensor": "combine", "cnot": "entangle",
                "hadamard": "superpos", "bell_meas": "teleport"
            },
            "explanation": "⊗ combine, CNOT intriquent, H superpose, mesure Bell pour téléportation.",
            "section_ref": "4.1-4.4", "tags": ["opérations", "multi-qubits", "drag-drop"],
            "time_estimate": 75, "points": 2
        },
        {
            "id": "ch4-dd004", "type": "drag_drop", "difficulty": "medium",
            "question": "Associez chaque concept EPR/Bell à sa signification",
            "draggable_items": [
                {"id": "locality", "text": "Localité"},
                {"id": "realism", "text": "Réalisme"},
                {"id": "bell_ineq", "text": "Inégalités de Bell"},
                {"id": "violation", "text": "Violation CHSH"}
            ],
            "drop_zones": [
                {"id": "no_spooky", "label": "Pas d'action à distance"},
                {"id": "hidden_var", "label": "Variables cachées locales"},
                {"id": "classical_bound", "label": "Limite classique ≤2"},
                {"id": "quantum_bound", "label": "MQ atteint 2√2"}
            ],
            "correct_matches": {
                "locality": "no_spooky", "realism": "hidden_var",
                "bell_ineq": "classical_bound", "violation": "quantum_bound"
            },
            "explanation": "EPR suppose localité+réalisme. Bell: limite classique 2. MQ viole jusqu'à 2√2.",
            "section_ref": "4.3", "tags": ["EPR", "Bell", "non-localité", "drag-drop"],
            "time_estimate": 120, "points": 3
        },
        {
            "id": "ch4-dd005", "type": "drag_drop", "difficulty": "hard",
            "question": "Étapes de la téléportation quantique dans l'ordre",
            "draggable_items": [
                {"id": "step1", "text": "Partager |Φ⁺⟩_BC"},
                {"id": "step2", "text": "Mesure de Bell sur AB"},
                {"id": "step3", "text": "Envoi bits classiques"},
                {"id": "step4", "text": "Correction unitaire"}
            ],
            "drop_zones": [
                {"id": "first", "label": "1ère étape"},
                {"id": "second", "label": "2ème étape"},
                {"id": "third", "label": "3ème étape"},
                {"id": "fourth", "label": "4ème étape"}
            ],
            "correct_matches": {
                "step1": "first", "step2": "second",
                "step3": "third", "step4": "fourth"
            },
            "explanation": "Téléportation: 1) Partager intrication, 2) Mesure Bell, 3) Communication classique, 4) Correction.",
            "section_ref": "4.4", "tags": ["téléportation", "protocole", "drag-drop"],
            "time_estimate": 120, "points": 3
        },
        {
            "id": "ch4-dd006", "type": "drag_drop", "difficulty": "medium",
            "question": "Associez chaque théorème no-go à ce qu'il interdit",
            "draggable_items": [
                {"id": "no_clone", "text": "No-cloning"},
                {"id": "no_delete", "text": "No-deleting"},
                {"id": "no_telecom", "text": "No-communication"},
                {"id": "no_broadcast", "text": "No-broadcasting"}
            ],
            "drop_zones": [
                {"id": "copy", "label": "Copier état inconnu"},
                {"id": "erase", "label": "Effacer sans trace"},
                {"id": "ftl", "label": "Communication supraluminique"},
                {"id": "multi_copy", "label": "Broadcast quantique"}
            ],
            "correct_matches": {
                "no_clone": "copy", "no_delete": "erase",
                "no_telecom": "ftl", "no_broadcast": "multi_copy"
            },
            "explanation": "Théorèmes fondamentaux limitant les opérations quantiques possibles.",
            "section_ref": "4.5", "tags": ["no-go", "théorèmes", "drag-drop"],
            "time_estimate": 90, "points": 2
        },
        {
            "id": "ch4-dd007", "type": "drag_drop", "difficulty": "easy",
            "question": "Associez dimension de l'espace d'états au nombre de qubits",
            "draggable_items": [
                {"id": "one", "text": "1 qubit"},
                {"id": "two", "text": "2 qubits"},
                {"id": "three", "text": "3 qubits"},
                {"id": "n", "text": "n qubits"}
            ],
            "drop_zones": [
                {"id": "dim2", "label": "dim = 2"},
                {"id": "dim4", "label": "dim = 4"},
                {"id": "dim8", "label": "dim = 8"},
                {"id": "dim2n", "label": "dim = 2ⁿ"}
            ],
            "correct_matches": {
                "one": "dim2", "two": "dim4",
                "three": "dim8", "n": "dim2n"
            },
            "explanation": "Dimension de l'espace d'états = 2ⁿ pour n qubits (croissance exponentielle).",
            "section_ref": "4.1", "tags": ["dimension", "qubits", "drag-drop"],
            "time_estimate": 75, "points": 2
        },
        {
            "id": "ch4-dd008", "type": "drag_drop", "difficulty": "medium",
            "question": "Associez chaque base à 2 qubits à sa propriété",
            "draggable_items": [
                {"id": "comp", "text": "Base computationnelle"},
                {"id": "bell", "text": "Base de Bell"},
                {"id": "product", "text": "Base produit |±⟩⊗|±⟩"},
                {"id": "ghz", "text": "États GHZ (n≥3)"}
            ],
            "drop_zones": [
                {"id": "separable", "label": "Séparable"},
                {"id": "entangled", "label": "Maximalement intriquée"},
                {"id": "multi", "label": "Multi-qubits (n≥3)"}
            ],
            "correct_matches": {
                "comp": "separable", "product": "separable",
                "bell": "entangled", "ghz": "multi"
            },
            "explanation": "Bases computationnelle et produit: séparables. Bell: intriquée. GHZ: généralisation à n qubits.",
            "section_ref": "4.1-4.2", "tags": ["bases", "intrication", "drag-drop"],
            "time_estimate": 90, "points": 2
        },

        # Chapitre 5 - 4 questions
        {
            "id": "ch5-dd001", "type": "drag_drop", "difficulty": "medium",
            "question": "Classez ces fonctions d'onde selon leur normalisation",
            "draggable_items": [
                {"id": "gauss", "text": "Gaussienne"},
                {"id": "plane", "text": "Onde plane"},
                {"id": "box", "text": "Puits infini"},
                {"id": "harmonic", "text": "Oscillateur"}
            ],
            "drop_zones": [
                {"id": "normalized", "label": "Normalisable L²"},
                {"id": "not_norm", "label": "Non normalisable"}
            ],
            "correct_matches": {
                "gauss": "normalized", "box": "normalized",
                "harmonic": "normalized", "plane": "not_norm"
            },
            "explanation": "Onde plane: non normalisable (étendue infinie). Autres: localisées, normalisables.",
            "section_ref": "5.1", "tags": ["fonctions d'onde", "normalisation", "drag-drop"],
            "time_estimate": 90, "points": 2
        },
        {
            "id": "ch5-dd002", "type": "drag_drop", "difficulty": "easy",
            "question": "Associez chaque représentation à son espace",
            "draggable_items": [
                {"id": "psi_x", "text": "ψ(x)"},
                {"id": "psi_p", "text": "φ(p)"},
                {"id": "ket", "text": "|ψ⟩"},
                {"id": "matrix", "text": "Vecteur colonne"}
            ],
            "drop_zones": [
                {"id": "position", "label": "Espace position"},
                {"id": "momentum", "label": "Espace impulsion"},
                {"id": "abstract", "label": "Espace abstrait"},
                {"id": "discrete", "label": "Base discrète"}
            ],
            "correct_matches": {
                "psi_x": "position", "psi_p": "momentum",
                "ket": "abstract", "matrix": "discrete"
            },
            "explanation": "Différentes représentations du même état quantique.",
            "section_ref": "5.1", "tags": ["représentations", "espaces", "drag-drop"],
            "time_estimate": 75, "points": 2
        },
        {
            "id": "ch5-dd003", "type": "drag_drop", "difficulty": "medium",
            "question": "Associez chaque transformation à sa relation",
            "draggable_items": [
                {"id": "fourier", "text": "Fourier"},
                {"id": "debroglie", "text": "De Broglie"},
                {"id": "planck", "text": "Planck-Einstein"},
                {"id": "heisenberg", "text": "Heisenberg"}
            ],
            "drop_zones": [
                {"id": "x_to_p", "label": "ψ(x) ↔ φ(p)"},
                {"id": "lambda_to_p", "label": "λ = h/p"},
                {"id": "freq_to_e", "label": "E = hν"},
                {"id": "uncertainty", "label": "ΔxΔp ≥ ℏ/2"}
            ],
            "correct_matches": {
                "fourier": "x_to_p", "debroglie": "lambda_to_p",
                "planck": "freq_to_e", "heisenberg": "uncertainty"
            },
            "explanation": "Relations fondamentales entre représentations position-impulsion et onde-corpuscule.",
            "section_ref": "5.1-5.2", "tags": ["transformations", "relations", "drag-drop"],
            "time_estimate": 90, "points": 2
        },
        {
            "id": "ch5-dd004", "type": "drag_drop", "difficulty": "hard",
            "question": "Associez chaque type de paquet d'ondes à son comportement",
            "draggable_items": [
                {"id": "gauss_free", "text": "Gaussien libre"},
                {"id": "gauss_harm", "text": "Gaussien dans oscillateur"},
                {"id": "coherent", "text": "État cohérent"},
                {"id": "squeezed", "text": "État comprimé"}
            ],
            "drop_zones": [
                {"id": "spread", "label": "S'étale dans le temps"},
                {"id": "stable", "label": "Forme stable"},
                {"id": "oscillate", "label": "Oscille sans déformation"},
                {"id": "squeeze", "label": "Δx<ΔxΔp_min, Δp>"}
            ],
            "correct_matches": {
                "gauss_free": "spread", "gauss_harm": "oscillate",
                "coherent": "stable", "squeezed": "squeeze"
            },
            "explanation": "Gaussien libre: dispersion. Dans oscillateur: oscillation périodique. Cohérent: quasi-classique. Comprimé: Δx ou Δp sous limite symétrique.",
            "section_ref": "5.2-5.3", "tags": ["paquets d'ondes", "dynamique", "drag-drop"],
            "time_estimate": 120, "points": 3
        },

        # Chapitre 6 - 4 questions
        {
            "id": "ch6-dd001", "type": "drag_drop", "difficulty": "medium",
            "question": "Associez chaque opérateur de l'oscillateur à son action",
            "draggable_items": [
                {"id": "a", "text": "â (annihilation)"},
                {"id": "adag", "text": "â† (création)"},
                {"id": "n", "text": "n̂ (nombre)"},
                {"id": "h", "text": "Ĥ (hamiltonien)"}
            ],
            "drop_zones": [
                {"id": "lower", "label": "Diminue n"},
                {"id": "raise", "label": "Augmente n"},
                {"id": "count", "label": "Compte quanta"},
                {"id": "energy", "label": "Donne énergie"}
            ],
            "correct_matches": {
                "a": "lower", "adag": "raise",
                "n": "count", "h": "energy"
            },
            "explanation": "â|n⟩=√n|n-1⟩, â†|n⟩=√(n+1)|n+1⟩, n̂|n⟩=n|n⟩, Ĥ|n⟩=(n+1/2)ℏω|n⟩.",
            "section_ref": "6.3", "tags": ["oscillateur", "opérateurs", "drag-drop"],
            "time_estimate": 90, "points": 2
        },
        {
            "id": "ch6-dd002", "type": "drag_drop", "difficulty": "easy",
            "question": "Associez chaque niveau d'énergie à sa valeur pour l'oscillateur harmonique",
            "draggable_items": [
                {"id": "n0", "text": "n=0"},
                {"id": "n1", "text": "n=1"},
                {"id": "n2", "text": "n=2"},
                {"id": "n_general", "text": "n"}
            ],
            "drop_zones": [
                {"id": "e0", "label": "(1/2)ℏω"},
                {"id": "e1", "label": "(3/2)ℏω"},
                {"id": "e2", "label": "(5/2)ℏω"},
                {"id": "en", "label": "(n+1/2)ℏω"}
            ],
            "correct_matches": {
                "n0": "e0", "n1": "e1",
                "n2": "e2", "n_general": "en"
            },
            "explanation": "Niveaux équidistants Eₙ = (n+1/2)ℏω avec énergie de point zéro ℏω/2.",
            "section_ref": "6.2", "tags": ["oscillateur", "énergie", "drag-drop"],
            "time_estimate": 75, "points": 2
        },
        {
            "id": "ch6-dd003", "type": "drag_drop", "difficulty": "hard",
            "question": "Associez chaque relation de commutation à sa valeur",
            "draggable_items": [
                {"id": "a_adag", "text": "[â,â†]"},
                {"id": "a_n", "text": "[â,n̂]"},
                {"id": "adag_n", "text": "[â†,n̂]"},
                {"id": "x_p", "text": "[x̂,p̂]"}
            ],
            "drop_zones": [
                {"id": "one", "label": "1"},
                {"id": "minus_a", "label": "−â"},
                {"id": "plus_adag", "label": "+â†"},
                {"id": "ihbar", "label": "iℏ"}
            ],
            "correct_matches": {
                "a_adag": "one", "a_n": "minus_a",
                "adag_n": "plus_adag", "x_p": "ihbar"
            },
            "explanation": "[â,â†]=1 (fondamental), [â,n̂]=−â, [â†,n̂]=+â†, [x,p]=iℏ.",
            "section_ref": "6.3", "tags": ["oscillateur", "commutateurs", "drag-drop"],
            "time_estimate": 120, "points": 3
        },
        {
            "id": "ch6-dd004", "type": "drag_drop", "difficulty": "medium",
            "question": "Classez ces états de l'oscillateur harmonique selon leurs propriétés",
            "draggable_items": [
                {"id": "fock", "text": "États |n⟩"},
                {"id": "coherent", "text": "États cohérents |α⟩"},
                {"id": "squeezed", "text": "États comprimés"},
                {"id": "thermal", "text": "État thermique"}
            ],
            "drop_zones": [
                {"id": "pure_discrete", "label": "Pure, énergie définie"},
                {"id": "pure_quasi", "label": "Pure, quasi-classique"},
                {"id": "pure_squeez", "label": "Pure, Δx≠Δp min symétrique"},
                {"id": "mixed", "label": "Mélange statistique"}
            ],
            "correct_matches": {
                "fock": "pure_discrete", "coherent": "pure_quasi",
                "squeezed": "pure_squeez", "thermal": "mixed"
            },
            "explanation": "|n⟩: états propres. |α⟩: quasi-classiques. Comprimés: une variance réduite. Thermique: mélange.",
            "section_ref": "6.4", "tags": ["oscillateur", "états", "drag-drop"],
            "time_estimate": 90, "points": 2
        }
    ]

    questions.extend(drag_drop_all)
    return questions

def generate_flashcard_questions():
    """Génère 34 questions Flashcard"""
    questions = []

    flashcards = [
        # Chapitre 1 - 6 flashcards
        {
            "id": "ch1-fc001", "type": "flashcard", "difficulty": "easy",
            "front": "Qu'est-ce que la dualité onde-corpuscule ?",
            "back": "Propriété fondamentale de la matière et du rayonnement de se comporter tantôt comme une onde, tantôt comme une particule, selon le contexte expérimental.",
            "hint": "Comportement des quantons",
            "section_ref": "1.1", "tags": ["dualité", "fondements", "flashcard"],
            "time_estimate": 60, "points": 1
        },
        {
            "id": "ch1-fc002", "type": "flashcard", "difficulty": "easy",
            "front": "Définissez le principe de superposition quantique",
            "back": "Un système quantique peut exister dans une combinaison linéaire d'états de base : |ψ⟩ = α|0⟩ + β|1⟩. Avant la mesure, le système EST la superposition, pas dans un état ou l'autre.",
            "hint": "Combinaison d'états",
            "section_ref": "1.2", "tags": ["superposition", "états", "flashcard"],
            "time_estimate": 60, "points": 1
        },
        {
            "id": "ch1-fc003", "type": "flashcard", "difficulty": "medium",
            "front": "Qu'est-ce qu'un qubit ?",
            "back": "Système quantique à deux niveaux pouvant être dans une superposition : |ψ⟩ = α|0⟩ + β|1⟩ avec |α|²+|β|²=1. Unité de base de l'information quantique.",
            "hint": "Information quantique",
            "section_ref": "1.3", "tags": ["qubit", "information", "flashcard"],
            "time_estimate": 75, "points": 2
        },
        {
            "id": "ch1-fc004", "type": "flashcard", "difficulty": "medium",
            "front": "Qu'est-ce que la décohérence ?",
            "back": "Perte de cohérence quantique due à l'interaction avec l'environnement. Transforme une superposition pure en mélange statistique, expliquant la transition quantique → classique.",
            "hint": "Interaction avec l'environnement",
            "section_ref": "1.4", "tags": ["décohérence", "environnement", "flashcard"],
            "time_estimate": 75, "points": 2
        },
        {
            "id": "ch1-fc005", "type": "flashcard", "difficulty": "easy",
            "front": "Que représente la sphère de Bloch ?",
            "back": "Représentation géométrique des états purs d'un qubit. Chaque point sur la sphère correspond à un état |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩.",
            "hint": "Visualisation d'un qubit",
            "section_ref": "1.3", "tags": ["Bloch", "visualisation", "flashcard"],
            "time_estimate": 60, "points": 1
        },
        {
            "id": "ch1-fc006", "type": "flashcard", "difficulty": "medium",
            "front": "Qu'est-ce que l'expérience des fentes d'Young démontre ?",
            "back": "Démontre la dualité onde-corpuscule : les quantons produisent des interférences (comportement ondulatoire) mais sont détectés individuellement (comportement corpusculaire).",
            "hint": "Interférences",
            "section_ref": "1.1", "tags": ["Young", "dualité", "flashcard"],
            "time_estimate": 75, "points": 2
        },

        # Chapitre 2 - 6 flashcards
        {
            "id": "ch2-fc001", "type": "flashcard", "difficulty": "easy",
            "front": "Qu'est-ce qu'une observable en mécanique quantique ?",
            "back": "Grandeur physique mesurable représentée par un opérateur hermitien. Ses valeurs propres sont les résultats possibles de mesure.",
            "hint": "Opérateur et mesure",
            "section_ref": "2.1", "tags": ["observable", "opérateur", "flashcard"],
            "time_estimate": 60, "points": 1
        },
        {
            "id": "ch2-fc002", "type": "flashcard", "difficulty": "medium",
            "front": "Énoncez le principe d'incertitude de Heisenberg",
            "back": "Impossibilité de mesurer simultanément avec précision deux observables conjuguées : Δx·Δp ≥ ℏ/2. Limite fondamentale, pas technique.",
            "hint": "Observables conjuguées",
            "section_ref": "2.4", "tags": ["Heisenberg", "incertitude", "flashcard"],
            "time_estimate": 75, "points": 2
        },
        {
            "id": "ch2-fc003", "type": "flashcard", "difficulty": "medium",
            "front": "Que signifie pour deux opérateurs de commuter ?",
            "back": "[Â,B̂] = ÂB̂ - B̂Â = 0. S'ils commutent, ils partagent une base propre commune et peuvent être mesurés simultanément avec précision.",
            "hint": "Mesures simultanées",
            "section_ref": "2.4", "tags": ["commutateur", "opérateurs", "flashcard"],
            "time_estimate": 75, "points": 2
        },
        {
            "id": "ch2-fc004", "type": "flashcard", "difficulty": "easy",
            "front": "Que mesure l'expérience de Stern-Gerlach ?",
            "back": "Mesure la composante du spin selon un axe choisi (généralement z). Démontre la quantification du moment cinétique intrinsèque des particules.",
            "hint": "Spin des particules",
            "section_ref": "2.3", "tags": ["Stern-Gerlach", "spin", "flashcard"],
            "time_estimate": 60, "points": 1
        },
        {
            "id": "ch2-fc005", "type": "flashcard", "difficulty": "medium",
            "front": "Quelles sont les matrices de Pauli ?",
            "back": "σₓ = [[0,1],[1,0]], σᵧ = [[0,-i],[i,0]], σ_z = [[1,0],[0,-1]]. Représentent les observables de spin-1/2 (Ŝ = ℏσ/2).",
            "hint": "Spin-1/2",
            "section_ref": "2.2", "tags": ["Pauli", "spin", "flashcard"],
            "time_estimate": 75, "points": 2
        },
        {
            "id": "ch2-fc006", "type": "flashcard", "difficulty": "hard",
            "front": "Qu'est-ce qu'un opérateur hermitien ?",
            "back": "Opérateur égal à son adjoint : Â† = Â. Propriétés : valeurs propres réelles, vecteurs propres orthogonaux. Représente les observables en MQ.",
            "hint": "Propriété des observables",
            "section_ref": "2.1", "tags": ["hermitien", "opérateurs", "flashcard"],
            "time_estimate": 90, "points": 3
        },

        # Chapitre 3 - 6 flashcards
        {
            "id": "ch3-fc001", "type": "flashcard", "difficulty": "medium",
            "front": "Qu'est-ce que la règle de Born ?",
            "back": "Probabilité de mesurer la valeur propre aₙ : P(aₙ) = |⟨φₙ|ψ⟩|² où |φₙ⟩ est le vecteur propre associé. Postulat 3 de la MQ.",
            "hint": "Probabilité de mesure",
            "section_ref": "3.2", "tags": ["Born", "mesure", "flashcard"],
            "time_estimate": 75, "points": 2
        },
        {
            "id": "ch3-fc002", "type": "flashcard", "difficulty": "easy",
            "front": "Qu'est-ce que l'équation de Schrödinger dépendante du temps ?",
            "back": "iℏ ∂|ψ⟩/∂t = Ĥ|ψ⟩. Décrit l'évolution temporelle d'un état quantique sous l'action du hamiltonien Ĥ.",
            "hint": "Évolution temporelle",
            "section_ref": "3.4", "tags": ["Schrödinger", "évolution", "flashcard"],
            "time_estimate": 60, "points": 1
        },
        {
            "id": "ch3-fc003", "type": "flashcard", "difficulty": "medium",
            "front": "Qu'est-ce qu'un état stationnaire ?",
            "back": "État propre du hamiltonien : Ĥ|ψₙ⟩ = Eₙ|ψₙ⟩. Évolution temporelle simple : |ψₙ(t)⟩ = e^(-iEₙt/ℏ)|ψₙ(0)⟩. Densité de probabilité constante.",
            "hint": "État propre de H",
            "section_ref": "3.5", "tags": ["stationnaire", "énergie", "flashcard"],
            "time_estimate": 75, "points": 2
        },
        {
            "id": "ch3-fc004", "type": "flashcard", "difficulty": "easy",
            "front": "Combien y a-t-il de postulats fondamentaux en mécanique quantique ?",
            "back": "5 postulats : 1) États dans Hilbert, 2) Observables hermitiens, 3) Mesure (Born), 4) Réduction du paquet d'ondes, 5) Évolution (Schrödinger).",
            "hint": "Fondements de la MQ",
            "section_ref": "3.1", "tags": ["postulats", "fondements", "flashcard"],
            "time_estimate": 60, "points": 1
        },
        {
            "id": "ch3-fc005", "type": "flashcard", "difficulty": "medium",
            "front": "Qu'est-ce que le postulat de la réduction du paquet d'ondes ?",
            "back": "Après mesure de Â donnant aₙ, l'état devient |φₙ⟩ (projection sur le sous-espace propre). Processus non-unitaire et instantané.",
            "hint": "Postulat 4",
            "section_ref": "3.3", "tags": ["mesure", "réduction", "flashcard"],
            "time_estimate": 75, "points": 2
        },
        {
            "id": "ch3-fc006", "type": "flashcard", "difficulty": "hard",
            "front": "Quelle est la différence entre équation de Schrödinger dépendante et indépendante du temps ?",
            "back": "Dépendante : iℏ∂ψ/∂t = Ĥψ (évolution). Indépendante : Ĥψ = Eψ (états propres). La seconde est la recherche de solutions stationnaires de la première.",
            "hint": "Deux formes de Schrödinger",
            "section_ref": "3.4-3.5", "tags": ["Schrödinger", "équations", "flashcard"],
            "time_estimate": 90, "points": 3
        },

        # Chapitre 4 - 8 flashcards
        {
            "id": "ch4-fc001", "type": "flashcard", "difficulty": "medium",
            "front": "Qu'est-ce que l'intrication quantique ?",
            "back": "Corrélation non-classique entre systèmes où l'état global ne peut pas se factoriser en produit d'états individuels. Ex: états de Bell.",
            "hint": "Corrélations quantiques",
            "section_ref": "4.1", "tags": ["intrication", "Bell", "flashcard"],
            "time_estimate": 75, "points": 2
        },
        {
            "id": "ch4-fc002", "type": "flashcard", "difficulty": "hard",
            "front": "Qu'est-ce que le paradoxe EPR ?",
            "back": "Einstein-Podolsky-Rosen (1935) : si MQ complète, alors action à distance (spooky). Conclu: MQ incomplète, variables cachées. Bell (1964) : non! MQ correcte, non-localité réelle.",
            "hint": "Einstein vs Bohr",
            "section_ref": "4.3", "tags": ["EPR", "non-localité", "flashcard"],
            "time_estimate": 90, "points": 3
        },
        {
            "id": "ch4-fc003", "type": "flashcard", "difficulty": "medium",
            "front": "Qu'est-ce que la téléportation quantique ?",
            "back": "Transfert d'un état quantique d'un qubit à un autre via intrication + communication classique. L'état original est détruit (no-cloning). Pas de transfert supraluminique.",
            "hint": "Transfert d'état",
            "section_ref": "4.4", "tags": ["téléportation", "information", "flashcard"],
            "time_estimate": 90, "points": 2
        },
        {
            "id": "ch4-fc004", "type": "flashcard", "difficulty": "easy",
            "front": "Qu'est-ce qu'un état de Bell ?",
            "back": "Un des 4 états maximalement intriqués à 2 qubits : Φ⁺, Φ⁻, Ψ⁺, Ψ⁻. Forment une base orthonormée. Ex: |Φ⁺⟩ = (|00⟩+|11⟩)/√2.",
            "hint": "Intrication maximale",
            "section_ref": "4.2", "tags": ["Bell", "intrication", "flashcard"],
            "time_estimate": 60, "points": 1
        },
        {
            "id": "ch4-fc005", "type": "flashcard", "difficulty": "hard",
            "front": "Qu'est-ce que le théorème de no-cloning ?",
            "back": "Impossible de créer une copie identique d'un état quantique inconnu. Conséquence de la linéarité de la MQ. Fondamental pour la sécurité quantique.",
            "hint": "Impossibilité de copie",
            "section_ref": "4.5", "tags": ["no-cloning", "information", "flashcard"],
            "time_estimate": 90, "points": 3
        },
        {
            "id": "ch4-fc006", "type": "flashcard", "difficulty": "medium",
            "front": "Que sont les inégalités de Bell ?",
            "back": "Inégalités satisfaites par toute théorie locale réaliste (variables cachées). La MQ les viole : CHSH ≤ 2 (classique) vs 2√2 (quantique). Preuve de la non-localité.",
            "hint": "Test de localité",
            "section_ref": "4.3", "tags": ["Bell", "non-localité", "flashcard"],
            "time_estimate": 90, "points": 3
        },
        {
            "id": "ch4-fc007", "type": "flashcard", "difficulty": "easy",
            "front": "Qu'est-ce que le produit tensoriel en MQ ?",
            "back": "Opération ⊗ qui combine des espaces d'états : |ψ⟩⊗|φ⟩. Pour 2 qubits, l'espace résultant a dimension 4. Base : {|00⟩,|01⟩,|10⟩,|11⟩}.",
            "hint": "Combiner des systèmes",
            "section_ref": "4.1", "tags": ["tensoriel", "multi-qubits", "flashcard"],
            "time_estimate": 60, "points": 1
        },
        {
            "id": "ch4-fc008", "type": "flashcard", "difficulty": "medium",
            "front": "Qu'est-ce qu'un état séparable vs intriqué ?",
            "back": "Séparable : |ψ⟩ = |ψ_A⟩⊗|ψ_B⟩ (pas de corrélations quantiques). Intriqué : ne peut pas s'écrire comme produit (corrélations non-classiques).",
            "hint": "Factorisation possible ?",
            "section_ref": "4.1", "tags": ["séparabilité", "intrication", "flashcard"],
            "time_estimate": 75, "points": 2
        },

        # Chapitre 5 - 4 flashcards
        {
            "id": "ch5-fc001", "type": "flashcard", "difficulty": "easy",
            "front": "Qu'est-ce qu'une fonction d'onde ?",
            "back": "Représentation d'un état quantique en espace continu : ψ(x,t). |ψ(x,t)|² = densité de probabilité de trouver la particule en x à l'instant t.",
            "hint": "Représentation continue",
            "section_ref": "5.1", "tags": ["fonction d'onde", "continu", "flashcard"],
            "time_estimate": 60, "points": 1
        },
        {
            "id": "ch5-fc002", "type": "flashcard", "difficulty": "medium",
            "front": "Qu'est-ce qu'un paquet d'ondes ?",
            "back": "Superposition d'ondes planes de fréquences/vecteurs d'onde différents. Localisé dans l'espace (Δx fini) et dans l'espace k (Δk fini). Obéit à Δx·Δk ≥ 1/2.",
            "hint": "Superposition localisée",
            "section_ref": "5.2", "tags": ["paquet d'ondes", "localisation", "flashcard"],
            "time_estimate": 75, "points": 2
        },
        {
            "id": "ch5-fc003", "type": "flashcard", "difficulty": "medium",
            "front": "Qu'est-ce que la transformée de Fourier en MQ ?",
            "back": "Relie les représentations position ψ(x) et impulsion φ(p) : φ(p) = ∫ψ(x)e^(-ipx/ℏ)dx. États x et p sont bases duales.",
            "hint": "Position ↔ Impulsion",
            "section_ref": "5.1", "tags": ["Fourier", "représentations", "flashcard"],
            "time_estimate": 75, "points": 2
        },
        {
            "id": "ch5-fc004", "type": "flashcard", "difficulty": "easy",
            "front": "Quelle est la relation de De Broglie ?",
            "back": "λ = h/p. Relie la longueur d'onde λ à l'impulsion p d'une particule. Fondement de la dualité onde-corpuscule.",
            "hint": "Longueur d'onde et impulsion",
            "section_ref": "5.1", "tags": ["De Broglie", "dualité", "flashcard"],
            "time_estimate": 60, "points": 1
        },

        # Chapitre 6 - 4 flashcards
        {
            "id": "ch6-fc001", "type": "flashcard", "difficulty": "medium",
            "front": "Qu'est-ce que l'énergie de point zéro ?",
            "back": "Énergie minimale E₀ = ℏω/2 du niveau fondamental de l'oscillateur harmonique. Conséquence du principe d'incertitude : particule ne peut être au repos au minimum du potentiel.",
            "hint": "Niveau fondamental",
            "section_ref": "6.2", "tags": ["point zéro", "oscillateur", "flashcard"],
            "time_estimate": 75, "points": 2
        },
        {
            "id": "ch6-fc002", "type": "flashcard", "difficulty": "medium",
            "front": "Que font les opérateurs de création et d'annihilation ?",
            "back": "â|n⟩ = √n|n-1⟩ (diminue de 1 quantum), â†|n⟩ = √(n+1)|n+1⟩ (augmente de 1 quantum). Simplifient énormément les calculs de l'oscillateur harmonique.",
            "hint": "Échelle d'états",
            "section_ref": "6.3", "tags": ["création", "annihilation", "flashcard"],
            "time_estimate": 75, "points": 2
        },
        {
            "id": "ch6-fc003", "type": "flashcard", "difficulty": "hard",
            "front": "Qu'est-ce qu'un état cohérent ?",
            "back": "État propre de â : â|α⟩ = α|α⟩. Superposition de tous les états |n⟩. Propriétés quasi-classiques : paquet d'ondes stable, minimise ΔxΔp. Important en optique quantique.",
            "hint": "État propre de a",
            "section_ref": "6.4", "tags": ["cohérent", "quasi-classique", "flashcard"],
            "time_estimate": 90, "points": 3
        },
        {
            "id": "ch6-fc004", "type": "flashcard", "difficulty": "easy",
            "front": "Quelle est la forme du potentiel de l'oscillateur harmonique ?",
            "back": "V(x) = (1/2)mω²x². Potentiel parabolique (parabole). Hamiltonien Ĥ = p̂²/2m + (1/2)mω²x̂².",
            "hint": "Potentiel parabolique",
            "section_ref": "6.1", "tags": ["oscillateur", "potentiel", "flashcard"],
            "time_estimate": 60, "points": 1
        }
    ]

    questions.extend(flashcards)
    return questions

def main():
    """Fonction principale"""
    print("🎯 Génération de 100 questions avancées...")
    print("=" * 60)

    # Génère les questions
    hotspot_questions = generate_hotspot_questions()
    drag_drop_questions = generate_drag_drop_questions()
    flashcard_questions = generate_flashcard_questions()

    all_new_questions = hotspot_questions + drag_drop_questions + flashcard_questions

    print(f"\n✅ Questions générées:")
    print(f"  - Hotspot: {len(hotspot_questions)}")
    print(f"  - Drag & Drop: {len(drag_drop_questions)}")
    print(f"  - Flashcard: {len(flashcard_questions)}")
    print(f"  - TOTAL: {len(all_new_questions)}")

    # Charge le JSON existant
    json_path = Path(__file__).parent.parent / "data" / "questions.json"

    print(f"\n📖 Lecture du fichier existant...")
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Ajoute les nouvelles questions à chaque chapitre
    print(f"\n📝 Ajout des questions aux chapitres...")

    # Répartition par chapitre
    questions_by_chapter = {1: [], 2: [], 3: [], 4: [], 5: [], 6: []}

    for q in all_new_questions:
        chapter_num = int(q['id'].split('-')[0].replace('ch', ''))
        questions_by_chapter[chapter_num].append(q)

    # Ajoute aux chapitres
    for chapter in data['chapters']:
        ch_id = chapter['chapter_id']
        if ch_id in questions_by_chapter:
            chapter['questions'].extend(questions_by_chapter[ch_id])
            print(f"  📚 Chapitre {ch_id}: +{len(questions_by_chapter[ch_id])} questions")

    # Calcule le nouveau total
    total_questions = sum(len(ch['questions']) for ch in data['chapters'])
    data['course_info']['total_questions'] = total_questions

    # Sauvegarde
    print(f"\n💾 Sauvegarde du fichier...")
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\n✅ TERMINÉ!")
    print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"📊 Total final: {total_questions} questions")
    print(f"✨ +{len(all_new_questions)} nouvelles questions ajoutées")
    print(f"🎉 8 types de questions maintenant disponibles!")

    return True

if __name__ == "__main__":
    main()
