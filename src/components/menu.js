import Template from '../interaction/template'
import Controller from '../interaction/controller'
import Select from '../interaction/select'
import Api from '../interaction/api'
import Activity from '../interaction/activity'
import Modal from '../interaction/modal'
import Scroll from '../interaction/scroll'
import Storage from '../utils/storage'
import Filter from '../interaction/content_filter'
import Lang from '../utils/lang'

let html
let last
let scroll

function init(){
    html   = Template.get('menu')
    scroll = new Scroll({mask: true, over: true})

    Lampa.Listener.send('menu',{type:'start',body: html})

    $('body').on('mouseup',()=>{
        if($('body').hasClass('menu--open')){
            $('body').toggleClass('menu--open',false)

            Controller.toggle('content')
        }
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

function prepared(action, name){
    if(name.indexOf(action) >= 0){
        let comp = Lampa.Activity.active().component

        if(name.indexOf(comp) >= 0) Activity.replace()
        else return true
    }
}

function ready(){
    html.find('.selector').on('hover:enter',(e)=>{
        let action = $(e.target).data('action')
        let type   = $(e.target).data('type')

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
                title: 'Главная - ' + Storage.field('source').toUpperCase(),
                component: 'main',
                source: Storage.field('source')
            })
        }

        if(action == 'search')   Controller.toggle('search')
        if(action == 'settings') Controller.toggle('settings')
        if(action == 'about'){
            Modal.open({
                title: Lang.translate('title_about'),
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
                title: type == 'book' ? Lang.translate('title_book') : type == 'like' ? Lang.translate('title_like') : type == 'history' ? Lang.translate('title_history') : Lang.translate('title_wath'),
                component: 'favorite',
                type: type,
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

        if(action == 'collections'){
            Select.show({
                title: Lang.translate('title_collections'),
                items: [
                    {
                        title: Lang.translate('title_collections_ivi'),
                        source: 'ivi'
                    },
                    {
                        title: Lang.translate('title_collections_okko'),
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

        if(action == 'filter') Filter.show()

    }).on('hover:focus',(e)=>{
        last = e.target

        scroll.update($(e.target),true)
    })
}

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
                    url: Storage.field('source') == 'tmdb' ? 'movie' : '',
                    title: Lang.translate('title_catalog') + ' - ' + a.title + ' - ' + Storage.field('source').toUpperCase(),
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
    init,
    ready
}