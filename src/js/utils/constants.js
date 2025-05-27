/**
 * Arquivo de constantes do jogo
 * Centraliza todas as configurações e constantes do jogo
 */

// Frequência de itens
const SHELL_FREQUENCY_MIN = 0.45; // Mínimo intervalo para conchas (em larguras de tela)
const SHELL_FREQUENCY_MAX = 0.6;  // Máximo intervalo para conchas
const OBSTACLE_FREQUENCY_MIN = 0.55; // Mínimo intervalo para obstáculos
const OBSTACLE_FREQUENCY_MAX = 0.5;  // Máximo intervalo para obstáculos
const POWERUP_FREQUENCY_MIN = 4.0;   // Mínimo intervalo para power-ups (muito mais raro)
const POWERUP_FREQUENCY_MAX = 6.0;   // Máximo intervalo para power-ups

// Velocidade máxima do jogo (relativa à largura da tela)
const MAX_SPEED = 10;  // Velocidade máxima (dobro da velocidade inicial)

// Duração dos power-ups em milissegundos
const MAGNET_DURATION = 8000;  // Duração do imã: 8 segundos
const SHIELD_DURATION = 6000;  // Duração do escudo: 6 segundos

// Configurações de áudio
const EFFECTS_VOLUME = 0.5; // Volume dos efeitos sonoros (0.0 a 1.0)
const MUSIC_VOLUME = 0.3;   // Volume da música de fundo (0.0 a 1.0)

// Intervalo de atualização dos sprites
const SPRITE_UPDATE_INTERVAL_BASE = 100; // Atualizar sprites a cada 100ms
const JACARE_SPRITE_UPDATE_INTERVAL_BASE = 130; // Atualizar sprites do jacaré a cada 130ms

// Tipos de powerups
const POWERUP_TYPES = {
  MAGNET: 0,
  SHIELD: 1
};
