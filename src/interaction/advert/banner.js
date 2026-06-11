import IMA from './ima'
import Timer from '../../core/timer'
import VastManager from './vast_manager'

let Manager = new VastManager({
    api: 'banner',
    cooling: 1000 * 60 * 20
})

let adContainer, adDisplayContainer, adsLoader
let adsManager  = null
let showTimeout = null
let timeout     = 1000 * 60
let banner      = null

function init(){
    Manager.init()

    Lampa.Player.listener.follow('ready', ()=>{
        Manager.markCooling()
    })

    Lampa.Player.listener.follow('destroy', stop)

    Lampa.PlayerPanel.listener.follow('visible', (e) => resize(e.status ? Lampa.PlayerPanel.render()[0].offsetHeight : 0))
    Lampa.PlayerFooter.listener.follow('open', (e) => resize(Lampa.PlayerFooter.render().offsetHeight))
    Lampa.PlayerFooter.listener.follow('close', (e) => resize(Lampa.PlayerPanel.render()[0].offsetHeight))

    let first = true

    Timer.add(1000 * 60, ()=>{
        Manager.params.cooling = 1000 * 60 * (window.lampa_settings.developer.enabled ? 2 : 20)

        if(Lampa.Player.opened() && Manager.coolingReady() && IMA.canShow(Lampa.Player.playdata())){
            banner = Manager.get(Lampa.Player.playdata(), first)

            console.log('Ad', 'show banner', banner)

            if(banner){
                first = false

                Manager.markCooling()

                stop()
                start()
            }
            else{
                first = true
            }
        }
    })
}

function stat(method){
    IMA.metric('banner', method, banner.name)
}

function resize(panelHeight){
    if(!adContainer) return

    adContainer.style.height = (window.innerHeight - panelHeight - (panelHeight ? 20 : 0)) + 'px'

    if(adsManager){
        let w = adContainer.offsetWidth  || window.innerWidth
        let h = adContainer.offsetHeight || window.innerHeight

        try{ adsManager.resize(w, h, google.ima.ViewMode.NORMAL) } catch(ex){}
    }
}

function loaded(event) {
    let video = Lampa.PlayerVideo.video()

    if(!Lampa.Player.opened()) return

    stat('run')

    let adsRenderingSettings = new google.ima.AdsRenderingSettings()
        adsRenderingSettings.uiElements = []

    adsManager = event.getAdsManager(video, adsRenderingSettings)

    adsManager.addEventListener(google.ima.AdEvent.Type.STARTED, (e) => {
        console.log('Ad', 'banner started')

        stat('started')

        showTimeout = setTimeout(()=>{
            console.log('Ad', 'banner complete')

            stat('complete')

            stop()
        }, timeout)
    })

    adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, (e) => {
        console.error('Ad', 'manager error', e.getError())

        error(200)

        stop()
    })
    

    let player = Lampa.Player.render()[0]
    let w = player ? player.offsetWidth  : window.innerWidth
    let h = player ? player.offsetHeight : window.innerHeight

    try{
        adsManager.init(w, h, google.ima.ViewMode.NORMAL)
        adsManager.start()

        resize(Lampa.Player.render().hasClass('player--panel-visible'))
    }
    catch(e){
        console.error('Ad', 'init error', e)

        error(300)

        stop()
    }
}

function start(){
    IMA.loadSDK3().then(() => {
        if(!Lampa.Player.opened()) return

        let video = Lampa.PlayerVideo.video()

        // Контейнер должен быть внутри .player, чтобы IMA SDK
        // правильно рассчитывал позицию overlay относительно видео
        let player = Lampa.Player.render()[0]

        adContainer = document.createElement('div')
        adContainer.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:10;pointer-events:none;'

        player.appendChild(adContainer)

        adDisplayContainer = new google.ima.AdDisplayContainer(adContainer, video)

        adsLoader = new google.ima.AdsLoader(adDisplayContainer)

        adsLoader.addEventListener(
            google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
            loaded
        )

        adsLoader.addEventListener(
            google.ima.AdErrorEvent.Type.AD_ERROR,
            (e) => {
                console.error('Ad', 'banner loader error', e.getError())

                error(100)

                stop()
            }
        )

        // initialize() должен вызываться до requestAds() и из пользовательского контекста
        adDisplayContainer.initialize()

        let slotWidth  = player.offsetWidth  || window.innerWidth
        let slotHeight = player.offsetHeight || window.innerHeight

        let request = new google.ima.AdsRequest()
            request.adTagUrl = IMA.buildUrl(banner.url)

            request.linearAdSlotWidth     = slotWidth
            request.linearAdSlotHeight    = slotHeight
            request.nonLinearAdSlotWidth  = slotWidth
            request.nonLinearAdSlotHeight = Math.round(slotHeight * 0.3)

        adsLoader.requestAds(request)

        stat('launch')
    }).catch((e) => {
        console.error('Ad', 'banner SDK load failed', e)
    })
}

function error(code){
    IMA.metric('banner', 'error', banner.name)
    IMA.metric('banner', 'error_' + code, banner.name)
}

function stop(){
    clearTimeout(showTimeout)

    showTimeout = null

    if(adsManager){
        try{ adsManager.stop(); adsManager.destroy() } catch(e){}
        adsManager = null
    }

    if(adsLoader){
        try{ adsLoader.destroy() } catch(e){}
        adsLoader = null
    }

    if(adContainer){
        adContainer.remove()
        adContainer = null
    }
}

export default {
    init
}