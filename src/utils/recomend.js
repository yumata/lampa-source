import Utils from './math'
import Storage from './storage'
import Settings from '../components/settings'
import Reguest from './reguest'
import Select from '../interaction/select'
import Noty from '../interaction/noty'
import Controller from '../interaction/controller'
import Favorite from './favorite'
import Arrays from './arrays'
import TMDB from './api/tmdb'

let data = []

/**
 * Запуск
 */
function init(){
    data = Storage.get('recomends_while','[]')

    Favorite.get({type:'history'}).forEach(elem=>{
        let id = data.filter(a=>a.id == elem.id && ['cub','tmdb'].indexOf(a.source) >= 0)

        if(!id.length){
            data.push({
                id: elem.id,
                tv: elem.number_of_seasons
            })
        }
    })

    Storage.set('recomends_while',data)

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

    Storage.set('recomends_while',data)
}

function get(type){
    let all = Storage.get('recomends_list','[]')

    return all.filter(e=>(type == 'tv' ? (e.number_of_seasons || e.first_air_date) : !(e.number_of_seasons || e.first_air_date))).reverse()
}

export default {
    init,
    get
}