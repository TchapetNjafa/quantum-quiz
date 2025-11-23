/**
 * Fonctions utilitaires pour Quantum Quiz
 */

// Génère un ID unique
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Mélange un tableau (Fisher-Yates shuffle)
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Échappe le HTML pour éviter XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Formate le temps (secondes → mm:ss)
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Formate la date
function formatDate(date) {
    return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Calcule le pourcentage
function calculatePercentage(value, total) {
    return total > 0 ? Math.round((value / total) * 100) : 0;
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Vérifie si MathJax est chargé
function isMathJaxReady() {
    return typeof MathJax !== 'undefined' && MathJax.typesetPromise;
}

// Rend les formules LaTeX avec MathJax (avec cache pour performance)
async function renderMath(element) {
    if (isMathJaxReady()) {
        try {
            // Utiliser le cache MathJax si disponible
            if (typeof MathJaxCache !== 'undefined') {
                await MathJaxCache.typeset(element);
            } else {
                await MathJax.typesetPromise([element]);
            }
        } catch (err) {
            if (typeof logger !== 'undefined') {
                logger.error('Erreur MathJax:', err);
            } else {
                console.error('Erreur MathJax:', err);
            }
        }
    }
}

// Affiche une notification toast
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Stockage local avec fallback
const storage = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (err) {
            console.error('Erreur lecture localStorage:', err);
            return defaultValue;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (err) {
            console.error('Erreur écriture localStorage:', err);
            return false;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (err) {
            console.error('Erreur suppression localStorage:', err);
            return false;
        }
    }
};

console.log('✅ utils.js chargé');
