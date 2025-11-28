/**
 * TOUCH-INTERACTIONS.JS
 * Gestion optimisée des interactions tactiles pour mobile
 * Quantum Quiz - PHY321
 */

// ============================================================================
// HOTSPOT TOUCH SUPPORT
// ============================================================================

/**
 * Ajoute le support tactile pour les questions hotspot
 * Convertit les événements touch en clics sur le canvas
 */
function enableHotspotTouch() {
    const hotspotCanvases = document.querySelectorAll('.hotspot-canvas');

    hotspotCanvases.forEach(canvas => {
        // Désactiver le scroll lors du touch sur le canvas
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
        }, { passive: false });

        // Gérer le tap (touch simple)
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();

            if (e.changedTouches.length === 0) return;

            const touch = e.changedTouches[0];
            const rect = canvas.getBoundingClientRect();

            // Créer un événement click synthétique avec les coordonnées du touch
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: touch.clientX,
                clientY: touch.clientY,
                screenX: touch.screenX,
                screenY: touch.screenY
            });

            canvas.dispatchEvent(clickEvent);

            // Feedback visuel mobile
            canvas.style.opacity = '0.8';
            setTimeout(() => {
                canvas.style.opacity = '1';
            }, 100);
        }, { passive: false });
    });
}

// ============================================================================
// DRAG & DROP TOUCH SUPPORT
// ============================================================================

/**
 * Ajoute le support tactile pour les questions drag & drop
 * Implémente touchstart, touchmove, touchend pour simuler le drag & drop
 */
function enableDragDropTouch() {
    const dragDropAreas = document.querySelectorAll('.drag-drop-area');

    dragDropAreas.forEach(area => {
        let touchedElement = null;
        let clone = null;
        let startX = 0;
        let startY = 0;
        let currentDropZone = null;

        // Touch Start - Début du drag
        area.addEventListener('touchstart', (e) => {
            const target = e.target.closest('.draggable-item');

            if (!target || !target.draggable) return;

            touchedElement = target;
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;

            // Créer un clone visuel pour le drag
            clone = target.cloneNode(true);
            clone.style.position = 'fixed';
            clone.style.pointerEvents = 'none';
            clone.style.zIndex = '10000';
            clone.style.opacity = '0.8';
            clone.style.transform = 'scale(1.1)';
            clone.style.transition = 'none';
            clone.style.width = target.offsetWidth + 'px';
            clone.style.left = (touch.clientX - target.offsetWidth / 2) + 'px';
            clone.style.top = (touch.clientY - target.offsetHeight / 2) + 'px';
            document.body.appendChild(clone);

            // Indiquer visuellement que l'élément est en cours de drag
            target.style.opacity = '0.3';

            // Feedback haptique (si supporté)
            if (navigator.vibrate) {
                navigator.vibrate(10);
            }

            e.preventDefault();
        }, { passive: false });

        // Touch Move - Déplacement
        area.addEventListener('touchmove', (e) => {
            if (!touchedElement || !clone) return;

            const touch = e.touches[0];

            // Déplacer le clone
            clone.style.left = (touch.clientX - clone.offsetWidth / 2) + 'px';
            clone.style.top = (touch.clientY - clone.offsetHeight / 2) + 'px';

            // Détecter la drop zone sous le doigt
            const dropZones = document.querySelectorAll('.drop-zone');
            let foundZone = null;

            dropZones.forEach(zone => {
                const rect = zone.getBoundingClientRect();
                if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
                    touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                    foundZone = zone;
                }
            });

            // Mettre à jour les classes CSS
            if (foundZone !== currentDropZone) {
                if (currentDropZone) {
                    currentDropZone.classList.remove('drag-over');
                }
                if (foundZone) {
                    foundZone.classList.add('drag-over');
                }
                currentDropZone = foundZone;
            }

            e.preventDefault();
        }, { passive: false });

        // Touch End - Fin du drag
        area.addEventListener('touchend', (e) => {
            if (!touchedElement || !clone) return;

            const touch = e.changedTouches[0];

            // Trouver la drop zone finale
            const dropZones = document.querySelectorAll('.drop-zone');
            let targetZone = null;

            dropZones.forEach(zone => {
                const rect = zone.getBoundingClientRect();
                if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
                    touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                    targetZone = zone;
                }
            });

            if (targetZone) {
                // Simuler un drop event
                const dropEvent = new DragEvent('drop', {
                    bubbles: true,
                    cancelable: true,
                    dataTransfer: new DataTransfer()
                });

                // Ajouter l'itemId au dataTransfer
                dropEvent.dataTransfer.setData('text/html', touchedElement.dataset.itemId);
                targetZone.dispatchEvent(dropEvent);

                // Animation de drop réussi
                clone.style.transition = 'all 0.2s ease-out';
                const targetRect = targetZone.getBoundingClientRect();
                clone.style.left = targetRect.left + 'px';
                clone.style.top = targetRect.top + 'px';
                clone.style.opacity = '0';
                clone.style.transform = 'scale(0.5)';

                // Feedback haptique
                if (navigator.vibrate) {
                    navigator.vibrate(20);
                }

                // Son de succès
                if (typeof AudioSystem !== 'undefined') {
                    AudioSystem.click();
                }
            } else {
                // Animation de retour si pas de drop zone
                clone.style.transition = 'all 0.3s ease-out';
                clone.style.left = startX + 'px';
                clone.style.top = startY + 'px';
                clone.style.opacity = '0';
            }

            // Nettoyer
            touchedElement.style.opacity = '1';
            if (currentDropZone) {
                currentDropZone.classList.remove('drag-over');
            }

            setTimeout(() => {
                if (clone && clone.parentNode) {
                    clone.remove();
                }
            }, 300);

            touchedElement = null;
            clone = null;
            currentDropZone = null;

            e.preventDefault();
        }, { passive: false });

        // Touch Cancel - Annulation (scroll, appel, etc.)
        area.addEventListener('touchcancel', (e) => {
            if (touchedElement) {
                touchedElement.style.opacity = '1';
            }
            if (clone && clone.parentNode) {
                clone.remove();
            }
            if (currentDropZone) {
                currentDropZone.classList.remove('drag-over');
            }

            touchedElement = null;
            clone = null;
            currentDropZone = null;
        });
    });
}

// ============================================================================
// SWIPE NAVIGATION (OPTIONNEL)
// ============================================================================

/**
 * Ajoute la navigation par swipe entre les questions
 * Swipe gauche = question suivante, Swipe droite = question précédente
 */
function enableSwipeNavigation() {
    const questionContainer = document.getElementById('question-display');
    if (!questionContainer) return;

    let touchStartX = 0;
    let touchEndX = 0;
    let isSwiping = false;

    questionContainer.addEventListener('touchstart', (e) => {
        // Ignorer si on touche un élément interactif
        if (e.target.closest('.draggable-item, .hotspot-canvas, button, input, select, textarea')) {
            return;
        }

        touchStartX = e.touches[0].clientX;
        isSwiping = true;
    }, { passive: true });

    questionContainer.addEventListener('touchmove', (e) => {
        if (!isSwiping) return;
        touchEndX = e.touches[0].clientX;
    }, { passive: true });

    questionContainer.addEventListener('touchend', () => {
        if (!isSwiping) return;
        isSwiping = false;

        const swipeDistance = touchEndX - touchStartX;
        const minSwipeDistance = 100; // 100px minimum

        // Swipe gauche -> Question suivante
        if (swipeDistance < -minSwipeDistance) {
            const nextBtn = document.getElementById('next-btn');
            if (nextBtn && !nextBtn.disabled) {
                nextBtn.click();
            }
        }

        // Swipe droite -> Question précédente
        if (swipeDistance > minSwipeDistance) {
            const prevBtn = document.getElementById('prev-btn');
            if (prevBtn && !prevBtn.disabled) {
                prevBtn.click();
            }
        }
    }, { passive: true });
}

// ============================================================================
// AMÉLIORATION DES BOUTONS MOBILES
// ============================================================================

/**
 * Améliore le feedback visuel des boutons sur mobile
 */
function enhanceMobileButtons() {
    const buttons = document.querySelectorAll('button, .btn');

    buttons.forEach(button => {
        button.addEventListener('touchstart', () => {
            button.style.transform = 'scale(0.95)';
        }, { passive: true });

        button.addEventListener('touchend', () => {
            button.style.transform = 'scale(1)';
        }, { passive: true });

        button.addEventListener('touchcancel', () => {
            button.style.transform = 'scale(1)';
        }, { passive: true });
    });
}

// ============================================================================
// INITIALISATION AUTOMATIQUE
// ============================================================================

/**
 * Initialise toutes les fonctionnalités tactiles
 */
function initTouchInteractions() {
    // Détecter si on est sur mobile/tablette
    const isTouchDevice = ('ontouchstart' in window) ||
                         (navigator.maxTouchPoints > 0) ||
                         (navigator.msMaxTouchPoints > 0);

    if (!isTouchDevice) {
        console.log('📱 Touch Interactions: Desktop détecté, fonctionnalités tactiles désactivées');
        return;
    }

    console.log('📱 Touch Interactions: Mobile/Tablette détecté, activation...');

    // Activer les fonctionnalités tactiles
    enableHotspotTouch();
    enableDragDropTouch();
    enableSwipeNavigation();
    enhanceMobileButtons();

    console.log('✅ Touch Interactions: Toutes les fonctionnalités activées');
}

// Initialiser au chargement de la page
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTouchInteractions);
} else {
    initTouchInteractions();
}

// Réinitialiser après chaque changement de question (pour le quiz)
if (typeof window.QuizEngine !== 'undefined') {
    const originalRenderQuestion = window.QuestionRenderer?.render;
    if (originalRenderQuestion) {
        window.QuestionRenderer.render = function(...args) {
            const result = originalRenderQuestion.apply(this, args);
            // Réactiver les interactions tactiles après le rendu
            setTimeout(() => {
                enableHotspotTouch();
                enableDragDropTouch();
            }, 100);
            return result;
        };
    }
}

// Export pour usage externe si nécessaire
window.TouchInteractions = {
    init: initTouchInteractions,
    enableHotspotTouch,
    enableDragDropTouch,
    enableSwipeNavigation,
    enhanceMobileButtons
};

console.log('📱 Touch Interactions Module Loaded');
