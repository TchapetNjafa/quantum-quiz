/**
 * QUANTUM-ANIMATIONS.JS
 * Animations interactives pour visualiser les concepts quantiques
 * Quantum Quiz - PHY321
 */

const QuantumAnimations = {
    // ============================================================================
    // 1. OSCILLATEUR HARMONIQUE QUANTIQUE
    // ============================================================================

    /**
     * Crée une animation de l'oscillateur harmonique quantique
     * Affiche les fonctions d'onde pour différents niveaux n
     */
    createHarmonicOscillator(canvasId, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas ${canvasId} not found`);
            return null;
        }

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Paramètres par défaut
        const params = {
            level: options.level || 0,  // Niveau quantique n
            animated: options.animated !== false,
            showPotential: options.showPotential !== false,
            omega: options.omega || 1,  // Fréquence angulaire
            ...options
        };

        let animationFrame = null;
        let time = 0;

        // Fonction d'onde de l'oscillateur harmonique (approximation)
        function wavefunctionHO(x, n, t = 0) {
            const x0 = width / 2;
            const scale = 50;
            const xNorm = (x - x0) / scale;

            // Facteur de normalisation gaussien
            const gaussian = Math.exp(-xNorm * xNorm / 2);

            // Polynôme de Hermite (simplifié pour n=0,1,2,3)
            let hermite = 1;
            switch(n) {
                case 0:
                    hermite = 1;
                    break;
                case 1:
                    hermite = 2 * xNorm;
                    break;
                case 2:
                    hermite = 4 * xNorm * xNorm - 2;
                    break;
                case 3:
                    hermite = 8 * xNorm * xNorm * xNorm - 12 * xNorm;
                    break;
            }

            // Phase temporelle
            const phase = params.animated ? Math.cos(params.omega * (n + 0.5) * t) : 1;

            return gaussian * hermite * phase;
        }

        // Potentiel harmonique
        function potential(x) {
            const x0 = width / 2;
            const scale = 50;
            const xNorm = (x - x0) / scale;
            return 0.5 * params.omega * params.omega * xNorm * xNorm;
        }

        function draw() {
            // Clear canvas
            ctx.fillStyle = '#0a0e27';
            ctx.fillRect(0, 0, width, height);

            const centerY = height / 2;
            const amplitudeScale = 60;

            // Dessiner le potentiel
            if (params.showPotential) {
                ctx.strokeStyle = 'rgba(157, 78, 221, 0.5)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                for (let x = 0; x < width; x++) {
                    const V = potential(x);
                    const y = centerY - V * amplitudeScale * 0.5;
                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }

            // Dessiner la fonction d'onde (partie réelle)
            ctx.strokeStyle = '#2dd4bf';
            ctx.lineWidth = 3;
            ctx.beginPath();
            for (let x = 0; x < width; x++) {
                const psi = wavefunctionHO(x, params.level, time);
                const y = centerY - psi * amplitudeScale;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Dessiner la densité de probabilité |ψ|²
            ctx.fillStyle = 'rgba(45, 212, 191, 0.2)';
            ctx.beginPath();
            ctx.moveTo(0, centerY);
            for (let x = 0; x < width; x++) {
                const psi = wavefunctionHO(x, params.level, time);
                const prob = psi * psi;
                const y = centerY - prob * amplitudeScale;
                ctx.lineTo(x, y);
            }
            ctx.lineTo(width, centerY);
            ctx.closePath();
            ctx.fill();

            // Afficher le niveau n
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 20px Arial';
            ctx.fillText(`n = ${params.level}`, 20, 40);
            ctx.font = '16px Arial';
            ctx.fillText(`E = ℏω(n + 1/2) = ${(params.level + 0.5).toFixed(1)} ℏω`, 20, 70);

            // Axe x
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, centerY);
            ctx.lineTo(width, centerY);
            ctx.stroke();

            if (params.animated) {
                time += 0.05;
                animationFrame = requestAnimationFrame(draw);
            }
        }

        // API publique
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
                time = 0;
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
    // 2. STERN-GERLACH / SPIN
    // ============================================================================

    createSternGerlach(canvasId, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas ${canvasId} not found`);
            return null;
        }

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        const params = {
            particleCount: options.particleCount || 50,
            speed: options.speed || 2,
            separation: options.separation || 100,
            animated: options.animated !== false,
            ...options
        };

        let particles = [];
        let animationFrame = null;

        class Particle {
            constructor() {
                this.x = 50;
                this.y = height / 2 + (Math.random() - 0.5) * 20;
                this.spin = Math.random() < 0.5 ? 1 : -1;  // +1 = up, -1 = down
                this.vx = params.speed;
                this.vy = 0;
                this.inField = false;
            }

            update() {
                this.x += this.vx;

                // Dans le champ magnétique (au milieu)
                if (this.x > width / 2 && this.x < 2 * width / 3 && !this.inField) {
                    this.inField = true;
                }

                if (this.inField) {
                    // Séparation selon le spin
                    this.vy += this.spin * 0.1;
                }

                this.y += this.vy;

                // Limiter la vitesse verticale
                this.vy = Math.max(-5, Math.min(5, this.vy));

                return this.x < width + 20;
            }

            draw() {
                ctx.fillStyle = this.spin > 0 ? '#f472b6' : '#2dd4bf';
                ctx.beginPath();
                ctx.arc(this.x, this.y, 3, 0, 2 * Math.PI);
                ctx.fill();
            }
        }

        function draw() {
            // Clear avec effet de traînée
            ctx.fillStyle = 'rgba(10, 14, 39, 0.1)';
            ctx.fillRect(0, 0, width, height);

            // Dessiner l'appareil de Stern-Gerlach
            ctx.strokeStyle = 'rgba(157, 78, 221, 0.5)';
            ctx.lineWidth = 2;

            // Aimant (région centrale)
            //haut
            ctx.fillStyle = 'rgba(157, 78, 221, 0.1)';
            ctx.fillRect(width / 3, 0, width / 3, height / 3);
            //bas
            ctx.fillStyle = 'rgba(157, 178, 221, 0.1)';
            ctx.fillRect(width / 3, height / 1.5, width / 3, height);

            // Contours
            ctx.strokeRect(width / 3, 0, width / 3, height);

            // Lignes de gradient de champ
            ctx.strokeStyle = 'rgba(244, 114, 182, 0.3)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 5; i++) {
                const y = (i + 1) * height / 6;
                ctx.beginPath();
                ctx.moveTo(width / 3, y);
                ctx.lineTo(2 * width / 3, y);
                ctx.stroke();
            }

            // Mettre à jour et dessiner les particules
            particles = particles.filter(p => p.update());
            particles.forEach(p => p.draw());

            // Ajouter de nouvelles particules
            if (Math.random() < 0.1 && particles.length < params.particleCount) {
                particles.push(new Particle());
            }

            // Labels
            ctx.fillStyle = '#2dd4bf';
            ctx.font = '16px Arial';
            ctx.fillText('Spin up (+ℏ/2)', width - 120, 50);

            ctx.fillStyle = '#f472b6';
            ctx.fillText('Spin down (-ℏ/2)', width - 130, height - 30);

            if (params.animated) {
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
            destroy() {
                this.stop();
                particles = [];
            }
        };

        draw();
        return api;
    },

    // ============================================================================
    // 3. INTERFÉRENCES DE YOUNG
    // ============================================================================

    createYoungInterference(canvasId, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas ${canvasId} not found`);
            return null;
        }

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        const params = {
            slitSeparation: options.slitSeparation || 60,
            wavelength: options.wavelength || 30,
            animated: options.animated !== false,
            showWaves: options.showWaves !== false,
            ...options
        };

        let time = 0;
        let animationFrame = null;

        function intensity(y) {
            const centerY = height / 2;
            const delta = (params.slitSeparation * (y - centerY)) / (width * 0.7);
            const phaseDiff = (2 * Math.PI * delta) / params.wavelength;

            // Formule d'interférence à deux ondes
            const I = 4 * Math.cos(phaseDiff / 2) ** 2;
            return I / 4;  // Normaliser entre 0 et 1
        }

        function draw() {
            ctx.fillStyle = '#0a0e27';
            ctx.fillRect(0, 0, width, height);

            const slitX = width * 0.2;
            const screenX = width * 0.8;
            const slit1Y = height / 2 - params.slitSeparation / 2;
            const slit2Y = height / 2 + params.slitSeparation / 2;

            // Dessiner les ondes (optionnel)
            if (params.showWaves) {
                ctx.strokeStyle = 'rgba(45, 212, 191, 0.3)';
                ctx.lineWidth = 1;

                for (let r = 0; r < 150; r += 10) {
                    const phase = (r - time * 2) / params.wavelength * 2 * Math.PI;
                    const alpha = Math.max(0, 1 - r / 150);

                    // Ondes depuis la fente 1
                    ctx.strokeStyle = `rgba(45, 212, 191, ${alpha * 0.3})`;
                    ctx.beginPath();
                    ctx.arc(slitX, slit1Y, r, 0, 2 * Math.PI);
                    ctx.stroke();

                    // Ondes depuis la fente 2
                    ctx.beginPath();
                    ctx.arc(slitX, slit2Y, r, 0, 2 * Math.PI);
                    ctx.stroke();
                }
            }

            // Dessiner les fentes
            ctx.fillStyle = '#666';
            ctx.fillRect(slitX - 5, 0, 10, slit1Y - 10);
            ctx.fillRect(slitX - 5, slit1Y + 10, 10, slit2Y - slit1Y - 20);
            ctx.fillRect(slitX - 5, slit2Y + 10, 10, height - slit2Y - 10);

            // Fentes ouvertes
            ctx.fillStyle = '#2dd4bf';
            ctx.fillRect(slitX - 5, slit1Y - 10, 10, 20);
            ctx.fillRect(slitX - 5, slit2Y - 10, 10, 20);

            // Dessiner l'écran avec les franges
            for (let y = 0; y < height; y++) {
                const I = intensity(y);
                const brightness = Math.floor(I * 255);
                ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
                ctx.fillRect(screenX, y, width - screenX, 1);
            }

            // Labels
            ctx.fillStyle = '#ffffff';
            ctx.font = '14px Arial';
            ctx.fillText('Fentes', slitX - 30, 30);
            ctx.fillText('Écran', screenX - 30, 30);
            ctx.fillText('d = ' + params.slitSeparation + ' px', slitX + 20, height / 2);

            if (params.animated) {
                time += 1;
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
            setSlitSeparation(d) {
                params.slitSeparation = d;
                draw();
            },
            setWavelength(lambda) {
                params.wavelength = lambda;
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
    // 4. PAQUET D'ONDES (ÉTALEMENT QUANTIQUE)
    // ============================================================================

    createWavePacket(canvasId, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas ${canvasId} not found`);
            return null;
        }

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        const params = {
            sigma0: options.sigma0 || 30,  // Largeur initiale
            k0: options.k0 || 0.3,  // Nombre d'onde central
            animated: options.animated !== false,
            speed: options.speed || 1,
            ...options
        };

        let time = 0;
        let animationFrame = null;

        function wavePacket(x, t) {
            const x0 = width / 2;
            const sigma = params.sigma0 * Math.sqrt(1 + (t / 100) ** 2);  // Étalement
            const xCenter = x0 + params.speed * t;  // Déplacement

            const envelope = Math.exp(-((x - xCenter) ** 2) / (2 * sigma ** 2));
            const wave = Math.cos(params.k0 * (x - xCenter));

            return envelope * wave;
        }

        function draw() {
            ctx.fillStyle = '#0a0e27';
            ctx.fillRect(0, 0, width, height);

            const centerY = height / 2;
            const amplitudeScale = 80;

            // Dessiner l'enveloppe gaussienne
            ctx.strokeStyle = 'rgba(244, 114, 182, 0.5)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            for (let x = 0; x < width; x++) {
                const psi = wavePacket(x, time);
                const envelope = Math.abs(psi);
                const y = centerY - envelope * amplitudeScale;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.setLineDash([]);

            // Dessiner le paquet d'ondes
            ctx.strokeStyle = '#2dd4bf';
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let x = 0; x < width; x++) {
                const psi = wavePacket(x, time);
                const y = centerY - psi * amplitudeScale;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Dessiner la densité de probabilité
            ctx.fillStyle = 'rgba(45, 212, 191, 0.2)';
            ctx.beginPath();
            ctx.moveTo(0, centerY);
            for (let x = 0; x < width; x++) {
                const psi = wavePacket(x, time);
                const prob = psi ** 2;
                const y = centerY - prob * amplitudeScale;
                ctx.lineTo(x, y);
            }
            ctx.lineTo(width, centerY);
            ctx.closePath();
            ctx.fill();

            // Axe x
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, centerY);
            ctx.lineTo(width, centerY);
            ctx.stroke();

            // Largeur actuelle
            const sigma_t = params.sigma0 * Math.sqrt(1 + (time / 100) ** 2);
            ctx.fillStyle = '#ffffff';
            ctx.font = '16px Arial';
            ctx.fillText(`Largeur: ${sigma_t.toFixed(1)} px (Δx ∝ √t)`, 20, 40);
            ctx.fillText(`Temps: t = ${(time / 10).toFixed(1)}`, 20, 70);

            if (params.animated) {
                time += 0.5;
                if (time > 500) time = 0;  // Reset après étalement complet
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
    },

    // ============================================================================
    // 5. SPHÈRE DE BLOCH
    // ============================================================================

    /**
     * Crée une visualisation 2D de la sphère de Bloch
     * Représente l'état d'un qubit sur la sphère de Bloch
     */
    createBlochSphere(canvasId, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas ${canvasId} not found`);
            return null;
        }

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 3;

        const params = {
            theta: options.theta || Math.PI / 4,  // Angle polaire
            phi: options.phi || 0,  // Angle azimuthal
            animated: options.animated !== false,
            ...options
        };

        let animationFrame = null;
        let time = 0;

        function draw() {
            // Clear canvas
            ctx.fillStyle = '#0a0e27';
            ctx.fillRect(0, 0, width, height);

            if (params.animated) {
                params.phi = time * 0.02;
                time++;
                animationFrame = requestAnimationFrame(draw);
            }

            // Dessiner la sphère (cercle)
            ctx.strokeStyle = 'rgba(157, 78, 221, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.stroke();

            // Axes
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
            ctx.lineWidth = 1;

            // Axe Z (vertical)
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - radius - 20);
            ctx.lineTo(centerX, centerY + radius + 20);
            ctx.stroke();

            // Axe X (horizontal)
            ctx.beginPath();
            ctx.moveTo(centerX - radius - 20, centerY);
            ctx.lineTo(centerX + radius + 20, centerY);
            ctx.stroke();

            // Labels
            ctx.fillStyle = '#2dd4bf';
            ctx.font = '16px Inter';
            ctx.fillText('|0⟩', centerX - 20, centerY - radius - 30);
            ctx.fillText('|1⟩', centerX - 20, centerY + radius + 40);
            ctx.fillText('|+⟩', centerX + radius + 25, centerY + 5);
            ctx.fillText('|-⟩', centerX - radius - 40, centerY + 5);

            // Position du qubit sur la sphère (projection 2D)
            const x = centerX + radius * Math.sin(params.theta) * Math.cos(params.phi);
            const y = centerY - radius * Math.cos(params.theta);

            // Vecteur d'état
            ctx.strokeStyle = '#2dd4bf';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x, y);
            ctx.stroke();

            // Point sur la sphère
            ctx.fillStyle = '#2dd4bf';
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, 2 * Math.PI);
            ctx.fill();

            // Affichage des angles
            ctx.fillStyle = '#94a3b8';
            ctx.font = '14px monospace';
            ctx.fillText(`θ = ${(params.theta * 180 / Math.PI).toFixed(1)}°`, 20, height - 40);
            ctx.fillText(`φ = ${(params.phi * 180 / Math.PI).toFixed(1)}°`, 20, height - 20);
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
            setTheta(theta) {
                params.theta = theta;
                if (!params.animated) draw();
            },
            setPhi(phi) {
                params.phi = phi;
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
    // 6. ÉTATS INTRIQUÉS (BELL STATES)
    // ============================================================================

    /**
     * Visualisation des corrélations entre qubits intriqués
     */
    createEntanglement(canvasId, options = {}) {
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
        let particles = [];

        function initParticles() {
            particles = [];
            for (let i = 0; i < 50; i++) {
                particles.push({
                    x: width / 4 + Math.random() * 10,
                    y: height / 2 + (Math.random() - 0.5) * 100,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    spin: Math.random() > 0.5 ? 1 : -1,
                    entangled: i
                });
            }
        }

        function draw() {
            ctx.fillStyle = 'rgba(10, 14, 39, 0.1)';
            ctx.fillRect(0, 0, width, height);

            time++;
            if (time % 120 === 0) {
                initParticles();
            }

            // Dessiner les paires intriquées
            particles.forEach((p, idx) => {
                // Mise à jour position
                p.x += p.vx;
                p.y += p.vy;

                // Dessiner particule A (gauche)
                ctx.fillStyle = p.spin > 0 ? '#2dd4bf' : '#ec4899';
                ctx.beginPath();
                ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
                ctx.fill();

                // Dessiner particule B (droite) - spin opposé (intrication)
                const mirrorX = width - p.x + width / 2;
                ctx.fillStyle = p.spin > 0 ? '#ec4899' : '#2dd4bf';
                ctx.beginPath();
                ctx.arc(mirrorX, p.y, 4, 0, 2 * Math.PI);
                ctx.fill();

                // Ligne d'intrication
                ctx.strokeStyle = 'rgba(124, 58, 237, 0.3)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(mirrorX, p.y);
                ctx.stroke();

                // Supprimer si hors écran
                if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
                    particles[idx] = {
                        x: width / 4 + Math.random() * 10,
                        y: height / 2 + (Math.random() - 0.5) * 100,
                        vx: (Math.random() - 0.5) * 2,
                        vy: (Math.random() - 0.5) * 2,
                        spin: Math.random() > 0.5 ? 1 : -1,
                        entangled: idx
                    };
                }
            });

            // Labels
            ctx.fillStyle = '#94a3b8';
            ctx.font = '16px Inter';
            ctx.fillText('Qubit A', width / 4 - 30, 30);
            ctx.fillText('Qubit B', 3 * width / 4 - 30, 30);
            ctx.fillText('Corrélations quantiques', width / 2 - 80, height - 20);

            animationFrame = requestAnimationFrame(draw);
        }

        initParticles();

        const api = {
            start() {
                if (!animationFrame) {
                    draw();
                }
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
    // 7. EFFET TUNNEL - VERSION QUANTIQUE COMPLÈTE
    // ============================================================================

    /**
     * Visualisation quantique de l'effet tunnel avec fonction d'onde
     * Montre la pénétration exponentielle dans la barrière et la transmission
     */
    createTunneling(canvasId, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas ${canvasId} not found`);
            return null;
        }

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Paramètres ajustables
        const params = {
            barrierWidth: options.barrierWidth || 80,      // Largeur de la barrière (pixels)
            barrierHeight: options.barrierHeight || 0.7,   // V₀/E_max (hauteur relative)
            energy: options.energy || 0.5,                  // E/E_max (énergie de la particule)
            showClassical: options.showClassical !== false, // Montrer comparaison classique
            animated: options.animated !== false,
            ...options
        };

        let animationFrame = null;
        let time = 0;

        // Positions de la barrière
        const barrierStart = width * 0.35;
        let barrierEnd = barrierStart + params.barrierWidth;

        // Calcul du coefficient de transmission quantique
        function calculateTransmission() {
            if (params.energy >= params.barrierHeight) {
                // E > V₀ : pas de tunnel nécessaire
                return 1.0;
            }

            // E < V₀ : effet tunnel
            const kappa = 2 * Math.sqrt(params.barrierHeight - params.energy);
            const a = params.barrierWidth / 100; // Normalisation
            const T = Math.exp(-2 * kappa * a);
            return Math.min(T, 1);
        }

        // Fonction d'onde dans différentes régions
        function wavefunction(x, t) {
            const k = Math.sqrt(2 * params.energy);  // Nombre d'onde
            const omega = params.energy;  // Fréquence

            // Normalisation des positions
            const xNorm = (x - barrierStart) / 100;
            const barrierWidthNorm = params.barrierWidth / 100;

            let amplitude = 0;

            if (x < barrierStart) {
                // Région I (avant la barrière) : onde incidente + onde réfléchie
                const incident = Math.sin(k * xNorm + omega * t);
                const R = 1 - calculateTransmission();
                const reflected = R * Math.sin(-k * xNorm + omega * t);
                amplitude = incident + reflected;

            } else if (x >= barrierStart && x <= barrierEnd) {
                // Région II (dans la barrière) : décroissance exponentielle
                const kappa = Math.sqrt(2 * Math.abs(params.barrierHeight - params.energy));
                const penetration = (x - barrierStart) / params.barrierWidth;
                amplitude = Math.exp(-kappa * penetration * 3) * Math.cos(omega * t);

            } else {
                // Région III (après la barrière) : onde transmise
                const T = calculateTransmission();
                const xBeyond = (x - barrierEnd) / 100;
                amplitude = Math.sqrt(T) * Math.sin(k * xBeyond + omega * t);
            }

            return amplitude;
        }

        function draw() {
            // Fond semi-transparent pour effet de traînée
            ctx.fillStyle = 'rgba(10, 14, 39, 0.3)';
            ctx.fillRect(0, 0, width, height);

            const centerY = height / 2;
            barrierEnd = barrierStart + params.barrierWidth;

            // Dessiner le potentiel (ligne en haut)
            const potentialY = centerY - params.barrierHeight * 120;

            ctx.strokeStyle = 'rgba(157, 78, 221, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, centerY);
            ctx.lineTo(barrierStart, centerY);
            ctx.lineTo(barrierStart, potentialY);
            ctx.lineTo(barrierEnd, potentialY);
            ctx.lineTo(barrierEnd, centerY);
            ctx.lineTo(width, centerY);
            ctx.stroke();

            // Remplir la barrière
            ctx.fillStyle = 'rgba(157, 78, 221, 0.2)';
            ctx.fillRect(barrierStart, potentialY, params.barrierWidth, centerY - potentialY);

            // Labels sur la barrière
            ctx.fillStyle = '#9d4edd';
            ctx.font = 'bold 16px Inter';
            ctx.fillText('V₀', barrierStart + params.barrierWidth/2 - 12, potentialY - 10);

            // Ligne d'énergie
            const energyY = centerY - params.energy * 120;
            ctx.strokeStyle = '#2dd4bf';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(0, energyY);
            ctx.lineTo(width, energyY);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = '#2dd4bf';
            ctx.font = '14px Inter';
            ctx.fillText('E', 10, energyY - 5);

            // Dessiner la fonction d'onde QUANTIQUE
            ctx.strokeStyle = '#2dd4bf';
            ctx.lineWidth = 3;
            ctx.beginPath();

            for (let x = 0; x < width; x += 2) {
                const psi = wavefunction(x, time * 0.05);
                const y = centerY - psi * 40;

                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Dessiner la densité de probabilité |ψ|²
            ctx.fillStyle = 'rgba(45, 212, 191, 0.2)';
            ctx.beginPath();
            ctx.moveTo(0, centerY);

            for (let x = 0; x < width; x += 2) {
                const psi = wavefunction(x, time * 0.05);
                const prob = psi * psi;
                const y = centerY - prob * 20;
                ctx.lineTo(x, y);
            }
            ctx.lineTo(width, centerY);
            ctx.closePath();
            ctx.fill();

            // Comparaison classique (si activée)
            if (params.showClassical) {
                // Particules classiques
                const numParticles = 20;
                ctx.fillStyle = 'rgba(236, 72, 153, 0.6)';

                for (let i = 0; i < numParticles; i++) {
                    const particleX = (time * 3 + i * 30) % (width + 100) - 50;

                    // Comportement classique : réflexion si E < V₀
                    let x = particleX;
                    if (params.energy < params.barrierHeight) {
                        // Réflexion classique
                        if (particleX >= barrierStart && particleX < barrierStart + 20) {
                            x = barrierStart - (particleX - barrierStart);
                        }
                    }

                    if (x >= 0 && x < width) {
                        ctx.beginPath();
                        ctx.arc(x, centerY + 80, 4, 0, 2 * Math.PI);
                        ctx.fill();
                    }
                }

                ctx.fillStyle = '#ec4899';
                ctx.font = '12px Inter';
                ctx.fillText('Classique (réflexion totale si E < V₀)', 10, centerY + 110);
            }

            // Afficher les paramètres et coefficients
            ctx.fillStyle = '#94a3b8';
            ctx.font = '14px Inter';
            const T = calculateTransmission();
            const R = 1 - T;

            ctx.fillText(`Largeur barrière: ${params.barrierWidth.toFixed(0)} px`, 10, 30);
            ctx.fillText(`E/V₀ = ${(params.energy / params.barrierHeight).toFixed(2)}`, 10, 50);

            ctx.fillStyle = '#2dd4bf';
            ctx.font = 'bold 14px Inter';
            ctx.fillText(`T (transmission) = ${(T * 100).toFixed(1)}%`, width - 220, 30);
            ctx.fillStyle = '#ec4899';
            ctx.fillText(`R (réflexion) = ${(R * 100).toFixed(1)}%`, width - 220, 50);

            // Légendes des régions
            ctx.fillStyle = '#94a3b8';
            ctx.font = '12px Inter';
            ctx.fillText('Région I', barrierStart/2 - 25, height - 20);
            ctx.fillText('Région II (barrière)', barrierStart + params.barrierWidth/2 - 50, height - 20);
            ctx.fillText('Région III', barrierEnd + (width - barrierEnd)/2 - 30, height - 20);

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
            setBarrierWidth(width) {
                params.barrierWidth = width;
                if (!params.animated) draw();
            },
            setBarrierHeight(height) {
                params.barrierHeight = height;
                if (!params.animated) draw();
            },
            setEnergy(energy) {
                params.energy = energy;
                if (!params.animated) draw();
            },
            toggleClassical() {
                params.showClassical = !params.showClassical;
                draw();
            },
            destroy() {
                this.stop();
            }
        };

        draw();
        return api;
    }
};

// Export pour usage global
window.QuantumAnimations = QuantumAnimations;

console.log('📊 Quantum Animations Module Loaded');
