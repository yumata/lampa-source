import Template from './template'
import Controller from '../core/controller'

let html
let object

function init(){
    html = Template.get('iframe')
}

function show(params = {}){
    object = params

    html.find('iframe').attr('src',params.url)[0].onload = ()=>{ 
        html.addClass('iframe--loaded')
    }

    $('body').append(html)

    toggle()
}

function toggle(){
    Controller.add('iframe',{
        toggle: ()=>{
            
        },
        back: close
    })
    
    Controller.toggle('iframe')
}

function close(){
    html.removeClass('iframe--loaded')

    html.detach()

    html.find('iframe').attr('src','')

    if(object.onBack) object.onBack()
}

function render(){
    return html
}

export default {
    init,
    show,
    close,
    render
}