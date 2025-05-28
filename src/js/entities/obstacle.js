/**
 * Classe para gerenciar os obstáculos (pedras)
 */

const ObstacleManager = {
  // Array de obstáculos
  obstacles: [],
  lastObstacleX: 0, // Rastrear a posição do último obstáculo
  
  // Sprites dos obstáculos
  obstacleSprites: [],
  
  // Inicializar o gerenciador
  init() {
    this.obstacles = [];
    this.lastObstacleX = 0;
    this.loadSprites();
    this.spawnObstacle();
  },
  
  // Carregar sprites dos obstáculos
  loadSprites() {
    this.obstacleSprites = [];
    const totalSprites = 5; // Temos 5 sprites de obstáculos (1.png a 5.png)
    
    for (let i = 1; i <= totalSprites; i++) {
      const img = new Image();
      img.src = `sprites/obstacles/${i}.png`;
      img.onload = () => {
        this.obstacleSprites[i-1] = img;
      };
      img.onerror = () => {
        console.error(`Failed to load obstacle sprite ${i}`);
      };
    }
  },
  
  // Criar um novo obstáculo
  spawnObstacle() {
    const interval = Math.random() * (canvasUtils.w() * OBSTACLE_FREQUENCY_MAX) + canvasUtils.w() * OBSTACLE_FREQUENCY_MIN;
    setTimeout(() => {
      if (!Game.gameover && isLandscape()) {
        // Verificar se há espaço suficiente para um novo obstáculo
        const minSpaceBetweenObstacles = canvasUtils.w() * 0.5; // Espaço mínimo de 50% da largura da tela
        
        // Se não houver obstáculos ou o último obstáculo já estiver suficientemente distante
        if (this.obstacles.length === 0 || 
            (this.lastObstacleX - (canvasUtils.w() + canvasUtils.OBSTACLE_W())) < -minSpaceBetweenObstacles) {
            // Criar novo obstáculo
          const newObstacle = {
            x: canvasUtils.w() + canvasUtils.OBSTACLE_W(),
            y: canvasUtils.GROUND_Y() - canvasUtils.OBSTACLE_H() + 8,
            w: canvasUtils.OBSTACLE_W(),
            h: canvasUtils.OBSTACLE_H(),
            spriteIndex: Math.floor(Math.random() * 5) // Escolher aleatoriamente entre os 5 sprites (0-4)
          };
          
          this.obstacles.push(newObstacle);
          this.lastObstacleX = newObstacle.x; // Atualizar a posição do último obstáculo
        }
        
        // Programar próxima verificação
        this.spawnObstacle();
      }
    }, interval / Game.speed * 13);
  },
  
  // Atualizar os obstáculos
  update() {
    // Mover os obstáculos
    for (let o of this.obstacles) {
      o.x -= Game.speed;
    }
    
    // Remover obstáculos que saíram da tela
    this.obstacles = this.obstacles.filter(o => {
      // Manter apenas obstáculos visíveis na tela
      const isVisible = o.x + o.w > 0;
      // Quando um obstáculo sai da tela, atualizar a variável lastObstacleX
      if (!isVisible && this.lastObstacleX === o.x) {
        this.lastObstacleX = 0; // Resetar o valor para permitir novos obstáculos
      }
      return isVisible;
    });
  },
  
  // Verificar colisões com a menina
  checkCollisions() {
    for (let i = 0; i < this.obstacles.length; i++) {
      let obs = this.obstacles[i];
      if (rectsCollide(Girl, obs)) {
        // Se o escudo estiver ativo, não há colisão com obstáculos
        if (!Game.shieldActive) {
          Game.gameOver("Você tropeçou em uma pedra!");
          return true;
        }
      }
    }
    return false;
  },
    // Desenhar um obstáculo
  drawObstacle(ctx, obs) {
    ctx.save();
    ctx.translate(obs.x + obs.w/2, obs.y + obs.h/2);
    
    // Usar sprite se carregado e índice válido, senão usar desenho original
    if (this.obstacleSprites.length > 0 && 
        obs.spriteIndex !== undefined && 
        obs.spriteIndex < this.obstacleSprites.length &&
        this.obstacleSprites[obs.spriteIndex] && 
        this.obstacleSprites[obs.spriteIndex].complete) {
      
      const sprite = this.obstacleSprites[obs.spriteIndex];
      const drawWidth = obs.w * 1.5;
      const drawHeight = obs.h * 1.5;
      ctx.drawImage(
        sprite, 
        -drawWidth/2, 
        -drawHeight/2, 
        drawWidth, 
        drawHeight
      );
    } else {
      // Fallback para desenho original
      ctx.beginPath();
      ctx.ellipse(0, obs.h/5, obs.w/2, obs.h/2.2, 0, 0, 2 * Math.PI);
      ctx.fillStyle = '#888';
      ctx.shadowColor = "#222";
      ctx.shadowBlur = 4;
      ctx.fill();
    }
    
    ctx.restore();
  },
  
  // Desenhar todos os obstáculos
  draw(ctx) {
    for (let o of this.obstacles) {
      this.drawObstacle(ctx, o);
    }
  }
};
