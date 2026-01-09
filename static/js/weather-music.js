/**
 * Clearview Weather Music Integration
 * Plays royalty-free ambient music based on weather conditions
 */

class WeatherMusicPlayer {
    constructor() {
        this.audio = new Audio();
        this.isPlaying = false;
        this.currentTrack = null;
        this.volume = 0.5;
        
        // Royalty-free music library organized by weather type
        // Using Free Music Archive (FMA) and other CC0/Public Domain sources
        this.musicLibrary = {
            sunny: [
                {
                    title: "Sunny Day Vibes",
                    artist: "Ambient Nature Sounds",
                    url: "https://assets.mixkit.co/music/preview/mixkit-happy-and-joyful-children-13.mp3"
                },
                {
                    title: "Bright Morning",
                    artist: "Upbeat Melody",
                    url: "https://assets.mixkit.co/music/preview/mixkit-sunny-morning-12.mp3"
                }
            ],
            rainy: [
                {
                    title: "Gentle Rain",
                    artist: "Ambient Soundscapes",
                    url: "https://assets.mixkit.co/music/preview/mixkit-dreaming-big-31.mp3"
                },
                {
                    title: "Rainy Day Calm",
                    artist: "Peaceful Piano",
                    url: "https://assets.mixkit.co/music/preview/mixkit-sleepy-cat-135.mp3"
                }
            ],
            cloudy: [
                {
                    title: "Overcast Meditation",
                    artist: "Calm Atmospheres",
                    url: "https://assets.mixkit.co/music/preview/mixkit-floating-abstract-14.mp3"
                },
                {
                    title: "Gentle Clouds",
                    artist: "Ambient Minimal",
                    url: "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3"
                }
            ],
            snowy: [
                {
                    title: "Winter Wonderland",
                    artist: "Chill Ambience",
                    url: "https://assets.mixkit.co/music/preview/mixkit-cold-nights-14.mp3"
                },
                {
                    title: "Snowfall Serenity",
                    artist: "Peaceful Winter",
                    url: "https://assets.mixkit.co/music/preview/mixkit-ethereal-fairy-win-win-2019.mp3"
                }
            ],
            foggy: [
                {
                    title: "Misty Morning",
                    artist: "Ambient Drone",
                    url: "https://assets.mixkit.co/music/preview/mixkit-deep-urban-623.mp3"
                },
                {
                    title: "Through the Fog",
                    artist: "Mysterious Sounds",
                    url: "https://assets.mixkit.co/music/preview/mixkit-midnight-stroll-13.mp3"
                }
            ],
            stormy: [
                {
                    title: "Thunder Roll",
                    artist: "Dramatic Weather",
                    url: "https://assets.mixkit.co/music/preview/mixkit-epic-orchestra-transition-2290.mp3"
                },
                {
                    title: "Storm Approach",
                    artist: "Intense Ambience",
                    url: "https://assets.mixkit.co/music/preview/mixkit-getting-ready-30.mp3"
                }
            ],
            clear: [
                {
                    title: "Clear Skies",
                    artist: "Bright Day",
                    url: "https://assets.mixkit.co/music/preview/mixkit-a-very-happy-christmas-897.mp3"
                }
            ]
        };
        
        this.init();
    }
    
    init() {
        this.audio.volume = this.volume;
        this.audio.loop = true;
        
        // Setup event listeners
        this.audio.addEventListener('ended', () => this.playNext());
        this.audio.addEventListener('error', (e) => this.handleError(e));
        
        // Auto-play on user interaction (browsers require this)
        document.addEventListener('click', () => {
            if (!this.isPlaying && this.currentTrack) {
                this.play();
            }
        }, { once: true });
    }
    
    /**
     * Detect weather condition from text
     */
    detectWeatherType(condition) {
        if (!condition) return 'clear';
        
        const conditionLower = condition.toLowerCase();
        
        if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
            return 'rainy';
        } else if (conditionLower.includes('snow') || conditionLower.includes('sleet')) {
            return 'snowy';
        } else if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) {
            return 'cloudy';
        } else if (conditionLower.includes('fog') || conditionLower.includes('mist') || conditionLower.includes('haze')) {
            return 'foggy';
        } else if (conditionLower.includes('storm') || conditionLower.includes('thunder')) {
            return 'stormy';
        } else if (conditionLower.includes('clear') || conditionLower.includes('sunny')) {
            return 'sunny';
        } else {
            return 'clear';
        }
    }
    
    /**
     * Load and play music based on weather condition
     */
    playWeatherMusic(weatherCondition) {
        const weatherType = this.detectWeatherType(weatherCondition);
        const tracks = this.musicLibrary[weatherType] || this.musicLibrary.clear;
        
        // Select random track from category
        const track = tracks[Math.floor(Math.random() * tracks.length)];
        
        this.loadTrack(track);
        this.updateUI(track, weatherCondition);
    }
    
    /**
     * Load a specific track
     */
    loadTrack(track) {
        this.currentTrack = track;
        this.audio.src = track.url;
        this.audio.load();
    }
    
    /**
     * Play the current track
     */
    play() {
        if (this.currentTrack) {
            const playPromise = this.audio.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    this.isPlaying = true;
                    this.updatePlayButton(true);
                }).catch(error => {
                    console.log('Playback prevented:', error);
                    // Show user interaction required message
                    this.showAutoplayMessage();
                });
            }
        }
    }
    
    /**
     * Pause the current track
     */
    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.updatePlayButton(false);
    }
    
    /**
     * Toggle play/pause
     */
    toggle() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    /**
     * Play next track in category
     */
    playNext() {
        const weatherCondition = document.querySelector('.weather-condition')?.textContent || 'Clear';
        this.playWeatherMusic(weatherCondition);
        this.play();
    }
    
    /**
     * Play previous track
     */
    playPrevious() {
        this.playNext(); // For simplicity, just play another random track
    }
    
    /**
     * Set volume (0.0 to 1.0)
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.audio.volume = this.volume;
        this.updateVolumeUI();
    }
    
    /**
     * Update UI with current track info
     */
    updateUI(track, weatherCondition) {
        const musicTitle = document.getElementById('music-title');
        if (musicTitle) {
            musicTitle.textContent = `Playing: ${track.title}`;
        }
        
        const musicInfo = document.querySelector('.music-info span');
        if (musicInfo) {
            musicInfo.textContent = `Playing: ${weatherCondition} Ambience - ${track.title}`;
        }
    }
    
    /**
     * Update play button state
     */
    updatePlayButton(isPlaying) {
        const playBtn = document.querySelector('.music-play');
        if (playBtn) {
            playBtn.innerHTML = isPlaying 
                ? '<i class="fas fa-pause"></i>' 
                : '<i class="fas fa-play"></i>';
        }
    }
    
    /**
     * Update volume UI
     */
    updateVolumeUI() {
        const volumeBtn = document.querySelector('.music-btn:last-child');
        if (volumeBtn) {
            if (this.volume === 0) {
                volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
            } else if (this.volume < 0.5) {
                volumeBtn.innerHTML = '<i class="fas fa-volume-down"></i>';
            } else {
                volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            }
        }
    }
    
    /**
     * Show message when autoplay is blocked
     */
    showAutoplayMessage() {
        const musicInfo = document.querySelector('.music-info');
        if (musicInfo) {
            const message = document.createElement('small');
            message.style.cssText = 'color: #e74c3c; margin-left: 1rem;';
            message.textContent = 'Click play to start music';
            musicInfo.appendChild(message);
            
            setTimeout(() => message.remove(), 5000);
        }
    }
    
    /**
     * Handle audio errors
     */
    handleError(error) {
        console.error('Audio error:', error);
        this.isPlaying = false;
        this.updatePlayButton(false);
    }
}

// Initialize music player when DOM is ready
let musicPlayer;

document.addEventListener('DOMContentLoaded', function() {
    musicPlayer = new WeatherMusicPlayer();
    
    // Get weather condition and start music
    const weatherCondition = document.querySelector('.weather-condition')?.textContent;
    if (weatherCondition) {
        musicPlayer.playWeatherMusic(weatherCondition);
    }
    
    // Setup control buttons
    const playBtn = document.querySelector('.music-play');
    if (playBtn) {
        playBtn.addEventListener('click', () => musicPlayer.toggle());
    }
    
    const prevBtn = document.querySelector('.music-btn:first-child');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => musicPlayer.playPrevious());
    }
    
    const nextBtn = document.querySelector('.music-btn:nth-child(3)');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => musicPlayer.playNext());
    }
    
    const volumeBtn = document.querySelector('.music-btn:last-child');
    if (volumeBtn) {
        let volumes = [0.5, 0.7, 1.0, 0.3, 0];
        let volumeIndex = 0;
        
        volumeBtn.addEventListener('click', () => {
            volumeIndex = (volumeIndex + 1) % volumes.length;
            musicPlayer.setVolume(volumes[volumeIndex]);
        });
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeatherMusicPlayer;
}