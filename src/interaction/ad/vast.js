import Reguest from '../../utils/reguest'
import Subscribe from '../../utils/subscribe'
import Template from '../template'
import Controller from '../controller'
import Lang from '../../utils/lang'

class Vast{
    constructor(number){
        this.network  = new Reguest()
        this.listener = Subscribe()
        this.paused   = false
        
        setTimeout(()=>{
            this.create()
        },100)
    }

    create(){
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

        function initializeIMA() {
            // Создаем контейнер для объявлений
            adDisplayContainer = new google.ima.AdDisplayContainer(adContainer, videoContent)
            adsLoader = new google.ima.AdsLoader(adDisplayContainer)

            // Регистрируем слушатель для получения рекламных ошибок
            adsLoader.addEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, onAdsManagerLoaded.bind(this), false)
            adsLoader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError.bind(this),false)

            // Загружаем рекламу
            let adsRequest = new google.ima.AdsRequest()
                adsRequest.adTagUrl = 'https://yandex.ru/ads/adfox/277740/getCode?p1=dekrt&p2=gdol' // Ссылка на VAST

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

                adsManager.destroy()

                adsLoader.destroy()

                this.destroy()
            }
        }

        function onAdStarted(event) {
            let ad = event.getAd()

            if (ad.isLinear()) {
                isLinearAd = true

                // Отображаем полную продолжительность рекламы
                adDuration = adsManager.getRemainingTime()

                // Обновляем прогресс рекламы каждую секунду
                adInterval = setInterval(updateAdProgress, 100)

                // Показываем кнопку "Пропустить" через 5 секунд, если это разрешено рекламой
                if (ad.getSkipTimeOffset() !== -1) {
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

            if(adsManager) adsManager.destroy()

            adsLoader.destroy()

            this.destroy()
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

        initializeIMA.apply(this)
    }

    destroy(){
        this.block.remove()

        Controller.toggle(this.last_controller)

        this.listener.send('ended')
    }
}

export default Vast