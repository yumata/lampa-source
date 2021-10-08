import Storage from './storage'

function init(){
    if(typeof webOS !== 'undefined'){
        Storage.set('platform','webos')
    }
    else if(typeof webapis !== 'undefined' && typeof tizen !== 'undefined'){
        Storage.set('platform','tizen')
    }
    else{
        Storage.set('platform','')
    }
    
    Storage.set('native',Storage.get('platform') ? true : false)
}

/**
 * Какая платформа
 * @returns String
 */
function get(){
    return Storage.get('platform','')
}

/**
 * Если это платформа
 * @param {String} need - какая нужна? tizen, webos, android
 * @returns Boolean
 */
function is(need){
    if(get() == need) return true
}

export default {
    init,
    get,
    is
}