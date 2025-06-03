// Audio Context for Web Audio API
let audioContext = null;
let backgroundMusic = null;
let musicGainNode = null;
let sfxGainNode = null;

// Sound settings
const soundSettings = {
    masterVolume: 0.7,
    musicVolume: 0.4,
    sfxVolume: 0.8,
    musicEnabled: false,
    sfxEnabled: true
};

// Sound effects
const soundEffects = {
    hover: null,
    button: null,
    gameOver: null,
    token: null,
    enemyHit: null,
    enemyDeath: null,
    playerHit: null,
    levelComplete: null,
    move: null,
    treasure: null,
    shoot: null
};

// Initialize audio context
function initAudio() {
    try {
        // Create AudioContext only on user interaction
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create gain nodes for volume control
            musicGainNode = audioContext.createGain();
            sfxGainNode = audioContext.createGain();
            
            // Connect gain nodes to destination
            musicGainNode.connect(audioContext.destination);
            sfxGainNode.connect(audioContext.destination);
        }
        
        // Load saved settings
        loadSoundSettings();
        updateVolumeSettings();
        loadSoundEffects();
        
        // Background music disabled - only sound effects
        console.log('🎵 Audio system initialized (music disabled)');
    } catch (error) {
        console.warn('Web Audio API not supported:', error);
    }
}

// Load all sound effects
async function loadSoundEffects() {
    try {
        // Create oscillator-based sound effects
        soundEffects.hover = createHoverSound();
        soundEffects.button = createButtonSound();
        soundEffects.gameOver = createGameOverSound();
        soundEffects.token = createTokenSound();
        soundEffects.enemyHit = createEnemyHitSound();
        soundEffects.enemyDeath = createEnemyDeathSound();
        soundEffects.playerHit = createPlayerHitSound();
        soundEffects.levelComplete = createLevelCompleteSound();
        soundEffects.move = createMoveSound();
        soundEffects.treasure = createTreasureSound();
        soundEffects.shoot = createShootSound();
    } catch (error) {
        console.warn('Error loading sound effects:', error);
    }
}

// Sound settings management
function loadSoundSettings() {
    const saved = localStorage.getItem('treasureMazeAudioSettings');
    if (saved) {
        Object.assign(soundSettings, JSON.parse(saved));
    }
}

function saveSoundSettings() {
    localStorage.setItem('treasureMazeAudioSettings', JSON.stringify(soundSettings));
}

function updateVolumeSettings() {
    if (musicGainNode) {
        musicGainNode.gain.value = soundSettings.musicEnabled ? 
            soundSettings.masterVolume * soundSettings.musicVolume : 0;
    }
    if (sfxGainNode) {
        sfxGainNode.gain.value = soundSettings.sfxEnabled ? 
            soundSettings.masterVolume * soundSettings.sfxVolume : 0;
    }
}

// Background music creation
function createBackgroundMusic() {
    if (!audioContext || !musicGainNode) {
        console.log('⚠️ Audio context not ready for music');
        return;
    }
    
    if (!soundSettings.musicEnabled) {
        console.log('🔇 Music disabled in settings');
        return;
    }
    
    // Stop existing music
    if (backgroundMusic) {
        backgroundMusic.forEach(node => {
            try { node.stop(); } catch(e) {}
        });
    }
    
    backgroundMusic = [];
    
    console.log('🎵 Creating background music...');
    
    // Create a simple arcade-style melody with multiple oscillators
    const melody = [
        { freq: 440, start: 0, duration: 0.5 },      // A
        { freq: 523, start: 0.5, duration: 0.5 },    // C
        { freq: 659, start: 1.0, duration: 0.5 },    // E
        { freq: 523, start: 1.5, duration: 0.5 },    // C
        { freq: 440, start: 2.0, duration: 1.0 },    // A (longer)
        { freq: 392, start: 3.0, duration: 0.5 },    // G
        { freq: 440, start: 3.5, duration: 0.5 },    // A
        { freq: 523, start: 4.0, duration: 1.0 },    // C (longer)
        { freq: 659, start: 5.0, duration: 0.5 },    // E
        { freq: 698, start: 5.5, duration: 0.5 },    // F
        { freq: 659, start: 6.0, duration: 0.5 },    // E
        { freq: 523, start: 6.5, duration: 0.5 },    // C
        { freq: 440, start: 7.0, duration: 1.0 }     // A (end)
    ];
    
    // Bass line (lower octave)
    const bass = [
        { freq: 220, start: 0, duration: 2.0 },      // A bass
        { freq: 196, start: 2.0, duration: 2.0 },    // G bass
        { freq: 220, start: 4.0, duration: 2.0 },    // A bass
        { freq: 262, start: 6.0, duration: 2.0 }     // C bass
    ];
    
    const totalDuration = 8.0; // 8 seconds loop
    
    function playMusicLoop() {
        if (!soundSettings.musicEnabled || !audioContext || !musicGainNode) {
            console.log('🔇 Music loop stopped - settings disabled');
            return;
        }
        
        console.log('🎵 Playing music loop...');
        const startTime = audioContext.currentTime;
        
        // Play melody
        melody.forEach(note => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(musicGainNode);
            
            osc.frequency.setValueAtTime(note.freq, startTime + note.start);
            osc.type = 'square'; // Retro square wave
            
            // Envelope
            gain.gain.setValueAtTime(0, startTime + note.start);
            gain.gain.linearRampToValueAtTime(0.1, startTime + note.start + 0.05);
            gain.gain.setValueAtTime(0.1, startTime + note.start + note.duration - 0.1);
            gain.gain.linearRampToValueAtTime(0, startTime + note.start + note.duration);
            
            osc.start(startTime + note.start);
            osc.stop(startTime + note.start + note.duration);
            
            backgroundMusic.push(osc);
        });
        
        // Play bass
        bass.forEach(note => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(musicGainNode);
            
            osc.frequency.setValueAtTime(note.freq, startTime + note.start);
            osc.type = 'sawtooth'; // Different waveform for bass
            
            // Bass envelope
            gain.gain.setValueAtTime(0, startTime + note.start);
            gain.gain.linearRampToValueAtTime(0.06, startTime + note.start + 0.1);
            gain.gain.setValueAtTime(0.06, startTime + note.start + note.duration - 0.2);
            gain.gain.linearRampToValueAtTime(0, startTime + note.start + note.duration);
            
            osc.start(startTime + note.start);
            osc.stop(startTime + note.start + note.duration);
            
            backgroundMusic.push(osc);
        });
        
        // Schedule next loop - make it more reliable
        setTimeout(() => {
            if (soundSettings.musicEnabled && audioContext && musicGainNode) {
                playMusicLoop();
            }
        }, (totalDuration * 1000) - 100); // Start next loop 100ms early to prevent gaps
    }
    
    playMusicLoop();
}

// Create simple sounds using oscillators
function createHoverSound() {
    return () => {
        if (!audioContext || !sfxGainNode) return;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(sfxGainNode);
        osc.frequency.setValueAtTime(2000, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1500, audioContext.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        osc.start();
        osc.stop(audioContext.currentTime + 0.1);
    };
}

function createButtonSound() {
    return () => {
        if (!audioContext || !sfxGainNode) return;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(sfxGainNode);
        osc.frequency.setValueAtTime(1800, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.15);
        gain.gain.setValueAtTime(0.15, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        osc.start();
        osc.stop(audioContext.currentTime + 0.15);
    };
}

function createGameOverSound() {
    return () => {
        if (!audioContext || !sfxGainNode) return;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(sfxGainNode);
        osc.frequency.setValueAtTime(880, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, audioContext.currentTime + 0.5);
        gain.gain.setValueAtTime(0.2, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        osc.start();
        osc.stop(audioContext.currentTime + 0.5);
    };
}

function createTokenSound() {
    return () => {
        if (!audioContext || !sfxGainNode) return;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(sfxGainNode);
        osc.frequency.setValueAtTime(1200, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(2400, audioContext.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        osc.start();
        osc.stop(audioContext.currentTime + 0.1);
    };
}

function createEnemyHitSound() {
    return () => {
        if (!audioContext || !sfxGainNode) return;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(sfxGainNode);
        osc.frequency.setValueAtTime(300, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        osc.start();
        osc.stop(audioContext.currentTime + 0.1);
    };
}

function createPlayerHitSound() {
    return () => {
        if (!audioContext || !sfxGainNode) return;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(sfxGainNode);
        osc.frequency.setValueAtTime(440, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, audioContext.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        osc.start();
        osc.stop(audioContext.currentTime + 0.2);
    };
}

function createLevelCompleteSound() {
    return () => {
        if (!audioContext || !sfxGainNode) return;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(sfxGainNode);
        osc.frequency.setValueAtTime(880, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, audioContext.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        osc.start();
        osc.stop(audioContext.currentTime + 0.3);
    };
}

function createMoveSound() {
    return () => {
        if (!audioContext || !sfxGainNode) return;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(sfxGainNode);
        osc.frequency.setValueAtTime(800, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.05);
        gain.gain.setValueAtTime(0.08, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
        osc.start();
        osc.stop(audioContext.currentTime + 0.05);
    };
}

function createEnemyDeathSound() {
    return () => {
        if (!audioContext || !sfxGainNode) return;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(sfxGainNode);
        osc.frequency.setValueAtTime(400, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3);
        gain.gain.setValueAtTime(0.25, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        osc.start();
        osc.stop(audioContext.currentTime + 0.3);
    };
}

function createTreasureSound() {
    return () => {
        if (!audioContext || !sfxGainNode) return;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(sfxGainNode);
        osc.frequency.setValueAtTime(1000, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(2000, audioContext.currentTime + 0.2);
        osc.frequency.exponentialRampToValueAtTime(3000, audioContext.currentTime + 0.4);
        gain.gain.setValueAtTime(0.2, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        osc.start();
        osc.stop(audioContext.currentTime + 0.4);
    };
}

function createShootSound() {
    return () => {
        if (!audioContext || !sfxGainNode) return;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(sfxGainNode);
        osc.frequency.setValueAtTime(1500, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.08);
        gain.gain.setValueAtTime(0.12, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
        osc.start();
        osc.stop(audioContext.currentTime + 0.08);
    };
}

// Public sound playing functions
function playHoverSound() {
    if (soundEffects.hover) soundEffects.hover();
}

function playButtonSound() {
    if (soundEffects.button) soundEffects.button();
}

function playGameOverSound() {
    if (soundEffects.gameOver) soundEffects.gameOver();
}

function playTokenSound() {
    if (soundEffects.token) soundEffects.token();
}

function playEnemyHitSound() {
    if (soundEffects.enemyHit) soundEffects.enemyHit();
}

function playPlayerHitSound() {
    if (soundEffects.playerHit) soundEffects.playerHit();
}

function playLevelCompleteSound() {
    if (soundEffects.levelComplete) soundEffects.levelComplete();
}

function playMoveSound() {
    if (soundEffects.move) soundEffects.move();
}

function playEnemyDeathSound() {
    if (soundEffects.enemyDeath) soundEffects.enemyDeath();
}

function playTreasureSound() {
    if (soundEffects.treasure) soundEffects.treasure();
}

function playShootSound() {
    if (soundEffects.shoot) soundEffects.shoot();
}

// Music control functions
function startBackgroundMusic() {
    if (!soundSettings.musicEnabled) return;
    createBackgroundMusic();
}

function stopBackgroundMusic() {
    if (backgroundMusic) {
        backgroundMusic.forEach(node => {
            try { node.stop(); } catch(e) {}
        });
        backgroundMusic = [];
    }
}

function toggleMusic() {
    soundSettings.musicEnabled = !soundSettings.musicEnabled;
    updateVolumeSettings();
    saveSoundSettings();
    
    if (soundSettings.musicEnabled) {
        startBackgroundMusic();
    } else {
        stopBackgroundMusic();
    }
    
    return soundSettings.musicEnabled;
}

function toggleSFX() {
    soundSettings.sfxEnabled = !soundSettings.sfxEnabled;
    updateVolumeSettings();
    saveSoundSettings();
    return soundSettings.sfxEnabled;
}

function setMasterVolume(volume) {
    soundSettings.masterVolume = Math.max(0, Math.min(1, volume));
    updateVolumeSettings();
    saveSoundSettings();
}

function setMusicVolume(volume) {
    soundSettings.musicVolume = Math.max(0, Math.min(1, volume));
    updateVolumeSettings();
    saveSoundSettings();
}

function setSFXVolume(volume) {
    soundSettings.sfxVolume = Math.max(0, Math.min(1, volume));
    updateVolumeSettings();
    saveSoundSettings();
}

function getSoundSettings() {
    return { ...soundSettings };
}

// Export functions to window object
window.playHoverSound = playHoverSound;
window.playButtonSound = playButtonSound;
window.playGameOverSound = playGameOverSound;
window.playTokenSound = playTokenSound;
window.playEnemyHitSound = playEnemyHitSound;
window.playEnemyDeathSound = playEnemyDeathSound;
window.playPlayerHitSound = playPlayerHitSound;
window.playLevelCompleteSound = playLevelCompleteSound;
window.playMoveSound = playMoveSound;
window.playTreasureSound = playTreasureSound;
window.playShootSound = playShootSound;
window.initAudio = initAudio;
window.startBackgroundMusic = startBackgroundMusic;
window.stopBackgroundMusic = stopBackgroundMusic;
window.toggleMusic = toggleMusic;
window.toggleSFX = toggleSFX;
window.setMasterVolume = setMasterVolume;
window.setMusicVolume = setMusicVolume;
window.setSFXVolume = setSFXVolume;
window.getSoundSettings = getSoundSettings;

// Initialize audio on first user interaction
document.addEventListener('click', function initOnFirstClick() {
    initAudio();
    document.removeEventListener('click', initOnFirstClick);
});

// Also try on any user interaction
document.addEventListener('keydown', function initOnFirstKey() {
    initAudio();
    document.removeEventListener('keydown', initOnFirstKey);
});

// Also try on touch
document.addEventListener('touchstart', function initOnFirstTouch() {
    initAudio();
    document.removeEventListener('touchstart', initOnFirstTouch);
}); 