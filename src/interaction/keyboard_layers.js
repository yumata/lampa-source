let layers = {
    search: {
        'sim': [
            '{MIC} {LANG} {ABC} {SPACE} 1 2 3 4 5 6 7 8 9 0 - + _ : ( ) [ ] . / {BKSP}'
        ],
        'en': [
            '{MIC} {LANG} {SIM} {SPACE} q w e r t y u i o p a s d f g h j k l z x c v b n m . {BKSP}',
        ],
        'uk': [
            '{MIC} {LANG} {SIM} {SPACE} й ц у к е н г ш щ з х ї ф і в а п р о л д ж є я ч с м и т ь б ю . {BKSP}',
        ],
        'default': [
            '{MIC} {LANG} {SIM} {SPACE} й ц у к е ё н г ш щ з х ъ ф ы в а п р о л д ж э я ч с м и т ь б ю . {BKSP}',
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