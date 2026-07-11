import Template from '../../interaction/template'
import Arrays from '../../utils/arrays'
import Player from '../player'

let html
let timer
let message = []

/**
 * Имитация чата в плеере
 */
function init(){
    html = Template.elem('div', {class: 'player-chat'})

    Player.listener.follow('destroy', destroy)
}

/**
 * Добавление сообщения в чат
 * @param {Object} data - Данные сообщения
 * @param {String} data.message - Текст сообщения
 * @param {String} data.icon - Иконка сообщения (HTML)
 * @param {Boolean} data.once - Если true, сообщение будет отображено только один раз
 */
function push(data){
    if(data.once) Arrays.remove(message, message.find(m=>m.once))

    message.push(data)

    if(message.length > 5) message.shift()

    clearTimeout(timer)

    timer = setTimeout(draw, 200)
}

/**
 * Отрисовка сообщений в чате
 */
function draw(){
    clear()

    message.forEach((data) => {
        let item = Template.elem('div', {
            class: 'player-chat__message',
            children: [
                Template.elem('div', {class: 'player-chat__icon', html: data.icon || '<svg><use xlink:href="#sprite-feed"></use></svg>'}),
                Template.elem('div', {class: 'player-chat__body', children: [
                    Template.elem('div', {class: 'player-chat__text', html: data.message}),
                ]})
            ]
        })

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
    html.empty()
}

export default {
    init,
    render,
    push,
    clear,
    destroy
}