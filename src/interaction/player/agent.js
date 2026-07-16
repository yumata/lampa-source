import Template from '../template'
import Select from '../select'
import Controller from '../../core/controller'
import Chat from './chat'
import Charts from './charts'
import Html from './panel/html'
import Video from './video'
import Player from '../player'
import Profile from '../../core/account/profile'
import Lang from '../../core/lang'
import Permit from '../../core/account/permit'
import Activity from '../activity/activity'

let button
let play_data = {}

/**
 * Инициализация AI-агента
 */
function init(){
    button = Template.elem('div', {
        class: 'button player-panel__button--ai selector hide',
        html: '<svg><use xlink:href="#sprite-feed"></use></svg>',
        children: [
            Template.elem('div', {class: 'tooltip', text: Lang.translate('player_ai_agent_ask')})
        ]
    })

    button.on('hover:enter', menu)

    Html.elem('settings').after(button)

    Player.listener.follow('ready', start)

    Player.listener.follow('destroy', destroy)
}

function start(data){
    play_data = {}

    play_data.card = data.card || Activity.active().movie || Activity.active().card

    let possibly = true
    let type     = play_data.card?.original_name ? 'tv' : 'movie'

    if(data.iptv || data.youtube) possibly = false
    else if(!Permit.token) possibly = false
    else if(type == 'tv' && (!data.season || !data.episode)) possibly = false

    play_data.type = type

    if(possibly){
        play_data.season     = data.season || 0
        play_data.episode    = data.episode || 0

        if(play_data.card){
            let year = parseInt((play_data.card.release_date || play_data.card.first_air_date || '----').slice(0,4))

            if(year >= 1985) button.removeClass('hide')
        }
    }
}

function menu() {
    let items = [
        {
            title: Lang.translate('player_ai_agent_ask_plot'),
            need: 'plot'
        },
        {
            title: Lang.translate('player_ai_agent_ask_moods'),
            need: 'moods'
        },
        {
            title: Lang.translate('player_ai_agent_ask_highlights'),
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
            scroll.prepend(Template.elem('div', {class: 'selectbox__text', children: [
                Template.elem('div', {text: Lang.translate('player_ai_agent_info')})
            ]}))
        },
        onBack: () => {
            Controller.toggle('player_panel')
        }
    })
}

function request(item) {
    let user_icon = Profile.icon()

    Chat.push({
        from: 'user',
        message: item.title,
        icon: user_icon ? '<img src="' + user_icon + '" />' : '',
    })

    Chat.push({
        from: 'ai',
        message: Lang.translate('player_ai_agent_processing'),
        once: true
    })

    setTimeout(() => {
        Chat.push({
            from: 'ai',
            message: Lang.translate('ready'),
            once: true
        })

        let d = Video.video().duration

        Charts.push({
            name: 'short',
            type: 'segments',
            data: [
                {start: 0, end: d * 0.25, label: '15m'},
                {start: d * 0.25, end: d * 0.5, label: '30m', text: 'Вася Пупкин пошел в магазин и не вернулся домой'},
                {start: d * 0.5, end: d * 0.75, label: '45m', height: 70},
                {start: d * 0.75, end: d, label: '60m', level: 80},
            ]
        })
    }, 2000)
}

function destroy(){
    button.addClass('hide')

    play_data = {}
}

export default {
    init,
    destroy
}