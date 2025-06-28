/**
 * Classe para a personagem principal (Luisa)
 */

const Girl = {
  // Propriedades da personagem
  x: 0,
  y: 0,
  vy: 0,
  w: 0,
  h: 0,
  jumping: false,
  
  // Sprites para animação
  sprites: [],
  currentSpriteIndex: 0,
  lastSpriteUpdateTime: 0,
  
  // Inicializar a personagem
  init(x, y) {
    this.x = x;
    this.y = y;
    this.vy = 0;
    this.w = canvasUtils.GIRL_W();
    this.h = canvasUtils.GIRL_H();
    this.jumping = false;
    
    this.currentSpriteIndex = 0;
    this.lastSpriteUpdateTime = Date.now();
    
    this.loadSprites();
  },
  
  // Carregar sprites da Luisa
  loadSprites() {
    this.sprites = [];
    const totalSprites = 8;
    
    for (let i = 1; i <= totalSprites; i++) {
      const img = new Image();
      img.src = `sprites/luisa-runn/${i}.png`;
      img.onload = () => {
        this.sprites[i-1] = img;
      };
      img.onerror = () => {
        console.error(`Failed to load sprite ${i}`);
      };
    }
  },
  
  // Atualizar a personagem
  update() {
    // Física do pulo
    this.vy += canvasUtils.GRAVITY();
    this.y += this.vy;
    
    // Verificar colisão com o chão
    if (this.y + this.h >= canvasUtils.GROUND_Y()) {
      this.y = canvasUtils.GROUND_Y() - this.h;
      this.vy = 0;
      this.jumping = false;
    }
    
    // Atualizar animação
    const currentTime = Date.now();
    let spriteInterval = SPRITE_UPDATE_INTERVAL_BASE - (Game.speed * 10);
    if (spriteInterval < 80) spriteInterval = 80;
    
    if (currentTime - this.lastSpriteUpdateTime > spriteInterval) {
      // Avançar para o próximo sprite apenas se a personagem estiver no chão
      if (!this.jumping) {
        this.currentSpriteIndex = (this.currentSpriteIndex + 1) % this.sprites.length;
      } else {
        // Usar um sprite específico para o pulo (por exemplo, o sprite 3)
        this.currentSpriteIndex = 2; // Índice 2 corresponde ao 3.png (0-indexed array)
      }
      this.lastSpriteUpdateTime = currentTime;
    }
  },
  
  // Fazer a personagem pular
  jump() {
    if (!this.jumping && !Game.gameover && isLandscape()) {
      this.vy = canvasUtils.JUMP_VELOCITY();
      this.jumping = true;
      Game.started = true;
    }
  },
  
  // Verificar se a personagem tem o poder de imã ativo
  hasMagnet() {
    return Game.magnetActive;
  },
  
  // Verificar se a personagem tem o poder de escudo ativo
  hasShield() {
    return Game.shieldActive;
  },
  
  // Desenhar a personagem
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x + this.w/2, this.y + 30 + this.h/2);
    const jumpAmt = this.jumping ? 0.12 : 0;
    ctx.rotate(jumpAmt * Math.sin(Date.now()/110));
    
    // Efeito de escudo quando ativo
    if (this.hasShield()) {
      ctx.beginPath();
      ctx.arc(0, 0, this.w * 1.2, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(147, 112, 219, 0.3)';
      ctx.fill();
      
      // Borda animada do escudo
      ctx.strokeStyle = 'rgba(255, 255, 255, ' + (0.5 + Math.sin(Date.now()/150) * 0.5) + ')';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    
    // Efeito de imã quando ativo
    if (this.hasMagnet()) {
      ctx.beginPath();
      // Linhas onduladas ao redor da menina
      for (let i = 0; i < 360; i += 40) {
        const rad = i * Math.PI / 180;
        const wave = Math.sin(Date.now()/200 + i/20) * 5;
        const x1 = Math.cos(rad) * (this.w * 1.3);
        const y1 = Math.sin(rad) * (this.w * 1.3);
        const x2 = Math.cos(rad) * (this.w * 1.6 + wave);
        const y2 = Math.sin(rad) * (this.w * 1.6 + wave);
        
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
      }
      ctx.strokeStyle = 'rgba(30, 144, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // Desenhar sprite da Luisa se estiver carregado
    if (this.sprites.length > 0 && this.sprites[this.currentSpriteIndex]) {
      const sprite = this.sprites[this.currentSpriteIndex];
      // Ajustar o tamanho para manter a proporção da imagem
      const spriteRatio = sprite.height / sprite.width;
      const drawWidth = this.w * 1.5; // Um pouco maior que o retângulo original
      const drawHeight = drawWidth * spriteRatio;
      
      // Centralizar a imagem (considerando o ponto de origem no centro)
      ctx.drawImage(
        sprite, 
        -drawWidth/2, 
        -drawHeight/2, 
        drawWidth, 
        drawHeight
      );
    } else {
      // Fallback para o desenho original se os sprites não estiverem carregados
      ctx.fillStyle = '#ffb6c1';
      ctx.fillRect(-this.w/2, -this.h/2, this.w, this.h);
      ctx.beginPath();
      ctx.arc(0, -this.h/2.2, this.w/2.7, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffe4e1';
      ctx.fill();
      ctx.fillStyle = '#c66900';
      ctx.fillRect(-this.w/2, this.h/2 - 8, this.w*0.20, 10);
      ctx.fillRect(this.w/2 - this.w*0.20, this.h/2 - 8, this.w*0.20, 10);
      ctx.beginPath();
      ctx.moveTo(-this.w/2.5, -this.h/2.2);
      ctx.lineTo(-this.w/1.8, -this.h/1.8);
      ctx.lineTo(-this.w/4, -this.h/2.8);
      ctx.closePath();
      ctx.fillStyle = '#8b5c2d';
      ctx.fill();
    }
    
    ctx.restore();
  }
};
