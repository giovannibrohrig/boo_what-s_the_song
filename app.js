// Boo! What's the Sound? - Bandle Halloween Edition
// Web Audio API Multi-Track Engine & Game Controller

class BandleHalloweenGame {
  constructor() {
    this.audioContext = null;
    this.masterGainNode = null;
    this.songs = [];
    this.currentSongIndex = 0;
    this.songData = null;
    this.stems = []; // { id, name, icon, file, round, buffer, sourceNode, gainNode, isMuted, isSoloed }
    this.guessOptions = [];
    
    // Playback state
    this.isPlaying = false;
    this.duration = 0;
    this.playbackOffset = 0;
    this.startedAt = 0;
    this.timerInterval = null;

    // Game state
    this.currentRound = 1;
    this.maxRounds = 5;
    this.guesses = [];
    this.isGameOver = false;
    this.isVictory = false;

    // DOM Elements
    this.elements = {
      songSelect: document.getElementById('song-select'),
      btnPlayPause: document.getElementById('btn-play-pause'),
      playIcon: document.querySelector('.play-icon'),
      playText: document.querySelector('.play-text'),
      timeCurrent: document.getElementById('time-current'),
      timeTotal: document.getElementById('time-total'),
      progressBarFill: document.getElementById('progress-bar-fill'),
      progressThumb: document.getElementById('progress-thumb'),
      progressBarWrapper: document.getElementById('progress-bar-wrapper'),
      masterVolume: document.getElementById('master-volume'),
      currentRoundText: document.getElementById('current-round-text'),
      attemptsTracker: document.getElementById('attempts-tracker'),
      stemsGrid: document.getElementById('stems-grid'),
      guessInput: document.getElementById('guess-input'),
      btnSubmitGuess: document.getElementById('btn-submit-guess'),
      btnSkipRound: document.getElementById('btn-skip-round'),
      autocompleteList: document.getElementById('autocomplete-list'),
      previousGuesses: document.getElementById('previous-guesses'),
      modalHelp: document.getElementById('modal-help'),
      btnHowToPlay: document.getElementById('btn-how-to-play'),
      btnCloseHelp: document.getElementById('btn-close-help'),
      btnUnferstood: document.getElementById('btn-understood'),
      modalResult: document.getElementById('modal-result'),
      resultIcon: document.getElementById('result-icon'),
      resultTitle: document.getElementById('result-title'),
      resultSubtitle: document.getElementById('result-subtitle'),
      revealSongTitle: document.getElementById('reveal-song-title'),
      revealSongArtist: document.getElementById('reveal-song-artist'),
      revealSongHint: document.getElementById('reveal-song-hint'),
      resultStats: document.getElementById('result-stats'),
      btnPlayAllResult: document.getElementById('btn-play-all-result'),
      btnNextSong: document.getElementById('btn-next-song'),
      btnPlayAgain: document.getElementById('btn-play-again'),
      btnRestart: document.getElementById('btn-restart')
    };

    this.selectedAutocompleteIndex = -1;
  }

  async init() {
    this.bindEvents();
    await this.loadCatalog();
    this.populateSongSelector();
    await this.selectSong(0);
  }

  // 1. Load songs and options
  async loadCatalog() {
    try {
      const response = await fetch('songs.json');
      const data = await response.json();
      this.songs = data.songs || [];
      this.guessOptions = data.guessOptions || [];
    } catch (err) {
      console.warn('Usando catálogo padrão embutido:', err);
      this.songs = [
        {
          id: "thriller",
          title: "Thriller",
          artist: "Michael Jackson",
          year: 1982,
          hint: "Um clássico zumbi com a risada sinistra de Vincent Price!",
          stems: [
            { id: "drums", name: "Bateria", icon: "🥁", file: "audio/thriller_drums.mp3", round: 1 },
            { id: "bass", name: "Baixo", icon: "🔊", file: "audio/thriller_bass.mp3", round: 2 },
            { id: "guitar", name: "Guitarra", icon: "🎸", file: "audio/thriller_guitar.mp3", round: 3 },
            { id: "other", name: "Sintetizadores & Efeitos", icon: "🎹", file: "audio/thriller_other.mp3", round: 4 },
            { id: "vocals", name: "Vocais", icon: "🎤", file: "audio/thriller_vocals.mp3", round: 5 }
          ]
        },
        {
          id: "ghostbusters",
          title: "Ghostbusters",
          artist: "Ray Parker Jr.",
          year: 1984,
          hint: "Who you gonna call? 🚫👻 Uma das linhas de baixo mais contagiantes dos anos 80!",
          stems: [
            { id: "drums", name: "Bateria", icon: "🥁", file: "audio/ghostbusters_drums.mp3", round: 1 },
            { id: "bass", name: "Baixo", icon: "🔊", file: "audio/ghostbusters_bass.mp3", round: 2 },
            { id: "guitar", name: "Guitarra", icon: "🎸", file: "audio/ghostbusters_guitar.mp3", round: 3 },
            { id: "other", name: "Sintetizadores & Efeitos", icon: "🎹", file: "audio/ghostbusters_other.mp3", round: 4 },
            { id: "vocals", name: "Vocais", icon: "🎤", file: "audio/ghostbusters_vocals.mp3", round: 5 }
          ]
        },
        {
          id: "bury_a_friend",
          title: "Bury a Friend",
          artist: "Billie Eilish",
          year: 2019,
          hint: "O que tem embaixo da cama? O terror minimalista gravado com sons de broca de dentista! 👁️🦷",
          stems: [
            { id: "drums", name: "Batida & Estalos", icon: "🥁", file: "audio/bury_a_friend_drums.mp3", round: 1 },
            { id: "other", name: "Baixo & Efeitos Sinistros", icon: "🔊", file: "audio/bury_a_friend_other.mp3", round: 2 },
            { id: "vocals", name: "Vocais", icon: "🎤", file: "audio/bury_a_friend_vocals.mp3", round: 3 }
          ]
        }
      ];
      this.guessOptions = [
        "Thriller - Michael Jackson",
        "Ghostbusters - Ray Parker Jr.",
        "Bury a Friend - Billie Eilish",
        "Somebody's Watching Me - Rockwell",
        "Monster Mash - Bobby Pickett",
        "Spooky Scary Skeletons - Andrew Gold",
        "This Is Halloween - Danny Elfman",
        "Tubular Bells (The Exorcist) - Mike Oldfield"
      ];
    }
  }

  populateSongSelector() {
    if (!this.elements.songSelect) return;
    this.elements.songSelect.innerHTML = '';
    this.songs.forEach((song, idx) => {
      const option = document.createElement('option');
      option.value = idx;
      option.textContent = `${idx + 1}`;
      this.elements.songSelect.appendChild(option);
    });
  }

  // 2. Select and Load Song
  async selectSong(index) {
    if (this.isPlaying) {
      this.pauseAudio();
    }
    this.stopSources();

    this.currentSongIndex = index;
    this.songData = this.songs[index];
    if (this.elements.songSelect) {
      this.elements.songSelect.value = index;
    }

    // Reset game state
    this.currentRound = 1;
    this.guesses = [];
    this.isGameOver = false;
    this.isVictory = false;
    this.playbackOffset = 0;
    this.duration = 0;

    this.maxRounds = this.songData.stems.length;
    this.stems = this.songData.stems.map(s => ({
      ...s,
      buffer: null,
      sourceNode: null,
      gainNode: null,
      isMuted: false,
      isSoloed: false
    }));

    // Reset UI
    this.elements.currentRoundText.textContent = `${this.currentRound} de ${this.maxRounds}`;
    this.elements.guessInput.disabled = false;
    this.elements.guessInput.value = '';
    this.elements.btnSubmitGuess.disabled = true;
    this.elements.btnSkipRound.disabled = false;
    this.elements.previousGuesses.innerHTML = '';
    this.elements.modalResult.classList.add('hidden');
    this.updateTimelineDisplay();

    this.renderAttemptsTracker();
    this.renderStemsUI();

    await this.initAudioEngine();
  }

  // 3. Audio Engine Setup with Web Audio API
  async initAudioEngine() {
    if (!this.audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContextClass();

      this.masterGainNode = this.audioContext.createGain();
      this.masterGainNode.gain.value = parseFloat(this.elements.masterVolume.value);
      this.masterGainNode.connect(this.audioContext.destination);
    }

    this.elements.playText.textContent = "Carregando Faixas...";
    this.elements.btnPlayPause.disabled = true;

    try {
      let loadedCount = 0;
      const total = this.stems.length;

      await Promise.all(this.stems.map(async (stem) => {
        const resp = await fetch(stem.file);
        const arrayBuffer = await resp.arrayBuffer();
        stem.buffer = await this.audioContext.decodeAudioData(arrayBuffer);
        
        if (stem.buffer.duration > this.duration) {
          this.duration = stem.buffer.duration;
        }

        loadedCount++;
        this.elements.playText.textContent = `Carregando (${loadedCount}/${total})...`;
      }));

      this.elements.timeTotal.textContent = this.formatTime(this.duration);
      this.elements.playText.textContent = "Tocar 🎃";
      this.elements.btnPlayPause.disabled = false;
      this.elements.btnSubmitGuess.disabled = false;
      this.updateStemsGains();
    } catch (err) {
      console.error('Erro ao carregar ou decodificar áudio:', err);
      this.elements.playText.textContent = "Erro ao carregar áudio";
    }
  }

  // 4. Multi-Track Playback Logic
  playAudio() {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    // Stop existing sources if any
    this.stopSources();

    const startOffset = this.playbackOffset;
    this.startedAt = this.audioContext.currentTime - startOffset;

    // Create and start synchronized source nodes
    this.stems.forEach(stem => {
      if (!stem.buffer) return;

      const source = this.audioContext.createBufferSource();
      source.buffer = stem.buffer;

      // Gain Node for each stem
      if (!stem.gainNode) {
        stem.gainNode = this.audioContext.createGain();
        stem.gainNode.connect(this.masterGainNode);
      }

      source.connect(stem.gainNode);
      source.start(0, startOffset);
      stem.sourceNode = source;
    });

    this.isPlaying = true;
    this.elements.playIcon.textContent = "⏸";
    this.elements.playText.textContent = "Pausar";
    this.updateStemPlayingVisuals();

    // Start progress loop
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => this.updateTimeline(), 100);
  }

  pauseAudio() {
    if (!this.isPlaying) return;

    this.playbackOffset = this.audioContext.currentTime - this.startedAt;
    if (this.playbackOffset >= this.duration) {
      this.playbackOffset = 0;
    }

    this.stopSources();
    this.isPlaying = false;
    this.elements.playIcon.textContent = "▶";
    this.elements.playText.textContent = "Tocar 🎃";
    clearInterval(this.timerInterval);
    this.updateStemPlayingVisuals();
  }

  stopSources() {
    this.stems.forEach(stem => {
      if (stem.sourceNode) {
        try {
          stem.sourceNode.stop();
          stem.sourceNode.disconnect();
        } catch (e) {}
        stem.sourceNode = null;
      }
    });
  }

  seek(seconds) {
    const wasPlaying = this.isPlaying;
    if (wasPlaying) {
      this.pauseAudio();
    }
    this.playbackOffset = Math.max(0, Math.min(seconds, this.duration));
    this.updateTimelineDisplay();
    if (wasPlaying) {
      this.playAudio();
    }
  }

  updateTimeline() {
    if (!this.isPlaying) return;

    const current = this.audioContext.currentTime - this.startedAt;
    if (current >= this.duration) {
      this.playbackOffset = 0;
      this.pauseAudio();
      this.updateTimelineDisplay();
      return;
    }

    this.playbackOffset = current;
    this.updateTimelineDisplay();
  }

  updateTimelineDisplay() {
    const progress = (this.playbackOffset / (this.duration || 1)) * 100;
    this.elements.progressBarFill.style.width = `${progress}%`;
    this.elements.progressThumb.style.left = `${progress}%`;
    this.elements.timeCurrent.textContent = this.formatTime(this.playbackOffset);
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  // 5. Stems Volume & Unlock Rules
  updateStemsGains() {
    const anySoloed = this.stems.some(s => s.isSoloed);

    this.stems.forEach(stem => {
      if (!stem.gainNode) {
        stem.gainNode = this.audioContext.createGain();
        stem.gainNode.connect(this.masterGainNode);
      }

      const isUnlocked = this.isGameOver || this.isVictory || stem.round <= this.currentRound;

      let targetGain = 0;
      if (isUnlocked) {
        if (anySoloed) {
          targetGain = stem.isSoloed ? 1.0 : 0.0;
        } else {
          targetGain = stem.isMuted ? 0.0 : 1.0;
        }
      } else {
        targetGain = 0.0;
      }

      const now = this.audioContext.currentTime;
      stem.gainNode.gain.cancelScheduledValues(now);
      stem.gainNode.gain.linearRampToValueAtTime(targetGain, now + 0.1);
    });

    this.renderStemsUI();
  }

  updateStemPlayingVisuals() {
    this.stems.forEach(stem => {
      const card = document.getElementById(`stem-card-${stem.id}`);
      if (!card) return;

      const isUnlocked = this.isGameOver || this.isVictory || stem.round <= this.currentRound;
      const isAudible = isUnlocked && !stem.isMuted;

      if (this.isPlaying && isAudible) {
        card.classList.add('playing');
      } else {
        card.classList.remove('playing');
      }
    });
  }

  // 6. Game Mechanics: Advance Round / Skip / Guess
  advanceRound() {
    if (this.currentRound < this.maxRounds) {
      this.currentRound++;
      this.elements.currentRoundText.textContent = `${this.currentRound} de ${this.maxRounds}`;
      this.renderAttemptsTracker();
      this.updateStemsGains();
      this.updateStemPlayingVisuals();

      if (!this.isPlaying) {
        this.playAudio();
      }
    } else {
      this.triggerGameOver(false);
    }
  }

  submitGuess(guessText) {
    const trimmed = (guessText || '').trim();
    if (!trimmed || trimmed.length < 2 || this.isGameOver || this.isVictory) return;

    const normalizedGuess = this.normalizeString(trimmed);
    const normalizedTitle = this.normalizeString(this.songData.title);
    const normalizedArtist = this.normalizeString(this.songData.artist);
    const fullNormalized = `${normalizedTitle} ${normalizedArtist}`;

    const aliases = (this.songData.aliases || []).map(a => this.normalizeString(a));

    // Apenas é considerado acerto se o chute corresponder ao título completo da música ou a um alias
    const isMatch = 
      normalizedGuess === normalizedTitle ||
      normalizedGuess === fullNormalized ||
      (normalizedGuess.length >= normalizedTitle.length && normalizedGuess.includes(normalizedTitle)) ||
      aliases.includes(normalizedGuess);

    this.guesses.push({
      text: trimmed,
      round: this.currentRound,
      isCorrect: isMatch
    });

    this.renderGuessHistory();
    this.elements.guessInput.value = '';
    this.hideAutocomplete();

    if (isMatch) {
      this.triggerGameOver(true);
    } else {
      if (this.currentRound < this.maxRounds) {
        this.advanceRound();
      } else {
        this.triggerGameOver(false);
      }
    }
  }

  normalizeString(str) {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 ]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  triggerGameOver(isVictory) {
    this.isGameOver = true;
    this.isVictory = isVictory;

    // Unmute all stems
    this.stems.forEach(stem => {
      stem.isMuted = false;
      stem.isSoloed = false;
    });
    this.updateStemsGains();

    // Disable guess inputs
    this.elements.guessInput.disabled = true;
    this.elements.btnSubmitGuess.disabled = true;
    this.elements.btnSkipRound.disabled = true;

    this.renderAttemptsTracker();

    // Fill reveal modal info
    this.elements.revealSongTitle.textContent = this.songData.title;
    this.elements.revealSongArtist.textContent = `${this.songData.artist} (${this.songData.year})`;
    this.elements.revealSongHint.textContent = `🎃 ${this.songData.hint}`;

    if (isVictory) {
      this.elements.resultIcon.textContent = "🏆🎃";
      this.elements.resultTitle.textContent = "Você Acertou!";
      this.elements.resultSubtitle.textContent = "Sensacional! Seu ouvido musical de Halloween é afiadíssimo!";
      this.elements.resultStats.textContent = `🎯 Acertou na Rodada ${this.currentRound} (${this.currentRound} de ${this.maxRounds} instrumentos ouvidos)`;
      this.launchConfetti();
    } else {
      this.elements.resultIcon.textContent = "👻💀";
      this.elements.resultTitle.textContent = "Buuu! Fim de Jogo!";
      this.elements.resultSubtitle.textContent = "Não foi dessa vez, mas a trilha sonora continua no clima de Halloween!";
      this.elements.resultStats.textContent = `Você usou todas as ${this.maxRounds} tentativas.`;
    }

    // Configure "Próxima Música" button in modal
    if (this.elements.btnNextSong) {
      if (this.currentSongIndex < this.songs.length - 1) {
        this.elements.btnNextSong.style.display = 'block';
        this.elements.btnNextSong.textContent = `Próxima Música ⏭️`;
      } else {
        this.elements.btnNextSong.style.display = 'none';
      }
    }

    setTimeout(() => {
      this.elements.modalResult.classList.remove('hidden');
    }, 600);
  }

  launchConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff7518', '#9d4edd', '#39ff14', '#ffffff']
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#ff7518', '#9d4edd']
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#39ff14', '#ff7518']
        });
      }, 300);
    }
  }

  restartGame() {
    this.selectSong(this.currentSongIndex);
  }

  // 7. UI Renders
  renderAttemptsTracker() {
    this.elements.attemptsTracker.innerHTML = '';
    for (let r = 1; r <= this.maxRounds; r++) {
      const badge = document.createElement('div');
      badge.className = 'attempt-badge';

      if (this.isVictory && r === this.currentRound) {
        badge.classList.add('success');
        badge.textContent = '🎉';
      } else if (r === this.currentRound && !this.isGameOver) {
        badge.classList.add('active');
        badge.textContent = '🎃';
      } else if (r < this.currentRound) {
        badge.classList.add('passed');
        badge.textContent = '❌';
      } else {
        badge.textContent = '👻';
      }

      this.elements.attemptsTracker.appendChild(badge);
    }
  }

  renderStemsUI() {
    this.elements.stemsGrid.innerHTML = '';

    this.stems.forEach(stem => {
      const isUnlocked = this.isGameOver || this.isVictory || stem.round <= this.currentRound;
      
      const card = document.createElement('div');
      card.className = `stem-card ${isUnlocked ? 'active' : 'locked'}`;
      card.id = `stem-card-${stem.id}`;

      card.innerHTML = `
        <div class="stem-header">
          <span class="stem-icon">${stem.icon}</span>
          <span class="stem-status-badge ${isUnlocked ? 'badge-active' : 'badge-locked'}">
            ${isUnlocked ? 'Ativo' : `🔒 Rodada ${stem.round}`}
          </span>
        </div>
        <div class="stem-info">
          <h3>${stem.name}</h3>
          <p>${isUnlocked ? 'Tocando no mix' : 'Bloqueado nesta rodada'}</p>
        </div>
        <div class="wave-bars">
          <div class="wave-bar"></div>
          <div class="wave-bar"></div>
          <div class="wave-bar"></div>
          <div class="wave-bar"></div>
          <div class="wave-bar"></div>
          <div class="wave-bar"></div>
        </div>
        <div class="stem-actions">
          <button class="btn-stem-toggle btn-mute ${stem.isMuted ? 'muted' : ''}" 
                  data-id="${stem.id}" 
                  ${!isUnlocked ? 'disabled' : ''}>
            ${stem.isMuted ? 'Desmutar' : 'Mudo'}
          </button>
          <button class="btn-stem-toggle btn-solo ${stem.isSoloed ? 'soloed' : ''}" 
                  data-id="${stem.id}" 
                  ${!isUnlocked ? 'disabled' : ''}>
            ${stem.isSoloed ? 'Solo Ativo' : 'Solo'}
          </button>
        </div>
      `;

      this.elements.stemsGrid.appendChild(card);
    });

    this.bindStemButtonEvents();
    this.updateStemPlayingVisuals();
  }

  bindStemButtonEvents() {
    document.querySelectorAll('.btn-mute').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        const stem = this.stems.find(s => s.id === id);
        if (stem) {
          stem.isMuted = !stem.isMuted;
          this.updateStemsGains();
          this.updateStemPlayingVisuals();
        }
      });
    });

    document.querySelectorAll('.btn-solo').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        const stem = this.stems.find(s => s.id === id);
        if (stem) {
          stem.isSoloed = !stem.isSoloed;
          this.updateStemsGains();
          this.updateStemPlayingVisuals();
        }
      });
    });
  }

  renderGuessHistory() {
    this.elements.previousGuesses.innerHTML = '';
    this.guesses.forEach(g => {
      const item = document.createElement('div');
      item.className = `guess-history-item ${g.isCorrect ? 'correct' : ''}`;
      item.innerHTML = `
        <span><strong>Rodada ${g.round}:</strong> ${g.text}</span>
        <span class="guess-status-icon">${g.isCorrect ? '✅ Acertou!' : '❌ Errou'}</span>
      `;
      this.elements.previousGuesses.appendChild(item);
    });
  }

  // 8. Autocomplete
  handleAutocomplete(query) {
    if (!query || query.trim().length === 0) {
      this.hideAutocomplete();
      return;
    }

    const normQuery = this.normalizeString(query);
    const matches = this.guessOptions.filter(opt => 
      this.normalizeString(opt).includes(normQuery)
    );

    if (matches.length === 0) {
      this.hideAutocomplete();
      return;
    }

    this.elements.autocompleteList.innerHTML = '';
    matches.slice(0, 7).forEach((opt) => {
      const item = document.createElement('div');
      item.className = 'autocomplete-item';
      item.textContent = opt;
      item.addEventListener('click', () => {
        this.elements.guessInput.value = opt;
        this.hideAutocomplete();
        this.elements.guessInput.focus();
      });
      this.elements.autocompleteList.appendChild(item);
    });

    this.elements.autocompleteList.style.display = 'block';
  }

  hideAutocomplete() {
    this.elements.autocompleteList.innerHTML = '';
    this.elements.autocompleteList.style.display = 'none';
    this.selectedAutocompleteIndex = -1;
  }

  // 9. Event Listeners
  bindEvents() {
    // Song Selector
    if (this.elements.songSelect) {
      this.elements.songSelect.addEventListener('change', (e) => {
        this.selectSong(parseInt(e.target.value, 10));
      });
    }

    // Play / Pause
    this.elements.btnPlayPause.addEventListener('click', () => {
      if (this.isPlaying) {
        this.pauseAudio();
      } else {
        this.playAudio();
      }
    });

    // Master volume
    this.elements.masterVolume.addEventListener('input', (e) => {
      if (this.masterGainNode) {
        this.masterGainNode.gain.value = parseFloat(e.target.value);
      }
    });

    // Progress bar seeking
    this.elements.progressBarWrapper.addEventListener('click', (e) => {
      const rect = this.elements.progressBarWrapper.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const fraction = clickX / rect.width;
      this.seek(fraction * this.duration);
    });

    // Skip Round Button
    this.elements.btnSkipRound.addEventListener('click', () => {
      this.advanceRound();
    });

    // Guess Input & Autocomplete
    this.elements.guessInput.addEventListener('input', (e) => {
      this.handleAutocomplete(e.target.value);
    });

    this.elements.guessInput.addEventListener('keydown', (e) => {
      const items = this.elements.autocompleteList.querySelectorAll('.autocomplete-item');
      if (items.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.selectedAutocompleteIndex = (this.selectedAutocompleteIndex + 1) % items.length;
          this.highlightAutocompleteItem(items);
          return;
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          this.selectedAutocompleteIndex = (this.selectedAutocompleteIndex - 1 + items.length) % items.length;
          this.highlightAutocompleteItem(items);
          return;
        } else if (e.key === 'Enter' && this.selectedAutocompleteIndex >= 0) {
          e.preventDefault();
          items[this.selectedAutocompleteIndex].click();
          return;
        }
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        this.submitGuess(this.elements.guessInput.value);
      } else if (e.key === 'Escape') {
        this.hideAutocomplete();
      }
    });

    document.addEventListener('click', (e) => {
      if (!this.elements.guessInput.contains(e.target) && !this.elements.autocompleteList.contains(e.target)) {
        this.hideAutocomplete();
      }
    });

    this.elements.btnSubmitGuess.addEventListener('click', () => {
      this.submitGuess(this.elements.guessInput.value);
    });

    // Modals
    this.elements.btnHowToPlay.addEventListener('click', () => {
      this.elements.modalHelp.classList.remove('hidden');
    });

    this.elements.btnCloseHelp.addEventListener('click', () => {
      this.elements.modalHelp.classList.add('hidden');
    });

    this.elements.btnUnferstood.addEventListener('click', () => {
      this.elements.modalHelp.classList.add('hidden');
    });

    this.elements.btnPlayAllResult.addEventListener('click', () => {
      this.elements.modalResult.classList.add('hidden');
      this.playAudio();
    });

    if (this.elements.btnNextSong) {
      this.elements.btnNextSong.addEventListener('click', () => {
        if (this.currentSongIndex < this.songs.length - 1) {
          this.selectSong(this.currentSongIndex + 1);
        }
      });
    }

    this.elements.btnPlayAgain.addEventListener('click', () => {
      this.restartGame();
    });

    this.elements.btnRestart.addEventListener('click', () => {
      if (confirm('Deseja reiniciar a partida atual?')) {
        this.restartGame();
      }
    });
  }

  highlightAutocompleteItem(items) {
    items.forEach((item, index) => {
      if (index === this.selectedAutocompleteIndex) {
        item.classList.add('active');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('active');
      }
    });
  }
}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
  const game = new BandleHalloweenGame();
  game.init();
});
