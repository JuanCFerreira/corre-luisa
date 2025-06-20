# Sistema de Best Score com SQLite

Este jogo implementa um sistema de persistência de best score usando SQLite real (não localStorage) que está preparado para funcionar tanto no desenvolvimento web quanto quando compilado para APK.

## Como Funciona

### Para Desenvolvimento Web (Navegador)

O sistema usa duas estratégias de fallback:

1. **Web SQL Database** (se disponível no navegador)
2. **IndexedDB** (fallback padrão)
3. **localStorage** (fallback de emergência se houver erro)

### Para APK (Cordova/PhoneGap)

Quando compilar para APK, você precisará:

1. **Instalar o plugin SQLite do Cordova:**
   ```bash
   cordova plugin add cordova-sqlite-storage
   ```

2. **Substituir a implementação do DatabaseManager** para usar o SQLite nativo:

```javascript
// Para APK, substitua a inicialização no database.js
async init() {
  if (typeof window.sqlitePlugin !== 'undefined') {
    // SQLite nativo (APK)
    this.db = window.sqlitePlugin.openDatabase({
      name: 'CorrerLuisaDB.db',
      location: 'default'
    });
    await this.initNativeSQLite();
  } else {
    // Fallback para desenvolvimento web
    // ... código atual ...
  }
}

async initNativeSQLite() {
  return new Promise((resolve, reject) => {
    this.db.executeSql(
      `CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        best_score INTEGER NOT NULL,
        date_achieved TEXT NOT NULL,
        game_version TEXT DEFAULT '1.0'
      )`,
      [],
      () => {
        // Inserir registro inicial se não existir
        this.db.executeSql(
          'SELECT COUNT(*) as count FROM scores',
          [],
          (result) => {
            if (result.rows.item(0).count === 0) {
              this.db.executeSql(
                'INSERT INTO scores (best_score, date_achieved) VALUES (?, ?)',
                [0, new Date().toISOString()],
                () => resolve(),
                (error) => reject(error)
              );
            } else {
              resolve();
            }
          },
          (error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
}
```

## Funcionalidades Implementadas

### 1. **Persistência do Best Score**
- O melhor score é automaticamente salvo no banco de dados
- Funciona offline (dados ficam no dispositivo)
- Não é perdido quando o app é fechado

### 2. **Exibição do Best Score**
- Mostrado na tela inicial do jogo
- Atualizado automaticamente quando um novo recorde é alcançado

### 3. **Indicador de Novo Recorde**
- Quando o jogador faz um novo recorde, uma mensagem especial aparece
- Animação visual para destacar a conquista

### 4. **Estrutura do Banco de Dados**

```sql
CREATE TABLE scores (
  id INTEGER PRIMARY KEY,
  best_score INTEGER NOT NULL,
  date_achieved TEXT NOT NULL,
  game_version TEXT DEFAULT '1.0'
);
```

## Arquivos Modificados

1. **`src/js/core/database.js`** - Novo arquivo com o gerenciador de banco de dados
2. **`src/js/ui/indicators.js`** - Atualizado para mostrar best score e novo recorde
3. **`src/js/core/game.js`** - Atualizado para inicializar o banco e chamar métodos assíncronos
4. **`src/js/main.js`** - Inicialização assíncrona
5. **`src/index.html`** - Adicionados elementos de UI para best score
6. **`src/css/styles.css`** - Estilos para os novos elementos

## Testes e Debug

Para testar durante o desenvolvimento:

```javascript
// No console do navegador, você pode:

// Ver o best score atual
DatabaseManager.getBestScore().then(score => console.log('Best Score:', score));

// Simular um novo recorde
DatabaseManager.saveBestScore(100).then(() => console.log('Score salvo!'));

// Resetar dados (apenas para desenvolvimento)
DatabaseManager.resetData().then(() => console.log('Dados resetados!'));
```

## Vantagens do SQLite vs localStorage

1. **Performance**: SQLite é mais rápido para operações complexas
2. **Capacidade**: Não há limite de 5-10MB como no localStorage
3. **Estrutura**: Permite queries SQL complexas se necessário no futuro
4. **Confiabilidade**: Menos propenso a corrupção de dados
5. **Nativo**: Funciona perfeitamente em APKs compilados

## Futuras Expansões Possíveis

O sistema está preparado para adicionar facilmente:

- Histórico de scores
- Estatísticas de jogo (tempo jogado, conchas coletadas, etc.)
- Conquistas/achievements
- Perfis de jogadores
- Sincronização com nuvem (se necessário)
