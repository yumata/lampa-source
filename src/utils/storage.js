import Subscribe from './subscribe'
import Arrays from './arrays'
import Params from '../components/settings/params'
import Workers from './storage_workers'
import Noty from '../interaction/noty'
import Lang from './lang'

let listener = Subscribe();
let readed = {}
let workers = {}

function init(){
    sync('online_view','array_string')
    sync('torrents_view','array_string')
    sync('search_history','array_string')
    sync('menu_sort','array_string')
    //sync('menu_hide','array_string')
    //sync('timetable','array_object_id') слишком большие данные, что-то потом придумаю
    sync('online_last_balanser','object_string')
    sync('user_clarifys','object_object')
}

function get(name, empty){
    let value = readed[name] || window.localStorage.getItem(name) || empty || ''

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

function value(name,empty){
    return window.localStorage.getItem(name) || empty || '';
}

function set(name, value, nolisten){
    try{
        if(Arrays.isObject(value) || Arrays.isArray(value)) {
            let str = JSON.stringify(value)

            window.localStorage.setItem(name, str)
        } 
        else {
            window.localStorage.setItem(name, value)
        }

        readed[name] = value
    }
    catch(e){}
    
    if(!nolisten) listener.send('change', {name: name, value: value})
}

function add(name, new_value){
    let list = get(name, '[]')

    if(list.indexOf(new_value) == -1){
        list.push(new_value)

        set(name, list)

        listener.send('add', {name: name, value: new_value})

        return true
    }
}

function field(name){
    return Params.field(name)
}

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

function sync(field_name, class_type){
    if(Workers[class_type] && !workers[field_name]){
        workers[field_name] = new Workers[class_type](field_name)
        workers[field_name].init(class_type)
    }
}

function remove(field_name, value){
    if(workers[field_name]) workers[field_name].remove(value)
}

function clear(full){
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
            localStorage.removeItem(a)
        })
    }

    setTimeout(()=>{
        window.location.reload()
    },3000)
}

function getsize(call){
    if (localStorage) {
        let ok = true
        let left = 0
        let str = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
        str += str
        str += str
        str += str
        str += str
        str += str
        str += str
        let right = str.length
        let t = setInterval(()=>{
            if (ok && left < 16 * 1024 * 1024) {
                str += str
                right = str.length
                try {
                    localStorage.setItem('testsize', str)
                    left = str.length
                    call(left)
                }
                catch (e) {
                    ok = false
                }
            } else if (!ok && right - left > 1024) {
                let i = left + Math.trunc((right - left) / 2)
                try {
                    localStorage.setItem('testsize', str.substring(0, i))
                    left = i
                    call(left)
                }
                catch (e) {
                    right = i
                }
            } else {
                localStorage.removeItem('testsize')
                clearInterval(t)
            }
        }, 100)
    }
    else call(5 * 1024 * 1024)
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
    getsize
}