import Reguest from '../../../utils/reguest'
import Utils from '../../../utils/utils'
import Storage from '../../storage/storage'
import Manifest from '../../manifest'
import Lang from '../../lang'


let network = new Reguest()

function api(){
    return Utils.protocol() + Manifest.cub_domain + '/api/'
}

function account(){
    return new Promise((resolve, reject)=>{
        let account = Storage.get('account','{}')

        if(account.token){
            resolve(account)
        }
        else{
            reject({status: 345})
        }
    })
}

function facts(card_id, card_type, callback, error){
    account().then((acc)=>{
        network.silent(api() + 'ai/generate/facts/' + card_id + '/' + card_type, callback, error, false, {
            headers: {
                token: acc.token,
                profile: acc.profile.id
            }
        })
    }).catch(error)
}

function recommendations(card_id, card_type, callback, error){
    account().then((acc)=>{
        network.silent(api() + 'ai/generate/recommend/' + card_id + '/' + card_type, callback, error, false, {
            headers: {
                token: acc.token,
                profile: acc.profile.id
            }
        })
    }).catch(error)
}

function search(query, callback, error){
    account().then((acc)=>{
        network.silent(api() + 'ai/search/' + encodeURIComponent(query), callback, error, false, {
            headers: {
                token: acc.token,
                profile: acc.profile.id
            }
        })
    }).catch(error)
}

function discovery(){
    let source = {
        title: Lang.translate('title_ai_assistant'),
        search: (params, oncomplite)=>{
            source.params.nofound = Lang.translate('search_nofound')

            search(decodeURIComponent(params.query),(json)=>{
                json.title = Lang.translate('title_ai_assistant')
                json.results.forEach(element => {
                    element.source = 'cub'
                })

                oncomplite(json.results.length ? [json] : [])
            },(e)=>{
                if(e.decode_code == 600) source.params.nofound = Lang.translate('ai_search_limit')

                oncomplite([])
            })
        },
        onCancel: ()=>{
            network.clear()
        },
        params: {
            lazy: true,
            align_left: true,
            start_typing: Lang.translate('ai_search_start_typing')
        }
    }

    return source
}

export default {
    facts,
    recommendations,
    discovery
}
