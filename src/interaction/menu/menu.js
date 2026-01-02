import Template from '../template'
import Controller from '../../core/controller'
import Select from '../select'
import Api from '../../core/api/api'
import Activity from '../activity/activity'
import Modal from '../modal'
import Scroll from '../scroll'
import Storage from '../../core/storage/storage'
import Filter from '../content_filter/menu'
import Lang from '../../core/lang'
import Platform from '../../core/platform'
import DeviceInput from '../device_input'
import ParentalControl from '../parental_control'
import Editor from './editor'
import Utils from '../../utils/utils'
import Router from '../../core/router'

let html
let last
let scroll
let visible_timer

let menu_items = [
    {action: 'main', title: 'menu_main', sprite: 'home'},
    {action: 'feed', title: 'menu_feed', sprite: 'feed'},
    {action: 'movie', title: 'menu_movies', sprite: 'movie'},
    {action: 'cartoon', title: 'menu_multmovie', sprite: 'cartoon'},
    {action: 'tv', title: 'menu_tv', sprite: 'tv'},
    {action: 'myperson', title: 'title_persons', sprite: 'person'},
    {action: 'catalog', title: 'menu_catalog', sprite: 'catalog'},
    {action: 'filter', title: 'menu_filter', sprite: 'filter'},
    {action: 'relise', title: 'menu_relises', sprite: 'hd'},
    {action: 'anime', title: 'menu_anime', sprite: 'anime'},
    {action: 'favorite', title: 'settings_input_links', sprite: 'favorite'},
    {action: 'history', title: 'menu_history', sprite: 'history'},
    {action: 'subscribes', title: 'title_subscribes', sprite: 'subscribes'},
    {action: 'timetable', title: 'menu_timeline', sprite: 'calendar'},
    {action: 'mytorrents', title: 'menu_torrents', sprite: 'torrent'},
]

/**
 * Инициализация меню
 * @returns {void}
 */
function init(){
    html   = Template.get('menu')
    scroll = new Scroll({mask: true, over: true})

    // Фильтрация пунктов меню в зависимости от настроек
    menu_items = menu_items.filter(item=>{
        if(!window.lampa_settings.torrents_use && item.action == 'mytorrents') return false
        if(window.lampa_settings.disable_features.persons && item.action == 'myperson') return false
        if(window.lampa_settings.disable_features.subscribe && item.action == 'subscribes') return false
        if(!window.lampa_settings.feed && item.action == 'feed') return false

        if(!Lang.selected(['ru','uk','be']) && (item.action == 'relise' || item.action == 'anime' || item.action == 'feed')) return false

        return true
    })

    // Добавление кнопок меню
    menu_items.forEach((item)=>{
        addButton(`<svg><use xlink:href="#sprite-${item.sprite}"></use></svg>`, Lang.translate(item.title)).attr('data-action', item.action)
    })
    
    // Отправка события для плагинов
    Lampa.Listener.send('menu',{type:'start', body: html})

    // Инициализация редактора меню
    Editor.init($('.menu__list:eq(0)', html))

    // Наблюдатель за добавлением новых селекторов в меню
    observe()

    // Инициализация контроллера меню
    Controller.add('menu',{
        toggle: ()=>{
            Controller.collectionSet(html)
            Controller.collectionFocus(last,html,true)

            clearTimeout(visible_timer)

            $('.wrap__left').removeClass('wrap__left--hidden')
    
            $('body').toggleClass('menu--open',true)
        },
        right: ()=>{
            Controller.toggle('content')
        },
        up: ()=>{
            if(Navigator.canmove('up')) Navigator.move('up')
            else Controller.toggle('head')
        },
        down: ()=>{
            if(Navigator.canmove('down')) Navigator.move('down')
        },
        gone: ()=>{
            $('body').toggleClass('menu--open',false)

            visible_timer = setTimeout(()=>{
                $('.wrap__left').addClass('wrap__left--hidden')
            },300)
        },
        back: ()=>{
            Activity.backward()
        }
    })

    // Закрытие меню по клику вне его области
    $('body').on('mousedown',(e)=>{
        if(DeviceInput.canClick(e.originalEvent) && opened()){
            if(e.originalEvent.clientX > html.outerWidth()) close()
        }
    })

    scroll.minus()
    scroll.append(html)

    // Отправка события для плагинов
    Lampa.Listener.send('menu',{type:'end'})

    Lampa.Listener.follow('app',e=>{
        if(e.type == 'ready') ready()
    })
}

/**
 * Следит за добавлением новых селекторов в меню
 * @returns {void}
 */
function observe(){
    if(typeof MutationObserver == 'undefined') return

    let observer = new MutationObserver((mutations)=>{
        for(let i = 0; i < mutations.length; i++){
            let mutation = mutations[i]

            if(mutation.type == 'childList' && !mutation.removedNodes.length){
                let selectors = Array.from(mutation.target.querySelectorAll('.selector')).filter(s=>!s.checked)

                if(selectors.length) Editor.observe()

                selectors.forEach(s=>{
                    s.checked=true

                    if(!$(s).data('binded_events')){
                        $(s).on('hover:focus',(e)=>{
                            last = e.target

                            scroll.update($(e.target),true)
                        }).on('hover:hover hover:touch hover:enter',(e)=>{
                            last = e.target
                        })
                    }
                })
            }
        }
    })

    observer.observe(html[0], {
        childList: true,
        subtree: true
    })
}

/**
 * Проверяет, нужно ли открывать новый компонент или обновлять текущий
 * @param {string} action Действие, которое нужно выполнить
 * @param {Array} name Название компонента(ов), которые нужно проверить
 * @returns {boolean|void} Нужно ли открывать новый компонент или обновлять текущий
 */
function prepared(action, name){
    if(name.indexOf(action) >= 0){
        let comp = Lampa.Activity.active().component

        if(name.indexOf(comp) >= 0) Activity.replace()
        else return true
    }
}

/**
 * Готово к работе
 * @returns {void}
 */
function ready(){
    html.find('.selector').data('binded_events',true).on('hover:enter',(e)=>{
        let action = $(e.target).data('action')

        Lampa.Listener.send('menu',{type:'action', action: action, target: e.target, abort: ()=>{ action = null }})

        if(action == 'catalog') catalog()

        if(action == 'movie' || action == 'tv' || action == 'anime'){
            Router.call('category', {
                url: action,
                title: (action == 'movie' ? Lang.translate('menu_movies') : action == 'anime' ? Lang.translate('menu_anime') : Lang.translate('menu_tv')) + ' - ' + Storage.field('source').toUpperCase(),
                source: action == 'anime' ? 'cub' : Storage.field('source')
            })
        }

        if(action == 'cartoon'){
            Router.call('category', {
                url: 'movie',
                title: Lang.translate('menu_multmovie') + ' - ' + Storage.field('source').toUpperCase(),
                genres: 16
            })
        }

        if(prepared(action,['main'])){
            Router.call('main', {
                title: Lang.translate('title_main') + ' - ' + Storage.field('source').toUpperCase()
            })
        }

        if(prepared(action,['myperson'])){
            Router.call('myperson', {
                title: Lang.translate('title_persons')
            })
        }

        if(action == 'search') Controller.toggle('search')

        if(action == 'settings'){
            ParentalControl.personal('settings',()=>{
                Controller.toggle('settings')
            }, false, true)
        }

        if(action == 'about'){
            let about = Template.get('about')

            if(window.lampa_settings.white_use){
                about.find('.about__contacts > div:eq(1)').remove()
            }

            if(Platform.is('android')){
                about.find('.platform_android').removeClass('hide')
                about.find('.version_android').text(Platform.version('android'))
            }

            about.find('.version_app').text(Platform.version('app'))

            Modal.open({
                about: true,
                title: Lang.translate('title_about'),
                html: about,
                size: 'medium',
                onBack: ()=>{
                    Modal.close()

                    Controller.toggle('content')
                }
            })
        }

        if(action == 'favorite'){
            ParentalControl.personal('bookmarks',()=>{
                if(prepared('bookmarks',['bookmarks'])){
                    Router.call('bookmarks', {
                        title: Lang.translate('settings_input_links')
                    })
                }
            }, false, true)
        }

        if(action == 'history'){
            ParentalControl.personal('bookmarks',()=>{
                if(prepared('favorite',['favorite'])){
                    Router.call('favorite', {
                        title: Lang.translate('title_history'),
                        type: 'history'
                    })
                }
            }, false, true)
        }

        if(action == 'subscribes'){
            Router.call('subscribes', {
                title: Lang.translate('title_subscribes')
            })
        }

        if(prepared(action,['timetable'])){
            Router.call('timetable', {
                title: Lang.translate('title_timetable')
            })
        }

        if(prepared(action,['feed'])){
            Router.call('feed', {
                title: Lang.translate('menu_feed')
            })
        }

        if(prepared(action,['mytorrents'])){
            Router.call('mytorrents', {
                title: Lang.translate('title_mytorrents')
            })
        }

        if(prepared(action,['relise'])){
            Router.call('relise', {
                title: Lang.translate('title_relises')
            })
        }

        if(action == 'console'){
            Controller.toggle('console')
        }

        if(action == 'filter') Filter.show()

        if(action == 'edit') Editor.start()

    }).on('hover:focus',(e)=>{
        last = e.target

        scroll.update($(e.target), true)
    }).on('hover:hover hover:touch hover:enter',(e)=>{
        last = e.target
    })
}

/**
 * Открывает каталог
 * @returns {void}
 */
function catalog(){
    Api.menu({
        source: Storage.field('source')
    },(menu)=>{
        Select.show({
            title: Lang.translate('title_catalog'),
            items: menu,
            onSelect: (a)=>{
                let tmdb = (Storage.field('source') == 'tmdb' || Storage.field('source') == 'cub')
                
                Router.call(tmdb ? 'category' : 'category_full', {
                    url: 'movie',
                    title: (a.title || Lang.translate('title_catalog')) + ' - ' + Storage.field('source').toUpperCase(),
                    genres: a.id,
                    id: a.id
                })

                // Activity.push({
                //     url: Storage.field('source') == 'tmdb' ? 'movie' : 'movie',
                //     title: (a.title || Lang.translate('title_catalog')) + ' - ' + Storage.field('source').toUpperCase(),
                //     component: tmdb ? 'category' : 'category_full',
                //     genres: a.id,
                //     id: a.id,
                //     source: Storage.field('source'),
                //     card_type: true,
                //     page: 1
                // })
            },
            onBack: open
        })
    })
}

/**
 * Добавляет элемент в меню
 * @param {JQuery} element Элемент меню
 * @param {Function} action Действие при нажатии на элемент
 * @returns {JQuery} Добавленный элемент меню
 */
function addElement(element, action){
    html.find('.menu__list:eq(0)').append(element)

    if(action && typeof action == 'function') element.on('hover:enter', action)
    
    return element
}

/**
 * Добавляет кнопку в меню
 * @param {string} svg_icon SVG иконка кнопки
 * @param {string} title Название кнопки
 * @param {Function} action Действие при нажатии на кнопку
 * @returns {JQuery} Добавленная кнопка меню
 */
function addButton(svg_icon, title, action){
    return addElement($(`<div class="menu__item selector"><div class="menu__ico">${svg_icon}</div><div class="menu__text">${title}</div></div>`), action)
}

/**
 * Переключает меню
 * @returns {void}
 */
function toggle(){
    if($('body').hasClass('menu--open')) Controller.toggle('content')
    else Controller.toggle('menu')

    Lampa.Listener.send('menu',{type:'toggle'})
}

/**
 * Проверяет, открыто ли меню
 * @returns {boolean} Открыто ли меню
 */
function opened(){
    return $('body').hasClass('menu--open')
}

/**
 * Открывает меню
 * @returns {void}
 */
function open(){
    if(!opened()) toggle()
}

/**
 * Закрывает меню
 * @returns {void}
 */
function close(){
    if(opened()) toggle()
}

/**
 * Рендерит меню
 * @returns {JQuery} Меню
 */
function render(){
    return scroll.render()
}

export default {
    init: Utils.onceInit(init),
    render,
    ready,
    toggle,
    opened,
    addElement,
    addButton,
    open,
    close
}