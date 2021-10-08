import Template from './template'
import Scroll from './scroll'
import Controller from '../interaction/controller'

let html,
    active,
    scroll,
    last

function open(params){
    active = params

    html = Template.get('modal',{title: params.title})

    title(params.title)

    html.toggleClass('modal--medium', params.size == 'medium' ? true : false)
    html.toggleClass('modal--large', params.size == 'large' ? true : false)

    scroll = new Scroll({over: true, mask: params.mask})

    html.find('.modal__body').append(scroll.render())

    bind(params.html)

    scroll.append(params.html)

    $('body').append(html)

    toggle()
}

function bind(where){
    where.find('.selector').on('hover:focus',(e)=>{
        last = e.target

        scroll.update($(e.target))
    }).on('hover:enter',(e)=>{
        if(active.onSelect) active.onSelect($(e.target))
    })
}

function toggle(){
    Controller.add('modal',{
        invisible: true,
        toggle: ()=>{
            Controller.collectionSet(scroll.render())
            Controller.collectionFocus(last,scroll.render())
        },
        up: ()=>{
            Navigator.move('up')
        },
        down: ()=>{
            Navigator.move('down')
        },
        back: ()=>{
            if(active.onBack) active.onBack()
        }
    })
    
    Controller.toggle('modal')
}

function update(new_html){
    last = false

    scroll.clear()

    scroll.append(new_html)

    bind(new_html)

    toggle()
}

function title(tit){
    html.find('.modal__title').text(tit)
    
    html.toggleClass('modal--empty-title',tit ? false : true)
}

function destroy(){
    last = false

    scroll.destroy()

    html.remove()
}

function close(){
    destroy()
}

export default {
    open,
    close,
    update,
    title
}