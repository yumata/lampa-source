import Template from '../interaction/template'
import Controller from '../interaction/controller'
import Select from '../interaction/select'
import Api from '../interaction/api'
import Activity from '../interaction/activity'
import Modal from '../interaction/modal'
import Scroll from '../interaction/scroll'
import Storage from '../utils/storage'

let html
let last
let scroll

function init(){
    html   = Template.get('menu')
    scroll = new Scroll({mask: true, over: true})

    Lampa.Listener.send('menu',{type:'start',body: html})

    $('body').on('mousedown',()=>{
        if($('body').hasClass('menu--open')){
            $('body').toggleClass('menu--open',false)

            Controller.toggle('content')
        }
    })

    html.find('.selector').on('hover:enter',(e)=>{
        let action = $(e.target).data('action')
        let type   = $(e.target).data('type')

        if(action == 'catalog') catalog()

        if(action == 'movie' || action == 'tv' || action == 'anime'){
            Activity.push({
                url: action,
                title: (action == 'movie' ? 'Фильмы' : action == 'anime' ? 'Аниме' : 'Сериалы') + ' - ' + Storage.field('source').toUpperCase(),
                component: 'category',
                source: action == 'anime' ? 'cub' : Storage.field('source')
            })
        }

        if(action == 'main'){
            Activity.push({
                url: '',
                title: 'Главная - ' + Storage.field('source').toUpperCase(),
                component: 'main',
                source: Storage.field('source')
            })
        }

        if(action == 'search')   Controller.toggle('search')
        if(action == 'settings') Controller.toggle('settings')
        if(action == 'about'){
            Modal.open({
                title: 'О приложении',
                html: Template.get('about'),
                size: 'medium',
                onBack: ()=>{
                    Modal.close()

                    Controller.toggle('content')
                }
            })
        }

        if(action == 'favorite'){
            Activity.push({
                url: '',
                title: type == 'book' ? 'Закладки' : type == 'like' ? 'Нравится' : type == 'history' ? 'История просмотров' : 'Позже',
                component: 'favorite',
                type: type,
                page: 1
            })
        }

        if(action == 'mytorrents'){
            Activity.push({
                url: '',
                title: 'Мои торренты',
                component: 'mytorrents',
                page: 1
            })
        }

        if(action == 'relise'){
            Activity.push({
                url: '',
                title: 'Цифровые релизы',
                component: 'relise',
                page: 1
            })
        }

        if(action == 'collections'){
            Select.show({
                title: 'Подборки',
                items: [
                    {
                        title: 'Подборки на ivi',
                        source: 'ivi'
                    },
                    {
                        title: 'Подборки на okko',
                        source: 'okko'
                    }
                ],
                onSelect: (a)=>{
                    Activity.push({
                        url: '',
                        source: a.source,
                        title: a.title,
                        component: 'collections',
                        page: 1
                    })
                },
                onBack: ()=>{
                    Controller.toggle('menu')
                }
            })
        }

    }).on('hover:focus',(e)=>{
        last = e.target

        scroll.update($(e.target),true)
    })

    scroll.minus()
    scroll.append(html)

    Lampa.Listener.send('menu',{type:'end'})

    Controller.add('menu',{
        toggle: ()=>{
            Controller.collectionSet(html)
            Controller.collectionFocus(last,html)
    
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
            Navigator.move('down')
        },
        gone: ()=>{
            $('body').toggleClass('menu--open',false)
        },
        back: ()=>{
            Activity.backward()
        }
    })
}

function catalog(){
    Api.menu({
        source: Storage.field('source')
    },(menu)=>{
        Select.show({
            title: 'Каталог',
            items: menu,
            onSelect: (a)=>{
                let tmdb = Storage.field('source') == 'tmdb' || Storage.field('source') == 'cub'

                Activity.push({
                    url: Storage.field('source') == 'tmdb' ? 'movie' : '',
                    title: 'Каталог - ' + a.title + ' - ' + Storage.field('source').toUpperCase(),
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

function render(){
    return scroll.render()
}

export default {
    render,
    init
}