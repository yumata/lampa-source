import Template from '../template'
import Subscribe from '../../utils/subscribe'
import Controller from '../controller'
import State from '../../utils/machine'
import Select from '../select'
import Storage from '../../utils/storage'
import Info from './info'
import Arrays from '../../utils/arrays'

let html     = Template.get('player_panel')
let listener = Subscribe()

let condition = {}
let timer     = {}
let tracks    = []
let subs      = []

let elems = {
    peding: $('.player-panel__peding',html),
    position: $('.player-panel__position',html),
    time: $('.player-panel__time',html),
    timenow: $('.player-panel__timenow',html),
    timeend: $('.player-panel__timeend',html),
    title: $('.player-panel__filename',html),
    tracks: $('.player-panel__tracks',html),
    subs: $('.player-panel__subs',html)
}

let last

/**
 * Отсеживаем состояние, 
 * когда надо показать панель, а когда нет
 */
let state = new State({
    state: 'start',
    transitions: {
        start: function(){
            clearTimeout(timer.hide)
            clearTimeout(timer.rewind)

            this.dispath('canplay')
        },
        canplay: function(){
            if(condition.canplay) this.dispath('visible')
            else visible(true)
        },
        visible: function(){
            if(condition.visible) visible(true)
            else this.dispath('rewind')
        },
        rewind: function(){
            clearTimeout(timer.rewind)

            if(condition.rewind){
                visible(true)

                timer.rewind = setTimeout(()=>{
                    condition.rewind = false

                    this.dispath('hide')
                },1000)
            }
            else{
                this.dispath('hide')
            }
        },
        hide: function(){
            clearTimeout(timer.hide)

            timer.hide = setTimeout(()=>{
                visible(false)
            },1000)
        }
    }
})


html.find('.selector').on('hover:focus',(e)=>{
    last = e.target
})

html.find('.player-panel__playpause').on('hover:enter',(e)=>{
    listener.send('playpause',{})
})

html.find('.player-panel__next').on('hover:enter',(e)=>{
    listener.send('next',{})
})

html.find('.player-panel__prev').on('hover:enter',(e)=>{
    listener.send('prev',{})
})

html.find('.player-panel__rprev').on('hover:enter',(e)=>{
    listener.send('rprev',{})
})

html.find('.player-panel__rnext').on('hover:enter',(e)=>{
    listener.send('rnext',{})
})

html.find('.player-panel__playlist').on('hover:enter',(e)=>{
    listener.send('playlist',{})
})

/**
 * Выбор аудиодорожки
 */
elems.tracks.on('hover:enter',(e)=>{
    if(tracks.length){
        tracks.forEach((element, p) => {
            element.title = (p + 1) + ' / ' + (element.language || element.name || 'Неизвестно') + ' ' + (element.label || '')
        })

        Select.show({
            title: 'Аудиодорожки',
            items: tracks,
            onSelect: (a)=>{
                tracks.forEach(element => {
                    element.enabled  = false
                    element.selected = false
                })

                a.enabled  = true
                a.selected = true
    
                Controller.toggle('player_panel')
            },
            onBack: ()=>{
                Controller.toggle('player_panel')
            }
        })
    }
})

/**
 * Выбор субтитров
 */
elems.subs.on('hover:enter',(e)=>{
    if(subs.length){
        if(subs[0].index !== -1){
            Arrays.insert(subs, 0, {
                title: 'Отключено',
                selected: true,
                index: -1
            })
        }

        subs.forEach((element, p) => {
            if(element.index !== -1) element.title = p + ' / ' + (element.language || element.label || 'Неизвестно')
        })

        Select.show({
            title: 'Субтитры',
            items: subs,
            onSelect: (a)=>{
                subs.forEach(element => {
                    element.mode     = 'disabled'
                    element.selected = false
                })

                a.mode     = 'showing'
                a.selected = true

                listener.send('subsview',{status: a.index > -1 ? true : false})
    
                Controller.toggle('player_panel')
            },
            onBack: ()=>{
                Controller.toggle('player_panel')
            }
        })
    }
})

/**
 * Выбор масштаба видео
 */
html.find('.player-panel__size').on('hover:enter',(e)=>{
    let select = Storage.get('player_size','default')

    let items = [
        {
            title: 'По умолчанию',
            subtitle: 'Размер видео по умолчанию',
            value: 'default',
            selected: select == 'default'
        },
        {
            title: 'Расширить',
            subtitle: 'Расширяет видео на весь экран',
            value: 'cover',
            selected: select == 'cover'
        }
    ]

    Select.show({
        title: 'Размер видео',
        items: items,
        onSelect: (a)=>{
            listener.send('size',{size: a.value})

            Controller.toggle('player_panel')
        },
        onBack: ()=>{
            Controller.toggle('player_panel')
        }
    })
})

/**
 * Обновляем состояние панели
 * @param {String} need - что нужно обновить
 * @param {*} value - значение
 */
function update(need, value){
    if(need == 'position'){
        elems.position.css({width: value})
        elems.time.css({left: value})
    }

    if(need == 'peding'){
        elems.peding.css({width: value})
    }

    if(need == 'time'){
        elems.time.text(value)
    }

    if(need == 'timeend'){
        elems.timeend.text(value)
    }

    if(need == 'timenow'){
        elems.timenow.text(value)
    }

    if(need == 'play'){
        html.toggleClass('panel--paused',false)
    }

    if(need == 'pause'){
        html.toggleClass('panel--paused',true)
    }
}

/**
 * Показать или скрыть панель
 * @param {Boolean} status 
 */
function visible(status){
    Info.toggle(status)

    html.toggleClass('panel--visible',status)
}

/**
 * Можем играть, далее отслеживаем статус
 */
function canplay(){
    condition.canplay = true

    state.start()
}

/**
 * Перемотка
 */
function rewind(){
    condition.rewind = true

    state.start()
}

/**
 * Контроллер
 */
function toggle(){
    Controller.add('player_panel',{
        invisible: true,
        toggle: ()=>{
            Controller.collectionSet(this.render())
            Controller.collectionFocus(last || $('.player-panel__playpause',html)[0],this.render())

            condition.visible = true

            state.start()
        },
        up: ()=>{
            Controller.toggle('player')
        },
        down: ()=>{
            Controller.toggle('player')
        },
        right: ()=>{
            Navigator.move('right')
        },
        left: ()=>{
            Navigator.move('left')
        },
        gone: ()=>{
            html.find('.selector').removeClass('focus')

            hide()
        },
        back: ()=>{
            Controller.toggle('player')
        }
    })

    Controller.toggle('player_panel')
}

/**
 * Показать панель
 */
function show(){
    state.start()
}

/**
 * Скрыть панель
 */
function hide(){
    condition.visible = false

    visible(false)
}

/**
 * Установить субтитры
 * @param {Array} su 
 */
function setSubs(su){
    subs = su

    elems.subs.toggleClass('hide',false)
}

/**
 * Установить дорожки
 * @param {Array} tr 
 */
function setTracks(tr){
    tracks = tr

    elems.tracks.toggleClass('hide',false)
}

/**
 * Уничтожить
 */
function destroy(){
    last = false

    condition = {}
    tracks    = []
    subs      = []

    elems.peding.css({width: 0})
    elems.position.css({width: 0})
    elems.time.text('00:00')
    elems.timenow.text('00:00')
    elems.timeend.text('00:00')

    elems.subs.toggleClass('hide',true)
    elems.tracks.toggleClass('hide',true)

    html.toggleClass('panel--paused',false)
}

function render(){
    return html
}

export default {
    listener,
    render,
    toggle,
    show,
    destroy,
    hide,
    canplay,
    update,
    rewind,
    setTracks,
    setSubs
}