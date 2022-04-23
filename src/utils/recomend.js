import Storage from './storage'
import Favorite from './favorite'
import TMDB from './api/tmdb'

let data = []

/**
 * Запуск
 */
function init(){
    data = Storage.cache('recomends_scan',300,[])

    Favorite.get({type:'history'}).forEach(elem=>{
        if(['cub','tmdb'].indexOf(elem.source) >= 0){
            let id = data.filter(a=>a.id == elem.id)

            if(!id.length){
                data.push({
                    id: elem.id,
                    tv: elem.number_of_seasons
                })
            }
        }
    })

    Storage.set('recomends_scan',data)

    setInterval(search,120*1000)
}

function search(){
    let ids = data.filter(e=>!e.scan)

    if(ids.length){
        let elem = ids[0]
            elem.scan = 1

        TMDB.get((elem.tv ? 'tv' : 'movie')+'/'+elem.id+'/recommendations',{},(json)=>{
            if(json.results && json.results.length){
                let recomend = Storage.cache('recomends_list', 200, [])
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

    return all.filter(e=>(type == 'tv' ? (e.number_of_seasons || e.first_air_date) : !(e.number_of_seasons || e.first_air_date))).reverse()
}

export default {
    init,
    get
}