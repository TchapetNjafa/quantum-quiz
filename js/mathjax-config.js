/**
 * Configuration MathJax pour un meilleur rendu
 */

// Configuration MathJax
window.MathJax = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        processEscapes: true,
        processEnvironments: true,
        packages: {'[+]': ['ams', 'newcommand', 'configmacros']},
        macros: {
            // Macros personnalisées pour notation quantique
            ket: ['\\left| #1 \\right\\rangle', 1],
            bra: ['\\left\\langle #1 \\right|', 1],
            braket: ['\\left\\langle #1 \\middle| #2 \\right\\rangle', 2],
            ketbra: ['\\left| #1 \\right\\rangle\\left\\langle #2 \\right|', 2]
        }
    },
    svg: {
        fontCache: 'global',
        displayAlign: 'left',
        displayIndent: '0'
    },
    options: {
        skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
        ignoreHtmlClass: 'no-mathjax',
        processHtmlClass: 'mathjax'
    },
    startup: {
        pageReady: () => {
            return MathJax.startup.defaultPageReady().then(() => {
                console.log('✅ MathJax chargé et configuré');
            });
        }
    }
};

// Fonction pour forcer le rendu des matrices en mode display
function enhanceMatrixDisplay() {
    document.addEventListener('DOMContentLoaded', () => {
        // Attendre que MathJax soit prêt
        if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
            // Observer les changements du DOM pour re-rendre MathJax
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.addedNodes.length) {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === 1) { // Element node
                                // Cherche les formules qui contiennent des matrices
                                const mathElements = node.querySelectorAll ?
                                    node.querySelectorAll('[class*="MathJax"], .question-text, .option, .matching-') :
                                    [];

                                if (mathElements.length > 0 ||
                                    (node.textContent && node.textContent.includes('begin{pmatrix}'))) {
                                    MathJax.typesetPromise([node]).catch((err) => {
                                        console.warn('Erreur MathJax:', err);
                                    });
                                }
                            }
                        });
                    }
                });
            });

            // Observer le body pour les changements
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    });
}

enhanceMatrixDisplay();

console.log('✅ mathjax-config.js chargé');
