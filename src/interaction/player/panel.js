import Controller from '../../core/controller'
import State from '../../utils/machine'
import Storage from '../../core/storage/storage'
import Lang from '../../core/lang'
import Option from './panel/option'
import Platform from '../../core/platform'
import Utils from '../../utils/utils'
import DeviceInput from '../device_input'
import Video from './video'
import TV from './iptv'
import Footer from './footer'
import Playlist from './playlist'
import Segments from './panel/segments'
import Settings from './panel/settings'
import IptvPanel from './panel/iptv'
import Html from './panel/html'
import Player from '../player'
import Skip from './skip'
import Apex from './panel/apex'
import Next from './panel/next'
import listener from './panel/listener'
import {languageName, codecName, channelLayout} from './track_info'

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

    Option.init()

    Segments.init()

    Next.init()

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
                    else if(Html.render().hasClass('panel--footer-open')){}
                    else if(!Video.video().paused) visible(false)
                },TV.playning() || Platform.screen('mobile') ? 5000 : 3000)
            }
        }
    })

    Playlist.listener.follow('set',(e)=>{
        Html.elem('playlist_buttons').toggleClass('hide', Boolean(e.playlist.length == 0))
        Html.elem('next').toggleClass('hide', !Playlist.canNext())
    })


    Html.elem('playpause').on('hover:enter',(e)=>{
        listener.send('playpause',{})
    })

    Html.elem('next').on('hover:enter',(e)=>{
        listener.send('next',{})
    })

    Html.elem('prev').on('hover:enter',(e)=>{
        listener.send('prev',{})
    })

    Html.elem('rprev').on('hover:enter',(e)=>{
        listener.send('rprev',{})
    })

    Html.elem('rnext').on('hover:enter',(e)=>{
        listener.send('rnext',{})
    })

    Html.elem('playlist').on('hover:enter',(e)=>{
        listener.send('playlist',{})
    })

    Html.elem('tstart').on('hover:enter',(e)=>{
        listener.send('to_start',{})
    })

    Html.elem('tend').on('hover:enter',(e)=>{
        listener.send('to_end',{})
    })

    Html.elem('fullscreen').on('hover:enter',(e)=>{
        listener.send('fullscreen',{})
    })

    Html.elem('settings').on('hover:enter', Settings.show)

    Html.render().find('.player-panel__pip,.player-panel__volume').toggleClass('hide',!Boolean(Platform.desktop() || Platform.is('browser') || (Platform.is('apple') && !Utils.isPWA())))

    Html.elem('pip').on('hover:enter',()=>{
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

    if(!Html.elem('volume').hasClass('hide')){
        Html.elem('volume').find('.player-panel__volume-range').val(Storage.get('player_volume','1')).on('input',function(){
            listener.send('change_volume',{volume: $(this).val()})

            Video.volume($(this).val())
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

    TV.listener.follow('channel', IptvPanel.channel)
    TV.listener.follow('draw-program', IptvPanel.program)

    Player.listener.follow('start', (data)=>{
        show()

        Option.setQualitys(data.quality, data.url)
        Option.setTracks(data.voiceovers)
        Option.setTranslates(data.translate)
    })

    Player.listener.follow('destroy', destroy)

    Footer.listener.follow('open',()=>{
        Html.render().addClass('panel--footer-open')
    })

    Footer.listener.follow('close',()=>{
        Html.render().removeClass('panel--footer-open')

        Controller.toggle('player_panel')
    })

    Video.listener.follow('timeupdate',(e)=>{
        update('time', Utils.secondsToTime(e.current | 0, true))
        update('timenow', Utils.secondsToTime(e.current || 0))
        update('timeend', Utils.secondsToTime(e.duration || 0) + ' - ' + Lang.translate('title_left') + ' ' + Utils.secondsToTimeHuman(e.duration - e.current || 0))
        update('position', (e.current / e.duration * 100) + '%')
    })

    Video.listener.follow('progress',(e)=>{
        update('peding', e.down)
    })

    Video.listener.follow('canplay',()=>{
        canplay()
    })

    Video.listener.follow('play',()=>{
        update('play')
        rewind()
    })

    Video.listener.follow('pause',()=>{
        update('pause')
    })

    Video.listener.follow('rewind',()=>{
        rewind()
    })

    Video.listener.follow('subs',(e)=>{
        Option.setSubtitles(e.subs)
    })

    Video.listener.follow('levels',(e)=>{
        Option.setLevels(e.levels, e.current)
    })

    Video.listener.follow('translate',(e)=>{
        Option.updateTranslate(e.where, e.translate)
    })

    listener.follow('mouse_rewind',(e)=>{
        let vid = Video.video()

        if(vid && vid.duration){
            if(!Platform.screen('mobile')) e.time.removeClass('hide').text(Utils.secondsToTime(vid.duration * e.percent)).css('left',(e.percent * 100)+'%')

            if(e.method == 'click'){
                Video.to(vid.duration * e.percent)
            }
        }
    })

    listener.follow('playpause',()=>{
        Video.playpause()

        if(Platform.screen('mobile')) rewind()
    })

    listener.follow('size',(e)=>{
        Video.size(e.size)

        Storage.set('player_size', e.size)
    })

    listener.follow('speed',(e)=>{
        Video.speed(e.speed)

        Storage.set('player_speed', e.speed)
    })

    listener.follow('rprev',()=>{
        Video.rewind(false)
    })

    listener.follow('rnext',()=>{
        Video.rewind(true)
    })

    listener.follow('subsview',(e)=>{
        Video.subsview(e.status)
    })

    listener.follow('to_start',()=>{
        Video.to(0)
    })

    listener.follow('fullscreen',()=>{
        Utils.toggleFullscreen()
    })

    listener.follow('pip',()=>{
        Video.pip()
    })
}

/**
 * Cкрыть панель перемотки
 */
function hideRewind(){
    Html.render().addClass('panel--norewind')
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

            IptvPanel.settings()

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
            toggleUp()
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
            Html.render().find('.selector').removeClass('focus')
        },
        back: toPlayer
    })

    Controller.add('player_panel',{
        toggle: ()=>{
            if(TV.playning()) Controller.toggle('player_tv')
            else{
                Controller.collectionSet(render())
                Controller.collectionFocus($(Player.playdata().iptv ? '.player-panel__next' : '.player-panel__playpause',Html.render())[0],render())
            } 
        },
        up: ()=>{
            Player.playdata().iptv || Html.render().hasClass('panel--norewind') ? toggleUp() : toggleRewind()
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
            Html.render().find('.selector').removeClass('focus')
        },
        back: toPlayer
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
        Html.render().toggleClass('panel--paused',false)
    }

    if(need == 'pause'){
        Html.render().toggleClass('panel--paused',true)
    }
}

/**
 * Показать или скрыть панель
 * @param {boolean} status 
 */
function visible(status){
    panel_visible = status

    listener.send('visible',{status: status})

    Html.render().toggleClass('panel--visible',status)

    Html.elem('position').css({width: timeline_last.position})
    Html.elem('peding').css({width: timeline_last.peding})
}

/**
 * Получили событие canplay, теперь можно скрывать панель и отслеживать статус
 */
function canplay(){
    condition.canplay = true

    state.start()
}

/**
 * Запустили режим перемотки, показываем панель и через 3 секунды скрываем
 */
function rewind(){
    condition.rewind = true

    state.start()
}

/**
 * Переключить на контроллер перемотки
 */
function toggleRewind(){
    Controller.toggle(Player.playdata().iptv || Html.render().hasClass('panel--norewind') ? 'player_panel' : 'player_rewind')
}

/**
 * Уйти вверх с панели: на кнопку пропуска, если она показана, иначе на плеер
 */
function toggleUp(){
    if(Skip.isActive()) Skip.toggle()
    else Controller.toggle('player')
}

/**
 * Уйти на плеер и скрыть панель
 */
function toPlayer(){
    Controller.toggle('player')

    hide()
}

/**
 * Показать панель, не переключая контроллер
 */
function reveal(){
    condition.visible = true

    state.start()
}

/**
 * Переключить на контроллер кнопки
 */
function toggleButtons(){
    if(!Platform.screen('mobile')) Controller.toggle('player_panel')
}

/**
 * Переключить на контроллер панели
 */
function toggle(){
    condition.visible = true

    state.start()

    if(TV.playning()) Controller.toggle('player_tv')
    else if(!Platform.screen('mobile')) toggleButtons()
}

/**
 * Запустили плеер и нужно запустить статус панели
 */
function show(){
    state.start()

    Html.elem('fullscreen').toggleClass('hide',Platform.tv() || Platform.is('android') || !Utils.canFullScreen())

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
    condition.visible   = false
    condition.mousemove = false

    visible(false)
}

/**
 * Состояние видимости панели
 * @returns {boolean}
 */
function visibleStatus(){
    return panel_visible
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
    Apex.destroy()
    Segments.destroy()
    Next.destroy()

    Html.elem('peding').css({width: 0})
    Html.elem('position').css({width: 0})
    Html.elem('time').text('00:00')
    Html.elem('timenow').text('00:00')
    Html.elem('timeend').text('00:00')

    Html.elem('episode').toggleClass('hide',true)
    Html.elem('playlist_buttons').toggleClass('hide',true)

    Html.render().toggleClass('panel--paused',false)
    Html.render().toggleClass('panel--norewind',false)
    Html.render().toggleClass('panel--footer-open',false)
}

/**
 * Получить html
 * @returns {object}
 */
function render(){
    return Html.render()
}

export default {
    init,
    listener,
    render,
    toggle,
    show,
    destroy,
    hide,
    toPlayer,
    reveal,
    canplay,
    update,
    rewind,
    mousemove,
    quality: Option.setQualitys,
    updateTranslate: Option.updateTranslate,
    visible,
    visibleStatus,
    hideRewind,
    setTranslate: Option.setTranslates,
    setTracks: Option.setTracks,
    setSubs: Option.setSubtitles,
    setLevels: Option.setLevels,
    setFlows: Option.setFlows
}
