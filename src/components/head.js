import Template from '../interaction/template'
import Controller from '../interaction/controller'
import Utils from '../utils/math'
import Notice from '../interaction/notice'
import Activity from '../interaction/activity'
import Storage from '../utils/storage'
import Account from '../utils/account'
import Broadcast from '../interaction/broadcast'
import Platform from '../utils/platform'
import Search from './search'

let html
let last
let activi = false

function init(){
    html = Template.get('head')

    Utils.time(html)
    Notice.start(html)

    html.find('.selector').data('controller','head').on('hover:focus',(event)=>{
        last = event.target
    })

    html.find('.open--settings').on('hover:enter',()=>{
        Controller.toggle('settings')
    })

    html.find('.open--notice').on('hover:enter',()=>{
        Notice.open()
    })

    html.find('.open--search').on('hover:enter',()=>{
        Search.open()
    })

    html.find('.head__logo-icon').on('click',()=>{
        Controller.toggle('menu')
    })

    Storage.listener.follow('change',(e)=>{
        if(e.name == 'account'){
            html.find('.open--profile').toggleClass('hide',e.value.token ? false : true)
        }
    })

    if(Storage.get('account','{}').token) html.find('.open--profile').removeClass('hide')

    html.find('.open--profile').on('hover:enter',()=>{
        Account.showProfiles('head')
    })

    html.find('.full-screen').on('hover:enter',()=>{
        Utils.toggleFullscreen()
    }).toggleClass('hide',Platform.tv() || Platform.is('android'))

    Controller.add('head',{
        toggle: ()=>{
            Controller.collectionSet(html)
            Controller.collectionFocus(last,html)
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
    html.find('.head__title').text(title ? '- '+title : '')
}

function render(){
    return html
}

export default {
    render,
    title,
    init
}