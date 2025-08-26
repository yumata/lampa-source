import Manifest from '../core/manifest'
import Utils from '../utils/utils'

function init(){
    if(!window.lampa_settings.disable_features.dmca){
        Lampa.Network.silent(Utils.protocol() + 'tmdb.'+Manifest.cub_domain+'/blocked',(dcma)=>{
            window.lampa_settings.dcma = dcma
        })
    }
}

export default {
    init
}