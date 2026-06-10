import Subscribe from '../../../utils/subscribe'
import Template from '../../template'
import Controller from '../../../core/controller'
import Lang from '../../../core/lang'
import Storage from '../../../core/storage/storage'
import IMA from '../ima'

let last_responce = {}

function stat(method, name){
    IMA.metric('new_preroll', method, name)
}

window.adv_logs_responce_event = (e)=>{
    last_responce = {
        status: e.status,
        text: e.text,
    }

    console.log('Ad', 'logs responce', last_responce)
}

/**
 * Извлекает skipoffset из VAST XML и возвращает в секундах
 * @param {string} vastXml - XML строка VAST
 * @param {number} [duration] - продолжительность рекламы в секундах (нужно, если skipoffset в процентах)
 * @returns {number|null} - время пропуска в секундах или null
 */
function getSkipOffsetSeconds(vastXml, duration = 0) {
    if(!vastXml) return null
    
    // Находим атрибут skipoffset="..."
    let match = vastXml.match(/skipoffset\s*=\s*["']([^"']+)["']/i);
    if (!match) return null;

    let value = match[1].trim();

    // Если формат HH:MM:SS
    if (/^\d{2}:\d{2}:\d{2}$/.test(value)) {
        let [h, m, s] = value.split(':').map(Number);
        return h * 3600 + m * 60 + s;
    }

    // Если формат процентов, например "25%"
    if (/^\d+%$/.test(value)) {
        let percent = parseInt(value);
        if (duration > 0) {
            return Math.round((duration * percent) / 100);
        }
        return null; // нельзя посчитать без duration
    }

    // Неизвестный формат
    return null;
}

class Vast{
    constructor(preroll){
        this.listener   = Subscribe()
        this.paused     = false
        this.preroll    = preroll
        this.elems      = {}
        this.tiks       = {}
        this.skip_time  = 15
        this.skip_ready = false
        this.timewait   = 10 * 1000
        this.created_at = Date.now()

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
        this.elems.progressbar = this.elems.block.find('.ad-video-block__progress-fill')
        this.elems.loader      = this.elems.block.find('.ad-video-block__loader')
        this.elems.container   = this.elems.block.find('.ad-video-block__vast')
        this.elems.status      = Template.elem('div', {class: 'ad-video-block__status'})

        this.elems.block.find('video').remove()
        this.elems.block.append(this.elems.status)

        this.elems.container.style.opacity = 0
        this.elems.status.style.position   = 'absolute'
        this.elems.status.style.top        = '1em'
        this.elems.status.style.left       = '1em'
        this.elems.status.style.textShadow = '0 0 5px black'
        this.elems.status.style.fontSize   = '0.9em'

        this.elems.block.find('.ad-video-block__text').text(Lang.translate('ad')  + ' - ' + Lang.translate('ad_disable')).toggleClass('hide',Boolean(this.preroll.msg))
        this.elems.block.find('.ad-video-block__info').text('')

        if(this.preroll.msg) this.elems.block.find('.ad-video-block__text').text(this.preroll.msg + ' - ' + Lang.translate('ad_disable')).toggleClass('hide', false)

        this.elems.block.on('click', this.skip.bind(this))

        document.body.append(this.elems.block)
        
        this.listener.send('launch')
        
        this.controller()

        this.timeout()

        console.log('Ad', 'run', this.preroll.name, 'from', this.preroll.name == 'plugin' ? 'plugin' : 'cub')

        this.elems.status.text('Initialize...')

        try{
            this.initialize()

            stat('run', this.preroll.name)
        }
        catch(e){
            this.error(400,'Initialize', e ? e.message : '')
        }
    }

    /**
     * Контроллер рекламы
     */
    controller(){
        Controller.add('ad_video_block',{
            toggle: ()=>{
                Controller.clear()
            },
            enter: this.skip.bind(this),
            back: this.skip.bind(this)
        })

        Controller.toggle('ad_video_block')
    }

    /**
     * Ждем загрузки определенное время
     * после выдаем ошибку
     */
    timeout(){
        this.tiks.timeout = setTimeout(()=>{
            this.error(300, 'Timeout')
        }, this.timewait)
    }

    /**
     * Инициализация плеера
     */
    initialize(){
        this.player = new VASTPlayer(this.elems.container)

        this.player.load(this.url()).then(()=> {
            this.elems.status.text('Loaded')

            if(this.removed) return this.player.stopAd()
            else{
                this.listeners()

                return this.player.startAd()
            }
        }).catch((reason)=> {
            this.elems.status.text('Load error')

            if(!this.removed) this.error(100, reason.message)
        })
    }

    /**
     * Слушатели плеера
     */
    listeners(){
        this.player.on('AdPaused', ()=> {
            console.log('Ad','event','pause')

            this.paused = true
        })

        this.player.on('AdPlaying', ()=> {
            console.log('Ad','event','play')

            this.paused = false
        })

        this.player.on('AdVideoStart', ()=> {
            console.log('Ad','event','video start')

            let video = this.player.container.find('video')

            if(video){
                video.addEventListener('pause', ()=> {
                    if(this.removed) return

                    console.log('Ad','event','pause')

                    this.paused = true
                })
            } 
        })
        
        this.player.once('AdStarted', this.onStarted.bind(this))
        this.player.once('AdStopped', this.onStoped.bind(this))
    }

    /**
     * Реклама запущена
     */
    onStarted(){
        console.log('Ad','event','started')

        this.elems.status.text('Started: ' + (this.player.adDuration ? Math.round(this.player.adDuration) + 's' : ''))

        stat('started', this.preroll.name)

        clearTimeout(this.tiks.timeout)

        this.elems.loader.remove()

        this.elems.container.style.opacity = 1

        let duration = this.player.adDuration || this.skip_time

        clearInterval(this.tiks.progress)
        clearTimeout(this.tiks.watch)

        let creative_skip = getSkipOffsetSeconds(last_responce.text, duration)
            creative_skip = creative_skip !== null ? creative_skip : duration * 0.8

        console.log('Ad','creative skip offset:', creative_skip)

        this.started_time = Date.now()
        this.skip_time    = Math.round(Math.max(this.skip_time, Math.min(60,creative_skip)))

        console.log('Ad','skip time set to:', this.skip_time)

        this.tiks.progress = setInterval(this.onProgress.bind(this), 100)
        this.tiks.watch    = setTimeout(()=>{
            this.elems.status.text('Watch timeout: ' + duration + 's')

            console.log('Ad','error','watch timeout', duration)

            this.stop()

            this.onEnd()
        }, Math.round((duration + 5) * 1000))
        
        this.player.adVolume = 0.5
    }

    /**
     * Событие окончания рекламы
     */
    onEnd(){
        console.log('Ad', 'complete')

        stat('complete', this.preroll.name)

        this.listener.send('ended')
    }

    /**
     * Реклама закончена
     */
    onStoped(){
        console.log('Ad', 'stoped')

        this.destroy()

        this.onEnd()
    }

    /**
     * Обновление прогресса
     */
    onProgress(){
        let duration  = this.player.adDuration || this.skip_time
        let remaining = duration - ((Date.now() - this.started_time) / 1000)
        let progress  = Math.min(100, (1 - remaining / duration) * 100)
        let elapsed   = duration - remaining

        this.elems.progressbar.style.width = progress + '%'

        this.skip_ready = elapsed > this.skip_time
        
        let user_view = Math.max(0, duration > this.skip_time ? this.skip_time - elapsed : remaining)

        this.elems.skip.find('span').text(Lang.translate(this.skip_ready ? 'ad_skip' : Math.ceil(user_view)))

        if(remaining <= 0) clearInterval(this.tiks.progress)
    }

    /**
     * Сформировать URL для запроса рекламы
     */
    url(){
        return IMA.buildUrl(this.preroll.url)
    }
    /**
     * Обработка ошибки
     */
    error(code, msg){
        console.log('Ad','error', code, msg)

        this.stop()

        this.listener.send('error')

        stat('error', this.preroll.name)
        stat('error_' + code, this.preroll.name)
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
            this.player._events = {}

            this.player.stopAd().then(this.destroy.bind(this)).catch(this.destroy.bind(this))
        }
        catch(e){
            console.error('Ad','stop error', e ? e.message : '')

            this.destroy()
        }
    }

    /**
     * Уничтожить
     */
    destroy(){
        if(this.removed) return

        if(this.player) this.player._events = {}

        clearTimeout(this.tiks.timeout)
        clearTimeout(this.tiks.watch)
        clearInterval(this.tiks.progress)
        
        this.elems.block.remove()

        this.removed = true
    }
}

export default Vast