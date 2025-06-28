/**
 * Classe para o inimigo (jacaré)
 */

const Jacare = {
  // Propriedades do jacaré
  x: 0,
  y: 0,
  w: 0,
  h: 0,
  
  // Sprites para animação
  sprites: [],
  currentSpriteIndex: 0,
  lastSpriteUpdateTime: 0,
  
  // Inicializar o jacaré
  init() {
    this.x = canvasUtils.w() * 0.03; // Posição inicial mais à esquerda
    this.y = canvasUtils.GROUND_Y() - canvasUtils.JACARE_H() + 5; // Ajustado para compensar a altura menor
    this.w = canvasUtils.JACARE_W();
    this.h = canvasUtils.JACARE_H();
    
    this.currentSpriteIndex = 0;
    this.lastSpriteUpdateTime = Date.now();
    
    this.loadSprites();
  },
  
  // Carregar sprites do jacaré
  loadSprites() {
    this.sprites = [];
    const totalSprites = 8;
    
    for (let i = 1; i <= totalSprites; i++) {
      const img = new Image();
      img.src = `sprites/aligator-runn/${i}.png`;
      img.onload = () => {
        this.sprites[i-1] = img;
      };
      img.onerror = () => {
        console.error(`Failed to load jacare sprite ${i}`);
      };
    }
  },
  
  // Atualizar o jacaré
  update(girlX) {
    // Jacaré persegue a menina, mas fica mais afastado
    let dist = girlX - this.x - this.w * 0.2;
    let minDist = canvasUtils.GIRL_W() * 2.5; // Aumentando a distância mínima para 2.5x a largura da menina
    if (dist > minDist) {
      this.x += Math.min(Game.speed * 0.75, dist * 0.05); // Velocidade de perseguição mais lenta
    }
    
    // Atualizar animação
    const currentTime = Date.now();
    let spriteInterval = JACARE_SPRITE_UPDATE_INTERVAL_BASE - (Game.speed * 10);
    if (spriteInterval < 100) spriteInterval = 100;
    
    if (currentTime - this.lastSpriteUpdateTime > spriteInterval) {
      this.currentSpriteIndex = (this.currentSpriteIndex + 1) % this.sprites.length;
      this.lastSpriteUpdateTime = currentTime;
    }
  },
  
  // Desenhar o jacaré
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x + this.w/2, this.y + this.h/2);
    
    // Desenhar sprite do jacaré se estiver carregado
    if (this.sprites.length > 0 && this.sprites[this.currentSpriteIndex]) {
      const sprite = this.sprites[this.currentSpriteIndex];
      // Ajustar o tamanho para manter a proporção da imagem
      const spriteRatio = sprite.height / sprite.width;
      const drawWidth = this.w * 1.3;
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
      // Não desenha nada se o sprite não carregar (jacaré "invisível")
    }
    
    ctx.restore();
  }
};
