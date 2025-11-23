/**
 * Gestion de la page de résultats
 */

const ResultsPage = {
    results: null,
    initialized: false,

    async init() {
        // Empêche l'initialisation multiple
        if (this.initialized) {
            console.warn('ResultsPage déjà initialisé, ignoré');
            return;
        }

        console.log('Initialisation de la page de résultats...');
        this.initialized = true;

        // Récupère les résultats
        const resultsStr = sessionStorage.getItem('quiz_results');
        if (!resultsStr) {
            showToast('Aucun résultat trouvé', 'error');
            setTimeout(() => window.location.href = 'index.html', 2000);
            return;
        }

        this.results = JSON.parse(resultsStr);
        console.log('Résultats:', this.results);

        // Affiche les résultats
        this.displayScore();
        this.displayStats();
        await this.displayReview();

        // Configure les boutons (une seule fois)
        this.setupButtons();

        // Animation d'entrée
        this.animateScore();
    },

    // Affiche le score principal
    displayScore() {
        const scorePercentage = document.getElementById('score-percentage');
        const scoreFraction = document.getElementById('score-fraction');
        const scoreGrade = document.getElementById('score-grade');
        const resultsMessage = document.getElementById('results-message');
        const resultsTitle = document.getElementById('results-title');
        const celebrationIcon = document.getElementById('celebration-icon');

        if (scorePercentage) {
            scorePercentage.textContent = `${this.results.score}%`;
        }

        if (scoreFraction) {
            scoreFraction.textContent = `${this.results.correctAnswers}/${this.results.totalQuestions}`;
        }

        // Afficher le grade
        const grade = this.getGrade(this.results.score);
        if (scoreGrade) {
            scoreGrade.textContent = grade.letter;
            scoreGrade.style.color = grade.color;
        }

        if (resultsMessage) {
            const message = this.getScoreMessage(this.results.score);
            resultsMessage.textContent = message;
        }

        // Titre et icône selon le score
        if (resultsTitle) {
            resultsTitle.textContent = grade.title;
        }

        if (celebrationIcon) {
            celebrationIcon.textContent = grade.icon;
        }

        // Circle progress
        this.updateCircleProgress(this.results.score);
    },

    // Met à jour le cercle de progression SVG
    updateCircleProgress(percentage) {
        const circle = document.getElementById('score-ring-fill');
        if (!circle) {
            console.warn('Cercle de score non trouvé');
            return;
        }

        const radius = 90; // Rayon du cercle (r="90" dans le SVG)
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;

        // Utiliser setAttribute pour SVG (plus fiable que style)
        circle.setAttribute('stroke-dasharray', `${circumference} ${circumference}`);
        circle.setAttribute('stroke-dashoffset', circumference.toString()); // Départ à 100%

        // Couleur selon le score
        const grade = this.getGrade(percentage);
        circle.setAttribute('stroke', grade.color);
        circle.setAttribute('stroke-width', '12');

        // Ajouter la classe pour l'animation
        circle.classList.add('animated');

        // Animation avec transition
        setTimeout(() => {
            circle.setAttribute('stroke-dashoffset', offset.toString());
        }, 100);

        console.log(`✅ Cercle mis à jour: ${percentage}% | Grade: ${grade.letter} | Couleur: ${grade.color}`);
    },

    // Calcule le grade selon le score (système camerounais)
    getGrade(score) {
        if (score >= 90) return {
            letter: 'A',
            color: '#00ff00',
            title: 'Excellent !',
            icon: '🏆'
        };
        if (score >= 80) return {
            letter: 'B+',
            color: '#00d9ff',
            title: 'Très Bien !',
            icon: '🎉'
        };
        if (score >= 70) return {
            letter: 'B',
            color: '#7c3aed',
            title: 'Bien !',
            icon: '👍'
        };
        if (score >= 60) return {
            letter: 'C+',
            color: '#ffd700',
            title: 'Assez Bien',
            icon: '👌'
        };
        if (score >= 50) return {
            letter: 'C',
            color: '#ff9500',
            title: 'Passable',
            icon: '📚'
        };
        if (score >= 40) return {
            letter: 'D',
            color: '#ff6b6b',
            title: 'Insuffisant',
            icon: '💪'
        };
        return {
            letter: 'E',
            color: '#ff0000',
            title: 'Échec',
            icon: '📖'
        };
    },

    // Animation du score
    animateScore() {
        const scoreValue = document.getElementById('score-value');
        if (!scoreValue) return;

        scoreValue.style.opacity = '0';
        scoreValue.style.transform = 'scale(0.5)';

        setTimeout(() => {
            scoreValue.style.transition = 'all 0.5s ease-out';
            scoreValue.style.opacity = '1';
            scoreValue.style.transform = 'scale(1)';
        }, 100);
    },

    // Message selon le score
    getScoreMessage(score) {
        if (score >= 90) return '🎉 Excellent ! Maîtrise parfaite !';
        if (score >= 75) return '👍 Très bien ! Bonne compréhension !';
        if (score >= 60) return '👌 Bien ! Continue tes efforts !';
        if (score >= 50) return '📚 Passable. Révise les concepts clés.';
        return '💪 Continue à travailler. Tu vas progresser !';
    },

    // Affiche les statistiques détaillées
    displayStats() {
        // Calculer les stats par difficulté
        const byDifficulty = { easy: {correct: 0, total: 0}, medium: {correct: 0, total: 0}, hard: {correct: 0, total: 0} };

        this.results.details.forEach(detail => {
            const diff = detail.question.difficulty;
            if (byDifficulty[diff]) {
                byDifficulty[diff].total++;
                if (detail.isCorrect) byDifficulty[diff].correct++;
            }
        });

        // Mettre à jour les scores par difficulté
        const easyScore = document.getElementById('easy-score');
        const mediumScore = document.getElementById('medium-score');
        const hardScore = document.getElementById('hard-score');

        if (easyScore) easyScore.textContent = `${byDifficulty.easy.correct}/${byDifficulty.easy.total}`;
        if (mediumScore) mediumScore.textContent = `${byDifficulty.medium.correct}/${byDifficulty.medium.total}`;
        if (hardScore) hardScore.textContent = `${byDifficulty.hard.correct}/${byDifficulty.hard.total}`;

        // Mettre à jour le temps
        const totalTime = document.getElementById('total-time');
        const avgTime = document.getElementById('avg-time');

        if (totalTime) {
            const mins = Math.floor(this.results.timeSpent / 60);
            const secs = this.results.timeSpent % 60;
            totalTime.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        }

        if (avgTime) {
            avgTime.textContent = Math.round(this.results.timeSpent / this.results.totalQuestions) + 's';
        }

        // Stats des types de questions
        const typesSummary = document.getElementById('question-types-summary');
        if (typesSummary) {
            const byType = {};
            this.results.details.forEach(detail => {
                const type = detail.question.type;
                if (!byType[type]) byType[type] = {correct: 0, total: 0};
                byType[type].total++;
                if (detail.isCorrect) byType[type].correct++;
            });

            const typeLabels = {
                'qcm': 'QCM',
                'vrai_faux': 'Vrai/Faux',
                'matching': 'Correspondances',
                'numerical': 'Numérique',
                'interpretation': 'Interprétation'
            };

            typesSummary.innerHTML = Object.entries(byType).map(([type, stats]) => `
                <div class="type-stat">
                    <span>${typeLabels[type] || type}</span>
                    <strong>${stats.correct}/${stats.total}</strong>
                </div>
            `).join('');
        }
    },

    // Affiche la révision des questions
    async displayReview() {
        const reviewContainer = document.getElementById('questions-review');
        if (!reviewContainer) return;

        reviewContainer.innerHTML = '<p class="loading">Chargement de la révision...</p>';

        const reviewHTML = [];

        for (let i = 0; i < this.results.details.length; i++) {
            const detail = this.results.details[i];
            const questionHTML = await this.renderQuestionReview(detail, i + 1);
            reviewHTML.push(questionHTML);
        }

        reviewContainer.innerHTML = reviewHTML.join('');

        // Rend les formules LaTeX
        if (isMathJaxReady()) {
            await MathJax.typesetPromise([reviewContainer]);
        }
    },

    // Rend une question pour la révision
    async renderQuestionReview(detail, questionNumber) {
        const { question, userAnswer, isCorrect, message } = detail;

        const statusClass = isCorrect ? 'correct' : 'incorrect';
        const statusIcon = isCorrect ? '✓' : '✗';

        return `
            <div class="review-item ${statusClass}">
                <div class="review-header">
                    <span class="review-number">Question ${questionNumber}</span>
                    <span class="review-status ${statusClass}">${statusIcon} ${message}</span>
                </div>

                <div class="review-question">
                    ${question.context ? `<p class="question-context"><strong>Contexte :</strong> ${question.context}</p>` : ''}
                    <p class="question-text">${question.question}</p>
                    ${question.formula ? `<div class="question-formula">${question.formula}</div>` : ''}
                </div>

                <div class="review-answer">
                    ${this.renderAnswerReview(question, userAnswer)}
                </div>

                <div class="review-explanation">
                    <strong>📖 Explication :</strong>
                    <p>${question.explanation}</p>
                    ${question.section_ref ? `<p class="section-ref">📚 Référence : Section ${question.section_ref}</p>` : ''}
                </div>
            </div>
        `;
    },

    // Rend la réponse pour la révision
    renderAnswerReview(question, userAnswer) {
        let html = '';

        switch (question.type) {
            case 'qcm':
                html = '<div class="answer-options">';
                question.options.forEach((option, index) => {
                    const isUserAnswer = userAnswer === index;
                    const isCorrect = question.correct_answer === index;
                    let className = '';
                    let icon = '';

                    if (isCorrect) {
                        className = 'correct-option';
                        icon = '✓';
                    }
                    if (isUserAnswer && !isCorrect) {
                        className = 'wrong-option';
                        icon = '✗';
                    }

                    html += `<div class="option-review ${className}">
                        <span class="option-icon">${icon}</span>
                        <span class="option-letter">${String.fromCharCode(65 + index)}</span>
                        ${option}
                        ${isUserAnswer ? ' <em>(Votre réponse)</em>' : ''}
                        ${isCorrect ? ' <em>(Correcte)</em>' : ''}
                    </div>`;
                });
                html += '</div>';
                break;

            case 'vrai_faux':
                html = `<p><strong>Votre réponse :</strong> ${userAnswer ? 'Vrai' : 'Faux'}</p>
                        <p><strong>Réponse correcte :</strong> ${question.correct_answer ? 'Vrai' : 'Faux'}</p>`;
                break;

            case 'numerical':
                html = `<p><strong>Votre réponse :</strong> ${userAnswer} ${question.unit || ''}</p>
                        <p><strong>Réponse correcte :</strong> ${question.correct_answer} ${question.unit || ''}</p>
                        ${question.tolerance ? `<p><em>Tolérance acceptée : ±${question.tolerance}</em></p>` : ''}`;
                break;

            case 'matching':
                html = '<div class="matching-review">';
                question.pairs.forEach((pair, index) => {
                    const userMatch = userAnswer[index];
                    const isCorrect = userMatch === pair.right;
                    html += `<div class="match-pair ${isCorrect ? 'correct' : 'incorrect'}">
                        <span>${isCorrect ? '✓' : '✗'}</span>
                        ${pair.left} → ${userMatch}
                        ${!isCorrect ? `<em>(Correct: ${pair.right})</em>` : ''}
                    </div>`;
                });
                html += '</div>';
                break;

            case 'interpretation':
                html = `<div class="interpretation-review">
                    <p><strong>Votre réponse :</strong></p>
                    <blockquote>${userAnswer || '<em>Pas de réponse</em>'}</blockquote>
                    ${question.sample_answer ? `
                        <p><strong>Réponse type :</strong></p>
                        <blockquote class="sample-answer">${question.sample_answer}</blockquote>
                    ` : ''}
                </div>`;
                break;
        }

        return html;
    },

    // Configure les boutons d'action
    setupButtons() {
        console.log('Configuration des boutons...');

        // Refaire ce quiz (même configuration)
        const retryQuizBtn = document.getElementById('retry-quiz');
        if (retryQuizBtn) {
            // Supprime les anciens listeners (si existants)
            const newRetryBtn = retryQuizBtn.cloneNode(true);
            retryQuizBtn.parentNode.replaceChild(newRetryBtn, retryQuizBtn);

            newRetryBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Clic sur Refaire le quiz');
                if (typeof AudioSystem !== 'undefined') AudioSystem.click();

                // Désactive le bouton pour éviter les doubles clics
                newRetryBtn.disabled = true;
                newRetryBtn.textContent = 'Chargement...';

                try {
                    // Récupère la config originale
                    const originalConfig = this.results.config || {
                        chapter: '1',
                        questionCount: 20,
                        difficulties: ['easy', 'medium', 'hard'],
                        questionTypes: ['qcm', 'vrai_faux', 'matching', 'numerical', 'interpretation'],
                        mode: 'learning'
                    };

                    // Recrée la config avec un nouveau timestamp
                    const config = {
                        ...originalConfig,
                        timestamp: new Date().toISOString()
                    };

                    sessionStorage.setItem('quiz_config', JSON.stringify(config));
                    sessionStorage.removeItem('quiz_results');

                    if (typeof AudioSystem !== 'undefined') AudioSystem.start();

                    setTimeout(() => {
                        window.location.href = 'quiz.html';
                    }, 300);
                } catch (error) {
                    console.error('Erreur refaire quiz:', error);
                    newRetryBtn.disabled = false;
                    newRetryBtn.innerHTML = '<span class="action-icon">🔄</span><strong>Refaire ce Quiz</strong>';
                    showToast('Erreur lors du rechargement', 'error');
                }
            });
        }

        // Réessayer les erreurs uniquement
        const retryErrorsBtn = document.getElementById('retry-errors');
        if (retryErrorsBtn) {
            // Supprime les anciens listeners
            const newRetryErrorsBtn = retryErrorsBtn.cloneNode(true);
            retryErrorsBtn.parentNode.replaceChild(newRetryErrorsBtn, retryErrorsBtn);

            newRetryErrorsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Clic sur Reprendre les erreurs');
                if (typeof AudioSystem !== 'undefined') AudioSystem.click();

                // Désactive le bouton
                newRetryErrorsBtn.disabled = true;
                newRetryErrorsBtn.textContent = 'Préparation...';

                try {
                    const incorrectQuestions = this.results.details
                        .filter(d => !d.isCorrect)
                        .map(d => d.question);

                    if (incorrectQuestions.length === 0) {
                        if (typeof AudioSystem !== 'undefined') AudioSystem.success();
                        showToast('Aucune erreur à réviser ! Parfait !', 'success');
                        newRetryErrorsBtn.disabled = false;
                        newRetryErrorsBtn.innerHTML = '<span class="action-icon">🎯</span><strong>Reprendre les Erreurs</strong>';
                        return;
                    }

                    // Configure un nouveau quiz avec seulement les questions incorrectes
                    const config = {
                        chapter: 'custom',
                        questionCount: incorrectQuestions.length,
                        difficulties: ['easy', 'medium', 'hard'],
                        questionTypes: ['qcm', 'vrai_faux', 'matching', 'numerical', 'interpretation'],
                        mode: 'learning',
                        customQuestions: incorrectQuestions,
                        timestamp: new Date().toISOString()
                    };

                    sessionStorage.setItem('quiz_config', JSON.stringify(config));
                    sessionStorage.removeItem('quiz_results');

                    if (typeof AudioSystem !== 'undefined') AudioSystem.start();

                    setTimeout(() => {
                        window.location.href = 'quiz.html';
                    }, 300);
                } catch (error) {
                    console.error('Erreur retry errors:', error);
                    newRetryErrorsBtn.disabled = false;
                    newRetryErrorsBtn.innerHTML = '<span class="action-icon">🎯</span><strong>Reprendre les Erreurs</strong>';
                    showToast('Erreur lors du chargement', 'error');
                }
            });
        }

        // Export PDF
        const exportPdfBtn = document.getElementById('export-pdf');
        if (exportPdfBtn) {
            // Supprime les anciens listeners
            const newExportBtn = exportPdfBtn.cloneNode(true);
            exportPdfBtn.parentNode.replaceChild(newExportBtn, exportPdfBtn);

            newExportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Clic sur Export PDF');
                if (typeof AudioSystem !== 'undefined') AudioSystem.click();

                try {
                    // Prépare la page pour l'impression
                    document.body.classList.add('print-mode');

                    // Affiche un message
                    showToast('Génération du PDF...', 'info');

                    setTimeout(() => {
                        window.print();
                        document.body.classList.remove('print-mode');
                    }, 500);
                } catch (error) {
                    console.error('Erreur export PDF:', error);
                    document.body.classList.remove('print-mode');
                    showToast('Erreur lors de l\'export', 'error');
                }
            });
        }

        // Partager (détails complets du quiz)
        const shareBtn = document.getElementById('share-results');
        if (shareBtn) {
            // Supprime les anciens listeners
            const newShareBtn = shareBtn.cloneNode(true);
            shareBtn.parentNode.replaceChild(newShareBtn, shareBtn);

            newShareBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Clic sur Partager');
                if (typeof AudioSystem !== 'undefined') AudioSystem.click();

                try {
                    this.shareResults();
                } catch (error) {
                    console.error('Erreur partage:', error);
                    showToast('Erreur lors du partage', 'error');
                }
            });
        }

        console.log('✅ Boutons configurés avec succès');
    },

    // Partage détaillé des résultats
    shareResults() {
        // Récupère la config du quiz
        const config = this.results.config || {};

        // Calcule les stats par difficulté
        const byDifficulty = { easy: {correct: 0, total: 0}, medium: {correct: 0, total: 0}, hard: {correct: 0, total: 0} };
        this.results.details.forEach(detail => {
            const diff = detail.question.difficulty;
            if (byDifficulty[diff]) {
                byDifficulty[diff].total++;
                if (detail.isCorrect) byDifficulty[diff].correct++;
            }
        });

        // Construit le message de partage détaillé
        const chapterName = config.chapter === 'all' ? 'Tous les chapitres' : `Chapitre ${config.chapter}`;
        const modeName = config.mode === 'learning' ? 'Entraînement' : 'Examen';
        const mins = Math.floor(this.results.timeSpent / 60);
        const secs = this.results.timeSpent % 60;

        const shareText = `🎓 Quiz PHY321 - Mécanique Quantique
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 RÉSULTATS
Score global : ${this.results.score}% (${this.results.correctAnswers}/${this.results.totalQuestions})

📚 Configuration :
• ${chapterName}
• Mode : ${modeName}
• Temps : ${mins}:${secs.toString().padStart(2, '0')}

🎯 Par difficulté :
• 🟢 Facile : ${byDifficulty.easy.correct}/${byDifficulty.easy.total}
• 🟡 Moyen : ${byDifficulty.medium.correct}/${byDifficulty.medium.total}
• 🔴 Difficile : ${byDifficulty.hard.correct}/${byDifficulty.hard.total}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Université de Yaoundé I
PHY321 - Introduction à la Mécanique Quantique`;

        // Copie dans le presse-papier
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareText).then(() => {
                if (typeof AudioSystem !== 'undefined') AudioSystem.success();
                showToast('Résultats détaillés copiés !', 'success');
            }).catch(err => {
                console.error('Erreur copie:', err);
                this.showShareModal(shareText);
            });
        } else {
            this.showShareModal(shareText);
        }
    },

    // Affiche une modal avec le texte à copier
    showShareModal(text) {
        const modal = document.createElement('div');
        modal.className = 'share-modal';
        modal.innerHTML = `
            <div class="share-modal-content">
                <h3>Partager vos résultats</h3>
                <textarea readonly rows="15" style="width: 100%; padding: 10px; font-family: monospace; font-size: 13px;">${text}</textarea>
                <div style="margin-top: 15px; text-align: right;">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="btn btn-secondary">Fermer</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Sélectionne le texte
        modal.querySelector('textarea').select();
    }
};

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM chargé, initialisation des résultats...');
    ResultsPage.init();
});

console.log('✅ results.js chargé');
