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

        // Configure les filtres de révision
        this.setupReviewFilters();

        // Animation d'entrée
        this.animateScore();

        // Son selon le score
        if (typeof AudioSystem !== 'undefined') {
            setTimeout(() => {
                if (this.results.score >= 80) {
                    AudioSystem.success();  // Excellent score
                } else if (this.results.score >= 50) {
                    AudioSystem.notify();  // Score moyen
                } else {
                    AudioSystem.warning();  // Score faible
                }
            }, 500);  // Délai pour laisser la page s'afficher
        }
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
        if (score >= 90) {return {
            letter: 'A',
            color: '#00ff00',
            title: 'Excellent !',
            icon: '🏆'
        };}
        if (score >= 80) {return {
            letter: 'B+',
            color: '#00d9ff',
            title: 'Très Bien !',
            icon: '🎉'
        };}
        if (score >= 70) {return {
            letter: 'B',
            color: '#7c3aed',
            title: 'Bien !',
            icon: '👍'
        };}
        if (score >= 60) {return {
            letter: 'C+',
            color: '#ffd700',
            title: 'Assez Bien',
            icon: '👌'
        };}
        if (score >= 50) {return {
            letter: 'C',
            color: '#ff9500',
            title: 'Passable',
            icon: '📚'
        };}
        if (score >= 40) {return {
            letter: 'D',
            color: '#ff6b6b',
            title: 'Insuffisant',
            icon: '💪'
        };}
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
                const type = getQuestionType(detail.question);
                if (!byType[type]) byType[type] = {correct: 0, total: 0};
                byType[type].total++;
                if (detail.isCorrect) byType[type].correct++;
            });

            const typeLabels = {
                'qcm': 'QCM',
                'vrai_faux': 'Vrai/Faux',
                'matching': 'Correspondances',
                'numerical': 'Numérique',
                'interpretation': 'Interprétation',
                'hotspot': 'Hotspot',
                'drag_drop': 'Glisser-Déposer',
                'flashcard': 'Flashcard'
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
        const reviewContainer = document.getElementById('questions-review-list');
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
                    ${this.getAnimationLinks(question)}
                </div>
            </div>
        `;
    },

    // Rend la réponse pour la révision
    renderAnswerReview(question, userAnswer) {
        let html = '';

        const questionType = getQuestionType(question);
        switch (questionType) {
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

            case 'hotspot': {
                const correctHotspot = question.hotspots.find(h => h.id === question.correct_hotspot);
                const userHotspot = question.hotspots.find(h => h.id === userAnswer);
                html = `<p><strong>Votre réponse :</strong> ${userHotspot ? userHotspot.label : 'Aucune zone sélectionnée'}</p>
                        <p><strong>Zone correcte :</strong> ${correctHotspot ? correctHotspot.label : 'N/A'}</p>`;
                break;
            }

            case 'drag_drop':
                html = '<div class="drag-drop-review">';
                if (question.correct_matches) {
                    Object.entries(question.correct_matches).forEach(([itemId, correctZoneId]) => {
                        const userZoneId = userAnswer[itemId];
                        const isCorrect = userZoneId === correctZoneId;
                        html += `<div class="drag-item ${isCorrect ? 'correct' : 'incorrect'}">
                            <span>${isCorrect ? '✓' : '✗'}</span>
                            ${itemId} → ${userZoneId || 'non placé'}
                            ${!isCorrect ? `<em>(Correct: ${correctZoneId})</em>` : ''}
                        </div>`;
                    });
                }
                html += '</div>';
                break;

            case 'flashcard':
                html = `<p><strong>Auto-évaluation :</strong> ${userAnswer ? '✓ Je savais' : '✗ À réviser'}</p>
                        <p><strong>Réponse :</strong> ${question.back || 'N/A'}</p>`;
                break;

            default:
                html = `<p>Type de question non supporté pour la révision : ${questionType}</p>`;
        }

        return html;
    },

    // Génère les liens vers les animations pertinentes
    getAnimationLinks(question) {
        if (typeof AnimationLinker === 'undefined') return '';

        const animations = AnimationLinker.findRelevantAnimations(question);
        if (!animations || animations.length === 0) return '';

        return AnimationLinker.generateAnimationLinks(animations);
    },

    // Configure les filtres de révision
    setupReviewFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Met à jour les classes actives
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Filtre les questions
                const filter = btn.dataset.filter;
                const reviewItems = document.querySelectorAll('.review-item');

                reviewItems.forEach(item => {
                    if (filter === 'all') {
                        item.style.display = 'block';
                    } else if (filter === 'correct') {
                        item.style.display = item.classList.contains('correct') ? 'block' : 'none';
                    } else if (filter === 'incorrect') {
                        item.style.display = item.classList.contains('incorrect') ? 'block' : 'none';
                    }
                });

                if (typeof AudioSystem !== 'undefined') AudioSystem.click();
            });
        });
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

            newExportBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                console.log('Clic sur Export PDF');
                if (typeof AudioSystem !== 'undefined') AudioSystem.click();

                // Désactive le bouton pendant la génération
                newExportBtn.disabled = true;
                const originalContent = newExportBtn.innerHTML;
                newExportBtn.innerHTML = '<span class="action-icon">⏳</span><strong>Génération...</strong>';

                try {
                    await this.generatePDF();
                    if (typeof AudioSystem !== 'undefined') AudioSystem.success();
                    showToast('PDF généré avec succès !', 'success');
                } catch (error) {
                    console.error('Erreur export PDF:', error);
                    showToast('Erreur lors de l\'export PDF', 'error');
                } finally {
                    // eslint-disable-next-line require-atomic-updates
                    newExportBtn.disabled = false;
                    // eslint-disable-next-line require-atomic-updates
                    newExportBtn.innerHTML = originalContent;
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
    },

    // Génère un PDF des résultats avec jsPDF
    async generatePDF() {
        // Charge jsPDF dynamiquement si nécessaire
        if (typeof window.jspdf === 'undefined') {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                script.onload = resolve;
                script.onerror = () => reject(new Error('Impossible de charger jsPDF'));
                document.head.appendChild(script);
            });
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');

        // Configuration
        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 20;
        const contentWidth = pageWidth - 2 * margin;
        let y = margin;

        // Couleurs
        const purple = [124, 58, 237];
        const cyan = [0, 217, 255];
        const green = [0, 255, 0];
        const orange = [255, 149, 0];
        const red = [255, 107, 107];

        // ===== EN-TÊTE =====
        doc.setFillColor(...purple);
        doc.rect(0, 0, pageWidth, 45, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('Quantum Quiz - PHY321', pageWidth / 2, 18, { align: 'center' });

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Introduction à la Mécanique Quantique', pageWidth / 2, 28, { align: 'center' });
        doc.text('Université de Yaoundé I', pageWidth / 2, 36, { align: 'center' });

        y = 55;

        // ===== INFORMATIONS DU QUIZ =====
        const config = this.results.config || {};
        const chapterName = config.chapter === 'all' ? 'Tous les chapitres' : `Chapitre ${config.chapter}`;
        const modeName = config.mode === 'learning' ? 'Entraînement' : 'Examen';
        const date = new Date().toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        doc.setTextColor(100, 100, 100);
        doc.setFontSize(10);
        doc.text(`Date : ${date}`, margin, y);
        doc.text(`Chapitre : ${chapterName}`, margin, y + 6);
        doc.text(`Mode : ${modeName}`, margin, y + 12);

        y += 25;

        // ===== SCORE PRINCIPAL =====
        doc.setFillColor(245, 245, 255);
        doc.roundedRect(margin, y, contentWidth, 50, 5, 5, 'F');

        // Score en grand
        doc.setTextColor(...purple);
        doc.setFontSize(48);
        doc.setFont('helvetica', 'bold');
        doc.text(`${this.results.score}%`, pageWidth / 2, y + 30, { align: 'center' });

        // Fraction
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text(`${this.results.correctAnswers} / ${this.results.totalQuestions} questions correctes`, pageWidth / 2, y + 42, { align: 'center' });

        // Grade
        const grade = this.getGrade(this.results.score);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        const gradeColor = this.hexToRgb(grade.color);
        doc.setTextColor(gradeColor.r, gradeColor.g, gradeColor.b);
        doc.text(`Grade: ${grade.letter}`, pageWidth - margin - 20, y + 30, { align: 'right' });

        y += 60;

        // ===== STATISTIQUES PAR DIFFICULTÉ =====
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Performance par difficulté', margin, y);

        y += 8;

        // Calcul des stats
        const byDifficulty = { easy: {correct: 0, total: 0}, medium: {correct: 0, total: 0}, hard: {correct: 0, total: 0} };
        this.results.details.forEach(detail => {
            const diff = detail.question.difficulty;
            if (byDifficulty[diff]) {
                byDifficulty[diff].total++;
                if (detail.isCorrect) byDifficulty[diff].correct++;
            }
        });

        // Barres de progression
        const difficulties = [
            { key: 'easy', label: 'Facile', color: green },
            { key: 'medium', label: 'Moyen', color: orange },
            { key: 'hard', label: 'Difficile', color: red }
        ];

        difficulties.forEach(diff => {
            const stat = byDifficulty[diff.key];
            const percentage = stat.total > 0 ? (stat.correct / stat.total) * 100 : 0;

            doc.setTextColor(80, 80, 80);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(diff.label, margin, y + 5);

            // Barre de fond
            doc.setFillColor(230, 230, 230);
            doc.roundedRect(margin + 30, y, 100, 6, 2, 2, 'F');

            // Barre de progression
            if (percentage > 0) {
                doc.setFillColor(...diff.color);
                doc.roundedRect(margin + 30, y, percentage, 6, 2, 2, 'F');
            }

            // Score
            doc.text(`${stat.correct}/${stat.total} (${Math.round(percentage)}%)`, margin + 135, y + 5);

            y += 12;
        });

        y += 10;

        // ===== TEMPS =====
        const mins = Math.floor(this.results.timeSpent / 60);
        const secs = this.results.timeSpent % 60;
        const avgTime = Math.round(this.results.timeSpent / this.results.totalQuestions);

        doc.setTextColor(50, 50, 50);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Temps', margin, y);

        y += 8;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text(`Temps total : ${mins}:${secs.toString().padStart(2, '0')}`, margin, y);
        doc.text(`Temps moyen par question : ${avgTime}s`, margin + 60, y);

        y += 15;

        // ===== RÉSUMÉ DES QUESTIONS =====
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Résumé des questions', margin, y);

        y += 8;

        // En-tête du tableau
        doc.setFillColor(245, 245, 255);
        doc.rect(margin, y, contentWidth, 8, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(80, 80, 80);
        doc.text('Q', margin + 5, y + 5);
        doc.text('Résultat', margin + 15, y + 5);
        doc.text('Difficulté', margin + 40, y + 5);
        doc.text('Type', margin + 70, y + 5);

        y += 10;

        // Lignes du tableau
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);

        const maxQuestions = Math.min(this.results.details.length, 25); // Max 25 questions par page

        for (let i = 0; i < maxQuestions; i++) {
            const detail = this.results.details[i];

            if (y > pageHeight - 30) {
                doc.addPage();
                y = margin;
            }

            // Alternance de couleur
            if (i % 2 === 0) {
                doc.setFillColor(250, 250, 255);
                doc.rect(margin, y - 3, contentWidth, 7, 'F');
            }

            doc.setTextColor(80, 80, 80);
            doc.text(`${i + 1}`, margin + 5, y + 2);

            // Résultat avec couleur
            if (detail.isCorrect) {
                doc.setTextColor(...green);
                doc.text('Correct', margin + 15, y + 2);
            } else {
                doc.setTextColor(...red);
                doc.text('Incorrect', margin + 15, y + 2);
            }

            doc.setTextColor(80, 80, 80);
            const diffLabel = detail.question.difficulty === 'easy' ? 'Facile' :
                detail.question.difficulty === 'medium' ? 'Moyen' : 'Difficile';
            doc.text(diffLabel, margin + 40, y + 2);

            const typeLabel = this.getTypeLabel(getQuestionType(detail.question));
            doc.text(typeLabel, margin + 70, y + 2);

            y += 7;
        }

        if (this.results.details.length > maxQuestions) {
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'italic');
            doc.text(`... et ${this.results.details.length - maxQuestions} autres questions`, margin, y + 5);
        }

        // ===== PIED DE PAGE =====
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('Généré par Quantum Quiz - PHY321 - Université de Yaoundé I', pageWidth / 2, pageHeight - 10, { align: 'center' });

        // Télécharge le PDF
        const fileName = `Quiz_PHY321_${this.results.score}pct_${new Date().toISOString().slice(0,10)}.pdf`;
        doc.save(fileName);
    },

    // Convertit une couleur hex en RGB
    hexToRgb(hex) {
        // Gère les couleurs nommées ou les hex
        if (hex.startsWith('#')) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : { r: 128, g: 128, b: 128 };
        }
        // Couleur CSS nommée - renvoie une couleur par défaut
        return { r: 124, g: 58, b: 237 };
    },

    // Labels des types de questions
    getTypeLabel(type) {
        const labels = {
            'qcm': 'QCM',
            'vrai_faux': 'V/F',
            'matching': 'Match',
            'numerical': 'Num.',
            'interpretation': 'Interp.',
            'hotspot': 'Hotspot',
            'drag_drop': 'D&D',
            'flashcard': 'Flash'
        };
        return labels[type] || type;
    }
};

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM chargé, initialisation des résultats...');
    ResultsPage.init();
});

console.log('✅ results.js chargé');
