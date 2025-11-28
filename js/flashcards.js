/**
 * QUANTUM QUIZ - Mode Flashcards avec Répétition Espacée
 * Système Leitner pour l'apprentissage optimisé
 */

const FlashcardsMode = {
    // Configuration des boîtes Leitner (jours avant révision)
    boxes: [
        { id: 1, interval: 1, name: 'À apprendre' },
        { id: 2, interval: 2, name: 'Révision J+2' },
        { id: 3, interval: 4, name: 'Révision J+4' },
        { id: 4, interval: 7, name: 'Révision J+7' },
        { id: 5, interval: 14, name: 'Maîtrisé' }
    ],

    // État
    cards: [],
    currentIndex: 0,
    isFlipped: false,
    questionsData: null,
    todayCards: [],
    sessionStats: { correct: 0, incorrect: 0 },

    /**
     * Initialisation
     */
    async init() {
        console.log('📚 FlashcardsMode init');
        await this.loadQuestions();
        this.loadCardStates();
        this.setupEventListeners();

        // Si sur la page flashcards, démarrer
        if (document.getElementById('flashcard-container')) {
            this.renderUI();
        }
    },

    /**
     * Charge les questions
     */
    async loadQuestions() {
        try {
            const response = await fetch('data/questions.json');
            this.questionsData = await response.json();
            this.generateFlashcards();
        } catch (error) {
            console.error('Erreur chargement questions:', error);
        }
    },

    /**
     * Génère des flashcards à partir des questions
     */
    generateFlashcards() {
        if (!this.questionsData) return;

        const allCards = [];

        this.questionsData.chapters.forEach(chapter => {
            chapter.questions.forEach(q => {
                // Utiliser les questions de type flashcard existantes
                if (q.type === 'flashcard' || (q.front && q.back)) {
                    allCards.push({
                        id: q.id,
                        front: q.front || q.question,
                        back: q.back || q.explanation,
                        chapter_id: chapter.chapter_id,
                        chapter_title: chapter.chapter_title,
                        tags: q.tags || []
                    });
                }
                // Convertir les QCM en flashcards
                else if (q.type === 'qcm' || q.type === 'vrai_faux') {
                    const correctAnswer = q.type === 'qcm'
                        ? q.options[q.correct_answer]
                        : (q.correct_answer ? 'Vrai' : 'Faux');

                    allCards.push({
                        id: q.id + '-fc',
                        front: q.question,
                        back: `<strong>Réponse:</strong> ${correctAnswer}
                               ${q.explanation ? `<br><br><strong>Explication:</strong> ${q.explanation}` : ''}`,
                        formula: q.formula,
                        chapter_id: chapter.chapter_id,
                        chapter_title: chapter.chapter_title,
                        tags: q.tags || []
                    });
                }
            });
        });

        this.cards = allCards;
        console.log(`📚 ${allCards.length} flashcards générées`);
    },

    /**
     * Charge l'état des cartes depuis localStorage
     */
    loadCardStates() {
        try {
            const saved = localStorage.getItem('flashcard_states');
            if (saved) {
                this.cardStates = JSON.parse(saved);
            } else {
                this.cardStates = {};
            }
        } catch (e) {
            this.cardStates = {};
        }
    },

    /**
     * Sauvegarde l'état des cartes
     */
    saveCardStates() {
        try {
            localStorage.setItem('flashcard_states', JSON.stringify(this.cardStates));
        } catch (e) {
            console.error('Erreur sauvegarde flashcards:', e);
        }
    },

    /**
     * Récupère l'état d'une carte
     */
    getCardState(cardId) {
        return this.cardStates[cardId] || {
            box: 1,
            lastReview: null,
            nextReview: new Date().toISOString().split('T')[0],
            reviewCount: 0
        };
    },

    /**
     * Met à jour l'état d'une carte après révision
     */
    updateCardState(cardId, correct) {
        const state = this.getCardState(cardId);
        const today = new Date().toISOString().split('T')[0];

        if (correct) {
            // Passer à la boîte suivante (max 5)
            state.box = Math.min(state.box + 1, 5);
        } else {
            // Retour à la boîte 1
            state.box = 1;
        }

        state.lastReview = today;
        state.reviewCount++;

        // Calculer la prochaine date de révision
        const boxConfig = this.boxes.find(b => b.id === state.box);
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + boxConfig.interval);
        state.nextReview = nextDate.toISOString().split('T')[0];

        this.cardStates[cardId] = state;
        this.saveCardStates();
    },

    /**
     * Récupère les cartes à réviser aujourd'hui
     */
    getCardsForToday(chapterId = null) {
        const today = new Date().toISOString().split('T')[0];

        return this.cards.filter(card => {
            // Filtre par chapitre si spécifié
            if (chapterId && card.chapter_id !== chapterId) {
                return false;
            }

            const state = this.getCardState(card.id);
            return state.nextReview <= today;
        });
    },

    /**
     * Récupère les statistiques
     */
    getStats() {
        const stats = {
            total: this.cards.length,
            byBox: [0, 0, 0, 0, 0, 0], // Index 0 non utilisé
            dueToday: 0,
            mastered: 0
        };

        this.cards.forEach(card => {
            const state = this.getCardState(card.id);
            stats.byBox[state.box]++;
            if (state.box === 5) stats.mastered++;

            const today = new Date().toISOString().split('T')[0];
            if (state.nextReview <= today) stats.dueToday++;
        });

        return stats;
    },

    /**
     * Configure les événements
     */
    setupEventListeners() {
        // Raccourcis clavier
        document.addEventListener('keydown', (e) => {
            if (!document.getElementById('flashcard-container')) return;

            switch (e.key) {
                case ' ':
                case 'Enter':
                    e.preventDefault();
                    this.flipCard();
                    break;
                case 'ArrowLeft':
                case '1':
                    if (this.isFlipped) this.markCard(false);
                    break;
                case 'ArrowRight':
                case '2':
                    if (this.isFlipped) this.markCard(true);
                    break;
            }
        });
    },

    /**
     * Démarre une session de révision
     */
    startSession(chapterId = null) {
        this.todayCards = this.getCardsForToday(chapterId);

        if (this.todayCards.length === 0) {
            this.showNoCardsMessage();
            return;
        }

        // Mélanger les cartes
        this.shuffleArray(this.todayCards);

        this.currentIndex = 0;
        this.isFlipped = false;
        this.sessionStats = { correct: 0, incorrect: 0 };

        this.showCurrentCard();
    },

    /**
     * Mélange un tableau
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    },

    /**
     * Affiche la carte actuelle
     */
    showCurrentCard() {
        const container = document.getElementById('flashcard-display');
        if (!container || this.currentIndex >= this.todayCards.length) {
            this.showSessionComplete();
            return;
        }

        const card = this.todayCards[this.currentIndex];
        this.isFlipped = false;

        container.innerHTML = `
            <div class="flashcard ${this.isFlipped ? 'flipped' : ''}" onclick="FlashcardsMode.flipCard()">
                <div class="flashcard-inner">
                    <div class="flashcard-front">
                        <div class="flashcard-chapter">
                            Chapitre ${card.chapter_id}: ${card.chapter_title}
                        </div>
                        <div class="flashcard-content">
                            ${card.front}
                        </div>
                        ${card.formula ? `<div class="flashcard-formula">${card.formula}</div>` : ''}
                        <div class="flashcard-hint">
                            Cliquez ou appuyez sur Espace pour retourner
                        </div>
                    </div>
                    <div class="flashcard-back">
                        <div class="flashcard-content">
                            ${card.back}
                        </div>
                    </div>
                </div>
            </div>

            <div class="flashcard-buttons hidden" id="response-buttons">
                <button class="btn btn-incorrect" onclick="FlashcardsMode.markCard(false)">
                    ❌ À revoir
                </button>
                <button class="btn btn-correct" onclick="FlashcardsMode.markCard(true)">
                    ✅ Connue
                </button>
            </div>

            <div class="flashcard-progress">
                ${this.currentIndex + 1} / ${this.todayCards.length}
            </div>
        `;

        // Rendre LaTeX
        if (window.MathJax) {
            MathJax.typesetPromise([container]).catch(err => console.error(err));
        }
    },

    /**
     * Retourne la carte
     */
    flipCard() {
        this.isFlipped = !this.isFlipped;

        const flashcard = document.querySelector('.flashcard');
        const buttons = document.getElementById('response-buttons');

        if (flashcard) {
            flashcard.classList.toggle('flipped', this.isFlipped);
        }

        if (buttons) {
            buttons.classList.toggle('hidden', !this.isFlipped);
        }

        // Son
        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.click();
        }
    },

    /**
     * Marque la carte comme connue ou à revoir
     */
    markCard(correct) {
        const card = this.todayCards[this.currentIndex];

        // Mettre à jour l'état
        this.updateCardState(card.id, correct);

        // Stats de session
        if (correct) {
            this.sessionStats.correct++;
        } else {
            this.sessionStats.incorrect++;
        }

        // Son
        if (typeof AudioSystem !== 'undefined') {
            correct ? AudioSystem.success() : AudioSystem.warning();
        }

        // Carte suivante
        this.currentIndex++;
        this.showCurrentCard();
    },

    /**
     * Affiche le message "pas de cartes"
     */
    showNoCardsMessage() {
        const container = document.getElementById('flashcard-display');
        if (!container) return;

        container.innerHTML = `
            <div class="no-cards-message">
                <div class="no-cards-icon">🎉</div>
                <h3>Bravo!</h3>
                <p>Vous avez révisé toutes vos cartes pour aujourd'hui.</p>
                <p>Revenez demain pour continuer votre apprentissage!</p>
                <button class="btn btn-primary" onclick="FlashcardsMode.startSession()">
                    Réviser toutes les cartes
                </button>
            </div>
        `;
    },

    /**
     * Affiche les résultats de session
     */
    showSessionComplete() {
        const container = document.getElementById('flashcard-display');
        if (!container) return;

        const total = this.sessionStats.correct + this.sessionStats.incorrect;
        const percent = total > 0 ? Math.round((this.sessionStats.correct / total) * 100) : 0;

        container.innerHTML = `
            <div class="session-complete">
                <div class="session-icon">${percent >= 80 ? '🌟' : percent >= 50 ? '👍' : '💪'}</div>
                <h3>Session terminée!</h3>
                <div class="session-stats">
                    <div class="stat-item">
                        <span class="stat-value">${this.sessionStats.correct}</span>
                        <span class="stat-label">Connues</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${this.sessionStats.incorrect}</span>
                        <span class="stat-label">À revoir</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${percent}%</span>
                        <span class="stat-label">Score</span>
                    </div>
                </div>
                <button class="btn btn-primary" onclick="FlashcardsMode.startSession()">
                    Nouvelle session
                </button>
            </div>
        `;

        // XP si gamification disponible
        if (typeof Gamification !== 'undefined') {
            Gamification.addXP(total * 5, 'Session flashcards');
        }
    },

    /**
     * Affiche l'interface complète
     */
    renderUI() {
        const stats = this.getStats();

        // Stats overview
        const statsContainer = document.getElementById('flashcard-stats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="stats-overview">
                    <div class="stat-card">
                        <div class="stat-icon">📚</div>
                        <div class="stat-value">${stats.total}</div>
                        <div class="stat-label">Total cartes</div>
                    </div>
                    <div class="stat-card highlight">
                        <div class="stat-icon">📅</div>
                        <div class="stat-value">${stats.dueToday}</div>
                        <div class="stat-label">À réviser</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">✅</div>
                        <div class="stat-value">${stats.mastered}</div>
                        <div class="stat-label">Maîtrisées</div>
                    </div>
                </div>

                <div class="leitner-boxes">
                    <h4>Boîtes Leitner</h4>
                    <div class="boxes-row">
                        ${this.boxes.map(box => `
                            <div class="leitner-box box-${box.id}">
                                <div class="box-count">${stats.byBox[box.id]}</div>
                                <div class="box-name">${box.name}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Bouton de démarrage
        const startBtn = document.getElementById('start-flashcards');
        if (startBtn) {
            startBtn.onclick = () => this.startSession();
            if (stats.dueToday === 0) {
                startBtn.textContent = 'Réviser toutes les cartes';
            } else {
                startBtn.textContent = `Réviser ${stats.dueToday} carte(s)`;
            }
        }
    }
};

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => FlashcardsMode.init());

// Export global
window.FlashcardsMode = FlashcardsMode;

console.log('✅ flashcards.js chargé');
