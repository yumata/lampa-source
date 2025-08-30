import Lang from '../../lang'
import Api from '../../account/api'


function facts(card_id, card_type, callback, error){
    Api.load('ai/generate/facts/' + card_id + '/' + card_type).then(callback).catch(error)
}

function recommendations(card_id, card_type, callback, error){
    Api.load('ai/generate/recommend/' + card_id + '/' + card_type).then(callback).catch(error)
}

function search(query, callback, error){
    Api.load('ai/search/' + encodeURIComponent(query)).then(callback).catch(error)
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
            Api.clear()
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
