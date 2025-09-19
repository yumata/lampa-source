import Template from './template'
import Scroll from './scroll'
import Controller from '../core/controller'
import DeviceInput from './device_input'
import Layer from '../core/layer'
import Platform from '../core/platform'
import Subscribe from '../utils/subscribe'
import HeadBackward from './head/backward'

let html,
    active,
    scroll,
    last

let listener = Subscribe()

/**
 * Открывает модальное окно
 * @param {object} params - параметры окна
 * @param {string} params.title - заголовок окна
 * @param {jQuery|HTMLElement} params.html - содержимое окна
 * @param {string} [params.size=small] - размер окна (small, medium, large, full)
 * @param {boolean} [params.overlay=false] - отображать окно как оверлей
 * @param {string} [params.align=top] - выравнивание окна (top, center)
 * @param {boolean} [params.mask=false] - отображать маску прокрутки
 * @param {Array} [params.buttons] - массив кнопок внизу окна {name: 'Имя', onSelect: function(){}}
 * @param {string} [params.buttons_position=inside] - положение кнопок (inside, outside)
 * @param {HTMLElement|jQuery} [params.select] - элемент для фокуса после открытия
 * @param {function} [params.onBack] - вызывается при закрытии окна
 * @param {function} [params.onSelect] - вызывается при выборе элемента внутри окна
 * @param {number} [params.zIndex] - z-index окна
 * @returns {void}
 */
function open(params){
    active = params
    active.open_time = Date.now()

    listener.send('preshow', {active})

    html = Template.get('modal',{title: params.title})

    html.on('mousedown',(e)=>{
        if(!$(e.target).closest($('.modal__content', html)).length && DeviceInput.canClick(e.originalEvent) && active.open_time + 1000 < Date.now()) Controller.back()
    })

    title(params.title)

    html.toggleClass('modal--medium', params.size == 'medium' ? true : false)
    html.toggleClass('modal--large', params.size == 'large' ? true : false)
    html.toggleClass('modal--full', params.size == 'full' ? true : false)
    html.toggleClass('modal--overlay', params.overlay ? true : false)
    html.toggleClass('modal--align-center', params.align == 'center' ? true : false)

    if(params.zIndex) html.css('z-index', params.zIndex)

    scroll = new Scroll({over: true, mask: params.mask, ...params.scroll})

    html.find('.modal__content').toggleClass('layer--height', params.size == 'full' ? true : false)

    html.find('.modal__body').append(scroll.render())

    bind(params.html)

    scroll.onWheel = (step)=>{
        roll(step > 0 ? 'down' : 'up')
    }

    if(params.size == 'full' && Platform.mouse()){
        html.find('.modal__content').prepend(HeadBackward(params.title || ''))
    }

    scroll.append(params.html)

    scroll.addSwipeDown(()=>{
        html.addClass('animate-down')

        setTimeout(()=>{
            Controller.back()
        },200)
    })

    if(params.buttons) buttons()

    $('body').append(html)

    max()

    listener.send('fullshow', {active, html})

    toggle(params.select)

    html.addClass('animate')
}

function max(){
    let height = window.innerHeight

    if(window.innerWidth <= 480){
        if(active.size == 'full'){
            height = window.innerHeight - html.find('.head-backward').outerHeight()

            scroll.render().css('height', height + 'px')
        }
        else{
            height = window.innerHeight * 0.6
        }
    } 
    else{
        height -= scroll.render().offset().top

        if(active.size !== 'full') height -= window.innerHeight * 0.1

        if(active.buttons && active.buttons_position == 'outside') height -= html.find('.modal__footer').outerHeight() || 0
    }

    scroll.render().find('.scroll__content').css('max-height',  Math.round(height) + 'px')
}

function buttons(){
    let footer = $('<div class="modal__footer"></div>')

    active.buttons.forEach(button=>{
        let btn = $('<div class="modal__button selector"></div>')

        btn.text(button.name)

        btn.on('click hover:enter',(e)=>{
            if(DeviceInput.noDubleClick(e)) button.onSelect()
        })

        footer.append(btn)
    })

    if(active.buttons_position == 'outside'){
        html.find('.modal__content').append(footer)
    }
    else scroll.append(footer)
}

function bind(where){
    where.find('.selector').on('hover:focus hover:enter',(e)=>{
        last = e.target

        scroll.update($(e.target), active.scroll_to_center)
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

            listener.send('toggle', {active, html})
        },
        up: ()=>{
            if(active.buttons && active.buttons_position == 'outside' && (scroll.isEnd() || !scroll.isFilled())){
                Controller.toggle('modal')

                roll('up')
            }
            else roll('up')
        },
        down: ()=>{
            if(active.buttons && active.buttons_position == 'outside' && (scroll.isEnd() || !scroll.isFilled())){
                Controller.collectionSet(html.find('.modal__footer'))
                Controller.collectionFocus(false, html.find('.modal__footer'))
            }
            else roll('down')
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

    listener.send('update', {active, html, new_html})

    toggle(active.select)
}

function title(tit){
    html.find('.modal__title').text(tit)
    
    html.toggleClass('modal--empty-title', !tit  ? true : false)
}

function destroy(){
    last = false

    scroll.destroy()

    html.remove()

    listener.send('close', {active})

    active = null
}

function opened(){
    return active ? true : false
}

function close(){
    destroy()
}

function render(){
    return html
}

export default {
    listener,
    open,
    close,
    update,
    title,
    toggle,
    render,
    scroll: ()=>scroll,
    opened
}