/**
 * Interface de usuário do jogo
 */

const UIManager = {  // Atualizar o contador de pontuação
  updateScore() {
    document.getElementById('score').innerText = "Conchas: " + Game.score;
  },
  
  // Atualizar o contador da carteira
  async updateWallet() {
    try {
      const walletShells = await DatabaseManager.getWalletShells();
      const walletElement = document.getElementById('wallet-value');
      if (walletElement) {
        walletElement.textContent = walletShells;
      }
    } catch (error) {
      console.error('Error updating wallet display:', error);
      // Fallback para localStorage
      const fallbackShells = localStorage.getItem('walletShells') || '0';
      const walletElement = document.getElementById('wallet-value');
      if (walletElement) {
        walletElement.textContent = fallbackShells;
      }
    }
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
  },  // Mostrar a tela de game over
  async showGameOver(message) {
    const currentScore = Game.score;
    let bestScore = 0;
    let isNewRecord = false;
    
    try {
      bestScore = await DatabaseManager.getBestScore();
      console.log('Current best score:', bestScore, 'Current game score:', currentScore);
      
      // Verificar se é um novo recorde
      if (currentScore > bestScore) {
        isNewRecord = true;
        await DatabaseManager.saveBestScore(currentScore);
        console.log('New record saved:', currentScore);
        // Atualizar o best score na tela inicial também
        await this.updateBestScoreDisplay();
      }
      
      // Adicionar conchinhas coletadas à carteira
      if (currentScore > 0) {
        const newWalletTotal = await DatabaseManager.addToWallet(currentScore);        console.log('Added', currentScore, 'shells to wallet. New total:', newWalletTotal);
        // Atualizar a exibição da carteira
        await this.updateWallet();
        await this.updateWalletDisplay();
      }
      
    } catch (error) {
      console.error('Error checking/saving best score:', error);
      // Fallback para localStorage
      const fallbackBestScore = parseInt(localStorage.getItem('bestScore') || '0');
      if (currentScore > fallbackBestScore) {
        isNewRecord = true;
        localStorage.setItem('bestScore', currentScore.toString());
        await this.updateBestScoreDisplay();
      }
      
      // Fallback para carteira
      if (currentScore > 0) {        const currentWallet = parseInt(localStorage.getItem('walletShells') || '0');
        localStorage.setItem('walletShells', (currentWallet + currentScore).toString());
        await this.updateWallet();
        await this.updateWalletDisplay();
      }
    }
    
    document.getElementById('finalmsg').innerText =
      (message ? message+"\n":"") + `Você coletou ${Game.score} conchinha${Game.score==1?'':'s'}!` +
      (currentScore > 0 ? `\n+${currentScore} conchinhas adicionadas à carteira!` : '');
    
    // Mostrar indicador de novo recorde se aplicável
    const newRecordElement = document.getElementById('new-record');
    if (newRecordElement) {
      if (isNewRecord) {
        newRecordElement.style.display = 'block';
        newRecordElement.style.animation = 'pulse 1s infinite';
      } else {
        newRecordElement.style.display = 'none';
      }
    }
    
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
  async init() {
    // Configurar eventos de UI - usando funções de seta para preservar o contexto 'this'
    document.getElementById('restart-btn').addEventListener('click', () => Game.restart());
    document.getElementById('start-btn').addEventListener('click', () => Game.startFromMenu());
    document.getElementById('shop-btn').addEventListener('click', () => this.showShop());
    document.getElementById('back-to-menu-btn').addEventListener('click', () => this.hideShop());
    
    // Configurar eventos da loja
    document.getElementById('buy-luck').addEventListener('click', () => this.buyItem('luck', 100));
    document.getElementById('buy-energy').addEventListener('click', () => this.buyItem('energy', 150));
    document.getElementById('buy-shield').addEventListener('click', () => this.buyItem('shield', 200));
    
    // Inicializar a animação do personagem na tela inicial
    this.preloadCharacterAnimation();
    
    // Carregar e exibir o best score
    await this.updateBestScoreDisplay();
    
    // Carregar e exibir a carteira
    await this.updateWallet();
    
    // Atualizar carteira na tela inicial
    await this.updateWalletDisplay();
  },
    // Atualizar a exibição do melhor score
  async updateBestScoreDisplay() {
    try {
      const bestScore = await DatabaseManager.getBestScore();
      const bestScoreElement = document.getElementById('best-score-value');
      if (bestScoreElement) {
        bestScoreElement.textContent = bestScore;
      }
      console.log('Best score display updated:', bestScore);
    } catch (error) {
      console.error('Error updating best score display:', error);
      // Fallback para localStorage se houver erro
      const fallbackScore = localStorage.getItem('bestScore') || '0';
      const bestScoreElement = document.getElementById('best-score-value');
      if (bestScoreElement) {
        bestScoreElement.textContent = fallbackScore;
      }
      console.log('Using fallback score:', fallbackScore);
    }
  },
  
  // Atualizar a exibição da carteira na tela inicial
  async updateWalletDisplay() {
    try {
      const walletShells = await DatabaseManager.getWalletShells();
      const walletDisplayElement = document.getElementById('wallet-display-value');
      if (walletDisplayElement) {
        walletDisplayElement.textContent = walletShells;
      }
      
      // Também atualizar na loja se estiver visível
      const shopWalletElement = document.getElementById('shop-wallet-value');
      if (shopWalletElement) {
        shopWalletElement.textContent = walletShells;
      }
      
      // Atualizar botões da loja baseado na quantidade de conchinhas
      this.updateShopButtons(walletShells);
      
    } catch (error) {
      console.error('Error updating wallet display:', error);
      const fallbackShells = localStorage.getItem('walletShells') || '0';
      const walletDisplayElement = document.getElementById('wallet-display-value');
      if (walletDisplayElement) {
        walletDisplayElement.textContent = fallbackShells;
      }
    }
  },
  
  // Mostrar a loja
  async showShop() {
    document.getElementById('startscreen').style.display = 'none';
    document.getElementById('shop-screen').style.display = 'flex';
    await this.updateWalletDisplay();
  },
  
  // Esconder a loja
  hideShop() {
    document.getElementById('shop-screen').style.display = 'none';
    document.getElementById('startscreen').style.display = 'flex';
  },
  
  // Atualizar botões da loja baseado na quantidade de conchinhas
  updateShopButtons(walletAmount) {
    const luckBtn = document.getElementById('buy-luck');
    const energyBtn = document.getElementById('buy-energy');
    const shieldBtn = document.getElementById('buy-shield');
    
    // Desabilitar botões se não tiver conchinhas suficientes
    luckBtn.disabled = walletAmount < 100;
    energyBtn.disabled = walletAmount < 150;
    shieldBtn.disabled = walletAmount < 200;
    
    // Mudar texto se já comprado (implementar depois se necessário)
    // Por enquanto, permitir compras múltiplas
  },
  
  // Comprar item da loja
  async buyItem(itemType, price) {
    try {
      const currentWallet = await DatabaseManager.getWalletShells();
      
      if (currentWallet < price) {
        alert('Conchinhas insuficientes! 🐚');
        return;
      }
      
      // Gastar conchinhas
      await DatabaseManager.spendFromWallet(price);
      
      // Aplicar efeito do item (implementar depois)
      this.applyItemEffect(itemType);
      
      // Atualizar displays
      await this.updateWalletDisplay();
      await this.updateWallet();
      
      // Mostrar confirmação
      const itemNames = {
        luck: 'Trevo da Sorte 🍀',
        energy: 'Energia Extra ⚡',
        shield: 'Escudo Inicial 🛡️'
      };
      
      alert(`${itemNames[itemType]} comprado com sucesso!`);
      
    } catch (error) {
      console.error('Error buying item:', error);
      alert('Erro ao comprar item. Tente novamente.');
    }
  },
  
  // Aplicar efeito do item comprado
  applyItemEffect(itemType) {
    // Salvar no localStorage por enquanto (pode ser movido para database depois)
    const currentEffects = JSON.parse(localStorage.getItem('purchasedEffects') || '{}');
    
    switch(itemType) {
      case 'luck':
        currentEffects.luck = (currentEffects.luck || 0) + 1;
        break;
      case 'energy':
        currentEffects.energy = (currentEffects.energy || 0) + 1;
        break;
      case 'shield':
        currentEffects.shield = (currentEffects.shield || 0) + 1;
        break;
    }
    
    localStorage.setItem('purchasedEffects', JSON.stringify(currentEffects));
    console.log('Applied effect:', itemType, 'Current effects:', currentEffects);
  }
};
