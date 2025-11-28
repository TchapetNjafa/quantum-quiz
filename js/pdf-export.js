/**
 * QUANTUM QUIZ - Export PDF des résultats
 * Génère un PDF avec les scores, réponses et corrections
 */

const PDFExport = {
    // jsPDF sera chargé dynamiquement
    jsPDF: null,

    /**
     * Charge jsPDF depuis CDN si nécessaire
     */
    async loadLibrary() {
        if (this.jsPDF) return true;

        return new Promise((resolve, reject) => {
            // Vérifier si déjà chargé
            if (window.jspdf && window.jspdf.jsPDF) {
                this.jsPDF = window.jspdf.jsPDF;
                resolve(true);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = () => {
                this.jsPDF = window.jspdf.jsPDF;
                console.log('jsPDF chargé');
                resolve(true);
            };
            script.onerror = () => reject(new Error('Impossible de charger jsPDF'));
            document.head.appendChild(script);
        });
    },

    /**
     * Génère et télécharge un PDF des résultats du quiz
     */
    async exportResults(quizData) {
        try {
            await this.loadLibrary();

            const doc = new this.jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 20;
            let y = margin;

            // === EN-TÊTE ===
            doc.setFillColor(124, 58, 237); // Quantum purple
            doc.rect(0, 0, pageWidth, 45, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text('Quantum Quiz - Résultats', pageWidth / 2, 20, { align: 'center' });

            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text('PHY321 - Introduction à la Mécanique Quantique', pageWidth / 2, 30, { align: 'center' });
            doc.text('Université de Yaoundé I', pageWidth / 2, 38, { align: 'center' });

            y = 55;

            // === INFORMATIONS DU QUIZ ===
            doc.setTextColor(50, 50, 50);
            doc.setFontSize(11);

            const date = new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            doc.text(`Date: ${date}`, margin, y);
            y += 7;

            if (quizData.userName) {
                doc.text(`Étudiant: ${quizData.userName}`, margin, y);
                y += 7;
            }

            doc.text(`Chapitre: ${quizData.chapterName || 'Tous les chapitres'}`, margin, y);
            y += 7;

            doc.text(`Mode: ${quizData.mode === 'exam' ? 'Examen' : 'Apprentissage'}`, margin, y);
            y += 7;

            if (quizData.duration) {
                doc.text(`Durée: ${this.formatDuration(quizData.duration)}`, margin, y);
                y += 7;
            }

            y += 5;

            // === SCORE ===
            doc.setFillColor(240, 240, 240);
            doc.roundedRect(margin, y, pageWidth - 2 * margin, 35, 3, 3, 'F');

            const score = quizData.score || 0;
            const total = quizData.totalQuestions || 0;
            const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

            // Couleur selon le score
            if (percentage >= 80) {
                doc.setTextColor(16, 185, 129); // Vert
            } else if (percentage >= 60) {
                doc.setTextColor(245, 158, 11); // Orange
            } else {
                doc.setTextColor(239, 68, 68); // Rouge
            }

            doc.setFontSize(28);
            doc.setFont('helvetica', 'bold');
            doc.text(`${score}/${total}`, pageWidth / 2, y + 15, { align: 'center' });

            doc.setFontSize(16);
            doc.text(`${percentage}%`, pageWidth / 2, y + 27, { align: 'center' });

            y += 45;

            // === STATISTIQUES ===
            doc.setTextColor(50, 50, 50);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Statistiques', margin, y);
            y += 8;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');

            const stats = [
                `Réponses correctes: ${quizData.correctAnswers || 0}`,
                `Réponses incorrectes: ${quizData.incorrectAnswers || 0}`,
                `Questions non répondues: ${quizData.unanswered || 0}`,
            ];

            if (quizData.averageTimePerQuestion) {
                stats.push(`Temps moyen par question: ${quizData.averageTimePerQuestion}s`);
            }

            stats.forEach(stat => {
                doc.text(stat, margin, y);
                y += 6;
            });

            y += 10;

            // === DÉTAIL DES RÉPONSES ===
            if (quizData.questions && quizData.questions.length > 0) {
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text('Détail des réponses', margin, y);
                y += 10;

                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');

                quizData.questions.forEach((q, index) => {
                    // Nouvelle page si nécessaire
                    if (y > pageHeight - 40) {
                        doc.addPage();
                        y = margin;
                    }

                    // Indicateur de réponse
                    const isCorrect = q.isCorrect;
                    doc.setFillColor(isCorrect ? 16 : 239, isCorrect ? 185 : 68, isCorrect ? 129 : 68);
                    doc.circle(margin + 3, y - 2, 3, 'F');

                    // Numéro et question (tronquée)
                    doc.setTextColor(50, 50, 50);
                    const questionText = this.cleanText(q.question || `Question ${index + 1}`);
                    const truncated = questionText.length > 80 ? questionText.substring(0, 77) + '...' : questionText;
                    doc.text(`${index + 1}. ${truncated}`, margin + 10, y);
                    y += 5;

                    // Votre réponse
                    doc.setTextColor(100, 100, 100);
                    const userAnswer = this.cleanText(q.userAnswer || 'Non répondu');
                    doc.text(`   Votre réponse: ${userAnswer.substring(0, 60)}`, margin + 10, y);
                    y += 5;

                    // Bonne réponse si incorrecte
                    if (!isCorrect && q.correctAnswer) {
                        doc.setTextColor(16, 185, 129);
                        const correctAnswer = this.cleanText(q.correctAnswer);
                        doc.text(`   Bonne réponse: ${correctAnswer.substring(0, 60)}`, margin + 10, y);
                        y += 5;
                    }

                    y += 3;
                });
            }

            // === PIED DE PAGE ===
            const totalPages = doc.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(
                    `Quantum Quiz - PHY321 - Page ${i}/${totalPages}`,
                    pageWidth / 2,
                    pageHeight - 10,
                    { align: 'center' }
                );
            }

            // === TÉLÉCHARGEMENT ===
            const fileName = `quantum-quiz-resultats-${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);

            // Gamification
            if (window.Gamification) {
                Gamification.addXP(10, 'Résultats exportés en PDF');
            }

            return true;
        } catch (error) {
            console.error('Erreur export PDF:', error);
            alert('Erreur lors de l\'export PDF. Veuillez réessayer.');
            return false;
        }
    },

    /**
     * Exporte les favoris en PDF
     */
    async exportFavorites(questions) {
        try {
            await this.loadLibrary();

            const doc = new this.jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 20;
            let y = margin;

            // En-tête
            doc.setFillColor(124, 58, 237);
            doc.rect(0, 0, pageWidth, 40, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text('Mes Questions Favorites', pageWidth / 2, 18, { align: 'center' });

            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.text(`${questions.length} questions - ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, 30, { align: 'center' });

            y = 50;

            // Questions
            doc.setTextColor(50, 50, 50);

            questions.forEach((q, index) => {
                if (y > pageHeight - 50) {
                    doc.addPage();
                    y = margin;
                }

                // Numéro
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(124, 58, 237);
                doc.text(`Question ${index + 1}`, margin, y);

                // Difficulté
                const diffText = q.difficulty === 'easy' ? 'Facile' : q.difficulty === 'hard' ? 'Difficile' : 'Moyen';
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(100, 100, 100);
                doc.text(`[${diffText}]`, margin + 30, y);
                y += 6;

                // Question
                doc.setFontSize(10);
                doc.setTextColor(50, 50, 50);
                const questionLines = doc.splitTextToSize(this.cleanText(q.question), pageWidth - 2 * margin);
                doc.text(questionLines, margin, y);
                y += questionLines.length * 5 + 3;

                // Options pour QCM
                if (q.options && q.options.length > 0) {
                    doc.setFontSize(9);
                    q.options.forEach((opt, i) => {
                        const letter = String.fromCharCode(65 + i);
                        const isCorrect = q.correct_answer === i || q.correct_answer === letter;
                        if (isCorrect) {
                            doc.setTextColor(16, 185, 129);
                            doc.setFont('helvetica', 'bold');
                        } else {
                            doc.setTextColor(80, 80, 80);
                            doc.setFont('helvetica', 'normal');
                        }
                        const optText = this.cleanText(typeof opt === 'string' ? opt : opt.text || '');
                        doc.text(`   ${letter}. ${optText.substring(0, 80)}`, margin, y);
                        y += 5;
                    });
                }

                // Note personnelle
                if (window.Favorites && Favorites.hasNote(q.id)) {
                    doc.setFontSize(8);
                    doc.setFont('helvetica', 'italic');
                    doc.setTextColor(124, 58, 237);
                    const note = Favorites.getNote(q.id);
                    doc.text(`Note: ${note.substring(0, 100)}`, margin, y);
                    y += 5;
                }

                y += 8;
            });

            // Pied de page
            const totalPages = doc.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(
                    `Quantum Quiz - Favoris - Page ${i}/${totalPages}`,
                    pageWidth / 2,
                    pageHeight - 10,
                    { align: 'center' }
                );
            }

            doc.save(`quantum-quiz-favoris-${new Date().toISOString().split('T')[0]}.pdf`);
            return true;
        } catch (error) {
            console.error('Erreur export favoris PDF:', error);
            return false;
        }
    },

    /**
     * Nettoie le texte pour le PDF (supprime LaTeX, HTML)
     */
    cleanText(text) {
        if (!text) return '';
        return text
            .replace(/<[^>]*>/g, '') // HTML
            .replace(/\$\$[^$]*\$\$/g, '[formule]') // LaTeX block
            .replace(/\$[^$]*\$/g, '[formule]') // LaTeX inline
            .replace(/\\[a-zA-Z]+\{[^}]*\}/g, '') // LaTeX commands
            .replace(/\s+/g, ' ')
            .trim();
    },

    /**
     * Formate une durée en secondes
     */
    formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}min ${secs}s`;
    },

    /**
     * Crée un bouton d'export PDF
     */
    createExportButton(quizData) {
        const btn = document.createElement('button');
        btn.className = 'btn-export-pdf';
        btn.innerHTML = '<span class="pdf-icon">📄</span> Exporter en PDF';
        btn.addEventListener('click', () => this.exportResults(quizData));
        return btn;
    }
};

// CSS pour le bouton d'export
const pdfExportStyles = document.createElement('style');
pdfExportStyles.textContent = `
    .btn-export-pdf {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        background: linear-gradient(135deg, #dc2626, #b91c1c);
        color: white;
        border: none;
        border-radius: 10px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
        box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
    }

    .btn-export-pdf:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4);
    }

    .btn-export-pdf:active {
        transform: translateY(0);
    }

    .btn-export-pdf .pdf-icon {
        font-size: 1.2rem;
    }

    .btn-export-pdf:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
`;
document.head.appendChild(pdfExportStyles);

// Export global
window.PDFExport = PDFExport;

console.log('✅ pdf-export.js chargé');
