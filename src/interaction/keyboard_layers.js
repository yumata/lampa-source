import Controller from './controller'
import Subscribe from '../utils/subscribe'
import Noty from './noty'
import Platform from '../utils/platform'
import Android from '../utils/android'
import Storage from '../utils/storage'
import Keypad from './keypad'
import Lang from '../utils/lang'

let layers = {
    search: {
        'sim': [
            '{MIC} {LANG} {ABC} {SPACE} 1 2 3 4 5 6 7 8 9 0 - {BKSP}'
        ],
        'en': [
            '{MIC} {LANG} {SIM} {SPACE} a b c d e f g h i j k l m n o p q r s t u v w x y z . {BKSP}',
        ],
        'uk': [
            '{MIC} {LANG} {SIM} {SPACE} а б в г ґ д е є ж з и і ї й к л м н о п р с т у ф х ц ч ш щ ь ю я . {BKSP}',
        ],
        'default': [
            '{MIC} {LANG} {SIM} {SPACE} а б в г д е ё ж з и й к л м н о п р с т у ф х ц ч ш щ ъ ы ь э ю я . {BKSP}',
        ]
    },
    clarify: {
        'en': [
            '1 2 3 4 5 6 7 8 9 0 - {BKSP}',
            'q w e r t y u i o p',
            'a s d f g h j k l',
            'z x c v b n m .',
            '{MIC} {LANG} {SPACE} {SEARCH}'
        ],
        'uk': [
            '1 2 3 4 5 6 7 8 9 0 - {BKSP}',
            'й ц у к е н г ш щ з х ї',
            'ф і в а п р о л д ж є',
            'я ч с м и т ь б ю .',
            '{MIC} {LANG} {SPACE} {SEARCH}'
        ],
        'default': [
            '1 2 3 4 5 6 7 8 9 0 - {BKSP}',
            'й ц у к е н г ш щ з х ъ',
            'ф ы в а п р о л д ж э',
            'я ч с м и т ь б ю .',
            '{MIC} {LANG} {SPACE} {SEARCH}'
        ],
    },
    default: {
        'en': [
            '{SIM} 1 2 3 4 5 6 7 8 9 0 - + = {BKSP}',
            '{LANG} q w e r t y u i o p',
            'a s d f g h j k l /',
            '{SHIFT} z x c v b n m , . : http://',
            '{SPACE}'
        ],
        'uk': [
            '{SIM} 1 2 3 4 5 6 7 8 9 0 - + = {BKSP}',
            '{LANG} й ц у к е н г ш щ з х ї',
            'ф і в а п р о л д ж є',
            '{SHIFT} я ч с м и т ь б ю . : http://',
            '{SPACE}'
        ],
        'sim': [
            '{ABC} 1 2 3 4 5 6 7 8 9 0 - + = {BKSP}',
            '{LANG} ! @ # $ % ^ & * ( ) [ ]',
            '- _ = + \\ | [ ] { }',
            '; : \' " , . < > / ?',
            '{SPACE}'
        ],
        'default': [
            '{SIM} 1 2 3 4 5 6 7 8 9 0 - + = {BKSP}',
            '{LANG} й ц у к е н г ш щ з х ъ',
            'ф ы в а п р о л д ж э',
            '{SHIFT} я ч с м и т ь б ю , . : http://',
            '{SPACE}'
        ]
    }
}

function add(name, layout){
    layers[name] = layout
}

function addLang(name, code, layout){
    layers[name][code] = layout
}

function get(name){
    return layers[name]
}

export default {
    add,
    addLang,
    get
}