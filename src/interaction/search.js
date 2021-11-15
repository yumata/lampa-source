import Template from './template'
import Keybord from './keyboard'

function create(params = {}){
    let search = Template.get('search_box')
    let input  = ''

    function destroy(){
        keyboard.destroy()

        search.remove()

        search = null
    }

    function back(){
        destroy()

        params.onBack()
    }

    function enter(){
        destroy()

        params.onSearch(input)
    }

    function change(text){
        input = text.trim()

        if(input){
            search.find('.search-box__input').text(input)
        }
        else{
            search.find('.search-box__input').text('Введите текст...')
        }
    }

    $('body').append(search)

    let keyboard = new Keybord({
        layout: {
            'en': [
                '1 2 3 4 5 6 7 8 9 0 {bksp}',
                'q w e r t y u i o p',
                'a s d f g h j k l',
                'z x c v b n m',
                '{RU} {space} {search}'
            ],
            'default': [
                '1 2 3 4 5 6 7 8 9 0 {bksp}',
                'й ц у к е н г ш щ з х ъ',
                'ф ы в а п р о л д ж э',
                'я ч с м и т ь б ю',
                '{EN} {space} {search}'
            ],
        }
    })

    keyboard.create()
    
    keyboard.listener.follow('change',(event)=>{
        change(event.value)
    })

    keyboard.listener.follow('back',back)

    keyboard.listener.follow('enter',enter)

    keyboard.value(params.input)

    change(params.input)

    keyboard.toggle()
}

export default create