import Component from '../../core/component'
import Template from '../template'
import Subscribe from '../../utils/subscribe'
import Controller from '../../core/controller'
import Head from '../head/head'
import Storage from '../../core/storage/storage'
import Lang from '../../core/lang'
import Screensaver from '../screensaver'
import Utils from '../../utils/utils'
import Arrays from '../../utils/arrays'
import Platform from '../../core/platform'
import App from '../app'
import Select from '../select'
import PropsProvider from '../../utils/props'
import ActivitySlide from './slide'

let listener  = Subscribe()
let activites = []
let callback  = false
let fullout   = false
let content
let slides
let maxsave
let base

function parseStart(){
    if(window.start_deep_link) return

    let id = Utils.gup('card')

    if(id){
        window.start_deep_link = {
            id: id,
            component: "full",
            method: Utils.gup('media') || 'movie',
            source: Utils.gup('source') || 'cub',
            card: {
                id: id,
                source: Utils.gup('source') || 'cub'
            }
        }
    }
    else if(!(Platform.is('orsay') || Platform.is('netcast') || Platform.is('webos') || Platform.is('tizen'))){
        try{
            let params = new URLSearchParams(window.location.search)

            if(params.has('component')){
                window.start_deep_link = {}

                params.forEach((v,n)=>{
                    window.start_deep_link[n] = v
                })
            }
        }
        catch(e){
            console.log('Activity', 'url params start error:', e.message)
        }
    }
}

/**
 * Запуск
 */
function init(){
    content   = Template.js('activitys')
    slides    = content.querySelector('.activitys__slides')
    maxsave   = Storage.get('pages_save_total',5)
    base      = document.querySelector('head base')

    parseStart()

    empty()

    let wait = true

    let swip_status = 0
    let swip_timer
    let start_time = Date.now()

    setTimeout(()=>{
        wait = false
    },1500)

    setTimeout(last,500)

    window.addEventListener('popstate', () => {
        if(fullout || wait) return

        Screensaver.stop()
    
        if(swip_status == 0) empty() //это чтоб не выходило с приложения, однако на айфонах это вызвает зависание на 2-3 сек
    
        listener.send('popstate',{count: activites.length})
    
        if(callback) callback()
        else{
            backward()
        }
    })
    
    Storage.listener.follow('change', (event)=>{
        if(event.name == 'pages_save_total') maxsave = Storage.get('pages_save_total',5)
        if(event.name == 'light_version'){
            activites.forEach((activity)=>{
                if(activity.activity) activity.activity.refresh()
            })
        }
    })

    // исключительно для огрызков пришлось мутить работу свайпа назад

    if(Platform.is('apple')){
        let body = document.querySelector('body')

        body.addEventListener('touchstart',(e)=>{
            let point = e.touches[0] || e.changedTouches[0]

            if (point.clientX < window.innerWidth * 0.15 && point.clientX < window.innerHeight - 120){
                swip_status = 1

                clearTimeout(swip_timer)

                swip_timer = setTimeout(()=>{
                    swip_status = 0
                },2000)
            }
            else{
                swip_status = 0
            }
        })
    }

    // выход из приложения

    listener.follow('backward',(event)=>{
        let noout = Platform.is('browser') || Platform.desktop()

        if(event.count == 1 && Date.now() > start_time + (1000 * 2) && !noout){
            let enabled = Controller.enabled().name

            Select.show({
                title: Lang.translate('title_out'),
                items: [
                    {
                        title: Lang.translate('title_out_confirm'),
                        out: true
                    },
                    {
                        title: Lang.translate('cancel')
                    }
                ],
                onSelect: (a)=>{
                    if(a.out){
                        out()

                        Controller.toggle(enabled)

                        App.close()
                    }
                    else{
                        Controller.toggle(enabled)
                    }
                },
                onBack: ()=>{
                    Controller.toggle(enabled)
                }
            })
        }
    })
}


/**
 * Лимит активностей, уничтожать если больше maxsave
 */
function limit(){
    let curent = active()

    if(curent && curent.activity) curent.activity.pause()

    let tree_stop = activites.slice(-2)

    if(tree_stop.length > 1 && tree_stop[0].activity) tree_stop[0].activity.stop()

    let tree_destroy = activites.slice(-maxsave)

    if(tree_destroy.length > (maxsave - 1)){
        let first = tree_destroy[0]

        if(first.activity){
            first.activity.destroy()

            Lampa.Listener.send('activity',{component: first.component, type: 'destroy', object: first})

            first.activity = null
        } 
    } 
}

/**
 * Обновить адрес в строке из активности
 */
function pushState(object, replace, mix){
    let path = window.location.protocol == 'file:' ? '' : base ? '/' : ''

    if(!window.lampa_settings.push_state) return window.history.pushState(null, null, path)

    let data = Arrays.clone(extractObject(object))

    let comp = []

    for(let n in data){
        if((typeof data[n] == 'string' || typeof data[n] == 'number' || typeof data[n] == 'boolean') && data[n]) comp.push(n + '=' + encodeURIComponent(data[n]))
    }

    let card = object.card || object.movie
    let meth = object.method || (card ? card.name ? 'tv' : 'movie' : '')
    let sour = object.source || (card ? card.source : 'tmdb')
    let durl = card && card.id ? '?card=' + card.id + (meth ? '&media=' + meth : '') + (sour ? '&source=' + sour : '') : '?' + comp.join('&')

    if(mix) durl += '&' + mix

    if(replace) window.history.replaceState(null, null, path + durl)
    else window.history.pushState(null, null, path + durl)
}

/**
 * Обновить адрес в строке из активности с добавлением дополнительных параметров
 */
function mixState(mix){
    let curent = active()

    if(curent  && curent.activity) pushState(curent, true, mix)
}

/**
 * Добавить новую активность
 * @param {{component:string}} object 
 */
function push(object){
    limit()

    create(object)

    activites.push(object)

    start(object)

    pushState(object)
}

/**
 * Создать новую активность
 * @param {{component:string}} object 
 */
function create(object){
    let comp = Component.create(object)

    comp.props = new PropsProvider(Arrays.clone(extractObject(object)))

    object.activity = new ActivitySlide(comp, object)

    comp.activity = object.activity

    slides.append(object.activity.render(true))

    Lampa.Listener.send('activity',{component: object.component, type: 'init', object})

    object.activity.create()

    Lampa.Listener.send('activity',{component: object.component, type: 'create', object})
}

/**
 * Вызов обратно пользователем
 */
function back(){
    listener.send('popstate',{count: activites.length})
    
    if(callback) callback()
    else{
        backward()
    }
}

/**
 * Получить активную активность
 * @returns {object}
 */
function active(){
    return activites[activites.length - 1]
}

function inActivity(){
    return $('body').hasClass('settings--open') || $('body').hasClass('menu--open') ? false : true
}

/**
 * Создать пустую историю
 */
function empty(){
    let curent = active()

    if(curent  && curent.activity) pushState(curent, false, 'r=' + Math.random())
}

/**
 * Получить все активности
 * @returns {[{component:string, activity:class}]}
 */
function all(){
    return activites
}

/**
 * Получить рендеры всех активностей
 * @returns {array}
 */
function renderLayers(js){
    let result = []

    all().forEach(item=>{
        if(item.activity) result.push(item.activity.render(js))
    })

    return result
}

/**
 * Обработать событие назад
 */
function backward(){
    callback = false;

    listener.send('backward',{count: activites.length})

    if(activites.length == 1) return

    Array.from(slides.children).forEach(slide=>slide.classList.remove('activity--active'))

    let curent = activites.pop()

    if(curent){
        setTimeout(function(){
            curent.activity.destroy()

            Lampa.Listener.send('activity',{component: curent.component, type: 'destroy', object: curent})
        },200)
    }

    let previous_tree = activites.slice(-maxsave)

    if(previous_tree.length > (maxsave - 1)){
        create(previous_tree[0])
    }

    previous_tree = activites.slice(-1)[0]
    
    if(previous_tree){
        if(previous_tree.activity){
            start(previous_tree)
            
            Lampa.Listener.send('activity',{component: previous_tree.component, type: 'archive', object: previous_tree})

            pushState(previous_tree, true)
        }
        else {
            create(previous_tree)

            start(previous_tree)

            pushState(previous_tree)
        }
    }
}

/**
 * Сохранить активность в память
 * @param {{component:string, activity:class}} object 
 */
function save(object){
    Storage.set('activity', extractObject(object))
}

/**
 * Получить данные активности
 * @param {{component:string, activity:class}} object 
 * @returns {{component:string}}
 */
function extractObject(object){
    let saved = {}

    for(let i in object){
        if(!(i == 'activity' || i == 'props' || i == 'params')) saved[i] = object[i]
    }

    return saved
}

/**
 * Активируем следующию активность 
 * @param {{component:string, activity:class}} object 
 */
function start(object){
    Head.title(object.title)

    if(object.activity.is_stopped){
        slides.append(object.activity.render(true))
    }

    object.activity.start()

    save(object)

    Array.from(slides.children).forEach(slide=>{
        slide.hasClass('activity--active') && slide.removeClass('activity--active')
    })

    object.activity.render().addClass('activity--active')

    Lampa.Listener.send('activity',{component: object.component, type: 'start', object})
}

/**
 * С какой активности начать запуск лампы
 */
function last(){
    let active = Storage.get('activity','false')
    let start_from = Storage.field("start_page")

    if(window.lampa_settings.iptv){
        active = {
            component: 'iptv',
            page: 1
        }

        push(active)
    }
    else if(window.start_deep_link){
        push(window.start_deep_link)
    }
    else if(active && start_from === "last"){
        if(active.page) active.page = 1

        push(active)
    }
    else{
        const [ action, type ] = start_from.split('@');

        if(action == 'favorite') {
            push({
                url: '',
                title: Lang.translate(type == 'bookmarks' ? 'settings_input_links' : 'title_history'),
                component: type == 'bookmarks' ? 'bookmarks' : 'favorite',
                type: type,
                page: 1
            })
        }
        else if(action == 'mytorrents') {
            push({
                url: '',
                title: Lang.translate('title_mytorrents'),
                component: 'mytorrents',
                page: 1
            })
        }
        else {
            push({
                url: '',
                title: Lang.translate('title_main') + ' - ' + Storage.field('source').toUpperCase(),
                component: 'main',
                source: Storage.field('source'),
                page: 1
            })
        }
    }
}

/**
 * Рендер
 * @returns {object}
 */
function render(){
    return content
}

/**
 * Подключить обратный вызов при изменени истории
 * @param {*} call 
 */
function call(call){
    callback = call
}

/**
 * Выход из лампы
 */
function out(){
    fullout = true

    back()

    for (let i = 0; i < window.history.length; i++) {
        back()
    }

    setTimeout(()=>{
        fullout = false

        empty()
    },100)
}

/**
 * Заменить активную активность
 * @param {object} replace 
 */
function replace(replace = {}, clear){
    let object = extractObject(active())

    for(var i in replace){
        object[i] = replace[i]
    }

    let made = active()

    made.activity.destroy()

    Lampa.Listener.send('activity',{component: made.component, type: 'destroy', object: made})

    activites.pop()

    push(clear ? replace : object)
}

function own(component){
    let curent = active()

    return curent && curent.activity && curent.activity === component.activity
}

export default {
    init,
    listener,
    push,
    back,
    render,
    backward,
    call,
    last,
    out,
    replace,
    active,
    all,
    extractObject,
    renderLayers,
    inActivity,
    pushState,
    mixState,
    own
}