import Template from '../interaction/template'
import Controller from '../interaction/controller'
import Component from './settings/component'
import Main from './settings/main'

let html = Template.get('settings')
let body = html.find('.settings__body')

function create(name){
    let comp = new Component(name)

    body.empty().append(comp.render())

    Controller.toggle('settings_component')
}

let main = new Main()
    main.onCreate = create

    main.create()

Controller.add('settings',{
    toggle: ()=>{
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


function render(){
    return html
}

export default {
    render
}