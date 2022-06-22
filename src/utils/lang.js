import ru from '../lang/ru'
import en from '../lang/en'

let langs = {
    ru,
    en
}

let lang_default  = 'ru'
let lang_selected = 'en'

function translate(name){
    return langs[lang_selected][name] || langs[lang_default][name] || ''
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