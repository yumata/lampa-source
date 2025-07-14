import Lang from '../../utils/lang'
import Account from '../../utils/account'
import VPN from '../../utils/vpn'
import Controller from '../controller'
import VideoBlock from './video'
import Personal from '../../utils/personal'
import Utils from '../../utils/math'
import Vast from './vast'
import Platform from '../../utils/platform'
import Manifest from '../../utils/manifest'
import Background from '../background'
import Storage from '../../utils/storage'

let next  = 0
let running = false

let vast_api
let vast_url
let vast_msg

function init(){
    if(!(Platform.is('orsay') || Platform.is('netcast'))){
        Utils.putScriptAsync([Utils.protocol() + Manifest.cub_domain + '/plugin/vast'], false,false,()=>{
            vast_api = true
        })
    }
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function video(vast, num, started, ended){
    console.log('Ad', 'launch', vast ? 'vast' : 'video')

    let Blok = vast ? Vast : VideoBlock
    let item = new Blok(num, vast_url, vast_msg)

    item.listener.follow('launch', started)

    item.listener.follow('ended', ended)

    if(vast){
        item.listener.follow('empty', ()=>{
            video(false, num, started, ended)
        })

        let time = Date.now()

        item.listener.follow('error', ()=>{
            if(Date.now() - time < 11000 && num < 4) video(true, num + 1, started, ended)
            else video(false, num, started, ended)
        })
    }
    else item.listener.follow('empty', ended)

    $.ajax({
        dataType: 'text',
        url: Utils.protocol() + Manifest.cub_domain + '/api/ad/stat?platform=' + Platform.get() + '&type=launch&method=' + (vast ? 'vast' : 'video')
    })
}

function launch(call){
    let enabled = Controller.enabled().name

    next = Date.now() + 1000*60*random(30,80)

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

            video(vast_api, 1, ()=>{
                //html.remove()

                vast_url = false
                vast_msg = ''
            }, ()=>{
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

function show(data, call){
    if(running) return console.log('Ad', 'skipped, already running')

    running = true

    let ended = ()=>{
        running = false

        console.log('Ad', 'call ended')

        call()
    }

    if(data.vast_url && typeof data.vast_url == 'string' && vast_api && (!Account.hasPremium() || window.god_enabled)){
        let plugin_launch = Storage.get('vast_plugin_launch', 0)

        Storage.set('vast_plugin_launch', plugin_launch == 0 ? 1 : 0)

        if(plugin_launch == 0){
            vast_url = data.vast_url
            vast_msg = data.vast_msg || Lang.translate('ad_plugin')

            return launch(ended)
        }
    }

    if(window.god_enabled) launch(ended)
    else if(!Account.hasPremium() && next < Date.now() && !(data.torrent_hash || data.youtube || data.iptv || data.continue_play) && !Personal.confirm()){
        VPN.region((code)=>{
            if(code == 'ru') launch(ended)
            else ended()
        })
    }
    else ended()
}


export default {
    init,
    show
}
