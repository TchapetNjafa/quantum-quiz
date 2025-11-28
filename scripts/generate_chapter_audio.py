#!/usr/bin/env python3
"""
Script de génération des fichiers audio pour les chapitres
Utilise edge-tts (Microsoft Edge TTS) pour une meilleure qualité
et gTTS (Google TTS) en fallback
"""

import asyncio
import os
import sys

# Textes des résumés de chapitres (voix féminine chaleureuse)
CHAPTER_TEXTS = {
    1: """Bienvenue dans le premier chapitre sur les États Quantiques !

Nous allons découvrir ensemble les phénomènes fascinants de la mécanique quantique.
Vous apprendrez la dualité onde-corpuscule, comment une particule peut être à la fois une onde et un corpuscule.
Nous explorerons les interférences quantiques à travers l'expérience des fentes d'Young.
Vous découvrirez le concept de superposition d'états, où un système peut exister dans plusieurs états simultanément.
Nous introduirons les qubits, l'espace de Hilbert, et la magnifique sphère de Bloch.
Enfin, nous parlerons du célèbre chat de Schrödinger et du phénomène de décohérence.

Ce chapitre pose les bases fondamentales de votre voyage quantique. Bonne découverte !""",

    2: """Bienvenue dans le deuxième chapitre sur la Mesure et les Opérateurs !

La mesure en mécanique quantique est un concept fondamental et fascinant.
Vous apprendrez comment le processus de mesure affecte l'état d'un système quantique.
Nous étudierons les opérateurs hermitiens et leurs propriétés essentielles.
Vous découvrirez les observables physiques, les valeurs propres et les vecteurs propres.
Les célèbres matrices de Pauli vous seront présentées, ainsi que les commutateurs.
Nous explorerons le principe d'incertitude de Heisenberg, une des pierres angulaires de la physique quantique.
L'expérience de Stern-Gerlach illustrera magnifiquement ces concepts avec les mesures de spin.

Préparez-vous à comprendre comment nous observons le monde quantique !""",

    3: """Bienvenue dans le troisième chapitre sur la Dynamique Quantique et les Postulats !

Ce chapitre est le cœur de la mécanique quantique.
Vous découvrirez les cinq postulats fondamentaux qui régissent le monde quantique.
L'équation de Schrödinger, dans ses formes dépendante et indépendante du temps, sera votre nouvel outil.
Nous étudierons l'hamiltonien, l'opérateur central de l'évolution temporelle.
Vous comprendrez la conservation de la probabilité et les états stationnaires.
La règle de Born vous expliquera comment calculer les probabilités de mesure.
Nous discuterons aussi de la réduction du paquet d'onde lors d'une mesure.

Ces postulats sont les fondations sur lesquelles repose toute la physique quantique moderne. Courage !""",

    4: """Bienvenue dans le quatrième chapitre sur les Systèmes Multi-Qubits et l'Intrication !

Préparez-vous à découvrir les phénomènes les plus mystérieux de la physique quantique.
Nous commencerons par le produit tensoriel, l'outil mathématique pour combiner les systèmes.
Vous apprendrez la différence entre états séparables et états intriqués.
Les célèbres états de Bell seront au programme, symboles de l'intrication maximale.
Nous explorerons le paradoxe E.P.R. et les inégalités de Bell qui ont révolutionné notre compréhension.
La téléportation quantique vous montrera comment transférer l'information quantique.
Nous aborderons aussi la cryptographie quantique et les bases du calcul quantique.

Ce chapitre ouvre la porte aux technologies quantiques du futur. Passionnant !""",

    5: """Bienvenue dans le cinquième chapitre sur la Fonction d'État et l'Espace Continu !

Nous allons maintenant étendre nos connaissances au-delà des systèmes discrets.
Vous découvrirez la transition vers l'espace continu et les fonctions d'onde.
L'équation de Schrödinger en représentation position sera votre nouveau terrain de jeu.
Nous étudierons les paquets d'ondes et leur propagation.
La particule libre et sa relation de dispersion seront analysées en détail.
Vous comprendrez comment on retrouve la limite classique à partir de la mécanique quantique.
La transformée de Fourier sera un outil mathématique essentiel dans ce chapitre.

Ces concepts vous permettront d'aborder des problèmes quantiques plus réalistes. En avant !""",

    6: """Bienvenue dans le sixième et dernier chapitre sur l'Oscillateur Harmonique Quantique !

Ce système est le paradigme de la physique quantique, présent partout dans la nature.
Vous découvrirez les opérateurs de création et d'annihilation, outils élégants et puissants.
Nous étudierons les états propres d'énergie et leurs propriétés remarquables.
Les fonctions d'onde de Hermite vous seront présentées avec leur beauté mathématique.
Les états cohérents, qui font le lien avec la physique classique, seront au programme.
Nous verrons les applications physiques : vibrations moléculaires, photons et phonons.

Ce chapitre vous ouvrira les portes de la spectroscopie et de l'optique quantique.
Félicitations pour avoir parcouru ce voyage fascinant dans le monde quantique !"""
}

# Dossier de sortie
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets", "audio", "chapters")


async def generate_with_edge_tts():
    """Génère les fichiers audio avec edge-tts (meilleure qualité)"""
    try:
        import edge_tts

        # Voix françaises féminines disponibles avec edge-tts
        # fr-FR-DeniseNeural est une voix féminine douce et chaleureuse
        VOICE = "fr-FR-DeniseNeural"

        print(f"🎙️ Utilisation de la voix: {VOICE}")
        print(f"📁 Dossier de sortie: {OUTPUT_DIR}")
        print("-" * 50)

        os.makedirs(OUTPUT_DIR, exist_ok=True)

        for chapter_num, text in CHAPTER_TEXTS.items():
            output_file = os.path.join(OUTPUT_DIR, f"chapter_{chapter_num}.mp3")
            print(f"⏳ Génération du chapitre {chapter_num}...", end=" ", flush=True)

            communicate = edge_tts.Communicate(text, VOICE)
            await communicate.save(output_file)

            # Vérifier la taille du fichier
            size = os.path.getsize(output_file) / 1024  # KB
            print(f"✅ ({size:.1f} KB)")

        print("-" * 50)
        print("🎉 Tous les fichiers audio ont été générés avec succès !")
        return True

    except ImportError:
        print("❌ edge-tts non disponible, utilisation de gTTS...")
        return False
    except Exception as e:
        print(f"❌ Erreur edge-tts: {e}")
        return False


def generate_with_gtts():
    """Génère les fichiers audio avec gTTS (Google TTS) en fallback"""
    try:
        from gtts import gTTS

        print("🎙️ Utilisation de Google TTS (gTTS)")
        print(f"📁 Dossier de sortie: {OUTPUT_DIR}")
        print("-" * 50)

        os.makedirs(OUTPUT_DIR, exist_ok=True)

        for chapter_num, text in CHAPTER_TEXTS.items():
            output_file = os.path.join(OUTPUT_DIR, f"chapter_{chapter_num}.mp3")
            print(f"⏳ Génération du chapitre {chapter_num}...", end=" ", flush=True)

            tts = gTTS(text=text, lang='fr', slow=False)
            tts.save(output_file)

            # Vérifier la taille du fichier
            size = os.path.getsize(output_file) / 1024  # KB
            print(f"✅ ({size:.1f} KB)")

        print("-" * 50)
        print("🎉 Tous les fichiers audio ont été générés avec succès !")
        return True

    except ImportError:
        print("❌ gTTS non disponible")
        return False
    except Exception as e:
        print(f"❌ Erreur gTTS: {e}")
        return False


async def main():
    print("=" * 50)
    print("🔊 GÉNÉRATION DES FICHIERS AUDIO DES CHAPITRES")
    print("   Quantum Quiz - PHY321")
    print("=" * 50)
    print()

    # Essayer d'abord edge-tts (meilleure qualité)
    success = await generate_with_edge_tts()

    # Si edge-tts échoue, utiliser gTTS
    if not success:
        success = generate_with_gtts()

    if not success:
        print("❌ Impossible de générer les fichiers audio.")
        print("   Installez edge-tts ou gTTS: pip install edge-tts gTTS")
        sys.exit(1)

    print()
    print("📂 Fichiers générés dans:", OUTPUT_DIR)
    print()

    # Lister les fichiers générés
    files = sorted(os.listdir(OUTPUT_DIR))
    print("📋 Fichiers générés:")
    for f in files:
        filepath = os.path.join(OUTPUT_DIR, f)
        size = os.path.getsize(filepath) / 1024
        print(f"   - {f} ({size:.1f} KB)")


if __name__ == "__main__":
    asyncio.run(main())
