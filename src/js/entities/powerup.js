/**
 * Classe para gerenciar os itens de poder (imã e escudo)
 */

const PowerupManager = {
  // Array de powerups
  powerups: [],
  
  // Sprites dos powerups
  magnetSprite: null,
  shieldSprite: null,
  
  // Inicializar o gerenciador
  init() {
    this.powerups = [];
    this.loadSprites();
    this.spawnPowerup();
  },
  
  // Carregar sprites dos powerups
  loadSprites() {
    this.magnetSprite = new Image();
    this.magnetSprite.src = 'sprites/powers/magnet.png';
    this.magnetSprite.onerror = () => {
      console.error('Failed to load magnet sprite');
    };
    
    this.shieldSprite = new Image();
    this.shieldSprite.src = 'sprites/powers/shield.png';
    this.shieldSprite.onerror = () => {
      console.error('Failed to load shield sprite');
    };
  },
  
  // Criar um novo item de poder
  spawnPowerup() {
    // Intervalo muito mais longo para os power-ups (bem mais raros)
    const interval = Math.random() * (canvasUtils.w() * POWERUP_FREQUENCY_MAX) + canvasUtils.w() * POWERUP_FREQUENCY_MIN;
    setTimeout(() => {
      if (!Game.gameover && isLandscape()) {
        // Tipo aleatório: 0 para imã, 1 para escudo
        const type = Math.floor(Math.random() * 2);
        this.powerups.push({
          x: canvasUtils.w() + canvasUtils.POWERUP_SIZE(),
          y: canvasUtils.GROUND_Y() - canvasUtils.POWERUP_SIZE() - Math.random() * (canvasUtils.h() * 0.15),
          w: canvasUtils.POWERUP_SIZE(),
          h: canvasUtils.POWERUP_SIZE(),
          type: type // 0 = imã, 1 = escudo
        });
        this.spawnPowerup();
      }
    }, interval / Game.speed * 50); // Multiplicador muito maior para tornar os power-ups bem mais raros
  },
  
  // Atualizar os itens de poder
  update() {
    // Mover os power-ups
    for (let p of this.powerups) {
      p.x -= Game.speed;
    }
    
    // Remover power-ups que saíram da tela
    this.powerups = this.powerups.filter(p => p.x + p.w > 0);
    
    // Verificar duração dos poderes ativos
    const currentTime = Date.now();
    if (Game.magnetActive && currentTime > Game.magnetEndTime) {
      Game.magnetActive = false;
      // Parar o som de magnetismo quando o poder terminar
      AudioManager.stopLoopSound('magnetSound');
    }
    if (Game.shieldActive && currentTime > Game.shieldEndTime) {
      Game.shieldActive = false;
      // Parar o som de escudo quando o poder terminar
      AudioManager.stopLoopSound('shieldSound');
    }
  },
  
  // Verificar colisões com a menina
  checkCollisions() {
    for (let i = this.powerups.length-1; i >= 0; i--) {
      let p = this.powerups[i];
      if (rectsCollide(Girl, p)) {
        this.powerups.splice(i, 1);
        
        // Tocar som de poder
        AudioManager.playSound('powerSound');
        
        if (p.type === POWERUP_TYPES.MAGNET) { // Imã
          Game.magnetActive = true;
          Game.magnetEndTime = Date.now() + MAGNET_DURATION;
          // Iniciar som de loop do magnetismo
          AudioManager.startLoopSound('magnetSound');
        } else { // Escudo
          Game.shieldActive = true;
          Game.shieldEndTime = Date.now() + SHIELD_DURATION;
          // Iniciar som de loop do escudo
          AudioManager.startLoopSound('shieldSound');
        }
      }
    }
  },
    // Desenhar um item de poder
  drawPowerup(ctx, powerup) {
    ctx.save();
    ctx.translate(powerup.x + powerup.w/2, powerup.y + powerup.h/2);
    
    // Efeito de rotação suave
    ctx.rotate(Date.now() / 800);
    
    // Usar sprites se carregados
    const sprite = powerup.type === POWERUP_TYPES.MAGNET ? this.magnetSprite : this.shieldSprite;
    
    if (sprite && sprite.complete) {
      const drawWidth = powerup.w * 0.8;
      const drawHeight = powerup.h * 0.8;
      ctx.drawImage(
        sprite, 
        -drawWidth/2, 
        -drawHeight/2, 
        drawWidth, 
        drawHeight
      );
    } else {
      // Fallback para desenho original
      if (powerup.type === POWERUP_TYPES.MAGNET) { // Imã
        // Desenha imã
        ctx.fillStyle = '#1e90ff';
        ctx.beginPath();
        ctx.arc(0, 0, powerup.w/2.5, 0, 2 * Math.PI);
        ctx.fill();
        
        // Ferradura do imã
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(0, -powerup.h/8, powerup.w/4, Math.PI, 0, true);
        ctx.fill();
        
        // Polos do imã
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-powerup.w/4, -powerup.h/5, powerup.w/10, powerup.h/3.5);
        ctx.fillRect(powerup.w/4 - powerup.w/10, -powerup.h/5, powerup.w/10, powerup.h/3.5);
      } else { // Escudo
        // Desenha escudo
        ctx.fillStyle = '#9370db';
        ctx.beginPath();
        ctx.arc(0, 0, powerup.w/2.5, 0, 2 * Math.PI);
        ctx.fill();
        
        // Desenho do escudo
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, powerup.w/4, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Detalhes do escudo
        ctx.beginPath();
        ctx.moveTo(0, -powerup.h/5);
        ctx.lineTo(0, powerup.h/5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-powerup.w/5, 0);
        ctx.lineTo(powerup.w/5, 0);
        ctx.stroke();
      }
    }
    
    // Efeito brilhante
    ctx.shadowColor = powerup.type === POWERUP_TYPES.MAGNET ? "#1e90ff" : "#9370db";
    ctx.shadowBlur = 10;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, powerup.w/2.5, 0, 2 * Math.PI);
    ctx.stroke();
    
    ctx.restore();
  },
  
  // Desenhar todos os itens de poder
  draw(ctx) {
    for (let p of this.powerups) {
      this.drawPowerup(ctx, p);
    }
  }
};
