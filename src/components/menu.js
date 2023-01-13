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
import Platform from '../utils/platform'
import DeviceInput from '../utils/device_input'

let html
let last
let scroll

let edit_mode

let sort_item
let sort_timer

let visible_timer

function init(){
    html   = Template.get('menu')
    scroll = new Scroll({mask: true, over: true})

    Lampa.Listener.send('menu',{type:'start',body: html})

    updateSort()

    observe()

    controller()

    $('body').on('mouseup',(e)=>{
        if($('body').hasClass('menu--open') && DeviceInput.canClick(e.originalEvent)){
            $('body').toggleClass('menu--open',false)

            disableEditMode()

            Controller.toggle('content')
        }
    })

    scroll.minus()
    scroll.append(html)

    Lampa.Listener.send('menu',{type:'end'})
}

function observe(){
    if(typeof MutationObserver == 'undefined') return

    let observer = new MutationObserver((mutations)=>{
        for(let i = 0; i < mutations.length; i++){
            let mutation = mutations[i]

            if(mutation.type == 'childList' && !mutation.removedNodes.length){
                let selectors = Array.from(mutation.target.querySelectorAll('.selector')).filter(s=>!s.checked)

                if(selectors.length) updateSort()

                selectors.forEach(s=>s.checked=true)
            }
        }
    })

    observer.observe(html[0], {
        childList: true,
        subtree: true
    })
}

function controller(){
    Controller.add('menu',{
        toggle: ()=>{
            Controller.collectionSet(html)
            Controller.collectionFocus(last,html)

            clearTimeout(visible_timer)

            $('.wrap__left').removeClass('wrap__left--hidden')
    
            $('body').toggleClass('menu--open',true)
        },
        update: ()=>{

        },
        right: ()=>{
            if(edit_mode){
                if(sort_item){
                    sort_item.removeClass('traverse')

                    sort_item = false
                }
                else disableEditMode()
            }
            else Controller.toggle('content')
        },
        up: ()=>{
            if(sort_item){
                sort_item.prev().insertAfter(sort_item)

                scroll.update(sort_item,true)

                saveSort()
            }
            else if(Navigator.canmove('up')) Navigator.move('up')
            else Controller.toggle('head')
        },
        left: ()=>{
            if(edit_mode){
                if(!sort_item){
                    sort_item = $(last)

                    sort_item.addClass('traverse')
                }
                else{
                    sort_item.removeClass('traverse')

                    sort_item = false

                    let name = $(last).text().trim()
                    let hide = Storage.get('menu_hide','[]')

                    if(hide.indexOf(name) == -1){
                        if($('.menu__list:eq(0) .menu__item:not(.hidden)',html).length > 3) hide.push(name)
                    } 
                    else hide.splice(hide.indexOf(name),1)

                    Storage.set('menu_hide',hide)

                    hideItems()
                }
            }
        },
        down: ()=>{
            if(sort_item){
                sort_item.next().insertBefore(sort_item)

                scroll.update(sort_item,true)

                saveSort()
            }
            else if(Navigator.canmove('down')) Navigator.move('down')
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
}

function updateSort(){
    clearTimeout(sort_timer)

    sort_timer = setTimeout(()=>{
        checkSort()
        bindItems()
    },500)
}

function checkSort(){
    let memory = Storage.get('menu_sort','[]')
    let anon   = getSort()

    anon.forEach((item)=>{
        if(memory.indexOf(item) == -1) memory.push(item)
    })

    Storage.set('menu_sort',memory)

    orderSort()
    hideItems()
}

function getSort(){
    let items = []

    $('.menu__list:eq(0) .menu__item',html).each(function(){
        items.push($(this).text().trim())
    })

    return items
}

function saveSort(){
    Storage.set('menu_sort',getSort())
}

function orderSort(){
    let items = Storage.get('menu_sort','[]')

    if(items.length){
        let list = $('.menu__list:eq(0)',html)

        items.forEach((item)=>{
            let el = $('.menu__item:contains("'+item+'")',list)

            if(el.length) el.appendTo(list)
        })
    }
}

function hideItems(){
    let items = Storage.get('menu_hide','[]')

    $('.menu__item',html).removeClass('hidden')

    if(items.length){
        let list = $('.menu__list:eq(0)',html)

        items.forEach((item)=>{
            let el = $('.menu__item:contains("'+item+'")',list)

            if(el.length) el.addClass('hidden')
        })
    }
}

function enableEditMode(){
    html.addClass('editable')

    edit_mode = true

    scroll.update($(last),true)
}

function disableEditMode(){
    html.removeClass('editable')
    
    edit_mode = false

    if(sort_item){
        sort_item.removeClass('traverse')

        sort_item = false
    }

    if($(last).hasClass('hidden')){
        let list   = $('.menu__list:eq(0)',html)
        let items  = $('.menu__item',list)
        let inx    = items.index($(last))
        let nohide = items.not('.hidden')

        if(nohide.eq(inx).length) last = nohide.eq(inx)[0]
        else if(nohide.eq(inx-1).length) last = nohide.eq(inx-1)[0]
        else last = nohide.eq(0)[0]

        Controller.collectionFocus(last,html)

        scroll.update($(last),true)
    }
}

function bindItems(){
    let list = $('.menu__list:eq(0)',html)

    $('.menu__item',list).not('.binded').each(function(){
        let item = $(this)

        item.on('hover:long',()=>{
            if(typeof MutationObserver !== 'undefined') enableEditMode()
        })

        item.addClass('binded')
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
                title: Lang.translate('title_main') + ' - ' + Storage.field('source').toUpperCase(),
                component: 'main',
                source: Storage.field('source')
            })
        }

        if(action == 'search')   Controller.toggle('search')
        if(action == 'settings') Controller.toggle('settings')
        if(action == 'about'){
            let about = Template.get('about')

            if(Platform.is('android')){
                about.find('.platform_android').removeClass('hide')
                about.find('.version_android').text(Platform.version('android'))
            }

            about.find('.version_app').text(Platform.version('app'))

            Modal.open({
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
            Activity.push({
                url: '',
                title: type == 'book' ? Lang.translate('title_book') : type == 'like' ? Lang.translate('title_like') : type == 'history' ? Lang.translate('title_history') : Lang.translate('title_wath'),
                component: 'favorite',
                type: type,
                page: 1
            })
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

    }).on('hover:focus',(e)=>{
        last = e.target

        scroll.update($(e.target),true)
    }).on('hover:hover',(e)=>{
        last = e.target
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

function render(){
    return scroll.render()
}

export default {
    render,
    init,
    ready
}