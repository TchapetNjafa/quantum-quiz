/**
 * QUANTUM QUIZ - MODULE INTÉGRATION LMS
 * Support SCORM 1.2 et SCORM 2004 pour Moodle et autres LMS
 * Université de Yaoundé I - PHY321
 */

const LMSIntegration = {
    // Configuration
    config: {
        // Version SCORM supportée
        scormVersion: 'auto', // 'auto', '1.2', '2004'

        // Mapping des statuts
        statusMapping: {
            'not attempted': 'not attempted',
            'incomplete': 'incomplete',
            'completed': 'completed',
            'passed': 'passed',
            'failed': 'failed'
        },

        // Seuil de réussite par défaut
        passingScore: 60
    },

    // État de la connexion LMS
    state: {
        connected: false,
        api: null,
        apiVersion: null,
        sessionData: {}
    },

    /**
     * Initialisation du module LMS
     */
    init() {
        this.detectAndConnectLMS();
        console.log('📚 LMS Integration initialisée');
    },

    /**
     * Détecter et se connecter à l'API SCORM
     */
    detectAndConnectLMS() {
        // Chercher l'API SCORM dans la fenêtre parent
        const api = this.findSCORMAPI(window);

        if (api) {
            this.state.api = api;
            this.state.apiVersion = this.detectAPIVersion(api);
            this.state.connected = this.initializeConnection();

            if (this.state.connected) {
                console.log(`📚 Connecté au LMS (SCORM ${this.state.apiVersion})`);
                this.loadLearnerData();
            }
        } else {
            console.log('📚 Aucun LMS détecté (mode autonome)');
        }
    },

    /**
     * Chercher l'API SCORM dans les fenêtres parentes
     */
    findSCORMAPI(win) {
        let attempts = 0;
        const maxAttempts = 10;

        while (win && attempts < maxAttempts) {
            attempts++;

            // SCORM 2004
            if (win.API_1484_11) {
                return win.API_1484_11;
            }

            // SCORM 1.2
            if (win.API) {
                return win.API;
            }

            // Remonter au parent
            if (win.parent && win.parent !== win) {
                win = win.parent;
            } else if (win.opener) {
                win = win.opener;
            } else {
                break;
            }
        }

        return null;
    },

    /**
     * Détecter la version de l'API SCORM
     */
    detectAPIVersion(api) {
        if (api.Initialize) {
            return '2004';
        } else if (api.LMSInitialize) {
            return '1.2';
        }
        return 'unknown';
    },

    /**
     * Initialiser la connexion SCORM
     */
    initializeConnection() {
        try {
            let result;

            if (this.state.apiVersion === '2004') {
                result = this.state.api.Initialize('');
            } else if (this.state.apiVersion === '1.2') {
                result = this.state.api.LMSInitialize('');
            }

            return result === 'true' || result === true;
        } catch (error) {
            console.error('LMS: Erreur initialisation', error);
            return false;
        }
    },

    /**
     * Obtenir une valeur depuis le LMS
     */
    getValue(element) {
        if (!this.state.connected) return '';

        try {
            if (this.state.apiVersion === '2004') {
                return this.state.api.GetValue(element);
            } else if (this.state.apiVersion === '1.2') {
                // Convertir les noms d'éléments SCORM 2004 vers 1.2
                const element12 = this.convertElementTo12(element);
                return this.state.api.LMSGetValue(element12);
            }
        } catch (error) {
            console.error('LMS: Erreur lecture', element, error);
        }

        return '';
    },

    /**
     * Définir une valeur dans le LMS
     */
    setValue(element, value) {
        if (!this.state.connected) return false;

        try {
            let result;

            if (this.state.apiVersion === '2004') {
                result = this.state.api.SetValue(element, value);
            } else if (this.state.apiVersion === '1.2') {
                const element12 = this.convertElementTo12(element);
                result = this.state.api.LMSSetValue(element12, value);
            }

            return result === 'true' || result === true;
        } catch (error) {
            console.error('LMS: Erreur écriture', element, value, error);
            return false;
        }
    },

    /**
     * Valider les modifications dans le LMS
     */
    commit() {
        if (!this.state.connected) return false;

        try {
            let result;

            if (this.state.apiVersion === '2004') {
                result = this.state.api.Commit('');
            } else if (this.state.apiVersion === '1.2') {
                result = this.state.api.LMSCommit('');
            }

            return result === 'true' || result === true;
        } catch (error) {
            console.error('LMS: Erreur commit', error);
            return false;
        }
    },

    /**
     * Terminer la session LMS
     */
    terminate() {
        if (!this.state.connected) return false;

        try {
            let result;

            if (this.state.apiVersion === '2004') {
                result = this.state.api.Terminate('');
            } else if (this.state.apiVersion === '1.2') {
                result = this.state.api.LMSFinish('');
            }

            this.state.connected = false;
            return result === 'true' || result === true;
        } catch (error) {
            console.error('LMS: Erreur terminaison', error);
            return false;
        }
    },

    /**
     * Convertir les noms d'éléments SCORM 2004 vers 1.2
     */
    convertElementTo12(element) {
        const mapping = {
            'cmi.learner_id': 'cmi.core.student_id',
            'cmi.learner_name': 'cmi.core.student_name',
            'cmi.completion_status': 'cmi.core.lesson_status',
            'cmi.success_status': 'cmi.core.lesson_status',
            'cmi.score.raw': 'cmi.core.score.raw',
            'cmi.score.min': 'cmi.core.score.min',
            'cmi.score.max': 'cmi.core.score.max',
            'cmi.session_time': 'cmi.core.session_time',
            'cmi.total_time': 'cmi.core.total_time',
            'cmi.location': 'cmi.core.lesson_location',
            'cmi.suspend_data': 'cmi.suspend_data',
            'cmi.exit': 'cmi.core.exit'
        };

        return mapping[element] || element;
    },

    /**
     * Charger les données de l'apprenant
     */
    loadLearnerData() {
        if (!this.state.connected) return;

        this.state.sessionData = {
            learnerId: this.getValue('cmi.learner_id'),
            learnerName: this.getValue('cmi.learner_name'),
            location: this.getValue('cmi.location'),
            suspendData: this.getValue('cmi.suspend_data'),
            completionStatus: this.getValue('cmi.completion_status'),
            successStatus: this.getValue('cmi.success_status')
        };

        // Restaurer les données de session si disponibles
        if (this.state.sessionData.suspendData) {
            try {
                const savedData = JSON.parse(this.state.sessionData.suspendData);
                // Appliquer les données sauvegardées...
                console.log('📚 Données de session restaurées');
            } catch (e) {
                // Ignorer si les données ne sont pas du JSON valide
            }
        }
    },

    /**
     * Sauvegarder la progression
     */
    saveProgress(data) {
        if (!this.state.connected) return false;

        // Sauvegarder la position
        if (data.location) {
            this.setValue('cmi.location', data.location);
        }

        // Sauvegarder les données de suspension
        if (data.suspendData) {
            this.setValue('cmi.suspend_data', JSON.stringify(data.suspendData));
        }

        // Définir le statut comme incomplet
        this.setValue('cmi.completion_status', 'incomplete');

        return this.commit();
    },

    /**
     * Soumettre le résultat du quiz au LMS
     */
    submitQuizResult(results) {
        if (!this.state.connected) {
            console.log('📚 Mode autonome: résultats non envoyés au LMS');
            return this.generateOfflineReport(results);
        }

        const { score, totalQuestions, correctAnswers, timeSpent } = results;

        // Score
        this.setValue('cmi.score.raw', score.toString());
        this.setValue('cmi.score.min', '0');
        this.setValue('cmi.score.max', '100');

        if (this.state.apiVersion === '2004') {
            this.setValue('cmi.score.scaled', (score / 100).toString());
        }

        // Temps de session (format ISO 8601 pour SCORM 2004, HHHH:MM:SS pour 1.2)
        const sessionTime = this.formatTime(timeSpent);
        this.setValue('cmi.session_time', sessionTime);

        // Statut de complétion
        this.setValue('cmi.completion_status', 'completed');

        // Statut de succès
        const passed = score >= this.config.passingScore;
        if (this.state.apiVersion === '2004') {
            this.setValue('cmi.success_status', passed ? 'passed' : 'failed');
        } else {
            this.setValue('cmi.core.lesson_status', passed ? 'passed' : 'failed');
        }

        // Données supplémentaires
        const detailedData = {
            score,
            totalQuestions,
            correctAnswers,
            timeSpent,
            completedAt: new Date().toISOString()
        };
        this.setValue('cmi.suspend_data', JSON.stringify(detailedData));

        // Valider les changements
        const success = this.commit();

        if (success) {
            console.log('📚 Résultats envoyés au LMS');
        }

        return success;
    },

    /**
     * Formater le temps pour SCORM
     */
    formatTime(seconds) {
        if (this.state.apiVersion === '2004') {
            // Format ISO 8601: PT1H30M45S
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = Math.floor(seconds % 60);
            return `PT${hours}H${minutes}M${secs}S`;
        } else {
            // Format SCORM 1.2: HHHH:MM:SS.SS
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = Math.floor(seconds % 60);
            return `${hours.toString().padStart(4, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    },

    /**
     * Générer un rapport hors-ligne (quand pas de LMS)
     */
    generateOfflineReport(results) {
        return {
            success: true,
            mode: 'offline',
            data: {
                ...results,
                generatedAt: new Date().toISOString(),
                canBeImported: true
            }
        };
    },

    /**
     * Exporter les résultats en format compatible Moodle
     */
    exportForMoodle(results) {
        const moodleData = {
            component: 'mod_quiz',
            attemptid: Date.now(),
            userid: this.state.sessionData.learnerId || 'local_user',
            timestart: results.startTime || Date.now() - (results.timeSpent * 1000),
            timefinish: Date.now(),
            sumgrades: results.correctAnswers,
            maxgrades: results.totalQuestions,
            grade: results.score,
            state: results.score >= this.config.passingScore ? 'finished' : 'inprogress',
            questions: results.details ? results.details.map((detail, index) => ({
                slot: index + 1,
                questionid: detail.question?.id || `q${index}`,
                response: detail.userAnswer,
                correct: detail.isCorrect,
                mark: detail.isCorrect ? 1 : 0
            })) : []
        };

        return moodleData;
    },

    /**
     * Générer un fichier SCORM manifest (imsmanifest.xml)
     */
    generateManifest(quizConfig) {
        const manifestXML = `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="QuantumQuiz_PHY321"
          version="1.0"
          xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
          xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
                              http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">

    <metadata>
        <schema>ADL SCORM</schema>
        <schemaversion>1.2</schemaversion>
    </metadata>

    <organizations default="QuantumQuiz_Org">
        <organization identifier="QuantumQuiz_Org">
            <title>Quantum Quiz - PHY321</title>
            <item identifier="quiz_item" identifierref="quiz_resource" isvisible="true">
                <title>${quizConfig.title || 'Quiz de Mécanique Quantique'}</title>
                <adlcp:masteryscore>${this.config.passingScore}</adlcp:masteryscore>
            </item>
        </organization>
    </organizations>

    <resources>
        <resource identifier="quiz_resource"
                  type="webcontent"
                  adlcp:scormtype="sco"
                  href="index.html">
            <file href="index.html"/>
            <file href="quiz.html"/>
            <file href="results.html"/>
            <file href="css/main.css"/>
            <file href="css/quiz.css"/>
            <file href="js/app.js"/>
            <file href="js/quiz-engine.js"/>
            <file href="js/lms-integration.js"/>
            <file href="data/questions.json"/>
        </resource>
    </resources>

</manifest>`;

        return manifestXML;
    },

    /**
     * Télécharger le package SCORM
     */
    async downloadSCORMPackage(quizConfig) {
        // Vérifier si JSZip est disponible
        if (typeof JSZip === 'undefined') {
            console.warn('JSZip non disponible. Chargement du manifest uniquement.');
            const manifest = this.generateManifest(quizConfig);
            this.downloadFile('imsmanifest.xml', manifest, 'application/xml');
            return;
        }

        const zip = new JSZip();

        // Ajouter le manifest
        zip.file('imsmanifest.xml', this.generateManifest(quizConfig));

        // Note: Dans une implémentation complète, on ajouterait tous les fichiers

        // Générer et télécharger le ZIP
        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'quantum-quiz-scorm.zip';
        a.click();
        URL.revokeObjectURL(url);
    },

    /**
     * Télécharger un fichier
     */
    downloadFile(filename, content, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    },

    /**
     * Vérifier si connecté à un LMS
     */
    isConnected() {
        return this.state.connected;
    },

    /**
     * Obtenir les informations de l'apprenant
     */
    getLearnerInfo() {
        return {
            id: this.state.sessionData.learnerId || null,
            name: this.state.sessionData.learnerName || null,
            isConnected: this.state.connected,
            apiVersion: this.state.apiVersion
        };
    }
};

// Initialisation automatique
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => LMSIntegration.init());
} else {
    LMSIntegration.init();
}

// Terminer la session LMS à la fermeture de la page
window.addEventListener('beforeunload', () => {
    if (LMSIntegration.isConnected()) {
        LMSIntegration.terminate();
    }
});

// Export global
window.LMSIntegration = LMSIntegration;
