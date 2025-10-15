import Subscribe from '../utils/subscribe'

export default class IndexedDB {
    constructor(database_name, tables = [], version = 3) {
        this.listener = Subscribe()

        this.database_name = 'lampa_' + database_name
        
        this.tables = tables

        this.version = version

        this.db = null
        this.logs = true
    }

    log(err,store_name,key){
        if(this.logs) console.log('DB', this.database_name + (store_name ? '_' + store_name : '') + (key ? ' -> [' + key + ']' : ''), err)
    }

    /**
     * Открытие базы данных
     * @returns {Promise<void>}
     */
    openDatabase() {
        return new Promise((resolve, reject) => {
            let Base = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;

            if (!Base) return this.log('Not supported'),reject('Not supported')

            if(!this.tables.length) return this.log('No tables'),reject('No tables')

            const request = Base.open(this.database_name, this.version)

            request.onerror = (event)=> {
                this.log(request.error || 'An error occurred while opening the database')

                reject(request.error || 'An error occurred while opening the database')
            }

            request.onsuccess = (event) => {
                this.db = event.target.result

                resolve()
            }

            request.onupgradeneeded = (event) => {
                const db = event.target.result

                this.log('OnUpgradeNeeded')
                
                this.tables.forEach(name => {
                    if(!db.objectStoreNames.contains(name)){
                        this.log('Create table - ' + name)

                        db.createObjectStore(name, { keyPath: 'key' })
                    }
                })
            }
        })
    }

    /**
     * Добавление данных в таблицу
     * @param {string} store_name - Название таблицы
     * @param {string} key - Ключ записи
     * @param {any} value - Значение записи
     * @returns {Promise<void>}
     */
    addData(store_name,key, value) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return this.log('Database not open',store_name,key),reject('Database not open')
            }

            const transaction = this.db.transaction([store_name], 'readwrite')
            const objectStore = transaction.objectStore(store_name)
            const addRequest = objectStore.add({ key, value, time: Date.now() })

            addRequest.onerror = (event) => {
                this.log(addRequest.error || 'An error occurred while adding data',store_name,key)

                reject(addRequest.error || 'An error occurred while adding data')
            }

            addRequest.onsuccess = resolve
        })
    }

    /**
     * Получение данных из таблицы
     * @param {string} store_name - Название таблицы
     * @param {string} key - Ключ записи, если не указан, вернет все записи
     * @param {number} life_time - Время жизни записи в минутах. -1 - без ограничений
     * @param {boolean} return_meta - Возвращать мета данные (ключ, время) вместе со значением
     * @returns {Promise<any>}
     */
    getData(store_name, key, life_time = -1, return_meta = false) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return this.log('Database not open',store_name,key),reject('Database not open')
            }

            const transaction = this.db.transaction([store_name], 'readonly')
            const objectStore = transaction.objectStore(store_name)
            const getRequest  = key ? objectStore.get(key) : objectStore.getAll()

            getRequest.onerror = (event) => {
                this.log(getRequest.error || 'An error occurred while retrieving data',store_name,key)

                reject(getRequest.error || 'An error occurred while retrieving data')
            }

            getRequest.onsuccess = (event) => {
                const result = event.target.result
                
                if (result) {
                    if(key){
                        if(life_time == -1) resolve(return_meta ? result : result.value)
                        else{
                            if(Date.now() < result.time + (life_time * 1000 * 60)) resolve(return_meta ? result : result.value)
                            else resolve(null);
                        }
                    }
                    else resolve(return_meta ? result : result.map(r=>r.value))
                } else {
                    resolve(null)
                }
            }
        })
    }

    /**
     * Получение данных из таблицы без ошибки
     * @param {string} store_name - Название таблицы
     * @param {string} key - Ключ записи
     * @param {number} life_time - Время жизни записи в минутах. -1 - без ограничений
     * @param {boolean} return_meta - Возвращать мета данные (ключ, время) вместе со значением
     * @returns {Promise<any>}
     */
    getDataAnyCase(store_name, key, life_time, return_meta = false) {
        return new Promise((resolve, reject) => {
            this.getData(store_name, key, life_time, return_meta).then(resolve).catch(()=>{
                resolve(null)
            })
        })
    }

    /**
     * Обновление данных в таблице
     * @param {string} store_name - Название таблицы
     * @param {string} key - Ключ записи
     * @param {any} value - Новое значение записи
     * @returns {Promise<void>}
     */
    updateData(store_name, key, value) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return this.log('Database not open',store_name,key),reject('Database not open');
            }

            const transaction = this.db.transaction([store_name], 'readwrite')
            const objectStore = transaction.objectStore(store_name)
            const getRequest  = objectStore.get(key)

            getRequest.onerror = (event) => {
                this.log(getRequest.error || 'An error occurred while updating data',store_name,key)

                reject(getRequest.error || 'An error occurred while updating data')
            }

            getRequest.onsuccess = (event) => {
                const result = event.target.result

                if (result) {
                    result.value = value
                    result.time = Date.now()

                    const updateRequest = objectStore.put(result)

                    updateRequest.onerror = (event) => {
                        this.log(updateRequest.error || 'An error occurred while updating data',store_name,key)

                        reject(updateRequest.error || 'An error occurred while updating data')
                    }

                    updateRequest.onsuccess = resolve
                } else {
                    this.log('No data found with the given key',store_name,key)

                    reject('No data found with the given key')
                }
            }
        })
    }

    /**
     * Перезапись данных в таблице (если нет, то создаст новую запись)
     * @param {string} store_name - Название таблицы
     * @param {string} key - Ключ записи
     * @param {any} value - Новое значение записи
     * @returns {Promise<void>}
     */
    rewriteData(store_name, key, value){
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return this.log('Database not open',store_name,key),reject('Database not open')
            }

            const transaction = this.db.transaction([store_name], 'readwrite')
            const objectStore = transaction.objectStore(store_name)
            const addRequest = objectStore.put({ key, value, time: Date.now() })

            addRequest.onerror = (event) => {
                this.log(addRequest.error || 'An error occurred while rewrite data',store_name,key)

                reject(addRequest.error || 'An error occurred while rewrite data')
            }

            addRequest.onsuccess = resolve
        })
    }

    /**
     * Удаление данных из таблицы
     * @param {string} store_name - Название таблицы
     * @param {string} key - Ключ записи
     * @returns {Promise<void>}
     */
    deleteData(store_name, key) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return this.log('Database not open',store_name,key),reject('Database not open')
            }

            const transaction = this.db.transaction([store_name], 'readwrite')
            const objectStore = transaction.objectStore(store_name)
            const deleteRequest = objectStore.delete(key)
    
            deleteRequest.onerror = (event) => {
                this.log(deleteRequest.error || 'An error occurred while deleting data',store_name,key)

                reject(deleteRequest.error || 'An error occurred while deleting data')
            }
    
            deleteRequest.onsuccess = resolve
        })
    }

    /**
     * Очистка таблицы
     * @param {string} store_name - Название таблицы
     * @returns {Promise<void>}
     */
    clearTable(store_name) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return this.log('Database not open',store_name),reject('Database not open')
            }

            const transaction  = this.db.transaction([store_name], 'readwrite')
            const objectStore  = transaction.objectStore(store_name)
            const clearRequest = objectStore.clear()

            clearRequest.onerror = (event) => {
                this.log(clearRequest.error || 'An error occurred while clearing the table',store_name)

                reject(clearRequest.error || 'An error occurred while clearing the table')
            }

            clearRequest.onsuccess = ()=>{
                resolve()
            }
        })
    }

    /**
     * Очистка всех таблиц
     * @returns {Promise<void>}
     */
    clearAll() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return this.log('Database not open'),reject('Database not open')
            }

            const objectStoreNames = this.db.objectStoreNames
            const tableNames = Array.from(objectStoreNames)

            tableNames.forEach(n=>{
                this.clearTable(n)
            })

            resolve()
        })
    }
}
