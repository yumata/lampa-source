import Template from '../../template'

let elems
let html

function init(){
    html = Template.get('player_panel')

    elems = {
        peding: $('.player-panel__peding',html),
        position: $('.player-panel__position',html),
        time: $('.player-panel__time',html),
        timenow: $('.player-panel__timenow',html),
        timeend: $('.player-panel__timeend',html),
        title: $('.player-panel__filename',html),
        tracks: $('.player-panel__tracks',html),
        subs: $('.player-panel__subs',html),
        timeline: $('.player-panel__timeline',html),
        quality: $('.player-panel__quality',html),
        flow: $('.player-panel__flow',html),
        episode: $('.player-panel__next-episode-name',html),
        rewind_touch: $('.player-panel__time-touch-zone',html),
        playlist: html.find('.player-panel__playlist'),
        next: html.find('.player-panel__next'),
        prev: html.find('.player-panel__prev'),

        iptv_channel: $('.player-panel-iptv__channel',html),
        iptv_arrow_up: $('.player-panel-iptv__arrow-up',html),
        iptv_arrow_down: $('.player-panel-iptv__arrow-down',html),
        iptv_position: $('.player-panel-iptv__position',html),

        segments: $('.player-panel__timeline-segments',html),
    }
}

function elem(name){
    return elems[name]
}

function render(){
    return html
}

export default {
    init,
    render,
    elem
}