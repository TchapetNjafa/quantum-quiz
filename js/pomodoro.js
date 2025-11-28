/**
 * QUANTUM QUIZ - Timer Pomodoro
 * Technique de gestion du temps pour l'étude
 */

const PomodoroTimer = {
    // Configuration
    config: {
        workDuration: 25 * 60, // 25 minutes
        shortBreak: 5 * 60,    // 5 minutes
        longBreak: 15 * 60,    // 15 minutes
        sessionsBeforeLong: 4
    },

    // État
    state: {
        isRunning: false,
        isPaused: false,
        currentPhase: 'work', // work, shortBreak, longBreak
        timeRemaining: 25 * 60,
        sessionsCompleted: 0,
        totalStudyTime: 0
    },

    // Timer
    timerInterval: null,

    /**
     * Initialisation
     */
    init() {
        this.loadState();
        this.createWidget();
        console.log('🍅 Pomodoro initialisé');
    },

    /**
     * Charge l'état depuis localStorage
     */
    loadState() {
        try {
            const saved = localStorage.getItem('pomodoro_state');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.state.sessionsCompleted = parsed.sessionsCompleted || 0;
                this.state.totalStudyTime = parsed.totalStudyTime || 0;
            }
        } catch (e) {
            console.error('Erreur chargement Pomodoro:', e);
        }
    },

    /**
     * Sauvegarde l'état
     */
    saveState() {
        try {
            localStorage.setItem('pomodoro_state', JSON.stringify({
                sessionsCompleted: this.state.sessionsCompleted,
                totalStudyTime: this.state.totalStudyTime
            }));
        } catch (e) {
            console.error('Erreur sauvegarde Pomodoro:', e);
        }
    },

    /**
     * Crée le widget flottant
     */
    createWidget() {
        // Bouton toggle
        const button = document.createElement('button');
        button.id = 'pomodoro-toggle';
        button.className = 'pomodoro-toggle';
        button.innerHTML = '🍅';
        button.setAttribute('aria-label', 'Timer Pomodoro');
        button.onclick = () => this.toggleWidget();
        document.body.appendChild(button);

        // Widget
        const widget = document.createElement('div');
        widget.id = 'pomodoro-widget';
        widget.className = 'pomodoro-widget hidden';
        widget.innerHTML = this.getWidgetHTML();
        document.body.appendChild(widget);

        this.updateDisplay();
    },

    /**
     * HTML du widget
     */
    getWidgetHTML() {
        return `
            <div class="pomodoro-header">
                <h3>🍅 Pomodoro</h3>
                <button class="pomodoro-close" onclick="PomodoroTimer.toggleWidget()">×</button>
            </div>

            <div class="pomodoro-phase" id="pomodoro-phase">
                Session de travail
            </div>

            <div class="pomodoro-timer" id="pomodoro-display">
                25:00
            </div>

            <div class="pomodoro-progress">
                <div class="pomodoro-progress-bar" id="pomodoro-progress-bar"></div>
            </div>

            <div class="pomodoro-controls">
                <button class="pomo-btn" id="pomo-start" onclick="PomodoroTimer.start()">
                    ▶️ Démarrer
                </button>
                <button class="pomo-btn" id="pomo-pause" onclick="PomodoroTimer.pause()" style="display:none">
                    ⏸️ Pause
                </button>
                <button class="pomo-btn" id="pomo-resume" onclick="PomodoroTimer.resume()" style="display:none">
                    ▶️ Reprendre
                </button>
                <button class="pomo-btn secondary" onclick="PomodoroTimer.reset()">
                    🔄 Reset
                </button>
            </div>

            <div class="pomodoro-stats">
                <div class="pomo-stat">
                    <span class="pomo-stat-value" id="pomo-sessions">0</span>
                    <span class="pomo-stat-label">Sessions</span>
                </div>
                <div class="pomo-stat">
                    <span class="pomo-stat-value" id="pomo-total-time">0h</span>
                    <span class="pomo-stat-label">Étude</span>
                </div>
            </div>

            <div class="pomodoro-settings">
                <details>
                    <summary>⚙️ Paramètres</summary>
                    <div class="pomo-settings-content">
                        <label>
                            Travail: <input type="number" id="pomo-work" value="25" min="1" max="60"> min
                        </label>
                        <label>
                            Pause courte: <input type="number" id="pomo-short" value="5" min="1" max="30"> min
                        </label>
                        <label>
                            Pause longue: <input type="number" id="pomo-long" value="15" min="5" max="60"> min
                        </label>
                        <button onclick="PomodoroTimer.applySettings()">Appliquer</button>
                    </div>
                </details>
            </div>
        `;
    },

    /**
     * Toggle le widget
     */
    toggleWidget() {
        const widget = document.getElementById('pomodoro-widget');
        if (widget) {
            widget.classList.toggle('hidden');
        }
    },

    /**
     * Démarre le timer
     */
    start() {
        if (this.state.isRunning) return;

        this.state.isRunning = true;
        this.state.isPaused = false;

        document.getElementById('pomo-start').style.display = 'none';
        document.getElementById('pomo-pause').style.display = 'inline-block';
        document.getElementById('pomo-resume').style.display = 'none';

        this.timerInterval = setInterval(() => this.tick(), 1000);
    },

    /**
     * Met en pause
     */
    pause() {
        if (!this.state.isRunning || this.state.isPaused) return;

        this.state.isPaused = true;
        clearInterval(this.timerInterval);

        document.getElementById('pomo-pause').style.display = 'none';
        document.getElementById('pomo-resume').style.display = 'inline-block';
    },

    /**
     * Reprend
     */
    resume() {
        if (!this.state.isRunning || !this.state.isPaused) return;

        this.state.isPaused = false;

        document.getElementById('pomo-pause').style.display = 'inline-block';
        document.getElementById('pomo-resume').style.display = 'none';

        this.timerInterval = setInterval(() => this.tick(), 1000);
    },

    /**
     * Reset
     */
    reset() {
        clearInterval(this.timerInterval);
        this.state.isRunning = false;
        this.state.isPaused = false;
        this.state.currentPhase = 'work';
        this.state.timeRemaining = this.config.workDuration;

        document.getElementById('pomo-start').style.display = 'inline-block';
        document.getElementById('pomo-pause').style.display = 'none';
        document.getElementById('pomo-resume').style.display = 'none';

        this.updateDisplay();
    },

    /**
     * Tick du timer
     */
    tick() {
        this.state.timeRemaining--;

        if (this.state.currentPhase === 'work') {
            this.state.totalStudyTime++;
        }

        this.updateDisplay();

        if (this.state.timeRemaining <= 0) {
            this.phaseComplete();
        }
    },

    /**
     * Phase terminée
     */
    phaseComplete() {
        clearInterval(this.timerInterval);

        // Son de notification
        this.playNotificationSound();

        // Notification si autorisé
        this.showNotification();

        if (this.state.currentPhase === 'work') {
            this.state.sessionsCompleted++;
            this.saveState();

            // Pause longue après N sessions
            if (this.state.sessionsCompleted % this.config.sessionsBeforeLong === 0) {
                this.state.currentPhase = 'longBreak';
                this.state.timeRemaining = this.config.longBreak;
            } else {
                this.state.currentPhase = 'shortBreak';
                this.state.timeRemaining = this.config.shortBreak;
            }

            // XP si gamification disponible
            if (typeof Gamification !== 'undefined') {
                Gamification.addXP(25, 'Session Pomodoro');
            }
        } else {
            this.state.currentPhase = 'work';
            this.state.timeRemaining = this.config.workDuration;
        }

        this.updateDisplay();

        // Redémarrer automatiquement
        setTimeout(() => this.start(), 2000);
    },

    /**
     * Met à jour l'affichage
     */
    updateDisplay() {
        const minutes = Math.floor(this.state.timeRemaining / 60);
        const seconds = this.state.timeRemaining % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        document.getElementById('pomodoro-display').textContent = display;

        // Phase
        const phaseNames = {
            work: '💼 Session de travail',
            shortBreak: '☕ Pause courte',
            longBreak: '🧘 Pause longue'
        };
        document.getElementById('pomodoro-phase').textContent = phaseNames[this.state.currentPhase];

        // Barre de progression
        const totalDuration = this.state.currentPhase === 'work'
            ? this.config.workDuration
            : this.state.currentPhase === 'shortBreak'
                ? this.config.shortBreak
                : this.config.longBreak;

        const progress = ((totalDuration - this.state.timeRemaining) / totalDuration) * 100;
        document.getElementById('pomodoro-progress-bar').style.width = `${progress}%`;

        // Stats
        document.getElementById('pomo-sessions').textContent = this.state.sessionsCompleted;
        const hours = Math.floor(this.state.totalStudyTime / 3600);
        const mins = Math.floor((this.state.totalStudyTime % 3600) / 60);
        document.getElementById('pomo-total-time').textContent = hours > 0 ? `${hours}h${mins}m` : `${mins}m`;

        // Couleur selon phase
        const widget = document.getElementById('pomodoro-widget');
        widget.classList.remove('work', 'shortBreak', 'longBreak');
        widget.classList.add(this.state.currentPhase);
    },

    /**
     * Applique les paramètres
     */
    applySettings() {
        const work = parseInt(document.getElementById('pomo-work').value) || 25;
        const shortB = parseInt(document.getElementById('pomo-short').value) || 5;
        const longB = parseInt(document.getElementById('pomo-long').value) || 15;

        this.config.workDuration = work * 60;
        this.config.shortBreak = shortB * 60;
        this.config.longBreak = longB * 60;

        if (!this.state.isRunning) {
            this.state.timeRemaining = this.config.workDuration;
            this.updateDisplay();
        }
    },

    /**
     * Joue un son de notification
     */
    playNotificationSound() {
        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.notify();
        }
    },

    /**
     * Affiche une notification
     */
    showNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            const message = this.state.currentPhase === 'work'
                ? '🎉 Session terminée! Prenez une pause.'
                : '⏰ Pause terminée! Retour au travail.';

            new Notification('Pomodoro Timer', {
                body: message,
                icon: 'assets/icons/icon-192x192.png',
                tag: 'pomodoro'
            });
        }
    }
};

// CSS du Pomodoro
const pomodoroStyles = document.createElement('style');
pomodoroStyles.textContent = `
    .pomodoro-toggle {
        position: fixed;
        bottom: 80px;
        left: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #ef4444;
        color: white;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        z-index: 9998;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        transition: all 0.3s;
    }

    .pomodoro-toggle:hover {
        transform: scale(1.1);
    }

    .pomodoro-widget {
        position: fixed;
        bottom: 140px;
        left: 20px;
        width: 280px;
        background: var(--bg-card, #1e293b);
        border-radius: 16px;
        border: 2px solid #ef4444;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        z-index: 9998;
        padding: 1.25rem;
        transition: all 0.3s;
    }

    .pomodoro-widget.hidden {
        opacity: 0;
        transform: translateY(20px);
        pointer-events: none;
    }

    .pomodoro-widget.work { border-color: #ef4444; }
    .pomodoro-widget.shortBreak { border-color: #10b981; }
    .pomodoro-widget.longBreak { border-color: #3b82f6; }

    .pomodoro-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .pomodoro-header h3 {
        margin: 0;
        font-size: 1rem;
        color: var(--text-primary, #f8fafc);
    }

    .pomodoro-close {
        background: none;
        border: none;
        color: var(--text-muted, #94a3b8);
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    }

    .pomodoro-phase {
        text-align: center;
        font-size: 0.9rem;
        color: var(--text-secondary, #cbd5e1);
        margin-bottom: 0.5rem;
    }

    .pomodoro-timer {
        text-align: center;
        font-size: 3rem;
        font-weight: bold;
        font-family: 'Courier New', monospace;
        color: var(--text-primary, #f8fafc);
        margin-bottom: 1rem;
    }

    .pomodoro-progress {
        height: 6px;
        background: var(--bg-secondary, #334155);
        border-radius: 3px;
        overflow: hidden;
        margin-bottom: 1rem;
    }

    .pomodoro-progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #ef4444, #f59e0b);
        border-radius: 3px;
        transition: width 1s linear;
    }

    .work .pomodoro-progress-bar { background: linear-gradient(90deg, #ef4444, #f59e0b); }
    .shortBreak .pomodoro-progress-bar { background: linear-gradient(90deg, #10b981, #06b6d4); }
    .longBreak .pomodoro-progress-bar { background: linear-gradient(90deg, #3b82f6, #8b5cf6); }

    .pomodoro-controls {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
        margin-bottom: 1rem;
    }

    .pomo-btn {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 8px;
        background: #ef4444;
        color: white;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.2s;
    }

    .pomo-btn:hover {
        filter: brightness(1.1);
    }

    .pomo-btn.secondary {
        background: var(--bg-secondary, #334155);
        color: var(--text-secondary, #cbd5e1);
    }

    .pomodoro-stats {
        display: flex;
        justify-content: center;
        gap: 2rem;
        padding: 0.75rem;
        background: var(--bg-secondary, #334155);
        border-radius: 8px;
        margin-bottom: 1rem;
    }

    .pomo-stat {
        text-align: center;
    }

    .pomo-stat-value {
        display: block;
        font-size: 1.25rem;
        font-weight: bold;
        color: var(--quantum-cyan, #06b6d4);
    }

    .pomo-stat-label {
        font-size: 0.75rem;
        color: var(--text-muted, #94a3b8);
    }

    .pomodoro-settings {
        font-size: 0.85rem;
    }

    .pomodoro-settings summary {
        cursor: pointer;
        color: var(--text-secondary, #cbd5e1);
        padding: 0.5rem 0;
    }

    .pomo-settings-content {
        padding: 0.75rem;
        background: var(--bg-secondary, #334155);
        border-radius: 8px;
        margin-top: 0.5rem;
    }

    .pomo-settings-content label {
        display: block;
        margin-bottom: 0.5rem;
        color: var(--text-secondary, #cbd5e1);
    }

    .pomo-settings-content input {
        width: 50px;
        padding: 0.25rem;
        margin: 0 0.5rem;
        background: var(--bg-tertiary, #475569);
        border: 1px solid var(--border-primary, #334155);
        border-radius: 4px;
        color: var(--text-primary, #f8fafc);
        text-align: center;
    }

    .pomo-settings-content button {
        width: 100%;
        padding: 0.5rem;
        margin-top: 0.5rem;
        background: var(--quantum-purple, #7c3aed);
        border: none;
        border-radius: 6px;
        color: white;
        cursor: pointer;
    }

    @media (max-width: 768px) {
        .pomodoro-widget {
            left: 10px;
            right: 10px;
            bottom: 150px;
            width: auto;
        }

        .pomodoro-toggle {
            left: 10px;
            bottom: 90px;
        }
    }
`;
document.head.appendChild(pomodoroStyles);

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => PomodoroTimer.init());

// Export global
window.PomodoroTimer = PomodoroTimer;

console.log('✅ pomodoro.js chargé');
