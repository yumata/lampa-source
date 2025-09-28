import Utils from '../math'
import Manifest from '../manifest'
import VPN from '../vpn'

function init(){
    let video_libs = ['hls/hls.js', 'dash/dash.js']

    video_libs = video_libs.map(lib=>{
        return window.location.protocol == 'file:' ? Manifest.github_lampa + 'vender/' + lib : './vender/' + lib
    })

    Utils.putScript(video_libs,()=>{})

    if(window.youtube_lazy_load) Utils.putScript([Utils.protocol() + 'youtube.com/iframe_api'],()=>{})
    
    if(!window.lampa_settings.iptv){
        Utils.putScript([
            Utils.protocol() + Manifest.cub_domain + '/plugin/sport',
        ],()=>{})
    }

    VPN.region(code=>{
        if(code == 'ru'){
            Utils.putScript([
                Utils.protocol() + 'plugin.rootu.top/rutube.js',
            ],()=>{})
        }
    })
}

export default {
    init
}