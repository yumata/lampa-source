import Template from './template'
import Scroll from './scroll'
import Controller from './controller'
import Utils from '../utils/math'
import DeviceInput from '../utils/device_input'
import Activity from './activity'

let html
let scroll
let active

function init(){
    html   = Template.get('selectbox')
    scroll = new Scroll({mask:true,over:true})

    html.find('.selectbox__body').append(scroll.render())

    html.find('.selectbox__layer').on('click',(e)=>{
        if(DeviceInput.canClick(e.originalEvent)) window.history.back()
    })

    scroll.addSwipeDown(()=>{
        html.addClass('animate-down')

        setTimeout(()=>{
            window.history.back()
        },200)
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

        item.on('hover:focus',(e)=>{
            scroll.update($(e.target), true)

            if(active.onFocus) active.onFocus(element, e.target)
        })

        if(!element.noenter){
            var goclose = function(){
                if(!active.nohide) hide()
                else{
                    scroll.render().find('.selected').removeClass('selected')

                    item.addClass('selected')
                }

                if(element.onSelect) element.onSelect(element, item)
                else if(active.onSelect) active.onSelect(element, item)
            }

            item.on('hover:enter', function(){
                if(element.checkbox){
                    element.checked = !element.checked

                    item.toggleClass('selectbox-item--checked', element.checked)

                    if(element.onCheck) element.onCheck(element, item)
                    else if(active.onCheck) active.onCheck(element, item)
                }
                else if(active.onBeforeClose){
                    if(active.onBeforeClose()) goclose()
                }
                else goclose()
            }).on('hover:long',(e)=>{
                if(active.onLong) active.onLong(element, e.target)
            })
        }

        if(element.selected) item.addClass('selected')
        if(element.picked)   item.addClass('picked')
        if(active.nomark)    item.addClass('nomark')
        

        if(active.onDraw) active.onDraw(item, element)

        scroll.append(item)
    })

    if(active.onFullDraw) active.onFullDraw(scroll)
}

function show(object){
    active = object

    bind(object)

    $('body').toggleClass('selectbox--open',true)

    html.find('.selectbox__body').addClass('layer--wheight').css('max-height', window.innerWidth <= 480 ? window.innerHeight * 0.6 : 'unset').data('mheight', html.find('.selectbox__head'))

    html.addClass('animate')

    Activity.mixState('select=open')

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

    html.removeClass('animate animate-down')
}

function close(){
    hide()

    Activity.mixState()

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