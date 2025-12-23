import Utils from '../utils/utils'
import Manifest from '../core/manifest'

/**
 * Инициализация дополнительных библиотек
 * @returns {void}
 */
function init(){
    let include = []

    // Видео библиотеки
    include = include.concat(['hls/hls.js', 'dash/dash.js', 'qrcode/qrcode.js'].map(lib=>{
        return window.location.protocol == 'file:' ? Manifest.github_lampa + 'vender/' + lib : './vender/' + lib
    }))

    // YouTube IFrame API
    if(window.youtube_lazy_load && window.lampa_settings.youtube){
        include.push(Utils.protocol() + 'youtube.com/iframe_api')
    }

    // Плагины различные
    if(!window.lampa_settings.iptv && window.lampa_settings.services){
        include.push(Utils.protocol() + Manifest.cub_domain + '/plugin/sport')
        include.push(Utils.protocol() + Manifest.cub_domain + '/plugin/tsarea')
    }

    Utils.putScriptAsync(include,()=>{})
}

export default {
    init
}