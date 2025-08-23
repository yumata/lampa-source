import Template from './template'
import Keybord from './keyboard/keyboard'
import Storage from '../core/storage/storage'
import Lang from '../core/lang'

/**
 * Отображает полноэкранный ввод текста с виртуальной клавиатурой
 * @param {object} [params] - параметры
 * @param {string} [params.input] - начальный текст
 * @param {function} params.onSearch - вызывается при подтверждении ввода
 * @param {function} params.onBack - вызывается при отмене ввода
 * @return {void}
 */
function SearchInput(params = {}){
    let search = Template.get('search_box')
    let input  = ''

    function destroy(){
        $('body').toggleClass('ambience--enable',false)

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
        input = text

        if(input){
            search.find('.search-box__input').toggleClass('filled', true).html(input.replace(/\s/g,'&nbsp;'))
        }
        else{
            search.find('.search-box__input').toggleClass('filled', false).text(Lang.translate('search_input') + '...')
        }
    }

    if(Storage.field('keyboard_type') !== 'lampa') search.find('.search-box__input').hide()

    $('body').append(search)
    $('body').toggleClass('ambience--enable',true)

    let keyboard = new Keybord({
        layout: 'clarify'
    })

    keyboard.create()
    
    keyboard.listener.follow('change',(event)=>{
        change(event.value)
    })

    keyboard.listener.follow('focus',(event)=>{
        search.toggleClass('search-box--focus', true)
    })

    keyboard.listener.follow('blur',(event)=>{
        search.toggleClass('search-box--focus', false)
    })

    keyboard.listener.follow('back',back)

    keyboard.listener.follow('enter',enter)

    keyboard.value(params.input)

    change(params.input)

    keyboard.toggle()
}

export default SearchInput