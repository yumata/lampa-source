import Reguest from '../utils/reguest'
import Favorite from '../utils/favorite'
import Utils from '../utils/math'

let baseurl = Utils.protocol() + 'api.themoviedb.org/3/'
let baseimg = Utils.protocol() + 'image.tmdb.org/t/p/w300/'
let network = new Reguest()
let key     = '4ef0d7355d9ffb5151e987764708ce96'
let lang    = 'ru'

function url(u, params = {}){
    u = add(u, 'api_key='+key)
    u = add(u, 'language='+lang)

    if(params.genres) u = add(u, 'with_genres='+params.genres)
    if(params.page)   u = add(u, 'page='+params.page)
    if(params.query)   u = add(u, 'query='+params.query)

    return baseurl + u
}

function add(u, params){
    return u + (/\?/.test(u) ? '&' : '?') + params;
}

function img(src, size){
    let path = baseimg

    if(size) path = path.replace(/w300/g,size)

    return src ? path + src : '';
}

function Status(need){
    this.data = {}
    this.work = 0;

    this.check = function(){
        if(this.work >= need) this.onComplite(this.data)
    }

    this.append = function(name, json){
        this.work++

        this.data[name] = json

        this.check()
    }

    this.error = function(){
        this.work++

        this.check()
    }
}

function main(params = {}, oncomplite, onerror){
    let status = new Status(8)

    status.onComplite = ()=>{
        let fulldata = []

        if(status.data.wath) fulldata.push(status.data.wath)
        if(status.data.trend_day) fulldata.push(status.data.trend_day)
        if(status.data.trend_week) fulldata.push(status.data.trend_week)
        if(status.data.upcoming) fulldata.push(status.data.upcoming)
        if(status.data.popular) fulldata.push(status.data.popular)
        if(status.data.popular_tv) fulldata.push(status.data.popular_tv)
        if(status.data.top) fulldata.push(status.data.top)
        if(status.data.top_tv) fulldata.push(status.data.top_tv)

        if(fulldata.length) oncomplite(fulldata)
        else onerror()
    }
    
    let append = function(title, name, json){
        json.title = title

        status.append(name, json)
    }

    get('movie/now_playing',params,(json)=>{
        append('Сейчас смотрят','wath', json)
    },status.error.bind(status))

    get('trending/moviews/day',params,(json)=>{
        append('Сегодня в тренде','trend_day', json)
    },status.error.bind(status))

    get('trending/moviews/week',params,(json)=>{
        append('В тренде за неделю','trend_week', json)
    },status.error.bind(status))

    get('movie/upcoming',params,(json)=>{
        append('Смотрите в кинозалах','upcoming', json)
    },status.error.bind(status))

    get('movie/popular',params,(json)=>{
        append('Популярные фильмы','popular', json)
    },status.error.bind(status))

    get('tv/popular',params,(json)=>{
        append('Популярные сериалы','popular_tv', json)
    },status.error.bind(status))

    get('movie/top_rated',params,(json)=>{
        append('Топ фильмы','top', json)
    },status.error.bind(status))

    get('tv/top_rated',params,(json)=>{
        append('Топ сериалы','top_tv', json)
    },status.error.bind(status))
}

function category(params = {}, oncomplite, onerror){
    let status = new Status(5)

    status.onComplite = ()=>{
        let fulldata = []

        if(status.data.wath && status.data.wath.results.length)      fulldata.push(status.data.wath)
        if(status.data.popular && status.data.popular.results.length)   fulldata.push(status.data.popular)
        if(status.data.tv_today && status.data.tv_today.results.length)  fulldata.push(status.data.tv_today)
        if(status.data.tv_air && status.data.tv_air.results.length)    fulldata.push(status.data.tv_air)
        if(status.data.top && status.data.top.results.length)       fulldata.push(status.data.top)

        if(fulldata.length) oncomplite(fulldata)
        else onerror()
    }
    
    let append = function(title, name, json){
        json.title = title

        status.append(name, json)
    }

    get(params.url+'/now_playing',params,(json)=>{
        append('Сейчас смотрят','wath', json)
    },status.error.bind(status))

    get(params.url+'/popular',params,(json)=>{
        append('Популярное','popular', json)
    },status.error.bind(status))

    get(params.url+'/airing_today',params,(json)=>{
        append('Сегодня в эфире','tv_today', json)
    },status.error.bind(status))

    get(params.url+'/on_the_air',params,(json)=>{
        append('На этой неделе','tv_air', json)
    },status.error.bind(status))

    get(params.url+'/top_rated',params,(json)=>{
        append('В топе','top', json)
    },status.error.bind(status))
}

function full(params = {}, oncomplite, onerror){
    let status = new Status(5)
        status.onComplite = oncomplite

    get(params.method+'/'+params.id,params,(json)=>{
        status.append('movie', json)
    },status.error.bind(status))

    get(params.method+'/'+params.id+'/credits',params,(json)=>{
        status.append('actors', json)
    },status.error.bind(status))

    get(params.method+'/'+params.id+'/recommendations',params,(json)=>{
        status.append('recomend', json)
    },status.error.bind(status))

    get(params.method+'/'+params.id+'/similar',params,(json)=>{
        status.append('simular', json)
    },status.error.bind(status))

    get(params.method+'/'+params.id+'/videos',params,(json)=>{
        status.append('videos', json)
    },status.error.bind(status))
}

function categoryFull(params = {}, oncomplite, onerror){
    let u = url(params.url, params)

    network.silent(u,oncomplite, onerror)
}

function get(method, params = {}, oncomplite, onerror){
    let u = url(method, params)
    
    network.silent(u,(json)=>{
        json.url = method

        oncomplite(json)
    }, onerror)
}

function search(params = {}, oncomplite, onerror){
    let status = new Status(2)
        status.onComplite = oncomplite

    get('search/movie',params,(json)=>{
        json.title = 'Фильмы'

        status.append('movie', json)
    },status.error.bind(status))

    get('search/tv',params,(json)=>{
        json.title = 'Сериалы'

        status.append('tv', json)
    },status.error.bind(status))
}

function actor(params = {}, oncomplite, onerror){
    let convert = (json)=>{
        let results = json.cast.map((a)=>{
            a.year = parseInt((a.release_date || a.first_air_date || '0000').slice(0,4))

            return a
        })

        results.sort((a,b) => b.year - a.year)

        return {
            results: results.slice(0,40)
        }
    }

    let status = new Status(3)
        status.onComplite = ()=>{
            let fulldata = {}

            if(status.data.actor) fulldata.actor = status.data.actor

            if(status.data.movie && status.data.movie.cast.length) fulldata.movie = convert(status.data.movie)
            if(status.data.tv && status.data.tv.cast.length)       fulldata.tv = convert(status.data.tv)

            oncomplite(fulldata)
        }

    get('person/'+params.id,params,(json)=>{
        status.append('actor', json)
    },status.error.bind(status))

    get('person/'+params.id+'/movie_credits',params,(json)=>{
        status.append('movie', json)
    },status.error.bind(status))

    get('person/'+params.id+'/tv_credits',params,(json)=>{
        status.append('tv', json)
    },status.error.bind(status))
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

function genres(params = {}, oncomplite, onerror){
    let u = url('genre/movie/list',params)

    network.silent(u,oncomplite, onerror)
}

function company(params = {}, oncomplite, onerror){
    let u = url('company/'+params.id,params)

    network.silent(u,oncomplite, onerror)
}

function clear(){
    network.clear()
}

export default {
    main,
    img,
    full,
    categoryFull,
    genres,
    category,
    search,
    clear,
    company,
    actor,
    favorite
}