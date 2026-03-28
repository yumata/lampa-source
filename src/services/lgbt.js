import Manifest from '../core/manifest'
import Utils from '../utils/utils'
import Cache from '../utils/cache'
import VPN from '../core/vpn'
import Arrays from '../utils/arrays'

/**
 * Инициализация DMCA, блокировка карточек к показу по требованию правообладателей
 * @returns {void}
 */
function init(){
    if(!window.lampa_settings.disable_features.lgbt){
        Cache.getData('other', 'lgbt', 60 * 24 * 10).then((result)=>{
            if(result && Arrays.isObject(result)) window.lampa_settings.lgbt = result
            else{
                Lampa.Network.silent(Utils.protocol() + 'tmdb.'+Manifest.cub_domain+'/lgbt.json',(lgbt)=>{
                    let map = {}

                    lgbt.forEach(item=>{
                        map[item.id + '_' + item.type] = true
                    })

                    window.lampa_settings.lgbt = map

                    Cache.rewriteData('other', 'lgbt', map).catch((e)=>{})
                })
            }
        }).catch(e=>{})

        if(!VPN.is(['ru', 'by'])){
            Lampa.SettingsApi.addParam({
                component: 'more',
                param: {
                    name: 'lgbt_content_block',
                    type: 'trigger',
                    default: false
                },
                field: {
                    name: Lampa.Lang.translate('settings_lgbt_content_block'),
                }
            })
        }
    }
}

export default {
    init
}