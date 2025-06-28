/**
 * Sistema de renderização do jogo
 */

const Renderer = {
  // Canvas e contexto
  canvas: document.getElementById('game'),
  ctx: document.getElementById('game').getContext('2d'),
  
  // Propriedades de cenário
  bgOffset: 0,
  stars: [],
  
  // Inicializar o renderer
  init() {
    this.bgOffset = 0;
    this.initStars();
  },
  
  // Inicializar estrelas para o modo noturno
  initStars() {
    this.stars = [];
    for (let i = 0; i < 30; i++) {
      this.stars.push({
        x: Math.random() * canvasUtils.w(),
        y: Math.random() * canvasUtils.GROUND_Y() * 0.8,
        size: Math.random() * 1.5 + 0.5 // Estrelas menores
      });
    }
  },
  
  // Desenhar o cenário da praia
  drawBeach() {
    // Cores para o modo dia/noite
    let skyColor = Game.isNightMode ? '#1a1a3a' : '#87ceeb'; // Azul escuro à noite, azul claro de dia
    let seaColor = Game.isNightMode ? '#0a3a70' : '#1e90ff'; // Azul marinho à noite, azul normal de dia
    let sandColor = Game.isNightMode ? '#d4af37' : '#ffdb58'; // Areia mais escura à noite
    let lineColor = Game.isNightMode ? '#bb9930' : '#edd382'; // Linhas mais escuras à noite
    
    // Desenhar céu
    this.ctx.fillStyle = skyColor;
    this.ctx.fillRect(0, 0, canvasUtils.w(), canvasUtils.h());
    
    // Desenhar mar
    this.ctx.fillStyle = seaColor;
    this.ctx.fillRect(0, canvasUtils.GROUND_Y() - canvasUtils.h()*0.06, canvasUtils.w(), canvasUtils.h()*0.13);
    
    // Desenhar areia
    this.ctx.fillStyle = sandColor;
    this.ctx.fillRect(0, canvasUtils.GROUND_Y(), canvasUtils.w(), canvasUtils.h() - canvasUtils.GROUND_Y());
    
    // Desenhar linhas na areia
    this.ctx.strokeStyle = lineColor;
    this.ctx.lineWidth = 4;
    
    for (let i = 0; i < 9; i++) {
      let lx = ((this.bgOffset + i*200) % canvasUtils.w());
      this.ctx.beginPath();
      this.ctx.moveTo(lx, canvasUtils.GROUND_Y() + canvasUtils.h()*0.03);
      this.ctx.lineTo(lx + 70, canvasUtils.h());
      this.ctx.stroke();
    }
    
    // Adicionar elementos noturnos ou diurnos
    if (Game.isNightMode) {
      // Adicionar estrelas à noite usando o array de estrelas fixas
      for (let i = 0; i < this.stars.length; i++) {
        let star = this.stars[i];
        
        // Estrela simples sem brilho
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.size, 0, Math.PI*2);
        this.ctx.fill();
      }
      
      // Adicionar lua
      this.ctx.fillStyle = '#f5f5f5';
      this.ctx.beginPath();
      this.ctx.arc(canvasUtils.w() * 0.85, canvasUtils.h() * 0.2, canvasUtils.w() * 0.06, 0, Math.PI*2);
      this.ctx.fill();
      
      // Sombra na lua
      this.ctx.fillStyle = '#1a1a3a';
      this.ctx.beginPath();
      this.ctx.arc(canvasUtils.w() * 0.83, canvasUtils.h() * 0.18, canvasUtils.w() * 0.05, 0, Math.PI*2);
      this.ctx.fill();
    } else {
      // Adicionar sol
      let sunGradient = this.ctx.createRadialGradient(
        canvasUtils.w() * 0.85, canvasUtils.h() * 0.2, 0,
        canvasUtils.w() * 0.85, canvasUtils.h() * 0.2, canvasUtils.w() * 0.08
      );
      sunGradient.addColorStop(0, '#ffff00');
      sunGradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
      
      this.ctx.fillStyle = sunGradient;
      this.ctx.beginPath();
      this.ctx.arc(canvasUtils.w() * 0.85, canvasUtils.h() * 0.2, canvasUtils.w() * 0.08, 0, Math.PI*2);
      this.ctx.fill();
      
      this.ctx.fillStyle = '#ffff00';
      this.ctx.beginPath();
      this.ctx.arc(canvasUtils.w() * 0.85, canvasUtils.h() * 0.2, canvasUtils.w() * 0.05, 0, Math.PI*2);
      this.ctx.fill();
    }
  },
  
  // Limpar a tela
  clear() {
    this.ctx.clearRect(0, 0, canvasUtils.w(), canvasUtils.h());
  },
  
  // Atualizar o offset do fundo
  updateBackground() {
    this.bgOffset -= Game.speed * 2;
    if (this.bgOffset < -canvasUtils.w()) this.bgOffset += canvasUtils.w();
  },
  
  // Renderizar um frame do jogo
  render() {
    this.clear();
    this.updateBackground();
    this.drawBeach();
    
    // Desenhar entidades
    ShellManager.draw(this.ctx);
    ObstacleManager.draw(this.ctx);
    PowerupManager.draw(this.ctx);
    Girl.draw(this.ctx);
    Jacare.draw(this.ctx);
    
    // Desenhar UI
    UIManager.drawPowerIndicators(this.ctx);
  }
};
