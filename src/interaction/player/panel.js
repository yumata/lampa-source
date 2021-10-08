import Template from '../template'
import Subscribe from '../../utils/subscribe'
import Controller from '../controller'
import State from '../../utils/machine'
import Select from '../select'
import Storage from '../../utils/storage'
import Info from './info'

let html     = Template.get('player_panel')
let listener = Subscribe()

let condition = {}
let timer = {}

let elems = {
    peding: $('.player-panel__peding',html),
    position: $('.player-panel__position',html),
    time: $('.player-panel__time',html),
    timenow: $('.player-panel__timenow',html),
    timeend: $('.player-panel__timeend',html),
    title: $('.player-panel__filename',html)
}

let last

let state    = new State({
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

function title(title){
    elems.title.text(title)
}

function visible(status){
    Info.toggle(status)
    html.toggleClass('panel--visible',status)
}

function canplay(){
    condition.canplay = true

    state.start()
}

function rewind(){
    condition.rewind = true

    state.start()
}

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

function show(){
    state.start()
}

function hide(){
    condition.visible = false

    visible(false)
}

function destroy(){
    last = false

    condition = {}

    elems.peding.css({width: 0})
    elems.position.css({width: 0})
    elems.time.text('00:00')
    elems.timenow.text('00:00')
    elems.timeend.text('00:00')

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
    title,
    rewind
}