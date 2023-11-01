import Subscribe from '../utils/subscribe'

export default class IndexedDB {
    constructor(database_name, tables = [], version = 3) {
        this.listener = Subscribe();

        this.database_name = 'lampa_' + database_name;
        
        this.tables = tables

        this.version = version;

        this.db = null;
        this.logs = true
    }

    log(err,store_name,key){
        if(this.logs) console.log('DB', this.database_name + (store_name ? '_' + store_name : '') + (key ? ' -> [' + key + ']' : ''), err)
    }

    openDatabase() {
        return new Promise((resolve, reject) => {
            if (!('indexedDB' in window)) return this.log('Not supported'),reject('Not supported');

            if(!this.tables.length) return this.log('No tables'),reject('No tables');

            const request = indexedDB.open(this.database_name, this.version);

            request.onerror = (event)=> {
                this.log(request.error || 'An error occurred while opening the database')

                reject(request.error || 'An error occurred while opening the database');
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;

                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                this.log('OnUpgradeNeeded')
                
                this.tables.forEach(name => {
                    if(!db.objectStoreNames.contains(name)){
                        this.log('Create table - ' + name)

                        db.createObjectStore(name, { keyPath: 'key' });
                    }
                });
            };
        });
    }

    addData(store_name,key, value) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return this.log('Database not open',store_name,key),reject('Database not open');
            }
            const transaction = this.db.transaction([store_name], 'readwrite');
            const objectStore = transaction.objectStore(store_name);
            const addRequest = objectStore.add({ key, value, time: Date.now() });

            addRequest.onerror = (event) => {
                this.log(addRequest.error || 'An error occurred while adding data',store_name,key)

                reject(addRequest.error || 'An error occurred while adding data');
            };

            addRequest.onsuccess = resolve
        });
    }

    getData(store_name, key, life_time = -1) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return this.log('Database not open',store_name,key),reject('Database not open');
            }
            const transaction = this.db.transaction([store_name], 'readonly');
            const objectStore = transaction.objectStore(store_name);
            const getRequest  = key ? objectStore.get(key) : objectStore.getAll();

            getRequest.onerror = (event) => {
                this.log(getRequest.error || 'An error occurred while retrieving data',store_name,key)

                reject(getRequest.error || 'An error occurred while retrieving data');
            };

            getRequest.onsuccess = (event) => {
                const result = event.target.result;
                
                if (result) {
                    if(key){
                        if(life_time == -1) resolve(result.value);
                        else{
                            if(Date.now() < result.time + (life_time * 1000 * 60)) resolve(result.value);
                            else resolve(null);
                        }
                    }
                    else resolve(result.map(r=>r.value));
                } else {
                    resolve(null);
                }
            };
        });
    }

    getDataAnyCase(store_name, key, life_time){
        return new Promise((resolve, reject) => {
            this.getData(store_name, key, life_time).then(resolve).catch(()=>{
                resolve(null)
            })
        })
    }

    updateData(store_name, key, value) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return this.log('Database not open',store_name,key),reject('Database not open');
            }
            const transaction = this.db.transaction([store_name], 'readwrite');
            const objectStore = transaction.objectStore(store_name);
            const getRequest = objectStore.get(key);

            getRequest.onerror = (event) => {
                this.log(getRequest.error || 'An error occurred while updating data',store_name,key)

                reject(getRequest.error || 'An error occurred while updating data');
            };

            getRequest.onsuccess = (event) => {
                const result = event.target.result;
                if (result) {
                    result.value = value;
                    result.time = Date.now();

                    const updateRequest = objectStore.put(result);

                    updateRequest.onerror = (event) => {
                        this.log(updateRequest.error || 'An error occurred while updating data',store_name,key)

                        reject(updateRequest.error || 'An error occurred while updating data');
                    };

                    updateRequest.onsuccess = resolve
                } else {
                    this.log('No data found with the given key',store_name,key)

                    reject('No data found with the given key');
                }
            };
        });
    }

    rewriteData(store_name, key, value){
        return new Promise((resolve, reject) => {
            this.getData(store_name, key).then(ready=>{
                return ready ? this.updateData(store_name, key, value) : this.addData(store_name, key, value);
            }).then(resolve).catch(reject);
        });
    }

    deleteData(store_name, key) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return this.log('Database not open',store_name,key),reject('Database not open');
            }
            const transaction = this.db.transaction([store_name], 'readwrite');
            const objectStore = transaction.objectStore(store_name);
            const deleteRequest = objectStore.delete(key);
    
            deleteRequest.onerror = (event) => {
                this.log(deleteRequest.error || 'An error occurred while deleting data',store_name,key)

                reject(deleteRequest.error || 'An error occurred while deleting data');
            };
    
            deleteRequest.onsuccess = resolve
        });
    }
}
