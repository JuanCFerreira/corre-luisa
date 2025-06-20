/**
 * Classe para gerenciar as conchas (coletáveis)
 */

const ShellManager = {
  // Array de conchas
  shells: [],
  
  // Sprite da concha
  shellSprite: null,
  
  // Inicializar o gerenciador
  init() {
    this.shells = [];
    this.loadSprite();
    this.spawnShell();
  },
  
  // Carregar sprite da concha
  loadSprite() {
    this.shellSprite = new Image();
    this.shellSprite.src = 'sprites/coins/1.png';
    this.shellSprite.onerror = () => {
      console.error('Failed to load shell sprite');
    };
  },
    // Criar uma nova concha
  spawnShell() {
    const interval = Math.random() * (canvasUtils.w() * SHELL_FREQUENCY_MAX) + canvasUtils.w() * SHELL_FREQUENCY_MIN;
    setTimeout(() => {
      if (!Game.gameover && isLandscape()) {
        // Chance de criar um padrão especial de conchas (aproximadamente 20% de chance)
        if (Math.random() < 0.2) {
          this.createShellPattern();
        } else {
          // Concha individual normal
          this.shells.push({
            x: canvasUtils.w() + canvasUtils.SHELL_SIZE(),
            y: canvasUtils.GROUND_Y() - canvasUtils.SHELL_SIZE() - Math.random() * (canvasUtils.h() * 0.15),
            w: canvasUtils.SHELL_SIZE(),
            h: canvasUtils.SHELL_SIZE(),            // Propriedades para animação
            baseY: 0, // Será definida após criação
            bounceOffset: 0,
            rotationOffset: 0, // Para o movimento de dança
            rotationAmplitude: 0.1 + Math.random() * 0.15, // Amplitude da rotação reduzida (radianos) - entre 0.1 e 0.25
            animationSpeed: 0.05 + Math.random() * 0.03, // Velocidade da animação (variação entre conchas)
            bounceAmplitude: 3 + Math.random() * 4 // Amplitude do movimento vertical
          });
          // Definir a posição Y base para a animação
          this.shells[this.shells.length - 1].baseY = this.shells[this.shells.length - 1].y;
        }
        this.spawnShell();
      }
    }, interval / Game.speed * 16);
  },
  
  // Criar padrões especiais de conchas
  createShellPattern() {
    // Escolher aleatoriamente entre diferentes padrões
    const patternType = Math.floor(Math.random() * 6); // 0-5 para diferentes padrões
    
    switch(patternType) {
      case 0:
        this.createStraightLinePattern(); // Linha reta horizontal
        break;
      case 1:
        this.createArcPattern(); // Arco de conchas
        break;
      case 2:
        this.createZigZagPattern(); // Padrão em zig-zag
        break;
      case 3:
        this.createDiagonalLinePattern(); // Linha diagonal
        break;
      case 4:
        this.createInvertedArcPattern(); // Arco invertido de conchas
        break;
      case 5:
        this.createLuisaTextPattern(); // Texto "LUISA" com conchas
        break;
    }
  },
    // Criar padrão de linha reta com conchas
  createStraightLinePattern() {
    const shellCount = 5 + Math.floor(Math.random() * 3); // 5 a 7 conchas
    const baseY = canvasUtils.GROUND_Y() - canvasUtils.SHELL_SIZE() - Math.random() * (canvasUtils.h() * 0.15);
    const spacing = canvasUtils.SHELL_SIZE() * 1.3; // Espaço entre as conchas
    
    for (let i = 0; i < shellCount; i++) {
      this.shells.push({
        x: canvasUtils.w() + canvasUtils.SHELL_SIZE() + (spacing * i),
        y: baseY,
        w: canvasUtils.SHELL_SIZE(),
        h: canvasUtils.SHELL_SIZE(),        // Propriedades para animação
        baseY: baseY,
        bounceOffset: 0,
        rotationOffset: 0,
        rotationAmplitude: 0.1 + Math.random() * 0.15,
        animationSpeed: 0.05 + Math.random() * 0.03,
        bounceAmplitude: 3 + Math.random() * 4
      });
    }
  },
    // Criar padrão de arco com conchas
  createArcPattern() {
    const shellCount = 5 + Math.floor(Math.random() * 4); // 5 a 8 conchas
    const baseX = canvasUtils.w() + canvasUtils.SHELL_SIZE();
    const radius = canvasUtils.h() * 0.15; // Raio do arco
    const centerY = canvasUtils.GROUND_Y() - canvasUtils.SHELL_SIZE() - radius - Math.random() * (canvasUtils.h() * 0.05);
    
    for (let i = 0; i < shellCount; i++) {
      // Calcular posição em um arco semicircular
      const angle = Math.PI * (i / (shellCount - 1)); // De 0 a PI (semicírculo)      const shellY = centerY + Math.sin(angle) * radius;
      this.shells.push({
        x: baseX + Math.cos(angle) * radius,
        y: shellY,        w: canvasUtils.SHELL_SIZE(),
        h: canvasUtils.SHELL_SIZE(),
        // Propriedades para animação
        baseY: shellY,
        bounceOffset: 0,
        rotationOffset: 0,
        rotationAmplitude: 0.1 + Math.random() * 0.15,
        animationSpeed: 0.05 + Math.random() * 0.03,
        bounceAmplitude: 3 + Math.random() * 4
      });
    }
  },

  // Criar padrão de arco invertido com conchas
  createInvertedArcPattern() {
    const shellCount = 5 + Math.floor(Math.random() * 4); // 5 a 8 conchas
    const baseX = canvasUtils.w() + canvasUtils.SHELL_SIZE();
    const radius = canvasUtils.h() * 0.15; // Raio do arco
    const centerY = canvasUtils.GROUND_Y() - canvasUtils.SHELL_SIZE() - Math.random() * (canvasUtils.h() * 0.05); // Posição base mais baixa
    
    for (let i = 0; i < shellCount; i++) {
      // Calcular posição em um arco semicircular invertido
      const angle = Math.PI * (i / (shellCount - 1)); // De 0 a PI (semicírculo)      const shellY = centerY - Math.sin(angle) * radius; // Invertendo o sinal para criar o arco invertido
      this.shells.push({
        x: baseX + Math.cos(angle) * radius,
        y: shellY,
        w: canvasUtils.SHELL_SIZE(),
        h: canvasUtils.SHELL_SIZE(),        // Propriedades para animação
        baseY: shellY,
        bounceOffset: 0,
        rotationOffset: 0,
        rotationAmplitude: 0.1 + Math.random() * 0.15,
        animationSpeed: 0.05 + Math.random() * 0.03,
        bounceAmplitude: 3 + Math.random() * 4
      });
    }
  },
  
  // Criar padrão de texto "LUISA" com conchas
  createLuisaTextPattern() {
    const baseX = canvasUtils.w() + canvasUtils.SHELL_SIZE();
    const baseY = canvasUtils.GROUND_Y() - canvasUtils.SHELL_SIZE() * 5 - Math.random() * (canvasUtils.h() * 0.1); // Posição mais alta para o texto
    const letterSpacing = canvasUtils.SHELL_SIZE() * 1.2; // Espaçamento entre letras
    const dotSpacing = canvasUtils.SHELL_SIZE() * 0.8; // Espaçamento entre pontos de cada letra
    
    // Definir pontos para formar cada letra de "LUISA"
    // Letra L
    const L = [
      {x: 0, y: 0}, // topo
      {x: 0, y: 1}, // meio
      {x: 0, y: 2}, // base
      {x: 1, y: 2}, // base direita
      {x: 2, y: 2}  // base direita mais
    ];
    
    // Letra U
    const U = [
      {x: 0, y: 0}, // topo esquerdo
      {x: 0, y: 1}, // meio esquerdo
      {x: 0, y: 2}, // base esquerdo
      {x: 1, y: 2}, // base meio
      {x: 2, y: 0}, // topo direito
      {x: 2, y: 1}, // meio direito
      {x: 2, y: 2}  // base direito
    ];
      // Função para criar pontos de uma letra
    const createLetterPoints = (letter, offsetX) => {
      for (let i = 0; i < letter.length; i++) {
        const point = letter[i];        const shellY = baseY + point.y * dotSpacing;
        this.shells.push({
          x: baseX + offsetX + point.x * dotSpacing,
          y: shellY,
          w: canvasUtils.SHELL_SIZE(),
          h: canvasUtils.SHELL_SIZE(),          // Propriedades para animação
          baseY: shellY,
          bounceOffset: 0,
          rotationOffset: 0,
          rotationAmplitude: 0.1 + Math.random() * 0.15,
          animationSpeed: 0.05 + Math.random() * 0.03,
          bounceAmplitude: 3 + Math.random() * 4
        });
      }
    };
    
    // Criar pontos para formar "LU"
    createLetterPoints(L, 0);
    createLetterPoints(U, 3 * letterSpacing);
  },
    // Criar padrão em zig-zag
  createZigZagPattern() {
    const shellCount = 6 + Math.floor(Math.random() * 3); // 6 a 8 conchas
    const baseY = canvasUtils.GROUND_Y() - canvasUtils.SHELL_SIZE() - (canvasUtils.h() * 0.1);
    const spacing = canvasUtils.SHELL_SIZE() * 1.3; // Espaço horizontal entre as conchas
    const verticalOffset = canvasUtils.SHELL_SIZE() * 1.5; // Quantidade de deslocamento vertical
    
    for (let i = 0; i < shellCount; i++) {      const shellY = baseY + ((i % 2 === 0) ? 0 : -verticalOffset); // Alterna entre duas alturas
      this.shells.push({
        x: canvasUtils.w() + canvasUtils.SHELL_SIZE() + (spacing * i),
        y: shellY,
        w: canvasUtils.SHELL_SIZE(),
        h: canvasUtils.SHELL_SIZE(),        // Propriedades para animação
        baseY: shellY,
        bounceOffset: 0,
        rotationOffset: 0,
        rotationAmplitude: 0.1 + Math.random() * 0.15,
        animationSpeed: 0.05 + Math.random() * 0.03,
        bounceAmplitude: 3 + Math.random() * 4
      });
    }
  },

  // Criar padrão de linha diagonal
  createDiagonalLinePattern() {
    const shellCount = 5 + Math.floor(Math.random() * 3); // 5 a 7 conchas
    const startY = canvasUtils.GROUND_Y() - canvasUtils.SHELL_SIZE() - (canvasUtils.h() * 0.05);
    const spacing = canvasUtils.SHELL_SIZE() * 1.3; // Espaço horizontal entre as conchas
    const slope = canvasUtils.SHELL_SIZE() * 1.2; // Inclinação da diagonal
    
    for (let i = 0; i < shellCount; i++) {      const shellY = startY - (slope * i); // Subindo diagonalmente
      this.shells.push({
        x: canvasUtils.w() + canvasUtils.SHELL_SIZE() + (spacing * i),
        y: shellY,
        w: canvasUtils.SHELL_SIZE(),
        h: canvasUtils.SHELL_SIZE(),        // Propriedades para animação
        baseY: shellY,
        bounceOffset: 0,
        rotationOffset: 0,
        rotationAmplitude: 0.1 + Math.random() * 0.15,
        animationSpeed: 0.05 + Math.random() * 0.03,
        bounceAmplitude: 3 + Math.random() * 4
      });
    }
  },

  // Atualizar as conchas
  update() {
    // Mover as conchas e atualizar animações
    for (let s of this.shells) {
      s.x -= Game.speed;
      
      // Atualizar animação de bounce (movimento vertical suave)
      s.bounceOffset += s.animationSpeed;
      s.y = s.baseY + Math.sin(s.bounceOffset) * s.bounceAmplitude;
      
      // Atualizar movimento de dança (oscilação de rotação)
      s.rotationOffset += s.animationSpeed * 1.2; // Velocidade ligeiramente diferente para variação
      s.rotation = Math.sin(s.rotationOffset) * s.rotationAmplitude; // Oscila entre -amplitude e +amplitude
    }
    
    // Remover conchas que saíram da tela
    this.shells = this.shells.filter(s => s.x + s.w > 0);
    
    // Efeito do imã de conchas
    if (Game.magnetActive) {
      for (let s of this.shells) {
        // Calcular distância entre a menina e a concha
        const dx = (Girl.x + Girl.w/2) - (s.x + s.w/2);
        const dy = (Girl.y + Girl.h/2) - (s.y + s.h/2);
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        // Se a concha estiver próxima, atraí-la para a menina
        if (distance < canvasUtils.w() * 0.3) { // Distância de atração: 30% da largura da tela
          s.x += dx * 0.07; // Velocidade de atração
          s.y += dy * 0.07;
          // Atualizar posição base para manter a animação suave durante a atração
          s.baseY += dy * 0.07;
        }
      }
    }
  },
  
  // Verificar colisões com a menina
  checkCollisions() {
    for (let i = this.shells.length-1; i >= 0; i--) {
      let s = this.shells[i];
      if (rectsCollide(Girl, s)) {
        this.shells.splice(i, 1);
        Game.score++;
        document.getElementById('score').innerText = "Conchas: " + Game.score;
        
        // Tocar som de concha
        AudioManager.playSound('coinSound');
        
        // Alternar entre dia e noite a cada 50 conchas
        if (Game.score % 50 === 0) {
          Game.toggleDayNight();
        }
        
        // Aumentar velocidade até o limite máximo
        Game.increaseSpeed();
      }
    }
  },    // Desenhar uma concha
  drawShell(ctx, shell) {
    ctx.save();
    ctx.translate(shell.x + shell.w/2, shell.y + shell.h/2);
    
    // Aplicar rotação suave
    ctx.rotate(shell.rotation);
    
    // Usar sprite se carregado, senão usar desenho original
    if (this.shellSprite && this.shellSprite.complete) {
      const drawWidth = shell.w * 1;
      const drawHeight = shell.h * 1;
      ctx.drawImage(
        this.shellSprite, 
        -drawWidth/2, 
        -drawHeight/2, 
        drawWidth, 
        drawHeight
      );
    } else {
      // Fallback para o desenho original
      ctx.beginPath();
      ctx.arc(0, 0, shell.w/2.3, 0, Math.PI, true);
      ctx.lineTo(-shell.w/2.3, shell.h/2.7);
      ctx.quadraticCurveTo(0, shell.h/1.7, shell.w/2.3, shell.h/2.7);
      ctx.closePath();
      ctx.fillStyle = '#ffb347';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, shell.h/2.7);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-shell.w/6, 0);
      ctx.lineTo(-shell.w/9, shell.h/2.7);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(shell.w/6, 0);
      ctx.lineTo(shell.w/9, shell.h/2.7);
      ctx.stroke();
    }
    
    ctx.restore();
  },
  
  // Desenhar todas as conchas
  draw(ctx) {
    for (let s of this.shells) {
      this.drawShell(ctx, s);
    }
  }
};
