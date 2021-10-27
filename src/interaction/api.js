import Reguest from '../utils/reguest'
import Utils from '../utils/math'
import Arrays from '../utils/arrays'
import Storage from '../utils/storage'
import Favorite from '../utils/favorite'

import TMDB from '../utils/api/tmdb'
import OKKO from '../utils/api/okko'
import IVI  from '../utils/api/ivi'

let sources = {
    ivi: IVI,
    okko: OKKO,
    tmdb: TMDB
}

let network = new Reguest()

function source(params){
    return params.source ? sources[params.source] : sources.tmdb
}

function main(params = {}, oncomplite, onerror){
    source(params).main(params, oncomplite, onerror)
}

function category(params = {}, oncomplite, onerror){
    source(params).category(params, oncomplite, onerror)
}

function full(params = {}, oncomplite, onerror){
    source(params).full(params, oncomplite, onerror)
}

function search(params = {}, oncomplite, onerror){
    TMDB.search(params, oncomplite, onerror)
}

function actor(params = {}, oncomplite, onerror){
    source(params).actor(params, oncomplite, onerror)
}

function genres(params = {}, oncomplite, onerror){
    TMDB.genres(params, oncomplite, onerror)
}

function company(params = {}, oncomplite, onerror){
    TMDB.company(params, oncomplite, onerror)
}

function list(params = {}, oncomplite, onerror){
    source(params).list(params, oncomplite, onerror)
}

function menu(params = {}, oncomplite){
    source(params).menu(params, oncomplite)
}

function seasons(tv, from, oncomplite){
    source(tv).seasons(tv, from, oncomplite)
}

function collections(params, oncomplite, onerror){
    source(params).collections(params, oncomplite, onerror)
}

function favorite(params = {}, oncomplite, onerror){
    let data = {}

    data.results = Favorite.get(params)

    data.total_pages = Math.ceil(data.results.length / 20)
    data.page = Math.min(params.page, data.total_pages)

    let offset = data.page - 1

    data.results = data.results.slice(20 * offset,20 * offset + 20)

    if(data.results.length) oncomplite(data)
    else onerror()
}

function relise(oncomplite, onerror){
    network.native('https://kinotrend.neocities.org/data.json',(json)=>{
        let items = []

        if(json.movies){
            json.movies.forEach(element => {
                items.push({
                    id: element.filmID,
                    title: element.nameRU,
                    original_title: element.nameOriginal,
                    release_date: element.premierDate,
                    poster: element.posterURL,
                    vote_average: element.ratingFloat
                })
            })
        }

        oncomplite(items)
    }, onerror)
}



function clear(){
    TMDB.clear()
    OKKO.clear()
    IVI.clear()

    network.clear()
}

export default {
    main,
    img: TMDB.img,
    full,
    list,
    genres,
    category,
    search,
    clear,
    company,
    actor,
    favorite,
    seasons: seasons,
    screensavers: TMDB.screensavers,
    relise,
    menu,
    collections
}