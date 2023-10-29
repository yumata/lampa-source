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

        document.body.toggleClass('ambience--enable',false)

        Controller.toggle(controller)

        listener.send('close',{})
    }

    extensions.create()

    document.body.toggleClass('ambience--enable',true)
    
    document.body.appendChild(extensions.render(true))

    extensions.toggle()

    listener.send('open',{extensions})
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