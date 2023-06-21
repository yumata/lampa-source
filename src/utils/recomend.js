import Storage from './storage'
import Favorite from './favorite'
import TMDB from './api/tmdb'

let data = []

/**
 * Запуск
 */
function init(){
    data = Storage.cache('recomends_scan',300,[])

    setInterval(()=>{
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
    },120*1000)
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
                    if(!recomend.filter(r=>r.id == e.id).length && !favorite.filter(h=>h.id == e.id).length){
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

    Storage.set('recomends_scan',data)
}

function get(type){
    let all = Storage.get('recomends_list','[]')
    let items = all.filter(e=>(type == 'tv' ? (e.number_of_seasons || e.first_air_date) : !(e.number_of_seasons || e.first_air_date))).reverse()

    items.forEach(item=>{
        item.ready = false
    })

    return items
}

export default {
    init,
    get
}