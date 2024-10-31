import Lang from '../../utils/lang'
import Account from '../../utils/account'
import VPN from '../../utils/vpn'
import Controller from '../controller'
import VideoBlock from './video'
import Personal from '../../utils/personal'
import Utils from '../../utils/math'
import Vast from './vast'
import Platform from '../../utils/platform'

let next  = 0
let imasdk

function init(){
    if(Platform.is('android') || Platform.is('browser')){
        Utils.putScriptAsync(['https://imasdk.googleapis.com/js/sdkloader/ima3.js'], false,false,()=>{
            imasdk = true
        })
    }
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function video(vast, num, started, ended){
    let Blok = vast ? Vast : VideoBlock
    let item = new Blok(num)

    item.listener.follow('launch', started)

    item.listener.follow('ended', ended)

    if(vast){
        item.listener.follow('empty', ()=>{
            video(false, num, started, ended)
        })

        item.listener.follow('error', ()=>{
            video(false, num, started, ended)
        })
    }
    else item.listener.follow('empty', ended)
}

function launch(call){
    let enabled = Controller.enabled().name

    next = Date.now() + 1000*60*random(30,80)

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

            video(imasdk, 1, ()=>{
                html.remove()
            }, ()=>{
                html.remove()

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
    let ac = Lampa.Activity.active()

    if(ac && ac.component == 'full' && ac.id == '1966') return launch(call)

    if(window.god_enabled) return launch(call)

    if(!Account.hasPremium() && next < Date.now() && !(data.torrent_hash || data.youtube || data.iptv || data.continue_play) && !Personal.confirm()){
        VPN.region((code)=>{
            if(code == 'ru') launch(call)
            else call()
        })
    }
    else call()
}


export default {
    init,
    show
}
