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
        // Check if user has a saved preference
        const savedTheme = this.userStats?.preferences?.theme;

        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            // Auto-detect system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.setTheme(prefersDark ? 'dark' : 'light');
        }

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            // Only auto-switch if user hasn't manually set a preference
            if (!this.userStats?.preferences?.themeManuallySet) {
                this.setTheme(e.matches ? 'dark' : 'light', false);
                updateThemeIcon();
            }
        });
    },

    setTheme(theme, manuallySet = true) {
        this.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        if (this.userStats) {
            this.userStats.preferences.theme = theme;
            if (manuallySet) {
                this.userStats.preferences.themeManuallySet = true;
            }
            this.saveUserStats();
        }
    },

    toggleTheme() {
        const newTheme = this.theme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme, true);
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

    // Rafraîchir les stats quand la page devient visible (revenir de results.html)
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            console.log('Page visible, rafraîchissement des stats...');
            updateStatistics();
        }
    });

    // Aussi au focus de la fenêtre
    window.addEventListener('focus', () => {
        console.log('Fenêtre focusée, rafraîchissement des stats...');
        updateStatistics();
    });

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
    // Utiliser StorageManager pour obtenir les stats à jour
    const stats = StorageManager.getUserStats();

    // Update stat displays
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
    // Affiche une notification d'erreur élégante
    if (typeof showToast === 'function') {
        showToast(message, 'error', 5000);
    } else {
        // Fallback si showToast n'est pas disponible
        console.error('Erreur:', message);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.innerHTML = `
            <span class="error-icon">⚠️</span>
            <span class="error-message">${message}</span>
            <button class="error-close" onclick="this.parentElement.remove()">×</button>
        `;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(255, 107, 107, 0.4);
            z-index: 10001;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideDown 0.3s ease-out;
            max-width: 90%;
        `;
        document.body.appendChild(errorDiv);
        setTimeout(() => {
            errorDiv.style.opacity = '0';
            errorDiv.style.transform = 'translateX(-50%) translateY(-20px)';
            errorDiv.style.transition = 'all 0.3s ease-in';
            setTimeout(() => errorDiv.remove(), 300);
        }, 5000);
    }
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
// SERVICE WORKER REGISTRATION
// ============================================================================

// Enregistrer le Service Worker pour améliorer les performances et mode offline
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Utiliser un chemin relatif pour fonctionner dans différents contextes
        const swPath = 'service-worker.js';
        navigator.serviceWorker.register(swPath)
            .then((registration) => {
                console.log('✅ Service Worker enregistré:', registration.scope);

                // Vérifier les mises à jour
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('🔄 Nouvelle version disponible');
                        }
                    });
                });
            })
            .catch((err) => {
                console.warn('⚠️ Erreur Service Worker:', err);
            });
    });
}

// ============================================================================
// EXPORTS (if needed for modules)
// ============================================================================

window.QuantumQuiz = {
    AppState,
    CONFIG
};

console.log('📚 Quantum Quiz App Module Loaded');
