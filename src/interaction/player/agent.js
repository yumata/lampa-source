import Template from '../template'
import Select from '../select'
import Controller from '../../core/controller'
import Chat from './chat'
import Charts from './charts'
import Html from './panel/html'

function init(){
    let button = Template.elem('div', {
        class: 'button player-panel__button--ai selector',
        html: '<svg><use xlink:href="#sprite-feed"></use></svg>',
        children: [
            Template.elem('div', {class: 'tooltip', text: 'Спросить'})
        ]
    })

    button.on('hover:enter', menu)

    Html.elem('settings').after(button)
}

function menu() {
    let items = [
        {
            title: 'Кратко о сюжете',
            need: 'plot'
        },
        {
            title: 'График настроения',
            need: 'moods'
        },
        {
            title: 'Интересные моменты',
            need: 'highlights'
        }
    ]

    Select.show({
        title: 'AI',
        items: items,
        onSelect: (a) => {
            Controller.toggle('player_panel')

            request(a)
        },
        onFullDraw: (scroll)=>{
            scroll.prepend(Template.elem('div', {class: 'selectbox__text selector', children: [
                Template.elem('div', {text: Lampa.Lang.translate('subscribe_info')})
            ]}))
        },
        onBack: () => {
            Controller.toggle('player_panel')
        }
    })
}

function request(item) {
    Chat.push({
        from: 'user',
        message: item.title
    })

    Chat.push({
        from: 'ai',
        message: 'Выполняю',
        once: true
    })

    setTimeout(() => {
        Chat.push({
            from: 'ai',
            message: 'Готово',
            once: true
        })

        Charts.push({
            name: 'short',
            type: 'segments',
            data: [
                {start: 0, end: 2, label: '15m'},
                {start: 2, end: 4, label: '30m', text: 'Вася Пупкин пошел в магазин и не вернулся домой'},
                {start: 4, end: 5, label: '45m', height: 70},
                {start: 5, end: 9, label: '60m', level: 80},
            ]
        })
    }, 2000)
}

function destroy(){

}

export default {
    init,
    destroy
}