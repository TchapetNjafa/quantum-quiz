/**
 * QUANTUM QUIZ - Main Application Script
 * PHY321 - Université de Yaoundé I
 *
 * Point d'entrée principal de l'application
 */

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const CONFIG = {
    QUESTIONS_FILE: 'data/questions.json',
    STORAGE_KEY: 'quantum_quiz_data',
    DEFAULT_QUESTION_COUNT: 20,
    TIMER_DURATION: 30 * 60, // 30 minutes en secondes pour mode examen
};

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

const AppState = {
    questionsData: null,
    userStats: null,
    currentConfig: null,
    theme: 'dark',

    init() {
        this.loadUserStats();
        this.loadTheme();
    },

    loadUserStats() {
        const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (stored) {
            try {
                this.userStats = JSON.parse(stored);
            } catch (e) {
                console.error('Error loading user stats:', e);
                this.userStats = this.getDefaultStats();
            }
        } else {
            this.userStats = this.getDefaultStats();
        }
    },

    getDefaultStats() {
        return {
            total_questions_answered: 0,
            correct_answers: 0,
            chapters_completed: [],
            average_score: 0,
            quiz_history: [],
            preferences: {
                sound_enabled: true,
                theme: 'dark',
                keyboard_shortcuts: true
            }
        };
    },

    saveUserStats() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(this.userStats));
        } catch (e) {
            console.error('Error saving user stats:', e);
        }
    },

    loadTheme() {
        const theme = this.userStats?.preferences?.theme || 'dark';
        this.setTheme(theme);
    },

    setTheme(theme) {
        this.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        if (this.userStats) {
            this.userStats.preferences.theme = theme;
            this.saveUserStats();
        }
    },

    toggleTheme() {
        const newTheme = this.theme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        updateThemeIcon();
    }
};

// ============================================================================
// DOM READY
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Quantum Quiz Initializing...');

    // Initialize app state
    AppState.init();

    // Load questions data
    loadQuestionsData();

    // Setup event listeners
    setupEventListeners();

    // Initialize UI
    initializeUI();

    console.log('✅ Quantum Quiz Ready!');
});

// ============================================================================
// DATA LOADING
// ============================================================================

async function loadQuestionsData() {
    try {
        // Cache-busting pour Firefox + headers CORS
        const cacheBust = `?v=${Date.now()}`;
        console.log('📥 Chargement des questions depuis:', CONFIG.QUESTIONS_FILE);

        const response = await fetch(CONFIG.QUESTIONS_FILE + cacheBust, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-cache'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data || !data.chapters || !Array.isArray(data.chapters)) {
            throw new Error('Format de données invalide');
        }

        AppState.questionsData = data;
        console.log('✅ Questions chargées avec succès:', AppState.questionsData.metadata);
        console.log(`   Total: ${AppState.questionsData.metadata.total_questions} questions`);
        updateStatistics();
    } catch (error) {
        console.error('❌ Erreur de chargement des questions:', error);
        console.error('   Détails:', error.message);
        showError(`Impossible de charger les questions: ${error.message}. Veuillez rafraîchir la page.`);
    }
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

function setupEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            AppState.toggleTheme();
        });
    }

    // Chapter selection
    const chapterSelect = document.getElementById('chapter-select');
    if (chapterSelect) {
        chapterSelect.addEventListener('change', updateChapterDescription);
    }

    // Question count slider
    const questionCount = document.getElementById('question-count');
    const questionCountDisplay = document.getElementById('question-count-display');
    if (questionCount && questionCountDisplay) {
        questionCount.addEventListener('input', (e) => {
            questionCountDisplay.textContent = e.target.value;
        });
    }

    // Start quiz button
    const startBtn = document.getElementById('start-quiz-btn');
    if (startBtn) {
        startBtn.addEventListener('click', startQuiz);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', handleGlobalKeyboard);
}

// ============================================================================
// UI INITIALIZATION
// ============================================================================

function initializeUI() {
    updateStatistics();
    updateThemeIcon();
    loadRecentQuizzes();
}

function updateStatistics() {
    const stats = AppState.userStats;

    // Update stat displays (utiliser les bons noms de propriétés de storage.js)
    updateStatDisplay('total-answered', stats.totalQuestions || 0);
    updateStatDisplay('correct-answers', stats.correctAnswers || 0);
    updateStatDisplay('average-score', `${Math.round(stats.averageScore || 0)}%`);

    // Calculate streak (utiliser l'historique depuis StorageManager)
    const history = StorageManager.getQuizHistory();
    const streak = calculateStreak(history);
    updateStatDisplay('streak', streak);

    // Update total questions from loaded data
    if (AppState.questionsData) {
        updateStatDisplay('total-questions', `${AppState.questionsData.metadata.total_questions}+`);
    }
}

function updateStatDisplay(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function calculateStreak(history) {
    if (!history || history.length === 0) return 0;

    // Sort by date descending
    const sorted = [...history].sort((a, b) =>
        new Date(b.date) - new Date(a.date)
    );

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const quiz of sorted) {
        const quizDate = new Date(quiz.date);
        quizDate.setHours(0, 0, 0, 0);

        const diffDays = Math.floor((today - quizDate) / (1000 * 60 * 60 * 24));

        if (diffDays === streak) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

function updateChapterDescription() {
    const select = document.getElementById('chapter-select');
    const hint = document.getElementById('chapter-description');

    if (!select || !hint || !AppState.questionsData) return;

    const value = select.value;

    if (value === 'all') {
        hint.textContent = 'Révision complète de tous les concepts du cours';
    } else {
        const chapterId = parseInt(value);
        const chapter = AppState.questionsData.chapters.find(c => c.chapter_id === chapterId);
        if (chapter) {
            hint.textContent = chapter.chapter_description;
        }
    }
}

function updateThemeIcon() {
    const icon = document.querySelector('.theme-toggle .icon');
    if (icon) {
        icon.textContent = AppState.theme === 'dark' ? '🌙' : '☀️';
    }
}

function loadRecentQuizzes() {
    const container = document.getElementById('recent-quiz-list');
    if (!container) return;

    const history = AppState.userStats.quiz_history;

    if (!history || history.length === 0) {
        container.innerHTML = '<p class="empty-state">Aucun quiz complété pour le moment. Lancez votre première session !</p>';
        return;
    }

    // Take last 5 quizzes
    const recent = history.slice(-5).reverse();

    container.innerHTML = recent.map(quiz => `
        <div class="quiz-history-item">
            <div class="quiz-history-header">
                <strong>Chapitre ${quiz.chapter_id}</strong>
                <span class="quiz-history-date">${formatDate(quiz.date)}</span>
            </div>
            <div class="quiz-history-score">
                <span class="score ${getScoreClass(quiz.score)}">
                    ${quiz.score}%
                </span>
                <span class="quiz-history-time">⏱️ ${formatTime(quiz.time_spent)}</span>
            </div>
        </div>
    `).join('');
}

// ============================================================================
// QUIZ START
// ============================================================================

function startQuiz() {
    // Get configuration
    const chapter = document.getElementById('chapter-select')?.value;
    const questionCount = parseInt(document.getElementById('question-count')?.value) || CONFIG.DEFAULT_QUESTION_COUNT;

    // Get selected difficulties
    const difficulties = Array.from(document.querySelectorAll('input[name="difficulty"]:checked'))
        .map(cb => cb.value);

    if (difficulties.length === 0) {
        showError('Veuillez sélectionner au moins un niveau de difficulté.');
        return;
    }

    // Get selected question types
    const questionTypes = Array.from(document.querySelectorAll('input[name="question-type"]:checked'))
        .map(cb => cb.value);

    if (questionTypes.length === 0) {
        showError('Veuillez sélectionner au moins un type de question.');
        return;
    }

    // Get mode
    const mode = document.querySelector('input[name="mode"]:checked')?.value || 'learning';

    // Validate data loaded
    if (!AppState.questionsData) {
        showError('Les questions ne sont pas encore chargées. Veuillez patienter...');
        return;
    }

    // Store configuration
    const config = {
        chapter,
        questionCount,
        difficulties,
        questionTypes,  // Nouveau : types de questions sélectionnés
        mode,
        timestamp: new Date().toISOString()
    };

    // Son de démarrage
    if (typeof AudioSystem !== 'undefined') {
        AudioSystem.start();
    }

    // Save to sessionStorage
    sessionStorage.setItem('quiz_config', JSON.stringify(config));

    // Navigate to quiz page
    setTimeout(() => {
        window.location.href = 'quiz.html';
    }, 300);
}

// ============================================================================
// GLOBAL KEYBOARD SHORTCUTS
// ============================================================================

function handleGlobalKeyboard(e) {
    if (!AppState.userStats?.preferences?.keyboard_shortcuts) return;

    // Don't interfere with input fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch(e.key) {
        case 'h':
        case 'H':
            toggleHelp();
            break;
        case 'Escape':
            // Handle escape (close modals, etc.)
            closeModals();
            break;
    }
}

function toggleHelp() {
    // Toggle help modal or shortcuts display
    console.log('Help toggled');
}

function closeModals() {
    // Close any open modals
    const modals = document.querySelectorAll('.modal[style*="display: block"]');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function showError(message) {
    // Simple error display
    alert(message);
    // TODO: Implement better error UI
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;

    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}min ${secs}s`;
}

function getScoreClass(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'needs-improvement';
}

// ============================================================================
// EXPORTS (if needed for modules)
// ============================================================================

window.QuantumQuiz = {
    AppState,
    CONFIG
};

console.log('📚 Quantum Quiz App Module Loaded');
