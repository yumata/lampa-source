import Template from '../template'
import Subscribe from '../../utils/subscribe'
import Controller from '../controller'
import State from '../../utils/machine'
import Select from '../select'
import Storage from '../../utils/storage'
import Arrays from '../../utils/arrays'
import Platform from '../../utils/platform'
import Lang from '../../utils/lang'

let html
let listener = Subscribe()
let state
let elems
let last

let condition = {}
let timer     = {}
let tracks    = []
let subs      = []
let qualitys  = false
let translates = {}

function init(){
    html = Template.get('player_panel')

    elems = {
        peding: $('.player-panel__peding',html),
        position: $('.player-panel__position',html),
        time: $('.player-panel__time',html),
        timenow: $('.player-panel__timenow',html),
        timeend: $('.player-panel__timeend',html),
        title: $('.player-panel__filename',html),
        tracks: $('.player-panel__tracks',html),
        subs: $('.player-panel__subs',html),
        timeline: $('.player-panel__timeline',html),
        quality: $('.player-panel__quality',html),
        episode: $('.player-panel__next-episode-name',html)
    }

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
                    visible(false)
                },3000)
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

    html.find('.player-panel__tstart').on('hover:enter',(e)=>{
        listener.send('to_start',{})
    })

    html.find('.player-panel__tend').on('hover:enter',(e)=>{
        listener.send('to_end',{})
    })

    html.find('.player-panel__fullscreen').on('hover:enter',(e)=>{
        listener.send('fullscreen',{})
    })

    html.find('.player-panel__settings').on('hover:enter',settings)

    elems.timeline.attr('data-controller', 'player_rewind')

    elems.timeline.on('mousemove',(e)=>{
        listener.send('mouse_rewind',{method: 'move',time: elems.time, percent: percent(e)})
    }).on('mouseout',()=>{
        elems.time.addClass('hide')
    }).on('click',(e)=>{
        listener.send('mouse_rewind',{method: 'click',time: elems.time, percent: percent(e)})
    })

    html.find('.player-panel__line:eq(1) .selector').attr('data-controller', 'player_panel')
    
    /**
     * Выбор качества
     */
    elems.quality.text('auto').on('hover:enter',()=>{
        if(qualitys){
            let qs = []
            let nw = elems.quality.text()
            
            if(Arrays.isArray(qualitys)){
                qs = qualitys
            }
            else{
                for(let i in qualitys){
                    qs.push({
                        title: i,
                        url: qualitys[i],
                        selected: nw == i
                    })
                }
            }

            if(!qs.length) return

            let enabled = Controller.enabled()

            Select.show({
                title: Lang.translate('player_quality'),
                items: qs,
                onSelect: (a)=>{
                    elems.quality.text(a.title)

                    a.enabled = true

                    if(!Arrays.isArray(qualitys)) listener.send('quality',{name: a.title, url: a.url})

                    Controller.toggle(enabled.name)
                },
                onBack: ()=>{
                    Controller.toggle(enabled.name)
                }
            })
        }
    })


    /**
     * Выбор аудиодорожки
     */
    elems.tracks.on('hover:enter',(e)=>{
        if(tracks.length){
            tracks.forEach((element, p) => {
                let name = []
                let from = translates.tracks && Arrays.isArray(translates.tracks) && translates.tracks[p] ? translates.tracks[p] : element

                name.push(p + 1)
                name.push(from.language || from.name || Lang.translate('player_unknown'))

                if(from.label) name.push(from.label)

                if(from.extra){
                    if(from.extra.channels) name.push('Каналов: ' + from.extra.channels)
                    if(from.extra.fourCC) name.push('Тип: ' + from.extra.fourCC)
                }
                
                element.title = name.join(' / ')
            })

            let enabled = Controller.enabled()

            Select.show({
                title: Lang.translate('player_tracks'),
                items: tracks,
                onSelect: (a)=>{
                    tracks.forEach(element => {
                        element.enabled  = false
                        element.selected = false
                    })

                    a.enabled  = true
                    a.selected = true
        
                    Controller.toggle(enabled.name)
                },
                onBack: ()=>{
                    Controller.toggle(enabled.name)
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
                let any_select = subs.find(s=>s.selected)

                Arrays.insert(subs, 0, {
                    title: Lang.translate('player_disabled'),
                    selected: any_select ? false : true,
                    index: -1
                })
            }

            subs.forEach((element, p) => {
                if(element.index !== -1){
                    let from = translates.subs && Arrays.isArray(translates.subs) && translates.subs[element.index] ? translates.subs[element.index] : element

                    element.title = p + ' / ' + (from.language && from.label ? from.language + ' / ' + from.label : from.language || from.label || Lang.translate('player_unknown'))
                } 
            })

            let enabled = Controller.enabled()

            Select.show({
                title: Lang.translate('player_subs'),
                items: subs,
                onSelect: (a)=>{
                    subs.forEach(element => {
                        element.mode     = 'disabled'
                        element.selected = false
                    })

                    a.mode     = 'showing'
                    a.selected = true

                    listener.send('subsview',{status: a.index > -1})
        
                    Controller.toggle(enabled.name)
                },
                onBack: ()=>{
                    Controller.toggle(enabled.name)
                }
            })
        }
    })
}

function settings(){
    let speed = Storage.get('player_speed','default')
    let items = [
        {
            title: Lang.translate('player_video_size'),
            subtitle: Lang.translate('player_size_' + Storage.get('player_size','default') + '_title'),
            method: 'size'
        },
        {
            title: Lang.translate('player_video_speed'),
            subtitle: speed == 'default' ? Lang.translate('player_speed_default_title') : speed,
            method: 'speed'
        },
        {
            title: Lang.translate('player_share_title'),
            subtitle: Lang.translate('player_share_descr'),
            method: 'share'
        }
    ]

    if(Storage.field('player_normalization')){
        items.push({
            title: Lang.translate('player_normalization_power_title'),
            subtitle: Lang.translate('player_normalization_step_' + Storage.get('player_normalization_power','hight')),
            method: 'normalization_power'
        })

        items.push({
            title: Lang.translate('player_normalization_smooth_title'),
            subtitle: Lang.translate('player_normalization_step_' + Storage.get('player_normalization_smooth','medium')),
            method: 'normalization_smooth'
        })
    }

    Select.show({
        title: Lang.translate('title_settings'),
        items,
        onSelect: (a)=>{
            if(a.method == 'size') selectSize()
            if(a.method == 'speed') selectSpeed()
            if(a.method == 'normalization_power') selectNormalizationStep('power','hight')
            if(a.method == 'normalization_smooth') selectNormalizationStep('smooth','medium')
            if(a.method == 'share'){
                Controller.toggle('player_panel')

                listener.send('share',{})
            }
        },
        onBack: ()=>{
            Controller.toggle('player_panel')
        }
    })
}

function selectNormalizationStep(type, def){
    let select = Storage.get('player_normalization_'+type, def)

    let items = [
        {
            title: Lang.translate('player_normalization_step_low'),
            value: 'low',
            selected: select == 'low'
        },
        {
            title: Lang.translate('player_normalization_step_medium'),
            value: 'medium',
            selected: select == 'medium'
        },
        {
            title: Lang.translate('player_normalization_step_hight'),
            value: 'hight',
            selected: select == 'hight'
        }
    ]

    Select.show({
        title: Lang.translate('player_normalization_'+type+'_title'),
        items: items,
        nohide: true,
        onBack: settings,
        onSelect: (a)=>{
            Storage.set('player_normalization_'+type, a.value)
        }
    })
}

/**
 * Выбор масштаба видео
 */
function selectSize(){
    let select = Storage.get('player_size','default')

    let items = [
        {
            title: Lang.translate('player_size_default_title'),
            subtitle: Lang.translate('player_size_default_descr'),
            value: 'default',
            selected: select == 'default'
        },
        {
            title: Lang.translate('player_size_cover_title'),
            subtitle: Lang.translate('player_size_cover_descr'),
            value: 'cover',
            selected: select == 'cover'
        }
    ]

    if(!(Platform.is('tizen') && Storage.field('player') == 'tizen')){
        items = items.concat([{
            title: Lang.translate('player_size_fill_title'),
            subtitle: Lang.translate('player_size_fill_descr'),
            value: 'fill',
            selected: select == 'fill'
        },
        {
            title: Lang.translate('player_size_s115_title'),
            subtitle: Lang.translate('player_size_s115_descr'),
            value: 's115',
            selected: select == 's115'
        },
        {
            title: Lang.translate('player_size_s130_title'),
            subtitle: Lang.translate('player_size_s130_descr'),
            value: 's130',
            selected: select == 's130'
        },
        {
            title: Lang.translate('player_size_v115_title'),
            subtitle: Lang.translate('player_size_v115_descr'),
            value: 'v115',
            selected: select == 'v115'
        },
        {
            title: Lang.translate('player_size_v130_title'),
            subtitle: Lang.translate('player_size_v130_descr'),
            value: 'v130',
            selected: select == 'v130'
        }])
    }
    else{
        if(select == 's130' || select == 'fill'){
            items[0].selected = true
        }
    }

    Select.show({
        title: Lang.translate('player_video_size'),
        items: items,
        nohide: true,
        onSelect: (a)=>{
            listener.send('size',{size: a.value})
        },
        onBack: settings
    })
}

function selectSpeed(){
    let select = Storage.get('player_speed','default')

    let items = [
        {
            title: '0.25',
            value: '0.25'
        },
        {
            title: '0.50',
            value: '0.50'
        },
        {
            title: '0.75',
            value: '0.75'
        },
        {
            title: Lang.translate('player_speed_default_title'),
            value: 'default'
        },
        {
            title: '1.25',
            value: '1.25'
        },
        {
            title: '1.50',
            value: '1.50'
        },
        {
            title: '1.75',
            value: '1.75'
        },
        {
            title: '2',
            value: '2'
        },
    ]

    if(Platform.is('tizen') && Storage.field('player') == 'tizen'){
        items = [
            {
                title: Lang.translate('player_speed_default_title'),
                value: 'default',
                selected: select == 'default'
            },
            {
                title: '2',
                value: '2'
            }
        ]
    }

    let any

    items.forEach(e=>{
        if(e.value == select){
            any = true

            e.selected = true
        } 
    })

    if(!any){
        Storage.set('player_speed','default')

        if(items.length == 3) items[0].selected = true
        else items[3].selected = true
    }

    Select.show({
        title: Lang.translate('player_video_speed'),
        items: items,
        nohide: true,
        onSelect: (a)=>{
            Storage.set('player_speed',a.value)

            listener.send('speed',{speed: a.value})
        },
        onBack: settings
    })
}

/**
 * Добавить контроллеры
 */
 function addController(){
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
            Controller.collectionSet(render())
            Controller.collectionFocus($('.player-panel__playpause',html)[0],render())
        },
        up: ()=>{
            toggleRewind()
        },
        right: ()=>{
            Navigator.move('right')
        },
        left: ()=>{
            Navigator.move('left')
        },
        down: ()=>{
            listener.send('playlist',{})
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
    let offset = elems.timeline.offset()
    let width  = elems.timeline.width()

    return (e.clientX - offset.left) / width
}

/**
 * Обновляем состояние панели
 * @param {string} need - что нужно обновить
 * @param {string|number} value - значение
 */
function update(need, value){
    if(need == 'position'){
        elems.position.css({width: value})
    }

    if(need == 'peding'){
        elems.peding.css({width: value})
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
 * @param {boolean} status 
 */
function visible(status){
    listener.send('visible',{status: status})

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
 * Переключить на контроллер перемотки
 */
function toggleRewind(){
    Controller.toggle('player_rewind')
}

/**
 * Переключить на контроллер кнопки
 */
function toggleButtons(){
    Controller.toggle('player_panel')
}

/**
 * Контроллер
 */
function toggle(){
    condition.visible = true

    state.start()

    toggleRewind()
}

/**
 * Показать панель
 */
function show(){
    state.start()

    html.find('.player-panel__fullscreen').toggleClass('hide',Platform.tv())

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

    visible(false)
}

/**
 * Установить субтитры
 * @param {[{index:integer, language:string, label:string}]} su 
 */
function setSubs(su){
    subs = su

    elems.subs.toggleClass('hide',false)
}

/**
 * Установить дорожки
 * @param {[{index:integer, language:string, label:string}]} tr 
 */
function setTracks(tr){
    tracks = tr

    elems.tracks.toggleClass('hide',false)
}

/**
 * Установить качество
 * @param {[{title:string, url:string}]} levels 
 * @param {string} current 
 */
function setLevels(levels, current){
    qualitys = levels

    elems.quality.text(current)
}

/**
 * Показать текущие качество
 * @param {[{title:string, url:string}]} qs 
 * @param {string} url 
 */
function quality(qs, url){
    if(qs){
        elems.quality.toggleClass('hide',false)

        qualitys = qs

        for(let i in qs){
            if(qs[i] == url) elems.quality.text(i)
        }
    } 
}

/**
 * Показать название следующего эпизода 
 * @param {{position:integer, playlist:[{title:string, url:string}]}} e 
 */
function showNextEpisodeName(e){
    if(e.playlist[e.position + 1]){
        elems.episode.text(e.playlist[e.position + 1].title).toggleClass('hide',false)
    }
    else elems.episode.toggleClass('hide',true)
}

/**
 * Установить перевод для дорожек и сабов
 * @param {{subs:[],tracks:[]}} data 
 */
function setTranslate(data){
    if(typeof data == 'object') translates = data
}

/**
 * Уничтожить
 */
function destroy(){
    last = false

    condition = {}
    tracks    = []
    subs      = []
    qualitys  = false
    translates = {}

    elems.peding.css({width: 0})
    elems.position.css({width: 0})
    elems.time.text('00:00')
    elems.timenow.text('00:00')
    elems.timeend.text('00:00')
    elems.quality.text('auto')

    elems.subs.toggleClass('hide',true)
    elems.tracks.toggleClass('hide',true)
    elems.episode.toggleClass('hide',true)

    html.toggleClass('panel--paused',false)
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
    setTracks,
    setSubs,
    setLevels,
    mousemove,
    quality,
    showNextEpisodeName,
    setTranslate
}