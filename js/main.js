/**
 * Arquivo principal que inicializa o jogo
 */

// Esperar pelo carregamento do DOM
document.addEventListener('DOMContentLoaded', async () => {
  // Inicializar o jogo (agora assíncrono para incluir o banco de dados)
  await Game.init();
});
