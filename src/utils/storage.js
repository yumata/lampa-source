import Subscribe from './subscribe'
import Arrays from './arrays'
import Params from '../components/settings/params'

let listener = Subscribe();

function get(name, empty){
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
    
    return value;
}

function set(name, value){
    if(Arrays.isObject(value) || Arrays.isArray(value)) {
        let str = JSON.stringify(value)

        window.localStorage.setItem(name, str)
    } 
    else {
        window.localStorage.setItem(name, value)
    }
    
    listener.send('change', {name: name, value: value})
}

function field(name){
    return Params.field(name)
}

export default {
    listener,
    get,
    set,
    field
}