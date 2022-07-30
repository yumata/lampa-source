import Reguest from '../utils/reguest'
import Favorite from '../utils/favorite'
import Status from '../utils/status'
import Utils from '../utils/math'
import Storage from '../utils/storage'
import Lang from '../utils/lang'

import TMDB from '../utils/api/tmdb'
import OKKO from '../utils/api/okko'
import IVI  from '../utils/api/ivi'
import CUB  from '../utils/api/cub'
import PARSER from '../utils/api/parser'

/**
 * Источники
 */
let sources = {
    ivi: IVI,
    okko: OKKO,
    tmdb: TMDB,
    cub: CUB
}

/**
 * Чтоб не переписали их
 */
Object.defineProperty(sources, 'ivi', { get: ()=> IVI })
Object.defineProperty(sources, 'okko', { get: ()=> OKKO })
Object.defineProperty(sources, 'tmdb', { get: ()=> TMDB })
Object.defineProperty(sources, 'cub', { get: ()=> CUB })

let network = new Reguest()

/**
 * Получить источник
 * @param {{source:string}} params 
 * @returns {class}
 */
function source(params){
    return params.source ? sources[params.source] : sources.tmdb
}

function availableDiscovery(){
    let list = []

    for(let key in sources){
        if(sources[key].discovery) list.push(sources[key].discovery())
    }

    return list
}

/**
 * Главная страница
 * @param {{source:string}} params 
 * @param {function} oncomplite 
 * @param {function} onerror 
 */
function main(params = {}, oncomplite, onerror){
    source(params).main(params, oncomplite, onerror)
}

/**
 * Категория
 * @param {{url:string, source:string}} params 
 * @param {function} oncomplite 
 * @param {function} onerror 
 */
function category(params = {}, oncomplite, onerror){
    source(params).category(params, oncomplite, onerror)
}

/**
 * Просмотр карточки
 * @param {{id:string, source:string, method:string, card:{}}} params 
 * @param {function} oncomplite 
 * @param {function} onerror 
 */
function full(params = {}, oncomplite, onerror){
    source(params).full(params, oncomplite, onerror)
}

/**
 * Главный поиск
 * @param {{query:string}} params 
 * @param {function} oncomplite
 */
function search(params = {}, oncomplite){
    let use_parser = Storage.field('parser_use') && Storage.field('parse_in_search')

    let status = new Status(use_parser ? 3 : 2)
        status.onComplite = oncomplite

    TMDB.search(params, (json)=>{
        if(json.movie) status.append('movie', json.movie)
        if(json.tv) status.append('tv', json.tv)
    }, status.error.bind(status))

    
    if(use_parser){
        PARSER.get({
            search: decodeURIComponent(params.query),
            other: true,
            from_search: true,
            movie: {
                genres: [],
                title: decodeURIComponent(params.query),
                original_title: decodeURIComponent(params.query),
                number_of_seasons: 0
            }
        },(json)=>{
            json.title   = Lang.translate('title_parser')
            json.results = json.Results.slice(0,20)
            json.Results = null

            json.results.forEach((element)=>{
                element.Title = Utils.shortText(element.Title,110)
            })

            status.append('parser', json)
        },status.error.bind(status))
    }
}

/**
 * Что-то старое, надо проверить
 * @param {object} params
 * @param {function} oncomplite 
 */
function menuCategory(params = {}, oncomplite){
    source(params).menuCategory(params, oncomplite)
}

/**
 * Информация об актёре
 * @param {{id:integer, source:string}} params 
 * @param {function} oncomplite 
 * @param {function} onerror 
 */
function person(params = {}, oncomplite, onerror){
    source(params).person(params, oncomplite, onerror)
}

/**
 * Жанры
 * @param {object} params 
 * @param {function} oncomplite 
 * @param {function} onerror 
 */
function genres(params = {}, oncomplite, onerror){
    TMDB.genres(params, oncomplite, onerror)
}

/**
 * Компания
 * @param {{id:integer}} params 
 * @param {function} oncomplite 
 * @param {function} onerror 
 */
function company(params = {}, oncomplite, onerror){
    TMDB.company(params, oncomplite, onerror)
}

/**
 * Полная категори
 * @param {{page:integer, url:string, source:string}} params 
 * @param {function} oncomplite 
 * @param {function} onerror 
 */
function list(params = {}, oncomplite, onerror){
    source(params).list(params, oncomplite, onerror)
}

/**
 * Получить список категорий для каталога в меню
 * @param {{source:string}} params 
 * @param {function} oncomplite 
 */
function menu(params = {}, oncomplite){
    source(params).menu(params, oncomplite)
}

/**
 * Сезоны
 * @param {{id:integer, source:string}} tv 
 * @param {[1,2,3]} from - список сезонов 1,3,4...
 * @param {function} oncomplite 
 */
function seasons(tv, from, oncomplite){
    source(tv).seasons(tv, from, oncomplite)
}

/**
 * Коллекции 
 * @param {object} params 
 * @param {function} oncomplite 
 * @param {function} onerror 
 */
function collections(params, oncomplite, onerror){
    source(params).collections(params, oncomplite, onerror)
}

/**
 * Закладки
 * @param {{page:integer, type:string}} params 
 * @param {function} oncomplite 
 * @param {function} onerror 
 */
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

/**
 * Релизы
 * @param {function} oncomplite 
 * @param {function} onerror 
 */
function relise(oncomplite, onerror){
    network.silent(Utils.protocol() + 'tmdb.cub.watch?sort=releases&results=200',(json)=>{
        json.results.forEach((item)=>{
            item.tmdbID = item.id
        })

        oncomplite(json.results)
    }, onerror)
}

/**
 * Очистить
 */
function clear(){
    for(let i in sources) sources[i].clear()

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
    person,
    favorite,
    seasons,
    screensavers: TMDB.screensavers,
    relise,
    menu,
    collections,
    menuCategory,
    sources,
    availableDiscovery
}