import Subscribe from './subscribe'
import Arrays from './arrays'
import Params from '../components/settings/params'

let listener = Subscribe();
let readed = {}

function get(name, empty){
    //немного оптимизации, правда могут быть глюки
    if(readed[name]) return readed[name].value

    let value    = window.localStorage.getItem(name) || empty || '';
    let convert  = parseInt(value);

    if(!isNaN(convert) && /^\d+$/.test(value)) return convert;

    if(value == 'true' || value == 'false'){
        return value == 'true' ? true : false;
    }

    try {
        value = JSON.parse(value)
    } 
    catch (error) {}

    readed[name] = {
        time: Date.now(),
        value: value
    }
    
    return value;
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

        if(readed[name]) readed[name].value = value
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


export default {
    listener,
    get,
    set,
    field,
    cache,
    add,
    value
}