class FarinelliBreathingExercise {
    constructor() {
        this.currentPhase = 'ready';
        this.currentCount = 4;
        this.startingCount = 4;
        this.maxCount = 10;
        this.currentCycle = 1;
        this.totalCycles = 0;
        this.timeRemaining = 0;
        this.interval = null;
        this.isRunning = false;
        this.isPaused = false;
        
        // Audio context for chimes and metronome
        this.audioContext = null;
        this.chimeFrequencies = {
            inhale: 523.25, // C5
            hold: 659.25,   // E5
            exhale: 392.00  // G4
        };
        this.metronomeFrequency = 800; // Higher frequency for subtle tick
        
        this.initializeElements();
        this.setupEventListeners();
        this.calculateTotalCycles();
    }
    
    initializeElements() {
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.testBtn = document.getElementById('testBtn');
        this.startingCountInput = document.getElementById('startingCount');
        this.maxCountInput = document.getElementById('maxCount');
        this.currentPhaseElement = document.getElementById('currentPhase');
        this.countdownElement = document.getElementById('countdown');
        this.currentCountElement = document.getElementById('currentCount');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
    }
    
    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.stopBtn.addEventListener('click', () => this.stop());
        this.testBtn.addEventListener('click', () => this.testAudio());
        
        this.startingCountInput.addEventListener('change', () => {
            this.startingCount = parseInt(this.startingCountInput.value);
            this.currentCount = this.startingCount;
            this.currentCountElement.textContent = this.currentCount;
            this.calculateTotalCycles();
        });
        
        this.maxCountInput.addEventListener('change', () => {
            this.maxCount = parseInt(this.maxCountInput.value);
            this.calculateTotalCycles();
        });
    }
    
    calculateTotalCycles() {
        this.totalCycles = this.maxCount - this.startingCount + 1;
        this.updateProgress();
    }
    
    async start() {
        if (this.isRunning) return;
        
        // Initialize audio context on first user interaction
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        this.isRunning = true;
        this.isPaused = false;
        this.currentCount = this.startingCount;
        this.currentCycle = 1;
        
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.stopBtn.disabled = false;
        this.startingCountInput.disabled = true;
        this.maxCountInput.disabled = true;
        
        this.currentCountElement.textContent = this.currentCount;
        this.updateProgress();
        
        await this.runCycle();
    }
    
    pause() {
        if (!this.isRunning) return;
        
        if (this.isPaused) {
            this.isPaused = false;
            this.pauseBtn.textContent = 'Pause';
            this.continueCycle();
        } else {
            this.isPaused = true;
            this.pauseBtn.textContent = 'Resume';
            clearInterval(this.interval);
        }
    }
    
    stop() {
        this.isRunning = false;
        this.isPaused = false;
        
        clearInterval(this.interval);
        
        this.currentPhase = 'ready';
        this.currentPhaseElement.textContent = 'Ready';
        this.currentPhaseElement.className = 'phase ready';
        this.countdownElement.textContent = '--';
        
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.stopBtn.disabled = true;
        this.startingCountInput.disabled = false;
        this.maxCountInput.disabled = false;
        
        this.pauseBtn.textContent = 'Pause';
        this.progressFill.style.width = '0%';
        this.progressText.textContent = 'Cycle 1 of ' + this.totalCycles;
    }
    
    async runCycle() {
        if (!this.isRunning) return;
        
        const phases = ['inhale', 'hold', 'exhale'];
        
        for (let phase of phases) {
            if (!this.isRunning) break;
            
            await this.runPhase(phase);
            
            if (!this.isRunning) break;
            
            // Wait for any pause
            while (this.isPaused && this.isRunning) {
                await this.sleep(100);
            }
        }
        
        if (this.isRunning) {
            this.currentCycle++;
            this.currentCount++;
            this.currentCountElement.textContent = this.currentCount;
            this.updateProgress();
            
            if (this.currentCount <= this.maxCount) {
                // Continue to next cycle immediately (seamless)
                setTimeout(() => this.runCycle(), 0);
            } else {
                // Exercise complete
                this.completeExercise();
            }
        }
    }
    
    async runPhase(phase) {
        this.currentPhase = phase;
        this.timeRemaining = this.currentCount;
        
        this.currentPhaseElement.textContent = phase.charAt(0).toUpperCase() + phase.slice(1);
        this.currentPhaseElement.className = `phase ${phase} active transition`;
        
        // Play chime for phase start
        this.playChime(phase);
        
        // Remove transition class after animation
        setTimeout(() => {
            this.currentPhaseElement.classList.remove('transition');
        }, 500);
        
        while (this.timeRemaining > 0 && this.isRunning && !this.isPaused) {
            this.countdownElement.textContent = this.timeRemaining;
            
            // Play gentle metronome tick for each count
            this.playMetronomeTick();
            
            await this.sleep(1000);
            this.timeRemaining--;
        }
        
        if (this.isPaused) {
            this.currentPhaseElement.classList.remove('active');
        }
    }
    
    continueCycle() {
        if (this.currentPhase !== 'ready') {
            this.currentPhaseElement.classList.add('active');
            this.runPhase(this.currentPhase);
        }
    }
    
    completeExercise() {
        this.currentPhaseElement.textContent = 'Complete!';
        this.currentPhaseElement.className = 'phase ready';
        this.countdownElement.textContent = '✓';
        
        // Play completion chime
        this.playChime('inhale'); // Reuse inhale frequency for completion
        
        setTimeout(() => {
            this.stop();
        }, 3000);
    }
    
    updateProgress() {
        const progress = (this.currentCycle - 1) / this.totalCycles * 100;
        this.progressFill.style.width = progress + '%';
        this.progressText.textContent = `Cycle ${this.currentCycle} of ${this.totalCycles}`;
    }
    
    playChime(phase) {
        if (!this.audioContext) return;
        
        const frequency = this.chimeFrequencies[phase] || this.chimeFrequencies.inhale;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        // Gentle attack and decay
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1.0);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 1.0);
    }
    
    playMetronomeTick() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(this.metronomeFrequency, this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        // Louder, more audible tick
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.08, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.15);
    }
    
    testAudio() {
        // Initialize audio context if needed
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // Test all sounds
        console.log('Testing audio...');
        
        // Test metronome tick
        setTimeout(() => {
            console.log('Playing metronome tick...');
            this.playMetronomeTick();
        }, 100);
        
        // Test inhale chime
        setTimeout(() => {
            console.log('Playing inhale chime...');
            this.playChime('inhale');
        }, 500);
        
        // Test hold chime
        setTimeout(() => {
            console.log('Playing hold chime...');
            this.playChime('hold');
        }, 1500);
        
        // Test exhale chime
        setTimeout(() => {
            console.log('Playing exhale chime...');
            this.playChime('exhale');
        }, 2500);
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the exercise when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new FarinelliBreathingExercise();
});
