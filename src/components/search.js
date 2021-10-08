import Results from './search/results'
import History from './search/history'
import Template from '../interaction/template'
import Controller from '../interaction/controller'
import Keybord from '../interaction/keyboard'

let html = $('<div></div>'),
    search,
    results,
    history,
    keyboard,
    input = ''

function create(){
    search = Template.get('search')

    html.append(search)

    createHistory()
    createResults()
    createKeyboard()
}

function createHistory(){
    history = new History()
    history.create()

    history.listener.follow('right',()=>{
        results.toggle()
    })

    history.listener.follow('up',()=>{
        keyboard.toggle()
    })

    history.listener.follow('enter',(event)=>{
        results.clear()
        keyboard.value(event.value)
        results.toggle()
    })

    history.listener.follow('back',destroy)

    search.find('.search__history').append(history.render())
}

function createResults(){
    results = new Results()
    results.create()

    results.listener.follow('left',()=>{
        keyboard.toggle()
    })

    results.listener.follow('enter',()=>{
        if(input) history.add(input)

        destroy()
    })

    results.listener.follow('back',destroy)

    search.find('.search__results').append(results.render())
}

function createKeyboard(){
    keyboard = new Keybord({
        layout: {
            'en': [
                '1 2 3 4 5 6 7 8 9 0',
                'q w e r t y u i o p',
                'a s d f g h j k l',
                'z x c v b n m',
                '{RU} {space} {bksp}'
            ],
            'default': [
                '1 2 3 4 5 6 7 8 9 0',
                'й ц у к е н г ш щ з х ъ',
                'ф ы в а п р о л д ж э',
                'я ч с м и т ь б ю',
                '{EN} {space} {bksp}'
            ],
        }
    })

    keyboard.create()
    
    keyboard.listener.follow('change',(event)=>{
        input = event.value.trim()

        if(input){
            search.find('.search__input').text(input)

            results.search(input)
        }
        else{
            search.find('.search__input').text('Введите текст...')
        }
    })

    keyboard.listener.follow('right',()=>{
        results.toggle()
    })

    keyboard.listener.follow('down',()=>{
        history.toggle()
    })

    keyboard.listener.follow('back',destroy)

    keyboard.toggle()
}

function render(){
    return html
}

function destroy(){
    keyboard.destroy()
    results.destroy()
    history.destroy()

    search.remove()

    html.empty()

    Controller.toggle('content')
}

Controller.add('search',{
    invisible: true,
    toggle: ()=>{
        create()
    },
    back: destroy
})

export default {
    render
}