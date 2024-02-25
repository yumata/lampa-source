import Lang from '../../utils/lang'
import Account from '../../utils/account'
import VPN from '../../utils/vpn'
import Controller from '../controller'
import VideoBlock from './video'
import Personal from '../../utils/personal'

let next  = 0

function init(){

}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
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

            let video = new VideoBlock()

            video.listener.follow('launch', ()=>{
                html.remove()
            })

            video.listener.follow('ended', ()=>{
                html.remove()

                call()
            })

            video.listener.follow('empty', ()=>{
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
    if(Lang.selected(['ru','uk','be','bg']) && !Account.hasPremium() && next < Date.now() && !(data.torrent_hash || data.youtube || data.iptv || data.continue_play) && !Personal.confirm()){
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
