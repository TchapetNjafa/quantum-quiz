// localStorage management for quiz progress tracking

const Storage = {
    // Save quiz results
    saveQuizResult(quizData) {
        const results = this.getQuizResults();
        results.push({
            ...quizData,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('quantum_quiz_results', JSON.stringify(results));
        this.updateStats();
    },
    
    // Get all quiz results
    getQuizResults() {
        const data = localStorage.getItem('quantum_quiz_results');
        return data ? JSON.parse(data) : [];
    },
    
    // Get statistics
    getStats() {
        const stats = localStorage.getItem('quantum_quiz_stats');
        return stats ? JSON.parse(stats) : {
            totalQuizzes: 0,
            averageScore: 0,
            totalQuestions: 0,
            correctAnswers: 0,
            badges: []
        };
    },
    
    // Update statistics
    updateStats() {
        const results = this.getQuizResults();
        if (results.length === 0) return;
        
        const totalQuizzes = results.length;
        const totalQuestions = results.reduce((sum, r) => sum + r.totalQuestions, 0);
        const correctAnswers = results.reduce((sum, r) => sum + r.correctAnswers, 0);
        const averageScore = (correctAnswers / totalQuestions) * 100;
        
        const stats = {
            totalQuizzes,
            averageScore: Math.round(averageScore),
            totalQuestions,
            correctAnswers,
            badges: this.calculateBadges(results)
        };
        
        localStorage.setItem('quantum_quiz_stats', JSON.stringify(stats));
    },
    
    // Calculate badges
    calculateBadges(results) {
        const badges = [];
        
        // Premier pas quantique
        if (results.length >= 1) {
            badges.push('premier_pas');
        }
        
        // Cohérence (3 quiz > 80%)
        const highScores = results.filter(r => r.score >= 80);
        if (highScores.length >= 3) {
            badges.push('coherence');
        }
        
        // Opérateur hermitien (100% à un quiz)
        const perfectScores = results.filter(r => r.score === 100);
        if (perfectScores.length >= 1) {
            badges.push('operateur_hermitien');
        }
        
        // Marathonien (10 quiz complétés)
        if (results.length >= 10) {
            badges.push('marathonien');
        }
        
        // Perfectionniste (5 quiz > 90%)
        const excellentScores = results.filter(r => r.score >= 90);
        if (excellentScores.length >= 5) {
            badges.push('perfectionniste');
        }
        
        return badges;
    },
    
    // Get questions to review
    getQuestionsToReview() {
        const data = localStorage.getItem('quantum_quiz_review');
        return data ? JSON.parse(data) : [];
    },
    
    // Add question to review
    addToReview(questionId) {
        const review = this.getQuestionsToReview();
        if (!review.includes(questionId)) {
            review.push(questionId);
            localStorage.setItem('quantum_quiz_review', JSON.stringify(review));
        }
    },
    
    // Clear review list
    clearReview() {
        localStorage.removeItem('quantum_quiz_review');
    },
    
    // Clear all data
    clearAll() {
        localStorage.removeItem('quantum_quiz_results');
        localStorage.removeItem('quantum_quiz_stats');
        localStorage.removeItem('quantum_quiz_review');
    }
};
