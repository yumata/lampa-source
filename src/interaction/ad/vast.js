import Reguest from '../../utils/reguest'
import Subscribe from '../../utils/subscribe'
import Template from '../template'
import Controller from '../controller'
import Lang from '../../utils/lang'
import Manifest from '../../utils/manifest'
import Utils from '../../utils/math'
import Platform from '../../utils/platform'
import Storage from '../../utils/storage'

let loaded_data = {
    ad: [],
    time: 0
}

function stat(method, name){
    $.ajax({
        dataType: 'text',
        url: Utils.protocol() + Manifest.cub_domain + '/api/ad/stat?platform=' + Platform.get() + '&type=vast&method='+method+'&name=' + name
    })
}


class Vast{
    constructor(num, vast_url, vast_msg){
        this.network  = new Reguest()
        this.listener = Subscribe()
        this.paused   = false
        this.num      = num
        this.vast_url = vast_url
        this.vast_msg = vast_msg

        if(Date.now() - loaded_data.time > 1000*60*60) this.load()
        else if(loaded_data.ad.length) setTimeout(this.start.bind(this), 100)
        else this.load()
    }

    load(){
        if(this.vast_url) return setTimeout(this.start.bind(this), 100)

        let domain = Manifest.cub_domain

        this.network.silent(Utils.protocol() + domain+'/api/ad/vast',(data)=>{
            loaded_data.time = Date.now()
            loaded_data.ad   = data.ad.filter(a=>a.active)
            loaded_data.ad   = loaded_data.ad.filter(a=>a.platforms ? a.platforms.indexOf(Platform.get()) >= 0 : true)
            
            if(loaded_data.ad.length) this.start()
            else this.listener.send('empty')
        },()=>{
            this.listener.send('empty')
        })
    }

    get(){
        let list = loaded_data.ad

        if(this.num > 1 && loaded_data.selected){
            list = loaded_data.ad.filter(ad=>ad.name !== loaded_data.selected.name)
        }

        if(list.length === 0) list = loaded_data.ad

        // Шаг 1: Создаем "взвешенный массив"
        let weightedArray = []

        list.forEach(ad => {
            // Добавляем элемент в массив столько раз, каков его приоритет
            for (let i = 0; i < ad.priority; i++) {
                weightedArray.push(ad)
            }
        })

        // Шаг 2: Выбираем случайный элемент из взвешенного массива
        if (weightedArray.length === 0) {
            return null // Если нет приоритетов, вернуть null
        }

        const randomIndex = Math.floor(Math.random() * weightedArray.length)

        loaded_data.selected = weightedArray[randomIndex]

        return loaded_data.selected
    }

    start(){
        let block = this.vast_url ? {url: this.vast_url, name: 'plugin'} : this.get()

        stat('launch', block.name)

        this.block = Template.js('ad_video_block')

        this.block.find('video').remove()

        this.block.find('.ad-video-block__text').text(Lang.translate('ad')  + ' - ' + Lang.translate('ad_disable')).toggleClass('hide',Boolean(this.vast_url))
        this.block.find('.ad-video-block__info').text('')

        if(this.vast_msg) this.block.find('.ad-video-block__text').text(this.vast_msg).toggleClass('hide', false)

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

            //if(code !== 500) log(block.name, msg)
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

            let uid = Storage.get('vast_device_uid', '')

            if(!uid){
                uid = Utils.uid(15)

                Storage.set('vast_device_uid', uid)
            }

            let u = block.url.replace('{RANDOM}',Math.round(Date.now() * Math.random()))
                u = u.replace('{TIME}',Date.now())
                u = u.replace('{WIDTH}', window.innerWidth)
                u = u.replace('{HEIGHT}', window.innerHeight)
                u = u.replace('{PLATFORM}', Platform.get())
                u = u.replace('{UID}', uid)

            player.load(u).then(()=> {
                return player.startAd()
            }).catch((reason)=> {
                error((reason.message || '').indexOf('nobanner') >= 0 ? 500 : 100, reason.message)
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

            adReadySkip = adDuration > 60 ? (adDuration - remainingTime > 45) :  progress > (block.progress || 60)

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

        console.log('Ad', 'run')

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