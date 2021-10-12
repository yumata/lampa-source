import Template from '../interaction/template'
import Controller from '../interaction/controller'
import Select from '../interaction/select'
import Api from '../interaction/api'
import Activity from '../interaction/activity'
import Modal from '../interaction/modal'

let html
let last
let genres = []

function init(){
    html = Template.get('menu')

    html.find('.selector').on('hover:enter',(e)=>{
        let action = $(e.target).data('action')
        let type   = $(e.target).data('type')

        if(action == 'catalog') catalog()

        if(action == 'movie' || action == 'tv'){
            Activity.push({
                url: action,
                title: action == 'movie' ? 'Фильмы' : 'Сериалы',
                component: 'category'
            })
        }

        if(action == 'main'){
            Activity.push({
                url: '',
                title: 'Главная',
                component: 'main'
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
                title: type == 'book' ? 'Закладки' : type == 'like' ? 'Нравится' : 'Позже',
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

    }).on('hover:focus',(e)=>{
        last = e.target
    })

    Api.genres({},(json)=>{
        genres = json.genres
    })

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
    let menu = []

    genres.forEach(element => {
        menu.push({
            title: element.name,
            id: element.id
        })
    })

    Select.show({
        title: 'Каталог',
        items: menu,
        onSelect: (a)=>{
            Activity.push({
                url: 'movie',
                title: a.title,
                component: 'category',
                genres: a.id
            })
        },
        onBack: ()=>{
            Controller.toggle('menu')
        }
    })
}

function render(){
    return html
}

export default {
    render,
    init
}