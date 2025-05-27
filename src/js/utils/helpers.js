/**
 * Funções auxiliares para o jogo
 */

// Função para calcular se dois retângulos colidem
function rectsCollide(a, b) {
  return !(a.x + a.w < b.x + 10 ||
           a.x > b.x + b.w - 10 ||
           a.y + a.h < b.y + 10 ||
           a.y > b.y + b.h - 10);
}

// Função para verificar se o dispositivo está em orientação paisagem
function isLandscape() { 
  // Em tela cheia no mobile, verifica a orientação real
  if (document.body.classList.contains('fullscreen') && 
     /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    return window.innerWidth > window.innerHeight;
  }
  return true; // Sempre em paisagem na simulação de celular
}

// Função para calcular posições relativas à tela
// Estas funções são calculadas dinamicamente baseadas no tamanho do canvas
const canvasUtils = {
  canvas: document.getElementById('game'),
  w() { return this.canvas.width; },
  h() { return this.canvas.height; },
  GROUND_Y() { return this.h() * 0.82; },
  GRAVITY() { return this.h() * 0.0026; },
  JUMP_VELOCITY() { return -this.h() * 0.042; },
  GIRL_W() { return this.w() * 0.08; }, 
  GIRL_H() { return this.h() * 0.32; },
  JACARE_W() { return this.w() * 0.09; }, 
  JACARE_H() { return this.h() * 0.18; },
  SHELL_SIZE() { return this.w() * 0.045; },
  OBSTACLE_W() { return this.w() * 0.045; }, 
  OBSTACLE_H() { return this.h() * 0.10; },
  POWERUP_SIZE() { return this.w() * 0.06; }
};
