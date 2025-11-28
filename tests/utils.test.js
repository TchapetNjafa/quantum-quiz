/**
 * Tests pour les fonctions utilitaires de Quantum Quiz
 * Tests unitaires indépendants
 */

describe('Utils - Fonctions utilitaires', () => {

    // ==================== generateId ====================
    describe('generateId()', () => {
        // Implémentation locale pour le test
        const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

        test('génère un ID non vide', () => {
            const id = generateId();
            expect(id).toBeDefined();
            expect(id.length).toBeGreaterThan(0);
        });

        test('génère des IDs uniques', () => {
            const ids = new Set();
            for (let i = 0; i < 100; i++) {
                ids.add(generateId());
            }
            expect(ids.size).toBe(100);
        });

        test('génère un ID de type string', () => {
            const id = generateId();
            expect(typeof id).toBe('string');
        });
    });

    // ==================== shuffleArray ====================
    describe('shuffleArray()', () => {
        const shuffleArray = (array) => {
            const arr = [...array];
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        };

        test('retourne un tableau de même longueur', () => {
            const original = [1, 2, 3, 4, 5];
            const shuffled = shuffleArray(original);
            expect(shuffled.length).toBe(original.length);
        });

        test('contient les mêmes éléments', () => {
            const original = [1, 2, 3, 4, 5];
            const shuffled = shuffleArray(original);
            expect(shuffled.sort()).toEqual(original.sort());
        });

        test('ne modifie pas le tableau original', () => {
            const original = [1, 2, 3, 4, 5];
            const copy = [...original];
            shuffleArray(original);
            expect(original).toEqual(copy);
        });

        test('gère un tableau vide', () => {
            const shuffled = shuffleArray([]);
            expect(shuffled).toEqual([]);
        });

        test('gère un tableau avec un seul élément', () => {
            const shuffled = shuffleArray([42]);
            expect(shuffled).toEqual([42]);
        });
    });

    // ==================== formatTime ====================
    describe('formatTime()', () => {
        const formatTime = (seconds) => {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        };

        test('formate 0 secondes', () => {
            expect(formatTime(0)).toBe('00:00');
        });

        test('formate 59 secondes', () => {
            expect(formatTime(59)).toBe('00:59');
        });

        test('formate 60 secondes (1 minute)', () => {
            expect(formatTime(60)).toBe('01:00');
        });

        test('formate 90 secondes', () => {
            expect(formatTime(90)).toBe('01:30');
        });

        test('formate 3661 secondes (1h 1min 1s)', () => {
            expect(formatTime(3661)).toBe('61:01');
        });

        test('formate avec padding correct', () => {
            expect(formatTime(65)).toBe('01:05');
        });
    });

    // ==================== calculatePercentage ====================
    describe('calculatePercentage()', () => {
        const calculatePercentage = (value, total) => {
            return total > 0 ? Math.round((value / total) * 100) : 0;
        };

        test('calcule 50%', () => {
            expect(calculatePercentage(5, 10)).toBe(50);
        });

        test('calcule 100%', () => {
            expect(calculatePercentage(10, 10)).toBe(100);
        });

        test('calcule 0%', () => {
            expect(calculatePercentage(0, 10)).toBe(0);
        });

        test('retourne 0 si total est 0', () => {
            expect(calculatePercentage(5, 0)).toBe(0);
        });

        test('arrondit correctement', () => {
            expect(calculatePercentage(1, 3)).toBe(33);
            expect(calculatePercentage(2, 3)).toBe(67);
        });
    });

    // ==================== getQuestionType ====================
    describe('getQuestionType()', () => {
        const getQuestionType = (question) => {
            if (question.type) return question.type;
            if (question.hotspots || (question.id && question.id.includes('-h'))) return 'hotspot';
            if (question.draggables || (question.id && question.id.includes('-d'))) return 'drag_drop';
            if (question.front && question.back) return 'flashcard';
            return 'unknown';
        };

        test('retourne le type si présent', () => {
            expect(getQuestionType({ type: 'qcm', id: 'q1' })).toBe('qcm');
        });

        test('détecte hotspot par hotspots', () => {
            expect(getQuestionType({ id: 'q1', hotspots: [{ x: 10, y: 20 }] })).toBe('hotspot');
        });

        test('détecte hotspot par ID', () => {
            expect(getQuestionType({ id: 'ch1-h001' })).toBe('hotspot');
        });

        test('détecte drag_drop par draggables', () => {
            expect(getQuestionType({ id: 'q1', draggables: [{ id: 'd1' }] })).toBe('drag_drop');
        });

        test('détecte drag_drop par ID', () => {
            expect(getQuestionType({ id: 'ch1-d001' })).toBe('drag_drop');
        });

        test('détecte flashcard', () => {
            expect(getQuestionType({ id: 'q1', front: 'Q', back: 'R' })).toBe('flashcard');
        });

        test('retourne unknown pour type inconnu', () => {
            expect(getQuestionType({ id: 'q1', text: 'Question' })).toBe('unknown');
        });
    });

    // ==================== debounce ====================
    describe('debounce()', () => {
        jest.useFakeTimers();

        const debounce = (func, wait) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        };

        test('retarde l\'exécution', () => {
            const fn = jest.fn();
            const debouncedFn = debounce(fn, 100);

            debouncedFn();
            expect(fn).not.toHaveBeenCalled();

            jest.advanceTimersByTime(100);
            expect(fn).toHaveBeenCalledTimes(1);
        });

        test('annule les appels précédents', () => {
            const fn = jest.fn();
            const debouncedFn = debounce(fn, 100);

            debouncedFn();
            debouncedFn();
            debouncedFn();

            jest.advanceTimersByTime(100);
            expect(fn).toHaveBeenCalledTimes(1);
        });

        test('passe les arguments correctement', () => {
            const fn = jest.fn();
            const debouncedFn = debounce(fn, 100);

            debouncedFn('arg1', 'arg2');
            jest.advanceTimersByTime(100);

            expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
        });

        afterAll(() => {
            jest.useRealTimers();
        });
    });

    // ==================== storage ====================
    describe('storage object', () => {
        const storage = {
            get(key, defaultValue = null) {
                try {
                    const item = localStorage.getItem(key);
                    return item ? JSON.parse(item) : defaultValue;
                } catch (err) {
                    return defaultValue;
                }
            },
            set(key, value) {
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                    return true;
                } catch (err) {
                    return false;
                }
            },
            remove(key) {
                try {
                    localStorage.removeItem(key);
                    return true;
                } catch (err) {
                    return false;
                }
            }
        };

        beforeEach(() => {
            localStorage.clear();
        });

        test('storage.set() enregistre une valeur', () => {
            const result = storage.set('test_key', { value: 42 });
            expect(result).toBe(true);
            expect(localStorage.setItem).toHaveBeenCalled();
        });

        test('storage.get() récupère une valeur', () => {
            localStorage.setItem('test_key', JSON.stringify({ value: 42 }));
            const result = storage.get('test_key');
            expect(result).toEqual({ value: 42 });
        });

        test('storage.get() retourne defaultValue si clé inexistante', () => {
            const result = storage.get('inexistant', 'default');
            expect(result).toBe('default');
        });

        test('storage.remove() supprime une clé', () => {
            storage.remove('test_key');
            expect(localStorage.removeItem).toHaveBeenCalledWith('test_key');
        });
    });
});
