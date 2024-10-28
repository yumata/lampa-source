import Reguest from '../../utils/reguest'
import Subscribe from '../../utils/subscribe'
import Template from '../template'
import Controller from '../controller'
import Lang from '../../utils/lang'
import Manifest from '../../utils/manifest'
import Utils from '../../utils/math'

let loaded_data = {
    url: '',
    time: 0
}

class Vast{
    constructor(){
        this.network  = new Reguest()
        this.listener = Subscribe()
        this.paused   = false

        if(loaded_data.time < Date.now() + 1000*60*60*1) this.load()
        else if(loaded_data.url) setTimeout(this.start.bind(this), 100)
        else this.load()
    }

    load(){
        let domain = Manifest.cub_domain

        this.network.silent(Utils.protocol() + domain+'/api/ad/vast',(data)=>{
            loaded_data.time = Date.now()
            loaded_data.url  = data.url
            
            if(data.url) this.start()
            else this.listener.send('empty')
        },()=>{
            this.listener.send('empty')
        })
    }

    start(){
        this.block = Template.js('ad_video_block')
        this.last_controller = Controller.enabled().name

        this.block.find('video').remove()

        this.block.find('.ad-video-block__text').text(Lang.translate('ad')  + ' - ' + Lang.translate('ad_disable'))
        this.block.find('.ad-video-block__info').text('')

        this.block.find('.ad-video-block__vast-line').removeClass('hide')

        let skip        = this.block.find('.ad-video-block__skip')
        let progressbar = this.block.find('.ad-video-block__progress-fill')

        let adDisplayContainer
        let adsLoader
        let adsManager

        let videoContent = this.block.find('video')
        let adContainer = this.block.find('.ad-video-block__vast')

        let adInterval
        let isLinearAd = false
        let skipTimer
        let adDuration = 0
        let adReadySkip
        let adTimer

        let error = ()=>{
            this.block.remove()

            if(adsManager) adsManager.destroy()

            if(adsLoader) adsLoader.destroy()

            clearTimeout(adTimer)

            this.listener.send('error')
        }

        function initializeIMA() {
            // Создаем контейнер для объявлений
            adDisplayContainer = new google.ima.AdDisplayContainer(adContainer, videoContent)
            adsLoader = new google.ima.AdsLoader(adDisplayContainer)

            // Регистрируем слушатель для получения рекламных ошибок
            adsLoader.addEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, onAdsManagerLoaded.bind(this), false)
            adsLoader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError.bind(this),false)

            // Загружаем рекламу
            let adsRequest = new google.ima.AdsRequest()
                adsRequest.adTagUrl = loaded_data.url.replace('{RANDOM}',Math.round(Date.now() * Math.random())) // Ссылка на VAST

            // Указываем, что реклама должна воспроизводиться перед контентом
            adsRequest.linearAdSlotWidth  = window.innerWidth
            adsRequest.linearAdSlotHeight = window.innerHeight

            adsLoader.requestAds(adsRequest)
        }

        function onAdsManagerLoaded(adsManagerLoadedEvent) {
            // Инициализируем AdsManager, который контролирует рекламу
            adsManager = adsManagerLoadedEvent.getAdsManager(videoContent)

            adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError.bind(this))
            adsManager.addEventListener(google.ima.AdEvent.Type.STARTED, onAdStarted.bind(this))
            adsManager.addEventListener(google.ima.AdEvent.Type.IMPRESSION, onAdStarted.bind(this))
            adsManager.addEventListener(google.ima.AdEvent.Type.COMPLETE, ()=>{
                adsManager.destroy()

                this.destroy()
            },false)

            try {
                adDisplayContainer.initialize()
                adsManager.init(window.innerWidth, window.innerHeight, google.ima.ViewMode.NORMAL)
                adsManager.start()
            } 
            catch (adError) {
                console.log('Ad','error','AdsManager could not be started')

                error()
            }
        }

        function onAdStarted(event) {
            console.log('Ad','event','STARTED')

            let ad = event.getAd()

            clearTimeout(adTimer)

            try{
                this.block.find('.ad-video-block__loader').remove()
            }
            catch(e){}

            if (ad.isLinear()) {
                isLinearAd = true

                // Отображаем полную продолжительность рекламы
                adDuration = adsManager.getRemainingTime()

                clearInterval(adInterval)

                // Обновляем прогресс рекламы каждую секунду
                adInterval = setInterval(updateAdProgress, 100)

                // Показываем кнопку "Пропустить" через 5 секунд, если это разрешено рекламой
                if (ad.getSkipTimeOffset() !== -1) {
                    clearTimeout(skipTimer)

                    skipTimer = setTimeout(()=> {
                        adReadySkip = true
                    }, ad.getSkipTimeOffset() * 1000) // Отображаем кнопку через заданное время
                }
            } 
            else {
                isLinearAd = false
            }
        }

        function updateAdProgress() {
            if (isLinearAd && adsManager) {
                let remainingTime = adsManager.getRemainingTime()

                let progress = Math.min(100, (1 - remainingTime / adDuration) * 100)

                progressbar.style.width = progress + '%'

                skip.find('span').text(Lang.translate(adReadySkip ? 'ad_skip' : Math.round(remainingTime)))

                if (remainingTime <= 0) {
                    clearInterval(adInterval)
                }
            }
        }

        function enter(){
            if (adReadySkip) {
                adsManager.destroy()

                adsLoader.destroy()

                this.destroy()
            }
        }

        function onAdError(adErrorEvent) {
            console.log('Ad', 'error', adErrorEvent.getError().data.errorMessage)

            error()
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

        adTimer = setTimeout(error.bind(this),9000)

        initializeIMA.apply(this)
    }

    destroy(){
        this.block.remove()

        Controller.toggle(this.last_controller)

        this.listener.send('ended')
    }
}

export default Vast