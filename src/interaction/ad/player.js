import Player from '../player'
import Lang from '../../utils/lang'
import VideoBlock from './video'
import Video from '../player/video'
import Account from '../../utils/account'
import VPN from '../../utils/vpn'

let visible,
    showing

let next  = 0
let timer = {}
let counter

function prepare(){
    if(visible && !showing && !Video.video().paused && Lang.selected(['ru']) && !Account.hasPremium()){
        if(next < Date.now()){
            VPN.region((code)=>{
                if(code == 'ru') launch()
            })
        } 
    }
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function launch(){
    let tic = 10

    showing = true

    counter = $(`
        <div class="ad-countdown ad-countdown--player">
            <div class="ad-countdown__text">${Lang.translate('ad_after')}</div>
            <div class="ad-countdown__time">10</div>
        </div>
    `)

    $('.player .player-panel__body').append(counter)

    timer.prepare = setInterval(()=>{
        tic--

        counter.find('.ad-countdown__time').text(tic)

        if(tic == 0){
            clearInterval(timer.prepare)

            next = Date.now() + 1000*60*random(30,80)

            counter.remove()

            let video = new VideoBlock()

            video.listener.follow('launch', ()=>{
                Video.pause()
            })
        
            video.listener.follow('ended', ()=>{
                showing = false
        
                Video.play()

                video = null
            })

            video.listener.follow('empty', ()=>{
                showing = false

                video = null
            })
        }
    },1000)
}


function track(){
    clearInterval(timer.track)

    timer.track = setInterval(prepare,1000*60)
}

function init(){
    Player.listener.follow('start', (data)=>{
        if(!data.iptv){
            visible = true

            track()
        }
    })

    Player.listener.follow('destroy', ()=>{
        visible = false
        showing = false

        clearInterval(timer.prepare)
        clearInterval(timer.track)

        if(counter){
            counter.remove()
            counter = false
        }
    })
}

function launched(){
    return showing
}

export default {
    init,
    launched
}
