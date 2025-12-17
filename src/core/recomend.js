import Storage from './storage/storage'
import Favorite from './favorite'
import TMDB from './api/sources/tmdb'
import ContentRows from './content_rows'
import Lang from './lang'
import Arrays from '../utils/arrays'
import Router from './router'
import Timer from './timer'

let data = []

/**
 * Запуск
 */
function init(){
    data = Storage.cache('recomends_scan',300,[])

    Timer.add(120*1000, ()=>{
        let history = Favorite.get({type:'history'})
        let added   = 0

        console.log('Recomendations', 'find history:', history.length)

        history.forEach(elem=>{
            if(['cub','tmdb'].indexOf(elem.source) >= 0){
                let id = data.filter(a=>a.id == elem.id)
    
                if(!id.length){
                    data.push({
                        id: elem.id,
                        tv: elem.number_of_seasons || elem.seasons
                    })

                    added++
                }
            }
        })

        console.log('Recomendations', 'added to scan:', added, 'ready:', data.length)

        Storage.set('recomends_scan',data)

        search()
    })

    ContentRows.add({
        name: 'recomend_watch',
        title: Lang.translate('title_recomend_watch'),
        index: 1,
        screen: ['main', 'category'],
        call: (params, screen)=>{
            if(params.url == 'anime') return

            let media   = screen == 'main' ? 'movie' : params.url
            let all     = get(media)
            let results = Arrays.shuffle(all).slice(0,20)
            let total_pages = Math.ceil(all.length / 20)

            if(!results.length) return

            return function(call){
                call({
                    results,
                    title: Lang.translate('title_recomend_watch'),
                    total_pages,
                    page: 1,
                    params: {
                        emit: {
                            onlyMore: ()=>{
                                Router.call('recomend', {media, total_pages})
                            }
                        }
                    }
                })
            }
        }
    })
}

function search(){
    let ids = data.filter(e=>!e.scan)

    if(ids.length){
        let elem = ids[0]
            elem.scan = 1

        console.log('Recomendations', 'scan:', elem.id, elem.title || elem.name)

        TMDB.get((elem.tv ? 'tv' : 'movie')+'/'+elem.id+'/recommendations',{},(json)=>{
            console.log('Recomendations', 'result:', json.results && json.results.length ? json.results.length : 0)

            if(json.results && json.results.length){
                let recomend = Storage.cache('recomends_list', 100, [])
                let favorite = Favorite.get({type:'history'})

                json.results.forEach(e=>{
                    let year = (e.first_air_date || e.release_date || '0000').split('-')

                    if(!recomend.filter(r=>r.id == e.id).length && !favorite.filter(h=>h.id == e.id).length && year[0] > (new Date().getFullYear() - 20)){
                        recomend.push(e)
                    }
                })

                Storage.set('recomends_list', recomend)
            }
        })
    }
    else{
        data.forEach(a=>a.scan = 0)
    }

    Storage.set('recomends_scan', data)
}

function get(type){
    let all     = Storage.get('recomends_list','[]')
    let items   = all.filter(e=>(type == 'tv' ? (e.number_of_seasons || e.first_air_date) : !(e.number_of_seasons || e.first_air_date))).reverse()
    let history = Favorite.get({type:'history'})

    items = items.filter(e=>!history.find(h=>h.id == e.id))

    return items
}

function page(object, call, empty){
    let all     = get(object.media)
    let page    = object.page || 1
    let result  = all.slice((page - 1) * 20, page * 20)

    if(result.length == 0) return empty({status: 404})

    call({
        results: result,
        title: Lang.translate('title_recomend_watch'),
        total_pages: Math.ceil(all.length / 20),
        page: page
    })
}

export default {
    init,
    get,
    page
}