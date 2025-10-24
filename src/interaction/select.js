import Template from './template'
import Scroll from './scroll'
import Controller from '../core/controller'
import Utils from '../utils/utils'
import DeviceInput from './device_input'
import Activity from './activity/activity'
import Subscribe from '../utils/subscribe'

let html
let scroll
let active
let listener = Subscribe()

/**
 * Инициализирует селектбокс
 * @returns {void}
 */
function init(){
    html   = Template.get('selectbox')
    scroll = new Scroll({mask:true,over:true})

    html.find('.selectbox__body').append(scroll.render())

    html.find('.selectbox__layer').on('click',(e)=>{
        if(DeviceInput.canClick(e.originalEvent)) Controller.back()
    })

    scroll.addSwipeDown(()=>{
        html.addClass('animate-down')

        setTimeout(()=>{
            Controller.back()
        },200)
    })

    $('body').append(html)
}

/**
 * Заполняет селектбокс элементами
 * @returns {void}
 */
function bind(){
    scroll.clear()
    scroll.reset()

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
        
        
        if(element.onDraw) element.onDraw(item, element)
        else if(active.onDraw) active.onDraw(item, element)

        scroll.append(item)
    })

    if(active.onFullDraw) active.onFullDraw(scroll)
}

/**
 * Отображает селектбокс
 * @param {object} object - параметры селектбокса
 * @param {string} object.title - заголовок селектбокса
 * @param {boolean} [object.fullsize=false] - использовать весь экран
 * @param {Array} object.items - массив элементов
 * @param {boolean} [object.nomark=false] - не выделять выбранный элемент
 * @param {boolean} [object.nohide=false] - не закрывать селектбокс после выбора элемента
 * @param {function} [object.onSelect] - вызывается при выборе элемента
 * @param {function} [object.onCheck] - вызывается при изменении состояния чекбокса
 * @param {function} [object.onFocus] - вызывается при фокусе на элементе
 * @param {function} [object.onLong] - вызывается при долгом нажатии на элемент
 * @param {function} [object.onBack] - вызывается при закрытии селектбокса
 * @param {function} [object.onDraw] - вызывается при отрисовке элемента
 * @param {function} [object.onFullDraw] - вызывается после полной отрисовки всех элементов
 * @param {function} [object.onBeforeClose] - вызывается перед закрытием селектбокса, если возвращает true, селектбокс закроется
 * @param {boolean} [object.noenter=false] - отключить выбор элемента по кнопке ОК/Enter
 * @returns {void}
 */
function show(object){
    active = object

    listener.send('preshow', {active})

    bind(object)

    $('body').toggleClass('selectbox--open',true)

    html.find('.selectbox__body').addClass('layer--wheight').css('max-height', window.innerWidth <= 480 ? window.innerHeight * 0.6 : 'unset').data('mheight', html.find('.selectbox__head'))

    html.addClass('animate')

    Activity.mixState('select=open')

    listener.send('fullshow', {active, html})

    toggle()
}

/**
 * Переключает контроллер на селектбокс
 * @returns {void}
 */
function toggle(){
    Controller.add('select',{
        toggle: ()=>{
            let selected = scroll.render().find('.selected')

            Controller.collectionSet(html)
            Controller.collectionFocus(selected.length ? selected[0] : false,html)

            listener.send('toggle', {active, html})
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

/**
 * Скрывает селектбокс
 * @returns {void}
 */
function hide(){
    $('body').toggleClass('selectbox--open',false)

    html.removeClass('animate animate-down')

    listener.send('hide', {active})
}

/**
 * Закрывает селектбокс
 * @returns {void}
 */
function close(){
    hide()

    Activity.mixState()

    if(active.onBack) active.onBack()

    listener.send('close', {active})
}

/**
 * Возвращает HTML селектбокса
 * @param {boolean} [js=false] - вернуть DOM-элемент вместо jQuery
 * @returns {jQuery|HTMLElement} - HTML селектбокса
 */
function render(js){
    return js ? html[0] : html
}

export default {
    listener,
    init,
    show,
    hide,
    close,
    render
}