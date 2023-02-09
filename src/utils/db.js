// IndexedDB wrapper class
export default class IndexedDB {

    // connect to IndexedDB database
    constructor(dbName, dbVersion, dbUpgrade) {
  
      return new Promise((resolve, reject) => {
  
        // connection object
        this.db = null;
  
        // no support
        if (!('indexedDB' in window)) reject('not supported');
  
        // open database
        const dbOpen = indexedDB.open(dbName, dbVersion);
  
        if (dbUpgrade) {
  
          // database upgrade event
          dbOpen.onupgradeneeded = e => {
            dbUpgrade(dbOpen.result, e.oldVersion, e.newVersion);
          };
        }
  
        dbOpen.onsuccess = () => {
          this.db = dbOpen.result;
          resolve( this );
        };
  
        dbOpen.onerror = e => {
          reject(`IndexedDB error: ${ e.target.errorCode }`);
        };
  
      });
  
    }
  
  
    // return database connection
    get connection() {
      return this.db;
    }
  
  
    // store item
    add(storeName, name, value) {
  
      return new Promise((resolve, reject) => {
  
        // new transaction
        const
          transaction = this.db.transaction(storeName, 'readwrite'),
          store = transaction.objectStore(storeName);
  
        // write record
        store.add({name,value});
  
        transaction.oncomplete = () => {
          resolve(true); // success
        };
  
        transaction.onerror = () => {
          reject(transaction.error); // failure
        };
  
      });
  
    }
  
  
    // get named item
    get(storeName, name) {
  
      return new Promise((resolve, reject) => {
  
        // new transaction
        const
          transaction = this.db.transaction(storeName, 'readonly'),
          store = transaction.objectStore(storeName),
  
          // read record
          request = store.get(name);
  
        request.onsuccess = () => {
          resolve(request.result); // success
        };
  
        request.onerror = () => {
          reject(request.error); // failure
        };
  
      });
  
    }
  
  
  }