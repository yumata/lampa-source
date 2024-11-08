import Reguest from '../../utils/reguest'
import Subscribe from '../../utils/subscribe'
import Template from '../template'
import Controller from '../controller'
import Lang from '../../utils/lang'
import Manifest from '../../utils/manifest'
import Utils from '../../utils/math'
import Platform from '../../utils/platform'

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

function log(name, msg){
    $.ajax({
        dataType: 'text',
        method: 'post',
        url: Utils.protocol() + Manifest.cub_domain + '/api/payment/event_prime',
        data: {
            name,
            msg
        }
    })
}

class Vast{
    constructor(){
        this.network  = new Reguest()
        this.listener = Subscribe()
        this.paused   = false

        if(loaded_data.time < Date.now() + 1000*60*60*1) this.load()
        else if(loaded_data.ad.length) setTimeout(this.start.bind(this), 100)
        else this.load()
    }

    load(){
        let domain = Manifest.cub_domain

        this.network.silent(Utils.protocol() + domain+'/api/ad/vast',(data)=>{
            loaded_data.time = Date.now()
            loaded_data.ad   = data.ad.filter(a=>a.active)
            
            if(loaded_data.ad.length) this.start()
            else this.listener.send('empty')
        },()=>{
            this.listener.send('empty')
        })
    }

    get(){
        // Шаг 1: Создаем "взвешенный массив"
        let weightedArray = []

        loaded_data.ad.forEach(ad => {
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

        return weightedArray[randomIndex]
    }

    start(){
        let block = this.get()

        stat('launch', block.name)

        this.block = Template.js('ad_video_block')

        this.block.find('video').remove()

        this.block.find('.ad-video-block__text').text(Lang.translate('ad')  + ' - ' + Lang.translate('ad_disable'))
        this.block.find('.ad-video-block__info').text('')

        let skip        = this.block.find('.ad-video-block__skip')
        let progressbar = this.block.find('.ad-video-block__progress-fill')
        let player
        let timer

        let adInterval
        let adReadySkip
        let adStarted
        let adDuration = 0

        let error = (code, msg)=>{
            clearTimeout(timer)

            console.log('Ad','error', code, msg)

            this.listener.send('error')

            stat('error', block.name)
            stat('error_' + code, block.name)

            if(code !== 500) log(block.name, msg)
        }

        function initialize(){
            player = new VASTPlayer(this.block.find('.ad-video-block__vast'))

            player.once('AdStopped', ()=> {
                stat('complete', block.name)

                console.log('Ad', 'complete')

                clearTimeout(timer)
                clearInterval(adInterval)

                this.destroy()
            })

            player.load(block.url.replace('{RANDOM}',Math.round(Date.now() * Math.random())).replace('{TIME}',Date.now())).then(()=> {
                onAdStarted()

                return player.startAd()
            }).catch((reason)=> {
                error((reason.message || '').indexOf('nobanner') >= 0 ? 500 : 100, reason.message)
            })
        }

        function onAdStarted() {
            console.log('Ad','event','STARTED')

            if(!adStarted) stat('started', block.name)

            adStarted = true

            clearTimeout(timer)

            try{
                this.block.find('.ad-video-block__loader').remove()
            }
            catch(e){}

            if (player.adDuration) {
                adDuration = player.adDuration

                clearInterval(adInterval)

                adInterval = setInterval(updateAdProgress, 100)
            } 
        }

        function updateAdProgress() {
            let remainingTime = player.adRemainingTime

            let progress = Math.min(100, (1 - remainingTime / adDuration) * 100)

            progressbar.style.width = progress + '%'

            adReadySkip = progress > 60

            skip.find('span').text(Lang.translate(adReadySkip ? 'ad_skip' : Math.round(remainingTime)))

            if (remainingTime <= 0) {
                clearInterval(adInterval)
            }
        }

        function enter(){
            if (adReadySkip) {
                clearTimeout(timer)
                clearInterval(adInterval)

                player.stopAd().then(()=>{
                    this.destroy()
                }).catch(()=>{
                    error(200, 'Cant stop ads')
                })
            }
        }

        this.block.on('click',enter.bind(this))

        document.body.append(this.block)
        
        Controller.add('ad_video_block',{
            toggle: ()=>{
                Controller.clear()
            },
            enter: enter.bind(this),
            back: ()=>{}
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
        this.listener.send('ended')
    }
}

export default Vast