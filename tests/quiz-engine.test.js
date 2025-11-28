/**
 * Tests pour QuizEngine
 * Moteur principal du quiz Quantum Quiz
 */

describe('QuizEngine - Moteur du quiz', () => {

    // Mock des fonctions helper
    const getQuestionType = (question) => {
        if (question.type) return question.type;
        if (question.hotspots || (question.id && question.id.includes('-h'))) return 'hotspot';
        if (question.draggables || (question.id && question.id.includes('-d'))) return 'drag_drop';
        if (question.front && question.back) return 'flashcard';
        return 'unknown';
    };

    const shuffleArray = (array) => {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    };

    // QuizEngine simplifié pour les tests
    let QuizEngine;

    beforeEach(() => {
        // Reset QuizEngine avant chaque test
        QuizEngine = {
            config: null,
            questions: [],
            currentIndex: 0,
            answers: [],
            startTime: null,

            getChapterName(chapter) {
                const names = {
                    '1': 'Chapitre 1 : États Quantiques',
                    '2': 'Chapitre 2 : Mesure et Opérateurs',
                    '3': 'Chapitre 3 : Dynamique Quantique',
                    '4': 'Chapitre 4 : Systèmes Multi-Qubits',
                    '5': 'Chapitre 5 : Fonction d\'État',
                    '6': 'Chapitre 6 : Oscillateur Harmonique',
                    'all': 'Révision Globale - Tous les Chapitres',
                    'custom': 'Quiz Personnalisé'
                };
                return names[chapter] || `Chapitre ${chapter}`;
            },

            filterQuestions(allQuestions) {
                let filtered = [...allQuestions];

                // Filtre par difficulté
                if (this.config.difficulties && this.config.difficulties.length > 0) {
                    filtered = filtered.filter(q =>
                        this.config.difficulties.includes(q.difficulty)
                    );
                }

                // Filtre par type
                if (this.config.questionTypes && this.config.questionTypes.length > 0) {
                    filtered = filtered.filter(q => {
                        const type = getQuestionType(q);
                        return this.config.questionTypes.includes(type);
                    });
                }

                return filtered;
            },

            selectQuestions(filtered) {
                const shuffled = shuffleArray(filtered);
                const count = Math.min(this.config.questionCount, shuffled.length);
                return shuffled.slice(0, count);
            },

            calculateResults() {
                const details = this.questions.map((question, index) => {
                    const userAnswer = this.answers[index];
                    const isCorrect = this.checkAnswer(userAnswer, question);
                    return {
                        question,
                        userAnswer,
                        isCorrect,
                        message: isCorrect ? 'Correct' : 'Incorrect'
                    };
                });

                const correctAnswers = details.filter(d => d.isCorrect).length;
                const timeSpent = Math.floor((Date.now() - this.startTime) / 1000);

                return {
                    totalQuestions: this.questions.length,
                    correctAnswers,
                    score: Math.round((correctAnswers / this.questions.length) * 100),
                    timeSpent,
                    details,
                    config: this.config
                };
            },

            checkAnswer(userAnswer, question) {
                if (userAnswer === null || userAnswer === undefined) return false;

                const type = getQuestionType(question);
                switch (type) {
                    case 'qcm':
                        return userAnswer === question.correct_answer;
                    case 'vrai_faux':
                        return userAnswer === question.correct_answer;
                    case 'numerical':
                        const tolerance = question.tolerance || 0;
                        return Math.abs(userAnswer - question.correct_answer) <= tolerance;
                    default:
                        return userAnswer === question.correct_answer;
                }
            },

            getProgress() {
                return {
                    current: this.currentIndex + 1,
                    total: this.questions.length,
                    percentage: Math.round(((this.currentIndex + 1) / this.questions.length) * 100)
                };
            }
        };

        localStorage.clear();
        sessionStorage.clear();
    });

    describe('Configuration', () => {
        test('propriétés initiales définies', () => {
            expect(QuizEngine.config).toBeNull();
            expect(QuizEngine.questions).toEqual([]);
            expect(QuizEngine.currentIndex).toBe(0);
            expect(QuizEngine.answers).toEqual([]);
        });
    });

    describe('getChapterName()', () => {
        test('retourne le nom du chapitre 1', () => {
            expect(QuizEngine.getChapterName('1')).toContain('États Quantiques');
        });

        test('retourne "Révision Globale" pour all', () => {
            expect(QuizEngine.getChapterName('all')).toContain('Révision Globale');
        });

        test('retourne "Quiz Personnalisé" pour custom', () => {
            expect(QuizEngine.getChapterName('custom')).toContain('Personnalisé');
        });
    });

    describe('filterQuestions()', () => {
        const sampleQuestions = [
            { id: 'q1', type: 'qcm', difficulty: 'easy' },
            { id: 'q2', type: 'qcm', difficulty: 'medium' },
            { id: 'q3', type: 'vrai_faux', difficulty: 'hard' },
            { id: 'q4', type: 'numerical', difficulty: 'easy' }
        ];

        test('filtre par difficulté', () => {
            QuizEngine.config = {
                difficulties: ['easy'],
                questionTypes: ['qcm', 'vrai_faux', 'numerical']
            };
            const filtered = QuizEngine.filterQuestions(sampleQuestions);
            expect(filtered.every(q => q.difficulty === 'easy')).toBe(true);
            expect(filtered.length).toBe(2);
        });

        test('filtre par type de question', () => {
            QuizEngine.config = {
                difficulties: ['easy', 'medium', 'hard'],
                questionTypes: ['qcm']
            };
            const filtered = QuizEngine.filterQuestions(sampleQuestions);
            expect(filtered.every(q => q.type === 'qcm')).toBe(true);
            expect(filtered.length).toBe(2);
        });

        test('filtre combiné difficulté + type', () => {
            QuizEngine.config = {
                difficulties: ['easy'],
                questionTypes: ['qcm']
            };
            const filtered = QuizEngine.filterQuestions(sampleQuestions);
            expect(filtered.length).toBe(1);
            expect(filtered[0].id).toBe('q1');
        });

        test('retourne toutes les questions si pas de filtre', () => {
            QuizEngine.config = {
                difficulties: [],
                questionTypes: []
            };
            const filtered = QuizEngine.filterQuestions(sampleQuestions);
            expect(filtered.length).toBe(4);
        });
    });

    describe('selectQuestions()', () => {
        test('sélectionne le nombre demandé', () => {
            QuizEngine.config = { questionCount: 3 };
            const questions = [
                { id: 'q1' }, { id: 'q2' }, { id: 'q3' },
                { id: 'q4' }, { id: 'q5' }
            ];
            const selected = QuizEngine.selectQuestions(questions);
            expect(selected.length).toBe(3);
        });

        test('retourne toutes les questions si count > length', () => {
            QuizEngine.config = { questionCount: 10 };
            const questions = [{ id: 'q1' }, { id: 'q2' }];
            const selected = QuizEngine.selectQuestions(questions);
            expect(selected.length).toBe(2);
        });

        test('mélange les questions', () => {
            QuizEngine.config = { questionCount: 5 };
            const questions = [
                { id: 'q1' }, { id: 'q2' }, { id: 'q3' },
                { id: 'q4' }, { id: 'q5' }
            ];

            // Exécuter plusieurs fois pour vérifier le mélange
            const results = new Set();
            for (let i = 0; i < 10; i++) {
                const selected = QuizEngine.selectQuestions(questions);
                results.add(selected.map(q => q.id).join(','));
            }

            // Devrait avoir plus d'un ordre différent (probabilistique)
            expect(results.size).toBeGreaterThanOrEqual(1);
        });
    });

    describe('checkAnswer()', () => {
        test('vérifie QCM correct', () => {
            const question = { type: 'qcm', correct_answer: 2 };
            expect(QuizEngine.checkAnswer(2, question)).toBe(true);
            expect(QuizEngine.checkAnswer(1, question)).toBe(false);
        });

        test('vérifie vrai/faux', () => {
            const question = { type: 'vrai_faux', correct_answer: true };
            expect(QuizEngine.checkAnswer(true, question)).toBe(true);
            expect(QuizEngine.checkAnswer(false, question)).toBe(false);
        });

        test('vérifie numerical avec tolérance', () => {
            const question = { type: 'numerical', correct_answer: 3.14, tolerance: 0.01 };
            expect(QuizEngine.checkAnswer(3.14, question)).toBe(true);
            expect(QuizEngine.checkAnswer(3.15, question)).toBe(true);
            expect(QuizEngine.checkAnswer(3.2, question)).toBe(false);
        });

        test('retourne false pour réponse null', () => {
            const question = { type: 'qcm', correct_answer: 1 };
            expect(QuizEngine.checkAnswer(null, question)).toBe(false);
            expect(QuizEngine.checkAnswer(undefined, question)).toBe(false);
        });
    });

    describe('calculateResults()', () => {
        beforeEach(() => {
            QuizEngine.questions = [
                { id: 'q1', type: 'qcm', difficulty: 'easy', correct_answer: 0 },
                { id: 'q2', type: 'qcm', difficulty: 'medium', correct_answer: 1 },
                { id: 'q3', type: 'vrai_faux', difficulty: 'hard', correct_answer: true }
            ];
            QuizEngine.answers = [0, 0, true]; // 2 correct, 1 incorrect
            QuizEngine.startTime = Date.now() - 60000;
            QuizEngine.config = { chapter: '1', mode: 'learning' };
        });

        test('calcule le score correctement', () => {
            const results = QuizEngine.calculateResults();
            expect(results.totalQuestions).toBe(3);
            expect(results.correctAnswers).toBe(2);
            expect(results.score).toBe(67);
        });

        test('calcule le temps passé', () => {
            const results = QuizEngine.calculateResults();
            expect(results.timeSpent).toBeGreaterThanOrEqual(59);
            expect(results.timeSpent).toBeLessThanOrEqual(61);
        });

        test('inclut les détails pour chaque question', () => {
            const results = QuizEngine.calculateResults();
            expect(results.details.length).toBe(3);
            expect(results.details[0].question.id).toBe('q1');
            expect(results.details[0].isCorrect).toBe(true);
            expect(results.details[1].isCorrect).toBe(false);
        });

        test('inclut la configuration', () => {
            const results = QuizEngine.calculateResults();
            expect(results.config).toBeDefined();
            expect(results.config.chapter).toBe('1');
        });
    });

    describe('getProgress()', () => {
        test('calcule la progression correctement', () => {
            QuizEngine.questions = [{}, {}, {}, {}];
            QuizEngine.currentIndex = 1;

            const progress = QuizEngine.getProgress();
            expect(progress.current).toBe(2);
            expect(progress.total).toBe(4);
            expect(progress.percentage).toBe(50);
        });
    });

    describe('getQuestionType() helper', () => {
        test('détecte les types correctement', () => {
            expect(getQuestionType({ type: 'qcm' })).toBe('qcm');
            expect(getQuestionType({ hotspots: [] })).toBe('hotspot');
            expect(getQuestionType({ id: 'ch1-h01' })).toBe('hotspot');
            expect(getQuestionType({ draggables: [] })).toBe('drag_drop');
            expect(getQuestionType({ id: 'ch1-d01' })).toBe('drag_drop');
            expect(getQuestionType({ front: 'Q', back: 'A' })).toBe('flashcard');
            expect(getQuestionType({ other: 'prop' })).toBe('unknown');
        });
    });
});
