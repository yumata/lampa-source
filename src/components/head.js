import Template from '../interaction/template'
import Controller from '../interaction/controller'
import Utils from '../utils/math'
import Notice from '../interaction/notice'
import Activity from '../interaction/activity'

let html,
    last,
    clockInterval

function init(){
    html = Template.get('head')

    tick();
    clockInterval = setInterval(tick, 1000);

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

function tick() {
    const dateTime = Utils.parseTime();

    $('.head__time .time--clock').text(dateTime.time);
    $('.head__time .time--week').text(dateTime.week);
    $('.head__time .time--day').text(dateTime.day);
    $('.head__time .time--moth').text(dateTime.month);
    $('.head__time .time--full').text(dateTime.full);
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