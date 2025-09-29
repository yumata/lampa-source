import Storage from './storage/storage'
import Permit from './account/permit'

/**
 * Трекер синхронизации
 * @class
 * @param {string} name - имя трекера
 * @returns {Tracker}
 */
class Tracker {
    constructor(name){
        this.name = name
    }

    /**
     * Получить трекеры синхронизации
     * @return {object} - {time, version}
     */
    get(){
        return Storage.get(this.name + '_' + this.profile(), JSON.stringify({time: 0, version: 0}))
    }

    /**
     * Сохранить трекеры синхронизации
     * @param {object} data - {time, version}
     * @return {void}
     */
    set(data){
        Storage.set(this.name + '_' + this.profile(), data)
    }

    /**
     * Обновить трекеры синхронизации
     * @param {object} data - {time, version}
     * @return {void}
     */
    update(data){
        let traker = this.get()
            traker.time    = data.time    || traker.time
            traker.version = data.version || traker.version

        this.set(traker)
    }

    /**
     * Получить ID профиля
     * @returns {number}
     */
    profile(){
        return Permit.account ? Permit.account.profile.id : 0
    }

    /**
     * Получить версию последней синхронизации
     * @returns {number}
     */
    version(){
        return this.get().version || 0
    }

    /**
     * Получить время последней синхронизации
     * @returns {number}
     */
    time(){
        return this.get().time || 0
    }
}

export default Tracker