import Controller from './controller'
import Subscribe from '../utils/subscribe'
import Main from './extensions/main'

let extensions
let listener = Subscribe()

function init(){}


function show(){
    if(extensions) return

    let controller = Controller.enabled().name

    extensions = new Main()
    
    extensions.onBack = ()=>{
        extensions.destroy()

        extensions = null

        Controller.toggle(controller)
    }

    extensions.create()
    extensions.toggle()

    document.body.appendChild(extensions.render(true))
}


function render(js){
    let html = extensions ? extensions.render() : document.createElement('div')

    return js ? html : $(html)
}

export default {
    init,
    listener,
    show,
    render
}