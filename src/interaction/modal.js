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

    html.on('click',(e)=>{
        if(!$(e.target).closest($('.modal__content',html)).length) window.history.back()
    })

    title(params.title)

    html.toggleClass('modal--medium', params.size == 'medium' ? true : false)
    html.toggleClass('modal--large', params.size == 'large' ? true : false)
    html.toggleClass('modal--full', params.size == 'full' ? true : false)
    html.toggleClass('modal--overlay', params.overlay ? true : false)

    scroll = new Scroll({over: true, mask: params.mask})

    scroll.render().toggleClass('layer--height', params.size == 'full' ? true : false)

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

function jump(tofoward){
    var select = scroll.render().find('.selector.focus');

    if(tofoward) select = select.nextAll().filter('.selector');
    else         select = select.prevAll().filter('.selector');

    select = select.slice(0,10);
    select = select.last();	

    if(select.length){
        Controller.collectionFocus(select[0],scroll.render())
    }
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
        right: ()=>{
            jump(true)
        },
        left: ()=>{
            jump(false)
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

function render(){
    return html
}

export default {
    open,
    close,
    update,
    title,
    toggle,
    render
}