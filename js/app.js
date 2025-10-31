// Main application controller

let questionsData = null;
let quizEngine = null;
let timerInterval = null;
let elapsedTime = 0;

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    loadQuestions();
    setupEventListeners();
    updatePersonalStats();
    MathJax.typesetPromise();
});

// Load questions from JSON
async function loadQuestions() {
    try {
        const response = await fetch('data/questions.json');
        questionsData = await response.json();
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('home-screen').style.display = 'flex';
    } catch (error) {
        console.error('Error loading questions:', error);
        document.getElementById('loading-screen').innerHTML = 
            '<h2>Erreur de chargement. Vérifiez que le fichier questions.json existe.</h2>';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Number of questions slider
    const numQuestionsSlider = document.getElementById('num-questions');
    const numQuestionsValue = document.getElementById('num-questions-value');
    const estimatedTime = document.getElementById('estimated-time');
    
    numQuestionsSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        numQuestionsValue.textContent = value;
        estimatedTime.textContent = `~${Math.round(value * 0.8)} minutes`;
    });
    
    // Mode selection
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Advanced options toggle
    document.getElementById('toggle-advanced').addEventListener('click', () => {
        const options = document.getElementById('advanced-options');
        const arrow = document.querySelector('#toggle-advanced .arrow');
        if (options.style.display === 'none') {
            options.style.display = 'block';
            arrow.textContent = '▲';
        } else {
            options.style.display = 'none';
            arrow.textContent = '▼';
        }
    });
    
    // Start button
    document.getElementById('start-btn').addEventListener('click', startQuiz);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
    
    // Results actions
    document.getElementById('restart-btn')?.addEventListener('click', () => {
        showScreen('home-screen');
    });
    
    document.getElementById('retry-wrong-btn')?.addEventListener('click', retryWrongQuestions);
    
    // Pause/Resume
    document.getElementById('pause-btn')?.addEventListener('click', togglePause);
    document.getElementById('resume-btn')?.addEventListener('click', togglePause);
    document.getElementById('abandon-btn')?.addEventListener('click', showAbandonConfirm);
    document.getElementById('abandon-confirm-btn')?.addEventListener('click', abandonQuiz);
}

// Start quiz
function startQuiz() {
    if (!questionsData) {
        alert('Les questions ne sont pas encore chargées.');
        return;
    }
    
    // Get configuration
    const numQuestions = parseInt(document.getElementById('num-questions').value);
    const activeMode = document.querySelector('.mode-btn.active').dataset.mode;
    const categories = Array.from(document.getElementById('category-filter').selectedOptions)
        .map(opt => opt.value);
    const difficulties = Array.from(document.querySelectorAll('#advanced-options input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    const enableTimer = document.getElementById('enable-timer')?.checked || false;
    const enableSounds = document.getElementById('enable-sounds')?.checked !== false; // Default true
    
    // Initialize quiz engine
    quizEngine = new QuizEngine(questionsData.questions);
    const questionCount = quizEngine.initialize({
        numQuestions,
        mode: activeMode,
        categories: categories.length ? categories : ['all'],
        difficulties,
        enableTimer,
        enableSounds
    });
    
    if (questionCount === 0) {
        alert('Aucune question ne correspond aux critères sélectionnés.');
        return;
    }
    
    // Show quiz screen
    showScreen('quiz-screen');
    displayQuestion();
    
    // Start timer if enabled
    if (enableTimer) {
        elapsedTime = 0;
        startTimer();
    }
    
    playSound('click');
}

// Display current question
function displayQuestion() {
    const question = quizEngine.getCurrentQuestion();
    if (!question) {
        finishQuiz();
        return;
    }
    
    // Update progress
    updateProgress();
    
    // Hide all containers
    document.getElementById('qcm-container').style.display = 'none';
    document.getElementById('flashcard-container').style.display = 'none';
    
    // Show appropriate container
    if (question.type === 'qcm') {
        displayQCM(question);
    } else {
        displayFlashcard(question);
    }
    
    // Update MathJax
    MathJax.typesetPromise();
}

// Display QCM question
function displayQCM(question) {
    const container = document.getElementById('qcm-container');
    const questionText = document.getElementById('qcm-question');
    const optionsContainer = document.getElementById('qcm-options');
    const feedbackContainer = document.getElementById('qcm-feedback');
    const nextBtn = document.getElementById('qcm-next');
    
    container.style.display = 'block';
    questionText.textContent = question.question;
    
    // Clear and create options
    optionsContainer.innerHTML = '';
    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.innerHTML = `
            <span class="option-number">${index + 1}</span>
            <span>${option}</span>
        `;
        optionDiv.addEventListener('click', () => selectOption(index, optionDiv));
        optionsContainer.appendChild(optionDiv);
    });
    
    // Hide feedback initially
    feedbackContainer.style.display = 'none';
    nextBtn.style.display = 'none';
}

// Select QCM option
function selectOption(index, optionElement) {
    const question = quizEngine.getCurrentQuestion();
    const result = quizEngine.submitQCMAnswer(index);
    
    // Disable all options
    document.querySelectorAll('.option').forEach(opt => {
        opt.style.pointerEvents = 'none';
        opt.classList.remove('selected');
    });
    
    // Mark selected and correct/incorrect
    optionElement.classList.add('selected');
    if (result.isCorrect) {
        optionElement.classList.add('correct');
        playSound('correct');
    } else {
        optionElement.classList.add('incorrect');
        playSound('incorrect');
        // Mark correct answer
        document.querySelectorAll('.option')[result.correctIndex].classList.add('correct');
    }
    
    // Show feedback
    showQCMFeedback(result);
}

// Show QCM feedback
function showQCMFeedback(result) {
    const feedbackContainer = document.getElementById('qcm-feedback');
    const feedbackMessage = document.getElementById('qcm-feedback-message');
    const explanation = document.getElementById('qcm-explanation');
    const formulaDisplay = document.getElementById('qcm-formula');
    const nextBtn = document.getElementById('qcm-next');
    
    feedbackContainer.style.display = 'block';
    feedbackMessage.textContent = result.isCorrect ? '✓ Correct !' : '✗ Incorrect';
    feedbackMessage.className = `feedback-message ${result.isCorrect ? 'correct' : 'incorrect'}`;
    explanation.textContent = result.explanation;
    
    if (result.formula) {
        formulaDisplay.textContent = result.formula;
        formulaDisplay.style.display = 'block';
    } else {
        formulaDisplay.style.display = 'none';
    }
    
    nextBtn.style.display = 'block';
}

// Display flashcard
function displayFlashcard(question) {
    const container = document.getElementById('flashcard-container');
    const frontText = document.getElementById('flashcard-front');
    const backText = document.getElementById('flashcard-back');
    const formulaDisplay = document.getElementById('flashcard-formula');
    const flashcard = document.getElementById('flashcard');
    const masterBtn = document.getElementById('master-btn');
    const reviewBtn = document.getElementById('review-btn');
    const flipBtn = document.getElementById('flip-btn');
    const nextBtn = document.getElementById('flashcard-next');
    
    // Show container
    container.style.display = 'block';
    
    // Reset flashcard state
    flashcard.classList.remove('flipped');
    
    // Clear and set front content - preserve line breaks
    frontText.innerHTML = '';
    // Replace newlines with <br> for proper display
    const frontLines = question.front.split('\n');
    frontLines.forEach((line, index) => {
        if (line.trim()) {
            frontText.appendChild(document.createTextNode(line));
            if (index < frontLines.length - 1) {
                frontText.appendChild(document.createElement('br'));
            }
        } else if (index < frontLines.length - 1) {
            frontText.appendChild(document.createElement('br'));
        }
    });
    
    // Clear and set back content - preserve line breaks
    backText.innerHTML = '';
    const backLines = question.back.split('\n');
    backLines.forEach((line, index) => {
        if (line.trim()) {
            backText.appendChild(document.createTextNode(line));
            if (index < backLines.length - 1) {
                backText.appendChild(document.createElement('br'));
            }
        } else if (index < backLines.length - 1) {
            backText.appendChild(document.createElement('br'));
        }
    });
    
    // Handle formula
    if (question.formula) {
        formulaDisplay.innerHTML = '';
        const formulaContent = document.createTextNode(question.formula);
        formulaDisplay.appendChild(formulaContent);
        formulaDisplay.style.display = 'block';
    } else {
        formulaDisplay.style.display = 'none';
        formulaDisplay.innerHTML = '';
    }
    
    // Reset buttons visibility
    if (nextBtn) nextBtn.style.display = 'none';
    if (masterBtn) masterBtn.style.display = 'none';
    if (reviewBtn) reviewBtn.style.display = 'none';
    if (flipBtn) flipBtn.style.display = 'block';
    
    // Setup flip button
    if (flipBtn) {
        flipBtn.onclick = () => {
            flashcard.classList.toggle('flipped');
            playSound('flip');
            
            // Show action buttons only when flipped to back
            if (flashcard.classList.contains('flipped')) {
                if (masterBtn) masterBtn.style.display = 'flex';
                if (reviewBtn) reviewBtn.style.display = 'flex';
                if (flipBtn) flipBtn.style.display = 'none';
            } else {
                if (masterBtn) masterBtn.style.display = 'none';
                if (reviewBtn) reviewBtn.style.display = 'none';
                if (flipBtn) flipBtn.style.display = 'block';
            }
        };
    }
    
    // Setup action buttons
    if (masterBtn) {
        masterBtn.onclick = () => {
            handleFlashcardResponse(true);
        };
    }
    
    if (reviewBtn) {
        reviewBtn.onclick = () => {
            handleFlashcardResponse(false);
        };
    }
    
    // Ensure both sides have same height for 3D flip to work properly
    // Use ResizeObserver or setTimeout to sync heights after content loads
    const syncFlashcardHeights = () => {
        const frontElement = frontText.closest('.flashcard-front');
        const backElement = backText.closest('.flashcard-back');
        
        if (frontElement && backElement) {
            // Reset heights first
            frontElement.style.height = 'auto';
            backElement.style.height = 'auto';
            
            // Get actual heights
            const frontHeight = frontElement.offsetHeight;
            const backHeight = backElement.offsetHeight;
            
            // Use the maximum height for both
            const maxHeight = Math.max(frontHeight, backHeight, 400);
            
            // Set both to same height
            frontElement.style.height = maxHeight + 'px';
            backElement.style.height = maxHeight + 'px';
        }
    };
    
    // Sync heights after content is set and MathJax renders
    setTimeout(() => {
        syncFlashcardHeights();
        
        // Re-render MathJax after content update
        if (window.MathJax && window.MathJax.typesetPromise) {
            MathJax.typesetPromise([frontText, backText, formulaDisplay]).then(() => {
                // Sync again after MathJax renders (formulas can change height)
                setTimeout(syncFlashcardHeights, 100);
            }).catch(() => {
                syncFlashcardHeights();
            });
        } else {
            syncFlashcardHeights();
        }
    }, 200);
}

// Handle flashcard response
function handleFlashcardResponse(mastered) {
    const question = quizEngine.getCurrentQuestion();
    if (question) {
        quizEngine.submitFlashcardResponse(mastered);
        
        if (!mastered) {
            Storage.addToReview(question.id);
        }
    }
    
    document.getElementById('flashcard-next').style.display = 'block';
    playSound(mastered ? 'correct' : 'incorrect');
}

// Next question
function nextQuestion() {
    playSound('click');
    if (quizEngine.nextQuestion()) {
        displayQuestion();
    } else {
        finishQuiz();
    }
}

// Update progress bar
function updateProgress() {
    const progress = quizEngine.getProgress();
    const currentIndex = quizEngine.currentIndex;
    const totalQuestions = quizEngine.currentQuestions.length;
    
    document.getElementById('progress-fill').style.width = `${progress}%`;
    document.getElementById('question-counter').textContent = 
        `Question ${currentIndex + 1}/${totalQuestions}`;
}

// Start timer
function startTimer() {
    const timerDisplay = document.getElementById('timer');
    timerDisplay.style.display = 'inline-block';
    
    timerInterval = setInterval(() => {
        elapsedTime++;
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;
        timerDisplay.textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

// Stop timer
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// Finish quiz and show results
function finishQuiz() {
    stopTimer();
    playSound('complete');
    
    const results = quizEngine.getResults();
    
    // Save results
    Storage.saveQuizResult({
        score: results.score,
        totalQuestions: results.totalQuestions,
        correctAnswers: results.correctAnswers,
        timeSpent: results.timeStats.total
    });
    
    // Display results
    showResults(results);
}

// Show results screen
function showResults(results) {
    showScreen('results-screen');
    
    // Update score display
    const scorePercentage = document.getElementById('score-percentage');
    const scoreGrade = document.getElementById('score-grade');
    const scoreCircle = document.getElementById('score-circle-fill');
    const scoreMessage = document.getElementById('score-message');
    
    scorePercentage.textContent = `${results.score}%`;
    scoreGrade.textContent = `${(results.score / 5).toFixed(1)}/20`;
    
    // Animate circle
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (results.score / 100) * circumference;
    scoreCircle.style.strokeDashoffset = offset;
    
    // Score message
    let message = '';
    if (results.score >= 90) {
        message = 'Superposition d\'excellence ! 🌟';
    } else if (results.score >= 70) {
        message = 'Bon niveau quantique ! 🎯';
    } else if (results.score >= 50) {
        message = 'État intermédiaire, à consolider 📚';
    } else {
        message = 'L\'effondrement de la fonction d\'onde... Révisions nécessaires ! 💪';
    }
    scoreMessage.textContent = message;
    
    // Update statistics
    document.getElementById('correct-answers').textContent = results.correctAnswers;
    document.getElementById('incorrect-answers').textContent = results.incorrectAnswers;
    document.getElementById('avg-time').textContent = 
        `${Math.round(results.timeStats.average / 1000)}s`;
    document.getElementById('total-time').textContent = 
        formatTime(results.timeStats.total);
    
    // Display review list
    displayReviewList(results.answers);
    
    // Update personal stats
    updatePersonalStats();
}

// Display review list
function displayReviewList(answers) {
    const reviewList = document.getElementById('review-list');
    reviewList.innerHTML = '';
    
    answers.forEach((answer, index) => {
        const item = document.createElement('div');
        item.className = `review-item ${answer.type === 'qcm' && answer.correct ? 'correct' : 'incorrect'}`;
        
        let content = `
            <h3>Question ${index + 1}</h3>
            <p><strong>${answer.question.type === 'qcm' ? answer.question.question : answer.question.front}</strong></p>
        `;
        
        if (answer.type === 'qcm') {
            content += `
                <p>Votre réponse: ${answer.question.options[answer.selectedIndex]}</p>
                <p>Bonne réponse: ${answer.question.options[answer.question.correct_index]}</p>
            `;
        } else {
            content += `<p>${answer.mastered ? '✓ Maîtrisé' : '✗ À revoir'}</p>`;
        }
        
        content += `<p class="explanation">${answer.question.explanation || answer.question.back}</p>`;
        
        if (answer.question.formula) {
            content += `<div class="formula-display">${answer.question.formula}</div>`;
        }
        
        item.innerHTML = content;
        reviewList.appendChild(item);
    });
    
    MathJax.typesetPromise();
}

// Format time
function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}

// Show screen
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.style.display = 'none';
    });
    document.getElementById(screenId).style.display = 'flex';
}

// Toggle pause
function togglePause() {
    const modal = document.getElementById('pause-modal');
    if (modal.style.display === 'none') {
        modal.style.display = 'flex';
        stopTimer();
    } else {
        modal.style.display = 'none';
        if (quizEngine.config.enableTimer) {
            startTimer();
        }
    }
}

// Show abandon confirm
function showAbandonConfirm() {
    document.getElementById('pause-modal').style.display = 'flex';
}

// Abandon quiz
function abandonQuiz() {
    stopTimer();
    showScreen('home-screen');
    document.getElementById('pause-modal').style.display = 'none';
}

// Retry wrong questions
function retryWrongQuestions() {
    const wrongQuestionIds = quizEngine.answers
        .filter(a => (a.type === 'qcm' && !a.correct) || (a.type === 'flashcard' && !a.mastered))
        .map(a => a.questionId);
    
    // Filter questions
    const wrongQuestions = questionsData.questions.filter(q => wrongQuestionIds.includes(q.id));
    
    if (wrongQuestions.length === 0) {
        alert('Aucune question à refaire !');
        return;
    }
    
    quizEngine = new QuizEngine(wrongQuestions);
    quizEngine.initialize({
        numQuestions: wrongQuestions.length,
        mode: 'mixed',
        categories: ['all'],
        difficulties: ['easy', 'medium', 'hard'],
        enableTimer: false,
        enableSounds: true
    });
    
    showScreen('quiz-screen');
    displayQuestion();
}

// Handle keyboard shortcuts
function handleKeyboard(e) {
    // Don't handle if typing in input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    
    const currentScreen = document.querySelector('.screen[style*="flex"]')?.id;
    
    if (currentScreen === 'quiz-screen') {
        // QCM shortcuts (1-4)
        if (e.key >= '1' && e.key <= '4') {
            const index = parseInt(e.key) - 1;
            const options = document.querySelectorAll('.option');
            if (options[index] && !options[index].classList.contains('selected')) {
                options[index].click();
            }
        }
        
        // Space for next
        if (e.key === ' ') {
            e.preventDefault();
            const nextBtn = document.querySelector('.next-btn[style*="block"]');
            if (nextBtn) {
                nextQuestion();
            }
        }
        
        // F to flip flashcard
        if (e.key === 'f' || e.key === 'F') {
            const flipBtn = document.getElementById('flip-btn');
            if (flipBtn && flipBtn.offsetParent !== null) {
                flipBtn.click();
            }
        }
        
        // P for pause
        if (e.key === 'p' || e.key === 'P') {
            togglePause();
        }
        
        // Esc for abandon
        if (e.key === 'Escape') {
            showAbandonConfirm();
        }
    }
}

// Play sound - uses Web Audio API for system sounds
function playSound(type) {
    if (!quizEngine || !quizEngine.config.enableSounds) return;
    
    // Try system sounds first (works everywhere, no CORS issues)
    playSystemSound(type);
    
    // Fallback to audio files if available (optional)
    const audio = document.getElementById(`sound-${type}`);
    if (audio && audio.src && !audio.src.startsWith('data:')) {
        audio.currentTime = 0;
        audio.play().catch(() => {
            // If audio file fails, system sound already played
        });
    }
}

// Update personal stats
function updatePersonalStats() {
    const stats = Storage.getStats();
    document.getElementById('quizzes-completed').textContent = stats.totalQuizzes;
    document.getElementById('average-score').textContent = `${stats.averageScore}%`;
}
