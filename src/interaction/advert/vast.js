import Subscribe from '../../utils/subscribe'
import Template from '../template'
import Controller from '../../core/controller'
import Lang from '../../core/lang'
import Manifest from '../../core/manifest'
import Utils from '../../utils/utils'
import Platform from '../../core/platform'
import Storage from '../../core/storage/storage'

let last_responce = {}

function stat(method, name){
    let type = 'vast'

    if(name == 'plugin'){
        let activity = Storage.get('activity', '{}')

        if(activity.component){
            type = 'plugin'
            name = activity.component
        }
    }

    $.ajax({
        dataType: 'text',
        url: Utils.protocol() + Manifest.cub_domain + '/api/ad/stat?platform=' + Platform.get() + '&type='+type+'&method='+method+'&name=' + name + '&screen=' + (Platform.screen('tv') ? 'tv' : 'mobile'),
    })
}

function log(data){
    $.ajax({
        type: 'POST', // изменено на POST
        dataType: 'text',
        url: Utils.protocol() + Manifest.cub_domain + '/api/adv/log',
        data: {
            platform: Platform.get(),
            ...data,
            ...last_responce
        },
    })

    last_responce = {}
}

function getGuid() {
    let guid = Storage.get('vast_device_guid', '')

    if(!guid || guid.indexOf('00000000') === 0){
        guid = Utils.guid()

        Storage.set('vast_device_guid', guid)
    }

    return guid
}

function getUid(){
    let uid = Storage.get('vast_device_uid', '')

    if(!uid){
        uid = Utils.uid(15)

        Storage.set('vast_device_uid', uid)
    }

    return uid
}

window.adv_logs_responce_event = (e)=>{
    last_responce = {
        status: e.status,
        text: e.text,
    }

    console.log('Ad', 'logs responce', last_responce)
}

class Vast{
    constructor(preroll){
        this.listener = Subscribe()
        this.paused   = false
        this.preroll  = preroll

        setTimeout(this.start.bind(this), 100)
    }

    start(){
        let block = this.preroll

        let movie        = Storage.get('activity', '{}').movie
        let movie_genres = []
        let movie_id     = movie ? movie.id : 0
        let movie_imdb   = movie ? movie.imdb_id : ''
        let movie_type   = movie ? (movie.original_name ? 'tv' : 'movie') : 'movie'

        try{
            movie_genres = movie.genres.map(g=>g.id)
        }
        catch(e){}

        Storage.set('metric_adview', Storage.get('metric_adview', 0) + 1)

        stat('launch', block.name)

        this.block = Template.js('ad_video_block')

        this.block.find('video').remove()

        this.block.find('.ad-video-block__text').text(Lang.translate('ad')  + ' - ' + Lang.translate('ad_disable')).toggleClass('hide',Boolean(block.msg))
        this.block.find('.ad-video-block__info').text('')

        if(block.msg) this.block.find('.ad-video-block__text').text(block.msg + ' - ' + Lang.translate('ad_disable')).toggleClass('hide', false)

        let skip        = this.block.find('.ad-video-block__skip')
        let progressbar = this.block.find('.ad-video-block__progress-fill')
        let loader      = this.block.find('.ad-video-block__loader')
        let container   = this.block.find('.ad-video-block__vast')
        let player
        let timer
        let timer_end
        let last_progress = Date.now()
        let playning = true
        let create_time = Date.now()

        let adInterval
        let adReadySkip
        let adStarted
        let adDuration = 0

        let error = (code, msg)=>{
            this.block.remove()

            clearTimeout(timer)
            clearInterval(timer_end)

            console.log('Ad','error', code, msg)

            this.listener.send('error')

            stat('error', block.name)
            stat('error_' + code, block.name)

            log({
                code,
                name: block.name,
                message: msg,
            })
        }

        function initialize(){
            container.style.opacity = 0

            player = new VASTPlayer(container)

            player.once('AdStopped', ()=> {
                stat('complete', block.name)

                console.log('Ad', 'complete')

                clearTimeout(timer)
                clearInterval(timer_end)
                clearInterval(adInterval)

                this.destroy()
            })

            player.on('AdPaused', ()=> {
                console.log('Ad','event','PAUSE')
                
                playning = false
            })

            player.on('AdPlaying', ()=> {
                console.log('Ad','event','PLAY')

                playning = true
            })

            player.on('AdVideoStart', ()=> {
                console.log('Ad','event','VIDEO_START')

                let video = player.container.find('video')

                if(video){
                    video.addEventListener('pause', ()=> {
                        console.log('Ad','event','PAUSE')

                        playning = false
                    })
                } 
            })

            player.once('AdStarted', onAdStarted.bind(this))

            let pixel_ratio = window.devicePixelRatio || 1

            let u = block.url.replace('{RANDOM}',Math.round(Date.now() * Math.random()))
                u = u.replace(/{TIME}/g,Date.now())
                u = u.replace(/{WIDTH}/g, Math.round(window.innerWidth * pixel_ratio))
                u = u.replace(/{HEIGHT}/g, Math.round(window.innerHeight * pixel_ratio))
                u = u.replace(/{PLATFORM}/g, Platform.get())
                u = u.replace(/{UID}/g, encodeURIComponent(getUid()))
                u = u.replace(/{PIXEL}/g, pixel_ratio)
                u = u.replace(/{GUID}/g, encodeURIComponent(getGuid()))
                u = u.replace(/{MOVIE_ID}/g, movie_id)
                u = u.replace(/{MOVIE_GENRES}/g, movie_genres.join(','))
                u = u.replace(/{MOVIE_IMDB}/g, movie_imdb)
                u = u.replace(/{MOVIE_TYPE}/g, movie_type)
                u = u.replace(/{SCREEN}/g, encodeURIComponent(Platform.screen('tv') ? 'tv' : 'mobile'))

            player.load(u).then(()=> {
                return player.startAd()
            }).catch((reason)=> {
                error(100, reason.message)
            })
        }

        function onAdStarted() {
            console.log('Ad','event','STARTED')

            container.style.opacity = 1

            if(!adStarted) stat('started', block.name)

            adStarted = true

            clearTimeout(timer)
            clearInterval(timer_end)

            try{
                loader.remove()
            }
            catch(e){}

            if (player.adDuration) {
                adDuration = player.adDuration

                clearInterval(adInterval)

                adInterval = setInterval(updateAdProgress, 100)
            }

            timer_end = setInterval(()=>{
                if(Date.now() - last_progress > 1000 * 10 && playning) stop.bind(this)()
            }, 1000)
        }

        function updateAdProgress() {
            let remainingTime = player.adRemainingTime

            let progress = Math.min(100, (1 - remainingTime / adDuration) * 100)

            last_progress = Date.now()

            progressbar.style.width = progress + '%'

            adReadySkip = adDuration > 30 ? (adDuration - remainingTime > 30) :  progress > (block.progress || 60)

            skip.find('span').text(Lang.translate(adReadySkip ? 'ad_skip' : Math.round(remainingTime)))

            if (remainingTime <= 0) {
                clearInterval(adInterval)
            }
        }

        function enter(){
            if (adReadySkip) stop.bind(this)()
            else{
                if(playning) player.pauseAd()
                else player.resumeAd()
            }
        }

        function stop(){
            clearTimeout(timer)
            clearInterval(timer_end)
            clearInterval(adInterval)

            player.stopAd().then(()=>{
                this.destroy()
            }).catch(()=>{
                error(200, 'Cant stop ads')
            })
        }

        this.block.on('click',enter.bind(this))

        document.body.append(this.block)
        
        Controller.add('ad_video_block',{
            toggle: ()=>{
                Controller.clear()
            },
            enter: enter.bind(this),
            back: ()=>{
                if(window.god_enabled && Date.now() - create_time > 1000*7) stop.bind(this)()
            }
        })

        Controller.toggle('ad_video_block')

        this.listener.send('launch')

        timer = setTimeout(()=>{
            error(300,'Timeout')
        },10000)

        console.log('Ad', 'run', block.name, 'from', block.name == 'plugin' ? 'plugin' : 'cub')

        try{
            initialize.apply(this)
        }
        catch(e){
            error(400,'Initialize', e ? e.message : '')
        }

        stat('run', block.name)
    }

    destroy(){
        if(this.destroyed) return
        
        this.block.remove()

        this.listener.send('ended')

        this.destroyed = true
    }
}

export default Vast