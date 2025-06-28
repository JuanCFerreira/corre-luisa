/**
 * Interface de usuário do jogo
 */

const UIManager = {  // Atualizar o contador de pontuação
  updateScore() {
    document.getElementById('score').innerHTML = "<img width='30px' src='../sprites/coins/1.png'> " + Game.score;
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
      if (currentScore > bestScore) {
        isNewRecord = true;
        await DatabaseManager.saveBestScore(currentScore);
        await this.updateBestScoreDisplay();
      }
      if (currentScore > 0) {
        await DatabaseManager.addToWallet(currentScore);
        await this.updateWallet();
        await this.updateWalletDisplay();
      }
    } catch (error) {
      const fallbackBestScore = parseInt(localStorage.getItem('bestScore') || '0');
      if (currentScore > fallbackBestScore) {
        isNewRecord = true;
        localStorage.setItem('bestScore', currentScore.toString());
        await this.updateBestScoreDisplay();
      }
      if (currentScore > 0) {
        const currentWallet = parseInt(localStorage.getItem('walletShells') || '0');
        localStorage.setItem('walletShells', (currentWallet + currentScore).toString());
        await this.updateWallet();
        await this.updateWalletDisplay();
      }
    }
    // Proteção para evitar erro se elemento não existir
    const shellsElem = document.getElementById('gameover-shells');
    if (shellsElem) shellsElem.innerText = Game.score;
    const bestElem = document.getElementById('gameover-best');
    if (bestElem) bestElem.innerText = Math.max(currentScore, bestScore);
    // Oculta mensagem antiga, se existir
    const finalMsgElem = document.getElementById('finalmsg');
    if (finalMsgElem) finalMsgElem.innerText = '';
    // Indicador de novo recorde
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
    document.getElementById('start-btn').addEventListener('click', () => this.showPowerSelection());
    document.getElementById('shop-btn').addEventListener('click', () => this.showShop());
    document.getElementById('back-to-menu-btn').addEventListener('click', () => this.hideShop());
    // Novo: botão de voltar ao menu principal na tela de gameover
    const backToMainBtn = document.getElementById('back-to-main-btn');
    if (backToMainBtn) {
      backToMainBtn.addEventListener('click', () => {
        // Esconde gameover, mostra o menu principal (startscreen)
        document.getElementById('gameover').style.display = 'none';
        document.getElementById('startscreen').style.display = '';
        // Esconde o canvas e overlays do jogo
        // Opcional: resetar variáveis do jogo
        if (typeof Game.reset === 'function') Game.reset();
      });
    }
    // Configurar eventos da loja (novos itens)
    document.getElementById('buy-shield').addEventListener('click', () => this.buyItem('shield', 150));
    document.getElementById('buy-magnet').addEventListener('click', () => this.buyItem('magnet', 120));
    document.getElementById('buy-luck').addEventListener('click', () => this.buyItem('luck', 200));
    
    // Configurar eventos da tela de seleção de poderes
    document.getElementById('start-without-power').addEventListener('click', () => {
      this.hidePowerSelection();
      Game.startFromMenu();
    });
    document.getElementById('start-with-selected-power').addEventListener('click', () => this.startWithSelectedPower());
    
    // Inicializar a animação do personagem na tela inicial
    this.preloadCharacterAnimation();
    
    // Carregar e exibir o best score
    await this.updateBestScoreDisplay();
    
    // Carregar e exibir a carteira
    await this.updateWallet();
    
    // Atualizar carteira na tela inicial
    await this.updateWalletDisplay();
    
    // Atualizar quantidades de itens na loja
    await this.updateShopQuantities();
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
      
      // Também atualizar na loja
      const shopWalletElement = document.getElementById('shop-wallet-value');
      if (shopWalletElement) {
        shopWalletElement.textContent = fallbackShells;
      }
      
      this.updateShopButtons(parseInt(fallbackShells));
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
  
  // Mostrar tela de seleção de poderes
  async showPowerSelection() {
    try {
      const powerItems = await DatabaseManager.getPowerItems();
      const hasAnyPower = powerItems.shield > 0 || powerItems.magnet > 0;
      
      if (!hasAnyPower) {
        // Se não tem nenhum poder, iniciar diretamente
        Game.startFromMenu();
        return;
      }
      
      // Esconder tela inicial e mostrar seleção de poderes
      document.getElementById('startscreen').style.display = 'none';
      document.getElementById('power-selection-screen').style.display = 'flex';
      
      // Preencher itens disponíveis
      this.populatePowerSelection(powerItems);
      
    } catch (error) {
      console.error('Error showing power selection:', error);
      Game.startFromMenu(); // Fallback para iniciar sem poderes
    }
  },
  
  // Esconder tela de seleção de poderes
  hidePowerSelection() {
    document.getElementById('power-selection-screen').style.display = 'none';
    document.getElementById('startscreen').style.display = 'flex';
  },
  
  // Preencher opções de seleção de poderes
  populatePowerSelection(powerItems) {
    const container = document.getElementById('power-selection-items');
    container.innerHTML = '';
    
    if (powerItems.shield > 0) {
      const shieldItem = this.createPowerSelectionItem('shield', '🛡️ Escudo', powerItems.shield);
      container.appendChild(shieldItem);
    }
    
    if (powerItems.magnet > 0) {
      const magnetItem = this.createPowerSelectionItem('magnet', '🧲 Ímã', powerItems.magnet);
      container.appendChild(magnetItem);
    }
    
    // Resetar seleção
    this.selectedPower = null;
    document.getElementById('start-with-selected-power').disabled = true;
  },
  
  // Criar item de seleção de poder
  createPowerSelectionItem(type, name, quantity) {
    const item = document.createElement('div');
    item.className = 'power-selection-item';
    item.dataset.powerType = type;
    
    item.innerHTML = `
      <h4>${name}</h4>
      <div class="quantity">Quantidade: ${quantity}</div>
    `;
    
    item.addEventListener('click', () => {
      // Remover seleção anterior
      document.querySelectorAll('.power-selection-item').forEach(el => el.classList.remove('selected'));
      
      // Adicionar seleção atual
      item.classList.add('selected');
      this.selectedPower = type;
      
      // Habilitar botão de iniciar com poder
      document.getElementById('start-with-selected-power').disabled = false;
    });
    
    return item;
  },
  
  // Iniciar jogo com poder selecionado
  async startWithSelectedPower() {
    if (!this.selectedPower) return;
    
    try {
      // Usar o item selecionado
      const success = await DatabaseManager.usePowerItem(this.selectedPower);
      
      if (success) {
        // Definir o poder inicial no jogo
        Game.selectedInitialPower = this.selectedPower;
        
        // Esconder tela de seleção e iniciar jogo
        this.hidePowerSelection();
        Game.startFromMenu();
      } else {
        // alert('Erro ao usar o item. Tente novamente.');
      }
    } catch (error) {
      console.error('Error starting with selected power:', error);
      // alert('Erro ao usar o item. Tente novamente.');
    }
  },
  
  // Atualizar quantidades na loja
  async updateShopQuantities() {
    try {
      const powerItems = await DatabaseManager.getPowerItems();
      
      document.getElementById('shield-quantity').textContent = powerItems.shield;
      document.getElementById('magnet-quantity').textContent = powerItems.magnet;
      document.getElementById('luck-level').textContent = powerItems.luck;
      
    } catch (error) {
      console.error('Error updating shop quantities:', error);
    }
  },
  
  // Atualizar botões da loja baseado na quantidade de conchinhas
  updateShopButtons(walletAmount) {
    const shieldBtn = document.getElementById('buy-shield');
    const magnetBtn = document.getElementById('buy-magnet');
    const luckBtn = document.getElementById('buy-luck');
    
    // Desabilitar botões se não tiver conchinhas suficientes
    shieldBtn.disabled = walletAmount < 150;
    magnetBtn.disabled = walletAmount < 120;
    luckBtn.disabled = walletAmount < 200;
  },
    // Comprar item da loja
  async buyItem(itemType, price) {
    try {
      const currentWallet = await DatabaseManager.getWalletShells();
      
      if (currentWallet < price) {
        // alert('Conchinhas insuficientes!');
        return;
      }
      
      // Gastar conchinhas
      await DatabaseManager.spendFromWallet(price);
      
      // Adicionar item ao inventário
      const success = await DatabaseManager.addPowerItem(itemType, 1);
      
      if (success) {
        // Atualizar displays
        await this.updateWalletDisplay();
        await this.updateWallet();
        await this.updateShopQuantities();
        
        // Mostrar confirmação
        const itemNames = {
          shield: 'Escudo Inicial 🛡️',
          magnet: 'Ímã Inicial 🧲',
          luck: 'Trevo da Sorte 🍀'
        };
        
        const message = itemType === 'luck' ? 
          `${itemNames[itemType]} melhorado! Agora você tem mais sorte para encontrar power-ups.` :
          `${itemNames[itemType]} adicionado ao seu inventário!`;
        
        // alert(message);
      } else {
        // alert('Erro ao adicionar item. Tente novamente.');
      }
      
    } catch (error) {
      console.error('Error buying item:', error);
            // alert('Erro ao comprar item. Tente novamente.');
    }
  }
};
