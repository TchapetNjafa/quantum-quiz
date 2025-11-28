#!/bin/bash
# =============================================================================
# QUANTUM QUIZ - SCRIPT DE DÉMARRAGE
# =============================================================================

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "═══════════════════════════════════════════════════════════"
echo "  🎓 QUANTUM QUIZ - PHY321"
echo "  Université de Yaoundé I"
echo "═══════════════════════════════════════════════════════════"
echo -e "${NC}"

# =============================================================================
# FONCTIONS UTILITAIRES
# =============================================================================

check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ Erreur: $1 n'est pas installé${NC}"
        echo -e "${YELLOW}   Installez-le avec: $2${NC}"
        exit 1
    fi
}

# =============================================================================
# VÉRIFICATIONS
# =============================================================================

echo -e "${BLUE}🔍 Vérification des prérequis...${NC}"

# Vérifier Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✓ Python installé: $PYTHON_VERSION${NC}"
else
    echo -e "${RED}❌ Python 3 n'est pas installé${NC}"
    exit 1
fi

# Vérifier Node.js (optionnel pour WebSocket)
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js installé: $NODE_VERSION${NC}"
    HAS_NODE=true
else
    echo -e "${YELLOW}⚠ Node.js non installé (mode WebSocket désactivé)${NC}"
    HAS_NODE=false
fi

# =============================================================================
# CHOIX DU MODE
# =============================================================================

echo ""
echo -e "${PURPLE}🎯 Choisissez le mode de démarrage:${NC}"
echo "1) Mode Local uniquement (sans serveur WebSocket)"
echo "2) Mode Complet (avec serveur WebSocket)"
echo ""
read -p "Votre choix (1 ou 2): " MODE_CHOICE

# =============================================================================
# MODE LOCAL
# =============================================================================

if [ "$MODE_CHOICE" = "1" ]; then
    echo ""
    echo -e "${BLUE}🚀 Démarrage en mode local...${NC}"

    # Déterminer le port
    PORT=${1:-8000}

    # Démarrer le serveur HTTP Python
    echo -e "${GREEN}✓ Serveur HTTP démarré sur http://localhost:$PORT${NC}"
    echo ""
    echo -e "${CYAN}📝 Instructions:${NC}"
    echo "   1. Ouvrez votre navigateur"
    echo "   2. Visitez: http://localhost:$PORT"
    echo "   3. Pour arrêter: Ctrl+C"
    echo ""
    echo -e "${YELLOW}ℹ Mode local: Les données sont stockées uniquement sur votre appareil${NC}"
    echo ""

    python3 -m http.server $PORT

# =============================================================================
# MODE COMPLET
# =============================================================================

elif [ "$MODE_CHOICE" = "2" ]; then
    echo ""

    # Vérifier Node.js
    if [ "$HAS_NODE" = false ]; then
        echo -e "${RED}❌ Node.js est requis pour le mode complet${NC}"
        echo -e "${YELLOW}   Installez Node.js depuis: https://nodejs.org/${NC}"
        exit 1
    fi

    # Vérifier les dépendances
    if [ ! -d "node_modules" ]; then
        echo -e "${BLUE}📦 Installation des dépendances...${NC}"
        npm install
    fi

    # Vérifier le fichier .env
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}⚠ Fichier .env non trouvé${NC}"
        echo -e "${BLUE}   Création depuis .env.example...${NC}"
        cp .env.example .env
        echo -e "${GREEN}✓ Fichier .env créé${NC}"
        echo -e "${YELLOW}   Vous pouvez l'éditer pour personnaliser la configuration${NC}"
    fi

    echo ""
    echo -e "${BLUE}🚀 Démarrage en mode complet...${NC}"
    echo ""

    # Démarrer le serveur WebSocket en arrière-plan
    echo -e "${GREEN}✓ Serveur WebSocket démarrant...${NC}"
    npm start &
    SERVER_PID=$!

    # Attendre que le serveur démarre
    sleep 2

    # Démarrer le serveur HTTP pour le frontend
    echo -e "${GREEN}✓ Serveur HTTP frontend démarrant...${NC}"
    python3 -m http.server 8000 &
    FRONTEND_PID=$!

    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ QUANTUM QUIZ DÉMARRÉ AVEC SUCCÈS !${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${PURPLE}🌐 URLs d'accès:${NC}"
    echo "   • Frontend:  http://localhost:8000"
    echo "   • Backend:   http://localhost:3000"
    echo "   • WebSocket: ws://localhost:3000"
    echo ""
    echo -e "${PURPLE}📄 Pages disponibles:${NC}"
    echo "   • Quiz:      http://localhost:8000/index.html"
    echo "   • Classement: http://localhost:8000/leaderboard.html"
    echo "   • Défis:     http://localhost:8000/challenges.html"
    echo "   • Profil:    http://localhost:8000/profile.html"
    echo "   • Animations: http://localhost:8000/animations-demo.html"
    echo ""
    echo -e "${YELLOW}⚠ Pour arrêter: Ctrl+C (ou fermez ce terminal)${NC}"
    echo ""

    # Fonction de nettoyage à l'arrêt
    cleanup() {
        echo ""
        echo -e "${BLUE}🛑 Arrêt des serveurs...${NC}"
        kill $SERVER_PID 2>/dev/null
        kill $FRONTEND_PID 2>/dev/null
        echo -e "${GREEN}✓ Serveurs arrêtés proprement${NC}"
        exit 0
    }

    # Capturer Ctrl+C
    trap cleanup SIGINT SIGTERM

    # Attendre indéfiniment
    wait

else
    echo -e "${RED}❌ Choix invalide${NC}"
    exit 1
fi
