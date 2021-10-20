import Template from '../interaction/template'
import Controller from '../interaction/controller'
import Utils from '../utils/math'
import Notice from '../interaction/notice'
import Activity from '../interaction/activity'

let html
let last

function init(){
    html = Template.get('head')

    Utils.time(html)
    Notice.start(html)

    html.find('.selector').on('hover:focus',(event)=>{
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