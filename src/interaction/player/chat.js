import Template from '../../interaction/template'
import Arrays from '../../utils/arrays'
import Player from '../player'
import Panel from './panel'

let html
let timer
let timer_hide
let message = []
let limit = 4

/**
 * Имитация чата в плеере
 */
function init(){
    html = Template.elem('div', {class: 'player-chat'})

    Player.listener.follow('destroy', destroy)

    Panel.listener.follow('visible', (e)=>{
        html.toggleClass('hide', !e.status)

        clearTimeout(timer_hide)
    })
}

/**
 * Добавление сообщения в чат
 * @param {Object} data - Данные сообщения
 * @param {String} data.message - Текст сообщения
 * @param {String} data.icon - Иконка сообщения (HTML)
 * @param {Boolean} data.once - Если true, сообщение будет отображено только один раз
 */
function push(data){
    if(data.once) {
        message = message.filter((m) => m.from !== data.from)
    }

    message.push(data)

    if(message.length > limit) message.shift()

    clearTimeout(timer)

    timer = setTimeout(draw, 200)
}

/**
 * Отрисовка сообщений в чате
 */
function draw(){
    clear()

    html.toggleClass('hide', false)

    timer_hide = setTimeout(()=>{
        if(!Panel.visibleStatus()) html.toggleClass('hide', true)
    }, 5000)

    message.forEach((data) => {
        let item = Template.elem('div', {
            class: 'player-chat__message',
            children: [
                Template.elem('div', {class: 'player-chat__icon', html: data.icon && typeof data.icon == 'string' ? data.icon : '<svg><use xlink:href="#sprite-feed"></use></svg>'}),
                Template.elem('div', {class: 'player-chat__body', children: [
                    Template.elem('div', {class: 'player-chat__text', html: data.message}),
                ]})
            ]
        })

        if(data.icon && typeof data.icon == 'object') item.find('.player-chat__icon').empty().append(data.icon)

        if(!data.animated){
            data.animated = true

            item.addClass('animate')
        }

        html.append(item)
    })
}

/**
 * Очистка чата
 */
function clear(){
    html.empty()
}

function render(){
    return html
}

function destroy(){
    clear()

    html.toggleClass('hide', true)

    clearTimeout(timer)
    clearTimeout(timer_hide)

    message = []
}

export default {
    init,
    render,
    push,
    clear,
    destroy
}