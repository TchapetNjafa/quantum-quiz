/**
 * QUANTUM QUIZ - Question du Jour
 * Une question quotidienne avec système de streak
 */

const DailyQuestion = {
    // État
    question: null,
    answered: false,
    streak: 0,
    lastAnswerDate: null,
    questionsData: null,

    /**
     * Initialisation
     */
    async init() {
        console.log('📅 DailyQuestion init');

        // Charger les données sauvegardées
        this.loadState();

        // Charger les questions
        await this.loadQuestions();

        // Sélectionner la question du jour
        this.selectDailyQuestion();

        // Afficher sur la page d'accueil si présent
        this.renderWidget();

        // Configurer les notifications si supportées
        this.setupNotifications();
    },

    /**
     * Charge l'état depuis localStorage
     */
    loadState() {
        try {
            const saved = localStorage.getItem('daily_question_state');
            if (saved) {
                const state = JSON.parse(saved);
                this.streak = state.streak || 0;
                this.lastAnswerDate = state.lastAnswerDate;
                this.answered = this.isAnsweredToday();
            }
        } catch (e) {
            console.error('Erreur chargement état quotidien:', e);
        }
    },

    /**
     * Sauvegarde l'état
     */
    saveState() {
        try {
            localStorage.setItem('daily_question_state', JSON.stringify({
                streak: this.streak,
                lastAnswerDate: this.lastAnswerDate
            }));
        } catch (e) {
            console.error('Erreur sauvegarde état quotidien:', e);
        }
    },

    /**
     * Vérifie si on a déjà répondu aujourd'hui
     */
    isAnsweredToday() {
        if (!this.lastAnswerDate) return false;
        const today = new Date().toDateString();
        const lastAnswer = new Date(this.lastAnswerDate).toDateString();
        return today === lastAnswer;
    },

    /**
     * Charge les questions depuis le fichier JSON
     */
    async loadQuestions() {
        try {
            const response = await fetch('data/questions.json');
            this.questionsData = await response.json();
        } catch (error) {
            console.error('Erreur chargement questions:', error);
        }
    },

    /**
     * Sélectionne la question du jour (déterministe basé sur la date)
     */
    selectDailyQuestion() {
        if (!this.questionsData) return;

        // Créer un seed basé sur la date
        const today = new Date();
        const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

        // Collecter toutes les questions QCM et Vrai/Faux
        const allQuestions = [];
        this.questionsData.chapters.forEach(chapter => {
            chapter.questions.forEach(q => {
                if (q.type === 'qcm' || q.type === 'vrai_faux') {
                    allQuestions.push({
                        ...q,
                        chapter_id: chapter.chapter_id,
                        chapter_title: chapter.chapter_title
                    });
                }
            });
        });

        // Sélectionner une question basée sur le seed
        const index = seed % allQuestions.length;
        this.question = allQuestions[index];
    },

    /**
     * Affiche le widget sur la page d'accueil
     */
    renderWidget() {
        const container = document.getElementById('daily-question-widget');
        if (!container || !this.question) return;

        const question = this.question;
        const isQCM = question.type === 'qcm';

        let optionsHTML = '';
        if (isQCM) {
            optionsHTML = question.options.map((opt, i) => `
                <button class="daily-option" data-index="${i}" onclick="DailyQuestion.selectOption(${i})">
                    <span class="option-letter">${String.fromCharCode(65 + i)}</span>
                    <span class="option-text">${opt}</span>
                </button>
            `).join('');
        } else {
            optionsHTML = `
                <button class="daily-option" data-value="true" onclick="DailyQuestion.selectOption(true)">
                    <span class="option-letter">V</span>
                    <span class="option-text">Vrai</span>
                </button>
                <button class="daily-option" data-value="false" onclick="DailyQuestion.selectOption(false)">
                    <span class="option-letter">F</span>
                    <span class="option-text">Faux</span>
                </button>
            `;
        }

        container.innerHTML = `
            <div class="daily-question-card ${this.answered ? 'answered' : ''}">
                <div class="daily-header">
                    <div class="daily-title">
                        <span class="daily-icon">📅</span>
                        <h3>Question du Jour</h3>
                    </div>
                    <div class="daily-streak">
                        <span class="streak-icon">🔥</span>
                        <span class="streak-count">${this.streak}</span>
                        <span class="streak-label">jours</span>
                    </div>
                </div>

                <div class="daily-chapter">
                    Chapitre ${question.chapter_id}: ${question.chapter_title}
                </div>

                <div class="daily-question-text">
                    ${question.question}
                </div>

                ${question.formula ? `<div class="daily-formula">${question.formula}</div>` : ''}

                <div class="daily-options" id="daily-options">
                    ${this.answered ? this.renderAnsweredState() : optionsHTML}
                </div>

                <div class="daily-footer">
                    ${this.answered
                        ? `<span class="daily-completed">✅ Complété aujourd'hui</span>`
                        : `<span class="daily-hint">Répondez pour maintenir votre streak!</span>`
                    }
                </div>
            </div>
        `;

        // Rendre les formules LaTeX
        if (window.MathJax) {
            MathJax.typesetPromise([container]).catch(err => console.error(err));
        }
    },

    /**
     * Affiche l'état après avoir répondu
     */
    renderAnsweredState() {
        const question = this.question;
        const isQCM = question.type === 'qcm';
        const correctAnswer = question.correct_answer;

        if (isQCM) {
            return question.options.map((opt, i) => {
                const isCorrect = i === correctAnswer;
                return `
                    <div class="daily-option ${isCorrect ? 'correct' : ''} disabled">
                        <span class="option-letter">${String.fromCharCode(65 + i)}</span>
                        <span class="option-text">${opt}</span>
                        ${isCorrect ? '<span class="correct-mark">✓</span>' : ''}
                    </div>
                `;
            }).join('');
        } else {
            return `
                <div class="daily-option ${correctAnswer === true ? 'correct' : ''} disabled">
                    <span class="option-letter">V</span>
                    <span class="option-text">Vrai</span>
                    ${correctAnswer === true ? '<span class="correct-mark">✓</span>' : ''}
                </div>
                <div class="daily-option ${correctAnswer === false ? 'correct' : ''} disabled">
                    <span class="option-letter">F</span>
                    <span class="option-text">Faux</span>
                    ${correctAnswer === false ? '<span class="correct-mark">✓</span>' : ''}
                </div>
            `;
        }
    },

    /**
     * Sélectionne une option
     */
    selectOption(value) {
        if (this.answered) return;

        const question = this.question;
        const correctAnswer = question.correct_answer;
        const isCorrect = value === correctAnswer;

        // Mettre à jour l'état
        this.answered = true;
        this.lastAnswerDate = new Date().toISOString();

        // Mettre à jour le streak
        this.updateStreak(isCorrect);

        // Sauvegarder
        this.saveState();

        // Feedback visuel
        const buttons = document.querySelectorAll('.daily-option');
        buttons.forEach((btn) => {
            btn.classList.add('disabled');

            const btnValue = btn.dataset.index !== undefined
                ? parseInt(btn.dataset.index)
                : btn.dataset.value === 'true';

            if (btnValue === value) {
                btn.classList.add(isCorrect ? 'correct' : 'incorrect');
            }
            if (btnValue === correctAnswer) {
                btn.classList.add('correct');
            }
        });

        // Mettre à jour le footer
        const footer = document.querySelector('.daily-footer');
        if (footer) {
            footer.innerHTML = isCorrect
                ? `<span class="daily-success">🎉 Bravo! Streak: ${this.streak} jours</span>`
                : `<span class="daily-fail">❌ Dommage! La bonne réponse était ${this.getCorrectAnswerText()}</span>`;
        }

        // Afficher l'explication
        this.showExplanation(isCorrect);

        // Son
        if (typeof AudioSystem !== 'undefined') {
            isCorrect ? AudioSystem.success() : AudioSystem.error();
        }
    },

    /**
     * Récupère le texte de la bonne réponse
     */
    getCorrectAnswerText() {
        const question = this.question;
        if (question.type === 'qcm') {
            return String.fromCharCode(65 + question.correct_answer);
        }
        return question.correct_answer ? 'Vrai' : 'Faux';
    },

    /**
     * Met à jour le streak
     */
    updateStreak(isCorrect) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const wasYesterday = this.lastAnswerDate &&
            new Date(this.lastAnswerDate).toDateString() === yesterday.toDateString();

        if (wasYesterday || this.streak === 0) {
            // Continuer ou commencer le streak
            this.streak = isCorrect ? this.streak + 1 : 1;
        } else if (!wasYesterday && this.lastAnswerDate) {
            // Streak cassé
            this.streak = isCorrect ? 1 : 0;
        }
    },

    /**
     * Affiche l'explication
     */
    showExplanation(isCorrect) {
        const optionsDiv = document.getElementById('daily-options');
        if (!optionsDiv) return;

        const explanation = this.question.explanation || 'Pas d\'explication disponible.';

        const explanationHTML = `
            <div class="daily-explanation ${isCorrect ? 'success' : 'fail'}">
                <h4>${isCorrect ? '✅ Correct!' : '❌ Incorrect'}</h4>
                <p>${explanation}</p>
                <div class="daily-ref">
                    Section: ${this.question.section_ref || 'N/A'} |
                    Difficulté: ${this.question.difficulty}
                </div>
            </div>
        `;

        optionsDiv.insertAdjacentHTML('afterend', explanationHTML);

        // Rendre LaTeX si présent
        if (window.MathJax) {
            MathJax.typesetPromise().catch(err => console.error(err));
        }
    },

    /**
     * Configure les notifications push
     */
    async setupNotifications() {
        if (!('Notification' in window)) {
            console.log('Notifications non supportées');
            return;
        }

        // Vérifier si les notifications sont activées
        const notifEnabled = localStorage.getItem('daily_notifications') === 'true';
        if (!notifEnabled) return;

        if (Notification.permission === 'granted') {
            this.scheduleNotification();
        }
    },

    /**
     * Active/désactive les notifications
     */
    async toggleNotifications(enable) {
        if (!('Notification' in window)) {
            alert('Votre navigateur ne supporte pas les notifications.');
            return false;
        }

        if (enable) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                localStorage.setItem('daily_notifications', 'true');
                this.scheduleNotification();
                return true;
            }
            return false;
        } else {
            localStorage.setItem('daily_notifications', 'false');
            return true;
        }
    },

    /**
     * Programme une notification quotidienne
     */
    scheduleNotification() {
        // Les notifications seront gérées par le Service Worker
        // On enregistre juste l'heure souhaitée
        const notifTime = localStorage.getItem('daily_notif_time') || '09:00';
        console.log(`📢 Notification quotidienne programmée à ${notifTime}`);
    },

    /**
     * Envoie une notification test
     */
    sendTestNotification() {
        if (Notification.permission === 'granted') {
            new Notification('Quantum Quiz', {
                body: '📅 Votre question du jour vous attend!',
                icon: 'assets/icons/icon-192x192.png',
                badge: 'assets/icons/icon-72x72.png',
                tag: 'daily-question',
                requireInteraction: false
            });
        }
    }
};

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => DailyQuestion.init());

// Export global
window.DailyQuestion = DailyQuestion;

console.log('✅ daily-question.js chargé');
