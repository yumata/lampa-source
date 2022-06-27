import Storage from './storage'
import ru from '../lang/ru'
import en from '../lang/en'
import uk from '../lang/uk'

let langs = {
    ru,
    uk,
    en
}

let lang_default  = 'ru'

function translate(name, custom_code){
    name = name + ''

    let code = custom_code || Storage.get('language','ru')

    if(!langs[code]) code = lang_default


    if(name.indexOf('#{') >= 0){
        return name.replace(/#{([a-z_0-9-]+)}/g, function(e,s){
            return langs[code][s] || langs[lang_default][s] || s
        })
    }
    else{
        return langs[code][name] || langs[lang_default][name] || name
    }
}

function add(data){
    for(let name in data){
        for(let code in data[name]){
            if(langs[code]){
                langs[code][name] = data[name][code]
            }
        }
    }
}

function codes(){
    return {
        ru: 'Русский',
        uk: 'Українська',
        en: 'English',
    }
}

export default {
    translate,
    add,
    codes
}