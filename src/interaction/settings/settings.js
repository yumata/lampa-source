import Template from '../template'
import Controller from '../../core/controller'
import Component from './component'
import Main from './main'
import Subscribe from '../../utils/subscribe'
import DeviceInput from '../device_input'
import Activity from '../activity/activity'
import ParentalControl from '../parental_control'
import Head from '../head/head'

let html
let body
let listener = Subscribe()
let last = ''
let main

/**
 * Инициализация настроек
 * @returns {void}
 */
function init(){
    html     = Template.get('settings')
    body     = html.find('.settings__body')
    
    html.find('.settings__layer').on('click',(e)=>{
        if(DeviceInput.canClick(e.originalEvent)) Controller.back()
    })

    main = new Main()
    main.onCreate = create
    main.swipeAction = swipeAction

    main.create()

    Controller.add('settings',{
        toggle: ()=>{
            main.render().detach()
            main.update()
            
            listener.send('open', {
                name: 'main',
                body: main.render()
            })

            body.empty().append(main.render())

            main.active()

            $('body').toggleClass('settings--open',true)

            html.addClass('animate')

            Activity.mixState('settings=main')
        },
        up: ()=>{
            Navigator.move('up')
        },
        down: ()=>{
            Navigator.move('down')
        },
        left: ()=>{
            main.render().detach()
            
            Controller.toggle('content')
        },
        gone: (to)=>{
            if(to !== 'settings_component'){
                $('body').toggleClass('settings--open',false)

                html.removeClass('animate').removeClass('animate-down')
            } 
        },
        back: ()=>{
            main.render().detach()

            Controller.toggle('head')

            Activity.mixState()
        }
    })

    ParentalControl.add('settings',{
        title: 'title_settings'
    })

    Head.addIcon(Template.string('icon_settings'), ()=>{
        ParentalControl.personal('settings',()=>{
            Controller.toggle('settings')
        }, false, true)
    })
}

function swipeAction(){
    html.addClass('animate-down')

    setTimeout(()=>{
        Controller.back()
    },200)
}

/**
 * Создать компонент
 * @param {string} name - имя компонента
 * @returns {void}
 */
function create(name, params = {}){
    let comp = new Component(name, params)

    body.empty().append(comp.render())

    listener.send('open', {
        name: name,
        body: comp.render(),
        params
    })

    last = name

    Controller.toggle('settings_component')

    Activity.mixState('settings=' + name)
}

/**
 * Обновить открытый компонент
 * @returns {void}
 */
function update(){
    let selects = body.find('.selector')
    let lastinx = selects.index(body.find('.selector.focus'))

    create(last, {last_index: lastinx})
}

/**
 * Рендер
 * @param {boolean} js - вернуть DOM-элемент или jQuery объект
 * @returns {HTMLElement|jQuery} - DOM-элемент или jQuery объект
 */
function render(js){
    return js ? html[0] : html
}

export default {
    listener,
    init,
    render,
    update,
    create,
    main:()=>main
}