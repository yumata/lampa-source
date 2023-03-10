import Subscribe from '../utils/subscribe'

export default class IndexedDB {
    constructor(database_name, tables = [], version = 3) {
        this.listener = Subscribe();

        this.database_name = 'lampa_' + database_name;
        
        this.tables = tables

        this.version = version;

        this.db = null;
    }

    openDatabase() {
        return new Promise((resolve, reject) => {
            if (!('indexedDB' in window)) return reject('Not supported');

            if(!this.tables.length) return reject('No tables');

            const request = indexedDB.open(this.database_name, this.version);

            request.onerror = function (event) {
                reject('An error occurred while opening the database');
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;

                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                this.tables.forEach(name => {
                    if(!db.objectStoreNames.contains(name))  db.createObjectStore(name, { keyPath: 'key' });
                });
            };
        });
    }

    addData(store_name,key, value) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject('Database not open');
                return;
            }
            const transaction = this.db.transaction([store_name], 'readwrite');
            const objectStore = transaction.objectStore(store_name);
            const addRequest = objectStore.add({ key, value, time: Date.now() });

            addRequest.onerror = function (event) {
                reject('An error occurred while adding data');
            };

            addRequest.onsuccess = function (event) {
                resolve();
            };
        });
    }

    getData(store_name, key, life_time = -1) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject('Database not open');
                return;
            }
            const transaction = this.db.transaction([store_name], 'readonly');
            const objectStore = transaction.objectStore(store_name);
            const getRequest = objectStore.get(key);

            getRequest.onerror = function (event) {
                reject('An error occurred while retrieving data');
            };

            getRequest.onsuccess = function (event) {
                const result = event.target.result;
                if (result) {
                    if(life_time == -1) resolve(result.value);
                    else{
                        if(Date.now() < result.time + (life_time * 1000 * 60)) resolve(result.value);
                        else resolve(null);
                    }
                } else {
                    resolve(null);
                }
            };
        });
    }

    updateData(store_name, key, value) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject('Database not open');
                return;
            }
            const transaction = this.db.transaction([store_name], 'readwrite');
            const objectStore = transaction.objectStore(store_name);
            const getRequest = objectStore.get(key);

            getRequest.onerror = function (event) {
                reject('An error occurred while updating data');
            };

            getRequest.onsuccess = function (event) {
                const result = event.target.result;
                if (result) {
                    result.value = value;
                    result.time = Date.now();

                    const updateRequest = objectStore.put(result);

                    updateRequest.onerror = function (event) {
                        reject('An error occurred while updating data');
                    };

                    updateRequest.onsuccess = function (event) {
                        resolve();
                    };
                } else {
                    reject('No data found with the given key');
                }
            };
        });
    }
}
