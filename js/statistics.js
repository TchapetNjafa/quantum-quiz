/**
 * Système de statistiques et graphiques pour Quantum Quiz
 * Utilise Chart.js pour les visualisations
 */

const StatisticsManager = {
    charts: {},

    // Initialise les graphiques sur la page de résultats
    init(results) {
        console.log('📊 Initialisation des statistiques...');

        if (!results) {
            console.warn('Pas de résultats fournis pour les statistiques');
            return;
        }

        // Graphique radar des performances par concept
        this.createPerformanceRadar(results);

        // Graphique de progression historique
        this.createProgressChart();

        console.log('✅ Statistiques initialisées');
    },

    // Crée le graphique radar des performances par concept/tag
    createPerformanceRadar(results) {
        const canvas = document.getElementById('performance-radar');
        if (!canvas) {
            console.warn('Canvas performance-radar non trouvé');
            return;
        }

        // Calcule les performances par tag
        const tagStats = this.calculateTagStats(results);

        if (Object.keys(tagStats).length === 0) {
            // Si pas de tags, utilise les difficultés
            this.createDifficultyRadar(canvas, results);
            return;
        }

        // Prépare les données pour le graphique radar
        const labels = Object.keys(tagStats).slice(0, 8); // Max 8 axes
        const data = labels.map(tag => {
            const stat = tagStats[tag];
            return stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
        });

        // Détruit l'ancien graphique s'il existe
        if (this.charts.radar) {
            this.charts.radar.destroy();
        }

        // Crée le graphique radar
        this.charts.radar = new Chart(canvas, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Performance (%)',
                    data: data,
                    backgroundColor: 'rgba(124, 58, 237, 0.2)',
                    borderColor: 'rgba(124, 58, 237, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(124, 58, 237, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(124, 58, 237, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20,
                            color: 'rgba(255, 255, 255, 0.7)',
                            backdropColor: 'transparent'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        angleLines: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        pointLabels: {
                            color: 'rgba(255, 255, 255, 0.9)',
                            font: {
                                size: 11
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const tag = context.label;
                                const stat = tagStats[tag];
                                return `${context.raw}% (${stat.correct}/${stat.total})`;
                            }
                        }
                    }
                }
            }
        });
    },

    // Graphique radar alternatif basé sur les difficultés
    createDifficultyRadar(canvas, results) {
        const byDifficulty = {
            'Facile': { correct: 0, total: 0 },
            'Moyen': { correct: 0, total: 0 },
            'Difficile': { correct: 0, total: 0 }
        };

        results.details.forEach(detail => {
            const diff = detail.question.difficulty;
            const label = diff === 'easy' ? 'Facile' : diff === 'medium' ? 'Moyen' : 'Difficile';
            byDifficulty[label].total++;
            if (detail.isCorrect) byDifficulty[label].correct++;
        });

        const labels = Object.keys(byDifficulty);
        const data = labels.map(label => {
            const stat = byDifficulty[label];
            return stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
        });

        if (this.charts.radar) {
            this.charts.radar.destroy();
        }

        this.charts.radar = new Chart(canvas, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Performance (%)',
                    data: data,
                    backgroundColor: 'rgba(124, 58, 237, 0.2)',
                    borderColor: 'rgba(124, 58, 237, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(124, 58, 237, 1)',
                    pointBorderColor: '#fff',
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 25,
                            color: 'rgba(255, 255, 255, 0.7)',
                            backdropColor: 'transparent'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        angleLines: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        pointLabels: {
                            color: 'rgba(255, 255, 255, 0.9)',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label;
                                const stat = byDifficulty[label];
                                return `${context.raw}% (${stat.correct}/${stat.total})`;
                            }
                        }
                    }
                }
            }
        });
    },

    // Calcule les statistiques par tag
    calculateTagStats(results) {
        const tagStats = {};

        results.details.forEach(detail => {
            const tags = detail.question.tags || [];
            tags.forEach(tag => {
                if (!tagStats[tag]) {
                    tagStats[tag] = { correct: 0, total: 0 };
                }
                tagStats[tag].total++;
                if (detail.isCorrect) tagStats[tag].correct++;
            });
        });

        return tagStats;
    },

    // Crée le graphique de progression historique
    createProgressChart() {
        const canvas = document.getElementById('progress-chart');
        if (!canvas) {
            console.warn('Canvas progress-chart non trouvé');
            return;
        }

        // Récupère l'historique
        let history = [];
        if (typeof StorageManager !== 'undefined') {
            history = StorageManager.getHistory() || [];
        }

        // Si pas d'historique, affiche un message
        if (history.length === 0) {
            const container = canvas.parentElement;
            if (container) {
                canvas.style.display = 'none';
                const message = document.createElement('p');
                message.className = 'no-history-message';
                message.textContent = 'Complétez plus de quiz pour voir votre progression !';
                message.style.cssText = 'text-align: center; color: rgba(255,255,255,0.6); padding: 40px; font-style: italic;';
                container.appendChild(message);
            }
            return;
        }

        // Prépare les données (derniers 10 quiz, du plus ancien au plus récent)
        const recentHistory = history.slice(0, 10).reverse();

        const labels = recentHistory.map((entry, index) => {
            const date = new Date(entry.date);
            return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        });

        const scores = recentHistory.map(entry => entry.score || 0);

        // Calcul de la moyenne mobile
        const avgLine = this.calculateMovingAverage(scores, 3);

        // Détruit l'ancien graphique s'il existe
        if (this.charts.progress) {
            this.charts.progress.destroy();
        }

        // Crée le graphique de ligne
        this.charts.progress = new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Score (%)',
                        data: scores,
                        borderColor: 'rgba(0, 217, 255, 1)',
                        backgroundColor: 'rgba(0, 217, 255, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.3,
                        pointBackgroundColor: 'rgba(0, 217, 255, 1)',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 8
                    },
                    {
                        label: 'Moyenne mobile',
                        data: avgLine,
                        borderColor: 'rgba(255, 107, 107, 0.8)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0.3,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20,
                            color: 'rgba(255, 255, 255, 0.7)',
                            callback: (value) => value + '%'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: 'rgba(255, 255, 255, 0.9)',
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(124, 58, 237, 0.5)',
                        borderWidth: 1,
                        callbacks: {
                            label: (context) => {
                                if (context.datasetIndex === 0) {
                                    const entry = recentHistory[context.dataIndex];
                                    return [
                                        `Score: ${context.raw}%`,
                                        `${entry.correctAnswers || 0}/${entry.totalQuestions || 0} questions`
                                    ];
                                }
                                return `Moyenne: ${Math.round(context.raw)}%`;
                            }
                        }
                    }
                }
            }
        });
    },

    // Calcule la moyenne mobile
    calculateMovingAverage(data, window) {
        return data.map((val, idx, arr) => {
            const start = Math.max(0, idx - window + 1);
            const subset = arr.slice(start, idx + 1);
            const sum = subset.reduce((a, b) => a + b, 0);
            return Math.round(sum / subset.length);
        });
    },

    // Détruit tous les graphiques
    destroy() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
    }
};

// Initialisation automatique sur la page de résultats
document.addEventListener('DOMContentLoaded', () => {
    // Attend que ResultsPage soit initialisé
    const checkResults = setInterval(() => {
        if (typeof ResultsPage !== 'undefined' && ResultsPage.results) {
            clearInterval(checkResults);
            StatisticsManager.init(ResultsPage.results);
        }
    }, 100);

    // Timeout après 5 secondes
    setTimeout(() => clearInterval(checkResults), 5000);
});

console.log('✅ statistics.js chargé');
