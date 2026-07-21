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
import Request from '../../utils/reguest'
import Utils from '../../utils/utils'

let button
let play_data = {}
let network   = new Request()
let timers    = {}
let timeline  = ['humor','violence','fear','tension','romance','sadness','pace','importance','action']
let moments   = ['humor','violence','fear','tension','romance','sadness','action','important']
let chat_history = []
let buttons = []

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

    buttons = [
        {
            title: Lang.translate('player_ai_agent_ask_plot'),
            need: 'analysis'
        },
        {
            title: Lang.translate('player_ai_agent_ask_moods'),
            onSelect: a => {
                submenu(timeline.map(field => {
                    return {
                        title: Lang.translate('player_ai_agent_ask_moods') + ' - ' + Lang.translate(field),
                        need: 'timeline',
                        label: field
                    }
                }))
            }
        },
        {
            title: Lang.translate('player_ai_agent_ask_highlights'),
            onSelect: a => {
                submenu(moments.map(field => {
                    return {
                        title: Lang.translate('player_ai_agent_ask_highlights') + ' - ' + Lang.translate(field),
                        need: 'moments/' + field
                    }
                }))
            }
        }
    ]
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

    chat_history.push({
        html: $('<div class="selectbox__text"><div>' + Lang.translate('player_ai_agent_info') + '</div></div>'),
        noenter: true
    })
}

function submenu(items){
    Select.show({
        title: Lang.translate('title_ai_assistant'),
        items: items,
        onSelect: (a) => {
            Controller.toggle('player_panel')

            process(a)
        },
        onBack: menu
    })
}

function menu() {
    chat_history.forEach((item) => item.html.removeClass('selected').unbind())

    let items = [].concat(chat_history).concat(buttons)

    Select.show({
        title: Lang.translate('title_ai_assistant'),
        items: items,
        nomark: true,
        onFocus: (a) => {
            items.forEach((item) => item.selected = false)

            a.selected = true
        },
        onSelect: (a) => {
            Controller.toggle('player_panel')

            process(a)
        },
        onBack: () => {
            Controller.toggle('player_panel')
        }
    })
}

function request(item){
    clearTimeout(timers[item.need])

    let url = 'http://localhost:3100/api/ai/video/' + play_data.card.id + '/'
        url += item.need + '?type=' + play_data.type + '&season=' + play_data.season + '&episode=' + play_data.episode

    network.silent(url, (data)=>{
        if(data.status == 'processing'){
            timers[item.need] = setTimeout(() => {
                request(item)
            }, 5000)
        }
        else{
            Chat.push({
                from: 'ai',
                message: Lang.translate('ready'),
                once: true
            })

            if(data.status == 'completed'){
                draw(item, data)
            }
        }
    }, (error)=>{
        Chat.push({
            from: 'ai',
            message: Lang.translate('Что-то пошло не так, попробуйте позже'),
            once: true
        })
    })
}

function draw(item, data){
    let chart_data = []

    if(item.need == 'analysis' || item.need.indexOf('moments') !== -1){
        chat_history.push({
            title: item.title,
            html: $('<div class="selectbox__text player-agent-chat__user selector"><div>'+item.title+'</div></div>'),
            noenter: true
        })

        let result = data.chapters || data.segments

        console.log('result', result)

        chat_history.forEach((item) => item.selected = false)
    
        result.forEach((segment, i) => {
            let text  = segment.title
            let time  = '<span class="player-agent-chat__assistant-time">'+Utils.secondsToTimeHuman(segment.start_sec)+'</span>'
            let title = '<span class="player-agent-chat__assistant-title">'+segment.title+'</span>'
            let descr = '<div class="player-agent-chat__assistant-text">'+segment.description+'</div>'

            let item = {
                title: text,
                html: $('<div class="selectbox__text selectbox-item player-agent-chat__assistant selector"><div>' + time + title + descr + '</div></div>'),
                selected: i == 0,
                onSelect: () => {

                }
            }

            chat_history.push(item)
        })

        menu()
    }
    else if(item.need == 'timeline'){
        data.segments.forEach((segment) => {
            chart_data.push({
                start: segment.start_sec,
                end: segment.end_sec,
                height: segment[item.label] / 10 * 100
            })
        })

        Charts.clear()

        Charts.push({
            name: item.need,
            type: 'segments',
            data: chart_data
        })
    }
}

function process(item) {
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

    request(item)
}

function destroy(){
    button.addClass('hide')

    play_data = {}

    chat_history = []

    network.clear()

    for(let key in timers){
        clearTimeout(timers[key])
    }
}

export default {
    init,
    destroy
}