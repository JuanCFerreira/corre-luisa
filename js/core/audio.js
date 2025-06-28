/**
 * Gerenciamento de áudio
 */

const AudioManager = {  // Inicializar o sistema de áudio
  init() {
    // Configurar volume da música de fundo
    const backgroundMusic = document.getElementById('backgroundMusic');
    if (backgroundMusic) {
      backgroundMusic.volume = MUSIC_VOLUME;
      // Não iniciar automaticamente a música - será iniciada após interação do usuário
    }
    
    // Configurar volume dos efeitos sonoros
    const coinSound = document.getElementById('coinSound');
    if (coinSound) coinSound.volume = EFFECTS_VOLUME;
    
    const powerSound = document.getElementById('powerSound');
    if (powerSound) powerSound.volume = EFFECTS_VOLUME;
    
    // Configurar volume dos sons de loop
    const magnetSound = document.getElementById('magnetSound');
    if (magnetSound) magnetSound.volume = EFFECTS_VOLUME * 0.7;
    
    const shieldSound = document.getElementById('shieldSound');
    if (shieldSound) shieldSound.volume = EFFECTS_VOLUME * 0.7;
  },
  // Iniciar música de fundo
  startBackgroundMusic() {
    const backgroundMusic = document.getElementById('backgroundMusic');
    if (backgroundMusic) {
      // Tentar iniciar a música com a promessa de reprodução
      backgroundMusic.play()
        .then(() => {
          console.log("Música de fundo iniciada com sucesso");
        })
        .catch(error => {
          console.log("Não foi possível reproduzir a música de fundo automaticamente:", error);
          
          // Criar um botão para iniciar manualmente a música se necessário
          if (!document.getElementById('play-music-btn')) {
            const musicButton = document.createElement('button');
            musicButton.id = 'play-music-btn';
            musicButton.innerHTML = '🎵';
            musicButton.title = 'Ativar música';
            musicButton.style.position = 'absolute';
            musicButton.style.right = '70px';
            musicButton.style.top = '18px';
            musicButton.style.width = '40px';
            musicButton.style.height = '40px';
            musicButton.style.borderRadius = '50%';
            musicButton.style.backgroundColor = 'rgba(255,255,255,0.3)';
            musicButton.style.border = 'none';
            musicButton.style.color = 'white';
            musicButton.style.fontSize = '20px';
            musicButton.style.cursor = 'pointer';
            musicButton.style.zIndex = '10';
            musicButton.style.display = 'flex';
            musicButton.style.justifyContent = 'center';
            musicButton.style.alignItems = 'center';
            
            musicButton.addEventListener('click', () => {
              backgroundMusic.play()
                .then(() => {
                  musicButton.style.display = 'none';
                })
                .catch(e => console.log("Ainda não foi possível reproduzir a música:", e));
            });
            
            document.getElementById('game-area').appendChild(musicButton);
          }
        });
    }
  },

  // Tocar efeito sonoro
  playSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) {
      // Reiniciar o som se já estiver tocando
      sound.pause();
      sound.currentTime = 0;
      
      // Tocar o som
      sound.play().catch(error => {
        console.log(`Erro ao reproduzir som ${soundId}:`, error);
      });
    }
  },

  // Iniciar som em loop
  startLoopSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(error => {
        console.log(`Erro ao iniciar loop de som ${soundId}:`, error);
      });
    }
  },

  // Parar som em loop
  stopLoopSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) {
      // Fade out suave antes de parar completamente
      const fadeOutInterval = setInterval(() => {
        // Reduzir volume gradualmente
        if (sound.volume > 0.05) {
          sound.volume -= 0.05;
        } else {
          // Quando o volume estiver bem baixo, parar o som e o intervalo
          sound.pause();
          sound.currentTime = 0;
          // Restaurar o volume original para próxima vez
          sound.volume = EFFECTS_VOLUME;
          clearInterval(fadeOutInterval);
        }
      }, 50);
    }
  },

  // Parar todos os efeitos sonoros de loop
  stopAllLoopSounds() {
    this.stopLoopSound('magnetSound');
    this.stopLoopSound('shieldSound');
  }
};
