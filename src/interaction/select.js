import Template from './template'
import Scroll from './scroll'
import Controller from './controller'
import Utils from '../utils/math'

let html
let scroll
let active

function init(){
    html   = Template.get('selectbox')
    scroll = new Scroll({mask:true,over:true})

    html.find('.selectbox__body').append(scroll.render())

    html.find('.selectbox__layer').on('click',()=>{
        window.history.back()
    })

    $('body').append(html)
}

function bind(){
    scroll.clear()

    html.find('.selectbox__title').text(active.title)
    html.toggleClass('selectbox--fullsize', active.fullsize ? true : false)

    active.items.forEach(element => {
        if(element.hide) return

        element.title = Utils.capitalizeFirstLetter(element.title || '')

        if(element.separator){
            let item = $('<div class="settings-param-title"><span>'+element.title+'</span></div>')
            
            return scroll.append(item)
        }
        
        let item = Template.get(element.template || 'selectbox_item', element)

        if(!element.subtitle) item.find('.selectbox-item__subtitle').remove()

        if(element.checkbox){
            item.addClass('selectbox-item--checkbox')

            item.append('<div class="selectbox-item__checkbox"></div>')

            if(element.checked) item.addClass('selectbox-item--checked')
        }

        if(element.ghost) item.css('opacity',0.5)

        if(!element.noenter){
            var goclose = function(){
    
                if(!active.nohide) hide()

                if(element.onSelect) element.onSelect(element)
                else if(active.onSelect) active.onSelect(element)
            }

            item.on('hover:enter', function(){
                if(element.checkbox){
                    element.checked = !element.checked

                    item.toggleClass('selectbox-item--checked', element.checked)

                    if(element.onCheck) element.onCheck(element)
                    else if(active.onCheck) active.onCheck(element)
                }
                else if(active.onBeforeClose){
                    if(active.onBeforeClose()) goclose()
                }
                else goclose()
            }).on('hover:focus',(e)=>{
                scroll.update($(e.target), true)

                if(active.onFocus) active.onFocus(element, e.target)
            }).on('hover:long',(e)=>{
                if(active.onLong) active.onLong(element, e.target)
            }).on('hover:hover',(e)=>{
                scroll.render().find('.selector').removeClass('focus')

                item.addClass('focus')
        
                Navigator.focused(e.target)
            })
        }

        if(element.selected) item.addClass('selected');

        scroll.append(item)
    })
}

function show(object){
    active = object

    bind(object)

    $('body').toggleClass('selectbox--open',true)

    html.find('.selectbox__body').addClass('layer--wheight').data('mheight', html.find('.selectbox__head'))

    toggle()
}

function toggle(){
    Controller.add('select',{
        toggle: ()=>{
            let selected = scroll.render().find('.selected')

            Controller.collectionSet(html)
            Controller.collectionFocus(selected.length ? selected[0] : false,html)
        },
        up: ()=>{
            Navigator.move('up')
        },
        down: ()=>{
            Navigator.move('down')
        },
        left: close,
        back: close
    })
    
    Controller.toggle('select')
}

function hide(){
    $('body').toggleClass('selectbox--open',false)
}

function close(){
    hide()

    if(active.onBack) active.onBack()
}

function render(){
    return html
}

export default {
    init,
    show,
    hide,
    close,
    render
}