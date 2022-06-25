import ru from '../lang/ru'
import en from '../lang/en'
import uk from '../lang/uk'

let langs = {
    ru,
    uk,
    en
}

let lang_default  = 'ru'
let lang_selected = 'en'

function translate(name){
    if(name.indexOf('#{') >= 0){
        return name.replace(/#{([a-z_-]+)}/g, function(e,s){
            return langs[lang_selected][s] || langs[lang_default][s] || s
        })
    }
    else{
        return langs[lang_selected][name] || langs[lang_default][name] || name
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
        en: 'English',
        uk: 'Український'
    }
}

export default {
    translate,
    add,
    codes
}