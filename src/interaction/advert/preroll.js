import Lang from '../../core/lang'
import Account from '../../core/account/account'
import VPN from '../../core/vpn'
import Controller from '../../core/controller'
import Personal from '../../core/personal'
import Utils from '../../utils/utils'
import Vast from './vast'
import Platform from '../../core/platform'
import Manifest from '../../core/manifest'
import Background from '../background'
import Manager from './vast_manager'
import Metric from '../../services/metric'

let running     = 0
let player_data = {}
let vast_api    = false
let waite_time  = 0

function init(){
    if(!(Platform.is('orsay') || Platform.is('netcast'))){
        Utils.putScriptAsync([Manifest.github_lampa + '/vender/vast/vast.js'], false,false,()=>{
            vast_api = true
        })

        Manager.init()
    }
}

function video(preroll, num, started, ended){
    console.log('Ad', 'launch')

    let item = new Vast(preroll)

    item.listener.follow('launch', started)

    item.listener.follow('ended', ()=>{
        waite_time = Date.now()

        ended()
    })

    item.listener.follow('error', ()=>{
        if(Date.now() - running < 15000 && num < 4){
            let next_preroll = getAnyPreroll()

            if(next_preroll) video(next_preroll, num + 1, started, ended)
            else ended()
        }
        else ended()
    })

    $.ajax({
        dataType: 'text',
        url: Utils.protocol() + Manifest.cub_domain + '/api/ad/stat?platform=' + Platform.get() + '&type=launch&method=vast'
    })
}

function launch(preroll, call){
    let enabled = Controller.enabled().name

    Background.theme('#454545')

    let html = $(`
        <div class="ad-preroll">
            <div class="ad-preroll__bg"></div>
            <div class="ad-preroll__text">${Lang.translate('ad')}</div>
            <div class="ad-preroll__over"></div>
        </div>
    `)

    $('body').append(html)

    setTimeout(()=>{
        html.find('.ad-preroll__bg').addClass('animate')

        setTimeout(()=>{
            html.find('.ad-preroll__text').addClass('animate')
        },500)
    },100)

    setTimeout(()=>{
        html.find('.ad-preroll__over').addClass('animate')

        setTimeout(()=>{
            Controller.toggle(enabled)

            Background.theme('black')

            video(preroll, 1, ()=>{}, ()=>{
                html.remove()

                Controller.toggle(enabled)

                call()
            })
        },300)
    },3500)

    Controller.add('ad_preroll',{
        toggle: ()=>{
            Controller.clear()
        },
        enter: ()=>{},
        back: ()=>{}
    })

    Controller.toggle('ad_preroll')
}

function getVastPlugin(data){
    let show = true

    if(data.vast_region && typeof data.vast_region == 'string' && data.vast_region.split(',').indexOf(data.ad_region) == -1) show = false
    if(data.vast_platform && typeof data.vast_platform == 'string' && data.vast_platform.split(',').indexOf(Platform.get()) == -1) show = false
    if(data.vast_screen && typeof data.vast_screen == 'string' && data.vast_screen.split(',').indexOf(Platform.screen('tv') ? 'tv' : 'mobile') == -1) show = false

    if(data.vast_url && typeof data.vast_url == 'string' && show) return {
        url: data.vast_url,
        name: 'plugin',
        msg: data.vast_msg || Lang.translate('ad_plugin')
    }

    return false
}

function getAnyPreroll(){
    let manager = Manager.get(player_data)
    let plugin  = getVastPlugin(player_data)

    if(waite_time < Date.now() - 1000 * 60 * 5) return manager || plugin

    return false
}

function show(data, call){
    if(!vast_api){
        if(!(Platform.is('orsay') || Platform.is('netcast'))){
            Metric.counter('no_vast_api', 1)

            console.log('Ad','error','no vast api')
        }
    }

    if(!vast_api || data.torrent_hash || data.youtube || data.iptv || data.continue_play) return call()
    
    if(running) return console.log('Ad', 'skipped, already running')

    running = Date.now()

    let ended = ()=>{
        running = 0

        console.log('Ad', 'call ended')

        call()
    }

    player_data = data
    player_data.ad_region = VPN.code()

    let preroll = getAnyPreroll()

    console.log('Ad', 'any preroll', preroll)

    let ignore  = window.lampa_settings.developer.ads ? false : Account.hasPremium() || Personal.confirm()

    if(ignore) console.log('Ad', 'skipped, premium or torrent/youtube/iptv/continue')

    Metric.counter('ad_preroll', preroll ? 1 : 0, Account.hasPremium() ? 'premium' : Personal.confirm() ? 'personal' : 'none', VPN.code())

    if(preroll && !ignore){
        launch(preroll, ended)
    }
    else ended()
}


export default {
    init,
    show
}