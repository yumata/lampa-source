import Template from '../template'
import Subscribe from '../../utils/subscribe'
import Controller from '../../core/controller'
import State from '../../utils/machine'
import Select from '../select'
import Storage from '../../core/storage/storage'
import Option from './panel/option'
import Platform from '../../core/platform'
import Lang from '../../core/lang'
import Utils from '../../utils/utils'
import DeviceInput from '../device_input'
import Video from './video'
import TV from './iptv'
import Footer from './footer'
import Playlist from './playlist'
import Segments from './segments'
import Settings from './panel/settings'
import IptvPanel from './panel/iptv'
import Html from './panel/html'
import listener from './panel/listener'

let html
let state
let panel_visible = false
let timeline_last = {
    position: 0,
    peding: 0
} 

let condition = {}
let timer     = {}
function init(){
    Html.init()

    html = Html.render()

    /**
     * Отсеживаем состояние,
     * когда надо показать панель, а когда нет
     */
    state = new State({
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

                        this.dispath('mousemove')
                    },1000)
                }
                else{
                    this.dispath('mousemove')
                }
            },
            mousemove: function(){
                if(condition.mousemove){
                    visible(true)
                }

                this.dispath('hide')
            },
            hide: function(){
                clearTimeout(timer.hide)

                timer.hide = setTimeout(()=>{
                    if(TV.playning()){
                        TV.reset()

                        Controller.toggle('player')
                    } 
                    else if(!Video.video().paused) visible(false)
                },TV.playning() ? 5000 : 3000)
            }
        }
    })

    Playlist.listener.follow('set',(e)=>{
        Html.elem('playlist').toggleClass('hide', Boolean(e.playlist.length == 0))
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

    Html.elem('playlist').on('hover:enter',(e)=>{
        listener.send('playlist',{})
    })

    html.find('.player-panel__tstart').on('hover:enter',(e)=>{
        listener.send('to_start',{})
    })

    html.find('.player-panel__tend').on('hover:enter',(e)=>{
        listener.send('to_end',{})
    })

    html.find('.player-panel__fullscreen').on('hover:enter',(e)=>{
        listener.send('fullscreen',{})
    })

    html.find('.player-panel__settings').on('hover:enter', Settings.show)

    html.find('.player-panel__pip,.player-panel__volume').toggleClass('hide',!Boolean(Platform.desktop() || Platform.is('browser') || (Platform.is('apple') && !Utils.isPWA())))

    html.find('.player-panel__pip').on('hover:enter',()=>{
        listener.send('pip',{})
    })

    Html.elem('rewind_touch').toggleClass('hide',!Platform.screen('mobile'))

    Html.elem('timeline').on('mousemove',(e)=>{
        if(!Platform.screen('mobile')) listener.send('mouse_rewind',{method: 'move',time: Html.elem('time'), percent: percent(e)})
    }).on('mouseout',()=>{
        if(!Platform.screen('mobile')) Html.elem('time').addClass('hide')
    }).on('click',(e)=>{
        if(DeviceInput.canClick(e.originalEvent) && !Platform.screen('mobile')) listener.send('mouse_rewind',{method: 'click',time: Html.elem('time'), percent: percent(e)})
    })

    if(!html.find('.player-panel__volume').hasClass('hide')){
        html.find('.player-panel__volume-range').val(Storage.get('player_volume','1')).on('input',function(){
            listener.send('change_volume',{volume: $(this).val()})

            Video.changeVolume($(this).val())
        })
    }

    let touch

    let touchEnd = (e)=>{
        window.removeEventListener('touchend', touchEnd)

        Video.video().rewind = false

        listener.send('mouse_rewind',{method: 'click',time: Html.elem('time'), percent: touch.to / 100})

        touch = false
    }

    Html.elem('rewind_touch').on('touchstart',(e)=>{
        let point = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0]

        touch = {
            now: percent({clientX: Html.elem('position').width()}) * 100,
            from: percent(point) * 100,
        }

        touch.move = touch.from
        touch.to   = touch.from

        window.addEventListener('touchend', touchEnd)
    }).on('touchmove',(e)=>{
        let point = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0]

        if(touch){
            touch.move = percent(point) * 100
            touch.to   = Math.max(0,Math.min(100,touch.now + (touch.move - touch.from)))

            timeline_last.position = touch.to + '%'

            Html.elem('timenow').text(Utils.secondsToTime(touch.to / 100 * (Video.video().duration || 0)))

            Video.video().rewind = true

            rewind()
        }
    })

    Option.init()

    TV.listener.follow('channel', IptvPanel.channel)
    TV.listener.follow('draw-program', IptvPanel.program)

    Footer.listener.follow('open',()=>{
        html.addClass('panel--footer-open')
    })

    Footer.listener.follow('close',()=>{
        html.removeClass('panel--footer-open')

        Controller.toggle('player_panel')
    })

    Video.listener.follow('loadeddata', drawSegments)
    Segments.listener.follow('set', drawSegments)
}

function drawSegments(){
    let segments = Segments.all()
    let timeline = Html.elem('segments').empty()
    let video    = Video.video()
    let duration = video && video.duration ? video.duration : 0

    for(let name in segments){
        for(let a = 0; a < segments[name].length; a++){
            let seg      = segments[name][a]
            let seg_elem = $(`<div class="player-panel__timeline-segment player-panel__timeline-segment--${name}"></div>`)

            let r_start = Math.min(duration, seg.start)
            let r_end   = Math.min(duration, seg.end)
            
            let start    = duration ? r_start / duration * 100 : 0
            let length   = duration ? (r_end - r_start) / duration * 100 : 0

            seg_elem.css({
                left: duration ? start + '%' : 0,
                width: duration ? length + '%' : 0
            })

            timeline.append(seg_elem)
        }
    }
}

function hideRewind(){
    html.addClass('panel--norewind')
}

function showParams(){
    let enabled = Controller.enabled().name
    let items = []

    items.push({
        title: Lang.translate('player_tracks'),
        trigger: Html.elem('tracks'),
        ghost: Html.elem('tracks').hasClass('hide'),
        noenter: Html.elem('tracks').hasClass('hide')
    })

    items.push({
        title: Lang.translate('player_subs'),
        trigger: Html.elem('subs'),
        ghost: Html.elem('subs').hasClass('hide'),
        noenter: Html.elem('subs').hasClass('hide')
    })

    items.push({
        title: Lang.translate('player_quality'),
        trigger: Html.elem('quality'),
        ghost: !Option.hasQuality(),
        noenter: !Option.hasQuality()
    })

    items.push({
        title: Lang.translate('settings_main_rest'),
        trigger: html.find('.player-panel__settings')
    })

    Select.show({
        title: Lang.translate('title_settings'),
        items: items,
        onSelect: (a)=>{
            Controller.toggle(enabled)

            a.trigger.trigger('hover:enter')
        },
        onBack: ()=>{
            Controller.toggle(enabled)
        }
    })
}

function isTV(){
    return $('body > .player').hasClass('tv')
}

/**
 * Добавить контроллеры
 */
 function addController(){
    Controller.add('player_tv',{
        invisible: true,
        toggle: ()=>{
            Controller.clear()

            condition.visible = false

            state.start()
        },
        up: ()=>{
            TV.prevChannel()

            state.start()
        },
        down: ()=>{
            TV.nextChannel()

            state.start()
        },
        left: ()=>{
            condition.visible = true

            TV.openMenu()

            state.start()
        },
        right: ()=>{
            condition.visible = true

            showParams()

            state.start()
        },
        enter: ()=>{
            TV.play()

            state.start()
        },
        back: ()=>{
            TV.reset()

            Controller.toggle('player')

            hide()
        }
    })

    Controller.add('player_rewind',{
        toggle: ()=>{
            Controller.collectionSet(render())
            Controller.collectionFocus(false,render())
        },
        up: ()=>{
            Controller.toggle('player')
        },
        down: ()=>{
            toggleButtons()
        },
        right: ()=>{
            listener.send('rnext',{})
        },
        left: ()=>{
            listener.send('rprev',{})
        },
        gone: ()=>{
            html.find('.selector').removeClass('focus')
        },
        back: ()=>{
            Controller.toggle('player')

            hide()
        }
    })

    Controller.add('player_panel',{
        toggle: ()=>{
            if(TV.playning()) Controller.toggle('player_tv')
            else{
                Controller.collectionSet(render())
                Controller.collectionFocus($(isTV() ? '.player-panel__next' : '.player-panel__playpause',html)[0],render())
            } 
        },
        up: ()=>{
            isTV() || html.hasClass('panel--norewind') ? Controller.toggle('player') : toggleRewind()
        },
        right: ()=>{
            Navigator.move('right')
        },
        left: ()=>{
            Navigator.move('left')
        },
        down: ()=>{
            Footer.available() ? Controller.toggle('player_footer') : listener.send('playlist',{})
        },
        gone: ()=>{
            html.find('.selector').removeClass('focus')
        },
        back: ()=>{
            Controller.toggle('player')

            hide()
        }
    })
}

/**
 * Рассчитать проценты
 * @param {object} e 
 * @returns {number}
 */
function percent(e){
    let offset = Html.elem('timeline').offset()
    let width  = Html.elem('timeline').width()

    return (e.clientX - offset.left) / width
}

/**
 * Обновляем состояние панели
 * @param {string} need - что нужно обновить
 * @param {string|number} value - значение
 */
function update(need, value){
    if(need == 'position'){
        timeline_last.position = value

        if(panel_visible) Html.elem('position').css({width: value})
    }

    if(need == 'peding'){
        timeline_last.peding = value

        if(panel_visible) Html.elem('peding').css({width: value})
    }

    if(need == 'timeend'){
        Html.elem('timeend').text(value)
    }

    if(need == 'timenow'){
        Html.elem('timenow').text(value)
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
 * @param {boolean} status 
 */
function visible(status){
    listener.send('visible',{status: status})

    html.toggleClass('panel--visible',status)

    panel_visible = status

    Html.elem('position').css({width: timeline_last.position})
    Html.elem('peding').css({width: timeline_last.peding})
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
 * Переключить на контроллер перемотки
 */
function toggleRewind(){
    Controller.toggle(isTV() || html.hasClass('panel--norewind') ? 'player_panel' : 'player_rewind')
}

/**
 * Переключить на контроллер кнопки
 */
function toggleButtons(){
    if(!Platform.screen('mobile')) Controller.toggle('player_panel')
}

/**
 * Контроллер
 */
function toggle(){
    condition.visible = true

    state.start()

    if(TV.playning()) Controller.toggle('player_tv')
    else if(!Platform.screen('mobile')) toggleRewind()
}

/**
 * Показать панель
 */
function show(){
    state.start()

    html.find('.player-panel__fullscreen').toggleClass('hide',Platform.tv() || Platform.is('android') || !Utils.canFullScreen())

    addController()
}

/**
 * Если двигали мышку
 */
function mousemove(){
    condition.mousemove = true

    state.start()
}

/**
 * Скрыть панель
 */
function hide(){
    condition.visible = false
    condition.mousemove = false

    visible(false)
}

function visibleStatus(){
    return html.hasClass('panel--visible')
}

/**
 * Показать название следующего эпизода
 * @param {{position:integer, playlist:[{title:string, url:string}]}} e
 */
function showNextEpisodeName(e){
    if(e.playlist[e.position + 1]){
        Html.elem('episode').text(e.playlist[e.position + 1].title).toggleClass('hide',false)
    }
    else Html.elem('episode').toggleClass('hide',true)
}

/**
 * Уничтожить
 */
function destroy(){
    condition = {}

    timeline_last.position = 0
    timeline_last.peding = 0

    panel_visible = false

    Option.destroy()

    Html.elem('peding').css({width: 0})
    Html.elem('position').css({width: 0})
    Html.elem('time').text('00:00')
    Html.elem('timenow').text('00:00')
    Html.elem('timeend').text('00:00')

    Html.elem('episode').toggleClass('hide',true)
    Html.elem('playlist').toggleClass('hide',true)

    html.toggleClass('panel--paused',false)
    html.toggleClass('panel--norewind',false)

    Html.elem('segments').empty()
}

/**
 * Получить html
 * @returns {object}
 */
function render(){
    return html
}

export default {
    init,
    listener,
    render,
    toggle,
    show,
    destroy,
    hide,
    canplay,
    update,
    rewind,
    setTracks: Option.setTracks,
    setSubs: Option.setSubs,
    setLevels: Option.setLevels,
    mousemove,
    quality: Option.quality,
    showNextEpisodeName,
    setTranslate: Option.setTranslate,
    updateTranslate: Option.updateTranslate,
    visible,
    visibleStatus,
    showParams,
    hideRewind,
    setFlows: Option.setFlows
}