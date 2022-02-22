import Reguest from '../reguest'
import Utils from '../math'
import Storage from '../storage'
import Status from '../status'
import Favorite from '../../utils/favorite'
import Recomends from '../../utils/recomend'
import Arrays from '../../utils/arrays'
import VideoQuality from '../video_quality'

import TMDB from './tmdb'

let baseurl   = Utils.protocol() + 'tmdb.cub.watch/'
let network   = new Reguest()

function url(u, params = {}){
    if(params.genres)  u = add(u, 'genre='+params.genres)
    if(params.page)    u = add(u, 'page='+params.page)
    if(params.query)   u = add(u, 'query='+params.query)

    if(params.filter){
        for(let i in params.filter){
            u = add(u, i+'='+params.filter[i])
        }
    }

    return baseurl + u
}

function add(u, params){
    return u + (/\?/.test(u) ? '&' : '?') + params;
}

function get(method, params = {}, oncomplite, onerror){
    let u = url(method, params)
    
    network.silent(u,(json)=>{
        json.url = method

        oncomplite(json)
    }, onerror)
}

function list(params = {}, oncomplite, onerror){
    let u = url(params.url, params)

    network.silent(u,oncomplite, onerror)
}

function main(params = {}, oncomplite, onerror){
    let status = new Status(11)

    status.onComplite = ()=>{
        let fulldata = []
        let data     = status.data

        for(let i = 1; i <= 11; i++){
            let ipx = 's'+i

            if(data[ipx] && data[ipx].results.length) fulldata.push(data[ipx])
        }

        if(fulldata.length) oncomplite(fulldata)
        else onerror()
    }
    
    let append = function(title, name, json){
        json.title = title

        status.append(name, json)
    }

    get('?sort=now_playing',params,(json)=>{
        append('Сейчас смотрят','s1', json)

        VideoQuality.add(json.results)
    },status.error.bind(status))

    get('?sort=latest',params,(json)=>{
        append('Последнее добавление','s2', json)
    },status.error.bind(status))

    get('movie/now',params,(json)=>{
        append('Фильмы','s3', json)
    },status.error.bind(status))

    get('?sort=now&genre=16',params,(json)=>{
        append('Мультфильмы','s4', json)
    },status.error.bind(status))

    get('tv/now',params,(json)=>{
        append('Сериалы','s5', json)
    },status.error.bind(status))

    get('?sort=now&genre=12',params,(json)=>{
        append('Приключения','s6', json)
    },status.error.bind(status))

    get('?sort=now&genre=35',params,(json)=>{
        append('Комедии','s7', json)
    },status.error.bind(status))

    get('?sort=now&genre=10751',params,(json)=>{
        append('Семейное','s8', json)
    },status.error.bind(status))

    get('?sort=now&genre=27',params,(json)=>{
        append('Ужасы','s9', json)
    },status.error.bind(status))

    get('?sort=now&genre=878',params,(json)=>{
        append('Фантастика','s10', json)
    },status.error.bind(status))

    get('?sort=now&genre=53',params,(json)=>{
        append('Триллер','s11', json)
    },status.error.bind(status))
}

function category(params = {}, oncomplite, onerror){
    let total = 6

    if(params.url !== 'tv') total--

    let show     = ['tv','movie'].indexOf(params.url) > -1
    let books    = show ? Favorite.continues(params.url) : []
    let recomend = show ? Arrays.shuffle(Recomends.get(params.url)).slice(0,19) : []

    let status = new Status(total)

    status.onComplite = ()=>{
        let fulldata = []
        let data     = status.data

        if(books.length)    fulldata.push({results: books,title: params.url == 'tv' ? 'Продолжить просмотр' : 'Вы смотрели'})
        if(recomend.length) fulldata.push({results: recomend,title: 'Рекомендуем посмотреть'})

        for(let i = 1; i <= total+1; i++){
            let ipx = 's'+i

            if(data[ipx] && data[ipx].results.length) fulldata.push(data[ipx])
        }

        if(fulldata.length) oncomplite(fulldata)
        else onerror()
    }
    
    let append = function(title, name, json){
        json.title = title

        status.append(name, json)
    }

    get('?cat='+params.url+'&sort=now_playing',params,(json)=>{
        append('Сейчас смотрят','s1', json)

        if(show) VideoQuality.add(json.results)
    },status.error.bind(status))

    if(params.url == 'tv'){
        get('?cat='+params.url+'&sort=update',params,(json)=>{
            append('Новые серии','s2', json)
        },status.error.bind(status))
    }

    get('?cat='+params.url+'&sort=top',params,(json)=>{
        append('Популярное','s3', json)

        if(show) VideoQuality.add(json.results)
    },status.error.bind(status))

    get('?cat='+params.url+'&sort=latest',params,(json)=>{
        append('Последнее добавление','s4', json)
    },status.error.bind(status))

    get('?cat='+params.url+'&sort=now',params,(json)=>{
        append('Новинки этого года','s5', json)
    },status.error.bind(status))

    get('?cat='+params.url+'&sort=latest&vote=7',params,(json)=>{
        append('С высоким рейтингом','s6', json)
    },status.error.bind(status))
}

function full(params, oncomplite, onerror){
    let status = new Status(params.method == 'tv' ? 6 : 5)
        status.onComplite = oncomplite

    get('3/'+params.method+'/'+params.id+'?api_key=4ef0d7355d9ffb5151e987764708ce96&language='+Storage.field('tmdb_lang'),params,(json)=>{
        json.source = 'tmdb'
        
        status.append('movie', json)

        if(params.method == 'tv'){
            TMDB.get('tv/'+json.id+'/season/'+json.number_of_seasons,{},(ep)=>{
                status.append('episodes', ep)
            },status.error.bind(status))
        }
    },status.error.bind(status))

    TMDB.get(params.method+'/'+params.id+'/credits',params,(json)=>{
        status.append('persons', json)
    },status.error.bind(status))

    TMDB.get(params.method+'/'+params.id+'/recommendations',params,(json)=>{
        status.append('recomend', json)
    },status.error.bind(status))

    TMDB.get(params.method+'/'+params.id+'/similar',params,(json)=>{
        status.append('simular', json)
    },status.error.bind(status))

    TMDB.get(params.method+'/'+params.id+'/videos',params,(json)=>{
        status.append('videos', json)
    },status.error.bind(status))
}

function person(params, oncomplite, onerror){
    TMDB.person(params, oncomplite, onerror)
}

function menu(params, oncomplite){
    TMDB.menu(params, oncomplite)
}

function seasons(tv, from, oncomplite){
    TMDB.seasons(tv, from, oncomplite)
}

function clear(){
    network.clear()
}

export default {
    main,
    menu,
    full,
    list,
    category,
    clear,
    person,
    seasons
}
