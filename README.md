# Corre Luisa

Um jogo 2D de corrida infinita onde a personagem Luisa precisa fugir de um jacaré e coletar conchas.

![Corre Luisa Game](screenshots/game.jpg)

## Descrição

Neste jogo, você controla Luisa que está fugindo de um jacaré enquanto coleta conchas na praia. O jogo possui:

- Sistema de pontuação baseado em conchas coletadas
- Power-ups: imã (atrai conchas) e escudo (protege contra colisões)
- Ciclo de dia e noite a cada 50 conchas coletadas
- Padrões especiais de conchas para coletar
- Obstáculos a serem evitados

## Como Jogar

- **Pular**: Toque na tela, clique com o mouse ou pressione a barra de espaço/seta para cima
- **Objetivo**: Coletar o máximo de conchas possível sem ser pego pelo jacaré ou bater nos obstáculos

## Estrutura do Projeto

O projeto foi organizado seguindo boas práticas de desenvolvimento web:

```
corre-luisa/
├── src/                     # Código-fonte do jogo
│   ├── index.html           # Arquivo HTML principal
│   ├── css/                 # Estilos CSS
│   │   └── styles.css       # Folha de estilo principal
│   └── js/                  # Scripts JavaScript
│       ├── core/            # Núcleo do jogo
│       │   ├── audio.js     # Sistema de áudio
│       │   ├── collision.js # Sistema de colisões
│       │   ├── game.js      # Lógica principal
│       │   ├── renderer.js  # Sistema de renderização
│       │   └── screen.js    # Gerenciamento de tela
│       ├── entities/        # Entidades do jogo
│       │   ├── girl.js      # Personagem principal (Luisa)
│       │   ├── jacare.js    # Inimigo (jacaré)
│       │   ├── obstacle.js  # Obstáculos
│       │   ├── powerup.js   # Itens de poder
│       │   └── shell.js     # Conchas coletáveis
│       ├── ui/              # Interface de usuário
│       │   └── indicators.js # Indicadores na tela
│       ├── utils/           # Utilidades
│       │   ├── constants.js # Constantes do jogo
│       │   └── helpers.js   # Funções auxiliares
│       └── main.js          # Ponto de entrada do jogo
├── sprites/                 # Imagens dos personagens
│   ├── luisa-runn/          # Sprites de animação da Luisa
│   └── aligator-runn/       # Sprites de animação do jacaré
├── songs/                   # Arquivos de áudio
│   ├── background-music.mp3 # Música de fundo
│   └── effects/             # Efeitos sonoros
├── Dockerfile               # Configuração do Docker
├── docker-compose.yml       # Configuração do Docker Compose
└── nginx.conf               # Configuração do servidor web
```

## Tecnologias Utilizadas

- HTML5 Canvas para renderização do jogo
- JavaScript puro (sem frameworks) para a lógica do jogo
- CSS3 para estilos e animações
- Docker para containerização

## Executando o Jogo

### Localmente

Abra o arquivo `src/index.html` em seu navegador.

### Com Docker

```bash
# Construir e iniciar o contêiner
docker-compose up -d

# O jogo estará disponível em http://localhost:8080
```

## Desenvolvimento

O código está organizado em módulos que seguem o princípio de responsabilidade única. 
Cada parte do jogo está separada em seu próprio arquivo para facilitar a manutenção e o desenvolvimento futuro.

### Principais Componentes

- **Game**: Gerencia o estado do jogo e o loop principal
- **Renderer**: Responsável pela renderização de todos os elementos
- **Audio**: Gerencia todos os sons do jogo
- **Entities**: Cada entidade com seu próprio comportamento
- **CollisionSystem**: Detecta e processa colisões entre elementos
- **UIManager**: Gerencia elementos de interface do usuário

## Licença

Este projeto é distribuído sob a licença MIT.

## Créditos

Desenvolvido como um projeto educacional. Sprites e efeitos sonoros são propriedade de seus respectivos donos.
