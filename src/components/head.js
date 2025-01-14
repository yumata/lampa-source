import Template from '../interaction/template'
import Controller from '../interaction/controller'
import Utils from '../utils/math'
import Notice from '../interaction/notice'
import Activity from '../interaction/activity'
import Storage from '../utils/storage'
import Broadcast from '../interaction/broadcast'
import Platform from '../utils/platform'
import Search from './search'
import Modal from '../interaction/modal'
import Account from '../utils/account'
import Lang from '../utils/lang'
import DeviceInput from '../utils/device_input'
import Processing from '../interaction/processing'
import ParentalControl from '../interaction/parental_control'

let html
let last
let activi = false

function observe(){
    if(typeof MutationObserver == 'undefined') return

    let observer = new MutationObserver((mutations)=>{
        for(let i = 0; i < mutations.length; i++){
            let mutation = mutations[i]

            if(mutation.type == 'childList' && !mutation.removedNodes.length){
                let selectors = Array.from(mutation.target.querySelectorAll('.selector'))

                selectors.forEach(s=>{
                    $(s).unbind('hover:focus hover:hover hover:touch').on('hover:focus hover:hover hover:touch',(e)=>{
                        last = e.target
                    })
                })
            }
        }
    })

    observer.observe(html[0], {
        childList: true,
        subtree: true
    })
}

function init(){
    html = Template.get('head')

    if(!window.lampa_settings.feed) html.find('.open--feed').remove()

    html.find('.head__actions').prepend(Processing.render())

    Utils.time(html)

    html.find('.selector').data('controller','head').on('hover:focus hover:hover hover:touch',(event)=>{
        last = event.target
    })

    observe()

    html.find('.open--settings').on('hover:enter',()=>{
        ParentalControl.personal('settings',()=>{
            Controller.toggle('settings')
        }, false, true)
    })

    html.find('.open--notice').on('hover:enter',Notice.open.bind(Notice))

    html.find('.open--search').on('hover:enter',Search.open.bind(Search))

    html.find('.head__logo-icon,.head__menu-icon').on('click',(e)=>{
        if(DeviceInput.canClick(e.originalEvent)) Controller.toggle('menu')
    })

    Storage.listener.follow('change',(e)=>{
        if(e.name == 'account'){
            html.find('.open--profile').toggleClass('hide',e.value.token && window.lampa_settings.account_use ? false : true)
        }
        if(e.name == 'account_user'){
            html.find('.open--premium').toggleClass('hide', Account.hasPremium() || window.lampa_settings.white_use ? true : !Lang.selected(['ru','uk','be']))
        }
    })

    html.find('.full-screen').on('hover:enter',()=>{
        Utils.toggleFullscreen()
    }).toggleClass('hide',Platform.tv() || Platform.is('android') || !Utils.canFullScreen())

    if(!Lang.selected(['ru','uk','be'])){
        html.find('.open--feed').remove()
    }
    else{
        html.find('.open--feed').on('hover:enter',()=>{
            Activity.push({
                url: '',
                title: Lang.translate('menu_feed'),
                component: 'feed',
                page: 1
            })
        })
    }

    html.find('.open--premium').toggleClass('hide', Account.hasPremium() || window.lampa_settings.white_use ? true : !Lang.selected(['ru','uk','be'])).on('hover:enter',()=>{
        Modal.open({
            title: '',
            size: 'full',
            mask: true,
            html: Template.get('cub_premium_modal'),
            onBack: ()=>{
                Modal.close()

                Controller.toggle('head')
            }
        })
    })

    Controller.add('head',{
        toggle: ()=>{
            Controller.collectionSet(html, false, true)
            Controller.collectionFocus(last, html, true)
        },
        right: ()=>{
            Navigator.move('right')
        },
        left: ()=>{
            if(Navigator.canmove('left')) Navigator.move('left')
            else Controller.toggle('menu')
        },
        down: ()=>{
            Controller.toggle('content')
        },
        back: ()=>{
            Activity.backward()
        }
    })

    let timer
    let broadcast = html.find('.open--broadcast').hide()
    
    broadcast.on('hover:enter',()=>{
        Broadcast.open({
            type: 'card',
            object: Activity.extractObject(activi)
        })
    })
    
    Lampa.Listener.follow('activity',(e)=>{
        if(e.type == 'start') activi = e.object

        clearTimeout(timer)

        timer = setTimeout(()=>{
            if(activi){
                if(activi.component !== 'full'){
                    broadcast.hide()

                    activi = false
                }
            }
        },1000)

        if(e.type == 'start' && e.component == 'full'){
            broadcast.show()

            activi = e.object
        }
    })
}

function title(title){
    html.find('.head__title').text(title || '')
}

function render(){
    return html
}

export default {
    render,
    title,
    init
}