/**
 * Gerenciamento de tela e layout
 */

const ScreenManager = {
  canvas: document.getElementById('game'),
  ctx: document.getElementById('game').getContext('2d'),

  // Inicializar o sistema de tela
  init() {
    this.setCanvasSize();
    this.setupEventListeners();
    this.checkOrientation();
    this.checkMobileFullscreen();
  },

  // Configurar o tamanho do canvas com base no modo atual
  setCanvasSize() {
    if (document.body.classList.contains('fullscreen')) {
      // Em tela cheia, usa o tamanho da janela
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    } else {
      // Dimensões fixas para simular um dispositivo móvel
      this.canvas.width = 800;
      this.canvas.height = 450;
    }
  },

  // Configurar event listeners para a tela
  setupEventListeners() {
    // Listener para redimensionamento da janela
    window.addEventListener('resize', () => {
      this.setCanvasSize();
      this.checkOrientation();
      
      // Atualizar as estrelas quando a tela for redimensionada
      if (Game.isNightMode) {
        Renderer.initStars();
      }
    });

    // Detectar mudanças no estado de tela cheia
    document.addEventListener('fullscreenchange', this.handleFullScreenChange.bind(this));
    document.addEventListener('webkitfullscreenchange', this.handleFullScreenChange.bind(this));
    document.addEventListener('mozfullscreenchange', this.handleFullScreenChange.bind(this));
    document.addEventListener('MSFullscreenChange', this.handleFullScreenChange.bind(this));

    // Adicionar evento de clique ao botão de tela cheia
    document.getElementById('fullscreen-btn').addEventListener('click', this.toggleFullScreen.bind(this));
  },

  // Verificar orientação do dispositivo
  checkOrientation() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && 
        document.body.classList.contains('fullscreen')) {
      // Em modo tela cheia no celular, verifica orientação real
      if (!isLandscape()) {
        document.getElementById('rotate').style.display = "flex";
        this.canvas.style.display = "none";
        document.getElementById('score').style.display = "none";
        document.getElementById('startscreen').style.display = "none";
        document.getElementById('day-night-indicator').style.display = "none";
        return;
      }
    }
    
    // Exibe o jogo
    document.getElementById('rotate').style.display = "none";
    this.canvas.style.display = "block";
    
    // Se o jogo não foi iniciado ou acabou, exibe a tela adequada
    if (Game.gameover) {
      return;
    } else if (!Game.started) {
      // Mostrar tela inicial
      document.getElementById('startscreen').style.display = "flex";
      // Ocultar elementos do jogo
      document.getElementById('score').style.display = "none";
      document.getElementById('day-night-indicator').style.display = "none";
    } else {
      // Jogo em andamento
      document.getElementById('startscreen').style.display = "none";
      document.getElementById('score').style.display = "block";
      document.getElementById('day-night-indicator').style.display = "block";
    }
  },

  // Ativar tela cheia em dispositivos móveis
  checkMobileFullscreen() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      // Em dispositivos móveis, exibir em tela cheia automaticamente no primeiro toque
      document.body.addEventListener('touchstart', function autoFullscreen() {
        this.toggleFullScreen();
        document.body.removeEventListener('touchstart', autoFullscreen);
      }.bind(this), {once: true});
    }
  },

  // Alternar entre tela cheia e modo normal
  toggleFullScreen() {
    if (!document.fullscreenElement && 
        !document.mozFullScreenElement &&
        !document.webkitFullscreenElement &&
        !document.msFullscreenElement) {
      // Entrar em tela cheia
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
      }
      document.body.classList.add('fullscreen');
    } else {
      // Sair da tela cheia
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      document.body.classList.remove('fullscreen');
    }
    
    // Atualizar tamanho do canvas após tela cheia
    setTimeout(this.setCanvasSize.bind(this), 300);
  },

  // Lidar com mudanças no estado de tela cheia
  handleFullScreenChange() {
    if (document.fullscreenElement || 
        document.webkitFullscreenElement || 
        document.mozFullScreenElement ||
        document.msFullscreenElement) {
      document.body.classList.add('fullscreen');
      // Manter a classe night-mode se estiver em modo noturno
      if (Game.isNightMode) {
        document.body.classList.add('night-mode');
      }
    } else {
      document.body.classList.remove('fullscreen');
      // Manter a classe night-mode se estiver em modo noturno
      if (Game.isNightMode) {
        document.body.classList.add('night-mode');
      } else {
        document.body.classList.remove('night-mode');
      }
    }
    
    // Atualizar tamanho do canvas após tela cheia
    setTimeout(this.setCanvasSize.bind(this), 300);
  }
};
