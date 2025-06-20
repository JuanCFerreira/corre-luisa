/**
 * Gerenciador de banco de dados SQLite para persistência de dados
 */

const DatabaseManager = {
  db: null,
    // Inicializar o banco de dados
  async init() {
    try {
      // Para desenvolvimento web, usar Web SQL API (se disponível) ou IndexedDB como fallback
      // Para APK, isso será substituído pela implementação SQLite nativa do Cordova/PhoneGap
      if (typeof openDatabase !== 'undefined') {
        // Web SQL Database (para desenvolvimento)
        this.db = openDatabase('CorrerLuisaDB', '1.0', 'Corre Luisa Game Database', 2 * 1024 * 1024);
        await this.initWebSQL();
        console.log('Database initialized with Web SQL');
      } else if (typeof indexedDB !== 'undefined') {
        // Fallback para IndexedDB
        await this.initIndexedDB();
        console.log('Database initialized with IndexedDB');
      } else {
        // Forçar fallback se nenhuma opção estiver disponível
        this.useLocalStorageFallback = true;
        console.log('Using localStorage fallback');
      }
    } catch (error) {
      console.error('Failed to initialize database:', error);
      // Em caso de erro, usar localStorage como fallback
      this.useLocalStorageFallback = true;
      console.log('Fallback to localStorage due to error');
    }
  },
  
  // Inicializar Web SQL
  async initWebSQL() {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY,
            best_score INTEGER NOT NULL,
            date_achieved TEXT NOT NULL,
            game_version TEXT DEFAULT '1.0'
          )`,
          [],
          () => {
            // Inserir registro inicial se não existir
            tx.executeSql(
              'SELECT COUNT(*) as count FROM scores',
              [],
              (tx, result) => {
                if (result.rows.item(0).count === 0) {
                  tx.executeSql(
                    'INSERT INTO scores (best_score, date_achieved) VALUES (?, ?)',
                    [0, new Date().toISOString()],
                    () => resolve(),
                    (tx, error) => reject(error)
                  );
                } else {
                  resolve();
                }
              },
              (tx, error) => reject(error)
            );
          },
          (tx, error) => reject(error)
        );
      });
    });
  },
    // Inicializar IndexedDB (fallback)
  async initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('CorrerLuisaDB', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = (event) => {
        this.db = event.target.result;
        
        // Verificar se a object store existe após abrir
        if (!this.db.objectStoreNames.contains('scores')) {
          // Se não existir, fechar e reabrir com versão maior para forçar upgrade
          this.db.close();
          const upgradeRequest = indexedDB.open('CorrerLuisaDB', 2);
          
          upgradeRequest.onupgradeneeded = (upgradeEvent) => {
            const upgradeDb = upgradeEvent.target.result;
            if (!upgradeDb.objectStoreNames.contains('scores')) {
              const store = upgradeDb.createObjectStore('scores', { keyPath: 'id', autoIncrement: true });
              store.createIndex('best_score', 'best_score', { unique: false });
            }
          };
          
          upgradeRequest.onsuccess = (upgradeEvent) => {
            this.db = upgradeEvent.target.result;
            // Inserir registro inicial se necessário
            this.ensureInitialRecord().then(() => resolve()).catch(reject);
          };
          
          upgradeRequest.onerror = () => reject(upgradeRequest.error);
        } else {
          // Object store já existe, inserir registro inicial se necessário
          this.ensureInitialRecord().then(() => resolve()).catch(reject);
        }
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        if (!db.objectStoreNames.contains('scores')) {
          const store = db.createObjectStore('scores', { keyPath: 'id', autoIncrement: true });
          store.createIndex('best_score', 'best_score', { unique: false });
        }
      };
    });
  },
  
  // Garantir que existe um registro inicial no IndexedDB
  async ensureInitialRecord() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['scores'], 'readwrite');
      const store = transaction.objectStore('scores');
      const countRequest = store.count();
      
      countRequest.onsuccess = () => {
        if (countRequest.result === 0) {
          // Inserir registro inicial
          const addRequest = store.add({
            best_score: 0,
            date_achieved: new Date().toISOString(),
            game_version: '1.0'
          });
          addRequest.onsuccess = () => resolve();
          addRequest.onerror = () => reject(addRequest.error);
        } else {
          resolve();
        }
      };
      
      countRequest.onerror = () => reject(countRequest.error);
    });
  },
    // Obter o melhor score
  async getBestScore() {
    if (this.useLocalStorageFallback) {
      return parseInt(localStorage.getItem('bestScore') || '0');
    }
    
    try {
      if (typeof openDatabase !== 'undefined' && this.db && this.db.transaction) {
        // Web SQL
        return new Promise((resolve, reject) => {
          this.db.transaction((tx) => {
            tx.executeSql(
              'SELECT best_score FROM scores ORDER BY best_score DESC LIMIT 1',
              [],
              (tx, result) => {
                if (result.rows.length > 0) {
                  resolve(result.rows.item(0).best_score);
                } else {
                  resolve(0);
                }
              },
              (tx, error) => {
                console.error('Error getting best score:', error);
                reject(error);
              }
            );
          });
        });
      } else if (this.db && this.db.objectStoreNames) {
        // IndexedDB
        return new Promise((resolve, reject) => {
          // Verificar se a object store existe
          if (!this.db.objectStoreNames.contains('scores')) {
            console.warn('Object store "scores" not found, returning 0');
            resolve(0);
            return;
          }
          
          const transaction = this.db.transaction(['scores'], 'readonly');
          const store = transaction.objectStore('scores');
          const request = store.getAll();
          
          request.onsuccess = () => {
            const scores = request.result;
            if (scores.length > 0) {
              const bestScore = Math.max(...scores.map(s => s.best_score));
              resolve(bestScore);
            } else {
              resolve(0);
            }
          };
          
          request.onerror = () => {
            console.error('Error getting best score from IndexedDB:', request.error);
            reject(request.error);
          };
          
          transaction.onerror = () => {
            console.error('Transaction error:', transaction.error);
            reject(transaction.error);
          };
        });
      } else {
        // Fallback se nenhum banco estiver disponível
        console.warn('No database available, using localStorage fallback');
        return parseInt(localStorage.getItem('bestScore') || '0');
      }
    } catch (error) {
      console.error('Error getting best score:', error);
      // Fallback para localStorage
      return parseInt(localStorage.getItem('bestScore') || '0');
    }
  },
    // Salvar novo melhor score
  async saveBestScore(score) {
    if (this.useLocalStorageFallback) {
      localStorage.setItem('bestScore', score.toString());
      return;
    }
    
    try {
      const currentBest = await this.getBestScore();
      
      // Só salvar se for realmente um novo recorde
      if (score > currentBest) {
        if (typeof openDatabase !== 'undefined' && this.db && this.db.transaction) {
          // Web SQL
          return new Promise((resolve, reject) => {
            this.db.transaction((tx) => {
              tx.executeSql(
                'UPDATE scores SET best_score = ?, date_achieved = ? WHERE id = 1',
                [score, new Date().toISOString()],
                () => resolve(),
                (tx, error) => {
                  console.error('Error saving best score:', error);
                  reject(error);
                }
              );
            });
          });
        } else if (this.db && this.db.objectStoreNames) {
          // IndexedDB
          return new Promise((resolve, reject) => {
            // Verificar se a object store existe
            if (!this.db.objectStoreNames.contains('scores')) {
              console.warn('Object store "scores" not found, using localStorage fallback');
              localStorage.setItem('bestScore', score.toString());
              resolve();
              return;
            }
            
            const transaction = this.db.transaction(['scores'], 'readwrite');
            const store = transaction.objectStore('scores');
            
            // Buscar o registro existente
            const getRequest = store.getAll();
            getRequest.onsuccess = () => {
              const scores = getRequest.result;
              if (scores.length > 0) {
                // Atualizar o primeiro registro
                const record = scores[0];
                record.best_score = score;
                record.date_achieved = new Date().toISOString();
                
                const updateRequest = store.put(record);
                updateRequest.onsuccess = () => resolve();
                updateRequest.onerror = () => reject(updateRequest.error);
              } else {
                // Criar novo registro
                const addRequest = store.add({
                  best_score: score,
                  date_achieved: new Date().toISOString(),
                  game_version: '1.0'
                });
                addRequest.onsuccess = () => resolve();
                addRequest.onerror = () => reject(addRequest.error);
              }
            };
            getRequest.onerror = () => reject(getRequest.error);
          });
        } else {
          // Fallback para localStorage
          console.warn('No database available, using localStorage fallback');
          localStorage.setItem('bestScore', score.toString());
        }
      }
    } catch (error) {
      console.error('Error saving best score:', error);
      // Fallback para localStorage
      localStorage.setItem('bestScore', score.toString());
    }
  },
  
  // Resetar dados (para desenvolvimento/debug)
  async resetData() {
    if (this.useLocalStorageFallback) {
      localStorage.removeItem('bestScore');
      return;
    }
    
    try {
      if (typeof openDatabase !== 'undefined' && this.db) {
        // Web SQL
        return new Promise((resolve, reject) => {
          this.db.transaction((tx) => {
            tx.executeSql(
              'UPDATE scores SET best_score = 0, date_achieved = ?',
              [new Date().toISOString()],
              () => resolve(),
              (tx, error) => reject(error)
            );
          });
        });
      } else if (this.db) {
        // IndexedDB
        return new Promise((resolve, reject) => {
          const transaction = this.db.transaction(['scores'], 'readwrite');
          const store = transaction.objectStore('scores');
          const request = store.clear();
          
          request.onsuccess = () => {
            // Inserir registro inicial
            const addRequest = store.add({
              best_score: 0,
              date_achieved: new Date().toISOString(),
              game_version: '1.0'
            });
            addRequest.onsuccess = () => resolve();
            addRequest.onerror = () => reject(addRequest.error);
          };
          
          request.onerror = () => reject(request.error);
        });
      }
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  },
  
  // Método de teste para verificar funcionamento
  async testDatabase() {
    console.log('=== Database Test ===');
    console.log('Using localStorage fallback:', this.useLocalStorageFallback);
    console.log('Database object:', this.db);
    
    try {
      // Testar getBestScore
      const currentScore = await this.getBestScore();
      console.log('Current best score:', currentScore);
      
      // Testar saveBestScore
      const testScore = 123;
      await this.saveBestScore(testScore);
      console.log('Saved test score:', testScore);
      
      // Verificar se foi salvo
      const newScore = await this.getBestScore();
      console.log('New best score after save:', newScore);
      
      console.log('=== Test Complete ===');
    } catch (error) {
      console.error('Test failed:', error);
    }
  }
};
