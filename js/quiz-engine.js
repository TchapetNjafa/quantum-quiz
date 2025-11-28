/**
 * Moteur principal du quiz
 */

const QuizEngine = {
    config: null,
    questions: [],
    currentIndex: 0,
    answers: [],
    startTime: null,
    timer: null,

    // Initialise le quiz
    async init() {
        console.log('Initialisation du quiz...');

        // Récupère la configuration du quiz
        const configStr = sessionStorage.getItem('quiz_config');
        if (!configStr) {
            showToast('Erreur : configuration du quiz introuvable', 'error');
            setTimeout(() => window.location.href = 'index.html', 2000);
            return;
        }

        this.config = JSON.parse(configStr);
        console.log('Configuration:', this.config);

        // Charge les questions
        await this.loadQuestions();

        // Configure l'interface
        this.setupUI();

        // Démarre le quiz
        this.startTime = Date.now();
        this.showQuestion(0);

        console.log('Quiz démarré avec', this.questions.length, 'questions');
    },

    // Charge les questions depuis le JSON
    async loadQuestions() {
        try {
            // Si questions personnalisées fournies (mode "retry errors")
            if (this.config.customQuestions && this.config.customQuestions.length > 0) {
                console.log('Utilisation des questions personnalisées:', this.config.customQuestions.length);
                this.questions = this.config.customQuestions;
                return;
            }

            const response = await fetch('data/questions.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Données chargées:', data);

            // Mode révision ciblée : sélectionner par IDs spécifiques
            if (this.config.questionIds && this.config.questionIds.length > 0) {
                console.log('🎯 Mode révision ciblée:', this.config.questionIds.length, 'questions');
                const allQuestions = [];
                data.chapters.forEach(ch => {
                    ch.questions.forEach(q => {
                        if (this.config.questionIds.includes(q.id)) {
                            allQuestions.push({ ...q, chapter_id: ch.chapter_id });
                        }
                    });
                });

                // Mélange les questions
                this.questions = this.shuffleArray(allQuestions).slice(0, this.config.count || 20);
                console.log('Questions sélectionnées:', this.questions.length);
                return;
            }

            // Sélectionne les questions selon la configuration
            let allQuestions = [];

            if (this.config.chapter === 'all') {
                // Toutes les questions de tous les chapitres
                data.chapters.forEach(ch => {
                    allQuestions.push(...ch.questions);
                });
            } else {
                // Questions d'un chapitre spécifique
                const chapter = data.chapters.find(ch => ch.chapter_id === parseInt(this.config.chapter));
                if (chapter) {
                    allQuestions = [...chapter.questions];
                } else {
                    throw new Error('Chapitre introuvable');
                }
            }

            // Filtre par difficulté
            if (this.config.difficulties && this.config.difficulties.length > 0) {
                allQuestions = allQuestions.filter(q =>
                    this.config.difficulties.includes(q.difficulty)
                );
            }

            // Filtre par type de question
            if (this.config.questionTypes && this.config.questionTypes.length > 0) {
                allQuestions = allQuestions.filter(q => {
                    const questionType = getQuestionType(q);
                    return this.config.questionTypes.includes(questionType);
                });
            }

            // Élimine les doublons (utiliser l'ID comme clé unique)
            const uniqueQuestions = [];
            const seenIds = new Set();

            for (const q of allQuestions) {
                if (q.id && !seenIds.has(q.id)) {
                    seenIds.add(q.id);
                    uniqueQuestions.push(q);
                } else if (!q.id) {
                    // Si pas d'ID, on garde quand même la question (rare)
                    console.warn('Question sans ID détectée:', q.question?.substring(0, 50));
                    uniqueQuestions.push(q);
                }
            }

            console.log(`📊 Questions après déduplication: ${uniqueQuestions.length}/${allQuestions.length}`);

            if (uniqueQuestions.length === 0) {
                throw new Error('Aucune question trouvée avec ces critères');
            }

            // Récupère les questions récemment utilisées pour les éviter
            const recentQuestions = this.getRecentQuestions();

            // Sépare les questions en "fraîches" et "récentes"
            const freshQuestions = uniqueQuestions.filter(q => !recentQuestions.includes(q.id));
            const recentOnes = uniqueQuestions.filter(q => recentQuestions.includes(q.id));

            // Priorité aux questions fraîches, puis mélange des récentes
            const shuffledFresh = shuffleArray(freshQuestions);
            const shuffledRecent = shuffleArray(recentOnes);

            // Combine: d'abord les fraîches, puis les récentes si besoin
            const orderedQuestions = [...shuffledFresh, ...shuffledRecent];

            // Limite au nombre demandé
            const requestedCount = Math.min(this.config.questionCount, orderedQuestions.length);
            this.questions = orderedQuestions.slice(0, requestedCount);

            // Sauvegarde les IDs des questions utilisées
            this.saveUsedQuestions(this.questions.map(q => q.id));

            console.log(`✅ Quiz final: ${this.questions.length} questions (${shuffledFresh.length} fraîches, ${Math.min(requestedCount - shuffledFresh.length, shuffledRecent.length)} récentes)`);

            if (this.questions.length === 0) {
                throw new Error('Aucune question trouvée avec ces critères');
            }

        } catch (error) {
            console.error('Erreur chargement questions:', error);
            showToast(`Erreur : ${error.message}`, 'error');
            setTimeout(() => window.location.href = 'index.html', 2000);
        }
    },

    // Configure l'interface
    setupUI() {
        // Met à jour l'en-tête du quiz avec le chapitre correct
        try {
            this.updateQuizHeader();
        } catch (error) {
            console.error('Erreur updateQuizHeader:', error);
        }

        // Barre de progression
        this.updateProgress();

        // Bouton Quitter
        const quitBtn = document.getElementById('quit-quiz');
        if (quitBtn) {
            quitBtn.addEventListener('click', () => {
                const confirmQuit = confirm('Voulez-vous vraiment quitter ce quiz ?\n\nVotre progression sera perdue.');
                if (confirmQuit) {
                    if (typeof AudioSystem !== 'undefined') AudioSystem.click();
                    window.location.href = 'index.html';
                }
            });
        }

        // Boutons de navigation
        document.getElementById('prev-btn')?.addEventListener('click', () => this.previousQuestion());
        document.getElementById('next-btn')?.addEventListener('click', () => this.nextQuestion());
        document.getElementById('submit-btn')?.addEventListener('click', () => this.submitQuiz());

        // Bouton Raccourcis
        const shortcutsBtn = document.getElementById('toggle-shortcuts');
        const shortcutsHelp = document.getElementById('shortcuts-help');
        if (shortcutsBtn && shortcutsHelp) {
            shortcutsBtn.addEventListener('click', () => {
                const isVisible = shortcutsHelp.style.display !== 'none';
                shortcutsHelp.style.display = isVisible ? 'none' : 'block';
                shortcutsBtn.textContent = isVisible ? '⌨️ Raccourcis (H)' : '❌ Fermer (H)';
                if (typeof AudioSystem !== 'undefined') AudioSystem.click();
            });
        }

        // Raccourcis clavier
        document.addEventListener('keydown', (e) => {
            // Ne pas interférer avec les champs de saisie
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (e.key === 'ArrowLeft') this.previousQuestion();
            if (e.key === 'ArrowRight') this.nextQuestion();

            // Touche H pour afficher/masquer les raccourcis
            if (e.key === 'h' || e.key === 'H') {
                shortcutsBtn?.click();
            }
        });

        // Timer (mode examen)
        if (this.config.mode === 'exam' && this.config.timeLimit) {
            this.startTimer(this.config.timeLimit);
        }
    },

    // Met à jour l'en-tête du quiz avec le chapitre sélectionné
    updateQuizHeader() {
        if (!this.config) {
            console.warn('Config non disponible pour updateQuizHeader');
            return;
        }

        const chapterTitleEl = document.getElementById('quiz-chapter-title');
        const modeBadgeEl = document.getElementById('quiz-mode-badge');

        if (chapterTitleEl && this.config.chapter) {
            let chapterText = '';
            const chapter = String(this.config.chapter); // Force en string

            if (chapter === 'all') {
                chapterText = 'Révision Globale - Tous les Chapitres';
            } else if (chapter === 'custom') {
                chapterText = 'Quiz Personnalisé - Révision des Erreurs';
            } else {
                // Map des numéros de chapitre vers leurs noms complets
                const chapterNames = {
                    '1': 'Chapitre 1 : États Quantiques',
                    '2': 'Chapitre 2 : Mesure et Opérateurs',
                    '3': 'Chapitre 3 : Dynamique Quantique - Les Postulats',
                    '4': 'Chapitre 4 : Systèmes Multi-Qubits et Intrication',
                    '5': 'Chapitre 5 : Fonction d\'État et Espace Continu',
                    '6': 'Chapitre 6 : Oscillateur Harmonique Quantique'
                };
                chapterText = chapterNames[chapter] || 'Chapitre 1 : États Quantiques';
            }
            chapterTitleEl.textContent = chapterText;
            console.log('✅ En-tête du quiz mis à jour:', chapterText);
        }

        if (modeBadgeEl && this.config.mode) {
            const modeText = this.config.mode === 'learning' ? 'Mode Entraînement' : 'Mode Examen';
            modeBadgeEl.textContent = modeText;
        }
    },

    // Affiche une question
    async showQuestion(index) {
        if (index < 0 || index >= this.questions.length) return;

        this.currentIndex = index;
        const question = this.questions[index];

        console.log(`Affichage question ${index + 1}/${this.questions.length}:`, question);

        // Met à jour l'affichage
        document.getElementById('question-number').textContent = `Question ${index + 1} / ${this.questions.length}`;

        // Rend la question
        const container = document.getElementById('question-content');
        await QuestionRenderer.render(question, container, 'quiz');

        // Restaure la réponse précédente si elle existe
        if (this.answers[index]) {
            this.restoreAnswer(index);
        }

        // Met à jour les boutons
        this.updateButtons();
        this.updateProgress();

        // Scroll en haut
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // Question suivante
    nextQuestion() {
        // Sauvegarde la réponse actuelle
        this.saveCurrentAnswer();

        if (this.currentIndex < this.questions.length - 1) {
            if (typeof AudioSystem !== 'undefined') AudioSystem.navigate();
            this.showQuestion(this.currentIndex + 1);
        }
    },

    // Question précédente
    previousQuestion() {
        // Sauvegarde la réponse actuelle
        this.saveCurrentAnswer();

        if (this.currentIndex > 0) {
            if (typeof AudioSystem !== 'undefined') AudioSystem.navigate();
            this.showQuestion(this.currentIndex - 1);
        }
    },

    // Sauvegarde la réponse actuelle
    saveCurrentAnswer() {
        const container = document.getElementById('question-content').querySelector('.answer-area');
        const question = this.questions[this.currentIndex];
        const answer = QuestionRenderer.getUserAnswer(container, question);

        // Vérifier si c'est une nouvelle réponse (pas déjà répondue)
        const isNewAnswer = this.answers[this.currentIndex] === undefined ||
                            this.answers[this.currentIndex] === null;

        this.answers[this.currentIndex] = answer;
        if (typeof logger !== 'undefined') {
            logger.debug(`Réponse sauvegardée pour Q${this.currentIndex + 1}:`, answer);
        }

        // En mode apprentissage, jouer un son de feedback lors de la première réponse
        if (isNewAnswer && answer !== undefined && answer !== null && answer !== '') {
            if (this.config.mode === 'learning') {
                const check = QuestionRenderer.checkAnswer(answer, question);
                this.showFeedbackSound(check.correct);
            }
        }

        // Mettre à jour les statistiques en temps réel
        this.updateLiveStats();
    },

    // Joue le son de feedback approprié
    showFeedbackSound(isCorrect) {
        if (typeof AudioSystem !== 'undefined') {
            if (isCorrect) {
                AudioSystem.correct();
            } else {
                AudioSystem.incorrect();
            }
        }
    },

    // Met à jour les statistiques en temps réel (correct/incorrect/score) - OPTIMISÉ
    updateLiveStats() {
        // Utiliser un cache pour éviter de recalculer tout à chaque fois
        if (!this.statsCache) {
            this.statsCache = {
                correctCount: 0,
                incorrectCount: 0,
                answeredCount: 0,
                lastIndex: -1
            };
        }

        // Si on a déjà calculé cette question, ne rien faire
        if (this.currentIndex === this.statsCache.lastIndex) {
            return;
        }

        // Calculer seulement la nouvelle réponse
        const answer = this.answers[this.currentIndex];
        if (answer !== undefined && answer !== null && answer !== '') {
            const question = this.questions[this.currentIndex];
            const check = QuestionRenderer.checkAnswer(answer, question);

            // Si c'était déjà répondu, on ajuste
            if (this.statsCache.lastIndex >= 0) {
                const oldAnswer = this.answers[this.statsCache.lastIndex];
                if (oldAnswer !== undefined && oldAnswer !== null && oldAnswer !== '') {
                    // Réponse modifiée - recalculer tout (rare)
                    this.recalculateAllStats();
                    return;
                }
            }

            this.statsCache.answeredCount++;
            if (check.correct) {
                this.statsCache.correctCount++;
            } else {
                this.statsCache.incorrectCount++;
            }
        }

        this.statsCache.lastIndex = this.currentIndex;

        // Calculer le score
        const scorePercent = this.statsCache.answeredCount > 0
            ? Math.round((this.statsCache.correctCount / this.statsCache.answeredCount) * 100)
            : 0;

        // Mettre à jour l'affichage sans animation excessive
        const correctElement = document.getElementById('correct-count');
        const incorrectElement = document.getElementById('incorrect-count');
        const scoreElement = document.getElementById('current-score');

        if (correctElement) correctElement.textContent = this.statsCache.correctCount;
        if (incorrectElement) incorrectElement.textContent = this.statsCache.incorrectCount;
        if (scoreElement) scoreElement.textContent = `${scorePercent}%`;
    },

    // Recalcule toutes les stats (uniquement si nécessaire)
    recalculateAllStats() {
        let correctCount = 0;
        let incorrectCount = 0;
        let answeredCount = 0;

        this.answers.forEach((answer, index) => {
            if (answer !== undefined && answer !== null && answer !== '') {
                answeredCount++;
                const question = this.questions[index];
                const check = QuestionRenderer.checkAnswer(answer, question);
                if (check.correct) correctCount++;
                else incorrectCount++;
            }
        });

        this.statsCache = {
            correctCount,
            incorrectCount,
            answeredCount,
            lastIndex: this.currentIndex
        };
    },

    // Restaure une réponse précédente
    restoreAnswer(index) {
        const answer = this.answers[index];
        if (!answer) return;

        const container = document.getElementById('question-content').querySelector('.answer-area');
        const question = this.questions[index];

        // Restaure selon le type
        switch (question.type) {
            case 'qcm': {
                const input = container.querySelector(`input[value="${answer}"]`);
                if (input) input.checked = true;
                break;
            }

            case 'vrai_faux': {
                const value = answer ? 'true' : 'false';
                const input = container.querySelector(`input[value="${value}"]`);
                if (input) input.checked = true;
                break;
            }

            case 'matching': {
                Object.keys(answer).forEach(index => {
                    const select = container.querySelector(`select[data-index="${index}"]`);
                    if (select) select.value = answer[index];
                });
                break;
            }

            case 'numerical': {
                const input = container.querySelector('#numerical-answer');
                if (input) input.value = answer;
                break;
            }

            case 'interpretation': {
                const textarea = container.querySelector('#interpretation-answer');
                if (textarea) textarea.value = answer;
                break;
            }
        }
    },

    // Met à jour les boutons de navigation
    updateButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const submitBtn = document.getElementById('submit-btn');

        if (prevBtn) prevBtn.disabled = (this.currentIndex === 0);

        if (this.currentIndex === this.questions.length - 1) {
            if (nextBtn) nextBtn.style.display = 'none';
            if (submitBtn) submitBtn.style.display = 'inline-flex';
        } else {
            if (nextBtn) nextBtn.style.display = 'inline-flex';
            if (submitBtn) submitBtn.style.display = 'none';
        }
    },

    // Met à jour la barre de progression
    updateProgress() {
        const progressBar = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        const progressPercentage = document.getElementById('progress-percentage');
        const answeredCountEl = document.getElementById('answered-count');
        const completionPercentageEl = document.getElementById('completion-percentage');

        const answeredCount = this.answers.filter(a => a !== null && a !== undefined).length;
        const percentage = Math.round((answeredCount / this.questions.length) * 100);

        // Barre de progression principale
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }

        // Texte de progression (Question X/Y)
        if (progressText) {
            progressText.textContent = `Question ${this.currentIndex + 1}/${this.questions.length}`;
        }

        // Pourcentage de progression
        if (progressPercentage) {
            progressPercentage.textContent = `${percentage}%`;
        }

        // Panneau latéral - nombre de questions répondues
        if (answeredCountEl) {
            answeredCountEl.textContent = `${answeredCount}/${this.questions.length}`;
        }

        // Panneau latéral - pourcentage de complétion
        if (completionPercentageEl) {
            completionPercentageEl.textContent = `${percentage}%`;
        }
    },

    // Démarre le chronomètre
    startTimer(duration) {
        const timerDisplay = document.getElementById('timer');
        if (!timerDisplay) return;

        let timeLeft = duration;

        this.timer = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = formatTime(timeLeft);

            if (timeLeft <= 60) {
                timerDisplay.classList.add('warning');
            }

            if (timeLeft <= 0) {
                clearInterval(this.timer);
                showToast('Temps écoulé !', 'warning');
                this.submitQuiz();
            }
        }, 1000);
    },

    // Soumet le quiz
    async submitQuiz() {
        // Sauvegarde la dernière réponse
        this.saveCurrentAnswer();

        // Vérifie que toutes les questions ont une réponse
        const unanswered = this.answers.filter(a => a === null || a === undefined).length;
        if (unanswered > 0) {
            if (typeof AudioSystem !== 'undefined') AudioSystem.warning();
            const confirm = window.confirm(
                `${unanswered} question(s) non répondue(s).\nVoulez-vous vraiment soumettre ?`
            );
            if (!confirm) return;
        }

        // Calcule les résultats
        const results = this.calculateResults();

        // Son de fin selon le score
        if (typeof AudioSystem !== 'undefined') {
            if (results.score >= 60) {
                AudioSystem.success();
            } else {
                AudioSystem.notify();
            }
        }

        // Sauvegarde dans le storage
        StorageManager.updateStats(results);
        StorageManager.addToHistory(results);

        // Stocke les résultats pour la page suivante
        sessionStorage.setItem('quiz_results', JSON.stringify(results));

        // Redirige vers la page de résultats
        setTimeout(() => {
            window.location.href = 'results.html';
        }, 500);
    },

    // Calcule les résultats
    calculateResults() {
        let correctCount = 0;
        const details = [];

        this.questions.forEach((question, index) => {
            const userAnswer = this.answers[index];
            const check = QuestionRenderer.checkAnswer(userAnswer, question);

            if (check.correct) {
                correctCount++;
                // Enregistrer le succès pour la révision ciblée
                if (window.TargetedReview && question.id) {
                    TargetedReview.recordSuccess(question.id);
                }
            } else {
                // Enregistrer l'erreur pour la révision ciblée
                if (window.TargetedReview && question.id) {
                    TargetedReview.recordError(question.id, question);
                }
            }

            details.push({
                question: question,
                userAnswer: userAnswer,
                isCorrect: check.correct,
                message: check.message
            });
        });

        const timeSpent = Math.floor((Date.now() - this.startTime) / 1000);

        return {
            totalQuestions: this.questions.length,
            correctAnswers: correctCount,
            wrongAnswers: this.questions.length - correctCount,
            score: Math.round((correctCount / this.questions.length) * 100),
            timeSpent: timeSpent,
            chapterId: this.config.chapter,
            difficulty: this.config.difficulties,
            mode: this.config.mode,
            config: this.config,  // Configuration complète pour pouvoir refaire le même quiz
            details: details,
            timestamp: new Date().toISOString()
        };
    },

    // Récupère les IDs des questions récemment utilisées (derniers 3 quiz)
    getRecentQuestions() {
        const key = 'quantum_quiz_recent_questions';
        const stored = localStorage.getItem(key);
        if (!stored) return [];

        try {
            const data = JSON.parse(stored);
            // Garde seulement les 3 derniers quiz (environ 60 questions max)
            return data.slice(0, 60);
        } catch (e) {
            console.error('Erreur lecture questions récentes:', e);
            return [];
        }
    },

    // Sauvegarde les IDs des questions utilisées dans ce quiz
    saveUsedQuestions(questionIds) {
        const key = 'quantum_quiz_recent_questions';
        const recent = this.getRecentQuestions();

        // Ajoute les nouvelles questions au début
        const updated = [...questionIds, ...recent];

        // Garde seulement les 100 plus récentes (environ 5 quiz)
        const trimmed = updated.slice(0, 100);

        localStorage.setItem(key, JSON.stringify(trimmed));
        console.log(`💾 Sauvegardé ${questionIds.length} questions utilisées (${trimmed.length} en mémoire)`);
    }
};

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM chargé, initialisation du quiz...');
    QuizEngine.init();
});

console.log('✅ quiz-engine.js chargé');
