import Reguest from '../../utils/reguest'
import Favorite from '../favorite'
import Utils from '../../utils/utils'
import Progress from '../../utils/progress'
import Arrays from '../../utils/arrays'
import Storage from '../storage/storage'
import TMDB from './sources/tmdb'
import CUB  from './sources/cub'
import Manifest from '../manifest'
import Account from '../account/account'
import LineModule from '../../interaction/items/line/module/module'

/**
 * Источники
 */
let sources = {
    tmdb: TMDB,
    cub: CUB
}

/**
 * Чтоб не переписали их
 */
Object.defineProperty(sources, 'tmdb', { get: ()=> TMDB })
Object.defineProperty(sources, 'cub', { get: ()=> CUB })

let network = new Reguest()

/**
 * Получить источник
 * @param {{source:string}} params 
 * @returns {class}
 */
function source(params){
    return params.source && sources[params.source] ? sources[params.source] : sources.tmdb
}

function availableDiscovery(){
    let list   = []
    let active = Storage.get('source','tmdb')

    for(let key in sources){
        console.log('Api','discovery check:',key, sources[key].discovery ? true : false, typeof sources[key].discovery)

        if(sources[key].discovery) {
            if (key === active) list.splice(0, 0, sources[key].discovery())
            else list.push(sources[key].discovery())
        }
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
    return source(params).main(params, oncomplite, onerror)
}

/**
 * Категория
 * @param {{url:string, source:string}} params 
 * @param {function} oncomplite 
 * @param {function} onerror 
 */
function category(params = {}, oncomplite, onerror){
    return source(params).category(params, oncomplite, onerror)
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
    TMDB.search(params, (json)=>{
        let result = {
            movie: json.find(a=>a.type == 'movie'),
            tv: json.find(a=>a.type == 'tv')
        }

        oncomplite(result)
    }, ()=>{
        oncomplite({})
    })
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
 * Информация об персоне
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

    if(params.filter){
        data.results = data.results.filter(a=>{
            return params.filter == 'tv' ? a.name : !a.name
        })
    }

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
function relise(params, oncomplite, onerror){
    network.silent(Utils.protocol() + 'tmdb.'+Manifest.cub_domain+'?sort=releases&results=20&page='+params.page,(data)=>{
        oncomplite(Utils.addSource(data, 'cub'))
    }, onerror)
}

function partPersons(parts, parts_limit, type, shift = 0){
    if(shift == 0) shift = parts.length
    
    return (call)=>{
        if(['movie','tv'].indexOf(type) == -1) return call()

        TMDB.get('person/popular',{},(json)=>{
            call()

            json.results.sort((a,b)=>a.popularity - b.popularity)

            let filtred = json.results.filter(p=>p.known_for_department && p.known_for)

            let persons = filtred.filter(p=>(p.known_for_department || '').toLowerCase() == 'acting' && p.known_for.length).slice(0,10)

            persons.forEach((person_data,index)=>{
                let event = (call_inner)=>{
                    person({only_credits: type, id: person_data.id},(result)=>{
                        if(!result.credits) return call_inner()

                        let items = (result.credits[type] || []).filter(m=>m.backdrop_path && m.vote_count > 20)

                        if(type == 'tv') items = items.filter(m=>!(m.genre_ids.indexOf(10767) >= 0 || m.genre_ids.indexOf(10763) >= 0))

                        items.sort((a,b)=>{
                            let da = a.release_date || a.first_air_date
                            let db = b.release_date || b.first_air_date

                            if(db > da) return 1
                            else if(db < da) return -1
                            else return 0
                        })

                        let src  = person_data.profile_path ? TMDB.img(person_data.profile_path,'w90_and_h90_face') : person_data.img || './img/actor.svg'

                        call_inner({
                            title: person_data.name,
                            icon_img: src,
                            results: items.length > 5 ? items.slice(0,20) : [],
                            params: {
                                module: LineModule.toggle(LineModule.MASK.base, 'Icon', 'More')
                            }
                        })
                    })
                }

                parts.push(event)

                Arrays.shuffleArrayFromIndex(parts, shift)
            })
        },call, {life: 60 * 24 * 3})
    }
}

function partNext(parts, parts_limit, partLoaded, partEmpty){
    let pieces = parts.filter(p=>typeof p == 'function').slice(0,0 + parts_limit)

    if(pieces.length){
        let progress = new Progress()

        progress.append(pieces)

        progress.start((result)=>{
            let data = result.filter(r=>r && r.results && r.results.length)

            for(let i = 0; i < pieces.length; i++){
                parts[parts.indexOf(pieces[i])] = false
            }

            if(data.length){
                if(data.length < 3){
                    partNext(parts, parts_limit, (more_data)=>{
                        data = data.concat(more_data)

                        partLoaded(data)
                    }, ()=>{
                        partLoaded(data)
                    })
                }
                else partLoaded(data)
            }
            else partNext(parts, parts_limit, partLoaded, partEmpty)
        })
    }
    else partEmpty()
}

/**
 * Очистить
 */
function clear(){
    for(let i in sources) sources[i].clear()

    network.clear()
}

function img(){
    return TMDB.img.apply(TMDB, arguments)
}

export default {
    main,
    img,
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
    availableDiscovery,
    partPersons,
    partNext
}