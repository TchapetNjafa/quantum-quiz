/**
 * Rendu des différents types de questions
 */

const QuestionRenderer = {
    // Rend une question selon son type
    async render(question, container, mode = 'quiz') {
        container.innerHTML = '';

        // Header de la question
        const header = this.createQuestionHeader(question);
        container.appendChild(header);

        // Zone de réponse selon le type
        const answerArea = this.createAnswerArea(question, mode);
        container.appendChild(answerArea);

        // Rend les formules LaTeX
        await renderMath(container);

        return container;
    },

    // Crée le header de la question
    createQuestionHeader(question) {
        const header = document.createElement('div');
        header.className = 'question-header';

        // Contexte (optionnel)
        if (question.context) {
            const contextDiv = document.createElement('div');
            contextDiv.className = 'question-context';
            contextDiv.innerHTML = `<strong>Contexte :</strong> ${question.context}`;
            header.appendChild(contextDiv);
        }

        // Question principale
        const questionText = document.createElement('div');
        questionText.className = 'question-text';
        questionText.innerHTML = question.question;
        header.appendChild(questionText);

        // Image (optionnel)
        if (question.image_url) {
            const img = document.createElement('img');
            img.src = question.image_url;
            img.alt = question.image_alt || 'Image de la question';
            img.className = 'question-image';
            img.loading = 'lazy'; // Lazy loading natif pour meilleures performances
            header.appendChild(img);
        }

        // Formule principale (optionnel)
        if (question.formula) {
            const formulaDiv = document.createElement('div');
            formulaDiv.className = 'question-formula';
            formulaDiv.innerHTML = question.formula;
            header.appendChild(formulaDiv);
        }

        // Métadonnées et actions
        const meta = document.createElement('div');
        meta.className = 'question-meta';

        const badges = document.createElement('div');
        badges.className = 'meta-badges';
        badges.innerHTML = `
            <span class="difficulty-badge difficulty-${question.difficulty}">
                ${question.difficulty === 'easy' ? 'Facile' : question.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
            </span>
            <span class="points-badge">${question.points || 1} point${question.points > 1 ? 's' : ''}</span>
            ${question.time_estimate ? `<span class="time-badge">⏱ ${question.time_estimate}s</span>` : ''}
        `;
        meta.appendChild(badges);

        // Boutons Favoris et Notes
        if (window.Favorites && question.id) {
            const actions = document.createElement('div');
            actions.className = 'question-actions';

            const favBtn = Favorites.createFavoriteButton(question.id, question);
            actions.appendChild(favBtn);

            const noteBtn = Favorites.createNoteButton(question.id);
            noteBtn.setAttribute('data-question-id', question.id);
            actions.appendChild(noteBtn);

            meta.appendChild(actions);
        }

        header.appendChild(meta);

        return header;
    },

    // Crée la zone de réponse selon le type
    createAnswerArea(question, mode) {
        const area = document.createElement('div');
        area.className = 'answer-area';
        const questionType = getQuestionType(question);
        area.dataset.type = questionType;

        switch (questionType) {
            case 'qcm':
                this.renderQCM(question, area, mode);
                break;
            case 'vrai_faux':
                this.renderVraiFaux(question, area, mode);
                break;
            case 'matching':
                this.renderMatching(question, area, mode);
                break;
            case 'numerical':
                this.renderNumerical(question, area, mode);
                break;
            case 'interpretation':
                this.renderInterpretation(question, area, mode);
                break;
            case 'hotspot':
                this.renderHotspot(question, area, mode);
                break;
            case 'drag_drop':
                this.renderDragDrop(question, area, mode);
                break;
            case 'flashcard':
                this.renderFlashcard(question, area, mode);
                break;
            case 'animation':
                this.renderAnimation(question, area, mode);
                break;
            default:
                area.innerHTML = `<p class="error">Type de question non supporté: ${questionType}</p>`;
        }

        return area;
    },

    // QCM (choix multiple)
    renderQCM(question, container, mode) {
        const form = document.createElement('div');
        form.className = 'qcm-options';

        // Crée un tableau d'objets avec option et index original
        const optionsWithIndex = question.options.map((option, index) => ({
            text: option,
            originalIndex: index
        }));

        // Mélange les options (sauf en mode review pour cohérence avec l'explication)
        const displayedOptions = mode === 'review' ? optionsWithIndex : shuffleArray([...optionsWithIndex]);

        displayedOptions.forEach((optionData, displayIndex) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option-item';

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'answer';
            // Stocke l'index ORIGINAL dans la value pour la vérification
            input.value = optionData.originalIndex;
            input.id = `option-${displayIndex}`;
            // Attribut data pour debugging
            input.dataset.originalIndex = optionData.originalIndex;

            // Son lors de la sélection
            if (mode !== 'review') {
                input.addEventListener('change', () => {
                    if (typeof AudioSystem !== 'undefined') {
                        AudioSystem.click();
                    }
                });
            }

            const label = document.createElement('label');
            label.htmlFor = `option-${displayIndex}`;
            // Utilise displayIndex pour les lettres A, B, C, D
            label.innerHTML = `<span class="option-letter">${String.fromCharCode(65 + displayIndex)}</span>${optionData.text}`;

            if (mode === 'review') {
                input.disabled = true;
                if (optionData.originalIndex === question.correct_answer) {
                    optionDiv.classList.add('correct');
                }
            }

            optionDiv.appendChild(input);
            optionDiv.appendChild(label);
            form.appendChild(optionDiv);
        });

        container.appendChild(form);
    },

    // Vrai/Faux
    renderVraiFaux(question, container, mode) {
        const form = document.createElement('div');
        form.className = 'vrai-faux-options';

        ['Vrai', 'Faux'].forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option-item vf-option';

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'answer';
            input.value = index === 0 ? 'true' : 'false';
            input.id = `vf-${index}`;

            // Son lors de la sélection
            if (mode !== 'review') {
                input.addEventListener('change', () => {
                    if (typeof AudioSystem !== 'undefined') {
                        AudioSystem.click();
                    }
                });
            }

            const label = document.createElement('label');
            label.htmlFor = `vf-${index}`;
            label.innerHTML = `<span class="vf-icon">${index === 0 ? '✓' : '✗'}</span>${option}`;

            if (mode === 'review') {
                input.disabled = true;
                const isCorrect = (index === 0 && question.correct_answer === true) ||
                                (index === 1 && question.correct_answer === false);
                if (isCorrect) {
                    optionDiv.classList.add('correct');
                }
            }

            optionDiv.appendChild(input);
            optionDiv.appendChild(label);
            form.appendChild(optionDiv);
        });

        container.appendChild(form);
    },

    // Matching (correspondances)
    renderMatching(question, container, mode) {
        const instruction = document.createElement('p');
        instruction.className = 'matching-instruction';
        instruction.textContent = 'Associez chaque élément de gauche avec sa correspondance à droite :';
        container.appendChild(instruction);

        const matchingArea = document.createElement('div');
        matchingArea.className = 'matching-area';

        // Mélange la colonne de droite (sauf en mode review)
        const rightItems = mode === 'review'
            ? question.pairs.map(p => p.right)
            : shuffleArray([...question.pairs.map(p => p.right), ...(question.distractors || [])]);

        question.pairs.forEach((pair, index) => {
            const row = document.createElement('div');
            row.className = 'matching-row';

            const left = document.createElement('div');
            left.className = 'matching-left mathjax';
            left.innerHTML = pair.left;

            const arrow = document.createElement('div');
            arrow.className = 'matching-arrow';
            arrow.textContent = '→';

            // Pour les matrices, on utilise un affichage div au lieu de select
            const rightContainer = document.createElement('div');
            rightContainer.className = 'matching-right-container';

            const select = document.createElement('select');
            select.className = 'matching-select';
            select.dataset.index = index;

            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = '-- Choisir --';
            select.appendChild(defaultOption);

            rightItems.forEach((rightText, i) => {
                const option = document.createElement('option');
                option.value = rightText;
                // Pour les matrices, on affiche un texte simplifié dans le select
                if (rightText.includes('begin{pmatrix}')) {
                    option.textContent = `Matrice ${String.fromCharCode(65 + i)}`;
                    option.dataset.formula = rightText;
                } else {
                    option.textContent = rightText;
                }
                select.appendChild(option);
            });

            // Preview de la formule sélectionnée
            const preview = document.createElement('div');
            preview.className = 'matching-preview mathjax';
            preview.style.minHeight = '40px';
            preview.style.padding = '10px';
            preview.style.border = '1px solid var(--border-color)';
            preview.style.borderRadius = '4px';
            preview.style.marginTop = '5px';

            select.addEventListener('change', async (e) => {
                const selectedOption = e.target.selectedOptions[0];
                if (selectedOption.dataset.formula) {
                    preview.innerHTML = selectedOption.dataset.formula;
                } else {
                    preview.innerHTML = e.target.value;
                }
                // Rend la formule
                if (isMathJaxReady()) {
                    await MathJax.typesetPromise([preview]);
                }
            });

            if (mode === 'review') {
                select.value = pair.right;
                select.disabled = true;
                preview.innerHTML = pair.right;
                // Rend la formule en mode review
                if (isMathJaxReady()) {
                    MathJax.typesetPromise([preview]).catch(err => console.warn('MathJax error:', err));
                }
                if (select.value === pair.right) {
                    row.classList.add('correct');
                }
            }

            rightContainer.appendChild(select);
            rightContainer.appendChild(preview);

            row.appendChild(left);
            row.appendChild(arrow);
            row.appendChild(rightContainer);
            matchingArea.appendChild(row);
        });

        container.appendChild(matchingArea);
    },

    // Numérique
    renderNumerical(question, container, mode) {
        const inputGroup = document.createElement('div');
        inputGroup.className = 'numerical-input-group';

        const label = document.createElement('label');
        label.textContent = 'Votre réponse :';
        label.htmlFor = 'numerical-answer';

        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'input-wrapper';

        const input = document.createElement('input');
        input.type = 'number';
        input.id = 'numerical-answer';
        input.name = 'answer';
        input.step = 'any';
        input.placeholder = 'Entrez un nombre';

        if (question.unit) {
            const unit = document.createElement('span');
            unit.className = 'unit-label';
            unit.textContent = question.unit;
            inputWrapper.appendChild(input);
            inputWrapper.appendChild(unit);
        } else {
            inputWrapper.appendChild(input);
        }

        if (mode === 'review') {
            input.value = question.correct_answer;
            input.disabled = true;
            inputWrapper.classList.add('correct');
        }

        inputGroup.appendChild(label);
        inputGroup.appendChild(inputWrapper);

        if (question.tolerance) {
            const hint = document.createElement('small');
            hint.className = 'numerical-hint';
            hint.textContent = `Tolérance : ±${question.tolerance}`;
            inputGroup.appendChild(hint);
        }

        container.appendChild(inputGroup);
    },

    // Interprétation (texte libre)
    renderInterpretation(question, container, mode) {
        const textareaGroup = document.createElement('div');
        textareaGroup.className = 'interpretation-group';

        const label = document.createElement('label');
        label.textContent = 'Votre réponse (développez votre raisonnement) :';
        label.htmlFor = 'interpretation-answer';

        const textarea = document.createElement('textarea');
        textarea.id = 'interpretation-answer';
        textarea.name = 'answer';
        textarea.rows = 6;
        textarea.placeholder = 'Écrivez votre réponse détaillée ici...';

        if (mode === 'review' && question.sample_answer) {
            const sampleDiv = document.createElement('div');
            sampleDiv.className = 'sample-answer';
            sampleDiv.innerHTML = `<strong>Réponse type :</strong><p>${question.sample_answer}</p>`;
            textareaGroup.appendChild(sampleDiv);
            textarea.disabled = true;
        }

        textareaGroup.appendChild(label);
        textareaGroup.appendChild(textarea);

        const hint = document.createElement('small');
        hint.className = 'interpretation-hint';
        hint.innerHTML = `💡 Cette question nécessite une réponse rédigée. Points attribués : ${question.points || 2}`;
        textareaGroup.appendChild(hint);

        container.appendChild(textareaGroup);
    },

    // Hotspot (cliquer sur une zone d'une image)
    renderHotspot(question, container, mode) {
        const instruction = document.createElement('p');
        instruction.className = 'hotspot-instruction';
        instruction.textContent = 'Cliquez sur la zone correcte dans l\'image :';
        container.appendChild(instruction);

        const hotspotArea = document.createElement('div');
        hotspotArea.className = 'hotspot-area';

        // SVG container pour l'image et les zones cliquables
        const svgContainer = document.createElement('div');
        svgContainer.className = 'hotspot-svg-container';
        svgContainer.style.position = 'relative';
        svgContainer.style.maxWidth = '600px';
        svgContainer.style.margin = '0 auto';

        const img = document.createElement('img');
        img.src = question.image_url;
        img.alt = question.image_alt || 'Image hotspot';
        img.style.width = '100%';
        img.style.display = 'block';
        img.loading = 'lazy'; // Lazy loading natif

        const canvas = document.createElement('canvas');
        canvas.className = 'hotspot-canvas';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.cursor = 'crosshair';
        canvas.dataset.selectedHotspot = '';

        // Attendre que l'image soit chargée pour initialiser le canvas
        img.onload = () => {
            // Petit délai pour s'assurer que le layout CSS est terminé
            setTimeout(() => {
                const displayWidth = img.clientWidth || img.offsetWidth;
                const displayHeight = img.clientHeight || img.offsetHeight;

                canvas.width = displayWidth;
                canvas.height = displayHeight;
                canvas.style.width = displayWidth + 'px';
                canvas.style.height = displayHeight + 'px';

                const ctx = canvas.getContext('2d');

                // Pour les SVG, naturalWidth/Height peut être 0 ou incorrect
                // Utiliser les dimensions définies dans l'image ou estimer à partir des hotspots
                let naturalWidth = img.naturalWidth;
                let naturalHeight = img.naturalHeight;

                // Si les dimensions naturelles ne sont pas disponibles (SVG), essayer d'autres méthodes
                if (!naturalWidth || !naturalHeight || naturalWidth === 0 || naturalHeight === 0) {
                    // Pour les SVG, utiliser les dimensions connues basées sur le nom du fichier
                    // ou estimer à partir des coordonnées hotspot
                    if (question.image_dimensions) {
                        // Dimensions explicites fournies dans la question
                        naturalWidth = question.image_dimensions.width;
                        naturalHeight = question.image_dimensions.height;
                    } else {
                        // Trouver les coordonnées max dans les hotspots pour estimer les dimensions
                        const maxX = Math.max(...question.hotspots.map(h => h.x + h.radius));
                        const maxY = Math.max(...question.hotspots.map(h => h.y + h.radius));
                        // Ajouter une marge de 15% et arrondir
                        naturalWidth = Math.max(600, Math.ceil(maxX * 1.15));
                        naturalHeight = Math.max(400, Math.ceil(maxY * 1.15));
                    }
                    console.log(`Hotspot: dimensions estimées à ${naturalWidth}x${naturalHeight}`);
                }

                // S'assurer que les dimensions sont cohérentes
                if (naturalWidth < 100) naturalWidth = 600;
                if (naturalHeight < 100) naturalHeight = 400;

                const scaleX = displayWidth / naturalWidth;
                const scaleY = displayHeight / naturalHeight;

                console.log(`Hotspot debug - Image: ${naturalWidth}x${naturalHeight}, Display: ${displayWidth}x${displayHeight}, Scale: ${scaleX.toFixed(3)}x${scaleY.toFixed(3)}`);

                // Dessiner les zones de hotspot
                const drawHotspots = (highlight = null) => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    question.hotspots.forEach(hotspot => {
                        const x = hotspot.x * scaleX;
                        const y = hotspot.y * scaleY;
                        const radius = hotspot.radius * Math.min(scaleX, scaleY);

                        ctx.beginPath();
                        ctx.arc(x, y, radius, 0, 2 * Math.PI);

                        if (mode === 'review' && hotspot.id === question.correct_hotspot) {
                            ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
                            ctx.strokeStyle = '#00ff00';
                            ctx.lineWidth = 3;
                        } else if (highlight === hotspot.id) {
                            ctx.fillStyle = 'rgba(0, 217, 255, 0.3)';
                            ctx.strokeStyle = '#00d9ff';
                            ctx.lineWidth = 2;
                        } else {
                            ctx.fillStyle = 'rgba(124, 58, 237, 0.1)';
                            ctx.strokeStyle = '#7c3aed';
                            ctx.lineWidth = 1;
                        }

                        ctx.fill();
                        ctx.stroke();
                    });
                };

                drawHotspots();

                if (mode !== 'review') {
                    canvas.addEventListener('click', (e) => {
                        const rect = canvas.getBoundingClientRect();
                        // Convertir les coordonnées du clic en coordonnées canvas
                        const clickX = (e.clientX - rect.left) * (canvas.width / rect.width);
                        const clickY = (e.clientY - rect.top) * (canvas.height / rect.height);

                        // Vérifier quel hotspot a été cliqué
                        for (const hotspot of question.hotspots) {
                            const x = hotspot.x * scaleX;
                            const y = hotspot.y * scaleY;
                            const radius = hotspot.radius * Math.min(scaleX, scaleY);

                            const distance = Math.sqrt((clickX - x) ** 2 + (clickY - y) ** 2);

                            if (distance <= radius) {
                                canvas.dataset.selectedHotspot = hotspot.id;
                                drawHotspots(hotspot.id);
                                if (typeof AudioSystem !== 'undefined') AudioSystem.click();
                                break;
                            }
                        }
                    });
                }
            }, 50); // Délai de 50ms pour le layout CSS
        };

        svgContainer.appendChild(img);
        svgContainer.appendChild(canvas);
        hotspotArea.appendChild(svgContainer);

        // Légende des zones
        if (mode === 'review') {
            const legend = document.createElement('div');
            legend.className = 'hotspot-legend';
            legend.innerHTML = `<small>Zone correcte : ${question.hotspots.find(h => h.id === question.correct_hotspot)?.label || 'N/A'}</small>`;
            hotspotArea.appendChild(legend);
        }

        container.appendChild(hotspotArea);
    },

    // Drag & Drop (glisser-déposer)
    renderDragDrop(question, container, mode) {
        const instruction = document.createElement('p');
        instruction.className = 'drag-drop-instruction';
        instruction.textContent = 'Faites glisser chaque élément vers la zone correspondante :';
        container.appendChild(instruction);

        const ddArea = document.createElement('div');
        ddArea.className = 'drag-drop-area';

        // Variable pour stocker l'élément en cours de drag (compatibilité Firefox)
        let draggedElement = null;

        // Zone des éléments draggables
        const itemsZone = document.createElement('div');
        itemsZone.className = 'draggable-items-zone';

        const shuffledItems = mode === 'review' ? question.draggable_items : shuffleArray([...question.draggable_items]);

        shuffledItems.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'draggable-item';
            itemDiv.textContent = item.text;
            itemDiv.draggable = mode !== 'review';
            itemDiv.dataset.itemId = item.id;
            itemsZone.appendChild(itemDiv);
        });

        // Event delegation pour les événements drag (compatibilité Firefox)
        if (mode !== 'review') {
            ddArea.addEventListener('dragstart', (e) => {
                if (e.target.classList.contains('draggable-item')) {
                    console.log('🎯 DRAGSTART:', e.target.dataset.itemId);
                    draggedElement = e.target;
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/html', e.target.dataset.itemId);
                    setTimeout(() => e.target.classList.add('dragging'), 0);
                }
            });

            ddArea.addEventListener('dragend', (e) => {
                if (e.target.classList.contains('draggable-item')) {
                    console.log('🏁 DRAGEND:', e.target.dataset.itemId);
                    e.target.classList.remove('dragging');
                    draggedElement = null;
                }
            });
        }

        // Zones de dépôt
        const dropZones = document.createElement('div');
        dropZones.className = 'drop-zones';

        question.drop_zones.forEach(zone => {
            const dropZone = document.createElement('div');
            dropZone.className = 'drop-zone';
            dropZone.dataset.zoneId = zone.id;

            const zoneLabel = document.createElement('div');
            zoneLabel.className = 'drop-zone-label';
            zoneLabel.textContent = zone.label;
            dropZone.appendChild(zoneLabel);

            const droppedItems = document.createElement('div');
            droppedItems.className = 'dropped-items';
            dropZone.appendChild(droppedItems);

            if (mode === 'review') {
                // Afficher les bonnes réponses
                Object.entries(question.correct_matches).forEach(([itemId, correctZoneId]) => {
                    if (correctZoneId === zone.id) {
                        const item = question.draggable_items.find(i => i.id === itemId);
                        if (item) {
                            const itemDiv = document.createElement('div');
                            itemDiv.className = 'draggable-item dropped correct';
                            itemDiv.textContent = item.text;
                            droppedItems.appendChild(itemDiv);
                        }
                    }
                });
            } else {
                // Événements drag & drop - compatibilité Firefox
                dropZone.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    dropZone.classList.add('drag-over');
                    console.log('👆 DRAGOVER sur zone:', zone.id);
                });

                dropZone.addEventListener('dragenter', (e) => {
                    e.preventDefault();
                });

                dropZone.addEventListener('dragleave', (e) => {
                    // Vérifier si on quitte vraiment la dropZone
                    const rect = dropZone.getBoundingClientRect();
                    if (e.clientX < rect.left || e.clientX >= rect.right ||
                        e.clientY < rect.top || e.clientY >= rect.bottom) {
                        dropZone.classList.remove('drag-over');
                    }
                });

                dropZone.addEventListener('drop', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dropZone.classList.remove('drag-over');
                    console.log('💧 DROP EVENT sur zone:', zone.id);

                    if (draggedElement && draggedElement.classList.contains('draggable-item')) {
                        console.log('   Element à déposer:', draggedElement.dataset.itemId);

                        // Retirer l'élément de sa position actuelle
                        if (draggedElement.parentElement) {
                            draggedElement.parentElement.removeChild(draggedElement);
                        }

                        // Ajouter à la nouvelle zone
                        draggedElement.classList.add('dropped');
                        draggedElement.draggable = true;
                        droppedItems.appendChild(draggedElement);
                        console.log('   ✅ Element déposé avec succès');

                        AudioSystem.click();
                    } else {
                        console.log('   ❌ Aucun element à déposer!');
                    }
                });
            }

            dropZones.appendChild(dropZone);
        });

        // Zone de retour pour les items non placés - compatibilité Firefox
        if (mode !== 'review') {
            itemsZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            });

            itemsZone.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (draggedElement && draggedElement.classList.contains('draggable-item')) {
                    // Retirer l'élément de sa position actuelle
                    if (draggedElement.parentElement && draggedElement.parentElement !== itemsZone) {
                        draggedElement.parentElement.removeChild(draggedElement);
                        draggedElement.classList.remove('dropped');
                        itemsZone.appendChild(draggedElement);
                        AudioSystem.click();
                    }
                }
            });
        }

        ddArea.appendChild(itemsZone);
        ddArea.appendChild(dropZones);
        container.appendChild(ddArea);
    },

    // Flashcard (recto-verso)
    renderFlashcard(question, container, mode) {
        const flashcardContainer = document.createElement('div');
        flashcardContainer.className = 'flashcard-container';

        const card = document.createElement('div');
        card.className = 'flashcard';
        card.dataset.flipped = 'false';

        const front = document.createElement('div');
        front.className = 'flashcard-front';
        front.innerHTML = `
            <div class="flashcard-content">
                <div class="flashcard-label">Question</div>
                <div class="flashcard-text">${question.front}</div>
                ${question.hint ? `<div class="flashcard-hint">💡 Indice : ${question.hint}</div>` : ''}
            </div>
        `;

        const back = document.createElement('div');
        back.className = 'flashcard-back';
        back.innerHTML = `
            <div class="flashcard-content">
                <div class="flashcard-label">Réponse</div>
                <div class="flashcard-text">${question.back}</div>
            </div>
        `;

        card.appendChild(front);
        card.appendChild(back);

        const flipBtn = document.createElement('button');
        flipBtn.className = 'flashcard-flip-btn';
        flipBtn.textContent = '🔄 Retourner la carte';

        flipBtn.addEventListener('click', () => {
            const isFlipped = card.dataset.flipped === 'true';
            card.dataset.flipped = isFlipped ? 'false' : 'true';
            card.classList.toggle('flipped');
            flipBtn.textContent = isFlipped ? '🔄 Retourner la carte' : '🔙 Voir la question';
            AudioSystem.click();
        });

        // En mode révision, auto-flip après 3 secondes
        if (mode === 'review') {
            setTimeout(() => {
                card.dataset.flipped = 'true';
                card.classList.add('flipped');
                flipBtn.textContent = '🔙 Voir la question';
            }, 3000);
        }

        // Boutons de feedback
        const feedbackBtns = document.createElement('div');
        feedbackBtns.className = 'flashcard-feedback';
        feedbackBtns.innerHTML = `
            <p>Avez-vous su répondre ?</p>
            <div class="feedback-buttons">
                <button class="feedback-btn feedback-no" data-answer="false">❌ Non</button>
                <button class="feedback-btn feedback-yes" data-answer="true">✅ Oui</button>
            </div>
        `;

        const feedbackButtons = feedbackBtns.querySelectorAll('.feedback-btn');
        feedbackButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                feedbackButtons.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                card.dataset.userAnswer = btn.dataset.answer;
                AudioSystem.click();
            });
        });

        flashcardContainer.appendChild(card);
        flashcardContainer.appendChild(flipBtn);
        flashcardContainer.appendChild(feedbackBtns);
        container.appendChild(flashcardContainer);
    },

    // Animation (visualisation interactive)
    renderAnimation(question, container, mode) {
        const animationContainer = document.createElement('div');
        animationContainer.className = 'animation-container';

        // Create canvas for animation
        const canvas = document.createElement('canvas');
        canvas.id = `animation-canvas-${Date.now()}`;
        canvas.width = 800;
        canvas.height = 300;
        canvas.className = 'animation-canvas';

        // Animation description
        if (question.animation_description) {
            const description = document.createElement('div');
            description.className = 'animation-description';
            description.innerHTML = question.animation_description;
            animationContainer.appendChild(description);
        }

        animationContainer.appendChild(canvas);

        // Controls
        const controls = document.createElement('div');
        controls.className = 'animation-controls';

        const playBtn = document.createElement('button');
        playBtn.className = 'btn-animation btn-play';
        playBtn.innerHTML = '▶ Play';
        playBtn.dataset.state = 'paused';

        const resetBtn = document.createElement('button');
        resetBtn.className = 'btn-animation btn-reset';
        resetBtn.innerHTML = '🔄 Reset';

        controls.appendChild(playBtn);
        controls.appendChild(resetBtn);

        // Add parameter controls if specified
        if (question.animation_params) {
            Object.entries(question.animation_params).forEach(([param, config]) => {
                const paramControl = document.createElement('div');
                paramControl.className = 'param-control';

                const label = document.createElement('label');
                label.textContent = config.label;

                const slider = document.createElement('input');
                slider.type = 'range';
                slider.min = config.min;
                slider.max = config.max;
                slider.value = config.default;
                slider.step = config.step || 1;
                slider.dataset.param = param;

                const valueSpan = document.createElement('span');
                valueSpan.className = 'param-value';
                valueSpan.textContent = config.default + (config.unit || '');

                slider.addEventListener('input', (e) => {
                    valueSpan.textContent = e.target.value + (config.unit || '');
                    if (canvas.animationInstance && canvas.animationInstance.setParameter) {
                        canvas.animationInstance.setParameter(param, parseFloat(e.target.value));
                    }
                });

                paramControl.appendChild(label);
                paramControl.appendChild(slider);
                paramControl.appendChild(valueSpan);
                controls.appendChild(paramControl);
            });
        }

        animationContainer.appendChild(controls);

        // Initialize animation after canvas is added to DOM
        setTimeout(() => {
            if (window.QuantumAnimations && question.animation_type) {
                let animationInstance = null;

                // Create animation based on type
                switch (question.animation_type) {
                    case 'harmonic_oscillator':
                        animationInstance = QuantumAnimations.createHarmonicOscillator(canvas.id, {
                            animated: false,
                            level: question.animation_config?.level || 0
                        });
                        break;
                    case 'stern_gerlach':
                        animationInstance = QuantumAnimations.createSternGerlach(canvas.id, {
                            animated: false
                        });
                        break;
                    case 'young_interference':
                        animationInstance = QuantumAnimations.createYoungInterference(canvas.id, {
                            animated: false
                        });
                        break;
                    case 'wave_packet':
                        animationInstance = QuantumAnimations.createWavePacket(canvas.id, {
                            animated: false
                        });
                        break;
                    default:
                        console.warn('Unknown animation type:', question.animation_type);
                }

                // Store instance for controls
                canvas.animationInstance = animationInstance;

                // Play/Pause button
                playBtn.addEventListener('click', () => {
                    if (!animationInstance) return;

                    if (playBtn.dataset.state === 'paused') {
                        animationInstance.start();
                        playBtn.innerHTML = '⏸ Pause';
                        playBtn.dataset.state = 'playing';
                    } else {
                        animationInstance.stop();
                        playBtn.innerHTML = '▶ Play';
                        playBtn.dataset.state = 'paused';
                    }
                    AudioSystem.click();
                });

                // Reset button
                resetBtn.addEventListener('click', () => {
                    if (!animationInstance) return;
                    if (animationInstance.reset) {
                        animationInstance.reset();
                    }
                    playBtn.innerHTML = '▶ Play';
                    playBtn.dataset.state = 'paused';
                    AudioSystem.click();
                });
            }
        }, 100);

        // Add question options below animation (QCM format)
        if (question.options) {
            const questionPrompt = document.createElement('div');
            questionPrompt.className = 'animation-question-prompt';
            questionPrompt.innerHTML = '<p><strong>Basé sur l\'animation ci-dessus, répondez :</strong></p>';
            animationContainer.appendChild(questionPrompt);

            const optionsForm = document.createElement('div');
            optionsForm.className = 'qcm-options';

            question.options.forEach((option, index) => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'option-item';

                const input = document.createElement('input');
                input.type = 'radio';
                input.name = 'answer';
                input.value = index;
                input.id = `anim-option-${index}`;

                const label = document.createElement('label');
                label.htmlFor = `anim-option-${index}`;
                label.innerHTML = `<span class="option-letter">${String.fromCharCode(65 + index)}</span>${option}`;

                if (mode === 'review') {
                    input.disabled = true;
                    if (index === question.correct_answer) {
                        optionDiv.classList.add('correct');
                    }
                }

                optionDiv.appendChild(input);
                optionDiv.appendChild(label);
                optionsForm.appendChild(optionDiv);
            });

            animationContainer.appendChild(optionsForm);
        }

        container.appendChild(animationContainer);
    },

    // Récupère la réponse de l'utilisateur
    getUserAnswer(container, question) {
        const type = container.dataset.type;

        switch (type) {
            case 'qcm': {
                const selected = container.querySelector('input[name="answer"]:checked');
                return selected ? parseInt(selected.value) : null;
            }

            case 'vrai_faux': {
                const selected = container.querySelector('input[name="answer"]:checked');
                return selected ? (selected.value === 'true') : null;
            }

            case 'matching': {
                const selects = container.querySelectorAll('.matching-select');
                const answers = {};
                selects.forEach(select => {
                    const index = parseInt(select.dataset.index);
                    answers[index] = select.value;
                });
                return answers;
            }

            case 'numerical': {
                const input = container.querySelector('#numerical-answer');
                return input && input.value ? parseFloat(input.value) : null;
            }

            case 'interpretation': {
                const textarea = container.querySelector('#interpretation-answer');
                return textarea ? textarea.value.trim() : null;
            }

            case 'hotspot': {
                const canvas = container.querySelector('.hotspot-canvas');
                return canvas ? canvas.dataset.selectedHotspot || null : null;
            }

            case 'drag_drop': {
                const matches = {};
                const dropZones = container.querySelectorAll('.drop-zone');
                dropZones.forEach(zone => {
                    const zoneId = zone.dataset.zoneId;
                    const items = zone.querySelectorAll('.dropped-items .draggable-item');
                    items.forEach(item => {
                        matches[item.dataset.itemId] = zoneId;
                    });
                });
                return matches;
            }

            case 'flashcard': {
                const card = container.querySelector('.flashcard');
                return card ? card.dataset.userAnswer === 'true' : null;
            }

            case 'animation': {
                const selected = container.querySelector('input[name="answer"]:checked');
                return selected ? parseInt(selected.value) : null;
            }

            default:
                return null;
        }
    },

    // Vérifie si la réponse est correcte
    checkAnswer(userAnswer, question) {
        if (userAnswer === null || userAnswer === undefined) {
            return { correct: false, message: 'Aucune réponse fournie' };
        }

        const questionType = getQuestionType(question);
        switch (questionType) {
            case 'qcm':
                return {
                    correct: userAnswer === question.correct_answer,
                    message: userAnswer === question.correct_answer ? 'Bonne réponse !' : 'Mauvaise réponse'
                };

            case 'vrai_faux':
                return {
                    correct: userAnswer === question.correct_answer,
                    message: userAnswer === question.correct_answer ? 'Exact !' : 'Incorrect'
                };

            case 'matching': {
                let correctCount = 0;
                question.pairs.forEach((pair, index) => {
                    if (userAnswer[index] === pair.right) {
                        correctCount++;
                    }
                });
                const isCorrect = correctCount === question.pairs.length;
                return {
                    correct: isCorrect,
                    message: isCorrect ? 'Toutes les correspondances sont correctes !' :
                        `${correctCount}/${question.pairs.length} correspondances correctes`
                };
            }

            case 'numerical': {
                const tolerance = question.tolerance || 0;
                const diff = Math.abs(userAnswer - question.correct_answer);
                const isCorrect = diff <= tolerance;
                return {
                    correct: isCorrect,
                    message: isCorrect ? 'Réponse correcte !' :
                        `Réponse attendue : ${question.correct_answer} ${question.unit || ''}`
                };
            }

            case 'interpretation':
                // Pour l'interprétation, on ne peut pas vraiment corriger automatiquement
                return {
                    correct: true, // Accepté par défaut
                    message: 'Réponse enregistrée. Comparez avec la réponse type ci-dessous.',
                    needsReview: true
                };

            case 'hotspot': {
                const isCorrect = userAnswer === question.correct_hotspot;
                const correctLabel = question.hotspots.find(h => h.id === question.correct_hotspot)?.label || 'zone correcte';
                return {
                    correct: isCorrect,
                    message: isCorrect ?
                        `Correct ! Vous avez cliqué sur ${correctLabel}.` :
                        `Incorrect. La bonne zone était : ${correctLabel}.`
                };
            }

            case 'drag_drop': {
                let correctCount = 0;
                const totalItems = Object.keys(question.correct_matches).length;

                Object.entries(question.correct_matches).forEach(([itemId, correctZoneId]) => {
                    if (userAnswer[itemId] === correctZoneId) {
                        correctCount++;
                    }
                });

                const isCorrect = correctCount === totalItems;
                return {
                    correct: isCorrect,
                    message: isCorrect ?
                        'Parfait ! Toutes les associations sont correctes !' :
                        `${correctCount}/${totalItems} associations correctes. Réessayez !`
                };
            }

            case 'flashcard': {
                // Pour les flashcards, on accepte toujours la réponse car c'est une auto-évaluation
                return {
                    correct: userAnswer === true,
                    message: userAnswer ?
                        'Excellent ! Vous maîtrisez ce concept.' :
                        'Révisez ce concept pour mieux le retenir.',
                    selfAssessed: true
                };
            }

            case 'animation': {
                // For animation questions, check like QCM
                return {
                    correct: userAnswer === question.correct_answer,
                    message: userAnswer === question.correct_answer ?
                        'Bonne réponse ! Vous avez bien observé l\'animation.' :
                        'Mauvaise réponse. Relancez l\'animation et observez attentivement.'
                };
            }

            default:
                return { correct: false, message: 'Type de question non supporté' };
        }
    }
};

console.log('✅ question-renderer.js chargé avec support hotspot, drag_drop, flashcard et animation');
