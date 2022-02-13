import Template from '../interaction/template'
import Controller from '../interaction/controller'
import Utils from '../utils/math'
import Notice from '../interaction/notice'
import Activity from '../interaction/activity'
import Storage from '../utils/storage'
import Account from '../utils/account'

let html
let last

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
        Controller.toggle('search')
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