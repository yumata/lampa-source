import Lang from '../../core/lang'
import VPN from '../../core/vpn'
import Controller from '../../core/controller'
import Vast2 from './preroll/v2'
import Vast3 from './preroll/v3'
import Platform from '../../core/platform'
import Background from '../background'
import VastManager from './vast_manager'
import IMA from './ima'

let running     = 0
let player_data = {}

let Manager = new VastManager({
    api: 'preroll',
    cooling: 1000 * 60 * 5
})

function init(){
    Manager.init()
}

/**
 * Показать преролл
 * @param {Object} preroll - данные для показа рекламы
 * @param {Number} num - номер показа рекламы (для повторов)
 * @param {Function} started - вызывается при запуске рекламы
 * @param {Function} ended - вызывается при окончании рекламы
 * @return {void}
 */
function video(preroll, num, started, ended){
    console.log('Ad', 'preroll launch')

    let advert = preroll.vast_api == 3 ? new Vast3(preroll) : new Vast2(preroll)
    let next   = () => {
        let any = getAnyPreroll()

        any ? video(any, num + 1, started, ended) : ended()
    }

    advert.listener.follow('launch', started)

    advert.listener.follow('ended', ()=>{
        num < 2 ? next() : ended()
    })

    advert.listener.follow('error', ()=>{
        Date.now() - running < 15000 && num < 4 ? next() : ended()
    })
}

/**
 * Показать заставку (реклама)
 * @param {Object} preroll - данные для показа рекламы
 * @param {Function} call - вызывается при окончании рекламы
 * @return {void}
 */
function launch(preroll, call){
    let enabled = Controller.enabled().name

    Background.theme('#454545')

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

            Background.theme('black')

            video(preroll, 1, ()=>{}, ()=>{
                html.remove()

                Background.theme('reset')

                Controller.toggle(enabled)

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

/**
 * Получить данные для плагина
 * @param {Object} data - данные плеера
 * @return {Object|Boolean} данные для плагина или false, если не показывать
 */
function getVastPlugin(data){
    let show = true

    if(data.vast_region && typeof data.vast_region == 'string' && data.vast_region.split(',').indexOf(data.ad_region) == -1) show = false
    if(data.vast_platform && typeof data.vast_platform == 'string' && data.vast_platform.split(',').indexOf(Platform.get()) == -1) show = false
    if(data.vast_screen && typeof data.vast_screen == 'string' && data.vast_screen.split(',').indexOf(Platform.screen('tv') ? 'tv' : 'mobile') == -1) show = false

    if(data.vast_url && typeof data.vast_url == 'string' && show) return {
        url: data.vast_url,
        name: 'plugin',
        msg: data.vast_msg || Lang.translate('ad_plugin')
    }

    return false
}

/**
 * Получить данные для показа рекламы (преролл или плагин)
 * @param {Boolean} first_run - первый запуск (для сброса кулинга)
 * @return {Object|Boolean} данные для показа рекламы или false, если не показывать
 */
function getAnyPreroll(first_run = false){
    let manager = Manager.get(player_data, first_run)
    let plugin  = getVastPlugin(player_data)

    return Manager.coolingReady() ? manager || plugin : false
}

/**
 * Показать рекламу (преролл или плагин)
 * @param {Object} data - данные плеера
 * @param {Function} call - вызывается при окончании рекламы
 * @return {void}
 */
function show(data, call){
    player_data = data

    // Пометить регион для таргетинга рекламы
    player_data.ad_region = VPN.code()

    // Не показывать рекламу для iptv/torrent/youtube/continue
    let type = IMA.getMediaType(data)

    if(type.any){
        console.log('Ad', 'preroll skipped, no vast api or iptv/torrent/youtube/continue', type)

        return call()
    }

    // Бывает что плеер по несколько раз запускается, 
    // проверяем чтобы реклама не запускалась несколько раз подряд
    if(running) return console.log('Ad', 'preroll skipped, already running')
    
    // Помечаем время запуска рекламы
    running = Date.now()

    let ended = ()=>{
        running = 0

        Manager.markCooling()

        console.log('Ad', 'preroll ended')

        call()
    }

    // Получаем данные для показа рекламы (преролл или плагин)
    let preroll = getAnyPreroll(true)

    if(preroll && IMA.canShow(data)){
        // Загружаем SDK для выбранного преролла, чтобы он был готов к показу
        IMA.loadSDK(preroll.vast_api).catch(()=>{
            console.log('Ad', 'IMA SDK load error', preroll.vast_api)
        })

        launch(preroll, ended)
    }
    else ended()
}


export default {
    init,
    show
}