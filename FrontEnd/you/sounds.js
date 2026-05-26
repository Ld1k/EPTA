// Звуковая система с Web Audio API
const SoundSystem = {
    audioContext: null,
    enabled: true,
    volume: 0.3,
    
    init: function() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('🎵 Sound system ready');
        } catch(e) {
            console.warn('Web Audio not supported');
        }
        
        const savedEnabled = localStorage.getItem('epta_sound_enabled');
        const savedVolume = localStorage.getItem('epta_sound_volume');
        if (savedEnabled !== null) this.enabled = savedEnabled === 'true';
        if (savedVolume !== null) this.volume = parseFloat(savedVolume);
    },
    
    playBeep: function(freq, duration, volume = 0.3) {
        if (!this.enabled || !this.audioContext) return;
        
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        const now = this.audioContext.currentTime;
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 0;
        gainNode.connect(this.audioContext.destination);
        
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = freq;
        oscillator.connect(gainNode);
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(volume * this.volume, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        
        oscillator.start();
        oscillator.stop(now + duration);
    },
    
    playClick: function() {
        this.playBeep(800, 0.08, 0.15);
    },
    
    playSuccess: function() {
        this.playBeep(523.25, 0.2, 0.3);
        setTimeout(() => this.playBeep(659.25, 0.2, 0.3), 150);
        setTimeout(() => this.playBeep(783.99, 0.3, 0.3), 300);
    },
    
    playError: function() {
        this.playBeep(220, 0.4, 0.25);
    },
    
    playDing: function() {
        this.playBeep(880, 0.5, 0.2);
    },
    
    setEnabled: function(enabled) {
        this.enabled = enabled;
        localStorage.setItem('epta_sound_enabled', enabled);
    },
    
    setVolume: function(volume) {
        this.volume = volume;
        localStorage.setItem('epta_sound_volume', volume);
    }
};

SoundSystem.init();
window.SoundSystem = SoundSystem;
window.Sounds = SoundSystem; // Для совместимости