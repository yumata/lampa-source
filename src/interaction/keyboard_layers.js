let http = window.location.protocol == 'https:' ? 'https://' : 'http://'

let layers = {
    search: {
        'sim': [
            '{MIC} {ABC} 1 2 3 4 5 6 7 8 9 0 {BKSP}',
            '{LANG} - + _ : ( ) [ ] . / {SPACE}'
        ],
        'en': [
            '{MIC} q w e r t y u i o p {BKSP}',
            '{LANG} a s d f g h j k l',
            '{SIM} z x c v b n m . {SPACE}',
        ],
        'uk': [
            '{MIC} й ц у к е н г ш щ з х ї {BKSP}',
            '{LANG} ф і в а п р о л д ж є',
            '{SIM} я ч с м и т ь б ю . {SPACE}',
        ],
        'default': [
            '{MIC} й ц у к е н г ш щ з х ъ {BKSP}',
            '{LANG} ё ф ы в а п р о л д ж э',
            '{SIM} я ч с м и т ь б ю . {SPACE}',
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
            'a s d f g h j k l / {ENTER}',
            '{SHIFT} z x c v b n m , . : ' + http,
            '{SPACE}'
        ],
        'uk': [
            '{SIM} 1 2 3 4 5 6 7 8 9 0 - + = {BKSP}',
            '{LANG} й ц у к е н г ш щ з х ї',
            'ф і в а п р о л д ж є {ENTER}',
            '{SHIFT} я ч с м и т ь б ю . : ' + http,
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
            'ф ы в а п р о л д ж э {ENTER}',
            '{SHIFT} я ч с м и т ь б ю , . : ' + http,
            '{SPACE}'
        ]
    },
    nums: {
        'default': [
            '0 1 2 3 4 {BKSP}',
            '5 6 7 8 9 {ENTER}',
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