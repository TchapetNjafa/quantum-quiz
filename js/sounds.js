// Sound system using Web Audio API for system sounds
// This works without external files and avoids CORS issues

class SoundSystem {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.init();
    }
    
    init() {
        try {
            // Create audio context (works in all modern browsers)
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
        } catch (e) {
            console.warn('Web Audio API not supported, sounds will be disabled');
            this.enabled = false;
        }
    }
    
    // Resume audio context if suspended (required by some browsers)
    resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    // Play a tone
    playTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.enabled || !this.audioContext) return;
        
        this.resumeContext();
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    // Play a chord
    playChord(frequencies, duration, type = 'sine', volume = 0.2) {
        if (!this.enabled || !this.audioContext) return;
        
        this.resumeContext();
        
        frequencies.forEach(freq => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = freq;
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        });
    }
    
    // Sound effects
    playClick() {
        this.playTone(800, 0.05, 'square', 0.2);
    }
    
    playCorrect() {
        // Ascending chord - happy sound
        this.playChord([523.25, 659.25, 783.99], 0.3, 'sine', 0.25);
    }
    
    playIncorrect() {
        // Descending tone - sad sound
        this.playTone(200, 0.3, 'sawtooth', 0.2);
        setTimeout(() => {
            this.playTone(150, 0.2, 'sawtooth', 0.15);
        }, 100);
    }
    
    playComplete() {
        // Fanfare - ascending scale
        const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5];
        notes.forEach((note, index) => {
            setTimeout(() => {
                this.playTone(note, 0.15, 'sine', 0.2);
            }, index * 100);
        });
    }
    
    playFlip() {
        // Quick swoosh sound
        this.playTone(600, 0.1, 'sine', 0.15);
    }
    
    setEnabled(enabled) {
        this.enabled = enabled;
    }
}

// Create global sound system instance
const soundSystem = new SoundSystem();

// Play sound function for compatibility
function playSystemSound(type) {
    if (!soundSystem.enabled) return;
    
    switch(type) {
        case 'click':
            soundSystem.playClick();
            break;
        case 'correct':
            soundSystem.playCorrect();
            break;
        case 'incorrect':
            soundSystem.playIncorrect();
            break;
        case 'complete':
            soundSystem.playComplete();
            break;
        case 'flip':
            soundSystem.playFlip();
            break;
        default:
            soundSystem.playClick();
    }
}
