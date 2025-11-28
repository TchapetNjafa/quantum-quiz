/**
 * QUANTUM QUIZ - Mode Examen Blanc
 * Simulation d'examen avec chronométrage strict
 */

const ExamMode = {
    // Configuration
    config: {
        duration: 60, // minutes
        questionCount: 40,
        chapters: [1, 2, 3, 4, 5, 6],
        difficulties: ['easy', 'medium', 'hard']
    },

    // État
    questions: [],
    answers: {},
    flagged: new Set(),
    currentIndex: 0,
    timeRemaining: 0,
    timerInterval: null,
    startTime: null,
    isRunning: false,

    /**
     * Initialisation
     */
    init() {
        this.setupEventListeners();
        this.loadQuestionsData();
    },

    /**
     * Configure les écouteurs d'événements
     */
    setupEventListeners() {
        // Options d'examen
        document.querySelectorAll('.exam-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.exam-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                this.config.duration = parseInt(option.dataset.duration);
                this.config.questionCount = parseInt(option.dataset.questions);
            });
        });

        // Checkbox "Tous les chapitres"
        const allChapters = document.getElementById('ch-all');
        if (allChapters) {
            allChapters.addEventListener('change', (e) => {
                document.querySelectorAll('.ch-select').forEach(cb => {
                    cb.checked = e.target.checked;
                });
            });
        }

        // Checkbox "Tous les niveaux de difficulté"
        const allDifficulties = document.getElementById('diff-all');
        if (allDifficulties) {
            allDifficulties.addEventListener('change', (e) => {
                document.querySelectorAll('.diff-select').forEach(cb => {
                    cb.checked = e.target.checked;
                });
            });
        }

        // Raccourcis clavier
        document.addEventListener('keydown', (e) => {
            if (!this.isRunning) return;

            switch(e.key) {
                case 'ArrowLeft':
                    this.previousQuestion();
                    break;
                case 'ArrowRight':
                    this.nextQuestion();
                    break;
                case 'f':
                case 'F':
                    this.toggleFlag();
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                    this.selectOption(parseInt(e.key) - 1);
                    break;
            }
        });
    },

    /**
     * Charge les données des questions
     */
    async loadQuestionsData() {
        try {
            const response = await fetch('data/questions.json');
            this.questionsData = await response.json();
            console.log('✅ Questions chargées pour l\'examen');
        } catch (error) {
            console.error('Erreur chargement questions:', error);
        }
    },

    /**
     * Démarre l'examen
     */
    start() {
        // Récupérer les chapitres sélectionnés
        this.config.chapters = [];
        document.querySelectorAll('.ch-select:checked').forEach(cb => {
            this.config.chapters.push(parseInt(cb.dataset.chapter));
        });

        if (this.config.chapters.length === 0) {
            alert('Veuillez sélectionner au moins un chapitre.');
            return;
        }

        // Récupérer les niveaux de difficulté sélectionnés
        this.config.difficulties = [];
        document.querySelectorAll('.diff-select:checked').forEach(cb => {
            this.config.difficulties.push(cb.dataset.difficulty);
        });

        if (this.config.difficulties.length === 0) {
            alert('Veuillez sélectionner au moins un niveau de difficulté.');
            return;
        }

        // Sélectionner les questions
        this.selectQuestions();

        if (this.questions.length < this.config.questionCount) {
            alert(`Pas assez de questions disponibles. ${this.questions.length} trouvées sur ${this.config.questionCount} demandées.`);
            this.config.questionCount = this.questions.length;
        }

        // Initialiser l'état
        this.answers = {};
        this.flagged = new Set();
        this.currentIndex = 0;
        this.timeRemaining = this.config.duration * 60;
        this.startTime = Date.now();
        this.isRunning = true;

        // Afficher l'interface d'examen
        document.getElementById('exam-setup').classList.add('hidden');
        document.getElementById('exam-content').classList.remove('hidden');

        // Générer la navigation
        this.generateQuestionNav();

        // Afficher la première question
        this.displayQuestion(0);

        // Démarrer le chronomètre
        this.startTimer();

        // Son de démarrage
        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.start();
        }

        console.log('🎓 Examen démarré:', this.config);
    },

    /**
     * Sélectionne les questions pour l'examen
     */
    selectQuestions() {
        const allQuestions = [];

        this.questionsData.chapters.forEach(chapter => {
            if (this.config.chapters.includes(chapter.chapter_id)) {
                chapter.questions.forEach(q => {
                    // Filtrer pour n'avoir que les QCM et Vrai/Faux (plus adaptés à l'examen)
                    const type = this.getQuestionType(q);
                    if (type === 'qcm' || type === 'vrai_faux') {
                        // Filtrer par difficulté
                        const difficulty = q.difficulty || 'medium';
                        if (this.config.difficulties.includes(difficulty)) {
                            allQuestions.push({
                                ...q,
                                chapter_id: chapter.chapter_id,
                                chapter_title: chapter.chapter_title
                            });
                        }
                    }
                });
            }
        });

        // Mélanger et sélectionner
        this.shuffleArray(allQuestions);
        this.questions = allQuestions.slice(0, this.config.questionCount);
    },

    /**
     * Détermine le type de question
     */
    getQuestionType(question) {
        if (question.type) return question.type;
        if (question.hotspots) return 'hotspot';
        if (question.draggables) return 'drag_drop';
        if (question.front && question.back) return 'flashcard';
        return 'unknown';
    },

    /**
     * Mélange un tableau
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },

    /**
     * Génère la navigation des questions
     */
    generateQuestionNav() {
        const nav = document.getElementById('question-nav');
        nav.innerHTML = '';

        for (let i = 0; i < this.questions.length; i++) {
            const btn = document.createElement('button');
            btn.className = 'q-nav-btn';
            btn.textContent = i + 1;
            btn.onclick = () => this.goToQuestion(i);
            nav.appendChild(btn);
        }

        this.updateNavigation();
    },

    /**
     * Met à jour la navigation
     */
    updateNavigation() {
        const buttons = document.querySelectorAll('.q-nav-btn');
        buttons.forEach((btn, index) => {
            btn.classList.remove('current', 'answered', 'flagged');

            if (index === this.currentIndex) {
                btn.classList.add('current');
            }
            if (this.answers[index] !== undefined) {
                btn.classList.add('answered');
            }
            if (this.flagged.has(index)) {
                btn.classList.add('flagged');
            }
        });

        // Mettre à jour les compteurs
        const answered = Object.keys(this.answers).length;
        document.getElementById('answered-count').textContent = answered;
        document.getElementById('flagged-count').textContent = this.flagged.size;
        document.getElementById('remaining-count').textContent = this.questions.length - answered;
    },

    /**
     * Affiche une question
     */
    displayQuestion(index) {
        this.currentIndex = index;
        const question = this.questions[index];
        const container = document.getElementById('question-container');

        const type = this.getQuestionType(question);
        let optionsHTML = '';

        if (type === 'qcm') {
            optionsHTML = question.options.map((opt, i) => `
                <div class="option ${this.answers[index] === i ? 'selected' : ''}" onclick="ExamMode.selectOption(${i})">
                    <span class="option-letter">${String.fromCharCode(65 + i)}</span>
                    <span class="option-text">${opt}</span>
                </div>
            `).join('');
        } else if (type === 'vrai_faux') {
            optionsHTML = `
                <div class="option ${this.answers[index] === true ? 'selected' : ''}" onclick="ExamMode.selectOption(true)">
                    <span class="option-letter">V</span>
                    <span class="option-text">Vrai</span>
                </div>
                <div class="option ${this.answers[index] === false ? 'selected' : ''}" onclick="ExamMode.selectOption(false)">
                    <span class="option-letter">F</span>
                    <span class="option-text">Faux</span>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="question-header">
                <span class="question-number">Question ${index + 1}/${this.questions.length}</span>
                <span class="question-chapter">Chapitre ${question.chapter_id}</span>
                <span class="question-difficulty difficulty-${question.difficulty}">${question.difficulty}</span>
            </div>
            <div class="question-content">
                ${question.context ? `<p class="question-context">${question.context}</p>` : ''}
                <p class="question-text">${question.question}</p>
                ${question.formula ? `<div class="question-formula">${question.formula}</div>` : ''}
            </div>
            <div class="options-container">
                ${optionsHTML}
            </div>
        `;

        // Rendre les formules LaTeX
        if (window.MathJax) {
            MathJax.typesetPromise([container]).catch(err => console.error(err));
        }

        this.updateNavigation();
    },

    /**
     * Sélectionne une option
     */
    selectOption(value) {
        this.answers[this.currentIndex] = value;

        // Mettre à jour l'affichage
        document.querySelectorAll('.option').forEach((opt, index) => {
            const question = this.questions[this.currentIndex];
            const type = this.getQuestionType(question);

            if (type === 'qcm') {
                opt.classList.toggle('selected', index === value);
            } else if (type === 'vrai_faux') {
                const optValue = index === 0 ? true : false;
                opt.classList.toggle('selected', optValue === value);
            }
        });

        this.updateNavigation();

        // Son de clic
        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.click();
        }
    },

    /**
     * Question suivante
     */
    nextQuestion() {
        if (this.currentIndex < this.questions.length - 1) {
            this.displayQuestion(this.currentIndex + 1);
        }
    },

    /**
     * Question précédente
     */
    previousQuestion() {
        if (this.currentIndex > 0) {
            this.displayQuestion(this.currentIndex - 1);
        }
    },

    /**
     * Aller à une question spécifique
     */
    goToQuestion(index) {
        this.displayQuestion(index);
    },

    /**
     * Marquer/démarquer une question
     */
    toggleFlag() {
        if (this.flagged.has(this.currentIndex)) {
            this.flagged.delete(this.currentIndex);
        } else {
            this.flagged.add(this.currentIndex);
        }
        this.updateNavigation();

        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.notify();
        }
    },

    /**
     * Démarre le chronomètre
     */
    startTimer() {
        this.updateTimerDisplay();

        this.timerInterval = setInterval(() => {
            this.timeRemaining--;

            if (this.timeRemaining <= 0) {
                this.timeUp();
            } else {
                this.updateTimerDisplay();
            }
        }, 1000);
    },

    /**
     * Met à jour l'affichage du chronomètre
     */
    updateTimerDisplay() {
        const hours = Math.floor(this.timeRemaining / 3600);
        const minutes = Math.floor((this.timeRemaining % 3600) / 60);
        const seconds = this.timeRemaining % 60;

        const display = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        const timerEl = document.getElementById('exam-timer');
        timerEl.textContent = display;

        // Classes d'alerte
        timerEl.classList.remove('warning', 'critical');

        if (this.timeRemaining <= 60) {
            timerEl.classList.add('critical');
        } else if (this.timeRemaining <= 300) {
            timerEl.classList.add('warning');
        }
    },

    /**
     * Temps écoulé
     */
    timeUp() {
        clearInterval(this.timerInterval);
        this.isRunning = false;

        // Son d'alerte
        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.error();
        }

        // Afficher l'overlay
        document.getElementById('time-up-overlay').classList.remove('hidden');
    },

    /**
     * Confirme la soumission
     */
    confirmSubmit() {
        const answered = Object.keys(this.answers).length;
        const remaining = this.questions.length - answered;

        let message = '';
        if (remaining > 0) {
            message = `Vous avez ${remaining} question(s) non répondue(s). Êtes-vous sûr de vouloir terminer ?`;
        } else {
            message = 'Toutes les questions ont été répondues. Voulez-vous soumettre votre examen ?';
        }

        document.getElementById('confirm-message').textContent = message;
        document.getElementById('confirm-modal').classList.remove('hidden');
    },

    /**
     * Ferme la confirmation
     */
    closeConfirm() {
        document.getElementById('confirm-modal').classList.add('hidden');
    },

    /**
     * Soumet l'examen
     */
    submitExam() {
        clearInterval(this.timerInterval);
        this.isRunning = false;

        // Calculer les résultats
        this.calculateResults();
    },

    /**
     * Calcule et affiche les résultats
     */
    calculateResults() {
        let correct = 0;
        const details = [];

        // Stats par chapitre et difficulté
        const statsByChapter = {};
        const statsByDifficulty = { easy: { correct: 0, total: 0 }, medium: { correct: 0, total: 0 }, hard: { correct: 0, total: 0 } };

        this.questions.forEach((question, index) => {
            const userAnswer = this.answers[index];
            const type = this.getQuestionType(question);
            let isCorrect = false;

            if (type === 'qcm') {
                isCorrect = userAnswer === question.correct_answer;
            } else if (type === 'vrai_faux') {
                isCorrect = userAnswer === question.correct_answer;
            }

            if (isCorrect) correct++;

            // Stats par chapitre
            const chapterId = question.chapter_id;
            if (!statsByChapter[chapterId]) {
                statsByChapter[chapterId] = { correct: 0, total: 0, title: question.chapter_title };
            }
            statsByChapter[chapterId].total++;
            if (isCorrect) statsByChapter[chapterId].correct++;

            // Stats par difficulté
            const diff = question.difficulty || 'medium';
            statsByDifficulty[diff].total++;
            if (isCorrect) statsByDifficulty[diff].correct++;

            details.push({
                question,
                userAnswer,
                isCorrect,
                message: isCorrect ? 'Correct' : 'Incorrect'
            });
        });

        const score = Math.round((correct / this.questions.length) * 100);
        const timeSpent = Math.round((Date.now() - this.startTime) / 1000);

        // Sauvegarder les résultats
        const results = {
            score,
            correctAnswers: correct,
            totalQuestions: this.questions.length,
            timeSpent,
            details,
            config: this.config,
            mode: 'exam',
            date: new Date().toISOString(),
            statsByChapter,
            statsByDifficulty
        };

        sessionStorage.setItem('quiz_results', JSON.stringify(results));

        // Sauvegarder dans l'historique
        this.saveToHistory(results);

        // Son selon le score
        if (typeof AudioSystem !== 'undefined') {
            if (score >= 80) {
                AudioSystem.success();
            } else if (score >= 50) {
                AudioSystem.notify();
            } else {
                AudioSystem.warning();
            }
        }

        // Rediriger vers les résultats
        window.location.href = 'results.html';
    },

    /**
     * Sauvegarde dans l'historique
     */
    saveToHistory(results) {
        try {
            const history = JSON.parse(localStorage.getItem('exam_history') || '[]');
            history.push({
                date: results.date,
                score: results.score,
                questions: results.totalQuestions,
                duration: this.config.duration,
                chapters: this.config.chapters
            });
            localStorage.setItem('exam_history', JSON.stringify(history.slice(-50))); // Garder les 50 derniers
        } catch (e) {
            console.error('Erreur sauvegarde historique:', e);
        }
    },

    /**
     * Affiche les résultats (après temps écoulé)
     */
    showResults() {
        document.getElementById('time-up-overlay').classList.add('hidden');
        this.calculateResults();
    }
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => ExamMode.init());

console.log('✅ exam-mode.js chargé');
