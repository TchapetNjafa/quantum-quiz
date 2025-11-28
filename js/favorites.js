/**
 * QUANTUM QUIZ - Système de Favoris et Notes
 * Permet de marquer des questions et ajouter des notes personnelles
 */

const Favorites = {
    STORAGE_KEY: 'quantum_quiz_favorites',
    NOTES_KEY: 'quantum_quiz_notes',

    /**
     * Initialisation
     */
    init() {
        this.favorites = this.load();
        this.notes = this.loadNotes();
        console.log('⭐ Favoris initialisés:', Object.keys(this.favorites).length, 'questions');
    },

    /**
     * Charge les favoris depuis localStorage
     */
    load() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.error('Erreur chargement favoris:', e);
            return {};
        }
    },

    /**
     * Sauvegarde les favoris
     */
    save() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.favorites));
        } catch (e) {
            console.error('Erreur sauvegarde favoris:', e);
        }
    },

    /**
     * Charge les notes depuis localStorage
     */
    loadNotes() {
        try {
            const data = localStorage.getItem(this.NOTES_KEY);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.error('Erreur chargement notes:', e);
            return {};
        }
    },

    /**
     * Sauvegarde les notes
     */
    saveNotes() {
        try {
            localStorage.setItem(this.NOTES_KEY, JSON.stringify(this.notes));
        } catch (e) {
            console.error('Erreur sauvegarde notes:', e);
        }
    },

    /**
     * Vérifie si une question est en favoris
     */
    isFavorite(questionId) {
        return !!this.favorites[questionId];
    },

    /**
     * Ajoute ou retire une question des favoris
     */
    toggle(questionId, questionData = null) {
        if (this.favorites[questionId]) {
            delete this.favorites[questionId];
            this.save();
            this.showNotification('Retiré des favoris', 'info');
            return false;
        } else {
            this.favorites[questionId] = {
                addedAt: new Date().toISOString(),
                chapter: questionData?.chapter_id || this.extractChapter(questionId),
                difficulty: questionData?.difficulty || 'medium',
                type: questionData?.type || 'qcm'
            };
            this.save();
            this.showNotification('Ajouté aux favoris', 'success');

            // Gamification
            if (window.Gamification) {
                Gamification.addXP(2, 'Question ajoutée aux favoris');
            }
            return true;
        }
    },

    /**
     * Extrait le numéro de chapitre depuis l'ID
     */
    extractChapter(questionId) {
        const match = questionId.match(/ch(\d+)/);
        return match ? parseInt(match[1]) : 1;
    },

    /**
     * Récupère tous les favoris
     */
    getAll() {
        return this.favorites;
    },

    /**
     * Récupère le nombre de favoris
     */
    getCount() {
        return Object.keys(this.favorites).length;
    },

    /**
     * Récupère les IDs des favoris
     */
    getIds() {
        return Object.keys(this.favorites);
    },

    /**
     * Récupère les favoris par chapitre
     */
    getByChapter(chapterId) {
        return Object.entries(this.favorites)
            .filter(([id, data]) => data.chapter === chapterId)
            .map(([id]) => id);
    },

    /**
     * Ajoute ou met à jour une note pour une question
     */
    setNote(questionId, noteText) {
        if (noteText && noteText.trim()) {
            this.notes[questionId] = {
                text: noteText.trim(),
                updatedAt: new Date().toISOString()
            };
        } else {
            delete this.notes[questionId];
        }
        this.saveNotes();
    },

    /**
     * Récupère la note d'une question
     */
    getNote(questionId) {
        return this.notes[questionId]?.text || '';
    },

    /**
     * Vérifie si une question a une note
     */
    hasNote(questionId) {
        return !!this.notes[questionId];
    },

    /**
     * Affiche une notification
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `favorites-notification ${type}`;
        notification.innerHTML = `
            <span class="notif-icon">${type === 'success' ? '⭐' : 'ℹ️'}</span>
            <span class="notif-message">${message}</span>
        `;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    },

    /**
     * Crée le bouton de favoris pour une question
     */
    createFavoriteButton(questionId, questionData = null) {
        const isFav = this.isFavorite(questionId);
        const button = document.createElement('button');
        button.className = `favorite-btn ${isFav ? 'is-favorite' : ''}`;
        button.setAttribute('aria-label', isFav ? 'Retirer des favoris' : 'Ajouter aux favoris');
        button.setAttribute('title', isFav ? 'Retirer des favoris' : 'Ajouter aux favoris');
        button.innerHTML = `<span class="fav-icon">${isFav ? '⭐' : '☆'}</span>`;

        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const nowFav = this.toggle(questionId, questionData);
            button.classList.toggle('is-favorite', nowFav);
            button.querySelector('.fav-icon').textContent = nowFav ? '⭐' : '☆';
            button.setAttribute('aria-label', nowFav ? 'Retirer des favoris' : 'Ajouter aux favoris');
            button.setAttribute('title', nowFav ? 'Retirer des favoris' : 'Ajouter aux favoris');
        });

        return button;
    },

    /**
     * Crée le bouton de note pour une question
     */
    createNoteButton(questionId) {
        const hasNote = this.hasNote(questionId);
        const button = document.createElement('button');
        button.className = `note-btn ${hasNote ? 'has-note' : ''}`;
        button.setAttribute('aria-label', 'Ajouter une note');
        button.setAttribute('title', hasNote ? 'Modifier la note' : 'Ajouter une note');
        button.innerHTML = `<span class="note-icon">${hasNote ? '📝' : '✏️'}</span>`;

        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openNoteModal(questionId);
        });

        return button;
    },

    /**
     * Ouvre la modal de note
     */
    openNoteModal(questionId) {
        const existingModal = document.querySelector('.note-modal');
        if (existingModal) existingModal.remove();

        const currentNote = this.getNote(questionId);

        const modal = document.createElement('div');
        modal.className = 'note-modal';
        modal.innerHTML = `
            <div class="note-modal-content">
                <div class="note-modal-header">
                    <h3>📝 Note personnelle</h3>
                    <button class="note-modal-close">&times;</button>
                </div>
                <div class="note-modal-body">
                    <textarea id="note-textarea" placeholder="Ajoutez votre note ici...">${currentNote}</textarea>
                </div>
                <div class="note-modal-footer">
                    <button class="btn-secondary note-cancel">Annuler</button>
                    <button class="btn-primary note-save">Enregistrer</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);

        const textarea = modal.querySelector('#note-textarea');
        textarea.focus();

        const close = () => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        };

        modal.querySelector('.note-modal-close').addEventListener('click', close);
        modal.querySelector('.note-cancel').addEventListener('click', close);
        modal.querySelector('.note-save').addEventListener('click', () => {
            this.setNote(questionId, textarea.value);
            this.showNotification('Note enregistrée', 'success');
            close();

            // Mettre à jour le bouton de note
            const noteBtn = document.querySelector(`.note-btn[data-question-id="${questionId}"]`);
            if (noteBtn) {
                const hasNote = this.hasNote(questionId);
                noteBtn.classList.toggle('has-note', hasNote);
                noteBtn.querySelector('.note-icon').textContent = hasNote ? '📝' : '✏️';
            }
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) close();
        });
    },

    /**
     * Exporte les favoris
     */
    export() {
        return {
            favorites: this.favorites,
            notes: this.notes,
            exportedAt: new Date().toISOString()
        };
    },

    /**
     * Importe les favoris
     */
    import(data) {
        if (data.favorites) {
            this.favorites = { ...this.favorites, ...data.favorites };
            this.save();
        }
        if (data.notes) {
            this.notes = { ...this.notes, ...data.notes };
            this.saveNotes();
        }
    },

    /**
     * Efface tous les favoris
     */
    clearAll() {
        this.favorites = {};
        this.notes = {};
        this.save();
        this.saveNotes();
    }
};

// CSS pour les favoris
const favoritesStyles = document.createElement('style');
favoritesStyles.textContent = `
    /* Bouton Favoris */
    .favorite-btn {
        background: transparent;
        border: none;
        cursor: pointer;
        font-size: 1.5rem;
        padding: 0.25rem;
        transition: transform 0.2s;
        line-height: 1;
    }

    .favorite-btn:hover {
        transform: scale(1.2);
    }

    .favorite-btn.is-favorite .fav-icon {
        animation: starPop 0.3s ease;
    }

    @keyframes starPop {
        0% { transform: scale(1); }
        50% { transform: scale(1.4); }
        100% { transform: scale(1); }
    }

    /* Bouton Note */
    .note-btn {
        background: transparent;
        border: none;
        cursor: pointer;
        font-size: 1.3rem;
        padding: 0.25rem;
        transition: transform 0.2s;
        line-height: 1;
        opacity: 0.7;
    }

    .note-btn:hover {
        transform: scale(1.1);
        opacity: 1;
    }

    .note-btn.has-note {
        opacity: 1;
    }

    /* Container des actions */
    .question-actions {
        display: flex;
        gap: 0.5rem;
        align-items: center;
    }

    /* Notification */
    .favorites-notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--bg-card, #1e293b);
        border: 1px solid var(--border-primary, #334155);
        border-radius: 12px;
        padding: 0.75rem 1.25rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        transform: translateX(120%);
        transition: transform 0.3s ease;
        z-index: 10000;
    }

    .favorites-notification.show {
        transform: translateX(0);
    }

    .favorites-notification.success {
        border-color: var(--quantum-green, #10b981);
    }

    .favorites-notification .notif-icon {
        font-size: 1.2rem;
    }

    .favorites-notification .notif-message {
        color: var(--text-primary, #f8fafc);
        font-size: 0.9rem;
    }

    /* Modal Note */
    .note-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
        opacity: 0;
        transition: opacity 0.3s;
    }

    .note-modal.show {
        opacity: 1;
    }

    .note-modal-content {
        background: var(--bg-card, #1e293b);
        border: 1px solid var(--border-primary, #334155);
        border-radius: 16px;
        width: 90%;
        max-width: 500px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
        transform: scale(0.9);
        transition: transform 0.3s;
    }

    .note-modal.show .note-modal-content {
        transform: scale(1);
    }

    .note-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid var(--border-primary, #334155);
    }

    .note-modal-header h3 {
        margin: 0;
        color: var(--text-primary, #f8fafc);
        font-size: 1.1rem;
    }

    .note-modal-close {
        background: none;
        border: none;
        color: var(--text-muted, #94a3b8);
        font-size: 1.5rem;
        cursor: pointer;
        line-height: 1;
        padding: 0;
    }

    .note-modal-close:hover {
        color: var(--text-primary, #f8fafc);
    }

    .note-modal-body {
        padding: 1.5rem;
    }

    .note-modal-body textarea {
        width: 100%;
        min-height: 150px;
        padding: 1rem;
        border: 1px solid var(--border-primary, #334155);
        border-radius: 8px;
        background: var(--bg-secondary, #334155);
        color: var(--text-primary, #f8fafc);
        font-family: inherit;
        font-size: 0.95rem;
        resize: vertical;
    }

    .note-modal-body textarea:focus {
        outline: none;
        border-color: var(--quantum-purple, #7c3aed);
    }

    .note-modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 1rem 1.5rem;
        border-top: 1px solid var(--border-primary, #334155);
    }

    .note-modal-footer button {
        padding: 0.5rem 1.25rem;
        border-radius: 8px;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .note-modal-footer .btn-secondary {
        background: var(--bg-secondary, #334155);
        border: 1px solid var(--border-primary, #475569);
        color: var(--text-primary, #f8fafc);
    }

    .note-modal-footer .btn-primary {
        background: var(--quantum-purple, #7c3aed);
        border: none;
        color: white;
    }

    .note-modal-footer .btn-primary:hover {
        background: var(--quantum-purple-dark, #6d28d9);
    }
`;
document.head.appendChild(favoritesStyles);

// Initialisation
document.addEventListener('DOMContentLoaded', () => Favorites.init());

// Export global
window.Favorites = Favorites;

console.log('✅ favorites.js chargé');
