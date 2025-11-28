/**
 * PROFILE GUARD
 *
 * Module qui vérifie si un profil utilisateur existe.
 * Si aucun profil n'existe, redirige vers la page de création de profil.
 *
 * Utilisation: Inclure ce script dans toutes les pages qui nécessitent un profil.
 */

(function() {
    'use strict';

    /**
     * Vérifie si un profil utilisateur existe dans localStorage
     * @returns {boolean} true si un profil existe, false sinon
     */
    function hasUserProfile() {
        try {
            // IMPORTANT : Utiliser la même clé que multiplayer.js
            const profileData = localStorage.getItem('quantum_quiz_user_profile');
            if (!profileData) {
                return false;
            }

            const profile = JSON.parse(profileData);

            // Vérifier que le profil a au moins un username
            return profile && profile.username && profile.username.trim().length > 0;
        } catch (error) {
            console.error('Erreur lors de la vérification du profil:', error);
            return false;
        }
    }

    /**
     * Affiche un message de bienvenue si un profil existe
     */
    function displayWelcomeMessage() {
        try {
            const profileData = localStorage.getItem('quantum_quiz_user_profile');
            if (profileData) {
                const profile = JSON.parse(profileData);
                console.log(`👋 Bienvenue ${profile.username} ! (Niveau ${profile.level}, ${profile.xp} XP)`);
            }
        } catch (error) {
            // Silence
        }
    }

    /**
     * Vérifie le profil et redirige si nécessaire
     */
    function checkProfile() {
        // Ne pas vérifier sur la page profile.html elle-même
        const currentPage = window.location.pathname;
        const isProfilePage = currentPage.includes('profile.html');
        const isAboutPage = currentPage.includes('about.html');

        // Ne pas rediriger sur ces pages
        if (isProfilePage || isAboutPage) {
            return;
        }

        // Vérifier si un profil existe
        if (!hasUserProfile()) {
            console.log('⚠️ Aucun profil trouvé. Redirection vers la page de création de profil...');

            // Sauvegarder l'URL actuelle pour y revenir après création du profil
            sessionStorage.setItem('quantum-quiz-return-url', window.location.href);

            // Afficher un message à l'utilisateur avant la redirection
            if (confirm('Vous devez créer un profil pour utiliser Quantum Quiz.\n\nVoulez-vous créer votre profil maintenant ?')) {
                window.location.href = 'profile.html';
            } else {
                // Si l'utilisateur refuse, rediriger vers about.html
                window.location.href = 'about.html';
            }
        } else {
            displayWelcomeMessage();
        }
    }

    // Exécuter la vérification quand le DOM est prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkProfile);
    } else {
        checkProfile();
    }

    // Exporter les fonctions pour usage externe si nécessaire
    window.ProfileGuard = {
        hasUserProfile: hasUserProfile,
        checkProfile: checkProfile
    };

})();
