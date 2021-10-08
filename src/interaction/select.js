import Template from './template'
import Scroll from './scroll'
import Controller from './controller'
import Utils from '../utils/math'

let html   = Template.get('selectbox')
let scroll = new Scroll({mask:true,over:true})
let active

html.find('.selectbox__body').append(scroll.render())

$('body').append(html)

function bind(){
    scroll.clear()

    html.find('.selectbox__title').text(active.title)

    active.items.forEach(element => {
        if(element.hide) return

        element.title = Utils.capitalizeFirstLetter(element.title || '')
        
        let item = Template.get(element.template || 'selectbox_item', element)

        if(!element.subtitle) item.find('.selectbox-item__subtitle').remove()

        if(!element.noenter){
            var goclose = function(){
    
                if(!active.nohide) hide()

                if(active.onSelect) active.onSelect(element)
            }

            item.on('hover:enter', function(){
                if(active.onBeforeClose){
                    if(active.onBeforeClose()) goclose()
                }
                else goclose()
            }).on('hover:focus',(e)=>{
                scroll.update($(e.target), true)

                if(active.onFocus) active.onFocus(element, e.target)
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
        back: ()=>{
            hide()

            if(active.onBack) active.onBack()
        }
    })
    
    Controller.toggle('select')
}

function hide(){
    $('body').toggleClass('selectbox--open',false)
}

function render(){
    return html
}

export default {
    show,
    hide
}