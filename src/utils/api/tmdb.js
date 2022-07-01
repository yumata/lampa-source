import Reguest from '../reguest'
import Utils from '../math'
import Arrays from '../arrays'
import Storage from '../storage'
import Status from '../status'
import Favorite from '../../utils/favorite'
import Recomends from '../../utils/recomend'
import VideoQuality from '../video_quality'
import Lang from '../lang'


let network   = new Reguest()
let key       = '4ef0d7355d9ffb5151e987764708ce96'
let menu_list = []

function url(u, params = {}){
    u = add(u, 'api_key='+key)
    u = add(u, 'language='+Storage.field('tmdb_lang'))

    if(params.genres)  u = add(u, 'with_genres='+params.genres)
    if(params.page)    u = add(u, 'page='+params.page)
    if(params.query)   u = add(u, 'query='+params.query)

    if(params.filter){
        for(let i in params.filter){
            u = add(u, i+'='+params.filter[i])
        }
    }

    let base = Storage.field('proxy_tmdb') ? 'apitmdb.cub.watch/3/' : 'api.themoviedb.org/3/'

    return Utils.protocol() + base + u
}

function add(u, params){
    return u + (/\?/.test(u) ? '&' : '?') + params;
}

function img(src, size){
    let poster_size  = Storage.field('poster_size')
    let baseimg      = Utils.protocol() + (Storage.field('proxy_tmdb') ? 'imagetmdb.cub.watch': 'image.tmdb.org') + '/t/p/'+poster_size+'/'
    let path         = baseimg

    if(size) path = path.replace(new RegExp(poster_size,'g'),size)

    return src ? path + src : '';
}

function find(find, params = {}){
    let finded

    let filtred = (items)=>{
        for(let i = 0; i < items.length; i++){
            let item = items[i]

            if(params.original_title == item.original_title || params.title == item.title){
                finded = item; break;
            }
        }
    }

    if(find.movie && find.movie.results.length)      filtred(find.movie.results)
    if(find.tv && find.tv.results.length && !finded) filtred(find.tv.results)

    return finded
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
        append(Lang.translate('title_now_watch'),'wath', json)

        VideoQuality.add(json.results)
    },status.error.bind(status))

    get('trending/movie/day',params,(json)=>{
        append(Lang.translate('title_trend_day'),'trend_day', json)
    },status.error.bind(status))

    get('trending/movie/week',params,(json)=>{
        append(Lang.translate('title_trend_week'),'trend_week', json)
    },status.error.bind(status))

    get('movie/upcoming',params,(json)=>{
        append(Lang.translate('title_upcoming'),'upcoming', json)
    },status.error.bind(status))

    get('movie/popular',params,(json)=>{
        append(Lang.translate('title_popular_movie'),'popular', json)

        VideoQuality.add(json.results)
    },status.error.bind(status))

    get('tv/popular',params,(json)=>{
        append(Lang.translate('title_popular_tv'),'popular_tv', json)
    },status.error.bind(status))

    get('movie/top_rated',params,(json)=>{
        append(Lang.translate('title_top_movie'),'top', json)
    },status.error.bind(status))

    get('tv/top_rated',params,(json)=>{
        append(Lang.translate('title_top_tv'),'top_tv', json)
    },status.error.bind(status))
}

function category(params = {}, oncomplite, onerror){
    let show     = ['tv','movie'].indexOf(params.url) > -1 && !params.genres
    let books    = show ? Favorite.continues(params.url) : []
    let recomend = show ? Arrays.shuffle(Recomends.get(params.url)).slice(0,19) : []
    
    let status = new Status(6)

    status.onComplite = ()=>{
        let fulldata = []

        if(books.length) fulldata.push({results: books,title: params.url == 'tv' ? Lang.translate('title_continue') : Lang.translate('title_watched')})
        if(recomend.length) fulldata.push({results: recomend,title: Lang.translate('title_recomend_watch')})

        if(status.data.continue && status.data.continue.results.length)      fulldata.push(status.data.continue)
        if(status.data.wath && status.data.wath.results.length)      fulldata.push(status.data.wath)
        if(status.data.popular && status.data.popular.results.length)   fulldata.push(status.data.popular)
        if(status.data.new && status.data.new.results.length)   fulldata.push(status.data.new)
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
        append(Lang.translate('title_now_watch'),'wath', json)

        if(show) VideoQuality.add(json.results)
    },status.error.bind(status))

    get(params.url+'/popular',params,(json)=>{
        append(Lang.translate('title_popular'),'popular', json)

        if(show) VideoQuality.add(json.results)
    },status.error.bind(status))

    let date = new Date()
    let nparams = Arrays.clone(params)
        nparams.filter = {
            sort_by: 'release_date.desc',
            year: date.getFullYear(),
            first_air_date_year: date.getFullYear(),
            'vote_average.gte': 7
        }

    get('discover/'+params.url,nparams,(json)=>{
        json.filter = nparams.filter

        append(Lang.translate('title_new'),'new', json)
    },status.error.bind(status))

    get(params.url+'/airing_today',params,(json)=>{
        append(Lang.translate('title_tv_today'),'tv_today', json)
    },status.error.bind(status))

    get(params.url+'/on_the_air',params,(json)=>{
        append(Lang.translate('title_this_week'),'tv_air', json)
    },status.error.bind(status))

    get(params.url+'/top_rated',params,(json)=>{
        append(Lang.translate('title_in_top'),'top', json)
    },status.error.bind(status))
}

function full(params = {}, oncomplite, onerror){
    let status = new Status(7)
        status.onComplite = oncomplite

    get(params.method+'/'+params.id,params,(json)=>{
        json.source = 'tmdb'
        
        if(params.method == 'tv'){
            get('tv/'+json.id+'/season/'+json.number_of_seasons,{},(ep)=>{
                status.append('episodes', ep)
            },status.error.bind(status))
        }
        else status.need--

        if(json.belongs_to_collection){
            get('collection/'+json.belongs_to_collection.id,{},(collection)=>{
                collection.results = collection.parts.slice(0,19)

                status.append('collection', collection)
            },status.error.bind(status))
        }
        else status.need--

        status.append('movie', json)
    },()=>{
        status.need -= 2

        status.error()
    })

    if(Storage.field('light_version')){
        status.need -= 3
    }
    else{
        get(params.method+'/'+params.id+'/credits',params,(json)=>{
            status.append('persons', json)
        },status.error.bind(status))

        get(params.method+'/'+params.id+'/recommendations',params,(json)=>{
            status.append('recomend', json)
        },status.error.bind(status))

        get(params.method+'/'+params.id+'/similar',params,(json)=>{
            status.append('simular', json)
        },status.error.bind(status))
    }

    get(params.method+'/'+params.id+'/videos',params,(json)=>{
        status.append('videos', json)
    },status.error.bind(status))
}

function list(params = {}, oncomplite, onerror){
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
        json.title = Lang.translate('menu_movies')

        status.append('movie', json)
    },status.error.bind(status))

    get('search/tv',params,(json)=>{
        json.title = Lang.translate('menu_tv')

        status.append('tv', json)
    },status.error.bind(status))
}


function person(params = {}, oncomplite, onerror){
    const sortCredits = (credits) => {
        return credits
            .map((a) => {
                a.year = parseInt(((a.release_date || a.first_air_date || '0000') + '').slice(0,4))
                return a;
            })
            .sort((a, b) => b.vote_average - a.vote_average && b.vote_count - a.vote_count) //сортируем по оценке и кол-ву голосов (чтобы отсечь мусор с 1-2 оценками)
    }

    const convert = (credits, person) => {
        credits.crew.forEach(a=>{
            a.department = a.department == 'Production' ? Lang.translate('full_production') : a.department == 'Directing' ? Lang.translate('full_directing') : a.department 
        })

        let cast = sortCredits(credits.cast),
            crew = sortCredits(credits.crew),
            tv = sortCredits(cast.filter(media => media.media_type === 'tv')),
            movie = sortCredits(cast.filter(media => media.media_type === 'movie')),
            knownFor;

        //Наиболее известные работы человека
        //1. Группируем все работы по департаментам (Актер, Режиссер, Сценарист и т.д.)
        knownFor = Arrays.groupBy(crew, 'department');
        let actorGender = person.gender === 1 ? Lang.translate('title_actress') : Lang.translate('title_actor');
        if(movie.length > 0) knownFor[`${actorGender} - ` + Lang.translate('menu_movies')] = movie;
        if(tv.length > 0) knownFor[`${actorGender} - ` + Lang.translate('menu_tv')] = tv;

        //2. Для каждого департамента суммируем кол-ва голосов (вроде бы сам TMDB таким образом определяет knownFor для людей)
        knownFor = Object.entries(knownFor).map(([depIdx, dep]) => {
            //убираем дубликаты (человек может быть указан в одном департаменте несколько раз на разных должностях (job))
            let set = {},
                credits = dep.filter(credit => set.hasOwnProperty(credit.original_title || credit.original_name) ?
                    false : (credit.original_title ? set[credit.original_title] = true : set[credit.original_name] = true));
            return {
                name: depIdx,
                credits,
                vote_count: dep.reduce((a, b) => a + b.vote_count, 0)
            }
        //3. Сортируем департаменты по кол-ву голосов
        }).sort((a, b) => b.vote_count - a.vote_count);

        return {
            raw: credits, cast, crew, tv, movie, knownFor
        }
    }

    let status = new Status(2)
        status.onComplite = ()=>{
            let fulldata = {}

            if(status.data.person) fulldata.person = status.data.person

            if(status.data.credits) fulldata.credits = convert(status.data.credits, status.data.person)

            oncomplite(fulldata)
        }

    get('person/'+params.id,params,(json)=>{
        status.append('person', json)
    },status.error.bind(status))

    get('person/'+params.id+'/combined_credits',params,(json)=>{
        status.append('credits', json)
    },status.error.bind(status))
}

function menu(params = {}, oncomplite){
    if(menu_list.length) oncomplite(menu_list)
    else{
        let u = url('genre/movie/list',params)

        network.silent(u,(j)=>{
            j.genres.forEach((g)=>{
                menu_list.push({
                    title: g.name,
                    id: g.id
                })
            })

            oncomplite(menu_list)
        })
    }
}

function menuCategory(params, oncomplite){
    let menu = []

    if(params.action !== 'tv'){
        menu.push({
            title: Lang.translate('title_now_watch'),
            url: params.action+'/now_playing'
        })
    }

    menu.push({
        title: Lang.translate('title_popular'),
        url: params.action+'/popular'
    })

    let date  = new Date()
    let query = []
        query.push('sort_by=release_date.desc')
        query.push('year='+date.getFullYear())
        query.push('first_air_date_year='+date.getFullYear())
        query.push('vote_average.gte=7')

    menu.push({
        title: Lang.translate('title_new'),
        url: 'discover/'+params.action+'?'+query.join('&')
    })

    if(params.action == 'tv'){
        menu.push({
            title: Lang.translate('title_tv_today'),
            url: params.action+'/airing_today'
        })

        menu.push({
            title: Lang.translate('title_this_week'),
            url: params.action+'/on_the_air'
        })
    }

    menu.push({
        title: Lang.translate('title_in_top'),
        url: params.action+'/top_rated'
    })

    oncomplite(menu)
}

function external_ids(params = {}, oncomplite, onerror){
    get('tv/'+params.id+'/external_ids', oncomplite, onerror)
}

function company(params = {}, oncomplite, onerror){
    let u = url('company/'+params.id,params)

    network.silent(u,oncomplite, onerror)
}

function seasons(tv, from, oncomplite){
    let status = new Status(from.length)
        status.onComplite = oncomplite

    from.forEach(season => {
        get('tv/'+tv.id+'/season/'+season,{},(json)=>{
            status.append(''+season, json)
        },status.error.bind(status))
    })
}

function screensavers(oncomplite, onerror) {
    get('trending/all/week', {page: Math.round(Math.random() * 30)}, (json) => {
        oncomplite(json.results.filter(entry => entry.backdrop_path && !entry.adult));
    }, onerror)
}

function clear(){
    network.clear()
}

export default {
    main,
    menu,
    img,
    full,
    list,
    category,
    search,
    clear,
    company,
    person,
    seasons,
    find,
    screensavers,
    external_ids,
    get,
    menuCategory
}
