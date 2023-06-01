import DB from './db'
import Utils from './utils'

function fixParams(params_data){
    let params = params_data || {}
    
    Lampa.Arrays.extend(params,{
        update: 'none',
        update_time: Date.now(),
        loading: 'cub'
    })

    return params
}

class Params{
    static get(id){
        return new Promise((resolve)=>{
            if(Utils.canUseDB()){
                DB.getDataAnyCase('params',id).then((params)=>{
                    resolve(fixParams(params))
                })
            }
            else{
                resolve(fixParams(Lampa.Storage.get('iptv_playlist_params_'+id,'{}')))
            }
        })
    }

    static set(id, params){
        if(Utils.canUseDB()){
            return DB.rewriteData('params', id, fixParams(params))
        }
        else{
            return new Promise((resolve)=>{
                Lampa.Storage.set('iptv_playlist_params_'+id, fixParams(params))
                
                resolve()
            })
        }
    }

    static value(params, name){
        return Lampa.Lang.translate('iptv_params_' + params[name])
    }
}

export default Params