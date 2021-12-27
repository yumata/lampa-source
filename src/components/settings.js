import Template from '../interaction/template'
import Controller from '../interaction/controller'
import Component from './settings/component'
import Main from './settings/main'
import Subscribe from '../utils/subscribe'

let html     = Template.get('settings')
let body     = html.find('.settings__body')
let listener = Subscribe()
let last     = ''

html.find('.settings__layer').on('click',()=>{
    window.history.back()
})

function create(name){
    let comp = new Component(name)

    body.empty().append(comp.render())

    listener.send('open', {
        name: name,
        body: comp.render()
    })

    last = name

    Controller.toggle('settings_component')
}

function init(){
    let main = new Main()
        main.onCreate = create

        main.create()

    Controller.add('settings',{
        toggle: ()=>{
            listener.send('open', {
                name: 'main',
                body: main.render()
            })

            body.empty().append(main.render())

            main.active()

            $('body').toggleClass('settings--open',true)
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
            if(to !== 'settings_component') $('body').toggleClass('settings--open',false)
        },
        back: ()=>{
            main.render().detach()

            Controller.toggle('head')
        }
    })
}

function update(){
    create(last)
}

function render(){
    return html
}

export default {
    listener,
    init,
    render,
    update
}