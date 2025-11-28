/**
 * QUANTUM QUIZ - Mode Révision Ciblée
 * Permet de réviser les questions favorites, ratées ou difficiles
 */

const TargetedReview = {
    ERRORS_KEY: 'quantum_quiz_errors',

    /**
     * Initialisation
     */
    init() {
        this.errors = this.loadErrors();
        this.createReviewWidget();
        console.log('🎯 Révision ciblée initialisée');
    },

    /**
     * Charge les erreurs depuis localStorage
     */
    loadErrors() {
        try {
            const data = localStorage.getItem(this.ERRORS_KEY);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            return {};
        }
    },

    /**
     * Sauvegarde les erreurs
     */
    saveErrors() {
        try {
            localStorage.setItem(this.ERRORS_KEY, JSON.stringify(this.errors));
        } catch (e) {
            console.error('Erreur sauvegarde erreurs:', e);
        }
    },

    /**
     * Enregistre une erreur
     */
    recordError(questionId, questionData = {}) {
        if (!this.errors[questionId]) {
            this.errors[questionId] = {
                count: 0,
                lastError: null,
                chapter: questionData.chapter_id || this.extractChapter(questionId),
                difficulty: questionData.difficulty || 'medium'
            };
        }
        this.errors[questionId].count++;
        this.errors[questionId].lastError = new Date().toISOString();
        this.saveErrors();
    },

    /**
     * Marque une question comme maîtrisée (répondue correctement)
     */
    recordSuccess(questionId) {
        if (this.errors[questionId]) {
            // Réduit le compteur d'erreurs
            this.errors[questionId].count = Math.max(0, this.errors[questionId].count - 1);
            if (this.errors[questionId].count === 0) {
                delete this.errors[questionId];
            }
            this.saveErrors();
        }
    },

    /**
     * Extrait le numéro de chapitre depuis l'ID
     */
    extractChapter(questionId) {
        const match = questionId.match(/ch(\d+)/);
        return match ? parseInt(match[1]) : 1;
    },

    /**
     * Récupère les questions les plus ratées
     */
    getMostMissed(limit = 20) {
        return Object.entries(this.errors)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, limit)
            .map(([id]) => id);
    },

    /**
     * Récupère les erreurs récentes
     */
    getRecentErrors(days = 7) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        return Object.entries(this.errors)
            .filter(([, data]) => new Date(data.lastError) > cutoff)
            .map(([id]) => id);
    },

    /**
     * Récupère le nombre total d'erreurs
     */
    getTotalErrors() {
        return Object.keys(this.errors).length;
    },

    /**
     * Crée le widget de révision ciblée sur la page d'accueil
     */
    createReviewWidget() {
        // Ne créer que sur la page d'accueil
        if (!window.location.pathname.includes('index.html') && window.location.pathname !== '/') {
            return;
        }

        const container = document.querySelector('.quiz-config');
        if (!container) return;

        // Vérifier si le widget existe déjà
        if (document.querySelector('.targeted-review-widget')) return;

        const favCount = window.Favorites ? Favorites.getCount() : 0;
        const errorCount = this.getTotalErrors();

        // Ne pas afficher si aucune donnée
        if (favCount === 0 && errorCount === 0) return;

        const widget = document.createElement('div');
        widget.className = 'targeted-review-widget';
        widget.innerHTML = `
            <div class="container">
                <div class="review-card">
                    <h3 class="review-title">🎯 Révision Ciblée</h3>
                    <p class="review-subtitle">Révisez intelligemment en ciblant vos points faibles</p>

                    <div class="review-options">
                        ${favCount > 0 ? `
                        <button class="review-option" data-mode="favorites">
                            <span class="option-icon">⭐</span>
                            <div class="option-content">
                                <strong>Mes Favoris</strong>
                                <small>${favCount} question${favCount > 1 ? 's' : ''}</small>
                            </div>
                            <span class="option-arrow">→</span>
                        </button>
                        ` : ''}

                        ${errorCount > 0 ? `
                        <button class="review-option" data-mode="errors">
                            <span class="option-icon">❌</span>
                            <div class="option-content">
                                <strong>Mes Erreurs</strong>
                                <small>${errorCount} question${errorCount > 1 ? 's' : ''} à revoir</small>
                            </div>
                            <span class="option-arrow">→</span>
                        </button>
                        ` : ''}

                        <button class="review-option" data-mode="difficult">
                            <span class="option-icon">🔥</span>
                            <div class="option-content">
                                <strong>Questions Difficiles</strong>
                                <small>Niveau avancé uniquement</small>
                            </div>
                            <span class="option-arrow">→</span>
                        </button>

                        <button class="review-option" data-mode="weak-chapters">
                            <span class="option-icon">📊</span>
                            <div class="option-content">
                                <strong>Points Faibles</strong>
                                <small>Chapitres à améliorer</small>
                            </div>
                            <span class="option-arrow">→</span>
                        </button>
                    </div>

                    ${favCount > 0 ? `
                    <button class="btn-export-favorites">
                        📄 Exporter mes favoris en PDF
                    </button>
                    ` : ''}
                </div>
            </div>
        `;

        // Insérer après la section de configuration
        container.insertAdjacentElement('afterend', widget);

        // Ajouter les événements
        this.setupWidgetEvents(widget);
    },

    /**
     * Configure les événements du widget
     */
    setupWidgetEvents(widget) {
        // Boutons de révision
        widget.querySelectorAll('.review-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                this.startReview(mode);
            });
        });

        // Export PDF des favoris
        const exportBtn = widget.querySelector('.btn-export-favorites');
        if (exportBtn) {
            exportBtn.addEventListener('click', async () => {
                exportBtn.disabled = true;
                exportBtn.textContent = '⏳ Génération...';

                try {
                    await this.exportFavoritesPDF();
                    exportBtn.textContent = '✅ PDF téléchargé !';
                    setTimeout(() => {
                        exportBtn.textContent = '📄 Exporter mes favoris en PDF';
                        exportBtn.disabled = false;
                    }, 2000);
                } catch (e) {
                    exportBtn.textContent = '❌ Erreur';
                    setTimeout(() => {
                        exportBtn.textContent = '📄 Exporter mes favoris en PDF';
                        exportBtn.disabled = false;
                    }, 2000);
                }
            });
        }
    },

    /**
     * Démarre une session de révision
     */
    async startReview(mode) {
        let questionIds = [];

        switch (mode) {
            case 'favorites':
                if (window.Favorites) {
                    questionIds = Favorites.getIds();
                }
                break;

            case 'errors':
                questionIds = this.getMostMissed(20);
                break;

            case 'difficult':
                // Sera géré par le quiz-engine avec le filtre de difficulté
                this.startDifficultReview();
                return;

            case 'weak-chapters':
                this.showWeakChaptersModal();
                return;
        }

        if (questionIds.length === 0) {
            alert('Aucune question disponible pour ce mode de révision.');
            return;
        }

        // Stocker la configuration dans sessionStorage
        const config = {
            mode: 'learning',
            reviewMode: mode,
            questionIds: questionIds,
            count: Math.min(questionIds.length, 20),
            difficulty: ['easy', 'medium', 'hard'],
            types: ['qcm', 'vrai_faux', 'matching', 'numerical', 'interpretation', 'hotspot', 'drag_drop', 'flashcard']
        };

        sessionStorage.setItem('quizConfig', JSON.stringify(config));
        window.location.href = 'quiz.html';
    },

    /**
     * Démarre une révision des questions difficiles
     */
    startDifficultReview() {
        const config = {
            chapter: 'all',
            mode: 'learning',
            count: 20,
            difficulty: ['hard'],
            types: ['qcm', 'vrai_faux', 'matching', 'numerical', 'interpretation', 'hotspot', 'drag_drop', 'flashcard']
        };

        sessionStorage.setItem('quizConfig', JSON.stringify(config));
        window.location.href = 'quiz.html';
    },

    /**
     * Affiche la modal des chapitres faibles
     */
    showWeakChaptersModal() {
        // Calculer les statistiques par chapitre
        const stats = this.getChapterStats();

        if (Object.keys(stats).length === 0) {
            alert('Pas assez de données. Complétez quelques quiz d\'abord !');
            return;
        }

        // Trier par taux d'erreur (le plus faible en premier)
        const sorted = Object.entries(stats)
            .filter(([, data]) => data.total >= 3) // Au moins 3 questions répondues
            .sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total));

        if (sorted.length === 0) {
            alert('Pas assez de données. Répondez à plus de questions !');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'weak-chapters-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>📊 Vos Points Faibles</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Chapitres triés par taux de réussite (du plus faible au plus fort)</p>
                    <div class="chapters-list">
                        ${sorted.map(([chapter, data]) => {
                            const rate = Math.round((data.correct / data.total) * 100);
                            const color = rate >= 80 ? 'green' : rate >= 60 ? 'orange' : 'red';
                            return `
                                <button class="chapter-item" data-chapter="${chapter}">
                                    <span class="chapter-name">Chapitre ${chapter}</span>
                                    <div class="chapter-stats">
                                        <span class="chapter-rate" style="color: ${color}">${rate}%</span>
                                        <small>${data.correct}/${data.total}</small>
                                    </div>
                                    <span class="chapter-arrow">→</span>
                                </button>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);

        // Événements
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
            }
        });

        modal.querySelectorAll('.chapter-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const chapter = btn.dataset.chapter;
                this.startChapterReview(chapter);
                modal.remove();
            });
        });
    },

    /**
     * Démarre une révision d'un chapitre spécifique
     */
    startChapterReview(chapter) {
        const config = {
            chapter: chapter,
            mode: 'learning',
            count: 20,
            difficulty: ['easy', 'medium', 'hard'],
            types: ['qcm', 'vrai_faux', 'matching', 'numerical', 'interpretation', 'hotspot', 'drag_drop', 'flashcard']
        };

        sessionStorage.setItem('quizConfig', JSON.stringify(config));
        window.location.href = 'quiz.html';
    },

    /**
     * Calcule les statistiques par chapitre
     */
    getChapterStats() {
        const stats = {};

        // Récupérer l'historique des quiz
        try {
            const history = JSON.parse(localStorage.getItem('quantum_quiz_history') || '[]');
            history.forEach(session => {
                if (session.details) {
                    session.details.forEach(detail => {
                        const chapter = detail.question?.chapter_id || this.extractChapter(detail.question?.id || '');
                        if (!stats[chapter]) {
                            stats[chapter] = { correct: 0, total: 0 };
                        }
                        stats[chapter].total++;
                        if (detail.isCorrect) {
                            stats[chapter].correct++;
                        }
                    });
                }
            });
        } catch (e) {
            console.error('Erreur lecture historique:', e);
        }

        // Ajouter les erreurs enregistrées
        Object.entries(this.errors).forEach(([id, data]) => {
            const chapter = data.chapter;
            if (!stats[chapter]) {
                stats[chapter] = { correct: 0, total: 0 };
            }
            stats[chapter].total += data.count;
            // Les erreurs ne comptent pas comme correctes
        });

        return stats;
    },

    /**
     * Exporte les favoris en PDF
     */
    async exportFavoritesPDF() {
        if (!window.Favorites || Favorites.getCount() === 0) {
            throw new Error('Aucun favori');
        }

        // Charger les questions
        const response = await fetch('data/questions.json');
        const data = await response.json();

        const favoriteIds = Favorites.getIds();
        const questions = [];

        data.chapters.forEach(chapter => {
            chapter.questions.forEach(q => {
                if (favoriteIds.includes(q.id)) {
                    questions.push({ ...q, chapter_id: chapter.chapter_id });
                }
            });
        });

        if (window.PDFExport) {
            await PDFExport.exportFavorites(questions);
        } else {
            throw new Error('Module PDF non disponible');
        }
    }
};

// CSS pour le widget
const targetedReviewStyles = document.createElement('style');
targetedReviewStyles.textContent = `
    .targeted-review-widget {
        padding: 2rem 0;
        background: linear-gradient(135deg, rgba(124, 58, 237, 0.05), rgba(6, 182, 212, 0.05));
    }

    .review-card {
        background: var(--bg-card, #1e293b);
        border: 1px solid var(--border-primary, #334155);
        border-radius: 16px;
        padding: 2rem;
        max-width: 800px;
        margin: 0 auto;
    }

    .review-title {
        font-size: 1.5rem;
        margin: 0 0 0.5rem 0;
        color: var(--text-primary, #f8fafc);
    }

    .review-subtitle {
        color: var(--text-muted, #94a3b8);
        margin: 0 0 1.5rem 0;
    }

    .review-options {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
    }

    .review-option {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: var(--bg-secondary, #334155);
        border: 1px solid var(--border-primary, #475569);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s;
        text-align: left;
    }

    .review-option:hover {
        border-color: var(--quantum-purple, #7c3aed);
        transform: translateX(5px);
    }

    .option-icon {
        font-size: 2rem;
        flex-shrink: 0;
    }

    .option-content {
        flex: 1;
    }

    .option-content strong {
        display: block;
        color: var(--text-primary, #f8fafc);
        font-size: 1rem;
        margin-bottom: 0.25rem;
    }

    .option-content small {
        color: var(--text-muted, #94a3b8);
        font-size: 0.85rem;
    }

    .option-arrow {
        color: var(--quantum-purple, #7c3aed);
        font-size: 1.2rem;
        opacity: 0;
        transition: opacity 0.3s;
    }

    .review-option:hover .option-arrow {
        opacity: 1;
    }

    .btn-export-favorites {
        width: 100%;
        padding: 0.75rem;
        background: var(--bg-secondary, #334155);
        border: 1px dashed var(--border-primary, #475569);
        border-radius: 8px;
        color: var(--text-secondary, #cbd5e1);
        cursor: pointer;
        transition: all 0.3s;
        font-size: 0.9rem;
    }

    .btn-export-favorites:hover {
        background: var(--bg-tertiary, #475569);
        border-style: solid;
    }

    /* Modal chapitres faibles */
    .weak-chapters-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s;
    }

    .weak-chapters-modal.show {
        opacity: 1;
    }

    .weak-chapters-modal .modal-content {
        background: var(--bg-card, #1e293b);
        border: 1px solid var(--border-primary, #334155);
        border-radius: 16px;
        width: 90%;
        max-width: 500px;
        max-height: 80vh;
        overflow: hidden;
        transform: scale(0.9);
        transition: transform 0.3s;
    }

    .weak-chapters-modal.show .modal-content {
        transform: scale(1);
    }

    .weak-chapters-modal .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid var(--border-primary, #334155);
    }

    .weak-chapters-modal .modal-header h3 {
        margin: 0;
        color: var(--text-primary, #f8fafc);
    }

    .weak-chapters-modal .modal-close {
        background: none;
        border: none;
        color: var(--text-muted, #94a3b8);
        font-size: 1.5rem;
        cursor: pointer;
    }

    .weak-chapters-modal .modal-body {
        padding: 1.5rem;
        overflow-y: auto;
        max-height: 60vh;
    }

    .weak-chapters-modal .modal-body p {
        color: var(--text-muted, #94a3b8);
        margin: 0 0 1rem 0;
        font-size: 0.9rem;
    }

    .chapters-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .chapter-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem 1rem;
        background: var(--bg-secondary, #334155);
        border: 1px solid var(--border-primary, #475569);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
    }

    .chapter-item:hover {
        border-color: var(--quantum-purple, #7c3aed);
    }

    .chapter-name {
        flex: 1;
        color: var(--text-primary, #f8fafc);
        font-weight: 500;
    }

    .chapter-stats {
        text-align: right;
    }

    .chapter-rate {
        font-weight: 700;
        font-size: 1.1rem;
    }

    .chapter-stats small {
        display: block;
        color: var(--text-muted, #94a3b8);
        font-size: 0.8rem;
    }

    .chapter-arrow {
        color: var(--quantum-purple, #7c3aed);
        opacity: 0.5;
    }

    .chapter-item:hover .chapter-arrow {
        opacity: 1;
    }

    @media (max-width: 600px) {
        .review-options {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(targetedReviewStyles);

// Initialisation
document.addEventListener('DOMContentLoaded', () => TargetedReview.init());

// Export global
window.TargetedReview = TargetedReview;

console.log('✅ targeted-review.js chargé');
