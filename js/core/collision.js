/**
 * Sistema de verificação de colisões
 */

const CollisionSystem = {
  // Verificar colisões entre todos os elementos do jogo
  checkCollisions() {
    // Verificar colisão com conchas (coletáveis)
    ShellManager.checkCollisions();
    
    // Verificar colisão com obstáculos (pedras)
    if (ObstacleManager.checkCollisions()) {
      return true; // Game over
    }
    
    // Verificar colisão com power-ups
    PowerupManager.checkCollisions();
    
    // Verificar colisão com o jacaré
    if (this.checkJacareCollision()) {
      return true; // Game over
    }
    
    return false; // Jogo continua
  },
  
  // Verificar colisão específica com o jacaré
  checkJacareCollision() {
    if (rectsCollide(Jacare, Girl)) {      // Se o escudo estiver ativo, não há colisão com o jacaré
      if (!Game.shieldActive) {
        Game.gameOverSync("O jacaré pegou você!");
        return true;
      }
    }
    return false;
  }
};
