import Subscribe from '../../utils/subscribe'
import Template from '../template'
import Controller from '../../core/controller'
import Lang from '../../core/lang'
import Manifest from '../../core/manifest'
import Utils from '../../utils/utils'
import Platform from '../../core/platform'
import Storage from '../../core/storage/storage'

const IMA_SDK_URL = 'https://imasdk.googleapis.com/js/sdkloader/ima3.js'

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
        type: 'POST',
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

function getGuid(){
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

/**
 * Загружает Google IMA SDK если ещё не загружен
 * @returns {Promise}
 */
function loadImaSdk(){
    return new Promise((resolve, reject) => {
        if(window.google && window.google.ima){
            resolve()
            return
        }

        let script = document.createElement('script')
        script.src = IMA_SDK_URL
        script.onload  = resolve
        script.onerror = () => reject(new Error('IMA SDK load failed'))
        document.head.appendChild(script)
    })
}

window.adv_logs_responce_event = (e) => {
    last_responce = {
        status: e.status,
        text: e.text,
    }

    console.log('Ad3', 'logs responce', last_responce)
}

class Vast3 {
    constructor(preroll){
        this.listener    = Subscribe()
        this.preroll     = preroll
        this.elems       = {}
        this.tiks        = {}
        this.skip_time   = 15
        this.skip_ready  = false
        this.timewait    = 12 * 1000
        this.created_at  = Date.now()
        this.removed     = false
        this.adsManager  = null
        this.adsLoader   = null
        this.adContainer = null

        setTimeout(this.start.bind(this), 100)
    }

    /**
     * Запустить рекламу
     */
    start(){
        Storage.set('metric_adview', Storage.get('metric_adview', '0') + 1)

        stat('launch', this.preroll.name)

        this.elems.block       = Template.js('ad_video_block')
        this.elems.skip        = this.elems.block.find('.ad-video-block__skip')
        this.elems.skip.style.display = 'none'
        this.elems.progressbar = this.elems.block.find('.ad-video-block__progress-fill')
        this.elems.loader      = this.elems.block.find('.ad-video-block__loader')
        this.elems.container   = this.elems.block.find('.ad-video-block__vast')
        this.elems.status      = Template.elem('div', {class: 'ad-video-block__status'})

        // Создаём video-элемент для IMA SDK
        this.elems.video = Template.elem('video', {
            playsinline: '',
            muted: '',
            style: 'position:absolute;width:100%;height:100%;top:0;left:0;object-fit:contain;'
        })

        this.elems.block.find('video').remove()
        this.elems.container.appendChild(this.elems.video)
        this.elems.block.append(this.elems.status)

        this.elems.container.style.opacity = 0
        this.elems.status.style.position   = 'absolute'
        this.elems.status.style.top        = '1em'
        this.elems.status.style.left       = '1em'
        this.elems.status.style.textShadow = '0 0 5px black'
        this.elems.status.style.fontSize   = '0.9em'

        this.elems.block.find('.ad-video-block__text').text(Lang.translate('ad') + ' - ' + Lang.translate('ad_disable')).toggleClass('hide', Boolean(this.preroll.msg))
        this.elems.block.find('.ad-video-block__info').text('')

        if(this.preroll.msg) this.elems.block.find('.ad-video-block__text').text(this.preroll.msg + ' - ' + Lang.translate('ad_disable')).toggleClass('hide', false)

        this.elems.block.on('click', this.skip.bind(this))

        document.body.append(this.elems.block)

        this.listener.send('launch')

        this.controller()

        this.timeout()

        console.log('Ad3', 'run', this.preroll.name, 'from', this.preroll.name == 'plugin' ? 'plugin' : 'cub')

        this.elems.status.text('Loading IMA SDK...')

        loadImaSdk().then(() => {
            if(this.removed) return

            this.elems.status.text('Initialize...')

            try{
                this.initialize()
                stat('run', this.preroll.name)
            }
            catch(e){
                this.error(400, 'Initialize', e ? e.message : '')
            }
        }).catch((e) => {
            this.error(500, 'SDK Load', e ? e.message : '')
        })
    }

    /**
     * Контроллер рекламы
     */
    controller(){
        Controller.add('ad_video_block', {
            toggle: () => {
                Controller.clear()
            },
            enter: this.skip.bind(this),
            back:  this.skip.bind(this)
        })

        Controller.toggle('ad_video_block')
    }

    /**
     * Ждём загрузки определённое время, затем выдаём ошибку
     */
    timeout(){
        this.tiks.timeout = setTimeout(() => {
            this.error(300, 'Timeout')
        }, this.timewait)
    }

    /**
     * Инициализация Google IMA SDK (VAST 3.0)
     */
    initialize(){
        let ima = window.google.ima

        ima.settings.setVpaidMode(ima.ImaSdkSettings.VpaidMode.ENABLED)
        ima.settings.setLocale('ru')

        this.adContainer = this.elems.container

        let displayContainer = new ima.AdDisplayContainer(this.adContainer, this.elems.video)
        displayContainer.initialize()


        this.adsLoader = new ima.AdsLoader(displayContainer)

        this.adsLoader.addEventListener(
            ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
            this.onAdsManagerLoaded.bind(this),
            false
        )

        this.adsLoader.addEventListener(
            ima.AdErrorEvent.Type.AD_ERROR,
            this.onAdError.bind(this),
            false
        )

        let request = new ima.AdsRequest()
        request.adTagUrl = this.url()
        request.linearAdSlotWidth  = this.adContainer.offsetWidth  || window.innerWidth
        request.linearAdSlotHeight = this.adContainer.offsetHeight || window.innerHeight
        request.nonLinearAdSlotWidth  = this.adContainer.offsetWidth  || window.innerWidth
        request.nonLinearAdSlotHeight = Math.floor((this.adContainer.offsetHeight || window.innerHeight) / 3)

        this.adsLoader.requestAds(request)

        this.elems.status.text('Requesting...')
    }

    /**
     * AdsManager загружен
     */
    onAdsManagerLoaded(loadedEvent){
        if(this.removed) return

        let ima = window.google.ima

        let adsRenderingSettings = new ima.AdsRenderingSettings()
        adsRenderingSettings.uiElements = [] // скрываем встроенную кнопку пропуска IMA SDK

        this.adsManager = loadedEvent.getAdsManager(this.elems.video, adsRenderingSettings)

        this.adsManager.addEventListener(ima.AdErrorEvent.Type.AD_ERROR,       this.onAdError.bind(this),   false)
        this.adsManager.addEventListener(ima.AdEvent.Type.STARTED,             this.onStarted.bind(this),   false)
        this.adsManager.addEventListener(ima.AdEvent.Type.COMPLETE,            this.onComplete.bind(this),  false)
        this.adsManager.addEventListener(ima.AdEvent.Type.ALL_ADS_COMPLETED,   this.onComplete.bind(this),  false)
        this.adsManager.addEventListener(ima.AdEvent.Type.SKIPPED,             this.onComplete.bind(this),  false)
        this.adsManager.addEventListener(ima.AdEvent.Type.AD_PROGRESS,         this.onAdProgress.bind(this),false)
        this.adsManager.addEventListener(ima.AdEvent.Type.PAUSED,              ()=> { this.paused = true },  false)
        this.adsManager.addEventListener(ima.AdEvent.Type.RESUMED,             ()=> { this.paused = false }, false)

        this.elems.status.text('Loaded')

        try{
            this.adsManager.init(
                this.adContainer.offsetWidth  || window.innerWidth,
                this.adContainer.offsetHeight || window.innerHeight,
                ima.ViewMode.NORMAL
            )

            this.adsManager.setVolume(0.5)

            this.adsManager.start()
        }
        catch(e){
            this.error(401, 'AdsManager init', e ? e.message : '')
        }
    }

    /**
     * Ошибка IMA SDK
     */
    onAdError(adErrorEvent){
        let msg = adErrorEvent && adErrorEvent.getError ? adErrorEvent.getError().getMessage() : 'Unknown error'

        console.log('Ad3', 'ima error', msg)

        if(!this.removed) this.error(100, msg)
    }

    /**
     * Реклама запущена
     */
    onStarted(adEvent){
        if(this.removed) return

        console.log('Ad3', 'event', 'started')

        let ad       = adEvent.getAd()
        let duration = ad ? ad.getDuration() : this.skip_time

        this.elems.status.text('Started: ' + (duration ? Math.round(duration) + 's' : ''))

        stat('started', this.preroll.name)

        clearTimeout(this.tiks.timeout)

        this.elems.loader.remove()

        this.elems.container.style.opacity = 1

        let skip_from_ad = ad ? ad.getSkipTimeOffset() : -1

        this.skip_time    = skip_from_ad > 0 ? Math.round(Math.min(60, skip_from_ad)) : Math.round(Math.max(this.skip_time, Math.min(60, duration * 0.8)))
        this.started_time = Date.now()
        this.ad_duration  = duration

        console.log('Ad3', 'skip time set to:', this.skip_time)

        clearInterval(this.tiks.progress)
        this.tiks.progress = setInterval(this.onProgress.bind(this), 100)

        clearTimeout(this.tiks.watch)
        this.tiks.watch = setTimeout(() => {
            console.log('Ad3', 'error', 'watch timeout', duration)

            this.elems.status.text('Watch timeout: ' + duration + 's')

            this.stop()
            this.onEnd()
        }, Math.round((duration + 5) * 1000))
    }

    /**
     * Прогресс из IMA SDK
     */
    onAdProgress(adEvent){
        let data = adEvent.getAdData()

        if(data){
            let duration  = data.duration  || this.ad_duration || this.skip_time
            let current   = data.currentTime || ((Date.now() - this.started_time) / 1000)
            let remaining = duration - current
            let progress  = Math.min(100, (current / duration) * 100)

            this.elems.progressbar.style.width = progress + '%'

            this.skip_ready = current > this.skip_time

            let user_view = Math.max(0, duration > this.skip_time ? this.skip_time - current : remaining)

            this.elems.skip.find('span').text(Lang.translate(this.skip_ready ? 'ad_skip' : Math.ceil(user_view)))
        }
    }

    /**
     * Обновление прогресса по таймеру (резервный)
     */
    onProgress(){
        let duration  = this.ad_duration || this.skip_time
        let elapsed   = (Date.now() - this.started_time) / 1000
        let remaining = duration - elapsed
        let progress  = Math.min(100, (elapsed / duration) * 100)

        this.elems.progressbar.style.width = progress + '%'

        this.skip_ready = elapsed > this.skip_time

        let user_view = Math.max(0, duration > this.skip_time ? this.skip_time - elapsed : remaining)

        this.elems.skip.find('span').text(Lang.translate(this.skip_ready ? 'ad_skip' : Math.ceil(user_view)))

        if(remaining <= 0) clearInterval(this.tiks.progress)
    }

    /**
     * Реклама завершена
     */
    onComplete(){
        if(this.removed) return

        console.log('Ad3', 'complete event')

        this.destroy()

        this.onEnd()
    }

    /**
     * Событие окончания рекламы
     */
    onEnd(){
        console.log('Ad3', 'complete')

        stat('complete', this.preroll.name)

        this.listener.send('ended')
    }

    /**
     * Сформировать URL для запроса рекламы
     */
    url(){
        let movie        = Storage.get('activity', '{}').movie
        let movie_genres = []
        let movie_id     = movie ? movie.id : 0
        let movie_imdb   = movie ? movie.imdb_id : ''
        let movie_type   = movie ? (movie.original_name ? 'tv' : 'movie') : 'movie'

        try{
            movie_genres = movie.genres.map(g => g.id)
        }
        catch(e){}

        let pixel_ratio = window.devicePixelRatio || 1

        let u = this.preroll.url.replace('{RANDOM}', Math.round(Date.now() * Math.random()))
            u = u.replace(/{TIME}/g,         Date.now())
            u = u.replace(/{WIDTH}/g,         Math.round(window.innerWidth  * pixel_ratio))
            u = u.replace(/{HEIGHT}/g,        Math.round(window.innerHeight * pixel_ratio))
            u = u.replace(/{PLATFORM}/g,      Platform.get())
            u = u.replace(/{UID}/g,           encodeURIComponent(getUid()))
            u = u.replace(/{PIXEL}/g,         pixel_ratio)
            u = u.replace(/{GUID}/g,          encodeURIComponent(getGuid()))
            u = u.replace(/{MOVIE_ID}/g,      movie_id)
            u = u.replace(/{MOVIE_GENRES}/g,  movie_genres.join(','))
            u = u.replace(/{MOVIE_IMDB}/g,    movie_imdb)
            u = u.replace(/{MOVIE_TYPE}/g,    movie_type)
            u = u.replace(/{SCREEN}/g,        encodeURIComponent(Platform.screen('tv') ? 'tv' : 'mobile'))

        return u
    }

    /**
     * Обработка ошибки
     */
    error(code, msg){
        console.log('Ad3', 'error', code, msg)

        this.stop()

        this.listener.send('error')

        stat('error',          this.preroll.name)
        stat('error_' + code,  this.preroll.name)

        log({
            code,
            name:    this.preroll.name,
            message: msg,
        })
    }

    /**
     * Пропустить рекламу если можно
     */
    skip(){
        if(this.removed) return

        if(this.skip_ready || (Date.now() - this.created_at) / 1000 > this.skip_time){
            this.stop()

            this.onEnd()
        }
    }

    /**
     * Остановить рекламу принудительно
     */
    stop(){
        try{
            if(this.adsManager){
                this.adsManager.stop()
                this.adsManager.destroy()
                this.adsManager = null
            }
        }
        catch(e){
            console.error('Ad3', 'stop error', e ? e.message : '')
        }

        this.destroy()
    }

    /**
     * Уничтожить
     */
    destroy(){
        if(this.removed) return

        clearTimeout(this.tiks.timeout)
        clearTimeout(this.tiks.watch)
        clearInterval(this.tiks.progress)

        if(this.adsLoader){
            try{ this.adsLoader.destroy() } catch(e){}
            this.adsLoader = null
        }

        this.elems.block.remove()

        this.removed = true
    }
}

export default Vast3
