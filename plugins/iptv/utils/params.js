import DB from './db'

function fixParams(params_data){
    let params = params_data || {}
    
    Lampa.Arrays.extend(params,{
        update: 'none',
        update_time: Date.now()
    })

    return params
}

class Params{
    static get(id){
        return new Promise((resolve)=>{
            DB.getDataAnyCase('params',id).then((params)=>{
                resolve(fixParams(params))
            })
        })
    }

    static set(id, params){
        return DB.rewriteData('params', id, fixParams(params))
    }

    static value(params, name){
        return Lampa.Lang.translate('iptv_params_' + params[name])
    }
}

export default Params