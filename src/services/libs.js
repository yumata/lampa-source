import Utils from '../utils/utils'
import Manifest from '../core/manifest'

/**
 * Инициализация дополнительных библиотек
 * @returns {void}
 */
function init(){
    let video_libs = ['hls/hls.js', 'dash/dash.js']

    video_libs = video_libs.map(lib=>{
        return window.location.protocol == 'file:' ? Manifest.github_lampa + 'vender/' + lib : './vender/' + lib
    })

    Utils.putScript(video_libs,()=>{})

    if(window.youtube_lazy_load) Utils.putScript([Utils.protocol() + 'youtube.com/iframe_api'],()=>{})

    Utils.putScript([Manifest.github_lampa + 'vender/qrcode/qrcode.js'],()=>{})
    
    if(!window.lampa_settings.iptv){
        Utils.putScript([
            Utils.protocol() + Manifest.cub_domain + '/plugin/sport',
        ],()=>{})
    }
}

export default {
    init
}