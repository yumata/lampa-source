import Sources from './search/sources'
import History from './search/history'
import Template from '../interaction/template'
import Controller from '../interaction/controller'
import Keybord from '../interaction/keyboard'
import Storage from '../utils/storage'
import Lang from '../utils/lang'
import Scroll from '../interaction/scroll'
import Arrays from '../utils/arrays'
import Layer from '../utils/layer'
import HeadBackward from '../interaction/head_backward'
import Subscribe from '../utils/subscribe'

let html = $('<div class="main-search"></div>'),
    search,
    history,
    sources,
    keyboard,
    scroll,
    input = '',
    params = {},
    additional = [],
    listener = Subscribe()

function open(use_params = {}){
    params = use_params

    input = use_params.input || ''

    $('body').toggleClass('ambience--enable',true)
    $('body').toggleClass('search--open',true)

    create()
    toggle()

    Layer.update(html[0])

    listener.send('open')
}

function toggle(){
    Controller.add('search',{
        invisible: true,
        toggle: ()=>{
            keyboard.toggle()
        },
        update: ()=>{},
        back: destroy
    })

    Controller.toggle('search')
}

function scrollTo(element){
    scroll.update(element ? element : search.find('.search__input'),true)
}

function create(){
    search = Template.get('search')

    scroll = new Scroll({step: 300})

    scroll.height()

    scroll.render().addClass('search')

    scroll.append(HeadBackward(Lang.translate('search')))

    scroll.append(search)

    html.append(scroll.render())

    scroll.onScroll = (step)=>{
        Layer.visible(scroll.render(true))
    }

    if(Storage.field('keyboard_type') !== 'lampa') search.find('.search__input').hide()

    createKeyboard()
    createHistory()
    createSources()

    keyboard.value(input)

    sources.search(input, true)
}

function createSources(){
    sources = new Sources({sources: params.sources, additional})
    sources.create()

    sources.listener.follow('back',destroy)

    sources.listener.follow('up',()=>{
        if(history.any()) history.toggle()
        else keyboard.toggle()

        scrollTo()
    })

    sources.listener.follow('toggle',(e)=>{
        scrollTo(e.element)
    })

    sources.listener.follow('select',(e)=>{
        if(input) history.add(input)

        destroy()
    })

    search.find('.search__sources').append(sources.tabs())
    search.find('.search__results').append(sources.render())

    listener.send('sources',{sources})
}

function createHistory(){
    history = new History()
    history.create()

    history.listener.follow('down',()=>{
        sources.toggle(true)
    })

    history.listener.follow('up',()=>{
        keyboard.toggle()
    })

    history.listener.follow('enter',(event)=>{
        keyboard.value(event.value)

        sources.search(event.value, true)
    })

    history.listener.follow('back',destroy)

    search.find('.search__history').append(history.render())
}

function createKeyboard(){
    keyboard = new Keybord({
        layout: 'search'
    })

    keyboard.create()
    
    keyboard.listener.follow('change',(event)=>{
        input = event.value.trim()

        if(input){
            search.find('.search__input').text(input)

            sources.search(input)
        }
        else{
            search.find('.search__input').text(Lang.translate('search_input') + '...')
        }
    })

    keyboard.listener.follow('down',()=>{
        if(history.any()) history.toggle()
        else sources.toggle()
    })

    keyboard.listener.follow('hover',()=>{
        sources.search(input)
    })

    keyboard.listener.follow('back',destroy)
}

function addSource(source){
    additional.push(source)
}

function removeSource(source){
    Arrays.remove(additional,source)
}

function render(){
    return html
}

function destroy(){
    keyboard.destroy()
    history.destroy()
    sources.destroy()

    search.remove()

    html.empty()

    if(params.onBack) params.onBack()
    else Controller.toggle('content')

    $('body').toggleClass('ambience--enable',false)
    $('body').toggleClass('search--open',false)

    params = {}

    input = ''

    listener.send('close')
}

function close(){
    destroy()
}

export default {
    listener,
    open,
    render,
    addSource,
    removeSource,
    close
}