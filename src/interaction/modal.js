import Template from './template'
import Scroll from './scroll'
import Controller from '../interaction/controller'
import DeviceInput from '../utils/device_input'
import Layer from '../utils/layer'
import HeadBackward from './head_backward'
import Platform from '../utils/platform'

let html,
    active,
    scroll,
    last

function open(params){
    active = params

    html = Template.get('modal',{title: params.title})

    html.on('click',(e)=>{
        if(!$(e.target).closest($('.modal__content',html)).length && DeviceInput.canClick(e.originalEvent)) window.history.back()
    })

    title(params.title)

    html.toggleClass('modal--medium', params.size == 'medium' ? true : false)
    html.toggleClass('modal--large', params.size == 'large' ? true : false)
    html.toggleClass('modal--full', params.size == 'full' ? true : false)
    html.toggleClass('modal--overlay', params.overlay ? true : false)
    html.toggleClass('modal--align-center', params.align == 'center' ? true : false)

    if(params.zIndex) html.css('z-index', params.zIndex)

    scroll = new Scroll({over: true, mask: params.mask})

    scroll.render().toggleClass('layer--height', params.size == 'full' ? true : false)

    html.find('.modal__body').append(scroll.render())

    if(Platform.screen('mobile') && params.size !== 'full'){
        let close_button = $(`<div class="modal__close-button"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3.51477" y="0.686279" width="28" height="4" rx="2" transform="rotate(45 3.51477 0.686279)" fill="currentColor"/>
            <rect width="28" height="4" rx="2" transform="matrix(-0.707107 0.707107 0.707107 0.707107 20.4854 0.686279)" fill="currentColor"/>
            </svg>
        </div>`)

        close_button.on('click',()=>{
            window.history.back()
        })

        html.find('.modal__content').prepend(close_button)
    }

    bind(params.html)

    scroll.onWheel = (step)=>{
        roll(step > 0 ? 'down' : 'up')
    }

    if(params.size == 'full' && Platform.screen('mobile')){
        scroll.append(HeadBackward(params.title || ''))
    }

    scroll.append(params.html)

    if(params.buttons) buttons()

    $('body').append(html)

    max()

    toggle(params.select)

    html.addClass('animate')
}

function max(){
    scroll.render().find('.scroll__content').css('max-height',  Math.round(window.innerHeight - scroll.render().offset().top - (window.innerHeight * 0.1)) + 'px')
}

function buttons(){
    let footer = $('<div class="modal__footer"></div>')

    active.buttons.forEach(button=>{
        let btn = $('<div class="modal__button selector"></div>')

        btn.text(button.name)

        btn.on('click hover:enter',()=>{
            button.onSelect()
        })

        footer.append(btn)
    })

    scroll.append(footer)
}

function bind(where){
    where.find('.selector').on('hover:focus',(e)=>{
        last = e.target

        scroll.update($(e.target))
    }).on('hover:enter',(e)=>{
        last = e.target

        if(active.onSelect) active.onSelect($(e.target))
    })
}

function jump(tofoward){
    let select = scroll.render().find('.selector.focus');

    if(tofoward) select = select.nextAll().filter('.selector');
    else         select = select.prevAll().filter('.selector');

    select = select.slice(0,10);
    select = select.last();	

    if(select.length){
        Controller.collectionFocus(select[0],scroll.render())
    }
}

function roll(direction){
    let select = scroll.render().find('.selector')

    if(select.length){
        Navigator.move(direction)
    }
    else{
        let step = Math.round(window.innerHeight * 0.15)

        scroll.wheel(direction == 'down' ? step : -step)
    }
}


function toggle(need_select){
    Controller.add('modal',{
        invisible: true,
        toggle: ()=>{
            Controller.collectionSet(scroll.render())
            Controller.collectionFocus(need_select || last,scroll.render())

            Layer.visible(scroll.render(true))
        },
        up: ()=>{
            roll('up')
        },
        down: ()=>{
            roll('down')
        },
        right: ()=>{
            if(Navigator.canmove('right')) Navigator.move('right')
            else jump(true)
        },
        left: ()=>{
            if(Navigator.canmove('left')) Navigator.move('left')
            else jump(false)
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

    max()

    toggle(active.select)
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
    render,
    scroll: ()=>scroll
}