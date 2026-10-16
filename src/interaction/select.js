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
let win
let stack = []
let focus_index = -1
let last_focus
let closing = false
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

    last_focus = null

    html.find('.selectbox__title').text(active.title)
    html.toggleClass('selectbox--fullsize', active.fullsize ? true : false)

    let need_first_scroll = true

    active.items.forEach(element => {
        if(element.hide) return

        element.title = Utils.capitalizeFirstLetter(element.title || '')

        if(element.separator){
            let item = $('<div class="settings-param-title"><span>'+element.title+'</span></div>')
            
            return scroll.append(item)
        }
        
        let item = element.html || Template.get(element.template || (element.thumbnail ? 'selectbox_icon' : 'selectbox_item') , element)

        if(!element.subtitle) item.find('.selectbox-item__subtitle').remove()

        if(element.thumbnail){
            item.find('.selectbox-item__icon').empty().append('<img class="size-youtube" src="'+element.thumbnail+'">')
        }

        if(element.checkbox){
            item.addClass('selectbox-item--checkbox')

            item.append('<div class="selectbox-item__checkbox"></div>')

            if(element.checked) item.addClass('selectbox-item--checked')
        }

        if(element.ghost) item.css('opacity',0.5)

        item.on('hover:focus',(e)=>{
            last_focus = e.target

            // Первый скролл делаем мгновенным, чтобы не было анимации при открытии
            if(need_first_scroll) scroll.immediate($(e.target), true)
            else scroll.update($(e.target), true)

            need_first_scroll = false

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
    // Селект поверх открытого селекта: запоминаем родителя, close() вернёт его обратно
    if(opened()){
        stack.push({
            active: active,
            focus: last_focus ? scroll.render().find('.selector').index(last_focus) : -1,
            win: win
        })

        win = null
    }

    active = object

    focus_index = -1

    scroll.body().toggleClass('notransition', true)

    listener.send('preshow', {active})

    bind(object)

    open()

    listener.send('fullshow', {active, html})

    win = Controller.windowOpen('select', ()=>opened() || closing)

    toggle()
}

function open(){
    $('body').toggleClass('selectbox--open',true)

    html.find('.selectbox__body').addClass('layer--wheight').css('max-height', window.innerWidth <= 480 ? window.innerHeight * 0.6 : 'unset').data('mheight', html.find('.selectbox__head'))

    html.addClass('animate')

    Activity.mixState('select=open')
}

/**
 * Переключает контроллер на селектбокс
 * @returns {void}
 */
function toggle(){
    Controller.add('select',{
        toggle: ()=>{
            let focused = scroll.render().find('.selected')

            // Возврат в селект (после окна поверх или из дочернего селекта) — фокус на прежний пункт
            if(last_focus && scroll.render()[0].contains(last_focus)) focused = $(last_focus)
            else if(focus_index >= 0) focused = scroll.render().find('.selector').eq(focus_index)

            focus_index = -1

            Controller.collectionSet(html)
            Controller.collectionFocus(focused.length ? focused[0] : false,html)

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
    // Выбор пункта закрывает всю ветку вложенных селектов
    stack.forEach(frame=>{
        if(frame.win) Controller.windowClose(frame.win, true)
    })

    stack = []

    hideHtml()

    let closed = win

    win = null

    if(closed) Controller.windowClose(closed)
}

function hideHtml(){
    $('body').toggleClass('selectbox--open', false)

    html.removeClass('animate animate-down')

    listener.send('hide', {active})
}

/**
 * Проверяет, открыт ли селектбокс
 * @returns {boolean} - true, если селектбокс открыт, иначе false
 */
function opened(){
    return $('body').hasClass('selectbox--open')
}

/**
 * Закрывает селектбокс
 * @returns {void}
 */
function close(){
    let closed     = active
    let closed_win = win
    let prev       = stack.pop()

    hideHtml()

    win = null

    if(prev){
        // Родителя перерисовываем сразу (пока скрыт), чтобы toggle('select') из onBack попал в его пункты
        active = prev.active
        win    = prev.win

        bind()

        focus_index = prev.focus
    }

    closing = true

    try{
        if(closed_win) Controller.windowClose(closed_win, prev ? true : false)

        Activity.mixState()

        if(closed.onBack) closed.onBack()
    }
    finally{
        closing = false
    }

    listener.send('close', {active: closed})

    if(prev){
        // onBack сам открыл новый селект — родитель больше не нужен
        if(opened()){
            if(prev.win && prev.win !== win) Controller.windowClose(prev.win, true)
        }
        else{
            open()

            if(Controller.windowTop() === win) Controller.toggle('select')
        }
    }
}

/**
 * Закрывает селектбокс и всех родителей без вызова onBack
 * @returns {void}
 */
function closeAll(){
    stack.forEach(frame=>{
        if(frame.win) Controller.windowClose(frame.win, true)
    })

    stack = []

    if(win) Controller.windowClose(win, true)

    win = null

    if(opened()){
        hideHtml()

        Activity.mixState()
    }
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
    opened,
    hide,
    close,
    closeAll,
    render
}