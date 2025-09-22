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

let html
let last
let scroll
let visible_timer

/**
 * Инициализация меню
 * @returns {void}
 */
function init(){
    html   = Template.get('menu')
    scroll = new Scroll({mask: true, over: true})

    // Удаление пунктов меню в зависимости от настроек
    if(!window.lampa_settings.torrents_use) html.find('[data-action="mytorrents"]').remove()

    if(window.lampa_settings.disable_features.persons) html.find('[data-action="myperson"]').remove()
    if(window.lampa_settings.disable_features.subscribe) html.find('[data-action="subscribes"]').remove()

    if(!Lang.selected(['ru','uk','be'])){
        html.find('[data-action="relise"],[data-action="anime"],[data-action="feed"]').remove()
    }

    if(!window.lampa_settings.feed) html.find('[data-action="feed"]').remove()
    
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

        if(action == 'catalog') catalog()

        if(action == 'movie' || action == 'tv' || action == 'anime'){
            Activity.push({
                url: action,
                title: (action == 'movie' ? Lang.translate('menu_movies') : action == 'anime' ? Lang.translate('menu_anime') : Lang.translate('menu_tv')) + ' - ' + Storage.field('source').toUpperCase(),
                component: 'category',
                source: action == 'anime' ? 'cub' : Storage.field('source')
            })
        }

        if(prepared(action,['main'])){
            Activity.push({
                url: '',
                title: Lang.translate('title_main') + ' - ' + Storage.field('source').toUpperCase(),
                component: 'main',
                source: Storage.field('source')
            })
        }

        if(prepared(action,['myperson'])){
            Activity.push({
                title: Lang.translate('title_persons'),
                component: 'myperson'
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
                    Activity.push({
                        url: '',
                        title: Lang.translate('settings_input_links'),
                        component: 'bookmarks',
                        page: 1
                    })
                }
            }, false, true)
        }

        if(action == 'history'){
            ParentalControl.personal('bookmarks',()=>{
                if(prepared('favorite',['favorite'])){
                    Activity.push({
                        url: '',
                        title: Lang.translate('title_history'),
                        component: 'favorite',
                        type: 'history',
                        page: 1
                    })
                }
            }, false, true)
        }

        if(action == 'subscribes'){
            Activity.push({
                url: '',
                title: Lang.translate('title_subscribes'),
                component: 'subscribes',
                page: 1
            })
        }

        if(prepared(action,['timetable'])){
            Activity.push({
                url: '',
                title: Lang.translate('title_timetable'),
                component: 'timetable',
                page: 1
            })
        }

        if(prepared(action,['feed'])){
            Activity.push({
                url: '',
                title: Lang.translate('menu_feed'),
                component: 'feed',
                page: 1
            })
        }

        if(prepared(action,['mytorrents'])){
            Activity.push({
                url: '',
                title: Lang.translate('title_mytorrents'),
                component: 'mytorrents',
                page: 1
            })
        }

        if(prepared(action,['relise'])){
            Activity.push({
                url: '',
                title: Lang.translate('title_relises'),
                component: 'relise',
                page: 1
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
                
                Activity.push({
                    url: Storage.field('source') == 'tmdb' ? 'movie' : 'movie',
                    title: (a.title || Lang.translate('title_catalog')) + ' - ' + Storage.field('source').toUpperCase(),
                    component: tmdb ? 'category' : 'category_full',
                    genres: a.id,
                    id: a.id,
                    source: Storage.field('source'),
                    card_type: true,
                    page: 1
                })
            },
            onBack: ()=>{
                Controller.toggle('menu')
            }
        })
    })
}

function toggle(){
    if($('body').hasClass('menu--open')) Controller.toggle('content')
    else Controller.toggle('menu')

    Lampa.Listener.send('menu',{type:'toggle'})
}

function opened(){
    return $('body').hasClass('menu--open')
}

function open(){
    if(!opened()) toggle()
}

function close(){
    if(opened()) toggle()
}

function render(){
    return scroll.render()
}

export default {
    init,
    render,
    ready,
    toggle,
    opened,
    open,
    close
}