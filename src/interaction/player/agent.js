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
import Account from '../../core/account/account'

let button
let play_data = {}
let network   = new Request()
let timers    = {}
let fields    = ['humor','violence','fear','tension','romance','sadness','pace','importance','action','sex','profanity']
let chat_history = []
let buttons   = []
let agent_icon

/**
 * Инициализация AI-агента
 */
function init(){
    agent_icon = Template.get('ai_agent',{}).addClass('animate ai-agent--absolute')

    button = Template.elem('div', {
        class: 'button player-panel__button--ai selector hide',
        html: '<svg><use xlink:href="#sprite-ai-agent"></use></svg>',
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
                submenu(fields.map(field => {
                    return {
                        title: Lang.translate('title_meta_' + field),
                        toagent: Lang.translate('player_ai_agent_ask_moods') + ' - ' + Lang.translate('title_meta_' + field),
                        need: 'timeline',
                        label: field
                    }
                }), Lang.translate('player_ai_agent_ask_moods'))
            }
        },
        {
            title: Lang.translate('player_ai_agent_ask_highlights'),
            onSelect: a => {
                submenu(fields.map(field => {
                    return {
                        title: Lang.translate('title_meta_' + field),
                        toagent: Lang.translate('player_ai_agent_ask_highlights') + ' - ' + Lang.translate('title_meta_' + field),
                        need: 'moments/' + field
                    }
                }), Lang.translate('player_ai_agent_ask_highlights'))
            }
        }
    ]
}

function start(data){
    play_data = {}

    play_data.card = data.card || Activity.active().movie || Activity.active().card

    let possibly = Account.hasPremium() || false
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

function submenu(items, title){
    Select.show({
        title: title || Lang.translate('title_ai_assistant'),
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

    if(buttons.find(i=>i.selected)) chat_history.forEach((item) => item.selected = false)

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
            items.forEach((item) => item.selected = false)

            a.selected = true

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

    if(item.need.indexOf('moments') !== -1) url += '&limit=8'

    network.silent(url, (data)=>{
        if(data.status == 'processing'){
            timers[item.need] = setTimeout(() => {
                request(item)
            }, 5000)
        }
        else{
            Chat.push({
                from: 'ai',
                message: Lang.translate(data.status == 'completed' ? 'ready' : data.status == 'quota' ? 'player_ai_agent_quota' : 'player_ai_agent_no_analysis'),
                icon: agent_icon.removeClass('animate'),
                once: true
            })

            if(data.status == 'completed'){
                draw(item, data)
            }
        }
    }, (error)=>{
        Chat.push({
            from: 'ai',
            message: Lang.translate('player_ai_agent_no_analysis'),
            icon: agent_icon.removeClass('animate'),
            once: true
        })
    })
}

function draw(item, data){
    if(item.need == 'analysis'){
        chat_history = []

        chat_history.push({
            title: item.toagent || item.title,
            html: $('<div class="selectbox__text player-agent-chat__user selector"><div>'+item.title+'</div></div>'),
            noenter: true
        })

        let result = data.chapters || data.segments

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
                    Video.to(segment.start_sec)

                    Controller.toggle('player_panel')
                }
            }

            chat_history.push(item)
        })

        buttons.forEach((i) => i.selected = false)

        menu()
    }
    else{
        let chart_data = []

        if(item.need.indexOf('moments') !== -1){
            let duration = Video.video().duration
            let total    = data.segments.length

            data.segments.forEach((segment, i) => {
                let start = 0
                let end   = 0

                if(total > 1){
                    start = duration * i / total
                    end   = start + (duration / total)
                }
                else{
                    let size = duration * 0.5

                    start = segment.start_sec > (duration - size) ? (duration - size) : segment.start_sec
                    end   = start + size
                }

                chart_data.push({
                    start: Math.round(start),
                    end: Math.round(end),
                    title: segment.title,
                    description: segment.description,
                    label: Utils.secondsToTimeHuman(segment.start_sec),
                    onSelect: ()=>{
                        Video.to(segment.start_sec)
                    }
                })
            })
        }
        else if(item.need == 'timeline'){
            data.segments.forEach((segment, i) => {
                let score = segment[item.label]
                
                chart_data.push({
                    start: segment.start_sec,
                    end: segment.end_sec,
                    title: segment.title,
                    description: segment.description,
                    height: score / 10 * 100,
                    label: i % 4 == 0 ? score : '',
                    onSelect: ()=>{
                        Video.to(segment.start_sec)
                    },
                    onFocus: ()=>{
                        Chat.push({
                            from: 'ai',
                            message: Utils.secondsToTimeHuman(segment.start_sec) + '<br>' + segment.title,
                            icon: agent_icon.removeClass('animate'),
                            once: true
                        })
                    }
                })
            })
        }

        if(chart_data.length){
            Charts.clear()

            Charts.push({
                name: item.need,
                type: 'segments',
                data: chart_data
            })
        }
        else {
            Chat.push({
                from: 'ai',
                message: Lang.translate('player_ai_agent_no_data'),
                icon: agent_icon.removeClass('animate'),
                once: true
            })
        }
    }
}

function process(item) {
    let user_icon = Profile.icon()

    Chat.push({
        from: 'user',
        message: item.toagent || item.title,
        icon: user_icon ? '<img src="' + user_icon + '" />' : '',
    })

    Chat.push({
        from: 'ai',
        message: Lang.translate('player_ai_agent_processing'),
        icon: agent_icon.addClass('animate'),
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