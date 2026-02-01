import Subscribe from '../../utils/subscribe'
import Arrays from '../../utils/arrays'
import Params from '../../interaction/settings/params'
import Workers from './workers'
import Noty from '../../interaction/noty'
import Lang from '../lang'
import Cache from '../../utils/cache'

let listener = Subscribe();
let readed   = {}
let workers  = {}
let reserve  = {}

function init(){
    sync('online_view','array_string')
    sync('torrents_view','array_string')
    sync('search_history','array_string')
    sync('online_last_balanser','object_string')
    sync('user_clarifys','object_object')
    sync('torrents_filter_data','object_object')
}

/**
 * Загрузка кеша из IndexedDB
 * @doc
 * @name task
 * @alias Storage
 * @param {function} next функция обратного вызова
 */
function task(next){
    Cache.getData('storage').then((result)=>{
        if(result){
            console.log('Storage', 'load cache:', result.length)

            result.forEach(data=>{
                reserve[data.key] = data.value
            })
        }

        next()
    }).catch((e)=>{
        console.log('Storage', 'cache error:', e.message, e.stack, e)

        next()
    })
}

/**
 * Получить значение переменной из оператвной памяти localStorage
 * @doc
 * @name get
 * @alias Storage
 * @param {string} name название
 * @param {string} empty значение по умолчанию
 * @returns {any}
 */

function get(name, empty){
    let item
    let value = readed[name]

    if(typeof value == 'undefined'){
        item  = window.localStorage.getItem(name)
        value = item

        if(item == null && reserve[name]){
            value = reserve[name]
        }
    }

    value = value || empty || ''

    if(value == 'true' || value == 'false') return value == 'true' ? true : false

    if(readed[name] && (Arrays.isObject(value) || Arrays.isArray(value))) return readed[name]

    let convert  = parseInt(value)

    if(!isNaN(convert) && /^\d+$/.test(value)) return convert

    let i = typeof value == 'string' ? value[0] : ''

    if(i == '[' || i == '{'){
        try {
            value = JSON.parse(value)
        } 
        catch (error) {}
    }

    readed[name] = value
    
    return value
}

/**
 * Получить значение переменной напрямую из localStorage
 * @doc
 * @name value
 * @alias Storage
 * @param {string} name название
 * @param {string} empty значение по умолчанию
 * @returns {string}
 */

function value(name,empty){
    return window.localStorage.getItem(name) || empty || '';
}

/**
 * Установить значение переменной в оператвную память и localStorage
 * @doc
 * @name set
 * @alias Storage
 * @param {string} name название
 * @param {any} value значение
 * @param {boolean} nolisten по умолчанию `false`, если `true`, то не отправлять событие об изменении
 * @returns {string}
 */

function set(name, value, nolisten, callerror){
    readed[name] = value

    let write = ''

    try{
        write = Arrays.isObject(value) || Arrays.isArray(value) ? JSON.stringify(value) : value
    }
    catch(e){
        console.log('Storage', name, 'JSON.stringify error:', e, value)
    }

    try{
        window.localStorage.setItem(name, write)
    }
    catch(e){
        if(e.name == 'QuotaExceededError'){
            console.log('Storage', 'QuotaExceededError:', name, value)

            window.localStorage.removeItem(name)

            Cache.rewriteData('storage', name, {key: name, value: write}).then(()=>{
                reserve[name] = write
            }).catch(e=>{
                console.log('Storage', 'Cache error:', e.message, e.stack, e)
            })

            if(callerror) callerror(e)
        }
    }
    
    if(!nolisten) listener.send('change', {name: name, value: value})
}

/**
 * Добавить значение в массив к уже существующим
 * @doc
 * @name add
 * @alias Storage
 * @param {string} name название
 * @param {any} new_value значение
 * @param {boolean} nolisten по умолчанию `false`, если `true`, то не отправлять событие об изменении
 * @returns {boolean} true если значение добавлено, false если значение уже существует
 */

function add(name, new_value, nolisten){
    let list = get(name, '[]')

    if(list.indexOf(new_value) == -1){
        list.push(new_value)

        set(name, list, nolisten)

        if(!nolisten) listener.send('add', {name: name, value: new_value})

        return true
    }
}

/**
 * Значение по умолчанию из параметров лампы
 * @doc
 * @name field
 * @alias Storage
 * @param {string} name название
 * @returns {any} значение
 */

function field(name){
    return Params.field(name)
}

/**
 * Записать значение в кэш с ограничением по количеству данных
 * @doc
 * @name cache
 * @alias Storage
 * @param {string} name название
 * @param {integer} max максимальное количество данных
 * @param {string} empty значение по умолчанию
 * @returns {any} значение
 */

function cache(name, max, empty){
    let result = get(name, JSON.stringify(empty))

    if(Arrays.isObject(empty)){
        let keys = Arrays.getKeys(result)

        if(keys.length > max){
            let remv = keys.slice(0, keys.length - max)

            remv.forEach(k=>{
                delete result[k]
            })

            set(name,result)
        }
    }
    else if(result.length > max){
        result = result.slice(result.length - max)

        set(name,result)
    }

    return result
}

/**
 * Добавить переменную в синхронизацию с сервером
 * @doc
 * @name sync
 * @alias Storage
 * @param {string} field_name название
 * @param {string} class_type тип данных, доступно (array_string | array_object_id | object_string | object_object) \n\n `array_string` - ['a','b','c'] \n\n `array_object_id` - [{id:1,..},{id:2,..}] \n\n `object_string` - {a:'a',b:'b'} \n\n `object_object` - {a:{a:'a'},b:{b:'b'}}
 */

function sync(field_name, class_type){
    if(Workers[class_type] && !workers[field_name]){
        workers[field_name] = new Workers[class_type](field_name)
        workers[field_name].init(class_type)
    }
}

/**
 * Удалить значение из синхронизации
 * @doc
 * @name remove
 * @alias Storage
 * @param {string} field_name название
 * @param {any} value значение
 */

function remove(field_name, value){
    if(workers[field_name]) workers[field_name].remove(value)
}

/**
 * Очистить полностью значение из синхронизации
 * @doc
 * @name clean
 * @alias Storage
 * @param {string} field_name название
 */

function clean(field_name){
    if(workers[field_name]) workers[field_name].clean()
}

/**
 * Очистить кэш
 * @doc
 * @name clear
 * @alias Storage
 * @param {function} full `true` - полностью очистить, `false` - очистить только кеш
 */

function clear(full){
    listener.send('clear', {full})

    if(full){
        Noty.show(Lang.translate('settings_clear_cache'))

        localStorage.clear()
    } 
    else{
        Noty.show(Lang.translate('settings_clear_cache_only'))

        let need = ['online_view','ser_clarifys','torrents_view','account_bookmarks','recomends_list','file_view','timetable','search_history','recomends_scan']
        let more = ['online_','file_view_','storage_']

        for (var key in localStorage){
            if(more.find(w=>key.indexOf(w) >= 0)) need.push(key)
        }

        need.forEach(a=>{
            localStorage.setItem(a, '')
        })
    }

    setTimeout(()=>{
        window.location.reload()
    },3000)
}

/**
 * Получить размер данных в localStorage
 * @doc
 * @name getsize
 * @alias Storage
 * @param {function} call функция обратного вызова
 */

function getsize(call){
    if (localStorage) {
        let i = 0
        let t = setInterval(()=>{
            i += 250

            try {
                localStorage.setItem('testsize', new Array((i * 1024) + 1).join('a'))
            } 
            catch (e) {
                localStorage.removeItem('testsize')
                
                clearInterval(t)
            }

            call((i - 250) * 1024)
        },100)
    }
    else{
        call(5000 * 1024)
    }
}

export default {
    listener,
    init,
    get,
    set,
    field,
    cache,
    add,
    value,
    sync,
    remove,
    clear,
    clean,
    getsize,
    task
}