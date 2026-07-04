import Template from '../../interaction/template'
import Arrays from '../../utils/arrays'

let html
let timer
let message = []

function init(){
    html = Template.elem('div', {class: 'player-chat'})
}

function push(data){
    if(data.once) Arrays.remove(message, message.find(m=>m.once))

    message.push(data)

    if(message.length > 5) message.shift()

    clearTimeout(timer)

    timer = setTimeout(draw, 200)
}

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