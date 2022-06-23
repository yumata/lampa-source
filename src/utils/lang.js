import ru from '../lang/ru'
import en from '../lang/en'

let langs = {
    ru,
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

function add(lang, name, text){
    if(langs[lang]){
        langs[lang][name] = text
    }
}

export default {
    translate,
    add
}