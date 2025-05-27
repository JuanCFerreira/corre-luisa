/**
 * Interface de usuário do jogo
 */

const UIManager = {
  // Atualizar o contador de pontuação
  updateScore() {
    document.getElementById('score').innerText = "Conchas: " + Game.score;
  },
  
  // Atualizar o indicador dia/noite
  updateDayNightIndicator() {
    const indicator = document.getElementById('day-night-indicator');
    
    // Mostrar o indicador apenas quando o jogo está ativo
    if (!Game.started || Game.gameover) {
      indicator.style.display = 'none';
      return;
    } else {
      indicator.style.display = 'block';
    }
    
    const nextCycle = 50 - (Game.score % 50); // Calcular quantas conchas faltam para o próximo ciclo
    
    // Definir ícone e texto apropriados para o modo atual
    let icon = Game.isNightMode ? '🌙' : '☀️';
    let nextIcon = Game.isNightMode ? '☀️' : '🌙';
    let text = Game.isNightMode ? 'Noite' : 'Dia';
    
    // Atualizar o indicador
    indicator.innerHTML = `${icon} ${text} (${nextIcon} em ${nextCycle} conchas)`;
    
    // Adicionar efeito pulsante quando estiver próximo da mudança
    if (nextCycle <= 5) {
      indicator.style.animation = 'pulse 0.8s infinite';
      indicator.style.textShadow = Game.isNightMode ? 
        '0 0 10px rgba(255, 255, 0, 0.8)' : 
        '0 0 10px rgba(147, 112, 219, 0.8)';
    } else {
      indicator.style.animation = 'none';
      indicator.style.textShadow = '1px 2px 4px #333, 0 0 10px #1e90ff';
    }
  },
  
  // Mostrar a tela de game over
  showGameOver(message) {
    document.getElementById('finalmsg').innerText =
      (message ? message+"\n":"") + `Você coletou ${Game.score} conchinha${Game.score==1?'':'s'}!`;
    document.getElementById('gameover').style.display = 'flex';
  },
  
  // Esconder a tela de game over
  hideGameOver() {
    document.getElementById('gameover').style.display = 'none';
  },
  
  // Desenhar indicadores dos poderes ativos
  drawPowerIndicators(ctx) {
    // Posição dos indicadores no canto superior direito
    const startX = canvasUtils.w() - 20;
    const startY = 20;
    const iconSize = canvasUtils.w() * 0.035;
    const spacing = iconSize * 1.5;
    
    // Desenhar ícone do imã se estiver ativo
    if (Game.magnetActive) {
      const timeLeft = (Game.magnetEndTime - Date.now()) / 1000; // Tempo restante em segundos
      this.drawPowerIcon(ctx, startX - iconSize, startY, iconSize, POWERUP_TYPES.MAGNET, timeLeft, MAGNET_DURATION/1000);
    }
    
    // Desenhar ícone do escudo se estiver ativo
    if (Game.shieldActive) {
      const timeLeft = (Game.shieldEndTime - Date.now()) / 1000; // Tempo restante em segundos
      this.drawPowerIcon(ctx, startX - iconSize, startY + spacing, iconSize, POWERUP_TYPES.SHIELD, timeLeft, SHIELD_DURATION/1000);
    }
  },
  
  // Desenhar um ícone de poder com barra de tempo
  drawPowerIcon(ctx, x, y, size, type, timeLeft, maxTime) {
    ctx.save();
    ctx.translate(x, y);
    
    // Desenha o círculo de fundo
    ctx.fillStyle = type === POWERUP_TYPES.MAGNET ? 'rgba(30, 144, 255, 0.7)' : 'rgba(147, 112, 219, 0.7)';
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, 2 * Math.PI);
    ctx.fill();
    
    // Desenha o ícone
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    
    if (type === POWERUP_TYPES.MAGNET) { // Imã
      // Ferradura do imã
      ctx.beginPath();
      ctx.arc(0, -size/8, size/3, Math.PI, 0, true);
      ctx.stroke();
      
      // Polos do imã
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-size/3, -size/4, size/6, size/2);
      ctx.fillRect(size/3 - size/6, -size/4, size/6, size/2);
    } else { // Escudo
      ctx.beginPath();
      ctx.arc(0, 0, size/2, 0, 2 * Math.PI);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, -size/2);
      ctx.lineTo(0, size/2);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(-size/2, 0);
      ctx.lineTo(size/2, 0);
      ctx.stroke();
    }
    
    // Desenha barra de tempo
    const percentage = timeLeft / maxTime;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, size * 0.8, -Math.PI/2, -Math.PI/2 + percentage * 2 * Math.PI, false);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  },
  
  // Função para pré-carregar e animar o personagem na tela inicial
  preloadCharacterAnimation() {
    const characterPreview = document.getElementById('character-preview');
    
    // Carregar os sprites para animação na tela inicial
    const previewSprites = [];
    let currentPreviewIndex = 0;
    
    const loadPreviewSprite = (index) => {
      if (index > 8) {
        // Após carregar todos, inicie a animação
        startPreviewAnimation();
        return;
      }
      
      const img = new Image();
      img.src = `sprites/luisa-runn/${index}.png`;
      img.onload = function() {
        previewSprites[index-1] = img;
        loadPreviewSprite(index + 1);
      };
      img.onerror = function() {
        console.error(`Failed to load preview sprite ${index}`);
        loadPreviewSprite(index + 1);
      };
    };
    
    const startPreviewAnimation = () => {
      if (previewSprites.length === 0) return;
      
      // Definir a imagem inicial
      characterPreview.style.backgroundImage = `url(${previewSprites[0].src})`;
      
      // Animar os sprites na pré-visualização
      setInterval(() => {
        currentPreviewIndex = (currentPreviewIndex + 1) % previewSprites.length;
        if (previewSprites[currentPreviewIndex]) {
          characterPreview.style.backgroundImage = `url(${previewSprites[currentPreviewIndex].src})`;
        }
      }, 150);
    };
    
    // Iniciar carregamento dos sprites para a pré-visualização
    loadPreviewSprite(1);
  },
    // Inicializar a UI
  init() {
    // Configurar eventos de UI - usando funções de seta para preservar o contexto 'this'
    document.getElementById('restart-btn').addEventListener('click', () => Game.restart());
    document.getElementById('start-btn').addEventListener('click', () => Game.startFromMenu());
    
    // Inicializar a animação do personagem na tela inicial
    this.preloadCharacterAnimation();
  }
};
