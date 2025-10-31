// Quiz logic and state management

class QuizEngine {
    constructor(questions) {
        this.allQuestions = questions;
        this.currentQuestions = [];
        this.currentIndex = 0;
        this.answers = [];
        this.startTime = null;
        this.questionStartTime = null;
        this.config = {
            numQuestions: 30,
            mode: 'mixed',
            categories: ['all'],
            difficulties: ['easy', 'medium', 'hard'],
            enableTimer: false,
            enableSounds: true
        };
    }
    
    // Initialize quiz with configuration
    initialize(config) {
        this.config = { ...this.config, ...config };
        this.filterQuestions();
        this.shuffleQuestions();
        this.currentQuestions = this.currentQuestions.slice(0, this.config.numQuestions);
        this.currentIndex = 0;
        this.answers = [];
        this.startTime = Date.now();
        return this.currentQuestions.length;
    }
    
    // Filter questions based on category and difficulty
    filterQuestions() {
        this.currentQuestions = this.allQuestions.filter(q => {
            const categoryMatch = this.config.categories.includes('all') || 
                                 this.config.categories.includes(q.category);
            const difficultyMatch = this.config.difficulties.includes(q.difficulty);
            
            // Filter by mode
            let modeMatch = true;
            if (this.config.mode === 'qcm') {
                modeMatch = q.type === 'qcm';
            } else if (this.config.mode === 'flashcard') {
                modeMatch = q.type === 'flashcard';
            }
            // 'mixed' accepts all
            
            return categoryMatch && difficultyMatch && modeMatch;
        });
    }
    
    // Shuffle questions
    shuffleQuestions() {
        for (let i = this.currentQuestions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.currentQuestions[i], this.currentQuestions[j]] = 
            [this.currentQuestions[j], this.currentQuestions[i]];
        }
    }
    
    // Get current question
    getCurrentQuestion() {
        if (this.currentIndex >= this.currentQuestions.length) {
            return null;
        }
        this.questionStartTime = Date.now();
        return this.currentQuestions[this.currentIndex];
    }
    
    // Submit answer for QCM
    submitQCMAnswer(selectedIndex) {
        const question = this.currentQuestions[this.currentIndex];
        const isCorrect = selectedIndex === question.correct_index;
        const timeSpent = Date.now() - this.questionStartTime;
        
        this.answers.push({
            questionId: question.id,
            type: 'qcm',
            selectedIndex,
            correct: isCorrect,
            timeSpent,
            question: question
        });
        
        return {
            isCorrect,
            correctIndex: question.correct_index,
            explanation: question.explanation,
            formula: question.formula
        };
    }
    
    // Submit flashcard response
    submitFlashcardResponse(mastered) {
        const question = this.currentQuestions[this.currentIndex];
        const timeSpent = Date.now() - this.questionStartTime;
        
        this.answers.push({
            questionId: question.id,
            type: 'flashcard',
            mastered,
            timeSpent,
            question: question
        });
        
        return {
            mastered
        };
    }
    
    // Move to next question
    nextQuestion() {
        this.currentIndex++;
        return this.getCurrentQuestion();
    }
    
    // Check if quiz is complete
    isComplete() {
        return this.currentIndex >= this.currentQuestions.length;
    }
    
    // Get progress percentage
    getProgress() {
        return (this.currentIndex / this.currentQuestions.length) * 100;
    }
    
    // Get results
    getResults() {
        const totalQuestions = this.currentQuestions.length;
        const qcmAnswers = this.answers.filter(a => a.type === 'qcm');
        const correctQCM = qcmAnswers.filter(a => a.correct).length;
        const totalQCM = qcmAnswers.length;
        
        const flashcardAnswers = this.answers.filter(a => a.type === 'flashcard');
        const masteredFlashcards = flashcardAnswers.filter(a => a.mastered).length;
        const totalFlashcards = flashcardAnswers.length;
        
        const totalCorrect = correctQCM + (masteredFlashcards / 2); // Flashcards count as 0.5
        const score = (totalCorrect / totalQuestions) * 100;
        
        const totalTime = Date.now() - this.startTime;
        const avgTime = this.answers.reduce((sum, a) => sum + a.timeSpent, 0) / this.answers.length;
        
        return {
            score: Math.round(score),
            totalQuestions,
            correctAnswers: Math.round(totalCorrect),
            incorrectAnswers: totalQuestions - Math.round(totalCorrect),
            qcmStats: {
                total: totalQCM,
                correct: correctQCM,
                incorrect: totalQCM - correctQCM
            },
            flashcardStats: {
                total: totalFlashcards,
                mastered: masteredFlashcards,
                toReview: totalFlashcards - masteredFlashcards
            },
            timeStats: {
                total: totalTime,
                average: avgTime
            },
            answers: this.answers,
            categories: this.getCategoryStats()
        };
    }
    
    // Get category statistics
    getCategoryStats() {
        const categoryStats = {};
        
        this.currentQuestions.forEach(q => {
            if (!categoryStats[q.category]) {
                categoryStats[q.category] = { total: 0, correct: 0 };
            }
            categoryStats[q.category].total++;
        });
        
        this.answers.forEach(a => {
            if (a.type === 'qcm' && a.correct) {
                categoryStats[a.question.category].correct++;
            }
        });
        
        return categoryStats;
    }
}
