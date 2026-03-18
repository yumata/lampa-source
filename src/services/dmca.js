import Manifest from '../core/manifest'
import Utils from '../utils/utils'
import Cache from '../utils/cache'

/**
 * Инициализация DMCA, блокировка карточек к показу по требованию правообладателей
 * @returns {void}
 */
function init(){
    if(!window.lampa_settings.disable_features.dmca){
        Cache.getData('other', 'dcma', 60 * 24 * 10).then((result)=>{
            if(result) window.lampa_settings.dcma = result
            else{
                Lampa.Network.silent(Utils.protocol() + 'tmdb.'+Manifest.cub_domain+'/blocked',(dcma)=>{
                    window.lampa_settings.dcma = dcma

                    Cache.rewriteData('other', 'dcma', dcma).catch((e)=>{})
                })
            }
        }).catch(e=>{})
    }
}

export default {
    init
}