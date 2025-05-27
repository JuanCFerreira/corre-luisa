/**
 * Lógica principal do jogo
 */

const Game = {
  // Estado do jogo
  started: false,
  gameover: false,
  
  // Pontuação
  score: 0,
  
  // Velocidade
  speed: 0,
  
  // Estado dos poderes
  magnetActive: false,
  magnetEndTime: 0,
  shieldActive: false,
  shieldEndTime: 0,
  
  // Estado do ambiente
  isNightMode: false,
  
  // Inicializar o jogo
  init() {
    // Configurar eventos de input
    this.setupControls();
    
    // Inicializar componentes
    ScreenManager.init();
    AudioManager.init();
    UIManager.init();
    
    // Inicializar estados
    this.started = false;
    this.gameover = false;
    this.isNightMode = false;
  },
  
  // Configurar controles
  setupControls() {
    // Toque na tela
    canvasUtils.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      // Evite pular se o toque foi no botão de tela cheia
      const fsButton = document.getElementById('fullscreen-btn');
      const touch = e.touches[0];
      const fsRect = fsButton.getBoundingClientRect();
      
      if (touch.clientX >= fsRect.left && touch.clientX <= fsRect.right &&
          touch.clientY >= fsRect.top && touch.clientY <= fsRect.bottom) {
        return;
      }
      
      Girl.jump();
    }, {passive: false});
    
    // Clique do mouse
    canvasUtils.canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      // Evite pular se o clique foi no botão de tela cheia
      const fsButton = document.getElementById('fullscreen-btn');
      const fsRect = fsButton.getBoundingClientRect();
      
      if (e.clientX >= fsRect.left && e.clientX <= fsRect.right &&
          e.clientY >= fsRect.top && e.clientY <= fsRect.bottom) {
        return;
      }
      
      Girl.jump();
    });
    
    // Teclas
    window.addEventListener('keydown', (e) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        Girl.jump();
      }
    });
  },
    // Iniciar o jogo a partir do menu
  startFromMenu() {
    // Esconder a tela de início
    document.getElementById('startscreen').style.display = 'none';
    
    // Mostrar os elementos do jogo
    document.getElementById('score').style.display = '';
    document.getElementById('day-night-indicator').style.display = '';
    
    // Iniciar a música de fundo agora que houve interação do usuário
    AudioManager.startBackgroundMusic();
    
    // Iniciar o jogo
    this.start();
  },
  
  // Iniciar/reiniciar o jogo
  start() {
    // Sempre garantir que o canvas está no tamanho correto antes de calcular velocidades
    ScreenManager.setCanvasSize();
    if (canvasUtils.canvas !== document.getElementById('game')) {
      canvasUtils.canvas = document.getElementById('game');
    }
    // Inicializar jacaré
    Jacare.init();
    // Inicializar menina
    Girl.init(Jacare.x + Jacare.w + canvasUtils.w() * 0.30, canvasUtils.GROUND_Y() - canvasUtils.GIRL_H());
    // Inicializar gerenciadores
    ShellManager.init();
    ObstacleManager.init();
    PowerupManager.init();
    Renderer.init();
    // Reiniciar estados
    this.score = 0;
    this.speed = canvasUtils.w() * 0.009;
    this.started = true;
    this.gameover = false;
    this.magnetActive = false;
    this.magnetEndTime = 0;
    this.shieldActive = false;
    this.shieldEndTime = 0;
    AudioManager.stopAllLoopSounds();
    this.isNightMode = false;
    document.body.classList.remove('night-mode');
    UIManager.updateScore();
    UIManager.updateDayNightIndicator();
    UIManager.hideGameOver();
    // Cancelar qualquer loop anterior
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
    }
    // Iniciar o loop do jogo
    this._rafId = requestAnimationFrame(this.gameLoop.bind(this));
  },
  // Reiniciar o jogo após game over
  restart() {
    // Garantir que a música de fundo esteja tocando (agora que houve interação do usuário)
    AudioManager.startBackgroundMusic();
    
    // Iniciar o jogo diretamente (sem mostrar a tela inicial)
    this.start();
  },
  
  // Loop principal do jogo
  gameLoop() {
    if (this.gameover || !isLandscape() || !this.started) {
      this._rafId = requestAnimationFrame(this.gameLoop.bind(this));
      return;
    }
    
    // Atualizar entidades
    Girl.update();
    Jacare.update(Girl.x);
    ShellManager.update();
    ObstacleManager.update();
    PowerupManager.update();
    
    // Verificar colisões
    CollisionSystem.checkCollisions();
    
    // Renderizar o frame
    Renderer.render();
    
    // Atualizar UI
    UIManager.updateDayNightIndicator();
    
    // Agendar próximo frame
    requestAnimationFrame(this.gameLoop.bind(this));
  },
  
  // Alternar entre dia e noite
  toggleDayNight() {
    this.isNightMode = !this.isNightMode;
    
    // Atualizar classe do body para mudar o fundo em tela cheia
    if (this.isNightMode) {
      document.body.classList.add('night-mode');
      // Inicializar estrelas quando mudar para modo noturno
      Renderer.initStars();
    } else {
      document.body.classList.remove('night-mode');
    }
    
    // Efeito visual para transição
    const flashElement = document.createElement('div');
    flashElement.style.position = 'absolute';
    flashElement.style.left = '0';
    flashElement.style.top = '0';
    flashElement.style.width = '100%';
    flashElement.style.height = '100%';
    flashElement.style.backgroundColor = this.isNightMode ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)';
    flashElement.style.zIndex = '5';
    flashElement.style.transition = 'opacity 1.5s';
    document.getElementById('game-area').appendChild(flashElement);
    
    // Remover o flash após a animação
    setTimeout(() => {
      flashElement.style.opacity = '0';
      setTimeout(() => {
        document.getElementById('game-area').removeChild(flashElement);
      }, 1500);
    }, 100);
    
    // Atualizar o indicador dia/noite após a mudança
    UIManager.updateDayNightIndicator();
  },
  
  // Game over
  gameOver(msg) {
    this.gameover = true;
    UIManager.showGameOver(msg);
    
    // Parar todos os efeitos sonoros de loop
    AudioManager.stopAllLoopSounds();
  },
  
  // Função para aumentar a velocidade ao coletar concha
  increaseSpeed() {
    // Limite máximo de velocidade
    const MAX_SPEED = 10;
    const increment = canvasUtils.w() * 0.00037;
    if (this.speed < MAX_SPEED) {
      this.speed += increment;
      if (this.speed > MAX_SPEED) {
        this.speed = MAX_SPEED;
      }
    }
  },
};
