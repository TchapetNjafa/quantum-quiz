/**
 * QUANTUM-ANIMATIONS-EXTENDED.JS
 * Animations supplémentaires pour les concepts quantiques avancés
 * Quantum Quiz - PHY321
 */

// Extension du module QuantumAnimations
Object.assign(QuantumAnimations, {

    // ============================================================================
    // 8. OSCILLATIONS DE RABI
    // ============================================================================

    /**
     * Visualisation des oscillations de Rabi (système à deux niveaux)
     */
    createRabiOscillations(canvasId, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas ${canvasId} not found`);
            return null;
        }

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        let animationFrame = null;
        let time = 0;
        const history = [];
        const maxHistory = 300;

        function draw() {
            ctx.fillStyle = '#0a0e27';
            ctx.fillRect(0, 0, width, height);

            // Paramètres des oscillations de Rabi
            const omega = 0.05;  // Fréquence de Rabi
            const t = time * 0.1;

            // Probabilités P0 et P1
            const P1 = Math.pow(Math.sin(omega * t), 2);  // Probabilité état excité
            const P0 = 1 - P1;  // Probabilité état fondamental

            // Ajouter à l'historique
            history.push({ time: time, P0: P0, P1: P1 });
            if (history.length > maxHistory) history.shift();

            // Dessiner les probabilités temporelles
            ctx.strokeStyle = '#2dd4bf';
            ctx.lineWidth = 2;
            ctx.beginPath();
            history.forEach((point, idx) => {
                const x = (idx / maxHistory) * width;
                const y = height / 4 + (1 - point.P1) * (height / 4);
                if (idx === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();

            ctx.strokeStyle = '#ec4899';
            ctx.lineWidth = 2;
            ctx.beginPath();
            history.forEach((point, idx) => {
                const x = (idx / maxHistory) * width;
                const y = 3 * height / 4 + (1 - point.P0) * (height / 4);
                if (idx === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();

            // Niveaux d'énergie
            const levelHeight = 30;
            const level0Y = 3 * height / 4;
            const level1Y = height / 4;

            // État |1⟩ (excité)
            ctx.fillStyle = `rgba(45, 212, 191, ${P1})`;
            ctx.fillRect(50, level1Y - levelHeight / 2, 60, levelHeight);
            ctx.strokeStyle = '#2dd4bf';
            ctx.lineWidth = 2;
            ctx.strokeRect(50, level1Y - levelHeight / 2, 60, levelHeight);

            // État |0⟩ (fondamental)
            ctx.fillStyle = `rgba(236, 72, 153, ${P0})`;
            ctx.fillRect(50, level0Y - levelHeight / 2, 60, levelHeight);
            ctx.strokeStyle = '#ec4899';
            ctx.lineWidth = 2;
            ctx.strokeRect(50, level0Y - levelHeight / 2, 60, levelHeight);

            // Labels
            ctx.fillStyle = '#2dd4bf';
            ctx.font = '16px Inter';
            ctx.fillText('|1⟩', 130, level1Y + 5);
            ctx.fillText(`P₁ = ${P1.toFixed(3)}`, 130, level1Y + 25);

            ctx.fillStyle = '#ec4899';
            ctx.fillText('|0⟩', 130, level0Y + 5);
            ctx.fillText(`P₀ = ${P0.toFixed(3)}`, 130, level0Y + 25);

            ctx.fillStyle = '#94a3b8';
            ctx.font = '14px Inter';
            ctx.fillText('Oscillations de Rabi', width / 2 - 70, 30);

            time++;
            animationFrame = requestAnimationFrame(draw);
        }

        const api = {
            start() {
                if (!animationFrame) draw();
            },
            stop() {
                if (animationFrame) {
                    cancelAnimationFrame(animationFrame);
                    animationFrame = null;
                }
            },
            reset() {
                time = 0;
                history.length = 0;
                draw();
            },
            destroy() {
                this.stop();
            }
        };

        draw();
        return api;
    },

    // ============================================================================
    // 9. PROCESSUS DE MESURE (COLLAPSE)
    // ============================================================================

    /**
     * Visualisation du collapse de la fonction d'onde lors d'une mesure
     */
    createMeasurement(canvasId, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas ${canvasId} not found`);
            return null;
        }

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        let animationFrame = null;
        let phase = 'superposition';  // superposition, measuring, collapsed
        let collapseTime = 0;
        let collapsedState = null;

        function draw() {
            ctx.fillStyle = '#0a0e27';
            ctx.fillRect(0, 0, width, height);

            const centerX = width / 2;
            const centerY = height / 2;
            const barWidth = 80;
            const maxBarHeight = 150;

            if (phase === 'superposition') {
                // Superposition: deux états avec amplitudes
                const alpha = 0.7;
                const beta = Math.sqrt(1 - alpha * alpha);

                // État |0⟩
                ctx.fillStyle = 'rgba(236, 72, 153, 0.6)';
                ctx.fillRect(centerX - 150 - barWidth / 2, centerY + maxBarHeight / 2 - alpha * maxBarHeight,
                    barWidth, alpha * maxBarHeight);
                ctx.fillStyle = '#ec4899';
                ctx.font = '20px Inter';
                ctx.fillText('|0⟩', centerX - 150 - 10, centerY + maxBarHeight / 2 + 30);
                ctx.font = '14px Inter';
                ctx.fillText(`α = ${alpha.toFixed(2)}`, centerX - 170, centerY + maxBarHeight / 2 + 50);

                // État |1⟩
                ctx.fillStyle = 'rgba(45, 212, 191, 0.6)';
                ctx.fillRect(centerX + 150 - barWidth / 2, centerY + maxBarHeight / 2 - beta * maxBarHeight,
                    barWidth, beta * maxBarHeight);
                ctx.fillStyle = '#2dd4bf';
                ctx.font = '20px Inter';
                ctx.fillText('|1⟩', centerX + 150 - 10, centerY + maxBarHeight / 2 + 30);
                ctx.font = '14px Inter';
                ctx.fillText(`β = ${beta.toFixed(2)}`, centerX + 130, centerY + maxBarHeight / 2 + 50);

                ctx.fillStyle = '#9d4edd';
                ctx.font = '18px Inter';
                ctx.fillText('Superposition: ψ = α|0⟩ + β|1⟩', centerX - 120, 50);

            } else if (phase === 'measuring') {
                // Animation de mesure
                collapseTime++;
                const progress = Math.min(collapseTime / 60, 1);

                const alpha = 0.7 * (1 - progress);
                const beta = Math.sqrt(1 - 0.7 * 0.7) * (1 - progress);

                // Effet visuel de mesure
                ctx.strokeStyle = `rgba(157, 78, 221, ${1 - progress})`;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(centerX, centerY, progress * 200, 0, 2 * Math.PI);
                ctx.stroke();

                // Barres qui s'estompent
                ctx.fillStyle = `rgba(236, 72, 153, ${0.6 * (1 - progress)})`;
                ctx.fillRect(centerX - 150 - barWidth / 2, centerY + maxBarHeight / 2 - 0.7 * maxBarHeight,
                    barWidth, 0.7 * maxBarHeight);

                ctx.fillStyle = `rgba(45, 212, 191, ${0.6 * (1 - progress)})`;
                ctx.fillRect(centerX + 150 - barWidth / 2, centerY + maxBarHeight / 2 - Math.sqrt(1 - 0.7 * 0.7) * maxBarHeight,
                    barWidth, Math.sqrt(1 - 0.7 * 0.7) * maxBarHeight);

                ctx.fillStyle = '#9d4edd';
                ctx.font = '18px Inter';
                ctx.fillText('Mesure en cours...', centerX - 70, 50);

                if (progress >= 1) {
                    phase = 'collapsed';
                    collapsedState = Math.random() < 0.7 * 0.7 ? 0 : 1;  // Probabilité quadratique
                }

            } else if (phase === 'collapsed') {
                // État collapsed
                if (collapsedState === 0) {
                    ctx.fillStyle = '#ec4899';
                    ctx.fillRect(centerX - barWidth / 2, centerY + maxBarHeight / 2 - maxBarHeight,
                        barWidth, maxBarHeight);
                    ctx.font = '20px Inter';
                    ctx.fillText('|0⟩', centerX - 10, centerY + maxBarHeight / 2 + 30);
                    ctx.fillStyle = '#94a3b8';
                    ctx.font = '18px Inter';
                    ctx.fillText('Résultat: état |0⟩', centerX - 70, 50);
                } else {
                    ctx.fillStyle = '#2dd4bf';
                    ctx.fillRect(centerX - barWidth / 2, centerY + maxBarHeight / 2 - maxBarHeight,
                        barWidth, maxBarHeight);
                    ctx.font = '20px Inter';
                    ctx.fillText('|1⟩', centerX - 10, centerY + maxBarHeight / 2 + 30);
                    ctx.fillStyle = '#94a3b8';
                    ctx.font = '18px Inter';
                    ctx.fillText('Résultat: état |1⟩', centerX - 70, 50);
                }
            }

            animationFrame = requestAnimationFrame(draw);
        }

        const api = {
            start() {
                if (!animationFrame) draw();
            },
            stop() {
                if (animationFrame) {
                    cancelAnimationFrame(animationFrame);
                    animationFrame = null;
                }
            },
            measure() {
                phase = 'measuring';
                collapseTime = 0;
            },
            reset() {
                phase = 'superposition';
                collapseTime = 0;
                collapsedState = null;
                draw();
            },
            destroy() {
                this.stop();
            }
        };

        draw();
        return api;
    },

    // ============================================================================
    // 10. PUITS DE POTENTIEL INFINI
    // ============================================================================

    /**
     * États stationnaires d'une particule dans un puits de potentiel carré infini
     */
    createPotentialWell(canvasId, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas ${canvasId} not found`);
            return null;
        }

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        const params = {
            level: options.level || 1,
            animated: options.animated !== false,
            ...options
        };

        let animationFrame = null;
        let time = 0;

        function wavefunction(x, n, L) {
            return Math.sqrt(2 / L) * Math.sin((n * Math.PI * x) / L);
        }

        function draw() {
            ctx.fillStyle = '#0a0e27';
            ctx.fillRect(0, 0, width, height);

            const L = width * 0.6;  // Largeur du puits
            const wellX = (width - L) / 2;
            const centerY = height / 2;

            // Dessiner le puits
            ctx.strokeStyle = '#9d4edd';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(wellX, centerY - 100);
            ctx.lineTo(wellX, centerY + 100);
            ctx.moveTo(wellX + L, centerY - 100);
            ctx.lineTo(wellX + L, centerY + 100);
            ctx.moveTo(wellX, centerY + 100);
            ctx.lineTo(wellX + L, centerY + 100);
            ctx.stroke();

            // Labels puits
            ctx.fillStyle = '#9d4edd';
            ctx.font = '16px Inter';
            ctx.fillText('V = ∞', wellX - 50, centerY);
            ctx.fillText('V = ∞', wellX + L + 10, centerY);
            ctx.fillText('V = 0', wellX + L / 2 - 20, centerY + 120);

            // Dessiner la fonction d'onde
            const n = params.level;
            const phase = params.animated ? Math.cos(time * 0.05) : 1;

            ctx.strokeStyle = '#2dd4bf';
            ctx.lineWidth = 2;
            ctx.beginPath();

            for (let i = 0; i <= L; i++) {
                const psi = wavefunction(i, n, L) * phase;
                const x = wellX + i;
                const y = centerY - psi * 50;

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Densité de probabilité
            ctx.fillStyle = 'rgba(45, 212, 191, 0.2)';
            ctx.beginPath();
            for (let i = 0; i <= L; i++) {
                const psi = wavefunction(i, n, L);
                const prob = psi * psi;
                const x = wellX + i;
                const y = centerY - prob * 2000;

                if (i === 0) ctx.moveTo(x, centerY);
                else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.lineTo(wellX + L, centerY);
            ctx.closePath();
            ctx.fill();

            // Niveau d'énergie
            const En = (n * n * Math.PI * Math.PI) / (2 * L * L);  // Simplifié (unités arbitraires)
            ctx.strokeStyle = '#ec4899';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            const energyY = centerY - 80 + (1 - En / 5) * 40;
            ctx.beginPath();
            ctx.moveTo(wellX, energyY);
            ctx.lineTo(wellX + L, energyY);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = '#ec4899';
            ctx.font = '14px Inter';
            ctx.fillText(`E${n}`, wellX + L + 10, energyY + 5);

            // Info
            ctx.fillStyle = '#94a3b8';
            ctx.font = '16px Inter';
            ctx.fillText(`État n = ${n}`, 20, 30);
            ctx.font = '14px Inter';
            ctx.fillText(`Nœuds: ${n - 1}`, 20, 50);

            if (params.animated) {
                time++;
                animationFrame = requestAnimationFrame(draw);
            }
        }

        const api = {
            start() {
                if (!animationFrame) {
                    params.animated = true;
                    draw();
                }
            },
            stop() {
                if (animationFrame) {
                    cancelAnimationFrame(animationFrame);
                    animationFrame = null;
                }
                params.animated = false;
            },
            setLevel(n) {
                params.level = n;
                if (!params.animated) draw();
            },
            destroy() {
                this.stop();
            }
        };

        draw();
        return api;
    },

    // ============================================================================
    // 11. TRANSFORMÉE DE FOURIER (Espace Position vs Impulsion)
    // ============================================================================

    /**
     * Passage entre espace position et espace des impulsions
     */
    createFourierTransform(canvasId, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas ${canvasId} not found`);
            return null;
        }

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        let animationFrame = null;
        let time = 0;
        let sigma = 30;  // Largeur du paquet

        function draw() {
            ctx.fillStyle = '#0a0e27';
            ctx.fillRect(0, 0, width, height);

            const centerY1 = height / 3;
            const centerY2 = 2 * height / 3;
            const centerX = width / 2;

            // Espace position ψ(x)
            ctx.fillStyle = '#2dd4bf';
            ctx.font = '16px Inter';
            ctx.fillText('Espace position: ψ(x)', 20, centerY1 - 60);

            ctx.strokeStyle = '#2dd4bf';
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let x = 0; x < width; x++) {
                const xNorm = (x - centerX) / sigma;
                const psi = Math.exp(-xNorm * xNorm / 2);
                const y = centerY1 - psi * 50;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Remplissage
            ctx.fillStyle = 'rgba(45, 212, 191, 0.2)';
            ctx.beginPath();
            ctx.moveTo(0, centerY1);
            for (let x = 0; x < width; x++) {
                const xNorm = (x - centerX) / sigma;
                const psi = Math.exp(-xNorm * xNorm / 2);
                const y = centerY1 - psi * 50;
                ctx.lineTo(x, y);
            }
            ctx.lineTo(width, centerY1);
            ctx.closePath();
            ctx.fill();

            // Espace impulsion φ(p) - Transformée de Fourier (gaussienne → gaussienne plus large)
            ctx.fillStyle = '#ec4899';
            ctx.font = '16px Inter';
            ctx.fillText('Espace impulsion: φ(p)', 20, centerY2 - 60);

            const sigmaP = 100 / sigma;  // Principe d'indétermination: Δx·Δp ≥ ℏ/2

            ctx.strokeStyle = '#ec4899';
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let x = 0; x < width; x++) {
                const pNorm = (x - centerX) / (sigmaP * 10);
                const phi = Math.exp(-pNorm * pNorm / 2);
                const y = centerY2 - phi * 50;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Remplissage
            ctx.fillStyle = 'rgba(236, 72, 153, 0.2)';
            ctx.beginPath();
            ctx.moveTo(0, centerY2);
            for (let x = 0; x < width; x++) {
                const pNorm = (x - centerX) / (sigmaP * 10);
                const phi = Math.exp(-pNorm * pNorm / 2);
                const y = centerY2 - phi * 50;
                ctx.lineTo(x, y);
            }
            ctx.lineTo(width, centerY2);
            ctx.closePath();
            ctx.fill();

            // Principe d'indétermination
            ctx.fillStyle = '#9d4edd';
            ctx.font = '14px Inter';
            ctx.fillText(`Δx ≈ ${sigma.toFixed(0)}`, 20, centerY1 + 30);
            ctx.fillText(`Δp ≈ ${(100 / sigma).toFixed(1)}`, 20, centerY2 + 30);
            ctx.fillText('Δx · Δp ≥ ℏ/2', width / 2 - 50, height - 20);

            // Animation: oscillation de sigma
            sigma = 30 + 20 * Math.sin(time * 0.02);
            time++;

            animationFrame = requestAnimationFrame(draw);
        }

        const api = {
            start() {
                if (!animationFrame) draw();
            },
            stop() {
                if (animationFrame) {
                    cancelAnimationFrame(animationFrame);
                    animationFrame = null;
                }
            },
            destroy() {
                this.stop();
            }
        };

        draw();
        return api;
    },

    // ============================================================================
    // 12. TÉLÉPORTATION QUANTIQUE
    // ============================================================================

    /**
     * Protocole de téléportation quantique
     */
    createTeleportation(canvasId, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas ${canvasId} not found`);
            return null;
        }

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        let animationFrame = null;
        let phase = 0;  // 0: initial, 1: entanglement, 2: measurement, 3: teleported

        function drawQubit(x, y, label, color) {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, 20, 0, 2 * Math.PI);
            ctx.fill();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = 'white';
            ctx.font = '14px Inter';
            ctx.fillText(label, x - 8, y + 5);
        }

        function draw() {
            ctx.fillStyle = '#0a0e27';
            ctx.fillRect(0, 0, width, height);

            const aliceX = width / 4;
            const bobX = 3 * width / 4;
            const centerY = height / 2;

            // Alice
            ctx.fillStyle = '#94a3b8';
            ctx.font = '18px Inter';
            ctx.fillText('Alice', aliceX - 20, 30);

            // Bob
            ctx.fillText('Bob', bobX - 15, 30);

            if (phase >= 0) {
                // État à téléporter
                drawQubit(aliceX, centerY - 60, '|ψ⟩', '#2dd4bf');
                ctx.fillStyle = '#94a3b8';
                ctx.font = '12px Inter';
                ctx.fillText('État à téléporter', aliceX - 50, centerY - 90);
            }

            if (phase >= 1) {
                // Paire intriquée
                drawQubit(aliceX, centerY + 40, '|A⟩', '#ec4899');
                drawQubit(bobX, centerY + 40, '|B⟩', '#ec4899');

                // Ligne d'intrication
                ctx.strokeStyle = 'rgba(236, 72, 153, 0.5)';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(aliceX + 20, centerY + 40);
                ctx.lineTo(bobX - 20, centerY + 40);
                ctx.stroke();
                ctx.setLineDash([]);

                ctx.fillStyle = '#94a3b8';
                ctx.font = '12px Inter';
                ctx.fillText('Paire EPR', width / 2 - 30, centerY + 60);
            }

            if (phase >= 2) {
                // Mesure chez Alice
                ctx.strokeStyle = '#9d4edd';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(aliceX, centerY - 10, 70, 0, 2 * Math.PI);
                ctx.stroke();

                ctx.fillStyle = '#9d4edd';
                ctx.font = '14px Inter';
                ctx.fillText('Mesure', aliceX - 25, centerY - 100);

                // Communication classique
                ctx.strokeStyle = '#fbbf24';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(aliceX + 80, 50);
                ctx.lineTo(bobX - 80, 50);
                ctx.stroke();

                // Flèche
                ctx.beginPath();
                ctx.moveTo(bobX - 80, 50);
                ctx.lineTo(bobX - 90, 45);
                ctx.lineTo(bobX - 90, 55);
                ctx.closePath();
                ctx.fillStyle = '#fbbf24';
                ctx.fill();

                ctx.font = '12px Inter';
                ctx.fillText('2 bits classiques', width / 2 - 50, 40);
            }

            if (phase >= 3) {
                // État téléporté chez Bob
                drawQubit(bobX, centerY - 60, '|ψ⟩', '#2dd4bf');

                ctx.fillStyle = '#2dd4bf';
                ctx.font = '14px Inter';
                ctx.fillText('Téléportation', bobX - 45, centerY - 90);
                ctx.fillText('réussie !', bobX - 30, centerY - 75);
            }

            // Info phase
            ctx.fillStyle = '#94a3b8';
            ctx.font = '14px Inter';
            const phases = [
                'Phase 1: État initial',
                'Phase 2: Intrication EPR',
                'Phase 3: Mesure de Bell',
                'Phase 4: État téléporté'
            ];
            ctx.fillText(phases[phase], width / 2 - 80, height - 20);

            animationFrame = requestAnimationFrame(draw);
        }

        const api = {
            start() {
                if (!animationFrame) draw();
            },
            stop() {
                if (animationFrame) {
                    cancelAnimationFrame(animationFrame);
                    animationFrame = null;
                }
            },
            nextPhase() {
                phase = (phase + 1) % 4;
                draw();
            },
            reset() {
                phase = 0;
                draw();
            },
            destroy() {
                this.stop();
            }
        };

        draw();
        return api;
    },

    // ============================================================================
    // 13. ÉVOLUTION TEMPORELLE
    // ============================================================================

    /**
     * Évolution temporelle d'une fonction d'onde selon Schrödinger
     */
    createTimeEvolution(canvasId, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas ${canvasId} not found`);
            return null;
        }

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        let animationFrame = null;
        let time = 0;

        function draw() {
            ctx.fillStyle = 'rgba(10, 14, 39, 0.2)';
            ctx.fillRect(0, 0, width, height);

            const centerY = height / 2;
            const amplitude = 80;

            // Paquet d'ondes se propageant
            const k = 0.05;  // Nombre d'onde
            const omega = 0.03;  // Fréquence angulaire
            const v = omega / k;  // Vitesse de phase

            ctx.strokeStyle = '#2dd4bf';
            ctx.lineWidth = 2;
            ctx.beginPath();

            for (let x = 0; x < width; x++) {
                const sigma = 50;
                const x0 = width / 4 + v * time * 2;  // Centre se déplaçant
                const envelope = Math.exp(-Math.pow((x - x0) / sigma, 2));
                const wave = Math.sin(k * x - omega * time);
                const y = centerY + amplitude * envelope * wave;

                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Labels
            ctx.fillStyle = '#94a3b8';
            ctx.font = '14px Inter';
            ctx.fillText('ψ(x,t) = ∫ φ(k) e^(i(kx - ωt)) dk', 20, 30);
            ctx.fillText(`t = ${(time * 0.1).toFixed(1)}`, 20, 50);

            // Axes
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, centerY);
            ctx.lineTo(width, centerY);
            ctx.stroke();

            time++;
            animationFrame = requestAnimationFrame(draw);
        }

        const api = {
            start() {
                if (!animationFrame) draw();
            },
            stop() {
                if (animationFrame) {
                    cancelAnimationFrame(animationFrame);
                    animationFrame = null;
                }
            },
            reset() {
                time = 0;
                draw();
            },
            destroy() {
                this.stop();
            }
        };

        draw();
        return api;
    }
});

console.log('📊 Quantum Animations Extended Module Loaded');
