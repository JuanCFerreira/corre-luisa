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
        // Criar tabela de scores
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY,
            best_score INTEGER NOT NULL,
            date_achieved TEXT NOT NULL,
            game_version TEXT DEFAULT '1.0'
          )`,
          [],
          () => {
            // Criar tabela de carteira
            tx.executeSql(
              `CREATE TABLE IF NOT EXISTS wallet (
                id INTEGER PRIMARY KEY,
                total_shells INTEGER NOT NULL DEFAULT 0,
                last_updated TEXT NOT NULL
              )`,
              [],
              () => {
                // Inserir registros iniciais se não existirem
                this.initializeDefaultRecords(tx, resolve, reject);
              },
              (tx, error) => reject(error)
            );
          },
          (tx, error) => reject(error)
        );
      });
    });
  },
  
  // Inicializar registros padrão no Web SQL
  initializeDefaultRecords(tx, resolve, reject) {
    // Verificar e inserir registro de scores
    tx.executeSql(
      'SELECT COUNT(*) as count FROM scores',
      [],
      (tx, result) => {
        if (result.rows.item(0).count === 0) {
          tx.executeSql(
            'INSERT INTO scores (best_score, date_achieved) VALUES (?, ?)',
            [0, new Date().toISOString()],
            () => {
              // Verificar e inserir registro de carteira
              this.initializeWalletRecord(tx, resolve, reject);
            },
            (tx, error) => reject(error)
          );
        } else {
          // Verificar e inserir registro de carteira
          this.initializeWalletRecord(tx, resolve, reject);
        }
      },
      (tx, error) => reject(error)
    );
  },
  
  // Inicializar registro da carteira no Web SQL
  initializeWalletRecord(tx, resolve, reject) {
    tx.executeSql(
      'SELECT COUNT(*) as count FROM wallet',
      [],
      (tx, result) => {
        if (result.rows.item(0).count === 0) {
          tx.executeSql(
            'INSERT INTO wallet (total_shells, last_updated) VALUES (?, ?)',
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
    // Inicializar IndexedDB (fallback)
  async initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('CorrerLuisaDB', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = (event) => {
        this.db = event.target.result;          // Verificar se a object store existe após abrir
          if (!this.db.objectStoreNames.contains('scores') || !this.db.objectStoreNames.contains('wallet')) {
            // Se não existir, fechar e reabrir com versão maior para forçar upgrade
            this.db.close();
            const upgradeRequest = indexedDB.open('CorrerLuisaDB', 2);
            
            upgradeRequest.onupgradeneeded = (upgradeEvent) => {
              const upgradeDb = upgradeEvent.target.result;
              if (!upgradeDb.objectStoreNames.contains('scores')) {
                const scoreStore = upgradeDb.createObjectStore('scores', { keyPath: 'id', autoIncrement: true });
                scoreStore.createIndex('best_score', 'best_score', { unique: false });
              }
              if (!upgradeDb.objectStoreNames.contains('wallet')) {
                const walletStore = upgradeDb.createObjectStore('wallet', { keyPath: 'id', autoIncrement: true });
                walletStore.createIndex('total_shells', 'total_shells', { unique: false });
              }
            };
            
            upgradeRequest.onsuccess = (upgradeEvent) => {
              this.db = upgradeEvent.target.result;
              // Inserir registros iniciais se necessário
              this.ensureInitialRecords().then(() => resolve()).catch(reject);
            };
            
            upgradeRequest.onerror = () => reject(upgradeRequest.error);
          } else {
            // Object stores já existem, inserir registros iniciais se necessário
            this.ensureInitialRecords().then(() => resolve()).catch(reject);
          }
      };
        request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Criar object store de scores
        if (!db.objectStoreNames.contains('scores')) {
          const scoreStore = db.createObjectStore('scores', { keyPath: 'id', autoIncrement: true });
          scoreStore.createIndex('best_score', 'best_score', { unique: false });
        }
        
        // Criar object store de carteira
        if (!db.objectStoreNames.contains('wallet')) {
          const walletStore = db.createObjectStore('wallet', { keyPath: 'id', autoIncrement: true });
          walletStore.createIndex('total_shells', 'total_shells', { unique: false });
        }
      };
    });
  },
    // Garantir que existem registros iniciais no IndexedDB
  async ensureInitialRecords() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['scores', 'wallet'], 'readwrite');
      const scoreStore = transaction.objectStore('scores');
      const walletStore = transaction.objectStore('wallet');
      
      // Verificar e inserir registro de scores
      const scoreCountRequest = scoreStore.count();
      scoreCountRequest.onsuccess = () => {
        if (scoreCountRequest.result === 0) {
          scoreStore.add({
            best_score: 0,
            date_achieved: new Date().toISOString(),
            game_version: '1.0'
          });
        }
        
        // Verificar e inserir registro de carteira
        const walletCountRequest = walletStore.count();
        walletCountRequest.onsuccess = () => {
          if (walletCountRequest.result === 0) {
            walletStore.add({
              total_shells: 0,
              last_updated: new Date().toISOString()
            });
          }
          resolve();
        };
        walletCountRequest.onerror = () => reject(walletCountRequest.error);
      };
      scoreCountRequest.onerror = () => reject(scoreCountRequest.error);
      
      transaction.onerror = () => reject(transaction.error);
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
      localStorage.removeItem('walletShells');
      return;
    }
    
    try {
      if (typeof openDatabase !== 'undefined' && this.db && this.db.transaction) {
        // Web SQL
        return new Promise((resolve, reject) => {
          this.db.transaction((tx) => {
            tx.executeSql(
              'UPDATE scores SET best_score = 0, date_achieved = ?',
              [new Date().toISOString()],
              () => {
                tx.executeSql(
                  'UPDATE wallet SET total_shells = 0, last_updated = ?',
                  [new Date().toISOString()],
                  () => resolve(),
                  (tx, error) => reject(error)
                );
              },
              (tx, error) => reject(error)
            );
          });
        });
      } else if (this.db && this.db.objectStoreNames) {
        // IndexedDB
        return new Promise((resolve, reject) => {
          const transaction = this.db.transaction(['scores', 'wallet'], 'readwrite');
          const scoreStore = transaction.objectStore('scores');
          const walletStore = transaction.objectStore('wallet');
          
          // Limpar scores
          const clearScoresRequest = scoreStore.clear();
          clearScoresRequest.onsuccess = () => {
            // Limpar wallet
            const clearWalletRequest = walletStore.clear();
            clearWalletRequest.onsuccess = () => {
              // Inserir registros iniciais
              scoreStore.add({
                best_score: 0,
                date_achieved: new Date().toISOString(),
                game_version: '1.0'
              });
              
              walletStore.add({
                total_shells: 0,
                last_updated: new Date().toISOString()
              });
              
              resolve();
            };
            clearWalletRequest.onerror = () => reject(clearWalletRequest.error);
          };
          clearScoresRequest.onerror = () => reject(clearScoresRequest.error);
          
          transaction.onerror = () => reject(transaction.error);
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
      
      // Testar getWalletShells
      const currentWallet = await this.getWalletShells();
      console.log('Current wallet shells:', currentWallet);
      
      // Testar saveBestScore
      const testScore = 123;
      await this.saveBestScore(testScore);
      console.log('Saved test score:', testScore);
      
      // Testar addToWallet
      const addAmount = 50;
      const newWalletTotal = await this.addToWallet(addAmount);
      console.log('Added', addAmount, 'shells. New total:', newWalletTotal);
      
      // Verificar se foram salvos
      const newScore = await this.getBestScore();
      const newWallet = await this.getWalletShells();
      console.log('New best score after save:', newScore);
      console.log('New wallet total after add:', newWallet);
      
      // Testar spendFromWallet
      try {
        const spendAmount = 25;
        const afterSpendTotal = await this.spendFromWallet(spendAmount);
        console.log('Spent', spendAmount, 'shells. Remaining:', afterSpendTotal);
      } catch (error) {
        console.log('Spend test failed:', error.message);
      }
      
      console.log('=== Test Complete ===');
    } catch (error) {
      console.error('Test failed:', error);
    }
  },
  
  // === MÉTODOS DA CARTEIRA DE CONCHINHAS ===
  
  // Obter o total de conchinhas na carteira
  async getWalletShells() {
    if (this.useLocalStorageFallback) {
      return parseInt(localStorage.getItem('walletShells') || '0');
    }
    
    try {
      if (typeof openDatabase !== 'undefined' && this.db && this.db.transaction) {
        // Web SQL
        return new Promise((resolve, reject) => {
          this.db.transaction((tx) => {
            tx.executeSql(
              'SELECT total_shells FROM wallet ORDER BY id DESC LIMIT 1',
              [],
              (tx, result) => {
                if (result.rows.length > 0) {
                  resolve(result.rows.item(0).total_shells);
                } else {
                  resolve(0);
                }
              },
              (tx, error) => {
                console.error('Error getting wallet shells:', error);
                reject(error);
              }
            );
          });
        });
      } else if (this.db && this.db.objectStoreNames) {
        // IndexedDB
        return new Promise((resolve, reject) => {
          // Verificar se a object store existe
          if (!this.db.objectStoreNames.contains('wallet')) {
            console.warn('Object store "wallet" not found, returning 0');
            resolve(0);
            return;
          }
          
          const transaction = this.db.transaction(['wallet'], 'readonly');
          const store = transaction.objectStore('wallet');
          const request = store.getAll();
          
          request.onsuccess = () => {
            const wallets = request.result;
            if (wallets.length > 0) {
              // Pegar o registro mais recente
              const latestWallet = wallets[wallets.length - 1];
              resolve(latestWallet.total_shells);
            } else {
              resolve(0);
            }
          };
          
          request.onerror = () => {
            console.error('Error getting wallet shells from IndexedDB:', request.error);
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
        return parseInt(localStorage.getItem('walletShells') || '0');
      }
    } catch (error) {
      console.error('Error getting wallet shells:', error);
      // Fallback para localStorage
      return parseInt(localStorage.getItem('walletShells') || '0');
    }
  },
  
  // Adicionar conchinhas à carteira
  async addToWallet(amount) {
    if (this.useLocalStorageFallback) {
      const current = parseInt(localStorage.getItem('walletShells') || '0');
      localStorage.setItem('walletShells', (current + amount).toString());
      return current + amount;
    }
    
    try {
      const currentTotal = await this.getWalletShells();
      const newTotal = currentTotal + amount;
      
      if (typeof openDatabase !== 'undefined' && this.db && this.db.transaction) {
        // Web SQL
        return new Promise((resolve, reject) => {
          this.db.transaction((tx) => {
            tx.executeSql(
              'UPDATE wallet SET total_shells = ?, last_updated = ? WHERE id = 1',
              [newTotal, new Date().toISOString()],
              () => resolve(newTotal),
              (tx, error) => {
                console.error('Error updating wallet:', error);
                reject(error);
              }
            );
          });
        });
      } else if (this.db && this.db.objectStoreNames) {
        // IndexedDB
        return new Promise((resolve, reject) => {
          // Verificar se a object store existe
          if (!this.db.objectStoreNames.contains('wallet')) {
            console.warn('Object store "wallet" not found, using localStorage fallback');
            const current = parseInt(localStorage.getItem('walletShells') || '0');
            localStorage.setItem('walletShells', (current + amount).toString());
            resolve(current + amount);
            return;
          }
          
          const transaction = this.db.transaction(['wallet'], 'readwrite');
          const store = transaction.objectStore('wallet');
          
          // Buscar o registro existente
          const getRequest = store.getAll();
          getRequest.onsuccess = () => {
            const wallets = getRequest.result;
            if (wallets.length > 0) {
              // Atualizar o primeiro registro
              const record = wallets[0];
              record.total_shells = newTotal;
              record.last_updated = new Date().toISOString();
              
              const updateRequest = store.put(record);
              updateRequest.onsuccess = () => resolve(newTotal);
              updateRequest.onerror = () => reject(updateRequest.error);
            } else {
              // Criar novo registro
              const addRequest = store.add({
                total_shells: newTotal,
                last_updated: new Date().toISOString()
              });
              addRequest.onsuccess = () => resolve(newTotal);
              addRequest.onerror = () => reject(addRequest.error);
            }
          };
          getRequest.onerror = () => reject(getRequest.error);
        });
      } else {
        // Fallback para localStorage
        console.warn('No database available, using localStorage fallback');
        const current = parseInt(localStorage.getItem('walletShells') || '0');
        localStorage.setItem('walletShells', (current + amount).toString());
        return current + amount;
      }
    } catch (error) {
      console.error('Error adding to wallet:', error);
      // Fallback para localStorage
      const current = parseInt(localStorage.getItem('walletShells') || '0');
      localStorage.setItem('walletShells', (current + amount).toString());
      return current + amount;
    }
  },
  
  // Gastar conchinhas da carteira
  async spendFromWallet(amount) {
    try {
      const currentTotal = await this.getWalletShells();
      
      if (currentTotal < amount) {
        throw new Error('Conchinhas insuficientes na carteira');
      }
      
      const newTotal = currentTotal - amount;
      
      if (this.useLocalStorageFallback) {
        localStorage.setItem('walletShells', newTotal.toString());
        return newTotal;
      }
      
      if (typeof openDatabase !== 'undefined' && this.db && this.db.transaction) {
        // Web SQL
        return new Promise((resolve, reject) => {
          this.db.transaction((tx) => {
            tx.executeSql(
              'UPDATE wallet SET total_shells = ?, last_updated = ? WHERE id = 1',
              [newTotal, new Date().toISOString()],
              () => resolve(newTotal),
              (tx, error) => {
                console.error('Error spending from wallet:', error);
                reject(error);
              }
            );
          });
        });
      } else if (this.db && this.db.objectStoreNames) {
        // IndexedDB
        return new Promise((resolve, reject) => {
          if (!this.db.objectStoreNames.contains('wallet')) {
            localStorage.setItem('walletShells', newTotal.toString());
            resolve(newTotal);
            return;
          }
          
          const transaction = this.db.transaction(['wallet'], 'readwrite');
          const store = transaction.objectStore('wallet');
          
          const getRequest = store.getAll();
          getRequest.onsuccess = () => {
            const wallets = getRequest.result;
            if (wallets.length > 0) {
              const record = wallets[0];
              record.total_shells = newTotal;
              record.last_updated = new Date().toISOString();
              
              const updateRequest = store.put(record);
              updateRequest.onsuccess = () => resolve(newTotal);
              updateRequest.onerror = () => reject(updateRequest.error);
            } else {
              reject(new Error('Wallet record not found'));
            }
          };
          getRequest.onerror = () => reject(getRequest.error);
        });
      } else {
        localStorage.setItem('walletShells', newTotal.toString());
        return newTotal;
      }
    } catch (error) {
      console.error('Error spending from wallet:', error);
      throw error;
    }
  }
};
